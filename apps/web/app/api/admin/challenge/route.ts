import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const ADMIN_UID = "c57b661e-eec0-4926-a7bd-88209e45979b";

interface TestCaseInput {
  input:           string;
  expected_output: string;
  is_hidden:       boolean;
}

interface ChallengeBody {
  title:           string;
  description:     string;
  difficulty:      "easy" | "medium" | "hard";
  language:        string;
  xp_reward?:      number;
  time_limit_ms?:  number;
  memory_limit_mb?: number;
  starter_code?:   string;
  tags?:           string[];
  is_active?:      boolean;
  test_cases?:     TestCaseInput[];
}

function toSlug(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

// POST /api/admin/challenge
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.id !== ADMIN_UID) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: ChallengeBody;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const { title, description, difficulty, language } = body;
  if (!title?.trim())       return NextResponse.json({ error: "Title is required." },       { status: 400 });
  if (!description?.trim()) return NextResponse.json({ error: "Description is required." }, { status: 400 });
  if (!difficulty)          return NextResponse.json({ error: "Difficulty is required." },  { status: 400 });
  if (!language)            return NextResponse.json({ error: "Language is required." },    { status: 400 });

  const slug = toSlug(title);

  const { data: challenge, error: insErr } = await supabase
    .from("challenges")
    .insert({
      title:           title.trim(),
      slug,
      description:     description.trim(),
      difficulty,
      language,
      xp_reward:       body.xp_reward      ?? 50,
      time_limit_ms:   body.time_limit_ms  ?? 2000,
      memory_limit_mb: body.memory_limit_mb ?? 256,
      starter_code:    body.starter_code   ?? null,
      tags:            body.tags           ?? [],
      is_active:       body.is_active      ?? true,
    })
    .select("id,slug")
    .single();

  if (insErr || !challenge) {
    console.error("[admin/challenge] Insert error:", insErr);
    if (insErr?.code === "23505") {
      return NextResponse.json({ error: "A challenge with that title already exists. Please use a different title." }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to create challenge." }, { status: 500 });
  }

  // Insert test cases if provided
  const testCases = body.test_cases ?? [];
  if (testCases.length > 0) {
    const rows = testCases.map((tc, i) => ({
      challenge_id:    challenge.id,
      input:           tc.input ?? "",
      expected_output: tc.expected_output ?? "",
      is_hidden:       tc.is_hidden ?? false,
      order_index:     i,
    }));
    const { error: tcErr } = await supabase.from("test_cases").insert(rows);
    if (tcErr) console.error("[admin/challenge] Test cases insert error:", tcErr);
  }

  return NextResponse.json({ id: challenge.id, slug: challenge.slug }, { status: 201 });
}
