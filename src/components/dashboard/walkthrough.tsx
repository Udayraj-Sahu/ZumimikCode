"use client";

import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { Flame, Zap, Award, BarChart3, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWalkthroughStore } from "@/stores/walkthrough-store";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { DOMAIN_LABELS } from "@/lib/types/template";

function getSteps(domainLabel: string) {
  return [
    {
      icon: Flame,
      title: `Welcome to ${domainLabel}`,
      description: `Use the sidebar to navigate between Dashboard, Sprints, Analytics, and more. Everything you need for ${domainLabel} prep is one click away.`,
    },
    {
      icon: Zap,
      title: "Start a Sprint",
      description: "Tap 'Start Sprint' to begin a timed challenge. Each sprint sharpens your speed and accuracy across different topics.",
    },
    {
      icon: Award,
      title: "Track Your Streak",
      description: "Your streak and XP appear at the top of the dashboard. Stay consistent to climb the leaderboard.",
    },
    {
      icon: BarChart3,
      title: "Monitor Progress",
      description: "Topic Mastery and Cognitive Radar show where you excel and where to focus more practice.",
    },
    {
      icon: Check,
      title: "You're Ready!",
      description: "Start your first sprint or explore the dashboard. You can replay this tour anytime from Settings.",
    },
  ];
}

export function Walkthrough() {
  const { completed, complete } = useWalkthroughStore();
  const targetExam = useOnboardingStore((s) => s.targetExam);
  const domainLabel = DOMAIN_LABELS[targetExam] || "Exam Arena";
  const STEPS = getSteps(domainLabel);
  const [step, setStep] = useState(0);
  const [open, setOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!completed) {
      const timer = setTimeout(() => setOpen(true), 600);
      return () => clearTimeout(timer);
    }
  }, [completed]);

  useEffect(() => {
    if (open && cardRef.current) {
      gsap.fromTo(cardRef.current, { opacity: 0, y: 24, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: "power2.out" });
    }
    if (open && overlayRef.current) {
      gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "power2.out" });
    }
  }, [open, step]);

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
    } else {
      complete();
      setOpen(false);
    }
  };

  const handleSkip = () => {
    complete();
    setOpen(false);
  };

  if (!open) return null;

  const s = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={handleSkip}
      role="dialog"
      aria-modal="true"
      aria-label="Walkthrough"
    >
      <div
        ref={cardRef}
        className="w-full max-w-sm rounded-2xl border border-border/60 bg-card p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Step indicator */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-1">
            {STEPS.map((_, i) => (
              <span
                key={i}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  i === step ? "w-6 bg-primary" : "w-1.5 bg-muted",
                )}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={handleSkip}
            className="text-fluid-xs text-muted-foreground/40 outline-none hover:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring rounded px-1"
          >
            Skip
          </button>
        </div>

        {/* Icon */}
        <div className="mx-auto mb-4 grid size-14 place-items-center rounded-2xl bg-primary/10">
          <s.icon size={28} className="text-primary" />
        </div>

        {/* Content */}
        <h2 className="text-fluid-xl font-black tracking-tight text-foreground text-center">
          {s.title}
        </h2>
        <p className="mt-2 text-fluid-sm text-muted-foreground/70 text-center leading-relaxed">
          {s.description}
        </p>

        {/* Action */}
        <button
          type="button"
          onClick={handleNext}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-fluid-sm font-bold uppercase tracking-widest text-primary-foreground outline-none transition-transform hover:scale-[1.02] active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-ring"
        >
          {isLast ? "Start Training" : "Got It"}
        </button>
      </div>
    </div>
  );
}
