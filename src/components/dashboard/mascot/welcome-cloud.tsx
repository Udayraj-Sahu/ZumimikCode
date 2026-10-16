"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

type WelcomeCloudProps = {
  /** Whether the cloud has faded/scaled into view. */
  revealed: boolean;
  /** Skip the entrance transition entirely (reduced motion). */
  reduced?: boolean;
  children: ReactNode;
  className?: string;
};

/**
 * A soft cloud-shaped speech bubble. The silhouette is built from a rounded
 * body plus a few "puffs" and a tail, all filled with the theme card colour and
 * wrapped in a single drop-shadow filter so the union reads as one cloud. It
 * therefore stays legible on both the dark and light dashboard surfaces without
 * hard-coding any colour.
 */
export function WelcomeCloud({ revealed, reduced = false, children, className }: WelcomeCloudProps) {
  return (
    <motion.div
      data-mascot-cloud=""
      data-revealed={revealed ? "true" : "false"}
      initial={false}
      animate={revealed ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.92, y: 6 }}
      transition={reduced ? { duration: 0 } : { duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
      style={{ transformOrigin: "left center" }}
      className={cn("relative min-w-0", className)}
    >
      {/* Cloud silhouette — decorative, behind the copy. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ filter: "drop-shadow(0 10px 22px rgba(0,0,0,0.22))" }}
      >
        <div className="absolute inset-0 rounded-[24px] bg-card" />
        <div className="absolute -top-3 left-6 h-7 w-7 rounded-full bg-card" />
        <div className="absolute -top-5 left-[3.25rem] h-9 w-9 rounded-full bg-card" />
        <div className="absolute -top-2 right-8 h-6 w-6 rounded-full bg-card" />
        {/* Tail pointing back at the mascot. */}
        <div className="absolute top-1/2 -left-1.5 h-3.5 w-3.5 -translate-y-1/2 rotate-45 rounded-[3px] bg-card" />
      </div>

      <div className="relative px-5 py-3.5 text-card-foreground">{children}</div>
    </motion.div>
  );
}
