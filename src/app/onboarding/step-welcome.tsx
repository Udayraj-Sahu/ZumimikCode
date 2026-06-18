"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Timer, Trophy, BrainCircuit, BarChart3, Globe, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { useAuthStore } from "@/stores/auth-store";
import { AuthPanel } from "@/components/onboarding/auth-panel";

const SLIDES = [
  { icon: Timer, headline: "Timed Battles", desc: "Race the clock in competitive sprint quizzes" },
  { icon: Trophy, headline: "Live Rankings", desc: "See where you stand against thousands" },
  { icon: BrainCircuit, headline: "Smart Practice", desc: "Adaptive difficulty that grows with you" },
  { icon: BarChart3, headline: "Detailed Analytics", desc: "Track progress by topic and accuracy" },
];

type Props = {
  onSelect: () => void;
  onPause: () => void;
  onResume: () => void;
};

export function StepWelcome({ onSelect, onPause, onResume }: Props) {
  const setAuthData = useOnboardingStore((s) => s.setAuthData);
  const nextStep = useOnboardingStore((s) => s.nextStep);
  const authLogin = useAuthStore((s) => s.login);

  const [slideIndex, setSlideIndex] = useState(0);
  const [offsetPct, setOffsetPct] = useState(0);
  const [authMode, setAuthMode] = useState<"select" | "phone">("select");
  const [transition, setTransition] = useState(true);
  const trackRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);
  const touchDiff = useRef(0);
  const slideTimer = useRef<ReturnType<typeof setInterval>>();
  const isDragging = useRef(false);
  const containerWidth = useRef(0);

  const goToSlide = useCallback((i: number) => {
    const target = Math.max(0, Math.min(i, SLIDES.length - 1));
    setSlideIndex(target);
    setTransition(true);
    setOffsetPct(-target * 100);
  }, []);

  const handleAuthSuccess = (data: { name?: string; phone?: string; authMethod: "google" | "phone" }) => {
    setAuthData(data);
    authLogin(data.phone ?? `${data.name}@google.com`, "mock-password");
    onSelect();
    nextStep();
  };

  const handleGoogle = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleAuthSuccess({ name: "Google User", authMethod: "google" });
  };

  const handlePhoneTap = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPause();
    setAuthMode("phone");
  };

  const handlePhoneBack = () => {
    onResume();
    setAuthMode("select");
  };

  const handleSkip = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect();
    nextStep();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    containerWidth.current = containerRef.current?.offsetWidth || 1;
    isDragging.current = true;
    touchStartX.current = e.touches[0].clientX;
    touchDiff.current = 0;
    setTransition(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current) return;
    e.preventDefault();
    touchDiff.current = e.touches[0].clientX - touchStartX.current;
    const pct = (touchDiff.current / containerWidth.current) * 100;
    setOffsetPct(-slideIndex * 100 + pct);
  };

  const handleTouchEnd = () => {
    isDragging.current = false;
    if (Math.abs(touchDiff.current) > 50) {
      goToSlide(touchDiff.current < 0 ? slideIndex + 1 : slideIndex - 1);
    } else {
      goToSlide(slideIndex);
    }
    touchDiff.current = 0;
  };

  useEffect(() => {
    if (authMode !== "select") return;
    goToSlide(0);

    slideTimer.current = setInterval(() => {
      setSlideIndex((prev) => {
        const next = prev + 1;
        if (next >= SLIDES.length) return prev;
        goToSlide(next);
        return next;
      });
    }, 4000);

    return () => clearInterval(slideTimer.current);
  }, [authMode, goToSlide]);

  if (authMode === "phone") {
    return (
      <div ref={containerRef} className="flex flex-col gap-4 w-full">
        <button
          type="button"
          onClick={handlePhoneBack}
          className="self-start text-fluid-xs text-muted-foreground/50 underline underline-offset-2 outline-none hover:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring rounded px-1"
        >
          &larr; Back
        </button>
        <AuthPanel onAuthSuccess={handleAuthSuccess} onPauseAutoSlide={onPause} onResumeAutoSlide={onResume} />
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex flex-col gap-4 w-full">
      <div
        className="relative overflow-hidden rounded-2xl" style={{ touchAction: "pan-y" }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          ref={trackRef}
          className="flex"
          style={{
            transform: `translateX(${offsetPct}%)`,
            transition: transition ? "transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)" : "none",
          }}
        >
          {SLIDES.map((slide, i) => {
            const Icon = slide.icon;
            return (
              <div key={i} className="w-full flex-shrink-0 flex flex-col items-center justify-center py-6 px-4 gap-3 select-none">
                <div className="grid size-16 place-items-center rounded-2xl bg-primary/10">
                  <Icon size={28} className="text-primary" />
                </div>
                <h2 className="text-fluid-xl font-black text-foreground text-center">{slide.headline}</h2>
                <p className="text-fluid-sm text-muted-foreground/60 text-center max-w-xs">{slide.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex justify-center gap-1.5">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={(e) => { e.stopPropagation(); goToSlide(i); }}
            className={cn(
              "size-2 rounded-full transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-ring",
              i === slideIndex ? "bg-primary scale-125 shadow-[0_0_6px_var(--primary)]" : "bg-border hover:bg-muted-foreground/30",
            )}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>

      <div className="flex flex-col gap-2.5 mt-2">
        <button
          type="button"
          onClick={handleGoogle}
          className="group relative flex w-full items-center justify-center gap-3 rounded-2xl border border-border/60 bg-card px-4 py-3.5 text-fluid-base font-semibold text-foreground outline-none transition-all hover:border-primary/40 hover:bg-accent/40 active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-ring overflow-hidden"
        >
          <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-primary/10 to-transparent" />
          <Globe size={18} className="text-muted-foreground" />
          Continue with Google
        </button>
        <button
          type="button"
          onClick={handlePhoneTap}
          className="group relative flex w-full items-center justify-center gap-3 rounded-2xl border border-border/60 bg-card px-4 py-3.5 text-fluid-base font-semibold text-foreground outline-none transition-all hover:border-primary/40 hover:bg-accent/40 active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-ring overflow-hidden"
        >
          <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-primary/10 to-transparent" />
          <Smartphone size={18} className="text-muted-foreground" />
          Continue with Phone Number
        </button>
        <button
          type="button"
          onClick={handleSkip}
          className="w-full text-center text-fluid-xs text-muted-foreground/50 underline underline-offset-2 outline-none hover:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring rounded py-1"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}
