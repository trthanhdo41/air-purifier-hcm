"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Search, Mail, Phone, Calendar } from "lucide-react";

export default function ContactsPage() {
  const [messages] = useState([]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Tin nhắn liên hệ</h1>
        <p className="text-gray-600 mt-1">Xem và quản lý tin nhắn từ khách hàng</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200"
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm tin nhắn..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none"
              />
            </div>
          </div>
        </div>

        <div className="p-6">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Chưa có tin nhắn</h3>
              <p className="text-gray-600">Chưa có tin nhắn liên hệ nào</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Messages list will go here */}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

