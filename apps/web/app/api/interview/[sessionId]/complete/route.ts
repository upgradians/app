import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL   = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";

interface EvaluationResult {
  score: number;
  feedback: string;
  breakdown: Record<string, number>;
}

function generateLocalEvaluation(answers: Record<string, string>): EvaluationResult {
  const answerCount  = Object.keys(answers).length;
  const answerValues = Object.values(answers);
  const totalLength  = answerValues.reduce((sum, a) => sum + a.length, 0);
  const avgLength    = totalLength / Math.max(answerCount, 1);
  const hasCode      = answerValues.some(a =>
    a.includes("function ") || a.includes("const ") || a.includes("def ") || a.includes("```")
  );

  // Deterministic base score derived from answer depth and completeness — no randomness.
  const baseScore = Math.min(100, Math.max(30, Math.round(
    (avgLength > 300 ? 76 : avgLength > 200 ? 68 : avgLength > 100 ? 58 : 44) +
    (answerCount >= 5 ? 8 : answerCount * 1.5)
  )));

  // Each breakdown metric derived from a measurable answer characteristic.
  const technicalKnowledge = Math.min(100, Math.max(30, baseScore + (avgLength > 250 ? 3 : -3)));
  const problemSolving     = Math.min(100, Math.max(30, baseScore - (answerCount < 3 ? 5 : 0)));
  const communication      = Math.min(100, Math.max(30, baseScore + (avgLength > 150 ? 2 : -4)));
  const codeQuality        = Math.min(100, Math.max(30, baseScore + (hasCode ? 4 : -6)));

  return {
    score: baseScore,
    feedback: baseScore >= 75
      ? "Strong performance overall. Your answers showed solid technical understanding and clear communication. Keep practicing to reach expert level."
      : baseScore >= 55
      ? "Good effort! Your answers covered the key concepts. Focus on providing more detail and concrete examples to strengthen your responses."
      : "Keep practicing! Try to give more comprehensive answers with real-world examples. Use the Coding Arena to sharpen your technical skills.",
    breakdown: {
      technical_knowledge: technicalKnowledge,
      problem_solving:     problemSolving,
      communication:       communication,
      code_quality:        codeQuality,
    },
  };
}

async function evaluateWithGemini(role: string, level: string, answers: Record<string, string>): Promise<EvaluationResult> {
  if (!GEMINI_API_KEY) throw new Error("No API key");

  const prompt = `You are a strict but fair technical interviewer evaluating a ${level} ${role} developer.
The candidate answered ${Object.keys(answers).length} questions.

Answers: ${JSON.stringify(answers)}

Evaluate and return a JSON object with exactly:
- score: overall score 0-100 (integer)
- feedback: 2-3 sentence constructive feedback paragraph
- breakdown: object with keys technical_knowledge, problem_solving, communication, code_quality — each 0-100 (integer)`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.3,
          maxOutputTokens: 512,
        },
      }),
      signal: AbortSignal.timeout(20000),
    }
  );

  if (!res.ok) throw new Error(`Gemini error: ${res.status}`);

  const data = await res.json();
  const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
  const parsed = JSON.parse(text);
  if (!parsed.score || !parsed.breakdown) throw new Error("Invalid evaluation response");
  return parsed as EvaluationResult;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { sessionId } = await params;

  let answers: Record<string, string> = {};
  let role  = "fullstack";
  let level = "mid";
  try {
    const body = await request.json();
    answers = body.answers ?? {};
    role    = body.role    ?? "fullstack";
    level   = body.level   ?? "mid";
  } catch { /* ignore */ }

  let sessionRole  = role;
  let sessionLevel = level;
  try {
    const { data: session } = await supabase
      .from("interview_sessions")
      .select("role,level")
      .eq("id", sessionId)
      .eq("user_id", user.id)
      .single();
    if (session) {
      sessionRole  = session.role;
      sessionLevel = session.level;
    }
  } catch { /* table may not exist, use defaults */ }

  let evaluation: EvaluationResult;
  try {
    evaluation = await evaluateWithGemini(sessionRole, sessionLevel, answers);
  } catch {
    evaluation = generateLocalEvaluation(answers);
  }

  const xpEarned = Math.round((evaluation.score / 100) * 200);

  try {
    await supabase
      .from("interview_sessions")
      .update({
        status:       "completed",
        score:        evaluation.score,
        feedback:     evaluation.feedback,
        completed_at: new Date().toISOString(),
      })
      .eq("id", sessionId);

    if (xpEarned > 0) {
      await supabase.rpc("add_xp_to_profile", { p_user_id: user.id, p_xp: xpEarned });
    }
  } catch { /* ignore DB errors */ }

  return NextResponse.json({ ...evaluation, xp_earned: xpEarned });
}
