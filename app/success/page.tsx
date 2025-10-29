"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Truck, Package, Home, Sparkles, Gift, Shield } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function SuccessPage() {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    setShowConfetti(true);
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ 
                x: Math.random() * window.innerWidth,
                y: -10,
                rotate: 0,
                scale: 1
              }}
              animate={{ 
                y: window.innerHeight + 10,
                rotate: 360,
                scale: 0
              }}
              transition={{ 
                duration: 3,
                delay: Math.random() * 2,
                ease: "easeOut"
              }}
              className="absolute w-2 h-2 rounded-full"
              style={{
                backgroundColor: ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'][Math.floor(Math.random() * 5)]
              }}
            />
          ))}
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="bg-white rounded-3xl shadow-2xl p-8 max-w-2xl w-full text-center relative overflow-hidden"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-8 right-8 w-32 h-32 rounded-full bg-green-500"></div>
          <div className="absolute bottom-8 left-8 w-24 h-24 rounded-full bg-emerald-500"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-green-400"></div>
        </div>

        <div className="relative z-10">
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ 
              type: "spring", 
              damping: 10, 
              stiffness: 100,
              delay: 0.2 
            }}
            className="w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
          >
            <CheckCircle className="w-12 h-12 text-white" />
          </motion.div>

          {/* Success Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Đặt hàng thành công! 🎉
            </h1>
            <p className="text-lg text-gray-600 mb-2">
              Cảm ơn bạn đã tin tưởng và mua sắm tại cửa hàng của chúng tôi
            </p>
            <p className="text-sm text-gray-500">
              Chúng tôi sẽ gửi email xác nhận đơn hàng đến bạn trong vài phút tới
            </p>
          </motion.div>

          {/* Order Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-200 rounded-2xl p-6 mb-8"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">Thông tin đơn hàng</h2>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-sky-100 rounded-full flex items-center justify-center">
                  <Package className="w-4 h-4 text-sky-600" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-900">Mã đơn hàng</p>
                  <p className="text-gray-600">#DH2024001</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-sky-100 rounded-full flex items-center justify-center">
                  <Truck className="w-4 h-4 text-sky-600" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-900">Dự kiến giao hàng</p>
                  <p className="text-gray-600">2-4 giờ tới</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Next Steps */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mb-8"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-4">Bước tiếp theo</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Package className="w-5 h-5 text-blue-600" />
                </div>
                <p className="font-semibold text-gray-900">Chuẩn bị hàng</p>
                <p className="text-gray-600 text-center">Đơn hàng đang được chuẩn bị</p>
              </div>
              <div className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <Truck className="w-5 h-5 text-orange-600" />
                </div>
                <p className="font-semibold text-gray-900">Giao hàng</p>
                <p className="text-gray-600 text-center">Shipper sẽ liên hệ bạn</p>
              </div>
              <div className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <p className="font-semibold text-gray-900">Hoàn thành</p>
                <p className="text-gray-600 text-center">Nhận hàng và thanh toán</p>
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button asChild className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 px-8 py-3">
                <Link href="/" className="flex items-center gap-2">
                  <Home className="w-4 h-4" />
                  <span>Về trang chủ</span>
                </Link>
              </Button>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="outline" className="px-8 py-3 border-gray-300 hover:border-sky-400 hover:text-sky-600">
                <span>Xem đơn hàng</span>
              </Button>
            </motion.div>
          </motion.div>

          {/* Special Offers */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="mt-8 bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center"
              >
                <Gift className="w-5 h-5 text-orange-600" />
              </motion.div>
              <h3 className="text-lg font-bold text-orange-800">Ưu đãi đặc biệt</h3>
            </div>
            <p className="text-orange-700 mb-4">
              Nhân dịp đặt hàng thành công, bạn được tặng mã giảm giá 10% cho đơn hàng tiếp theo!
            </p>
            <div className="bg-white rounded-lg p-3 border border-orange-200">
              <p className="font-mono text-lg font-bold text-orange-600">SAVE10NOW</p>
              <p className="text-sm text-orange-600">Mã giảm giá có hiệu lực trong 30 ngày</p>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}