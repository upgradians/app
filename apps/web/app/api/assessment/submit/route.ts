import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: {
    track?: string; score?: number; total_questions?: number;
    percentage?: number; status?: string; tab_switches?: number;
    noise_violations?: number; time_taken_secs?: number;
  };
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { track, score, total_questions, percentage, status, tab_switches, noise_violations, time_taken_secs } = body;
  if (!track || score === undefined || !total_questions || percentage === undefined || !status) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  if (!["completed", "disqualified"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const { error } = await supabase.from("assessment_results").insert({
    user_id:         user.id,
    track,
    score,
    total_questions,
    percentage,
    status,
    tab_switches:    tab_switches    ?? 0,
    noise_violations: noise_violations ?? 0,
    time_taken_secs: time_taken_secs ?? null,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
