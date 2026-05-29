-- ============================================================
-- ASSESSMENT RESULTS
-- ============================================================

create table if not exists public.assessment_results (
  id               uuid         primary key default gen_random_uuid(),
  user_id          uuid         not null references public.profiles(id) on delete cascade,
  track            text         not null,
  score            int          not null default 0,
  total_questions  int          not null,
  percentage       numeric(5,2) not null default 0,
  status           text         not null default 'completed'
                                check (status in ('completed', 'disqualified')),
  tab_switches     int          not null default 0,
  noise_violations int          not null default 0,
  time_taken_secs  int,
  completed_at     timestamptz  not null default now()
);

create index if not exists idx_assessment_user_id   on public.assessment_results (user_id);
create index if not exists idx_assessment_completed on public.assessment_results (completed_at desc);
create index if not exists idx_assessment_status    on public.assessment_results (status);

alter table public.assessment_results enable row level security;

drop policy if exists "Users read own assessment results"   on public.assessment_results;
drop policy if exists "Users insert own assessment results" on public.assessment_results;
drop policy if exists "Admin read all assessment results"  on public.assessment_results;

create policy "Users read own assessment results"
  on public.assessment_results for select
  using (auth.uid() = user_id);

create policy "Users insert own assessment results"
  on public.assessment_results for insert
  with check (auth.uid() = user_id);

create policy "Admin read all assessment results"
  on public.assessment_results for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );
