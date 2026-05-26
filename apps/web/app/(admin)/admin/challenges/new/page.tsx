"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { SUPPORTED_LANGUAGES } from "@upgradian/types";
import { Button } from "@upgradian/ui";

interface TestCaseRow {
  input:           string;
  expected_output: string;
  is_hidden:       boolean;
}

export default function NewChallengePage() {
  const router = useRouter();

  const [title,        setTitle]        = useState("");
  const [description,  setDescription]  = useState("");
  const [difficulty,   setDifficulty]   = useState<"easy"|"medium"|"hard">("easy");
  const [language,     setLanguage]     = useState("python");
  const [xpReward,     setXpReward]     = useState(50);
  const [timeLimitMs,  setTimeLimitMs]  = useState(2000);
  const [memLimitMb,   setMemLimitMb]   = useState(256);
  const [starterCode,  setStarterCode]  = useState("");
  const [tagsInput,    setTagsInput]    = useState("");
  const [isActive,     setIsActive]     = useState(true);
  const [testCases,    setTestCases]    = useState<TestCaseRow[]>([
    { input: "", expected_output: "", is_hidden: false },
  ]);
  const [submitting, setSubmitting] = useState(false);

  const addTestCase = useCallback(() => {
    setTestCases(prev => [...prev, { input: "", expected_output: "", is_hidden: false }]);
  }, []);

  const removeTestCase = useCallback((index: number) => {
    setTestCases(prev => prev.filter((_, i) => i !== index));
  }, []);

  const updateTestCase = useCallback(<K extends keyof TestCaseRow>(
    index: number, field: K, value: TestCaseRow[K]
  ) => {
    setTestCases(prev => prev.map((tc, i) => i === index ? { ...tc, [field]: value } : tc));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!title.trim())       return toast.error("Title is required.");
    if (!description.trim()) return toast.error("Description is required.");
    if (testCases.length === 0) return toast.error("At least one test case is required.");
    for (let i = 0; i < testCases.length; i++) {
      if (!testCases[i].expected_output.trim()) {
        return toast.error(`Test case ${i + 1} needs an expected output.`);
      }
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title:           title.trim(),
          description:     description.trim(),
          difficulty,
          language,
          xp_reward:       xpReward,
          time_limit_ms:   timeLimitMs,
          memory_limit_mb: memLimitMb,
          starter_code:    starterCode.trim() || null,
          tags:            tagsInput.split(",").map(t => t.trim()).filter(Boolean),
          is_active:       isActive,
          test_cases:      testCases,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      toast.success("Challenge created!");
      router.push("/admin/challenges");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create challenge.");
    } finally {
      setSubmitting(false);
    }
  }, [title, description, difficulty, language, xpReward, timeLimitMs, memLimitMb, starterCode, tagsInput, isActive, testCases, router]);

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <Link href="/admin/challenges" className="text-sm text-[var(--text-3)] hover:text-brand transition-colors">
          ← Challenges
        </Link>
        <span className="text-[var(--text-3)]">/</span>
        <span className="text-sm font-bold text-[var(--text-1)]">New Challenge</span>
      </div>

      <h1 className="text-2xl font-extrabold text-[var(--text-1)] tracking-tight">Create Challenge ⚔️</h1>

      <div className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-3)] mb-1.5">Title *</label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Two Sum"
            className="w-full px-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-2)] text-[var(--text-1)] text-sm outline-none focus:border-brand transition-colors"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-3)] mb-1.5">Description * (HTML supported)</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target."
            rows={6}
            className="w-full px-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-2)] text-[var(--text-1)] text-sm outline-none focus:border-brand transition-colors resize-y font-mono"
          />
        </div>

        {/* Difficulty + Language + XP */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-3)] mb-1.5">Difficulty *</label>
            <select value={difficulty} onChange={e => setDifficulty(e.target.value as "easy"|"medium"|"hard")}
              className="w-full px-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-2)] text-[var(--text-1)] text-sm outline-none focus:border-brand">
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-3)] mb-1.5">Language *</label>
            <select value={language} onChange={e => setLanguage(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-2)] text-[var(--text-1)] text-sm outline-none focus:border-brand">
              {SUPPORTED_LANGUAGES.map(l => (
                <option key={l.id} value={l.id}>{l.icon} {l.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-3)] mb-1.5">XP Reward</label>
            <input type="number" min={0} value={xpReward} onChange={e => setXpReward(Number(e.target.value))}
              className="w-full px-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-2)] text-[var(--text-1)] text-sm outline-none focus:border-brand" />
          </div>
        </div>

        {/* Time + Memory limits */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-3)] mb-1.5">Time Limit (ms)</label>
            <input type="number" min={100} value={timeLimitMs} onChange={e => setTimeLimitMs(Number(e.target.value))}
              className="w-full px-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-2)] text-[var(--text-1)] text-sm outline-none focus:border-brand" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-3)] mb-1.5">Memory Limit (MB)</label>
            <input type="number" min={16} value={memLimitMb} onChange={e => setMemLimitMb(Number(e.target.value))}
              className="w-full px-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-2)] text-[var(--text-1)] text-sm outline-none focus:border-brand" />
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-3)] mb-1.5">Tags (comma-separated)</label>
          <input
            value={tagsInput}
            onChange={e => setTagsInput(e.target.value)}
            placeholder="arrays, hash-map, two-pointers"
            className="w-full px-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-2)] text-[var(--text-1)] text-sm outline-none focus:border-brand transition-colors"
          />
        </div>

        {/* Starter code */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-3)] mb-1.5">Starter Code (optional)</label>
          <textarea
            value={starterCode}
            onChange={e => setStarterCode(e.target.value)}
            placeholder="def twoSum(nums, target):\n    pass"
            rows={5}
            className="w-full px-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-2)] text-[var(--text-1)] text-sm outline-none focus:border-brand transition-colors resize-y font-mono"
          />
        </div>

        {/* Active toggle */}
        <div className="flex items-center gap-3">
          <input type="checkbox" id="is_active" checked={isActive} onChange={e => setIsActive(e.target.checked)}
            className="w-4 h-4 accent-brand" />
          <label htmlFor="is_active" className="text-sm font-semibold text-[var(--text-2)]">Publish immediately (is_active)</label>
        </div>

        {/* Test cases */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-3)]">Test Cases *</label>
            <button onClick={addTestCase}
              className="text-xs font-bold text-brand hover:underline">
              + Add Test Case
            </button>
          </div>
          <div className="space-y-3">
            {testCases.map((tc, i) => (
              <div key={i} className="bg-[var(--bg-2)] border border-[var(--border)] rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[var(--text-2)]">Test Case {i + 1}</span>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-3)] cursor-pointer">
                      <input type="checkbox" checked={tc.is_hidden} onChange={e => updateTestCase(i, "is_hidden", e.target.checked)}
                        className="w-3.5 h-3.5 accent-brand" />
                      Hidden
                    </label>
                    {testCases.length > 1 && (
                      <button onClick={() => removeTestCase(i)} className="text-xs text-red-400 hover:text-red-600 font-bold">
                        Remove
                      </button>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-[10px] font-bold text-[var(--text-3)] uppercase mb-1">Input (stdin)</div>
                    <textarea
                      value={tc.input}
                      onChange={e => updateTestCase(i, "input", e.target.value)}
                      placeholder="[2,7,11,15]\n9"
                      rows={3}
                      className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg-3)] text-[var(--text-1)] text-xs outline-none focus:border-brand resize-none font-mono"
                    />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-[var(--text-3)] uppercase mb-1">Expected Output *</div>
                    <textarea
                      value={tc.expected_output}
                      onChange={e => updateTestCase(i, "expected_output", e.target.value)}
                      placeholder="[0,1]"
                      rows={3}
                      className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg-3)] text-[var(--text-1)] text-xs outline-none focus:border-brand resize-none font-mono"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-3 pt-2">
          <Button variant="secondary" onClick={() => router.push("/admin/challenges")} className="flex-1">
            Cancel
          </Button>
          <Button loading={submitting} onClick={handleSubmit} className="flex-[2]">
            Create Challenge
          </Button>
        </div>
      </div>
    </div>
  );
}
