"use client";

import { useCallback, useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { Check, X, ChevronDown, Zap, Award, Target } from "lucide-react";
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

function parseNikhilam(text: string): { left: number; right: number } | null {
  const cleaned = text.replace(/[,\s]/g, "");
  const match = cleaned.match(/(\d+)[×x*](\d+)/);
  if (!match) return null;
  return { left: parseInt(match[1]), right: parseInt(match[2]) };
}

function findNearestBase(n: number): { base: number; deviation: number } {
  const bases = [100, 10, 1000, 10000];
  let best = bases[0];
  for (const b of bases) {
    if (Math.abs(n - b) < Math.abs(n - best)) best = b;
  }
  return { base: best, deviation: n - best };
}

function synthesizedExplanation(
  text: string,
  correctIdx: number,
  options: string[],
): { head: string; tail: string; final: string } | null {
  const correctAnswer = options[correctIdx];
  const clean = correctAnswer.replace(/[,\s]/g, "");
  const parsed = parseNikhilam(text);
  if (!parsed) return null;

  const { left, right } = parsed;
  const l = findNearestBase(left);
  const r = findNearestBase(right);

  if (l.base !== r.base) return null;

  const base = l.base;
  const cross = left + r.deviation;
  const prod = l.deviation * r.deviation;
  const digits = base.toString().length;

  const headStr = `${left} ${r.deviation >= 0 ? "+" : "−"} ${Math.abs(r.deviation)} = ${cross}`;
  const tailStr = `${l.deviation >= 0 ? "+" : "−"}${Math.abs(l.deviation)} × ${r.deviation >= 0 ? "+" : "−"}${Math.abs(r.deviation)} = ${prod}`;
  const finalStr = `${cross} | ${String(prod).padStart(digits, "0")} → = ${clean}`;

  return { head: headStr, tail: tailStr, final: finalStr };
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
  const session: { questions: Question[]; topic: string; topicLabel: string; difficulty: string } | null = lastSession;

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

  const handleMasterStroke = useCallback(() => {
    if (!session) return;
    const diff = session.difficulty.toLowerCase();
    reset();
    router.push(`/dashboard/sprint?topic=${session.topic}&length=5&difficulty=${diff}`);
  }, [session, reset, router]);

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

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 pt-6 pb-10">
      {/* Header */}
      <div ref={resultRef}>
        <p className="text-center text-fluid-xs font-bold tracking-[0.15em] text-primary">
          EXAM ARENA
        </p>
        <h1 className="mt-2 text-center text-fluid-2xl font-black tracking-tight text-foreground">
          Sprint Results
        </h1>
        <p className="mt-0.5 text-center text-fluid-sm text-muted-foreground/60">
          {session.topicLabel} &middot; {session.difficulty}
        </p>
      </div>

      {/* Score row — 4 stat cards in the spec's 98/-02 style */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-border/40 bg-card p-4 text-center">
          <p className="text-fluid-xs font-bold uppercase tracking-wider text-primary">Accuracy</p>
          <p className={cn(
            "mt-1 text-fluid-2xl font-black",
            result.accuracy >= 80 ? "text-primary" : result.accuracy >= 50 ? "text-chart-3" : "text-destructive",
          )}>
            {result.accuracy}%
          </p>
          <p className="text-fluid-xs text-muted-foreground/40 mt-0.5">
            {result.accuracy >= 80 ? "Excellent" : result.accuracy >= 50 ? "Good" : "Needs work"}
          </p>
        </div>
        <div className="rounded-xl border border-border/40 bg-card p-4 text-center">
          <p className="text-fluid-xs font-bold uppercase tracking-wider text-chart-2">XP Earned</p>
          <p className="mt-1 text-fluid-2xl font-black text-chart-2">+{result.xpEarned}</p>
          <p className="text-fluid-xs text-muted-foreground/40 mt-0.5">points</p>
        </div>
        <div className="rounded-xl border border-border/40 bg-card p-4 text-center">
          <p className="text-fluid-xs font-bold uppercase tracking-wider text-foreground/60">Time</p>
          <p className="mt-1 text-fluid-2xl font-black text-foreground/80">
            {formatTime(Math.round(result.totalTimeSpent))}
          </p>
          <p className="text-fluid-xs text-muted-foreground/40 mt-0.5">total</p>
        </div>
        <div className="rounded-xl border border-border/40 bg-card p-4 text-center">
          <p className="text-fluid-xs font-bold uppercase tracking-wider text-chart-3">Correct</p>
          <p className="mt-1 text-fluid-2xl font-black text-chart-3">{result.score}/{result.total}</p>
          <p className="text-fluid-xs text-muted-foreground/40 mt-0.5">
            {result.score === result.total ? "Perfect!" : `${Math.round(result.score / result.total * 100)}%`}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-5 h-2 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-700 ease-out",
            result.accuracy >= 80 ? "bg-primary" : result.accuracy >= 50 ? "bg-chart-3" : "bg-destructive",
          )}
          style={{ width: `${result.accuracy}%` }}
        />
      </div>

      {/* Final answer banner */}
      <div className="mt-6 rounded-xl border border-primary/20 bg-primary/5 p-5 text-center">
        <p className="text-fluid-xs font-bold uppercase tracking-[0.15em] text-primary/60">Final Verdict</p>
        <p className="mt-1 text-fluid-xl font-black text-primary">
          {result.accuracy >= 80 ? "Great Work!" : result.accuracy >= 50 ? "Keep Going!" : "Keep Practicing!"}
        </p>
        <p className="mt-0.5 text-fluid-sm text-muted-foreground/60">
          {result.score} of {result.total} correct &middot; {session.topicLabel}
        </p>
      </div>

      {/* CTA buttons */}
      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={handleMasterStroke}
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-fluid-base font-bold uppercase tracking-widest text-primary-foreground outline-none transition-transform hover:scale-[1.01] active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Zap size={16} /> Verify Master Stroke
        </button>
        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-border/60 bg-card py-4 text-fluid-sm font-bold uppercase tracking-widest text-foreground outline-none transition-colors hover:bg-accent/40 active:bg-accent/60 focus-visible:ring-2 focus-visible:ring-ring"
        >
          Dashboard
        </button>
      </div>

      {/* Review toggle */}
      <button
        type="button"
        onClick={() => setReviewOpen(!reviewOpen)}
        className="mt-8 flex w-full items-center justify-between rounded-xl border border-border/40 bg-card px-4 py-3 text-left outline-none transition-colors hover:bg-accent/40 active:bg-accent/60 focus-visible:ring-2 focus-visible:ring-ring"
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

      {/* Review cards — Synthesized Sense layout per question */}
      {reviewOpen && (
        <div ref={reviewRef} className="mt-4 flex flex-col gap-6">
          {session.questions.map((q, i) => {
            const a = result.answers.find((x) => x.questionId === q.id);
            const selected = a?.selectedIndex ?? -1;
            const isCorrect = a?.correct ?? false;
            const correctAnswer = q.options[q.correctIndex];
            const userAnswer = selected >= 0 ? q.options[selected] : "(unanswered)";
            const syn = synthesizedExplanation(q.text, q.correctIndex, q.options);

            return (
              <div
                key={q.id}
                data-review-card
                className="rounded-xl border border-border/40 bg-card overflow-hidden"
              >
                {/* Question header */}
                <div className={cn(
                  "px-4 py-3 border-b border-border/20",
                  isCorrect ? "bg-primary/5" : "bg-destructive/5",
                )}>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-fluid-xs font-bold uppercase tracking-wider">
                      <span className={cn(
                        "grid size-5 place-items-center rounded text-fluid-xs font-bold",
                        isCorrect ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive",
                      )}>
                        {isCorrect ? <Check size={10} /> : <X size={10} />}
                      </span>
                      Question {i + 1}
                    </span>
                    <span className="text-fluid-xs font-mono text-muted-foreground/40">
                      {Math.round(a?.timeSpent ?? 0)}s
                    </span>
                  </div>
                  <p className="mt-1.5 text-fluid-sm font-semibold text-foreground/80 leading-relaxed">
                    {q.text}
                  </p>
                </div>

                {/* Score row — user answer vs correct answer */}
                <div className="grid grid-cols-2 gap-2 px-4 pt-4">
                  <div className={cn(
                    "rounded-lg border p-3 text-center",
                    isCorrect
                      ? "border-primary/20 bg-primary/5"
                      : "border-destructive/20 bg-destructive/5",
                  )}>
                    <p className="text-fluid-xs font-bold uppercase tracking-wider text-muted-foreground/50">
                      Your Answer
                    </p>
                    <p className={cn(
                      "mt-1 text-fluid-base font-black",
                      isCorrect ? "text-primary" : "text-destructive",
                    )}>
                      {userAnswer}
                    </p>
                    {!isCorrect && selected >= 0 && (
                      <p className="text-fluid-xs text-muted-foreground/40 mt-0.5">
                        {String.fromCharCode(65 + selected)}
                      </p>
                    )}
                  </div>
                  <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-center">
                    <p className="text-fluid-xs font-bold uppercase tracking-wider text-muted-foreground/50">
                      Correct Answer
                    </p>
                    <p className="mt-1 text-fluid-base font-black text-primary">
                      {correctAnswer}
                    </p>
                    <p className="text-fluid-xs text-muted-foreground/40 mt-0.5">
                      {String.fromCharCode(65 + q.correctIndex)}
                    </p>
                  </div>
                </div>

                {/* Synthesized Sense — Head / Tail worked solution */}
                {syn && (
                  <div className="px-4 pt-3 pb-4 space-y-2">
                    <p className="text-fluid-xs font-bold uppercase tracking-[0.15em] text-primary/60">
                      Worked Solution
                    </p>

                    {/* Part I: Head */}
                    <div className="rounded-lg border border-border/30 bg-card/50 p-3">
                      <p className="text-fluid-xs font-bold uppercase tracking-wider text-muted-foreground/40 mb-1">
                        Part I — Head
                      </p>
                      <p className="text-fluid-sm font-mono font-bold text-foreground">
                        {syn.head}
                      </p>
                      <p className="text-fluid-xs text-muted-foreground/50 mt-0.5">
                        Cross-subtract: pick a column, it&apos;s a sum
                      </p>
                    </div>

                    {/* Part II: Tail */}
                    <div className="rounded-lg border border-border/30 bg-card/50 p-3">
                      <p className="text-fluid-xs font-bold uppercase tracking-wider text-muted-foreground/40 mb-1">
                        Part II — Tail
                      </p>
                      <p className="text-fluid-sm font-mono font-bold text-foreground">
                        {syn.tail}
                      </p>
                      <p className="text-fluid-xs text-muted-foreground/50 mt-0.5">
                        Product of deviations: Nikhilam two-digit rule applies
                      </p>
                    </div>

                    {/* Final answer banner */}
                    <div className="rounded-lg bg-primary/10 border border-primary/20 p-3 text-center">
                      <p className="text-fluid-sm font-mono font-black text-primary">
                        {syn.final}
                      </p>
                    </div>
                  </div>
                )}

                {/* Simple explanation when no Nikhilam parsing available */}
                {!syn && (
                  <div className="px-4 pt-3 pb-4">
                    <div className="rounded-lg bg-muted/30 p-3">
                      <p className="text-fluid-xs font-bold uppercase tracking-wider text-muted-foreground/40 mb-1">
                        Explanation
                      </p>
                      <p className="text-fluid-xs text-muted-foreground/60 leading-relaxed">
                        {isCorrect
                          ? "Correct answer selected."
                          : "Review the correct answer above."}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
