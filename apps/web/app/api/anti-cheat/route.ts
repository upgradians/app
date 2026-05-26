import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: {
    session_type?:   string;
    event_type?:     string;
    challenge_id?:   string;
    session_id?:     string;
    warning_count?:  number;
    is_disqualified?: boolean;
    metadata?:       Record<string, unknown>;
  };
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const { session_type, event_type, challenge_id, session_id, warning_count, is_disqualified, metadata } = body;

  if (!session_type || !event_type) {
    return NextResponse.json({ error: "session_type and event_type are required." }, { status: 400 });
  }

  const { error } = await supabase.from("anti_cheat_events").insert({
    user_id:         user.id,
    session_type,
    event_type,
    challenge_id:    challenge_id    ?? null,
    session_id:      session_id      ?? null,
    warning_count:   warning_count   ?? 0,
    is_disqualified: is_disqualified ?? false,
    metadata:        metadata        ?? null,
  });

  if (error) {
    console.error("[anti-cheat] insert error:", error);
    return NextResponse.json({ error: "Failed to log event." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
