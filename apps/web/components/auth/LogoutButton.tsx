"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface LogoutButtonProps {
  className?: string;
  showIcon?: boolean;
  label?: string;
}

export function LogoutButton({ className = "", showIcon = true, label = "Sign Out" }: LogoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    if (loading) return;
    setLoading(true);
    const signOutTimeout = new Promise<void>(resolve => setTimeout(resolve, 4000));
    try {
      const supabase = createClient();
      await Promise.race([supabase.auth.signOut({ scope: "local" }), signOutTimeout]);
    } catch {
      // Ignore signOut errors — proceed with cleanup regardless
    } finally {
      // 1. Clear all browser storage
      try { localStorage.clear(); } catch {}
      try { sessionStorage.clear(); } catch {}
      // 2. Clear Supabase auth cookies (sb-* prefix)
      try {
        document.cookie.split(";").forEach(cookie => {
          const name = cookie.split("=")[0].trim();
          if (name.startsWith("sb-")) {
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
          }
        });
      } catch {}
      // 3. Next.js router — forces server components to re-render with cleared session
      try {
        router.replace("/");
        router.refresh();
      } catch {}
      // 4. Hard redirect as belt-and-suspenders (clears any stale JS state)
      setTimeout(() => { window.location.href = "/"; }, 150);
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
