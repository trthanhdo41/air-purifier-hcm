"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { Save, Bot, Clock, FileText, Key, User, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Toast from "@/components/Toast";

interface AISettings {
  id: string;
  enabled: boolean;
  schedule_enabled: boolean;
  schedule_start: string;
  schedule_end: string;
  timezone: string;
  default_prompt: string;
  agent_name: string;
  agent_avatar: string | null;
  agent_title: string;
  api_key: string | null;
}

export default function ChatbotSettingsPage() {
  const [settings, setSettings] = useState<AISettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type?: "success" | "error" | "info" } | null>(null);
  const [formData, setFormData] = useState({
    enabled: false,
    schedule_enabled: false,
    schedule_start: "08:00",
    schedule_end: "22:00",
    timezone: "Asia/Ho_Chi_Minh",
    default_prompt: "Bạn là nhân viên tư vấn bán hàng của công ty máy lọc không khí. Hãy trả lời một cách thân thiện, chuyên nghiệp và hỗ trợ khách hàng.",
    agent_name: "Chị Lan",
    agent_avatar: "",
    agent_title: "Tư vấn viên",
    api_key: "",
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      
      // Get first settings (should only have one)
      // Use maybeSingle() instead of single() to handle case when no rows exist
      const { data, error } = await supabase
        .from('ai_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching settings:', error);
        throw error;
      }

      if (data) {
        setSettings(data);
        setFormData({
          enabled: data.enabled || false,
          schedule_enabled: data.schedule_enabled || false,
          schedule_start: data.schedule_start || "08:00",
          schedule_end: data.schedule_end || "22:00",
          timezone: data.timezone || "Asia/Ho_Chi_Minh",
          default_prompt: data.default_prompt || "",
          agent_name: data.agent_name || "Chị Lan",
          agent_avatar: data.agent_avatar || "",
          agent_title: data.agent_title || "Tư vấn viên",
          api_key: data.api_key ? "••••••••" : "", // Hide API key
        });
      } else {
        // Create default settings if none exist
        try {
          const { data: newData, error: insertError } = await supabase
            .from('ai_settings')
            .insert({
              enabled: false,
              schedule_enabled: false,
              schedule_start: "08:00",
              schedule_end: "22:00",
              timezone: "Asia/Ho_Chi_Minh",
              default_prompt: formData.default_prompt,
              agent_name: formData.agent_name,
              agent_title: formData.agent_title,
            })
            .select()
            .single();

          if (insertError) {
            console.error('Error creating default settings:', insertError);
            // If insert fails (e.g., RLS blocking), just continue without settings
            // User can still configure later
          } else if (newData) {
            setSettings(newData);
            setFormData({
              ...formData,
              enabled: newData.enabled || false,
              schedule_enabled: newData.schedule_enabled || false,
              schedule_start: newData.schedule_start || "08:00",
              schedule_end: newData.schedule_end || "22:00",
              timezone: newData.timezone || "Asia/Ho_Chi_Minh",
              default_prompt: newData.default_prompt || formData.default_prompt,
              agent_name: newData.agent_name || formData.agent_name,
              agent_title: newData.agent_title || formData.agent_title,
            });
          }
        } catch (insertErr: any) {
          console.error('Error creating default settings:', insertErr);
          // Continue without throwing - allow user to see form even if insert fails
        }
      }
    } catch (error: any) {
      console.error('Error fetching settings:', error);
      const errorMessage = error?.message || error?.code || error?.details || JSON.stringify(error) || 'Lỗi không xác định';
      setToast({ message: 'Lỗi khi tải cài đặt: ' + errorMessage, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.api_key && !settings?.api_key) {
      setToast({ message: 'Vui lòng nhập API key Gemini!', type: 'error' });
      return;
    }

    try {
      setSaving(true);
      const supabase = createClient();

      const updateData: any = {
        enabled: formData.enabled,
        schedule_enabled: formData.schedule_enabled,
        schedule_start: formData.schedule_start,
        schedule_end: formData.schedule_end,
        timezone: formData.timezone,
        default_prompt: formData.default_prompt,
        agent_name: formData.agent_name,
        agent_title: formData.agent_title,
      };

      // Only update API key if user provided a new one
      if (formData.api_key && formData.api_key !== "••••••••") {
        updateData.api_key = formData.api_key;
      }

      if (formData.agent_avatar) {
        updateData.agent_avatar = formData.agent_avatar;
      }

      if (settings) {
        const { error } = await supabase
          .from('ai_settings')
          .update(updateData)
          .eq('id', settings.id);

        if (error) throw error;
      } else {
        const { data: newData, error } = await supabase
          .from('ai_settings')
          .insert({
            ...updateData,
            api_key: formData.api_key,
          })
          .select()
          .single();

        if (error) throw error;
        setSettings(newData);
      }

      setToast({ message: 'Đã lưu cài đặt thành công!', type: 'success' });
    } catch (error: any) {
      console.error('Error saving settings:', error);
      setToast({ message: 'Lỗi khi lưu cài đặt: ' + (error.message || 'Lỗi không xác định'), type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Bot className="w-8 h-8 text-sky-600" />
          Cài đặt AI Chatbot
        </h1>
        <p className="text-gray-600 mt-2">Cấu hình AI chatbot tự động phản hồi khách hàng</p>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 space-y-6">
        {/* Bật/Tắt AI */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-sky-50 rounded-lg border border-blue-200"
        >
          <div className="flex items-center gap-3">
            <Bot className="w-6 h-6 text-sky-600" />
            <div>
              <h3 className="font-semibold text-gray-900">Bật/Tắt AI Chatbot</h3>
              <p className="text-sm text-gray-600">Khi bật, AI sẽ tự động phản hồi khách hàng</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.enabled}
              onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-sky-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
          </label>
        </motion.div>

        {/* Lịch trình hoạt động */}
        <div className="space-y-4 border-t border-gray-200 pt-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-sky-600" />
            <h3 className="text-lg font-semibold text-gray-900">Lịch trình hoạt động</h3>
          </div>

          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.schedule_enabled}
                onChange={(e) => setFormData({ ...formData, schedule_enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-sky-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
            </label>
            <span className="text-gray-700">Bật lịch trình tự động</span>
          </div>

          {formData.schedule_enabled && (
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Giờ bắt đầu</label>
                <input
                  type="time"
                  value={formData.schedule_start}
                  onChange={(e) => setFormData({ ...formData, schedule_start: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Giờ kết thúc</label>
                <input
                  type="time"
                  value={formData.schedule_end}
                  onChange={(e) => setFormData({ ...formData, schedule_end: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Prompt mặc định */}
        <div className="space-y-4 border-t border-gray-200 pt-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-sky-600" />
            <h3 className="text-lg font-semibold text-gray-900">Prompt mặc định</h3>
          </div>
          <textarea
            value={formData.default_prompt}
            onChange={(e) => setFormData({ ...formData, default_prompt: e.target.value })}
            rows={6}
            placeholder="Nhập prompt để AI hiểu vai trò và cách phản hồi..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 resize-none"
          />
          <p className="text-sm text-gray-500">Prompt này sẽ được gửi cho AI để định hướng cách phản hồi</p>
        </div>

        {/* Thông tin nhân viên hiển thị */}
        <div className="space-y-4 border-t border-gray-200 pt-6">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-sky-600" />
            <h3 className="text-lg font-semibold text-gray-900">Thông tin nhân viên hiển thị</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tên nhân viên</label>
              <input
                type="text"
                value={formData.agent_name}
                onChange={(e) => setFormData({ ...formData, agent_name: e.target.value })}
                placeholder="VD: Chị Lan"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Chức danh</label>
              <input
                type="text"
                value={formData.agent_title}
                onChange={(e) => setFormData({ ...formData, agent_title: e.target.value })}
                placeholder="VD: Tư vấn viên"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">URL Avatar (tùy chọn)</label>
            <input
              type="url"
              value={formData.agent_avatar}
              onChange={(e) => setFormData({ ...formData, agent_avatar: e.target.value })}
              placeholder="https://example.com/avatar.jpg"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>
        </div>

        {/* API Key */}
        <div className="space-y-4 border-t border-gray-200 pt-6">
          <div className="flex items-center gap-2 mb-4">
            <Key className="w-5 h-5 text-sky-600" />
            <h3 className="text-lg font-semibold text-gray-900">API Key Gemini</h3>
          </div>
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-semibold mb-1">Lưu ý quan trọng:</p>
                <p>API key sẽ được mã hóa và lưu trữ an toàn. Chỉ cần nhập lại khi thay đổi key mới.</p>
              </div>
            </div>
          </div>
          <input
            type="password"
            value={formData.api_key}
            onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
            placeholder={settings?.api_key ? "Nhập API key mới để thay đổi" : "Nhập API key Gemini"}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
          />
          <p className="text-sm text-gray-500">Lấy API key tại: <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:underline">Google AI Studio</a></p>
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Đang lưu...</span>
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>Lưu cài đặt</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

