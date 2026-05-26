"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Moon, Sun, Bell, BellOff, Trash2 } from "lucide-react";
import { Card } from "@upgradian/ui";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

interface Props {
  userId:      string;
  email:       string;
  currentName: string;
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};

export function SettingsClient({ userId, email, currentName }: Props) {
  const [theme,         setTheme]         = useState<"dark" | "light">("dark");
  const [notifications, setNotifications] = useState(true);
  const [displayName,   setDisplayName]   = useState(currentName);
  const [savingName,    setSavingName]     = useState(false);
  const [deleting,      setDeleting]       = useState(false);
  const [confirmDelete, setConfirmDelete]  = useState(false);

  useEffect(() => {
    const saved = document.documentElement.getAttribute("data-theme") as "dark" | "light" | null;
    if (saved) setTheme(saved === "light" ? "light" : "dark");
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  };

  const saveDisplayName = async () => {
    if (!displayName.trim()) return;
    setSavingName(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("profiles")
        .update({ full_name: displayName.trim(), updated_at: new Date().toISOString() })
        .eq("id", userId);
      if (error) throw error;
      toast.success("Display name updated!");
    } catch {
      toast.error("Failed to update name.");
    } finally {
      setSavingName(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setDeleting(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      toast.success("Account deletion requested. Contact support to complete.");
      window.location.href = "/";
    } catch {
      toast.error("Failed to process request.");
      setDeleting(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <motion.div variants={fadeUp} initial="hidden" animate="show">
        <h1 className="text-2xl font-extrabold text-[var(--text-1)] tracking-tight">Settings</h1>
        <p className="text-[var(--text-2)] mt-1 text-sm">Manage your preferences and account</p>
      </motion.div>

      {/* Account Info */}
      <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.04 }}>
        <Card>
          <div className="text-xs font-bold uppercase tracking-wider text-[var(--text-3)] mb-4">Account</div>
          <div className="text-sm text-[var(--text-2)] mb-4">
            Signed in as <span className="font-semibold text-[var(--text-1)]">{email || "unknown"}</span>
          </div>

          {/* Display Name */}
          <div className="mb-4">
            <label className="text-xs font-semibold text-[var(--text-3)] uppercase tracking-wider block mb-1.5">
              Display Name
            </label>
            <div className="flex gap-2">
              <input
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder="Enter display name"
                className="flex-1 px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--bg-2)] text-[var(--text-1)] text-sm outline-none focus:border-brand transition-colors"
              />
              <button
                onClick={saveDisplayName}
                disabled={savingName || !displayName.trim()}
                className="px-4 py-2 rounded-xl text-sm font-bold text-white disabled:opacity-50 transition-all"
                style={{ background: "linear-gradient(135deg, #4361ee, #7c3aed)" }}
              >
                {savingName ? "Saving…" : "Save"}
              </button>
            </div>
          </div>

          <LogoutButton
            label="Sign Out of Account"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border border-[var(--border)] text-[var(--text-2)] hover:bg-[var(--bg-2)] transition-all w-full justify-center"
          />
        </Card>
      </motion.div>

      {/* Appearance */}
      <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.08 }}>
        <Card>
          <div className="text-xs font-bold uppercase tracking-wider text-[var(--text-3)] mb-4">Appearance</div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {theme === "dark"
                ? <Moon className="w-4 h-4 text-brand" />
                : <Sun className="w-4 h-4 text-amber-400" />
              }
              <div>
                <div className="text-sm font-semibold text-[var(--text-1)]">
                  {theme === "dark" ? "Dark Mode" : "Light Mode"}
                </div>
                <div className="text-xs text-[var(--text-3)]">Current theme</div>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className={`relative w-11 h-6 rounded-full transition-colors duration-300 ${
                theme === "light" ? "bg-brand" : "bg-[var(--bg-3)]"
              }`}
              style={{ border: "1px solid var(--border)" }}
              aria-label="Toggle theme"
            >
              <span
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-300 ${
                  theme === "light" ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>
        </Card>
      </motion.div>

      {/* Notifications */}
      <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.12 }}>
        <Card>
          <div className="text-xs font-bold uppercase tracking-wider text-[var(--text-3)] mb-4">Notifications</div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {notifications
                ? <Bell className="w-4 h-4 text-brand" />
                : <BellOff className="w-4 h-4 text-[var(--text-3)]" />
              }
              <div>
                <div className="text-sm font-semibold text-[var(--text-1)]">
                  {notifications ? "Notifications On" : "Notifications Off"}
                </div>
                <div className="text-xs text-[var(--text-3)]">Contest alerts, XP milestones, achievements</div>
              </div>
            </div>
            <button
              onClick={() => setNotifications(n => !n)}
              className={`relative w-11 h-6 rounded-full transition-colors duration-300 ${
                notifications ? "bg-brand" : "bg-[var(--bg-3)]"
              }`}
              style={{ border: "1px solid var(--border)" }}
              aria-label="Toggle notifications"
            >
              <span
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-300 ${
                  notifications ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>
        </Card>
      </motion.div>

      {/* Danger Zone */}
      <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.16 }}>
        <Card className="border-red-500/20">
          <div className="text-xs font-bold uppercase tracking-wider text-red-400 mb-4">Danger Zone</div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-[var(--text-1)]">Delete Account</div>
              <div className="text-xs text-[var(--text-3)]">Permanently remove your account and all data</div>
            </div>
            <button
              onClick={handleDeleteAccount}
              disabled={deleting}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-red-400 border border-red-500/30 hover:bg-red-500/10 transition-all disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              {deleting ? "Processing…" : confirmDelete ? "Confirm Delete" : "Delete Account"}
            </button>
          </div>
          {confirmDelete && (
            <p className="mt-3 text-xs text-red-400 bg-red-500/10 rounded-lg px-3 py-2">
              Click &quot;Confirm Delete&quot; again to proceed. This action cannot be undone.
            </p>
          )}
        </Card>
      </motion.div>
    </div>
  );
}
