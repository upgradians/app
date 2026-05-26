import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { DashboardClient } from "./DashboardClient";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const supabase = await createClient();

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return <DashboardClient profile={null} recentSubmissions={[]} topPlayers={[]} />;

    const [profileRes, recentRes, topRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase
        .from("submissions")
        .select("*, challenge:challenges(title,difficulty,slug)")
        .eq("user_id", user.id)
        .order("submitted_at", { ascending: false })
        .limit(5),
      supabase
        .from("profiles")
        .select("username,full_name,total_xp,rank,avatar_url")
        .order("total_xp", { ascending: false })
        .limit(5),
    ]);

    return (
      <DashboardClient
        profile={profileRes.data ?? null}
        recentSubmissions={Array.isArray(recentRes.data) ? recentRes.data : []}
        topPlayers={Array.isArray(topRes.data) ? topRes.data : []}
      />
    );
  } catch {
    return <DashboardClient profile={null} recentSubmissions={[]} topPlayers={[]} />;
  }
}
