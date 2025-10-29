"use client";

import { ChevronDown } from "lucide-react";
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function InfoSection() {
  const [expanded, setExpanded] = useState(false);

  const tocItems = [
    "Máy lọc không khí là gì?",
    "Vì sao cần máy lọc không khí?",
    "Các công nghệ lọc không khí phổ biến",
    "Cách chọn máy lọc không khí phù hợp",
    "Máy lọc không khí cho phòng nhỏ",
    "Máy lọc không khí cho phòng lớn",
    "Các tiêu chí chọn mua máy lọc không khí",
    "Lưu ý quan trọng khi sử dụng máy lọc không khí",
  ];

  const slugify = useCallback((s: string) => {
    return s
      .toLowerCase()
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");
  }, []);

  const handleScrollTo = useCallback(
    (id: string) => {
      const doScroll = () => {
        const el = document.getElementById(id);
        if (!el) return;
        const headerOffset = 110;
        const y = el.getBoundingClientRect().top + window.pageYOffset - headerOffset;
        window.scrollTo({ top: y, behavior: "smooth" });
      };
      if (!expanded) {
        setExpanded(true);
        setTimeout(doScroll, 350);
      } else {
        doScroll();
      }
    },
    [expanded]
  );

  return (
    <div className="bg-white py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">
            Thông tin quan trọng về máy lọc không khí
          </h2>

          <div className="prose max-w-none text-gray-700 leading-relaxed">
            <p className="mb-6">
              <strong>Máy lọc không khí</strong> đã trở thành thiết bị thiết yếu trong nhiều gia đình Việt hiện nay, đặc biệt là tại các thành phố lớn với mức độ ô nhiễm không khí cao. Không chỉ đơn thuần là thiết bị gia dụng, máy lọc không khí hiện đại được tích hợp nhiều công nghệ tiên tiến, giúp bảo vệ sức khỏe gia đình bạn. Tham khảo ngay bài viết dưới đây để có cái nhìn tổng quan về thế giới máy lọc không khí!
            </p>

            {/* Table of Contents */}
            <div className="bg-sky-50 rounded-lg p-6 mb-8 border border-sky-200">
              <h3 className="font-bold text-lg mb-4 text-gray-900">Nội dung chính</h3>
              <ol className="list-decimal list-inside space-y-2">
                {tocItems.map((item, index) => {
                  const id = slugify(item);
                  return (
                    <li
                      key={index}
                      onClick={() => handleScrollTo(id)}
                      className="text-gray-700 hover:text-sky-500 cursor-pointer transition-colors"
                    >
                      {item}
                    </li>
                  );
                })}
              </ol>
            </div>

            {/* Content Preview */}
            <motion.div 
              className="relative overflow-hidden"
              animate={{
                maxHeight: expanded ? "5000px" : "500px"
              }}
              transition={{
                duration: 1,
                ease: "easeInOut"
              }}
            >
              <div className="space-y-8">
                <section id={slugify(tocItems[0])}>
                  <h3 className="text-xl font-bold mb-4 text-gray-900">Máy lọc không khí là gì?</h3>
                  <p className="mb-4">
                    Máy lọc không khí là thiết bị được thiết kế để loại bỏ các chất ô nhiễm, bụi bẩn, vi khuẩn, virus và các hạt có hại trong không khí. Thiết bị này sử dụng các bộ lọc và công nghệ khác nhau để làm sạch không khí, tạo ra môi trường trong lành và an toàn cho sức khỏe.
                  </p>
                  <p className="mb-4">
                    Máy lọc không khí hiện đại không chỉ lọc bụi mà còn có khả năng loại bỏ mùi hôi, khí độc, nấm mốc và các tác nhân gây dị ứng, giúp cải thiện chất lượng không khí trong nhà một cách đáng kể.
                  </p>
                </section>

                <section id={slugify(tocItems[1])}>
                  <h3 className="text-xl font-bold mb-4 text-gray-900">Vì sao cần máy lọc không khí?</h3>
                  <p className="mb-4">
                    Không khí trong nhà có thể ô nhiễm gấp 2-5 lần so với không khí ngoài trời. Điều này là do các yếu tố như bụi từ nội thất, khí thải từ sơn, chất tẩy rửa, nấm mốc và vi khuẩn tích tụ. Máy lọc không khí cần thiết bởi:
                  </p>
                  <ul className="list-disc list-inside space-y-2 mb-4">
                    <li>Bảo vệ sức khỏe hô hấp, đặc biệt quan trọng với người già, trẻ em và người có bệnh hen suyễn</li>
                    <li>Loại bỏ bụi mịn PM2.5, PM10 - nguyên nhân gây các bệnh về phổi và tim mạch</li>
                    <li>Tiêu diệt vi khuẩn, virus và nấm mốc trong không khí</li>
                    <li>Khử mùi hôi, tạo không gian sống dễ chịu và thoải mái</li>
                    <li>Cải thiện chất lượng giấc ngủ và nâng cao năng suất làm việc</li>
                  </ul>
                </section>

                <motion.div
                  initial={false}
                  animate={{
                    opacity: expanded ? 1 : 0,
                    height: expanded ? "auto" : 0
                  }}
                  transition={{
                    opacity: { duration: 0.8, ease: "easeInOut" },
                    height: { duration: 1, ease: "easeInOut" }
                  }}
                  className="space-y-8"
                  style={{ overflow: "hidden" }}
                >
                  <section id={slugify(tocItems[2])}>
                    <h3 className="text-xl font-bold mb-4 text-gray-900">Các công nghệ lọc không khí phổ biến</h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2 text-sky-500">Công nghệ HEPA</h4>
                        <p>Lọc được 99.97% các hạt có kích thước từ 0.3 micron trở lên, hiệu quả cao với bụi mịn, phấn hoa và một số vi khuẩn.</p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2 text-sky-500">Công nghệ Ion</h4>
                        <p>Tạo ra các ion âm để trung hòa các hạt tích điện dương trong không khí, giúp chúng rơi xuống đất và dễ dàng làm sạch.</p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2 text-purple-600">Công nghệ UV-C</h4>
                        <p>Sử dụng tia cực tím để tiêu diệt vi khuẩn, virus và nấm mốc, đặc biệt hiệu quả trong việc khử trùng không khí.</p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2 text-orange-600">Công nghệ Carbon</h4>
                        <p>Hấp thụu các khí độc, mùi hôi và các hợp chất hữu cơ dễ bay hơi (VOC) từ không khí.</p>
                      </div>
                    </div>
                  </section>

                  <section id={slugify(tocItems[6])}>
                    <h3 className="text-xl font-bold mb-4 text-gray-900">Các tiêu chí chọn mua máy lọc không khí</h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Diện tích phòng</h4>
                        <p>Chọn máy có công suất phù hợp với diện tích phòng. Máy có CADR (Clean Air Delivery Rate) cao sẽ lọc không khí hiệu quả hơn.</p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Công nghệ lọc</h4>
                        <p>Kết hợp nhiều công nghệ lọc (HEPA + Carbon + UV) sẽ cho hiệu quả tốt nhất. Ưu tiên máy có bộ lọc HEPA thật.</p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Mức độ tiếng ồn</h4>
                        <p>Chọn máy có mức tiếng ồn thấp (dưới 50dB) để không ảnh hưởng đến giấc ngủ và sinh hoạt.</p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Chi phí vận hành</h4>
                        <p>Xem xét chi phí điện năng và thay thế bộ lọc định kỳ để đảm bảo hiệu quả lâu dài.</p>
                      </div>
                    </div>
                  </section>

                  <section id={slugify(tocItems[3])}>
                    <h3 className="text-xl font-bold mb-4 text-gray-900">Cách chọn máy lọc không khí phù hợp</h3>
                    <p className="mb-4">Xác định nhu cầu sử dụng, diện tích phòng, mức độ ô nhiễm và ngân sách. Ưu tiên các model có chứng nhận hiệu quả lọc và dễ thay thế bộ lọc.</p>
                  </section>

                  <section id={slugify(tocItems[4])}>
                    <h3 className="text-xl font-bold mb-4 text-gray-900">Máy lọc không khí cho phòng nhỏ</h3>
                    <p className="mb-4">Chọn công suất vừa đủ, kích thước nhỏ gọn, độ ồn thấp, tiết kiệm điện. Phù hợp phòng ngủ hoặc phòng làm việc cá nhân.</p>
                  </section>

                  <section id={slugify(tocItems[5])}>
                    <h3 className="text-xl font-bold mb-4 text-gray-900">Máy lọc không khí cho phòng lớn</h3>
                    <p className="mb-4">Ưu tiên CADR cao, lưu lượng gió mạnh, hỗ trợ nhiều chế độ. Nên chọn máy có nhiều tầng lọc để hiệu quả ở không gian mở.</p>
                  </section>

                  <section id={slugify(tocItems[7])}>
                    <h3 className="text-xl font-bold mb-4 text-gray-900">Lưu ý quan trọng khi sử dụng máy lọc không khí</h3>
                    <p className="mb-4">Đặt máy ở vị trí thông thoáng, thay bộ lọc đúng hạn, vệ sinh định kỳ và đóng cửa sổ khi cần để tăng hiệu quả lọc.</p>
                  </section>
                </motion.div>
              </div>

              {/* Gradient fade overlay khi collapsed - hiệu ứng mờ dần */}
              <motion.div 
                initial={false}
                animate={{
                  opacity: expanded ? 0 : 1
                }}
                transition={{ duration: 0.8 }}
                className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-white via-white/90 to-transparent pointer-events-none"
              />
            </motion.div>

            {/* Xem thêm button */}
            <div className="text-center mt-6">
              <motion.button
                onClick={() => setExpanded(!expanded)}
                className="text-sky-500 hover:text-sky-600 font-semibold flex items-center gap-2 mx-auto"
                whileHover={{ scale: 1.05, transition: { duration: 0.15 } }}
                whileTap={{ scale: 0.95, transition: { duration: 0.1 } }}
              >
                {expanded ? 'Thu gọn' : 'Xem thêm'}
                <motion.div
                  animate={{ rotate: expanded ? 180 : 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <ChevronDown className="w-5 h-5" />
                </motion.div>
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

