import type { Metadata } from "next";
import { createClient, createAdminClient } from "../../../../lib/supabase/server";
import { AdminDashboardClient } from "./AdminDashboardClient";
import type { StudentRow } from "./AdminDashboardClient";

export const metadata: Metadata = { title: "Admin Dashboard" };

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const admin    = await createAdminClient();

  const [
    { count: userCount       },
    { count: challengeCount  },
    { count: submissionCount },
    { count: contestCount    },
    { count: interviewCount  },
    { data:  profiles        },
    { count: streakCount     },
    authResult,
    { data: assessments },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("challenges").select("*", { count: "exact", head: true }),
    supabase.from("submissions").select("*", { count: "exact", head: true }),
    supabase.from("contests").select("*", { count: "exact", head: true }),
    supabase.from("interview_sessions").select("*", { count: "exact", head: true }),
    supabase
      .from("profiles")
      .select("id,full_name,username,qualification,college,last_active_at,role,created_at")
      .order("created_at", { ascending: false })
      .limit(500),
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .gt("streak_days", 0),
    admin.auth.admin.listUsers({ perPage: 1000 }),
    // Fetch latest assessment per user (ordered desc → first per user_id = latest)
    supabase
      .from("assessment_results")
      .select("user_id,track,score,total_questions,percentage,status,tab_switches,noise_violations")
      .order("completed_at", { ascending: false })
      .limit(1000),
  ]);

  const emailMap = new Map<string, string>(
    (authResult.data?.users ?? []).map(u => [u.id, u.email ?? ""])
  );

  // Build latest-assessment-per-user map (first occurrence = most recent)
  type AR = { user_id: string; track: string; score: number; total_questions: number; percentage: number; status: string; tab_switches: number; noise_violations: number };
  const assessmentMap = new Map<string, AR>();
  for (const a of (assessments ?? []) as AR[]) {
    if (!assessmentMap.has(a.user_id)) assessmentMap.set(a.user_id, a);
  }

  const students: StudentRow[] = (profiles ?? []).map(p => {
    const a = assessmentMap.get(p.id);
    const pr = p as Record<string, string | null>;
    return {
      id:             p.id,
      full_name:      p.full_name   ?? null,
      username:       p.username    ?? null,
      email:          emailMap.get(p.id) ?? null,
      created_at:     p.created_at  ?? null,
      qualification:  pr.qualification ?? null,
      college:        pr.college       ?? null,
      last_active_at: pr.last_active_at ?? null,
      role:           p.role        ?? null,
      assessment_track:            a?.track        ?? null,
      assessment_score:            a?.score        ?? null,
      assessment_total:            a?.total_questions ?? null,
      assessment_pct:              a ? Number(a.percentage) : null,
      assessment_status:           a ? (a.status as "completed" | "disqualified") : null,
      assessment_tab_switches:     a?.tab_switches     ?? null,
      assessment_noise_violations: a?.noise_violations ?? null,
    };
  });

  return (
    <AdminDashboardClient
      stats={{
        users:        userCount        ?? 0,
        challenges:   challengeCount   ?? 0,
        submissions:  submissionCount  ?? 0,
        contests:     contestCount     ?? 0,
        interviews:   interviewCount   ?? 0,
        activeStreaks: streakCount     ?? 0,
      }}
      students={students}
    />
  );
}
