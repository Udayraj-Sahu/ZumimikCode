"use client";

import { useState, useEffect, useCallback, useRef, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import gsap from "gsap";
import { Check, X, Clock, Zap, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSprintSession } from "@/hooks/queries/use-sprint-session";
import { useSprintStore } from "@/stores/sprint-store";
import { useResumeStore, type ResumeSnapshot } from "@/stores/resume-store";
import { useFeedback } from "@/lib/use-feedback";
import { usePageMeta } from "@/hooks/use-page-meta";
import { useOnboardingStore } from "@/stores/onboarding-store";
import type { Question } from "@/lib/types/sprint-session";
import TrustBadge from "@/components/ui/trust-badge";
import ContentFeedback from "@/components/ui/content-feedback";

const GLASS_BG = "rgba(255,255,255,0.04)";
const GLASS_BORDER = "rgba(255,255,255,0.08)";

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
  const isAdaptive = searchParams.get("adaptive") === "1";
  const adaptiveDomain = searchParams.get("domain");
  const resumeParam = searchParams.get("resume") === "1";

  const targetExam = useOnboardingStore((s) => s.targetExam);
  const feedback = useFeedback();
  const { data, isLoading, error } = useSprintSession(topic, length, difficulty, targetExam);
  const snapshot = useResumeStore((s) => s.snapshot);
  const saveSnapshot = useResumeStore((s) => s.saveSnapshot);
  const clearSnapshot = useResumeStore((s) => s.clearSnapshot);
  const {
    status, currentIndex, timeLeft, answers,
    initSprint, resumeSprint, answerCurrent, nextQuestion, tick, completeSprint,
  } = useSprintStore();

  const isResume = resumeParam && !!snapshot && snapshot.topic === topic;
  const activeQuestions = useMemo(
    () => (isResume ? (snapshot?.questions ?? []) : (data?.questions ?? [])),
    [isResume, snapshot, data],
  );
  const activeTopicLabel = isResume ? snapshot.topicLabel : data?.topicLabel;
  const activeDifficulty = isResume ? snapshot.difficulty : data?.difficulty;

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const autoAdvanceRef = useRef<ReturnType<typeof setTimeout>>();
  const feedbackRef = useRef<HTMLDivElement>(null);
  const questionsRef = useRef(data?.questions ?? null);
  questionsRef.current = data?.questions ?? null;
  const totalTimeRef = useRef(0);
  const lastWriteRef = useRef(0);
  const dirtyRef = useRef(false);
  const initializedRef = useRef(false);

  const buildSnapshot = useCallback((): ResumeSnapshot | null => {
    if (activeQuestions.length === 0) return null;
    const s = useSprintStore.getState();
    return {
      topic,
      topicLabel: activeTopicLabel ?? topic,
      difficulty: activeDifficulty ?? difficulty,
      totalTime: totalTimeRef.current,
      questions: activeQuestions,
      currentIndex: s.currentIndex,
      answers: s.answers,
      questionStartTime: s.questionStartTime,
      sessionStartTime: s.sessionStartTime ?? Date.now(),
      timeLeft: s.timeLeft,
      isAdaptive,
      domain: adaptiveDomain ?? undefined,
      savedAt: Date.now(),
    };
  }, [activeQuestions, activeTopicLabel, activeDifficulty, topic, difficulty, isAdaptive, adaptiveDomain]);

  const commitSnapshot = useCallback(() => {
    const now = Date.now();
    if (now - lastWriteRef.current < 4000) {
      dirtyRef.current = true;
      return;
    }
    lastWriteRef.current = now;
    dirtyRef.current = false;
    const snap = buildSnapshot();
    if (snap) saveSnapshot(snap);
  }, [buildSnapshot, saveSnapshot]);

  const goToResults = useCallback(() => {
    const params = new URLSearchParams();
    if (isAdaptive) {
      params.set("adaptive", "1");
      if (adaptiveDomain) params.set("domain", adaptiveDomain);
    }
    const qs = params.toString();
    router.push(`/play/sprint/results${qs ? `?${qs}` : ""}`);
  }, [router, isAdaptive, adaptiveDomain]);

  const finishSprint = useCallback(() => {
    if (activeQuestions.length > 0) {
      feedback.complete();
      completeSprint({
        questions: activeQuestions,
        topic: topic,
        topicLabel: activeTopicLabel ?? topic,
        difficulty: activeDifficulty ?? difficulty,
      });
      clearSnapshot();
      goToResults();
    }
  }, [activeQuestions, activeTopicLabel, activeDifficulty, topic, difficulty, completeSprint, goToResults, feedback, clearSnapshot]);

  useEffect(() => {
    if (isResume && snapshot && status === "idle") {
      totalTimeRef.current = snapshot.totalTime;
      resumeSprint({
        currentIndex: snapshot.currentIndex,
        answers: snapshot.answers,
        questionStartTime: snapshot.questionStartTime,
        sessionStartTime: snapshot.sessionStartTime,
        timeLeft: snapshot.timeLeft,
      });
    }
  }, [isResume, snapshot, status, resumeSprint]);

  useEffect(() => {
    if (isResume) return;
    if (data && !initializedRef.current) {
      initializedRef.current = true;
      totalTimeRef.current = data.totalTime;
      initSprint(data.totalTime);
    }
  }, [data, initSprint, isResume]);

  useEffect(() => {
    if (status !== "active" || timeLeft <= 0) return;
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [status, timeLeft, tick]);

  const answerCount = Object.keys(answers).length;

  useEffect(() => {
    if (status === "active" && (answerCount > 0 || dirtyRef.current)) {
      commitSnapshot();
    }
  }, [currentIndex, answerCount, status, commitSnapshot]);

  useEffect(() => {
    if (status !== "active") return;
    const id = setInterval(() => {
      if (dirtyRef.current) commitSnapshot();
    }, 4000);
    return () => clearInterval(id);
  }, [status, commitSnapshot]);

  useEffect(() => {
    if (status !== "active") return;
    const flush = () => {
      const snap = buildSnapshot();
      if (snap) saveSnapshot(snap);
    };
    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", flush);
    return () => {
      window.removeEventListener("pagehide", flush);
      document.removeEventListener("visibilitychange", flush);
    };
  }, [status, buildSnapshot, saveSnapshot]);

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
    const q = activeQuestions[currentIndex];
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
      const isLast = currentIndex >= activeQuestions.length - 1;
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
    const isLast = currentIndex >= activeQuestions.length - 1;
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
      <div className="min-h-screen max-w-5xl mx-auto px-5 pt-6 pb-4 text-center">
        <p className="text-[13px] text-muted-foreground">No sprint configuration found.</p>
        <button
          type="button"
          onClick={() => router.push("/play/configure-sprint")}
          className="mt-4 rounded-xl bg-cta text-[#0A0C0A] px-6 py-3 text-[12px] font-bold outline-none transition-transform hover:scale-[1.02] active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-ring"
        >
          Configure Sprint
        </button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen max-w-5xl mx-auto px-5 pt-6 pb-4 text-center">
        <p className="text-[13px] font-semibold text-destructive">Failed to load sprint questions.</p>
        <p className="mt-2 text-[12px] text-muted-foreground/60">{error instanceof Error ? error.message : "Something went wrong"}</p>
        <div className="mt-6 flex justify-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/play/configure-sprint")}
            className="rounded-xl border backdrop-blur-xl px-5 py-3 text-[12px] font-bold text-foreground outline-none transition-colors hover:bg-white/[0.06] active:bg-white/[0.06] focus-visible:ring-2 focus-visible:ring-ring"
            style={{ backgroundColor: GLASS_BG, borderColor: GLASS_BORDER }}
          >
            Back
          </button>
          <button
            type="button"
            onClick={() => router.refresh()}
            className="rounded-xl bg-cta text-[#0A0C0A] px-5 py-3 text-[12px] font-bold outline-none transition-transform hover:scale-[1.02] active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-ring"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!isResume && (isLoading || !data)) {
    return (
      <div className="min-h-screen max-w-5xl mx-auto px-5 pt-6 pb-4 animate-pulse">
        <div className="h-14 rounded-xl backdrop-blur-xl mb-4" style={{ backgroundColor: GLASS_BG }} />
        <div className="h-48 rounded-3xl backdrop-blur-xl mb-4" style={{ backgroundColor: GLASS_BG }} />
        <div className="h-12 rounded-xl backdrop-blur-xl" style={{ backgroundColor: GLASS_BG }} />
      </div>
    );
  }

  const question: Question | undefined = activeQuestions[currentIndex];
  const progress = activeQuestions.length > 0 ? ((currentIndex + (showFeedback ? 1 : 0)) / activeQuestions.length) * 100 : 0;
  const isLast = currentIndex >= activeQuestions.length - 1;
  const isTimerLow = timeLeft <= 30;

  return (
    <div className="min-h-screen max-w-5xl mx-auto px-5 pt-6 pb-4">
      <div ref={headerRef} className="pb-3 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.04] backdrop-blur-sm px-4 py-1.5 mb-3">
          <Zap size={10} className="text-primary" />
          <span className="text-micro font-semibold tracking-[0.22em] text-primary/80">SPRINT</span>
        </div>
        <div className="flex justify-center">
          <span className="text-micro font-bold uppercase tracking-widest text-muted-foreground/50 pb-0.5">
            {currentIndex + 1} / {activeQuestions.length}
          </span>
        </div>
      </div>

      <div className="h-1.5 w-full rounded-full mb-5" style={{ backgroundColor: GLASS_BG }}>
        <div
          className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex items-center justify-between mb-5">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-micro font-bold uppercase tracking-wider text-primary">
          <Zap size={10} />
          {activeTopicLabel}
        </span>
        <div className="flex items-center gap-2">
          {question?.trustStatus && <TrustBadge status={question.trustStatus} />}
          <span className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-micro font-bold font-mono backdrop-blur-xl",
            isTimerLow ? "bg-destructive/10 text-destructive border border-destructive/20" : "text-muted-foreground border border-white/[0.06]",
          )}
          style={!isTimerLow ? { backgroundColor: GLASS_BG } : undefined}>
            <Clock size={10} />
            {formatTime(timeLeft)}
          </span>
        </div>
      </div>

      {question && (
        <div key={question.id} ref={questionRef}>
          <p className="text-[16px] font-bold leading-snug text-foreground mb-5">
            {question.text}
          </p>

          <div className="flex flex-col gap-2.5">
            {question.options.map((option, i) => {
              const isSelected = selectedIndex === i;
              const isCorrect = i === question.correctIndex;
              let variantStyles: React.CSSProperties = { backgroundColor: GLASS_BG, borderColor: GLASS_BORDER };
              let variantClass = "border backdrop-blur-xl text-foreground hover:bg-white/[0.06] active:bg-white/[0.06]" as string;
              if (showFeedback) {
                if (isSelected && isCorrect) {
                  variantClass = "border text-primary";
                  variantStyles = { backgroundColor: "rgba(199,242,82,0.06)", borderColor: "rgba(199,242,82,0.3)" };
                } else if (isSelected && !isCorrect) {
                  variantClass = "border text-destructive";
                  variantStyles = { backgroundColor: "rgba(239,68,68,0.06)", borderColor: "rgba(239,68,68,0.3)" };
                } else if (isCorrect) {
                  variantClass = "border text-primary";
                  variantStyles = { backgroundColor: "rgba(199,242,82,0.06)", borderColor: "rgba(199,242,82,0.3)" };
                } else {
                  variantClass = "border text-muted-foreground/40";
                  variantStyles = { backgroundColor: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.04)" };
                }
              }

              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelect(i)}
                  disabled={showFeedback}
                  className={cn(
                    "flex items-center gap-3 rounded-3xl border p-4 text-left outline-none transition-all duration-200 focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.98]",
                    variantClass,
                  )}
                  style={variantStyles}
                >
                  <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-muted text-micro font-bold text-muted-foreground">
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="flex-1 text-[13px] font-medium">{option}</span>
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
            <div ref={feedbackRef} className="mt-5 flex flex-col items-center gap-3">
              <button
                type="button"
                onClick={handleNext}
                className="flex w-full items-center justify-center gap-2 rounded-3xl bg-cta text-[#0A0C0A] py-4 text-[13px] font-bold uppercase tracking-widest outline-none transition-transform hover:scale-[1.01] active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-ring"
              >
                {isLast ? "See Results" : "Next"} <ChevronRight size={16} />
              </button>
              <ContentFeedback questionId={question.id} />
            </div>
          )}
        </div>
      )}

      {!showFeedback && (
        <div className="mt-6 flex justify-center gap-1.5">
          {activeQuestions.map((_, i) => (
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
      <div className="min-h-screen max-w-5xl mx-auto px-5 pt-6 pb-4 animate-pulse">
        <div className="h-14 rounded-xl backdrop-blur-xl mb-4" style={{ backgroundColor: "rgba(255,255,255,0.04)" }} />
        <div className="h-48 rounded-3xl backdrop-blur-xl mb-4" style={{ backgroundColor: "rgba(255,255,255,0.04)" }} />
        <div className="h-12 rounded-xl backdrop-blur-xl" style={{ backgroundColor: "rgba(255,255,255,0.04)" }} />
      </div>
    }>
      <SprintContent />
    </Suspense>
  );
}
