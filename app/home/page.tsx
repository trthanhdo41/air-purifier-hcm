"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BrandLogos from "@/components/sections/BrandLogos";
import QuickCategories from "@/components/sections/QuickCategories";
import CategoryTabs from "@/components/sections/CategoryTabs";
import InfoSection from "@/components/sections/InfoSection";
import FAQ from "@/components/sections/FAQ";
import UserQA from "@/components/sections/UserQA";
import Botchat from "@/components/Botchat";
import { Phone, Wind, Shield, Zap, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useState, useEffect } from "react";

export default function HomePage() {
  const [displayedText, setDisplayedText] = useState("");
  const [displayedDesc, setDisplayedDesc] = useState("");
  const [textIndex, setTextIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [statsCount, setStatsCount] = useState({
    products: 0,
    customers: 0,
    rating: 0,
    efficiency: 0
  });
  
  const headlines = [
    "Máy lọc không khí\ncao cấp",
    "Không khí sạch\nCho gia đình",
    "Công nghệ HEPA\nLọc 99.97%",
    "Bảo vệ sức khỏe\nMỗi ngày"
  ];
  
  const descriptions = [
    "Bảo vệ sức khỏe gia đình với công nghệ lọc không khí tiên tiến. Loại bỏ 99.97% bụi mịn, vi khuẩn và chất độc hại.",
    "Không gian sống trong lành, an toàn cho mọi thành viên. Công nghệ tiên tiến từ các thương hiệu hàng đầu thế giới.",
    "Lọc bụi mịn PM2.5, vi khuẩn, virus và các chất gây dị ứng. Phù hợp cho phòng ngủ, phòng khách và văn phòng.",
    "Giải pháp hoàn hảo cho không khí trong nhà. Hoạt động êm ái, tiết kiệm điện năng hiệu quả."
  ];

  useEffect(() => {
    let currentIndex = 0;
    
    const typeText = () => {
      const currentHeadline = headlines[textIndex];
      const currentDesc = descriptions[textIndex];
      
      // Type headline
      const typeHeadline = setInterval(() => {
        if (currentIndex <= currentHeadline.length) {
          setDisplayedText(currentHeadline.slice(0, currentIndex));
          currentIndex++;
        } else {
          clearInterval(typeHeadline);
          currentIndex = 0;
          
          // Type description
          const typeDesc = setInterval(() => {
            if (currentIndex <= currentDesc.length) {
              setDisplayedDesc(currentDesc.slice(0, currentIndex));
              currentIndex++;
            } else {
              clearInterval(typeDesc);
              
              // Wait 4 seconds, then slide to next
              setTimeout(() => {
                setIsAnimating(true);
                // Wait for animation to complete
                setTimeout(() => {
                  setIsAnimating(false);
                  setDisplayedText("");
                  setDisplayedDesc("");
                  setTextIndex((prev) => (prev + 1) % headlines.length);
                }, 800); // Match animation duration
              }, 4000);
            }
          }, 20);
        }
      }, 60);
    };
    
    if (!isAnimating && displayedText === "" && displayedDesc === "") {
      typeText();
    }
  }, [textIndex, isAnimating, displayedText, displayedDesc]);

  // Counter animation for stats
  useEffect(() => {
    const duration = 2000; // 2 seconds
    const steps = 60;
    const interval = duration / steps;

    const targets = {
      products: 25,
      customers: 10000,
      rating: 4.8,
      efficiency: 99.97
    };

    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      
      setStatsCount({
        products: Math.floor(targets.products * progress),
        customers: Math.floor(targets.customers * progress),
        rating: parseFloat((targets.rating * progress).toFixed(1)),
        efficiency: parseFloat((targets.efficiency * progress).toFixed(2))
      });

      if (step >= steps) {
        clearInterval(timer);
        setStatsCount(targets); // Ensure final values are exact
      }
    }, interval);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen">
      <Header />

      <main className="overflow-x-hidden">
        {/* Hero Banner - Mobile Super Optimized */}
        <section id="hero" className="relative h-[55vh] min-h-[450px] sm:h-[65vh] sm:min-h-[550px] md:h-[70vh] md:min-h-[600px] flex items-center overflow-hidden scroll-mt-[150px]">
          {/* Full Background Image */}
          <div className="absolute inset-0">
            <Image
              src="/trang-chu.png"
              alt="Máy lọc không khí cao cấp"
              fill
              priority
              className="object-cover"
            />
            {/* Gradient overlay - stronger on mobile */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/20 sm:from-black/50 sm:via-black/30 md:from-black/40 md:via-black/20" />
          </div>

          {/* Content - Mobile Super Optimized */}
          <div className="container mx-auto px-3 sm:px-4 md:px-6 relative z-10">
            <div className="max-w-4xl">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                {/* Badge */}
                <div className="inline-block mb-3 sm:mb-4 md:mb-6">
                  <span className="text-[10px] sm:text-xs md:text-sm font-bold text-white tracking-wide sm:tracking-wider md:tracking-widest uppercase bg-black/30 backdrop-blur-sm px-2.5 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2 rounded-full border border-white/40">
                    KHÔNG KHÍ SẠCH CHO GIA ĐÌNH
                  </span>
                </div>

                {/* Headline - Typewriter with Slide Animation */}
                <div className="overflow-hidden min-h-[2.5em] mb-3 sm:mb-4 md:mb-6">
                  <motion.h1 
                    key={`headline-${textIndex}`}
                    initial={{ y: 60, opacity: 0 }}
                    animate={{ 
                      y: isAnimating ? -60 : 0, 
                      opacity: isAnimating ? 0 : 1 
                    }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight typewriter-text"
                  >
                    {displayedText.split('\n').map((line, index) => (
                      <span key={index}>
                        {index === 0 ? line : <span className="text-sky-300 sm:text-sky-200">{line}</span>}
                        {index === 0 && <br />}
                      </span>
                    ))}
                    {displayedText && <span className="animate-pulse ml-0.5">|</span>}
                  </motion.h1>
                </div>

                {/* Description - Typewriter with Slide Animation */}
                <div className="overflow-hidden min-h-[3em] mb-5 sm:mb-6 md:mb-8">
                  <motion.p 
                    key={`desc-${textIndex}`}
                    initial={{ y: 40, opacity: 0 }}
                    animate={{ 
                      y: isAnimating ? -40 : 0, 
                      opacity: isAnimating ? 0 : 1 
                    }}
                    transition={{ duration: 0.8, ease: "easeInOut", delay: 0.1 }}
                    className="text-xs sm:text-sm md:text-base lg:text-xl xl:text-2xl text-white/95 leading-relaxed max-w-3xl typewriter-text"
                  >
                    {displayedDesc}
                    {displayedDesc && <span className="animate-pulse ml-0.5">|</span>}
                  </motion.p>
                </div>

                {/* CTAs - Mobile Optimized */}
                <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 md:gap-4 mb-6 sm:mb-8 md:mb-10">
                  <motion.a
                    href="#products"
                    whileHover={{ scale: 1.08, y: -3 }}
                    whileTap={{ scale: 0.92 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="bg-gradient-to-r from-sky-400 to-blue-500 text-white px-5 py-2.5 sm:px-8 sm:py-3 md:px-10 md:py-4 rounded-lg sm:rounded-xl text-sm sm:text-base md:text-lg font-bold hover:from-sky-500 hover:to-blue-600 transition-all duration-200 shadow-xl hover:shadow-2xl text-center"
                  >
                    <motion.span
                      animate={{ x: [0, 3, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      Khám phá ngay →
                    </motion.span>
                  </motion.a>
                  <motion.a 
                    href="tel:18002097" 
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="bg-white/15 backdrop-blur-sm border-2 border-white/40 text-white px-5 py-2.5 sm:px-8 sm:py-3 md:px-10 md:py-4 rounded-lg sm:rounded-xl text-sm sm:text-base md:text-lg font-bold hover:bg-white/30 hover:border-white/60 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                  >
                    <motion.div
                      animate={{ rotate: [0, -15, 15, -15, 15, 0] }}
                      transition={{ 
                        duration: 0.6, 
                        repeat: Infinity, 
                        repeatDelay: 2,
                        ease: "easeInOut"
                      }}
                    >
                      <Phone className="w-4 h-4 md:w-5 md:h-5" />
                    </motion.div>
                    1800 2097
                  </motion.a>
                </div>

                {/* Stats - Mobile Grid with Counter Animation */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4 lg:gap-6">
                  <motion.div 
                    className="bg-white/15 backdrop-blur-sm rounded-lg sm:rounded-xl px-2.5 py-2 sm:px-3 sm:py-2.5 md:px-4 md:py-3 border border-white/30 hover:bg-white/25 hover:border-white/50 transition-all duration-200 cursor-pointer"
                    whileHover={{ scale: 1.05, y: -3 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                  >
                    <div className="font-bold text-lg sm:text-xl md:text-2xl text-white mb-0.5">
                      {statsCount.products}+
                    </div>
                    <div className="text-[10px] sm:text-xs md:text-sm text-white/90">Sản phẩm</div>
                  </motion.div>
                  <motion.div 
                    className="bg-white/15 backdrop-blur-sm rounded-lg sm:rounded-xl px-2.5 py-2 sm:px-3 sm:py-2.5 md:px-4 md:py-3 border border-white/30 hover:bg-white/25 hover:border-white/50 transition-all duration-200 cursor-pointer"
                    whileHover={{ scale: 1.05, y: -3 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                  >
                    <div className="font-bold text-lg sm:text-xl md:text-2xl text-white mb-0.5">
                      {statsCount.customers >= 1000 ? `${Math.floor(statsCount.customers / 1000)}K` : statsCount.customers}+
                    </div>
                    <div className="text-[10px] sm:text-xs md:text-sm text-white/90">Khách hàng</div>
                  </motion.div>
                  <motion.div 
                    className="bg-white/15 backdrop-blur-sm rounded-lg sm:rounded-xl px-2.5 py-2 sm:px-3 sm:py-2.5 md:px-4 md:py-3 border border-white/30 hover:bg-white/25 hover:border-white/50 transition-all duration-200 cursor-pointer"
                    whileHover={{ scale: 1.05, y: -3 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                  >
                    <div className="font-bold text-lg sm:text-xl md:text-2xl text-white mb-0.5">
                      {statsCount.rating.toFixed(1)}★
                    </div>
                    <div className="text-[10px] sm:text-xs md:text-sm text-white/90">Đánh giá</div>
                  </motion.div>
                  <motion.div 
                    className="bg-white/15 backdrop-blur-sm rounded-lg sm:rounded-xl px-2.5 py-2 sm:px-3 sm:py-2.5 md:px-4 md:py-3 border border-white/30 hover:bg-white/25 hover:border-white/50 transition-all duration-200 cursor-pointer"
                    whileHover={{ scale: 1.05, y: -3 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                  >
                    <div className="font-bold text-lg sm:text-xl md:text-2xl text-white mb-0.5">
                      {statsCount.efficiency.toFixed(2)}%
                    </div>
                    <div className="text-[10px] sm:text-xs md:text-sm text-white/90">Hiệu quả lọc</div>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Vấn đề => Giải pháp Section - Mobile Optimized */}
        <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-b from-sky-50 to-white">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-6xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center mb-10 sm:mb-12 md:mb-16"
              >
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
                  Vấn đề <span className="text-orange-500">→</span> Giải pháp
                </h2>
                <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto px-4">
                  Không khí trong nhà có thể ô nhiễm gấp 2-5 lần so với không khí ngoài trời
                </p>
              </motion.div>

              <div className="grid md:grid-cols-2 gap-6 sm:gap-8 md:gap-12 items-center">
                {/* Vấn đề */}
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                  className="bg-orange-50 p-5 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl border border-orange-200"
                >
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-orange-600 mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-orange-500 rounded-full flex items-center justify-center shrink-0">
                      <span className="text-white font-bold text-sm sm:text-base">!</span>
                    </div>
                    Vấn đề
                  </h3>
                  <ul className="space-y-3 sm:space-y-4 text-sm sm:text-base text-gray-700">
                    <li className="flex items-start gap-2 sm:gap-3">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-orange-500 rounded-full mt-1.5 sm:mt-2 shrink-0"></div>
                      <span>Bụi mịn PM2.5, PM10 gây hại cho phổi</span>
                    </li>
                    <li className="flex items-start gap-2 sm:gap-3">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-orange-500 rounded-full mt-1.5 sm:mt-2 shrink-0"></div>
                      <span>Vi khuẩn, virus trong không khí</span>
                    </li>
                    <li className="flex items-start gap-2 sm:gap-3">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-orange-500 rounded-full mt-1.5 sm:mt-2 shrink-0"></div>
                      <span>Khí độc từ nội thất, sơn</span>
                    </li>
                    <li className="flex items-start gap-2 sm:gap-3">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-orange-500 rounded-full mt-1.5 sm:mt-2 shrink-0"></div>
                      <span>Mùi hôi, nấm mốc</span>
                    </li>
                  </ul>
                </motion.div>

                {/* Giải pháp */}
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                  className="bg-sky-50 p-5 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl border border-sky-200"
                >
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-sky-600 mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-sky-500 rounded-full flex items-center justify-center shrink-0">
                      <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                    </div>
                    Giải pháp
                  </h3>
                  <ul className="space-y-3 sm:space-y-4 text-sm sm:text-base text-gray-700">
                    <li className="flex items-start gap-2 sm:gap-3">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-sky-500 rounded-full mt-1.5 sm:mt-2 shrink-0"></div>
                      <span>Công nghệ HEPA lọc 99.97% bụi mịn</span>
                    </li>
                    <li className="flex items-start gap-2 sm:gap-3">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-sky-500 rounded-full mt-1.5 sm:mt-2 shrink-0"></div>
                      <span>UV-C tiêu diệt vi khuẩn, virus</span>
                    </li>
                    <li className="flex items-start gap-2 sm:gap-3">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-sky-500 rounded-full mt-1.5 sm:mt-2 shrink-0"></div>
                      <span>Carbon hoạt tính hấp thụ khí độc</span>
                    </li>
                    <li className="flex items-start gap-2 sm:gap-3">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-sky-500 rounded-full mt-1.5 sm:mt-2 shrink-0"></div>
                      <span>Ion âm khử mùi, diệt nấm mốc</span>
                    </li>
                  </ul>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Tổng quan sản phẩm - Mobile Optimized */}
        <section className="py-12 sm:py-16 md:py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-10 sm:mb-12 md:mb-16"
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
                Tổng quan sản phẩm
              </h2>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto px-4">
                Đa dạng công nghệ lọc không khí phù hợp với mọi không gian
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-5xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-center p-5 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl bg-gradient-to-b from-sky-50 to-white border border-sky-200 hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-sky-500 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <Wind className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
                </div>
                <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Máy lọc HEPA</h3>
                <p className="text-xs sm:text-sm md:text-base text-gray-600 mb-3 sm:mb-4">Lọc 99.97% bụi mịn PM2.5, phù hợp cho phòng ngủ, phòng khách</p>
                <div className="text-sky-600 font-bold text-sm sm:text-base md:text-lg">Từ 2.490.000đ</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-center p-5 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl bg-gradient-to-b from-teal-50 to-white border border-teal-200 hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-teal-500 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <Zap className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
                </div>
                <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Máy lọc Ion</h3>
                <p className="text-xs sm:text-sm md:text-base text-gray-600 mb-3 sm:mb-4">Tạo ion âm khử mùi, diệt khuẩn tự nhiên, tiết kiệm điện</p>
                <div className="text-teal-600 font-bold text-sm sm:text-base md:text-lg">Từ 3.290.000đ</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-center p-5 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl bg-gradient-to-b from-indigo-50 to-white border border-indigo-200 hover:shadow-lg transition-shadow sm:col-span-2 md:col-span-1"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
                </div>
                <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Máy lọc UV</h3>
                <p className="text-xs sm:text-sm md:text-base text-gray-600 mb-3 sm:mb-4">UV-C tiêu diệt virus, vi khuẩn, nấm mốc hiệu quả</p>
                <div className="text-indigo-600 font-bold text-sm sm:text-base md:text-lg">Từ 8.990.000đ</div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Brand Logos Grid */}
        <div id="thuong-hieu">
          <BrandLogos />
        </div>

        {/* Quick Categories */}
        <QuickCategories />

        {/* Category Tabs with Products */}
        <div id="san-pham">
          <CategoryTabs />
        </div>

        {/* Info Section */}
        <div id="thong-tin">
          <InfoSection />
        </div>

        {/* FAQ Section */}
        <div id="hoi-dap">
          <FAQ />
        </div>

        {/* User Q&A Section */}
        <div id="khach-hang">
          <UserQA />
        </div>
      </main>

      <Footer />

      {/* Botchat */}
      <div id="tu-van">
        <Botchat />
      </div>
    </div>
  );
}
