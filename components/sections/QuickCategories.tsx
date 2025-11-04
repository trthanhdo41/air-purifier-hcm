"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import * as LucideIcons from "lucide-react";

export default function QuickCategories() {
  const [activeTab, setActiveTab] = useState<string>("noi-bat");
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('name');
        
        if (!error && data && data.length > 0) {
          // Map icon names to actual icon components
          const mappedCategories = data.map(cat => {
            const IconName = cat.icon || 'Wind';
            const IconComponent = (LucideIcons as any)[IconName] || LucideIcons.Wind;
            return {
              ...cat,
              Icon: IconComponent
            };
          });
          setCategories(mappedCategories);
        } else {
          setCategories([]);
        }
      } catch (e) {
        console.error('Error loading categories:', e);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  const handleTabClick = (tabId: string, categoryId?: string) => {
    setActiveTab(tabId);
    
    // Scroll to products section
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

    // Save to sessionStorage for CategoryTabs to use
    if (typeof window !== 'undefined') {
      try {
        if (tabId === "cong-nghe") {
          sessionStorage.setItem('productTab', 'cong-nghe');
        } else if (tabId === "dien-tich") {
          sessionStorage.setItem('productTab', 'dien-tich');
        } else if (tabId === "phu-kien") {
          sessionStorage.setItem('productTab', 'dac-biet');
        }
        
        if (categoryId) {
          sessionStorage.setItem('productCategory', categoryId);
        }
      } catch (e) {
        // Ignore storage errors
      }
    }
  };

  // Get top 6 categories (technology-based) for quick access
  // Filter based on category IDs that match backend structure
  const technologyCategoryIds = [
    "may-loc-hepa", 
    "may-loc-ion", 
    "may-loc-carbon", 
    "may-loc-uv"
  ];
  
  const smartCategoryIds = [
    "may-loc-khong-khi-thong-minh"
  ];
  
  const areaCategoryIds = [
    "may-loc-phong-nho"
  ];
  
  // Get categories that match technology categories first, then smart, then area
  const quickCats = [
    ...categories.filter(cat => technologyCategoryIds.includes(cat.id)),
    ...categories.filter(cat => smartCategoryIds.includes(cat.id)),
    ...categories.filter(cat => areaCategoryIds.includes(cat.id))
  ].slice(0, 6);

  return (
    <div className="bg-gradient-to-r from-sky-400 to-sky-300 py-6 sm:py-8">
      <div className="container mx-auto px-3 sm:px-4">
        {/* 4 Tabs - Mobile Optimized */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-6 sm:mb-8">
          <button 
            onClick={() => handleTabClick("noi-bat")}
            className={`px-3 sm:px-6 py-2 sm:py-3 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              activeTab === "noi-bat"
                ? "bg-sky-500 text-white"
                : "text-white hover:bg-sky-500"
            }`}
          >
            Nổi bật
          </button>
          <button 
            onClick={() => handleTabClick("cong-nghe")}
            className={`px-3 sm:px-6 py-2 sm:py-3 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              activeTab === "cong-nghe"
                ? "bg-sky-500 text-white"
                : "text-white hover:bg-sky-500"
            }`}
          >
            Công nghệ
          </button>
          <button 
            onClick={() => handleTabClick("dien-tich")}
            className={`px-3 sm:px-6 py-2 sm:py-3 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              activeTab === "dien-tich"
                ? "bg-sky-500 text-white"
                : "text-white hover:bg-sky-500"
            }`}
          >
            Diện tích
          </button>
          <button 
            onClick={() => handleTabClick("phu-kien")}
            className={`px-3 sm:px-6 py-2 sm:py-3 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              activeTab === "phu-kien"
                ? "bg-sky-500 text-white"
                : "text-white hover:bg-sky-500"
            }`}
          >
            Phụ kiện
          </button>
        </div>

        {/* Quick Category Icons - Mobile Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:flex sm:items-center sm:justify-center gap-4 sm:gap-6 md:gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/50 rounded-full" />
                <div className="w-20 h-4 bg-white/50 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:flex sm:items-center sm:justify-center gap-4 sm:gap-6 md:gap-8">
            {quickCats.map((cat) => {
              const IconComponent = cat.Icon || LucideIcons.Wind;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleTabClick("cong-nghe", cat.id)}
                  className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 text-white hover:scale-105 sm:hover:scale-110 active:scale-95 transition-all duration-200 group p-3 sm:p-0 rounded-lg sm:rounded-none hover:bg-sky-500/20 sm:hover:bg-transparent cursor-pointer"
                >
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-full flex items-center justify-center group-hover:shadow-xl group-hover:bg-sky-50 transition-all shrink-0">
                    <IconComponent className="w-6 h-6 sm:w-7 sm:h-7 text-sky-500 group-hover:scale-110 transition-transform" />
                  </div>
                  <span className="text-xs sm:text-sm font-medium group-hover:underline text-center sm:text-left">{cat.name}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

