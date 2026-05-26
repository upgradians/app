"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { User, Mail, Calendar, Zap, Flame, Github, Linkedin, Settings } from "lucide-react";
import type { Profile } from "@upgradian/types";
import { Card, RankBadge } from "@upgradian/ui";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

interface Props {
  profile: Profile | null;
  email:   string;
  userId:  string;
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};

export function ProfileClient({ profile, email, userId }: Props) {
  const [editing,   setEditing]   = useState(false);
  const [fullName,  setFullName]  = useState(profile?.full_name ?? "");
  const [bio,       setBio]       = useState(profile?.bio ?? "");
  const [githubUrl, setGithubUrl] = useState(profile?.github_url ?? "");
  const [linkedinUrl, setLinkedinUrl] = useState(profile?.linkedin_url ?? "");
  const [saving,    setSaving]    = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("profiles")
        .update({ full_name: fullName || null, bio: bio || null, github_url: githubUrl || null, linkedin_url: linkedinUrl || null, updated_at: new Date().toISOString() })
        .eq("id", userId);
      if (error) throw error;
      toast.success("Profile updated!");
      setEditing(false);
    } catch {
      toast.error("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const joinedDate = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-IN", { month: "long", year: "numeric" })
    : "Unknown";

  const displayName = profile?.full_name ?? profile?.username ?? "Developer";
  const initials    = displayName[0]?.toUpperCase() ?? "U";

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <motion.div variants={fadeUp} initial="hidden" animate="show">
        <h1 className="text-2xl font-extrabold text-[var(--text-1)] tracking-tight">My Profile</h1>
        <p className="text-[var(--text-2)] mt-1 text-sm">Manage your account and personal details</p>
      </motion.div>

      {/* Avatar + Info */}
      <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.05 }}>
        <Card className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-3xl font-extrabold flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #4361ee, #7c3aed)" }}
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xl font-extrabold text-[var(--text-1)]">{displayName}</div>
            <div className="text-sm text-[var(--text-3)] mt-0.5">@{profile?.username ?? "—"}</div>
            <RankBadge rank={profile?.rank ?? "Bronze Coder"} className="mt-2" />
            {profile?.bio && (
              <p className="text-sm text-[var(--text-2)] mt-2 leading-relaxed">{profile.bio}</p>
            )}
          </div>
          <div className="flex flex-col gap-2 flex-shrink-0">
            <button
              onClick={() => setEditing(e => !e)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all border"
              style={{ borderColor: "var(--border)", color: "var(--text-2)", background: "var(--bg-2)" }}
            >
              <Settings className="w-3.5 h-3.5" />
              {editing ? "Cancel" : "Edit Profile"}
            </button>
            <LogoutButton
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all border border-red-500/30 text-red-400 hover:bg-red-500/10"
            />
          </div>
        </Card>
      </motion.div>

      {/* Edit form */}
      {editing && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <div className="text-sm font-bold text-[var(--text-1)] mb-4">Edit Details</div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-[var(--text-3)] uppercase tracking-wider block mb-1">Full Name</label>
                <input
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--bg-2)] text-[var(--text-1)] text-sm outline-none focus:border-brand"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--text-3)] uppercase tracking-wider block mb-1">Bio</label>
                <textarea
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  placeholder="A short bio about yourself"
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--bg-2)] text-[var(--text-1)] text-sm outline-none focus:border-brand resize-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--text-3)] uppercase tracking-wider block mb-1">GitHub URL</label>
                <input
                  value={githubUrl}
                  onChange={e => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/username"
                  className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--bg-2)] text-[var(--text-1)] text-sm outline-none focus:border-brand"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--text-3)] uppercase tracking-wider block mb-1">LinkedIn URL</label>
                <input
                  value={linkedinUrl}
                  onChange={e => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/username"
                  className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--bg-2)] text-[var(--text-1)] text-sm outline-none focus:border-brand"
                />
              </div>
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-60"
                style={{ background: "linear-gradient(135deg, #4361ee, #7c3aed)" }}
              >
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Stats */}
      <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.1 }}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: <Zap className="w-4 h-4" />,      label: "XP",      value: Number(profile?.total_xp ?? 0).toLocaleString(), color: "text-brand"       },
            { icon: <Flame className="w-4 h-4" />,     label: "Streak",  value: `${profile?.streak_days ?? 0}d`,             color: "text-orange-400"  },
            { icon: <User className="w-4 h-4" />,      label: "Rank",    value: profile?.rank ?? "Bronze Coder",             color: "text-purple-400"  },
            { icon: <Calendar className="w-4 h-4" />, label: "Joined",  value: joinedDate,                                   color: "text-sky-400"     },
          ].map(s => (
            <Card key={s.label} padding="sm" className="text-center">
              <div className={`flex justify-center mb-1 ${s.color}`}>{s.icon}</div>
              <div className={`text-base font-extrabold ${s.color} truncate`}>{s.value}</div>
              <div className="text-xs text-[var(--text-3)] font-semibold uppercase tracking-wider mt-0.5">{s.label}</div>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* Contact */}
      <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.15 }}>
        <Card>
          <div className="text-sm font-bold text-[var(--text-1)] mb-3">Account Info</div>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-[var(--text-3)] flex-shrink-0" />
              <span className="text-sm text-[var(--text-2)]">{email || "No email"}</span>
            </div>
            {profile?.github_url && (
              <a href={profile.github_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-brand transition-colors">
                <Github className="w-4 h-4 text-[var(--text-3)] flex-shrink-0" />
                <span className="text-sm text-[var(--text-2)]">{profile.github_url}</span>
              </a>
            )}
            {profile?.linkedin_url && (
              <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-brand transition-colors">
                <Linkedin className="w-4 h-4 text-[var(--text-3)] flex-shrink-0" />
                <span className="text-sm text-[var(--text-2)]">{profile.linkedin_url}</span>
              </a>
            )}
          </div>
        </Card>
      </motion.div>

      {/* Quick links */}
      <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.2 }}>
        <div className="flex gap-3">
          <Link
            href="/settings"
            className="flex-1 py-2.5 rounded-xl text-sm font-bold text-center transition-all border border-[var(--border)] text-[var(--text-2)] hover:bg-[var(--bg-2)]"
          >
            ⚙️ Settings
          </Link>
          <Link
            href="/arena"
            className="flex-1 py-2.5 rounded-xl text-sm font-bold text-center text-white transition-all"
            style={{ background: "linear-gradient(135deg, #4361ee, #7c3aed)" }}
          >
            ⚔️ Go to Arena
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
