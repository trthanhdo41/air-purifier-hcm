import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

/**
 * Check payment status cho order
 * 
 * Query params:
 * - orderCode: string
 * 
 * Response:
 * {
 *   success: boolean,
 *   isPaid: boolean,
 *   order?: object
 * }
 */

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const rawCode = searchParams.get('orderCode');
    const debug = searchParams.get('debug') === '1';

    if (!rawCode) {
      return NextResponse.json(
        { success: false, error: 'Missing orderCode' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Chuẩn hóa mã đơn và tìm theo nhiều biến thể để khớp với nội dung ngân hàng
    // Đồng bộ logic với webhook để đảm bảo matching chính xác
    const normalized = normalizeOrderCode(rawCode);
    const variants = Array.from(new Set([
      normalized,
      rawCode.trim(),
      rawCode.trim().replace(/\s+/g, ''),
      normalized.replace(/-/g, ''),
      normalized.replace(/-/g, '–'),
      normalized.replace(/-/g, '—'),
    ]));

    console.log('🔍 Check API - Searching order with variants:', { rawCode, normalized, variants });

    // Tìm order theo order_number với retry logic để đảm bảo đọc dữ liệu mới nhất
    let order = null;
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries && !order) {
      // Thêm delay nhỏ để đảm bảo đọc dữ liệu mới nhất (read consistency)
      if (retryCount > 0) {
        await new Promise(resolve => setTimeout(resolve, 200 * retryCount));
      }

      const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .in('order_number', variants)
        .order('created_at', { ascending: false })
        .limit(1);

      order = Array.isArray(orders) && orders.length > 0 ? orders[0] : null;

      if (error) {
        console.error(`❌ Check API - Error finding order (retry ${retryCount + 1}/${maxRetries}):`, error.message);
      } else if (order) {
        console.log(`✅ Check API - Order found (retry ${retryCount + 1}/${maxRetries}):`, {
          order_number: order.order_number,
          payment_status: order.payment_status,
          status: order.status,
          id: order.id,
        });
        break; // Tìm thấy order, thoát khỏi loop
      }

      retryCount++;
    }

    // Nếu không tìm thấy bằng variants, thử fallback với ilike
    if (!order) {
      console.log('❌ Check API - Order not found by variants, trying ilike fallback:', { rawCode, normalized, variants });
      const { data: fuzzyOrders, error: fuzzyErr } = await supabase
        .from('orders')
        .select('*')
        .ilike('order_number', `%${normalized}%`)
        .order('created_at', { ascending: false })
        .limit(1);
      
      const fuzzy = Array.isArray(fuzzyOrders) && fuzzyOrders.length > 0 ? fuzzyOrders[0] : null;
      
      if (fuzzyErr) {
        console.error('❌ Check API - Error with ilike fallback:', fuzzyErr.message);
      } else if (fuzzy) {
        console.log('✅ Check API - Order found via ilike fallback:', {
          order_number: fuzzy.order_number,
          payment_status: fuzzy.payment_status,
          status: fuzzy.status,
        });
        order = fuzzy;
      }
    }

    if (!order) {
      console.error('❌ Check API - Order not found with any strategy:', { rawCode, normalized, variants });
      
      // Thử query trực tiếp bằng order_number chính xác (không dùng variants)
      console.log('🔍 Check API - Trying direct query with rawCode:', rawCode);
      const { data: directOrders, error: directError } = await supabase
        .from('orders')
        .select('*')
        .eq('order_number', rawCode.trim())
        .order('created_at', { ascending: false })
        .limit(1);
      
      const directOrder = Array.isArray(directOrders) && directOrders.length > 0 ? directOrders[0] : null;
      
      if (directOrder) {
        console.log('✅ Check API - Order found via direct query:', {
          order_number: directOrder.order_number,
          payment_status: directOrder.payment_status,
          status: directOrder.status,
        });
        order = directOrder;
      } else {
        console.error('❌ Check API - Direct query also failed:', { 
          rawCode: rawCode.trim(), 
          error: directError?.message,
          found: directOrders?.length || 0,
        });
        
        return NextResponse.json(
          {
            success: true,
            isPaid: false,
            order: null,
            debug: {
              rawCode,
              normalized,
              variants,
              found: 0,
              message: 'Order not found in Supabase',
            },
          },
          {
            headers: {
              'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
              'Pragma': 'no-cache',
              'Expires': '0',
            },
          }
        );
      }
    }

    // Check nếu đã thanh toán
    const isPaid = order.payment_status === 'paid';

    console.log('✅ Check API - Final result:', {
      rawCode,
      normalized,
      order_number: order.order_number,
      payment_status: order.payment_status,
      status: order.status,
      isPaid,
      order_id: order.id,
    });

    // TRẢ VỀ ORDER NGAY CẢ KHI CHƯA PAID để FE có thể debug
    return NextResponse.json(
      {
        success: true,
        isPaid,
        order: order, // Trả về order ngay cả khi chưa paid
        payment_status: order.payment_status, // Thêm payment_status riêng để dễ debug
        debug: {
          rawCode,
          normalized,
          variants,
          found: 1,
          matched: order.order_number,
          payment_status: order.payment_status,
          status: order.status,
          order_id: order.id,
        },
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    );

  } catch (error: any) {
    console.error('❌ Error checking payment status:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

function normalizeOrderCode(input: string): string {
  if (!input) return input;
  const s = input.trim().toUpperCase();
  // Short code preferred: HTX<5-8 digits>, with or without dash/space
  const short1 = s.match(/^HTX(\d{5,8})$/);
  if (short1) return `HTX${short1[1]}`;
  const short2 = s.match(/^HTX\s*-?\s*(\d{5,8})$/);
  if (short2) return `HTX${short2[1]}`;
  // Legacy formats: keep as-is to still allow lookups
  const legacy1 = s.match(/^HTX-(\d{13})-([A-Z0-9]+)$/);
  if (legacy1) return s;
  return s;
}
