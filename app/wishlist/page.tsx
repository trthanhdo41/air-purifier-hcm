"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Botchat from "@/components/Botchat";
import ProductCard from "@/components/ProductCard";
import { createClient } from "@/lib/supabase/client";
import { Product } from "@/types";
import { Heart, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";

export default function WishlistPage() {
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load wishlist from localStorage
    if (typeof window !== 'undefined') {
      try {
        const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
        setWishlistIds(wishlist);
      } catch (e) {
        setWishlistIds([]);
      }
    }
  }, []);

  useEffect(() => {
    const loadProducts = async () => {
      if (wishlistIds.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const supabase = createClient();
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .in('id', wishlistIds)
          .eq('status', 'active');

        if (!error && data) {
          // Sort products to match wishlist order
          const sortedProducts = wishlistIds
            .map(id => data.find(p => p.id === id))
            .filter(Boolean) as Product[];
          setProducts(sortedProducts);
        } else {
          setProducts([]);
        }
      } catch (e) {
        console.error('Error loading wishlist products:', e);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [wishlistIds]);

  // Listen for wishlist updates
  useEffect(() => {
    const handleWishlistUpdate = () => {
      if (typeof window !== 'undefined') {
        try {
          const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
          setWishlistIds(wishlist);
        } catch (e) {
          setWishlistIds([]);
        }
      }
    };

    window.addEventListener('wishlistUpdated', handleWishlistUpdate);
    window.addEventListener('storage', handleWishlistUpdate);

    return () => {
      window.removeEventListener('wishlistUpdated', handleWishlistUpdate);
      window.removeEventListener('storage', handleWishlistUpdate);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-gray-200 rounded-lg h-80" />
              ))}
            </div>
          </div>
        </main>
        <Footer />
        <Botchat />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center">
              <Heart className="w-6 h-6 text-white fill-current" />
            </div>
            Sản phẩm yêu thích
          </h1>
          <p className="text-gray-600">
            {products.length > 0 
              ? `Bạn có ${products.length} sản phẩm trong danh sách yêu thích`
              : 'Chưa có sản phẩm nào trong danh sách yêu thích'
            }
          </p>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-20">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <Heart className="w-12 h-12 text-gray-400" />
            </motion.div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Danh sách yêu thích trống
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Bạn chưa có sản phẩm nào trong danh sách yêu thích. Hãy khám phá và thêm sản phẩm bạn thích vào danh sách này nhé!
            </p>
            <motion.a
              href="/home"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-sky-500 to-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              <ShoppingBag className="w-5 h-5" />
              Khám phá sản phẩm
            </motion.a>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {products.map((product, index) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                index={index} 
                compact 
              />
            ))}
          </div>
        )}
      </main>
      <Footer />
      <Botchat />
    </div>
  );
}

