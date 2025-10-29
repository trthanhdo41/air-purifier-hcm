"use client";

import { ShoppingCart, Search, MapPin, User, Phone, Menu, Heart, Package, Sparkles, Truck, Recycle, Wind, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useCartStore } from "@/lib/stores/cart";
import CartDrawer from "@/components/CartDrawer";
import LoginModal from "@/components/LoginModal";
import { useAuthStore } from "@/lib/stores/auth";

export default function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(true);
  const [showTopBanner, setShowTopBanner] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [loginShowMessage, setLoginShowMessage] = useState(false);
  const { openCart, getTotalItems } = useCartStore();
  const totalItems = getTotalItems();
  const { user, signOut } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  // Fix hydration error by ensuring client-side rendering
  useEffect(() => {
    setIsClient(true);
  }, []);

  // measure banner height so we can move it proportionally to scroll
  

  useEffect(() => {
    if (!isClient) return;
    try {
      const trigger = localStorage.getItem('triggerLogin');
      if (trigger === '1') {
        const msg = localStorage.getItem('loginMessage');
        setLoginShowMessage(msg === 'checkout');
        setLoginModalOpen(true);
        localStorage.removeItem('triggerLogin');
        localStorage.removeItem('loginMessage');
      }
    } catch {}
  }, [isClient]);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;
    const hideThreshold = 120;  // hysteresis: hide after 120px
    const showThreshold = 80;   // show when above 80px while scrolling up

    const updateOnScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollDifference = Math.abs(currentScrollY - lastScrollY);

      if (currentScrollY < 10) {
        if (!showTopBanner) setShowTopBanner(true);
        if (isScrolled) setIsScrolled(false);
      } else if (scrollDifference > 4) {
        const scrollingDown = currentScrollY > lastScrollY;
        if (scrollingDown && currentScrollY > hideThreshold) {
          if (showTopBanner) setShowTopBanner(false);
        } else if (!scrollingDown && currentScrollY < showThreshold) {
          if (!showTopBanner) setShowTopBanner(true);
        } else if (!scrollingDown) {
          if (!showTopBanner) setShowTopBanner(true);
        }
        if (!isScrolled) setIsScrolled(true);
      }

      lastScrollY = currentScrollY;
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateOnScroll);
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [showTopBanner, isScrolled]);

  return (
    <header 
      className={`sticky top-0 z-50 bg-white transition-shadow duration-300 will-change-transform relative overflow-hidden ${isScrolled ? 'shadow-xl' : 'shadow-medium'}`} 
      style={{ position: 'sticky' }}
    >
      {/* Wrapper: banner + white header move together */}
      <div className={`transition-all duration-300 ease-in-out ${showTopBanner ? 'translate-y-0 mb-0' : '-translate-y-10 sm:-translate-y-11 -mb-10 sm:-mb-11'}`}>
        {/* Top Banner */}
        <div className="gradient-primary text-white text-xs h-10 sm:h-11 flex items-center">
          <div className="container mx-auto px-4 flex justify-center gap-4 md:gap-8 flex-wrap">
            <span className="font-medium flex items-center gap-1.5 text-[10px] sm:text-xs"><Sparkles className="w-3 h-3 sm:w-4 sm:h-4" /> <span className="hidden sm:inline">Máy lọc không khí </span>Chính hãng</span>
            <span className="font-medium flex items-center gap-1.5 text-[10px] sm:text-xs"><Truck className="w-3 h-3 sm:w-4 sm:h-4" /> Giao nhanh <span className="hidden sm:inline">2H - </span>Miễn phí</span>
            <span className="font-medium flex items-center gap-1.5 text-[10px] sm:text-xs hidden md:flex"><Recycle className="w-3 h-3 sm:w-4 sm:h-4" /> Thu cũ đổi mới <span className="hidden lg:inline">- Trợ giá lên đến 30%</span></span>
          </div>
        </div>

        {/* White header + nav */}
      {/* Main Header - Mobile Optimized */}
      <div className="border-b border-blue-100">
        <div className="container mx-auto px-2 sm:px-4 py-2 sm:py-4">
          <div className="flex items-center gap-2 sm:gap-4 md:gap-6">
            {/* Mobile Menu */}
            <button 
              className="lg:hidden p-2 hover:bg-blue-50 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 sm:gap-3 shrink-0 group">
              <div className="w-28 h-8 sm:w-36 sm:h-10 flex items-center justify-center">
                <img src="/logo-hoi-tho-xanh.svg" alt="Hơi Thở Xanh" className="w-full h-full object-contain" />
              </div>
            </Link>

            {/* Search Bar - Mobile Optimized */}
            <div className="flex-1 max-w-2xl">
              <div className="relative">
                <Search className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm máy lọc..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 sm:pl-12 pr-2 sm:pr-4 py-2 sm:py-3.5 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 sm:focus:ring-4 focus:ring-blue-100 transition-all font-medium text-xs sm:text-sm"
                />
              </div>
            </div>

            {/* Actions - Mobile Optimized */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Location */}
              <button className="hidden xl:flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                <MapPin className="w-5 h-5" />
                <div className="text-left">
                  <div className="text-[10px] text-gray-500 font-medium">Xem giá tại</div>
                  <div className="text-sm font-semibold">Hồ Chí Minh</div>
                </div>
              </button>

              {/* Hotline - Mobile Icon Only */}
              <a 
                href="tel:18002097" 
                className="flex lg:flex items-center gap-2 p-2 lg:px-4 lg:py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
              >
                <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
                <div className="text-left hidden lg:block">
                  <div className="text-[10px] text-gray-500 font-medium">Hotline</div>
                  <div className="text-sm font-bold">1800 2097</div>
                </div>
              </a>

              {/* Wishlist */}
              <motion.div whileHover={{ scale: 1.1, transition: { duration: 0.05, ease: "easeOut" } }} whileTap={{ scale: 0.9, transition: { duration: 0.05 } }}>
                <Button variant="ghost" size="icon" className="relative hidden md:flex h-9 w-9 sm:h-10 sm:w-10 hover:bg-pink-50 hover:text-pink-600 transition-colors duration-300">
                  <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
                  <motion.span 
                    className="absolute -top-1 -right-1 bg-gradient-to-r from-pink-500 to-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-md"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    0
                  </motion.span>
                </Button>
              </motion.div>

              {/* Orders */}
              <motion.div whileHover={{ scale: 1.1, transition: { duration: 0.05, ease: "easeOut" } }} whileTap={{ scale: 0.9, transition: { duration: 0.05 } }}>
                <Button variant="ghost" size="icon" className="relative hidden md:flex h-9 w-9 sm:h-10 sm:w-10 hover:bg-emerald-50 hover:text-emerald-600 transition-colors duration-300">
                  <Package className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
              </motion.div>

              {/* Cart - Always Visible */}
              <motion.div whileHover={{ scale: 1.1, transition: { duration: 0.05, ease: "easeOut" } }} whileTap={{ scale: 0.9, transition: { duration: 0.05 } }}>
                <Link href="/cart">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="relative h-9 w-9 sm:h-10 sm:w-10 hover:bg-sky-50 hover:text-sky-600 transition-colors duration-300"
                  >
                    <motion.div
                      animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
                      transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
                    >
                      <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                    </motion.div>
                    <motion.span 
                      className="absolute -top-1 -right-1 bg-gradient-to-r from-sky-500 to-blue-600 text-white text-[10px] font-bold rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center shadow-md"
                      animate={{ scale: [1, 1.15, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      {isClient ? totalItems : 0}
                    </motion.span>
                  </Button>
                </Link>
              </motion.div>

              {/* User */}
              <motion.div whileHover={{ scale: 1.05, y: -2, transition: { duration: 0.2, ease: "easeOut" } }} whileTap={{ scale: 0.95, transition: { duration: 0.15, ease: "easeIn" } }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                {isClient && user ? (
                  <div className="hidden lg:flex items-center gap-2">
                    <Link href="/account">
                      <Button
                        variant="outline"
                        className="text-sm hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-400 transition-colors duration-300"
                      >
                        <User className="w-4 h-4" />
                        <span>{user.name || user.email?.split("@")[0]}</span>
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 hover:bg-red-50 hover:text-red-600"
                      onClick={async () => { await signOut(); }}
                    >
                      <LogOut className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <Button 
                    variant="outline" 
                    className="hidden lg:flex text-sm hover:bg-sky-50 hover:text-sky-600 hover:border-sky-400 transition-colors duration-300"
                    onClick={() => setLoginModalOpen(true)}
                  >
                    <User className="w-4 h-4" />
                    <span>Đăng nhập</span>
                  </Button>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation - Mobile Optimized with Toggle */}
      <div className={`bg-blue-50/80 backdrop-blur-sm transition-all duration-300 overflow-hidden ${
        mobileMenuOpen ? 'max-h-96' : 'max-h-0 lg:max-h-96'
      }`}>
        <div className="container mx-auto px-2 sm:px-4">
          <nav className="flex items-center gap-1 py-1 overflow-x-auto scrollbar-hide">
            <motion.div 
              whileHover={{ scale: 1.05, y: -2, transition: { duration: 0.2, ease: "easeOut" } }} 
              whileTap={{ scale: 0.95, transition: { duration: 0.15, ease: "easeIn" } }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <Link 
                href="/home" 
                className="px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-gray-700 hover:text-blue-600 hover:bg-white rounded-lg transition-colors duration-300 whitespace-nowrap inline-block"
              >
                Trang chủ
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05, y: -2, transition: { duration: 0.2, ease: "easeOut" } }} whileTap={{ scale: 0.95, transition: { duration: 0.15, ease: "easeIn" } }}
            transition={{ duration: 0.3, ease: "easeInOut" }}>
              <Link 
                href="/gioi-thieu" 
                className="px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-gray-700 hover:text-blue-600 hover:bg-white rounded-lg transition-colors duration-300 whitespace-nowrap inline-block"
              >
                Giới thiệu
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05, y: -2, transition: { duration: 0.2, ease: "easeOut" } }} whileTap={{ scale: 0.95, transition: { duration: 0.15, ease: "easeIn" } }}
            transition={{ duration: 0.3, ease: "easeInOut" }}>
              <Link 
                href="#san-pham" 
                className="px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-gray-700 hover:text-blue-600 hover:bg-white rounded-lg transition-colors duration-300 whitespace-nowrap inline-block"
                onClick={(e) => {
                  e.preventDefault();
                  const go = () => {
                    const el = document.getElementById('san-pham');
                    if (!el) return;
                    const headerOffset = 110;
                    const y = el.getBoundingClientRect().top + window.pageYOffset - headerOffset;
                    window.scrollTo({ top: y, behavior: 'smooth' });
                  };
                  if (pathname !== '/home') {
                    router.push('/home#san-pham');
                    setTimeout(go, 350);
                  } else {
                    go();
                  }
                }}
              >
              Sản phẩm
            </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05, y: -2, transition: { duration: 0.2, ease: "easeOut" } }} whileTap={{ scale: 0.95, transition: { duration: 0.15, ease: "easeIn" } }}
            transition={{ duration: 0.3, ease: "easeInOut" }}>
              <Link 
                href="#cong-nghe" 
                className="px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-gray-700 hover:text-blue-600 hover:bg-white rounded-lg transition-colors duration-300 whitespace-nowrap inline-block"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('cong-nghe')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Công nghệ
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05, y: -2, transition: { duration: 0.2, ease: "easeOut" } }} whileTap={{ scale: 0.95, transition: { duration: 0.15, ease: "easeIn" } }}
            transition={{ duration: 0.3, ease: "easeInOut" }}>
              <Link 
                href="#thong-tin" 
                className="px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-gray-700 hover:text-blue-600 hover:bg-white rounded-lg transition-colors duration-300 whitespace-nowrap hidden sm:inline-block"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('thong-tin')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Thông tin
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05, y: -2, transition: { duration: 0.2, ease: "easeOut" } }} whileTap={{ scale: 0.95, transition: { duration: 0.15, ease: "easeIn" } }}
            transition={{ duration: 0.3, ease: "easeInOut" }}>
              <Link 
                href="#hoi-dap" 
                className="px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-gray-700 hover:text-blue-600 hover:bg-white rounded-lg transition-colors duration-300 whitespace-nowrap inline-block"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('hoi-dap')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Hỏi đáp
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.08, y: -3, transition: { duration: 0.25, ease: "easeOut" } }} whileTap={{ scale: 0.95, transition: { duration: 0.15, ease: "easeIn" } }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <Link 
                href="#khuyen-mai" 
                className="px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-bold gradient-primary text-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 whitespace-nowrap inline-flex items-center gap-1.5"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('khuyen-mai')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
              <motion.div
                animate={{ rotate: [0, 10, -10, 10, 0] }}
                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
              >
                <Wind className="w-3 h-3 sm:w-4 sm:h-4" />
              </motion.div>
              <span className="hidden sm:inline">Khuyến mãi </span>HOT
            </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05, y: -2, transition: { duration: 0.2, ease: "easeOut" } }} whileTap={{ scale: 0.95, transition: { duration: 0.15, ease: "easeIn" } }}
            transition={{ duration: 0.3, ease: "easeInOut" }}>
              <Link 
                href="#thuong-hieu" 
                className="px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-gray-700 hover:text-blue-600 hover:bg-white rounded-lg transition-colors duration-300 whitespace-nowrap hidden md:inline-block"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('thuong-hieu')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Thương hiệu
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05, y: -2, transition: { duration: 0.2, ease: "easeOut" } }} whileTap={{ scale: 0.95, transition: { duration: 0.15, ease: "easeIn" } }}
            transition={{ duration: 0.3, ease: "easeInOut" }}>
              <Link 
                href="#tu-van" 
                className="px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-gray-700 hover:text-blue-600 hover:bg-white rounded-lg transition-colors duration-300 whitespace-nowrap inline-block"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('tu-van')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Tư vấn
              </Link>
            </motion.div>
          </nav>
        </div>
      </div>
      </div>

      {/* Cart Drawer */
      }
      <CartDrawer />

      {isClient && !user && (
        <LoginModal isOpen={loginModalOpen} onClose={() => setLoginModalOpen(false)} showMessage={loginShowMessage} />
      )}
    </header>
  );
}
