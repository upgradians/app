import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { LeaderboardClient } from "./LeaderboardClient";

export const metadata: Metadata = { title: "Leaderboard" };

export default async function LeaderboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const ADMIN_ID = "c57b661e-eec0-4926-a7bd-88209e45979b";

  const { data: entries } = await supabase
    .from("profiles")
    .select("id,username,full_name,total_xp,rank,challenges_solved,streak_days,avatar_url,last_active_at")
    .neq("role", "admin")        // exclude all admin accounts
    .neq("id", ADMIN_ID)         // belt-and-suspenders UID exclusion
    .eq("is_banned", false)      // exclude banned users
    .gte("total_xp", 0)          // guard against negative XP anomalies
    .order("total_xp", { ascending: false })
    .limit(100);

  // Remap id → user_id for LeaderboardEntry compatibility
  const mapped = (entries ?? []).map(e => ({ ...e, user_id: e.id }));

  return <LeaderboardClient entries={mapped} currentUserId={user?.id} />;
}
