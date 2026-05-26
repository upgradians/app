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

function getFallbackResponse(message: string): string {
  const lower = message.toLowerCase();

  if (lower.includes("intern") || lower.includes("job") || lower.includes("career") || lower.includes("hire")) {
    return "We offer internships in Full Stack Engineering, AI/ML Engineering, Data Engineering, Frontend, DevOps, and UI/UX Design. Duration is 2–3 months. Apply by emailing **career@upgradians.com** with your resume and areas of interest. We review applications on a rolling basis!";
  }
  if (lower.includes("service") || lower.includes("build") || lower.includes("develop") || lower.includes("project")) {
    return "Upgradian Technology builds **SaaS platforms, web & mobile apps, AI products, ERP/CRM systems, Cloud & DevOps solutions, API integrations, and startup MVPs**. To discuss your project, email us at career@upgradians.com.";
  }
  if (lower.includes("arena") || lower.includes("challenge") || lower.includes("coding") || lower.includes("practice")) {
    return "Our **Coding Arena** has 500+ DSA challenges across Easy, Medium, and Hard difficulties. Solve challenges to earn XP, climb the leaderboard, and unlock achievements. Head to /arena to start practicing!";
  }
  if (lower.includes("interview") || lower.includes("mock")) {
    return "Our **AI Mock Interview** feature generates real interview questions tailored to your role (Frontend, Backend, Full Stack, DSA, ML, DevOps) and experience level (Junior, Mid, Senior). You get AI-scored feedback after each session. Try it at /interview!";
  }
  if (lower.includes("contact") || lower.includes("reach") || lower.includes("email") || lower.includes("whatsapp")) {
    return "You can reach Upgradian Technology at:\n- **Email:** career@upgradians.com\n- **WhatsApp:** +91 85534 51935\n- **Office:** TIDEL Neo, Villupuram, Tamil Nadu, India";
  }
  if (lower.includes("contest") || lower.includes("competition")) {
    return "We run **Live Coding Contests** with prize pools and XP bonuses! Winners can earn internship opportunities at Upgradian. Check out upcoming contests at /contests.";
  }
  if (lower.includes("leaderboard") || lower.includes("rank") || lower.includes("xp")) {
    return "Our **Global Leaderboard** ranks developers by XP earned through solving challenges, winning contests, and completing missions. Your rank progression: Bronze Coder → Silver Developer → Gold Engineer → Cosmic Master. View it at /leaderboard.";
  }
  if (lower.includes("track") || lower.includes("skill") || lower.includes("learn")) {
    return "We offer **Skill Tracks** in DSA, System Design, Full Stack Development, and AI/ML — each with curated challenges and a structured learning path. Start your track at /tracks.";
  }
  if (lower.includes("hello") || lower.includes("hi") || lower.includes("hey") || lower.includes("help")) {
    return "Hi! I'm Aria, Upgradian's AI assistant. I can help you with:\n- 🎓 **Internship opportunities**\n- 💼 **Our development services**\n- ⚔️ **Coding Arena challenges**\n- 🤖 **AI Mock Interviews**\n- 📊 **Leaderboard & XP system**\n\nWhat would you like to know?";
  }

  return "I'm here to help with Upgradian's services, internships, coding platform, and more. For specific enquiries, email us at **career@upgradians.com**. What can I assist you with?";
}

export async function POST(req: NextRequest) {
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

  if (!GEMINI_API_KEY) {
    return NextResponse.json({ text: getFallbackResponse(userMessage) });
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
        signal: AbortSignal.timeout(15000),
      }
    );

    if (!res.ok) {
      console.error("Gemini API error:", res.status, await res.text().catch(() => ""));
      return NextResponse.json({ text: getFallbackResponse(userMessage) });
    }

    const data = await res.json();
    const text: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return NextResponse.json({ text: getFallbackResponse(userMessage) });
    }

    return NextResponse.json({ text });
  } catch (err) {
    console.error("Chat route error:", err);
    return NextResponse.json({ text: getFallbackResponse(userMessage) });
  }
}
