"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { ArrowRight } from "lucide-react";
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

type Props = {
  onSelect: () => void;
};

export function StepDone({ onSelect }: Props) {
  const router = useRouter();
  const { targetExam, level, authMethod, phone, name, completeOnboarding } = useOnboardingStore();
  const authLogin = useAuthStore((s) => s.login);
  const contentRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const confettiRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (contentRef.current) {
        const els = contentRef.current.querySelectorAll<HTMLElement>("[data-animate]");
        gsap.fromTo(els, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.4, stagger: 0.1, ease: "back.out(1.7)" });
      }

      if (pathRef.current) {
        const length = pathRef.current.getTotalLength();
        gsap.fromTo(pathRef.current, { strokeDasharray: length, strokeDashoffset: length }, { strokeDashoffset: 0, duration: 0.6, delay: 0.2, ease: "power2.inOut" });
      }

      gsap.fromTo(".confetti-piece", { y: -40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, stagger: 0.05, ease: "power2.out", delay: 0.6 });
    }, contentRef);

    return () => ctx.revert();
  }, []);

  const handleEnter = () => {
    completeOnboarding();
    onSelect();
    authLogin(phone || `${name}@onboard.com`, "mock-password");
    router.push("/dashboard");
  };

  return (
    <div ref={contentRef} className="flex flex-col items-center gap-6 relative">
      <div data-animate className="grid size-16 place-items-center rounded-full bg-primary/10 relative">
        <svg viewBox="0 0 40 40" className="size-8">
          <path ref={pathRef} d="M10 20 L17 27 L30 13" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-primary" />
        </svg>
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
        className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-fluid-base font-bold uppercase tracking-widest text-primary-foreground outline-none transition-all hover:opacity-90 active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-ring animate-breath-glow"
      >
        Enter the Arena <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" />
      </button>

      <div ref={confettiRef} className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="confetti-piece absolute size-1.5 rounded-sm"
            style={{
              backgroundColor: ["#C8FF5A", "#60A5FA", "#F472B6", "#FBBF24", "#A78BFA"][i % 5],
              left: `${10 + Math.random() * 80}%`,
              top: `${40 + Math.random() * 40}%`,
              animation: `confetti-fall ${1.5 + Math.random() * 1.5}s ease-in-out ${0.6 + Math.random() * 0.6}s infinite`,
              animationDelay: `${0.6 + Math.random() * 0.6}s`,
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes confetti-fall {
          0% { transform: translateY(0) rotate(0deg) scale(1); opacity: 0; }
          20% { opacity: 1; }
          100% { transform: translateY(60px) rotate(360deg) scale(0); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
