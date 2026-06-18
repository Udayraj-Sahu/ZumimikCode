"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { useOnboardingStore } from "@/stores/onboarding-store";

const LEVELS = [
  { id: "beginner", label: "Beginner", icon: "🌱", desc: "Just starting out", bars: 1 },
  { id: "intermediate", label: "Intermediate", icon: "📊", desc: "Some practice done", bars: 2 },
  { id: "advanced", label: "Advanced", icon: "🚀", desc: "Confident in most topics", bars: 3 },
  { id: "adaptive", label: "Adaptive", icon: "🔄", desc: "Let the arena decide", bars: 4 },
];

type Props = {
  onSelect: () => void;
};

export function StepLevel({ onSelect }: Props) {
  const level = useOnboardingStore((s) => s.level);
  const setLevel = useOnboardingStore((s) => s.setLevel);
  const nextStep = useOnboardingStore((s) => s.nextStep);
  const [selected, setSelected] = useState(level);

  const handleSelect = (id: string) => {
    setSelected(id);
    setLevel(id);
    onSelect();
  };

  const barColors = ["bg-green-500", "bg-yellow-500", "bg-orange-500", "bg-purple-500"];

  return (
    <div className="flex flex-col gap-5">
      <p data-step-el className="text-fluid-lg font-bold text-foreground text-center">
        Your experience?
      </p>
      <div className="flex flex-col gap-2.5">
        {LEVELS.map((lvl) => {
          const active = selected === lvl.id;
          return (
            <button
              key={lvl.id}
              data-step-el
              type="button"
              onClick={() => handleSelect(lvl.id)}
              className={cn(
                "flex items-center gap-3 rounded-2xl border p-4 text-left outline-none transition-all duration-200 active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-ring",
                active
                  ? "border-primary bg-accent shadow-[0_0_0_1px_var(--primary)]"
                  : "border-border/60 bg-card hover:border-border hover:bg-accent/40",
              )}
            >
              <span className="text-xl">{lvl.icon}</span>
              <div className="flex-1">
                <p className={cn(
                  "text-fluid-base font-bold",
                  active ? "text-primary" : "text-foreground",
                )}>
                  {lvl.label}
                </p>
                <p className="text-fluid-xs text-muted-foreground/60 mt-0.5">{lvl.desc}</p>
              </div>
              <div className="flex items-end gap-[3px] h-8">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "w-1.5 rounded-t-sm transition-all duration-500",
                      i < lvl.bars ? barColors[lvl.bars - 1] || "bg-primary" : "bg-border/40",
                      active && i < lvl.bars ? "shadow-[0_0_6px]" : "",
                    )}
                    style={{ height: `${30 + i * 20}%` }}
                  />
                ))}
              </div>
            </button>
          );
        })}
      </div>
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
