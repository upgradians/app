import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { LeaderboardClient } from "./LeaderboardClient";

export const metadata: Metadata = { title: "Leaderboard" };

export default async function LeaderboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: entries } = await supabase
    .from("leaderboard")
    .select("user_id,username,total_xp,rank,challenges_solved,streak_days,avatar_url")
    .order("total_xp", { ascending: false })
    .limit(50);

  return <LeaderboardClient entries={entries ?? []} currentUserId={user?.id} />;
}
