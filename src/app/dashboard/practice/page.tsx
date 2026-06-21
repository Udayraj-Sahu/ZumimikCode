"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import {
  Check,
  X,
  ChevronRight,
  ChevronLeft,
  BookOpen,
  BrainCircuit,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePracticeSession } from "@/hooks/queries/use-practice";
import { useStepProgress } from "@/hooks/use-step-progress";
import { useTemplateStore } from "@/stores/template-store";
import { useFeedback } from "@/lib/use-feedback";
import { usePageMeta } from "@/hooks/use-page-meta";
import { SPRINT_TOPICS } from "@/lib/mock/sprint";
import { getAllTemplates } from "@/services/templates";
import RendererRouter from "@/components/renderers/RendererRouter";
import type { Question } from "@/lib/types/sprint-session";
import type { SolveAlongTemplate, RenderMode } from "@/lib/types/template";

type PracticeType = "mcq" | "vedic";
type Phase = "config" | "active" | "done";

const VEDIC_CATEGORIES = [
  { id: "all", label: "All Techniques", color: "bg-primary/10 text-primary" },
  { id: "multiplication", label: "Multiplication", color: "bg-chart-3/10 text-chart-3" },
  { id: "division", label: "Division", color: "bg-chart-4/10 text-chart-4" },
  { id: "squares", label: "Squares", color: "bg-chart-2/10 text-chart-2" },
];

