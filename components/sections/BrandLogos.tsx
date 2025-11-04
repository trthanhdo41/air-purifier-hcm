"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export default function BrandLogos() {
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
          // Lấy unique brands từ products
          const uniqueBrands = Array.from(new Set(data.map(p => p.brand).filter(Boolean))) as string[];
          setBrands(uniqueBrands.sort());
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

  const handleBrandClick = (brand: string) => {
    // Scroll to products section và filter theo brand
    setTimeout(() => {
      const productsSection = document.getElementById('san-pham');
      if (productsSection) {
        const headerOffset = 150;
        const rect = productsSection.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const y = rect.top + scrollTop - headerOffset;
        window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
      }
    }, 100);

    // Save brand filter to sessionStorage
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem('selectedBrand', brand);
        // Trigger a custom event để CategoryTabs có thể lắng nghe
        window.dispatchEvent(new CustomEvent('brandFilterChange', { detail: { brand } }));
      } catch (e) {
        // Ignore storage errors
      }
    }
  };

  if (loading) {
    return (
      <div className="bg-white py-6">
        <div className="container mx-auto px-4">
          <h2 className="text-xl font-bold mb-6 text-gray-900">Thương hiệu máy lọc không khí</h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-3 mb-6">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-lg h-14 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (brands.length === 0) {
    return null;
  }

  return (
    <div className="bg-white py-6">
      <div className="container mx-auto px-4">
        <h2 className="text-xl font-bold mb-6 text-gray-900">Thương hiệu máy lọc không khí</h2>
        
        {/* Brand Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-3 mb-6">
          {brands.map((brand) => (
            <button
              key={brand}
              onClick={() => handleBrandClick(brand)}
              className="bg-white border border-gray-200 rounded-lg px-4 py-3 hover:border-sky-400 hover:shadow-lg hover:-translate-y-1 active:translate-y-0 transition-all duration-200 flex items-center justify-center text-center group cursor-pointer"
            >
              <span className="font-semibold text-sm group-hover:text-sky-500 transition-colors text-gray-900">
                {brand}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

