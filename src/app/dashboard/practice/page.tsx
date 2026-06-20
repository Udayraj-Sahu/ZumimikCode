"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { Check, X, ChevronRight, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePracticeSession } from "@/hooks/queries/use-practice";
import { useFeedback } from "@/lib/use-feedback";
import { usePageMeta } from "@/hooks/use-page-meta";
import { SPRINT_TOPICS } from "@/lib/mock/sprint";
import type { Question } from "@/lib/types/sprint-session";

type Phase = "config" | "active" | "done";

export default function PracticePage() {
  usePageMeta("Practice — Exam Arena");
  const router = useRouter();
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("Beginner");
  const [phase, setPhase] = useState<Phase>("config");
  const feedback = useFeedback();
  const { data: session, isLoading } = usePracticeSession(topic, 10, difficulty);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [revealed, setRevealed] = useState(false);
  const [completed, setCompleted] = useState<{ correct: number; total: number } | null>(null);

  const contentRef = useRef<HTMLDivElement>(null);
  const questionRef = useRef<HTMLDivElement>(null);
  const headerRef = useCallback((el: HTMLDivElement | null) => {
    if (el) gsap.fromTo(el, { opacity: 0, y: -8 }, { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" });
  }, []);

  const animateSection = useCallback((el: HTMLDivElement | null) => {
    if (el && !el.dataset.animated) {
      el.dataset.animated = "true";
      const idx = parseInt(el.dataset.sectionIndex ?? "0", 10);
      gsap.fromTo(el, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.4, delay: idx * 0.08, ease: "power2.out" });
    }
  }, []);

  useEffect(() => {
    if (questionRef.current) {
      gsap.fromTo(questionRef.current, { opacity: 0, x: 12 }, { opacity: 1, x: 0, duration: 0.2, ease: "power2.out" });
    }
  }, [currentIndex]);

  useEffect(() => {
    if (contentRef.current && completed) {
      gsap.fromTo(contentRef.current, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" });
    }
  }, [completed]);

  const startPractice = () => {
    setPhase("active");
    setCurrentIndex(0);
    setAnswers({});
    setRevealed(false);
    setCompleted(null);
  };

  const handleSelect = (optionIndex: number) => {
    if (revealed || !session) return;
    setAnswers((prev) => ({ ...prev, [session.questions[currentIndex].id]: optionIndex }));
    setRevealed(true);
    const q = session.questions[currentIndex];
    if (optionIndex === q.correctIndex) {
      feedback.correct();
    } else {
      feedback.wrong();
    }
  };

  const handleNext = () => {
    if (!session) return;
    const isLast = currentIndex >= session.questions.length - 1;
    if (isLast) {
      feedback.complete();
      const correct = session.questions.filter((q) => answers[q.id] === q.correctIndex).length;
      setCompleted({ correct, total: session.questions.length });
      setPhase("done");
    } else {
      setCurrentIndex((i) => i + 1);
      setRevealed(false);
    }
  };

  const question: Question | null = session?.questions[currentIndex] ?? null;
  const progress = session ? ((currentIndex + (revealed ? 1 : 0)) / session.questions.length) * 100 : 0;

  if (phase === "config") {
    return (
      <div className="px-4 sm:px-6 pt-6 pb-10">
        <div ref={headerRef}>
          <p className="text-fluid-xs font-semibold tracking-[0.15em] text-muted-foreground/60">EXAM ARENA</p>
          <h1 className="text-fluid-2xl font-black tracking-tight text-foreground">Topic Practice</h1>
          <p className="text-fluid-sm text-muted-foreground/60">Practice untimed, get immediate feedback</p>
        </div>

        <div ref={animateSection} data-section-index="0" className="mt-6">
          <p className="text-fluid-xs font-bold uppercase tracking-widest text-muted-foreground/50 mb-3">Choose Topic</p>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3">
            {SPRINT_TOPICS.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTopic(t.id)}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-2xl border p-4 outline-none transition-all focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.98]",
                    topic === t.id
                      ? "border-primary bg-accent shadow-[0_0_0_1px_var(--primary),0_0_24px_-4px_var(--primary)]"
                      : "border-border/60 bg-card text-muted-foreground hover:border-border hover:bg-accent/40",
                  )}
                >
                  <Icon size={24} className={topic === t.id ? "text-primary" : "text-muted-foreground/40"} />
                  <span className="text-fluid-xs font-bold text-center leading-tight">{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div ref={animateSection} data-section-index="1" className="mt-6">
          <p className="text-fluid-xs font-bold uppercase tracking-widest text-muted-foreground/50 mb-3">Difficulty</p>
          <div className="flex gap-2">
            {["Beginner", "Intermediate", "Advanced"].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDifficulty(d)}
                className={cn(
                  "flex-1 rounded-xl border py-3 text-fluid-xs font-bold uppercase tracking-wider outline-none transition-all focus-visible:ring-2 focus-visible:ring-ring",
                  difficulty === d
                    ? "border-primary bg-accent shadow-[0_0_0_1px_var(--primary)] text-foreground"
                    : "border-border/60 bg-card text-muted-foreground hover:border-border hover:bg-accent/40",
                )}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <div ref={animateSection} data-section-index="2" className="mt-8">
          <button
            type="button"
            disabled={!topic}
            onClick={startPractice}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-fluid-base font-bold uppercase tracking-widest text-primary-foreground outline-none transition-transform hover:scale-[1.01] active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <BookOpen size={16} /> Start Practice
          </button>
        </div>
      </div>
    );
  }

  if (phase === "done" && completed) {
    const accuracy = Math.round((completed.correct / completed.total) * 100);
    return (
      <div className="mx-auto max-w-lg px-4 sm:px-6 pt-8" ref={contentRef}>
        <div className="text-center">
          <div className={cn(
            "mx-auto mb-4 grid size-20 place-items-center rounded-full text-fluid-3xl font-black",
            accuracy >= 80 ? "bg-primary/10 text-primary" : accuracy >= 50 ? "bg-chart-3/10 text-chart-3" : "bg-destructive/10 text-destructive",
          )}>
            {accuracy}%
          </div>
          <h1 className="text-fluid-2xl font-black tracking-tight text-foreground">
            {accuracy >= 80 ? "Well Done!" : accuracy >= 50 ? "Keep Practicing!" : "Review & Improve!"}
          </h1>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-border/40 bg-card p-4 text-center">
            <p className="text-fluid-xs font-semibold tracking-widest text-muted-foreground/50">CORRECT</p>
            <p className="mt-1 text-fluid-2xl font-black text-foreground">{completed.correct}/{completed.total}</p>
          </div>
          <div className="rounded-xl border border-border/40 bg-card p-4 text-center">
            <p className="text-fluid-xs font-semibold tracking-widest text-muted-foreground/50">ACCURACY</p>
            <p className="mt-1 text-fluid-2xl font-black text-primary">{accuracy}%</p>
          </div>
        </div>
        <div className="mt-6 flex flex-col gap-3">
          <button
            type="button"
            onClick={() => { setPhase("config"); }}
            className="flex items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-fluid-base font-bold uppercase tracking-widest text-primary-foreground outline-none transition-transform hover:scale-[1.01] active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-ring"
          >
            Practice Again <ChevronRight size={16} />
          </button>
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="rounded-2xl border border-border/60 bg-card py-4 text-fluid-sm font-bold uppercase tracking-widest text-foreground outline-none transition-colors hover:bg-accent/40 focus-visible:ring-2 focus-visible:ring-ring"
          >
            Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (isLoading || !session) {
    return (
      <div className="mx-auto max-w-lg px-4 sm:px-6 pt-6 animate-pulse">
        <div className="h-14 rounded-lg bg-card mb-4" />
        <div className="h-48 rounded-2xl bg-card mb-4" />
        <div className="h-12 rounded-lg bg-card" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 sm:px-6 pt-6 pb-10">
      {/* Header */}
      <div ref={headerRef} className="flex items-center justify-between mb-3">
        <span className="text-fluid-xs font-bold uppercase tracking-widest text-muted-foreground/50">
          Practice &middot; {session.topicLabel}
        </span>
        <span className="text-fluid-xs font-mono text-muted-foreground/40">
          {currentIndex + 1}/{session.questions.length}
        </span>
      </div>

      <div className="h-1.5 w-full rounded-full bg-muted mb-6">
        <div className="h-full rounded-full bg-primary transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
      </div>

      {question && (
        <div key={question.id} ref={questionRef}>
          <p className="text-fluid-xl font-bold leading-snug text-foreground mb-5">{question.text}</p>
          <div className="flex flex-col gap-2.5">
            {question.options.map((option, i) => {
              const isSelected = answers[question.id] === i;
              const isCorrect = i === question.correctIndex;
              let variant = "bg-card border-border/60 text-foreground hover:border-border hover:bg-accent/40" as string;
              if (revealed) {
                if (isCorrect) variant = "border-primary bg-primary/10 text-primary";
                else if (isSelected) variant = "border-destructive bg-destructive/10 text-destructive";
                else variant = "border-border/30 bg-card/50 text-muted-foreground/40";
              }
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelect(i)}
                  disabled={revealed}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl border p-4 text-left outline-none transition-all focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.98]",
                    variant,
                  )}
                >
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-muted text-fluid-xs font-bold text-muted-foreground">
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="flex-1 text-fluid-base font-medium">{option}</span>
                  {revealed && isCorrect && <Check size={20} className="text-primary shrink-0" />}
                  {revealed && isSelected && !isCorrect && <X size={20} className="text-destructive shrink-0" />}
                </button>
              );
            })}
          </div>

          {revealed && (
            <div className="mt-5">
              <button
                type="button"
                onClick={handleNext}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-fluid-base font-bold uppercase tracking-widest text-primary-foreground outline-none transition-transform hover:scale-[1.01] active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-ring"
              >
                {currentIndex >= session.questions.length - 1 ? "See Results" : "Next"} <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      )}

      {!revealed && (
        <div className="mt-6 flex justify-center gap-1.5">
          {session.questions.map((_, i) => (
            <span
              key={i}
              className={cn(
                "size-2 rounded-full transition-all duration-300",
                i === currentIndex ? "bg-primary scale-125" : i < currentIndex || answers[session.questions[i]?.id] !== undefined ? "bg-primary/40" : "bg-muted",
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
