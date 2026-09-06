"use client";

import { useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSprintStore } from "@/stores/sprint-store";
import { useRateStore } from "@/stores/rate-store";
import { usePageMeta } from "@/hooks/use-page-meta";
import type { SprintResult, Question } from "@/lib/types/sprint-session";

const GLASS_BG = "rgba(255,255,255,0.04)";
const GLASS_BORDER = "rgba(255,255,255,0.08)";

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
  const incrementSprint = useRateStore((s) => s.increment);

  useEffect(() => {
    incrementSprint();
  }, [incrementSprint]);
  const resultRef = useRef<HTMLDivElement>(null);

  const result: SprintResult | null = lastResult;
  const session: { questions: Question[]; topic: string; topicLabel: string; difficulty: string } | null = lastSession;

  useEffect(() => {
    if (resultRef.current && result) {
      gsap.fromTo(resultRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" });
    }
  }, [result]);

  const handleAnalysis = useCallback(() => {
    router.push("/play/sprint/results/analysis");
  }, [router]);

  if (!result || !session) {
    return (
      <div className="min-h-screen max-w-5xl mx-auto px-5 pt-6 pb-4 text-center">
        <p className="text-[13px] text-muted-foreground">No sprint results found.</p>
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

  return (
    <div className="min-h-screen max-w-5xl mx-auto px-5 pt-6 pb-4">
      {/* Header */}
      <div ref={resultRef}>
        <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.04] backdrop-blur-sm px-4 py-1.5 mb-3 mx-auto">
          <BarChart3 size={10} className="text-primary" />
          <span className="text-micro font-semibold tracking-[0.22em] text-primary/80">SPRINT RESULTS</span>
        </div>
        <h1 className="text-center text-[20px] font-bold tracking-[-0.02em] text-foreground leading-tight">
          Sprint Results
        </h1>
        <p className="mt-1 text-center text-[12px] text-muted-foreground/45 font-normal">
          {session.topicLabel} &middot; {session.difficulty}
        </p>
      </div>

      {/* Score row — 4 stat cards */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-3xl border backdrop-blur-xl p-4 text-center" style={{ backgroundColor: GLASS_BG, borderColor: GLASS_BORDER }}>
          <p className="text-micro font-bold uppercase tracking-wider text-primary">Accuracy</p>
          <p className={cn(
            "mt-1 text-[20px] font-black",
            result.accuracy >= 80 ? "text-primary" : result.accuracy >= 50 ? "text-chart-3" : "text-destructive",
          )}>
            {result.accuracy}%
          </p>
          <p className="text-micro text-muted-foreground/40 mt-0.5">
            {result.accuracy >= 80 ? "Excellent" : result.accuracy >= 50 ? "Good" : "Needs work"}
          </p>
        </div>
        <div className="rounded-3xl border backdrop-blur-xl p-4 text-center" style={{ backgroundColor: GLASS_BG, borderColor: GLASS_BORDER }}>
          <p className="text-micro font-bold uppercase tracking-wider text-chart-2">XP Earned</p>
          <p className="mt-1 text-[20px] font-black text-chart-2">+{result.xpEarned}</p>
          <p className="text-micro text-muted-foreground/40 mt-0.5">points</p>
        </div>
        <div className="rounded-3xl border backdrop-blur-xl p-4 text-center" style={{ backgroundColor: GLASS_BG, borderColor: GLASS_BORDER }}>
          <p className="text-micro font-bold uppercase tracking-wider text-foreground/60">Time</p>
          <p className="mt-1 text-[20px] font-black text-foreground/80">
            {formatTime(Math.round(result.totalTimeSpent))}
          </p>
          <p className="text-micro text-muted-foreground/40 mt-0.5">total</p>
        </div>
        <div className="rounded-3xl border backdrop-blur-xl p-4 text-center" style={{ backgroundColor: GLASS_BG, borderColor: GLASS_BORDER }}>
          <p className="text-micro font-bold uppercase tracking-wider text-chart-3">Correct</p>
          <p className="mt-1 text-[20px] font-black text-chart-3">{result.score}/{result.total}</p>
          <p className="text-micro text-muted-foreground/40 mt-0.5">
            {result.score === result.total ? "Perfect!" : `${Math.round(result.score / result.total * 100)}%`}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-5 h-2 w-full rounded-full overflow-hidden" style={{ backgroundColor: GLASS_BG }}>
        <div
          className={cn(
            "h-full rounded-full transition-all duration-700 ease-out",
            result.accuracy >= 80 ? "bg-primary" : result.accuracy >= 50 ? "bg-chart-3" : "bg-destructive",
          )}
          style={{ width: `${result.accuracy}%` }}
        />
      </div>

      {/* Final answer banner */}
      <div className="mt-6 rounded-3xl border border-primary/20 bg-primary/5 p-5 text-center backdrop-blur-xl">
        <p className="text-micro font-bold uppercase tracking-[0.18em] text-primary/60">Final Verdict</p>
        <p className="mt-1 text-[16px] font-black text-primary">
          {result.accuracy >= 80 ? "Great Work!" : result.accuracy >= 50 ? "Keep Going!" : "Keep Practicing!"}
        </p>
        <p className="mt-0.5 text-[12px] text-muted-foreground/60">
          {result.score} of {result.total} correct &middot; {session.topicLabel}
        </p>
      </div>

      {/* CTA buttons */}
      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={handleAnalysis}
          className="flex flex-1 items-center justify-center gap-2 rounded-3xl bg-cta text-[#0A0C0A] py-4 text-[13px] font-bold uppercase tracking-widest outline-none transition-transform hover:scale-[1.01] active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-ring"
        >
          <BarChart3 size={16} /> Analysis
        </button>
        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="flex flex-1 items-center justify-center gap-2 rounded-3xl border backdrop-blur-xl py-4 text-[12px] font-bold uppercase tracking-widest text-foreground outline-none transition-colors hover:bg-white/[0.06] active:bg-white/[0.06] focus-visible:ring-2 focus-visible:ring-ring"
          style={{ backgroundColor: GLASS_BG, borderColor: GLASS_BORDER }}
        >
          Dashboard
        </button>
      </div>
    </div>
  );
}
