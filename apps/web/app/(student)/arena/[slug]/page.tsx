import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { SEED_CHALLENGES } from "@/lib/challenges-seed";
import { ChallengeEditor } from "./ChallengeEditor";

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase  = await createClient();
  const { data }  = await supabase.from("challenges").select("title").eq("slug", slug).single();
  const seed      = SEED_CHALLENGES.find(c => c.slug === slug);
  return { title: data?.title ?? seed?.title ?? "Challenge" };
}

export default async function ChallengePage({ params }: Props) {
  const { slug } = await params;
  const supabase  = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: dbChallenge } = await supabase
    .from("challenges")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  const challenge = dbChallenge ?? SEED_CHALLENGES.find(c => c.slug === slug) ?? null;
  if (!challenge) notFound();

  const isStaticChallenge = !dbChallenge;

  let userSubmissions: { id: string; status: import("@upgradian/types").SubmissionStatus; runtime_ms: number | null; xp_earned: number; submitted_at: string }[] = [];
  if (!isStaticChallenge && user) {
    const { data } = await supabase
      .from("submissions")
      .select("id,status,runtime_ms,xp_earned,submitted_at")
      .eq("challenge_id", challenge.id)
      .eq("user_id", user.id)
      .order("submitted_at", { ascending: false })
      .limit(10);
    userSubmissions = data ?? [];
  }

  return (
    <ChallengeEditor
      challenge={challenge}
      submissions={userSubmissions}
    />
  );
}
