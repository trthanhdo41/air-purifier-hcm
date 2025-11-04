-- =====================================================
-- SEED DATA - THÊM DỮ LIỆU MẪU
-- Chạy sau schema và admin setup
-- =====================================================

-- 1. Categories
INSERT INTO categories (id, name, slug, icon) VALUES
  ('may-loc-hepa', 'Máy lọc HEPA', 'may-loc-hepa', 'Wind'),
  ('may-loc-ion', 'Máy lọc Ion', 'may-loc-ion', 'Zap'),
  ('may-loc-carbon', 'Máy lọc Carbon', 'may-loc-carbon', 'Shield'),
  ('may-loc-uv', 'Máy lọc UV', 'may-loc-uv', 'Sun'),
  ('may-loc-phong-nho', 'Phòng nhỏ (< 20m²)', 'may-loc-phong-nho', 'Home'),
  ('may-loc-phong-vua', 'Phòng vừa (20-40m²)', 'may-loc-phong-vua', 'Home'),
  ('may-loc-phong-lon', 'Phòng lớn (> 40m²)', 'may-loc-phong-lon', 'Home'),
  ('may-loc-khong-khi-thong-minh', 'Máy lọc thông minh', 'may-loc-khong-khi-thong-minh', 'Activity'),
  ('may-loc-khong-khi-tiet-kiem', 'Tiết kiệm điện', 'may-loc-khong-khi-tiet-kiem', 'Leaf'),
  ('may-loc-khong-khi-cao-cap', 'Cao cấp', 'may-loc-khong-khi-cao-cap', 'Sparkles'),
  ('bo-loc-thay-the', 'Bộ lọc thay thế', 'bo-loc-thay-the', 'Filter'),
  ('phu-kien-may-loc', 'Phụ kiện', 'phu-kien-may-loc', 'AirVent')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  icon = EXCLUDED.icon,
  updated_at = NOW();

-- 7. FAQs
INSERT INTO faqs (id, question, answer, order_index) VALUES
  ('faq-1', 'Máy lọc không khí có giao hàng nhanh 2H không?', 'Có. Chúng tôi hỗ trợ giao hàng hỏa tốc trong 2H cho khu vực nội thành TP.HCM. Đơn hàng từ 500K được miễn phí vận chuyển.', 1),
  ('faq-2', 'Bảo hành máy lọc không khí tại cửa hàng thế nào?', 'Tất cả máy lọc không khí đều được bảo hành chính hãng từ 12-24 tháng tùy theo từng thương hiệu. Chúng tôi cam kết hỗ trợ bảo hành nhanh chóng và chu đáo.', 2),
  ('faq-3', 'Mua máy lọc không khí được ưu đãi những gì?', 'Khách hàng được hưởng nhiều ưu đãi: Giảm giá trực tiếp, trả góp 0%, thu cũ đổi mới, tặng voucher, miễn phí vận chuyển. Đặc biệt có chương trình khuyến mãi định kỳ với mức giảm lên đến 30%.', 3),
  ('faq-4', 'Mua máy lọc không khí ở đâu chính hãng, giá rẻ?', 'Chúng tôi là địa chỉ uy tín tại TP.HCM chuyên về máy lọc không khí. Cam kết 100% hàng chính hãng, giá cạnh tranh nhất thị trường, chính sách bảo hành và đổi trả linh hoạt.', 4),
  ('faq-5', 'Máy lọc không khí nào phù hợp với phòng 20m²?', 'Với phòng 20m², bạn nên chọn máy có CADR từ 150-200 m³/h. Các dòng phù hợp: Xiaomi Mi Air Purifier 3C, Sharp FP-F40E-W, hoặc Panasonic F-PXH55A.', 5),
  ('faq-6', 'Bao lâu thì thay bộ lọc máy lọc không khí?', 'Tần suất thay bộ lọc phụ thuộc vào mức độ sử dụng và chất lượng không khí. Thông thường: Bộ lọc HEPA 6-12 tháng, bộ lọc Carbon 3-6 tháng, bộ lọc UV 12-18 tháng.', 6)
ON CONFLICT (id) DO UPDATE SET
  question = EXCLUDED.question,
  answer = EXCLUDED.answer,
  order_index = EXCLUDED.order_index,
  updated_at = NOW();

