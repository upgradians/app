-- ============================================================
-- UPGRADIAN INITIAL SCHEMA
-- ============================================================

-- Enable extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";

-- ============================================================
-- PROFILES (extends auth.users)
-- ============================================================
create table public.profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  username        text unique not null,
  full_name       text,
  avatar_url      text,
  bio             text,
  college         text,
  graduation_year int,
  github_url      text,
  linkedin_url    text,
  role            text not null default 'student' check (role in ('student','recruiter','admin')),
  total_xp        int  not null default 0,
  rank            text not null default 'Bronze Coder' check (rank in ('Bronze Coder','Silver Developer','Gold Engineer','Cosmic Master')),
  streak_days     int  not null default 0,
  last_active_at  timestamptz,
  challenges_solved int not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index profiles_total_xp_idx on public.profiles(total_xp desc);
create index profiles_username_trgm on public.profiles using gin(username gin_trgm_ops);

-- ============================================================
-- CHALLENGES
-- ============================================================
create table public.challenges (
  id              uuid primary key default uuid_generate_v4(),
  slug            text unique not null,
  title           text not null,
  description     text not null,
  difficulty      text not null check (difficulty in ('easy','medium','hard')),
  language        text not null,
  starter_code    text,
  solution_code   text,
  xp_reward       int  not null default 50,
  time_limit_ms   int  not null default 2000,
  memory_limit_mb int  not null default 256,
  tags            text[] not null default '{}',
  is_active       bool not null default true,
  solved_by       int  not null default 0,
  acceptance_rate numeric(5,2),
  created_by      uuid references public.profiles(id),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index challenges_difficulty_idx on public.challenges(difficulty);
create index challenges_language_idx   on public.challenges(language);
create index challenges_slug_idx       on public.challenges(slug);
create index challenges_title_trgm     on public.challenges using gin(title gin_trgm_ops);

-- ============================================================
-- TEST CASES
-- ============================================================
create table public.test_cases (
  id              uuid primary key default uuid_generate_v4(),
  challenge_id    uuid not null references public.challenges(id) on delete cascade,
  input           text not null,
  expected_output text not null,
  is_hidden       bool not null default false,
  order_index     int  not null default 0
);

create index test_cases_challenge_idx on public.test_cases(challenge_id);

-- ============================================================
-- SUBMISSIONS
-- ============================================================
create table public.submissions (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  challenge_id  uuid not null references public.challenges(id) on delete cascade,
  code          text not null,
  language      text not null,
  status        text not null default 'pending' check (status in ('pending','accepted','wrong_answer','time_limit_exceeded','memory_limit_exceeded','runtime_error','compile_error')),
  runtime_ms    int,
  memory_mb     numeric(10,2),
  xp_earned     int  not null default 0,
  submitted_at  timestamptz not null default now()
);

create index submissions_user_idx      on public.submissions(user_id);
create index submissions_challenge_idx on public.submissions(challenge_id);
create index submissions_status_idx    on public.submissions(status);

-- ============================================================
-- CONTESTS
-- ============================================================
create table public.contests (
  id                uuid primary key default uuid_generate_v4(),
  slug              text unique not null,
  title             text not null,
  description       text,
  difficulty        text not null default 'medium' check (difficulty in ('easy','medium','hard')),
  start_time        timestamptz not null,
  end_time          timestamptz not null,
  is_active         bool not null default true,
  participant_count int  not null default 0,
  prize_pool        jsonb,
  created_by        uuid references public.profiles(id),
  created_at        timestamptz not null default now()
);

create table public.contest_challenges (
  contest_id   uuid not null references public.contests(id) on delete cascade,
  challenge_id uuid not null references public.challenges(id) on delete cascade,
  points       int  not null default 100,
  primary key (contest_id, challenge_id)
);

create table public.contest_participants (
  contest_id  uuid not null references public.contests(id) on delete cascade,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  score       int  not null default 0,
  rank        int,
  joined_at   timestamptz not null default now(),
  primary key (contest_id, user_id)
);

-- ============================================================
-- XP TRANSACTIONS
-- ============================================================
create table public.xp_transactions (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  amount       int  not null,
  source       text not null,
  reference_id uuid,
  created_at   timestamptz not null default now()
);

create index xp_transactions_user_idx on public.xp_transactions(user_id);

-- ============================================================
-- ACHIEVEMENTS
-- ============================================================
create table public.achievements (
  id          uuid primary key default uuid_generate_v4(),
  slug        text unique not null,
  title       text not null,
  description text not null,
  icon        text not null,
  xp_reward   int  not null default 0,
  condition   jsonb
);

create table public.user_achievements (
  user_id        uuid not null references public.profiles(id) on delete cascade,
  achievement_id uuid not null references public.achievements(id) on delete cascade,
  earned_at      timestamptz not null default now(),
  primary key (user_id, achievement_id)
);

-- ============================================================
-- MISSIONS (Internships)
-- ============================================================
create table public.missions (
  id               uuid primary key default uuid_generate_v4(),
  title            text not null,
  description      text not null,
  difficulty       text not null check (difficulty in ('easy','medium','hard')),
  xp_reward        int  not null default 100,
  tags             text[] not null default '{}',
  company_name     text,
  company_logo     text,
  deadline         timestamptz,
  is_active        bool not null default true,
  submission_count int  not null default 0,
  created_at       timestamptz not null default now()
);

create table public.mission_submissions (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  mission_id  uuid not null references public.missions(id) on delete cascade,
  content     text not null,
  repo_url    text,
  status      text not null default 'pending' check (status in ('pending','accepted','rejected','under_review')),
  feedback    text,
  xp_earned   int  not null default 0,
  submitted_at timestamptz not null default now()
);

-- ============================================================
-- SKILL TRACKS
-- ============================================================
create table public.skill_tracks (
  id                uuid primary key default uuid_generate_v4(),
  title             text not null,
  description       text,
  icon              text,
  difficulty        text not null check (difficulty in ('easy','medium','hard')),
  total_challenges  int  not null default 0,
  xp_reward         int  not null default 500,
  tags              text[] not null default '{}',
  is_active         bool not null default true,
  created_at        timestamptz not null default now()
);

create table public.track_challenges (
  track_id     uuid not null references public.skill_tracks(id) on delete cascade,
  challenge_id uuid not null references public.challenges(id) on delete cascade,
  order_index  int  not null default 0,
  primary key (track_id, challenge_id)
);

create table public.user_track_progress (
  user_id               uuid not null references public.profiles(id) on delete cascade,
  track_id              uuid not null references public.skill_tracks(id) on delete cascade,
  completed_challenges  int  not null default 0,
  xp_earned             int  not null default 0,
  started_at            timestamptz not null default now(),
  completed_at          timestamptz,
  primary key (user_id, track_id)
);

-- ============================================================
-- INTERVIEW SESSIONS
-- ============================================================
create table public.interview_sessions (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  role         text not null,
  level        text not null check (level in ('junior','mid','senior')),
  status       text not null default 'in_progress' check (status in ('in_progress','completed')),
  score        int,
  feedback     text,
  created_at   timestamptz not null default now(),
  completed_at timestamptz
);

create table public.interview_questions (
  id           uuid primary key default uuid_generate_v4(),
  session_id   uuid not null references public.interview_sessions(id) on delete cascade,
  question     text not null,
  type         text not null check (type in ('technical','behavioral','coding')),
  difficulty   text not null,
  answer       text,
  score        int,
  order_index  int  not null default 0
);

-- ============================================================
-- RECRUITERS
-- ============================================================
create table public.recruiters (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid unique not null references public.profiles(id) on delete cascade,
  company_name  text not null,
  company_logo  text,
  company_size  text,
  industry      text,
  website       text,
  is_verified   bool not null default false,
  created_at    timestamptz not null default now()
);

create table public.job_postings (
  id                  uuid primary key default uuid_generate_v4(),
  recruiter_id        uuid not null references public.recruiters(id) on delete cascade,
  title               text not null,
  description         text not null,
  location            text,
  salary_range        text,
  skills_required     text[] not null default '{}',
  min_xp_required     int   not null default 0,
  is_active           bool  not null default true,
  applications_count  int   not null default 0,
  created_at          timestamptz not null default now()
);

create table public.applications (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  recruiter_id uuid not null references public.recruiters(id) on delete cascade,
  job_id       uuid not null references public.job_postings(id) on delete cascade,
  status       text not null default 'pending' check (status in ('pending','shortlisted','rejected','hired')),
  cover_letter text,
  applied_at   timestamptz not null default now()
);

-- ============================================================
-- LEADERBOARD VIEW
-- ============================================================
create or replace view public.leaderboard as
  select
    p.id         as user_id,
    p.username,
    p.full_name,
    p.avatar_url,
    p.total_xp,
    p.rank,
    p.challenges_solved,
    p.streak_days,
    row_number() over (order by p.total_xp desc) as position
  from public.profiles p
  where p.role = 'student'
  order by p.total_xp desc;

-- ============================================================
-- FUNCTIONS
-- ============================================================

-- Add XP and update rank automatically
create or replace function public.add_xp_to_profile(p_user_id uuid, p_xp int)
returns void language plpgsql security definer as $$
declare
  v_new_xp int;
  v_new_rank text;
begin
  update public.profiles set total_xp = total_xp + p_xp where id = p_user_id
  returning total_xp into v_new_xp;

  v_new_rank := case
    when v_new_xp >= 10000 then 'Cosmic Master'
    when v_new_xp >= 5000  then 'Gold Engineer'
    when v_new_xp >= 1000  then 'Silver Developer'
    else 'Bronze Coder'
  end;

  update public.profiles set rank = v_new_rank where id = p_user_id;

  insert into public.xp_transactions (user_id, amount, source)
  values (p_user_id, p_xp, 'submission');
end;
$$;

-- Auto-update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at   before update on public.profiles   for each row execute function public.handle_updated_at();
create trigger challenges_updated_at before update on public.challenges for each row execute function public.handle_updated_at();

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, username, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
