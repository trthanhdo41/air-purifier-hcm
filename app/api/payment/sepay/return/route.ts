import { NextRequest, NextResponse } from 'next/server';

/**
 * Sepay Return URL Handler
 * Xử lý khi người dùng quay về từ trang thanh toán Sepay
 * 
 * Query params có thể có:
 * - order_code: Mã đơn hàng
 * - status: Trạng thái thanh toán (success, pending, failed)
 * - transaction_id: ID giao dịch
 */

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const orderCode = searchParams.get('order_code') || searchParams.get('orderCode');
    const status = searchParams.get('status');
    const transactionId = searchParams.get('transaction_id');

    console.log('🔙 Sepay Return URL:', {
      orderCode,
      status,
      transactionId,
    });

    // Nếu không có order code, redirect về trang chủ
    if (!orderCode) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Redirect về trang success với order code
    // Webhook sẽ tự động cập nhật trạng thái đơn hàng
    const successUrl = new URL(`/success?order=${orderCode}`, request.url);
    
    // Thêm thông tin status nếu có
    if (status) {
      successUrl.searchParams.set('payment_status', status);
    }

    return NextResponse.redirect(successUrl);

  } catch (error: any) {
    console.error('❌ Return URL error:', error);
    
    // Redirect về trang chủ nếu có lỗi
    return NextResponse.redirect(new URL('/', request.url));
  }
}
