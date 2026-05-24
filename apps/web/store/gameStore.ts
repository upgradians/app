import { create } from "zustand";
import type { GalaxyRank, Achievement } from "@upgradian/types";
import { getRankFromXP, getNextRankXP } from "@upgradian/types";

interface GameState {
  xp:            number;
  rank:          GalaxyRank;
  streakDays:    number;
  newAchievements: Achievement[];
  showXPGain:    boolean;
  lastXPGain:    number;

  addXP:         (amount: number) => void;
  setStreak:     (days: number) => void;
  addAchievement:(achievement: Achievement) => void;
  clearAchievements: () => void;
  setFromProfile:(xp: number, streak: number) => void;

  // derived
  nextRankInfo:  () => ReturnType<typeof getNextRankXP>;
}

export const useGameStore = create<GameState>((set, get) => ({
  xp:              0,
  rank:            "Bronze Coder",
  streakDays:      0,
  newAchievements: [],
  showXPGain:      false,
  lastXPGain:      0,

  addXP: (amount) => {
    const newXP = get().xp + amount;
    const newRank = getRankFromXP(newXP);
    set({ xp: newXP, rank: newRank, showXPGain: true, lastXPGain: amount });
    setTimeout(() => set({ showXPGain: false }), 2500);
  },

  setStreak: (days) => set({ streakDays: days }),

  addAchievement: (achievement) =>
    set((s) => ({ newAchievements: [...s.newAchievements, achievement] })),

  clearAchievements: () => set({ newAchievements: [] }),

  setFromProfile: (xp, streak) =>
    set({ xp, rank: getRankFromXP(xp), streakDays: streak }),

  nextRankInfo: () => getNextRankXP(get().xp),
}));
