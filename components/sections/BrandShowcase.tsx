"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import FadeInWhenVisible from "@/components/animations/FadeInWhenVisible";
import { createClient } from "@/lib/supabase/client";

export default function BrandShowcase() {
  const [brands, setBrands] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBrands = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('products')
          .select('brand')
          .eq('status', 'active');
        
        if (!error && data && data.length > 0) {
          const uniqueBrands = Array.from(new Set(data.map(p => p.brand).filter(Boolean))) as string[];
          setBrands(uniqueBrands.sort().slice(0, 12));
        } else {
          setBrands([]);
        }
      } catch (e) {
        console.error('Error loading brands:', e);
        setBrands([]);
      } finally {
        setLoading(false);
      }
    };

    loadBrands();
  }, []);

  const featuredBrands = brands;

  if (loading) {
    return (
      <section className="py-16">
        <div className="text-center mb-12">
          <div className="h-10 bg-gray-200 rounded w-64 mx-auto mb-4 animate-pulse" />
          <div className="h-6 bg-gray-200 rounded w-96 mx-auto animate-pulse" />
        </div>
        <div className="flex gap-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex-shrink-0 w-40 h-24 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  if (brands.length === 0) {
    return null;
  }

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

