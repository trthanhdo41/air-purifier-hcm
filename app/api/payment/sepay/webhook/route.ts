import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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
    console.log('📩 Sepay Webhook received:', payload);

    // Xác thực payload
    if (!payload.order_code || !payload.status) {
      console.error('❌ Invalid webhook payload:', payload);
      return NextResponse.json(
        { success: false, error: 'Invalid payload' },
        { status: 400 }
      );
    }

    // Extract order code từ content hoặc order_code
    // Sepay có thể gửi order_code trong nhiều format
    const orderCode = payload.order_code || extractOrderCode(payload.content);

    if (!orderCode) {
      console.error('❌ Order code not found in payload');
      return NextResponse.json(
        { success: false, error: 'Order code not found' },
        { status: 400 }
      );
    }

    // Chỉ xử lý khi thanh toán thành công
    if (payload.status !== 'success') {
      console.log(`⏳ Payment status: ${payload.status}, waiting...`);
      return NextResponse.json({ success: true, message: 'Status noted' });
    }

    // Update order trong database
    const supabase = await createClient();

    // Tìm order theo order_number
    const { data: order, error: findError } = await supabase
      .from('orders')
      .select('id, order_number, total_amount, payment_status')
      .eq('order_number', orderCode)
      .single();

    if (findError || !order) {
      console.error('❌ Order not found:', orderCode, findError);
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
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
    if (payload.amount && payload.amount !== order.total_amount) {
      console.warn(
        `⚠️ Amount mismatch: Expected ${order.total_amount}, got ${payload.amount}`
      );
      // Có thể gửi email thông báo admin về sự khác biệt
    }

    // Update order status
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        payment_status: 'paid',
        status: 'processing', // Đơn hàng chuyển sang đang xử lý
        transaction_id: payload.transaction_id || null,
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

  // Tìm pattern HTX-xxxxxxxxxx
  const match = content.match(/HTX-\d+/);
  return match ? match[0] : null;
}

// Allow GET request để test webhook endpoint
export async function GET() {
  return NextResponse.json({
    message: 'Sepay Webhook Endpoint',
    status: 'active',
    timestamp: new Date().toISOString(),
  });
}
