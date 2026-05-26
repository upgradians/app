// ─── Enums ────────────────────────────────────────────────────────────────────

export type UserRole = "student" | "recruiter" | "admin";
export type Difficulty = "easy" | "medium" | "hard";
export type SubmissionStatus =
  | "pending" | "accepted"
  | "wrong_answer" | "timeout" | "time_limit"   // time_limit kept for legacy records
  | "runtime_error" | "compile_error";
export type ContestStatus = "upcoming" | "live" | "ended";
export type MissionStatus = "pending" | "in_review" | "approved" | "rejected";
export type GalaxyRank =
  | "Bronze Coder" | "Silver Developer"
  | "Gold Engineer" | "Cosmic Master";

// ─── Core Models ──────────────────────────────────────────────────────────────

export interface Profile {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  college: string | null;
  role: UserRole;
  total_xp: number;
  rank: GalaxyRank;
  streak_days: number;
  last_active_at: string | null;
  github_url: string | null;
  linkedin_url: string | null;
  created_at: string;
  updated_at: string;
  // Extended onboarding fields
  phone_number?: string | null;
  address?: string | null;
  nationality?: string | null;
  qualification?: string | null;
  experience_level?: string | null;
  challenges_solved?: number;
  contests_won?: number;
  missions_done?: number;
  last_streak_date?: string | null;
  solved_seed_ids?: string[];
}

export interface Challenge {
  id: string;
  title: string;
  slug: string;
  description: string;
  difficulty: Difficulty;
  language: string;
  xp_reward: number;
  time_limit_ms: number;
  memory_limit_mb: number;
  starter_code: string | null;
  test_cases: TestCase[];
  tags: string[];
  is_active: boolean;
  created_at: string;
  // computed
  solved_by?: number;
  acceptance_rate?: number;
  user_solved?: boolean;
}

export interface TestCase {
  input: string;
  expected_output: string;
  is_hidden: boolean;
}

export interface Submission {
  id: string;
  user_id: string;
  challenge_id: string;
  code: string;
  language: string;
  status: SubmissionStatus;
  runtime_ms: number | null;
  memory_mb: number | null;
  xp_earned: number;
  submitted_at: string;
  // relations
  profile?: Pick<Profile, "username" | "avatar_url">;
  challenge?: Pick<Challenge, "title" | "slug" | "difficulty">;
}

export interface Contest {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  start_time: string;
  end_time: string;
  status: ContestStatus;
  prize_pool: PrizePool | null;
  max_participants: number | null;
  created_by: string;
  created_at: string;
  // computed
  participant_count?: number;
  challenges?: Challenge[];
  user_registered?: boolean;
}

export interface PrizePool {
  first: string;
  second?: string;
  third?: string;
  xp_bonus: number;
  has_internship?: boolean;
}

export interface ContestParticipant {
  contest_id: string;
  user_id: string;
  score: number;
  rank: number | null;
  joined_at: string;
  profile?: Pick<Profile, "username" | "full_name" | "avatar_url" | "college">;
}

export interface XPTransaction {
  id: string;
  user_id: string;
  amount: number;
  reason: string;
  reference_id: string | null;
  reference_type: string | null;
  created_at: string;
}

export interface Achievement {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  icon: string;
  xp_reward: number;
  condition_type: string | null;
  condition_value: number | null;
}

export interface UserAchievement {
  user_id: string;
  achievement_id: string;
  earned_at: string;
  achievement?: Achievement;
}

export interface Mission {
  id: string;
  title: string;
  description: string | null;
  tech_stack: string[];
  difficulty: Difficulty;
  duration_weeks: number;
  xp_reward: number;
  is_live: boolean;
  created_at: string;
}

export interface MissionSubmission {
  id: string;
  mission_id: string;
  user_id: string;
  repo_url: string | null;
  demo_url: string | null;
  status: MissionStatus;
  feedback: string | null;
  submitted_at: string;
}

export interface SkillTrack {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string;
  challenges: string[];
  estimated_weeks: number;
}

export interface UserTrackProgress {
  user_id: string;
  track_id: string;
  completed_challenges: number;
  total_challenges: number;
  started_at: string;
  updated_at: string;
  track?: SkillTrack;
  completion_pct?: number;
}

export interface InterviewSession {
  id: string;
  user_id: string;
  domain: string;
  questions: InterviewQuestion[];
  answers: InterviewAnswer[];
  scores: InterviewScores | null;
  overall_score: number | null;
  feedback: string | null;
  status: "pending" | "in_progress" | "completed";
  created_at: string;
  completed_at: string | null;
}

