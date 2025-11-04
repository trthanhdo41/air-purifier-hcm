-- =====================================================
-- ADMIN SETUP - CẤU HÌNH ADMIN VÀ POLICIES
-- Chạy sau schema.sql
-- =====================================================

-- 1. Đảm bảo admin account có role = 'admin' trong metadata
UPDATE auth.users
SET raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object('role','admin')
WHERE email = 'admin@hoithoxanh.com';

-- 2. Tạo function is_admin nếu chưa có (dùng chung với chat/questions)
-- Lưu ý: Dùng user_id làm parameter name để tương thích với function đã có
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
  user_email_val text;
  user_role_val text;
BEGIN
  IF user_id IS NULL THEN
    RETURN false;
  END IF;
  
  BEGIN
    SELECT 
      email, 
      coalesce(raw_user_meta_data->>'role', '') 
    INTO user_email_val, user_role_val
    FROM auth.users
    WHERE id = user_id
    LIMIT 1;
    
    IF NOT FOUND THEN
      RETURN false;
    END IF;
    
    RETURN (user_email_val = 'admin@hoithoxanh.com' OR user_role_val = 'admin');
  EXCEPTION WHEN OTHERS THEN
    RETURN false;
  END;
END;
$$;

-- 3. Cấp quyền cho function
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated;

-- 4. Admin policies cho products (dùng function is_admin)
DROP POLICY IF EXISTS "admin insert products" ON products;
DROP POLICY IF EXISTS "admin update products" ON products;
DROP POLICY IF EXISTS "admin delete products" ON products;

CREATE POLICY "admin insert products"
ON products FOR INSERT
TO authenticated
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "admin update products"
ON products FOR UPDATE
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "admin delete products"
ON products FOR DELETE
TO authenticated
USING (public.is_admin(auth.uid()));

-- 5. Admin policies cho categories (dùng function is_admin)
DROP POLICY IF EXISTS "admin insert categories" ON categories;
DROP POLICY IF EXISTS "admin update categories" ON categories;
DROP POLICY IF EXISTS "admin delete categories" ON categories;

CREATE POLICY "admin insert categories"
ON categories FOR INSERT
TO authenticated
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "admin update categories"
ON categories FOR UPDATE
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "admin delete categories"
ON categories FOR DELETE
TO authenticated
USING (public.is_admin(auth.uid()));

-- 6. Admin policies cho orders (xem và cập nhật tất cả đơn hàng)
DROP POLICY IF EXISTS "admin view all orders" ON orders;
DROP POLICY IF EXISTS "admin update all orders" ON orders;

CREATE POLICY "admin view all orders"
ON orders FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "admin update all orders"
ON orders FOR UPDATE
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- 7. Admin policies cho order_items (xem tất cả)
DROP POLICY IF EXISTS "admin view all order items" ON order_items;

CREATE POLICY "admin view all order items"
ON order_items FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

