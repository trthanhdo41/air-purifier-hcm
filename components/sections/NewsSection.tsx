"use client";

import { Clock, ArrowRight } from "lucide-react";
import Image from "next/image";

export default function NewsSection() {
  const news = [
    {
      id: 1,
      title: "Review máy lọc không khí Xiaomi Mi Air Purifier 4 Lite có tốt không?",
      image: "https://nvs.tn-cdn.net/2022/03/May-loc-khong-khi-Xiaomi-Air-Purifier-4-Lite-thumb.jpg",
      date: "3 ngày trước"
    },
    {
      id: 2,
      title: "So sánh máy lọc không khí Sharp vs Philips: Nên chọn thương hiệu nào?",
      image: "https://bizweb.dktcdn.net/100/021/944/files/techwear-review-may-loc-khong-khi-xiaomi-mi-air-purifier-3h-3.jpg?v=1584699332498",
      date: "1 tuần trước"
    },
    {
      id: 3,
      title: "Hướng dẫn chọn máy lọc không khí phù hợp với diện tích phòng",
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQoKYa-HLhd8yDGo6-HcSzmawDRNN3NHNi9-WY1FQk0VCrWZKex4RG0j3VTuQj7Xqm7pqU&usqp=CAU",
      date: "2 tuần trước"
    },
    {
      id: 4,
      title: "Công nghệ HEPA vs Ion: Máy lọc không khí nào hiệu quả hơn?",
      image: "https://nvs.tn-cdn.net/2022/03/May-loc-khong-khi-Xiaomi-Air-Purifier-4-Lite-thumb.jpg",
      date: "3 tuần trước"
    },
    {
      id: 5,
      title: "Top 5 máy lọc không khí tốt nhất 2024 cho gia đình Việt",
      image: "https://bizweb.dktcdn.net/100/021/944/files/techwear-review-may-loc-khong-khi-xiaomi-mi-air-purifier-3h-3.jpg?v=1584699332498",
      date: "1 tháng trước"
    }
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">Tin tức sản phẩm</h3>
        <button className="text-sky-500 hover:text-sky-600 text-sm font-semibold flex items-center gap-1 group transition-all">
          Xem tất cả
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      <div className="space-y-4">
        {news.map((item) => (
          <a
            key={item.id}
            href="#"
            className="flex gap-3 group hover:bg-gray-50 p-2 rounded-lg transition-all duration-200"
          >
            <div className="relative w-24 h-20 flex-shrink-0 rounded-lg overflow-hidden">
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-300"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-gray-900 line-clamp-2 mb-2 group-hover:text-sky-500 transition-colors">
                {item.title}
              </h4>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                <span>{item.date}</span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

