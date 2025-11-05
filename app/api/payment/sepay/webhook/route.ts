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
  const startTime = Date.now();
  try {
    const payload = await request.json();
    console.log('📩 Sepay Webhook received:', JSON.stringify(payload, null, 2));
    console.log('📩 Webhook timestamp:', new Date().toISOString());

    // Extract order code từ nhiều nguồn có thể
    // Ưu tiên lấy từ field "code" (Sepay tự nhận diện)
    // Nếu không có thì extract từ "content" (nội dung chuyển khoản)
    const extracted =
      payload.code ||                          // Sepay tự nhận diện code thanh toán
      payload.order_code || 
      payload.orderCode ||
      extractOrderCode(payload.content) ||     // Nội dung chuyển khoản
      extractOrderCode(payload.description) ||
      extractOrderCode(payload.transferContent) ||
      extractOrderCode(payload.transaction_content);

    if (!extracted) {
      console.error('❌ Order code not found in payload. Full payload:', payload);
      // Trả về success: true để Sepay không retry, nhưng không cập nhật đơn
      return NextResponse.json({ success: true, message: 'Order code not found, ignored' });
    }

    // Chuẩn hóa mã đơn về HTX-<digits>-<CODE> nếu có thể
    const extractedString = typeof extracted === 'string' ? extracted : extracted?.full || extracted?.short || '';
    const orderCode = normalizeOrderCode(extractedString);
    const prefixDigits = typeof extracted === 'string' ? null : (extracted?.prefixDigits ?? null);
    const suffixToken = typeof extracted === 'string' ? null : (extracted?.suffixToken ?? null);
    console.log('✅ Order code extracted:', { 
      raw: extracted, 
      extractedString, 
      normalized: orderCode, 
      prefixDigits, 
      suffixToken,
      content: payload.content,
      description: payload.description
    });

    // Chỉ xử lý giao dịch TIỀN VÀO
    if (payload.transferType && payload.transferType !== 'in') {
      console.log(`⏭️ Skip transferType: ${payload.transferType} (not "in")`);
      return NextResponse.json({ success: true, message: 'Not money in transaction' });
    }

    // Update order trong database
    const supabase = createAdminClient();

    // Tìm order theo order_number
    // Đồng bộ logic với check API để đảm bảo matching chính xác
    // Dùng extractedString làm rawCode (giống check API dùng rawCode)
    const rawCode = extractedString;
    const normalized = orderCode;
    const variants = Array.from(new Set([
      normalized,
      rawCode.trim(),
      rawCode.trim().replace(/\s+/g, ''),
      normalized.replace(/-/g, ''),
      normalized.replace(/-/g, '–'),
      normalized.replace(/-/g, '—'),
    ]));

    console.log('🔍 Searching order with variants:', variants);

    let { data: foundOrders, error: findError } = await supabase
      .from('orders')
      .select('id, order_number, total_amount, final_amount, payment_status, created_at')
      .in('order_number', variants)
      .order('created_at', { ascending: false })
      .limit(1);
    let order = Array.isArray(foundOrders) && foundOrders.length > 0 ? (foundOrders[0] as any) : null;

    console.log('🔍 First search result:', { foundCount: foundOrders?.length || 0, order: order ? { id: order.id, order_number: order.order_number, payment_status: order.payment_status } : null, error: findError?.message });

    if (findError || !order) {
      // Thử tìm theo biến thể không dấu (nếu đơn lưu sai format)
      const noDashVariant = orderCode.replace(/-/g, '');
      const retry = await supabase
        .from('orders')
        .select('id, order_number, total_amount, final_amount, payment_status, created_at')
        .in('order_number', [noDashVariant, noDashVariant.replace(/-/g, '–'), noDashVariant.replace(/-/g, '—')])
        .order('created_at', { ascending: false })
        .limit(1);

      if (!retry.error && Array.isArray(retry.data) && retry.data.length > 0) {
        order = retry.data[0] as any;
      }
    }

    // Fallback 1: Thử match theo hậu tố mã (suffixToken) nếu có trong content, ví dụ: HTX17623340 96471Z8GVK7EUO
    if (!order && suffixToken) {
      const { data: bySuffix, error: bySuffixErr } = await supabase
        .from('orders')
        .select('id, order_number, total_amount, final_amount, payment_status, created_at')
        .ilike('order_number', `%-${suffixToken}`);
      if (!bySuffixErr && bySuffix && bySuffix.length > 0) {
        // Nếu nhiều kết quả, ưu tiên đơn mới nhất
        bySuffix.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        order = bySuffix[0] as any;
      }
    }

    // Fallback 2: Thử match theo tiền tố số (prefixDigits) nếu có, ví dụ: HTX17623340 -> match HTX-17623340%
    if (!order && prefixDigits) {
      const { data: byPrefix, error: byPrefixErr } = await supabase
        .from('orders')
        .select('id, order_number, total_amount, final_amount, payment_status, created_at')
        .ilike('order_number', `HTX-${prefixDigits}%`);
      if (!byPrefixErr && byPrefix && byPrefix.length > 0) {
        // Ưu tiên đơn mới nhất
        byPrefix.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        order = byPrefix[0] as any;
      }
    }

    if (!order) {
      // Fallback 3: tìm "chứa" mã đơn (đồng bộ với check API)
      console.log('🔍 Fallback: trying ilike contains:', orderCode);
      const { data: likeOrders, error: likeErr } = await supabase
        .from('orders')
        .select('id, order_number, total_amount, final_amount, payment_status, created_at')
        .ilike('order_number', `%${orderCode}%`)
        .order('created_at', { ascending: false })
        .limit(1);
      if (!likeErr && Array.isArray(likeOrders) && likeOrders.length > 0) {
        console.log('✅ Found order via ilike fallback:', { order_number: likeOrders[0].order_number, payment_status: likeOrders[0].payment_status });
        order = likeOrders[0] as any;
      }
    }

    if (!order) {
      console.error('❌ Order not found with any strategy:', { orderCode, prefixDigits, suffixToken });
      return NextResponse.json({ success: true, message: 'Order lookup resulted in null' });
    }

    console.log('✅ Order found:', { order_id: order.id, order_number: order.order_number, current_payment_status: order.payment_status });

    // Kiểm tra đơn hàng đã được thanh toán chưa (tránh duplicate)
    // NHƯNG vẫn update để đảm bảo sync với SEPay
    if (order.payment_status === 'paid') {
      console.log('⚠️ Order already paid, but verifying update:', orderCode);
      // Vẫn update để đảm bảo sync với transaction_id và updated_at
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

    console.log('🔄 Updating order:', { 
      order_id: order.id, 
      order_number: order.order_number, 
      from_status: order.payment_status, 
      to_status: 'paid',
      transaction_id: transactionId,
    });

    // Force update payment_status - KHÔNG check payment_status hiện tại
    console.log('🔄 Attempting to update order:', {
      order_id: order.id,
      order_number: order.order_number,
      current_payment_status: order.payment_status,
      target_payment_status: 'paid',
    });

    const { data: updatedOrder, error: updateError, count } = await supabase
      .from('orders')
      .update({
        payment_status: 'paid',
        // Giữ status = 'pending' khi đã thanh toán, admin sẽ chuyển sang 'processing' khi bắt đầu xử lý
        status: 'pending',
        transaction_id: transactionId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', order.id)
      .select('payment_status, status, transaction_id')
      .single();

    console.log('🔄 Update result:', {
      hasError: !!updateError,
      error: updateError?.message,
      hasData: !!updatedOrder,
      updatedOrder,
      count,
    });

    if (updateError) {
      console.error('❌ Error updating order:', updateError);
      console.error('❌ Update error details:', JSON.stringify(updateError, null, 2));
      return NextResponse.json(
        { success: false, error: 'Failed to update order', details: updateError.message },
        { status: 500 }
      );
    }

    if (!updatedOrder) {
      console.error('❌ Update returned no data:', { order_id: order.id });
      // Thử query lại để xem order có tồn tại không
      const { data: checkOrder, error: checkError } = await supabase
        .from('orders')
        .select('id, payment_status, status')
        .eq('id', order.id)
        .single();
      console.error('❌ Order check after failed update:', { checkOrder, checkError });
      return NextResponse.json(
        { success: false, error: 'Update returned no data', checkOrder, checkError },
        { status: 500 }
      );
    }


    // Verify update was successful - DOUBLE CHECK
    console.log('🔍 Verifying update...', { order_id: order.id });

    // Wait longer to ensure DB write is complete and replicated
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const { data: verifyOrder, error: verifyError } = await supabase
      .from('orders')
      .select('payment_status, status, transaction_id')
      .eq('id', order.id)
      .single();

    console.log('🔍 Verification result:', {
      orderCode,
      order_id: order.id,
      order_number: order.order_number,
      transactionId: transactionId,
      amount: payload.amount || payload.transferAmount,
      updated_data: updatedOrder,
      verified_data: verifyOrder,
      verify_error: verifyError?.message,
      verify_payment_status: verifyOrder?.payment_status,
      verify_status: verifyOrder?.status,
    });

    // Nếu verify thất bại, LOG ERROR và TRẢ VỀ ERROR
    if (verifyError) {
      console.error('❌ CRITICAL: Verification query failed!', {
        verifyError: verifyError?.message,
        verifyErrorDetails: JSON.stringify(verifyError, null, 2),
        order_id: order.id,
        updated_data: updatedOrder,
      });
      
      // TRẢ VỀ ERROR để SEPay retry
      return NextResponse.json(
        { 
          success: false, 
          error: 'Verification query failed',
          details: {
            verifyError: verifyError.message,
            updated_data: updatedOrder,
          }
        },
        { status: 500 }
      );
    }

    if (!verifyOrder) {
      console.error('❌ CRITICAL: Verification returned no data!', {
        order_id: order.id,
        updated_data: updatedOrder,
      });
      
      // TRẢ VỀ ERROR để SEPay retry
      return NextResponse.json(
        { 
          success: false, 
          error: 'Verification returned no data',
          details: {
            order_id: order.id,
            updated_data: updatedOrder,
          }
        },
        { status: 500 }
      );
    }

    if (verifyOrder.payment_status !== 'paid') {
      console.error('❌ CRITICAL: Payment status not updated to paid!', {
        order_id: order.id,
        order_number: order.order_number,
        expected: 'paid',
        actual: verifyOrder.payment_status,
        updated_data_payment_status: updatedOrder?.payment_status,
        verified_data: verifyOrder,
      });
      
      // TRẢ VỀ ERROR để SEPay retry
      return NextResponse.json(
        { 
          success: false, 
          error: 'Payment status not updated to paid',
          details: {
            expected: 'paid',
            actual: verifyOrder.payment_status,
            updated_data: updatedOrder,
            verified_data: verifyOrder,
          }
        },
        { status: 500 }
      );
    }

    // Verify status phải là 'pending' (chờ xử lý sau khi đã thanh toán)
    // Admin sẽ chuyển sang 'processing' khi bắt đầu xử lý đơn hàng
    if (verifyOrder.status !== 'pending') {
      console.error('❌ CRITICAL: Order status should be pending after payment!', {
        order_id: order.id,
        order_number: order.order_number,
        expected: 'pending',
        actual: verifyOrder.status,
        updated_data_status: updatedOrder?.status,
        verified_data: verifyOrder,
      });
      
      // TRẢ VỀ ERROR để SEPay retry
      return NextResponse.json(
        { 
          success: false, 
          error: 'Order status should be pending after payment',
          details: {
            expected: 'pending',
            actual: verifyOrder.status,
            updated_data: updatedOrder,
            verified_data: verifyOrder,
          }
        },
        { status: 500 }
      );
    }
    
    // CHỈ LOG KHI VERIFY THÀNH CÔNG
    console.log('✅ Update verified successfully:', {
      order_id: order.id,
      order_number: order.order_number,
      payment_status: verifyOrder.payment_status,
      status: verifyOrder.status,
      transaction_id: verifyOrder.transaction_id,
    });

    // TODO: Gửi email xác nhận thanh toán cho khách hàng
    // await sendPaymentConfirmationEmail(order);

    const duration = Date.now() - startTime;
    console.log('✅ Webhook completed successfully:', {
      orderCode,
      order_id: order.id,
      order_number: order.order_number,
      payment_status: verifyOrder.payment_status,
      status: verifyOrder.status,
      duration_ms: duration,
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Payment processed successfully',
      orderCode,
      order_id: order.id,
      order_number: order.order_number,
      payment_status: verifyOrder.payment_status,
    });

  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error('❌ Webhook error:', error);
    console.error('❌ Webhook error details:', {
      message: error.message,
      stack: error.stack,
      duration_ms: duration,
    });
    return NextResponse.json(
      { success: false, error: error.message, details: error.stack },
      { status: 500 }
    );
  }
}

/**
 * Helper function: Extract order code từ content
 * Content có thể có format: "NHAN TU 069704410592 TRACE 382348 ND TRAN THANH DO chuyen tien qua MoMo"
 * hoặc chứa order code ở đâu đó
 */
function extractOrderCode(content: string): any | null {
  if (!content) return null;

  // 1) Short: HTX<5-8 digits>
  let s = content.toUpperCase();
  let short = s.match(/HTX\s*-?\s*(\d{5,8})/i);
  if (short) {
    return { short: `HTX${short[1]}` };
  }

  // 2) Chuẩn cũ: HTX-<13digits>-<A-Z0-9>
  let m = content.match(/HTX-(\d{13})-([A-Z0-9]+)/i);
  if (m) return m[0].toUpperCase();

  // 2) Không dấu gạch: HTX<13digits><A-Z0-9>
  // Ví dụ: HTX1762329381717BWJ46RGL3
  // Tách CHÍNH XÁC 13 chữ số làm timestamp (Date.now()) rồi phần còn lại là code
  const noDash = content.match(/HTX\s*([0-9]{13})([A-Z0-9]{6,16})/i);
  if (noDash) {
    const ts = noDash[1].toUpperCase();
    const code = noDash[2].toUpperCase();
    return `HTX-${ts}-${code}`;
  }

  // 3) Có thể có khoảng trắng hoặc dấu gạch lộn xộn (13 chữ số)
  m = content.match(/HTX\s*-?\s*(\d{13})\s*-?\s*([A-Z0-9]{6,16})/i);
  if (m) {
    return `HTX-${m[1].toUpperCase()}-${m[2].toUpperCase()}`;
  }

  // 4) Trường hợp một số ngân hàng rút gọn timestamp còn 8-12 chữ số
  // Ví dụ: "HTX17623340 96471Z8GVK7EUO" => không đủ 13 chữ số và có token riêng
  const loose = content.match(/HTX\s*-?\s*(\d{8,12})\b[^A-Z0-9]*([A-Z0-9]{6,16})/i);
  if (loose) {
    return {
      full: null,                 // không thể dựng đủ mã full vì thiếu chữ số
      prefixDigits: loose[1],     // phần số ngay sau HTX
      suffixToken: loose[2].toUpperCase(), // token chữ-số theo sau
    };
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
  // Short preferred: HTX<5-8 digits>
  const short1 = trimmed.match(/^HTX(\d{5,8})$/);
  if (short1) return `HTX${short1[1]}`;
  const short2 = trimmed.match(/^HTX\s*-?\s*(\d{5,8})$/);
  if (short2) return `HTX${short2[1]}`;
  // Legacy keep-as-is
  const legacy = trimmed.match(/^HTX-(\d{13})-([A-Z0-9]+)$/);
  if (legacy) return trimmed;
  return trimmed;
}
