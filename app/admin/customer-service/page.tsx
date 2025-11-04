"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/lib/stores/auth";
import { motion } from "framer-motion";
import { Send, Search, Package, Settings, MessageCircle, User, Clock, CheckCircle, Phone } from "lucide-react";

interface ChatMessage {
  id: string;
  user_id: string;
  admin_id: string | null;
  message: string;
  is_from_user: boolean;
  is_read: boolean;
  created_at: string;
}

interface UserInfo {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  unread_count: number;
  last_message_at: string;
}

export default function CustomerServicePage() {
  const { user } = useAuthStore();
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [replyMessage, setReplyMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUserOrders, setSelectedUserOrders] = useState<any[]>([]);
  const [selectedUserWarranty, setSelectedUserWarranty] = useState<any[]>([]);
  const [showOrders, setShowOrders] = useState(false);
  const [showWarranty, setShowWarranty] = useState(false);

  useEffect(() => {
    fetchUsers();
    const interval = setInterval(fetchUsers, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedUserId) {
      fetchMessages(selectedUserId);
      fetchUserOrders(selectedUserId);
      fetchUserWarranty(selectedUserId);
      const interval = setInterval(() => fetchMessages(selectedUserId), 3000);
      return () => clearInterval(interval);
    }
  }, [selectedUserId]);

  const fetchUsers = async () => {
    try {
      const supabase = createClient();
      // Query chat messages directly with user info
      const { data: messagesData, error } = await supabase
        .from('chat_messages')
        .select('user_id, user_email, user_name, user_phone, is_read, is_from_user, created_at')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching messages:', error);
        return;
      }

      if (!messagesData || messagesData.length === 0) {
        setUsers([]);
        return;
      }

      // Get user info from API (includes phone from metadata)
      let usersWithMetadata: any[] = [];
      try {
        const usersResponse = await fetch('/api/admin/users');
        if (usersResponse.ok) {
          const usersData = await usersResponse.json();
          usersWithMetadata = usersData.users || [];
        }
      } catch (e) {
        console.error('Error fetching users metadata:', e);
      }

      // Create a map of user_id -> user metadata
      const userMetadataMap = new Map<string, any>();
      usersWithMetadata.forEach((u: any) => {
        userMetadataMap.set(u.id, u);
      });

      // Group messages by user_id
      const userMap = new Map<string, UserInfo>();
      for (const msg of messagesData) {
        const userId = msg.user_id;
        if (!userMap.has(userId)) {
          const metadata = userMetadataMap.get(userId);
          userMap.set(userId, {
            id: userId,
            email: (msg as any).user_email || metadata?.email || `User ${userId.substring(0, 8)}...`,
            name: (msg as any).user_name || metadata?.name || undefined,
            phone: (msg as any).user_phone || metadata?.phone || undefined,
            unread_count: 0,
            last_message_at: msg.created_at,
          });
        }
        const userInfo = userMap.get(userId)!;
        if (!msg.is_read && msg.is_from_user) {
          userInfo.unread_count++;
        }
        if (new Date(msg.created_at) > new Date(userInfo.last_message_at)) {
          userInfo.last_message_at = msg.created_at;
          // Update phone if available in newer message or metadata
          const metadata = userMetadataMap.get(userId);
          userInfo.phone = (msg as any).user_phone || metadata?.phone || userInfo.phone;
          // Also update name and email from metadata if not in message
          if (!userInfo.name && metadata?.name) {
            userInfo.name = metadata.name;
          }
          if (!userInfo.email && metadata?.email) {
            userInfo.email = metadata.email;
          }
        }
      }

      const usersList = Array.from(userMap.values()).sort(
        (a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()
      );
      setUsers(usersList);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (userId: string) => {
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (data) {
        setMessages(data);
        // Mark messages as read
        const unreadIds = data.filter(m => !m.is_read && m.is_from_user).map(m => m.id);
        if (unreadIds.length > 0) {
          await supabase
            .from('chat_messages')
            .update({ is_read: true })
            .in('id', unreadIds);
        }
        // Auto scroll
        setTimeout(() => {
          const container = document.getElementById('admin-chat-messages');
          if (container) {
            container.scrollTop = container.scrollHeight;
          }
        }, 100);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  };

  const sendReply = async () => {
    if (!selectedUserId || !replyMessage.trim() || !user || sending) return;

    const msgText = replyMessage.trim();
    setReplyMessage('');
    setSending(true);

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          user_id: selectedUserId,
          admin_id: user.id,
          message: msgText,
          is_from_user: false,
          is_read: true,
        });

      if (!error) {
        await fetchMessages(selectedUserId);
        await fetchUsers();
      }
    } catch (err) {
      console.error('Error sending reply:', err);
    } finally {
      setSending(false);
    }
  };

  const fetchUserOrders = async (userId: string) => {
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      setSelectedUserOrders(data || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
    }
  };

  const fetchUserWarranty = async (userId: string) => {
    try {
      const supabase = createClient();
      const { data: ordersData } = await supabase
        .from('orders')
        .select('id, created_at')
        .eq('user_id', userId)
        .eq('status', 'delivered');

      if (!ordersData || ordersData.length === 0) {
        setSelectedUserWarranty([]);
        return;
      }

      const orderIds = ordersData.map(o => o.id);
      const { data: orderItems } = await supabase
        .from('order_items')
        .select('order_id, product_id')
        .in('order_id', orderIds);

      if (!orderItems || orderItems.length === 0) {
        setSelectedUserWarranty([]);
        return;
      }

      const productIds = [...new Set(orderItems.map(item => item.product_id))];
      const { data: products } = await supabase
        .from('products')
        .select('*')
        .in('id', productIds);

      if (!products || products.length === 0) {
        setSelectedUserWarranty([]);
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

      setSelectedUserWarranty(warrantyItems);
    } catch (err) {
      console.error('Error fetching warranty:', err);
    }
  };

  const filteredUsers = users.filter(u =>
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.phone?.includes(searchQuery)
  );

  const selectedUser = users.find(u => u.id === selectedUserId);

  const statusLabels: Record<string, string> = {
    pending: 'Chờ xử lý',
    processing: 'Đang xử lý',
    shipped: 'Đang giao',
    delivered: 'Đã giao',
    cancelled: 'Đã hủy',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm mb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Chăm sóc khách hàng</h1>
          <p className="text-gray-600 mt-1">Quản lý và trả lời tin nhắn từ khách hàng</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User List */}
          <div className="lg:col-span-1 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm khách hàng..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>
            <div className="overflow-y-auto max-h-[calc(100vh-250px)]">
              {loading ? (
                <div className="p-8 text-center text-gray-500">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500 mx-auto mb-2"></div>
                  Đang tải...
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <MessageCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>Không có khách hàng nào</p>
                </div>
              ) : (
                filteredUsers.map((u) => (
                  <motion.button
                    key={u.id}
                    onClick={() => setSelectedUserId(u.id)}
                    className={`w-full p-4 text-left border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                      selectedUserId === u.id ? 'bg-sky-50 border-l-4 border-l-sky-500' : ''
                    }`}
                    whileHover={{ x: 2 }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <p className="font-semibold text-gray-900 truncate">{u.name || u.email}</p>
                        </div>
                        <p className="text-sm text-gray-600 truncate">{u.email}</p>
                        {u.phone && (
                          <p className="text-xs text-gray-500 mt-1">{u.phone}</p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <Clock className="w-3 h-3 text-gray-400" />
                          <p className="text-xs text-gray-500">
                            {new Date(u.last_message_at).toLocaleString('vi-VN')}
                          </p>
                        </div>
                      </div>
                      {u.unread_count > 0 && (
                        <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                          {u.unread_count}
                        </span>
                      )}
                    </div>
                  </motion.button>
                ))
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col" style={{ height: 'calc(100vh - 200px)' }}>
            {selectedUserId ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 bg-sky-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-semibold text-gray-900">{selectedUser?.name || selectedUser?.email}</h2>
                      <p className="text-sm text-gray-600">{selectedUser?.email}</p>
                      {selectedUser?.phone && (
                        <div className="flex items-center gap-1 mt-1">
                          <Phone className="w-3 h-3 text-gray-500" />
                          <p className="text-sm text-gray-700 font-medium">{selectedUser.phone}</p>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <motion.button
                        onClick={() => setShowOrders(!showOrders)}
                        className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Package className="w-5 h-5 text-gray-600" />
                      </motion.button>
                      <motion.button
                        onClick={() => setShowWarranty(!showWarranty)}
                        className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Settings className="w-5 h-5 text-gray-600" />
                      </motion.button>
                    </div>
                  </div>
                </div>

                {/* Info Panels */}
                {(showOrders || showWarranty) && (
                  <div className="p-4 border-b border-gray-200 bg-gray-50 max-h-64 overflow-y-auto">
                    {showOrders && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Đơn hàng</h3>
                        {selectedUserOrders.length === 0 ? (
                          <p className="text-sm text-gray-500">Không có đơn hàng</p>
                        ) : (
                          <div className="space-y-2">
                            {selectedUserOrders.map((order) => (
                              <div key={order.id} className="bg-white p-3 rounded border border-gray-200">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <p className="font-semibold text-sm">#{order.order_number}</p>
                                    <p className="text-xs text-gray-600">{new Date(order.created_at).toLocaleDateString('vi-VN')}</p>
                                  </div>
                                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                                    order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                    order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                    'bg-yellow-100 text-yellow-800'
                                  }`}>
                                    {statusLabels[order.status]}
                                  </span>
                                </div>
                                <p className="text-sm font-bold text-gray-900 mt-1">
                                  {new Intl.NumberFormat('vi-VN').format(order.final_amount)}đ
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    {showWarranty && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Bảo hành</h3>
                        {selectedUserWarranty.length === 0 ? (
                          <p className="text-sm text-gray-500">Không có sản phẩm bảo hành</p>
                        ) : (
                          <div className="space-y-2">
                            {selectedUserWarranty.map((item: any, idx: number) => (
                              <div
                                key={`${item.id}-${idx}`}
                                className={`bg-white p-3 rounded border ${
                                  item.isExpired ? 'border-red-200' : 'border-emerald-200'
                                }`}
                              >
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <p className="font-semibold text-sm">{item.name}</p>
                                    <p className="text-xs text-gray-600">
                                      Mua: {new Date(item.orderDate).toLocaleDateString('vi-VN')}
                                    </p>
                                    <p className="text-xs text-gray-600">
                                      Hết hạn: {new Date(item.warrantyExpiry).toLocaleDateString('vi-VN')}
                                    </p>
                                  </div>
                                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                                    item.isExpired ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
                                  }`}>
                                    {item.isExpired ? 'Hết hạn' : 'Còn hạn'}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 bg-gray-50" id="admin-chat-messages">
                  {messages.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <MessageCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p>Chưa có tin nhắn nào</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.is_from_user ? 'justify-start' : 'justify-end'}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg p-3 ${
                              msg.is_from_user
                                ? 'bg-white border border-gray-200 rounded-tl-none'
                                : 'bg-sky-500 text-white rounded-tr-none'
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                            <p className={`text-xs mt-1 ${msg.is_from_user ? 'text-gray-500' : 'text-sky-100'}`}>
                              {new Date(msg.created_at).toLocaleString('vi-VN')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Reply Input */}
                <div className="p-4 border-t border-gray-200 bg-white">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendReply();
                        }
                      }}
                      placeholder="Nhập tin nhắn trả lời..."
                      disabled={sending}
                      className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:bg-gray-50"
                    />
                    <motion.button
                      onClick={sendReply}
                      disabled={sending || !replyMessage.trim()}
                      className="bg-sky-500 text-white px-6 py-2 rounded-lg hover:bg-sky-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      whileHover={{ scale: sending || !replyMessage.trim() ? 1 : 1.05 }}
                      whileTap={{ scale: sending || !replyMessage.trim() ? 1 : 0.95 }}
                    >
                      {sending ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Gửi</span>
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>Chọn một khách hàng để xem tin nhắn</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

