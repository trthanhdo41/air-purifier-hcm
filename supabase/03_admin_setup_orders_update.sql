-- =====================================================
-- ADMIN SETUP UPDATE - CẬP NHẬT POLICIES CHO ORDERS
-- Chạy file này để thêm policies cho admin xem và cập nhật đơn hàng
-- =====================================================

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

-- 7. User policies cho order_items (insert order_items cho đơn hàng của chính họ)
DROP POLICY IF EXISTS "Users can insert order items for their own orders" ON order_items;
DROP POLICY IF EXISTS "Users can view order items for their own orders" ON order_items;

CREATE POLICY "Users can insert order items for their own orders"
ON order_items FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_items.order_id
    AND orders.user_id = auth.uid()
  )
);

CREATE POLICY "Users can view order items for their own orders"
ON order_items FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_items.order_id
    AND orders.user_id = auth.uid()
  )
);

-- 8. Admin policies cho order_items (xem tất cả)
DROP POLICY IF EXISTS "admin view all order items" ON order_items;

CREATE POLICY "admin view all order items"
ON order_items FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

