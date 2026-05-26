"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import toast from "react-hot-toast";
import type { Challenge, Submission, SupportedLanguageId } from "@upgradian/types";
import { SUPPORTED_LANGUAGES } from "@upgradian/types";
import { DifficultyBadge, StatusBadge, Button } from "@upgradian/ui";
import { useGameStore } from "@/store/gameStore";
import { FullscreenGuard } from "@/components/anti-cheat/FullscreenGuard";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

const CONTEST_DURATION_SEC = 45 * 60;

interface Props {
  challenge:    Challenge;
  submissions:  Partial<Submission>[];
  contestMode?: boolean;
}

function useContestTimer(active: boolean) {
  const [seconds, setSeconds] = useState(CONTEST_DURATION_SEC);
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setSeconds(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [active]);
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return { display: `${m}:${s}`, expired: seconds === 0, seconds };
}

function getDraftKey(challengeId: string, lang: string) {
  return `draft:${challengeId}:${lang}`;
}

export function ChallengeEditor({ challenge, submissions, contestMode = false }: Props) {
  const defaultLang = (challenge.language ?? "python") as SupportedLanguageId;
  const defaultCode = challenge.starter_code ?? "# Write your solution here\n";

  const [lang,    setLang]    = useState<SupportedLanguageId>(defaultLang);
  const [code,    setCode]    = useState(() => {
    if (typeof window === "undefined") return defaultCode;
    return localStorage.getItem(getDraftKey(challenge.id, defaultLang)) ?? defaultCode;
  });
  const [running, setRunning] = useState(false);
  const [result,  setResult]  = useState<{
    status: string; output?: string; runtime?: number; memory?: number;
    xp_earned?: number; is_first_solve?: boolean;
  } | null>(null);
  const [tab,     setTab]     = useState<"problem" | "submissions">("problem");
  const [monacoTheme, setMonacoTheme] = useState("vs");
  const xpPopRef = useRef<HTMLDivElement>(null);
  const addXP = useGameStore(s => s.addXP);
  const timer = useContestTimer(contestMode);

  // Sync Monaco theme with page theme
  useEffect(() => {
    const check = () => {
      const dark = document.documentElement.getAttribute("data-theme") === "dark";
      setMonacoTheme(dark ? "vs-dark" : "vs");
    };
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, []);

  // Auto-save code draft to localStorage on every change
  useEffect(() => {
    if (typeof window === "undefined") return;
    const key = getDraftKey(challenge.id, lang);
    localStorage.setItem(key, code);
  }, [code, lang, challenge.id]);

  // Load draft when language switches
  const handleLangChange = useCallback((next: SupportedLanguageId) => {
    if (next === lang) return;
    if (next !== defaultLang) {
      toast(`⚠️ Switching to ${next}. Challenge test cases are written for ${defaultLang}.`, { icon: "⚠️", duration: 4000 });
    }
    const saved = typeof window !== "undefined"
      ? (localStorage.getItem(getDraftKey(challenge.id, next)) ?? challenge.starter_code ?? "")
      : (challenge.starter_code ?? "");
    setLang(next);
    setCode(saved);
  }, [lang, defaultLang, challenge]);

  // Auto-submit on contest timer expiry
  useEffect(() => {
    if (timer.expired && contestMode && !running && !result) {
      toast.error("⏰ Time's up! Submitting your code.");
      void handleRun();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timer.expired]);

  const handleRun = useCallback(async () => {
    if (running) return;
    setRunning(true);
    setResult(null);
    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challenge_id: challenge.id, code, language: lang }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error ?? `HTTP ${res.status}`);
      }
      const data = await res.json();
      setResult(data);

      if (data.status === "accepted") {
        const xp = Number(data.xp_earned ?? 0);
        if (xp > 0) {
          addXP(xp);
          toast.success(`✅ Accepted! +${xp} XP`);
        } else {
          toast.success("✅ Accepted! (XP already earned for this challenge)");
        }
        // Clear draft on successful solve
        try { localStorage.removeItem(getDraftKey(challenge.id, lang)); } catch {}
      } else {
        toast.error(`❌ ${String(data.status ?? "Error").replace(/_/g, " ")}`);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Submission failed. Try again.");
    } finally {
      setRunning(false);
    }
  }, [challenge, code, lang, addXP, running]);

  const handleReset = useCallback(() => {
    setCode(challenge.starter_code ?? "");
    try { localStorage.removeItem(getDraftKey(challenge.id, lang)); } catch {}
  }, [challenge, lang]);

  const accepted = result?.status === "accepted";

  return (
    <FullscreenGuard enabled={contestMode} sessionType="coding">
      <div className={`h-[calc(100vh-4rem)] flex flex-col lg:flex-row overflow-hidden ${contestMode ? "pt-6" : ""}`}>

        {/* Contest timer bar */}
        {contestMode && (
          <div className="absolute top-8 right-4 z-50">
            <div className={`font-mono text-sm font-bold px-3 py-1.5 rounded-xl border flex items-center gap-2 ${
              timer.seconds < 300
                ? "text-red-600 bg-red-50 border-red-200 animate-pulse"
                : "text-gray-700 bg-white border-gray-200 shadow-sm"
            }`}>
              ⏱ {timer.display}
            </div>
          </div>
        )}

        {/* ── Left: Problem ── */}
        <div className="w-full lg:w-[420px] flex-shrink-0 flex flex-col border-r border-[var(--border)] overflow-y-auto bg-[var(--bg-1)]">
          {/* Tabs */}
          <div className="flex border-b border-[var(--border)] bg-[var(--bg-2)]">
            {(["problem", "submissions"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${
                  tab === t
                    ? "text-brand border-b-2 border-brand bg-[var(--bg-1)]"
                    : "text-[var(--text-3)] hover:text-[var(--text-2)]"
                }`}>
                {t}
              </button>
            ))}
          </div>

          {tab === "problem" && (
            <div className="p-6 space-y-4">
              <div className="flex items-start gap-3">
                <div className="text-2xl">{SUPPORTED_LANGUAGES.find(l => l.id === challenge.language)?.icon ?? "💻"}</div>
                <div>
                  <h1 className="text-lg font-extrabold text-[var(--text-1)] tracking-tight">{challenge.title}</h1>
                  <div className="flex gap-2 mt-1.5 flex-wrap">
                    <DifficultyBadge difficulty={challenge.difficulty} />
                    <span className="text-xs font-bold text-brand bg-brand/10 border border-brand/25 px-2 py-0.5 rounded-md">
                      ⚡ {challenge.xp_reward} XP
                    </span>
                    {contestMode && (
                      <span className="text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-md animate-pulse">
                        🔴 LIVE
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="prose prose-sm max-w-none text-[var(--text-2)] leading-relaxed text-sm">
                <div dangerouslySetInnerHTML={{ __html: (challenge.description ?? "").replace(/\n/g, "<br/>") }} />
              </div>

              {Array.isArray(challenge.tags) && challenge.tags.length > 0 && (
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-[var(--text-3)] mb-2">Tags</div>
                  <div className="flex gap-1.5 flex-wrap">
                    {challenge.tags.map(t => (
                      <span key={t} className="px-2.5 py-0.5 rounded-lg bg-[var(--bg-3)] border border-[var(--border)] text-xs font-semibold text-[var(--text-2)]">{t}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-[var(--bg-2)] border border-[var(--border)] rounded-xl p-3 text-xs text-[var(--text-3)] space-y-1">
                <div>⏱ Time limit: {challenge.time_limit_ms ?? 2000} ms</div>
                <div>💾 Memory limit: {challenge.memory_limit_mb ?? 256} MB</div>
                <div>🔤 Default language: <span className="font-semibold text-[var(--text-2)]">{defaultLang}</span></div>
              </div>
            </div>
          )}

          {tab === "submissions" && (
            <div className="divide-y divide-[var(--border)]">
              {(!Array.isArray(submissions) || submissions.length === 0) && (
                <div className="p-8 text-center text-[var(--text-3)] text-sm">No submissions yet.</div>
              )}
              {(Array.isArray(submissions) ? submissions : []).map((sub, i) => (
                <div key={sub.id ?? i} className="px-4 py-3 flex items-center justify-between">
                  <StatusBadge status={sub.status ?? "pending"} />
                  <div className="text-right text-xs text-[var(--text-3)]">
                    {sub.runtime_ms != null && <span>{sub.runtime_ms} ms · </span>}
                    {Number(sub.xp_earned ?? 0) > 0
                      ? <span className="text-brand font-bold">+{sub.xp_earned} XP</span>
                      : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Right: Editor ── */}
        <div className="flex-1 flex flex-col overflow-hidden bg-[var(--bg-1)]">
          {/* Toolbar */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--border)] bg-[var(--bg-2)]">
            <select
              value={lang}
              onChange={e => handleLangChange(e.target.value as SupportedLanguageId)}
              className="px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--bg-1)] text-[var(--text-1)] text-xs font-semibold outline-none focus:border-brand"
            >
              {SUPPORTED_LANGUAGES.map(l => (
                <option key={l.id} value={l.id}>{l.icon} {l.label}</option>
              ))}
            </select>
            <div className="flex gap-2">
              <Button variant="secondary" size="xs" onClick={handleReset}>Reset</Button>
              <Button size="sm" loading={running} onClick={handleRun} disabled={timer.expired && contestMode}>
                {running ? "Running…" : "▶ Run & Submit"}
              </Button>
            </div>
          </div>

          {/* Monaco */}
          <div className="flex-1 min-h-0">
            <MonacoEditor
              height="100%"
              language={lang === "cpp" ? "cpp" : lang}
              value={code}
              onChange={v => setCode(v ?? "")}
              theme={monacoTheme}
              options={{
                fontSize: 14,
                fontFamily: "Fira Code, Courier New, monospace",
                fontLigatures: true,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                tabSize: 2,
                automaticLayout: true,
                lineNumbers: "on",
                bracketPairColorization: { enabled: true },
                readOnly: timer.expired && contestMode,
              }}
            />
          </div>

          {/* Result panel */}
          {result && (
            <div className={`border-t border-[var(--border)] p-4 text-sm transition-all ${
              accepted ? "bg-emerald-50 border-t-emerald-200" : "bg-red-50 border-t-red-100"
            }`}>
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <StatusBadge status={result.status} />
                {result.runtime != null && (
                  <span className="text-xs text-[var(--text-3)]">⏱ {result.runtime} ms</span>
                )}
                {result.memory != null && (
                  <span className="text-xs text-[var(--text-3)]">💾 {Number(result.memory).toFixed(1)} MB</span>
                )}
                {Number(result.xp_earned ?? 0) > 0 && (
                  <span className="text-xs font-bold text-brand">+{result.xp_earned} XP earned</span>
                )}
                {accepted && Number(result.xp_earned ?? 0) === 0 && (
                  <span className="text-xs text-gray-500">(already solved — no XP)</span>
                )}
              </div>

              {result.output && (
                <pre className="text-xs text-[var(--text-2)] bg-[var(--bg-3)] border border-[var(--border)] rounded-lg p-3 overflow-x-auto max-h-24 mb-3">
                  {result.output}
                </pre>
              )}

              {/* Auto-next CTA after accepted */}
              {accepted && (
                <div className="flex items-center gap-3 mt-2">
                  <Link
                    href="/arena"
                    className="flex-1 py-2 rounded-xl text-center text-sm font-bold text-white transition-all hover:-translate-y-px"
                    style={{ background: "linear-gradient(135deg, #4361ee, #7c3aed)" }}
                  >
                    Next Challenge →
                  </Link>
                  <button
                    onClick={() => setResult(null)}
                    className="px-4 py-2 rounded-xl text-sm font-semibold border border-[var(--border)] text-[var(--text-2)] hover:bg-[var(--bg-2)] transition-colors"
                  >
                    Retry
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* XP pop anchor */}
        <div ref={xpPopRef} className="fixed bottom-20 right-6 pointer-events-none" />
      </div>
    </FullscreenGuard>
  );
}
