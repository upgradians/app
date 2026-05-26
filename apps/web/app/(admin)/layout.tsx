import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminShell } from "@/components/layout/AdminShell";

const ADMIN_UID = "c57b661e-eec0-4926-a7bd-88209e45979b";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name, username, avatar_url")
    .eq("id", user.id)
    .single();

  const isAdmin = user.id === ADMIN_UID || profile?.role === "admin";
  if (!isAdmin) redirect("/");

  return (
    <AdminShell adminName={profile?.full_name ?? profile?.username ?? "Admin"}>
      {children}
    </AdminShell>
  );
}
