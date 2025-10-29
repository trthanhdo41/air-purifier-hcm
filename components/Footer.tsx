import { Phone, Mail, MapPin, Facebook, Instagram, Youtube, Send, CreditCard, Smartphone, Wallet, Building2 } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  const paymentMethods = [
    { name: "Visa", Icon: CreditCard },
    { name: "Mastercard", Icon: CreditCard },
    { name: "MoMo", Icon: Smartphone },
    { name: "ZaloPay", Icon: Wallet },
    { name: "VNPay", Icon: Wallet },
    { name: "Kredivo", Icon: Building2 },
  ];

  return (
    <footer className="bg-gradient-to-b from-sky-800 to-sky-700 text-sky-100 mt-16 sm:mt-20 md:mt-24">
      {/* Main Footer - Mobile Optimized */}
      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-14 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 md:gap-12">
          {/* Company Info - Mobile Optimized */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="mb-4 sm:mb-6">
              <div className="w-32 h-10 sm:w-40 sm:h-12 flex items-center justify-center">
                <img src="/logo-hoi-tho-xanh-black.svg" alt="Hơi Thở Xanh" className="w-full h-full object-contain brightness-0 invert" />
              </div>
            </div>
            <p className="text-xs sm:text-sm mb-4 sm:mb-6 leading-relaxed text-sky-200">
              Chuyên cung cấp máy lọc không khí chính hãng, bảo vệ sức khỏe gia đình bạn.
            </p>
            <div className="flex gap-2 sm:gap-3">
              <a href="#" className="w-9 h-9 sm:w-11 sm:h-11 bg-sky-700 rounded-lg sm:rounded-xl flex items-center justify-center hover:bg-sky-600 transition-all hover:scale-110">
                <Facebook className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
              <a href="#" className="w-9 h-9 sm:w-11 sm:h-11 bg-sky-700 rounded-lg sm:rounded-xl flex items-center justify-center hover:bg-pink-600 transition-all hover:scale-110">
                <Instagram className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
              <a href="#" className="w-9 h-9 sm:w-11 sm:h-11 bg-sky-700 rounded-lg sm:rounded-xl flex items-center justify-center hover:bg-red-600 transition-all hover:scale-110">
                <Youtube className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
              <a href="#" className="w-9 h-9 sm:w-11 sm:h-11 bg-sky-700 rounded-lg sm:rounded-xl flex items-center justify-center hover:bg-sky-400 transition-all hover:scale-110">
                <Send className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
            </div>
          </div>

          {/* Customer Support - Mobile Optimized */}
          <div>
            <h3 className="font-bold text-white mb-4 sm:mb-6 text-base sm:text-lg">Hỗ trợ khách hàng</h3>
            <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
              <li>
                <Link href="#" className="hover:text-sky-300 transition-colors flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 bg-sky-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  Chính sách bảo hành
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-sky-300 transition-colors flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 bg-sky-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  Chính sách đổi trả
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-sky-300 transition-colors flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 bg-sky-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  Chính sách giao hàng
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-sky-300 transition-colors flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 bg-sky-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  Hướng dẫn mua hàng
                </Link>
              </li>
              <li className="hidden sm:list-item">
                <Link href="#" className="hover:text-sky-300 transition-colors flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 bg-sky-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  Tra cứu đơn hàng
                </Link>
              </li>
              <li className="hidden sm:list-item">
                <Link href="#" className="hover:text-sky-300 transition-colors flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 bg-sky-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  Câu hỏi thường gặp
                </Link>
              </li>
            </ul>
          </div>

          {/* About - Mobile Optimized */}
          <div>
            <h3 className="font-bold text-white mb-4 sm:mb-6 text-base sm:text-lg">Về chúng tôi</h3>
            <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
              <li>
                <Link href="#" className="hover:text-sky-300 transition-colors flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 bg-sky-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  Giới thiệu công ty
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-sky-300 transition-colors flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 bg-sky-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  Tuyển dụng
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-sky-300 transition-colors flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 bg-sky-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  Tin tức & Blog
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-sky-300 transition-colors flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 bg-sky-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  Hệ thống cửa hàng
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-sky-300 transition-colors flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 bg-sky-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  Chính sách bảo mật
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-sky-300 transition-colors flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 bg-sky-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  Điều khoản sử dụng
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-white mb-6 text-lg">Liên hệ</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3 group">
                <div className="w-10 h-10 bg-sky-600/20 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-sky-600/30 transition-colors">
                  <Phone className="w-5 h-5 text-sky-300" />
                </div>
                <div>
                  <div className="font-semibold text-white mb-1">Hotline</div>
                  <a href="tel:18002097" className="hover:text-sky-300 transition-colors font-bold">1800 2097</a>
                  <div className="text-xs text-sky-300 mt-1">Hỗ trợ 7h30 - 22h00</div>
                </div>
              </li>
              <li className="flex items-start gap-3 group">
                <div className="w-10 h-10 bg-sky-600/20 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-sky-600/30 transition-colors">
                  <Mail className="w-5 h-5 text-sky-300" />
                </div>
                <div>
                  <div className="font-semibold text-white mb-1">Email</div>
                  <a href="mailto:info@maylockhongkhi.vn" className="hover:text-sky-300 transition-colors">info@maylockhongkhi.vn</a>
                </div>
              </li>
              <li className="flex items-start gap-3 group">
                <div className="w-10 h-10 bg-sky-600/20 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-sky-600/30 transition-colors">
                  <MapPin className="w-5 h-5 text-sky-300" />
                </div>
                <div>
                  <div className="font-semibold text-white mb-1">Địa chỉ</div>
                  <p className="text-sky-200">350-352 Võ Văn Kiệt<br/>Quận 1, TP. Hồ Chí Minh</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="border-t border-sky-600">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="mb-4 font-semibold text-white text-sm">Phương thức thanh toán</p>
            <div className="flex justify-center flex-wrap gap-3">
              {paymentMethods.map((method) => {
                const IconComponent = method.Icon;
                return (
                  <div 
                    key={method.name} 
                    className="bg-sky-700 hover:bg-sky-600 px-5 py-3 rounded-xl text-xs font-medium transition-all hover:scale-105 flex items-center gap-2"
                  >
                    <IconComponent className="w-4 h-4 text-sky-300" />
                    <span>{method.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Certifications */}
      <div className="border-t border-sky-600">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-sm text-sky-300">Chứng nhận:</span>
              <div className="flex gap-2">
                <div className="bg-sky-700 px-3 py-1.5 rounded-lg text-xs">✓ Đã thông báo BCT</div>
                <div className="bg-sky-700 px-3 py-1.5 rounded-lg text-xs">✓ DMCA Protected</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-sky-600 bg-sky-800">
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-sm text-sky-200">
            © 2025 <span className="text-white font-semibold">Hơi Thở Xanh</span>. Tất cả quyền được bảo lưu.
          </p>
        </div>
      </div>
    </footer>
  );
}
