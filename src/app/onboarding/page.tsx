"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { Flame } from "lucide-react";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { StepWelcome } from "./step-welcome";
import { StepGoal } from "./step-goal";
import { StepLevel } from "./step-level";
import { StepDone } from "./step-done";

const STEPS_COUNT = 4;

export default function OnboardingPage() {
  const currentStep = useOnboardingStore((s) => s.currentStep);
  const nextStep = useOnboardingStore((s) => s.nextStep);
  const contentRef = useRef<HTMLDivElement>(null);

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

  const stepContent = () => {
    switch (currentStep) {
      case 0: return <StepWelcome onNext={nextStep} />;
      case 1: return <StepGoal onSelect={() => {}} />;
      case 2: return <StepLevel onSelect={() => {}} />;
      case 3: return <StepDone onSelect={() => {}} />;
      default: return <StepWelcome onNext={nextStep} />;
    }
  };

  return (
    <div className="flex min-h-dvh flex-col bg-background" role="main">
      <div className="flex flex-col items-center pt-8 pb-1 px-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="grid size-7 place-items-center rounded bg-primary text-primary-foreground">
            <Flame size={14} />
          </span>
          <span className="text-fluid-sm font-bold tracking-wider text-foreground">WELCOME TO EXAM ARENA</span>
        </div>

        <div className="flex items-center gap-1.5" role="progressbar" aria-valuenow={currentStep + 1} aria-valuemin={1} aria-valuemax={STEPS_COUNT}
          aria-label={`Step ${currentStep + 1} of ${STEPS_COUNT}`}
        >
          {Array.from({ length: STEPS_COUNT }).map((_, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <div
                className={`h-1 w-6 rounded-full transition-all duration-500 ${i <= currentStep ? "bg-primary" : "bg-border"}`}
              />
            </div>
          ))}
        </div>
      </div>

      <div ref={contentRef} className="flex-1 flex items-center justify-center px-5 overflow-auto">
        {stepContent()}
      </div>

      <div className="flex flex-col items-center px-5 pb-6 pt-2" />
    </div>
  );
}
