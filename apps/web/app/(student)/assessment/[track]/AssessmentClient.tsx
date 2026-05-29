"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import type { AssessmentTrack } from "@/lib/assessment-questions";

type Stage = "preflight" | "testing" | "results";

interface PermState { camera: boolean; mic: boolean; error: string }
interface ViolationAlert { id: number; msg: string }
interface Result {
  score: number;
  total: number;
  percentage: number;
  status: "completed" | "disqualified";
  tabSwitches: number;
  noiseViolations: number;
  timeTakenSecs: number;
}

const NOISE_THRESHOLD = 0.09; // RMS amplitude (0-1); ~10% = audible speech
const MAX_NOISE_WARNINGS = 2;  // 3rd violation auto-disqualifies

export function AssessmentClient({ track }: { track: AssessmentTrack }) {
  const [stage, setStage]         = useState<Stage>("preflight");
  const [perm, setPerm]           = useState<PermState>({ camera: false, mic: false, error: "" });
  const [fsActive, setFsActive]   = useState(false);

  // Testing state
  const [currentQ,   setCurrentQ]   = useState(0);
  const [answers,    setAnswers]     = useState<Record<number, number>>({});
  const [timeLeft,   setTimeLeft]    = useState(track.duration * 60);
  const [noiseWarn,  setNoiseWarn]   = useState(0);
  const [tabCount,   setTabCount]    = useState(0);
  const [alerts,    setAlerts]    = useState<ViolationAlert[]>([]);
  const [submitted, setSubmitted] = useState(false);

  // Results state
  const [result,    setResult]    = useState<Result | null>(null);
  const [saving,    setSaving]    = useState(false);
  const [saveError, setSaveError] = useState("");

  // Refs
  const videoRef        = useRef<HTMLVideoElement>(null);
  const mediaStreamRef  = useRef<MediaStream | null>(null);
  const audioCtxRef     = useRef<AudioContext | null>(null);
  const analyserRef     = useRef<AnalyserNode | null>(null);
  const noiseTimerRef   = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef        = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef    = useRef<number>(0);
  const noiseWarnRef    = useRef(0);   // mirror for use inside intervals
  const submittedRef    = useRef(false);

  // ─── Helpers ────────────────────────────────────────────────

  const pushAlert = useCallback((msg: string) => {
    const id = Date.now();
    setAlerts(a => [...a.slice(-2), { id, msg }]);
    setTimeout(() => setAlerts(a => a.filter(x => x.id !== id)), 5000);
  }, []);

  const stopMonitoring = useCallback(() => {
    if (noiseTimerRef.current) clearInterval(noiseTimerRef.current);
    if (timerRef.current)      clearInterval(timerRef.current);
    if (audioCtxRef.current)   void audioCtxRef.current.close();
    if (mediaStreamRef.current) mediaStreamRef.current.getTracks().forEach(t => t.stop());
    noiseTimerRef.current = null;
    timerRef.current      = null;
    audioCtxRef.current   = null;
  }, []);

  const computeAndSubmit = useCallback(async (
    currentAnswers: Record<number, number>,
    status: "completed" | "disqualified",
    noiseCount: number,
    tabCount: number,
  ) => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    setSubmitted(true);
    stopMonitoring();

    const timeTaken = Math.round((Date.now() - startTimeRef.current) / 1000);
    const score = track.questions.reduce(
      (acc, q, i) => acc + (currentAnswers[i] === q.ans ? 1 : 0),
      0
    );
    const pct = Math.round((score / track.questions.length) * 100 * 100) / 100;

    const res: Result = {
      score, total: track.questions.length, percentage: pct,
      status, tabSwitches: tabCount, noiseViolations: noiseCount, timeTakenSecs: timeTaken,
    };
    setResult(res);
    setStage("results");

    // Exit fullscreen
    try { if (document.fullscreenElement) await document.exitFullscreen(); } catch {}

    // Save to Supabase via API
    setSaving(true);
    try {
      const resp = await fetch("/api/assessment/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          track: track.slug, score, total_questions: track.questions.length,
          percentage: pct, status, tab_switches: tabCount,
          noise_violations: noiseCount, time_taken_secs: timeTaken,
        }),
      });
      if (!resp.ok) setSaveError("Results not saved — please screenshot this page.");
    } catch {
      setSaveError("Network error — results not saved.");
    } finally {
      setSaving(false);
    }
  }, [track, stopMonitoring]);

  // ─── Proctoring effects (active only during 'testing') ──────

  useEffect(() => {
    if (stage !== "testing") return;

    // Fullscreen change
    const onFsChange = () => {
      const inFs = !!document.fullscreenElement;
      setFsActive(inFs);
      if (!inFs && !submittedRef.current) {
        pushAlert("⚠️ Full-screen exited! Please stay in full-screen during the test.");
        // Attempt re-enter
        void document.documentElement.requestFullscreen().catch(() => null);
      }
    };

    // Tab switch / window blur
    const onVisChange = () => {
      if (document.visibilityState === "hidden" && !submittedRef.current) {
        setTabCount(c => { const n = c + 1; pushAlert(`⚠️ Tab switch detected (${n}). Stay on this page.`); return n; });
      }
    };
    const onBlur = () => {
      if (!submittedRef.current) {
        setTabCount(c => { const n = c + 1; pushAlert(`⚠️ Window lost focus (${n}). Return to the test.`); return n; });
      }
    };

    document.addEventListener("fullscreenchange", onFsChange);
    document.addEventListener("visibilitychange", onVisChange);
    window.addEventListener("blur", onBlur);

    return () => {
      document.removeEventListener("fullscreenchange", onFsChange);
      document.removeEventListener("visibilitychange", onVisChange);
      window.removeEventListener("blur", onBlur);
    };
  }, [stage, pushAlert]);

  // Countdown timer
  useEffect(() => {
    if (stage !== "testing") return;
    startTimeRef.current = Date.now();
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          if (!submittedRef.current) {
            void computeAndSubmit(answers, "completed", noiseWarnRef.current, tabCount);
          }
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  // Audio monitoring
  useEffect(() => {
    if (stage !== "testing" || !analyserRef.current) return;
    const analyser = analyserRef.current;
    const buf = new Uint8Array(analyser.fftSize);

    noiseTimerRef.current = setInterval(() => {
      if (submittedRef.current) return;
      analyser.getByteTimeDomainData(buf);
      let sumSq = 0;
      for (const byte of buf) { const n = (byte - 128) / 128; sumSq += n * n; }
      const rms = Math.sqrt(sumSq / buf.length);

      if (rms > NOISE_THRESHOLD) {
        const next = noiseWarnRef.current + 1;
        noiseWarnRef.current = next;
        setNoiseWarn(next);

        if (next > MAX_NOISE_WARNINGS) {
          pushAlert("🚫 Noise limit exceeded — test disqualified.");
          void computeAndSubmit(answers, "disqualified", next, tabCount);
        } else {
          pushAlert(`🔊 Noise warning ${next}/${MAX_NOISE_WARNINGS + 1} — reduce background noise.`);
        }
      }
    }, 2000);

    return () => { if (noiseTimerRef.current) clearInterval(noiseTimerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  // Cleanup on unmount
  useEffect(() => () => stopMonitoring(), [stopMonitoring]);

  // ─── Preflight: request camera + mic ────────────────────────

  const requestPermissions = async () => {
    setPerm(p => ({ ...p, error: "" }));
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      mediaStreamRef.current = stream;
      if (videoRef.current) { videoRef.current.srcObject = stream; }

      // Set up audio analyser
      const ctx      = new AudioContext();
      const source   = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      source.connect(analyser);
      audioCtxRef.current  = ctx;
      analyserRef.current  = analyser;

      setPerm({ camera: true, mic: true, error: "" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Permission denied";
      setPerm(p => ({ ...p, error: `Camera/Mic access denied: ${msg}` }));
    }
  };

  const enterFullscreenAndStart = async () => {
    try {
      await document.documentElement.requestFullscreen();
      setFsActive(true);
    } catch {
      // Non-fatal — still allow start
    }
    submittedRef.current = false;
    noiseWarnRef.current = 0;
    setStage("testing");
  };

  // ─── Submit manually ────────────────────────────────────────

  const handleManualSubmit = () => {
    void computeAndSubmit(answers, "completed", noiseWarnRef.current, tabCount);
  };

  // ─── Timer display ──────────────────────────────────────────

  const mins = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const secs = String(timeLeft % 60).padStart(2, "0");
  const timerUrgent = timeLeft <= 300; // last 5 minutes

  // ─── Render ─────────────────────────────────────────────────

  if (stage === "preflight") {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6">
        <div className="w-full max-w-lg">
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-6 py-5 border-b border-gray-100">
              <h1 className="font-extrabold text-gray-900 text-lg">{track.label} Assessment</h1>
              <p className="text-gray-500 text-sm mt-0.5">
                {track.questions.length} questions · {track.duration} minutes · Proctored
              </p>
            </div>

            {/* Camera preview */}
            <div className="relative bg-gray-900 aspect-video">
              <video ref={videoRef} autoPlay muted playsInline
                className="w-full h-full object-cover" />
              {!perm.camera && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white/50 text-sm gap-2">
                  <span className="text-4xl">📷</span>
                  <span>Camera preview will appear here</span>
                </div>
              )}
            </div>

            <div className="px-6 py-5 space-y-4">
              {/* Permission status */}
              <div className="space-y-2">
                <PermRow label="Camera" granted={perm.camera} />
                <PermRow label="Microphone" granted={perm.mic} />
                <PermRow label="Full-Screen" granted={fsActive} />
              </div>

              {perm.error && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-2">
                  {perm.error}
                </p>
              )}

              {!perm.camera && (
                <button onClick={requestPermissions}
                  className="w-full py-2.5 rounded-xl bg-gray-900 text-white text-sm font-bold hover:bg-gray-800 transition-colors">
                  Allow Camera & Microphone
                </button>
              )}

              {perm.camera && perm.mic && (
                <button onClick={enterFullscreenAndStart}
                  className="w-full py-2.5 rounded-xl bg-orange-500 text-white text-sm font-bold hover:bg-orange-600 transition-colors">
                  Enter Full-Screen & Start Test
                </button>
              )}

              <p className="text-[11px] text-gray-400 text-center leading-relaxed">
                By starting, you agree that the test is proctored. Excessive noise or tab switches
                will trigger warnings. 3 noise violations = automatic disqualification.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (stage === "testing") {
    const q = track.questions[currentQ];
    const isLast = currentQ === track.questions.length - 1;
    const answered = Object.keys(answers).length;

    return (
      <div className="fixed inset-0 bg-white z-50 flex flex-col">

        {/* ── Header bar ── */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-white flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="font-bold text-gray-900 text-sm">{track.label}</span>
            <span className="text-xs text-gray-400">{answered}/{track.questions.length} answered</span>
          </div>

          {/* Timer */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-mono text-sm font-bold transition-colors ${
            timerUrgent ? "bg-red-50 border-red-300 text-red-600 animate-pulse" : "bg-gray-50 border-gray-200 text-gray-700"
          }`}>
            ⏱ {mins}:{secs}
          </div>

          {/* Violation indicators */}
          <div className="flex items-center gap-3 text-xs">
            {noiseWarn > 0 && (
              <span className="px-2 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 font-semibold">
                🔊 {noiseWarn}/{MAX_NOISE_WARNINGS + 1} noise
              </span>
            )}
            {tabCount > 0 && (
              <span className="px-2 py-1 rounded-lg bg-red-50 border border-red-200 text-red-700 font-semibold">
                ↔ {tabCount} tab switch{tabCount > 1 ? "es" : ""}
              </span>
            )}
          </div>
        </div>

        {/* ── Progress bar ── */}
        <div className="h-1 bg-gray-100 flex-shrink-0">
          <div
            className="h-full bg-orange-500 transition-all duration-300"
            style={{ width: `${((currentQ + 1) / track.questions.length) * 100}%` }}
          />
        </div>

        {/* ── Question area ── */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto px-6 py-8">
            <div className="mb-2 text-xs font-semibold text-orange-500 uppercase tracking-wider">
              Question {currentQ + 1} of {track.questions.length}
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-6 leading-relaxed">{q.q}</h2>

            <div className="space-y-3">
              {q.opts.map((opt, i) => {
                const selected = answers[currentQ] === i;
                return (
                  <button
                    key={i}
                    onClick={() => setAnswers(a => ({ ...a, [currentQ]: i }))}
                    className={`w-full text-left px-5 py-4 rounded-2xl border text-sm font-medium transition-all ${
                      selected
                        ? "bg-orange-50 border-orange-400 text-orange-900"
                        : "bg-white border-gray-200 text-gray-700 hover:border-orange-300 hover:bg-orange-50/50"
                    }`}
                  >
                    <span className={`inline-flex w-6 h-6 items-center justify-center rounded-full text-xs font-bold mr-3 flex-shrink-0 ${
                      selected ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-500"
                    }`}>
                      {String.fromCharCode(65 + i)}
                    </span>
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Navigation footer ── */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-white flex-shrink-0">
          <button
            onClick={() => setCurrentQ(q => Math.max(0, q - 1))}
            disabled={currentQ === 0}
            className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-40"
          >
            ← Previous
          </button>

          <div className="flex items-center gap-1 overflow-x-auto max-w-xs">
            {track.questions.map((_, i) => (
              <button key={i} onClick={() => setCurrentQ(i)}
                className={`w-6 h-6 rounded-lg text-[10px] font-bold flex-shrink-0 transition-colors ${
                  i === currentQ ? "bg-orange-500 text-white" :
                  answers[i] !== undefined ? "bg-orange-100 text-orange-700" :
                  "bg-gray-100 text-gray-400 hover:bg-gray-200"
                }`}>
                {i + 1}
              </button>
            ))}
          </div>

          {isLast ? (
            <button
              onClick={handleManualSubmit}
              disabled={submitted}
              className="px-5 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-bold hover:bg-orange-600 transition-colors disabled:opacity-50"
            >
              Submit Test
            </button>
          ) : (
            <button
              onClick={() => setCurrentQ(q => Math.min(track.questions.length - 1, q + 1))}
              className="px-5 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition-colors"
            >
              Next →
            </button>
          )}
        </div>

        {/* ── Violation alerts overlay ── */}
        <div className="fixed top-16 right-4 z-[60] space-y-2 pointer-events-none">
          <AnimatePresence>
            {alerts.map(a => (
              <motion.div key={a.id}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 40 }}
                className="bg-red-600 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-xl max-w-xs">
                {a.msg}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // ─── Results ────────────────────────────────────────────────

  if (!result) return null;

  const passed = result.percentage >= 60;

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-lg"
        >
          {/* Status banner */}
          <div className={`px-6 py-5 text-center ${
            result.status === "disqualified"
              ? "bg-red-50 border-b border-red-100"
              : passed ? "bg-emerald-50 border-b border-emerald-100"
              : "bg-amber-50 border-b border-amber-100"
          }`}>
            <div className="text-4xl mb-2">
              {result.status === "disqualified" ? "🚫" : passed ? "🎉" : "📋"}
            </div>
            <h2 className="font-extrabold text-gray-900 text-xl">
              {result.status === "disqualified" ? "Test Disqualified" : "Test Complete"}
            </h2>
            <span className={`inline-flex mt-2 px-3 py-1 rounded-full text-xs font-bold border ${
              result.status === "disqualified"
                ? "bg-red-100 text-red-700 border-red-200"
                : passed ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                : "bg-amber-100 text-amber-700 border-amber-200"
            }`}>
              {result.status === "disqualified" ? "DISQUALIFIED" : passed ? "PASSED" : "NEEDS IMPROVEMENT"}
            </span>
          </div>

          <div className="px-6 py-6">
            {/* Score */}
            <div className="text-center mb-6">
              <div className="text-5xl font-extrabold text-gray-900 tabular-nums">
                {result.percentage.toFixed(0)}%
              </div>
              <p className="text-gray-500 text-sm mt-1">
                {result.score} / {result.total} correct
              </p>
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <StatCard label="Track" value={track.label} />
              <StatCard label="Time Taken" value={`${Math.floor(result.timeTakenSecs / 60)}m ${result.timeTakenSecs % 60}s`} />
              <StatCard label="Noise Violations" value={String(result.noiseViolations)} warn={result.noiseViolations > 0} />
              <StatCard label="Tab Switches" value={String(result.tabSwitches)} warn={result.tabSwitches > 0} />
            </div>

            {saveError && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2 mb-4">
                ⚠️ {saveError}
              </p>
            )}
            {saving && (
              <p className="text-xs text-gray-400 text-center mb-4">Saving results…</p>
            )}

            <div className="flex flex-col gap-2">
              <Link href="/assessment"
                className="w-full text-center py-2.5 rounded-xl bg-orange-500 text-white text-sm font-bold hover:bg-orange-600 transition-colors">
                Take Another Assessment
              </Link>
              <Link href="/dashboard"
                className="w-full text-center py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors">
                Back to Dashboard
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function PermRow({ label, granted }: { label: string; granted: boolean }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-sm text-gray-700">{label}</span>
      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
        granted ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-gray-50 text-gray-400 border-gray-200"
      }`}>
        {granted ? "✓ Granted" : "Required"}
      </span>
    </div>
  );
}

function StatCard({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return (
    <div className={`rounded-xl border p-3 text-center ${warn ? "bg-amber-50 border-amber-200" : "bg-gray-50 border-gray-200"}`}>
      <div className={`text-base font-bold ${warn ? "text-amber-700" : "text-gray-900"}`}>{value}</div>
      <div className="text-[11px] text-gray-400 mt-0.5">{label}</div>
    </div>
  );
}
