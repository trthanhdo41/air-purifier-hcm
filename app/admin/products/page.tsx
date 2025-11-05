"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Edit, Trash2, Eye, X, DollarSign, Package, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/utils";
import Image from "next/image";
import Toast from "@/components/Toast";

interface Product {
  id: string;
  name: string;
  price: number;
  original_price?: number;
  discount?: number;
  image: string;
  category?: string;
  brand: string;
  rating?: number;
  reviews?: number;
  stock: number;
}

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productList, setProductList] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<{ message: string; type?: "success" | "error" | "info" } | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    originalPrice: "",
    discount: "",
    category: "",
    brand: "",
    stock: "",
    image: "",
    images: [] as string[],
  });
  const [uploadingImages, setUploadingImages] = useState(false);
  
  const filteredProducts = productList.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        setToast({ message: 'Lỗi khi tải sản phẩm: ' + error.message, type: 'error' });
      } else {
        setProductList(data || []);
      }
    } catch (error) {
      setToast({ message: 'Lỗi khi tải sản phẩm', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching categories:', error);
      } else {
        setCategories(data || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleAddProduct = () => {
    setShowModal(true);
  };

  const handleCreateProduct = async () => {
    if (!formData.name || !formData.price) {
      setToast({ message: "Vui lòng điền đầy đủ thông tin bắt buộc!", type: 'error' });
      return;
    }

    // Tạo mảng images: ưu tiên images array, nếu không có thì dùng image đơn, nếu không có thì dùng default
    const imagesArray = formData.images.length > 0 
      ? formData.images 
      : formData.image 
        ? [formData.image] 
        : ["https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTqcWbIqxD1gmh2l8psxDUx8A6osESPMx-J8Q&s"];
    const primaryImage = imagesArray[0];

    try {
      setIsCreating(true);
      const supabase = createClient();
      const { data, error } = await supabase
        .from('products')
        .insert({
          name: formData.name,
          price: Number(formData.price),
          original_price: formData.originalPrice ? Number(formData.originalPrice) : null,
          discount: formData.discount ? Number(formData.discount) : null,
          image: primaryImage,
          images: imagesArray,
          category: formData.category || "may-loc-hepa",
          brand: formData.brand || "Unknown",
          stock: Number(formData.stock) || 0,
          status: 'active',
        })
        .select()
        .single();

      if (error) {
        setToast({ message: 'Lỗi khi thêm sản phẩm: ' + error.message, type: 'error' });
        return;
      }

      setProductList([data, ...productList]);
      setShowModal(false);
      setFormData({
        name: "",
        price: "",
        originalPrice: "",
        discount: "",
        category: "",
        brand: "",
        stock: "",
        image: "",
        images: [],
      });
      setToast({ message: "Thêm sản phẩm thành công!", type: 'success' });
    } catch (error) {
      setToast({ message: 'Lỗi khi thêm sản phẩm', type: 'error' });
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditProduct = (productId: string) => {
    const p = productList.find(x => x.id === productId);
    if (!p) return;
    setIsEditMode(true);
    setEditingProductId(productId);
    const productImages = (p as any).images && Array.isArray((p as any).images) && (p as any).images.length > 0
      ? (p as any).images
      : p.image
        ? [p.image]
        : [];
    setFormData({
      name: p.name || "",
      price: String(p.price ?? ""),
      originalPrice: String((p as any).original_price ?? ""),
      discount: String((p as any).discount ?? ""),
      category: String(p.category ?? ""),
      brand: String(p.brand ?? ""),
      stock: String(p.stock ?? ""),
      image: String(p.image ?? ""),
      images: productImages,
    });
    setShowModal(true);
  };

  const handleUpdateProduct = async () => {
    if (!editingProductId) return;
    if (!formData.name || !formData.price) {
      setToast({ message: "Vui lòng điền đầy đủ thông tin bắt buộc!", type: 'error' });
      return;
    }
    
    // Tạo mảng images: ưu tiên images array, nếu không có thì dùng image đơn
    const imagesArray = formData.images.length > 0 
      ? formData.images 
      : formData.image 
        ? [formData.image] 
        : [];
    const primaryImage = imagesArray.length > 0 ? imagesArray[0] : formData.image || null;
    
    try {
      setIsUpdating(true);
      const supabase = createClient();
      const { data, error } = await supabase
        .from('products')
        .update({
          name: formData.name,
          price: Number(formData.price),
          original_price: formData.originalPrice ? Number(formData.originalPrice) : null,
          discount: formData.discount ? Number(formData.discount) : null,
          image: primaryImage,
          images: imagesArray,
          category: formData.category || null,
          brand: formData.brand || null,
          stock: Number(formData.stock) || 0,
        })
        .eq('id', editingProductId)
        .select()
        .single();

      if (error) {
        setToast({ message: 'Lỗi khi cập nhật sản phẩm: ' + error.message, type: 'error' });
        return;
      }

      setProductList(prev => prev.map(p => p.id === editingProductId ? { ...p, ...data } : p));
      setShowModal(false);
      setIsEditMode(false);
      setEditingProductId(null);
      setFormData({ name: "", price: "", originalPrice: "", discount: "", category: "", brand: "", stock: "", image: "", images: [] });
      setToast({ message: "Cập nhật sản phẩm thành công!", type: 'success' });
    } catch (error) {
      setToast({ message: 'Lỗi khi cập nhật sản phẩm', type: 'error' });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Bạn có chắc muốn xóa sản phẩm này?")) {
      return;
    }

    try {
      setDeletingIds(prev => new Set(prev).add(productId));
      const supabase = createClient();
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) {
        setToast({ message: 'Lỗi khi xóa sản phẩm: ' + error.message, type: 'error' });
        return;
      }

      setProductList(productList.filter(p => p.id !== productId));
      setToast({ message: "Đã xóa sản phẩm thành công!", type: 'success' });
    } catch (error) {
      setToast({ message: 'Lỗi khi xóa sản phẩm', type: 'error' });
    } finally {
      setDeletingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Quản lý sản phẩm</h1>
        <p className="text-gray-600 mt-1">Quản lý toàn bộ sản phẩm của hệ thống</p>
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
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm sản phẩm..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none"
              />
            </div>
          </div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button 
              onClick={handleAddProduct}
              className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Thêm sản phẩm
            </Button>
          </motion.div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Đang tải sản phẩm...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Eye className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Chưa có sản phẩm</h3>
              <p className="text-gray-600 mb-6">Bắt đầu thêm sản phẩm đầu tiên của bạn</p>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  onClick={handleAddProduct}
                  className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white flex items-center gap-2 mx-auto"
                >
                  <Plus className="w-5 h-5" />
                  Thêm sản phẩm đầu tiên
                </Button>
              </motion.div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Hình ảnh</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Tên sản phẩm</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Giá</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Tồn kho</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Trạng thái</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                          <Image 
                            src={product.image} 
                            alt={product.name}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-900">{product.name}</p>
                          <p className="text-sm text-gray-500">{product.brand} • {product.category}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-semibold text-gray-900">{formatPrice(product.price)}</p>
                          {(product as any).original_price && (
                            <p className="text-sm text-gray-500 line-through">
                              {formatPrice((product as any).original_price)}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          product.stock > 10 ? 'bg-green-100 text-green-700' : 
                          product.stock > 0 ? 'bg-yellow-100 text-yellow-700' : 
                          'bg-red-100 text-red-700'
                        }`}>
                          {product.stock} sản phẩm
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          Active
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleEditProduct(product.id)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDeleteProduct(product.id)}
                            disabled={deletingIds.has(product.id)}
                            className="text-red-600 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {deletingIds.has(product.id) ? (
                              <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </Button>
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
              onClick={() => setShowModal(false)}
              className="fixed inset-0 bg-black/50 z-[9998]"
            />
            
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl shadow-2xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto pointer-events-auto"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">{isEditMode ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}</h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Package className="w-4 h-4 inline mr-2" />
                      Tên sản phẩm *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none"
                      placeholder="Nhập tên sản phẩm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <DollarSign className="w-4 h-4 inline mr-2" />
                        Giá bán (₫) *
                      </label>
                      <input
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none"
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Giá gốc (₫)
                      </label>
                      <input
                        type="number"
                        value={formData.originalPrice}
                        onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Thương hiệu
                      </label>
                      <input
                        type="text"
                        value={formData.brand}
                        onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none"
                        placeholder="Nhập thương hiệu"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <Tag className="w-4 h-4 inline mr-2" />
                        Danh mục
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none"
                      >
                        <option value="">Chọn danh mục</option>
                        {categories.length > 0 ? (
                          categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.name}
                            </option>
                          ))
                        ) : (
                          <option value="" disabled>Đang tải danh mục...</option>
                        )}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Tồn kho
                      </label>
                      <input
                        type="number"
                        value={formData.stock}
                        onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none"
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Giảm giá (%)
                      </label>
                      <input
                        type="number"
                        value={formData.discount}
                        onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Hình ảnh sản phẩm
                    </label>
                    <div className="space-y-3">
                      {/* Input URL cho từng ảnh */}
                      <div className="space-y-2">
                        {formData.images.map((img, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <input
                              type="text"
                              value={img}
                              onChange={(e) => {
                                const newImages = [...formData.images];
                                newImages[index] = e.target.value;
                                setFormData({ ...formData, images: newImages, image: newImages[0] || formData.image });
                              }}
                              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none"
                              placeholder={`URL ảnh ${index + 1}...`}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const newImages = formData.images.filter((_, i) => i !== index);
                                setFormData({ ...formData, images: newImages, image: newImages[0] || formData.image });
                              }}
                              className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                      
                      {/* Nút thêm ảnh mới */}
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, images: [...formData.images, ""] })}
                        className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-sky-500 hover:bg-sky-50 transition-colors text-gray-600 font-medium"
                      >
                        + Thêm ảnh mới
                      </button>
                      
                      {/* Preview ảnh */}
                      {formData.images.length > 0 && (
                        <div className="grid grid-cols-4 gap-2 mt-3">
                          {formData.images.map((img, index) => (
                            img && (
                              <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200">
                                <Image
                                  src={img}
                                  alt={`Preview ${index + 1}`}
                                  fill
                                  className="object-cover"
                                  sizes="(max-width: 768px) 25vw, 12.5vw"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                  }}
                                />
                              </div>
                            )
                          ))}
                        </div>
                      )}
                      
                      {/* Fallback: Input URL đơn (nếu không dùng array) */}
                      {formData.images.length === 0 && (
                        <input
                          type="text"
                          value={formData.image}
                          onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none"
                          placeholder="URL ảnh chính hoặc nhấn 'Thêm ảnh mới' để thêm nhiều ảnh..."
                        />
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={isEditMode ? handleUpdateProduct : handleCreateProduct}
                      disabled={isCreating || isUpdating}
                      className="flex-1 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {(isCreating || isUpdating) ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          {isEditMode ? 'Đang cập nhật...' : 'Đang thêm...'}
                        </>
                      ) : (
                        isEditMode ? 'Lưu thay đổi' : 'Thêm sản phẩm'
                      )}
                    </Button>
                    <Button
                      onClick={() => { setShowModal(false); setIsEditMode(false); setEditingProductId(null); }}
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
          type={toast.type}
          duration={3000}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

