import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { RecruiterDashboardClient } from "./RecruiterDashboardClient";

export const metadata: Metadata = { title: "Recruiter Dashboard" };

export default async function RecruiterDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: recruiter } = await supabase
    .from("recruiters")
    .select("*")
    .eq("user_id", user!.id)
    .single();

  const [
    { data: candidates },
    { data: jobs },
    { data: recentApps },
  ] = await Promise.all([
    supabase.from("profiles").select("id,full_name,username,total_xp,rank,challenges_solved").order("total_xp", { ascending: false }).limit(10),
    supabase.from("job_postings").select("id,title,location,applications_count").eq("recruiter_id", recruiter?.id).eq("is_active", true),
    supabase.from("applications").select("id,status,applied_at,profiles(full_name,username,total_xp),job_postings(title)").eq("recruiter_id", recruiter?.id).order("applied_at", { ascending: false }).limit(10),
  ]);

  return (
    <RecruiterDashboardClient
      recruiter={recruiter}
      topCandidates={candidates ?? []}
      jobs={jobs ?? []}
      recentApplications={recentApps ?? []}
    />
  );
}
