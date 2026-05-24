import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { TracksClient } from "./TracksClient";

export const metadata: Metadata = { title: "Skill Tracks" };

export default async function TracksPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: tracks } = await supabase
    .from("skill_tracks")
    .select("id,title,description,icon,difficulty,total_challenges,xp_reward,tags,is_active")
    .eq("is_active", true)
    .order("created_at", { ascending: true });

  const { data: progress } = user ? await supabase
    .from("user_track_progress")
    .select("track_id,completed_challenges,completed_at,xp_earned")
    .eq("user_id", user.id) : { data: null };

  return <TracksClient tracks={tracks ?? []} progress={progress ?? []} />;
}
