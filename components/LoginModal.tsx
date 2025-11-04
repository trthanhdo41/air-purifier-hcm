"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/auth";
import { Eye, EyeOff, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  showMessage?: boolean;
  initialMode?: 'login' | 'signup';
}

export default function LoginModal({ isOpen, onClose, showMessage = false, initialMode = 'login' }: LoginModalProps) {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  
  // Update mode when initialMode prop changes
  useEffect(() => {
    setIsLogin(initialMode === 'login');
  }, [initialMode]);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mounted, setMounted] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuthStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!mounted) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = isLogin 
      ? await signIn(email, password)
      : await signUp(email, password, fullName, phone);

    if (result.success) {
      // Check if user is admin and redirect to admin dashboard
      const isAdmin = email === 'admin@hoithoxanh.com' || email.toLowerCase() === 'admin@hoithoxanh.com';
      
      onClose();
      setEmail("");
      setPassword("");
      setFullName("");
      setPhone("");
      
      // Redirect admin to admin dashboard
      if (isAdmin) {
        router.push('/admin/dashboard');
      }
    } else {
      setError(result.error || "Đăng nhập thất bại");
    }

    setLoading(false);
  };

  const handleClose = () => {
    onClose();
    setError("");
    setEmail("");
    setPassword("");
    setFullName("");
    setPhone("");
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleClose}
            className="fixed inset-0 z-[9998] bg-black/50"
          />
          
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-2xl border border-gray-200 pointer-events-auto w-full max-w-md"
            >
              {/* Header */}
              <div className="px-6 py-5 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">
                    {isLogin ? "Đăng nhập" : "Đăng ký"}
                  </h2>
                  <button
                    onClick={handleClose}
                    className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </div>

              {/* Message for checkout flow */}
              {showMessage && (
                <div className="mx-6 mt-4 p-3 bg-sky-50 border border-sky-200 rounded-lg">
                  <p className="text-sm text-sky-900 text-center">
                    Vui lòng đăng nhập để tiếp tục thanh toán
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="px-6 py-5">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={isLogin ? 'login' : 'signup'}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    {/* Error Message */}
                    {error && (
                      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                        {error}
                      </div>
                    )}

                    {/* Full Name - Only for signup */}
                    {!isLogin && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Họ và tên
                        </label>
                        <input
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all text-sm"
                          placeholder="Nhập họ và tên"
                          required
                        />
                      </div>
                    )}

                    {/* Phone - Only for signup */}
                    {!isLogin && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Số điện thoại
                        </label>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all text-sm"
                          placeholder="Nhập số điện thoại"
                          required
                        />
                      </div>
                    )}

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Email
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all text-sm"
                        placeholder="Nhập email"
                        required
                      />
                    </div>

                    {/* Password */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Mật khẩu
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full px-4 py-2.5 pr-11 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all text-sm"
                          placeholder="Nhập mật khẩu"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    {/* Forgot Password - Only for login */}
                    {isLogin && (
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            alert("Chức năng quên mật khẩu sẽ được cập nhật sớm!");
                          }}
                          className="text-sm text-sky-600 hover:text-sky-700 font-medium transition-colors"
                        >
                          Quên mật khẩu?
                        </button>
                      </div>
                    )}

                    {/* Submit Button */}
                    <div className="pt-2">
                      <Button
                        type="submit"
                        disabled={loading}
                        className="w-full gradient-primary text-white h-11 text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity"
                      >
                        {loading ? (
                          <span className="flex items-center justify-center gap-2">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Đang xử lý...
                          </span>
                        ) : (
                          <span>{isLogin ? "Đăng nhập" : "Đăng ký"}</span>
                        )}
                      </Button>
                    </div>

                    {/* Toggle Login/Signup */}
                    <div className="pt-3 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={() => {
                          setIsLogin(!isLogin);
                          setError("");
                        }}
                        className="w-full text-center text-sm text-gray-600"
                      >
                        {isLogin ? (
                          <>
                            Chưa có tài khoản?{" "}
                            <span className="text-sky-600 hover:text-sky-700 font-semibold">
                              Đăng ký ngay
                            </span>
                          </>
                        ) : (
                          <>
                            Đã có tài khoản?{" "}
                            <span className="text-sky-600 hover:text-sky-700 font-semibold">
                              Đăng nhập ngay
                            </span>
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
