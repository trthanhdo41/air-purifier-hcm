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

    if (!rawCode) {
      return NextResponse.json(
        { success: false, error: 'Missing orderCode' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Chuẩn hóa mã đơn và tìm theo nhiều biến thể để khớp với nội dung ngân hàng
    const normalized = normalizeOrderCode(rawCode);
    const variants = Array.from(new Set([
      normalized,
      normalized.replace(/-/g, ''),
      normalized.replace(/-/g, '–'),
      normalized.replace(/-/g, '—'),
    ]));

    // Tìm order theo order_number
    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .in('order_number', variants)
      .maybeSingle();

    if (error || !order) {
      console.log('❌ Order not found:', { rawCode, normalized, variants, error: error?.message });
      return NextResponse.json({
        success: true,
        isPaid: false,
      });
    }

    // Check nếu đã thanh toán
    const isPaid = order.payment_status === 'paid';

    console.log('✅ Order found:', {
      rawCode,
      normalized,
      payment_status: order.payment_status,
      isPaid,
    });

    return NextResponse.json({
      success: true,
      isPaid,
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

function normalizeOrderCode(input: string): string {
  if (!input) return input;
  const s = input.trim().toUpperCase();
  // Nếu đã đúng định dạng HTX-<13digits>-<CODE>
  const m1 = s.match(/^HTX-(\d{13})-([A-Z0-9]+)$/);
  if (m1) return s;
  // Không dấu gạch: HTX<13digits><CODE>
  const m2 = s.match(/^HTX(\d{13})([A-Z0-9]+)$/);
  if (m2) return `HTX-${m2[1]}-${m2[2]}`;
  // Dấu/spacing lộn xộn
  const m3 = s.match(/^HTX\s*-?\s*(\d{13})\s*-?\s*([A-Z0-9]+)$/);
  if (m3) return `HTX-${m3[1]}-${m3[2]}`;
  return s;
}
