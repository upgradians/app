import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { SEED_CHALLENGES } from "@/lib/challenges-seed";

export const revalidate = 3600; // cache 1 hour

export async function GET() {
  const supabase = await createClient();
  const todayUTC = new Date().toISOString().slice(0, 10);

  // Try DB-scheduled daily challenge first
  const { data: scheduled } = await supabase
    .from("daily_challenges")
    .select("challenge_id,xp_multiplier,bonus_xp")
    .eq("challenge_date", todayUTC)
    .maybeSingle();

  if (scheduled) {
    const cid = scheduled.challenge_id;

    // Seed challenge?
    if (cid.startsWith("seed-")) {
      const seed = SEED_CHALLENGES.find(c => c.id === cid);
      if (seed) {
        return NextResponse.json({
          challenge: seed,
          xp_multiplier: Number(scheduled.xp_multiplier ?? 2),
          bonus_xp: scheduled.bonus_xp ?? 0,
          source: "scheduled",
        });
      }
    }

    // DB challenge
    const { data: ch } = await supabase
      .from("challenges")
      .select("id,title,slug,difficulty,xp_reward,description,language,tags")
      .eq("id", cid)
      .maybeSingle();

    if (ch) {
      return NextResponse.json({
        challenge: ch,
        xp_multiplier: Number(scheduled.xp_multiplier ?? 2),
        bonus_xp: scheduled.bonus_xp ?? 0,
        source: "scheduled",
      });
    }
  }

  // Fallback: rotate seed challenges by day of year
  const start     = new Date(new Date().getFullYear(), 0, 0);
  const dayOfYear = Math.floor((Date.now() - start.getTime()) / 86_400_000);
  const challenge = SEED_CHALLENGES[dayOfYear % SEED_CHALLENGES.length];

  return NextResponse.json({
    challenge,
    xp_multiplier: 2,
    bonus_xp: 0,
    source: "rotation",
  });
}
