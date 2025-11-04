"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Settings, Save } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    siteName: "Hơi Thở Xanh",
    siteDescription: "Máy lọc không khí cao cấp",
    email: "info@hoithoxanh.com",
    phone: "1800 2097",
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Cài đặt</h1>
        <p className="text-gray-600 mt-1">Quản lý cài đặt hệ thống</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200"
      >
        <div className="p-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tên website
              </label>
              <input
                type="text"
                value={settings.siteName}
                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Mô tả website
              </label>
              <input
                type="text"
                value={settings.siteDescription}
                onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email liên hệ
              </label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Số điện thoại
              </label>
              <input
                type="tel"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none"
              />
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-200">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white flex items-center gap-2">
                  <Save className="w-5 h-5" />
                  Lưu cài đặt
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

