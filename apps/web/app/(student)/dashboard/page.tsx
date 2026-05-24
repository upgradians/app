import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { DashboardClient } from "./DashboardClient";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [profileRes, recentRes, topRes] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user!.id).single(),
    supabase.from("submissions").select("*, challenge:challenges(title,difficulty,slug)")
      .eq("user_id", user!.id).order("submitted_at", { ascending: false }).limit(5),
    supabase.from("profiles").select("username,full_name,xp,rank,avatar_url")
      .order("xp", { ascending: false }).limit(5),
  ]);

  return (
    <DashboardClient
      profile={profileRes.data}
      recentSubmissions={recentRes.data ?? []}
      topPlayers={topRes.data ?? []}
    />
  );
}
