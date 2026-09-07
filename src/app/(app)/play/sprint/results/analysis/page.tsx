"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Check, X, TrendingUp, Lightbulb, BookOpen } from "lucide-react";
import { useSprintStore } from "@/stores/sprint-store";
import { usePageMeta } from "@/hooks/use-page-meta";
import type { SprintResult } from "@/lib/types/sprint-session";

const GLASS_BG = "rgba(255,255,255,0.04)";
const GLASS_BORDER = "rgba(255,255,255,0.08)";

export default function AnalysisPage() {
  usePageMeta("Analysis — Exam Arena");
  const router = useRouter();

  const lastResult = useSprintStore((s) => s.lastResult);
  const lastSession = useSprintStore((s) => s.lastSession);

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

  if (!result || !session) {
    return (
      <div className="min-h-screen max-w-5xl mx-auto px-5 pt-6 pb-4 text-center">
        <p className="text-[13px] text-muted-foreground">No sprint data found.</p>
        <button
          type="button"
          onClick={() => router.push("/play/configure-sprint")}
          className="mt-4 rounded-xl bg-cta text-[#0A0C0A] px-6 py-3 text-[12px] font-bold outline-none transition-transform hover:scale-[1.02] active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-ring"
        >
          Start a Sprint
        </button>
      </div>
    );
  }

  if (wrongAnswers.length === 0) {
    return (
      <div className="min-h-screen max-w-5xl mx-auto px-5 pt-6 pb-4 text-center">
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
            onClick={() => router.push("/play/sprint/results")}
            className="rounded-3xl bg-cta text-[#0A0C0A] py-4 text-[13px] font-bold uppercase tracking-widest outline-none transition-transform hover:scale-[1.01] active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-ring"
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
    <div className="min-h-screen max-w-5xl mx-auto px-5 pt-6 pb-4">
      {/* Back button + header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          type="button"
          onClick={() => router.push("/play/sprint/results")}
          className="grid size-10 place-items-center rounded-xl border backdrop-blur-xl text-foreground outline-none transition-colors hover:bg-white/[0.06] active:bg-white/[0.06] focus-visible:ring-2 focus-visible:ring-ring"
          style={{ backgroundColor: GLASS_BG, borderColor: GLASS_BORDER }}
          aria-label="Back to results"
        >
          <ChevronLeft size={18} />
        </button>
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.04] backdrop-blur-sm px-4 py-1.5 mb-1">
            <TrendingUp size={12} className="text-primary" />
            <span className="text-micro font-semibold tracking-[0.22em] text-primary/80">ANALYSIS</span>
          </div>
          <h1 className="text-[16px] font-bold tracking-[-0.02em] text-foreground leading-tight">Analysis</h1>
          <p className="text-micro text-muted-foreground/45 font-normal">
            {session.topicLabel} &middot; {wrongAnswers.length} wrong answer
            {wrongAnswers.length > 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Wrong answers list */}
      <div className="flex flex-col gap-5">
        {wrongAnswers.map(({ answer, question, wrongIndex }) => (
          <div
            key={question.id}
            className="rounded-3xl border backdrop-blur-xl overflow-hidden"
            style={{ backgroundColor: GLASS_BG, borderColor: GLASS_BORDER }}
          >
            {/* Question header */}
            <div className="px-4 py-3 border-b" style={{ backgroundColor: "rgba(239,68,68,0.04)", borderColor: "rgba(255,255,255,0.04)" }}>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-micro font-bold uppercase tracking-wider">
                  <span className="grid size-5 place-items-center rounded bg-destructive/10 text-destructive">
                    <X size={10} />
                  </span>
                  Question {wrongIndex + 1} &middot; Incorrect
                </span>
                <span className="text-micro font-mono text-muted-foreground/40">
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
                <p className="text-micro font-bold uppercase tracking-wider text-muted-foreground/50">
                  Your Answer
                </p>
                <p className="mt-1 text-[13px] font-black text-destructive">
                  {question.options[answer.selectedIndex] ?? "(unanswered)"}
                </p>
              </div>
              <div className="rounded-xl border p-3 text-center" style={{ backgroundColor: "rgba(199,242,82,0.06)", borderColor: "rgba(199,242,82,0.3)" }}>
                <p className="text-micro font-bold uppercase tracking-wider text-muted-foreground/50">
                  Correct
                </p>
                <p className="mt-1 text-[13px] font-black text-primary">
                  {question.options[question.correctIndex]}
                </p>
              </div>
            </div>

            {/* Explanation */}
            <div className="px-4 py-4">
              {question.explanation ? (
                <div className="rounded-2xl border backdrop-blur-xl p-4" style={{ borderColor: "rgba(199,242,82,0.2)", background: "rgba(199,242,82,0.04)" }}>
                  <p className="flex items-center gap-1.5 text-micro font-bold uppercase tracking-[0.18em] text-primary/80 mb-2">
                    <Lightbulb size={12} /> Why the answer is correct
                  </p>
                  <p className="text-[13px] leading-relaxed text-foreground/80">{question.explanation}</p>
                </div>
              ) : (
                <div className="flex items-center gap-3 rounded-2xl border border-dashed border-white/[0.06] backdrop-blur-xl p-4" style={{ background: GLASS_BG }}>
                  <BookOpen size={16} className="text-muted-foreground/30 shrink-0" />
                  <p className="text-micro font-medium text-muted-foreground/60">
                    No explanation available for this question yet.
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom navigation */}
      <div className="mt-8 flex flex-col gap-3">
        <button
          type="button"
          onClick={() => router.push("/play/sprint/results")}
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