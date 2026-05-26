"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface FullscreenGuardProps {
  children: React.ReactNode;
  maxWarnings?: number;
  onDisqualify?: () => void;
  enabled?: boolean;
  sessionType?: "coding" | "interview";
}

export function FullscreenGuard({
  children,
  maxWarnings = 3,
  onDisqualify,
  enabled = true,
  sessionType = "coding",
}: FullscreenGuardProps) {
  const [warnings,     setWarnings]     = useState(0);
  const [showWarning,  setShowWarning]  = useState(false);
  const [disqualified, setDisqualified] = useState(false);
  const [warningMsg,   setWarningMsg]   = useState("");
  // warningRef prevents firing multiple violations before user dismisses
  const warningActive = useRef(false);
  const warningsCount = useRef(0);

  const enterFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }
    } catch {
      // Fullscreen not supported — degrade gracefully
    }
  }, []);

  const warn = useCallback((reason: string) => {
    if (!enabled || warningActive.current) return;

    warningActive.current = true;
    warningsCount.current += 1;
    const next = warningsCount.current;

    setWarnings(next);
    setWarningMsg(reason);
    setShowWarning(true);

    if (next >= maxWarnings) {
      setDisqualified(true);
      setShowWarning(false);
      onDisqualify?.();
    }
  }, [enabled, maxWarnings, onDisqualify]);

  const dismissWarning = useCallback(() => {
    setShowWarning(false);
    warningActive.current = false;
    // Re-enter fullscreen after dismiss
    void enterFullscreen();
  }, [enterFullscreen]);

  useEffect(() => {
    if (!enabled) return;

    enterFullscreen();

    function onFullscreenChange() {
      if (!document.fullscreenElement) {
        warn("You exited fullscreen. Press Dismiss to continue.");
      }
    }
    function onVisibilityChange() {
      if (document.hidden) {
        warn("Tab switch detected. Return to the exam tab.");
      }
    }
    function onWindowBlur() {
      // Only fire if the page itself lost focus (not just an element)
      if (!document.hidden && !document.fullscreenElement) {
        warn("Window focus lost. Stay on the exam window.");
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && e.key === "I") ||
        (e.ctrlKey && e.key === "u") ||
        e.key === "F5"
      ) {
        e.preventDefault();
      }
    }

    document.addEventListener("fullscreenchange", onFullscreenChange);
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("blur", onWindowBlur);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("blur", onWindowBlur);
      document.removeEventListener("keydown", onKeyDown);
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    };
  }, [enabled, warn, enterFullscreen]);

  // ── Disqualified screen ────────────────────────────────────────────────────
  if (disqualified) {
    return (
      <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white text-center px-6">
        <div className="text-6xl mb-6">🚫</div>
        <h1 className="text-2xl font-extrabold text-red-500 mb-3">Session Disqualified</h1>
        <p className="text-gray-600 max-w-md mb-3 text-sm leading-relaxed">
          Your {sessionType} session was terminated after {maxWarnings} integrity violations.
          This incident has been recorded.
        </p>
        <div className="text-xs text-gray-500 mb-6 bg-red-50 border border-red-200 rounded-xl px-4 py-3 max-w-sm">
          Violations: tab switching, exiting fullscreen, or leaving the exam window.
        </div>
        <button
          onClick={() => { window.location.href = "/dashboard"; }}
          className="px-6 py-3 rounded-xl bg-brand text-white font-bold text-sm hover:-translate-y-px transition-transform"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Persistent status bar */}
      {enabled && (
        <div className="fixed top-0 left-0 right-0 z-[998] flex items-center justify-center gap-2 py-1.5 text-[11px] font-semibold bg-red-50 border-b border-red-200 text-red-600">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
          Anti-Cheat Active &mdash; {maxWarnings - warnings} of {maxWarnings} warnings remaining
        </div>
      )}

      {children}

      {/* Persistent warning overlay — does NOT auto-dismiss */}
      {showWarning && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-sm mx-4 rounded-2xl bg-white border border-red-300 shadow-2xl p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="text-3xl">⚠️</div>
              <div>
                <div className="font-extrabold text-red-600 text-base mb-1">
                  Integrity Warning {warnings}/{maxWarnings}
                </div>
                <div className="text-gray-700 text-sm leading-relaxed">{warningMsg}</div>
              </div>
            </div>
            <div className="text-xs text-gray-500 mb-4 bg-red-50 rounded-lg p-3 border border-red-100">
              {warnings < maxWarnings
                ? `${maxWarnings - warnings} violation${maxWarnings - warnings !== 1 ? "s" : ""} remaining before automatic disqualification.`
                : "This is your final warning. Next violation will disqualify you."}
            </div>
            <button
              onClick={dismissWarning}
              className="w-full py-2.5 rounded-xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 transition-colors"
            >
              I Understand — Return to {sessionType === "interview" ? "Interview" : "Challenge"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
