import type { Metadata } from "next";
import { createClient } from "../../../../lib/supabase/server";
import { AdminDashboardClient } from "./AdminDashboardClient";
import React from "react";

export const metadata: Metadata = { title: "Admin Dashboard" };

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [
    { count: userCount },
    { count: challengeCount },
    { count: submissionCount },
    { count: contestCount },
    { count: interviewCount },
    { data: recentUsers },
    { data: topUsers },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("challenges").select("*", { count: "exact", head: true }),
    supabase.from("submissions").select("*", { count: "exact", head: true }),
    supabase.from("contests").select("*", { count: "exact", head: true }),
    supabase.from("interview_sessions").select("*", { count: "exact", head: true }),
    supabase
      .from("profiles")
      .select("id,full_name,username,total_xp,rank,role,created_at,streak_days")
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("profiles")
      .select("id,full_name,username,total_xp,rank,challenges_solved,streak_days")
      .order("total_xp", { ascending: false })
      .limit(5),
  ]);

  // Streak count (users with streak > 0)
  const { count: streakCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .gt("streak_days", 0);

  return (
    <AdminDashboardClient
      stats={{
        users:        userCount       ?? 0,
        challenges:   challengeCount  ?? 0,
        submissions:  submissionCount ?? 0,
        contests:     contestCount    ?? 0,
        interviews:   interviewCount  ?? 0,
        activeStreaks: streakCount    ?? 0,
      }}
      recentUsers={(recentUsers ?? []).map(u => ({ ...u, xp: u.total_xp }))}
      topUsers={(topUsers ?? []).map(u => ({ ...u, xp: u.total_xp }))}
    />
  );
}
