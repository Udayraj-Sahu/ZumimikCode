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

const GLASS_BG = "rgba(255,255,255,0.04)";
const GLASS_BORDER = "rgba(255,255,255,0.08)";

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
      <div className="min-h-screen mx-auto max-w-lg px-5 pt-6 pb-6 text-center">
        <p className="text-[13px] text-muted-foreground">No sprint data found.</p>
        <button
          type="button"
          onClick={() => router.push("/dashboard/configure-sprint")}
          className="mt-4 rounded-xl bg-gradient-to-r from-[#C7F252] to-[#A8D43A] text-[#0A0C0A] px-6 py-3 text-[12px] font-bold outline-none transition-transform hover:scale-[1.02] active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-ring"
        >
          Start a Sprint
        </button>
      </div>
    );
  }

  if (wrongAnswers.length === 0) {
    return (
      <div className="min-h-screen mx-auto max-w-lg px-5 pt-6 pb-6 text-center">
        <div className="mx-auto mb-4 grid size-16 place-items-center rounded-full bg-primary/10 border border-primary/20">
          <Check size={28} className="text-primary" />
        </div>
        <h1 className="text-[20px] font-bold tracking-[-0.02em] text-foreground">Perfect Score!</h1>
        <p className="mt-1 text-[12px] text-muted-foreground/45 font-normal">
          No wrong answers to analyze.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <button
            type="button"
            onClick={() => router.push("/dashboard/sprint/results")}
            className="rounded-3xl bg-gradient-to-r from-[#C7F252] to-[#A8D43A] text-[#0A0C0A] py-4 text-[13px] font-bold uppercase tracking-widest outline-none transition-transform hover:scale-[1.01] active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-ring"
          >
            Back to Results
          </button>
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="rounded-3xl border backdrop-blur-xl py-4 text-[12px] font-bold uppercase tracking-widest text-foreground outline-none transition-colors hover:bg-white/[0.06] active:bg-white/[0.06] focus-visible:ring-2 focus-visible:ring-ring"
            style={{ backgroundColor: GLASS_BG, borderColor: GLASS_BORDER }}
          >
            Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen mx-auto max-w-3xl px-5 pt-6 pb-6">
      {/* Back button + header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          type="button"
          onClick={() => router.push("/dashboard/sprint/results")}
          className="grid size-10 place-items-center rounded-xl border backdrop-blur-xl text-foreground outline-none transition-colors hover:bg-white/[0.06] active:bg-white/[0.06] focus-visible:ring-2 focus-visible:ring-ring"
          style={{ backgroundColor: GLASS_BG, borderColor: GLASS_BORDER }}
          aria-label="Back to results"
        >
          <ChevronLeft size={18} />
        </button>
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.04] backdrop-blur-sm px-4 py-1.5 mb-1">
            <span className="text-[10px] font-semibold tracking-[0.22em] text-primary/80">EXAM ARENA</span>
          </div>
          <h1 className="text-[16px] font-bold tracking-[-0.02em] text-foreground leading-tight">Analysis</h1>
          <p className="text-[10px] text-muted-foreground/45 font-normal">
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
              className="rounded-3xl border backdrop-blur-xl overflow-hidden"
              style={{ backgroundColor: GLASS_BG, borderColor: GLASS_BORDER }}
            >
              {/* Question header */}
              <div className="px-4 py-3 border-b" style={{ backgroundColor: "rgba(239,68,68,0.04)", borderColor: "rgba(255,255,255,0.04)" }}>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider">
                    <span className="grid size-5 place-items-center rounded bg-destructive/10 text-destructive">
                      <X size={10} />
                    </span>
                    Question {wrongIndex + 1} &middot; Incorrect
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground/40">
                    {Math.round(answer.timeSpent)}s
                  </span>
                </div>
                <p className="mt-1.5 text-[12px] font-semibold text-foreground/80 leading-relaxed">
                  {question.text}
                </p>
              </div>

              {/* User vs correct answer */}
              <div className="grid grid-cols-2 gap-2 px-4 pt-4">
                <div className="rounded-xl border p-3 text-center" style={{ backgroundColor: "rgba(239,68,68,0.06)", borderColor: "rgba(239,68,68,0.3)" }}>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50">
                    Your Answer
                  </p>
                  <p className="mt-1 text-[13px] font-black text-destructive">
                    {question.options[answer.selectedIndex] ?? "(unanswered)"}
                  </p>
                </div>
                <div className="rounded-xl border p-3 text-center" style={{ backgroundColor: "rgba(199,242,82,0.06)", borderColor: "rgba(199,242,82,0.3)" }}>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50">
                    Correct
                  </p>
                  <p className="mt-1 text-[13px] font-black text-primary">
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
                    "flex w-full items-center justify-center gap-2 rounded-xl border py-3 text-[10px] font-bold uppercase tracking-wider outline-none transition-all backdrop-blur-xl focus-visible:ring-2 focus-visible:ring-ring",
                    walk.open
                      ? "border-chart-3/40 bg-chart-3/10 text-chart-3"
                      : "border-dashed border-white/[0.06] text-muted-foreground hover:border-chart-3/40 hover:text-chart-3",
                  )}
                  style={!walk.open ? { backgroundColor: GLASS_BG } : undefined}
                >
                  <BrainCircuit size={14} />
                  {walk.open ? "Close Walkthrough" : "Walk Through"}
                </button>
              </div>

              {/* Template walkthrough */}
              {walk.open && (
                <div className="border-t px-4 py-4 space-y-4" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
                  {loadingTemplates ? (
                    <div className="animate-pulse space-y-3">
                      <div className="h-8 rounded-xl backdrop-blur-xl" style={{ backgroundColor: GLASS_BG }} />
                      <div className="h-32 rounded-xl backdrop-blur-xl" style={{ backgroundColor: GLASS_BG }} />
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
                    <div className="rounded-xl backdrop-blur-xl p-4 text-center" style={{ backgroundColor: GLASS_BG }}>
                      <BookOpen size={20} className="mx-auto mb-2 text-muted-foreground/30" />
                      <p className="text-[10px] font-semibold text-muted-foreground/60">
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
          className="flex items-center justify-center gap-2 rounded-3xl border backdrop-blur-xl py-4 text-[12px] font-bold uppercase tracking-widest text-foreground outline-none transition-colors hover:bg-white/[0.06] active:bg-white/[0.06] focus-visible:ring-2 focus-visible:ring-ring"
          style={{ backgroundColor: GLASS_BG, borderColor: GLASS_BORDER }}
        >
          <ChevronLeft size={16} /> Back to Results
        </button>
        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="flex items-center justify-center gap-2 rounded-3xl border backdrop-blur-xl py-4 text-[12px] font-bold uppercase tracking-widest text-foreground outline-none transition-colors hover:bg-white/[0.06] active:bg-white/[0.06] focus-visible:ring-2 focus-visible:ring-ring"
          style={{ backgroundColor: GLASS_BG, borderColor: GLASS_BORDER }}
        >
          Dashboard
        </button>
      </div>
    </div>
  );
}
