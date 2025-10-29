"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/lib/stores/auth";
import { Lock, Mail, User as UserIcon, Eye, EyeOff, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  showMessage?: boolean;
}

export default function LoginModal({ isOpen, onClose, showMessage = false }: LoginModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mounted, setMounted] = useState(false);
  const [fullName, setFullName] = useState("");
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
      : await signUp(email, password, fullName);

    if (result.success) {
      onClose();
      setEmail("");
      setPassword("");
      setFullName("");
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
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            onClick={handleClose}
            className="fixed inset-0 z-[9998] bg-black/30"
            style={{
              backdropFilter: "blur(8px) saturate(180%)",
              WebkitBackdropFilter: "blur(8px) saturate(180%)",
            }}
          />
          
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white/90 backdrop-blur-2xl rounded-[50px] shadow-2xl border border-white/50 pointer-events-auto relative overflow-hidden w-full mx-4 sm:w-[380px]"
              style={{
                background: "linear-gradient(135deg, rgba(255, 255, 255, 0.75) 0%, rgba(255, 255, 255, 0.85) 100%)",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.9)",
              }}
            >
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: "linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, transparent 50%, rgba(255, 255, 255, 0.3) 100%)",
                  backgroundSize: "200% 200%",
                  animation: "shimmer 3s ease-in-out infinite",
                }}
              />

              <div className="relative p-5 border-b border-gray-200/50">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {isLogin ? "Đăng nhập" : "Đăng ký"}
                    </h2>
                    <p className="text-gray-600 text-xs">Hơi Thở Xanh</p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleClose}
                    className="w-10 h-10 rounded-full bg-white/60 hover:bg-white/80 flex items-center justify-center transition-all backdrop-blur-sm"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </motion.button>
                </div>
              </div>

              {/* Message for checkout flow */}
              {showMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mx-5 mb-2 p-2.5 bg-blue-50 border border-blue-200 rounded-xl"
                >
                  <p className="text-xs font-medium text-blue-900 text-center">
                    🛒 Vui lòng đăng nhập để tiếp tục thanh toán
                  </p>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="relative p-5 space-y-3">
                <AnimatePresence mode="wait">
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="bg-red-50/90 backdrop-blur-sm border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm"
                    >
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {!isLogin && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-2"
                    >
                      <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <UserIcon className="w-4 h-4 text-sky-500" />
                        Họ và tên
                      </label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300/50 rounded-lg focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all bg-white/50 backdrop-blur-sm text-sm"
                        placeholder="Nhập họ và tên"
                        required={!isLogin}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-sky-500" />
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300/50 rounded-xl focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all bg-white/50 backdrop-blur-sm"
                    placeholder="Nhập email"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-sky-500" />
                    Mật khẩu
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 pr-12 border border-gray-300/50 rounded-xl focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all bg-white/50 backdrop-blur-sm"
                      placeholder="Nhập mật khẩu"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-sky-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {/* Forgot Password Link */}
                  {isLogin && (
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          // TODO: Implement forgot password functionality
                          alert("Chức năng quên mật khẩu sẽ được cập nhật sớm!");
                        }}
                        className="text-sm text-sky-600 hover:text-sky-700 font-medium transition-colors"
                      >
                        Quên mật khẩu?
                      </button>
                    </div>
                  )}
                </div>

                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="pt-2"
                >
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white h-10 text-sm font-semibold shadow-lg hover:shadow-xl transition-all"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Đang xử lý...
                      </span>
                    ) : (
                      <span>{isLogin ? "Đăng nhập" : "Đăng ký"}</span>
                    )}
                  </Button>
                </motion.div>

                <div className="pt-3 border-t border-gray-200/50">
                  <button
                    type="button"
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setError("");
                    }}
                    className="w-full text-center text-sm text-sky-600 hover:text-sky-700 font-medium transition-colors"
                  >
                    {isLogin 
                      ? "Chưa có tài khoản? Đăng ký ngay" 
                      : "Đã có tài khoản? Đăng nhập ngay"}
                  </button>
                </div>
              </form>

              <style jsx>{`
                @keyframes shimmer {
                  0%, 100% { background-position: 0% 50%; }
                  50% { background-position: 100% 50%; }
                }
              `}</style>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}

