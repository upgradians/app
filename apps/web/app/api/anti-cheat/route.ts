import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";
import { checkRateLimit } from "@/lib/rate-limit";

const SCOPE = "api/anti-cheat";

// Thresholds
const SUSPICIOUS_AT_VIOLATIONS = 3; // set suspicious_activity flag
const TEMP_BAN_AT_VIOLATIONS   = 5; // 24-hour temp ban
const TEMP_BAN_HOURS           = 24;

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Rate-limit: max 30 events per minute per user (anti-flood)
  const rl = checkRateLimit(`anti-cheat:${user.id}`, 30, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  let body: {
    session_type?:    string;
    event_type?:      string;
    challenge_id?:    string;
    session_id?:      string;
    warning_count?:   number;
    is_disqualified?: boolean;
    metadata?:        Record<string, unknown>;
  };
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const { session_type, event_type, challenge_id, session_id, warning_count, is_disqualified, metadata } = body;
  if (!session_type || !event_type) {
    return NextResponse.json({ error: "session_type and event_type are required." }, { status: 400 });
  }

  // Insert the event log
  const { error: insertErr } = await supabase.from("anti_cheat_events").insert({
    user_id:         user.id,
    session_type,
    event_type,
    challenge_id:    challenge_id    ?? null,
    session_id:      session_id      ?? null,
    warning_count:   warning_count   ?? 0,
    is_disqualified: is_disqualified ?? false,
    metadata:        metadata        ?? null,
  });

  if (insertErr) {
    logger.error(SCOPE, "Insert error", { userId: user.id, error: insertErr.message });
    return NextResponse.json({ error: "Failed to log event." }, { status: 500 });
  }

  // Auto-enforcement: only act on disqualifications
  if (is_disqualified) {
    try {
      const { data: prof } = await supabase
        .from("profiles")
        .select("violation_count,suspicious_activity,temp_ban_until,total_xp,rank")
        .eq("id", user.id)
        .single();

      const newCount = (prof?.violation_count ?? 0) + 1;
      const patch: Record<string, unknown> = { violation_count: newCount };

      if (newCount >= SUSPICIOUS_AT_VIOLATIONS) {
        patch.suspicious_activity = true;
        logger.warn(SCOPE, "User flagged suspicious", { userId: user.id, newCount });
      }

      if (newCount >= TEMP_BAN_AT_VIOLATIONS && !prof?.temp_ban_until) {
        patch.temp_ban_until = new Date(Date.now() + TEMP_BAN_HOURS * 3_600_000).toISOString();
        logger.warn(SCOPE, "User temp-banned", { userId: user.id, hours: TEMP_BAN_HOURS });
      }

      await supabase.from("profiles").update(patch).eq("id", user.id);
    } catch (err) {
      logger.error(SCOPE, "Enforcement update failed", { userId: user.id, err: String(err) });
    }
  }

  return NextResponse.json({ ok: true });
}
