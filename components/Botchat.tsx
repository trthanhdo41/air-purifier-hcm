"use client";

import { useState } from "react";
import { MessageCircle, X, Send, Headphones, Bot, Package, Tag, Settings } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Botchat() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");

  return (
    <>
      {/* Chat Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-24 right-8 z-50 bg-gradient-to-r from-sky-500 to-sky-600 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transition-all"
        whileHover={{ scale: 1.15, transition: { duration: 0.15 } }}
        whileTap={{ scale: 0.85, transition: { duration: 0.1 } }}
        animate={{ 
          boxShadow: isOpen 
            ? "0 20px 40px rgba(14, 165, 233, 0.4)" 
            : ["0 10px 30px rgba(14, 165, 233, 0.3)", "0 15px 40px rgba(14, 165, 233, 0.5)", "0 10px 30px rgba(14, 165, 233, 0.3)"]
        }}
        transition={{
          boxShadow: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }
        }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <MessageCircle className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Liên hệ Button */}
      <motion.a
        href="tel:18002097"
        className="fixed bottom-8 right-8 z-50 bg-gradient-to-r from-sky-500 to-blue-600 text-white px-6 py-3 rounded-full shadow-2xl hover:shadow-3xl transition-all flex items-center gap-2 font-semibold"
        whileHover={{ scale: 1.1, y: -2, transition: { duration: 0.1, ease: "easeOut" } }}
        whileTap={{ scale: 0.9, transition: { duration: 0.05, ease: "easeOut" } }}
        animate={{
          boxShadow: ["0 10px 30px rgba(14, 165, 233, 0.3)", "0 15px 40px rgba(59, 130, 246, 0.5)", "0 10px 30px rgba(14, 165, 233, 0.3)"]
        }}
        transition={{
          boxShadow: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }
        }}
      >
        <motion.div
          animate={{ rotate: [0, -12, 12, -12, 12, 0] }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            repeatDelay: 2
          }}
        >
          <Headphones className="w-5 h-5" />
        </motion.div>
        Liên hệ
      </motion.a>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-40 right-8 z-40 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-sky-500 to-sky-400 text-white p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                  <Bot className="w-6 h-6 text-sky-500" />
                </div>
                <div>
                  <h3 className="font-bold">Hỗ trợ trực tuyến</h3>
                  <p className="text-xs opacity-90">Chúng tôi luôn sẵn sàng hỗ trợ</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="h-80 overflow-y-auto p-4 bg-gray-50">
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-sky-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-sky-500" />
                  </div>
                  <div className="bg-white rounded-lg rounded-tl-none p-3 shadow-sm max-w-[80%]">
                    <p className="text-sm text-gray-700">
                      Xin chào! Tôi có thể giúp gì cho bạn?
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-sky-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-sky-500" />
                  </div>
                  <div className="bg-white rounded-lg rounded-tl-none p-3 shadow-sm max-w-[80%]">
                    <p className="text-sm text-gray-700 mb-2">
                      Bạn quan tâm đến:
                    </p>
                    <div className="space-y-2">
                      <motion.button 
                        className="block w-full text-left text-sm bg-gradient-to-r from-sky-50 to-blue-50 hover:from-sky-100 hover:to-blue-100 rounded-lg px-3 py-2 transition-all flex items-center gap-2 border border-sky-200 hover:border-sky-400 hover:shadow-md"
                        whileHover={{ scale: 1.02, x: 3, transition: { duration: 0.15 } }}
                        whileTap={{ scale: 0.98, transition: { duration: 0.1 } }}
                      >
                        <Package className="w-4 h-4 text-sky-600" /> Tra cứu đơn hàng
                      </motion.button>
                      <motion.button 
                        className="block w-full text-left text-sm bg-gradient-to-r from-orange-50 to-red-50 hover:from-orange-100 hover:to-red-100 rounded-lg px-3 py-2 transition-all flex items-center gap-2 border border-orange-200 hover:border-orange-400 hover:shadow-md"
                        whileHover={{ scale: 1.02, x: 3, transition: { duration: 0.15 } }}
                        whileTap={{ scale: 0.98, transition: { duration: 0.1 } }}
                      >
                        <Tag className="w-4 h-4 text-orange-600" /> Khuyến mãi hot
                      </motion.button>
                      <motion.button 
                        className="block w-full text-left text-sm bg-gradient-to-r from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 rounded-lg px-3 py-2 transition-all flex items-center gap-2 border border-emerald-200 hover:border-emerald-400 hover:shadow-md"
                        whileHover={{ scale: 1.02, x: 3, transition: { duration: 0.15 } }}
                        whileTap={{ scale: 0.98, transition: { duration: 0.1 } }}
                      >
                        <Settings className="w-4 h-4 text-emerald-600" /> Bảo hành sản phẩm
                      </motion.button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-gray-200">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Viết câu hỏi của bạn tại đây"
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition-all hover:border-sky-300"
                />
                <motion.button 
                  className="bg-gradient-to-r from-sky-500 to-blue-600 text-white p-2 rounded-lg hover:shadow-lg transition-all"
                  whileHover={{ scale: 1.1, transition: { duration: 0.15 } }}
                  whileTap={{ scale: 0.9, transition: { duration: 0.1 } }}
                >
                  <Send className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

