"use client";

import { motion } from "framer-motion";
import { Loader2, CreditCard, Shield, CheckCircle } from "lucide-react";

export default function PaymentProcessing() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full"
      >
        {/* Animated Icon */}
        <div className="flex justify-center mb-6">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-20 h-20 rounded-full bg-gradient-to-r from-emerald-500 to-green-600 flex items-center justify-center"
          >
            <CreditCard className="w-10 h-10 text-white" />
          </motion.div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-4">
          Đang chuyển đến trang thanh toán
        </h2>

        {/* Description */}
        <p className="text-center text-gray-600 mb-6">
          Vui lòng chờ trong giây lát...
        </p>

        {/* Progress Steps */}
        <div className="space-y-3">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-3"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center"
            >
              <CheckCircle className="w-4 h-4 text-white" />
            </motion.div>
            <span className="text-sm text-gray-700">Đơn hàng đã được tạo</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="flex items-center gap-3"
          >
            <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
            <span className="text-sm text-gray-700">Đang tạo phiên thanh toán...</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="flex items-center gap-3"
          >
            <div className="w-6 h-6 rounded-full border-2 border-gray-300"></div>
            <span className="text-sm text-gray-400">Chuyển hướng đến cổng thanh toán</span>
          </motion.div>
        </div>

        {/* Security Badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-500"
        >
          <Shield className="w-4 h-4 text-green-600" />
          <span>Thanh toán được bảo mật SSL 256-bit</span>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

