import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { SEED_CHALLENGES } from "@/lib/challenges-seed";
import { ArenaClient } from "./ArenaClient";

export const metadata: Metadata = { title: "Coding Arena" };

export default async function ArenaPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string; diff?: string; q?: string }>;
}) {
  const params   = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("challenges")
    .select("id,title,slug,difficulty,language,xp_reward,tags,is_active,solved_by,acceptance_rate")
    .eq("is_active", true)
    .order("difficulty", { ascending: true });

  if (params.lang) query = query.eq("language", params.lang);
  if (params.diff) query = query.eq("difficulty", params.diff);
  if (params.q)    query = query.ilike("title", `%${params.q}%`);

  const { data: dbChallenges } = await query;

  const challenges = dbChallenges && dbChallenges.length > 0 ? dbChallenges : SEED_CHALLENGES;

  return <ArenaClient challenges={challenges} />;
}
