import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const OPENAI_KEY = process.env.OPENAI_API_KEY ?? "";

async function evaluateAnswers(role: string, level: string, answers: Record<string, string>) {
  const prompt = `You are a strict but fair technical interviewer evaluating a ${level} ${role} developer.
The candidate answered ${Object.keys(answers).length} questions.

Answers: ${JSON.stringify(answers)}

Evaluate and return a JSON object with:
- score: overall score 0-100
- feedback: 2-3 sentence constructive feedback paragraph
- breakdown: object with keys technical_knowledge, problem_solving, communication, code_quality, each 0-100`;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${OPENAI_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a technical interview evaluator. Return valid JSON only." },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    }),
  });

  const data = await res.json();
  return JSON.parse(data.choices?.[0]?.message?.content ?? "{}");
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { sessionId } = await params;
  const { answers } = await request.json();

  const { data: session } = await supabase
    .from("interview_sessions")
    .select("role,level")
    .eq("id", sessionId)
    .eq("user_id", user.id)
    .single();

  if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });

  const evaluation = await evaluateAnswers(session.role, session.level, answers);

  await supabase
    .from("interview_sessions")
    .update({
      status:     "completed",
      score:      evaluation.score,
      feedback:   evaluation.feedback,
      completed_at: new Date().toISOString(),
    })
    .eq("id", sessionId);

  const xpEarned = Math.round((evaluation.score / 100) * 200);
  if (xpEarned > 0) {
    await supabase.rpc("add_xp_to_profile", { p_user_id: user.id, p_xp: xpEarned });
  }

  return NextResponse.json({ ...evaluation, xp_earned: xpEarned });
}
