"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, BrainCircuit, Check, X, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSprintStore } from "@/stores/sprint-store";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { usePageMeta } from "@/hooks/use-page-meta";
import { getTemplatesByCategory } from "@/services/templates";
import { TOPIC_TO_CATEGORY } from "@/lib/topic-template-map";
import RendererRouter from "@/components/renderers/RendererRouter";
import type { SolveAlongTemplate } from "@/lib/types/template";
import type { SprintResult, Question } from "@/lib/types/sprint-session";

export default function AnalysisPage() {
  usePageMeta("Analysis — Exam Arena");
  const router = useRouter();

  const lastResult = useSprintStore((s) => s.lastResult);
  const lastSession = useSprintStore((s) => s.lastSession);
  const targetExam = useOnboardingStore((s) => s.targetExam);
  const domain = targetExam || "vedic-math";

  const result: SprintResult | null = lastResult;
  const session = lastSession;

  const wrongAnswers = useMemo(() => {
    if (!result || !session) return [];
    return result.answers
      .filter((a) => !a.correct)
      .map((a) => ({
        answer: a,
        question: session.questions.find((q) => q.id === a.questionId)!,
      }))
      .filter((item) => item.question)
      .map((item, i) => ({ ...item, wrongIndex: i }));
  }, [result, session]);

  const categories = useMemo(() => {
    if (!session) return ["core"];
    return TOPIC_TO_CATEGORY[domain]?.[session.topic] ?? ["core"];
  }, [domain, session]);

  const [templates, setTemplates] = useState<SolveAlongTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoadingTemplates(true);
      try {
        const results = await Promise.all(
          categories.map((cat) => getTemplatesByCategory(cat, domain)),
        );
        setTemplates(results.flat());
      } finally {
        setLoadingTemplates(false);
      }
    };
    load();
  }, [domain, categories]);

  const getTemplate = useCallback(
    (questionId: string): SolveAlongTemplate | undefined => {
      if (templates.length === 0) return undefined;
      let hash = 0;
      for (let i = 0; i < questionId.length; i++) {
        hash = ((hash << 5) - hash) + questionId.charCodeAt(i);
        hash |= 0;
      }
      return templates[Math.abs(hash) % templates.length];
    },
    [templates],
  );

  const [walkthroughs, setWalkthroughs] = useState<
    Record<string, { open: boolean; visibleSteps: number }>
  >({});

  const toggleWalkthrough = (questionId: string) => {
    setWalkthroughs((prev) => ({
      ...prev,
      [questionId]: {
        open: !prev[questionId]?.open,
        visibleSteps: prev[questionId]?.visibleSteps ?? 1,
      },
    }));
  };

  const revealNextStep = (questionId: string, totalSteps: number) => {
    setWalkthroughs((prev) => {
      const current = prev[questionId];
      const steps = current?.visibleSteps ?? 1;
      if (steps >= totalSteps) return prev;
      return {
        ...prev,
        [questionId]: {
          open: current?.open ?? true,
          visibleSteps: steps + 1,
        },
      };
    });
  };

  if (!result || !session) {
    return (
      <div className="mx-auto max-w-lg px-4 sm:px-6 pt-20 text-center">
        <p className="text-fluid-base text-muted-foreground">No sprint data found.</p>
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

  if (wrongAnswers.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 sm:px-6 pt-20 text-center">
        <div className="mx-auto mb-4 grid size-16 place-items-center rounded-full bg-primary/10">
          <Check size={28} className="text-primary" />
        </div>
        <h1 className="text-fluid-2xl font-black text-foreground">Perfect Score!</h1>
        <p className="mt-1 text-fluid-sm text-muted-foreground/60">
          No wrong answers to analyze.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <button
            type="button"
            onClick={() => router.push("/dashboard/sprint/results")}
            className="rounded-2xl bg-primary py-4 text-fluid-base font-bold uppercase tracking-widest text-primary-foreground outline-none transition-transform hover:scale-[1.01] active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-ring"
          >
            Back to Results
          </button>
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="rounded-2xl border border-border/60 bg-card py-4 text-fluid-sm font-bold uppercase tracking-widest text-foreground outline-none transition-colors hover:bg-accent/40 active:bg-accent/60 focus-visible:ring-2 focus-visible:ring-ring"
          >
            Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 pt-6 pb-10">
      {/* Back button + header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          type="button"
          onClick={() => router.push("/dashboard/sprint/results")}
          className="grid size-10 place-items-center rounded-xl border border-border/60 bg-card text-foreground outline-none transition-colors hover:bg-accent/40 active:bg-accent/60 focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Back to results"
        >
          <ChevronLeft size={18} />
        </button>
        <div>
          <p className="text-fluid-xs font-bold uppercase tracking-[0.15em] text-primary">EXAM ARENA</p>
          <h1 className="text-fluid-xl font-black tracking-tight text-foreground">Analysis</h1>
          <p className="text-fluid-xs text-muted-foreground/60">
            {session.topicLabel} &middot; {wrongAnswers.length} wrong answer
            {wrongAnswers.length > 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Wrong answers list */}
      <div className="flex flex-col gap-5">
        {wrongAnswers.map(({ answer, question, wrongIndex }) => {
          const template = getTemplate(question.id);
          const walk = walkthroughs[question.id] ?? { open: false, visibleSteps: 1 };
          const totalSteps = template?.examples?.[0]?.solution?.length ?? 0;

          return (
            <div
              key={question.id}
              className="rounded-xl border border-border/40 bg-card overflow-hidden"
            >
              {/* Question header */}
              <div className="bg-destructive/5 px-4 py-3 border-b border-border/20">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-fluid-xs font-bold uppercase tracking-wider">
                    <span className="grid size-5 place-items-center rounded bg-destructive/10 text-destructive">
                      <X size={10} />
                    </span>
                    Question {wrongIndex + 1} &middot; Incorrect
                  </span>
                  <span className="text-fluid-xs font-mono text-muted-foreground/40">
                    {Math.round(answer.timeSpent)}s
                  </span>
                </div>
                <p className="mt-1.5 text-fluid-sm font-semibold text-foreground/80 leading-relaxed">
                  {question.text}
                </p>
              </div>

              {/* User vs correct answer */}
              <div className="grid grid-cols-2 gap-2 px-4 pt-4">
                <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-center">
                  <p className="text-fluid-xs font-bold uppercase tracking-wider text-muted-foreground/50">
                    Your Answer
                  </p>
                  <p className="mt-1 text-fluid-base font-black text-destructive">
                    {question.options[answer.selectedIndex] ?? "(unanswered)"}
                  </p>
                </div>
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-center">
                  <p className="text-fluid-xs font-bold uppercase tracking-wider text-muted-foreground/50">
                    Correct
                  </p>
                  <p className="mt-1 text-fluid-base font-black text-primary">
                    {question.options[question.correctIndex]}
                  </p>
                </div>
              </div>

              {/* Walk Through button */}
              <div className="px-4 py-3">
                <button
                  type="button"
                  onClick={() => toggleWalkthrough(question.id)}
                  className={cn(
                    "flex w-full items-center justify-center gap-2 rounded-xl border py-3 text-fluid-xs font-bold uppercase tracking-wider outline-none transition-all focus-visible:ring-2 focus-visible:ring-ring",
                    walk.open
                      ? "border-chart-3/40 bg-chart-3/10 text-chart-3"
                      : "border-dashed border-border/60 text-muted-foreground hover:border-chart-3/40 hover:text-chart-3",
                  )}
                >
                  <BrainCircuit size={14} />
                  {walk.open ? "Close Walkthrough" : "Walk Through"}
                </button>
              </div>

              {/* Template walkthrough */}
              {walk.open && (
                <div className="border-t border-border/20 px-4 py-4 space-y-4">
                  {loadingTemplates ? (
                    <div className="animate-pulse space-y-3">
                      <div className="h-8 rounded-lg bg-card" />
                      <div className="h-32 rounded-lg bg-card" />
                    </div>
                  ) : template ? (
                    <RendererRouter
                      template={template}
                      visibleSteps={walk.visibleSteps}
                      mode="solve_along"
                      onStepReveal={() => revealNextStep(question.id, totalSteps)}
                      showAnswerInput={false}
                      showVisualScaffold={false}
                    />
                  ) : (
                    <div className="rounded-lg bg-muted/30 p-4 text-center">
                      <BookOpen size={20} className="mx-auto mb-2 text-muted-foreground/30" />
                      <p className="text-fluid-xs font-semibold text-muted-foreground/60">
                        No template available for this topic yet.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom navigation */}
      <div className="mt-8 flex flex-col gap-3">
        <button
          type="button"
          onClick={() => router.push("/dashboard/sprint/results")}
          className="flex items-center justify-center gap-2 rounded-2xl border border-border/60 bg-card py-4 text-fluid-sm font-bold uppercase tracking-widest text-foreground outline-none transition-colors hover:bg-accent/40 active:bg-accent/60 focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ChevronLeft size={16} /> Back to Results
        </button>
        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="flex items-center justify-center gap-2 rounded-2xl border border-border/60 bg-card py-4 text-fluid-sm font-bold uppercase tracking-widest text-foreground outline-none transition-colors hover:bg-accent/40 active:bg-accent/60 focus-visible:ring-2 focus-visible:ring-ring"
        >
          Dashboard
        </button>
      </div>
    </div>
  );
}
