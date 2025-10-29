"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import NewsSection from "./NewsSection";
import { motion, AnimatePresence } from "framer-motion";

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "Máy lọc không khí có giao hàng nhanh 2H không?",
      answer: "Có. Chúng tôi hỗ trợ giao hàng hỏa tốc trong 2H cho khu vực nội thành TP.HCM. Đơn hàng từ 500K được miễn phí vận chuyển."
    },
    {
      question: "Bảo hành máy lọc không khí tại cửa hàng thế nào?",
      answer: "Tất cả máy lọc không khí đều được bảo hành chính hãng từ 12-24 tháng tùy theo từng thương hiệu. Chúng tôi cam kết hỗ trợ bảo hành nhanh chóng và chu đáo."
    },
    {
      question: "Mua máy lọc không khí được ưu đãi những gì?",
      answer: "Khách hàng được hưởng nhiều ưu đãi: Giảm giá trực tiếp, trả góp 0%, thu cũ đổi mới, tặng voucher, miễn phí vận chuyển. Đặc biệt có chương trình khuyến mãi định kỳ với mức giảm lên đến 30%."
    },
    {
      question: "Mua máy lọc không khí ở đâu chính hãng, giá rẻ?",
      answer: "Chúng tôi là địa chỉ uy tín tại TP.HCM chuyên về máy lọc không khí. Cam kết 100% hàng chính hãng, giá cạnh tranh nhất thị trường, chính sách bảo hành và đổi trả linh hoạt."
    },
    {
      question: "Máy lọc không khí nào phù hợp với phòng 20m²?",
      answer: "Với phòng 20m², bạn nên chọn máy có CADR từ 150-200 m³/h. Các dòng phù hợp: Xiaomi Mi Air Purifier 3C, Sharp FP-F40E-W, hoặc Panasonic F-PXH55A."
    },
    {
      question: "Bao lâu thì thay bộ lọc máy lọc không khí?",
      answer: "Tần suất thay bộ lọc phụ thuộc vào mức độ sử dụng và chất lượng không khí. Thông thường: Bộ lọc HEPA 6-12 tháng, bộ lọc Carbon 3-6 tháng, bộ lọc UV 12-18 tháng."
    }
  ];

  return (
    <div className="bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-8 text-gray-900">Câu hỏi thường gặp về máy lọc không khí</h2>
        
        <div className="grid lg:grid-cols-[1fr,380px] gap-8">
          {/* FAQ Left Column */}
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition-all duration-200"
                initial={false}
              >
                <motion.button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors group"
                  whileHover={{ scale: 1.005 }}
                  whileTap={{ scale: 0.998 }}
                  transition={{ duration: 0.05 }}
                >
                  <span className="font-semibold text-gray-900 pr-4 group-hover:text-sky-500 transition-colors">{faq.question}</span>
                  <motion.div
                    animate={{ rotate: openIndex === index ? 180 : 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                  >
                    <ChevronDown 
                      className="w-5 h-5 text-gray-600 flex-shrink-0 group-hover:text-sky-500" 
                    />
                  </motion.div>
                </motion.button>
                <AnimatePresence initial={false}>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ 
                        height: { duration: 0.2, ease: "easeInOut" },
                        opacity: { duration: 0.15, ease: "easeInOut" }
                      }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 text-gray-700 leading-relaxed border-t border-gray-100 pt-4">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>

          {/* News Right Column */}
          <div className="hidden lg:block">
            <NewsSection />
          </div>
        </div>
      </div>
    </div>
  );
}

