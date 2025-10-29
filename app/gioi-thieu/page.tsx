"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Botchat from "@/components/Botchat";
import { motion } from "framer-motion";
import { Phone, Mail, MapPin, Award, Target, Lightbulb, Heart } from "lucide-react";
import { useEffect, useState } from "react";

export default function IntroPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const features = [
    {
      icon: Award,
      title: "NỀN TẢNG",
      description: "Cánh chú chim là Sách\nSách tượng trưng Tri thức\nChim không chân, chim không có lối\nCầu lấy Sách, cầu lấy đường bay"
    },
    {
      icon: Target,
      title: "MỤC TIÊU",
      description: "Đất Nước đi đâu, mình đi đó.\nNăm 2045 nước Việt Nam là một nước Phát triển,\nấy thế mà theo vậy."
    },
    {
      icon: Lightbulb,
      title: "TÔN CHỈ",
      description: "Cân bằng\nHiền Trí Nguyễn Văn luôn đảm bảo\nquyền lợi cân bằng cho bất cứ ai\nđến với Hiền Trí Nguyễn Văn"
    },
    {
      icon: Heart,
      title: "GIÁ TRỊ",
      description: "Phần này có lẽ Hiền Trí Nguyễn Văn\nkính nhờ quý Độc giả/ Khách hàng\nviết nên sẽ hay hơn."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section with Cityscape and Bubbles */}
      <section className="relative h-[75vh] min-h-[600px] w-full overflow-hidden">
        {/* Background Image */}
        <img 
          src="https://static.vinwonders.com/production/2025/02/canh-dep-sai-gon-banner.jpg"
          alt="Saigon Skyline"
          className="absolute inset-0 w-full h-full object-cover"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-transparent"></div>
        
        {/* Floating Bubbles with Real SVG */}
        {mounted && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(12)].map((_, i) => {
              const duration = 8 + Math.random() * 6;
              const startX = Math.random() * 1200;
              const startDelay = Math.random() * 2;
              const size = 40 + Math.random() * 80;
              
              return (
                <motion.div
                  key={i}
                  className="absolute"
                  initial={{ 
                    x: startX,
                    y: 800,
                    opacity: 0,
                    scale: 0,
                    rotate: 0
                  }}
                  animate={{ 
                    y: -200,
                    x: startX + Math.sin(i) * 50,
                    opacity: [0, 0.25, 0.25, 0],
                    scale: [0, 1, 1, 0.5],
                    rotate: 360
                  }}
                  transition={{ 
                    duration: duration,
                    repeat: Infinity,
                    delay: startDelay,
                    ease: "linear",
                    repeatDelay: 0
                  }}
                >
                  <img 
                    src="/bubble.svg" 
                    alt="Bubble"
                    style={{
                      width: `${size}px`,
                      height: `${size}px`,
                      filter: "brightness(1.2) drop-shadow(0 2px 4px rgba(255,255,255,0.1))"
                    }}
                  />
                </motion.div>
              );
            })}
          </div>
        )}
        
        {/* Hero Content */}
        <div className="relative z-10 h-full flex items-center justify-center">
          <div className="max-w-5xl mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 tracking-tight drop-shadow-2xl">
                GIỚI THIỆU CHUNG
              </h1>
              <p className="text-2xl md:text-3xl font-bold text-white/95 mb-2 drop-shadow-xl">
                CÔNG TY TNHH HIỀN TRÍ NGUYỄN VĂN
              </p>
              <p className="text-xl md:text-2xl font-semibold text-white/90 drop-shadow-lg">
                CHUYÊN MÁY LỌC KHÔNG KHÍ CAO CẤP
              </p>
            </motion.div>
          </div>
        </div>

        {/* Smooth Wave Separator */}
        <div className="absolute bottom-0 left-0 right-0 z-20">
          <svg viewBox="0 0 1440 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-20 md:h-28" preserveAspectRatio="none">
            <defs>
              <linearGradient id="waveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="white" stopOpacity="0" />
                <stop offset="50%" stopColor="white" stopOpacity="0.3" />
                <stop offset="100%" stopColor="white" stopOpacity="1" />
              </linearGradient>
            </defs>
            <path d="M0 100C240 100 480 60 720 50C960 40 1200 70 1440 70L1440 100L0 100Z" fill="url(#waveGradient)"/>
            <path d="M0 80C240 80 480 50 720 45C960 40 1200 60 1440 65L1440 100L0 100Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Main Content */}
      <main className="bg-white">
        {/* Company Info & Quote Section */}
        <section className="py-16 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left: Company Info */}
              <div>
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">CÔNG TY TNHH</p>
                  <h2 className="text-4xl md:text-5xl font-bold text-sky-600 mb-4">
                    HIỀN TRÍ NGUYỄN VĂN
                  </h2>
                  <p className="text-gray-600 text-lg">MST: 1102113445</p>
                </motion.div>
              </div>

              {/* Right: Quote */}
              <div>
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="bg-sky-50 rounded-2xl p-8 border border-sky-100"
                >
                  <p className="text-lg md:text-xl text-gray-800 italic leading-relaxed mb-4">
                    &ldquo;Phát triển đánh đổi bằng sức lực và trí tuệ, để sức khỏe tận hưởng thành quả của chúng ta.&rdquo;
                  </p>
                  <p className="text-gray-700">
                    Cầu Hiền, tiến Tài - Dụng Trí, Tận Ưu - Tiểu tộc Nguyễn Văn - Vì những nụ cười.
                  </p>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-16 px-4 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="w-14 h-14 bg-sky-500 rounded-full flex items-center justify-center mb-4">
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Contact Info */}
              <div className="bg-gradient-to-br from-sky-50 to-blue-50 rounded-2xl p-8 border border-sky-100">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-sky-500 rounded-full flex items-center justify-center">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">LIÊN HỆ</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-gray-700">
                    <Phone className="w-5 h-5 text-sky-600" />
                    <span className="font-medium">SĐT: 0969 707 460</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <Mail className="w-5 h-5 text-sky-600" />
                    <span>info@hoithoxanh.com</span>
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-2xl p-8 border border-teal-100">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-teal-500 rounded-full flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">ĐỊA CHỈ</h3>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  469 đường Hùng Vương nối dài,<br />
                  Phường Long An, tỉnh Tây Ninh
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Certifications */}
        <section className="py-16 px-4 bg-gray-50">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-3xl font-bold text-gray-900 mb-8">CHỨNG NHẬN CHẤT LƯỢNG</h3>
            <div className="flex justify-center items-center gap-6 flex-wrap">
              <div className="bg-white px-8 py-4 rounded-xl border-2 border-blue-200 hover:border-blue-500 transition-colors shadow-sm">
                <span className="text-2xl font-bold text-blue-600">RoHS</span>
              </div>
              <div className="bg-white px-8 py-4 rounded-xl border-2 border-green-200 hover:border-green-500 transition-colors shadow-sm">
                <span className="text-2xl font-bold text-green-600">FC</span>
              </div>
              <div className="bg-white px-8 py-4 rounded-xl border-2 border-purple-200 hover:border-purple-500 transition-colors shadow-sm">
                <span className="text-2xl font-bold text-purple-600">CE</span>
              </div>
            </div>
          </div>
        </section>

        {/* Google Maps */}
        <section className="py-16 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">VỊ TRÍ CỦA CHÚNG TÔI</h3>
            <div className="rounded-2xl overflow-hidden shadow-xl">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2603.2641751962724!2d106.33232742808612!3d11.077934115147347!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x310b3b0068386f1f%3A0x85fddf862270167c!2sCONG%20TY%20TNHH%20LONG%20GIANG%20T%C3%82Y%20NINH!5e0!3m2!1sen!2s!4v1761378355841!5m2!1sen!2s" 
                width="100%" 
                height="500" 
                style={{ border: 0 }} 
                allowFullScreen 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <Botchat />
    </div>
  );
}
