-- =====================================================
-- QUESTIONS - SETUP HOÀN CHỈNH
-- File này setup tất cả cho tính năng hỏi đáp
-- =====================================================

-- 1. Tạo bảng questions
create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  name text,
  content text not null,
  created_at timestamptz not null default now(),
  answer_text text,
  answered_at timestamptz,
  answered_by uuid
);

-- 2. Bật RLS
alter table public.questions enable row level security;

-- 3. Tạo indexes
create index if not exists questions_created_at_idx on public.questions (created_at desc);
create index if not exists questions_answered_at_idx on public.questions (answered_at desc nulls last);

-- 4. Xóa tất cả policies cũ
drop policy if exists "Questions are readable by everyone" on public.questions;
drop policy if exists "Authenticated users can insert questions" on public.questions;
drop policy if exists "Admins can update questions" on public.questions;
drop policy if exists "Admins can select all questions" on public.questions;
drop policy if exists "Enable read access for all users" on public.questions;
drop policy if exists "Authenticated users can insert their own questions" on public.questions;

-- 5. Function is_admin đã được tạo trong 03_admin_setup.sql
-- Không cần tạo lại, chỉ sử dụng function đã có

-- 7. Tạo policies
-- Tất cả mọi người có thể đọc questions
create policy "Questions are readable by everyone"
on public.questions
for select
to public
using (true);

-- Users đã đăng nhập có thể thêm questions của họ
create policy "Authenticated users can insert questions"
on public.questions
for insert
to authenticated
with check (auth.uid() = user_id);

-- Admin có thể update questions (trả lời)
create policy "Admins can update questions"
on public.questions
for update
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

-- Admin có thể xóa questions
create policy "Admins can delete questions"
on public.questions
for delete
to authenticated
using (public.is_admin(auth.uid()));

