"use client";

import { useState } from "react";
import { GraduationCap, Calculator, BookOpen, Landmark, Sigma } from "lucide-react";
import { cn } from "@/lib/utils";
import { useOnboardingStore } from "@/stores/onboarding-store";

const EXAMS = [
  { id: "cat", label: "CAT", icon: GraduationCap },
  { id: "gmat", label: "GMAT", icon: Calculator },
  { id: "gre", label: "GRE", icon: BookOpen },
  { id: "banking", label: "Banking", icon: Landmark },
  { id: "vedic-math", label: "Vedic Math", icon: Sigma },
];

export function StepGoal() {
  const targetExam = useOnboardingStore((s) => s.targetExam);
  const setTargetExam = useOnboardingStore((s) => s.setTargetExam);
  const nextStep = useOnboardingStore((s) => s.nextStep);
  const [selected, setSelected] = useState(targetExam);

  const handleSelect = (id: string) => {
    setSelected(id);
    setTargetExam(id);
  };

  return (
    <div className="flex flex-col gap-5">
      <p className="text-fluid-lg font-bold text-foreground text-center">
        What are you preparing for?
      </p>
      <div className="grid grid-cols-2 gap-3">
        {EXAMS.map((exam) => {
          const active = selected === exam.id;
          const Icon = exam.icon;
          return (
            <button
              key={exam.id}
              type="button"
              onClick={() => handleSelect(exam.id)}
              className={cn(
                "flex flex-col items-center gap-2 rounded-2xl border p-5 outline-none transition-all duration-200 active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-ring",
                active
                  ? "border-primary bg-accent shadow-[0_0_0_1px_var(--primary)]"
                  : "border-border/60 bg-card hover:border-border hover:bg-accent/40",
              )}
            >
              <Icon className={cn("size-7", active ? "text-primary" : "text-muted-foreground/50")} aria-hidden="true" />
              <span className={cn(
                "text-fluid-sm font-bold tracking-wide",
                active ? "text-primary" : "text-muted-foreground/70",
              )}>
                {exam.label}
              </span>
            </button>
          );
        })}
      </div>
      <button
        type="button"
        onClick={nextStep}
        disabled={!selected}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-fluid-sm font-bold uppercase tracking-widest text-primary-foreground outline-none transition-all hover:opacity-90 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40 disabled:pointer-events-none"
      >
        Continue
      </button>
    </div>
  );
}
