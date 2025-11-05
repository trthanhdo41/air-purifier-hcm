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
    const rawOrderCode = 
      payload.code ||                          // Sepay tự nhận diện code thanh toán
      payload.order_code || 
      payload.orderCode ||
      extractOrderCode(payload.content) ||     // Nội dung chuyển khoản
      extractOrderCode(payload.description) ||
      extractOrderCode(payload.transferContent) ||
      extractOrderCode(payload.transaction_content);

    if (!rawOrderCode) {
      console.error('❌ Order code not found in payload. Full payload:', payload);
      // Trả về success: true để Sepay không retry, nhưng không cập nhật đơn
      return NextResponse.json({ success: true, message: 'Order code not found, ignored' });
    }

    // Chuẩn hóa mã đơn về HTX-<digits>-<CODE>
    const orderCode = normalizeOrderCode(rawOrderCode);
    console.log('✅ Order code extracted:', { raw: rawOrderCode, normalized: orderCode });

    // Chỉ xử lý giao dịch TIỀN VÀO
    if (payload.transferType && payload.transferType !== 'in') {
      console.log(`⏭️ Skip transferType: ${payload.transferType} (not "in")`);
      return NextResponse.json({ success: true, message: 'Not money in transaction' });
    }

    // Update order trong database
    const supabase = createAdminClient();

    // Tìm order theo order_number
    let { data: order, error: findError } = await supabase
      .from('orders')
      .select('id, order_number, total_amount, final_amount, payment_status')
      .eq('order_number', orderCode)
      .single();

    if (findError || !order) {
      // Thử tìm theo biến thể không dấu (nếu đơn lưu sai format)
      const noDashVariant = orderCode.replace(/-/g, '');
      const retry = await supabase
        .from('orders')
        .select('id, order_number, total_amount, final_amount, payment_status')
        .eq('order_number', noDashVariant)
        .single();

      if (retry.error || !retry.data) {
        console.error('❌ Order not found with both variants:', { orderCode, noDashVariant, error: findError || retry.error });
        // Trả về success để không retry nhưng log kỹ
        return NextResponse.json({ success: true, message: 'Order not found with any variant, ignored' });
      }
      order = retry.data as any;
    }

    if (!order) {
      return NextResponse.json({ success: true, message: 'Order lookup resulted in null' });
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
    const expectedAmount = (order.total_amount ?? order.final_amount ?? 0) as number;
    if (receivedAmount && expectedAmount && Math.abs(receivedAmount - expectedAmount) > 1) {
      console.warn(
        `⚠️ Amount mismatch: Expected ${expectedAmount}, got ${receivedAmount}`
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

  // 1) Chuẩn: HTX-<digits>-<A-Z0-9>
  let m = content.match(/HTX-\d+-[A-Z0-9]+/i);
  if (m) return m[0].toUpperCase();

  // 2) Không dấu gạch: HTX<digits><A-Z0-9>
  // Ví dụ: HTX1762329381717BWJ46RGL3
  // Thử tách 13 chữ số liên tiếp làm timestamp, phần còn lại là code
  const noDash = content.match(/HTX\s*([0-9]{12,14})([A-Z0-9]{6,16})/i);
  if (noDash) {
    const ts = noDash[1].toUpperCase();
    const code = noDash[2].toUpperCase();
    return `HTX-${ts}-${code}`;
  }

  // 3) Có thể có khoảng trắng thay vì dấu gạch
  m = content.match(/HTX\s*-?\s*(\d{12,14})\s*-?\s*([A-Z0-9]{6,16})/i);
  if (m) {
    return `HTX-${m[1].toUpperCase()}-${m[2].toUpperCase()}`;
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

/**
 * Chuẩn hóa mã đơn về HTX-<digits>-<CODE>
 */
function normalizeOrderCode(input: string): string {
  if (!input) return input;
  const trimmed = input.trim().toUpperCase();
  // Nếu đã đúng định dạng
  const m1 = trimmed.match(/^HTX-\d+-[A-Z0-9]+$/);
  if (m1) return trimmed;
  // Nếu không dấu gạch: HTX<digits><CODE>
  const m2 = trimmed.match(/^HTX(\d+)([A-Z0-9]+)$/);
  if (m2) return `HTX-${m2[1]}-${m2[2]}`;
  // Nếu có khoảng trắng hoặc dấu gạch lộn xộn
  const m3 = trimmed.match(/^HTX\s*-?\s*(\d+)\s*-?\s*([A-Z0-9]+)$/);
  if (m3) return `HTX-${m3[1]}-${m3[2]}`;
  return trimmed;
}
