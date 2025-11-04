"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, Calendar, User, Eye, Clock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface NewsItem {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  image?: string;
  author_name?: string;
  published_at?: string;
  created_at?: string;
  views: number;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  og_image?: string;
}

export default function NewsDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  
  const [news, setNews] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedNews, setRelatedNews] = useState<NewsItem[]>([]);

  useEffect(() => {
    if (slug) {
      loadNews();
    }
  }, [slug]);

  const loadNews = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      
      // Load current news
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .single();

      if (error || !data) {
        setNews(null);
        return;
      }

      setNews(data as NewsItem);

      // Update views
      await supabase
        .from('news')
        .update({ views: (data.views || 0) + 1 })
        .eq('id', data.id);

      // Load related news
      const { data: relatedData } = await supabase
        .from('news')
        .select('*')
        .eq('status', 'published')
        .neq('id', data.id)
        .order('published_at', { ascending: false })
        .limit(5);

      if (relatedData) {
        setRelatedNews(relatedData as NewsItem[]);
      }
    } catch (e) {
      console.error('Error loading news:', e);
      setNews(null);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Chưa công bố";
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gray-100 rounded-lg h-96 animate-pulse mb-6" />
            <div className="space-y-4">
              <div className="bg-gray-100 rounded-lg h-8 animate-pulse w-3/4" />
              <div className="bg-gray-100 rounded-lg h-4 animate-pulse" />
              <div className="bg-gray-100 rounded-lg h-4 animate-pulse w-5/6" />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!news) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Không tìm thấy tin tức</h1>
            <p className="text-gray-600 mb-6">Tin tức bạn đang tìm không tồn tại hoặc đã bị xóa.</p>
            <Button onClick={() => router.push('/news')} className="bg-sky-500 hover:bg-sky-600 text-white">
              Xem tất cả tin tức
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      <article className="bg-white py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Back Button */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-6"
            >
              <Button
                variant="ghost"
                onClick={() => router.back()}
                className="flex items-center gap-2 text-gray-600 hover:text-sky-600"
              >
                <ArrowLeft className="w-4 h-4" />
                Quay lại
              </Button>
            </motion.div>

            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
                {news.title}
              </h1>
              
              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6">
                {news.author_name && (
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>{news.author_name}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(news.published_at || news.created_at)}</span>
                </div>
                {(news.views || 0) > 0 && (
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    <span>{news.views} lượt xem</span>
                  </div>
                )}
              </div>

              {/* Excerpt */}
              {news.excerpt && (
                <p className="text-xl text-gray-600 leading-relaxed mb-6">
                  {news.excerpt}
                </p>
              )}
            </motion.div>

            {/* Featured Image */}
            {news.image && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="relative w-full h-64 md:h-96 rounded-xl overflow-hidden mb-8"
              >
                <Image
                  src={news.image}
                  alt={news.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 896px"
                  className="object-cover"
                  priority
                />
              </motion.div>
            )}

            {/* Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="prose prose-lg max-w-none mb-12"
            >
              <div 
                className="text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: news.content }}
              />
            </motion.div>

            {/* Related News */}
            {relatedNews.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="border-t border-gray-200 pt-8 mt-12"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Tin tức liên quan</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {relatedNews.map((item) => (
                    <Link
                      key={item.id}
                      href={`/news/${item.slug}`}
                      className="group flex gap-4 p-4 rounded-lg hover:bg-gray-50 transition-all"
                    >
                      {item.image && (
                        <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                          <Image
                            src={item.image}
                            alt={item.title}
                            fill
                            sizes="96px"
                            className="object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-sky-600 transition-colors">
                          {item.title}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          <span>{formatDate(item.published_at || item.created_at)}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </article>

      <Footer />
    </div>
  );
}


