"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@upgradian/ui";
import toast from "react-hot-toast";

type Stage = "select" | "session" | "results";
type Role = { id: string; label: string; icon: string };

const ROLES: Role[] = [
  { id: "frontend", label: "Frontend Developer", icon: "🎨" },
  { id: "backend",  label: "Backend Developer",  icon: "⚙️" },
  { id: "fullstack",label: "Full Stack Developer",icon: "🚀" },
  { id: "dsa",      label: "DSA & Algorithms",    icon: "🧠" },
  { id: "ml",       label: "ML Engineer",         icon: "🤖" },
  { id: "devops",   label: "DevOps Engineer",     icon: "🛠️" },
];

const LEVELS = ["junior", "mid", "senior"] as const;

interface AIQuestion {
  id: string;
  question: string;
  type: "technical" | "behavioral" | "coding";
  difficulty: string;
}

interface SessionState {
  sessionId: string;
  questions: AIQuestion[];
  currentIndex: number;
  answers: Record<string, string>;
}

export function InterviewClient() {
  const [stage,    setStage]    = useState<Stage>("select");
  const [role,     setRole]     = useState<string>("fullstack");
  const [level,    setLevel]    = useState<string>("mid");
  const [loading,  setLoading]  = useState(false);
  const [session,  setSession]  = useState<SessionState | null>(null);
  const [answer,   setAnswer]   = useState("");
  const [results,  setResults]  = useState<{ score: number; feedback: string; breakdown: Record<string, number> } | null>(null);

  const startSession = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/interview/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ role, level }),
      });
      const data = await res.json();
      setSession({ sessionId: data.session_id, questions: data.questions, currentIndex: 0, answers: {} });
      setStage("session");
    } catch {
      toast.error("Failed to start session. Try again.");
    } finally {
      setLoading(false);
    }
  }, [role, level]);

  const submitAnswer = useCallback(async () => {
    if (!session || !answer.trim()) return;
    const q = session.questions[session.currentIndex];
    const newAnswers = { ...session.answers, [q.id]: answer };
    const isLast = session.currentIndex === session.questions.length - 1;

    if (isLast) {
      setLoading(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/interview/${session.sessionId}/complete`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ answers: newAnswers }),
        });
        const data = await res.json();
        setResults(data);
        setStage("results");
      } catch {
        toast.error("Failed to submit. Try again.");
      } finally {
        setLoading(false);
      }
    } else {
      setSession({ ...session, currentIndex: session.currentIndex + 1, answers: newAnswers });
      setAnswer("");
    }
  }, [session, answer]);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-[var(--text-1)] tracking-tight">AI Interview 🤖</h1>
        <p className="text-[var(--text-2)] mt-1 text-sm">Practice with AI. Get instant feedback. Land your dream job.</p>
      </div>

      <AnimatePresence mode="wait">
        {/* ── Stage 1: Select Role ── */}
        {stage === "select" && (
          <motion.div key="select" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <div className="mb-6">
              <div className="text-xs font-bold uppercase tracking-wider text-[var(--text-3)] mb-3">Choose your role</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {ROLES.map(r => (
                  <button key={r.id} onClick={() => setRole(r.id)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      role === r.id
                        ? "border-brand bg-brand/10 text-brand"
                        : "border-[var(--border)] bg-[var(--bg-2)] text-[var(--text-1)] hover:border-brand/40"
                    }`}>
                    <div className="text-2xl mb-2">{r.icon}</div>
                    <div className="text-xs font-bold">{r.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <div className="text-xs font-bold uppercase tracking-wider text-[var(--text-3)] mb-3">Experience level</div>
              <div className="flex rounded-xl border border-[var(--border)] overflow-hidden w-fit">
                {LEVELS.map(l => (
                  <button key={l} onClick={() => setLevel(l)}
                    className={`px-6 py-2.5 text-xs font-bold capitalize transition-colors ${
                      level === l ? "bg-brand text-white" : "bg-[var(--bg-2)] text-[var(--text-2)] hover:bg-[var(--bg-3)]"
                    }`}>
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-[var(--bg-2)] rounded-2xl border border-[var(--border)] p-5 mb-6">
              <div className="text-xs font-bold uppercase tracking-wider text-[var(--text-3)] mb-3">Session overview</div>
              <div className="grid grid-cols-3 gap-4 text-center">
                {[["5", "Questions"], ["~20 min", "Duration"], ["AI Scored", "Feedback"]].map(([val, lbl]) => (
                  <div key={lbl}>
                    <div className="text-xl font-extrabold text-brand">{val}</div>
                    <div className="text-xs text-[var(--text-3)] mt-0.5">{lbl}</div>
                  </div>
                ))}
              </div>
            </div>

            <Button loading={loading} onClick={startSession} className="w-full">
              Start Interview Session →
            </Button>
          </motion.div>
        )}

        {/* ── Stage 2: Session ── */}
        {stage === "session" && session && (
          <motion.div key="session" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            {/* Progress */}
            <div className="flex items-center gap-2 mb-6">
              {session.questions.map((_, i) => (
                <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${
                  i < session.currentIndex ? "bg-brand" :
                  i === session.currentIndex ? "bg-brand/60" :
                  "bg-[var(--bg-3)]"
                }`} />
              ))}
            </div>

            <div className="text-xs font-bold uppercase tracking-wider text-[var(--text-3)] mb-2">
              Question {session.currentIndex + 1} of {session.questions.length}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={session.currentIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="bg-[var(--bg-2)] rounded-2xl border border-[var(--border)] p-5 mb-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                      session.questions[session.currentIndex]?.type === "coding"
                        ? "text-blue-400 bg-blue-400/10 border-blue-400/20"
                        : session.questions[session.currentIndex]?.type === "behavioral"
                        ? "text-purple-400 bg-purple-400/10 border-purple-400/20"
                        : "text-brand bg-brand/10 border-brand/20"
                    }`}>
                      {session.questions[session.currentIndex]?.type?.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-[var(--text-1)] font-semibold leading-relaxed">
                    {session.questions[session.currentIndex]?.question}
                  </p>
                </div>

                <textarea
                  value={answer}
                  onChange={e => setAnswer(e.target.value)}
                  placeholder="Type your answer here…"
                  rows={8}
                  className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--bg-2)] text-[var(--text-1)] text-sm outline-none focus:border-brand transition-colors resize-none font-mono mb-4"
                />

                <Button loading={loading} onClick={submitAnswer} disabled={!answer.trim()} className="w-full">
                  {session.currentIndex === session.questions.length - 1 ? "Finish & Get Feedback →" : "Next Question →"}
                </Button>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        )}

        {/* ── Stage 3: Results ── */}
        {stage === "results" && results && (
          <motion.div key="results" initial={{ opacity: 0, scale: .96 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">
                {results.score >= 80 ? "🎉" : results.score >= 60 ? "👍" : "💪"}
              </div>
              <div className="text-5xl font-extrabold text-brand mb-2">{results.score}<span className="text-2xl text-[var(--text-3)]">/100</span></div>
              <div className="text-[var(--text-2)] text-sm">Overall Interview Score</div>
            </div>

            <div className="bg-[var(--bg-2)] rounded-2xl border border-[var(--border)] p-5 mb-5">
              <div className="text-xs font-bold uppercase tracking-wider text-[var(--text-3)] mb-3">Score Breakdown</div>
              <div className="space-y-3">
                {Object.entries(results.breakdown ?? {}).map(([key, val]) => (
                  <div key={key}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-semibold text-[var(--text-2)] capitalize">{key.replace("_", " ")}</span>
                      <span className="font-bold text-brand">{val}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-[var(--bg-3)] overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-brand to-brand/60"
                        initial={{ width: 0 }}
                        animate={{ width: `${val}%` }}
                        transition={{ duration: .8, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[var(--bg-2)] rounded-2xl border border-[var(--border)] p-5 mb-6">
              <div className="text-xs font-bold uppercase tracking-wider text-[var(--text-3)] mb-2">AI Feedback</div>
              <p className="text-sm text-[var(--text-2)] leading-relaxed">{results.feedback}</p>
            </div>

            <Button variant="secondary" onClick={() => { setStage("select"); setResults(null); setSession(null); setAnswer(""); }} className="w-full">
              Try Another Session
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
