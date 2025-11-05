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

    // QUERY GIỐNG HỆT ADMIN PAGE - Đơn giản, trực tiếp bằng order_number chính xác
    // Admin page: supabase.from("orders").select("*").order("created_at", { ascending: false })
    // Check API: supabase.from("orders").select("*").eq("order_number", rawCode.trim())
    const orderNumber = rawCode.trim();
    
    console.log('🔍 Check API - Querying order (like admin page):', { orderNumber });

    // Query trực tiếp bằng order_number chính xác (giống admin page filter)
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .eq('order_number', orderNumber)
      .order('created_at', { ascending: false })
      .limit(1);

    const order = Array.isArray(orders) && orders.length > 0 ? orders[0] : null;

    if (error) {
      console.error('❌ Check API - Error querying order:', error.message);
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          debug: {
            orderNumber,
            error: error.message,
          },
        },
        {
          status: 500,
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
            'Pragma': 'no-cache',
            'Expires': '0',
          },
        }
      );
    }

    if (!order) {
      console.error('❌ Check API - Order not found:', { orderNumber, found: orders?.length || 0 });
      return NextResponse.json(
        {
          success: true,
          isPaid: false,
          order: null,
          payment_status: 'pending',
          debug: {
            orderNumber,
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

    console.log('✅ Check API - Order found:', {
      order_number: order.order_number,
      payment_status: order.payment_status,
      status: order.status,
      id: order.id,
    });

    // Check nếu đã thanh toán (giống admin page check payment_status)
    const isPaid = order.payment_status === 'paid';

    console.log('✅ Check API - Final result (like admin page):', {
      orderNumber,
      order_number: order.order_number,
      payment_status: order.payment_status,
      status: order.status,
      isPaid,
      order_id: order.id,
    });

    // TRẢ VỀ ORDER (giống admin page trả về order với payment_status)
    return NextResponse.json(
      {
        success: true,
        isPaid,
        order: order, // Trả về order giống admin page
        payment_status: order.payment_status, // payment_status từ Supabase
        debug: {
          orderNumber,
          order_number: order.order_number,
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