export interface InterviewQuestion {
  id: string;
  type: "behavioral" | "technical" | "coding";
  question: string;
  context?: string;
}

export interface InterviewAnswer {
  question_id: string;
  answer: string;
  duration_seconds: number;
}

export interface InterviewScores {
  communication: number;
  technical_depth: number;
  problem_solving: number;
  confidence: number;
  overall: number;
}

export interface Recruiter {
  id: string;
  company_name: string | null;
  company_size: string | null;
  industry: string | null;
  website: string | null;
  verified: boolean;
  profile?: Profile;
}

export interface JobPosting {
  id: string;
  recruiter_id: string;
  title: string;
  description: string | null;
  requirements: string[];
  tech_stack: string[];
  location: string | null;
  salary_range: string | null;
  is_active: boolean;
  created_at: string;
  recruiter?: Recruiter;
  application_count?: number;
}

export interface Application {
  id: string;
  job_id: string;
  user_id: string;
  status: "pending" | "reviewed" | "shortlisted" | "rejected" | "offered";
  coding_score: number | null;
  ai_rank: number | null;
  applied_at: string;
  profile?: Profile;
  job?: JobPosting;
}

// ─── Leaderboard ──────────────────────────────────────────────────────────────

export interface LeaderboardEntry {
  position?: number;
  user_id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  college: string | null;
  total_xp: number;
  rank: GalaxyRank;
  challenges_solved: number;
  streak_days: number;
}

export type LeaderboardFilter = "weekly" | "monthly" | "alltime" | "college" | "internship";

// ─── API Response Shapes ──────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  error: null;
}

export interface ApiError {
  data: null;
  error: {
    message: string;
    code?: string;
    status?: number;
  };
}

export type ApiResult<T> = ApiResponse<T> | ApiError;

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  has_more: boolean;
}

// ─── XP / Gamification ───────────────────────────────────────────────────────

export const XP_THRESHOLDS: Record<GalaxyRank, number> = {
  "Bronze Coder":    0,
  "Silver Developer": 1000,
  "Gold Engineer":   5000,
  "Cosmic Master":   10000,
};

export const RANK_COLORS: Record<GalaxyRank, string> = {
  "Bronze Coder":     "#cd7f32",
  "Silver Developer": "#9ca3af",
  "Gold Engineer":    "#d97706",
  "Cosmic Master":    "#c084fc",
};

export function getRankFromXP(xp: number): GalaxyRank {
  if (xp >= 10000) return "Cosmic Master";
  if (xp >= 5000)  return "Gold Engineer";
  if (xp >= 1000)  return "Silver Developer";
  return "Bronze Coder";
}

export function getNextRankXP(xp: number): { next: GalaxyRank | null; needed: number; progress: number } {
  if (xp >= 10000) return { next: null, needed: 0, progress: 100 };
  if (xp >= 5000)  return { next: "Cosmic Master",    needed: 10000 - xp, progress: ((xp - 5000) / 5000) * 100 };
  if (xp >= 1000)  return { next: "Gold Engineer",    needed: 5000 - xp,  progress: ((xp - 1000) / 4000) * 100 };
  return                  { next: "Silver Developer", needed: 1000 - xp,  progress: (xp / 1000) * 100 };
}

// ─── Code Languages ───────────────────────────────────────────────────────────

// Languages supported by the Piston execution engine.
// ID values must match keys in PISTON_LANGS in apps/web/lib/piston.ts.
export const SUPPORTED_LANGUAGES = [
  { id: "python",     label: "Python",     icon: "🐍" },
  { id: "javascript", label: "JavaScript", icon: "⚡" },
  { id: "typescript", label: "TypeScript", icon: "🔷" },
  { id: "java",       label: "Java",       icon: "☕" },
  { id: "cpp",        label: "C++",        icon: "⚙️" },
  { id: "c",          label: "C",          icon: "🔧" },
  { id: "go",         label: "Go",         icon: "🔵" },
  { id: "rust",       label: "Rust",       icon: "🦀" },
  { id: "csharp",     label: "C#",         icon: "💜" },
  { id: "kotlin",     label: "Kotlin",     icon: "🟣" },
] as const;

export type SupportedLanguageId = (typeof SUPPORTED_LANGUAGES)[number]["id"];
