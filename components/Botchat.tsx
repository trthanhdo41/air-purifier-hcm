"use client";

import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Headphones, Bot, Package, Settings, ArrowLeft, ShoppingBag, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/lib/stores/auth";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';

type ViewType = 'welcome' | 'orders' | 'warranty' | 'chat';

// TypeWriter component for typing animation (optimized for smooth performance)
function TypeWriter({ text, speed = 8, onComplete }: { text: string; speed?: number; onComplete?: () => void }) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const animationRef = useRef<number | null>(null);
  const currentIndexRef = useRef(0);
  const lastTimeRef = useRef(Date.now());
  const textRef = useRef(text);

  useEffect(() => {
    textRef.current = text;
  }, [text]);

  useEffect(() => {
    if (!text) {
      setDisplayedText('');
      setIsTyping(false);
      if (onComplete) onComplete();
      return;
    }

    // Reset state
    setDisplayedText('');
    setIsTyping(true);
    currentIndexRef.current = 0;
    lastTimeRef.current = Date.now();

    const animate = () => {
      const now = Date.now();
      const elapsed = now - lastTimeRef.current;
      const currentText = textRef.current;

      if (elapsed >= speed) {
        if (currentIndexRef.current < currentText.length) {
          // Batch multiple characters for longer text to maintain smoothness
          const charsToAdd = Math.max(1, Math.floor(elapsed / speed));
          const newIndex = Math.min(currentIndexRef.current + charsToAdd, currentText.length);
          
          // Use functional update to avoid stale closures
          setDisplayedText(() => currentText.slice(0, newIndex));
          currentIndexRef.current = newIndex;
          lastTimeRef.current = now;
          
          animationRef.current = requestAnimationFrame(animate);
        } else {
          setIsTyping(false);
          if (onComplete) onComplete();
          return;
        }
      } else {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [text, speed, onComplete]);

  return (
    <span>
      {displayedText}
      {isTyping && <span className="inline-block w-0.5 h-4 bg-gray-600 ml-0.5 animate-pulse">|</span>}
    </span>
  );
}

export default function Botchat() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [currentView, setCurrentView] = useState<ViewType>('welcome');
  const [orders, setOrders] = useState<any[]>([]);
  const [warrantyProducts, setWarrantyProducts] = useState<any[]>([]);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [aiResponding, setAiResponding] = useState(false);
  const [typingMessageId, setTypingMessageId] = useState<string | null>(null);
  const [agentInfo, setAgentInfo] = useState<{ name: string; avatar: string | null; title: string } | null>(null);
  const shouldAutoScrollRef = useRef(true); // Track if we should auto scroll
  const isUserScrollingRef = useRef(false); // Track if user is manually scrolling
  const { user } = useAuthStore();
  const router = useRouter();

  // Generate or get session ID
  useEffect(() => {
    if (user && !sessionId) {
      const storedSessionId = localStorage.getItem(`chat_session_${user.id}`);
      if (storedSessionId) {
        setSessionId(storedSessionId);
      } else {
        const newSessionId = `session_${user.id}_${Date.now()}`;
        localStorage.setItem(`chat_session_${user.id}`, newSessionId);
        setSessionId(newSessionId);
      }
    }
  }, [user, sessionId]);

  // Fetch agent info from AI settings
  useEffect(() => {
    const fetchAgentInfo = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('ai_settings')
          .select('agent_name, agent_avatar, agent_title')
          .maybeSingle();

        if (error) {
          console.error('Error fetching agent info:', error);
          // Use default values
          setAgentInfo({ name: 'Chị Lan', avatar: null, title: 'Tư vấn viên' });
        } else if (data) {
          setAgentInfo({
            name: data.agent_name || 'Chị Lan',
            avatar: data.agent_avatar || null,
            title: data.agent_title || 'Tư vấn viên'
          });
        } else {
          // No settings found, use defaults
          setAgentInfo({ name: 'Chị Lan', avatar: null, title: 'Tư vấn viên' });
        }
      } catch (err) {
        console.error('Error fetching agent info:', err);
        setAgentInfo({ name: 'Chị Lan', avatar: null, title: 'Tư vấn viên' });
      }
    };

    fetchAgentInfo();
  }, []);

  const fetchOrders = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      setOrders(data || []);
    } finally {
      setLoading(false);
    }
  };

  const fetchWarrantyProducts = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: ordersData } = await supabase
        .from('orders')
        .select('id, created_at')
        .eq('user_id', user.id)
        .eq('status', 'delivered');
      
      if (!ordersData || ordersData.length === 0) {
        setWarrantyProducts([]);
        return;
      }

      const orderIds = ordersData.map(o => o.id);
      const { data: orderItems } = await supabase
        .from('order_items')
        .select('order_id, product_id')
        .in('order_id', orderIds);
      
      if (!orderItems || orderItems.length === 0) {
        setWarrantyProducts([]);
        return;
      }

      const productIds = Array.from(new Set(orderItems.map(item => item.product_id)));
      const { data: products } = await supabase
        .from('products')
        .select('*')
        .in('id', productIds);
      
      if (!products || products.length === 0) {
        setWarrantyProducts([]);
        return;
      }

      const warrantyItems: any[] = [];
      const now = new Date();
      const productMap = new Map(products.map(p => [p.id, p]));
      
      for (const item of orderItems) {
        const order = ordersData.find(o => o.id === item.order_id);
        const product = productMap.get(item.product_id);
        if (order && product) {
          const orderDate = new Date(order.created_at);
          const warrantyExpiry = new Date(orderDate);
          warrantyExpiry.setMonth(warrantyExpiry.getMonth() + 12);
          
          warrantyItems.push({
            ...product,
            orderDate: order.created_at,
            warrantyExpiry: warrantyExpiry.toISOString(),
            isExpired: now > warrantyExpiry,
          });
        }
      }
      
      setWarrantyProducts(warrantyItems);
    } finally {
      setLoading(false);
    }
  };


  const statusLabels: Record<string, string> = {
    pending: 'Chờ xử lý',
    processing: 'Đang xử lý',
    shipped: 'Đang giao',
    delivered: 'Đã giao',
    cancelled: 'Đã hủy',
  };

  useEffect(() => {
    if (!isOpen) {
      setCurrentView('welcome');
    }
  }, [isOpen]);

  const fetchChatMessages = async () => {
    if (!user) return;
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error('Error fetching messages:', error);
        if (error.message?.includes('permission') || error.message?.includes('users')) {
          setError('Lỗi quyền truy cập. Vui lòng đăng nhập lại.');
        }
        return;
      }
      
      setChatMessages(data || []);
      // Auto scroll to bottom (only if should auto scroll)
      if (shouldAutoScrollRef.current) {
        requestAnimationFrame(() => {
          setTimeout(() => {
            const container = document.getElementById('chat-messages-container');
            if (container && shouldAutoScrollRef.current) {
              container.scrollTop = container.scrollHeight;
            }
          }, 50);
        });
      }
    } catch (err: any) {
      console.error('Error fetching messages:', err);
      if (err?.message?.includes('permission') || err?.message?.includes('users')) {
        setError('Lỗi quyền truy cập. Vui lòng đăng nhập lại.');
      }
    }
  };

  const sendMessage = async () => {
    if (!user || !message.trim() || sendingMessage || !sessionId) {
      if (!user) {
        setError('Vui lòng đăng nhập để gửi tin nhắn');
        setTimeout(() => setError(null), 3000);
      }
      return;
    }
    
    const msgText = message.trim();
    setMessage('');
    setSendingMessage(true);
    setError(null);
    
    try {
      const supabase = createClient();
      console.log('Sending message:', { user_id: user.id, message: msgText });
      
      // 1. Save user message to chat_messages (for admin to see)
      const { data, error: insertError } = await supabase
        .from('chat_messages')
        .insert({
          user_id: user.id,
          user_email: user.email || '',
          user_name: user.name || null,
          user_phone: user.phone || null,
          message: msgText,
          is_from_user: true,
          is_read: false,
        })
        .select()
        .single();
      
      console.log('Insert result:', { data, error: insertError });
      
      if (insertError) {
        console.error('Error sending message:', insertError);
        const errorMsg = insertError.message || insertError.code || 'Không thể gửi tin nhắn. Vui lòng thử lại.';
        setError(errorMsg);
        setMessage(msgText); // Restore message on error
        setTimeout(() => setError(null), 5000);
        return;
      }

      // 2. Update chat messages list
      await fetchChatMessages();
      
      // Auto scroll to bottom after user sends message (only if should auto scroll)
      shouldAutoScrollRef.current = true;
      requestAnimationFrame(() => {
        setTimeout(() => {
          const container = document.getElementById('chat-messages-container');
          if (container && shouldAutoScrollRef.current) {
            container.scrollTop = container.scrollHeight;
          }
        }, 50);
      });

      // 3. Try to get AI response
      setAiResponding(true);
      try {
        const aiResponse = await fetch('/api/chat/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: msgText,
            sessionId: sessionId,
            userId: user.id,
            userName: user.name || user.email || '',
            userEmail: user.email || '',
            userPhone: user.phone || null,
          }),
        });

        const aiData = await aiResponse.json();

        if (aiData.success && aiData.message) {
          // AI responded successfully
          // Add AI response to chat_messages (as admin message so it shows up)
          const { data: aiMessageData, error: aiInsertError } = await supabase
            .from('chat_messages')
            .insert({
              user_id: user.id,
              user_email: user.email || '',
              user_name: user.name || null,
              message: aiData.message,
              is_from_user: false,
              is_read: false,
              admin_id: null, // AI response, not from admin
            })
            .select()
            .single();

          if (aiInsertError) {
            console.error('Error saving AI response:', aiInsertError);
          } else if (aiMessageData) {
            // Set typing animation for this message
            setTypingMessageId(aiMessageData.id);
            shouldAutoScrollRef.current = true; // Enable auto scroll when AI starts responding
            // Refresh chat messages to show the new message
            await fetchChatMessages();
            
            // Auto scroll to bottom when AI responds (only if should auto scroll)
            if (shouldAutoScrollRef.current) {
              requestAnimationFrame(() => {
                setTimeout(() => {
                  const container = document.getElementById('chat-messages-container');
                  if (container && shouldAutoScrollRef.current) {
                    container.scrollTop = container.scrollHeight;
                  }
                }, 50);
              });
            }
            
            // Clear typing after animation completes (roughly text.length * speed + 500ms buffer)
            // This will trigger markdown rendering after typing finishes
            setTimeout(() => {
              setTypingMessageId(null);
              // Scroll again after markdown renders (only if should auto scroll)
              if (shouldAutoScrollRef.current) {
                requestAnimationFrame(() => {
                  setTimeout(() => {
                    const container = document.getElementById('chat-messages-container');
                    if (container && shouldAutoScrollRef.current) {
                      container.scrollTop = container.scrollHeight;
                    }
                  }, 50);
                });
              }
              // Disable auto scroll after AI finishes responding
              setTimeout(() => {
                shouldAutoScrollRef.current = false;
              }, 200);
            }, aiData.message.length * 8 + 500);
          }
        } else if (aiData.shouldWaitForAgent) {
          // AI is disabled or offline, wait for agent
          console.log('AI not available, waiting for agent');
        }
      } catch (aiErr: any) {
        console.error('Error getting AI response:', aiErr);
        // Silently fail - user message is already saved, agent can respond manually
      } finally {
        setAiResponding(false);
        // Auto scroll to bottom when AI finishes responding (only if should auto scroll)
        if (shouldAutoScrollRef.current) {
          requestAnimationFrame(() => {
            setTimeout(() => {
              const container = document.getElementById('chat-messages-container');
              if (container && shouldAutoScrollRef.current) {
                container.scrollTop = container.scrollHeight;
              }
            }, 50);
          });
        }
      }
    } catch (err: any) {
      console.error('Error sending message:', err);
      setError(err?.message || 'Đã xảy ra lỗi. Vui lòng thử lại.');
      setMessage(msgText); // Restore message on error
      setTimeout(() => setError(null), 5000);
    } finally {
      setSendingMessage(false);
    }
  };

  useEffect(() => {
    if (currentView === 'chat' && user) {
      fetchChatMessages();
      // Poll for new messages every 3 seconds
      const interval = setInterval(fetchChatMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [currentView, user]);

  const handleViewChange = (view: ViewType) => {
    if ((view === 'orders' || view === 'warranty' || view === 'chat') && !user) {
      setCurrentView('welcome');
      alert('Vui lòng đăng nhập để sử dụng tính năng này');
      return;
    }
    setCurrentView(view);
    if (view === 'orders') {
      fetchOrders();
    } else if (view === 'warranty') {
      fetchWarrantyProducts();
    } else if (view === 'chat') {
      fetchChatMessages();
    }
  };

  return (
    <>
      {/* Chat Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-24 right-8 z-50 bg-gradient-to-r from-sky-500 to-sky-600 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transition-all"
        whileHover={{ scale: 1.15, transition: { duration: 0.15 } }}
        whileTap={{ scale: 0.85, transition: { duration: 0.1 } }}
        animate={{ 
          boxShadow: isOpen 
            ? "0 20px 40px rgba(14, 165, 233, 0.4)" 
            : ["0 10px 30px rgba(14, 165, 233, 0.3)", "0 15px 40px rgba(14, 165, 233, 0.5)", "0 10px 30px rgba(14, 165, 233, 0.3)"]
        }}
        transition={{
          boxShadow: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }
        }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <MessageCircle className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Liên hệ Button */}
      <motion.a
        href="tel:18002097"
        className="fixed bottom-8 right-8 z-50 bg-gradient-to-r from-sky-500 to-blue-600 text-white px-6 py-3 rounded-full shadow-2xl hover:shadow-3xl transition-all flex items-center gap-2 font-semibold"
        whileHover={{ scale: 1.1, y: -2, transition: { duration: 0.1, ease: "easeOut" } }}
        whileTap={{ scale: 0.9, transition: { duration: 0.05, ease: "easeOut" } }}
        animate={{
          boxShadow: ["0 10px 30px rgba(14, 165, 233, 0.3)", "0 15px 40px rgba(59, 130, 246, 0.5)", "0 10px 30px rgba(14, 165, 233, 0.3)"]
        }}
        transition={{
          boxShadow: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }
        }}
      >
        <motion.div
          animate={{ rotate: [0, -12, 12, -12, 12, 0] }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            repeatDelay: 2
          }}
        >
          <Headphones className="w-5 h-5" />
        </motion.div>
        Liên hệ
      </motion.a>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-40 right-8 z-[60] w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-sky-500 to-sky-400 text-white p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                  <Bot className="w-6 h-6 text-sky-500" />
                </div>
                <div>
                  <h3 className="font-bold">Hỗ trợ trực tuyến</h3>
                  <p className="text-xs opacity-90">Chúng tôi luôn sẵn sàng hỗ trợ</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="h-80 overflow-y-auto p-4 bg-gray-50">
              {currentView === 'welcome' && (
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-sky-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-sky-500" />
                    </div>
                    <div className="bg-white rounded-lg rounded-tl-none p-3 shadow-sm max-w-[80%]">
                      <p className="text-sm text-gray-700">
                        Xin chào! Tôi có thể giúp gì cho bạn?
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-sky-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-sky-500" />
                    </div>
                    <div className="bg-white rounded-lg rounded-tl-none p-3 shadow-sm max-w-[80%]">
                      <p className="text-sm text-gray-700 mb-2">
                        Bạn quan tâm đến:
                      </p>
                      <div className="space-y-2">
                        <motion.button 
                          onClick={() => handleViewChange('orders')}
                          className="block w-full text-left text-sm bg-gradient-to-r from-sky-50 to-blue-50 hover:from-sky-100 hover:to-blue-100 rounded-lg px-3 py-2 transition-all flex items-center gap-2 border border-sky-200 hover:border-sky-400 hover:shadow-md"
                          whileHover={{ scale: 1.02, x: 3, transition: { duration: 0.15 } }}
                          whileTap={{ scale: 0.98, transition: { duration: 0.1 } }}
                        >
                          <Package className="w-4 h-4 text-sky-600" /> Tra cứu đơn hàng
                        </motion.button>
                        <motion.button 
                          onClick={() => handleViewChange('warranty')}
                          className="block w-full text-left text-sm bg-gradient-to-r from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 rounded-lg px-3 py-2 transition-all flex items-center gap-2 border border-emerald-200 hover:border-emerald-400 hover:shadow-md"
                          whileHover={{ scale: 1.02, x: 3, transition: { duration: 0.15 } }}
                          whileTap={{ scale: 0.98, transition: { duration: 0.1 } }}
                        >
                          <Settings className="w-4 h-4 text-emerald-600" /> Bảo hành sản phẩm
                        </motion.button>
                        <motion.button 
                          onClick={() => handleViewChange('chat')}
                          className="block w-full text-left text-sm bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 rounded-lg px-3 py-2 transition-all flex items-center gap-2 border border-purple-200 hover:border-purple-400 hover:shadow-md"
                          whileHover={{ scale: 1.02, x: 3, transition: { duration: 0.15 } }}
                          whileTap={{ scale: 0.98, transition: { duration: 0.1 } }}
                        >
                          <MessageCircle className="w-4 h-4 text-purple-600" /> Chat với admin
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentView === 'chat' && (
                <div className="space-y-3 h-full flex flex-col">
                  <div className="flex items-center gap-2 mb-2">
                    <motion.button
                      onClick={() => setCurrentView('welcome')}
                      className="p-1 hover:bg-gray-200 rounded"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <ArrowLeft className="w-4 h-4 text-gray-600" />
                    </motion.button>
                    <h4 className="font-semibold text-gray-900">Chat với admin</h4>
                  </div>
                  <div 
                    className="space-y-2 flex-1 overflow-y-auto" 
                    id="chat-messages-container"
                    onScroll={(e) => {
                      // Detect if user is manually scrolling up
                      const container = e.currentTarget;
                      const isAtBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 50;
                      
                      if (!isAtBottom) {
                        // User scrolled up, disable auto scroll
                        shouldAutoScrollRef.current = false;
                        isUserScrollingRef.current = true;
                      } else {
                        // User scrolled back to bottom, re-enable auto scroll
                        shouldAutoScrollRef.current = true;
                        isUserScrollingRef.current = false;
                      }
                    }}
                  >
                    {chatMessages.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <MessageCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                        <p>Chưa có tin nhắn nào. Hãy gửi câu hỏi của bạn!</p>
                      </div>
                    ) : (
                      chatMessages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex items-start gap-2 ${msg.is_from_user ? 'justify-end' : 'justify-start'}`}
                        >
                          {/* Avatar for AI/Admin messages */}
                          {!msg.is_from_user && (
                            <div className="flex-shrink-0">
                              {agentInfo?.avatar ? (
                                <img
                                  src={agentInfo.avatar}
                                  alt={agentInfo.name}
                                  className="w-8 h-8 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center">
                                  <Bot className="w-4 h-4 text-sky-600" />
                                </div>
                              )}
                            </div>
                          )}
                          <div className="flex flex-col max-w-[80%]">
                            {/* Name for AI/Admin messages */}
                            {!msg.is_from_user && agentInfo && (
                              <div className="flex items-center gap-1 mb-1">
                                <span className="text-xs font-semibold text-gray-700">
                                  {agentInfo.name}
                                </span>
                                {agentInfo.title && (
                                  <span className="text-xs text-gray-500">
                                    • {agentInfo.title}
                                  </span>
                                )}
                              </div>
                            )}
                            <div
                              className={`rounded-lg p-3 ${
                                msg.is_from_user
                                  ? 'bg-sky-500 text-white rounded-tr-none'
                                  : 'bg-gray-200 text-gray-900 rounded-tl-none'
                              }`}
                            >
                            {msg.is_from_user ? (
                              // User message - plain text
                              <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                            ) : (
                              // AI/Admin message - render markdown with typing animation
                              <div className="text-sm prose prose-sm max-w-none break-words">
                                {typingMessageId === msg.id ? (
                                  // Show typing animation for new AI message (raw text first, then render markdown)
                                  <div className="whitespace-pre-wrap">
                                    <TypeWriter 
                                      text={msg.message} 
                                      speed={8}
                                      onComplete={() => {
                                        // After typing completes, switch to markdown rendering
                                        setTimeout(() => {
                                          setTypingMessageId(null);
                                          // Scroll to bottom after markdown renders (only if should auto scroll)
                                          if (shouldAutoScrollRef.current) {
                                            setTimeout(() => {
                                              requestAnimationFrame(() => {
                                                const container = document.getElementById('chat-messages-container');
                                                if (container && shouldAutoScrollRef.current) {
                                                  container.scrollTop = container.scrollHeight;
                                                }
                                              });
                                            }, 100);
                                          }
                                        }, 100);
                                      }}
                                    />
                                  </div>
                                ) : (
                                  // Show full message with markdown after typing animation
                                  <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    rehypePlugins={[rehypeRaw, rehypeSanitize]}
                                    components={{
                                      p: ({ children }) => <p className="mb-1 last:mb-0">{children}</p>,
                                      strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                                      em: ({ children }) => <em className="italic">{children}</em>,
                                      ul: ({ children }) => <ul className="list-disc list-inside mb-1 space-y-0.5">{children}</ul>,
                                      ol: ({ children }) => <ol className="list-decimal list-inside mb-1 space-y-0.5">{children}</ol>,
                                      li: ({ children }) => <li className="ml-2">{children}</li>,
                                      code: ({ children }) => <code className="bg-gray-300 px-1 rounded text-xs">{children}</code>,
                                      blockquote: ({ children }) => <blockquote className="border-l-2 border-gray-400 pl-2 italic">{children}</blockquote>,
                                    }}
                                  >
                                    {msg.message}
                                  </ReactMarkdown>
                                )}
                              </div>
                            )}
                            </div>
                            <p className={`text-xs mt-1 ${msg.is_from_user ? 'text-sky-100 text-right' : 'text-gray-500'}`}>
                              {new Date(msg.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                    {aiResponding && (
                      <div className="flex justify-start">
                        <div className="max-w-[80%] rounded-lg rounded-tl-none bg-gray-200 text-gray-900 p-3">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-700">Đang gõ</span>
                            <div className="flex gap-1">
                              <div className="w-1.5 h-1.5 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                              <div className="w-1.5 h-1.5 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                              <div className="w-1.5 h-1.5 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  {error && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
                      {error}
                    </div>
                  )}
                </div>
              )}

              {currentView === 'orders' && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-2">
                    <motion.button
                      onClick={() => setCurrentView('welcome')}
                      className="p-1 hover:bg-gray-200 rounded"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <ArrowLeft className="w-4 h-4 text-gray-600" />
                    </motion.button>
                    <h4 className="font-semibold text-gray-900">Đơn hàng của bạn</h4>
                  </div>
                  {loading ? (
                    <div className="text-center py-8 text-gray-500">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-sky-500 mx-auto mb-2"></div>
                      Đang tải...
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <AlertCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p>Bạn chưa có đơn hàng nào</p>
                    </div>
                  ) : (
                    orders.map((order) => (
                      <div key={order.id} className="bg-white rounded-lg p-3 border border-gray-200">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-semibold text-sm text-gray-900">#{order.order_number}</p>
                            <p className="text-xs text-gray-500">{new Date(order.created_at).toLocaleDateString('vi-VN')}</p>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                            order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {statusLabels[order.status]}
                          </span>
                        </div>
                        <p className="text-sm font-bold text-gray-900">{new Intl.NumberFormat('vi-VN').format(order.final_amount)}đ</p>
                      </div>
                    ))
                  )}
                </div>
              )}

              {currentView === 'warranty' && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-2">
                    <motion.button
                      onClick={() => setCurrentView('welcome')}
                      className="p-1 hover:bg-gray-200 rounded"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <ArrowLeft className="w-4 h-4 text-gray-600" />
                    </motion.button>
                    <h4 className="font-semibold text-gray-900">Bảo hành sản phẩm</h4>
                  </div>
                  {loading ? (
                    <div className="text-center py-8 text-gray-500">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-sky-500 mx-auto mb-2"></div>
                      Đang tải...
                    </div>
                  ) : warrantyProducts.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <AlertCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p>Bạn chưa có sản phẩm nào để bảo hành</p>
                    </div>
                  ) : (
                    warrantyProducts.map((product: any, idx) => (
                      <motion.div
                        key={`${product.id}-${idx}`}
                        onClick={() => {
                          setIsOpen(false);
                          router.push('/home#san-pham');
                        }}
                        className={`bg-white rounded-lg p-3 border cursor-pointer hover:shadow-md transition-all ${product.isExpired ? 'border-red-200 bg-red-50' : 'border-emerald-200 bg-emerald-50'}`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <p className="font-semibold text-sm text-gray-900">{product.name}</p>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${product.isExpired ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'}`}>
                            {product.isExpired ? 'Đã hết hạn bảo hành' : 'Còn bảo hành'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600">Mua ngày: {new Date(product.orderDate).toLocaleDateString('vi-VN')}</p>
                        <p className="text-xs text-gray-600">Hết hạn: {new Date(product.warrantyExpiry).toLocaleDateString('vi-VN')}</p>
                      </motion.div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-gray-200">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      if (!sendingMessage && message.trim()) {
                        if (currentView === 'chat') {
                          sendMessage();
                        } else if (user && message.trim()) {
                          // Auto switch to chat and send
                          handleViewChange('chat');
                          setTimeout(() => {
                            sendMessage();
                          }, 100);
                        }
                      }
                    }
                  }}
                  placeholder={
                    currentView === 'chat'
                      ? "Nhập tin nhắn của bạn... (Enter để gửi)"
                      : "Viết câu hỏi của bạn tại đây (Enter để gửi)"
                  }
                  disabled={sendingMessage || aiResponding}
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition-all hover:border-sky-300 disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
                <motion.button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Send button clicked', { currentView, message: message.trim(), sendingMessage, user, hasMessage: !!message.trim() });
                    if (currentView === 'chat') {
                      sendMessage();
                    } else {
                      console.log('Not in chat view, switching to chat...', currentView);
                      if (user) {
                        handleViewChange('chat');
                        // Wait a bit then send if message exists
                        setTimeout(() => {
                          if (message.trim()) {
                            sendMessage();
                          }
                        }, 100);
                      } else {
                        alert('Vui lòng đăng nhập để gửi tin nhắn');
                      }
                    }
                  }}
                  disabled={sendingMessage}
                  className="bg-gradient-to-r from-sky-500 to-blue-600 text-white p-2 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  whileHover={{ scale: !sendingMessage ? 1.1 : 1, transition: { duration: 0.15 } }}
                  whileTap={{ scale: !sendingMessage ? 0.9 : 1, transition: { duration: 0.1 } }}
                >
                  {sendingMessage ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

