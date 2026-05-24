"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  /** Delay before the animation starts (seconds) */
  delay?: number;
  /** Animation duration (seconds) */
  duration?: number;
  /** Initial vertical offset in px */
  y?: number;
}

/**
 * Wraps children in a motion.div that fades up when scrolled into view.
 * Uses framer-motion whileInView — automatically respects prefers-reduced-motion.
 * Must be a client component (motion requires it); safe to use from server components.
 */
export function ScrollReveal({
  children,
  className,
  delay = 0,
  duration = 0.55,
  y = 28,
}: ScrollRevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
