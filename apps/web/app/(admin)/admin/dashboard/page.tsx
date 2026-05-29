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
  ]);

  const emailMap = new Map<string, string>(
    (authResult.data?.users ?? []).map(u => [u.id, u.email ?? ""])
  );

  const students: StudentRow[] = (profiles ?? []).map(p => ({
    id:             p.id,
    full_name:      p.full_name      ?? null,
    username:       p.username       ?? null,
    email:          emailMap.get(p.id) ?? null,
    created_at:     p.created_at     ?? null,
    qualification:  (p as Record<string, string | null>).qualification ?? null,
    college:        (p as Record<string, string | null>).college        ?? null,
    last_active_at: (p as Record<string, string | null>).last_active_at ?? null,
    role:           p.role           ?? null,
  }));

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
