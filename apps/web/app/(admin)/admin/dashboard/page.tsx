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
    { data: recentUsers },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("challenges").select("*", { count: "exact", head: true }),
    supabase.from("submissions").select("*", { count: "exact", head: true }),
    supabase.from("contests").select("*", { count: "exact", head: true }),
    supabase
      .from("profiles")
      .select("id,full_name,username,xp,rank,created_at")
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  return (
    <AdminDashboardClient
      stats={{
        users:       userCount       ?? 0,
        challenges:  challengeCount  ?? 0,
        submissions: submissionCount ?? 0,
        contests:    contestCount    ?? 0,
      }}
      recentUsers={recentUsers ?? []}
    />
  );
}
