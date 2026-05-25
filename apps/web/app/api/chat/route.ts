import { NextRequest, NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL   = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";

const SYSTEM_PROMPT = `You are Aria, the AI assistant for Upgradian Technology — a modern AI engineering and software development company based at TIDEL Neo, Villupuram, India.

About Upgradian Technology:
- We are an AI product development and software engineering company
- We build SaaS platforms, web apps, mobile apps, AI products, ERP/CRM systems, Cloud & DevOps solutions, API integrations, and startup MVPs
- We also run a developer practice platform with 50,000+ engineers
- Office: TIDEL Neo, Villupuram, Tamil Nadu, India
- Contact: career@upgradians.com
- WhatsApp: https://wa.me/918553451935

Practice Platform (for developers):
- Coding Arena: 500+ DSA challenges (Easy, Medium, Hard) — /arena
- AI Mock Interviews — /interview
- Live Coding Contests — /contests
- Global Leaderboard — /leaderboard
- Skill Tracks (DSA, System Design, Full Stack, AI/ML) — /tracks

Careers & Internships:
- We offer internships in: Full Stack Engineering, AI/ML Engineering, Data Engineering, Frontend Engineering, DevOps & Cloud, UI/UX Design
- Duration: 2-3 months
- Apply by emailing: career@upgradians.com

How to reach us:
- For services & projects: career@upgradians.com
- For WhatsApp: https://wa.me/918553451935

Your personality:
- Professional, friendly, and concise
- You represent a premium AI engineering company
- Be helpful, direct, and knowledgeable
- Keep responses focused and well-structured
- Do not make up information not provided above
- If asked about pricing or custom project details, ask them to contact us via email or WhatsApp`;

interface Message {
  role: "user" | "model";
  parts: Array<{ text: string }>;
}

export async function POST(req: NextRequest) {
  if (!GEMINI_API_KEY) {
    return NextResponse.json({ error: "AI service not configured" }, { status: 503 });
  }

  let history: Message[] = [];
  let userMessage = "";

  try {
    const body = await req.json();
    history     = body.history ?? [];
    userMessage = body.message ?? "";
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (!userMessage.trim()) {
    return NextResponse.json({ error: "Empty message" }, { status: 400 });
  }

  const contents: Message[] = [
    ...history,
    { role: "user", parts: [{ text: userMessage }] },
  ];

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024,
            topP: 0.9,
          },
        }),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      console.error("Gemini API error:", err);
      return NextResponse.json({ error: "AI service error" }, { status: 502 });
    }

    const data = await res.json();
    const text: string =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ??
      "I'm having trouble responding right now. Please try again or contact us at career@upgradians.com.";

    return NextResponse.json({ text });
  } catch (err) {
    console.error("Chat route error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
