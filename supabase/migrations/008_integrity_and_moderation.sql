-- ============================================================
-- PERFORMANCE INDEXES
-- ============================================================

create index if not exists idx_submissions_user_id     on public.submissions (user_id);
create index if not exists idx_submissions_challenge   on public.submissions (challenge_id);
create index if not exists idx_submissions_status      on public.submissions (status);
create index if not exists idx_submissions_submitted   on public.submissions (submitted_at desc);

create index if not exists idx_profiles_xp_leaderboard
  on public.profiles (total_xp desc)
  where is_banned = false;

create index if not exists idx_profiles_last_active    on public.profiles (last_active_at desc);

create index if not exists idx_interview_user_id       on public.interview_sessions (user_id);
create index if not exists idx_interview_status        on public.interview_sessions (status);
create index if not exists idx_interview_created       on public.interview_sessions (created_at desc);

create index if not exists idx_anti_cheat_user_session on public.anti_cheat_events (user_id, session_id);

-- ============================================================
-- VIOLATION TRACKING ON PROFILES
-- ============================================================

alter table public.profiles
  add column if not exists suspicious_activity boolean     not null default false,
  add column if not exists violation_count     int         not null default 0,
  add column if not exists temp_ban_until      timestamptz;

create index if not exists idx_profiles_suspicious     on public.profiles (suspicious_activity) where suspicious_activity = true;

-- ============================================================
-- USER SOLVED CHALLENGES (atomic first-solve gate)
-- ============================================================

create table if not exists public.user_solved_challenges (
  user_id      uuid        not null references public.profiles(id) on delete cascade,
  challenge_id text        not null,
  solved_at    timestamptz not null default now(),
  xp_awarded   int         not null default 0,
  primary key  (user_id, challenge_id)
);

create index if not exists idx_usc_user_id on public.user_solved_challenges (user_id);

alter table public.user_solved_challenges enable row level security;

drop policy if exists "Users read own solved challenges"  on public.user_solved_challenges;
drop policy if exists "Users insert own solved challenges" on public.user_solved_challenges;

create policy "Users read own solved challenges"
  on public.user_solved_challenges for select
  using (auth.uid() = user_id);

create policy "Users insert own solved challenges"
  on public.user_solved_challenges for insert
  with check (auth.uid() = user_id);

-- ============================================================
-- MODERATION LOGS
-- ============================================================

create table if not exists public.moderation_logs (
  id         uuid        primary key default gen_random_uuid(),
  admin_id   uuid        not null references public.profiles(id),
  target_id  uuid        not null references public.profiles(id),
  action     text        not null,
  reason     text,
  metadata   jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_modlog_target    on public.moderation_logs (target_id);
create index if not exists idx_modlog_admin     on public.moderation_logs (admin_id);
create index if not exists idx_modlog_created   on public.moderation_logs (created_at desc);

alter table public.moderation_logs enable row level security;

drop policy if exists "Admin read moderation_logs"  on public.moderation_logs;
drop policy if exists "Admin insert moderation_logs" on public.moderation_logs;

create policy "Admin read moderation_logs"
  on public.moderation_logs for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admin insert moderation_logs"
  on public.moderation_logs for insert
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );
