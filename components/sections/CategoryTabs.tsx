"use client";

import { useState, useEffect } from "react";
import ProductCard from "@/components/ProductCard";
import { Star, TrendingUp, TrendingDown, Grid3x3, List, ChevronRight, Filter } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import * as LucideIcons from "lucide-react";

export default function CategoryTabs() {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("popular");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [displayLimit, setDisplayLimit] = useState(20);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const supabase = createClient();
        
        // Load categories from backend
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*')
          .order('name');
        
        if (!categoriesError && categoriesData && categoriesData.length > 0) {
          const mappedCategories = categoriesData.map(cat => {
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
        
        // Load products from backend
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*')
          .eq('status', 'active')
          .order('created_at', { ascending: false });
        
        if (!productsError && productsData && productsData.length > 0) {
          setProducts(productsData as any);
        } else {
          setProducts([]);
        }
      } catch (e) {
        console.error('Error loading data:', e);
        setCategories([]);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Listen for brand filter changes from BrandLogos
  useEffect(() => {
    const handleBrandFilter = (e: CustomEvent) => {
      setSelectedBrand(e.detail.brand);
      setSelectedCategory(""); // Clear category when brand is selected
      setDisplayLimit(20);
    };

    window.addEventListener('brandFilterChange', handleBrandFilter as EventListener);
    
    // Check sessionStorage on mount
    if (typeof window !== 'undefined') {
      try {
        const savedBrand = sessionStorage.getItem('selectedBrand');
        if (savedBrand) {
          setSelectedBrand(savedBrand);
          sessionStorage.removeItem('selectedBrand');
        }
      } catch (e) {
        // Ignore storage errors
      }
    }

    return () => {
      window.removeEventListener('brandFilterChange', handleBrandFilter as EventListener);
    };
  }, []);

  // Filter products by selected category and brand
  let filteredProducts = products;
  if (selectedBrand) {
    filteredProducts = products.filter(p => p.brand === selectedBrand);
  }
  if (selectedCategory) {
    filteredProducts = filteredProducts.filter(p => p.category === selectedCategory);
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

  const displayedProducts = filteredProducts.slice(0, displayLimit);

  return (
    <div className="bg-white py-8 md:py-12">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
            Danh mục sản phẩm
          </h2>
          <p className="text-gray-600 text-sm md:text-base max-w-2xl mx-auto">
            Khám phá các loại máy lọc không khí phù hợp với nhu cầu của bạn
          </p>
        </div>

        {/* Categories Grid - Clean and Modern */}
        <div className="mb-8 md:mb-12">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-gray-100 rounded-xl h-32 animate-pulse" />
              ))}
            </div>
          ) : categories.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2 sm:gap-3">
              {/* All Products Button */}
              <button
                onClick={() => {
                  setSelectedCategory("");
                  setSelectedBrand("");
                  setDisplayLimit(20);
                }}
                className={`group relative p-2.5 sm:p-3 rounded-lg border transition-all duration-200 hover:shadow-md ${
                  selectedCategory === ""
                    ? "border-sky-500 bg-sky-50 shadow-sm"
                    : "border-gray-200 bg-white hover:border-sky-300"
                }`}
              >
                <div className={`w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 rounded-full flex items-center justify-center transition-all ${
                  selectedCategory === ""
                    ? "bg-sky-500 text-white"
                    : "bg-gray-100 text-gray-600 group-hover:bg-sky-100 group-hover:text-sky-600"
                }`}>
                  <Grid3x3 className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span className={`block text-[10px] sm:text-xs font-medium text-center transition-colors ${
                  selectedCategory === ""
                    ? "text-sky-600"
                    : "text-gray-700 group-hover:text-sky-600"
                }`}>
                  Tất cả
                </span>
              </button>

              {/* Category Buttons */}
              {categories.map((cat, index) => {
                const IconComponent = cat.Icon || LucideIcons.Wind;
                const isActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(isActive ? "" : cat.id);
                      setDisplayLimit(20);
                    }}
                    className={`group relative p-2.5 sm:p-3 rounded-lg border transition-all duration-200 hover:shadow-md ${
                      isActive
                        ? "border-sky-500 bg-sky-50 shadow-sm"
                        : "border-gray-200 bg-white hover:border-sky-300"
                    }`}
                  >
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 rounded-full flex items-center justify-center transition-all ${
                      isActive
                        ? "bg-sky-500 text-white"
                        : "bg-gray-100 text-gray-600 group-hover:bg-sky-100 group-hover:text-sky-600"
                    }`}>
                      <IconComponent className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <span className={`block text-[10px] sm:text-xs font-medium text-center transition-colors line-clamp-2 leading-tight ${
                      isActive
                        ? "text-sky-600"
                        : "text-gray-700 group-hover:text-sky-600"
                    }`}>
                      {cat.name}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Chưa có danh mục sản phẩm</p>
            </div>
          )}
        </div>

        {/* Filters and View Options */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 md:mb-8 pb-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <span className="text-sm md:text-base font-medium text-gray-700">
              {selectedBrand 
                ? `${filteredProducts.length} sản phẩm ${selectedBrand}`
                : selectedCategory 
                ? `${filteredProducts.length} sản phẩm`
                : `Tất cả ${filteredProducts.length} sản phẩm`
              }
            </span>
            {selectedBrand && (
              <button
                onClick={() => setSelectedBrand("")}
                className="ml-2 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded text-gray-600 hover:text-gray-800 transition-colors"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Sort Options */}
            <div className="flex items-center gap-2">
              <span className="text-xs md:text-sm text-gray-600 hidden sm:inline">Sắp xếp:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all cursor-pointer"
              >
                <option value="popular">Phổ biến</option>
                <option value="price-asc">Giá: Thấp → Cao</option>
                <option value="price-desc">Giá: Cao → Thấp</option>
                <option value="hot">Khuyến mãi HOT</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-md transition-all ${
                  viewMode === "grid"
                    ? "bg-white text-sky-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <Grid3x3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-md transition-all ${
                  viewMode === "list"
                    ? "bg-white text-sky-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Products Grid/List */}
        {loading ? (
          <div className={viewMode === "grid" 
            ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6"
            : "space-y-4"
          }>
            {[...Array(10)].map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-lg h-80 animate-pulse" />
            ))}
          </div>
        ) : displayedProducts.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Filter className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 text-lg font-medium mb-2">Không tìm thấy sản phẩm</p>
            <p className="text-gray-400 text-sm">
              {selectedCategory 
                ? "Thử chọn danh mục khác hoặc xem tất cả sản phẩm"
                : "Chưa có sản phẩm nào trong hệ thống"
              }
            </p>
            {selectedCategory && (
              <button
                onClick={() => setSelectedCategory("")}
                className="mt-4 px-6 py-2 bg-sky-500 text-white rounded-lg font-medium hover:bg-sky-600 transition-colors"
              >
                Xem tất cả sản phẩm
              </button>
            )}
          </div>
        ) : (
          <>
            <div className={viewMode === "grid"
              ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6"
              : "space-y-4"
            }>
              {displayedProducts.map((product, index) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  index={index} 
                  compact={viewMode === "grid"}
                />
              ))}
            </div>

            {/* Load More Button */}
            {filteredProducts.length > displayLimit && (
              <div className="text-center mt-8 md:mt-12">
                <button
                  onClick={() => {
                    setLoadingMore(true);
                    // Simulate loading delay for better UX
                    setTimeout(() => {
                      setDisplayLimit(filteredProducts.length);
                      setLoadingMore(false);
                    }, 500);
                  }}
                  disabled={loadingMore}
                  className="px-8 py-3 bg-sky-500 text-white rounded-xl font-semibold hover:bg-sky-600 transition-all shadow-lg hover:shadow-xl flex items-center gap-2 mx-auto disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loadingMore ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Đang tải...</span>
                    </>
                  ) : (
                    <>
                      <span>Xem thêm {filteredProducts.length - displayLimit} sản phẩm</span>
                      <ChevronRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
