"use client";

import { useEffect } from "react";
import { MapPin } from "lucide-react";
import { useProvinces } from "@/lib/hooks/useProvinces";

interface AddressSelectorProps {
  city: string;
  district: string;
  ward: string;
  onCityChange: (value: string) => void;
  onDistrictChange: (value: string) => void;
  onWardChange: (value: string) => void;
  showLabels?: boolean;
  className?: string;
}

export default function AddressSelector({
  city,
  district,
  ward,
  onCityChange,
  onDistrictChange,
  onWardChange,
  showLabels = true,
  className = "",
}: AddressSelectorProps) {
  const {
    provinces,
    districts,
    wards,
    loading,
    loadingProvinces,
    error,
    fetchDistricts,
    fetchWards,
    resetDistricts,
    resetWards,
  } = useProvinces();

  useEffect(() => {
    // Debounce để tránh gọi API quá nhiều
    const timeoutId = setTimeout(() => {
      if (city) {
        fetchDistricts(city);
      } else {
        resetDistricts();
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [city, fetchDistricts, resetDistricts]);

  useEffect(() => {
    // Debounce để tránh gọi API quá nhiều
    const timeoutId = setTimeout(() => {
      if (district) {
        fetchWards(district);
      } else {
        resetWards();
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [district, fetchWards, resetWards]);

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    onCityChange(value);
    onDistrictChange("");
    onWardChange("");
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    onDistrictChange(value);
    onWardChange("");
  };

  const handleWardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onWardChange(e.target.value);
  };

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-3 gap-4 ${className}`}>
      <div className="relative z-10">
        {showLabels && (
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2 whitespace-nowrap">
            <MapPin className="w-4 h-4" />
            Tỉnh/Thành phố *
          </label>
        )}
        <select
          value={city}
          onChange={handleCityChange}
          disabled={loadingProvinces}
          className="w-full min-w-0 md:min-w-[180px] px-4 py-3 border border-gray-300 rounded-lg focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none disabled:bg-gray-50 disabled:cursor-not-allowed cursor-pointer appearance-none bg-white relative z-0 overflow-hidden text-ellipsis whitespace-nowrap"
        >
          <option value="">{loadingProvinces ? "Đang tải..." : "Chọn tỉnh/thành phố"}</option>
          {provinces.map((province) => (
            <option key={province.code} value={province.code}>
              {province.name}
            </option>
          ))}
        </select>
        {error && !loadingProvinces && (
          <p className="text-red-500 text-xs mt-1">Không thể tải danh sách tỉnh thành</p>
        )}
      </div>

      <div className="relative z-10">
        {showLabels && (
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2 whitespace-nowrap">
            Quận/Huyện *
          </label>
        )}
        <select
          value={district}
          onChange={handleDistrictChange}
          disabled={loading || !city || districts.length === 0}
          className="w-full min-w-0 md:min-w-[180px] px-4 py-3 border border-gray-300 rounded-lg focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none disabled:bg-gray-50 disabled:cursor-not-allowed cursor-pointer appearance-none bg-white relative z-0 overflow-hidden text-ellipsis whitespace-nowrap"
        >
          <option value="">Chọn quận/huyện</option>
          {districts.map((dist) => (
            <option key={dist.code} value={dist.code}>
              {dist.name}
            </option>
          ))}
        </select>
      </div>

      <div className="relative z-10">
        {showLabels && (
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2 whitespace-nowrap">
            Phường/Xã *
          </label>
        )}
        <select
          value={ward}
          onChange={handleWardChange}
          disabled={loading || !district || wards.length === 0}
          className="w-full min-w-0 md:min-w-[180px] px-4 py-3 border border-gray-300 rounded-lg focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none disabled:bg-gray-50 disabled:cursor-not-allowed cursor-pointer appearance-none bg-white relative z-0 overflow-hidden text-ellipsis whitespace-nowrap"
        >
          <option value="">Chọn phường/xã</option>
          {wards.map((w) => (
            <option key={w.code} value={w.code}>
              {w.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

