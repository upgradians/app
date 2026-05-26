-- ============================================================
-- LEADERBOARD HARDENING: is_banned flag on profiles
-- ============================================================

alter table public.profiles
  add column if not exists is_banned boolean not null default false;

create index if not exists profiles_is_banned_idx on public.profiles (is_banned)
  where is_banned = false;

-- ============================================================
-- DAILY CHALLENGE ENGINE
-- ============================================================

create table if not exists public.daily_challenges (
  id             uuid        primary key default gen_random_uuid(),
  challenge_id   text        not null,
  challenge_date date        not null unique,
  xp_multiplier  numeric     not null default 2,
  bonus_xp       int         not null default 0,
  created_by     uuid        references public.profiles(id),
  created_at     timestamptz not null default now()
);

create index if not exists daily_challenges_date_idx on public.daily_challenges (challenge_date desc);

alter table public.daily_challenges enable row level security;

-- Anyone can read daily challenges
create policy "Public read daily_challenges"
  on public.daily_challenges for select
  using (true);

-- Admin only write
create policy "Admin write daily_challenges"
  on public.daily_challenges for insert
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admin update daily_challenges"
  on public.daily_challenges for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admin delete daily_challenges"
  on public.daily_challenges for delete
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );
