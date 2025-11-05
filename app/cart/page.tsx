"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Plus, Minus, Trash2, ShoppingBag, Sparkles, Truck, Shield, CreditCard, Tag, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/stores/cart";
import { useAuthStore } from "@/lib/stores/auth";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Botchat from "@/components/Botchat";
import LoginModal from "@/components/LoginModal";
 

export default function CartPage() {
  const { 
    items, 
    updateQuantity, 
    removeItem, 
    getTotalItems, 
    getTotalPrice, 
    getTotalSavings,
    
  } = useCartStore();
  
  const { user } = useAuthStore();
  const router = useRouter();
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [isNavigatingToCheckout, setIsNavigatingToCheckout] = useState(false);

  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();
  const totalSavings = getTotalSavings();
  const shippingThreshold = 2000000;
  const shippingFee = totalPrice >= shippingThreshold ? 0 : 50000;
  const finalTotal = totalPrice + shippingFee - discount;

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleApplyPromo = () => {
    if (promoCode.toUpperCase() === "WELCOME10") {
      setDiscount(totalPrice * 0.1);
    }
  };

  if (!isClient) {
    return null;
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Header />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex-1 flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-xl border border-gray-100 p-12 text-center max-w-md w-full shadow-sm">
            <div className="w-20 h-20 bg-sky-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-10 h-10 text-sky-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Giỏ hàng trống</h2>
            <p className="text-gray-500 mb-8">Hãy thêm sản phẩm vào giỏ hàng để tiếp tục</p>
            <Button asChild className="bg-sky-500 hover:bg-sky-600 px-8">
              <Link href="/">Tiếp tục mua sắm</Link>
            </Button>
          </div>
        </motion.div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 sm:mb-6"
        >
          <div className="flex items-center gap-2 sm:gap-4 mb-2 sm:mb-3">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900 text-xs sm:text-sm">
                <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Quay lại</span>
              </Button>
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">Giỏ hàng</h1>
          <p className="text-gray-500 mt-1 text-sm sm:text-base">Bạn có {totalItems} sản phẩm trong giỏ hàng</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 md:p-6"
            >
              {/* Product List */}
              <div className="space-y-3 sm:space-y-4">
                <AnimatePresence>
                  {items.map((item, index) => (
                    <motion.div
                      key={item.product.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20, scale: 0.9 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white rounded-lg p-3 sm:p-4 border border-gray-200 hover:border-gray-300 transition-colors"
                    >
                      <div className="flex gap-2 sm:gap-4">
                        {/* Product Image */}
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gray-50 rounded-lg overflow-hidden shrink-0"
                        >
                          <Image
                            src={item.product.image}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                          />
                          {item.product.discount && (
                            <div className="absolute -top-1 -right-1 bg-sky-500 text-white text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                              -{item.product.discount}%
                            </div>
                          )}
                        </motion.div>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 sm:gap-4 mb-1 sm:mb-2">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900 text-xs sm:text-sm md:text-base leading-tight mb-0.5 sm:mb-1 truncate">
                                {item.product.name}
                              </h3>
                              <p className="text-[10px] sm:text-xs text-gray-600">{item.product.brand}</p>
                            </div>
                            <motion.button
                              whileHover={{ scale: 1.1, rotate: 90 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => removeItem(item.product.id)}
                              className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors shrink-0"
                            >
                              <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
                            </motion.button>
                          </div>
                          
                          {/* Price */}
                          <div className="flex items-center gap-2 mb-2 sm:mb-3">
                            <span className="font-bold text-sky-600 text-sm sm:text-base md:text-lg">
                              {formatPrice(item.product.price)}
                            </span>
                            {item.product.originalPrice && item.product.originalPrice > item.product.price && (
                              <span className="text-[10px] sm:text-xs text-gray-500 line-through">
                                {formatPrice(item.product.originalPrice)}
                              </span>
                            )}
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 sm:gap-3">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                className="w-8 h-8 sm:w-9 sm:h-9 bg-gray-200 hover:bg-gray-300 rounded-lg flex items-center justify-center transition-colors"
                              >
                                <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                              </motion.button>
                              
                              <span className="w-8 sm:w-10 text-center font-semibold text-sm sm:text-base">
                                {item.quantity}
                              </span>
                              
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                className="w-8 h-8 sm:w-9 sm:h-9 bg-sky-500 hover:bg-sky-600 rounded-lg flex items-center justify-center transition-colors text-white"
                              >
                                <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                              </motion.button>
                            </div>

                            <div className="text-right">
                              <p className="text-[10px] sm:text-xs text-gray-600">Thành tiền</p>
                              <p className="font-bold text-sky-600 text-sm sm:text-base md:text-lg">
                                {formatPrice(item.product.price * item.quantity)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="sticky top-4 sm:top-6 lg:top-8 space-y-4 sm:space-y-6"
            >
              {/* Order Summary Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-5 md:p-6">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4 sm:mb-5">Tóm tắt đơn hàng</h3>
                
                {/* Product Summary */}
                <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-gray-600">Tạm tính ({totalItems} sản phẩm):</span>
                    <span className="font-medium text-gray-900">{formatPrice(totalPrice)}</span>
                  </div>
                  
                  {totalSavings > 0 && (
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-green-600 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        Tiết kiệm:
                      </span>
                      <span className="font-medium text-green-600">
                        -{formatPrice(totalSavings)}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-gray-600 flex items-center gap-1">
                      <Truck className="w-3 h-3" />
                      Phí vận chuyển:
                    </span>
                    <span className={`font-medium ${shippingFee === 0 ? 'text-green-600' : 'text-gray-900'}`}>
                      {shippingFee === 0 ? 'Miễn phí' : formatPrice(shippingFee)}
                    </span>
                  </div>
                  
                  {discount > 0 && (
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-green-600 flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        Mã giảm giá:
                      </span>
                      <span className="font-medium text-green-600">
                        -{formatPrice(discount)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-200 pt-3 sm:pt-4 mb-4 sm:mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-base sm:text-lg font-bold text-gray-900">Tổng cộng:</span>
                    <span className="text-xl sm:text-2xl font-bold text-sky-600">{formatPrice(finalTotal)}</span>
                  </div>
                  <p className="text-[10px] sm:text-xs text-gray-500 mt-1">Đã bao gồm VAT (nếu có)</p>
                </div>

                {/* Promo Code */}
                <div className="mb-4 sm:mb-6">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="Mã giảm giá"
                      className="flex-1 px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    />
                    <Button
                      onClick={handleApplyPromo}
                      disabled={!promoCode}
                      className="bg-sky-500 hover:bg-sky-600 text-xs sm:text-sm px-3 sm:px-4"
                    >
                      Áp dụng
                    </Button>
                  </div>
                  {discount > 0 && (
                    <p className="text-green-600 text-[10px] sm:text-xs mt-2">✓ Mã giảm giá đã được áp dụng</p>
                  )}
                </div>

                {/* Checkout Button */}
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={async () => {
                      if (!user) {
                        setShowMessage(true);
                        setLoginModalOpen(true);
                      } else {
                        setIsNavigatingToCheckout(true);
                        await new Promise(resolve => setTimeout(resolve, 200));
                        router.push("/checkout");
                      }
                    }}
                    disabled={isNavigatingToCheckout}
                    className="w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white h-11 sm:h-12 text-sm sm:text-base font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isNavigatingToCheckout ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        <span>Đang chuyển...</span>
                      </>
                    ) : (
                      <>
                        <span>Tiến hành thanh toán</span>
                        <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                      </>
                    )}
                  </Button>
                </motion.div>

                {/* Security Badge */}
                <div className="flex items-center justify-center gap-2 mt-3 sm:mt-4 text-[10px] sm:text-xs text-gray-500">
                  <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                  <span>Bảo mật bởi Hoithoxanh</span>
                </div>
              </div>

              {/* Shipping Info */}
              {totalPrice < shippingThreshold && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-xl p-4"
                >
                  <div className="flex items-center gap-2 text-sm">
                    <Sparkles className="w-4 h-4 text-orange-500" />
                    <span className="text-orange-700">
                      Mua thêm {formatPrice(shippingThreshold - totalPrice)} để được miễn phí vận chuyển
                    </span>
                  </div>
                </motion.div>
              )}

              {/* Payment Methods */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <h4 className="font-semibold text-gray-900 mb-3 text-sm">Chấp nhận thanh toán</h4>
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="bg-gray-100 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-700">ZaloPay</div>
                  <div className="bg-gray-100 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-700">VietinBank</div>
                  <div className="bg-gray-100 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-700">TECHCOMBANK</div>
                  <div className="bg-gray-100 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-700">MB</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
      <Botchat />
      
      {/* Login Modal */}
      <LoginModal isOpen={loginModalOpen} onClose={() => setLoginModalOpen(false)} showMessage={showMessage} />
    </div>
  );
}
