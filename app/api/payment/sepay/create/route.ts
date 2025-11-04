import { NextRequest, NextResponse } from 'next/server';

/**
 * Tạo thông tin thanh toán Sepay QR Code
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
 *   success: boolean,
 *   qrData: {
 *     orderCode: string,
 *     amount: number,
 *     bankAccount: string,
 *     bankName: string,
 *     qrCodeUrl: string
 *   }
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
    const bankAccount = process.env.SEPAY_BANK_ACCOUNT;
    const bankName = process.env.SEPAY_BANK_NAME;

    if (!bankAccount || !bankName) {
      console.error('❌ Sepay bank config not found');
      return NextResponse.json(
        { success: false, error: 'Payment gateway not configured' },
        { status: 500 }
      );
    }

    // Tạo QR Code URL
    const qrCodeUrl = `https://qr.sepay.vn/img?acc=${bankAccount}&bank=${bankName}&amount=${Math.round(amount)}&des=${orderCode}`;

    console.log('✅ Sepay QR payment created:', {
      orderCode,
      amount,
      bankAccount,
      bankName,
    });

    return NextResponse.json({
      success: true,
      qrData: {
        orderCode,
        amount: Math.round(amount),
        bankAccount,
        bankName,
        qrCodeUrl,
      }
    });

  } catch (error: any) {
    console.error('❌ Error creating Sepay QR payment:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
