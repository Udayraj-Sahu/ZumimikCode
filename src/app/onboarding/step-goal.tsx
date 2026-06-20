"use client";

import { useState } from "react";
import { GraduationCap, Calculator, BookOpen, Landmark, Sigma } from "lucide-react";
import { cn } from "@/lib/utils";
import { useOnboardingStore } from "@/stores/onboarding-store";

const TargetSVG = () => (
  <svg width="200" height="150" viewBox="0 0 200 150" className="w-24 h-[72px]" aria-hidden="true">
    <defs>
      <radialGradient id="targetGlow" cx="50%" cy="50%">
        <stop offset="0%" stopColor="#C8FF5A" stopOpacity="0.2" />
        <stop offset="100%" stopColor="#C8FF5A" stopOpacity="0" />
      </radialGradient>
      <pattern id="targetDot" width="8" height="8" patternUnits="userSpaceOnUse">
        <circle cx="1" cy="1" r="0.3" fill="#ffffff06" />
      </pattern>
    </defs>
    <rect width="200" height="150" fill="url(#targetDot)" />
    <circle cx="100" cy="75" r="55" fill="none" stroke="#C8FF5A15" strokeWidth="0.5" strokeDasharray="2 6">
      <animate attributeName="strokeDashoffset" values="0;-8" dur="4s" repeatCount="indefinite" />
    </circle>
    <circle cx="100" cy="75" r="40" fill="none" stroke="#C8FF5A20" strokeWidth="0.6" strokeDasharray="3 5">
      <animate attributeName="opacity" values="0.2;0.5;0.2" dur="3s" repeatCount="indefinite" />
    </circle>
    <circle cx="100" cy="75" r="25" fill="none" stroke="#C8FF5A30" strokeWidth="0.8" strokeDasharray="4 3">
      <animate attributeName="strokeDashoffset" values="0;7" dur="2s" repeatCount="indefinite" />
    </circle>
    <circle cx="100" cy="75" r="12" fill="url(#targetGlow)" />
    <circle cx="100" cy="75" r="4" fill="#C8FF5A" opacity="0.9">
      <animate attributeName="r" values="3;5;3" dur="2s" repeatCount="indefinite" />
    </circle>
    <line x1="100" y1="35" x2="100" y2="45" stroke="#C8FF5A40" strokeWidth="1" />
    <line x1="100" y1="105" x2="100" y2="115" stroke="#C8FF5A40" strokeWidth="1" />
    <line x1="60" y1="75" x2="70" y2="75" stroke="#C8FF5A40" strokeWidth="1" />
    <line x1="130" y1="75" x2="140" y2="75" stroke="#C8FF5A40" strokeWidth="1" />
  </svg>
);

const EXAMS = [
  { id: "cat", label: "CAT", icon: GraduationCap },
  { id: "gmat", label: "GMAT", icon: Calculator },
  { id: "gre", label: "GRE", icon: BookOpen },
  { id: "banking", label: "Banking", icon: Landmark },
  { id: "vedic-math", label: "Vedic Math", icon: Sigma },
];

type Props = { onSelect: () => void };

export function StepGoal({ onSelect }: Props) {
  const targetExam = useOnboardingStore((s) => s.targetExam);
  const setTargetExam = useOnboardingStore((s) => s.setTargetExam);
  const nextStep = useOnboardingStore((s) => s.nextStep);
  const [selected, setSelected] = useState(targetExam);

  const handleSelect = (id: string) => {
    setSelected(id);
    setTargetExam(id);
    onSelect();
  };

  return (
    <div className="flex flex-col items-center gap-5 w-full">
      <TargetSVG />
      <fieldset className="w-full border-none p-0 m-0 flex flex-col items-center gap-5">
        <legend className="text-fluid-lg font-black text-foreground text-center uppercase tracking-wide">What are you preparing for?</legend>
        <p data-step-el className="text-[10px] text-muted-foreground/40 text-center uppercase tracking-[0.08em]">Choose your arena</p>
      <div className="grid grid-cols-2 gap-2.5 w-full" role="group" aria-label="Exam choices">
        {EXAMS.map((exam) => {
          const active = selected === exam.id;
          const Icon = exam.icon;
          return (
            <button
              key={exam.id}
              data-step-el
              type="button"
              onClick={() => handleSelect(exam.id)}
              className={cn(
                "group flex flex-col items-center gap-3 rounded-2xl border p-4 outline-none transition-all duration-200 active:scale-[0.93] focus-visible:ring-2 focus-visible:ring-ring relative overflow-hidden",
                active
                  ? "border-primary bg-accent shadow-[0_0_0_1px_var(--primary)]"
                  : "border-border/60 bg-card hover:border-border hover:bg-accent/40",
              )}
            >
              {active && (
                <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
              )}
              <span className={cn(
                "grid size-10 place-items-center rounded-xl border transition-colors duration-200",
                active
                  ? "border-primary/30 bg-primary/10 text-primary"
                  : "border-border/40 bg-background text-muted-foreground/50 group-hover:text-muted-foreground/70",
              )}>
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <span className={cn(
                "text-fluid-sm font-bold tracking-wide transition-colors duration-200",
                active ? "text-primary" : "text-muted-foreground/70 group-hover:text-foreground/80",
              )}>
                {exam.label}
              </span>
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
