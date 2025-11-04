"use client";

import { Clock, ArrowRight } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

interface NewsItem {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  image?: string;
  published_at?: string;
  created_at?: string;
}

export default function NewsSection() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('news')
          .select('id, title, slug, excerpt, image, published_at, created_at')
          .eq('status', 'published')
          .order('published_at', { ascending: false })
          .limit(5);
        
        if (error) {
          // Table might not exist yet, silently fail
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
        // Silently handle errors - table might not exist
        setNews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

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

  // Fallback news nếu chưa có data
  const fallbackNews: NewsItem[] = [];

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">Tin tức sản phẩm</h3>
        <Link href="/news" className="text-sky-500 hover:text-sky-600 text-sm font-semibold flex items-center gap-1 group transition-all">
          Xem tất cả
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-3 p-2">
              <div className="w-24 h-20 bg-gray-200 rounded-lg animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : news.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 text-sm">Chưa có tin tức nào</p>
        </div>
      ) : (
        <div className="space-y-4">
          {news.map((item) => (
            <Link
              key={item.id}
              href={`/news/${item.slug}`}
              className="flex gap-3 group hover:bg-gray-50 p-2 rounded-lg transition-all duration-200"
            >
              <div className="relative w-24 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="96px"
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400 text-xs">No Image</span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900 line-clamp-2 mb-2 group-hover:text-sky-500 transition-colors">
                  {item.title}
                </h4>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  <span>{formatDate(item.published_at || item.created_at)}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

