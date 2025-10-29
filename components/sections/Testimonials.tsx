"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import FadeInWhenVisible from "@/components/animations/FadeInWhenVisible";

export default function Testimonials() {
  const testimonials = [
    {
      name: "Nguyễn Minh Anh",
      role: "Chủ nhà hàng",
      avatar: "👨‍💼",
      rating: 5,
      content: "Sản phẩm chất lượng tuyệt vời! Tôi đã mua robot hút bụi Roborock và nó hoạt động vượt ngoài mong đợi. Nhân viên tư vấn rất chuyên nghiệp và nhiệt tình.",
      product: "Robot hút bụi Roborock S8 Pro Ultra",
    },
    {
      name: "Trần Thị Hương",
      role: "Nội trợ",
      avatar: "👩",
      rating: 5,
      content: "Nồi chiên không dầu Philips mua ở đây rất tốt, giao hàng nhanh chóng. Gia đình tôi rất hài lòng với chất lượng sản phẩm và dịch vụ hậu mãi.",
      product: "Nồi chiên không dầu Philips HD9252",
    },
    {
      name: "Lê Văn Tâm",
      role: "Kỹ sư IT",
      avatar: "👨‍💻",
      rating: 5,
      content: "Giá cả cạnh tranh, nhiều ưu đãi. Tôi đã giới thiệu cho bạn bè và đều nhận được phản hồi tích cực. Sẽ tiếp tục ủng hộ shop!",
      product: "Máy lọc không khí Xiaomi Mi Air Purifier 4 Pro",
    },
    {
      name: "Phạm Thu Hà",
      role: "Giám đốc Marketing",
      avatar: "👩‍💼",
      rating: 5,
      content: "Dịch vụ tuyệt vời từ lúc đặt hàng đến khi nhận sản phẩm. Bảo hành chính hãng, yên tâm sử dụng lâu dài. Rất đáng để mua sắm!",
      product: "Máy sấy tóc Dyson Supersonic",
    },
  ];

  return (
    <section className="py-20 bg-gray-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-red-100 rounded-full blur-3xl opacity-20" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-20" />

      <div className="container mx-auto px-4 relative z-10">
        <FadeInWhenVisible>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-display text-gray-900 mb-4">
              Khách hàng nói gì về chúng tôi
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Hơn 50,000+ khách hàng tin tưởng và hài lòng với sản phẩm, dịch vụ của chúng tôi
            </p>
          </div>
        </FadeInWhenVisible>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((testimonial, index) => (
            <FadeInWhenVisible key={testimonial.name} delay={index * 0.1}>
              <motion.div
                whileHover={{ y: -4 }}
                className="bg-white rounded-2xl p-6 shadow-soft hover:shadow-large transition-all duration-300 relative group"
              >
                {/* Quote icon */}
                <div className="absolute -top-3 -left-3 w-12 h-12 bg-red-600 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Quote className="w-6 h-6 text-white" />
                </div>

                {/* Rating */}
                <div className="flex gap-1 mb-4 mt-2">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                {/* Content */}
                <p className="text-gray-700 text-sm mb-4 leading-relaxed italic">
                  &ldquo;{testimonial.content}&rdquo;
                </p>

                {/* Product */}
                <div className="text-xs text-gray-500 mb-4 bg-gray-50 px-3 py-2 rounded-lg">
                  📦 {testimonial.product}
                </div>

                {/* Author */}
                <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-orange-100 rounded-full flex items-center justify-center text-2xl">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">{testimonial.name}</div>
                    <div className="text-xs text-gray-500">{testimonial.role}</div>
                  </div>
                </div>
              </motion.div>
            </FadeInWhenVisible>
          ))}
        </div>

        {/* Trust badge */}
        <FadeInWhenVisible delay={0.4}>
          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-3 bg-white px-6 py-4 rounded-2xl shadow-soft">
              <div className="flex -space-x-2">
                {['👨', '👩', '👨‍💼', '👩‍💼'].map((emoji, i) => (
                  <div key={i} className="w-10 h-10 bg-gradient-to-br from-red-100 to-orange-100 rounded-full flex items-center justify-center text-xl border-2 border-white">
                    {emoji}
                  </div>
                ))}
              </div>
              <div className="text-left">
                <div className="font-bold text-gray-900">50,000+ khách hàng hài lòng</div>
                <div className="text-sm text-gray-600">Đánh giá trung bình 4.8/5 ⭐</div>
              </div>
            </div>
          </div>
        </FadeInWhenVisible>
      </div>
    </section>
  );
}

