"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { Swords, Check, X, ChevronRight, Clock, User, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDuelSetup } from "@/hooks/queries/use-duel";
import { usePracticeSession } from "@/hooks/queries/use-practice";
import { useFeedback } from "@/lib/use-feedback";
import { usePageMeta } from "@/hooks/use-page-meta";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { DUEL_OPPONENTS, generateDuelResult } from "@/lib/mock/duel";
import type { DuelOpponent, DuelResult } from "@/lib/types/duel";
import type { Question } from "@/lib/types/sprint-session";

const GLASS_BG = "rgba(255,255,255,0.04)";
const GLASS_BORDER = "rgba(255,255,255,0.08)";

type Phase = "config" | "active" | "done";

export default function DuelPage() {
  usePageMeta("Duel — Exam Arena");
  const router = useRouter();
  const feedback = useFeedback();
  const targetExam = useOnboardingStore((s) => s.targetExam);
  const { data: setup, isLoading: setupLoading } = useDuelSetup(targetExam);
  const [topic, setTopic] = useState("addition");
  const [opponent, setOpponent] = useState<DuelOpponent>(DUEL_OPPONENTS[0]);
  const [phase, setPhase] = useState<Phase>("config");
  const { data: session, isLoading: sessionLoading } = usePracticeSession(topic, 10, "Intermediate", targetExam);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [revealed, setRevealed] = useState(false);
  const [opponentProgress, setOpponentProgress] = useState(0);
  const [opponentDone, setOpponentDone] = useState(false);
  const [result, setResult] = useState<DuelResult | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);

  const questionRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const oppTimerRef = useRef<ReturnType<typeof setInterval>>();

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
    if (resultRef.current && result) {
      gsap.fromTo(resultRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" });
    }
  }, [result]);

  useEffect(() => {
    return () => {
      if (oppTimerRef.current) clearInterval(oppTimerRef.current);
    };
  }, []);

  const startDuel = () => {
    setPhase("active");
    setCurrentIndex(0);
    setAnswers({});
    setRevealed(false);
    setOpponentProgress(0);
    setOpponentDone(false);
    setResult(null);

    let oppIndex = 0;
    oppTimerRef.current = setInterval(() => {
      oppIndex++;
      setOpponentProgress(oppIndex);
      if (oppIndex >= 10) {
        setOpponentDone(true);
        if (oppTimerRef.current) clearInterval(oppTimerRef.current);
      }
    }, 1200 + Math.random() * 800);
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
      const correct = session.questions.filter((q) => answers[q.id] === q.correctIndex).length;
      const res = generateDuelResult(correct, session.questions.length);
      feedback.duelResult(res.won);
      setResult(res);
      setPhase("done");
    } else {
      setCurrentIndex((i) => i + 1);
      setRevealed(false);
    }
  };

  const question: Question | null = session?.questions[currentIndex] ?? null;
  const progress = session ? ((currentIndex + (revealed ? 1 : 0)) / session.questions.length) * 100 : 0;
  const yourCorrect = Object.values(answers).filter((a) => {
    if (!session) return false;
    return session.questions.find((q) => answers[q.id] !== undefined)?.correctIndex === a;
  }).length;

  if (phase === "config") {
    return (
      <div className="min-h-screen px-5 pt-6 pb-6">
        <div ref={headerRef} className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.04] backdrop-blur-sm px-4 py-1.5 mb-3">
            <Swords size={12} className="text-primary" />
            <span className="text-[10px] font-semibold tracking-[0.22em] text-primary/80">DUEL</span>
          </div>
          <p className="text-[12px] text-muted-foreground/45 font-normal mt-1">Compete head-to-head in real-time</p>
        </div>

        <div ref={animateSection} data-section-index="0" className="mt-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground/40 mb-3">Select Topic</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {(setup?.topics ?? []).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTopic(t.id)}
                className={cn(
                  "rounded-xl border py-3 px-3 text-[10px] font-bold text-center outline-none transition-all focus-visible:ring-2 focus-visible:ring-ring",
                  topic === t.id
                    ? "border-primary bg-primary/10 shadow-[0_0_0_1px_var(--primary)] text-foreground"
                    : "border-white/[0.06] text-muted-foreground hover:bg-white/[0.06] active:bg-white/[0.08]",
                )}
                style={topic !== t.id ? { backgroundColor: GLASS_BG } : undefined}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div ref={animateSection} data-section-index="1" className="mt-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground/40 mb-3">Your Opponent</p>
          <div className="flex flex-wrap gap-2">
            {DUEL_OPPONENTS.map((o) => (
              <button
                key={o.name}
                type="button"
                onClick={() => setOpponent(o)}
                className={cn(
                  "flex items-center gap-3 rounded-xl border px-4 py-3 outline-none transition-all focus-visible:ring-2 focus-visible:ring-ring",
                  opponent.name === o.name
                    ? "border-primary bg-primary/10 shadow-[0_0_0_1px_var(--primary)]"
                    : "border-white/[0.06] hover:bg-white/[0.06]",
                )}
                style={opponent.name !== o.name ? { backgroundColor: GLASS_BG } : undefined}
              >
                <div className="grid size-9 place-items-center rounded-full bg-primary/10 text-[12px] font-bold text-primary">
                  {o.initials}
                </div>
                <div className="text-left">
                  <p className="text-[12px] font-bold text-foreground/80">{o.name}</p>
                  <p className="text-[10px] text-muted-foreground/40">{o.level}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div ref={animateSection} data-section-index="2" className="mt-8">
          <button
            type="button"
            onClick={startDuel}
            className="flex w-full items-center justify-center gap-2 rounded-3xl bg-gradient-to-r from-[#C7F252] to-[#A8D43A] py-4 text-[13px] font-bold uppercase tracking-widest text-[#0A0C0A] outline-none transition-transform hover:scale-[1.01] active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Swords size={16} /> Start Duel
          </button>
        </div>
      </div>
    );
  }

  if (phase === "done" && result) {
    return (
      <div className="mx-auto max-w-2xl min-h-screen px-5 pt-6 pb-6" ref={resultRef}>
        <div className="text-center">
          <div className={cn(
            "mx-auto mb-4 grid size-20 place-items-center rounded-full text-[28px]",
            result.won ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive",
          )}>
            {result.won ? <Swords size={28} /> : <Swords size={28} />}
          </div>
          <h1 className="text-[20px] font-bold tracking-[-0.02em] text-foreground leading-tight">
            {result.won ? "Victory!" : "Good Effort!"}
          </h1>
          <p className="text-[12px] text-muted-foreground/45 font-normal mt-1">
            {result.won ? `You beat ${opponent.name}!` : `${opponent.name} edged you out this time.`}
          </p>
        </div>

        <div className="mt-6 grid grid-cols-2 sm:grid-cols-2 gap-4">
          <div className="rounded-3xl border border-white/[0.06] backdrop-blur-xl p-4 text-center" style={{ backgroundColor: GLASS_BG }}>
            <p className="text-[10px] font-semibold tracking-widest text-muted-foreground/50">YOUR SCORE</p>
            <p className="mt-1 text-[20px] font-bold text-primary">{result.yourScore}</p>
            <p className="text-[10px] text-muted-foreground/40">{result.yourAccuracy}% accuracy</p>
          </div>
          <div className="rounded-3xl border border-white/[0.06] backdrop-blur-xl p-4 text-center" style={{ backgroundColor: GLASS_BG }}>
            <p className="text-[10px] font-semibold tracking-widest text-muted-foreground/50">{opponent.name}</p>
            <p className="mt-1 text-[20px] font-bold text-foreground/60">{result.opponentScore}</p>
            <p className="text-[10px] text-muted-foreground/40">{result.opponentAccuracy}% accuracy</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 sm:grid-cols-2 gap-3">
          <div className="rounded-3xl border border-white/[0.06] backdrop-blur-xl p-3 text-center" style={{ backgroundColor: GLASS_BG }}>
            <p className="text-[10px] text-muted-foreground/40">Your Time</p>
            <p className="text-[13px] font-bold font-mono text-foreground/80">{result.yourTime}s</p>
          </div>
          <div className="rounded-3xl border border-white/[0.06] backdrop-blur-xl p-3 text-center" style={{ backgroundColor: GLASS_BG }}>
            <p className="text-[10px] text-muted-foreground/40">XP Earned</p>
            <p className="text-[13px] font-bold text-chart-2">+{result.xpEarned}</p>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <button
            type="button"
            onClick={startDuel}
            className="flex items-center justify-center gap-2 rounded-3xl bg-gradient-to-r from-[#C7F252] to-[#A8D43A] py-4 text-[13px] font-bold uppercase tracking-widest text-[#0A0C0A] outline-none transition-transform hover:scale-[1.01] active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Swords size={16} /> Rematch
          </button>
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="rounded-3xl border border-white/[0.06] backdrop-blur-xl py-4 text-[12px] font-bold uppercase tracking-widest text-foreground outline-none transition-colors hover:bg-white/[0.06] active:bg-white/[0.08] focus-visible:ring-2 focus-visible:ring-ring"
            style={{ backgroundColor: GLASS_BG }}
          >
            Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (sessionLoading || !session) {
    return (
      <div className="mx-auto max-w-lg min-h-screen px-5 pt-6 pb-6 animate-pulse">
        <div className="h-14 rounded-xl mb-4" style={{ backgroundColor: GLASS_BG }} />
        <div className="h-48 rounded-3xl mb-4" style={{ backgroundColor: GLASS_BG }} />
        <div className="h-12 rounded-xl" style={{ backgroundColor: GLASS_BG }} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg min-h-screen px-5 pt-6 pb-6">
      <div className="mb-4 rounded-3xl border border-white/[0.06] backdrop-blur-xl p-3" style={{ backgroundColor: GLASS_BG }}>
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <div className="grid size-6 place-items-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
              {opponent.initials}
            </div>
            <span className="text-[10px] font-semibold text-foreground/60">{opponent.name}</span>
          </div>
          <span className="text-[10px] font-mono text-muted-foreground/40">
            {Math.min(opponentProgress, 10)}/10
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
          <div
            className="h-full rounded-full bg-chart-4 transition-all duration-500 ease-out"
            style={{ width: `${Math.min(100, (opponentProgress / 10) * 100)}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground/40">
          Duel &middot; {session.topicLabel}
        </span>
        <span className="text-[10px] font-mono text-muted-foreground/40">
          {currentIndex + 1}/{session.questions.length}
        </span>
      </div>

      <div className="h-1.5 w-full rounded-full bg-white/[0.06] mb-6">
        <div className="h-full rounded-full bg-primary transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
      </div>

      {question && (
        <div key={question.id} ref={questionRef}>
          <p className="text-[16px] font-bold leading-snug text-foreground mb-5">{question.text}</p>
          <div className="flex flex-col gap-2.5">
            {question.options.map((option, i) => {
              const isSelected = answers[question.id] === i;
              const isCorrect = i === question.correctIndex;
              let variant = "" as string;
              let variantStyle: React.CSSProperties = {};
              if (!revealed) {
                variant = "border-white/[0.06] text-foreground hover:border-white/[0.12] hover:bg-white/[0.06] active:bg-white/[0.08]";
                variantStyle = { backgroundColor: GLASS_BG };
              } else {
                if (isCorrect) variant = "border-primary bg-primary/10 text-primary";
                else if (isSelected) variant = "border-destructive bg-destructive/10 text-destructive";
                else variant = "border-white/[0.06] bg-white/[0.02] text-muted-foreground/40";
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
                  style={!revealed || (!isCorrect && !isSelected) ? variantStyle : undefined}
                >
                  <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-white/[0.06] text-[10px] font-bold text-muted-foreground">
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="flex-1 text-[13px] font-medium">{option}</span>
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
                className="flex w-full items-center justify-center gap-2 rounded-3xl bg-gradient-to-r from-[#C7F252] to-[#A8D43A] py-4 text-[13px] font-bold uppercase tracking-widest text-[#0A0C0A] outline-none transition-transform hover:scale-[1.01] active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-ring"
              >
                {currentIndex >= session.questions.length - 1 ? "See Results" : "Next"} <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
