"use client";

import { SortOption } from "@/types";
import { brands } from "@/data/categories";
import { ChevronDown, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FilterBarProps {
  selectedBrand: string;
  sortBy: SortOption;
  onBrandChange: (brand: string) => void;
  onSortChange: (sort: SortOption) => void;
  totalProducts: number;
}

export default function FilterBar({
  selectedBrand,
  sortBy,
  onBrandChange,
  onSortChange,
  totalProducts,
}: FilterBarProps) {
  const sortOptions: { value: SortOption; label: string }[] = [
    { value: "popular", label: "Phổ biến nhất" },
    { value: "hot-deals", label: "Khuyến mãi HOT" },
    { value: "price-asc", label: "Giá thấp đến cao" },
    { value: "price-desc", label: "Giá cao đến thấp" },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-soft p-5 mb-8 border border-gray-100/50">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Product count & filter button */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-600">
              Tìm thấy <span className="font-bold text-red-600 text-base">{totalProducts}</span> sản phẩm
            </span>
          </div>
        </div>

        {/* Right: Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Brand Filter */}
          <div className="relative">
            <select
              value={selectedBrand}
              onChange={(e) => onBrandChange(e.target.value)}
              className="appearance-none bg-white border-2 border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm font-semibold text-gray-700 focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-100 cursor-pointer hover:border-gray-300 transition-all min-w-[180px]"
            >
              <option value="">Tất cả thương hiệu</option>
              {brands.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Divider */}
          <div className="hidden md:block w-px h-8 bg-gray-200" />

          {/* Sort Filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-600 hidden md:block">Sắp xếp:</span>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value as SortOption)}
                className="appearance-none bg-white border-2 border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm font-bold text-gray-900 focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-100 cursor-pointer hover:border-gray-300 transition-all min-w-[180px]"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Active filters */}
      {selectedBrand && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Đang lọc:
            </span>
            <button
              onClick={() => onBrandChange("")}
              className="inline-flex items-center gap-2 bg-red-50 text-red-700 px-3 py-1.5 rounded-full text-sm font-semibold hover:bg-red-100 transition-colors group"
            >
              <span>{selectedBrand}</span>
              <X className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
