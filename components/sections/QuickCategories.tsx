"use client";

import { Wind, Zap, Shield, Droplets, Activity, Home } from "lucide-react";

export default function QuickCategories() {
  const quickCats = [
    { name: "Máy lọc HEPA", Icon: Wind, id: "may-loc-hepa" },
    { name: "Máy lọc Ion", Icon: Zap, id: "may-loc-ion" },
    { name: "Máy lọc Carbon", Icon: Shield, id: "may-loc-carbon" },
    { name: "Máy lọc UV", Icon: Droplets, id: "may-loc-uv" },
    { name: "Máy lọc thông minh", Icon: Activity, id: "may-loc-thong-minh" },
    { name: "Phòng nhỏ", Icon: Home, id: "phong-nho" },
  ];

  return (
    <div className="bg-gradient-to-r from-sky-400 to-sky-300 py-6 sm:py-8">
      <div className="container mx-auto px-3 sm:px-4">
        {/* 4 Tabs - Mobile Optimized */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-6 sm:mb-8">
          <button className="bg-sky-500 text-white px-3 sm:px-6 py-2 sm:py-3 rounded-lg text-xs sm:text-sm font-semibold hover:bg-sky-600 transition-all">
            Nổi bật
          </button>
          <button className="text-white px-3 sm:px-6 py-2 sm:py-3 rounded-lg text-xs sm:text-sm font-semibold hover:bg-sky-500 transition-all">
            Công nghệ
          </button>
          <button className="text-white px-3 sm:px-6 py-2 sm:py-3 rounded-lg text-xs sm:text-sm font-semibold hover:bg-sky-500 transition-all">
            Diện tích
          </button>
          <button className="text-white px-3 sm:px-6 py-2 sm:py-3 rounded-lg text-xs sm:text-sm font-semibold hover:bg-sky-500 transition-all">
            Phụ kiện
          </button>
        </div>

        {/* Quick Category Icons - Mobile Grid */}
        <div className="grid grid-cols-2 sm:flex sm:items-center sm:justify-center gap-4 sm:gap-6 md:gap-8">
          {quickCats.map((cat) => {
            const IconComponent = cat.Icon;
            return (
              <button
                key={cat.id}
                className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 text-white hover:scale-105 sm:hover:scale-110 active:scale-95 transition-all duration-200 group p-3 sm:p-0 rounded-lg sm:rounded-none hover:bg-sky-500/20 sm:hover:bg-transparent"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-full flex items-center justify-center group-hover:shadow-xl group-hover:bg-sky-50 transition-all shrink-0">
                  <IconComponent className="w-6 h-6 sm:w-7 sm:h-7 text-sky-500 group-hover:scale-110 transition-transform" />
                </div>
                <span className="text-xs sm:text-sm font-medium group-hover:underline text-center sm:text-left">{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

