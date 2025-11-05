"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/auth";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Users, 
  FileText,
  Gift,
  LogOut,
  Menu,
  X,
  Settings,
  MessageCircle,
  FolderTree,
  Newspaper
} from "lucide-react";
import { useState, useEffect } from "react";

interface AdminLayoutProps {
  children: ReactNode;
}

const menuItems = [
  { icon: LayoutDashboard, label: "Tổng quan", path: "/admin/dashboard" },
  { icon: FolderTree, label: "Danh mục", path: "/admin/categories" },
  { icon: Package, label: "Sản phẩm", path: "/admin/products" },
  { icon: ShoppingBag, label: "Đơn hàng", path: "/admin/orders" },
  { icon: Users, label: "Người dùng", path: "/admin/users" },
  { icon: Gift, label: "Mã giảm giá", path: "/admin/coupons" },
  { icon: Newspaper, label: "Tin tức", path: "/admin/news" },
  { icon: FileText, label: "Hỏi đáp", path: "/admin/contacts" },
  { icon: MessageCircle, label: "CSKH", path: "/admin/customer-service" },
  { icon: Settings, label: "Cài đặt", path: "/admin/settings" },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Redirect non-admin users away from admin pages
    if (user && user.email !== 'admin@hoithoxanh.com' && pathname.startsWith('/admin')) {
      router.push('/home');
    }
    // Redirect unauthenticated users away from admin pages
    if (!user && pathname.startsWith('/admin')) {
      router.push('/home');
    }
  }, [user, router, pathname]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/home');
  };

  if (!mounted) {
    return null;
  }

  // Don't render admin pages if user is not admin
  if (!user || user.email !== 'admin@hoithoxanh.com') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <aside className={`bg-white border-r border-blue-100 shadow-lg transition-all duration-300 ease-in-out ${
          sidebarOpen ? 'w-64' : 'w-20'
        } fixed inset-y-0 z-30`}>
          <div className="flex flex-col h-full">
            <div className="p-4 border-b border-blue-100 flex items-center justify-between bg-gradient-to-r from-blue-50 to-white">
              <div className="flex items-center gap-3">
                {sidebarOpen ? (
                  <div className="w-36 h-10 flex items-center justify-center">
                    <img 
                      src="/logo-hoi-tho-xanh.svg" 
                      alt="Hơi Thở Xanh" 
                      className="w-full h-full object-contain" 
                    />
                  </div>
                ) : (
                  <div className="w-10 h-10 flex items-center justify-center">
                    <img 
                      src="/logo-hoi-tho-xanh.svg" 
                      alt="Hơi Thở Xanh" 
                      className="w-full h-full object-contain" 
                    />
                  </div>
                )}
              </div>
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-blue-50 rounded-lg transition-colors text-gray-600 hover:text-blue-600"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.path;

                return (
                  <motion.button
                    key={item.path}
                    onClick={() => router.push(item.path)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                        : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                    }`}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    {sidebarOpen && <span className="font-medium">{item.label}</span>}
                  </motion.button>
                );
              })}
            </nav>

            <div className="p-4 border-t border-blue-100">
              <motion.button
                onClick={handleSignOut}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center gap-3 px-4 py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-all"
              >
                <LogOut className="w-5 h-5 shrink-0" />
                {sidebarOpen && <span className="font-medium">Đăng xuất</span>}
              </motion.button>
            </div>
          </div>
        </aside>

        <main className={`flex-1 transition-all duration-300 ${
          sidebarOpen ? 'ml-64' : 'ml-20'
        }`}>
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

