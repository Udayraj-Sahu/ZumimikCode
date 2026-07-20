"use client";

import { useEffect, useRef, useMemo } from "react";
const IS_MOCK_STEP = process.env.NEXT_PUBLIC_API_MOCK !== "false";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { ArrowRight, BadgeCheck, BarChart3, Smartphone, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { useAuthStore } from "@/stores/auth-store";
import { useWalkthroughStore } from "@/stores/walkthrough-store";

const HexRingSVG = () => (
  <svg width="200" height="150" viewBox="0 0 200 150" className="w-32 h-24 absolute top-0 opacity-30 pointer-events-none" aria-hidden="true">
    <defs>
      <radialGradient id="hexGlow" cx="50%" cy="50%">
        <stop offset="0%" stopColor="#C8FF5A" stopOpacity="0.15" />
        <stop offset="100%" stopColor="#C8FF5A" stopOpacity="0" />
      </radialGradient>
    </defs>
    <polygon points="100,20 145,47.5 145,102.5 100,130 55,102.5 55,47.5" fill="none" stroke="#C8FF5A15" strokeWidth="0.6" strokeDasharray="4 4">
      <animate attributeName="strokeDashoffset" values="0;24" dur="3s" repeatCount="indefinite" />
    </polygon>
    <polygon points="100,35 130,53 130,97 100,115 70,97 70,53" fill="none" stroke="#C8FF5A20" strokeWidth="0.4" strokeDasharray="2 5" />
    <circle cx="100" cy="75" r="40" fill="url(#hexGlow)" />
    <circle cx="100" cy="75" r="2" fill="#C8FF5A" opacity="0.5">
      <animate attributeName="opacity" values="0.2;0.7;0.2" dur="2s" repeatCount="indefinite" />
    </circle>
  </svg>
);

const EXAM_LABELS: Record<string, string> = {
  cat: "CAT", gmat: "GMAT", gre: "GRE", banking: "Banking", "vedic-math": "Vedic Math",
};
const LEVEL_LABELS: Record<string, string> = {
  beginner: "Beginner", intermediate: "Intermediate", advanced: "Advanced", adaptive: "Adaptive",
};

const CONFETTI_COLORS = ["#C8FF5A", "#60A5FA", "#F472B6", "#FBBF24", "#A78BFA"];

type ConfettiParticle = {
  size: number;
  x: number;
  y: number;
  color: string;
  rounded: boolean;
  rotation: number;
};

type Props = { onSelect: () => void };

export function StepDone({ onSelect }: Props) {
  const router = useRouter();
  const { targetExam, level, authMethod, phone, name, completeOnboarding } = useOnboardingStore();
  const authLogin = useAuthStore((s) => s.login);
  const contentRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const checkCircleRef = useRef<HTMLDivElement>(null);

  const particles = useMemo<ConfettiParticle[]>(() =>
    Array.from({ length: 30 }).map((_, i) => {
      const size = 4 + Math.random() * 4;
      const angle = (360 / 30) * i + Math.random() * 20;
      const dist = 60 + Math.random() * 100;
      const rad = (angle * Math.PI) / 180;
      return {
        size,
        x: Math.cos(rad) * dist,
        y: Math.sin(rad) * dist,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        rounded: Math.random() > 0.5,
        rotation: gsap.utils.random(-180, 180),
      };
    }), [],
  );

  useEffect(() => {
    const ctx = gsap.context(() => {
      const els = contentRef.current?.querySelectorAll<HTMLElement>("[data-animate]");
      if (els?.length) {
        gsap.fromTo(els, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.25, stagger: 0.06, ease: "back.out(1.7)" });
      }

      if (pathRef.current) {
        const length = pathRef.current.getTotalLength();
        gsap.fromTo(pathRef.current, { strokeDasharray: length, strokeDashoffset: length }, { strokeDashoffset: 0, duration: 0.4, delay: 0.1, ease: "power2.inOut" });
      }

      if (checkCircleRef.current) {
        gsap.fromTo(checkCircleRef.current, { scale: 0 }, { scale: 1, duration: 0.25, ease: "back.out(2)", delay: 0.05 });
      }

      const confettiEls = contentRef.current?.querySelectorAll<HTMLElement>("[data-confetti]");
      if (confettiEls?.length) {
        gsap.fromTo(
          confettiEls,
          { opacity: 1, scale: 1, x: 0, y: 0 },
          {
            x: (i) => particles[i].x,
            y: (i) => particles[i].y,
            opacity: 0,
            scale: 0,
            rotation: (i) => particles[i].rotation,
            duration: () => 0.5 + Math.random() * 0.3,
            ease: "power3.out",
            delay: 0.15,
            stagger: 0.02,
          },
        );
      }
    }, contentRef);

    return () => ctx.revert();
  }, [particles]);

  const handleEnter = () => {
    completeOnboarding();
    useWalkthroughStore.getState().complete();
    onSelect();
    if (IS_MOCK_STEP) {
      authLogin(phone || `${name}@onboard.com`, "mock-password");
    }
    router.push("/dashboard");
  };

  const levelBarCount = ["beginner", "intermediate", "advanced", "adaptive"].indexOf(level) + 1 || 0;

  return (
    <div ref={contentRef} className="flex flex-col items-center gap-5 relative w-full">
      <HexRingSVG />

      <div data-animate ref={checkCircleRef} className="grid size-14 place-items-center rounded-full bg-primary/10 relative">
        <svg viewBox="0 0 40 40" className="size-7 text-primary">
          <path ref={pathRef} d="M10 20 L17 27 L30 13" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <div data-animate className="text-center">
        <h1 className="text-fluid-2xl font-black text-foreground">You&apos;re all set!</h1>
        <p className="mt-1 text-fluid-xs text-muted-foreground/50 uppercase tracking-[0.08em]">Your arena is ready</p>
      </div>

      <div data-animate className="w-full rounded-xl border border-border/40 bg-card divide-y divide-border/20 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <BadgeCheck className="size-3.5 text-muted-foreground/40" aria-hidden="true" />
            <span className="text-fluid-xs text-muted-foreground/50 font-semibold tracking-wider uppercase">Exam</span>
          </div>
          <span className={cn(
            "text-[10px] font-bold font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full border",
            targetExam ? "border-primary/30 bg-primary/10 text-primary" : "border-border/40 text-muted-foreground/40",
          )}>
            {EXAM_LABELS[targetExam] || targetExam || "Not set"}
          </span>
        </div>

        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="size-3.5 text-muted-foreground/40" aria-hidden="true" />
            <span className="text-fluid-xs text-muted-foreground/50 font-semibold tracking-wider uppercase">Level</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-end gap-[2px] h-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "w-[3px] rounded-t-sm transition-all",
                    i < levelBarCount ? "bg-primary" : "bg-border/40",
                  )}
                  style={{ height: `${40 + i * 20}%` }}
                />
              ))}
            </div>
            <span className="text-fluid-xs font-bold text-foreground font-mono">{LEVEL_LABELS[level] || level || "—"}</span>
          </div>
        </div>

        {authMethod && (
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              {authMethod === "google" ? (
                <Globe className="size-3.5 text-muted-foreground/40" aria-hidden="true" />
              ) : (
                <Smartphone className="size-3.5 text-muted-foreground/40" aria-hidden="true" />
              )}
              <span className="text-fluid-xs text-muted-foreground/50 font-semibold tracking-wider uppercase">Account</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-primary/60" />
              <span className="text-fluid-xs font-medium text-muted-foreground/60">
                {authMethod === "google" ? "Google" : phone}
              </span>
            </div>
          </div>
        )}
      </div>

      <button
        data-animate
        type="button"
        onClick={handleEnter}
        className="group relative flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-fluid-base font-bold uppercase tracking-widest text-primary-foreground outline-none transition-all hover:opacity-90 active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-ring animate-breath-glow overflow-hidden"
      >
        <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
        Enter the Arena
        <ArrowRight size={18} className="transition-transform duration-200 group-hover:translate-x-1" />
      </button>

      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {particles.map((p, i) => (
          <div
            key={i}
            data-confetti
            className="absolute"
            style={{
              width: p.size,
              height: p.size,
              background: p.color,
              borderRadius: p.rounded ? "50%" : "2px",
              left: "50%",
              top: "50%",
              opacity: 0,
            }}
          />
        ))}
      </div>
    </div>
  );
}
