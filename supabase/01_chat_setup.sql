-- =====================================================
-- CHAT MESSAGES - SETUP HOÀN CHỈNH
-- File này setup tất cả cho tính năng chat
-- =====================================================

-- 1. Tạo bảng chat_messages
create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  user_email text,
  user_name text,
  user_phone text,
  admin_id uuid references auth.users(id) on delete set null,
  message text not null,
  is_from_user boolean not null default true,
  is_read boolean not null default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Thêm columns nếu bảng đã tồn tại
alter table public.chat_messages
  add column if not exists user_email text,
  add column if not exists user_name text,
  add column if not exists user_phone text;

-- 3. Tạo indexes
create index if not exists chat_messages_user_id_idx on public.chat_messages (user_id, created_at desc);
create index if not exists chat_messages_admin_id_idx on public.chat_messages (admin_id, created_at desc);
create index if not exists chat_messages_is_read_idx on public.chat_messages (is_read) where is_read = false;
create index if not exists chat_messages_created_at_idx on public.chat_messages (created_at desc);

-- 4. Bật RLS
alter table public.chat_messages enable row level security;

-- 5. Xóa tất cả policies cũ
drop policy if exists "Users can read their own messages" on public.chat_messages;
drop policy if exists "Users can insert their own messages" on public.chat_messages;
drop policy if exists "Admins can read all messages" on public.chat_messages;
drop policy if exists "Admins can insert messages" on public.chat_messages;
drop policy if exists "Admins can update messages" on public.chat_messages;

-- 6. Tạo function is_admin với error handling (dùng CREATE OR REPLACE để tránh lỗi dependencies)
-- Lưu ý: Dùng user_id làm parameter name để tương thích với function đã có
create or replace function public.is_admin(user_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  user_email_val text;
  user_role_val text;
begin
  if user_id is null then
    return false;
  end if;
  
  begin
    select 
      email, 
      coalesce(raw_user_meta_data->>'role', '') 
    into user_email_val, user_role_val
    from auth.users
    where id = user_id
    limit 1;
    
    if not found then
      return false;
    end if;
    
    return (user_email_val = 'admin@hoithoxanh.com' or user_role_val = 'admin');
  exception when others then
    return false;
  end;
end;
$$;

-- 7. Cấp quyền execute cho function
grant execute on function public.is_admin(uuid) to authenticated;

-- 8. Tạo policies cho users (đơn giản, không gọi function)
create policy "Users can read their own messages"
on public.chat_messages 
for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can insert their own messages"
on public.chat_messages 
for insert
to authenticated
with check (
  auth.uid() = user_id 
  and is_from_user = true
  and message is not null
  and trim(message) != ''
);

-- 9. Tạo policies cho admin (dùng function is_admin)
create policy "Admins can read all messages"
on public.chat_messages 
for select
to authenticated
using (public.is_admin(auth.uid()));

create policy "Admins can insert messages"
on public.chat_messages 
for insert
to authenticated
with check (
  public.is_admin(auth.uid())
  and is_from_user = false
);

create policy "Admins can update messages"
on public.chat_messages 
for update
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

-- 10. Tạo trigger function cho updated_at
create or replace function update_chat_messages_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- 11. Tạo trigger
drop trigger if exists update_chat_messages_updated_at on public.chat_messages;
create trigger update_chat_messages_updated_at
before update on public.chat_messages
for each row
execute function update_chat_messages_updated_at();

