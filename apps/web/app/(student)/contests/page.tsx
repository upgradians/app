import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ContestsClient } from "./ContestsClient";

export const metadata: Metadata = { title: "Contests" };

export default async function ContestsPage() {
  const supabase = await createClient();

  const { data: contests } = await supabase
    .from("contests")
    .select("id,title,slug,description,difficulty,start_time,end_time,participant_count,prize_pool,is_active")
    .eq("is_active", true)
    .order("start_time", { ascending: false });

  return <ContestsClient contests={contests ?? []} />;
}
