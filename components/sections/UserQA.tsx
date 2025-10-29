"use client";

import { useState } from "react";
import { Send, ThumbsUp, User as UserIcon, MessageCircle } from "lucide-react";
import { useAuthStore } from "@/lib/stores/auth";
import LoginModal from "@/components/LoginModal";

export default function UserQA() {
  const [question, setQuestion] = useState("");
  const [loginOpen, setLoginOpen] = useState(false);
  const { user } = useAuthStore();

  const qaData = [
    {
      id: 1,
      user: "Nguyễn Minh",
      time: "2 tuần trước",
      question: "Máy lọc không khí Xiaomi Mi Air Purifier 4 có tốt không?",
      answer: {
        user: "Quản trị viên",
        badge: "QTV",
        time: "2 tuần trước",
        text: "Máy Lọc Không Khí HCM xin chào anh Minh\nDạ MÁY LỌC KHÔNG KHÍ XIAOMI MI AIR PURIFIER 4 là sản phẩm rất tốt với công nghệ HEPA 13, lọc được 99.97% bụi mịn PM2.5. Giá khuyến mãi hiện tại 4.990.000đ\nMáy phù hợp cho phòng 20-40m², có ứng dụng điều khiển thông minh\nAnh có thể đến showroom để trải nghiệm trực tiếp ạ!"
      }
    },
    {
      id: 2,
      user: "Trần Thị Lan",
      time: "1 tháng trước",
      question: "Máy lọc không khí Sharp FP-F40E-W có phù hợp phòng ngủ không?",
      answer: {
        user: "Quản trị viên",
        badge: "QTV",
        time: "1 tháng trước",
        text: "Máy Lọc Không Khí HCM xin chào chị Lan\nDạ MÁY LỌC KHÔNG KHÍ SHARP FP-F40E-W rất phù hợp cho phòng ngủ với công nghệ Plasmacluster Ion\nMáy có chế độ Sleep Mode hoạt động rất êm (chỉ 20dB), không ảnh hưởng giấc ngủ\nDiện tích phù hợp: 25-30m²\nChị có thể đặt hàng online hoặc đến showroom để được tư vấn chi tiết ạ!"
      }
    },
    {
      id: 3,
      user: "Lê Văn Hùng",
      time: "3 tuần trước",
      question: "Bao lâu thì thay bộ lọc máy lọc không khí?",
      answer: {
        user: "Quản trị viên",
        badge: "QTV",
        time: "3 tuần trước",
        text: "Máy Lọc Không Khí HCM xin chào anh Hùng\nDạ tần suất thay bộ lọc phụ thuộc vào mức độ sử dụng:\n- Bộ lọc HEPA: 6-12 tháng\n- Bộ lọc Carbon: 3-6 tháng\n- Bộ lọc UV: 12-18 tháng\nChúng tôi có dịch vụ thay bộ lọc tại nhà và bảo hành chính hãng\nAnh có thể đăng ký nhắc nhở thay bộ lọc định kỳ ạ!"
      }
    }
  ];

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
                    placeholder="Viết câu hỏi của bạn tại đây"
                    className="flex-1 border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all"
                  />
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      if (!user) {
                        setLoginOpen(true);
                        return;
                      }
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
            {qaData.map((qa) => (
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

                {/* Answer - Mobile Optimized */}
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
                      <button className="mt-2 sm:mt-3 text-xs sm:text-sm text-sky-500 hover:text-sky-600 font-medium flex items-center gap-1 transition-all">
                        <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                        Phản hồi
                      </button>
                    </div>
                  </div>
                </div>
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

