"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { QrCode, Copy, CheckCircle2, AlertCircle, Clock, Building2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import Image from 'next/image';

interface SepayQRPaymentProps {
  orderCode: string;
  amount: number;
  bankAccount: string;
  bankName: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function SepayQRPayment({ 
  orderCode, 
  amount, 
  bankAccount, 
  bankName,
  onSuccess,
  onCancel 
}: SepayQRPaymentProps) {
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 phút
  const [checkingPayment, setCheckingPayment] = useState(false);

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

  // Check payment status every 5 seconds
  // Gọi API /api/payment/sepay/check để check cột payment_status từ Supabase
  useEffect(() => {
    let isMounted = true;
    let retryCount = 0;
    const maxRetries = 120; // 120 * 5s = 10 phút max
    const POLL_INTERVAL = 5000; // 5 giây

    const checkPayment = async () => {
      if (!isMounted) return;
      
      retryCount++;
      if (retryCount > maxRetries) {
        console.warn('⚠️ Payment check timeout after 10 minutes');
        return;
      }

      try {
        setCheckingPayment(true);
        // Add timestamp to prevent caching
        const timestamp = Date.now();
        // Gọi API check để lấy payment_status từ Supabase
        const res = await fetch(`/api/payment/sepay/check?orderCode=${orderCode}&t=${timestamp}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
          },
        });
        
        if (!res.ok) {
          console.error('❌ Payment check failed:', res.status, res.statusText);
          return;
        }

        const data = await res.json();
        
        // CHECK GIỐNG HỆT ADMIN PAGE - Check trực tiếp payment_status === 'paid'
        // Admin page: order.payment_status === 'paid' ? 'Đã thanh toán' : 'Chờ thanh toán'
        // Checkout FE: payment_status === 'paid' ? redirect : continue polling
        const paymentStatus = data.payment_status || data.order?.payment_status;
        const isPaid = paymentStatus === 'paid';
        
        console.log('💳 Payment check result (like admin page):', {
          success: data.success,
          payment_status: paymentStatus,
          payment_status_from_response: data.payment_status,
          payment_status_from_order: data.order?.payment_status,
          isPaid: isPaid,
          order: data.order ? { 
            order_number: data.order.order_number, 
            payment_status: data.order.payment_status,
            status: data.order.status,
            id: data.order.id,
          } : null,
          retryCount,
        });
        
        // CHECK GIỐNG HỆT ADMIN PAGE - Nếu payment_status === 'paid' thì redirect
        // Admin page check: order.payment_status === 'paid' → hiển thị "Đã thanh toán"
        // Checkout FE check: payment_status === 'paid' → redirect đến /success
        if (data.success && isPaid && paymentStatus === 'paid') {
          console.log('✅ Payment confirmed! Redirecting...', {
            order_number: data.order?.order_number,
            payment_status: paymentStatus,
            status: data.order?.status,
            order_id: data.order?.id,
          });
          // Stop polling
          isMounted = false;
          // Call onSuccess to redirect
          onSuccess?.();
          return; // Stop execution
        }
      } catch (error) {
        console.error('❌ Error checking payment:', error);
      } finally {
        if (isMounted) {
          setCheckingPayment(false);
        }
      }
    };

    // Check immediately on mount
    checkPayment();
    
    // Then check every 5 seconds
    const interval = setInterval(checkPayment, POLL_INTERVAL);
    
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [orderCode, onSuccess]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-sky-500 to-blue-600 text-white p-6 rounded-t-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Thanh toán chuyển khoản</h3>
                  <p className="text-sm text-sky-100">Quét mã QR để thanh toán</p>
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
                <span className="text-2xl font-bold">{formattedAmount}đ</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* QR Code */}
            <div className="flex flex-col items-center">
              <div className="bg-gradient-to-br from-sky-50 to-blue-50 p-6 rounded-2xl shadow-inner mb-4">
                <div className="bg-white p-4 rounded-xl shadow-lg">
                  <Image 
                    src={qrCodeUrl} 
                    alt="QR Code Thanh toán" 
                    width={280}
                    height={280}
                    className="w-full h-auto"
                    priority
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-gray-600 mb-4">
                <QrCode className="w-5 h-5" />
                <p className="text-sm font-medium">Quét mã QR bằng ứng dụng ngân hàng</p>
              </div>

              <div className="flex items-center gap-2 text-blue-600 bg-blue-50 px-4 py-2 rounded-lg">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm font-medium">Đang tự động kiểm tra thanh toán mỗi 5 giây...</span>
              </div>
            </div>

            {/* Thông tin chuyển khoản */}
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-sky-600" />
                Hoặc chuyển khoản thủ công
              </h4>
              
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                {/* Ngân hàng */}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Ngân hàng</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{bankName}</span>
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
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Số tài khoản</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold">{bankAccount}</span>
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
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Chủ tài khoản</span>
                  <span className="font-semibold">TRAN THANH DO</span>
                </div>

                {/* Số tiền */}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Số tiền</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-lg text-red-600">{formattedAmount}đ</span>
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
                <div className="flex justify-between items-start pt-2 border-t border-gray-200">
                  <span className="text-sm text-gray-600">Nội dung</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sky-600">{orderCode}</span>
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

              <div className="flex items-start gap-2 text-xs text-amber-600 bg-amber-50 p-3 rounded-lg">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p>
                  <strong>Lưu ý:</strong> Vui lòng nhập <strong>chính xác nội dung chuyển khoản</strong> để đơn hàng được xử lý tự động.
                </p>
              </div>
            </div>

            {/* Hướng dẫn */}
            <div className="bg-blue-50 rounded-xl p-4">
              <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                <QrCode className="w-5 h-5" />
                Hướng dẫn thanh toán
              </h4>
              <ol className="space-y-2 text-sm text-blue-800">
                <li className="flex gap-2">
                  <span className="font-bold">1.</span>
                  <span>Mở ứng dụng ngân hàng và chọn <strong>Quét mã QR</strong></span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold">2.</span>
                  <span>Quét mã QR phía trên</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold">3.</span>
                  <span>Kiểm tra thông tin và xác nhận thanh toán</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold">4.</span>
                  <span>Đơn hàng sẽ được xử lý tự động sau khi thanh toán thành công</span>
                </li>
              </ol>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className="w-full px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Hủy thanh toán
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

