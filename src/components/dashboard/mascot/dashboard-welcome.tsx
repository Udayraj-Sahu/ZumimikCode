"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useWelcomeStore } from "@/stores/welcome-store";
import { DashboardMascot } from "./dashboard-mascot";
import { WelcomeCloud } from "./welcome-cloud";

function prefersReducedMotionNow(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

type WelcomePhase = "rest" | "walk";

type DashboardWelcomeProps = {
  /**
   * False while a modal covers the dashboard. The welcome waits until the
   * dashboard is actually visible so the entrance is never played behind an
   * onboarding / hook sheet.
   */
  enabled: boolean;
  /** The dashboard's own welcome copy, rendered inside the cloud. */
  greeting: ReactNode;
  className?: string;
};

/**
 * Owns the "play once per session" welcome state machine and drives the mascot
 * walk-in plus the cloud reveal.
 *
 * It reads the persisted {@link useWelcomeStore} status, which lives in
 * `sessionStorage`: a pending status means the welcome is queued (fresh sign-up
 * or a cold app open), while a played status means it already ran this session
 * and must not replay on re-render, route change or refresh. The store status is
 * consumed the moment the walk begins so the very same render can never trigger
 * it twice.
 */
export function DashboardWelcome({ enabled, greeting, className }: DashboardWelcomeProps) {
  const status = useWelcomeStore((s) => s.status);
  const [phase, setPhase] = useState<WelcomePhase>("rest");
  const [revealed, setRevealed] = useState(false);
  const decidedRef = useRef(false);

  useEffect(() => {
    if (decidedRef.current) return;
    if (!enabled) {
      setRevealed(true);
      return;
    }

    decidedRef.current = true;
    const store = useWelcomeStore.getState();
    if (store.status !== "pending") {
      setRevealed(true);
      return;
    }

    // The welcome is considered "played" the moment it starts, so a re-render,
    // route change or refresh within this session can never replay it — even
    // for reduced-motion visitors, who simply skip the walk.
    store.consume();

    if (prefersReducedMotionNow()) {
      setRevealed(true);
      return;
    }

    setPhase("walk");
    setRevealed(false);
  }, [enabled, status]);

  return (
    <div className={cn("flex items-center gap-3 md:gap-4", className)}>
      <DashboardMascot
        walking={phase === "walk"}
        onArrived={() => {
          setPhase("rest");
          setRevealed(true);
        }}
      />
      <WelcomeCloud revealed={revealed}>{greeting}</WelcomeCloud>
    </div>
  );
}
