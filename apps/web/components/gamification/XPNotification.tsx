"use client";

import { motion, AnimatePresence } from "framer-motion";

export function XPNotification({ amount }: { amount: number }) {
  return (
    <AnimatePresence>
      <motion.div
        key="xp-notif"
        initial={{ opacity: 0, y: 40, scale: .9 }}
        animate={{ opacity: 1, y: 0,  scale: 1  }}
        exit={{    opacity: 0, y: -20, scale: .9 }}
        className="fixed bottom-8 right-8 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl bg-gradient-to-r from-brand to-brand-dark text-white font-bold text-lg shadow-brand shadow-xl pointer-events-none"
      >
        <span className="text-2xl">⚡</span>
        +{amount} XP
      </motion.div>
    </AnimatePresence>
  );
}
