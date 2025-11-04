"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Edit, Trash2, X, FolderTree, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import Toast from "@/components/Toast";
import * as LucideIcons from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  image?: string;
  created_at?: string;
  updated_at?: string;
}

export default function CategoriesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [categoryList, setCategoryList] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type?: "success" | "error" | "info" } | null>(null);
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    slug: "",
    icon: "Wind",
  });

  const filteredCategories = categoryList.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        setToast({ message: 'Lỗi khi tải danh mục: ' + error.message, type: 'error' });
      } else {
        setCategoryList(data || []);
      }
    } catch (error) {
      setToast({ message: 'Lỗi khi tải danh mục', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = () => {
    setIsEditMode(false);
    setEditingCategoryId(null);
    setFormData({
      id: "",
      name: "",
      slug: "",
      icon: "Wind",
    });
    setShowModal(true);
  };

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const handleCreateCategory = async () => {
    if (!formData.name) {
      setToast({ message: "Vui lòng điền tên danh mục!", type: 'error' });
      return;
    }

    try {
      const supabase = createClient();
      const slug = formData.slug || generateSlug(formData.name);
      const id = formData.id || slug;

      const { data, error } = await supabase
        .from('categories')
        .insert({
          id,
          name: formData.name,
          slug,
          icon: formData.icon || "Wind",
        })
        .select()
        .single();

      if (error) {
        setToast({ message: 'Lỗi khi thêm danh mục: ' + error.message, type: 'error' });
        return;
      }

      setCategoryList([...categoryList, data]);
      setShowModal(false);
      setFormData({
        id: "",
        name: "",
        slug: "",
        icon: "Wind",
      });
      setToast({ message: "Thêm danh mục thành công!", type: 'success' });
    } catch (error) {
      setToast({ message: 'Lỗi khi thêm danh mục', type: 'error' });
    }
  };

  const handleEditCategory = (categoryId: string) => {
    const cat = categoryList.find(x => x.id === categoryId);
    if (!cat) return;
    setIsEditMode(true);
    setEditingCategoryId(categoryId);
    setFormData({
      id: cat.id,
      name: cat.name || "",
      slug: cat.slug || "",
      icon: cat.icon || "Wind",
    });
    setShowModal(true);
  };

  const handleUpdateCategory = async () => {
    if (!editingCategoryId) return;
    if (!formData.name) {
      setToast({ message: "Vui lòng điền tên danh mục!", type: 'error' });
      return;
    }

    try {
      const supabase = createClient();
      const slug = formData.slug || generateSlug(formData.name);

      const { error } = await supabase
        .from('categories')
        .update({
          name: formData.name,
          slug,
          icon: formData.icon || "Wind",
        })
        .eq('id', editingCategoryId);

      if (error) {
        setToast({ message: 'Lỗi khi cập nhật danh mục: ' + error.message, type: 'error' });
        return;
      }

      await fetchCategories();
      setShowModal(false);
      setEditingCategoryId(null);
      setFormData({
        id: "",
        name: "",
        slug: "",
        icon: "Wind",
      });
      setToast({ message: "Cập nhật danh mục thành công!", type: 'success' });
    } catch (error) {
      setToast({ message: 'Lỗi khi cập nhật danh mục', type: 'error' });
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm(`Bạn có chắc muốn xóa danh mục này?`)) return;

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId);

      if (error) {
        setToast({ message: 'Lỗi khi xóa danh mục: ' + error.message, type: 'error' });
        return;
      }

      setCategoryList(categoryList.filter(cat => cat.id !== categoryId));
      setToast({ message: "Xóa danh mục thành công!", type: 'success' });
    } catch (error) {
      setToast({ message: 'Lỗi khi xóa danh mục', type: 'error' });
    }
  };

  const iconOptions = [
    "Wind", "Zap", "Shield", "Sun", "Home", "Activity", "Leaf", "Sparkles",
    "Filter", "Droplet", "Flame", "Snowflake", "TreePine", "Cloud", "AirVent",
    "Fan", "Airplay", "Radar", "Thermometer", "Waves", "Battery", "Bolt",
    "Star", "Heart", "ShieldCheck", "CheckCircle", "XCircle", "AlertCircle"
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Quản lý danh mục</h1>
        <p className="text-gray-600 mt-1">Thêm, sửa, xóa danh mục sản phẩm</p>
      </div>

      {/* Search and Add */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm danh mục..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button
          onClick={handleAddCategory}
          className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white"
        >
          <Plus className="w-5 h-5 mr-2" />
          Thêm danh mục
        </Button>
      </div>

      {/* Categories Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-lg h-32 animate-pulse" />
          ))}
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <FolderTree className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {searchQuery ? "Không tìm thấy danh mục" : "Chưa có danh mục nào"}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchQuery ? "Thử tìm kiếm với từ khóa khác" : "Thêm danh mục đầu tiên của bạn"}
          </p>
          {!searchQuery && (
            <Button onClick={handleAddCategory} className="bg-sky-500 hover:bg-sky-600 text-white">
              <Plus className="w-5 h-5 mr-2" />
              Thêm danh mục
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCategories.map((category) => {
            const IconName = category.icon || 'Wind';
            const IconComponent = (LucideIcons as any)[IconName] || LucideIcons.Wind;
            
            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-all p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-sky-100 to-blue-100 rounded-xl flex items-center justify-center">
                      <IconComponent className="w-6 h-6 text-sky-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{category.name}</h3>
                      <p className="text-sm text-gray-500">{category.slug}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditCategory(category.id)}
                      className="p-2 text-gray-600 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="fixed inset-0 z-40 bg-black/50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
              >
                <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">
                    {isEditMode ? "Sửa danh mục" : "Thêm danh mục"}
                  </h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Tên danh mục <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          name: e.target.value,
                          slug: isEditMode ? formData.slug : generateSlug(e.target.value),
                        });
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none"
                      placeholder="Ví dụ: Máy lọc HEPA"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Slug (URL)
                    </label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none"
                      placeholder="may-loc-hepa"
                    />
                    <p className="text-xs text-gray-500 mt-1">Tự động tạo từ tên nếu để trống</p>
                  </div>

                  {!isEditMode && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        ID (Tùy chọn)
                      </label>
                      <input
                        type="text"
                        value={formData.id}
                        onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none"
                        placeholder="may-loc-hepa"
                      />
                      <p className="text-xs text-gray-500 mt-1">Tự động dùng slug nếu để trống</p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Icon <span className="text-gray-500 font-normal text-xs">(Chọn icon để hiển thị)</span>
                    </label>
                    {/* Icon Preview */}
                    <div className="mb-3 p-4 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center">
                      {(() => {
                        const IconName = formData.icon || 'Wind';
                        const IconComponent = (LucideIcons as any)[IconName] || LucideIcons.Wind;
                        return (
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-16 h-16 bg-gradient-to-br from-sky-100 to-blue-100 rounded-xl flex items-center justify-center">
                              <IconComponent className="w-8 h-8 text-sky-600" />
                            </div>
                            <span className="text-xs text-gray-600 font-medium">{IconName}</span>
                          </div>
                        );
                      })()}
                    </div>
                    {/* Icon Grid Picker */}
                    <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 max-h-48 overflow-y-auto p-2 border border-gray-200 rounded-lg bg-gray-50">
                      {iconOptions.map((icon) => {
                        const IconComponent = (LucideIcons as any)[icon] || LucideIcons.Wind;
                        const isSelected = formData.icon === icon;
                        return (
                          <button
                            key={icon}
                            type="button"
                            onClick={() => setFormData({ ...formData, icon })}
                            className={`p-2 rounded-lg transition-all hover:bg-white ${
                              isSelected
                                ? 'bg-sky-500 text-white shadow-md ring-2 ring-sky-500'
                                : 'bg-white text-gray-600 hover:shadow-sm'
                            }`}
                            title={icon}
                          >
                            <IconComponent className="w-5 h-5 mx-auto" />
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Click vào icon để chọn</p>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={() => setShowModal(false)}
                      variant="outline"
                      className="flex-1"
                    >
                      Hủy
                    </Button>
                    <Button
                      onClick={isEditMode ? handleUpdateCategory : handleCreateCategory}
                      className="flex-1 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white"
                    >
                      {isEditMode ? "Cập nhật" : "Thêm"}
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type || "info"}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

