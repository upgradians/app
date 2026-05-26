import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";
import { checkRateLimit } from "@/lib/rate-limit";

const SCOPE = "api/interview/start";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL   = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";

interface Question {
  id: string;
  question: string;
  type: "technical" | "behavioral" | "coding";
  difficulty: string;
}

const FALLBACK_QUESTIONS: Record<string, Question[]> = {
  frontend: [
    { id: "q1", question: "Explain the difference between `useState` and `useReducer` in React. When would you use each?", type: "technical", difficulty: "medium" },
    { id: "q2", question: "What is the virtual DOM and how does React's reconciliation algorithm work?", type: "technical", difficulty: "hard" },
    { id: "q3", question: "Describe a challenging UI bug you encountered and how you resolved it.", type: "behavioral", difficulty: "medium" },
    { id: "q4", question: "Write a debounce function in JavaScript.", type: "coding", difficulty: "medium" },
    { id: "q5", question: "Implement a function that flattens a deeply nested array without using Array.flat().", type: "coding", difficulty: "medium" },
  ],
  backend: [
    { id: "q1", question: "Explain the difference between SQL and NoSQL databases. When would you choose each?", type: "technical", difficulty: "medium" },
    { id: "q2", question: "How do you handle authentication and authorization in a REST API?", type: "technical", difficulty: "medium" },
    { id: "q3", question: "Tell me about a time you improved the performance of a backend service.", type: "behavioral", difficulty: "medium" },
    { id: "q4", question: "Write a function to detect a cycle in a linked list.", type: "coding", difficulty: "medium" },
    { id: "q5", question: "Implement an LRU cache with O(1) get and put operations.", type: "coding", difficulty: "hard" },
  ],
  dsa: [
    { id: "q1", question: "Explain the time and space complexity of quicksort vs mergesort. When would you prefer each?", type: "technical", difficulty: "medium" },
    { id: "q2", question: "What is dynamic programming? Give an example of when you applied it.", type: "technical", difficulty: "medium" },
    { id: "q3", question: "Walk me through how you approach a problem you've never seen before in a coding interview.", type: "behavioral", difficulty: "medium" },
    { id: "q4", question: "Given an array of integers, find the length of the longest increasing subsequence.", type: "coding", difficulty: "hard" },
    { id: "q5", question: "Implement a function to find all permutations of a string.", type: "coding", difficulty: "medium" },
  ],
  default: [
    { id: "q1", question: "Explain the difference between REST and GraphQL APIs.", type: "technical", difficulty: "medium" },
    { id: "q2", question: "How do you handle state management in large applications?", type: "technical", difficulty: "hard" },
    { id: "q3", question: "Describe a time when you had to debug a complex production issue.", type: "behavioral", difficulty: "medium" },
    { id: "q4", question: "Write a function to reverse a linked list in-place.", type: "coding", difficulty: "medium" },
    { id: "q5", question: "Implement a binary search algorithm and explain its time complexity.", type: "coding", difficulty: "easy" },
  ],
};

async function generateQuestionsWithGemini(role: string, level: string): Promise<Question[]> {
  if (!GEMINI_API_KEY) throw new Error("No API key");

  const prompt = `Generate exactly 5 interview questions for a ${level} ${role} developer.
Return a JSON object with a "questions" array. Each question must have:
- id: "q1" through "q5"
- question: the interview question text (string)
- type: one of "technical", "behavioral", or "coding"
- difficulty: one of "easy", "medium", or "hard"

Mix: 2 technical questions, 1 behavioral question, 2 coding questions.
Tailor difficulty to a ${level}-level ${role} developer.`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.7,
          maxOutputTokens: 1024,
        },
      }),
      signal: AbortSignal.timeout(20000),
    }
  );

  if (!res.ok) throw new Error(`Gemini error: ${res.status}`);

  const data = await res.json();
  const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
  const parsed = JSON.parse(text);
  const questions: Question[] = parsed.questions ?? [];
  if (!questions.length) throw new Error("Empty questions from Gemini");
  return questions;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // In-memory rate limit: max 10 starts per hour
  const rl = checkRateLimit(`interview:start:${user.id}`, 10, 3_600_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "You've started too many sessions recently. Please wait before starting another." },
      { status: 429 },
    );
  }

  // DB rate limit: max 5 sessions per hour (precise, survives cold starts)
  try {
    const oneHourAgo = new Date(Date.now() - 3_600_000).toISOString();
    const { count } = await supabase
      .from("interview_sessions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", oneHourAgo);
    if ((count ?? 0) >= 5) {
      return NextResponse.json(
        { error: "You've started 5 sessions in the last hour. Please wait before starting another." },
        { status: 429 },
      );
    }
  } catch { /* table may not exist in dev — skip */ }

  // Expire any in_progress sessions older than 35 minutes (prevents orphaned sessions)
  try {
    const staleAt = new Date(Date.now() - 35 * 60_000).toISOString();
    await supabase
      .from("interview_sessions")
      .update({ status: "expired" })
      .eq("user_id", user.id)
      .eq("status", "in_progress")
      .lt("created_at", staleAt);
  } catch { /* non-critical */ }

  logger.info(SCOPE, "Starting interview session", { userId: user.id });

  let role = "fullstack";
  let level = "mid";
  try {
    const body = await request.json();
    role  = body.role  ?? "fullstack";
    level = body.level ?? "mid";
  } catch { /* ignore parse error */ }

  let questions: Question[];
  try {
    questions = await generateQuestionsWithGemini(role, level);
  } catch {
    questions = FALLBACK_QUESTIONS[role] ?? FALLBACK_QUESTIONS.default;
  }

  let sessionId: string | undefined;
  try {
    const { data: session } = await supabase
      .from("interview_sessions")
      .insert({ user_id: user.id, role, level, status: "in_progress" })
      .select("id")
      .single();
    sessionId = session?.id;
  } catch {
    sessionId = `demo-${Date.now()}`;
  }

  return NextResponse.json({ session_id: sessionId, questions });
}
