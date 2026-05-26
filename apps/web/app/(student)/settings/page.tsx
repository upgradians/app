import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { SettingsClient } from "./SettingsClient";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id,username,full_name")
    .eq("id", user!.id)
    .single();

  return (
    <SettingsClient
      userId={user?.id ?? ""}
      email={user?.email ?? ""}
      currentName={profile?.full_name ?? ""}
    />
  );
}
