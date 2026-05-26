import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { SEED_CHALLENGES } from "@/lib/challenges-seed";
import { DashboardClient } from "./DashboardClient";
import type { Challenge } from "@upgradian/types";

export const metadata: Metadata = { title: "Dashboard" };

async function fetchDailyChallenge(supabase: Awaited<ReturnType<typeof createClient>>): Promise<{
  challenge: Challenge;
  xp_multiplier: number;
  bonus_xp: number;
}> {
  const todayUTC = new Date().toISOString().slice(0, 10);

  const { data: scheduled } = await supabase
    .from("daily_challenges")
    .select("challenge_id,xp_multiplier,bonus_xp")
    .eq("challenge_date", todayUTC)
    .maybeSingle();

  if (scheduled) {
    const cid = scheduled.challenge_id;
    if (cid.startsWith("seed-")) {
      const seed = SEED_CHALLENGES.find(c => c.id === cid);
      if (seed) return { challenge: seed, xp_multiplier: Number(scheduled.xp_multiplier ?? 2), bonus_xp: scheduled.bonus_xp ?? 0 };
    }
    const { data: ch } = await supabase
      .from("challenges")
      .select("id,title,slug,difficulty,xp_reward,description,language,tags,is_active,created_at,time_limit_ms,memory_limit_mb,starter_code,test_cases")
      .eq("id", cid)
      .maybeSingle();
    if (ch) return { challenge: ch as Challenge, xp_multiplier: Number(scheduled.xp_multiplier ?? 2), bonus_xp: scheduled.bonus_xp ?? 0 };
  }

  // Fallback rotation
  const start     = new Date(new Date().getFullYear(), 0, 0);
  const dayOfYear = Math.floor((Date.now() - start.getTime()) / 86_400_000);
  return {
    challenge:     SEED_CHALLENGES[dayOfYear % SEED_CHALLENGES.length],
    xp_multiplier: 2,
    bonus_xp:      0,
  };
}

export default async function DashboardPage() {
  const supabase = await createClient();

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return <DashboardClient profile={null} recentSubmissions={[]} topPlayers={[]} dailyChallenge={null} />;

    const [profileRes, recentRes, topRes, daily] = await Promise.all([
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
        .neq("role", "admin")
        .eq("is_banned", false)
        .order("total_xp", { ascending: false })
        .limit(5),
      fetchDailyChallenge(supabase),
    ]);

    return (
      <DashboardClient
        profile={profileRes.data ?? null}
        recentSubmissions={Array.isArray(recentRes.data) ? recentRes.data : []}
        topPlayers={Array.isArray(topRes.data) ? topRes.data : []}
        dailyChallenge={daily}
      />
    );
  } catch {
    return <DashboardClient profile={null} recentSubmissions={[]} topPlayers={[]} dailyChallenge={null} />;
  }
}
