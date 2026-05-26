import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export async function DELETE() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const admin = await createAdminClient();

    // Delete all submissions by user
    await admin.from("submissions").delete().eq("user_id", user.id);

    // Delete profile (cascade will handle related rows)
    await admin.from("profiles").delete().eq("id", user.id);

    // Delete the auth user — this is the final irreversible step
    const { error } = await admin.auth.admin.deleteUser(user.id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete account error:", err);
    return NextResponse.json({ error: "Failed to delete account." }, { status: 500 });
  }
}
