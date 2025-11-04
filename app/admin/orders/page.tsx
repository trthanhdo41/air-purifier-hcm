"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Search, Filter, Eye, X, Package, MapPin, Phone, Mail, CreditCard } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Order, OrderItem } from "@/types";
import Image from "next/image";
import { useProvinces } from "@/lib/hooks/useProvinces";

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  processing: 'bg-blue-100 text-blue-800 border-blue-200',
  shipped: 'bg-purple-100 text-purple-800 border-purple-200',
  delivered: 'bg-green-100 text-green-800 border-green-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
};

const statusLabels: Record<string, string> = {
  pending: 'Chờ xử lý',
  processing: 'Đang xử lý',
  shipped: 'Đang giao hàng',
  delivered: 'Đã giao hàng',
  cancelled: 'Đã hủy',
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loadingOrderDetails, setLoadingOrderDetails] = useState(false);
  const { provinces, districts, wards, fetchDistricts, fetchWards } = useProvinces();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", orderId);

      if (error) throw error;
      fetchOrders();
      // Update selected order if it's the same
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus as any });
      }
    } catch (error) {
      console.error("Error updating order:", error);
      alert("Có lỗi xảy ra khi cập nhật trạng thái đơn hàng");
    }
  };

  // Helper functions to map code to name
  const getCityName = (code: string) => {
    const province = provinces.find(p => p.code === code);
    return province ? province.name : code;
  };

  const getDistrictName = (code: string) => {
    const districtObj = districts.find(d => d.code === code);
    return districtObj ? districtObj.name : code;
  };

  const getWardName = (code: string) => {
    const wardObj = wards.find(w => w.code === code);
    return wardObj ? wardObj.name : code;
  };

  const fetchOrderDetails = async (order: Order) => {
    setSelectedOrder(order);
    setLoadingOrderDetails(true);
    try {
      const supabase = createClient();
      
      // Load districts and wards for the order's address
      if (order.city) {
        await fetchDistricts(order.city);
      }
      if (order.district) {
        await fetchWards(order.district);
      }
      
      // Fetch order items with product details
      const { data: items, error } = await supabase
        .from("order_items")
        .select(`
          *,
          products (
            id,
            name,
            image,
            price
          )
        `)
        .eq("order_id", order.id);

      if (error) throw error;
      setOrderItems(items as any || []);
    } catch (error) {
      console.error("Error fetching order details:", error);
      setOrderItems([]);
    } finally {
      setLoadingOrderDetails(false);
    }
  };

  const closeOrderModal = () => {
    setSelectedOrder(null);
    setOrderItems([]);
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = 
      order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.phone.includes(searchQuery);
    
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    const matchesPayment = paymentFilter === "all" || order.payment_status === paymentFilter;
    
    return matchesSearch && matchesStatus && matchesPayment;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý đơn hàng</h1>
          <p className="text-gray-600 mt-1">Tổng cộng: {orders.length} đơn hàng</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm đơn hàng..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all"
            />
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          <div className="text-xs font-semibold text-gray-500 uppercase flex items-center mr-2">Đơn hàng:</div>
          {["all", "pending", "processing", "shipped", "delivered", "cancelled"].map((status) => (
            <motion.button
              key={status}
              onClick={() => setStatusFilter(status)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                statusFilter === status
                  ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg"
                  : "bg-white border-2 border-gray-200 text-gray-700 hover:border-sky-300"
              }`}
            >
              {status === "all" ? "Tất cả" : statusLabels[status]}
            </motion.button>
          ))}
        </div>
      </div>

      <div className="flex gap-2 flex-wrap items-center">
        <div className="text-xs font-semibold text-gray-500 uppercase flex items-center mr-2">Thanh toán:</div>
        {[
          { value: "all", label: "Tất cả" },
          { value: "paid", label: "✓ Đã thanh toán" },
          { value: "pending", label: "⏳ Chờ thanh toán" },
          { value: "failed", label: "✗ Thất bại" },
        ].map((payment) => (
          <motion.button
            key={payment.value}
            onClick={() => setPaymentFilter(payment.value)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
              paymentFilter === payment.value
                ? payment.value === "paid"
                  ? "bg-green-500 text-white shadow-lg"
                  : payment.value === "pending"
                  ? "bg-yellow-500 text-white shadow-lg"
                  : payment.value === "failed"
                  ? "bg-red-500 text-white shadow-lg"
                  : "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg"
                : "bg-white border-2 border-gray-200 text-gray-700 hover:border-sky-300"
            }`}
          >
            {payment.label}
          </motion.button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Mã đơn
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Khách hàng
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Tổng tiền
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Phương thức
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  TT Thanh toán
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Trạng thái ĐH
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Ngày đặt
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <ShoppingBag className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-gray-500">Chưa có đơn hàng nào</p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-semibold text-gray-900">{order.order_number}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{order.full_name}</div>
                      <div className="text-sm text-gray-500">{order.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-bold text-gray-900">
                        {new Intl.NumberFormat('vi-VN').format(order.final_amount)}đ
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                        order.payment_method === 'cod' 
                          ? 'bg-orange-100 text-orange-800 border border-orange-200' 
                          : 'bg-blue-100 text-blue-800 border border-blue-200'
                      }`}>
                        {order.payment_method === 'cod' ? 'COD' : 'Chuyển khoản'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                        order.payment_status === 'paid' 
                          ? 'bg-green-100 text-green-800 border border-green-200' 
                          : order.payment_status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                          : 'bg-red-100 text-red-800 border border-red-200'
                      }`}>
                        {order.payment_status === 'paid' ? '✓ Đã thanh toán' : 
                         order.payment_status === 'pending' ? '⏳ Chờ thanh toán' : 
                         '✗ Thất bại'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold border-2 ${statusColors[order.status]} cursor-pointer focus:outline-none focus:ring-2`}
                      >
                        {Object.entries(statusLabels).map(([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(order.created_at).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <motion.button
                        onClick={() => fetchOrderDetails(order)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer"
                        title="Xem chi tiết đơn hàng"
                      >
                        <Eye className="w-4 h-4" />
                      </motion.button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={closeOrderModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Chi tiết đơn hàng</h2>
                  <p className="text-gray-600 mt-1">#{selectedOrder.order_number}</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={closeOrderModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </motion.button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Order Status */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Trạng thái đơn hàng</p>
                    <select
                      value={selectedOrder.status}
                      onChange={(e) => updateOrderStatus(selectedOrder.id, e.target.value)}
                      className={`w-full px-4 py-2 rounded-lg text-sm font-semibold border-2 ${statusColors[selectedOrder.status]} cursor-pointer focus:outline-none focus:ring-2`}
                    >
                      {Object.entries(statusLabels).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Ngày đặt hàng</p>
                    <p className="text-lg font-semibold text-gray-900 px-4 py-2 bg-gray-50 rounded-lg">
                      {new Date(selectedOrder.created_at).toLocaleDateString('vi-VN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>

                {/* Payment Information */}
                <div className="bg-gradient-to-br from-blue-50 to-sky-50 rounded-xl p-6 border-2 border-blue-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                    Thông tin thanh toán
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Phương thức thanh toán</p>
                      <span className={`inline-flex px-4 py-2 rounded-lg text-sm font-semibold ${
                        selectedOrder.payment_method === 'cod' 
                          ? 'bg-orange-100 text-orange-800 border-2 border-orange-200' 
                          : 'bg-blue-100 text-blue-800 border-2 border-blue-200'
                      }`}>
                        {selectedOrder.payment_method === 'cod' ? '💵 Thanh toán khi nhận hàng (COD)' : '🏦 Chuyển khoản ngân hàng'}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Trạng thái thanh toán</p>
                      <span className={`inline-flex px-4 py-2 rounded-lg text-sm font-semibold ${
                        selectedOrder.payment_status === 'paid' 
                          ? 'bg-green-100 text-green-800 border-2 border-green-200' 
                          : selectedOrder.payment_status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800 border-2 border-yellow-200'
                          : 'bg-red-100 text-red-800 border-2 border-red-200'
                      }`}>
                        {selectedOrder.payment_status === 'paid' ? '✓ Đã thanh toán' : 
                         selectedOrder.payment_status === 'pending' ? '⏳ Chờ thanh toán' : 
                         '✗ Thanh toán thất bại'}
                      </span>
                    </div>
                  </div>
                  {selectedOrder.transaction_id && (
                    <div className="mt-4 pt-4 border-t border-blue-200">
                      <p className="text-sm text-gray-600">Mã giao dịch</p>
                      <p className="font-mono text-sm font-semibold text-gray-900 mt-1">{selectedOrder.transaction_id}</p>
                    </div>
                  )}
                </div>

                {/* Customer Information */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Thông tin khách hàng
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Package className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Họ và tên</p>
                        <p className="font-semibold text-gray-900">{selectedOrder.full_name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <Phone className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Số điện thoại</p>
                        <p className="font-semibold text-gray-900">{selectedOrder.phone}</p>
                      </div>
                    </div>
                    {selectedOrder.email && (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                          <Mail className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Email</p>
                          <p className="font-semibold text-gray-900">{selectedOrder.email}</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Phương thức thanh toán</p>
                        <p className="font-semibold text-gray-900">
                          {selectedOrder.payment_method === 'cod' ? 'Thanh toán khi nhận hàng' : 
                           selectedOrder.payment_method === 'sepay' ? 'Sepay' : selectedOrder.payment_method}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Delivery Address */}
                <div className="bg-sky-50 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Địa chỉ giao hàng
                  </h3>
                  <p className="text-gray-900">
                    {selectedOrder.address}, {getWardName(selectedOrder.ward)}, {getDistrictName(selectedOrder.district)}, {getCityName(selectedOrder.city)}
                  </p>
                  {selectedOrder.note && (
                    <div className="mt-3 pt-3 border-t border-sky-200">
                      <p className="text-sm text-gray-600">Ghi chú:</p>
                      <p className="text-gray-900">{selectedOrder.note}</p>
                    </div>
                  )}
                </div>

                {/* Order Items */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Sản phẩm đã đặt</h3>
                  {loadingOrderDetails ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500"></div>
                    </div>
                  ) : orderItems.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">Không có sản phẩm</p>
                  ) : (
                    <div className="space-y-3">
                      {orderItems.map((item: any) => (
                        <div key={item.id} className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg">
                          {item.products?.image && (
                            <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                              <Image
                                src={item.products.image}
                                alt={item.products.name || 'Product'}
                                fill
                                className="object-cover"
                                sizes="64px"
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 truncate">
                              {item.products?.name || 'Sản phẩm đã bị xóa'}
                            </p>
                            <p className="text-sm text-gray-600">Số lượng: {item.quantity}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-900">
                              {new Intl.NumberFormat('vi-VN').format(item.price)}đ
                            </p>
                            <p className="text-sm text-gray-600">
                              Tổng: {new Intl.NumberFormat('vi-VN').format(item.subtotal)}đ
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Order Summary */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Tổng kết đơn hàng</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tổng tiền hàng:</span>
                      <span className="font-semibold">{new Intl.NumberFormat('vi-VN').format(selectedOrder.total_amount)}đ</span>
                    </div>
                    {selectedOrder.shipping_fee > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Phí vận chuyển:</span>
                        <span className="font-semibold">{new Intl.NumberFormat('vi-VN').format(selectedOrder.shipping_fee)}đ</span>
                      </div>
                    )}
                    {selectedOrder.discount_amount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Giảm giá:</span>
                        <span className="font-semibold text-green-600">-{new Intl.NumberFormat('vi-VN').format(selectedOrder.discount_amount)}đ</span>
                      </div>
                    )}
                    <div className="pt-3 border-t border-gray-300 flex justify-between">
                      <span className="text-lg font-bold text-gray-900">Thành tiền:</span>
                      <span className="text-lg font-bold text-sky-600">{new Intl.NumberFormat('vi-VN').format(selectedOrder.final_amount)}đ</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

