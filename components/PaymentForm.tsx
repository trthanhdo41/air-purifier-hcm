"use client";

import { motion } from "framer-motion";
import { CreditCard, Smartphone, Wallet, Building2, Shield, Lock, Banknote, QrCode, CheckCircle } from "lucide-react";

interface PaymentFormProps {
  paymentMethod: string;
  onPaymentMethodChange: (method: string) => void;
}

export default function PaymentForm({ paymentMethod, onPaymentMethodChange }: PaymentFormProps) {
  const paymentMethods = [
    {
      id: "cod",
      name: "Thanh toán khi nhận hàng",
      description: "Trả tiền mặt khi nhận được hàng",
      icon: Wallet,
      color: "bg-green-500",
      popular: true
    },
    {
      id: "sepay",
      name: "Thanh toán online - Chuyển khoản",
      description: "Thanh toán qua QR Code hoặc chuyển khoản ngân hàng",
      icon: Building2,
      color: "bg-gradient-to-br from-blue-500 to-sky-600",
      popular: true
    }
  ];

  return (
    <div className="space-y-4">
      {paymentMethods.map((method, index) => (
        <motion.div
          key={method.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1, duration: 0.3, ease: "easeOut" }}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className={`relative border-2 rounded-xl p-4 cursor-pointer transition-all duration-300 ${
            paymentMethod === method.id
              ? "border-sky-500 bg-sky-50 shadow-md"
              : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
          }`}
          onClick={() => onPaymentMethodChange(method.id)}
        >
          {/* Popular Badge */}
          {method.popular && (
            <div className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              HOT
            </div>
          )}

          <div className="flex items-center gap-4">
            {/* Icon */}
            <motion.div
              whileHover={{ scale: 1.1 }}
              className={`w-12 h-12 ${method.color} rounded-xl flex items-center justify-center text-white`}
            >
              <method.icon className="w-6 h-6" />
            </motion.div>

            {/* Content */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-gray-900">{method.name}</h3>
                {method.id === "cod" && (
                  <div className="flex items-center gap-1 text-xs text-green-600">
                    <Shield className="w-3 h-3" />
                    <span>An toàn</span>
                  </div>
                )}
                {method.id === "bank_transfer" && (
                  <div className="flex items-center gap-1 text-xs text-blue-600">
                    <Lock className="w-3 h-3" />
                    <span>Bảo mật</span>
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-600">{method.description}</p>
            </div>

            {/* Radio Button */}
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
              paymentMethod === method.id
                ? "border-sky-500 bg-sky-500"
                : "border-gray-300"
            }`}>
              {paymentMethod === method.id && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-2 h-2 bg-white rounded-full"
                />
              )}
            </div>
          </div>

          {/* Online Payment Info */}
          {method.id === "sepay" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ 
                opacity: paymentMethod === method.id ? 1 : 0, 
                height: paymentMethod === method.id ? "auto" : 0 
              }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="mt-3 pt-3 border-t border-sky-100 overflow-hidden"
            >
              <div className="space-y-3">
                <div className="bg-gradient-to-r from-blue-50 to-sky-50 rounded-lg p-3 border border-blue-100">
                  <p className="font-semibold text-blue-900 mb-2 text-sm flex items-center gap-2">
                    <QrCode className="w-4 h-4" />
                    Quy trình thanh toán:
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2 text-xs text-gray-700">
                      <div className="w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold">1</div>
                      <span>Xác nhận đơn hàng và bấm <strong>&ldquo;Đặt hàng&rdquo;</strong></span>
                    </div>
                    <div className="flex items-start gap-2 text-xs text-gray-700">
                      <div className="w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold">2</div>
                      <span>Hệ thống tạo <strong>mã QR thanh toán</strong> riêng cho đơn hàng</span>
                    </div>
                    <div className="flex items-start gap-2 text-xs text-gray-700">
                      <div className="w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold">3</div>
                      <span>Bạn quét <strong>QR Code</strong> bằng app ngân hàng để thanh toán</span>
                    </div>
                    <div className="flex items-start gap-2 text-xs text-gray-700">
                      <div className="w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-3 h-3" />
                      </div>
                      <span>Đơn hàng <strong>tự động xác nhận</strong> sau khi thanh toán thành công</span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-1.5 text-xs text-blue-600">
                    <Shield className="w-3.5 h-3.5" />
                    <span className="font-medium">Bảo mật SSL 256-bit</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-blue-600">
                    <Lock className="w-3.5 h-3.5" />
                    <span className="font-medium">An toàn tuyệt đối</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-blue-600">
                    <Banknote className="w-3.5 h-3.5" />
                    <span className="font-medium">Không phí giao dịch</span>
                </div>
                  <div className="flex items-center gap-1.5 text-xs text-blue-600">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span className="font-medium">Xác nhận tức thì</span>
                </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* COD Benefits */}
          {method.id === "cod" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ 
                opacity: paymentMethod === method.id ? 1 : 0, 
                height: paymentMethod === method.id ? "auto" : 0 
              }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="mt-3 pt-3 border-t border-gray-200 overflow-hidden"
            >
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1 text-green-600">
                  <Shield className="w-3 h-3" />
                  <span>Kiểm tra hàng trước</span>
                </div>
                <div className="flex items-center gap-1 text-green-600">
                  <Wallet className="w-3 h-3" />
                  <span>Không cần thẻ</span>
                </div>
                <div className="flex items-center gap-1 text-green-600">
                  <Lock className="w-3 h-3" />
                  <span>An toàn tuyệt đối</span>
                </div>
                <div className="flex items-center gap-1 text-green-600">
                  <CreditCard className="w-3 h-3" />
                  <span>Không phí ẩn</span>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      ))}

      {/* Security Notice */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4"
      >
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center shrink-0">
            <Shield className="w-4 h-4 text-green-600" />
          </div>
          <div>
            <h4 className="font-semibold text-green-800 mb-1">Bảo mật thanh toán</h4>
            <p className="text-sm text-green-700">
              Tất cả thông tin thanh toán được mã hóa SSL 256-bit và tuân thủ tiêu chuẩn PCI DSS quốc tế.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}