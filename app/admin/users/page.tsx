"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Search, Shield, Mail, User, Calendar, Key, Plus, Edit, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

interface UserInfo {
  id: string;
  email?: string;
  phone?: string;
  created_at?: string;
  last_sign_in_at?: string;
  role?: string;
  name?: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserInfo | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    phone: "",
    role: "user",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Call API route that uses Service Role Key
      const response = await fetch('/api/admin/users');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch users');
      }
      
      const data = await response.json();
      
      if (data.users && data.users.length > 0) {
        setUsers(data.users);
      } else {
        // Fallback: try to get current user at least
        const supabase = createClient();
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (currentUser) {
          setUsers([{
            id: currentUser.id,
            email: currentUser.email,
            created_at: currentUser.created_at,
            last_sign_in_at: currentUser.last_sign_in_at,
            role: currentUser.email === 'admin@hoithoxanh.com' ? 'admin' : 'user',
            name: currentUser.user_metadata?.full_name,
            phone: currentUser.user_metadata?.phone
          }]);
        }
      }
    } catch (error: any) {
      console.error("Error fetching users:", error);
      setError("Không thể tải danh sách người dùng: " + (error.message || "Lỗi không xác định"));
      
      // Fallback: try to get current user at least
      try {
        const supabase = createClient();
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (currentUser) {
          setUsers([{
            id: currentUser.id,
            email: currentUser.email,
            created_at: currentUser.created_at,
            last_sign_in_at: currentUser.last_sign_in_at,
            role: currentUser.email === 'admin@hoithoxanh.com' ? 'admin' : 'user',
            name: currentUser.user_metadata?.full_name,
            phone: currentUser.user_metadata?.phone
          }]);
        }
      } catch (fallbackError) {
        console.error("Fallback error:", fallbackError);
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.phone?.includes(searchQuery)
  );

  const handleCreateUser = () => {
    setEditingUser(null);
    setFormData({
      email: "",
      password: "",
      name: "",
      phone: "",
      role: "user",
    });
    setShowModal(true);
  };

  const handleEditUser = (user: UserInfo) => {
    setEditingUser(user);
    setFormData({
      email: user.email || "",
      password: "", // Don't show password when editing
      name: user.name || "",
      phone: user.phone || "",
      role: user.role || "user",
    });
    setShowModal(true);
  };

  const handleSaveUser = async () => {
    try {
      setError(null);
      const url = '/api/admin/users';
      const method = editingUser ? 'PUT' : 'POST';
      let body: any = editingUser
        ? { id: editingUser.id, ...formData }
        : formData;

      // Remove password if empty when editing
      if (editingUser && !body.password) {
        const { password, ...rest } = body;
        body = rest;
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save user');
      }

      setShowModal(false);
      fetchUsers(); // Refresh list
    } catch (err: any) {
      setError(err.message || 'Failed to save user');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      setError(null);
      const response = await fetch(`/api/admin/users?id=${userId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete user');
      }

      setShowDeleteConfirm(null);
      fetchUsers(); // Refresh list
    } catch (err: any) {
      setError(err.message || 'Failed to delete user');
      setShowDeleteConfirm(null);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý người dùng</h1>
          <p className="text-gray-600 mt-1">Xem và quản lý tất cả người dùng trong hệ thống</p>
        </div>
        <Button
          onClick={handleCreateUser}
          className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white"
        >
          <Plus className="w-4 h-4" />
          Tạo người dùng mới
        </Button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Lưu ý:</strong> {error}
          </p>
          <p className="text-xs text-yellow-700 mt-2">
            Để xem đầy đủ danh sách users, bạn cần thêm Service Role Key vào .env.local
          </p>
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200"
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm người dùng..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none"
              />
            </div>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Đang tải danh sách người dùng...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchQuery ? "Không tìm thấy người dùng" : "Chưa có người dùng"}
              </h3>
              <p className="text-gray-600">
                {searchQuery 
                  ? "Thử tìm kiếm với từ khóa khác"
                  : "Chưa có người dùng nào trong hệ thống"
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Tên</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Số điện thoại</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Vai trò</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Ngày tạo</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Đăng nhập cuối</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <motion.tr
                        key={user.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-900 font-medium">{user.email || "N/A"}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-700">{user.name || "-"}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-gray-700">{user.phone || "-"}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            user.role === 'admin'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {user.role === 'admin' && <Shield className="w-3 h-3" />}
                            {user.role === 'admin' ? 'Admin' : 'User'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            {user.created_at 
                              ? new Date(user.created_at).toLocaleDateString('vi-VN')
                              : "-"
                            }
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Key className="w-4 h-4" />
                            {user.last_sign_in_at
                              ? new Date(user.last_sign_in_at).toLocaleDateString('vi-VN')
                              : "Chưa đăng nhập"
                            }
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditUser(user)}
                              className="text-sky-600 hover:text-sky-700 hover:bg-sky-50"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            {user.email !== 'admin@hoithoxanh.com' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowDeleteConfirm(user.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 text-sm text-gray-600">
                Tổng số: <span className="font-semibold text-gray-900">{filteredUsers.length}</span> người dùng
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setShowModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div
                className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">
                    {editingUser ? "Sửa người dùng" : "Tạo người dùng mới"}
                  </h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {editingUser ? "Mật khẩu mới (để trống nếu không đổi)" : "Mật khẩu *"}
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                      required={!editingUser}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Họ và tên
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Số điện thoại
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Vai trò
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                      {error}
                    </div>
                  )}

                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={handleSaveUser}
                      className="flex-1 bg-sky-500 hover:bg-sky-600 text-white"
                    >
                      {editingUser ? "Cập nhật" : "Tạo mới"}
                    </Button>
                    <Button
                      onClick={() => setShowModal(false)}
                      variant="outline"
                      className="flex-1"
                    >
                      Hủy
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Confirm Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setShowDeleteConfirm(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div
                className="bg-white rounded-xl shadow-xl max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900">Xác nhận xóa</h2>
                </div>

                <div className="p-6">
                  <p className="text-gray-700 mb-4">
                    Bạn có chắc chắn muốn xóa người dùng này? Hành động này không thể hoàn tác.
                  </p>

                  {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                      {error}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button
                      onClick={() => handleDeleteUser(showDeleteConfirm)}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                    >
                      Xóa
                    </Button>
                    <Button
                      onClick={() => setShowDeleteConfirm(null)}
                      variant="outline"
                      className="flex-1"
                    >
                      Hủy
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
