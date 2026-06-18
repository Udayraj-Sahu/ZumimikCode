"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { Check, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { useAuthStore } from "@/stores/auth-store";

const EXAM_LABELS: Record<string, string> = {
  cat: "CAT",
  gmat: "GMAT",
  gre: "GRE",
  banking: "Banking",
  "vedic-math": "Vedic Math",
};

const LEVEL_LABELS: Record<string, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
  adaptive: "Adaptive",
};

export function StepDone() {
  const router = useRouter();
  const { targetExam, level, authMethod, phone, name, completeOnboarding } = useOnboardingStore();
  const authLogin = useAuthStore((s) => s.login);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      const els = contentRef.current.querySelectorAll<HTMLElement>("[data-animate]");
      gsap.fromTo(els, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.35, stagger: 0.1, ease: "power2.out" });
    }
  }, []);

  const handleEnter = () => {
    completeOnboarding();
    authLogin(phone || `${name}@onboard.com`, "mock-password");
    router.push("/dashboard");
  };

  return (
    <div ref={contentRef} className="flex flex-col items-center gap-6">
      <div data-animate className="grid size-16 place-items-center rounded-full bg-primary/10">
        <Check size={32} className="text-primary" />
      </div>
      <div data-animate className="text-center">
        <p className="text-fluid-2xl font-black text-foreground">You&apos;re all set!</p>
        <p className="mt-1 text-fluid-sm text-muted-foreground/60">Your arena is ready.</p>
      </div>
      <div data-animate className="w-full rounded-xl border border-border/40 bg-card p-4">
        <div className="flex items-center justify-between">
          <span className="text-fluid-xs text-muted-foreground/50 font-semibold tracking-wider uppercase">Exam</span>
          <span className="text-fluid-sm font-bold text-foreground">{EXAM_LABELS[targetExam] || targetExam}</span>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-fluid-xs text-muted-foreground/50 font-semibold tracking-wider uppercase">Level</span>
          <span className="text-fluid-sm font-bold text-foreground">{LEVEL_LABELS[level] || level}</span>
        </div>
        {authMethod && (
          <div className="mt-2 flex items-center justify-between">
            <span className="text-fluid-xs text-muted-foreground/50 font-semibold tracking-wider uppercase">Signed in</span>
            <span className="text-fluid-xs font-medium text-muted-foreground/60">
              {authMethod === "google" ? "Google" : phone}
            </span>
          </div>
        )}
      </div>
      <button
        data-animate
        type="button"
        onClick={handleEnter}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-fluid-base font-bold uppercase tracking-widest text-primary-foreground outline-none transition-all hover:opacity-90 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-ring"
      >
        Enter the Arena <ArrowRight size={18} />
      </button>
    </div>
  );
}
