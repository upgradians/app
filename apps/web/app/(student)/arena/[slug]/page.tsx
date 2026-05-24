import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ChallengeEditor } from "./ChallengeEditor";

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("challenges").select("title").eq("slug", slug).single();
  return { title: data?.title ?? "Challenge" };
}

export default async function ChallengePage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: challenge } = await supabase
    .from("challenges")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!challenge) notFound();

  const { data: userSubmissions } = await supabase
    .from("submissions")
    .select("id,status,runtime_ms,xp_earned,submitted_at")
    .eq("challenge_id", challenge.id)
    .eq("user_id", user!.id)
    .order("submitted_at", { ascending: false })
    .limit(10);

  return (
    <ChallengeEditor
      challenge={challenge}
      submissions={userSubmissions ?? []}
    />
  );
}
