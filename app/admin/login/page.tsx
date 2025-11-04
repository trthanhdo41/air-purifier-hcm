"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/auth";

export default function AdminLoginPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  useEffect(() => {
    // Redirect to admin dashboard if already logged in as admin
    if (user && user.email === 'admin@hoithoxanh.com') {
      router.push('/admin/dashboard');
      return;
    }
    
    // Redirect to home if not admin (use regular login modal instead)
    router.push('/home');
  }, [user, router]);

  // Don't render anything while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
    </div>
  );
}
