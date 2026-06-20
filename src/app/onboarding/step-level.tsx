"use client";

import { useState, useEffect, useRef } from "react";
import { Sprout, TrendingUp, Rocket, Shuffle } from "lucide-react";
import gsap from "gsap";
import { cn } from "@/lib/utils";
import { useOnboardingStore } from "@/stores/onboarding-store";

const StairStepSVG = () => (
  <svg width="200" height="150" viewBox="0 0 200 150" className="w-24 h-[72px]" aria-hidden="true">
    <defs>
      <pattern id="stepDot" width="8" height="8" patternUnits="userSpaceOnUse">
        <circle cx="1" cy="1" r="0.3" fill="#ffffff06" />
      </pattern>
    </defs>
    <rect width="200" height="150" fill="url(#stepDot)" />
    <rect x="55" y="85" width="90" height="8" rx="2" fill="#C8FF5A20" />
    <rect x="65" y="70" width="70" height="8" rx="2" fill="#C8FF5A30">
      <animate attributeName="opacity" values="0.3;0.6;0.3" dur="3s" repeatCount="indefinite" />
    </rect>
    <rect x="78" y="55" width="44" height="8" rx="2" fill="#C8FF5A40">
      <animate attributeName="opacity" values="0.4;0.8;0.4" dur="2.5s" repeatCount="indefinite" />
    </rect>
    <rect x="90" y="40" width="20" height="8" rx="2" fill="#C8FF5A">
      <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" />
    </rect>
    <line x1="50" y1="95" x2="150" y2="95" stroke="#ffffff08" strokeWidth="0.5" strokeDasharray="2 4" />
    <circle cx="40" cy="55" r="1.5" fill="#C8FF5A" opacity="0.4">
      <animate attributeName="opacity" values="0.1;0.5;0.1" dur="3s" repeatCount="indefinite" />
    </circle>
    <circle cx="165" cy="85" r="1" fill="#3B82F6" opacity="0.4">
      <animate attributeName="opacity" values="0.2;0.6;0.2" dur="2.5s" repeatCount="indefinite" />
    </circle>
  </svg>
);

const LEVELS = [
  { id: "beginner", label: "Beginner", icon: Sprout, desc: "Just starting out", bars: 1 },
  { id: "intermediate", label: "Intermediate", icon: TrendingUp, desc: "Some practice done", bars: 2 },
  { id: "advanced", label: "Advanced", icon: Rocket, desc: "Confident in most topics", bars: 3 },
  { id: "adaptive", label: "Adaptive", icon: Shuffle, desc: "Let the arena decide", bars: 4 },
];

type Props = { onSelect: () => void };

export function StepLevel({ onSelect }: Props) {
  const level = useOnboardingStore((s) => s.level);
  const setLevel = useOnboardingStore((s) => s.setLevel);
  const nextStep = useOnboardingStore((s) => s.nextStep);
  const [selected, setSelected] = useState(level);
  const barsRef = useRef<Map<string, HTMLDivElement>>(new Map());

  const handleSelect = (id: string) => {
    setSelected(id);
    setLevel(id);
    onSelect();
  };

  useEffect(() => {
    LEVELS.forEach((lvl) => {
      const el = barsRef.current.get(lvl.id);
      if (el) {
        const bars = el.querySelectorAll<HTMLElement>("[data-bar]");
        const active = selected === lvl.id;
        gsap.fromTo(
          bars,
          { height: "10%" },
          {
            height: (_i: number) => `${30 + _i * 20}%`,
            duration: 0.3,
            ease: "back.out(1.7)",
            stagger: 0.04,
            delay: active ? 0 : 0.1,
          },
        );
      }
    });
  }, [selected]);

  const setBarRef = (id: string, el: HTMLDivElement | null) => {
    if (el) barsRef.current.set(id, el);
    else barsRef.current.delete(id);
  };

  return (
    <div className="flex flex-col items-center gap-5 w-full">
      <StairStepSVG />
      <fieldset className="w-full border-none p-0 m-0 flex flex-col items-center gap-5">
        <legend className="text-fluid-lg font-black text-foreground text-center uppercase tracking-wide">Your experience?</legend>
        <p data-step-el className="text-[10px] text-muted-foreground/40 text-center uppercase tracking-[0.08em]">Set your starting rank</p>
      <div className="flex flex-col gap-2.5 w-full" role="group" aria-label="Experience level">
        {LEVELS.map((lvl) => {
          const active = selected === lvl.id;
          const Icon = lvl.icon;
          return (
            <button
              key={lvl.id}
              data-step-el
              type="button"
              onClick={() => handleSelect(lvl.id)}
              className={cn(
                "group flex items-center gap-3 rounded-2xl border p-[13px] text-left outline-none transition-all duration-200 active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-ring",
                active
                  ? "border-primary bg-accent border-l-[3px] shadow-[0_0_0_1px_var(--primary)]"
                  : "border-border/60 bg-card hover:border-border hover:bg-accent/40",
              )}
            >
              <span className={cn(
                "grid size-9 shrink-0 place-items-center rounded-lg border transition-colors duration-200",
                active
                  ? "border-primary/30 bg-primary/10 text-primary"
                  : "border-border/40 bg-background text-muted-foreground/50 group-hover:text-muted-foreground/70",
              )}>
                <Icon className="size-[18px]" aria-hidden="true" />
              </span>
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "text-fluid-base font-bold transition-colors duration-200",
                  active ? "text-primary" : "text-foreground",
                )}>
                  {lvl.label}
                </p>
                <p className="text-fluid-xs text-muted-foreground/60 mt-0.5">{lvl.desc}</p>
              </div>
              <div ref={(el) => setBarRef(lvl.id, el)} className="flex items-end gap-[3px] h-8 shrink-0">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    data-bar
                    className={cn(
                      "w-[5px] rounded-t-sm transition-all duration-500",
                      i < lvl.bars
                        ? active
                          ? "bg-primary shadow-[0_0_6px_var(--primary)]"
                          : "bg-primary/60"
                        : "bg-border/40",
                    )}
                    style={{ height: `${30 + i * 20}%` }}
                  />
                ))}
              </div>
            </button>
          );
        })}
      </div>
      </fieldset>
      <button
        data-step-el
        type="button"
        onClick={nextStep}
        disabled={!selected}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-fluid-sm font-bold uppercase tracking-widest text-primary-foreground outline-none transition-all hover:opacity-90 active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40 disabled:pointer-events-none"
      >
        Continue
      </button>
    </div>
  );
}
