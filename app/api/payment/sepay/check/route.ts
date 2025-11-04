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
 *   paid: boolean,
 *   order?: object
 * }
 */

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const orderCode = searchParams.get('orderCode');

    if (!orderCode) {
      return NextResponse.json(
        { success: false, error: 'Missing orderCode' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Tìm order theo order_number
    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('order_number', orderCode)
      .single();

    if (error || !order) {
      return NextResponse.json({
        success: true,
        paid: false,
      });
    }

    // Check nếu đã thanh toán
    const isPaid = order.payment_status === 'success' || order.status === 'Đã thanh toán';

    return NextResponse.json({
      success: true,
      paid: isPaid,
      order: isPaid ? order : null,
    });

  } catch (error: any) {
    console.error('❌ Error checking payment status:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

