"use client";

import { motion } from "framer-motion";
import { Shield, Truck, DollarSign, Headphones, Award, RefreshCcw } from "lucide-react";
import FadeInWhenVisible from "@/components/animations/FadeInWhenVisible";

export default function WhyChooseUs() {
  const features = [
    {
      icon: Shield,
      title: "100% Chính hãng",
      description: "Cam kết sản phẩm chính hãng, xuất hóa đơn VAT đầy đủ",
      color: "from-red-500 to-red-600",
      stats: "100%",
    },
    {
      icon: Truck,
      title: "Giao hàng 2H",
      description: "Giao nhanh trong 2 giờ tại nội thành HCM & HN",
      color: "from-blue-500 to-blue-600",
      stats: "2 giờ",
    },
    {
      icon: DollarSign,
      title: "Giá tốt nhất",
      description: "Cam kết giá tốt nhất thị trường, hoàn tiền nếu rẻ hơn",
      color: "from-green-500 to-green-600",
      stats: "Tốt nhất",
    },
    {
      icon: RefreshCcw,
      title: "Đổi trả 30 ngày",
      description: "Chính sách đổi trả linh hoạt trong vòng 30 ngày",
      color: "from-purple-500 to-purple-600",
      stats: "30 ngày",
    },
    {
      icon: Award,
      title: "Bảo hành dài hạn",
      description: "Bảo hành chính hãng tới 24 tháng cho mọi sản phẩm",
      color: "from-orange-500 to-orange-600",
      stats: "24 tháng",
    },
    {
      icon: Headphones,
      title: "Hỗ trợ 24/7",
      description: "Đội ngũ tư vấn chuyên nghiệp, hỗ trợ mọi lúc mọi nơi",
      color: "from-pink-500 to-pink-600",
      stats: "24/7",
    },
  ];

  return (
    <section className="py-20 bg-white relative overflow-hidden">
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(#dc2626 1px, transparent 1px), linear-gradient(90deg, #dc2626 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <FadeInWhenVisible>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-display text-gray-900 mb-4">
              Tại sao chọn chúng tôi?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Chúng tôi cam kết mang đến trải nghiệm mua sắm tốt nhất với những giá trị vượt trội
            </p>
          </div>
        </FadeInWhenVisible>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FadeInWhenVisible key={feature.title} delay={index * 0.1}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="group relative bg-white rounded-3xl p-8 shadow-soft hover:shadow-large transition-all duration-300 border border-gray-100/50 overflow-hidden"
              >
                {/* Gradient background on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

                {/* Icon */}
                <motion.div
                  whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                  transition={{ duration: 0.5 }}
                  className={`relative w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl transition-shadow`}
                >
                  <feature.icon className="w-8 h-8 text-white" />
                </motion.div>

                {/* Stats badge */}
                <div className="absolute top-6 right-6 bg-gray-900 text-white px-3 py-1.5 rounded-full text-xs font-bold">
                  {feature.stats}
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-red-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>

                {/* Decorative element */}
                <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tl from-gray-50 to-transparent rounded-tl-full" />
              </motion.div>
            </FadeInWhenVisible>
          ))}
        </div>

        {/* CTA Section */}
        <FadeInWhenVisible delay={0.6}>
          <div className="mt-16 text-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="inline-block"
            >
              <a
                href="#products"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-red-600 to-orange-600 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl-colored hover:shadow-2xl transition-all"
              >
                Khám phá sản phẩm ngay
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  →
                </motion.span>
              </a>
            </motion.div>
          </div>
        </FadeInWhenVisible>
      </div>
    </section>
  );
}

