"use client";

import { brands } from "@/data/categories";

export default function BrandLogos() {
  const brandLogos = [
    { name: "xiaomi", display: "xiaomi" },
    { name: "SHARP", display: "SHARP" },
    { name: "PHILIPS", display: "PHILIPS" },
    { name: "SAMSUNG", display: "SAMSUNG" },
    { name: "LG", display: "LG" },
    { name: "Panasonic", display: "Panasonic" },
    { name: "lévoit", display: "lévoit" },
    { name: "dyson", display: "dyson" },
    { name: "Coway", display: "Coway" },
    { name: "Blueair", display: "Blueair" },
    { name: "Honeywell", display: "Honeywell" },
    { name: "Winix", display: "Winix" },
    { name: "Boneco", display: "Boneco" },
    { name: "Venta", display: "Venta" },
    { name: "Austin Air", display: "Austin Air" },
    { name: "IQAir", display: "IQAir" },
    { name: "Alen", display: "Alen" },
    { name: "Rabbit Air", display: "Rabbit Air" },
  ];

  return (
    <div className="bg-white py-6">
      <div className="container mx-auto px-4">
        <h2 className="text-xl font-bold mb-6 text-gray-900">Thương hiệu máy lọc không khí</h2>
        
        {/* Brand Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-3 mb-6">
          {brandLogos.map((brand) => (
            <button
              key={brand.name}
              className="bg-white border border-gray-200 rounded-lg px-4 py-3 hover:border-sky-400 hover:shadow-lg hover:-translate-y-1 active:translate-y-0 transition-all duration-200 flex items-center justify-center text-center group"
            >
              <span className={`font-semibold text-sm group-hover:text-sky-500 transition-colors ${
                ["SHARP", "SAMSUNG", "PHILIPS", "LG", "Panasonic", "dyson", "Coway", "Blueair", "Honeywell", "Winix", "Boneco", "Venta", "Austin Air", "IQAir", "Alen", "Rabbit Air"].includes(brand.name)
                  ? "text-gray-900"
                  : "text-gray-700"
              }`}>
                {brand.display}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

