"use client";

import { motion } from "framer-motion";
import { brands } from "@/data/categories";
import FadeInWhenVisible from "@/components/animations/FadeInWhenVisible";

export default function BrandShowcase() {
  const featuredBrands = brands.slice(0, 12);

  return (
    <section className="py-16">
      <FadeInWhenVisible>
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-display text-gray-900 mb-4">
            Thương hiệu đẳng cấp thế giới
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Chúng tôi tự hào là đối tác ủy quyền chính thức của các thương hiệu hàng đầu toàn cầu
          </p>
        </div>
      </FadeInWhenVisible>

      <div className="relative overflow-hidden">
        {/* Gradient overlays */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-gray-50 to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-gray-50 to-transparent z-10" />

        {/* Infinite scroll animation */}
        <motion.div 
          className="flex gap-8"
          animate={{
            x: [0, -1400],
          }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 30,
              ease: "linear",
            },
          }}
        >
          {[...featuredBrands, ...featuredBrands, ...featuredBrands].map((brand, index) => (
            <div
              key={`${brand}-${index}`}
              className="flex-shrink-0 w-40 h-24 bg-white rounded-2xl shadow-soft border border-gray-100/50 flex items-center justify-center font-bold text-xl text-gray-800 hover:shadow-large transition-shadow"
            >
              {brand}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

