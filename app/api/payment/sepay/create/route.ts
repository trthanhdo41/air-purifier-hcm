import { NextRequest, NextResponse } from 'next/server';

/**
 * Tạo phiên thanh toán Sepay
 * 
 * Request body:
 * {
 *   amount: number,
 *   orderCode: string,
 *   description: string,
 *   orderId: string (UUID của order trong database)
 * }
 * 
 * Response:
 * {
 *   url: string (URL redirect đến trang thanh toán Sepay)
 * }
 */

export async function POST(request: NextRequest) {
  try {
    const { amount, orderCode, description, orderId } = await request.json();

    // Validate required fields
    if (!amount || !orderCode || !orderId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get Sepay credentials từ env
    const sepayApiKey = process.env.SEPAY_API_KEY;
    const sepayEndpoint = process.env.SEPAY_ENDPOINT || 'https://api.sepay.vn/v1/payment/create';
    const returnUrl = process.env.SEPAY_RETURN_URL || `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/payment/sepay/return`;
    const webhookUrl = process.env.SEPAY_WEBHOOK_URL || `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/payment/sepay/webhook`;

    if (!sepayApiKey) {
      console.error('❌ SEPAY_API_KEY not configured');
      return NextResponse.json(
        { success: false, error: 'Payment gateway not configured' },
        { status: 500 }
      );
    }

    // Prepare Sepay request payload
    const sepayPayload = {
      amount: Math.round(amount), // Đảm bảo là số nguyên
      order_code: orderCode,
      description: description || `Thanh toan don hang ${orderCode}`,
      return_url: `${returnUrl}?order_code=${orderCode}&order_id=${orderId}`,
      webhook_url: webhookUrl,
      // Thêm các field khác theo API Sepay nếu cần
      metadata: {
        order_id: orderId,
        order_code: orderCode,
      },
    };

    console.log('📤 Creating Sepay payment:', {
      orderCode,
      amount,
      endpoint: sepayEndpoint,
    });

    // Call Sepay API
    const response = await fetch(sepayEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sepayApiKey}`,
      },
      body: JSON.stringify(sepayPayload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Sepay API error:', data);
      return NextResponse.json(
        { 
          success: false, 
          error: data.message || 'Failed to create payment session' 
        },
        { status: response.status }
      );
    }

    // Sepay trả về payment URL
    if (!data.url && !data.payment_url) {
      console.error('❌ No payment URL in Sepay response:', data);
      return NextResponse.json(
        { success: false, error: 'Invalid payment response' },
        { status: 500 }
      );
    }

    const paymentUrl = data.url || data.payment_url;

    console.log('✅ Sepay payment created:', {
      orderCode,
      paymentUrl,
    });

    return NextResponse.json({
      success: true,
      url: paymentUrl,
      transaction_id: data.transaction_id,
    });

  } catch (error: any) {
    console.error('❌ Error creating Sepay payment:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
