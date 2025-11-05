"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Edit, Trash2, X, Newspaper, Eye, Calendar, User, Bold, Italic, Link, Image, List, Heading1, Heading2, Heading3, Type, AlignLeft, AlignCenter, AlignRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import Toast from "@/components/Toast";
import { useAuthStore } from "@/lib/stores/auth";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';

// Rich Text Editor Component với Markdown + Toolbar
function ContentEditor({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showPreview, setShowPreview] = useState(false);

  const insertText = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end);
    
    onChange(newText);
    
    // Focus lại và đặt cursor
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + before.length + selectedText.length + after.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const insertImage = () => {
    const url = window.prompt('Nhập URL hình ảnh:');
    if (url) {
      insertText(`![alt text](${url})`, '');
    }
  };

  const insertLink = () => {
    const text = window.prompt('Nhập text cho link:');
    if (text) {
      const url = window.prompt('Nhập URL:');
      if (url) {
        insertText(`[${text}](`, `${url})`);
      }
    }
  };

  const toolbarButtons = [
    { icon: Bold, label: 'Bold', action: () => insertText('**', '**') },
    { icon: Italic, label: 'Italic', action: () => insertText('*', '*') },
    { icon: Heading1, label: 'H1', action: () => insertText('# ', '') },
    { icon: Heading2, label: 'H2', action: () => insertText('## ', '') },
    { icon: Heading3, label: 'H3', action: () => insertText('### ', '') },
    { icon: List, label: 'List', action: () => insertText('- ', '') },
    { icon: Link, label: 'Link', action: insertLink },
    { icon: Image, label: 'Image', action: insertImage },
  ];

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-100">
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 bg-gray-50 border-b border-gray-200 flex-wrap">
        {toolbarButtons.map((btn, idx) => {
          const Icon = btn.icon;
          return (
            <button
              key={idx}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                btn.action();
              }}
              className="p-2 hover:bg-gray-200 rounded text-gray-700 hover:text-sky-600 transition-colors"
              title={btn.label}
            >
              <Icon className="w-4 h-4" />
            </button>
          );
        })}
        <div className="flex-1" />
        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          className={`px-3 py-1.5 text-sm rounded transition-colors ${
            showPreview 
              ? 'bg-sky-500 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {showPreview ? '📝 Soạn' : '👁️ Xem trước'}
        </button>
      </div>

      {/* Editor Content */}
      <div className="flex">
        {/* Markdown Editor */}
        <div className={`${showPreview ? 'w-1/2 border-r border-gray-200' : 'w-full'}`}>
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={20}
            className="w-full px-4 py-3 outline-none text-sm font-mono resize-none"
            placeholder="Nhập nội dung markdown... 

# Tiêu đề lớn
## Tiêu đề nhỏ
**Bold text** *Italic text*

- Danh sách
- Item 2

![alt](image-url)
[Link text](url)"
            required
          />
        </div>

        {/* Preview */}
        {showPreview && (
          <div className="w-1/2 p-4 overflow-y-auto max-h-[600px] prose prose-sm max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw, rehypeSanitize]}
            >
              {value || '*Chưa có nội dung*'}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}

interface NewsItem {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  image?: string;
  author_id?: string;
  author_name?: string;
  status: 'draft' | 'published' | 'archived';
  published_at?: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  og_image?: string;
  views: number;
  created_at?: string;
  updated_at?: string;
}

export default function NewsPage() {
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingNewsId, setEditingNewsId] = useState<string | null>(null);
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<{ message: string; type?: "success" | "error" | "info" } | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    image: "",
    author_name: "",
    status: "draft" as 'draft' | 'published' | 'archived',
    published_at: "",
    meta_title: "",
    meta_description: "",
    meta_keywords: "",
    og_image: "",
  });

  const filteredNews = newsList.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        setToast({ message: 'Lỗi khi tải tin tức: ' + error.message, type: 'error' });
      } else {
        setNewsList(data || []);
      }
    } catch (error) {
      setToast({ message: 'Lỗi khi tải tin tức', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddNews = () => {
    setIsEditMode(false);
    setEditingNewsId(null);
    setFormData({
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      image: "",
      author_name: user?.name || "",
      status: "draft",
      published_at: "",
      meta_title: "",
      meta_description: "",
      meta_keywords: "",
      og_image: "",
    });
    setShowModal(true);
  };

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const handleCreateNews = async () => {
    if (!formData.title || !formData.content) {
      setToast({ message: "Vui lòng điền đầy đủ thông tin bắt buộc!", type: 'error' });
      return;
    }

    try {
      const supabase = createClient();
      const slug = formData.slug || generateSlug(formData.title);
      
      const newsData: any = {
        title: formData.title,
        slug,
        excerpt: formData.excerpt || null,
        content: formData.content,
        image: formData.image || null,
        author_id: user?.id || null,
        author_name: formData.author_name || user?.name || null,
        status: formData.status,
        meta_title: formData.meta_title || null,
        meta_description: formData.meta_description || null,
        meta_keywords: formData.meta_keywords || null,
        og_image: formData.og_image || formData.image || null,
      };

      // Set published_at if status is published
      if (formData.status === 'published') {
        newsData.published_at = formData.published_at || new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('news')
        .insert(newsData)
        .select()
        .single();

      if (error) {
        setToast({ message: 'Lỗi khi thêm tin tức: ' + error.message, type: 'error' });
        return;
      }

      await fetchNews();
      setShowModal(false);
      setFormData({
        title: "",
        slug: "",
        excerpt: "",
        content: "",
        image: "",
        author_name: user?.name || "",
        status: "draft",
        published_at: "",
        meta_title: "",
        meta_description: "",
        meta_keywords: "",
        og_image: "",
      });
      setToast({ message: "Thêm tin tức thành công!", type: 'success' });
    } catch (error) {
      setToast({ message: 'Lỗi khi thêm tin tức', type: 'error' });
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditNews = (newsId: string) => {
    const news = newsList.find(x => x.id === newsId);
    if (!news) return;
    setIsEditMode(true);
    setEditingNewsId(newsId);
    setFormData({
      title: news.title || "",
      slug: news.slug || "",
      excerpt: news.excerpt || "",
      content: news.content || "",
      image: news.image || "",
      author_name: news.author_name || user?.name || "",
      status: news.status || "draft",
      published_at: news.published_at ? new Date(news.published_at).toISOString().slice(0, 16) : "",
      meta_title: news.meta_title || "",
      meta_description: news.meta_description || "",
      meta_keywords: news.meta_keywords || "",
      og_image: news.og_image || news.image || "",
    });
    setShowModal(true);
  };

  const handleUpdateNews = async () => {
    if (!editingNewsId) return;
    if (!formData.title || !formData.content) {
      setToast({ message: "Vui lòng điền đầy đủ thông tin bắt buộc!", type: 'error' });
      return;
    }

    try {
      setIsUpdating(true);
      const supabase = createClient();
      const slug = formData.slug || generateSlug(formData.title);

      const newsData: any = {
        title: formData.title,
        slug,
        excerpt: formData.excerpt || null,
        content: formData.content,
        image: formData.image || null,
        author_name: formData.author_name || user?.name || null,
        status: formData.status,
        meta_title: formData.meta_title || null,
        meta_description: formData.meta_description || null,
        meta_keywords: formData.meta_keywords || null,
        og_image: formData.og_image || formData.image || null,
      };

      // Set published_at if status is published and not already set
      if (formData.status === 'published' && !newsList.find(n => n.id === editingNewsId)?.published_at) {
        newsData.published_at = formData.published_at || new Date().toISOString();
      }

      const { error } = await supabase
        .from('news')
        .update(newsData)
        .eq('id', editingNewsId);

      if (error) {
        setToast({ message: 'Lỗi khi cập nhật tin tức: ' + error.message, type: 'error' });
        return;
      }

      await fetchNews();
      setShowModal(false);
      setEditingNewsId(null);
      setToast({ message: "Cập nhật tin tức thành công!", type: 'success' });
    } catch (error) {
      setToast({ message: 'Lỗi khi cập nhật tin tức', type: 'error' });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteNews = async (newsId: string) => {
    if (!confirm(`Bạn có chắc muốn xóa tin tức này?`)) return;

    try {
      setDeletingIds(prev => new Set(prev).add(newsId));
      const supabase = createClient();
      const { error } = await supabase
        .from('news')
        .delete()
        .eq('id', newsId);

      if (error) {
        setToast({ message: 'Lỗi khi xóa tin tức: ' + error.message, type: 'error' });
        return;
      }

      setNewsList(newsList.filter(item => item.id !== newsId));
      setToast({ message: "Xóa tin tức thành công!", type: 'success' });
    } catch (error) {
      setToast({ message: 'Lỗi khi xóa tin tức', type: 'error' });
    } finally {
      setDeletingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(newsId);
        return newSet;
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-700';
      case 'draft':
        return 'bg-gray-100 text-gray-700';
      case 'archived':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'published':
        return 'Đã xuất bản';
      case 'draft':
        return 'Bản nháp';
      case 'archived':
        return 'Đã lưu trữ';
      default:
        return status;
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Quản lý tin tức</h1>
        <p className="text-gray-600 mt-1">Thêm, sửa, xóa tin tức và blog</p>
      </div>

      {/* Search and Add */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm tin tức..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button
          onClick={handleAddNews}
          className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white"
        >
          <Plus className="w-5 h-5 mr-2" />
          Viết tin tức mới
        </Button>
      </div>

      {/* News Table */}
      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      ) : filteredNews.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <Newspaper className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {searchQuery ? "Không tìm thấy tin tức" : "Chưa có tin tức nào"}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchQuery ? "Thử tìm kiếm với từ khóa khác" : "Viết tin tức đầu tiên của bạn"}
          </p>
          {!searchQuery && (
            <Button onClick={handleAddNews} className="bg-sky-500 hover:bg-sky-600 text-white">
              <Plus className="w-5 h-5 mr-2" />
              Viết tin tức mới
            </Button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Tiêu đề</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Tác giả</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Trạng thái</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Lượt xem</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Ngày tạo</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredNews.map((item) => (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {item.image && (
                          <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                            <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 line-clamp-1">{item.title}</h3>
                          <p className="text-sm text-gray-500 line-clamp-1">{item.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <User className="w-4 h-4" />
                        <span>{item.author_name || "N/A"}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(item.status)}`}>
                        {getStatusLabel(item.status)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {(item.views || 0) > 0 ? (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Eye className="w-4 h-4" />
                          <span>{item.views}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>{item.created_at ? new Date(item.created_at).toLocaleDateString('vi-VN') : "-"}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditNews(item.id)}
                          className="p-2 text-gray-600 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteNews(item.id)}
                          disabled={deletingIds.has(item.id)}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Xóa"
                        >
                          {deletingIds.has(item.id) ? (
                            <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="fixed inset-0 z-40 bg-black/50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
              >
                <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
                  <h2 className="text-xl font-bold text-gray-900">
                    {isEditMode ? "Sửa tin tức" : "Viết tin tức mới"}
                  </h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                <div className="p-6 space-y-4">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Tiêu đề <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          title: e.target.value,
                          slug: isEditMode ? formData.slug : generateSlug(e.target.value),
                          meta_title: formData.meta_title || e.target.value,
                        });
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none"
                      placeholder="Nhập tiêu đề tin tức"
                      required
                    />
                  </div>

                  {/* Slug */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Slug (URL)
                    </label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none"
                      placeholder="tin-tuc-san-pham"
                    />
                    <p className="text-xs text-gray-500 mt-1">Tự động tạo từ tiêu đề nếu để trống</p>
                  </div>

                  {/* Image */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Hình ảnh (URL)
                    </label>
                    <input
                      type="url"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value, og_image: formData.og_image || e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none"
                      placeholder="https://example.com/image.jpg"
                    />
                    {formData.image && (
                      <div className="mt-2 relative w-full h-48 rounded-lg overflow-hidden border border-gray-200">
                        <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>

                  {/* Excerpt */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Mô tả ngắn
                    </label>
                    <textarea
                      value={formData.excerpt}
                      onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                      rows={2}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none"
                      placeholder="Mô tả ngắn về tin tức..."
                    />
                  </div>

                  {/* Content */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nội dung <span className="text-red-500">*</span>
                    </label>
                    <ContentEditor 
                      value={formData.content}
                      onChange={(value: string) => setFormData({ ...formData, content: value })}
                    />
                  </div>

                  {/* Author */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Tác giả
                    </label>
                    <input
                      type="text"
                      value={formData.author_name}
                      onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none"
                      placeholder="Tên tác giả"
                    />
                  </div>

                  {/* Status & Published Date */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Trạng thái
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as 'draft' | 'published' | 'archived' })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none"
                      >
                        <option value="draft">Bản nháp</option>
                        <option value="published">Đã xuất bản</option>
                        <option value="archived">Đã lưu trữ</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Ngày xuất bản
                      </label>
                      <input
                        type="datetime-local"
                        value={formData.published_at}
                        onChange={(e) => setFormData({ ...formData, published_at: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none"
                      />
                    </div>
                  </div>

                  {/* SEO Section */}
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">SEO Settings</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Meta Title (SEO)
                        </label>
                        <input
                          type="text"
                          value={formData.meta_title}
                          onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none"
                          placeholder="SEO title (để trống sẽ dùng tiêu đề)"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Meta Description (SEO)
                        </label>
                        <textarea
                          value={formData.meta_description}
                          onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                          rows={2}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none"
                          placeholder="Mô tả SEO (150-160 ký tự)"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Meta Keywords (SEO)
                        </label>
                        <input
                          type="text"
                          value={formData.meta_keywords}
                          onChange={(e) => setFormData({ ...formData, meta_keywords: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none"
                          placeholder="từ khóa 1, từ khóa 2, từ khóa 3"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          OG Image (Social Media)
                        </label>
                        <input
                          type="url"
                          value={formData.og_image}
                          onChange={(e) => setFormData({ ...formData, og_image: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none"
                          placeholder="https://example.com/og-image.jpg"
                        />
                        <p className="text-xs text-gray-500 mt-1">Hình ảnh hiển thị khi chia sẻ lên mạng xã hội (để trống sẽ dùng hình ảnh chính)</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <Button
                      onClick={() => setShowModal(false)}
                      variant="outline"
                      className="flex-1"
                    >
                      Hủy
                    </Button>
                    <Button
                      onClick={isEditMode ? handleUpdateNews : handleCreateNews}
                      disabled={isCreating || isUpdating}
                      className="flex-1 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {(isCreating || isUpdating) ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          {isEditMode ? "Đang cập nhật..." : "Đang tạo..."}
                        </>
                      ) : (
                        isEditMode ? "Cập nhật" : "Xuất bản"
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type || "info"}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

