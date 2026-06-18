"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import gsap from "gsap";
import { Flame } from "lucide-react";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { StepWelcome } from "./step-welcome";
import { StepGoal } from "./step-goal";
import { StepLevel } from "./step-level";
import { StepDone } from "./step-done";

const STEPS_COUNT = 4;

const getBaseDuration = (step: number) => (step === 0 ? 16000 : 8000);

export default function OnboardingPage() {
  const currentStep = useOnboardingStore((s) => s.currentStep);
  const autoSlidePaused = useOnboardingStore((s) => s.autoSlidePaused);
  const setAutoSlidePaused = useOnboardingStore((s) => s.setAutoSlidePaused);
  const nextStep = useOnboardingStore((s) => s.nextStep);
  const contentRef = useRef<HTMLDivElement>(null);
  const selectionMade = useRef(false);
  const baseDuration = useRef(getBaseDuration(0));
  const countdownRef = useRef(baseDuration.current);
  const [displayCountdown, setDisplayCountdown] = useState(baseDuration.current);

  useEffect(() => {
    selectionMade.current = false;
    baseDuration.current = getBaseDuration(currentStep);
    countdownRef.current = baseDuration.current;
    setDisplayCountdown(baseDuration.current);
  }, [currentStep]);

  useEffect(() => {
    if (contentRef.current) {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.fromTo(contentRef.current, { opacity: 0, y: 30, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.4 })
        .fromTo(
          contentRef.current.querySelectorAll<HTMLElement>("[data-step-el]"),
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.3, stagger: 0.06 },
          "-=0.15",
        );
    }
  }, [currentStep]);

  useEffect(() => {
    if (currentStep !== 0) return;
    if (autoSlidePaused) return;

    const tick = () => {
      countdownRef.current = Math.max(0, countdownRef.current - 50);
      setDisplayCountdown(countdownRef.current);
      if (countdownRef.current <= 0) nextStep();
    };

    const interval = setInterval(tick, 50);
    return () => clearInterval(interval);
  }, [currentStep, autoSlidePaused, nextStep]);

  const handleSelect = useCallback(() => {
    if (!selectionMade.current) {
      selectionMade.current = true;
      countdownRef.current = 2000;
      setDisplayCountdown(2000);
    }
  }, []);

  const countdownPct = selectionMade.current
    ? (countdownRef.current / 2000) * 100
    : (countdownRef.current / baseDuration.current) * 100;

  const stepContent = () => {
    const shared = { onSelect: handleSelect, onPause: () => setAutoSlidePaused(true), onResume: () => setAutoSlidePaused(false) };
    switch (currentStep) {
      case 0: return <StepWelcome {...shared} />;
      case 1: return <StepGoal onSelect={handleSelect} />;
      case 2: return <StepLevel onSelect={handleSelect} />;
      case 3: return <StepDone onSelect={() => {}} />;
      default: return <StepWelcome {...shared} />;
    }
  };

  return (
    <div className="flex min-h-dvh flex-col bg-background" role="main">
      <div className="flex flex-col items-center pt-8 pb-3 px-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="grid size-7 place-items-center rounded bg-primary text-primary-foreground">
            <Flame size={14} />
          </span>
          <span className="text-fluid-sm font-bold tracking-wider text-foreground">EXAM ARENA</span>
        </div>

        <div className="flex items-center gap-2 mb-2" role="progressbar" aria-valuenow={currentStep + 1} aria-valuemin={1} aria-valuemax={STEPS_COUNT}
          aria-label={`Step ${currentStep + 1} of ${STEPS_COUNT}`}
        >
          {Array.from({ length: STEPS_COUNT }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <div
                className={`size-2 rounded-full transition-all duration-500 ${
                  i <= currentStep ? "bg-primary scale-100" : "bg-border scale-75"
                } ${i === currentStep ? "animate-pulse shadow-[0_0_6px_var(--primary)]" : ""}`}
              />
              {i < STEPS_COUNT - 1 && (
                <div className={`h-0.5 w-6 rounded-full transition-colors duration-500 ${i < currentStep ? "bg-primary" : "bg-border"}`} />
              )}
            </div>
          ))}
        </div>

        <div className="h-1 w-32 rounded-full bg-border overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-100 ${selectionMade.current ? "bg-primary" : "bg-primary/50"}`}
            style={{ width: `${Math.max(2, countdownPct)}%` }}
          />
        </div>
      </div>

      <div ref={contentRef} className="flex-1 flex items-center justify-center px-5 overflow-auto">
        {stepContent()}
      </div>

      <div className="flex flex-col items-center px-5 pb-8 pt-3" />
    </div>
  );
}
