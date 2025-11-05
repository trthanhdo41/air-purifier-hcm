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
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .in('order_number', variants)
      .order('created_at', { ascending: false })
      .limit(1);

    const order = Array.isArray(orders) && orders.length > 0 ? orders[0] : null;

    if (error || !order) {
      console.log('❌ Order not found by equality, try ilike contains:', { rawCode, normalized, variants, error: error?.message });
      // Fallback: tìm theo chứa mã (đề phòng có khoảng trắng/dấu phát sinh)
      const { data: fuzzyOrders, error: fuzzyErr } = await supabase
        .from('orders')
        .select('*')
        .ilike('order_number', `%${normalized}%`)
        .order('created_at', { ascending: false })
        .limit(1);
      const fuzzy = Array.isArray(fuzzyOrders) && fuzzyOrders.length > 0 ? fuzzyOrders[0] : null;
      if (!fuzzy || fuzzyErr) {
        return NextResponse.json({
          success: true,
          isPaid: false,
        });
      }
      return NextResponse.json({
        success: true,
        isPaid: fuzzy.payment_status === 'paid',
        order: fuzzy.payment_status === 'paid' ? fuzzy : null,
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
