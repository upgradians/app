"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface LogoutButtonProps {
  className?: string;
  showIcon?: boolean;
  label?: string;
}

export function LogoutButton({ className = "", showIcon = true, label = "Sign Out" }: LogoutButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut({ scope: "local" });
    } catch {
      // Ignore signOut errors — proceed with client-side cleanup regardless
    } finally {
      // Clear all local state unconditionally
      try { localStorage.clear(); } catch {}
      try { sessionStorage.clear(); } catch {}
      // Hard redirect clears stale router/auth cache completely
      window.location.replace("/");
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className={className}
    >
      {showIcon && <LogOut className="w-4 h-4" />}
      {loading ? "Signing out…" : label}
    </button>
  );
}
