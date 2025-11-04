"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, Plus, Search, X, Calendar, Tag, DollarSign, Users, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import Toast from "@/components/Toast";

interface Coupon {
  id: string;
  code: string;
  name: string;
  description?: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_purchase: number;
  max_discount?: number;
  usage_limit?: number;
  used_count: number;
  valid_from: string;
  valid_until: string;
  status: "active" | "inactive" | "expired";
}

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingCouponId, setEditingCouponId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [toast, setToast] = useState<{ message: string; type?: "success" | "error" } | null>(null);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    discount_type: "percentage" as "percentage" | "fixed",
    discount_value: "",
    min_purchase: "",
    max_discount: "",
    usage_limit: "",
    valid_from: "",
    valid_until: "",
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Update status based on dates
      const now = new Date();
      const updatedCoupons = (data || []).map((coupon: any) => {
        const validUntil = new Date(coupon.valid_until);
        if (validUntil < now && coupon.status === 'active') {
          // Status will be updated by backend trigger or manually
          return { ...coupon, status: 'expired' as const };
        }
        return coupon;
      });

      setCoupons(updatedCoupons as Coupon[]);
    } catch (error: any) {
      console.error('Error fetching coupons:', error);
      setToast({ message: 'Lỗi khi tải danh sách mã giảm giá: ' + (error.message || 'Lỗi không xác định'), type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    setFormData({ ...formData, code: value });
  };

  const handleSubmit = async () => {
    if (!formData.code || !formData.name || !formData.discount_value || !formData.valid_from || !formData.valid_until) {
      setToast({ message: "Vui lòng điền đầy đủ thông tin bắt buộc!", type: "error" });
      return;
    }

    try {
      const supabase = createClient();
      const couponData: any = {
        code: formData.code.toUpperCase(),
        name: formData.name,
        description: formData.description || null,
        discount_type: formData.discount_type,
        discount_value: parseFloat(formData.discount_value),
        min_purchase: parseFloat(formData.min_purchase) || 0,
        max_discount: formData.max_discount ? parseFloat(formData.max_discount) : null,
        usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : null,
        valid_from: formData.valid_from,
        valid_until: formData.valid_until,
        status: 'active',
      };

      if (isEditMode && editingCouponId) {
        const { error } = await supabase
          .from('coupons')
          .update(couponData)
          .eq('id', editingCouponId);

        if (error) throw error;
        setToast({ message: "Cập nhật mã giảm giá thành công!", type: "success" });
      } else {
        const { error } = await supabase
          .from('coupons')
          .insert(couponData);

        if (error) throw error;
        setToast({ message: "Tạo mã giảm giá thành công!", type: "success" });
      }

      await fetchCoupons();
      setShowModal(false);
      resetForm();
    } catch (error: any) {
      console.error('Error saving coupon:', error);
      setToast({ message: 'Lỗi: ' + (error.message || 'Lỗi không xác định'), type: 'error' });
    }
  };

  const handleEdit = (coupon: Coupon) => {
    setEditingCouponId(coupon.id);
    setIsEditMode(true);
    setFormData({
      code: coupon.code,
      name: coupon.name,
      description: coupon.description || "",
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value.toString(),
      min_purchase: coupon.min_purchase.toString(),
      max_discount: coupon.max_discount?.toString() || "",
      usage_limit: coupon.usage_limit?.toString() || "",
      valid_from: coupon.valid_from.split('T')[0],
      valid_until: coupon.valid_until.split('T')[0],
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa mã giảm giá này?')) return;

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('coupons')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setToast({ message: "Xóa mã giảm giá thành công!", type: "success" });
      await fetchCoupons();
    } catch (error: any) {
      console.error('Error deleting coupon:', error);
      setToast({ message: 'Lỗi khi xóa: ' + (error.message || 'Lỗi không xác định'), type: 'error' });
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    try {
      const supabase = createClient();
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      const { error } = await supabase
        .from('coupons')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
      setToast({ message: `Đã ${newStatus === 'active' ? 'kích hoạt' : 'vô hiệu hóa'} mã giảm giá!`, type: "success" });
      await fetchCoupons();
    } catch (error: any) {
      console.error('Error updating status:', error);
      setToast({ message: 'Lỗi khi cập nhật trạng thái: ' + (error.message || 'Lỗi không xác định'), type: 'error' });
    }
  };

  const resetForm = () => {
    setFormData({
      code: "",
      name: "",
      description: "",
      discount_type: "percentage",
      discount_value: "",
      min_purchase: "",
      max_discount: "",
      usage_limit: "",
      valid_from: "",
      valid_until: "",
    });
    setIsEditMode(false);
    setEditingCouponId(null);
  };

  const filteredCoupons = coupons.filter(coupon =>
    coupon.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    coupon.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Quản lý mã giảm giá</h1>
        <p className="text-gray-600 mt-1">Tạo và quản lý mã giảm giá cho khách hàng</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200"
      >
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm mã giảm giá..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none"
              />
            </div>
          </div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button 
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Tạo mã giảm giá
            </Button>
          </motion.div>
        </div>

        <div className="p-6">
          {filteredCoupons.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gift className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Chưa có mã giảm giá</h3>
              <p className="text-gray-600 mb-6">Tạo mã giảm giá đầu tiên của bạn</p>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  onClick={() => {
                    resetForm();
                    setShowModal(true);
                  }}
                  className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white flex items-center gap-2 mx-auto"
                >
                  <Plus className="w-5 h-5" />
                  Tạo mã giảm giá
                </Button>
              </motion.div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Mã code</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Tên</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Giảm giá</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Ngày bắt đầu</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Ngày kết thúc</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Đã dùng</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Trạng thái</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredCoupons.map((coupon) => (
                    <tr key={coupon.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-mono font-bold text-blue-600">{coupon.code}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-gray-900">{coupon.name}</div>
                        {coupon.description && (
                          <div className="text-xs text-gray-500 mt-1">{coupon.description}</div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-gray-900">
                          {coupon.discount_type === "percentage" 
                            ? `${coupon.discount_value}%` 
                            : `${coupon.discount_value.toLocaleString('vi-VN')} ₫`}
                        </div>
                        {coupon.min_purchase > 0 && (
                          <div className="text-xs text-gray-500">Đơn tối thiểu: {coupon.min_purchase.toLocaleString('vi-VN')} ₫</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(coupon.valid_from).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(coupon.valid_until).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-600">
                          {coupon.used_count} / {coupon.usage_limit || '∞'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          coupon.status === "active" ? 'bg-green-100 text-green-700' :
                          coupon.status === "expired" ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {coupon.status === "active" ? "Đang hoạt động" :
                           coupon.status === "expired" ? "Hết hạn" : "Vô hiệu"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(coupon)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Chỉnh sửa"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(coupon.id, coupon.status)}
                            className={`p-2 rounded-lg transition-colors ${
                              coupon.status === 'active'
                                ? 'text-yellow-600 hover:bg-yellow-50'
                                : 'text-green-600 hover:bg-green-50'
                            }`}
                            title={coupon.status === 'active' ? 'Vô hiệu hóa' : 'Kích hoạt'}
                          >
                            {coupon.status === 'active' ? <X className="w-4 h-4" /> : <Tag className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => handleDelete(coupon.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Xóa"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowModal(false);
                resetForm();
              }}
              className="fixed inset-0 bg-black/50 z-[9998]"
            />
            
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl shadow-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto pointer-events-auto"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {isEditMode ? "Chỉnh sửa mã giảm giá" : "Tạo mã giảm giá mới"}
                  </h2>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Tag className="w-4 h-4 inline mr-2" />
                      Mã code (tự động in hoa) *
                    </label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={handleCodeChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none font-mono uppercase"
                      placeholder="Ví dụ: SALE2024"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Tên mã giảm giá *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none"
                      placeholder="Ví dụ: Giảm giá 20% cho đơn hàng đầu tiên"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Mô tả
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none"
                      placeholder="Mô tả chi tiết về mã giảm giá..."
                      rows={2}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <DollarSign className="w-4 h-4 inline mr-2" />
                        Loại giảm giá *
                      </label>
                      <select
                        value={formData.discount_type}
                        onChange={(e) => setFormData({ ...formData, discount_type: e.target.value as "percentage" | "fixed" })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none"
                      >
                        <option value="percentage">Phần trăm (%)</option>
                        <option value="fixed">Số tiền cố định (₫)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Giá trị giảm *
                      </label>
                      <input
                        type="number"
                        value={formData.discount_value}
                        onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none"
                        placeholder={formData.discount_type === "percentage" ? "10" : "100000"}
                        min="0"
                        step={formData.discount_type === "percentage" ? "1" : "1000"}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Đơn hàng tối thiểu (₫)
                      </label>
                      <input
                        type="number"
                        value={formData.min_purchase}
                        onChange={(e) => setFormData({ ...formData, min_purchase: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none"
                        placeholder="0"
                        min="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Giảm tối đa (₫) - Chỉ áp dụng khi giảm theo %
                      </label>
                      <input
                        type="number"
                        value={formData.max_discount}
                        onChange={(e) => setFormData({ ...formData, max_discount: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none"
                        placeholder="Không giới hạn"
                        min="0"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Users className="w-4 h-4 inline mr-2" />
                      Số lượt sử dụng tối đa
                    </label>
                    <input
                      type="number"
                      value={formData.usage_limit}
                      onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none"
                      placeholder="Không giới hạn"
                      min="1"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <Calendar className="w-4 h-4 inline mr-2" />
                        Ngày bắt đầu *
                      </label>
                      <input
                        type="date"
                        value={formData.valid_from}
                        onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <Calendar className="w-4 h-4 inline mr-2" />
                        Ngày kết thúc *
                      </label>
                      <input
                        type="date"
                        value={formData.valid_until}
                        onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={handleSubmit}
                      className="flex-1 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white"
                    >
                      {isEditMode ? "Cập nhật" : "Tạo mã giảm giá"}
                    </Button>
                    <Button
                      onClick={() => {
                        setShowModal(false);
                        resetForm();
                      }}
                      variant="outline"
                      className="flex-1"
                    >
                      Hủy
                    </Button>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type || "success"}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
