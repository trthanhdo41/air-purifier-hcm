import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * Sepay Webhook Handler
 * Nhận thông báo từ Sepay khi có giao dịch thành công
 * 
 * Payload từ Sepay (tham khảo):
 * {
 *   "transaction_id": "123456",
 *   "order_code": "HTX-1234567890",
 *   "amount": 10000,
 *   "status": "success",
 *   "payment_time": "2025-01-04 22:23:00",
 *   "bank_account": "0888889805",
 *   "bank_name": "VPBank",
 *   "content": "NHAN TU 069704410592 TRACE 382348 ND TRAN THANH DO chuyen tien qua MoMo"
 * }
 */

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    console.log('📩 Sepay Webhook received:', JSON.stringify(payload, null, 2));

    // Extract order code từ nhiều nguồn có thể
    // Ưu tiên lấy từ field "code" (Sepay tự nhận diện)
    // Nếu không có thì extract từ "content" (nội dung chuyển khoản)
    const orderCode = 
      payload.code ||                          // Sepay tự nhận diện code thanh toán
      payload.order_code || 
      payload.orderCode ||
      extractOrderCode(payload.content) ||     // Nội dung chuyển khoản
      extractOrderCode(payload.description) ||
      extractOrderCode(payload.transferContent) ||
      extractOrderCode(payload.transaction_content);

    if (!orderCode) {
      console.error('❌ Order code not found in payload. Full payload:', payload);
      // Trả về success: true để Sepay không retry, nhưng không cập nhật đơn
      return NextResponse.json({ success: true, message: 'Order code not found, ignored' });
    }

    console.log('✅ Order code extracted:', orderCode);

    // Chỉ xử lý giao dịch TIỀN VÀO
    if (payload.transferType && payload.transferType !== 'in') {
      console.log(`⏭️ Skip transferType: ${payload.transferType} (not "in")`);
      return NextResponse.json({ success: true, message: 'Not money in transaction' });
    }

    // Update order trong database
    const supabase = createAdminClient();

    // Tìm order theo order_number
    const { data: order, error: findError } = await supabase
      .from('orders')
      .select('id, order_number, total_amount, payment_status')
      .eq('order_number', orderCode)
      .single();

    if (findError || !order) {
      console.error('❌ Order not found:', orderCode, findError);
      // Trả về success: true để Sepay ghi nhận đã xử lý webhook
      return NextResponse.json({ success: true, message: 'Order not found, ignored' });
    }

    // Kiểm tra đơn hàng đã được thanh toán chưa (tránh duplicate)
    if (order.payment_status === 'paid') {
      console.log('✅ Order already paid:', orderCode);
      return NextResponse.json({ 
        success: true, 
        message: 'Order already processed' 
      });
    }

    // Verify số tiền (optional, để đảm bảo chính xác)
    const receivedAmount = payload.amount || payload.transferAmount || payload.value || 0;
    if (receivedAmount && Math.abs(receivedAmount - order.total_amount) > 1) {
      console.warn(
        `⚠️ Amount mismatch: Expected ${order.total_amount}, got ${receivedAmount}`
      );
    }

    // Update order status
    const transactionId = 
      payload.transaction_id || 
      payload.transactionId || 
      payload.id || 
      payload.trans_id ||
      `SEPAY-${Date.now()}`;

    const { error: updateError } = await supabase
      .from('orders')
      .update({
        payment_status: 'paid',
        status: 'processing', // Đơn hàng chuyển sang đang xử lý
        transaction_id: transactionId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', order.id);

    if (updateError) {
      console.error('❌ Error updating order:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to update order' },
        { status: 500 }
      );
    }

    console.log('✅ Order updated successfully:', {
      orderCode,
      transactionId: payload.transaction_id,
      amount: payload.amount,
    });

    // TODO: Gửi email xác nhận thanh toán cho khách hàng
    // await sendPaymentConfirmationEmail(order);

    return NextResponse.json({ 
      success: true, 
      message: 'Payment processed successfully' 
    });

  } catch (error: any) {
    console.error('❌ Webhook error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * Helper function: Extract order code từ content
 * Content có thể có format: "NHAN TU 069704410592 TRACE 382348 ND TRAN THANH DO chuyen tien qua MoMo"
 * hoặc chứa order code ở đâu đó
 */
function extractOrderCode(content: string): string | null {
  if (!content) return null;
  // Ưu tiên format đầy đủ: HTX-<13 số>-<chuỗi A-Z0-9>
  const patterns = [
    /(HTX-\d{10,}-[A-Z0-9]+)/i,
    /(HTX-\d{10,})/i,
  ];
  for (const p of patterns) {
    const m = content.match(p);
    if (m && m[1]) return m[1].toUpperCase();
  }
  return null;
}

// Allow GET request để test webhook endpoint
export async function GET() {
  return NextResponse.json({
    message: 'Sepay Webhook Endpoint',
    status: 'active',
    timestamp: new Date().toISOString(),
  });
}
