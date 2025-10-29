"use client";

import { useState, useEffect } from "react";
import { categories } from "@/data/categories";
import { products as fallbackProducts } from "@/data/products";
import ProductCard from "@/components/ProductCard";
import { motion } from "framer-motion";
import { Star, Flame, TrendingUp, TrendingDown, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function CategoryTabs() {
  const [activeTab, setActiveTab] = useState<"cong-nghe" | "dien-tich" | "dac-biet">("cong-nghe");
  const [activeSubCategory, setActiveSubCategory] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("popular");
  const [products, setProducts] = useState(fallbackProducts);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const supabase = createClient();
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('status', 'active')
          .order('created_at', { ascending: false });
        if (!error && data && data.length > 0) {
          setProducts(data as any);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Category groups
  const categoryGroups = {
    "cong-nghe": {
      name: "Công nghệ lọc",
      categoryIds: ["may-loc-hepa", "may-loc-ion", "may-loc-carbon", "may-loc-uv"],
      banner: "https://karofi.karofi.com/karofi-com/2019/10/may-loc-khong-khi-317-banner.jpg",
      discount: "25%"
    },
    "dien-tich": {
      name: "Theo diện tích",
      categoryIds: ["may-loc-phong-nho", "may-loc-phong-vua", "may-loc-phong-lon"],
      banner: "https://karofi.karofi.com/karofi-com/2019/10/may-loc-khong-khi-317-banner.jpg",
      discount: "30%"
    },
    "dac-biet": {
      name: "Đặc biệt",
      categoryIds: ["may-loc-khong-khi-thong-minh", "may-loc-khong-khi-tiet-kiem", "may-loc-khong-khi-cao-cap", "bo-loc-thay-the", "phu-kien-may-loc"],
      banner: "https://karofi.karofi.com/karofi-com/2019/10/may-loc-khong-khi-317-banner.jpg",
      discount: "35%"
    }
  };

  const currentGroup = categoryGroups[activeTab];
  const subCategories = categories.filter(cat => currentGroup.categoryIds.includes(cat.id));
  
  // Filter products
  let filteredProducts = products.filter(p => currentGroup.categoryIds.includes(p.category));
  if (activeSubCategory) {
    filteredProducts = filteredProducts.filter(p => p.category === activeSubCategory);
  }

  // Sort products
  switch (sortBy) {
    case "price-asc":
      filteredProducts.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      filteredProducts.sort((a, b) => b.price - a.price);
      break;
    case "hot":
      filteredProducts.sort((a, b) => (b.discount || 0) - (a.discount || 0));
      break;
    default:
      filteredProducts.sort((a, b) => (b.reviews || 0) - (a.reviews || 0));
  }

  return (
    <div className="bg-gray-50 py-4 sm:py-6">
      <div className="container mx-auto px-3 sm:px-4">
        {/* Tabs - Mobile Optimized */}
        <div className="flex gap-2 mb-4 sm:mb-6 bg-white rounded-lg p-1.5 sm:p-2 shadow-sm overflow-x-auto">
          <button
            onClick={() => { setActiveTab("cong-nghe"); setActiveSubCategory(""); }}
            className={`flex-1 py-2 sm:py-3 px-3 sm:px-6 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === "cong-nghe" 
                ? "bg-sky-500 text-white shadow-md" 
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            Công nghệ lọc
          </button>
          <button
            onClick={() => { setActiveTab("dien-tich"); setActiveSubCategory(""); }}
            className={`flex-1 py-2 sm:py-3 px-3 sm:px-6 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === "dien-tich" 
                ? "bg-sky-500 text-white shadow-md" 
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            Theo diện tích
          </button>
          <button
            onClick={() => { setActiveTab("dac-biet"); setActiveSubCategory(""); }}
            className={`flex-1 py-2 sm:py-3 px-3 sm:px-6 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === "dac-biet" 
                ? "bg-sky-500 text-white shadow-md" 
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            Đặc biệt
          </button>
        </div>

        {/* Banner - Mobile Optimized */}
        <div className="relative mb-4 sm:mb-6 rounded-lg sm:rounded-xl overflow-hidden">
          <img 
            src={currentGroup.banner} 
            alt={currentGroup.name}
            className="w-full h-[150px] sm:h-[200px] md:h-[280px] object-cover"
          />
          <div className="absolute top-1/2 right-4 sm:right-10 -translate-y-1/2 bg-sky-500 text-white px-4 py-2 sm:px-8 sm:py-4 rounded-xl sm:rounded-2xl">
            <div className="text-[10px] sm:text-sm font-medium">Giảm đến</div>
            <div className="text-3xl sm:text-5xl font-bold">{currentGroup.discount}</div>
          </div>
        </div>

        {/* Sub Categories Icons - Mobile Grid */}
        <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 mb-4 sm:mb-6 shadow-sm">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-2 sm:gap-3 md:gap-4">
            {subCategories.map((cat) => {
              const IconComponent = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveSubCategory(activeSubCategory === cat.id ? "" : cat.id)}
                  className={`flex flex-col items-center gap-1.5 sm:gap-2 p-2 sm:p-3 rounded-lg transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 sm:hover:-translate-y-1 active:translate-y-0 ${
                    activeSubCategory === cat.id 
                      ? "bg-sky-50 border-2 border-sky-400 shadow-md" 
                      : "hover:bg-gray-50 border-2 border-transparent"
                  }`}
                >
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gray-100 rounded-full flex items-center justify-center transition-all duration-200 group-hover:scale-110 ${
                    activeSubCategory === cat.id ? "bg-sky-100" : ""
                  }`}>
                    <IconComponent className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-gray-600" />
                  </div>
                  <span className={`text-[10px] sm:text-xs text-center font-medium leading-tight transition-colors ${
                    activeSubCategory === cat.id ? "text-sky-600" : "text-gray-700"
                  }`}>
                    {cat.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Filters - Mobile Scroll */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
          <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900">Sắp xếp theo</h3>
          <div className="flex gap-2 sm:gap-3 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
            <button
              onClick={() => setSortBy("popular")}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg border-2 transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap text-xs sm:text-sm ${
                sortBy === "popular"
                  ? "border-sky-400 text-sky-600 bg-sky-50"
                  : "border-gray-300 text-gray-600 hover:border-gray-400"
              }`}
            >
              <Star className="w-3 h-3 sm:w-4 sm:h-4" /> Phổ biến
            </button>
            <button
              onClick={() => setSortBy("hot")}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg border-2 transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap text-xs sm:text-sm ${
                sortBy === "hot"
                  ? "border-sky-400 text-sky-600 bg-sky-50"
                  : "border-gray-300 text-gray-600 hover:border-gray-400"
              }`}
            >
              <Flame className="w-3 h-3 sm:w-4 sm:h-4" /> <span className="hidden sm:inline">Khuyến mãi </span>HOT
            </button>
            <button
              onClick={() => setSortBy("price-asc")}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg border-2 transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap text-xs sm:text-sm ${
                sortBy === "price-asc"
                  ? "border-teal-500 text-teal-600 bg-teal-50"
                  : "border-gray-300 text-gray-600 hover:border-gray-400"
              }`}
            >
              <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" /> Giá <span className="hidden sm:inline">Thấp - Cao</span><span className="sm:hidden">↑</span>
            </button>
            <button
              onClick={() => setSortBy("price-desc")}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg border-2 transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap text-xs sm:text-sm ${
                sortBy === "price-desc"
                  ? "border-teal-500 text-teal-600 bg-teal-50"
                  : "border-gray-300 text-gray-600 hover:border-gray-400"
              }`}
            >
              <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4" /> Giá <span className="hidden sm:inline">Cao - Thấp</span><span className="sm:hidden">↓</span>
            </button>
          </div>
        </div>

        {/* Products Grid - Mobile Optimized */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
          {filteredProducts.slice(0, 20).map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} compact />
          ))}
        </div>

            {/* View More - Mobile Optimized */}
            {filteredProducts.length > 20 && (
              <div className="text-center mt-6 sm:mt-8">
                <button className="bg-white border-2 border-sky-500 text-sky-600 px-6 sm:px-12 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-bold hover:bg-sky-50 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 mx-auto shadow-lg hover:shadow-xl">
                  <span className="hidden sm:inline">Xem tất cả {activeSubCategory ? categories.find(c => c.id === activeSubCategory)?.name : currentGroup.name}</span>
                  <span className="sm:hidden">Xem tất cả</span>
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            )}
      </div>
    </div>
  );
}

