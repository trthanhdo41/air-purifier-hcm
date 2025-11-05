"use client";

import { Product } from "@/types";
import { formatPrice } from "@/lib/utils";
import { ShoppingCart, Star, Heart, Eye, Wind, Battery, Zap, Flame, Sparkles, Tag, Truck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useCartStore } from "@/lib/stores/cart";
import Toast from "@/components/Toast";

interface ProductCardProps {
  product: Product;
  index: number;
  compact?: boolean; // Compact mode like CellphoneS
}

export default function ProductCard({ product, index, compact = false }: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { addItem } = useCartStore();
  const discountPercent = product.discount || 0;
  const originalPriceValue = (product as any).originalPrice ?? (product as any).original_price;
  const hasDiscount = discountPercent > 0 || (originalPriceValue && originalPriceValue > product.price);

  // Load wishlist from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
        setIsWishlisted(wishlist.includes(product.id));
      } catch (e) {
        // If localStorage is corrupted, start fresh
        setIsWishlisted(false);
      }
    }
  }, [product.id]);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAddingToCart) {
      try {
        setIsAddingToCart(true);
        addItem(product);
        await new Promise(resolve => setTimeout(resolve, 200));
        setShowToast(true);
      } finally {
        setIsAddingToCart(false);
      }
    }
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (typeof window === 'undefined') return;
    
    try {
      const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      const newWishlisted = !isWishlisted;
      
      if (newWishlisted) {
        // Thêm vào wishlist nếu chưa có
        if (!wishlist.includes(product.id)) {
          wishlist.push(product.id);
          localStorage.setItem('wishlist', JSON.stringify(wishlist));
          setIsWishlisted(true);
          // Trigger custom event để Header cập nhật số lượng
          window.dispatchEvent(new Event('wishlistUpdated'));
        }
      } else {
        // Xóa khỏi wishlist
        const updatedWishlist = wishlist.filter((id: string) => id !== product.id);
        localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
        setIsWishlisted(false);
        // Trigger custom event để Header cập nhật số lượng
        window.dispatchEvent(new Event('wishlistUpdated'));
      }
    } catch (e) {
      console.error('Error updating wishlist:', e);
    }
  };

  // Compact mode - CellphoneS style
  if (compact) {
    return (
      <Link href={`/product/${product.id}`}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.02, duration: 0.3 }}
          className="group relative bg-white rounded-lg overflow-hidden border border-gray-200 hover:border-sky-400 hover:shadow-lg transition-all duration-200 cursor-pointer"
        > 
        {/* Badges */}
        <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
          {product.badge === 'hot' && (
            <span className="bg-orange-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">HOT</span>
          )}
          {hasDiscount && (
            <span className="bg-yellow-400 text-gray-900 text-[10px] font-bold px-2 py-0.5 rounded">-{discountPercent}%</span>
          )}
        </div>

        {/* Image */}
        <div className="relative aspect-square bg-gray-50">
          {!imageLoaded && <div className="absolute inset-0 shimmer" />}
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className={`object-cover group-hover:scale-105 transition-transform duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImageLoaded(true)}
          />
        </div>

        {/* Content - Compact */}
        <div className="p-3 relative z-10">
          {/* Name */}
          <h3 className="text-sm font-medium line-clamp-2 h-10 text-gray-900 mb-3 group-hover:text-sky-500 transition-colors">
            {product.name}
          </h3>

          {/* Specs - Air Purifier Style */}
          <div className="mb-3 space-y-1.5">
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <span className="w-5 h-5 flex items-center justify-center bg-gray-100 rounded">
                <Wind className="w-3 h-3" />
              </span>
              <span>CADR 300 m³/h</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <span className="w-5 h-5 flex items-center justify-center bg-gray-100 rounded">
                <Battery className="w-3 h-3" />
              </span>
              <span>HEPA H13</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <span className="w-5 h-5 flex items-center justify-center bg-gray-100 rounded">
                <Zap className="w-3 h-3" />
              </span>
              <span>Lọc 99.97% bụi mịn</span>
            </div>
          </div>

          {/* Price */}
          <div className="mb-2">
            <div className="text-sky-500 font-bold text-lg">
              {formatPrice(product.price)}
            </div>
            {hasDiscount && originalPriceValue && (
              <div className="flex items-center gap-2">
                <div className="text-gray-400 text-xs line-through">
                  {formatPrice(originalPriceValue)}
                </div>
                <div className="text-[10px] bg-sky-50 text-sky-500 px-1.5 py-0.5 rounded">
                  Trả góp 0%
                </div>
              </div>
            )}
          </div>

          {/* Rating - Compact */}
          {product.rating && (
            <div className="flex items-center gap-1 text-xs text-gray-600 mb-3">
              <span className="text-yellow-500">★</span>
              <span>{product.rating}</span>
              {product.reviews && <span className="text-gray-400">({product.reviews})</span>}
            </div>
          )}

          {/* Add to Cart Button */}
          <motion.button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleAddToCart(e);
            }}
            disabled={isAddingToCart}
            className="relative z-10 w-full bg-sky-500 hover:bg-sky-600 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isAddingToCart ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Đang thêm...</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                Thêm vào giỏ
              </>
            )}
          </motion.button>
        </div>
        
        {/* Toast */}
        {showToast && (
          <Toast
            message={`Đã thêm "${product.name}" vào giỏ hàng`}
            type="success"
            onClose={() => setShowToast(false)}
          />
        )}
        </motion.div>
      </Link>
    );
  }

  // Normal mode - Original design
  return (
    <Link href={`/product/${product.id}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.03, duration: 0.4 }}
        className="group relative bg-white rounded-2xl overflow-hidden shadow-soft hover:shadow-large transition-all duration-300 border border-gray-100/50 card-hover cursor-pointer"
      >
      {/* Quick Actions - shown on hover */}
      <div className="absolute top-3 right-3 z-20 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <motion.button
          onClick={handleWishlist}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-md ${
            isWishlisted 
              ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white' 
              : 'bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-orange-50'
          }`}
          whileHover={{ scale: 1.15, rotate: isWishlisted ? 0 : 10, transition: { duration: 0.15 } }}
          whileTap={{ scale: 0.85, transition: { duration: 0.1 } }}
          animate={isWishlisted ? { scale: [1, 1.2, 1] } : {}}
          transition={{ duration: 0.3 }}
        >
          <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
        </motion.button>
        <motion.button 
          className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-700 hover:bg-sky-50 hover:text-sky-600 transition-all shadow-md"
          whileHover={{ scale: 1.15, transition: { duration: 0.15 } }}
          whileTap={{ scale: 0.85, transition: { duration: 0.1 } }}
        >
          <Eye className="w-5 h-5" />
        </motion.button>
      </div>

      {/* Badge */}
      {product.badge && (
        <div className="absolute top-3 left-3 z-10">
          {product.badge === 'hot' && (
            <Badge variant="hot" className="text-xs font-bold px-3 py-1.5 flex items-center gap-1">
              <Flame className="w-3 h-3" /> HOT
            </Badge>
          )}
          {product.badge === 'new' && (
            <Badge variant="new" className="text-xs font-bold px-3 py-1.5 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> MỚI
            </Badge>
          )}
          {product.badge === 'sale' && (
            <Badge variant="sale" className="text-xs font-bold px-3 py-1.5 flex items-center gap-1">
              <Tag className="w-3 h-3" /> SALE
            </Badge>
          )}
        </div>
      )}

      {/* Discount Badge */}
      {hasDiscount && (
        <div className="absolute top-3 right-3 z-10 bg-gradient-to-br from-yellow-400 to-orange-500 text-gray-900 text-sm font-bold px-3 py-1.5 rounded-full shadow-lg">
          -{discountPercent}%
        </div>
      )}

      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
        {!imageLoaded && (
          <div className="absolute inset-0 shimmer" />
        )}
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className={`object-cover group-hover:scale-105 transition-transform duration-500 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImageLoaded(true)}
        />
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Brand */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {product.brand}
          </span>
          {product.stock < 10 && (
            <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
              Sắp hết
            </span>
          )}
        </div>

        {/* Name */}
        <h3 className="font-semibold text-sm mb-3 line-clamp-2 h-10 text-gray-900 group-hover:text-sky-500 transition-colors leading-tight">
          {product.name}
        </h3>

        {/* Rating */}
        {product.rating && (
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3.5 h-3.5 ${
                    i < Math.floor(product.rating!)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'fill-gray-200 text-gray-200'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs font-semibold text-gray-700">
              {product.rating}
            </span>
            {product.reviews && (
              <span className="text-xs text-gray-400">
                ({product.reviews.toLocaleString()})
              </span>
            )}
          </div>
        )}

        {/* Price */}
        <div className="mb-4">
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-sky-500 font-bold text-xl">
              {formatPrice(product.price)}
            </span>
          </div>
          {hasDiscount && originalPriceValue && (
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-sm line-through">
                {formatPrice(originalPriceValue)}
              </span>
              <span className="text-xs font-semibold text-sky-500 bg-sky-50 px-2 py-0.5 rounded-full">
                Tiết kiệm {formatPrice(originalPriceValue - product.price)}
              </span>
            </div>
          )}
        </div>

        {/* Add to cart button */}
        <motion.div
          whileHover={{ scale: 1.02, transition: { duration: 0.15 } }}
          whileTap={{ scale: 0.98, transition: { duration: 0.1 } }}
          className="relative z-10"
        >
          <Button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleAddToCart(e);
            }}
            disabled={isAddingToCart}
            className="w-full group-hover:shadow-xl-colored bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            size="lg"
          >
            {isAddingToCart ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Đang thêm...</span>
              </>
            ) : (
              <>
                <motion.div
                  animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
                >
                  <ShoppingCart className="w-4 h-4" />
                </motion.div>
                <span>Thêm vào giỏ</span>
              </>
            )}
          </Button>
        </motion.div>

        {/* Free shipping badge */}
        {product.price >= 300000 && (
          <div className="mt-3 text-center">
            <span className="text-xs font-medium text-sky-500 bg-sky-50 px-3 py-1.5 rounded-full inline-flex items-center gap-1">
              <Truck className="w-3 h-3" /> Miễn phí vận chuyển
            </span>
          </div>
        )}
      </div>
      
        {/* Toast */}
        {showToast && (
          <Toast
            message={`Đã thêm "${product.name}" vào giỏ hàng`}
            type="success"
            onClose={() => setShowToast(false)}
          />
        )}
      </motion.div>
    </Link>
  );
}
