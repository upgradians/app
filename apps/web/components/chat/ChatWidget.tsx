"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { X, Send, Loader2, Bot, Minimize2 } from "lucide-react";

interface Message {
  role: "user" | "model";
  text: string;
}

interface ApiMessage {
  role: "user" | "model";
  parts: Array<{ text: string }>;
}

const SUGGESTIONS = [
  "What services do you offer?",
  "Tell me about internship opportunities",
  "How do I contact Upgradian?",
  "What is the practice platform?",
];

function TypingDots() {
  return (
    <div className="flex items-center gap-1 py-1 px-0.5">
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full"
          style={{
            background: "#6c8aff",
            animation: `chatDot 1.2s ease-in-out ${i * 0.2}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

export function ChatWidget() {
  const [open,    setOpen]    = useState(false);
  const [input,   setInput]   = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "model",
      text: "Hi! I'm Aria, Upgradian's AI assistant. I can help you with our services, internship opportunities, the practice platform, and more. How can I help you today?",
    },
  ]);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open, messages]);

  const send = useCallback(async (text: string) => {
    const msg = text.trim();
    if (!msg || loading) return;

    setMessages(prev => [...prev, { role: "user", text: msg }]);
    setInput("");
    setLoading(true);

    const history: ApiMessage[] = messages.map(m => ({
      role: m.role,
      parts: [{ text: m.text }],
    }));

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, history }),
      });

      const data = await res.json();
      setMessages(prev => [...prev, { role: "model", text: data.text ?? "Sorry, I couldn't respond. Please try again." }]);
    } catch {
      setMessages(prev => [...prev, { role: "model", text: "Something went wrong. Please try again or email us at career@upgradians.com." }]);
    } finally {
      setLoading(false);
    }
  }, [messages, loading]);

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); }
  };

  return (
    <>
      {/* Keyframes injected at runtime via a style tag — safe in client component */}
      <style>{`
        @keyframes chatDot {
          0%, 80%, 100% { opacity: 0.25; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1); }
        }
        @keyframes chatSlideUp {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
      `}</style>

      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Open AI chat assistant"
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95"
          style={{
            background: "linear-gradient(135deg, #4361ee, #7c3aed)",
            boxShadow: "0 8px 32px rgba(67,97,238,0.45), 0 0 0 1px rgba(67,97,238,0.4)",
          }}
        >
          <Bot className="w-6 h-6 text-white" strokeWidth={1.5} />
          <span className="absolute top-0 right-0 w-3 h-3 rounded-full border-2 border-[#000008]" style={{ background: "#10b981" }} />
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div
          className="fixed bottom-6 right-6 z-50 w-[360px] max-w-[calc(100vw-24px)] rounded-3xl overflow-hidden shadow-2xl"
          style={{
            background: "rgba(7,7,15,0.98)",
            border: "1px solid rgba(255,255,255,0.09)",
            backdropFilter: "blur(20px)",
            animation: "chatSlideUp 0.25s cubic-bezier(0.22,1,0.36,1) forwards",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", background: "rgba(67,97,238,0.08)" }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #4361ee, #7c3aed)" }}
              >
                <Bot className="w-4 h-4 text-white" strokeWidth={1.5} />
              </div>
              <div>
                <div className="text-sm font-bold text-white leading-none">Aria</div>
                <div className="text-[11px] mt-0.5 flex items-center gap-1" style={{ color: "#10b981" }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current inline-block" />
                  Upgradian AI Assistant
                </div>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="p-1.5 rounded-lg transition-all hover:bg-white/[0.07]"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              <Minimize2 className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="h-72 overflow-y-auto px-4 py-3 space-y-3 scrollbar-thin" style={{ scrollbarColor: "rgba(255,255,255,0.1) transparent" }}>
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                {m.role === "model" && (
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mr-2 mt-0.5" style={{ background: "linear-gradient(135deg, #4361ee, #7c3aed)" }}>
                    <Bot className="w-3 h-3 text-white" strokeWidth={2} />
                  </div>
                )}
                <div
                  className="max-w-[78%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed"
                  style={m.role === "user" ? {
                    background: "linear-gradient(135deg, #4361ee, #7c3aed)",
                    color: "white",
                    borderBottomRightRadius: "4px",
                  } : {
                    background: "rgba(255,255,255,0.07)",
                    color: "rgba(255,255,255,0.85)",
                    borderBottomLeftRadius: "4px",
                  }}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mr-2 mt-0.5" style={{ background: "linear-gradient(135deg, #4361ee, #7c3aed)" }}>
                  <Bot className="w-3 h-3 text-white" strokeWidth={2} />
                </div>
                <div className="rounded-2xl px-3.5 py-2.5" style={{ background: "rgba(255,255,255,0.07)", borderBottomLeftRadius: "4px" }}>
                  <TypingDots />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggestions (only show when one message in history) */}
          {messages.length === 1 && (
            <div className="px-4 py-2 flex flex-wrap gap-1.5" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
              {SUGGESTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="text-[11px] px-2.5 py-1 rounded-full transition-all hover:bg-white/[0.1] hover:text-white"
                  style={{ border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)", background: "transparent" }}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="px-3 py-3" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="flex items-center gap-2 rounded-2xl px-3 py-2" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)" }}>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Ask me anything..."
                disabled={loading}
                className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/25 disabled:opacity-50"
              />
              <button
                onClick={() => send(input)}
                disabled={loading || !input.trim()}
                aria-label="Send message"
                className="w-7 h-7 rounded-xl flex items-center justify-center transition-all disabled:opacity-30 hover:scale-105 active:scale-95 flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #4361ee, #7c3aed)" }}
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 text-white animate-spin" /> : <Send className="w-3.5 h-3.5 text-white" />}
              </button>
            </div>
            <p className="text-center text-[10px] mt-1.5" style={{ color: "rgba(255,255,255,0.15)" }}>
              Powered by Gemini · Upgradian Technology
            </p>
          </div>
        </div>
      )}
    </>
  );
}
