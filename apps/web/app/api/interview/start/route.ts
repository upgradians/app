import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const OPENAI_KEY = process.env.OPENAI_API_KEY ?? "";

interface OpenAIQuestion {
  id: string;
  question: string;
  type: "technical" | "behavioral" | "coding";
  difficulty: string;
}

async function generateQuestions(role: string, level: string): Promise<OpenAIQuestion[]> {
  const systemPrompt = `You are a senior technical interviewer at a top tech company.
Generate exactly 5 interview questions for a ${level} ${role} developer.
Return a JSON array of objects with: id (q1-q5), question (string), type (technical|behavioral|coding), difficulty (easy|medium|hard).
Mix: 2 technical, 1 behavioral, 2 coding questions. Tailor difficulty to ${level} level.`;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${OPENAI_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Generate interview questions for ${level} ${role}` },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    }),
  });

  const data = await res.json();
  const parsed = JSON.parse(data.choices?.[0]?.message?.content ?? "{}");
  return parsed.questions ?? [];
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { role, level } = await request.json();

  const questions = await generateQuestions(role, level);

  const { data: session } = await supabase
    .from("interview_sessions")
    .insert({ user_id: user.id, role, level, status: "in_progress" })
    .select()
    .single();

  return NextResponse.json({ session_id: session?.id, questions });
}
