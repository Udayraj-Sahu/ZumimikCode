"use client";

import { useCallback, useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { Check, X, ChevronRight, ChevronDown, Zap, Clock, Award, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSprintStore } from "@/stores/sprint-store";
import { useRateStore } from "@/stores/rate-store";
import { usePageMeta } from "@/hooks/use-page-meta";
import type { SprintResult, Question } from "@/lib/types/sprint-session";

function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export default function SprintResultsPage() {
  usePageMeta("Sprint Results — Exam Arena");
  const router = useRouter();
  const lastResult = useSprintStore((s) => s.lastResult);
  const lastSession = useSprintStore((s) => s.lastSession);
  const reset = useSprintStore((s) => s.reset);
  const incrementSprint = useRateStore((s) => s.increment);
  const [reviewOpen, setReviewOpen] = useState(false);

  useEffect(() => {
    incrementSprint();
  }, [incrementSprint]);
  const resultRef = useRef<HTMLDivElement>(null);
  const reviewRef = useRef<HTMLDivElement>(null);

  const result: SprintResult | null = lastResult;
  const session: { questions: Question[]; topicLabel: string; difficulty: string } | null = lastSession;

  useEffect(() => {
    if (resultRef.current && result) {
      gsap.fromTo(resultRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" });
    }
  }, [result]);

  useEffect(() => {
    if (reviewOpen && reviewRef.current) {
      const cards = reviewRef.current.querySelectorAll<HTMLElement>("[data-review-card]");
      gsap.fromTo(cards, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.3, stagger: 0.06, ease: "power2.out" });
    }
  }, [reviewOpen]);

  const handleReset = useCallback(() => {
    reset();
    router.push("/dashboard/configure-sprint");
  }, [reset, router]);

  if (!result || !session) {
    return (
      <div className="mx-auto max-w-lg px-4 sm:px-6 pt-20 text-center">
        <p className="text-fluid-base text-muted-foreground">No sprint results found.</p>
        <button
          type="button"
          onClick={() => router.push("/dashboard/configure-sprint")}
          className="mt-4 rounded-lg bg-primary px-6 py-3 text-fluid-sm font-bold text-primary-foreground outline-none transition-transform hover:scale-[1.02] active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-ring"
        >
          Start a Sprint
        </button>
      </div>
    );
  }

  const topicBreakdown = () => {
    const count = session.questions.length;
    return (
      <>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-fluid-xs font-semibold text-muted-foreground/60">QUESTIONS</span>
          <span className="text-fluid-xs font-mono font-bold text-foreground/80">{result.score}/{result.total}</span>
        </div>
        <div className="h-2 w-full rounded-full bg-muted overflow-hidden mb-4">
          <div
            className="h-full rounded-full bg-primary transition-all duration-700 ease-out"
            style={{ width: `${result.accuracy}%` }}
          />
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          <div className="rounded-lg border border-border/40 bg-card p-3">
            <p className="text-fluid-xs font-semibold tracking-widest text-muted-foreground/50">ACCURACY</p>
            <p className="text-fluid-xl font-black text-primary mt-0.5">{result.accuracy}%</p>
          </div>
          <div className="rounded-lg border border-border/40 bg-card p-3">
            <p className="text-fluid-xs font-semibold tracking-widest text-muted-foreground/50">XP EARNED</p>
            <p className="text-fluid-xl font-black text-chart-2 mt-0.5">+{result.xpEarned}</p>
          </div>
          <div className="rounded-lg border border-border/40 bg-card p-3">
            <p className="text-fluid-xs font-semibold tracking-widest text-muted-foreground/50">TIME</p>
            <p className="text-fluid-xl font-bold text-foreground/80 mt-0.5">{formatTime(Math.round(result.totalTimeSpent))}</p>
          </div>
          <div className="rounded-lg border border-border/40 bg-card p-3">
            <p className="text-fluid-xs font-semibold tracking-widest text-muted-foreground/50">CORRECT</p>
            <p className="text-fluid-xl font-bold text-chart-3 mt-0.5">{result.score}/{result.total}</p>
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 pt-6 pb-10">
      {/* Header */}
      <div className="mb-6">
        <p className="text-fluid-xs font-semibold tracking-[0.15em] text-muted-foreground/60">EXAM ARENA</p>
        <h1 className="text-fluid-2xl font-black tracking-tight text-foreground">Sprint Results</h1>
        <p className="text-fluid-sm text-muted-foreground/60">{session.topicLabel} &middot; {session.difficulty}</p>
      </div>

      {/* Score + stats */}
      <div ref={resultRef} className="flex flex-col lg:flex-row gap-6">
        {/* Left: Score badge + message */}
        <div className="lg:w-72 shrink-0 flex flex-col items-center lg:items-start text-center lg:text-left">
          <div className={cn(
            "grid size-28 place-items-center rounded-full text-fluid-3xl font-black ring-4",
            result.accuracy >= 80
              ? "bg-primary/10 text-primary ring-primary/20"
              : result.accuracy >= 50
                ? "bg-chart-3/10 text-chart-3 ring-chart-3/20"
                : "bg-destructive/10 text-destructive ring-destructive/20",
          )}>
            {result.accuracy}%
          </div>
          <h2 className="mt-4 text-fluid-xl font-black tracking-tight text-foreground">
            {result.accuracy >= 80 ? "Great Work!" : result.accuracy >= 50 ? "Keep Going!" : "Keep Practicing!"}
          </h2>
          <p className="text-fluid-sm text-muted-foreground/60 mt-1">Complete sprints daily to improve</p>
          <div className="hidden lg:block mt-6 w-full">
            {topicBreakdown()}
          </div>
        </div>

        {/* Right: Stats grid + actions */}
        <div className="flex-1 min-w-0">
          {/* Mobile breakdown */}
          <div className="lg:hidden mb-5">
            {topicBreakdown()}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-fluid-base font-bold uppercase tracking-widest text-primary-foreground outline-none transition-transform hover:scale-[1.01] active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-ring"
            >
              Dashboard <ChevronRight size={16} />
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="flex-1 flex items-center justify-center gap-2 rounded-2xl border border-border/60 bg-card py-4 text-fluid-sm font-bold uppercase tracking-widest text-foreground outline-none transition-colors hover:bg-accent/40 focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Zap size={14} /> New Sprint
            </button>
          </div>

          {/* Review toggle */}
          <button
            type="button"
            onClick={() => setReviewOpen(!reviewOpen)}
            className="flex w-full items-center justify-between rounded-xl border border-border/40 bg-card px-4 py-3 text-left outline-none transition-colors hover:bg-accent/40 focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="flex items-center gap-2 text-fluid-sm font-bold uppercase tracking-widest text-foreground/80">
              <Award size={16} className="text-muted-foreground/60" />
              Review Answers
            </span>
            <ChevronDown
              size={18}
              className={cn(
                "text-muted-foreground transition-transform duration-200",
                reviewOpen && "rotate-180",
              )}
            />
          </button>

          {/* Review cards */}
          {reviewOpen && (
            <div ref={reviewRef} className="mt-4 flex flex-col gap-4">
              {session.questions.map((q, i) => {
                const a = result.answers.find((x) => x.questionId === q.id);
                const selected = a?.selectedIndex ?? -1;
                return (
                  <div
                    key={q.id}
                    data-review-card
                    className="rounded-xl border border-border/40 bg-card p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="flex items-center gap-1.5 text-fluid-xs font-bold uppercase tracking-wider">
                        <span className={cn(
                          "grid size-5 place-items-center rounded text-fluid-xs font-bold",
                          a?.correct ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive",
                        )}>
                          {a?.correct ? <Check size={10} /> : <X size={10} />}
                        </span>
                        Question {i + 1}
                      </span>
                      <span className="text-fluid-xs font-mono text-muted-foreground/40">
                        {Math.round(a?.timeSpent ?? 0)}s
                      </span>
                    </div>
                    <p className="text-fluid-sm font-semibold text-foreground/80 mb-2.5 leading-relaxed">
                      {q.text}
                    </p>
                    <div className="flex flex-col gap-1.5">
                      {q.options.map((option, oi) => {
                        const isUserPick = oi === selected;
                        const isRight = oi === q.correctIndex;
                        let variant = "bg-muted/50 border-transparent text-muted-foreground/50" as string;
                        if (isRight && isUserPick) variant = "border-primary bg-primary/10 text-primary";
                        else if (isRight) variant = "border-primary bg-primary/5 text-primary";
                        else if (isUserPick) variant = "border-destructive bg-destructive/10 text-destructive";
                        return (
                          <div
                            key={oi}
                            className={cn(
                              "flex items-center gap-2 rounded-lg border px-3 py-2 text-fluid-xs",
                              variant,
                            )}
                          >
                            <span className="font-mono text-fluid-xs opacity-60 w-3">
                              {String.fromCharCode(65 + oi)}
                            </span>
                            <span className="flex-1">{option}</span>
                            {isUserPick && (
                              <span className={cn(isRight ? "text-primary" : "text-destructive")}>
                                {isRight ? <Check size={12} /> : <X size={12} />}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
