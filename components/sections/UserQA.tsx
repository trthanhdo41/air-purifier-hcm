"use client";

import { useEffect, useState } from "react";
import { Send, ThumbsUp, User as UserIcon, MessageCircle } from "lucide-react";
import { useAuthStore } from "@/lib/stores/auth";
import LoginModal from "@/components/LoginModal";
import { createClient } from "@/lib/supabase/client";

export default function UserQA() {
  const [question, setQuestion] = useState("");
  const [loginOpen, setLoginOpen] = useState(false);
  const { user } = useAuthStore();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const supabase = createClient();
        const { data } = await supabase
          .from("questions")
          .select("id, name, content, created_at, answer_text, answered_at")
          .order("created_at", { ascending: false })
          .limit(20);
        setItems(
          (data || []).map((q) => ({
            id: q.id,
            user: q.name || "Khách",
            time: new Date(q.created_at).toLocaleDateString("vi-VN"),
            question: q.content,
            answer: q.answered_at ? {
              user: "Quản trị viên",
              badge: "QTV",
              time: new Date(q.answered_at).toLocaleDateString("vi-VN"),
              text: q.answer_text || "",
            } : undefined,
          }))
        );
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async () => {
    if (!user) {
      setLoginOpen(true);
      return;
    }
    const content = question.trim();
    if (!content) return;
    const supabase = createClient();
    const name = user.name || (user.email ? user.email.split("@")[0] : "");
    const { data, error } = await supabase
      .from("questions")
      .insert({ user_id: user.id, name, content })
      .select("id, name, content, created_at")
      .single();
    if (!error && data) {
      setItems((prev) => [
        {
          id: data.id,
          user: data.name || "Khách",
          time: new Date(data.created_at).toLocaleDateString(),
          question: data.content,
        },
        ...prev,
      ]);
      setQuestion("");
    }
  };

  return (
    <>
    <div className="bg-gray-50 py-8 sm:py-12">
      <div className="container mx-auto px-3 sm:px-4">
        <h2 className="text-xl sm:text-2xl font-bold mb-6 sm:mb-8 text-gray-900">Hỏi và đáp</h2>

        <div className="max-w-4xl">
          {/* Ask Question Form - Mobile Optimized */}
          <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 border border-gray-200 shadow-sm">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-sky-400 to-sky-300 rounded-full flex items-center justify-center flex-shrink-0">
                <UserIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-base sm:text-lg mb-2 text-gray-900">Hãy đặt câu hỏi cho chúng tôi</h3>
                <p className="text-xs sm:text-sm text-gray-600 mb-4">
                  Máy Lọc Không Khí HCM sẽ phản hồi trong vòng 1 giờ. Nếu Quý khách gửi câu hỏi sau 22h, chúng tôi sẽ trả lời vào sáng hôm sau.
                  <br className="hidden sm:block" />
                  <span className="sm:inline"> </span>Thông tin có thể thay đổi theo thời gian, vui lòng đặt câu hỏi để nhận được cập nhật mới nhất!
                </p>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit();
                      }
                    }}
                    placeholder="Viết câu hỏi của bạn tại đây"
                    className="flex-1 border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all"
                  />
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleSubmit();
                    }}
                    className="bg-sky-500 hover:bg-sky-600 text-white px-4 sm:px-8 py-2 sm:py-3 rounded-lg text-sm sm:text-base font-semibold flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl whitespace-nowrap"
                  >
                    <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                    Gửi câu hỏi
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Q&A List - Mobile Optimized */}
          <div className="space-y-4 sm:space-y-6">
            {items.map((qa) => (
              <div key={qa.id} className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                {/* Question */}
                <div className="flex gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-gray-900 text-lg sm:text-xl">
                    {qa.user.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-2">
                      <h4 className="font-bold text-sm sm:text-base text-gray-900">{qa.user}</h4>
                      <span className="text-xs sm:text-sm text-gray-500 flex items-center gap-1">
                        <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                        {qa.time}
                      </span>
                    </div>
                    <p className="text-sm sm:text-base text-gray-700 break-words">{qa.question}</p>
                    <button className="mt-2 sm:mt-3 text-xs sm:text-sm text-sky-500 hover:text-sky-600 font-medium flex items-center gap-1 group transition-all">
                      <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                      Phản hồi
                      <ThumbsUp className="w-3 h-3 sm:w-4 sm:h-4 ml-2 opacity-50 group-hover:opacity-100 transition-opacity" />
                    </button>
                  </div>
                </div>

                {qa.answer && (
                  <div className="ml-0 sm:ml-16 bg-gray-50 rounded-lg p-4 sm:p-5 border-l-4 border-sky-400">
                    <div className="flex gap-2 sm:gap-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-sky-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <UserIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-2">
                          <h5 className="font-bold text-sm sm:text-base text-gray-900">{qa.answer.user}</h5>
                          <span className="bg-sky-500 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded font-bold">
                            {qa.answer.badge}
                          </span>
                          <span className="text-xs sm:text-sm text-gray-500 flex items-center gap-1">
                            <MessageCircle className="w-3 h-3" />
                            {qa.answer.time}
                          </span>
                        </div>
                        <div className="text-xs sm:text-sm text-gray-700 whitespace-pre-line leading-relaxed break-words">
                          {qa.answer.text}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
    <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
}

