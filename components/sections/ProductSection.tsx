"use client";

import { products } from "@/data/products";
import ProductCard from "@/components/ProductCard";
import { ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

interface ProductSectionProps {
  title: string;
  categoryIds: string[];
  bgColor?: string;
  bannerImage?: string;
  bannerText?: string;
}

export default function ProductSection({ 
  title, 
  categoryIds,
  bgColor = "bg-gradient-to-r from-red-600 to-red-500",
  bannerImage,
  bannerText
}: ProductSectionProps) {
  const sectionProducts = products.filter(p => categoryIds.includes(p.category));
  const displayProducts = sectionProducts.slice(0, 10); // Hiển thị 10 sản phẩm đầu

  return (
    <section className="mb-8">
      {/* Header */}
      <div className={`${bgColor} px-6 py-3 rounded-t-xl`}>
        <div className="flex items-center justify-between">
          <h2 className="text-white font-bold text-xl uppercase tracking-wide">
            {title}
          </h2>
          <button className="text-white/90 hover:text-white text-sm font-medium flex items-center gap-1 group">
            Xem tất cả
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white border border-gray-200 border-t-0 rounded-b-xl p-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {displayProducts.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} compact />
          ))}
          
          {/* Banner nếu có */}
          {bannerImage && (
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="hidden xl:block xl:col-span-1"
            >
              <div className="relative h-full min-h-[400px] rounded-xl overflow-hidden group cursor-pointer">
                <img 
                  src={bannerImage} 
                  alt={bannerText || "Banner"}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {bannerText && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                    <p className="text-white font-bold text-lg">{bannerText}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>
        
        {/* Xem thêm button */}
        {sectionProducts.length > 10 && (
          <div className="text-center mt-6">
            <button className="text-red-600 font-semibold hover:text-red-700 border-2 border-red-600 hover:border-red-700 px-8 py-3 rounded-lg transition-all hover:bg-red-50">
              Xem thêm {sectionProducts.length - 10} sản phẩm
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

