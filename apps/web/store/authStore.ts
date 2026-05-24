import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@supabase/supabase-js";
import type { Profile } from "@upgradian/types";
import { createClient } from "@/lib/supabase/client";

interface AuthState {
  user:    User    | null;
  profile: Profile | null;
  loading: boolean;
  initialized: boolean;
  setUser:      (user: User | null) => void;
  setProfile:   (profile: Profile | null) => void;
  signOut:      () => Promise<void>;
  fetchProfile: () => Promise<void>;
  init:         () => () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user:        null,
      profile:     null,
      loading:     true,
      initialized: false,

      setUser:    (user)    => set({ user, loading: false }),
      setProfile: (profile) => set({ profile }),

      fetchProfile: async () => {
        const { user } = get();
        if (!user) return;
        const supabase = createClient();
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        if (data) set({ profile: data as Profile });
      },

      signOut: async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        set({ user: null, profile: null, loading: false });
      },

      init: () => {
        const supabase = createClient();
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            const user = session?.user ?? null;
            set({ user, loading: false, initialized: true });
            if (user && (event === "SIGNED_IN" || event === "TOKEN_REFRESHED")) {
              await get().fetchProfile();
            }
            if (event === "SIGNED_OUT") {
              set({ profile: null });
            }
          }
        );
        return () => subscription.unsubscribe();
      },
    }),
    {
      name: "upg-auth",
      partialize: (state) => ({ profile: state.profile }),
    }
  )
);
