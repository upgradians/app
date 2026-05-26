-- ============================================================
-- ANTI-CHEAT EVENTS
-- ============================================================

create table if not exists public.anti_cheat_events (
  id              uuid        primary key default gen_random_uuid(),
  user_id         uuid        not null references public.profiles(id) on delete cascade,
  session_type    text        not null check (session_type in ('coding', 'interview')),
  event_type      text        not null,
  challenge_id    text,
  session_id      text,
  warning_count   int         not null default 0,
  is_disqualified boolean     not null default false,
  metadata        jsonb,
  created_at      timestamptz not null default now()
);

create index if not exists anti_cheat_events_user_id_idx    on public.anti_cheat_events (user_id);
create index if not exists anti_cheat_events_created_at_idx on public.anti_cheat_events (created_at desc);

alter table public.anti_cheat_events enable row level security;

-- Users may insert their own events
create policy "Users insert own anti_cheat_events"
  on public.anti_cheat_events for insert
  with check (auth.uid() = user_id);

-- Admin may read all events
create policy "Admin read anti_cheat_events"
  on public.anti_cheat_events for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );
