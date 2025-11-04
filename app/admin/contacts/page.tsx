"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MessageCircle, Search, Send, Clock, CheckCircle, User, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/lib/stores/auth";

export default function ContactsPage() {
  const [unanswered, setUnanswered] = useState<any[]>([]);
  const [answered, setAnswered] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'unanswered' | 'answered'>('unanswered');
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);
  const [answerText, setAnswerText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthStore();

  useEffect(() => {
    fetchQuestions();
  }, [selectedTab]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      const [ua, a] = await Promise.all([
        supabase
          .from("questions")
          .select("id, name, content, created_at, answer_text, answered_at, answered_by")
          .is('answered_at', null)
          .order("created_at", { ascending: false }),
        supabase
          .from("questions")
          .select("id, name, content, created_at, answer_text, answered_at, answered_by")
          .not('answered_at', 'is', null)
          .order("answered_at", { ascending: false }),
      ]);
      setUnanswered(ua.data || []);
      setAnswered(a.data || []);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!selectedQuestion || !answerText.trim() || !user) {
      console.log('Cannot submit:', { selectedQuestion: !!selectedQuestion, hasAnswer: !!answerText.trim(), user: !!user });
      return;
    }
    
    try {
      setSubmitting(true);
      setError(null);
      const supabase = createClient();
      console.log('Submitting answer:', { questionId: selectedQuestion.id, answer: answerText.trim(), userId: user.id });
      
      const { data, error: updateError } = await supabase
        .from("questions")
        .update({
          answer_text: answerText.trim(),
          answered_at: new Date().toISOString(),
          answered_by: user.id,
        })
        .eq('id', selectedQuestion.id)
        .select()
        .single();

      console.log('Update result:', { data, error: updateError });

      if (updateError) {
        console.error('Error updating question:', updateError);
        const errorMsg = updateError.message || updateError.details || updateError.hint || 'Không thể gửi câu trả lời. Vui lòng thử lại.';
        setError(errorMsg);
        setTimeout(() => setError(null), 5000);
      } else {
        setAnswerText("");
        await fetchQuestions();
        // Reload selected question to show answer
        const updated = await supabase
          .from("questions")
          .select("id, name, content, created_at, answer_text, answered_at, answered_by")
          .eq('id', selectedQuestion.id)
          .single();
        if (updated.data) {
          setSelectedQuestion(updated.data);
        }
      }
    } catch (err: any) {
      console.error('Error in handleSubmitAnswer:', err);
      setError(err?.message || 'Đã xảy ra lỗi. Vui lòng thử lại.');
      setTimeout(() => setError(null), 5000);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteQuestion = async (questionId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    
    if (!confirm("Bạn có chắc muốn xóa câu hỏi này?")) {
      return;
    }

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("questions")
        .delete()
        .eq('id', questionId);

      if (error) {
        console.error('Error deleting question:', error);
        setError(error.message || 'Không thể xóa câu hỏi. Vui lòng thử lại.');
        setTimeout(() => setError(null), 5000);
      } else {
        // Clear selected question if it was deleted
        if (selectedQuestion?.id === questionId) {
          setSelectedQuestion(null);
          setAnswerText("");
        }
        await fetchQuestions();
      }
    } catch (err: any) {
      console.error('Error deleting question:', err);
      setError(err?.message || 'Đã xảy ra lỗi khi xóa câu hỏi.');
      setTimeout(() => setError(null), 5000);
    }
  };

  const unansweredQuestions = unanswered;
  const answeredQuestions = answered;

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Quản lý câu hỏi</h1>
        <p className="text-gray-600 mt-1">Xem và trả lời câu hỏi từ khách hàng</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200"
          >
            <div className="p-4 border-b border-gray-200 flex gap-2">
              <button
                onClick={() => setSelectedTab('unanswered')}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedTab === 'unanswered'
                    ? 'bg-sky-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Clock className="w-4 h-4" />
                  Chưa trả lời ({unansweredQuestions.length})
                </div>
              </button>
              <button
                onClick={() => setSelectedTab('answered')}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedTab === 'answered'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Đã trả lời ({answeredQuestions.length})
                </div>
              </button>
            </div>

            <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500 mx-auto"></div>
                </div>
              ) : (selectedTab === 'unanswered' ? unansweredQuestions : answeredQuestions).length === 0 ? (
                <div className="text-center py-12">
                  <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-600">Chưa có câu hỏi</p>
                </div>
              ) : (
                (selectedTab === 'unanswered' ? unansweredQuestions : answeredQuestions).map((q) => (
                  <div
                    key={q.id}
                    onClick={() => setSelectedQuestion(q)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedQuestion?.id === q.id
                        ? 'border-sky-500 bg-sky-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-gray-900">
                        {(q.name || 'Khách').charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-gray-900">{q.name || 'Khách'}</h4>
                            <span className="text-xs text-gray-500">
                              {new Date(q.created_at).toLocaleDateString('vi-VN')}
                            </span>
                          </div>
                          <button
                            onClick={(e) => handleDeleteQuestion(q.id, e)}
                            className="p-1.5 hover:bg-red-100 rounded-lg text-red-600 hover:text-red-700 transition-colors"
                            title="Xóa câu hỏi"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-sm text-gray-700 line-clamp-2">{q.content}</p>
                        {selectedTab === 'answered' && q.answered_at && (
                          <div className="mt-2 text-xs text-green-600 font-medium">
                            Đã trả lời: {new Date(q.answered_at).toLocaleDateString('vi-VN')}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>

        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            {selectedQuestion ? (
              <>
                <div className="mb-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-gray-900">
                        {(selectedQuestion.name || 'Khách').charAt(0)}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{selectedQuestion.name || 'Khách'}</h3>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(selectedQuestion.created_at).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteQuestion(selectedQuestion.id)}
                      className="p-2 hover:bg-red-100 rounded-lg text-red-600 hover:text-red-700 transition-colors"
                      title="Xóa câu hỏi"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                    {selectedQuestion.content}
                  </p>
                </div>

                {selectedQuestion.answered_at ? (
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Câu trả lời:</h4>
                    <div className="bg-sky-50 p-3 rounded-lg border-l-4 border-sky-500">
                      <p className="text-sm text-gray-700 whitespace-pre-line">{selectedQuestion.answer_text}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(selectedQuestion.answered_at).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    {error && (
                      <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                        {error}
                      </div>
                    )}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Câu trả lời:
                      </label>
                      <textarea
                        value={answerText}
                        onChange={(e) => setAnswerText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                            e.preventDefault();
                            handleSubmitAnswer();
                          }
                        }}
                        placeholder="Nhập câu trả lời... (Ctrl+Enter để gửi)"
                        rows={8}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                      />
                    </div>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleSubmitAnswer();
                      }}
                      disabled={!answerText.trim() || submitting}
                      className="w-full bg-sky-500 hover:bg-sky-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-all"
                    >
                      <Send className="w-4 h-4" />
                      {submitting ? 'Đang gửi...' : 'Gửi câu trả lời'}
                    </button>
                  </>
                )}
              </>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <MessageCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>Chọn một câu hỏi để xem chi tiết</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

