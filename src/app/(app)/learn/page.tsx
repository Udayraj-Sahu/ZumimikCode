"use client";
import { PageContainer } from "@/components/ui/page-container";

import { useState, useRef, useLayoutEffect, useMemo, useEffect, Suspense } from "react";
import { motion, AnimatePresence, type Variants } from "motion/react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Grid3x3,
  Sigma,
  Pentagon,
  Sparkles,
  Plus,
  ArrowRight,
  Brain,
  ClipboardList,
  BookOpen,
  FileText,
  Play,
  Lock,
  GraduationCap,
  ChevronUp,
  CalendarDays,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePageMeta } from "@/hooks/use-page-meta";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { useDashboardData } from "@/hooks/queries/use-dashboard";
import { useMockPapers } from "@/hooks/queries/use-mock-exam";
import { DOMAIN_LABELS } from "@/lib/types/template";
import { AddPrepModal } from "@/components/learn/add-prep-modal";
import { AdaptiveReprompt } from "@/components/adaptive/adaptive-reprompt";
import { AdaptiveDashboard } from "@/components/adaptive/adaptive-dashboard";
import { ResumeProtocolCard } from "@/components/adaptive/resume-protocol-card";
import { PaywallModal } from "@/components/paywall/paywall-modal";
import { usePlanStore } from "@/stores/plan-store";
import { usePaywallStore } from "@/stores/paywall-store";

const GLASS_BG = "rgba(255,255,255,0.04)";
const GLASS_BORDER = "rgba(255,255,255,0.08)";

const tabVariants: Variants = {
  initial: { opacity: 0, y: 8, scale: 0.995 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -6, scale: 0.995 },
};
const tabTransition = { type: "tween" as const, duration: 0.2, ease: [0.4, 0, 0.2, 1] as const };

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return h === 1 ? "1 hour" : `${h} hours`;
  return `${h} hr ${m} min`;
}

const TOPIC_ICONS: Record<string, LucideIcon> = {
  Addition: Grid3x3,
  Subtraction: Pentagon,
  Multiplication: Sigma,
  Division: Grid3x3,
  Squares: Pentagon,
  "Quantitative Aptitude": Grid3x3,
  "Logical Reasoning": Sigma,
  "Data Interpretation": Pentagon,
  "Verbal Ability": Sparkles,
  "General Knowledge": Grid3x3,
  "Problem Solving": Grid3x3,
  "Data Sufficiency": Sigma,
  "Sentence Correction": Sparkles,
  "Critical Reasoning": Pentagon,
  "Reading Comprehension": Sparkles,
  "Quantitative Reasoning": Grid3x3,
  "Verbal Reasoning": Sparkles,
  "Text Completion": Sigma,
  "Sentence Equivalence": Sparkles,
  "Numerical Ability": Grid3x3,
  "Reasoning Ability": Sigma,
  "English Language": Sparkles,
  "General Awareness": Grid3x3,
  "Computer Knowledge": Pentagon,
};

const TOPIC_COLORS = ["#34D399", "#22D3EE", "#A78BFA", "#FBBF24", "#FB7185"];

function getInsight(topics: { name: string; value: number }[]): string {
  if (topics.length === 0) return "Start a sprint to see your Sensei Insight.";
  const sorted = [...topics].sort((a, b) => b.value - a.value);
  const best = sorted[0];
  const worst = sorted[sorted.length - 1];
  if (best.value === worst.value)
    return `Consistent across all topics at ${best.value}%. Keep building!`;
  if (best.value >= 80 && worst.value >= 60)
    return `Strong across the board. ${best.name} (${best.value}%) leads the way.`;
  if (worst.value < 50)
    return `${best.name} (${best.value}%) is your strength. Focus on ${worst.name} (${worst.value}%) to close the gap.`;
  return `${best.name} (${best.value}%) leads. ${worst.name} (${worst.value}%) needs more practice.`;
}

type Mode = "explore" | "adaptive" | "mock";

const MODES: {
  id: Mode;
  label: string;
  Icon: LucideIcon;
  color: string;
  accent: string;
  subtitle: string;
}[] = [
  {
    id: "explore",
    label: "Topic Explorer",
    Icon: Grid3x3,
    color: "#34D399",
    accent: "#34D399",
    subtitle: "Browse topics and track your mastery",
  },
  {
    id: "adaptive",
    label: "Adaptive Learning",
    Icon: Brain,
    color: "#A78BFA",
    accent: "#A78BFA",
    subtitle: "Sprints tuned to your skill level",
  },
  {
    id: "mock",
    label: "Mock",
    Icon: ClipboardList,
    color: "#FBBF24",
    accent: "#FBBF24",
    subtitle: "Full-length, exam-style timed tests",
  },
];

