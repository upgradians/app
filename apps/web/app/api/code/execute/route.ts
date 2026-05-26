import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { pistonRun, PISTON_LANGS } from "@/lib/piston";

export const maxDuration = 60;

// POST /api/code/execute
// Runs code against a single stdin input and returns raw output.
// Used for live test-runs from the editor. NOT for graded submissions.
// Frontend must call this endpoint — never call Piston directly.
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { code?: string; language?: string; stdin?: string };
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const { code, language, stdin = "" } = body;

  if (!code?.trim()) {
    return NextResponse.json({ error: "Code cannot be empty." }, { status: 400 });
  }
  if (!language) {
    return NextResponse.json({ error: "Language is required." }, { status: 400 });
  }
  if (!(language in PISTON_LANGS)) {
    return NextResponse.json({
      error: `Unsupported language "${language}". Supported: ${Object.keys(PISTON_LANGS).join(", ")}`,
    }, { status: 400 });
  }

  try {
    const result = await pistonRun(code, language, stdin);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[code/execute]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Execution failed. Please try again." },
      { status: 502 },
    );
  }
}
