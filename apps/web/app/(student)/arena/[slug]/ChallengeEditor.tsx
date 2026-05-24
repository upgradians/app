"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import toast from "react-hot-toast";
import type { Challenge, Submission, SupportedLanguageId } from "@upgradian/types";
import { SUPPORTED_LANGUAGES } from "@upgradian/types";
import { DifficultyBadge, StatusBadge, Button } from "@upgradian/ui";
import { useGameStore } from "@/store/gameStore";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

interface Props {
  challenge:   Challenge;
  submissions: Partial<Submission>[];
}

export function ChallengeEditor({ challenge, submissions }: Props) {
  const langMeta   = SUPPORTED_LANGUAGES.find(l => l.id === challenge.language)!;
  const [code,     setCode]     = useState(challenge.starter_code ?? "# Write your solution here\n");
  const [lang,     setLang]     = useState<SupportedLanguageId>(challenge.language as SupportedLanguageId);
  const [running,  setRunning]  = useState(false);
  const [result,   setResult]   = useState<{ status: string; output?: string; runtime?: number; memory?: number } | null>(null);
  const [tab,      setTab]      = useState<"problem" | "submissions">("problem");
  const addXP = useGameStore(s => s.addXP);

  const handleRun = useCallback(async () => {
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
        throw new Error(err.error ?? `HTTP ${res.status}`);
      }
      const data = await res.json();
      setResult(data);
      if (data.status === "accepted") {
        addXP(data.xp_earned ?? challenge.xp_reward);
        toast.success(`✅ Accepted! +${data.xp_earned ?? challenge.xp_reward} XP`);
      } else {
        toast.error(`❌ ${(data.status as string).replace(/_/g, " ")}`);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Submission failed. Try again.");
    } finally {
      setRunning(false);
    }
  }, [challenge, code, lang, addXP]);

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col lg:flex-row overflow-hidden">
      {/* ── Left: Problem ── */}
      <div className="w-full lg:w-[420px] flex-shrink-0 flex flex-col border-r border-[var(--border)] overflow-y-auto">
        {/* Tabs */}
        <div className="flex border-b border-[var(--border)]">
          {(["problem", "submissions"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${
                tab === t ? "text-brand border-b-2 border-brand" : "text-[var(--text-3)] hover:text-[var(--text-2)]"
              }`}>
              {t}
            </button>
          ))}
        </div>

        {tab === "problem" && (
          <div className="p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="text-2xl">{langMeta?.icon ?? "💻"}</div>
              <div>
                <h1 className="text-lg font-extrabold text-[var(--text-1)] tracking-tight">{challenge.title}</h1>
                <div className="flex gap-2 mt-1.5">
                  <DifficultyBadge difficulty={challenge.difficulty} />
                  <span className="text-xs font-bold text-brand bg-brand/10 border border-brand/25 px-2 py-0.5 rounded-md">
                    ⚡ {challenge.xp_reward} XP
                  </span>
                </div>
              </div>
            </div>

            <div className="prose prose-sm max-w-none text-[var(--text-2)] leading-relaxed">
              <div dangerouslySetInnerHTML={{ __html: challenge.description.replace(/\n/g, "<br/>") }} />
            </div>

            {challenge.tags?.length > 0 && (
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-[var(--text-3)] mb-2">Tags</div>
                <div className="flex gap-1.5 flex-wrap">
                  {challenge.tags.map(t => (
                    <span key={t} className="px-2.5 py-0.5 rounded-lg bg-[var(--bg-3)] text-xs font-semibold text-[var(--text-2)]">{t}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Constraints */}
            <div className="bg-[var(--bg-2)] rounded-xl p-3 text-xs text-[var(--text-3)] space-y-1">
              <div>⏱ Time limit: {challenge.time_limit_ms} ms</div>
              <div>💾 Memory limit: {challenge.memory_limit_mb} MB</div>
            </div>
          </div>
        )}

        {tab === "submissions" && (
          <div className="divide-y divide-[var(--border)]">
            {submissions.length === 0 && (
              <div className="p-8 text-center text-[var(--text-3)] text-sm">No submissions yet.</div>
            )}
            {submissions.map(sub => (
              <div key={sub.id} className="px-4 py-3 flex items-center justify-between">
                <StatusBadge status={sub.status ?? "pending"} />
                <div className="text-right text-xs text-[var(--text-3)]">
                  {sub.runtime_ms && <span>{sub.runtime_ms} ms</span>}
                  {sub.xp_earned ? <span className="ml-2 text-brand font-bold">+{sub.xp_earned} XP</span> : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Right: Editor ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Editor toolbar */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--border)] bg-[var(--bg-2)]">
          <select value={lang} onChange={e => setLang(e.target.value as SupportedLanguageId)}
            className="px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--bg-3)] text-[var(--text-1)] text-xs font-semibold outline-none focus:border-brand">
            {SUPPORTED_LANGUAGES.map(l => (
              <option key={l.id} value={l.id}>{l.icon} {l.label}</option>
            ))}
          </select>
          <div className="flex gap-2">
            <Button variant="secondary" size="xs" onClick={() => setCode(challenge.starter_code ?? "")}>Reset</Button>
            <Button size="sm" loading={running} onClick={handleRun}>
              {running ? "Running…" : "▶ Run & Submit"}
            </Button>
          </div>
        </div>

        {/* Monaco */}
        <div className="flex-1">
          <MonacoEditor
            height="100%"
            language={lang === "cpp" ? "cpp" : lang === "javascript" ? "javascript" : lang}
            value={code}
            onChange={v => setCode(v ?? "")}
            theme="vs-dark"
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
            }}
          />
        </div>

        {/* Result panel */}
        {result && (
          <div className={`border-t border-[var(--border)] p-4 text-sm font-mono transition-all ${
            result.status === "accepted" ? "bg-emerald-500/5" : "bg-red-500/5"
          }`}>
            <div className="flex items-center gap-3 mb-2">
              <StatusBadge status={result.status} />
              {result.runtime  && <span className="text-xs text-[var(--text-3)]">⏱ {result.runtime} ms</span>}
              {result.memory   && <span className="text-xs text-[var(--text-3)]">💾 {result.memory?.toFixed(1)} MB</span>}
            </div>
            {result.output && (
              <pre className="text-xs text-[var(--text-2)] bg-[var(--bg-3)] rounded-lg p-3 overflow-x-auto max-h-24">
                {result.output}
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
