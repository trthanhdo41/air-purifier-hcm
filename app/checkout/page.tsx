"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, MapPin, Phone, Mail, CreditCard, Truck, Shield, CheckCircle, Lock, Sparkles, Gift, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/stores/cart";
import { useAuthStore } from "@/lib/stores/auth";
import { Button } from "@/components/ui/button";
import OrderSummary from "@/components/OrderSummary";
import PaymentForm from "@/components/PaymentForm";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Botchat from "@/components/Botchat";
import LoginModal from "@/components/LoginModal";
import AddressSelector from "@/components/AddressSelector";
import { useProvinces } from "@/lib/hooks/useProvinces";
import PaymentProcessing from "@/components/PaymentProcessing";
import SepayQRPayment from "@/components/SepayQRPayment";

export default function CheckoutPage() {
  const { items, buyNowItems, getTotalItems, getTotalPrice, getTotalSavings, clearBuyNowItems } = useCartStore();
  const { user } = useAuthStore();
  const router = useRouter();
  const { provinces, districts, wards, fetchDistricts, fetchWards } = useProvinces();
  const [currentStep, setCurrentStep] = useState(1);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [showSepayQR, setShowSepayQR] = useState(false);
  const [sepayQRData, setSepayQRData] = useState<any>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    district: "",
    ward: "",
    note: "",
    paymentMethod: "cod",
  });

  // Helper function để map code thành tên
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

  // Sử dụng buyNowItems nếu có, không thì dùng items
  const checkoutItems = buyNowItems.length > 0 ? buyNowItems : items;
  
  // Tính toán dựa trên checkoutItems
  const totalItems = checkoutItems.reduce((total, item) => total + item.quantity, 0);
  const totalPrice = checkoutItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  const totalSavings = checkoutItems.reduce((total, item) => {
    if (item.product.originalPrice) {
      return total + ((item.product.originalPrice - item.product.price) * item.quantity);
    }
    return total;
  }, 0);

  // Scroll to top when page loads - scroll immediately first, then smooth
  useEffect(() => {
    window.scrollTo(0, 0); // Immediate scroll
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  }, []);

  useEffect(() => {
    // Nếu giỏ hàng trống, redirect về home
    if (checkoutItems.length === 0 && user) {
      router.push('/');
      return;
    }
    
    if (!user && checkoutItems.length > 0) {
      // Nếu chưa đăng nhập nhưng có sản phẩm trong giỏ, mở modal đăng nhập
      setLoginModalOpen(true);
    } else if (user && (!formData.fullName || !formData.phone || !formData.city)) {
      setFormData(prev => ({
        ...prev,
        fullName: prev.fullName || user.name || "",
        email: prev.email || user.email || "",
        phone: prev.phone || user.phone || "",
        address: prev.address || user.address || "",
        city: prev.city || (user.city != null ? String(user.city) : ""),
        district: prev.district || (user.district != null ? String(user.district) : ""),
        ward: prev.ward || (user.ward != null ? String(user.ward) : ""),
      }));
    }
  }, [user, router]);

  // Load districts và wards khi có city/district trong formData để hiển thị tên
  useEffect(() => {
    if (formData.city) {
      // Kiểm tra xem districts hiện tại có thuộc city này không
      const needLoad = districts.length === 0 || !districts.some(d => {
        // Nếu có district trong formData, kiểm tra xem nó có trong danh sách không
        return formData.district ? d.code === formData.district : true;
      });
      if (needLoad) {
        fetchDistricts(formData.city);
      }
    }
  }, [formData.city, formData.district, districts, fetchDistricts]);

  useEffect(() => {
    if (formData.district) {
      // Kiểm tra xem wards hiện tại có thuộc district này không
      const needLoad = wards.length === 0 || !wards.some(w => {
        // Nếu có ward trong formData, kiểm tra xem nó có trong danh sách không
        return formData.ward ? w.code === formData.ward : true;
      });
      if (needLoad) {
        fetchWards(formData.district);
      }
    }
  }, [formData.district, formData.ward, wards, fetchWards]);

  // Validation states
  const isStep1Valid = formData.fullName.trim() && formData.phone.trim() && formData.city && formData.district && formData.ward && formData.address.trim();
  const isStep2Valid = formData.paymentMethod;
  const canProceedToNext = currentStep === 1 ? isStep1Valid : currentStep === 2 ? isStep2Valid : true;

  const steps = [
    { id: 1, title: "Thông tin giao hàng", icon: MapPin, description: "Nhập địa chỉ nhận hàng" },
    { id: 2, title: "Thanh toán", icon: CreditCard, description: "Chọn phương thức thanh toán" },
    { id: 3, title: "Xác nhận", icon: Shield, description: "Kiểm tra và xác nhận đơn hàng" },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    // Validation for each step
    if (currentStep === 1) {
      // Validate delivery information
      if (!formData.fullName.trim() || !formData.phone.trim() || !formData.city || !formData.district || !formData.ward || !formData.address.trim()) {
        alert("Vui lòng điền đầy đủ thông tin giao hàng bắt buộc (*)");
        return;
      }
    }
    
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setLoginModalOpen(true);
      return;
    }

    // Validate required fields
    if (!formData.fullName.trim() || !formData.phone.trim() || !formData.city || !formData.district || !formData.ward || !formData.address.trim()) {
      alert("Vui lòng điền đầy đủ thông tin giao hàng bắt buộc (*)");
      return;
    }

    try {
      // Save order to database first
      const shippingFee = 0; // You can calculate this based on location
      const discountAmount = 0; // You can calculate this based on coupons
      const finalAmount = totalPrice + shippingFee - discountAmount;

      const createOrderRes = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: checkoutItems,
          totalAmount: totalPrice,
          shippingFee,
          discountAmount,
          finalAmount,
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          district: formData.district,
          ward: formData.ward,
          note: formData.note,
          paymentMethod: formData.paymentMethod,
        }),
      });

      const orderData = await createOrderRes.json();

      if (!createOrderRes.ok || !orderData.success) {
        alert(orderData.error || 'Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại.');
        return;
      }

            // Handle payment method
            if (formData.paymentMethod === 'sepay') {
              try {
                const orderCode = orderData.order.order_number;
                const res = await fetch(`/api/payment/sepay/create`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ 
                    amount: finalAmount, 
                    orderCode, 
                    description: `Thanh toan don hang ${orderCode}`,
                    orderId: orderData.order.id,
                  }),
                });
                const data = await res.json();
                
                if (data?.success && data?.qrData) {
                  // Hiển thị QR code modal ngay lập tức
                  setSepayQRData(data.qrData);
                  setShowSepayQR(true);
                  return;
                }
                
                alert('Không thể tạo thanh toán. Vui lòng thử lại hoặc chọn phương thức khác.');
                return;
              } catch (err) {
                console.error('Sepay error:', err);
                alert('Có lỗi xảy ra khi tạo thanh toán. Vui lòng thử lại.');
                return;
              }
            }

            // For COD, clear cart and redirect to success page
            if (buyNowItems.length > 0) {
              clearBuyNowItems();
            }
            router.push(`/success?order=${orderData.order.order_number}`);
    } catch (error: any) {
      console.error('Error submitting order:', error);
      alert('Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.');
    }
  };

  if (checkoutItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md w-full"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <Truck className="w-10 h-10 text-gray-400" />
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Giỏ hàng trống</h2>
          <p className="text-gray-600 mb-6">Bạn cần thêm sản phẩm vào giỏ hàng trước khi thanh toán</p>
          <Button asChild className="bg-sky-500 hover:bg-sky-600">
            <Link href="/">Tiếp tục mua sắm</Link>
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-50 flex flex-col">
      <Header />
      
      <main className="flex-1">
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
          {/* Back to Cart Button */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 sm:mb-6"
          >
            <Link href="/cart">
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Quay lại giỏ hàng
              </Button>
            </Link>
          </motion.div>

          {/* Login Warning Banner */}
          {!user && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-orange-50 to-yellow-50 border-2 border-orange-300 rounded-xl p-4 mb-6 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-orange-600" />
                <div>
                  <p className="font-semibold text-orange-900">Vui lòng đăng nhập để thanh toán</p>
                  <p className="text-sm text-orange-700">Bạn cần đăng nhập để hoàn tất đơn hàng</p>
                </div>
              </div>
              <Button
                onClick={() => setLoginModalOpen(true)}
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                Đăng nhập ngay
              </Button>
            </motion.div>
          )}
        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Progress Steps */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6 sm:mb-8"
            >
              <div className="flex items-center justify-between overflow-x-auto">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center min-w-0">
                    <motion.div
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full border-2 transition-all shrink-0 relative ${
                        currentStep >= step.id
                          ? "bg-sky-500 border-sky-500"
                          : "bg-white border-gray-300"
                      }`}
                    >
                      {/* Luôn hiển thị icon trên tất cả kích thước màn hình */}
                      {currentStep > step.id ? (
                        <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white" />
                      ) : (
                        <step.icon className={`w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 ${
                          currentStep >= step.id ? "text-white" : "text-gray-400"
                        }`} />
                      )}
                    </motion.div>
                    
                    <div className="ml-2 sm:ml-3 min-w-0 hidden sm:block">
                      <h3 className={`font-semibold text-xs sm:text-sm md:text-base ${
                        currentStep >= step.id ? "text-sky-600" : "text-gray-400"
                      }`}>
                        {step.title}
                      </h3>
                      <p className="text-xs text-gray-500 hidden md:block">{step.description}</p>
                    </div>
                    
                    {index < steps.length - 1 && (
                      <div className={`w-6 sm:w-12 md:w-20 h-0.5 mx-2 sm:mx-4 ${
                        currentStep > step.id ? "bg-sky-500" : "bg-gray-300"
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Form Content */}
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 md:p-8"
            >
              <AnimatePresence mode="wait">
                {currentStep === 1 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-sky-100 rounded-full flex items-center justify-center">
                        <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-sky-600" />
                      </div>
                      <div>
                        <h2 className="text-lg sm:text-xl font-bold text-gray-900">Thông tin giao hàng</h2>
                        <p className="text-sm sm:text-base text-gray-600">Nhập địa chỉ nhận hàng của bạn</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Họ và tên *
                        </label>
                        <input
                          type="text"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors text-sm sm:text-base ${
                            formData.fullName.trim() ? "border-green-300 bg-green-50" : "border-gray-300"
                          }`}
                          placeholder="Nhập họ và tên"
                          required
                        />
                        {!formData.fullName.trim() && (
                          <p className="text-red-500 text-xs mt-1">Vui lòng nhập họ và tên</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Số điện thoại *
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors text-sm sm:text-base ${
                            formData.phone.trim() ? "border-green-300 bg-green-50" : "border-gray-300"
                          }`}
                          placeholder="Nhập số điện thoại"
                          required
                        />
                        {!formData.phone.trim() && (
                          <p className="text-red-500 text-xs mt-1">Vui lòng nhập số điện thoại</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                          placeholder="Nhập email"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <AddressSelector
                          city={formData.city}
                          district={formData.district}
                          ward={formData.ward}
                          onCityChange={(value) => handleInputChange({ target: { name: "city", value } } as React.ChangeEvent<HTMLSelectElement>)}
                          onDistrictChange={(value) => handleInputChange({ target: { name: "district", value } } as React.ChangeEvent<HTMLSelectElement>)}
                          onWardChange={(value) => handleInputChange({ target: { name: "ward", value } } as React.ChangeEvent<HTMLSelectElement>)}
                          showLabels={true}
                          className="mt-1"
                        />
                      </div>
                      {(!formData.city || !formData.district || !formData.ward) && (
                        <div className="mt-2">
                          {!formData.city && (
                            <p className="text-red-500 text-xs">Vui lòng chọn tỉnh/thành phố</p>
                          )}
                          {!formData.district && formData.city && (
                            <p className="text-red-500 text-xs">Vui lòng chọn quận/huyện</p>
                          )}
                          {!formData.ward && formData.district && (
                            <p className="text-red-500 text-xs">Vui lòng chọn phường/xã</p>
                          )}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Địa chỉ chi tiết *
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors ${
                          formData.address.trim() ? "border-green-300 bg-green-50" : "border-gray-300"
                        }`}
                        placeholder="Số nhà, tên đường..."
                        required
                      />
                      {!formData.address.trim() && (
                        <p className="text-red-500 text-xs mt-1">Vui lòng nhập địa chỉ chi tiết</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Ghi chú
                      </label>
                      <textarea
                        name="note"
                        value={formData.note}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors resize-none"
                        placeholder="Ghi chú cho đơn hàng..."
                      />
                    </div>
                  </motion.div>
                )}

                {currentStep === 2 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-sky-100 rounded-full flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-sky-600" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">Phương thức thanh toán</h2>
                        <p className="text-gray-600">Chọn cách thanh toán phù hợp</p>
                      </div>
                    </div>

                    <PaymentForm 
                      paymentMethod={formData.paymentMethod}
                      onPaymentMethodChange={(method) => setFormData(prev => ({ ...prev, paymentMethod: method }))}
                    />
                  </motion.div>
                )}

                {currentStep === 3 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-sky-100 rounded-full flex items-center justify-center">
                        <Shield className="w-5 h-5 text-sky-600" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">Xác nhận đơn hàng</h2>
                        <p className="text-gray-600">Kiểm tra lại thông tin trước khi đặt hàng</p>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                      <h3 className="font-semibold text-gray-900">Thông tin giao hàng</h3>
                      <div className="space-y-2 text-sm">
                        <p><span className="font-medium">Người nhận:</span> {formData.fullName}</p>
                        <p><span className="font-medium">SĐT:</span> {formData.phone}</p>
                        <p><span className="font-medium">Địa chỉ:</span> {formData.address}, {getWardName(formData.ward)}, {getDistrictName(formData.district)}, {getCityName(formData.city)}</p>
                        {formData.note && <p><span className="font-medium">Ghi chú:</span> {formData.note}</p>}
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                      <h3 className="font-semibold text-gray-900">Phương thức thanh toán</h3>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-sky-100 rounded-full flex items-center justify-center">
                          <CreditCard className="w-4 h-4 text-sky-600" />
                        </div>
                        <span className="font-medium">
                          {formData.paymentMethod === "cod" 
                            ? "Thanh toán khi nhận hàng" 
                            : "Thanh toán online - Chuyển khoản"}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation Buttons */}
              <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0 mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    variant="outline"
                    onClick={handlePrev}
                    disabled={currentStep === 1}
                    className="px-4 sm:px-6 py-2.5 sm:py-3 w-full sm:w-auto"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Quay lại
                  </Button>
                </motion.div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  {currentStep < 3 ? (
                    <Button
                      onClick={handleNext}
                      disabled={!canProceedToNext}
                      className={`px-4 sm:px-6 py-2.5 sm:py-3 w-full sm:w-auto ${
                        canProceedToNext 
                          ? "bg-sky-500 hover:bg-sky-600" 
                          : "bg-gray-300 cursor-not-allowed"
                      }`}
                    >
                      Tiếp tục
                      <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSubmit}
                      disabled={isProcessingPayment}
                      className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 px-6 sm:px-8 py-2.5 sm:py-3 w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isProcessingPayment ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Đang xử lý...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Đặt hàng
                        </>
                      )}
                    </Button>
                  )}
                </motion.div>
              </div>
            </motion.div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1 order-first lg:order-last">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="sticky top-4 sm:top-6 lg:top-8"
            >
              <OrderSummary items={checkoutItems} />
            </motion.div>
          </div>
        </div>
        </div>
      </main>
      
      <Footer />
      <Botchat />
      
      {/* Login Modal */}
      <LoginModal isOpen={loginModalOpen} onClose={() => setLoginModalOpen(false)} />
      
      {/* Payment Processing Modal */}
      {/* Sepay QR Payment Modal */}
      {showSepayQR && sepayQRData && (
        <SepayQRPayment
          orderCode={sepayQRData.orderCode}
          amount={sepayQRData.amount}
          bankAccount={sepayQRData.bankAccount}
          bankName={sepayQRData.bankName}
          onSuccess={() => {
            setShowSepayQR(false);
            // Clear cart after successful payment
            if (buyNowItems.length > 0) {
              clearBuyNowItems();
            }
            router.push(`/success?order=${sepayQRData.orderCode}`);
          }}
          onCancel={() => {
            setShowSepayQR(false);
            setSepayQRData(null);
          }}
        />
      )}
    </div>
  );
}