function LearnPageContent() {
  usePageMeta("Learn — Exam Arena");
  const router = useRouter();
  const searchParams = useSearchParams();
  const targetExam = useOnboardingStore((s) => s.targetExam);
  const activePreps = useOnboardingStore((s) => s.activePreps);
  const justExploring = useOnboardingStore((s) => s.justExploring);
  const goal = useOnboardingStore((s) => s.goal);
  const activeLearnDomain = useOnboardingStore((s) => s.activeLearnDomain);
  const setActiveLearnDomain = useOnboardingStore((s) => s.setActiveLearnDomain);
  const canTakeMock = usePlanStore((s) => s.canTakeMock);
  const recordMock = usePlanStore((s) => s.recordMock);
  const openPaywall = usePaywallStore((s) => s.openPaywall);
  const [mode, setMode] = useState<Mode>(() => {
    const m = searchParams.get("mode");
    return m === "mock" || m === "adaptive" ? m : "explore";
  });
  const [activeDomain, setActiveDomain] = useState(activeLearnDomain || targetExam || "");
  const [showAddPrep, setShowAddPrep] = useState(false);
  const [addPrepGated, setAddPrepGated] = useState(true);
  const [statsCollapsed, setStatsCollapsed] = useState(true);
  const [mockSection, setMockSection] = useState<string>("all");

  const prepExams = useMemo(() => {
    const others = activePreps.filter((id) => id !== targetExam && id in DOMAIN_LABELS);
    const list = [...others];
    if (targetExam && targetExam in DOMAIN_LABELS) list.unshift(targetExam);
    return list;
  }, [activePreps, targetExam]);

  const primaryExam = useMemo(() => {
    const target = targetExam && targetExam in DOMAIN_LABELS ? targetExam : "";
    return target || prepExams[0] || (justExploring ? "vedic-math" : "");
  }, [targetExam, prepExams, justExploring]);

  const { data } = useDashboardData(activeDomain);
  const mockExamDomain = prepExams.length === 0 && justExploring ? "random" : primaryExam;
  const { data: mockPapers, isLoading: mockLoading } = useMockPapers(mockExamDomain);
  const topics = data?.topics ?? [];

  const mockStats = useMemo<StatsSummary>(() => {
    if (prepExams.length === 0) {
      return { accuracy: "--", questions: "--", percentile: "--", speed: "--" };
    }
    if (prepExams.length === 1) {
      return { accuracy: "87%", questions: "1,247", percentile: "64%ile", speed: "47s" };
    }
    return { accuracy: "91%", questions: "2,845", percentile: "78%ile", speed: "42s" };
  }, [prepExams.length]);

  const adaptiveAccent = "#C8FF4D";

  const todayLabel = useMemo(
    () =>
      new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric" }).format(
        new Date(),
      ),
    [],
  );

  useEffect(() => {
    const m = searchParams.get("mode");
    if (m === "mock" || m === "adaptive") {
      setMode(m);
    }
  }, [searchParams]);

  const prevMockDomainRef = useRef(activeDomain);
  useEffect(() => {
    if (prevMockDomainRef.current !== activeDomain) {
      prevMockDomainRef.current = activeDomain;
      setMockSection("all");
    }
  }, [activeDomain]);

  const activeMode = MODES.find((m) => m.id === mode)!;
  const outerBg = "linear-gradient(180deg, rgba(20,23,15,0.9) 0%, rgba(10,12,10,0.85) 100%)";

  const cardRef = useRef<HTMLDivElement | null>(null);
  const glowTopRef = useRef<HTMLDivElement | null>(null);
  const glowBottomRef = useRef<HTMLDivElement | null>(null);

  const setGlow = (color: string) => {
    cardRef.current?.style.setProperty("--accent", color);
    if (glowTopRef.current) {
      glowTopRef.current.style.background = `radial-gradient(circle, ${color}33, transparent)`;
    }
    if (glowBottomRef.current) {
      glowBottomRef.current.style.background = `radial-gradient(circle, ${color}44, transparent)`;
    }
  };

  useLayoutEffect(() => {
    setGlow(activeMode.color);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMode.color]);

  const goTo = (tab: Mode) => {
    if (tab === mode) return;
    setMode(tab);
  };

  return (
    <PageContainer>
      <div className="mx-auto w-full md:max-w-3xl">
      {/* Page header — matches app pattern */}
      <header className="mb-5">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.04] backdrop-blur-sm px-4 py-1.5 max-[359px]:px-3">
          <BookOpen size={12} className="text-primary" />
          <span className="text-micro font-semibold tracking-[0.22em] text-primary/80">LEARN</span>
        </div>
        <h1 className="mt-3 text-[20px] font-bold tracking-[-0.02em] text-foreground leading-tight">
          Choose Your Path
        </h1>
        <p className="mt-1 text-[12px] text-muted-foreground/45 font-normal">
          Master topics, adaptive sprints &amp; timed mocks.
        </p>
      </header>

      {/* Outer glass card wrapping all content */}
      <div
        ref={cardRef}
        className="relative overflow-hidden rounded-3xl border backdrop-blur-xl px-5 pb-4 pt-5 max-[359px]:px-4 max-[359px]:pb-3 max-[359px]:pt-4 transition-colors duration-500"
        style={{ borderColor: GLASS_BORDER, background: outerBg }}
      >
        <div
          ref={glowTopRef}
          className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-15 pointer-events-none transition-opacity duration-500"
        />
        <div
          ref={glowBottomRef}
          className="absolute bottom-0 left-0 w-32 h-32 rounded-full opacity-10 pointer-events-none transition-opacity duration-500"
        />

        {/* Tab mode selector — 3D push keys: active pops up, others sit flat/sunken */}
        <div className="relative -mx-5 -mt-5 mb-2 px-5 pt-4 pb-5 max-[359px]:-mx-4 max-[359px]:px-4 max-[359px]:pt-3 max-[359px]:pb-4">
          <div className="grid grid-cols-3 gap-2.5 max-[359px]:gap-1.5 md:max-w-2xl md:mx-auto md:w-full">
            {MODES.map((m) => {
              const isActive = m.id === mode;
              return (
                <motion.button
                  key={m.id}
                  type="button"
                  onClick={() => goTo(m.id)}
                  initial={false}
                  animate={{ y: isActive ? -2 : 0, scale: isActive ? 1.02 : 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 30 }}
                  className="relative"
                >
                  {/* Top light bevel — only on the raised active key */}
                  <div
                    className="absolute inset-x-1.5 top-0 h-px rounded-full transition-opacity duration-500 ease-out pointer-events-none"
                    style={{
                      opacity: isActive ? 1 : 0,
                      background:
                        "linear-gradient(90deg, transparent, rgba(255,255,255,0.7), transparent)",
                    }}
                  />
                  <div
                    className={`flex flex-col items-center justify-center gap-1.5 py-4 rounded-2xl transition-all duration-500 ease-out ${isActive ? "font-semibold" : "font-medium"}`}
                    style={
                      isActive
                        ? {
                            background:
                              "linear-gradient(180deg, rgba(199,242,82,0.18), rgba(199,242,82,0.05))",
                            boxShadow:
                              "0 8px 18px rgba(0,0,0,0.4), 0 2px 4px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.35), inset 0 -2px 6px rgba(0,0,0,0.35)",
                          }
                        : {
                            background: "rgba(255,255,255,0.02)",
                            boxShadow:
                              "inset 0 2px 4px rgba(0,0,0,0.5), inset 0 -1px 1px rgba(255,255,255,0.04)",
                          }
                    }
                  >
                    <motion.span
                      animate={{ scale: isActive ? 1.05 : 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      className="block"
                    >
                      <m.Icon
                        size={16}
                        strokeWidth={2.2}
                        style={{ color: isActive ? "var(--accent)" : "rgba(255,255,255,0.45)" }}
                      />
                    </motion.span>
                    <span
                      className="relative z-10 text-[11px] leading-none tracking-[0.02em] transition-colors duration-500 ease-out whitespace-nowrap"
                      style={
                        isActive
                          ? {
                              color: "var(--accent)",
                              textShadow: "0 1px 1px rgba(0,0,0,0.6)",
                            }
                          : {
                              color: "rgba(255,255,255,0.5)",
                              textShadow: "0 1px 2px rgba(0,0,0,0.8)",
                            }
                      }
                    >
                      {m.label}
                    </span>
                  </div>
                  {/* Bottom drop shadow for the raised key */}
                  <div
                    className="absolute -bottom-2 left-2 right-2 h-3 rounded-full transition-opacity duration-500 ease-out pointer-events-none"
                    style={{
                      opacity: isActive ? 1 : 0,
                      background:
                        "radial-gradient(ellipse at center, rgba(0,0,0,0.5), transparent 70%)",
                      filter: "blur(4px)",
                    }}
                  />
                </motion.button>
              );
            })}
          </div>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          {mode === "explore" && (
            <motion.div
              key="explore"
              variants={tabVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={tabTransition}
            >
              <>
                {/* Add Prep CTA — ungated in Topic Explorer */}
                <button
                  type="button"
                  onClick={() => {
                    setAddPrepGated(false);
                    setShowAddPrep(true);
                  }}
                  className="w-full rounded-2xl border border-primary/20 bg-primary/5 backdrop-blur-xl py-3.5 min-h-[44px] flex items-center justify-center gap-2 text-[13px] font-semibold tracking-widest uppercase text-primary transition-all hover:bg-primary/[0.08] hover:border-primary/35 active:scale-[0.98] outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Plus size={15} strokeWidth={2.5} />
                  ADD PREP
                </button>

                {/* Exam Tabs */}
                <div
                  className="rounded-3xl border backdrop-blur-xl p-4 max-[359px]:p-3 mt-5"
                  style={{ borderColor: GLASS_BORDER, background: GLASS_BG }}
                >
                  <p className="text-micro font-semibold tracking-[0.18em] text-muted-foreground/40 uppercase mb-2">
                    EXAM PREP
                  </p>
                  {prepExams.length === 0 ? (
                    <div className="flex items-center justify-center py-4">
                      <span className="text-[12px] text-muted-foreground/50">
                        Select exam via add prep
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {prepExams.map((id) => (
                        <button
                          key={id}
                          type="button"
                          onClick={() => {
                            setActiveDomain(id);
                            setActiveLearnDomain(id);
                          }}
                          className={cn(
                            "text-[11px] font-semibold rounded-full px-3.5 py-1.5 whitespace-nowrap max-[359px]:px-3 transition-all",
                            activeDomain === id
                              ? "bg-gradient-to-r from-primary to-[#a8e62e] text-primary-foreground shadow-[0_0_12px_rgba(199,242,82,0.25)]"
                              : "bg-white/[0.04] text-muted-foreground/50 border border-white/[0.06] hover:bg-white/[0.07]",
                          )}
                        >
                          {DOMAIN_LABELS[id]}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Topic Cards */}
                {prepExams.length > 0 && (
                  <motion.div
                    key={`${activeDomain}-topics`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="flex flex-col gap-3 mt-5 max-[359px]:gap-2 md:grid md:grid-cols-2 md:items-stretch md:gap-4"
                  >
                    {topics.map((topic, i) => {
                      const Icon = TOPIC_ICONS[topic.name] || Grid3x3;
                      const color = TOPIC_COLORS[i % TOPIC_COLORS.length];
                      return (
                        <button
                          key={topic.name}
                          type="button"
                          onClick={() =>
                            router.push(
                              `/learn/explorer?domain=${activeDomain}&topic=${encodeURIComponent(topic.name.toLowerCase())}`,
                            )
                          }
                          className="group rounded-3xl border backdrop-blur-xl p-5 max-[359px]:p-4 text-left transition-all hover:bg-white/[0.06] active:scale-[0.98]"
                          style={{ borderColor: GLASS_BORDER, background: GLASS_BG }}
                        >
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div
                                className="h-9 w-9 rounded-xl flex items-center justify-center"
                                style={{ background: `${color}15` }}
                              >
                                <Icon size={16} style={{ color }} />
                              </div>
                              <h3 className="text-[14px] font-semibold tracking-[-0.01em] text-foreground">
                                {topic.name}
                              </h3>
                            </div>
                            <div className="flex items-baseline gap-1">
                              <span
                                className="text-[13px] font-bold tracking-[-0.02em]"
                                style={{ color }}
                              >
                                {topic.value}%
                              </span>
                              <span className="text-micro font-medium uppercase tracking-wider text-muted-foreground/50">
                                mastery
                              </span>
                            </div>
                          </div>
                          <div className="h-[6px] w-full rounded-full bg-white/[0.05] overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-700"
                              style={{
                                width: `${topic.value}%`,
                                background: `linear-gradient(90deg, ${color}88, ${color})`,
                                boxShadow: `0 0 8px ${color}40`,
                              }}
                            />
                          </div>
                        </button>
                      );
                    })}

                    {topics.length === 0 && (
                      <div
                        className="rounded-3xl border border-dashed border-white/[0.06] py-12 text-center md:col-span-2"
                        style={{ background: GLASS_BG }}
                      >
                        <BookOpen size={24} className="mx-auto text-muted-foreground/25 mb-3" />
                        <p className="text-[13px] text-muted-foreground/45 font-normal">
                          No topics yet. Add a prep to get started.
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Resume Protocol — above Sensei Insight */}
                <ResumeProtocolCard
                  domain={activeDomain}
                  accent="#34D399"
                  kind="sprint"
                  className="mt-5 px-0"
                />

                {/* Sensei Insight */}
                {prepExams.length > 0 && topics.length > 0 && (
                  <div
                    className="relative rounded-3xl border backdrop-blur-xl p-5 mt-5 overflow-hidden"
                    style={{
                      borderColor: GLASS_BORDER,
                      background:
                        "linear-gradient(135deg, rgba(59,130,246,0.06) 0%, rgba(255,255,255,0.03) 100%)",
                    }}
                  >
                    <div className="absolute left-0 top-0 h-full w-[3px] bg-gradient-to-b from-[#3B82F6] to-[#22D3EE]" />
                    <div className="flex items-center gap-2.5 mb-3">
                      <div className="h-7 w-7 rounded-lg bg-[#3B82F6]/10 flex items-center justify-center">
                        <Sparkles size={14} className="text-[#3B82F6]" />
                      </div>
                      <p className="text-micro font-semibold tracking-[0.18em] text-[#3B82F6]/70 uppercase">
                        SENSEI INSIGHT
                      </p>
                    </div>
                    <p className="text-[13px] text-foreground/70 font-normal leading-relaxed pl-1 italic">
                      &ldquo;{getInsight(topics)}&rdquo;
                    </p>
                  </div>
                )}

                {/* Explore Techniques */}
                {prepExams.length === 0 ? (
                  <div
                    className="flex flex-col items-center gap-3 py-8 text-center rounded-3xl border border-dashed border-white/[0.08] mt-5"
                    style={{ background: GLASS_BG }}
                  >
                    <span className="relative grid size-12 place-items-center rounded-2xl bg-white/[0.05] border border-white/[0.06]">
                      <Lock size={16} className="text-muted-foreground/45" />
                    </span>
                    <span className="text-[13px] text-muted-foreground/50">
                      Select an exam to explore techniques
                    </span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => router.push("/learn/explorer")}
                    className="w-full mt-5 rounded-3xl border backdrop-blur-xl py-4 flex items-center justify-center gap-2 text-[13px] font-semibold text-foreground/70 transition-all hover:bg-white/[0.06] active:scale-[0.98]"
                    style={{ borderColor: GLASS_BORDER, background: GLASS_BG }}
                  >
                    EXPLORE TECHNIQUES
                    <ArrowRight size={14} />
                  </button>
                )}
              </>
            </motion.div>
          )}

          {mode === "adaptive" && (
            <motion.div
              key="adaptive"
              variants={tabVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={tabTransition}
            >
              {/* Toolbar — pill + gated ADD PREP */}
              <div className="flex items-center justify-between gap-3 max-[359px]:gap-1.5">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.04] px-4 py-1.5 max-[359px]:px-3 backdrop-blur-sm">
                  <CalendarDays size={12} style={{ color: adaptiveAccent }} />
                  <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-foreground/70 whitespace-nowrap">
                    {todayLabel}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setAddPrepGated(true);
                    setShowAddPrep(true);
                  }}
                  className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 max-[359px]:px-3 max-[359px]:py-1.5 text-[11px] font-bold text-[#0A0C0A] transition-all hover:opacity-90 active:scale-95"
                >
                  <Plus size={12} strokeWidth={3} /> ADD PREP
                </button>
              </div>

              {/* Exam switcher — mirrors Mock tab, secondary exams locked */}
              {prepExams.length > 1 && (
                <div className="relative mt-4 mb-1">
                  <div
                    className="relative flex gap-1 p-1 overflow-x-auto rounded-3xl border [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                    style={{
                      borderColor: "rgba(255,255,255,0.08)",
                      background: "rgba(255,255,255,0.04)",
                    }}
                  >
                    {prepExams.map((id) => {
                      const isPrimary = id === primaryExam;
                      const active = isPrimary;
                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => {
                            if (isPrimary) {
                              setActiveDomain(id);
                            } else {
                              openPaywall("prep");
                            }
                          }}
                          className="relative flex-1 flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl px-4 py-3 max-[359px]:px-2 text-[11px] font-bold uppercase tracking-wider outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          style={{ color: active ? "#0A0C0A" : "rgba(255,255,255,0.55)" }}
                        >
                          {active && (
                            <motion.div
                              layoutId="adaptive-exam-slider"
                              transition={{ type: "spring", stiffness: 400, damping: 32 }}
                              className="absolute inset-0 rounded-2xl"
                              style={{
                                background: "linear-gradient(180deg, #d7ff7e, #a8e62e)",
                                boxShadow: "0 6px 16px -4px rgba(199,242,82,0.4)",
                              }}
                            />
                          )}
                          <span
                            className="relative flex items-center gap-2 transition-colors duration-300"
                            style={{
                              textShadow: active ? "0 1px 0 rgba(255,255,255,0.35)" : "none",
                            }}
                          >
                            {isPrimary ? (
                              <GraduationCap size={14} className="relative" />
                            ) : (
                              <Lock size={12} className="relative text-muted-foreground/50" />
                            )}
                            <span className="relative">{DOMAIN_LABELS[id] ?? id}</span>
                            {!isPrimary && (
                              <span
                                className="relative text-[7px] font-black tracking-[0.14em] px-1.5 py-0.5 rounded-full"
                                style={{
                                  background: "rgba(255,255,255,0.08)",
                                  color: "rgba(255,255,255,0.45)",
                                }}
                              >
                                PRO
                              </span>
                            )}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Your Stats — mirrors Mock tab, colored per variant */}
              <YourStatsCard
                collapsed={statsCollapsed}
                onToggle={() => setStatsCollapsed((v) => !v)}
                hasPrep={prepExams.length > 0}
                stats={mockStats}
                color={adaptiveAccent}
              />

              {/* Today's Practice / Resume — start entry only when goal is set */}
              <ResumeProtocolCard
                domain={primaryExam}
                accent={adaptiveAccent}
                showStartEntry={!!goal}
                kind="sprint"
                className="mt-5 px-0"
              />

              {justExploring && prepExams.length === 0 ? (
                <AdaptiveDashboard domain={primaryExam} />
              ) : !goal ? (
                <AdaptiveReprompt onDone={() => setMode("adaptive")} />
              ) : prepExams.length === 0 ? (
                <div
                  className="mt-4 flex flex-col items-center gap-3 py-10 text-center rounded-3xl border border-dashed border-white/[0.08]"
                  style={{ background: GLASS_BG }}
                >
                  <span className="relative grid size-12 place-items-center rounded-2xl bg-white/[0.05] border border-white/[0.06]">
                    <Lock size={16} className="text-muted-foreground/45" />
                  </span>
                  <span className="text-[13px] text-muted-foreground/50">
                    Select exam via add prep
                  </span>
                </div>
              ) : (
                <AdaptiveDashboard domain={primaryExam} />
              )}
            </motion.div>
          )}

          {mode === "mock" && (
            <motion.div
              key="mock"
              variants={tabVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={tabTransition}
            >
              {/* Header */}
              <div className="relative mb-5 flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-[20px] font-bold tracking-[-0.02em] text-foreground">
                    {prepExams.length === 0 && justExploring
                      ? "Random Test"
                      : DOMAIN_LABELS[primaryExam] || "Mock"}{" "}
                    <span className="bg-gradient-to-r from-primary to-[#d4ff6e] bg-clip-text text-transparent">
                      {prepExams.length === 0 && justExploring ? "Prep" : "Papers"}
                    </span>
                  </h2>
                  <p className="mt-1 text-[12px] text-muted-foreground/45 font-normal">
                    {prepExams.length === 0 && justExploring
                      ? "Mixed questions from every exam style."
                      : "Full-length and sectional timed tests."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setAddPrepGated(true);
                    setShowAddPrep(true);
                  }}
                  className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 max-[359px]:px-3 max-[359px]:py-1.5 text-[11px] font-bold text-[#0A0C0A] transition-all hover:opacity-90 active:scale-95"
                >
                  <Plus size={12} strokeWidth={3} /> ADD PREP
                </button>
              </div>

              {/* Exam switcher — sliding segmented control */}
              {prepExams.length > 1 && (
                <div className="relative mt-2 mb-5">
                  <div
                    className="relative flex gap-1 p-1 overflow-x-auto rounded-3xl border [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                    style={{
                      borderColor: "rgba(255,255,255,0.08)",
                      background: "rgba(255,255,255,0.04)",
                    }}
                  >
                    {prepExams.map((id) => {
                      const isPrimary = id === primaryExam;
                      const active = isPrimary;
                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => {
                            if (isPrimary) {
                              setActiveDomain(id);
                            } else {
                              openPaywall("prep");
                            }
                          }}
                          className="relative flex-1 flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl px-4 py-3 max-[359px]:px-2 text-[11px] font-bold uppercase tracking-wider outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          style={{ color: active ? "#0A0C0A" : "rgba(255,255,255,0.55)" }}
                        >
                          {active && (
                            <motion.div
                              layoutId="mock-exam-slider"
                              transition={{ type: "spring", stiffness: 400, damping: 32 }}
                              className="absolute inset-0 rounded-2xl"
                              style={{
                                background: "linear-gradient(180deg, #d7ff7e, #a8e62e)",
                                boxShadow: "0 6px 16px -4px rgba(199,242,82,0.4)",
                              }}
                            />
                          )}
                          <span
                            className="relative flex items-center gap-2 transition-colors duration-300"
                            style={{
                              textShadow: active ? "0 1px 0 rgba(255,255,255,0.35)" : "none",
                            }}
                          >
                            {isPrimary ? (
                              <GraduationCap size={14} className="relative" />
                            ) : (
                              <Lock size={12} className="relative text-muted-foreground/50" />
                            )}
                            <span className="relative">{DOMAIN_LABELS[id] ?? id}</span>
                            {!isPrimary && (
                              <span
                                className="relative text-[7px] font-black tracking-[0.14em] px-1.5 py-0.5 rounded-full"
                                style={{
                                  background: "rgba(255,255,255,0.08)",
                                  color: "rgba(255,255,255,0.45)",
                                }}
                              >
                                PRO
                              </span>
                            )}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Stats card */}
              <YourStatsCard
                collapsed={statsCollapsed}
                onToggle={() => setStatsCollapsed((v) => !v)}
                hasPrep={prepExams.length > 0}
                stats={mockStats}
                color="#C8FF4D"
              />

              {/* Mock resume — shows only when a mock is in progress */}
              <ResumeProtocolCard
                domain={mockExamDomain}
                accent="#C8FF4D"
                kind="mock"
                className="mt-4 px-0"
              />

              {/* Section filter chips */}
              {(prepExams.length > 0 || justExploring) &&
                (() => {
                  const sectionSet = new Set<string>();
                  (mockPapers ?? []).forEach((p) =>
                    p.sections.forEach((s) => sectionSet.add(s.label)),
                  );
                  const sections = ["all", ...Array.from(sectionSet)];
                  return (
                    <div className="flex items-center gap-2 max-[359px]:gap-1.5 overflow-x-auto mt-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:flex-wrap md:overflow-visible">
                      {sections.map((sec) => (
                        <button
                          key={sec}
                          type="button"
                          onClick={() => setMockSection(sec)}
                          className={cn(
                            "shrink-0 rounded-full px-3.5 py-1.5 max-[359px]:px-3 whitespace-nowrap text-[11px] font-semibold transition-all",
                            mockSection === sec
                              ? "bg-gradient-to-r from-primary to-[#a8e62e] text-[#0A0C0A]"
                              : "border border-white/[0.07] text-muted-foreground/60 hover:bg-white/[0.05]",
                          )}
                        >
                          {sec === "all" ? "All" : sec}
                        </button>
                      ))}
                    </div>
                  );
                })()}

              {/* Paper list */}
              <motion.div
                key={`${mockSection}-${mockExamDomain}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="flex flex-col gap-3 mt-5 max-[359px]:gap-2 md:grid md:grid-cols-2 md:items-stretch md:gap-4"
              >
                {mockLoading && (
                  <div className="flex flex-col gap-3 max-[359px]:gap-2 md:col-span-2">
                    {[0, 1].map((i) => (
                      <div
                        key={i}
                        className="rounded-3xl border backdrop-blur-xl p-5 animate-pulse"
                        style={{ borderColor: GLASS_BORDER, background: GLASS_BG }}
                      >
                        <div className="h-4 w-2/3 rounded bg-white/[0.06] mb-3" />
                        <div className="h-3 w-1/2 rounded bg-white/[0.04]" />
                      </div>
                    ))}
                  </div>
                )}

                {!mockLoading &&
                  (mockPapers ?? [])
                    .filter(
                      (p) =>
                        mockSection === "all" || p.sections.some((s) => s.label === mockSection),
                    )
                    .map((paper) => (
                      <div
                        key={paper.id}
                        className="group rounded-3xl border backdrop-blur-xl p-5 max-[359px]:p-4 transition-all hover:bg-white/[0.05]"
                        style={{ borderColor: GLASS_BORDER, background: GLASS_BG }}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <div
                                className="size-8 shrink-0 rounded-lg grid place-items-center"
                                style={{ background: `${paper.accent}1a` }}
                              >
                                <FileText size={14} style={{ color: paper.accent }} />
                              </div>
                              <h3 className="text-[13.5px] font-semibold tracking-[-0.01em] text-foreground leading-snug">
                                {paper.title}
                              </h3>
                            </div>
                          </div>
                          <div className="shrink-0 grid size-7 place-items-center rounded-full border border-white/[0.07] text-muted-foreground/50">
                            <ArrowRight size={12} />
                          </div>
                        </div>

                        <p className="text-micro text-muted-foreground/50 mt-3 font-normal">
                          {paper.sections.map((s) => s.label).join(" | ")} • {paper.totalQuestions}{" "}
                          Questions • {formatDuration(paper.durationMinutes)}
                        </p>

                        <div className="flex items-center justify-between mt-4 gap-3 max-[359px]:gap-1.5">
                          <div className="flex flex-wrap gap-1.5">
                            {paper.sections.map((s) => (
                              <span
                                key={s.id}
                                className="text-[9px] font-bold px-2 py-0.5 rounded-full border border-white/[0.07] whitespace-nowrap"
                                style={{ color: paper.accent, background: `${paper.accent}0d` }}
                              >
                                {s.label} · {s.questions}
                              </span>
                            ))}
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              if (!canTakeMock()) {
                                openPaywall("prep");
                                return;
                              }
                              recordMock();
                              router.push(
                                `/learn/mock/run?paper=${paper.id}&domain=${mockExamDomain}`,
                              );
                            }}
                            className="shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-primary to-[#a8e62e] px-4 py-2 max-[359px]:px-3 whitespace-nowrap text-[11px] font-bold uppercase tracking-wider text-[#0A0C0A] transition-transform hover:scale-[1.02] active:scale-[0.98]"
                          >
                            <Play size={12} strokeWidth={2.5} /> Take Test
                          </button>
                        </div>
                      </div>
                    ))}

                {!mockLoading && (mockPapers ?? []).length === 0 && (
                  <div
                    className="rounded-3xl border border-dashed border-white/[0.06] py-12 text-center md:col-span-2"
                    style={{ background: GLASS_BG }}
                  >
                    <FileText size={24} className="mx-auto text-muted-foreground/25 mb-3" />
                    <p className="text-[13px] text-muted-foreground/45 font-normal">
                      No papers yet for{" "}
                      {mockExamDomain === "random"
                        ? "Random Test Prep"
                        : DOMAIN_LABELS[mockExamDomain] || "this exam"}
                      .
                    </p>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {showAddPrep && <AddPrepModal gated={addPrepGated} onClose={() => setShowAddPrep(false)} />}
        <PaywallModal />
      </div>
      </div>
    </PageContainer>
  );
}

export default function LearnPage() {
  return (
    <Suspense fallback={null}>
      <LearnPageContent />
    </Suspense>
  );
}

function StatBox({ value, label, color }: { value: string; label: string; color?: string }) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-3.5 max-[359px]:p-3">
      <div className="flex items-center justify-between">
        <span
          className="size-1.5 rounded-full"
          style={{ backgroundColor: color ?? "var(--primary)" }}
        />
        <ArrowRight size={10} className="text-muted-foreground/40" />
      </div>
      <div className="mt-2.5 text-[20px] font-bold tracking-[-0.03em] text-foreground leading-none">
        {value}
      </div>
      <div className="mt-1.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/45">
        {label}
      </div>
    </div>
  );
}

type StatsSummary = { accuracy: string; questions: string; percentile: string; speed: string };

function YourStatsCard({
  collapsed,
  onToggle,
  hasPrep,
  stats,
  color,
}: {
  collapsed: boolean;
  onToggle: () => void;
  hasPrep: boolean;
  stats: StatsSummary;
  color: string;
}) {
  return (
    <div
      className="relative rounded-3xl border backdrop-blur-xl mt-5 overflow-hidden"
      style={{ borderColor: GLASS_BORDER, background: GLASS_BG }}
    >
      <div
        className="absolute -top-10 -right-10 size-32 rounded-full opacity-[0.07] pointer-events-none"
        style={{ background: `radial-gradient(circle, ${color}, transparent 70%)` }}
      />

      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-2 px-5 py-4 outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-expanded={!collapsed}
      >
        <span className="text-micro font-semibold tracking-[0.18em] text-muted-foreground/40 uppercase">
          Your Stats
        </span>
        <span className="grid size-6 place-items-center rounded-full border border-white/[0.07] text-muted-foreground/50">
          <ChevronUp
            size={12}
            className="transition-transform duration-300"
            style={{ transform: collapsed ? "rotate(180deg)" : "none" }}
          />
        </span>
      </button>

      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          collapsed ? "grid-rows-[0fr]" : "grid-rows-[1fr]",
        )}
      >
        <div className="overflow-hidden min-h-0">
          <div className="px-5 pb-5">
            {!hasPrep ? (
              <div className="flex flex-col items-center gap-3 py-6 text-center">
                <span className="relative grid size-12 place-items-center rounded-2xl bg-white/[0.05] border border-white/[0.06]">
                  <Lock size={16} className="text-muted-foreground/45" />
                </span>
                <span className="text-[12px] text-muted-foreground/50">
                  Select a prep to view your progress
                </span>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2.5 max-[359px]:gap-1.5 md:grid-cols-4">
                <StatBox value={stats.accuracy} label="Accuracy" color={color} />
                <StatBox value={stats.questions} label="Questions" color={color} />
                <StatBox value={stats.percentile} label="Percentile" color={color} />
                <StatBox value={stats.speed} label="Speed" color={color} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
