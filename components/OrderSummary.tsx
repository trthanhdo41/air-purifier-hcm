"use client";

import { motion } from "framer-motion";
import { ShoppingBag, Truck, Shield, CreditCard, Gift, Sparkles, CheckCircle } from "lucide-react";
import Image from "next/image";
import { useCartStore } from "@/lib/stores/cart";
import { formatPrice } from "@/lib/utils";

interface OrderSummaryProps {
  items?: import('@/lib/stores/cart').CartItem[];
}

export default function OrderSummary({ items: propItems }: OrderSummaryProps) {
  const { items: storeItems, getTotalItems, getTotalPrice, getTotalSavings } = useCartStore();
  
  // Sử dụng propItems nếu có, không thì dùng storeItems
  const items = propItems || storeItems;
  
  const totalItems = items.reduce((total, item) => total + item.quantity, 0);
  const totalPrice = items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  const totalSavings = items.reduce((total, item) => {
    if (item.product.originalPrice) {
      return total + ((item.product.originalPrice - item.product.price) * item.quantity);
    }
    return total;
  }, 0);
  const shippingThreshold = 2000000;
  const shippingFee = totalPrice >= shippingThreshold ? 0 : 50000;
  const finalTotal = totalPrice + shippingFee;
  const isFreeShipping = totalPrice >= shippingThreshold;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Order Summary Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6"
      >
        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-sky-500 to-blue-600 rounded-full flex items-center justify-center"
          >
            <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </motion.div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900">Đơn hàng của bạn</h3>
            <p className="text-xs sm:text-sm text-gray-600">{totalItems} sản phẩm</p>
          </div>
        </div>

        {/* Product List */}
        <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
          {items.map((item, index) => (
            <motion.div
              key={item.product.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-50 rounded-lg sm:rounded-xl"
            >
              {/* Product Image */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="relative w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-lg overflow-hidden shrink-0"
              >
                <Image
                  src={item.product.image}
                  alt={item.product.name}
                  fill
                  sizes="(max-width: 640px) 48px, 64px"
                  className="object-cover"
                />
                {item.product.discount && (
                  <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                    -{item.product.discount}%
                  </div>
                )}
              </motion.div>

              {/* Product Info */}
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 text-xs sm:text-sm leading-tight mb-1 line-clamp-2">
                  {item.product.name}
                </h4>
                <p className="text-[10px] sm:text-xs text-gray-600 mb-1 sm:mb-2">{item.product.brand}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <span className="font-bold text-sky-600 text-xs sm:text-sm">
                      {formatPrice(item.product.price)}
                    </span>
                    {item.product.originalPrice && item.product.originalPrice > item.product.price && (
                      <span className="text-[10px] sm:text-xs text-gray-500 line-through">
                        {formatPrice(item.product.originalPrice)}
                      </span>
                    )}
                  </div>
                  
                  <div className="text-xs sm:text-sm font-medium text-gray-900">
                    x{item.quantity}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Pricing Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6"
      >
        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Chi tiết thanh toán</h3>
        
        <div className="space-y-3">
          {/* Subtotal */}
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Tạm tính:</span>
            <span className="font-medium">{formatPrice(totalPrice)}</span>
          </div>
          
          {/* Savings */}
          {totalSavings > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex justify-between text-sm"
            >
              <span className="text-green-600 flex items-center gap-1">
                <Gift className="w-3 h-3" />
                Tiết kiệm:
              </span>
              <span className="font-medium text-green-600">
                -{formatPrice(totalSavings)}
              </span>
            </motion.div>
          )}
          
          {/* Shipping */}
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 flex items-center gap-1">
              <Truck className="w-3 h-3" />
              Phí vận chuyển:
            </span>
            <span className={`font-medium ${isFreeShipping ? 'text-green-600' : ''}`}>
              {isFreeShipping ? 'Miễn phí' : formatPrice(shippingFee)}
            </span>
          </div>
          
          {/* Free Shipping Progress */}
          {!isFreeShipping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-lg p-3"
            >
              <div className="flex items-center gap-2 text-sm mb-2">
                <Sparkles className="w-4 h-4 text-orange-500" />
                <span className="text-orange-700 font-medium">Miễn phí vận chuyển</span>
              </div>
              <div className="w-full bg-orange-200 rounded-full h-2 mb-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(totalPrice / shippingThreshold) * 100}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="bg-gradient-to-r from-orange-500 to-yellow-500 h-2 rounded-full"
                />
              </div>
              <p className="text-xs text-orange-700">
                Mua thêm {formatPrice(shippingThreshold - totalPrice)} để được miễn phí vận chuyển
              </p>
            </motion.div>
          )}
          
          {/* Total */}
          <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-3">
            <span>Tổng cộng:</span>
            <span className="text-sky-600">{formatPrice(finalTotal)}</span>
          </div>
        </div>
      </motion.div>

      {/* Security & Benefits */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-4"
      >
        {/* Security */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <Shield className="w-4 h-4 text-green-600" />
            </div>
            <h4 className="font-semibold text-green-800">Bảo mật & Đảm bảo</h4>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs text-green-700">
            <div className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              <span>SSL 256-bit</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              <span>PCI DSS</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              <span>Bảo hành chính hãng</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              <span>Đổi trả 30 ngày</span>
            </div>
          </div>
        </div>

        {/* Delivery Info */}
        <div className="bg-gradient-to-r from-blue-50 to-sky-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Truck className="w-4 h-4 text-blue-600" />
            </div>
            <h4 className="font-semibold text-blue-800">Thông tin giao hàng</h4>
          </div>
          <div className="space-y-2 text-sm text-blue-700">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Giao hàng nhanh 2-4 giờ tại TP.HCM</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Giao hàng 1-2 ngày tại các tỉnh khác</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Miễn phí vận chuyển đơn hàng từ 2 triệu</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}