"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, Calendar, User, Eye, Clock, Star, TrendingUp, ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import ProductCard from "@/components/ProductCard";

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
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);

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

      // Load featured products
      const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(6);

      if (productsData) {
        setFeaturedProducts(productsData);
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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Sidebar Left */}
            <aside className="hidden lg:block lg:col-span-3 space-y-6 lg:sticky lg:top-32 lg:self-start lg:flex lg:flex-col lg:justify-center lg:min-h-[calc(100vh-8rem)] lg:pt-4">
              {/* Sản phẩm nổi bật */}
              {featuredProducts.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-5 h-5 text-sky-600" />
                    <h3 className="text-lg font-bold text-gray-900">Sản phẩm nổi bật</h3>
                  </div>
                  <div className="space-y-4">
                    {featuredProducts.slice(0, 3).map((product, idx) => (
                      <Link
                        key={product.id}
                        href={`/product/${product.id}`}
                        className="block group"
                      >
                        <div className="flex gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                            <Image
                              src={product.image || '/logo.png'}
                              alt={product.name}
                              fill
                              sizes="64px"
                              className="object-cover group-hover:scale-110 transition-transform"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm text-gray-900 line-clamp-2 group-hover:text-sky-600 transition-colors">
                              {product.name}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-sky-600 font-bold text-sm">
                                {new Intl.NumberFormat('vi-VN').format(product.price)}đ
                              </span>
                              {product.original_price && product.original_price > product.price && (
                                <span className="text-gray-400 text-xs line-through">
                                  {new Intl.NumberFormat('vi-VN').format(product.original_price)}đ
                                </span>
                              )}
                            </div>
                            {product.rating && (
                              <div className="flex items-center gap-1 mt-1">
                                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                <span className="text-xs text-gray-600">{product.rating}</span>
                                {product.reviews && (
                                  <span className="text-xs text-gray-400">({product.reviews})</span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <Link
                    href="/products"
                    className="block mt-4 text-center text-sm text-sky-600 hover:text-sky-700 font-medium"
                  >
                    Xem tất cả sản phẩm →
                  </Link>
                </motion.div>
              )}

              {/* CTA Banner - Centered vertically */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white lg:mt-auto"
              >
                <div className="flex items-center gap-3 mb-3">
                  <ShoppingCart className="w-6 h-6" />
                  <h3 className="font-bold text-lg">Mua sắm ngay</h3>
                </div>
                <p className="text-sm text-green-100 mb-4">
                  Khám phá bộ sưu tập máy lọc không khí chất lượng cao
                </p>
                <Link href="/products">
                  <Button className="w-full bg-white text-green-600 hover:bg-green-50 font-semibold">
                    Xem sản phẩm
                  </Button>
                </Link>
              </motion.div>
            </aside>

            {/* Main Content */}
            <div className="col-span-1 lg:col-span-6">
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
              <style jsx global>{`
                .prose {
                  color: #374151;
                  line-height: 1.75;
                }
                .prose h1, .prose h2, .prose h3, .prose h4, .prose h5, .prose h6 {
                  font-weight: 700;
                  margin-top: 2em;
                  margin-bottom: 1em;
                  color: #111827;
                }
                .prose h1 { font-size: 2.25em; }
                .prose h2 { font-size: 1.875em; }
                .prose h3 { font-size: 1.5em; }
                .prose h4 { font-size: 1.25em; }
                .prose p {
                  margin-bottom: 1.25em;
                }
                .prose img {
                  max-width: 100%;
                  height: auto;
                  border-radius: 8px;
                  margin: 1.5em 0;
                }
                .prose a {
                  color: #0ea5e9;
                  text-decoration: underline;
                }
                .prose a:hover {
                  color: #0284c7;
                }
                .prose ul, .prose ol {
                  margin: 1.25em 0;
                  padding-left: 1.625em;
                }
                .prose li {
                  margin: 0.5em 0;
                }
                .prose blockquote {
                  border-left: 4px solid #0ea5e9;
                  padding-left: 1em;
                  margin: 1.5em 0;
                  font-style: italic;
                  color: #6b7280;
                }
                .prose code {
                  background: #f3f4f6;
                  padding: 0.125em 0.375em;
                  border-radius: 4px;
                  font-size: 0.875em;
                }
                .prose pre {
                  background: #1f2937;
                  color: #f9fafb;
                  padding: 1em;
                  border-radius: 8px;
                  overflow-x: auto;
                  margin: 1.5em 0;
                }
                .prose video {
                  max-width: 100%;
                  border-radius: 8px;
                  margin: 1.5em 0;
                }
                .prose table {
                  width: 100%;
                  border-collapse: collapse;
                  margin: 1.5em 0;
                }
                .prose table th,
                .prose table td {
                  border: 1px solid #e5e7eb;
                  padding: 0.5em 1em;
                  text-align: left;
                }
                .prose table th {
                  background: #f3f4f6;
                  font-weight: 700;
                }
              `}</style>
              <div className="text-gray-700 leading-relaxed">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw, rehypeSanitize]}
                >
                  {news.content}
                </ReactMarkdown>
              </div>
            </motion.div>

            {/* Sản phẩm nổi bật - Mobile only */}
            {featuredProducts.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="lg:hidden mt-12 border-t border-gray-200 pt-8"
              >
                <div className="flex items-center gap-2 mb-6">
                  <TrendingUp className="w-5 h-5 text-sky-600" />
                  <h2 className="text-2xl font-bold text-gray-900">Sản phẩm nổi bật</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {featuredProducts.slice(0, 4).map((product, idx) => (
                    <Link
                      key={product.id}
                      href={`/product/${product.id}`}
                      className="group bg-white rounded-xl border border-gray-200 p-4 hover:shadow-lg transition-all"
                    >
                      <div className="relative w-full h-48 rounded-lg overflow-hidden mb-3">
                        <Image
                          src={product.image || '/logo.png'}
                          alt={product.name}
                          fill
                          sizes="(max-width: 640px) 100vw, 50vw"
                          className="object-cover group-hover:scale-110 transition-transform"
                        />
                      </div>
                      <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-sky-600 transition-colors">
                        {product.name}
                      </h3>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sky-600 font-bold text-lg">
                          {new Intl.NumberFormat('vi-VN').format(product.price)}đ
                        </span>
                        {product.original_price && product.original_price > product.price && (
                          <span className="text-gray-400 text-sm line-through">
                            {new Intl.NumberFormat('vi-VN').format(product.original_price)}đ
                          </span>
                        )}
                      </div>
                      {product.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm text-gray-600">{product.rating}</span>
                          {product.reviews && (
                            <span className="text-sm text-gray-400">({product.reviews})</span>
                          )}
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
                <Link
                  href="/products"
                  className="block mt-6 text-center text-sky-600 hover:text-sky-700 font-semibold"
                >
                  Xem tất cả sản phẩm →
                </Link>
              </motion.div>
            )}

          </div>

            {/* Sidebar Right */}
            <aside className="hidden lg:block lg:col-span-3 space-y-6 lg:sticky lg:top-32 lg:self-start lg:flex lg:flex-col lg:justify-center lg:min-h-[calc(100vh-8rem)] lg:pt-4">
              {/* Tin tức liên quan */}
              {relatedNews.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
                >
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Tin tức liên quan</h3>
                  <div className="space-y-4">
                    {relatedNews.slice(0, 5).map((item) => (
                      <Link
                        key={item.id}
                        href={`/news/${item.slug}`}
                        className="block group"
                      >
                        <div className="flex gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                          {item.image && (
                            <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                              <Image
                                src={item.image}
                                alt={item.title}
                                fill
                                sizes="80px"
                                className="object-cover group-hover:scale-110 transition-transform"
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm text-gray-900 line-clamp-2 group-hover:text-sky-600 transition-colors mb-1">
                              {item.title}
                            </h4>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <Clock className="w-3 h-3" />
                              <span>{formatDate(item.published_at || item.created_at)}</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}


            </aside>
          </div>
        </div>
      </article>

      <Footer />
    </div>
  );
}


