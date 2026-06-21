"use client";

import { useState, useCallback, useMemo, ReactNode } from "react";
import gsap from "gsap";
import type { SolveAlongTemplate, RenderMode } from "@/lib/types/template";
import StepCard from "./StepCard";
import HintDrawer from "./HintDrawer";
import TrapBadge from "./TrapBadge";
import AnswerInput from "./AnswerInput";

interface TextScaffoldProps {
  template: SolveAlongTemplate;
  visibleSteps: number;
  mode: RenderMode;
  children?: ReactNode;
  onStepReveal?: () => void;
  onCorrect?: () => void;
  onWrong?: () => void;
}

function extractAnswer(example: {
  solution?: { operation: string; result?: string }[];
  answer?: string;
}): string {
  if (example.answer) return example.answer;
  const steps = example.solution ?? [];
  if (steps.length > 0) {
    const last = steps[steps.length - 1];
    if (last.result) return last.result;
    const eqMatch = last.operation.match(/=\s*([\d,]+)$/);
    if (eqMatch) return eqMatch[1];
  }
  return "";
}

export default function TextScaffold({
  template,
  visibleSteps,
  mode,
  children,
  onStepReveal,
  onCorrect,
  onWrong,
}: TextScaffoldProps) {
  const example = useMemo(
    () => template.examples?.[0] ?? { solution: [] },
    [template.examples],
  );
  const steps = useMemo(() => example.solution ?? [], [example.solution]);
  const hints = useMemo(() => template.key_reminders ?? [], [template.key_reminders]);
  const traps = useMemo(() => template.common_mistakes ?? [], [template.common_mistakes]);
  const answer = useMemo(() => extractAnswer(example), [example]);
  const totalSteps = steps.length;
  const allRevealed = visibleSteps >= totalSteps;

  const handleReveal = useCallback(() => {
    onStepReveal?.();
  }, [onStepReveal]);

  return (
    <div className="space-y-5">
      {/* L1: PROBLEM */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-md bg-primary/10 px-2.5 py-1 text-fluid-xs font-bold text-primary">
            {template.concept?.technique_name ?? "Practice"}
          </span>
          <span className="text-fluid-xs text-muted-foreground/50">
            Difficulty: {template.difficulty}/5
          </span>
        </div>
        <h2 className="text-fluid-xl font-bold leading-snug text-foreground">
          {example.problem_statement}
        </h2>
      </div>

      {/* L2: STEPS */}
      {mode !== "quick" && steps.length > 0 && (
        <div role="list" className="space-y-2" aria-label="Solution steps">
          {steps.map((step, i) => (
            <StepCard
              key={step.step_num}
              step={step}
              visible={i < visibleSteps}
              isLast={i === steps.length - 1}
            />
          ))}
          {!allRevealed && mode === "solve_along" && (
            <button
              type="button"
              onClick={handleReveal}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border/60 py-3 text-fluid-xs font-bold uppercase tracking-wider text-muted-foreground outline-none transition-colors hover:border-primary/40 hover:text-primary focus-visible:ring-2 focus-visible:ring-ring"
            >
              Show Next Step ({visibleSteps}/{totalSteps})
            </button>
          )}
          {allRevealed && (
            <p className="text-center text-fluid-xs font-bold text-primary">
              All steps revealed
            </p>
          )}
        </div>
      )}

      {/* L3: HINTS */}
      {mode !== "quick" && hints.length > 0 && (
        <HintDrawer hints={hints} />
      )}

      {/* L4: TRAPS */}
      {traps.length > 0 && allRevealed && (
        <TrapBadge traps={traps} userAnswer={null} />
      )}

      {/* L5: VISUAL — renderer canvas */}
      {children && (
        <div
          className="flex justify-center rounded-2xl border border-border/30 bg-card/50 p-4"
          aria-label="Visual scaffold"
        >
          {children}
        </div>
      )}

      {/* ANSWER INPUT */}
      <AnswerInput
        expectedAnswer={answer}
        onCorrect={() => onCorrect?.()}
        onWrong={() => onWrong?.()}
        disabled={mode === "quick" && allRevealed}
      />
    </div>
  );
}
