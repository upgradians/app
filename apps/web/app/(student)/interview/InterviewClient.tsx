"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@upgradian/ui";
import toast from "react-hot-toast";
import { FullscreenGuard } from "@/components/anti-cheat/FullscreenGuard";

type Stage = "select" | "webcam" | "session" | "results";
type Role = { id: string; label: string; icon: string };

const ROLES: Role[] = [
  { id: "frontend",  label: "Frontend Developer",  icon: "🎨" },
  { id: "backend",   label: "Backend Developer",   icon: "⚙️" },
  { id: "fullstack", label: "Full Stack Developer", icon: "🚀" },
  { id: "dsa",       label: "DSA & Algorithms",    icon: "🧠" },
  { id: "ml",        label: "ML Engineer",         icon: "🤖" },
  { id: "devops",    label: "DevOps Engineer",      icon: "🛠️" },
  { id: "hr",        label: "HR Round",            icon: "🤝" },
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

const SESSION_DURATION_SEC  = 30 * 60; // 30 minutes total
const QUESTION_DURATION_SEC = 5  * 60; // 5 minutes per question

function useTimer(active: boolean) {
  const [seconds, setSeconds] = useState(SESSION_DURATION_SEC);
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setSeconds(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [active]);
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return { display: `${m}:${s}`, expired: seconds === 0 };
}

function useQuestionTimer(active: boolean, questionIndex: number) {
  const [seconds, setSeconds] = useState(QUESTION_DURATION_SEC);
  useEffect(() => { setSeconds(QUESTION_DURATION_SEC); }, [questionIndex]);
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setSeconds(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [active, questionIndex]);
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return { display: `${m}:${s}`, expired: seconds === 0, seconds };
}

function draftKey(sessionId: string, questionId: string) {
  return `interview:draft:${sessionId}:${questionId}`;
}

export function InterviewClient() {
  const [stage,   setStage]   = useState<Stage>("select");
  const [role,    setRole]    = useState<string>("fullstack");
  const [level,   setLevel]   = useState<string>("mid");
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<SessionState | null>(null);
  const [answer,  setAnswer]  = useState("");
  const [results, setResults] = useState<{ score: number; feedback: string; breakdown: Record<string, number> } | null>(null);
  const [webcamOk,  setWebcamOk]   = useState(false);
  const [camError,  setCamError]   = useState<string | null>(null);
  const [camChecked,setCamChecked] = useState(false);
  const videoRef  = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const timer         = useTimer(stage === "session");
  const questionTimer = useQuestionTimer(stage === "session", session?.currentIndex ?? 0);

  // Auto-submit entire session when session timer expires
  useEffect(() => {
    if (timer.expired && stage === "session" && session) {
      toast.error("Time's up! Submitting your answers.");
      void handleFinish(session.answers);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timer.expired, stage]);

  // Auto-advance when per-question timer expires
  useEffect(() => {
    if (!questionTimer.expired || stage !== "session" || !session) return;
    const q = session.questions[session.currentIndex];
    const saved = answer.trim() || (typeof window !== "undefined"
      ? (localStorage.getItem(draftKey(session.sessionId, q.id)) ?? "")
      : "");
    const newAnswers = { ...session.answers, [q.id]: saved || "(no answer)" };
    const isLast = session.currentIndex === session.questions.length - 1;
    toast(`⏱ Time up for Q${session.currentIndex + 1}. ${isLast ? "Submitting…" : "Moving to next question."}`, { icon: "⏱" });
    if (isLast) {
      void handleFinish(newAnswers);
    } else {
      setSession({ ...session, currentIndex: session.currentIndex + 1, answers: newAnswers });
      setAnswer("");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionTimer.expired]);

  const requestWebcam = useCallback(async () => {
    setCamError(null);
    setCamChecked(false);

    if (!navigator.mediaDevices?.getUserMedia) {
      const msg = "Your browser doesn't support camera access. Please use Chrome or Firefox on desktop.";
      setCamError(msg);
      setCamChecked(true);
      toast.error(msg);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setWebcamOk(true);
      setCamChecked(true);
      setCamError(null);
    } catch (err) {
      setCamChecked(true);
      setWebcamOk(false);
      const name = err instanceof Error ? err.name : "";
      let msg: string;
      if (name === "NotAllowedError" || name === "PermissionDeniedError") {
        msg = "Camera/microphone access was denied. Open your browser settings, allow access for this site, then click Retry.";
      } else if (name === "NotFoundError" || name === "DevicesNotFoundError") {
        msg = "No camera or microphone found. Please connect a device and click Retry.";
      } else if (name === "NotReadableError" || name === "TrackStartError") {
        msg = "Your camera is already in use by another application. Close it and click Retry.";
      } else {
        msg = "Could not access camera or microphone. Please check your browser permissions and click Retry.";
      }
      setCamError(msg);
      toast.error(msg);
    }
  }, []);

  const stopWebcam = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
  }, []);

  // Clean up webcam on unmount
  useEffect(() => () => stopWebcam(), [stopWebcam]);

  const startSession = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/interview/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, level }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!data.questions?.length) throw new Error("No questions returned");
      setSession({ sessionId: data.session_id ?? "demo", questions: data.questions, currentIndex: 0, answers: {} });
      setStage("session");
    } catch {
      toast.error("Failed to start session. Try again.");
    } finally {
      setLoading(false);
    }
  }, [role, level]);

  const handleFinish = useCallback(async (answers: Record<string, string>) => {
    if (!session) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/interview/${session.sessionId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers, role, level }),
      });
      const data = await res.json();
      setResults(data);
      setStage("results");
      stopWebcam();
    } catch {
      toast.error("Failed to submit. Try again.");
    } finally {
      setLoading(false);
    }
  }, [session, role, level, stopWebcam]);

  // Restore draft when question index changes
  useEffect(() => {
    if (!session) return;
    const q = session.questions[session.currentIndex];
    if (!q) return;
    const saved = typeof window !== "undefined"
      ? (localStorage.getItem(draftKey(session.sessionId, q.id)) ?? "")
      : "";
    setAnswer(saved);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.currentIndex, session?.sessionId]);

  // Autosave answer draft
  useEffect(() => {
    if (!session || typeof window === "undefined") return;
    const q = session.questions[session.currentIndex];
    if (!q) return;
    localStorage.setItem(draftKey(session.sessionId, q.id), answer);
  }, [answer, session]);

  const submitAnswer = useCallback(async () => {
    if (!session || !answer.trim()) return;
    const q = session.questions[session.currentIndex];
    const newAnswers = { ...session.answers, [q.id]: answer };
    const isLast = session.currentIndex === session.questions.length - 1;

    if (isLast) {
      // Clear all drafts for this session
      session.questions.forEach(qItem => {
        try { localStorage.removeItem(draftKey(session.sessionId, qItem.id)); } catch {}
      });
      await handleFinish(newAnswers);
    } else {
      setSession({ ...session, currentIndex: session.currentIndex + 1, answers: newAnswers });
      setAnswer("");
    }
  }, [session, answer, handleFinish]);

  return (
    <FullscreenGuard
      enabled={stage === "session"}
      sessionType="interview"
      sessionId={session?.sessionId}
    >
      <div className="p-6 max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-[var(--text-1)] tracking-tight">AI Interview 🤖</h1>
          <p className="text-[var(--text-2)] mt-1 text-sm">Practice with AI. Get instant feedback. Land your dream job.</p>
        </div>

        <AnimatePresence mode="wait">
          {/* Stage 1: Select Role */}
          {stage === "select" && (
            <motion.div key="select" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="mb-6">
                <div className="text-xs font-bold uppercase tracking-wider text-[var(--text-3)] mb-3">Choose your role</div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {ROLES.map(r => (
                    <button key={r.id} onClick={() => setRole(r.id)}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        role === r.id ? "border-brand bg-brand/10 text-brand" : "border-[var(--border)] bg-[var(--bg-2)] text-[var(--text-1)] hover:border-brand/40"
                      }`}>
                      <div className="text-2xl mb-2">{r.icon}</div>
                      <div className="text-xs font-bold">{r.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <div className="text-xs font-bold uppercase tracking-wider text-[var(--text-3)] mb-3">Experience level</div>
                <div className="flex rounded-xl border border-[var(--border)] overflow-hidden w-fit">
                  {LEVELS.map(l => (
                    <button key={l} onClick={() => setLevel(l)}
                      className={`px-6 py-2.5 text-xs font-bold capitalize transition-colors ${
                        level === l ? "bg-brand text-white" : "bg-[var(--bg-2)] text-[var(--text-2)] hover:bg-[var(--bg-3)]"
                      }`}>{l}</button>
                  ))}
                </div>
              </div>

              <div className="bg-[var(--bg-2)] rounded-2xl border border-[var(--border)] p-5 mb-6">
                <div className="text-xs font-bold uppercase tracking-wider text-[var(--text-3)] mb-3">Session overview</div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  {[["5", "Questions"], ["30 min", "Duration"], ["AI Scored", "Feedback"]].map(([val, lbl]) => (
                    <div key={lbl}>
                      <div className="text-xl font-extrabold text-brand">{val}</div>
                      <div className="text-xs text-[var(--text-3)] mt-0.5">{lbl}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-6 text-xs text-amber-300">
                <span className="font-bold">⚠️ Anti-cheat notice:</span> Fullscreen mode will be enforced during the interview. Tab switching or exiting fullscreen will be flagged.
              </div>

              <Button loading={loading} onClick={() => setStage("webcam")} className="w-full">
                Continue to Setup →
              </Button>
            </motion.div>
          )}

          {/* Stage 1.5: Webcam setup */}
          {stage === "webcam" && (
            <motion.div key="webcam" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="bg-[var(--bg-2)] rounded-2xl border border-[var(--border)] p-6 mb-6">
                <h2 className="text-base font-bold text-[var(--text-1)] mb-4">Camera & Microphone Setup</h2>
                <div className="aspect-video rounded-xl overflow-hidden bg-[var(--bg-3)] border border-[var(--border)] mb-4 flex items-center justify-center">
                  {webcamOk ? (
                    <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center text-[var(--text-3)]">
                      <div className="text-4xl mb-2">📷</div>
                      <div className="text-sm">Camera preview will appear here</div>
                    </div>
                  )}
                </div>
                {webcamOk ? (
                  <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold mb-3">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Camera & microphone ready
                  </div>
                ) : (
                  <Button onClick={requestWebcam} className="w-full mb-3">
                    {camChecked ? "Retry Camera Access" : "Enable Camera & Microphone"}
                  </Button>
                )}
                <p className="text-xs text-[var(--text-3)]">
                  Camera access helps ensure interview integrity. Your session is not recorded or stored externally.
                </p>
              </div>

              {camError && (
                <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                  <div className="font-bold mb-1">📷 Camera Access Required</div>
                  <div className="mb-2">{camError}</div>
                  <div className="text-xs text-red-500">
                    Chrome: click the 🔒 icon in the address bar → Site settings → Allow Camera and Microphone.
                  </div>
                </div>
              )}

              {!camChecked && !webcamOk && (
                <div className="mb-4 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-700 font-semibold">
                  📷 Camera and microphone access is required to continue.
                </div>
              )}
              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => setStage("select")} className="flex-1">← Back</Button>
                <Button loading={loading} onClick={startSession} disabled={!webcamOk} className="flex-[2]">
                  Start Interview →
                </Button>
              </div>
            </motion.div>
          )}

          {/* Stage 2: Session */}
          {stage === "session" && session && (
            <motion.div key="session" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              {/* Timer + progress */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 flex-1">
                  {session.questions.map((_, i) => (
                    <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${
                      i < session.currentIndex ? "bg-brand" : i === session.currentIndex ? "bg-brand/60" : "bg-[var(--bg-3)]"
                    }`} />
                  ))}
                </div>
                <div className="ml-4 flex items-center gap-2 flex-shrink-0">
                  {/* Per-question countdown */}
                  <div className={`font-mono text-xs font-bold px-2.5 py-1 rounded-lg border ${
                    questionTimer.seconds < 60
                      ? "text-red-400 bg-red-400/10 border-red-400/20 animate-pulse"
                      : questionTimer.seconds < 120
                      ? "text-amber-400 bg-amber-400/10 border-amber-400/20"
                      : "text-[var(--text-3)] bg-[var(--bg-3)] border-transparent"
                  }`}>
                    Q {questionTimer.display}
                  </div>
                  {/* Session total */}
                  <div className={`font-mono text-xs font-bold px-2.5 py-1 rounded-lg ${
                    timer.display < "05:00" ? "text-red-400 bg-red-400/10 border border-red-400/20" : "text-[var(--text-2)] bg-[var(--bg-3)]"
                  }`}>
                    ⏱ {timer.display}
                  </div>
                </div>
              </div>

              <div className="text-xs font-bold uppercase tracking-wider text-[var(--text-3)] mb-2">
                Question {session.currentIndex + 1} of {session.questions.length}
              </div>

              <AnimatePresence mode="wait">
                <motion.div key={session.currentIndex} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
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

          {/* Stage 3: Results */}
          {stage === "results" && results && (
            <motion.div key="results" initial={{ opacity: 0, scale: .96 }} animate={{ opacity: 1, scale: 1 }}>
              <div className="text-center mb-8">
                <div className="text-6xl mb-4">
                  {results.score >= 80 ? "🎉" : results.score >= 60 ? "👍" : "💪"}
                </div>
                <div className="text-5xl font-extrabold text-brand mb-2">
                  {Number(results.score ?? 0)}<span className="text-2xl text-[var(--text-3)]">/100</span>
                </div>
                <div className="text-[var(--text-2)] text-sm">Overall Interview Score</div>
              </div>

              <div className="bg-[var(--bg-2)] rounded-2xl border border-[var(--border)] p-5 mb-5">
                <div className="text-xs font-bold uppercase tracking-wider text-[var(--text-3)] mb-3">Score Breakdown</div>
                <div className="space-y-3">
                  {Object.entries(results.breakdown ?? {}).map(([key, val]) => (
                    <div key={key}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-semibold text-[var(--text-2)] capitalize">{key.replace("_", " ")}</span>
                        <span className="font-bold text-brand">{Number(val ?? 0)}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-[var(--bg-3)] overflow-hidden">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-brand to-brand/60"
                          initial={{ width: 0 }}
                          animate={{ width: `${Number(val ?? 0)}%` }}
                          transition={{ duration: .8, ease: "easeOut" }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[var(--bg-2)] rounded-2xl border border-[var(--border)] p-5 mb-6">
                <div className="text-xs font-bold uppercase tracking-wider text-[var(--text-3)] mb-2">AI Feedback</div>
                <p className="text-sm text-[var(--text-2)] leading-relaxed">{results.feedback ?? "No feedback available."}</p>
              </div>

              <Button variant="secondary" onClick={() => { setStage("select"); setResults(null); setSession(null); setAnswer(""); }} className="w-full">
                Try Another Session
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </FullscreenGuard>
  );
}
