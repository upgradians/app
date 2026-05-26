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
  const [warnings,      setWarnings]      = useState(0);
  const [showWarning,   setShowWarning]   = useState(false);
  const [disqualified,  setDisqualified]  = useState(false);
  const [warningMsg,    setWarningMsg]    = useState("");
  const [countdown,     setCountdown]     = useState(5);
  const warningRef      = useRef(false);
  const countdownRef    = useRef<ReturnType<typeof setInterval> | null>(null);

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
    if (!enabled || disqualified || warningRef.current) return;
    warningRef.current = true;

    setWarnings(prev => {
      const next = prev + 1;
      setWarningMsg(reason);
      setShowWarning(true);
      setCountdown(5);

      if (countdownRef.current) clearInterval(countdownRef.current);
      countdownRef.current = setInterval(() => {
        setCountdown(c => {
          if (c <= 1) {
            clearInterval(countdownRef.current!);
            setShowWarning(false);
            warningRef.current = false;
            if (next >= maxWarnings) {
              setDisqualified(true);
              onDisqualify?.();
            }
            return 5;
          }
          return c - 1;
        });
      }, 1000);

      return next;
    });
  }, [enabled, disqualified, maxWarnings, onDisqualify]);

  useEffect(() => {
    if (!enabled) return;

    enterFullscreen();

    function onFullscreenChange() {
      if (!document.fullscreenElement) {
        warn("You exited fullscreen. Return to continue.");
        setTimeout(enterFullscreen, 1500);
      }
    }

    function onVisibilityChange() {
      if (document.hidden) {
        warn("Tab switch detected. Stay on the exam tab.");
      }
    }

    function onWindowBlur() {
      if (!document.hidden) {
        warn("You left the exam window.");
      }
    }

    function onKeyDown(e: KeyboardEvent) {
      // Block common escape vectors
      if (e.key === "F12" || (e.ctrlKey && e.shiftKey && e.key === "I") ||
          (e.ctrlKey && e.key === "u") || (e.key === "F5")) {
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
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [enabled, warn, enterFullscreen]);

  if (disqualified) {
    return (
      <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#000008] text-center px-6">
        <div className="text-6xl mb-6">🚫</div>
        <h1 className="text-2xl font-extrabold text-red-400 mb-3">Session Disqualified</h1>
        <p className="text-[var(--text-2)] max-w-md mb-3 text-sm leading-relaxed">
          Your {sessionType} session was terminated after {maxWarnings} integrity violations.
          This incident has been recorded.
        </p>
        <div className="text-xs text-[var(--text-3)] mb-6 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 max-w-sm">
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
      {/* Fullscreen enter prompt */}
      {enabled && !disqualified && (
        <div
          className="fixed top-2 left-1/2 -translate-x-1/2 z-[999] px-3 py-1.5 rounded-xl text-[11px] font-semibold flex items-center gap-2 pointer-events-none"
          style={{ background: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)", backdropFilter: "blur(8px)" }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
          Anti-Cheat Active · {maxWarnings - warnings} warnings remaining
        </div>
      )}

      {children}

      {/* Warning overlay */}
      {showWarning && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] w-full max-w-sm px-4">
          <div
            className="rounded-2xl p-4 shadow-2xl"
            style={{ background: "rgba(30,10,10,0.97)", border: "1px solid rgba(239,68,68,0.4)", backdropFilter: "blur(20px)" }}
          >
            <div className="flex items-start gap-3">
              <div className="text-2xl">⚠️</div>
              <div className="flex-1">
                <div className="font-bold text-red-300 text-sm mb-1">
                  Anti-Cheat Warning ({warnings}/{maxWarnings})
                </div>
                <div className="text-red-200/80 text-xs leading-relaxed mb-2">{warningMsg}</div>
                {warnings < maxWarnings ? (
                  <div className="text-red-400/60 text-xs">
                    {maxWarnings - warnings} warning{maxWarnings - warnings !== 1 ? "s" : ""} remaining before disqualification.
                  </div>
                ) : (
                  <div className="text-red-400 text-xs font-bold">DISQUALIFYING...</div>
                )}
              </div>
              <div className="text-red-400 text-xs font-mono bg-red-500/10 rounded-lg w-7 h-7 flex items-center justify-center flex-shrink-0">
                {countdown}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
