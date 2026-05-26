import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";

export const maxDuration = 60;

// Called once per day by Vercel cron (0 0 * * *).
// Authorization: Bearer <CRON_SECRET>
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = await createAdminClient();
  const results: Record<string, number | string> = {};

  // ── 1. Expire stale pending submissions (> 2 hours old) ───────────────────
  try {
    const cutoff = new Date(Date.now() - 2 * 3_600_000).toISOString();
    const { data: expired } = await admin
      .from("submissions")
      .update({ status: "runtime_error" })
      .eq("status", "pending")
      .lt("submitted_at", cutoff)
      .select("id");
    results.expired_submissions = expired?.length ?? 0;
    logger.info("cron/daily-reset", "Expired stale submissions", { count: expired?.length ?? 0 });
  } catch (err) {
    logger.error("cron/daily-reset", "Failed to expire submissions", { err: String(err) });
    results.expired_submissions = "error";
  }

  // ── 2. Expire abandoned interview sessions (> 40 minutes old in_progress) ─
  try {
    const cutoff = new Date(Date.now() - 40 * 60_000).toISOString();
    const { data: expired } = await admin
      .from("interview_sessions")
      .update({ status: "expired" })
      .eq("status", "in_progress")
      .lt("created_at", cutoff)
      .select("id");
    results.expired_interviews = expired?.length ?? 0;
    logger.info("cron/daily-reset", "Expired stale interviews", { count: expired?.length ?? 0 });
  } catch (err) {
    logger.error("cron/daily-reset", "Failed to expire interviews", { err: String(err) });
    results.expired_interviews = "error";
  }

  // ── 3. Lift expired temp bans ─────────────────────────────────────────────
  try {
    const now = new Date().toISOString();
    const { data: lifted } = await admin
      .from("profiles")
      .update({ temp_ban_until: null })
      .not("temp_ban_until", "is", null)
      .lt("temp_ban_until", now)
      .select("id");
    results.lifted_temp_bans = lifted?.length ?? 0;
    logger.info("cron/daily-reset", "Lifted expired temp bans", { count: lifted?.length ?? 0 });
  } catch (err) {
    logger.error("cron/daily-reset", "Failed to lift temp bans", { err: String(err) });
    results.lifted_temp_bans = "error";
  }

  logger.info("cron/daily-reset", "Daily reset complete", results);
  return NextResponse.json({ ok: true, results });
}
