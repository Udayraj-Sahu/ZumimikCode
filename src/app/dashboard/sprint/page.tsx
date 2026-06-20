"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import gsap from "gsap";
import { ArrowLeft, Check, X, Clock, Zap, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSprintSession } from "@/hooks/queries/use-sprint-session";
import { useSprintStore } from "@/stores/sprint-store";
import { useFeedback } from "@/lib/use-feedback";
import { usePageMeta } from "@/hooks/use-page-meta";
import type { Question } from "@/lib/types/sprint-session";

function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

function SprintContent() {
  usePageMeta("Sprint — Exam Arena");
  const router = useRouter();
  const searchParams = useSearchParams();
  const topic = searchParams.get("topic") ?? "";
  const length = parseInt(searchParams.get("length") ?? "10", 10);
  const difficulty = searchParams.get("difficulty") ?? "beginner";

  const feedback = useFeedback();
  const { data, isLoading, error } = useSprintSession(topic, length, difficulty);
  const {
    status, currentIndex, timeLeft,
    initSprint, answerCurrent, nextQuestion, tick, completeSprint, reset,
  } = useSprintStore();

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const autoAdvanceRef = useRef<ReturnType<typeof setTimeout>>();
  const feedbackRef = useRef<HTMLDivElement>(null);
  const questionsRef = useRef(data?.questions ?? null);
  questionsRef.current = data?.questions ?? null;

  const goToResults = useCallback(() => {
    router.push("/dashboard/sprint/results");
  }, [router]);

  const finishSprint = useCallback(() => {
    if (data) {
      feedback.complete();
      completeSprint({
        questions: data.questions,
        topicLabel: data.topicLabel,
        difficulty: data.difficulty,
      });
      goToResults();
    }
  }, [data, completeSprint, goToResults, feedback]);

  useEffect(() => {
    if (data && status === "idle") {
      initSprint(data.totalTime);
    }
  }, [data, status, initSprint]);

  useEffect(() => {
    if (status !== "active" || timeLeft <= 0) return;
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [status, timeLeft, tick]);

  useEffect(() => {
    if (status === "active" && timeLeft <= 0) {
      finishSprint();
    }
  }, [status, timeLeft, finishSprint]);

  useEffect(() => {
    if (status === "active" && timeLeft <= 30 && timeLeft > 0) {
      feedback.countdown();
    }
  }, [status, timeLeft, feedback]);

  useEffect(() => {
    if (feedbackRef.current && showFeedback) {
      gsap.fromTo(feedbackRef.current, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.2, ease: "power2.out" });
    }
  }, [showFeedback]);

  const handleSelect = (optionIndex: number) => {
    if (showFeedback || status !== "active") return;
    const q = data?.questions[currentIndex];
    if (!q) return;

    setSelectedIndex(optionIndex);
    setShowFeedback(true);
    answerCurrent(q.id, optionIndex);
    if (optionIndex === q.correctIndex) {
      feedback.correct();
    } else {
      feedback.wrong();
    }

    autoAdvanceRef.current = setTimeout(() => {
      if (autoAdvanceRef.current) clearTimeout(autoAdvanceRef.current);
      const isLast = currentIndex >= (data?.questions.length ?? 1) - 1;
      if (isLast) {
        finishSprint();
      } else {
        setSelectedIndex(null);
        setShowFeedback(false);
        nextQuestion();
      }
    }, 1200);
  };

  const handleNext = () => {
    if (autoAdvanceRef.current) clearTimeout(autoAdvanceRef.current);
    const isLast = currentIndex >= (data?.questions.length ?? 1) - 1;
    if (isLast) {
      finishSprint();
    } else {
      setSelectedIndex(null);
      setShowFeedback(false);
      nextQuestion();
    }
  };

  const headerRef = useCallback((el: HTMLDivElement | null) => {
    if (el) gsap.fromTo(el, { opacity: 0, y: -8 }, { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" });
  }, []);

  const questionRef = useCallback((el: HTMLDivElement | null) => {
    if (el) {
      gsap.fromTo(el, { opacity: 0, x: 16 }, { opacity: 1, x: 0, duration: 0.25, ease: "power2.out" });
    }
  }, []);

  if (!topic || length <= 0) {
    return (
      <div className="mx-auto max-w-lg px-4 sm:px-6 pt-8 text-center">
        <p className="text-fluid-base text-muted-foreground">No sprint configuration found.</p>
        <button
          type="button"
          onClick={() => router.push("/dashboard/configure-sprint")}
          className="mt-4 rounded-lg bg-primary px-6 py-3 text-fluid-sm font-bold text-primary-foreground outline-none transition-transform hover:scale-[1.02] active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-ring"
        >
          Configure Sprint
        </button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-lg px-4 sm:px-6 pt-8 text-center">
        <p className="text-fluid-base font-semibold text-destructive">Failed to load sprint questions.</p>
        <p className="mt-2 text-fluid-sm text-muted-foreground/60">{error instanceof Error ? error.message : "Something went wrong"}</p>
        <div className="mt-6 flex justify-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/dashboard/configure-sprint")}
            className="rounded-lg bg-muted px-5 py-3 text-fluid-sm font-bold text-foreground outline-none transition-colors hover:bg-muted/70 focus-visible:ring-2 focus-visible:ring-ring"
          >
            Back
          </button>
          <button
            type="button"
            onClick={() => router.refresh()}
            className="rounded-lg bg-primary px-5 py-3 text-fluid-sm font-bold text-primary-foreground outline-none transition-transform hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-ring"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (isLoading || !data) {
    return (
      <div className="mx-auto max-w-lg px-4 sm:px-6 pt-6 animate-pulse">
        <div className="h-14 rounded-lg bg-card mb-4" />
        <div className="h-48 rounded-2xl bg-card mb-4" />
        <div className="h-12 rounded-lg bg-card" />
      </div>
    );
  }

  const question: Question | undefined = data.questions[currentIndex];
  const progress = data.questions.length > 0 ? ((currentIndex + (showFeedback ? 1 : 0)) / data.questions.length) * 100 : 0;
  const isLast = currentIndex >= data.questions.length - 1;
  const isTimerLow = timeLeft <= 30;

  return (
    <div className="mx-auto max-w-lg px-4 sm:px-6">
      <div ref={headerRef} className="flex items-center justify-between pt-4 pb-3">
        <button
          type="button"
          onClick={() => { reset(); router.push("/dashboard/configure-sprint"); }}
          className="flex items-center gap-1 outline-none transition-opacity hover:opacity-70 focus-visible:ring-2 focus-visible:ring-ring rounded p-1 text-muted-foreground/60"
          aria-label="Back to configure"
        >
          <ArrowLeft size={20} />
        </button>
        <span className="text-fluid-xs font-bold uppercase tracking-widest text-muted-foreground/50">
          {currentIndex + 1} / {data.questions.length}
        </span>
      </div>

      <div className="h-1.5 w-full rounded-full bg-muted mb-5">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex items-center justify-between mb-5">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-fluid-xs font-bold uppercase tracking-wider text-primary">
          <Zap size={10} />
          {data.topicLabel}
        </span>
        <span className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-fluid-xs font-bold font-mono",
          isTimerLow ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground",
        )}>
          <Clock size={10} />
          {formatTime(timeLeft)}
        </span>
      </div>

      {question && (
        <div key={question.id} ref={questionRef}>
          <p className="text-fluid-xl font-bold leading-snug text-foreground mb-5">
            {question.text}
          </p>

          <div className="flex flex-col gap-2.5">
            {question.options.map((option, i) => {
              const isSelected = selectedIndex === i;
              const isCorrect = i === question.correctIndex;
              let variant = "bg-card border-border/60 text-foreground hover:border-border hover:bg-accent/40" as string;
              if (showFeedback) {
                if (isSelected && isCorrect) variant = "border-primary bg-primary/10 text-primary";
                else if (isSelected && !isCorrect) variant = "border-destructive bg-destructive/10 text-destructive";
                else if (isCorrect) variant = "border-primary bg-primary/5 text-primary";
                else variant = "border-border/30 bg-card/50 text-muted-foreground/40";
              }

              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelect(i)}
                  disabled={showFeedback}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl border p-4 text-left outline-none transition-all duration-200 focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.98]",
                    variant,
                  )}
                >
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-muted text-fluid-xs font-bold text-muted-foreground">
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="flex-1 text-fluid-base font-medium">{option}</span>
                  {showFeedback && isSelected && (
                    <span className={cn("size-5", isCorrect ? "text-primary" : "text-destructive")}>
                      {isCorrect ? <Check size={20} /> : <X size={20} />}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {showFeedback && (
            <div ref={feedbackRef} className="mt-5">
              <button
                type="button"
                onClick={handleNext}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-fluid-base font-bold uppercase tracking-widest text-primary-foreground outline-none transition-transform hover:scale-[1.01] active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-ring"
              >
                {isLast ? "See Results" : "Next"} <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      )}

      {!showFeedback && (
        <div className="mt-6 flex justify-center gap-1.5">
          {data.questions.map((_, i) => (
            <span
              key={i}
              className={cn(
                "size-2 rounded-full transition-all duration-300",
                i === currentIndex ? "bg-primary scale-125" : i < currentIndex ? "bg-primary/40" : "bg-muted",
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function SprintPage() {
  return (
    <Suspense fallback={
      <div className="mx-auto max-w-lg px-4 sm:px-6 pt-6 animate-pulse">
        <div className="h-14 rounded-lg bg-card mb-4" />
        <div className="h-48 rounded-2xl bg-card mb-4" />
        <div className="h-12 rounded-lg bg-card" />
      </div>
    }>
      <SprintContent />
    </Suspense>
  );
}
