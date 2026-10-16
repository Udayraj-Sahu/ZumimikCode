"use client";

import dynamic from "next/dynamic";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";

/**
 * The avatar engine (which lives in the AGPL-licensed `@bible-strong/avatar-react`
 * package — see ./pip-avatar.tsx) touches `window.matchMedia` and a layout effect
 * at mount, so it is loaded as a client-only chunk. The fixed-size frame reserves
 * layout space up front so the mascot never causes a layout shift while the chunk
 * loads, and `overflow-x-hidden` on the page clips the off-screen walk start.
 */
const PipAvatar = dynamic(() => import("./pip-avatar"), {
  ssr: false,
  loading: () => <span className="block h-full w-full" />,
});

/** Where the walk-in starts, relative to the mascot's resting spot. */
const WALK_FROM = "-70vw";
/** How long the walk-in takes to cross the screen. */
const WALK_DURATION = 1.4;

type DashboardMascotProps = {
  /** When true the mascot walks in from the left; otherwise it just rests. */
  walking?: boolean;
  /** Fired once the walk-in settles at its resting position. */
  onArrived?: () => void;
  className?: string;
};

/**
 * Decorative dashboard mascot. When `walking` it slides in from the left edge
 * with a subtle step-bob and settles next to the welcome copy; otherwise it
 * rests. Visitors who prefer reduced motion always get a single still frame.
 */
export function DashboardMascot({ walking = false, onArrived, className }: DashboardMascotProps) {
  const reduced = usePrefersReducedMotion();
  const animateWalk = walking && !reduced;

  return (
    <motion.div
      aria-hidden="true"
      data-mascot="pip"
      data-walking={animateWalk ? "true" : "false"}
      initial={animateWalk ? { x: WALK_FROM } : false}
      animate={{ x: 0 }}
      transition={{ duration: WALK_DURATION, ease: [0.22, 1, 0.36, 1] }}
      onAnimationComplete={() => {
        if (animateWalk) onArrived?.();
      }}
      className={cn("h-[56px] w-[56px] shrink-0 sm:h-[72px] sm:w-[72px]", className)}
    >
      <motion.div
        className="h-full w-full"
        animate={animateWalk ? { y: [0, -4, 0, -4, 0] } : { y: 0 }}
        transition={
          animateWalk
            ? { duration: 0.9, repeat: Infinity, ease: "easeInOut" }
            : { duration: 0.25, ease: "easeOut" }
        }
      >
        {reduced ? <PipAvatar expression="neutral" /> : <PipAvatar animation="idle" />}
      </motion.div>
    </motion.div>
  );
}
