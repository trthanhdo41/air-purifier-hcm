# Hướng dẫn setup sản phẩm trong Supabase

## Bước 1: Vào Supabase Dashboard
1. Truy cập https://supabase.com/dashboard
2. Chọn project của bạn
3. Vào phần **SQL Editor** ở sidebar

## Bước 2: Disable RLS (Row Level Security) tạm thời cho table products
Để có thể insert data dễ dàng, chạy lệnh này:

```sql
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
```

## Bước 3: Insert dữ liệu sản phẩm
Copy toàn bộ nội dung từ file `supabase/PRODUCTS_SEED.sql` vào SQL Editor và chạy.

## Bước 4: Enable lại RLS và thêm policies (Optional)
Sau khi insert xong, bạn có thể enable RLS và thêm policies:

```sql
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Cho phép mọi người đọc products
CREATE POLICY "Allow public read access" ON products
  FOR SELECT USING (true);

-- Cho phép admin insert (cần check role)
CREATE POLICY "Allow admin insert" ON products
  FOR INSERT WITH CHECK (true);

-- Cho phép admin update
CREATE POLICY "Allow admin update" ON products
  FOR UPDATE USING (true);

-- Cho phép admin delete  
CREATE POLICY "Allow admin delete" ON products
  FOR DELETE USING (true);
```

## Lưu ý:
- Nếu không disable RLS, bạn cần đăng nhập với role admin để insert data
- File seed sẽ insert 25 sản phẩm từ data/products.ts vào database
- Sau khi seed xong, refresh trang admin để xem sản phẩm

