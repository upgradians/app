-- ============================================================
-- PROFILE ENHANCEMENTS: Extended onboarding fields
-- ============================================================

alter table public.profiles
  add column if not exists phone_number     text,
  add column if not exists address          text,
  add column if not exists nationality      text,
  add column if not exists qualification    text,
  add column if not exists experience_level text check (experience_level in ('beginner','intermediate','experienced','expert')),
  add column if not exists last_streak_date date;

-- ============================================================
-- CONTACT MESSAGES
-- ============================================================

create table if not exists public.contact_messages (
  id         uuid primary key default uuid_generate_v4(),
  name       text not null,
  email      text not null,
  message    text not null,
  created_at timestamptz not null default now(),
  is_read    bool not null default false
);

create index if not exists contact_messages_created_idx on public.contact_messages(created_at desc);

-- Update handle_new_user to populate extended fields
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (
    id, username, full_name, avatar_url,
    phone_number, nationality, address, qualification, experience_level, college
  ) values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'phone_number',
    new.raw_user_meta_data->>'nationality',
    new.raw_user_meta_data->>'address',
    new.raw_user_meta_data->>'qualification',
    new.raw_user_meta_data->>'experience_level',
    new.raw_user_meta_data->>'college'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- ============================================================
-- RLS for contact_messages (admin only)
-- ============================================================

alter table public.contact_messages enable row level security;

create policy "Admin can read contact messages"
  on public.contact_messages for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Anyone can insert contact message"
  on public.contact_messages for insert
  with check (true);

-- ============================================================
-- Update leaderboard view to include new fields
-- ============================================================

drop view if exists public.leaderboard;
create view public.leaderboard as
  select
    p.id              as user_id,
    p.username,
    p.full_name,
    p.avatar_url,
    p.total_xp,
    p.rank,
    p.challenges_solved,
    p.streak_days,
    p.college,
    row_number() over (order by p.total_xp desc) as position
  from public.profiles p
  where p.role = 'student'
  order by p.total_xp desc;
