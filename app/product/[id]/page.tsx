"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { createClient } from "@/lib/supabase/client";
import { Product } from "@/types";
import { formatPrice } from "@/lib/utils";
import { 
  ShoppingCart, 
  Heart, 
  Star, 
  Wind, 
  Battery, 
  Zap, 
  Shield, 
  Truck, 
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Check,
  X
} from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/lib/stores/cart";
import Toast from "@/components/Toast";
import ProductCard from "@/components/ProductCard";
import InfoSection from "@/components/sections/InfoSection";
import FAQ from "@/components/sections/FAQ";
import UserQA from "@/components/sections/UserQA";
import Botchat from "@/components/Botchat";
import { MessageCircle, Mail, Phone } from "lucide-react";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [zoomPosition, setZoomPosition] = useState<{ x: number; y: number } | null>(null);
  const [showZoom, setShowZoom] = useState(false);
  
  const { addItem, updateQuantity, setBuyNowItems } = useCartStore();

  // Load wishlist from localStorage on mount and when productId changes
  useEffect(() => {
    if (productId && typeof window !== 'undefined') {
      try {
        const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
        setIsWishlisted(wishlist.includes(productId));
      } catch (e) {
        // If localStorage is corrupted, start fresh
        setIsWishlisted(false);
      }
    }
  }, [productId]);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        const supabase = createClient();
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', productId)
          .eq('status', 'active')
          .single();

        if (!error && data) {
          setProduct(data as Product);
          
          // Load related products (same category or brand)
          const { data: relatedData, error: relatedError } = await supabase
            .from('products')
            .select('*')
            .eq('status', 'active')
            .neq('id', productId)
            .or(`category.eq.${data.category},brand.eq.${data.brand}`)
            .limit(8);
          
          if (!relatedError && relatedData) {
            setRelatedProducts(relatedData as Product[]);
          }
        } else {
          setProduct(null);
        }
      } catch (e) {
        console.error('Error loading product:', e);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      loadProduct();
    }
  }, [productId]);

  const images = product?.images && product.images.length > 0 
    ? product.images 
    : product?.image 
      ? [product.image] 
      : [];

  const discountPercent = product?.discount || 0;
  const originalPriceValue = product?.original_price || product?.originalPrice;
  const hasDiscount = discountPercent > 0 || (originalPriceValue && originalPriceValue > (product?.price || 0));

  const handleAddToCart = () => {
    if (product) {
      for (let i = 0; i < quantity; i++) {
        addItem(product);
      }
      setToastMessage(`Đã thêm ${quantity} sản phẩm "${product.name}" vào giỏ hàng`);
      setShowToast(true);
    }
  };

  const handleBuyNow = async () => {
    if (product && product.stock > 0) {
      try {
        // Set buyNowItems với chỉ sản phẩm hiện tại (không ảnh hưởng đến giỏ hàng cũ)
        setBuyNowItems([{ product, quantity }]);
        
        // Đợi một chút để đảm bảo state đã được cập nhật
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Chuyển đến trang thanh toán
        router.push('/checkout');
      } catch (e) {
        console.error('Error setting buy now items:', e);
        setToastMessage('Có lỗi xảy ra khi xử lý đơn hàng');
        setShowToast(true);
      }
    } else {
      setToastMessage('Sản phẩm hiện không có sẵn');
      setShowToast(true);
    }
  };

  const handleQuantityChange = (delta: number) => {
    if (product) {
      const newQuantity = Math.max(1, Math.min(product.stock, quantity + delta));
      setQuantity(newQuantity);
    }
  };

  const handleToggleWishlist = () => {
    if (!productId || typeof window === 'undefined') return;
    
    try {
      const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      const newWishlisted = !isWishlisted;
      
      if (newWishlisted) {
        // Thêm vào wishlist nếu chưa có
        if (!wishlist.includes(productId)) {
          wishlist.push(productId);
          localStorage.setItem('wishlist', JSON.stringify(wishlist));
          setIsWishlisted(true);
          setToastMessage(`Đã thêm "${product?.name}" vào yêu thích`);
          setShowToast(true);
          // Trigger custom event để Header cập nhật số lượng
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('wishlistUpdated'));
          }
        }
      } else {
        // Xóa khỏi wishlist
        const updatedWishlist = wishlist.filter((id: string) => id !== productId);
        localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
        setIsWishlisted(false);
        setToastMessage(`Đã xóa "${product?.name}" khỏi yêu thích`);
        setShowToast(true);
        // Trigger custom event để Header cập nhật số lượng
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('wishlistUpdated'));
        }
      }
    } catch (e) {
      console.error('Error updating wishlist:', e);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-20">
          <div className="animate-pulse">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-gray-200 rounded-lg aspect-square" />
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="max-w-md mx-auto">
            <X className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy sản phẩm</h1>
            <p className="text-gray-600 mb-6">Sản phẩm bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
            <Button onClick={() => router.push('/home')} className="gradient-primary text-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Về trang chủ
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="container mx-auto px-4 py-6 md:py-12">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Quay lại</span>
        </button>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          <div className="space-y-4">
            <div 
              className="relative aspect-square bg-gray-50 rounded-xl overflow-hidden border border-gray-200 group cursor-zoom-in"
              onMouseMove={(e) => {
                if (!showZoom) return;
                const rect = e.currentTarget.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;
                setZoomPosition({ x, y });
              }}
              onMouseEnter={() => setShowZoom(true)}
              onMouseLeave={() => {
                setShowZoom(false);
                setZoomPosition(null);
              }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedImageIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="relative w-full h-full"
                >
                  <Image
                    src={images[selectedImageIndex] || product.image}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-contain"
                    priority
                    style={{
                      transform: showZoom && zoomPosition ? `scale(2) translate(${(zoomPosition.x - 50) * -0.5}%, ${(zoomPosition.y - 50) * -0.5}%)` : 'scale(1)',
                      transformOrigin: zoomPosition ? `${zoomPosition.x}% ${zoomPosition.y}%` : 'center center',
                      transition: 'transform 0.1s ease-out',
                    }}
                  />
                </motion.div>
              </AnimatePresence>
              
              {images.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length);
                    }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors z-30"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-700" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImageIndex((prev) => (prev + 1) % images.length);
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors z-30"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-700" />
                  </button>
                </>
              )}
            </div>

            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImageIndex === index
                        ? 'border-sky-500 ring-2 ring-sky-200'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${product.name} ${index + 1}`}
                      fill
                      sizes="(max-width: 768px) 25vw, 12.5vw"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-2">
              {product.badge === 'hot' && (
                <Badge className="bg-orange-600 text-white">HOT</Badge>
              )}
              {hasDiscount && (
                <Badge className="bg-yellow-400 text-gray-900">
                  Giảm {discountPercent || Math.round(((originalPriceValue! - product.price) / originalPriceValue!) * 100)}%
                </Badge>
              )}
              {product.badge === 'new' && (
                <Badge className="bg-green-500 text-white">MỚI</Badge>
              )}
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              {product.name}
            </h1>

            {product.rating && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(product.rating || 0)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-gray-600 font-medium">
                  {product.rating.toFixed(1)}
                </span>
                {product.reviews && (
                  <span className="text-gray-500">
                    ({product.reviews} đánh giá)
                  </span>
                )}
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <span className="text-3xl md:text-4xl font-bold text-sky-600">
                  {formatPrice(product.price)}
                </span>
                {hasDiscount && originalPriceValue && (
                  <span className="text-xl text-gray-400 line-through">
                    {formatPrice(originalPriceValue)}
                  </span>
                )}
              </div>
              {hasDiscount && (
                <p className="text-green-600 font-medium">
                  Tiết kiệm {formatPrice(originalPriceValue! - product.price)}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              {product.stock > 0 ? (
                <>
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-green-600 font-medium">
                    Còn hàng ({product.stock} sản phẩm)
                  </span>
                </>
              ) : (
                <>
                  <X className="w-5 h-5 text-red-500" />
                  <span className="text-red-600 font-medium">Hết hàng</span>
                </>
              )}
            </div>

            {product.description && (
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-sky-100 rounded-lg flex items-center justify-center">
                  <Wind className="w-5 h-5 text-sky-600" />
                </div>
                <div>
                  <div className="text-xs text-gray-500">CADR</div>
                  <div className="font-semibold text-gray-900">300 m³/h</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-sky-100 rounded-lg flex items-center justify-center">
                  <Battery className="w-5 h-5 text-sky-600" />
                </div>
                <div>
                  <div className="text-xs text-gray-500">Bộ lọc</div>
                  <div className="font-semibold text-gray-900">HEPA H13</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-sky-100 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-sky-600" />
                </div>
                <div>
                  <div className="text-xs text-gray-500">Hiệu quả</div>
                  <div className="font-semibold text-gray-900">99.97%</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-sky-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-sky-600" />
                </div>
                <div>
                  <div className="text-xs text-gray-500">Bảo hành</div>
                  <div className="font-semibold text-gray-900">24 tháng</div>
                </div>
              </div>
            </div>

            {product.stock > 0 && (
              <div className="flex items-center gap-4">
                <span className="font-medium text-gray-700">Số lượng:</span>
                <div className="flex items-center gap-2 border border-gray-300 rounded-lg">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                  >
                    −
                  </button>
                  <span className="px-4 py-2 font-semibold text-gray-900 min-w-[60px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= product.stock}
                    className="px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-3 pt-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleBuyNow}
                  disabled={product.stock === 0}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-700 text-white h-14 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-2xl transition-all duration-200"
                >
                  Mua ngay
                </Button>
                <Button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="flex-1 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white h-14 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-2xl transition-all duration-200"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Thêm vào giỏ hàng
                </Button>
              </div>
              <Button
                onClick={handleToggleWishlist}
                variant="outline"
                className={`w-full h-12 ${
                  isWishlisted
                    ? 'bg-red-50 border-red-300 text-red-600'
                    : ''
                }`}
              >
                <Heart className={`w-5 h-5 mr-2 ${isWishlisted ? 'fill-red-600' : ''}`} />
                {isWishlisted ? 'Đã yêu thích' : 'Yêu thích'}
              </Button>
            </div>

            <div className="flex items-start gap-3 p-4 bg-sky-50 rounded-xl border border-sky-200">
              <Truck className="w-5 h-5 text-sky-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-gray-700">
                <p className="font-semibold text-gray-900 mb-1">Giao hàng nhanh</p>
                <p>Miễn phí vận chuyển cho đơn hàng từ 500.000đ</p>
                <p>Giao hàng hỏa tốc 2H tại TP.HCM</p>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-16 md:mt-20 pt-12 border-t border-gray-200">
            <div className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                Sản phẩm liên quan
              </h2>
              <p className="text-gray-600">
                Các sản phẩm tương tự bạn có thể quan tâm
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
              {relatedProducts.map((relatedProduct, index) => (
                <ProductCard 
                  key={relatedProduct.id} 
                  product={relatedProduct} 
                  index={index} 
                  compact 
                />
              ))}
            </div>
          </section>
        )}

        {/* Info Section */}
        <section id="thong-tin" className="mt-16 md:mt-20 pt-12 border-t border-gray-200">
          <InfoSection />
        </section>

        {/* FAQ Section */}
        <section id="hoi-dap" className="mt-16 md:mt-20 pt-12 border-t border-gray-200">
          <FAQ />
        </section>

        {/* User Q&A Section */}
        <section id="khach-hang" className="mt-16 md:mt-20 pt-12 border-t border-gray-200">
          <UserQA />
        </section>

        {/* Consultation Section */}
        <section id="tu-van" className="mt-16 md:mt-20 pt-12 border-t border-gray-200 py-16 md:py-20 bg-gradient-to-br from-sky-50 via-white to-blue-50 relative overflow-hidden rounded-2xl">
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Cần tư vấn?
              </h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                Đội ngũ chuyên gia của chúng tôi sẵn sàng hỗ trợ bạn 24/7
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all border border-gray-100 text-center"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-sky-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Phone className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Hotline</h3>
                <a href="tel:18002097" className="text-2xl font-bold text-sky-600 hover:text-sky-700 transition-colors block mb-3">
                  1800 2097
                </a>
                <p className="text-sm text-gray-600">24/7 miễn phí</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all border border-gray-100 text-center"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <MessageCircle className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Chat trực tuyến</h3>
                <button className="text-sky-600 hover:text-sky-700 font-semibold mb-3">
                  Nhấn để chat
                </button>
                <p className="text-sm text-gray-600">Phản hồi ngay lập tức</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all border border-gray-100 text-center"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Mail className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Email</h3>
                <a href="mailto:info@hoithoxanh.com" className="text-sky-600 hover:text-sky-700 font-semibold mb-3 block break-all">
                  info@hoithoxanh.com
                </a>
                <p className="text-sm text-gray-600">Phản hồi trong 24h</p>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-center mt-12"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="gradient-primary text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all"
              >
                Để lại thông tin, chúng tôi sẽ liên hệ
              </motion.button>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />

      <Botchat />

      {showToast && (
        <Toast
          message={toastMessage}
          type="success"
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
}

