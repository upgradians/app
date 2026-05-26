import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

const ADMIN_ID = "c57b661e-eec0-4926-a7bd-88209e45979b";

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.id !== ADMIN_ID) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: { userId?: string; action?: string };
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { userId, action } = body;
  if (!userId || !action) {
    return NextResponse.json({ error: "Missing userId or action" }, { status: 400 });
  }
  if (userId === ADMIN_ID) {
    return NextResponse.json({ error: "Cannot modify admin account" }, { status: 400 });
  }

  const admin = await createAdminClient();

  switch (action) {
    case "ban":
      await Promise.all([
        admin.auth.admin.updateUserById(userId, { ban_duration: "87600h" }),
        admin.from("profiles").update({ is_banned: true }).eq("id", userId),
      ]);
      break;

    case "unban":
      await Promise.all([
        admin.auth.admin.updateUserById(userId, { ban_duration: "none" }),
        admin.from("profiles").update({ is_banned: false }).eq("id", userId),
      ]);
      break;

    case "reset_xp":
      await admin.from("profiles").update({ total_xp: 0, rank: "Bronze Coder" }).eq("id", userId);
      break;

    case "reset_streak":
      await admin.from("profiles").update({ streak_days: 0, last_streak_date: null }).eq("id", userId);
      break;

    default:
      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
