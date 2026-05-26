import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ProfileClient } from "./ProfileClient";

export const metadata: Metadata = { title: "Profile" };

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user!.id)
    .single();

  if (!profile && user) {
    const username = user.email?.split("@")[0] ?? `user_${user.id.slice(0, 8)}`;
    const { data: created } = await supabase
      .from("profiles")
      .insert({
        id:          user.id,
        username,
        xp:          0,
        streak_days: 0,
        role:        "student",
        rank:        "Bronze Coder",
        created_at:  new Date().toISOString(),
        updated_at:  new Date().toISOString(),
      })
      .select()
      .single();
    profile = created;
  }

  return <ProfileClient profile={profile} email={user?.email ?? ""} userId={user?.id ?? ""} />;
}
