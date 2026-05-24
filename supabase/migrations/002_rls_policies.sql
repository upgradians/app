-- ============================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================

-- Enable RLS on all tables
alter table public.profiles            enable row level security;
alter table public.challenges          enable row level security;
alter table public.test_cases          enable row level security;
alter table public.submissions         enable row level security;
alter table public.contests            enable row level security;
alter table public.contest_challenges  enable row level security;
alter table public.contest_participants enable row level security;
alter table public.xp_transactions     enable row level security;
alter table public.achievements        enable row level security;
alter table public.user_achievements   enable row level security;
alter table public.missions            enable row level security;
alter table public.mission_submissions enable row level security;
alter table public.skill_tracks        enable row level security;
alter table public.track_challenges    enable row level security;
alter table public.user_track_progress enable row level security;
alter table public.interview_sessions  enable row level security;
alter table public.interview_questions enable row level security;
alter table public.recruiters          enable row level security;
alter table public.job_postings        enable row level security;
alter table public.applications        enable row level security;

-- ── PROFILES ──
create policy "Profiles are publicly readable"
  on public.profiles for select using (true);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- ── CHALLENGES ──
create policy "Active challenges are public"
  on public.challenges for select using (is_active = true);

create policy "Admins can manage challenges"
  on public.challenges for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ── TEST CASES ──
create policy "Non-hidden test cases are public"
  on public.test_cases for select using (is_hidden = false);

create policy "Admins can manage test cases"
  on public.test_cases for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ── SUBMISSIONS ──
create policy "Users can read own submissions"
  on public.submissions for select using (auth.uid() = user_id);

create policy "Authenticated users can insert submissions"
  on public.submissions for insert with check (auth.uid() = user_id);

create policy "Admins can read all submissions"
  on public.submissions for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ── CONTESTS ──
create policy "Active contests are public"
  on public.contests for select using (is_active = true);

create policy "Admins can manage contests"
  on public.contests for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ── CONTEST CHALLENGES ──
create policy "Contest challenges are public"
  on public.contest_challenges for select using (true);

-- ── CONTEST PARTICIPANTS ──
create policy "Users can read contest participants"
  on public.contest_participants for select using (true);

create policy "Users can join contests"
  on public.contest_participants for insert with check (auth.uid() = user_id);

-- ── XP TRANSACTIONS ──
create policy "Users can read own XP transactions"
  on public.xp_transactions for select using (auth.uid() = user_id);

-- ── ACHIEVEMENTS ──
create policy "Achievements are publicly readable"
  on public.achievements for select using (true);

create policy "Admins can manage achievements"
  on public.achievements for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ── USER ACHIEVEMENTS ──
create policy "Users can read own achievements"
  on public.user_achievements for select using (auth.uid() = user_id);

create policy "All achievements visible on leaderboard"
  on public.user_achievements for select using (true);

-- ── MISSIONS ──
create policy "Active missions are public"
  on public.missions for select using (is_active = true);

create policy "Admins can manage missions"
  on public.missions for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ── MISSION SUBMISSIONS ──
create policy "Users can read own mission submissions"
  on public.mission_submissions for select using (auth.uid() = user_id);

create policy "Users can insert mission submissions"
  on public.mission_submissions for insert with check (auth.uid() = user_id);

create policy "Admins can manage mission submissions"
  on public.mission_submissions for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ── SKILL TRACKS ──
create policy "Active skill tracks are public"
  on public.skill_tracks for select using (is_active = true);

create policy "Admins can manage skill tracks"
  on public.skill_tracks for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ── TRACK CHALLENGES ──
create policy "Track challenges are public"
  on public.track_challenges for select using (true);

-- ── USER TRACK PROGRESS ──
create policy "Users can read own track progress"
  on public.user_track_progress for select using (auth.uid() = user_id);

create policy "Users can upsert own track progress"
  on public.user_track_progress for insert with check (auth.uid() = user_id);

create policy "Users can update own track progress"
  on public.user_track_progress for update using (auth.uid() = user_id);

-- ── INTERVIEW SESSIONS ──
create policy "Users can manage own interview sessions"
  on public.interview_sessions for all using (auth.uid() = user_id);

-- ── INTERVIEW QUESTIONS ──
create policy "Users can manage questions in own sessions"
  on public.interview_questions for all using (
    exists (select 1 from public.interview_sessions where id = session_id and user_id = auth.uid())
  );

-- ── RECRUITERS ──
create policy "Recruiters are publicly readable"
  on public.recruiters for select using (true);

create policy "Users can manage own recruiter profile"
  on public.recruiters for all using (auth.uid() = user_id);

-- ── JOB POSTINGS ──
create policy "Active job postings are public"
  on public.job_postings for select using (is_active = true);

create policy "Recruiters can manage own job postings"
  on public.job_postings for all using (
    exists (select 1 from public.recruiters where id = recruiter_id and user_id = auth.uid())
  );

-- ── APPLICATIONS ──
create policy "Users can manage own applications"
  on public.applications for all using (auth.uid() = user_id);

create policy "Recruiters can read applications for their jobs"
  on public.applications for select using (
    exists (select 1 from public.recruiters where id = recruiter_id and user_id = auth.uid())
  );
