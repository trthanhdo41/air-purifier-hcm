-- Admin bootstrap for products: fixes RLS, default IDs, and seeds sample data
-- Run this in Supabase SQL editor (execute all)

-- 1) Extensions and defaults
create extension if not exists "uuid-ossp";
alter table products alter column id set default uuid_generate_v4()::text;

-- 2) Ensure RLS is enabled and public SELECT works for active products
alter table products enable row level security;
drop policy if exists "Products are viewable by everyone" on products;
create policy "Products are viewable by everyone"
on products for select
using (status = 'active');

-- 3) Grant admin (by email) full write access
drop policy if exists "admin insert products" on products;
drop policy if exists "admin update products" on products;
drop policy if exists "admin delete products" on products;

create policy "admin insert products"
on products for insert
with check (auth.email() = 'admin@hoithoxanh.com');

create policy "admin update products"
on products for update
using (auth.email() = 'admin@hoithoxanh.com')
with check (auth.email() = 'admin@hoithoxanh.com');

create policy "admin delete products"
on products for delete
using (auth.email() = 'admin@hoithoxanh.com');

-- 4) Seed minimal categories if missing
insert into categories (id, name, slug)
values
  ('may-loc-hepa', 'Máy lọc HEPA', 'may-loc-hepa')
on conflict (id) do nothing;

-- 5) Seed one sample product (you can edit values as you like)
insert into products (name, price, original_price, discount, image, category, brand, stock, status)
values (
  'Xiaomi Mi Air Purifier 4',
  3490000,
  4490000,
  22,
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=800&auto=format&fit=crop',
  'may-loc-hepa',
  'Xiaomi',
  25,
  'active'
)
on conflict (id) do nothing;

-- 6) Verify
-- select * from products order by created_at desc limit 5;

