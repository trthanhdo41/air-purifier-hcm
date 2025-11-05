"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { QrCode, Copy, CheckCircle2, AlertCircle, Clock, Building2, ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface PaymentPageProps {
  params: {
    orderCode: string;
  };
}

export default function PaymentPage({ params }: PaymentPageProps) {
  const router = useRouter();
  const { orderCode } = params;
  
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 phút
  const [checkingPayment, setCheckingPayment] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState('');
  const [orderData, setOrderData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Fetch order data
  useEffect(() => {
    const fetchOrderData = async () => {
      try {
        const res = await fetch(`/api/orders/create?orderCode=${orderCode}`);
        if (res.ok) {
          const data = await res.json();
          setOrderData(data.order);
        }
      } catch (error) {
        console.error('Error fetching order:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrderData();
  }, [orderCode]);

  // Payment config
  const amount = orderData?.total_amount || 10000;
  const bankAccount = process.env.NEXT_PUBLIC_SEPAY_BANK_ACCOUNT || "0888889805";
  const bankName = process.env.NEXT_PUBLIC_SEPAY_BANK_NAME || "VPBank";
  
  // QR Code URL
  const qrCodeUrl = `https://qr.sepay.vn/img?acc=${bankAccount}&bank=${bankName}&amount=${amount}&des=${orderCode}`;
  
  // Format số tiền
  const formattedAmount = new Intl.NumberFormat('vi-VN').format(amount);

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // Handler check payment
  const handleCheckPayment = async () => {
    try {
      setCheckingPayment(true);
      setPaymentMessage('');
      
      console.log('🔍 FE - Checking payment for orderCode:', orderCode);
      
      const timestamp = Date.now();
      const apiUrl = `/api/payment/sepay/check?orderCode=${orderCode}&t=${timestamp}`;
      console.log('🔍 FE - Calling API:', apiUrl);
      
      const res = await fetch(apiUrl, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
        },
      });
      
      if (!res.ok) {
        console.error('❌ Payment check failed:', res.status, res.statusText);
        setPaymentMessage('❌ Không thể kiểm tra thanh toán. Vui lòng thử lại.');
        return;
      }

      const data = await res.json();
      
      const paymentStatus = data.payment_status || data.order?.payment_status;
      const isPaid = paymentStatus === 'paid';
      
      console.log('💳 Payment check result:', {
        success: data.success,
        payment_status: paymentStatus,
        isPaid: isPaid,
        order: data.order,
      });
      
      if (data.success && isPaid && paymentStatus === 'paid') {
        console.log('✅ Payment confirmed! Redirecting...');
        setPaymentMessage('✅ Thanh toán thành công! Đang chuyển trang...');
        setTimeout(() => {
          router.push(`/success?order=${orderCode}`);
        }, 1000);
      } else {
        setPaymentMessage('⏳ Chưa nhận được thanh toán. Vui lòng kiểm tra lại sau khi chuyển khoản.');
      }
    } catch (error) {
      console.error('❌ Error checking payment:', error);
      setPaymentMessage('❌ Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setCheckingPayment(false);
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin thanh toán...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-sky-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link 
            href="/checkout"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Quay lại</span>
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-sky-500 to-blue-600 text-white p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Thanh toán chuyển khoản</h1>
                  <p className="text-sm text-sky-100">Mã đơn hàng: {orderCode}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-sky-100 mb-1">Thời gian còn lại</div>
                <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-lg">
                  <Clock className="w-4 h-4" />
                  <span className="font-mono font-bold">
                    {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <div className="flex justify-between items-center">
                <span className="text-sm">Số tiền thanh toán</span>
                <span className="text-3xl font-bold">{formattedAmount}đ</span>
              </div>
            </div>
          </div>

          {/* QR Code Section */}
          <div className="p-8">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* QR Code */}
              <div className="flex-1 flex flex-col items-center">
                <div className="bg-gradient-to-br from-sky-50 to-blue-50 p-6 rounded-2xl shadow-inner mb-6">
                  <div className="bg-white p-4 rounded-xl shadow-lg">
                    <Image 
                      src={qrCodeUrl} 
                      alt="QR Code Thanh toán" 
                      width={300}
                      height={300}
                      className="w-full h-auto"
                      priority
                    />
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-gray-600 mb-6">
                  <QrCode className="w-5 h-5" />
                  <p className="text-sm font-medium">Quét mã QR bằng ứng dụng ngân hàng</p>
                </div>

                {/* Nút "Đã thanh toán" */}
                <button
                  onClick={handleCheckPayment}
                  disabled={checkingPayment}
                  className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold px-8 py-4 rounded-xl transition-colors w-full max-w-md shadow-lg hover:shadow-xl"
                >
                  {checkingPayment ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Đang kiểm tra...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Đã thanh toán</span>
                    </>
                  )}
                </button>

                {/* Message */}
                {paymentMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mt-4 px-4 py-3 rounded-lg text-sm font-medium w-full max-w-md ${
                      paymentMessage.startsWith('✅') 
                        ? 'bg-green-50 text-green-700' 
                        : paymentMessage.startsWith('⏳')
                        ? 'bg-yellow-50 text-yellow-700'
                        : 'bg-red-50 text-red-700'
                    }`}
                  >
                    {paymentMessage}
                  </motion.div>
                )}
              </div>

              {/* Thông tin chuyển khoản */}
              <div className="flex-1 space-y-4">
                <h2 className="font-semibold text-gray-900 flex items-center gap-2 text-lg">
                  <Building2 className="w-5 h-5 text-sky-600" />
                  Thông tin chuyển khoản
                </h2>
                
                <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                  {/* Ngân hàng */}
                  <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                    <span className="text-sm text-gray-600">Ngân hàng</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-lg">{bankName}</span>
                      <button
                        onClick={() => copyToClipboard(bankName)}
                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                      >
                        {copied ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Số tài khoản */}
                  <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                    <span className="text-sm text-gray-600">Số tài khoản</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-lg">{bankAccount}</span>
                      <button
                        onClick={() => copyToClipboard(bankAccount)}
                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                      >
                        {copied ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Chủ tài khoản */}
                  <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                    <span className="text-sm text-gray-600">Chủ tài khoản</span>
                    <span className="font-semibold text-lg">TRAN THANH DO</span>
                  </div>

                  {/* Số tiền */}
                  <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                    <span className="text-sm text-gray-600">Số tiền</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xl text-red-600">{formattedAmount}đ</span>
                      <button
                        onClick={() => copyToClipboard(amount.toString())}
                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                      >
                        {copied ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Nội dung chuyển khoản */}
                  <div className="flex justify-between items-start pt-2">
                    <span className="text-sm text-gray-600">Nội dung</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xl text-sky-600">{orderCode}</span>
                      <button
                        onClick={() => copyToClipboard(orderCode)}
                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                      >
                        {copied ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2 text-xs text-amber-600 bg-amber-50 p-4 rounded-lg">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <p>
                    <strong>Lưu ý:</strong> Vui lòng nhập <strong>chính xác nội dung chuyển khoản &quot;{orderCode}&quot;</strong> để đơn hàng được xử lý tự động.
                  </p>
                </div>
              </div>
            </div>

            {/* Hướng dẫn */}
            <div className="mt-8 bg-blue-50 rounded-xl p-6">
              <h3 className="font-semibold text-blue-900 mb-4 flex items-center gap-2 text-lg">
                <QrCode className="w-5 h-5" />
                Hướng dẫn thanh toán
              </h3>
              <ol className="space-y-3 text-sm text-blue-800">
                <li className="flex gap-3">
                  <span className="font-bold text-lg">1.</span>
                  <span>Mở ứng dụng ngân hàng và chọn <strong>Quét mã QR</strong></span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-lg">2.</span>
                  <span>Quét mã QR phía trên hoặc chuyển khoản thủ công với thông tin bên cạnh</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-lg">3.</span>
                  <span>Kiểm tra thông tin và xác nhận thanh toán</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-lg">4.</span>
                  <span>Sau khi chuyển khoản, click nút <strong className="text-green-600">&quot;Đã thanh toán&quot;</strong> để kiểm tra</span>
                </li>
              </ol>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

