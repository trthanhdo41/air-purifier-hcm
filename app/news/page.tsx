"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { createClient } from "@/lib/supabase/client";
import { Clock, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

interface NewsItem {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  image?: string;
  published_at?: string;
  created_at?: string;
  author_name?: string;
  views: number;
}

export default function NewsPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      const { data, error } = await supabase
        .from('news')
        .select('id, title, slug, excerpt, image, published_at, created_at, author_name, views')
        .eq('status', 'published')
        .order('published_at', { ascending: false });
      
      if (error) {
        if (error.code === 'PGRST205' || error.message?.includes('Could not find the table')) {
          setNews([]);
        } else {
          console.error('Error loading news:', error);
          setNews([]);
        }
      } else if (data) {
        setNews(data as NewsItem[]);
      } else {
        setNews([]);
      }
    } catch (e) {
      setNews([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Chưa công bố";
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "1 ngày trước";
    if (diffDays < 7) return `${diffDays} ngày trước`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} tháng trước`;
    return `${Math.floor(diffDays / 365)} năm trước`;
  };

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="bg-gray-50 py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Tin tức sản phẩm
            </h1>
            <p className="text-gray-600">
              Cập nhật tin tức mới nhất về máy lọc không khí
            </p>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="w-full h-48 bg-gray-200 animate-pulse" />
                  <div className="p-6 space-y-3">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-full" />
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : news.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
              <p className="text-gray-500 text-lg">Chưa có tin tức nào</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {news.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    href={`/news/${item.slug}`}
                    className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all block"
                  >
                    {item.image && (
                      <div className="relative w-full h-48 overflow-hidden">
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div className="p-6">
                      <h3 className="font-semibold text-gray-900 line-clamp-2 mb-3 group-hover:text-sky-600 transition-colors">
                        {item.title}
                      </h3>
                      {item.excerpt && (
                        <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                          {item.excerpt}
                        </p>
                      )}
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3" />
                          <span>{formatDate(item.published_at || item.created_at)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                          <span className="group-hover:text-sky-600 transition-colors">Đọc thêm</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