-- 2. Products
INSERT INTO products (id, name, description, price, original_price, discount, image, category, brand, rating, reviews, badge, stock, status) VALUES
  ('1', 'Máy lọc không khí Xiaomi Mi Air Purifier 4 Pro', NULL, 4990000, 6490000, 23, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTqcWbIqxD1gmh2l8psxDUx8A6osESPMx-J8Q&s', 'may-loc-hepa', 'Xiaomi', 4.8, 445, 'hot', 18, 'active'),
  ('2', 'Máy lọc không khí Sharp FP-J80EV-H', NULL, 8990000, 10990000, 18, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTqcWbIqxD1gmh2l8psxDUx8A6osESPMx-J8Q&s', 'may-loc-hepa', 'Sharp', 4.7, 289, NULL, 12, 'active'),
  ('3', 'Máy lọc không khí Levoit Core 400S', NULL, 5490000, 6990000, 21, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTqcWbIqxD1gmh2l8psxDUx8A6osESPMx-J8Q&s', 'may-loc-hepa', 'Levoit', 4.6, 178, 'new', 22, 'active'),
  ('4', 'Máy lọc không khí Panasonic F-PXH55A', NULL, 3290000, 4290000, 23, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTqcWbIqxD1gmh2l8psxDUx8A6osESPMx-J8Q&s', 'may-loc-ion', 'Panasonic', 4.5, 234, 'sale', 35, 'active'),
  ('5', 'Máy lọc không khí Samsung AX60R5080WD', NULL, 7990000, 9990000, 20, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTqcWbIqxD1gmh2l8psxDUx8A6osESPMx-J8Q&s', 'may-loc-ion', 'Samsung', 4.7, 156, NULL, 8, 'active'),
  ('6', 'Máy lọc không khí Philips AC2889/10', NULL, 6990000, 8990000, 22, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTqcWbIqxD1gmh2l8psxDUx8A6osESPMx-J8Q&s', 'may-loc-carbon', 'Philips', 4.8, 312, 'hot', 15, 'active'),
  ('7', 'Máy lọc không khí LG PuriCare AS60GDWV0', NULL, 11990000, 14990000, 20, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTqcWbIqxD1gmh2l8psxDUx8A6osESPMx-J8Q&s', 'may-loc-carbon', 'LG', 4.6, 189, NULL, 10, 'active'),
  ('8', 'Máy lọc không khí Coway Airmega 300S', NULL, 8990000, 11990000, 25, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTqcWbIqxD1gmh2l8psxDUx8A6osESPMx-J8Q&s', 'may-loc-uv', 'Coway', 4.9, 267, 'hot', 12, 'active'),
  ('9', 'Máy lọc không khí Blueair Blue Pure 211+', NULL, 12990000, 15990000, 19, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTqcWbIqxD1gmh2l8psxDUx8A6osESPMx-J8Q&s', 'may-loc-uv', 'Blueair', 4.7, 198, NULL, 6, 'active'),
  ('10', 'Máy lọc không khí Xiaomi Mi Air Purifier 3C', NULL, 2490000, 3290000, 24, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTqcWbIqxD1gmh2l8psxDUx8A6osESPMx-J8Q&s', 'may-loc-phong-nho', 'Xiaomi', 4.4, 456, 'sale', 45, 'active'),
  ('11', 'Máy lọc không khí Sharp FP-F40E-W', NULL, 3990000, 4990000, 20, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTqcWbIqxD1gmh2l8psxDUx8A6osESPMx-J8Q&s', 'may-loc-phong-nho', 'Sharp', 4.5, 234, NULL, 28, 'active'),
  ('12', 'Máy lọc không khí Dyson Pure Cool TP04', NULL, 15990000, 19990000, 20, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTqcWbIqxD1gmh2l8psxDUx8A6osESPMx-J8Q&s', 'may-loc-phong-vua', 'Dyson', 4.8, 189, 'hot', 8, 'active'),
  ('13', 'Máy lọc không khí Honeywell HPA300', NULL, 7990000, 9990000, 20, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTqcWbIqxD1gmh2l8psxDUx8A6osESPMx-J8Q&s', 'may-loc-phong-vua', 'Honeywell', 4.6, 156, NULL, 15, 'active'),
  ('14', 'Máy lọc không khí IQAir HealthPro Plus', NULL, 25990000, 29990000, 13, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTqcWbIqxD1gmh2l8psxDUx8A6osESPMx-J8Q&s', 'may-loc-phong-lon', 'IQAir', 4.9, 89, 'hot', 3, 'active'),
  ('15', 'Máy lọc không khí Austin Air HealthMate Plus', NULL, 18990000, 22990000, 17, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTqcWbIqxD1gmh2l8psxDUx8A6osESPMx-J8Q&s', 'may-loc-phong-lon', 'Austin Air', 4.7, 67, NULL, 5, 'active'),
  ('16', 'Máy lọc không khí Xiaomi Mi Air Purifier 4 Lite', NULL, 3490000, 4490000, 22, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTqcWbIqxD1gmh2l8psxDUx8A6osESPMx-J8Q&s', 'may-loc-khong-khi-thong-minh', 'Xiaomi', 4.5, 334, 'new', 25, 'active'),
  ('17', 'Máy lọc không khí Samsung AX90R5080WD', NULL, 12990000, 15990000, 19, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTqcWbIqxD1gmh2l8psxDUx8A6osESPMx-J8Q&s', 'may-loc-khong-khi-thong-minh', 'Samsung', 4.8, 123, NULL, 7, 'active'),
  ('18', 'Máy lọc không khí Winix Zero S', NULL, 5990000, 7990000, 25, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTqcWbIqxD1gmh2l8psxDUx8A6osESPMx-J8Q&s', 'may-loc-khong-khi-tiet-kiem', 'Winix', 4.6, 178, 'sale', 20, 'active'),
  ('19', 'Máy lọc không khí Boneco P500', NULL, 4990000, 6490000, 23, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTqcWbIqxD1gmh2l8psxDUx8A6osESPMx-J8Q&s', 'may-loc-khong-khi-tiet-kiem', 'Boneco', 4.4, 145, NULL, 18, 'active'),
  ('20', 'Máy lọc không khí Dyson Pure Hot+Cool HP09', NULL, 19990000, 24990000, 20, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTqcWbIqxD1gmh2l8psxDUx8A6osESPMx-J8Q&s', 'may-loc-khong-khi-cao-cap', 'Dyson', 4.9, 234, 'hot', 4, 'active'),
  ('21', 'Máy lọc không khí Rabbit Air MinusA2', NULL, 17990000, 21990000, 18, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTqcWbIqxD1gmh2l8psxDUx8A6osESPMx-J8Q&s', 'may-loc-khong-khi-cao-cap', 'Rabbit Air', 4.8, 89, NULL, 6, 'active'),
  ('22', 'Bộ lọc HEPA Xiaomi Mi Air Purifier 4', NULL, 890000, 1290000, 31, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTqcWbIqxD1gmh2l8psxDUx8A6osESPMx-J8Q&s', 'bo-loc-thay-the', 'Xiaomi', 4.5, 567, 'sale', 60, 'active'),
  ('23', 'Bộ lọc Sharp FP-J80EV', NULL, 1290000, 1790000, 28, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTqcWbIqxD1gmh2l8psxDUx8A6osESPMx-J8Q&s', 'bo-loc-thay-the', 'Sharp', 4.6, 234, NULL, 45, 'active'),
  ('24', 'Remote điều khiển máy lọc không khí', NULL, 290000, 390000, 26, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTqcWbIqxD1gmh2l8psxDUx8A6osESPMx-J8Q&s', 'phu-kien-may-loc', 'Generic', 4.3, 123, 'sale', 80, 'active'),
  ('25', 'Cảm biến chất lượng không khí', NULL, 1490000, 1990000, 25, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTqcWbIqxD1gmh2l8psxDUx8A6osESPMx-J8Q&s', 'phu-kien-may-loc', 'Generic', 4.4, 89, NULL, 35, 'active')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  discount = EXCLUDED.discount,
  image = EXCLUDED.image,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  rating = EXCLUDED.rating,
  reviews = EXCLUDED.reviews,
  badge = EXCLUDED.badge,
  stock = EXCLUDED.stock,
  status = EXCLUDED.status,
  updated_at = NOW();

-- 3. Sample coupons
INSERT INTO coupons (id, code, name, description, discount_type, discount_value, min_purchase, usage_limit, valid_from, valid_until, status) VALUES
  ('cpn_001', 'WELCOME10', 'Giảm 10% cho khách hàng mới', 'Giảm 10% cho đơn hàng đầu tiên', 'percentage', 10.00, 500000, 1000, NOW(), NOW() + INTERVAL '6 months', 'active'),
  ('cpn_002', 'FREESHIP', 'Miễn phí vận chuyển', 'Miễn phí ship cho đơn từ 1 triệu', 'fixed', 0.00, 1000000, NULL, NOW(), NOW() + INTERVAL '1 year', 'active'),
  ('cpn_003', 'SALE50K', 'Giảm 50.000đ', 'Giảm ngay 50.000đ cho đơn từ 500k', 'fixed', 50000.00, 500000, 500, NOW(), NOW() + INTERVAL '3 months', 'active')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  discount_type = EXCLUDED.discount_type,
  discount_value = EXCLUDED.discount_value,
  min_purchase = EXCLUDED.min_purchase,
  max_discount = EXCLUDED.max_discount,
  usage_limit = EXCLUDED.usage_limit,
  valid_from = EXCLUDED.valid_from,
  valid_until = EXCLUDED.valid_until,
  status = EXCLUDED.status,
  updated_at = NOW();

