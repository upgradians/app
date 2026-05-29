import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";

const ADMIN_ID = "c57b661e-eec0-4926-a7bd-88209e45979b";
const SCOPE    = "api/admin/participant";

async function writeModLog(
  admin: Awaited<ReturnType<typeof createAdminClient>>,
  adminId: string,
  targetId: string,
  action: string,
  reason?: string,
  metadata?: Record<string, unknown>,
) {
  try {
    await admin.from("moderation_logs").insert({
      admin_id:  adminId,
      target_id: targetId,
      action,
      reason:    reason    ?? null,
      metadata:  metadata  ?? null,
    });
  } catch (err) {
    logger.error(SCOPE, "moderation_log write failed", { err: String(err) });
  }
}

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.id !== ADMIN_ID) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: { userId?: string; action?: string; reason?: string };
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { userId, action, reason } = body;
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
      await writeModLog(admin, ADMIN_ID, userId, "ban", reason);
      break;

    case "unban":
      await Promise.all([
        admin.auth.admin.updateUserById(userId, { ban_duration: "none" }),
        admin.from("profiles").update({ is_banned: false }).eq("id", userId),
      ]);
      await writeModLog(admin, ADMIN_ID, userId, "unban", reason);
      break;

    case "warn": {
      const { data: prof } = await admin
        .from("profiles")
        .select("violation_count")
        .eq("id", userId)
        .single();
      const newCount = (prof?.violation_count ?? 0) + 1;
      await admin.from("profiles").update({
        violation_count:    newCount,
        suspicious_activity: newCount >= 3,
      }).eq("id", userId);
      await writeModLog(admin, ADMIN_ID, userId, "warn", reason, { violation_count: newCount });
      break;
    }

    case "clear_violations":
      await admin.from("profiles").update({
        violation_count:    0,
        suspicious_activity: false,
        temp_ban_until:     null,
      }).eq("id", userId);
      await writeModLog(admin, ADMIN_ID, userId, "clear_violations", reason);
      break;

    case "reset_xp":
      await admin.from("profiles").update({ total_xp: 0, rank: "Bronze Coder" }).eq("id", userId);
      await writeModLog(admin, ADMIN_ID, userId, "reset_xp", reason);
      break;

    case "reset_streak":
      await admin.from("profiles").update({ streak_days: 0, last_streak_date: null }).eq("id", userId);
      await writeModLog(admin, ADMIN_ID, userId, "reset_streak", reason);
      break;

    case "delete_account":
      await writeModLog(admin, ADMIN_ID, userId, "delete_account", reason);
      // Deletes the auth.users row; profiles cascades via FK on delete cascade
      await admin.auth.admin.deleteUser(userId);
      break;

    default:
      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }

  logger.info(SCOPE, "Admin action", { adminId: ADMIN_ID, targetId: userId, action });
  return NextResponse.json({ success: true });
}