export default function PracticePage() {
  usePageMeta("Practice — Exam Arena");
  const router = useRouter();
  const feedback = useFeedback();

  const [practiceType, setPracticeType] = useState<PracticeType>("mcq");
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("Beginner");
  const [phase, setPhase] = useState<Phase>("config");

  const [renderMode, setRenderMode] = useState<RenderMode>("solve_along");
  const [vedicCategory, setVedicCategory] = useState("all");
  const [vedicTemplates, setVedicTemplates] = useState<SolveAlongTemplate[]>([]);
  const [rendererPhase, setRendererPhase] = useState<"idle" | "active" | "done">("idle");
  const [rendererCorrect, setRendererCorrect] = useState(0);
  const [rendererTotal, setRendererTotal] = useState(0);

  const { data: session, isLoading } = usePracticeSession(topic, 10, difficulty);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [revealed, setRevealed] = useState(false);
  const [completed, setCompleted] = useState<{ correct: number; total: number } | null>(null);

  const [loadingTemplates, setLoadingTemplates] = useState(false);

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

  const stepProgress = useStepProgress();
  const loadTemplates = useTemplateStore((s) => s.loadTemplates);
  const currentTemplate = useTemplateStore((s) => s.templates[s.currentIndex] ?? null);
  const storeCurrentIndex = useTemplateStore((s) => s.currentIndex);
  const storeTemplates = useTemplateStore((s) => s.templates);
  const setMode = useTemplateStore((s) => s.setMode);

  const startVedicPractice = async () => {
    setLoadingTemplates(true);
    try {
      const all = await getAllTemplates();
      const filtered = vedicCategory === "all"
        ? all
        : all.filter((t) => t.concept.category === vedicCategory);
      if (filtered.length === 0) {
        feedback.wrong();
        setLoadingTemplates(false);
        return;
      }
      setVedicTemplates(filtered);
      loadTemplates(filtered);
      setMode(renderMode);
      setRendererPhase("active");
      setRendererCorrect(0);
      setRendererTotal(filtered.length);
      setPhase("active");
    } finally {
      setLoadingTemplates(false);
    }
  };

  const handleVedicNext = () => {
    if (storeCurrentIndex >= storeTemplates.length - 1) {
      feedback.complete();
      setRendererPhase("done");
      const total = storeTemplates.length;
      setCompleted({ correct: rendererCorrect, total });
    } else {
      useTemplateStore.getState().nextTemplate();
      stepProgress.reset();
    }
  };

  const handleVedicCorrect = () => {
    setRendererCorrect((c) => c + 1);
    feedback.correct();
    stepProgress.handleCorrect();
  };

  const handleVedicWrong = () => {
    stepProgress.handleWrong();
  };

  const question: Question | null = session?.questions[currentIndex] ?? null;

  if (phase === "config") {
    return (
      <div className="px-4 sm:px-6 pt-6 pb-10">
        <div ref={headerRef}>
          <p className="text-fluid-xs font-semibold tracking-[0.15em] text-muted-foreground/60">EXAM ARENA</p>
          <h1 className="text-fluid-2xl font-black tracking-tight text-foreground">Practice</h1>
          <p className="text-fluid-sm text-muted-foreground/60">Choose your practice mode</p>
        </div>

        {/* Practice Type Toggle */}
        <div ref={animateSection} data-section-index="0" className="mt-6">
          <div className="flex gap-2 rounded-2xl border border-border/60 bg-card p-1">
            <button
              type="button"
              onClick={() => setPracticeType("mcq")}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-fluid-xs font-bold uppercase tracking-wider outline-none transition-all focus-visible:ring-2 focus-visible:ring-ring",
                practiceType === "mcq"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <BookOpen size={16} /> MCQ
            </button>
            <button
              type="button"
              onClick={() => setPracticeType("vedic")}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-fluid-xs font-bold uppercase tracking-wider outline-none transition-all focus-visible:ring-2 focus-visible:ring-ring",
                practiceType === "vedic"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <BrainCircuit size={16} /> Vedic Math
            </button>
          </div>
        </div>

        {practiceType === "mcq" && (
          <>
            <div ref={animateSection} data-section-index="1" className="mt-6">
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
                      aria-label={`Select ${t.label}`}
                    >
                      <Icon size={24} className={topic === t.id ? "text-primary" : "text-muted-foreground/40"} />
                      <span className="text-fluid-xs font-bold text-center leading-tight">{t.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div ref={animateSection} data-section-index="2" className="mt-6">
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
                    aria-label={`Difficulty ${d}`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div ref={animateSection} data-section-index="3" className="mt-8">
              <button
                type="button"
                disabled={!topic}
                onClick={startPractice}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-fluid-base font-bold uppercase tracking-widest text-primary-foreground outline-none transition-transform hover:scale-[1.01] active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <BookOpen size={16} /> Start Practice
              </button>
            </div>
          </>
        )}

        {practiceType === "vedic" && (
          <>
            <div ref={animateSection} data-section-index="1" className="mt-6">
              <p className="text-fluid-xs font-bold uppercase tracking-widest text-muted-foreground/50 mb-3">Technique Category</p>
              <div className="grid grid-cols-2 gap-2.5">
                {VEDIC_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setVedicCategory(cat.id)}
                    className={cn(
                      "flex items-center gap-3 rounded-2xl border p-4 outline-none transition-all focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.98]",
                      vedicCategory === cat.id
                        ? "border-primary bg-accent shadow-[0_0_0_1px_var(--primary)]"
                        : "border-border/60 bg-card text-muted-foreground hover:border-border hover:bg-accent/40",
                    )}
                    aria-label={`Category ${cat.label}`}
                  >
                    <span className={cn("rounded-lg px-2.5 py-1 text-fluid-xs font-bold", cat.color)}>
                      {cat.label === "All Techniques" ? "ALL" : cat.label.slice(0, 4).toUpperCase()}
                    </span>
                    <span className="text-fluid-sm font-semibold">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div ref={animateSection} data-section-index="2" className="mt-6">
              <p className="text-fluid-xs font-bold uppercase tracking-widest text-muted-foreground/50 mb-3">Mode</p>
              <div className="flex gap-2">
                {([
                  { value: "solve_along" as const, label: "Solve Along" },
                  { value: "quick" as const, label: "Quick" },
                  { value: "guided" as const, label: "Guided" },
                ]).map((m) => (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => setRenderMode(m.value)}
                    className={cn(
                      "flex-1 rounded-xl border py-3 text-fluid-xs font-bold uppercase tracking-wider outline-none transition-all focus-visible:ring-2 focus-visible:ring-ring",
                      renderMode === m.value
                        ? "border-primary bg-accent shadow-[0_0_0_1px_var(--primary)] text-foreground"
                        : "border-border/60 bg-card text-muted-foreground hover:border-border hover:bg-accent/40",
                    )}
                    aria-label={`Mode ${m.label}`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-fluid-xs text-muted-foreground/50">
                {renderMode === "solve_along" && "Step-by-step reveal — learn the technique"}
                {renderMode === "quick" && "All steps visible — speed practice"}
                {renderMode === "guided" && "Auto-advancing steps with hints"}
              </p>
            </div>

            <div ref={animateSection} data-section-index="3" className="mt-8">
              <button
                type="button"
                disabled={loadingTemplates}
                onClick={startVedicPractice}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-fluid-base font-bold uppercase tracking-widest text-primary-foreground outline-none transition-transform hover:scale-[1.01] active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <BrainCircuit size={16} />
                {loadingTemplates ? "Loading..." : `Start Vedic ${renderMode === "quick" ? "Quick" : renderMode === "guided" ? "Guided" : "Solve-Along"}`}
              </button>
            </div>
          </>
        )}
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
            onClick={() => { setPhase("config"); useTemplateStore.getState().reset(); }}
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

  if (practiceType === "vedic" && rendererPhase === "active" && currentTemplate) {
    return (
      <div className="mx-auto max-w-lg px-4 sm:px-6 pt-6 pb-10">
        {/* Header */}
        <div ref={headerRef} className="flex items-center justify-between mb-3">
          <span className="text-fluid-xs font-bold uppercase tracking-widest text-muted-foreground/50">
            Vedic Math &middot; {currentTemplate.concept?.technique_name}
          </span>
          <span className="text-fluid-xs font-mono text-muted-foreground/40">
            {storeCurrentIndex + 1}/{storeTemplates.length}
          </span>
        </div>

        <div className="h-1.5 w-full rounded-full bg-muted mb-6">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
            style={{
              width: `${((storeCurrentIndex + (stepProgress.isCorrect !== null ? 1 : 0)) / storeTemplates.length) * 100}%`,
            }}
          />
        </div>

        <RendererRouter
          template={currentTemplate}
          visibleSteps={stepProgress.visibleSteps}
          mode={renderMode}
        />

        {/* Step reveal button (outside TextScaffold for consistency) */}
        {renderMode === "solve_along" && !stepProgress.allRevealed && (
          <button
            type="button"
            onClick={stepProgress.handleRevealNext}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border/60 py-3 text-fluid-xs font-bold uppercase tracking-wider text-muted-foreground outline-none transition-colors hover:border-primary/40 hover:text-primary focus-visible:ring-2 focus-visible:ring-ring"
          >
            Show Next Step ({stepProgress.visibleSteps}/{stepProgress.totalSteps})
          </button>
        )}

        {/* Navigation buttons */}
        {stepProgress.isCorrect !== null && (
          <div className="mt-6 flex gap-3">
            {storeCurrentIndex > 0 && (
              <button
                type="button"
                onClick={() => {
                  useTemplateStore.getState().prevTemplate();
                  stepProgress.reset();
                }}
                className="flex items-center justify-center gap-2 rounded-2xl border border-border/60 bg-card px-5 py-4 text-fluid-xs font-bold uppercase tracking-wider text-foreground outline-none transition-colors hover:bg-accent/40 focus-visible:ring-2 focus-visible:ring-ring"
              >
                <ChevronLeft size={16} /> Previous
              </button>
            )}
            <button
              type="button"
              onClick={handleVedicNext}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-fluid-base font-bold uppercase tracking-widest text-primary-foreground outline-none transition-transform hover:scale-[1.01] active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-ring"
            >
              {storeCurrentIndex >= storeTemplates.length - 1 ? "See Results" : "Next"}{" "}
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    );
  }

  if (practiceType === "vedic" && (loadingTemplates || rendererPhase === "idle")) {
    return (
      <div className="mx-auto max-w-lg px-4 sm:px-6 pt-6 animate-pulse">
        <div className="h-14 rounded-lg bg-card mb-4" />
        <div className="h-48 rounded-2xl bg-card mb-4" />
        <div className="h-12 rounded-lg bg-card" />
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
      <div ref={headerRef} className="flex items-center justify-between mb-3">
        <span className="text-fluid-xs font-bold uppercase tracking-widest text-muted-foreground/50">
          Practice &middot; {session.topicLabel}
        </span>
        <span className="text-fluid-xs font-mono text-muted-foreground/40">
          {currentIndex + 1}/{session.questions.length}
        </span>
      </div>

      <div className="h-1.5 w-full rounded-full bg-muted mb-6">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
          style={{ width: `${((currentIndex + (revealed ? 1 : 0)) / session.questions.length) * 100}%` }}
        />
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
