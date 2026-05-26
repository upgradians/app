import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const ADMIN_ID = "c57b661e-eec0-4926-a7bd-88209e45979b";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.id !== ADMIN_ID) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: { challenge_id?: string; challenge_date?: string; xp_multiplier?: number; bonus_xp?: number };
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const { challenge_id, challenge_date, xp_multiplier, bonus_xp } = body;
  if (!challenge_id || !challenge_date) {
    return NextResponse.json({ error: "challenge_id and challenge_date are required." }, { status: 400 });
  }

  const { data: entry, error } = await supabase
    .from("daily_challenges")
    .upsert(
      {
        challenge_id,
        challenge_date,
        xp_multiplier: xp_multiplier ?? 2,
        bonus_xp:      bonus_xp      ?? 0,
        created_by:    user.id,
      },
      { onConflict: "challenge_date" },
    )
    .select("id,challenge_id,challenge_date,xp_multiplier,bonus_xp")
    .single();

  if (error) {
    console.error("[daily-challenge] upsert error:", error);
    return NextResponse.json({ error: "Failed to save." }, { status: 500 });
  }

  return NextResponse.json({ entry });
}

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.id !== ADMIN_ID) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data } = await supabase
    .from("daily_challenges")
    .select("id,challenge_id,challenge_date,xp_multiplier,bonus_xp")
    .order("challenge_date", { ascending: false })
    .limit(60);

  return NextResponse.json({ entries: data ?? [] });
}
