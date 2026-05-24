import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { InternshipsClient } from "./InternshipsClient";

export const metadata: Metadata = { title: "Internship Missions" };

export default async function InternshipsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: missions } = await supabase
    .from("missions")
    .select("id,title,description,difficulty,xp_reward,tags,company_name,company_logo,deadline,is_active,submission_count")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  const { data: mySubmissions } = user ? await supabase
    .from("mission_submissions")
    .select("mission_id,status")
    .eq("user_id", user.id) : { data: null };

  return <InternshipsClient missions={missions ?? []} mySubmissions={mySubmissions ?? []} />;
}
