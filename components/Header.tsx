"use client";

import { ShoppingCart, Search, MapPin, User, Phone, Menu, Heart, Sparkles, Truck, Recycle, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
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
  const [loginMode, setLoginMode] = useState<'login' | 'signup'>('login');
  const { openCart, getTotalItems } = useCartStore();
  const totalItems = getTotalItems();
  const { user, signOut } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [activeSection, setActiveSection] = useState<string>('');
  const [lastClickedSection, setLastClickedSection] = useState<string>('');
  const [wishlistCount, setWishlistCount] = useState(0);
  const hasScrolledToHashRef = useRef(false);

  // Track active section on scroll
  useEffect(() => {
    if (pathname !== '/home' && pathname !== '/') {
      setActiveSection('');
      return;
    }

    const sections = ['san-pham', 'thong-tin', 'hoi-dap', 'thuong-hieu', 'tu-van'];
    const headerOffset = 150;

    const handleScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
      
      // If at top, clear active section
      if (scrollY < 100) {
        setActiveSection('');
        return;
      }

      // If we just clicked a section, use that for a moment
      if (lastClickedSection) {
        const clickedSection = document.getElementById(lastClickedSection);
        if (clickedSection) {
          const rect = clickedSection.getBoundingClientRect();
          const sectionTop = rect.top + scrollY;
          // If we're still near the clicked section (within 400px), keep it active
          if (Math.abs(scrollY + headerOffset - sectionTop) < 400) {
            setActiveSection(lastClickedSection);
            return;
          } else {
            // Clear last clicked after we've scrolled away
            setLastClickedSection('');
          }
        }
      }

      // Find the section that is currently most visible in viewport
      let currentActive = '';
      let maxVisible = 0;

      sections.forEach((sectionId) => {
        const section = document.getElementById(sectionId);
        if (section) {
          const rect = section.getBoundingClientRect();
          const sectionTop = rect.top + scrollY;
          const sectionBottom = sectionTop + section.offsetHeight;
          
          // Calculate how much of this section is visible above the header offset line
          const viewportTop = scrollY + headerOffset;
          const visibleTop = Math.max(viewportTop, sectionTop);
          const visibleBottom = Math.min(scrollY + window.innerHeight, sectionBottom);
          const visibleHeight = Math.max(0, visibleBottom - visibleTop);

          // Only consider sections that have significant visibility
          if (visibleHeight > 100 && visibleHeight > maxVisible) {
            maxVisible = visibleHeight;
            currentActive = sectionId;
          }
        }
      });

      // Fallback: if no section is significantly visible, find the one closest to viewport top
      if (!currentActive) {
        let closestSection = '';
        let minDistance = Infinity;

        sections.forEach((sectionId) => {
          const section = document.getElementById(sectionId);
          if (section) {
            const rect = section.getBoundingClientRect();
            const sectionTop = rect.top + scrollY;
            const distance = Math.abs(sectionTop - (scrollY + headerOffset));

            if (distance < minDistance && sectionTop <= scrollY + window.innerHeight) {
              minDistance = distance;
              closestSection = sectionId;
            }
          }
        });

        currentActive = closestSection;
      }

      setActiveSection(currentActive);
    };

    // Check hash on mount and scroll to it
    const hash = window.location.hash.substring(1);
    if (!hasScrolledToHashRef.current && hash && sections.includes(hash)) {
      setLastClickedSection(hash);
      setTimeout(() => {
        const section = document.getElementById(hash);
        if (section) {
          const rect = section.getBoundingClientRect();
          const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
          const y = rect.top + scrollTop - headerOffset;
          window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
          hasScrolledToHashRef.current = true;
        }
      }, 300);
    }

    // Throttle scroll handler với delay
    let ticking = false;
    let lastScrollY = 0;
    const throttledScroll = () => {
      const currentScrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
      
      // Chỉ update nếu scroll thay đổi đáng kể (ít nhất 10px) để giảm re-render
      if (Math.abs(currentScrollY - lastScrollY) < 10 && !ticking) {
        return;
      }
      lastScrollY = currentScrollY;
      
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledScroll, { passive: true });
    handleScroll(); // Initial check

    return () => {
      window.removeEventListener('scroll', throttledScroll);
    };
  }, [pathname, lastClickedSection]);

  useEffect(() => {
    hasScrolledToHashRef.current = false;
  }, [pathname]);

  // Update lastClickedSection when user clicks a section link
  const handleSectionClick = (sectionId: string) => {
    setLastClickedSection(sectionId);
    handleScrollToSection(sectionId);
  };

  // Helper function to check if link is active
  const isLinkActive = (href: string, sectionId?: string) => {
    const isHomePage = pathname === '/home' || pathname === '/';
    
    if (sectionId) {
      // For section links, check if active section matches
      // If we're on home page and no section is active yet, don't highlight section links
      return isHomePage && activeSection === sectionId;
    } else {
      // For page links
      if (href === '/home') {
        // "Trang chủ" is active if we're on home page AND no section is active
        return isHomePage && !activeSection;
      }
      return pathname === href;
    }
  };

  // Helper function to handle scroll to section
  const handleScrollToSection = (sectionId: string) => {
    setLastClickedSection(sectionId);
    if (pathname !== '/home') {
      router.push(`/home#${sectionId}`);
    } else {
      // Use requestAnimationFrame for better timing
      requestAnimationFrame(() => {
        setTimeout(() => {
          const el = document.getElementById(sectionId);
          if (el) {
            const headerOffset = 150;
            const rect = el.getBoundingClientRect();
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const y = rect.top + scrollTop - headerOffset;
            window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
            // Set active immediately when clicked
            setActiveSection(sectionId);
          }
        }, 50);
      });
    }
  };

  // Fix hydration error by ensuring client-side rendering
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load wishlist count from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const updateWishlistCount = () => {
        try {
          const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
          setWishlistCount(wishlist.length);
        } catch (e) {
          setWishlistCount(0);
        }
      };
      
      updateWishlistCount();
      
      // Listen for storage changes (when wishlist is updated from other tabs/components)
      window.addEventListener('storage', updateWishlistCount);
      
      // Also listen for custom event when wishlist is updated in same tab
      window.addEventListener('wishlistUpdated', updateWishlistCount);
      
      return () => {
        window.removeEventListener('storage', updateWishlistCount);
        window.removeEventListener('wishlistUpdated', updateWishlistCount);
      };
    }
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
      className={`sticky top-0 z-50 bg-white transition-shadow duration-300 relative overflow-hidden ${isScrolled ? 'shadow-xl' : 'shadow-medium'}`} 
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
            <div className="flex items-center gap-1 sm:gap-3">
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
                <Link href="/wishlist">
                  <Button variant="ghost" size="icon" className="relative hidden md:flex h-9 w-9 sm:h-10 sm:w-10 hover:bg-pink-50 hover:text-pink-600 transition-colors duration-300">
                    <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
                    {wishlistCount > 0 && (
                      <motion.span 
                        className="absolute -top-1 -right-1 bg-gradient-to-r from-pink-500 to-red-500 text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center shadow-md"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        {wishlistCount > 99 ? '99+' : wishlistCount}
                      </motion.span>
                    )}
                  </Button>
                </Link>
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

              {/* User - Spacing from cart */}
              <div className="ml-2">
                {isClient && user ? (
                  <>
                    {/* Mobile: Icon only */}
                    <Link 
                      href={user.email === 'admin@hoithoxanh.com' ? '/admin/dashboard' : '/account'}
                      className="lg:hidden"
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 sm:h-10 sm:w-10 hover:bg-sky-50 hover:text-sky-600"
                      >
                        <User className="w-4 h-4 sm:w-5 sm:h-5" />
                      </Button>
                    </Link>
                    {/* Desktop: Full buttons */}
                    <div className="hidden lg:flex items-center gap-2">
                      <Link href={user.email === 'admin@hoithoxanh.com' ? '/admin/dashboard' : '/account'}>
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
                  </>
                ) : (
                  <>
                    {/* Mobile: Icon only - opens login modal */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="lg:hidden h-9 w-9 sm:h-10 sm:w-10 hover:bg-sky-50 hover:text-sky-600"
                      onClick={() => {
                        setLoginMode('login');
                        setLoginModalOpen(true);
                      }}
                    >
                      <User className="w-4 h-4 sm:w-5 sm:h-5" />
                    </Button>
                    {/* Desktop: Full buttons */}
                    <div className="hidden lg:flex items-center gap-2">
                      <motion.div
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Button 
                          variant="outline" 
                          className="text-sm bg-white hover:bg-sky-50 hover:text-sky-600 hover:border-sky-500 hover:shadow-md transition-all duration-300 border-gray-300"
                          onClick={() => {
                            setLoginMode('login');
                            setLoginModalOpen(true);
                          }}
                        >
                          <User className="w-4 h-4 mr-1.5" />
                          <span>Đăng nhập</span>
                        </Button>
                      </motion.div>
                      <motion.div
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Button 
                          variant="default" 
                          className="text-sm bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 hover:shadow-lg text-white transition-all duration-300 font-medium"
                          onClick={() => {
                            setLoginMode('signup');
                            setLoginModalOpen(true);
                          }}
                        >
                          <span>Đăng ký</span>
                        </Button>
                      </motion.div>
                    </div>
                  </>
                )}
              </div>
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
                className={`px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-300 whitespace-nowrap inline-block ${
                  isLinkActive('/home')
                    ? 'text-sky-600 bg-white shadow-md font-bold'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-white'
                }`}
              >
                Trang chủ
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05, y: -2, transition: { duration: 0.2, ease: "easeOut" } }} whileTap={{ scale: 0.95, transition: { duration: 0.15, ease: "easeIn" } }}
            transition={{ duration: 0.3, ease: "easeInOut" }}>
              <Link 
                href="/gioi-thieu" 
                className={`px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-300 whitespace-nowrap inline-block ${
                  isLinkActive('/gioi-thieu')
                    ? 'text-sky-600 bg-white shadow-md font-bold'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-white'
                }`}
              >
                Giới thiệu
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05, y: -2, transition: { duration: 0.2, ease: "easeOut" } }} whileTap={{ scale: 0.95, transition: { duration: 0.15, ease: "easeIn" } }}
            transition={{ duration: 0.3, ease: "easeInOut" }}>
              <Link 
                href="#san-pham" 
                className={`px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-300 whitespace-nowrap inline-block ${
                  isLinkActive('#san-pham', 'san-pham')
                    ? 'text-sky-600 bg-white shadow-md font-bold'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-white'
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  handleScrollToSection('san-pham');
                }}
              >
              Sản phẩm
            </Link>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.05, y: -2, transition: { duration: 0.2, ease: "easeOut" } }} whileTap={{ scale: 0.95, transition: { duration: 0.15, ease: "easeIn" } }}
            transition={{ duration: 0.3, ease: "easeInOut" }}>
              <Link 
                href="#thong-tin" 
                className={`px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-300 whitespace-nowrap hidden sm:inline-block ${
                  isLinkActive('#thong-tin', 'thong-tin')
                    ? 'text-sky-600 bg-white shadow-md font-bold'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-white'
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  handleScrollToSection('thong-tin');
                }}
              >
                Thông tin
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05, y: -2, transition: { duration: 0.2, ease: "easeOut" } }} whileTap={{ scale: 0.95, transition: { duration: 0.15, ease: "easeIn" } }}
            transition={{ duration: 0.3, ease: "easeInOut" }}>
              <Link 
                href="#hoi-dap" 
                className={`px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-300 whitespace-nowrap inline-block ${
                  isLinkActive('#hoi-dap', 'hoi-dap')
                    ? 'text-sky-600 bg-white shadow-md font-bold'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-white'
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  handleScrollToSection('hoi-dap');
                }}
              >
                Hỏi đáp
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05, y: -2, transition: { duration: 0.2, ease: "easeOut" } }} whileTap={{ scale: 0.95, transition: { duration: 0.15, ease: "easeIn" } }}
            transition={{ duration: 0.3, ease: "easeInOut" }}>
              <Link 
                href="#thuong-hieu" 
                className={`px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-300 whitespace-nowrap hidden md:inline-block ${
                  isLinkActive('#thuong-hieu', 'thuong-hieu')
                    ? 'text-sky-600 bg-white shadow-md font-bold'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-white'
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  handleScrollToSection('thuong-hieu');
                }}
              >
                Thương hiệu
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05, y: -2, transition: { duration: 0.2, ease: "easeOut" } }} whileTap={{ scale: 0.95, transition: { duration: 0.15, ease: "easeIn" } }}
            transition={{ duration: 0.3, ease: "easeInOut" }}>
              <Link 
                href="#tu-van" 
                className={`px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-300 whitespace-nowrap inline-block ${
                  isLinkActive('#tu-van', 'tu-van')
                    ? 'text-sky-600 bg-white shadow-md font-bold'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-white'
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  handleScrollToSection('tu-van');
                }}
              >
                Tư vấn
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05, y: -2, transition: { duration: 0.2, ease: "easeOut" } }} whileTap={{ scale: 0.95, transition: { duration: 0.15, ease: "easeIn" } }}
            transition={{ duration: 0.3, ease: "easeInOut" }}>
              <Link 
                href="/news" 
                className={`px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-300 whitespace-nowrap inline-block ${
                  isLinkActive('/news')
                    ? 'text-sky-600 bg-white shadow-md font-bold'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-white'
                }`}
              >
                Tin tức
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
        <LoginModal 
          isOpen={loginModalOpen} 
          onClose={() => setLoginModalOpen(false)} 
          showMessage={loginShowMessage}
          initialMode={loginMode}
        />
      )}
    </header>
  );
}
