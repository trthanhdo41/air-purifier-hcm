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

    // ĐỒNG BỘ LOGIC MATCHING VỚI WEBHOOK - Tìm order theo order_number
    let order = null;
    
    // Strategy 1: Tìm bằng variants (giống webhook)
    let { data: foundOrders, error: findError } = await supabase
      .from('orders')
      .select('*')
      .in('order_number', variants)
      .order('created_at', { ascending: false })
      .limit(1);
    order = Array.isArray(foundOrders) && foundOrders.length > 0 ? foundOrders[0] : null;

    console.log('🔍 Check API - First search result:', { 
      foundCount: foundOrders?.length || 0, 
      order: order ? { 
        id: order.id, 
        order_number: order.order_number, 
        payment_status: order.payment_status 
      } : null, 
      error: findError?.message 
    });

    // Strategy 2: Thử tìm theo biến thể không dấu (giống webhook)
    if (findError || !order) {
      const noDashVariant = normalized.replace(/-/g, '');
      console.log('🔍 Check API - Trying noDashVariant:', noDashVariant);
      const retry = await supabase
        .from('orders')
        .select('*')
        .in('order_number', [noDashVariant, noDashVariant.replace(/-/g, '–'), noDashVariant.replace(/-/g, '—')])
        .order('created_at', { ascending: false })
        .limit(1);

      if (!retry.error && Array.isArray(retry.data) && retry.data.length > 0) {
        order = retry.data[0];
        console.log('✅ Check API - Order found via noDashVariant:', {
          order_number: order.order_number,
          payment_status: order.payment_status,
        });
      }
    }

    // Strategy 3: Fallback - tìm "chứa" mã đơn (giống webhook)
    if (!order) {
      console.log('🔍 Check API - Fallback: trying ilike contains:', normalized);
      const { data: likeOrders, error: likeErr } = await supabase
        .from('orders')
        .select('*')
        .ilike('order_number', `%${normalized}%`)
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (!likeErr && Array.isArray(likeOrders) && likeOrders.length > 0) {
        console.log('✅ Check API - Order found via ilike fallback:', { 
          order_number: likeOrders[0].order_number, 
          payment_status: likeOrders[0].payment_status 
        });
        order = likeOrders[0];
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
    // Nếu payment_status vẫn là 'pending', thử query lại với delay để đảm bảo đọc dữ liệu mới nhất
    let isPaid = order.payment_status === 'paid';
    let finalPaymentStatus = order.payment_status;
    
    // Nếu chưa paid, thử query lại với delay để đảm bảo đọc dữ liệu mới nhất (read consistency)
    if (!isPaid && order.payment_status === 'pending') {
      console.log('⏳ Check API - Payment status is pending, retrying with delay to ensure read consistency...');
      await new Promise(resolve => setTimeout(resolve, 500)); // Delay 500ms
      
      // Query lại để lấy payment_status mới nhất
      const { data: refreshOrder, error: refreshError } = await supabase
        .from('orders')
        .select('payment_status, status')
        .eq('id', order.id)
        .single();
      
      if (!refreshError && refreshOrder) {
        finalPaymentStatus = refreshOrder.payment_status;
        isPaid = finalPaymentStatus === 'paid';
        console.log('🔄 Check API - Refreshed payment status:', {
          order_id: order.id,
          old_payment_status: order.payment_status,
          new_payment_status: finalPaymentStatus,
          isPaid,
        });
      }
    }

    console.log('✅ Check API - Final result:', {
      rawCode,
      normalized,
      order_number: order.order_number,
      payment_status: finalPaymentStatus,
      status: order.status,
      isPaid,
      order_id: order.id,
    });

    // TRẢ VỀ ORDER NGAY CẢ KHI CHƯA PAID để FE có thể debug
    // Update order object với payment_status mới nhất
    const finalOrder = { ...order, payment_status: finalPaymentStatus };
    
    return NextResponse.json(
      {
        success: true,
        isPaid,
        order: finalOrder, // Trả về order với payment_status mới nhất
        payment_status: finalPaymentStatus, // Thêm payment_status riêng để FE dễ check
        debug: {
          rawCode,
          normalized,
          variants,
          found: 1,
          matched: order.order_number,
          payment_status: finalPaymentStatus,
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
