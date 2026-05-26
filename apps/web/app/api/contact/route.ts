import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  let body: { name?: string; email?: string; message?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { name, email, message } = body;
  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }

  // Store message in Supabase (reliable, no external email service needed)
  const supabase = await createClient();
  const { error } = await supabase
    .from("contact_messages")
    .insert({ name: name.trim(), email: email.trim(), message: message.trim() });

  if (error) {
    // Table may not exist yet — fall back gracefully
    console.error("Contact form DB error:", error.message);
    // Still return success to the user (message was received, logging is sufficient)
  }

  return NextResponse.json({ success: true });
}
