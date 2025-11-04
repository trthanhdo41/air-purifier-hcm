"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Save, User, Phone, MapPin, Mail } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Botchat from "@/components/Botchat";
import { useAuthStore } from "@/lib/stores/auth";
import { useRouter } from "next/navigation";
import AddressSelector from "@/components/AddressSelector";

export default function AccountPage() {
  const router = useRouter();
  const { user, updateProfile, loading } = useAuthStore();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    district: "",
    ward: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (!user) {
      router.push("/");
      return;
    }
    if (user && user.email === 'admin@hoithoxanh.com') {
      router.push('/admin/dashboard');
      return;
    }
    setFormData({
      name: user.name || "",
      phone: user.phone || "",
      address: user.address || "",
      city: user.city != null ? String(user.city) : "",
      district: user.district != null ? String(user.district) : "",
      ward: user.ward != null ? String(user.ward) : "",
    });
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const result = await updateProfile(
      formData.name || undefined,
      formData.phone || undefined,
      formData.address || undefined,
      formData.city || undefined,
      formData.district || undefined,
      formData.ward || undefined
    );

    if (result.success) {
      setSuccess("Cập nhật thông tin thành công!");
      setTimeout(() => setSuccess(""), 3000);
    } else {
      setError(result.error || "Đã xảy ra lỗi khi cập nhật");
    }
  };

  if (!isClient) {
    return null;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <div className="flex items-center gap-2 sm:gap-4 mb-4 sm:mb-6">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Quay lại</span>
              </Button>
            </Link>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Thông tin tài khoản
            </h1>
            <p className="text-gray-500 mb-6">
              Quản lý thông tin cá nhân của bạn
            </p>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700"
              >
                {error}
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700"
              >
                {success}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <Mail className="w-4 h-4" />
                  Email
                </label>
                <input
                  type="email"
                  value={user.email || ""}
                  disabled
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Email không thể thay đổi
                </p>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <User className="w-4 h-4" />
                  Họ và tên
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nhập họ và tên"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <Phone className="w-4 h-4" />
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Nhập số điện thoại"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none"
                />
              </div>

              <AddressSelector
                city={formData.city}
                district={formData.district}
                ward={formData.ward}
                onCityChange={(value) => setFormData(prev => ({ ...prev, city: value, district: "", ward: "" }))}
                onDistrictChange={(value) => setFormData(prev => ({ ...prev, district: value, ward: "" }))}
                onWardChange={(value) => setFormData(prev => ({ ...prev, ward: value }))}
              />

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <MapPin className="w-4 h-4" />
                  Địa chỉ chi tiết *
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Số nhà, tên đường..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all"
                >
                  {loading ? (
                    "Đang lưu..."
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Lưu thay đổi
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </motion.div>
      </main>
      
      <Footer />
      <Botchat />
    </div>
  );
}

