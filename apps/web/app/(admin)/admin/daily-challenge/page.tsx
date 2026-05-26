import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { DailyChallengeAdmin } from "./DailyChallengeAdmin";
import { SEED_CHALLENGES } from "@/lib/challenges-seed";

export const metadata: Metadata = { title: "Admin – Daily Challenge" };

export default async function AdminDailyChallengePage() {
  const supabase = await createClient();

  const [{ data: scheduled }, { data: dbChallenges }] = await Promise.all([
    supabase
      .from("daily_challenges")
      .select("id,challenge_id,challenge_date,xp_multiplier,bonus_xp")
      .order("challenge_date", { ascending: false })
      .limit(30),
    supabase
      .from("challenges")
      .select("id,title,slug,difficulty")
      .eq("is_active", true)
      .order("title"),
  ]);

  const seeds = SEED_CHALLENGES.map(c => ({ id: c.id, title: c.title, slug: c.slug, difficulty: c.difficulty }));

  return (
    <DailyChallengeAdmin
      scheduled={scheduled ?? []}
      dbChallenges={dbChallenges ?? []}
      seedChallenges={seeds}
    />
  );
}
