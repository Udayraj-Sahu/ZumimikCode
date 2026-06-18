"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { Flame } from "lucide-react";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { StepAuth } from "./step-auth";
import { StepGoal } from "./step-goal";
import { StepLevel } from "./step-level";
import { StepDone } from "./step-done";

const STEPS_COUNT = 4;

export default function OnboardingPage() {
  const currentStep = useOnboardingStore((s) => s.currentStep);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      gsap.fromTo(contentRef.current, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" });
    }
  }, [currentStep]);

  const stepContent = () => {
    switch (currentStep) {
      case 0: return <StepAuth />;
      case 1: return <StepGoal />;
      case 2: return <StepLevel />;
      case 3: return <StepDone />;
      default: return <StepAuth />;
    }
  };

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-5 py-8" role="main">
      <div className="flex items-center gap-2 mb-8">
        <span className="grid size-7 place-items-center rounded bg-primary text-primary-foreground">
          <Flame size={14} />
        </span>
        <span className="text-fluid-sm font-bold tracking-wider text-foreground">EXAM ARENA</span>
      </div>

      <div className="flex gap-1.5 mb-8" role="progressbar" aria-valuenow={currentStep + 1} aria-valuemin={1} aria-valuemax={STEPS_COUNT}
        aria-label={`Step ${currentStep + 1} of ${STEPS_COUNT}`}
      >
        {Array.from({ length: STEPS_COUNT }).map((_, i) => (
          <div
            key={i}
            className={`h-1 w-8 rounded-full transition-colors duration-300 ${
              i <= currentStep ? "bg-primary" : "bg-border"
            }`}
          />
        ))}
      </div>

      <div
        ref={contentRef}
        className="w-full max-w-sm"
      >
        {stepContent()}
      </div>
    </div>
  );
}
