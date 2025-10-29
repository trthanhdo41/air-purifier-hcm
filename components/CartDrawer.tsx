"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, ShoppingBag, Trash2, ArrowRight, Sparkles, Gift, Shield, Truck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/lib/stores/cart";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function CartDrawer() {
  const { 
    items, 
    isOpen, 
    closeCart, 
    updateQuantity, 
    removeItem, 
    getTotalItems, 
    getTotalPrice, 
    getTotalSavings 
  } = useCartStore();

  const drawerRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);

  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();
  const totalSavings = getTotalSavings();
  const shippingThreshold = 2000000;
  const shippingFee = totalPrice >= shippingThreshold ? 0 : 50000;
  const finalTotal = totalPrice + shippingFee;
  const isFreeShipping = totalPrice >= shippingThreshold;

  // Fix hydration error
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Handle click outside to close drawer
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && drawerRef.current && !drawerRef.current.contains(event.target as Node)) {
        closeCart();
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        closeCart();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
      // Prevent body scroll when drawer is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, closeCart]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Enhanced Backdrop with blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={closeCart}
          />

          {/* Enhanced Drawer */}
          <motion.div
            ref={drawerRef}
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ 
              type: "spring", 
              damping: 25, 
              stiffness: 200,
              duration: 0.4
            }}
            className="fixed right-2 top-20 h-[calc(100vh-5rem)] w-full max-w-md bg-white shadow-2xl z-50 flex flex-col rounded-2xl overflow-hidden"
          >
            {/* Enhanced Header */}
            <div className="bg-gradient-to-r from-sky-500 to-blue-600 text-white p-6 relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-4 right-4 w-20 h-20 rounded-full bg-white/20"></div>
                <div className="absolute bottom-4 left-4 w-16 h-16 rounded-full bg-white/20"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-white/10"></div>
              </div>
              
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"
                  >
                    <ShoppingBag className="w-5 h-5" />
                  </motion.div>
                  <div>
                    <h2 className="text-xl font-bold">Giỏ hàng</h2>
                    <p className="text-sm text-white/80">{isClient ? totalItems : 0} sản phẩm</p>
                  </div>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={closeCart}
                  className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </div>
            </div>

            {/* Enhanced Content */}
            <div className="flex-1 overflow-y-auto">
              {items.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center h-full p-8 text-center"
                >
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6"
                  >
                    <ShoppingBag className="w-12 h-12 text-gray-400" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Giỏ hàng trống</h3>
                  <p className="text-gray-600 mb-6">Hãy thêm sản phẩm vào giỏ hàng để tiếp tục</p>
                  <Button onClick={closeCart} className="bg-sky-500 hover:bg-sky-600">
                    Tiếp tục mua sắm
                  </Button>
                </motion.div>
              ) : (
                <div className="p-6 space-y-4">
                  {/* Enhanced Product Items */}
                  <AnimatePresence>
                    {items.map((item, index) => (
                      <motion.div
                        key={item.product.id}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50, scale: 0.8 }}
                        transition={{ 
                          delay: index * 0.1,
                          type: "spring",
                          damping: 20
                        }}
                        className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="flex gap-4">
                          {/* Enhanced Product Image */}
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="relative w-20 h-20 bg-gray-50 rounded-lg overflow-hidden shrink-0"
                          >
                            <Image
                              src={item.product.image}
                              alt={item.product.name}
                              fill
                              className="object-cover"
                            />
                            {item.product.discount && (
                              <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                                -{item.product.discount}%
                              </div>
                            )}
                          </motion.div>

                          {/* Enhanced Product Info */}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 text-sm leading-tight mb-1 line-clamp-2">
                              {item.product.name}
                            </h3>
                            <p className="text-xs text-gray-600 mb-2">{item.product.brand}</p>
                            
                            {/* Enhanced Price */}
                            <div className="flex items-center gap-2 mb-3">
                              <span className="font-bold text-sky-600 text-sm">
                                {formatPrice(item.product.price)}
                              </span>
                              {item.product.originalPrice && item.product.originalPrice > item.product.price && (
                                <span className="text-xs text-gray-500 line-through">
                                  {formatPrice(item.product.originalPrice)}
                                </span>
                              )}
                            </div>

                            {/* Enhanced Quantity Controls */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                  className="w-7 h-7 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
                                >
                                  <Minus className="w-3 h-3" />
                                </motion.button>
                                
                                <span className="w-8 text-center font-semibold text-sm">
                                  {item.quantity}
                                </span>
                                
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                  className="w-7 h-7 bg-sky-100 hover:bg-sky-200 rounded-full flex items-center justify-center transition-colors"
                                >
                                  <Plus className="w-3 h-3 text-sky-600" />
                                </motion.button>
                              </div>

                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => removeItem(item.product.id)}
                                className="w-7 h-7 bg-red-50 hover:bg-red-100 rounded-full flex items-center justify-center transition-colors"
                              >
                                <Trash2 className="w-3 h-3 text-red-500" />
                              </motion.button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Enhanced Footer */}
            {items.length > 0 && (
              <motion.div
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                transition={{ type: "spring", damping: 25 }}
                className="border-t border-gray-200 bg-white p-6 space-y-4"
              >
                {/* Enhanced Summary */}
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tạm tính:</span>
                    <span className="font-medium">{formatPrice(totalPrice)}</span>
                  </div>
                  
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
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 flex items-center gap-1">
                      <Truck className="w-3 h-3" />
                      Phí vận chuyển:
                    </span>
                    <span className={`font-medium ${isFreeShipping ? 'text-green-600' : ''}`}>
                      {isFreeShipping ? 'Miễn phí' : formatPrice(shippingFee)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-3">
                    <span>Tổng cộng:</span>
                    <span className="text-sky-600">{formatPrice(finalTotal)}</span>
                  </div>
                  
                  {!isFreeShipping && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-lg p-3"
                    >
                      <div className="flex items-center gap-2 text-sm">
                        <Sparkles className="w-4 h-4 text-orange-500" />
                        <span className="text-orange-700">
                          Mua thêm {formatPrice(shippingThreshold - totalPrice)} để được miễn phí vận chuyển
                        </span>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Enhanced Action Buttons */}
                <div className="space-y-3">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button 
                      asChild
                      className="w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all"
                    >
                      <Link href="/checkout" onClick={closeCart}>
                        <span>Thanh toán ngay</span>
                        <ArrowRight className="w-5 h-5" />
                      </Link>
                    </Button>
                  </motion.div>
                  
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button 
                      variant="outline" 
                      className="w-full h-10 border-gray-300 hover:border-sky-400 hover:text-sky-600 transition-colors"
                      onClick={closeCart}
                    >
                      Tiếp tục mua sắm
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}