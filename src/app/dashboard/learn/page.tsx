"use client";

import { useState, useRef, useLayoutEffect, useMemo, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "motion/react";
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
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePageMeta } from "@/hooks/use-page-meta";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { useDashboardData } from "@/hooks/queries/use-dashboard";
import { useMockPapers } from "@/hooks/queries/use-mock-exam";
import { DOMAIN_LABELS } from "@/lib/types/template";
import { AddPrepModal } from "@/components/learn/add-prep-modal";

const GLASS_BG = "rgba(255,255,255,0.04)";
const GLASS_BORDER = "rgba(255,255,255,0.08)";

function formatDuration(minutes: number): string {
  if (minutes >= 60) {
    const h = minutes / 60;
    return h === 1 ? "1 hour" : `${h} hours`;
  }
  return `${minutes} min`;
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
  if (best.value === worst.value) return `Consistent across all topics at ${best.value}%. Keep building!`;
  if (best.value >= 80 && worst.value >= 60) return `Strong across the board. ${best.name} (${best.value}%) leads the way.`;
  if (worst.value < 50) return `${best.name} (${best.value}%) is your strength. Focus on ${worst.name} (${worst.value}%) to close the gap.`;
  return `${best.name} (${best.value}%) leads. ${worst.name} (${worst.value}%) needs more practice.`;
}

type Mode = "explore" | "adaptive" | "mock";

const MODES: { id: Mode; label: string; Icon: LucideIcon; color: string; accent: string; subtitle: string }[] = [
  { id: "explore", label: "Topic Explorer", Icon: Grid3x3, color: "#34D399", accent: "#34D399", subtitle: "Browse topics and track your mastery" },
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
  const activeLearnDomain = useOnboardingStore((s) => s.activeLearnDomain);
  const setActiveLearnDomain = useOnboardingStore((s) => s.setActiveLearnDomain);
  const [mode, setMode] = useState<Mode>(() => {
    const m = searchParams.get("mode");
    return m === "mock" || m === "adaptive" ? m : "explore";
  });
  const [activeDomain, setActiveDomain] = useState(activeLearnDomain || targetExam || "");
  const [showAddPrep, setShowAddPrep] = useState(false);
  const [statsCollapsed, setStatsCollapsed] = useState(true);
  const [mockSection, setMockSection] = useState<string>("all");
  const { data } = useDashboardData(activeDomain);
  const { data: mockPapers, isLoading: mockLoading } = useMockPapers(activeDomain);
  const topics = data?.topics ?? [];

  const prepExams = useMemo(() => {
    const others = activePreps.filter((id) => id !== targetExam && id in DOMAIN_LABELS);
    const list = [...others];
    if (targetExam && targetExam in DOMAIN_LABELS) list.unshift(targetExam);
    return list;
  }, [activePreps, targetExam]);

  const mockStats = useMemo(() => {
    if (prepExams.length === 0) {
      return { accuracy: "--", questions: "--", percentile: "--", speed: "--" };
    }
    if (prepExams.length === 1) {
      return { accuracy: "87%", questions: "1,247", percentile: "64%ile", speed: "47s" };
    }
    return { accuracy: "91%", questions: "2,845", percentile: "78%ile", speed: "42s" };
  }, [prepExams.length]);

  useEffect(() => {
    if (prepExams.length > 0 && !prepExams.includes(activeDomain)) {
      setActiveDomain(prepExams[0]);
    }
  }, [prepExams, activeDomain]);

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
  }, []);

  const goTo = (tab: Mode) => {
    if (tab === mode) return;
    setMode(tab);
    setGlow(MODES.find((m) => m.id === tab)!.color);
  };

  return (
    <div className="min-h-screen max-w-5xl mx-auto px-5 pt-6 pb-4">
      {/* Page header — matches app pattern */}
      <header className="mb-5">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.04] backdrop-blur-sm px-4 py-1.5">
          <BookOpen size={12} className="text-primary" />
          <span className="text-[10px] font-semibold tracking-[0.22em] text-primary/80">LEARN</span>
        </div>
        <h1 className="mt-3 text-[20px] font-bold tracking-[-0.02em] text-foreground leading-tight">Choose Your Path</h1>
        <p className="mt-1 text-[12px] text-muted-foreground/45 font-normal">Master topics, adaptive sprints &amp; timed mocks.</p>
      </header>

      {/* Outer glass card wrapping all content */}
      <div
        ref={cardRef}
        className="relative overflow-hidden rounded-3xl border backdrop-blur-xl px-5 pb-4 pt-5 transition-colors duration-500"
        style={{ borderColor: GLASS_BORDER, background: outerBg }}
      >
          <div ref={glowTopRef} className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-15 pointer-events-none transition-opacity duration-500" />
          <div ref={glowBottomRef} className="absolute bottom-0 left-0 w-32 h-32 rounded-full opacity-10 pointer-events-none transition-opacity duration-500" />

          {/* Tab mode selector — 3D push keys: active pops up, others sit flat/sunken */}
          <div className="relative -mx-5 -mt-5 mb-2 px-5 pt-4 pb-5">
            <div className="grid grid-cols-3 gap-2.5">
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
                        background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.7), transparent)",
                      }}
                    />
                    <div
                      className={`flex flex-col items-center justify-center gap-1.5 py-4 rounded-2xl transition-all duration-500 ease-out ${isActive ? "font-semibold" : "font-medium"}`}
                      style={
                        isActive
                          ? {
                              background: "linear-gradient(180deg, rgba(199,242,82,0.18), rgba(199,242,82,0.05))",
                              boxShadow:
                                "0 8px 18px rgba(0,0,0,0.4), 0 2px 4px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.35), inset 0 -2px 6px rgba(0,0,0,0.35)",
                            }
                          : {
                              background: "rgba(255,255,255,0.02)",
                              boxShadow: "inset 0 2px 4px rgba(0,0,0,0.5), inset 0 -1px 1px rgba(255,255,255,0.04)",
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
                        className="relative z-10 text-[11px] leading-none tracking-[0.02em] transition-colors duration-500 ease-out"
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
                        background: "radial-gradient(ellipse at center, rgba(0,0,0,0.5), transparent 70%)",
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
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        >
        <>
          {/* Exam Tabs */}
          <div className="rounded-3xl border backdrop-blur-xl p-4 mt-5" style={{ borderColor: GLASS_BORDER, background: GLASS_BG }}>
            <p className="text-[10px] font-semibold tracking-[0.18em] text-muted-foreground/40 uppercase mb-3">EXAM PREP</p>
            {prepExams.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-4 text-center">
                <span className="text-[12px] text-muted-foreground/50">No exam selected</span>
                <button
                  type="button"
                  onClick={() => setShowAddPrep(true)}
                  className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-[11px] font-bold text-[#0A0C0A] transition-all hover:opacity-90 active:scale-95"
                >
                  <Plus size={12} strokeWidth={3} /> Add Prep
                </button>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {prepExams.map((id) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => { setActiveDomain(id); setActiveLearnDomain(id); }}
                    className={cn(
                      "text-[11px] font-semibold rounded-full px-3.5 py-1.5 transition-all",
                      activeDomain === id
                        ? "bg-gradient-to-r from-primary to-[#a8e62e] text-primary-foreground shadow-[0_0_12px_rgba(199,242,82,0.25)]"
                        : "bg-white/[0.04] text-muted-foreground/50 border border-white/[0.06] hover:bg-white/[0.07]"
                    )}
                  >
                    {DOMAIN_LABELS[id]}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Topic Cards */}
          <div className="flex flex-col gap-3 mt-5">
            {topics.map((topic, i) => {
              const Icon = TOPIC_ICONS[topic.name] || Grid3x3;
              const color = TOPIC_COLORS[i % TOPIC_COLORS.length];
              return (
                <button
                  key={topic.name}
                  type="button"
                  onClick={() => router.push(`/dashboard/explorer?domain=${activeDomain}&topic=${encodeURIComponent(topic.name.toLowerCase())}`)}
                  className="group rounded-3xl border backdrop-blur-xl p-5 text-left transition-all hover:bg-white/[0.06] active:scale-[0.98]"
                  style={{ borderColor: GLASS_BORDER, background: GLASS_BG }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl flex items-center justify-center" style={{ background: `${color}15` }}>
                        <Icon size={16} style={{ color }} />
                      </div>
                      <h3 className="text-[14px] font-semibold tracking-[-0.01em] text-foreground">{topic.name}</h3>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-[13px] font-bold tracking-[-0.02em]" style={{ color }}>
                        {topic.value}%
                      </span>
                      <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/50">mastery</span>
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
              <div className="rounded-3xl border border-dashed border-white/[0.06] py-12 text-center" style={{ background: GLASS_BG }}>
                <BookOpen size={24} className="mx-auto text-muted-foreground/25 mb-3" />
                <p className="text-[13px] text-muted-foreground/45 font-normal">No topics yet. Add a prep to get started.</p>
              </div>
            )}
          </div>

          {/* Sensei Insight */}
          {topics.length > 0 && (
            <div className="relative rounded-3xl border backdrop-blur-xl p-5 mt-5 overflow-hidden" style={{ borderColor: GLASS_BORDER, background: "linear-gradient(135deg, rgba(59,130,246,0.06) 0%, rgba(255,255,255,0.03) 100%)" }}>
              <div className="absolute left-0 top-0 h-full w-[3px] bg-gradient-to-b from-[#3B82F6] to-[#22D3EE]" />
              <div className="flex items-center gap-2.5 mb-3">
                <div className="h-7 w-7 rounded-lg bg-[#3B82F6]/10 flex items-center justify-center">
                  <Sparkles size={14} className="text-[#3B82F6]" />
                </div>
                <p className="text-[10px] font-semibold tracking-[0.18em] text-[#3B82F6]/70 uppercase">SENSEI INSIGHT</p>
              </div>
              <p className="text-[13px] text-foreground/70 font-normal leading-relaxed pl-1 italic">
                &ldquo;{getInsight(topics)}&rdquo;
              </p>
            </div>
          )}

          {/* Explore Techniques */}
          {prepExams.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center rounded-3xl border border-dashed border-white/[0.08] mt-5" style={{ background: GLASS_BG }}>
              <span className="relative grid size-12 place-items-center rounded-2xl bg-white/[0.05] border border-white/[0.06]">
                <Lock size={16} className="text-muted-foreground/45" />
              </span>
              <span className="text-[13px] text-muted-foreground/50">Select an exam to explore techniques</span>
              <button
                type="button"
                onClick={() => setShowAddPrep(true)}
                className="mt-1 flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-[11px] font-bold text-[#0A0C0A] transition-all hover:opacity-90 active:scale-95"
              >
                <Plus size={12} strokeWidth={3} /> Add Prep
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => router.push("/dashboard/explorer")}
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
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        >
          {prepExams.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-10 text-center rounded-3xl border border-dashed border-white/[0.08]" style={{ background: GLASS_BG }}>
              <span className="relative grid size-12 place-items-center rounded-2xl bg-white/[0.05] border border-white/[0.06]">
                <Lock size={16} className="text-muted-foreground/45" />
              </span>
              <span className="text-[13px] text-muted-foreground/50">Select an exam first to practice</span>
              <button
                type="button"
                onClick={() => setShowAddPrep(true)}
                className="mt-1 flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-[11px] font-bold text-[#0A0C0A] transition-all hover:opacity-90 active:scale-95"
              >
                <Plus size={12} strokeWidth={3} /> Add Prep
              </button>
            </div>
          ) : (
            <div className="relative rounded-3xl border border-dashed border-white/[0.08] py-16 text-center px-6" style={{ background: GLASS_BG }}>
              <div className="absolute inset-0 opacity-[0.06]" style={{ background: `radial-gradient(circle at top right, ${activeMode.color}, transparent 75%)` }} />
              <div className="size-14 rounded-2xl mx-auto flex items-center justify-center mb-4" style={{ background: `${activeMode.color}15` }}>
                <activeMode.Icon size={24} style={{ color: activeMode.color }} />
              </div>
              <p className="text-[15px] font-bold tracking-[-0.01em] text-foreground">Coming soon</p>
              <p className="text-[12px] text-muted-foreground/45 mt-1.5 max-w-[260px] mx-auto leading-relaxed font-normal">
                {activeMode.label} is being built. It&apos;ll land right here in the Learn tab.
              </p>
            </div>
          )}
        </motion.div>
        )}

        {mode === "mock" && (
        <motion.div
          key="mock"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Header */}
          <div className="relative mb-5">
            <h2 className="text-[20px] font-bold tracking-[-0.02em] text-foreground">
              {DOMAIN_LABELS[activeDomain] || "Mock"} <span className="bg-gradient-to-r from-primary to-[#d4ff6e] bg-clip-text text-transparent">Papers</span>
            </h2>
            <p className="mt-1 text-[12px] text-muted-foreground/45 font-normal">Full-length and sectional timed tests.</p>
          </div>

          {/* Exam switcher — sliding segmented control */}
          {prepExams.length > 1 && (
            <div className="relative mt-2 mb-5">
              <div
                className="relative flex gap-1 p-1 overflow-x-auto rounded-3xl border [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)" }}
              >
                {prepExams.map((id) => {
                  const active = activeDomain === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setActiveDomain(id)}
                      className="relative flex-1 flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl px-4 py-3 text-[11px] font-bold uppercase tracking-wider outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      style={{ color: active ? "#0A0C0A" : "rgba(255,255,255,0.55)" }}
                    >
                      {active && (
                        <motion.div
                          layoutId="mock-exam-slider"
                          transition={{ type: "spring", stiffness: 400, damping: 32 }}
                          className="absolute inset-0 rounded-2xl"
                          style={{ background: "linear-gradient(180deg, #d7ff7e, #a8e62e)", boxShadow: "0 6px 16px -4px rgba(199,242,82,0.4)" }}
                        />
                      )}
                      <span className="relative flex items-center gap-2 transition-colors duration-300" style={{ textShadow: active ? "0 1px 0 rgba(255,255,255,0.35)" : "none" }}>
                        <GraduationCap size={14} className="relative" />
                        <span className="relative">{DOMAIN_LABELS[id] ?? id}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Stats card */}
          <div className="relative rounded-3xl border backdrop-blur-xl mt-5 overflow-hidden" style={{ borderColor: GLASS_BORDER, background: GLASS_BG }}>
            <div className="absolute -top-10 -right-10 size-32 rounded-full opacity-[0.07] pointer-events-none" style={{ background: `radial-gradient(circle, ${activeMode.color}, transparent 70%)` }} />

            <button
              type="button"
              onClick={() => setStatsCollapsed((v) => !v)}
              className="w-full flex items-center justify-between gap-2 px-5 py-4 outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-expanded={!statsCollapsed}
            >
              <span className="text-[10px] font-semibold tracking-[0.18em] text-muted-foreground/40 uppercase">Your Stats</span>
              <span className="grid size-6 place-items-center rounded-full border border-white/[0.07] text-muted-foreground/50">
                <ChevronUp size={12} className="transition-transform duration-300" style={{ transform: statsCollapsed ? "rotate(180deg)" : "none" }} />
              </span>
            </button>

            <div
              className={cn(
                "grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
                statsCollapsed ? "grid-rows-[0fr]" : "grid-rows-[1fr]",
              )}
            >
              <div className="overflow-hidden min-h-0">
                <div className="px-5 pb-5">
                  {prepExams.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 py-6 text-center">
                      <span className="relative grid size-12 place-items-center rounded-2xl bg-white/[0.05] border border-white/[0.06]">
                        <Lock size={16} className="text-muted-foreground/45" />
                      </span>
                      <span className="text-[12px] text-muted-foreground/50">Select a prep to view your progress</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2.5">
                      <StatBox value={mockStats.accuracy} label="Accuracy" />
                      <StatBox value={mockStats.questions} label="Questions" />
                      <StatBox value={mockStats.percentile} label="Percentile" />
                      <StatBox value={mockStats.speed} label="Speed" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section filter chips */}
          {(() => {
            const sectionSet = new Set<string>();
            (mockPapers ?? []).forEach((p) => p.sections.forEach((s) => sectionSet.add(s.label)));
            const sections = ["all", ...Array.from(sectionSet)];
            return (
              <div className="flex items-center gap-2 overflow-x-auto mt-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {sections.map((sec) => (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => setMockSection(sec)}
                    className={cn(
                      "shrink-0 rounded-full px-3.5 py-1.5 text-[11px] font-semibold transition-all",
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
          <div className="flex flex-col gap-3 mt-5">
            {mockLoading && (
              <div className="flex flex-col gap-3">
                {[0, 1].map((i) => (
                  <div key={i} className="rounded-3xl border backdrop-blur-xl p-5 animate-pulse" style={{ borderColor: GLASS_BORDER, background: GLASS_BG }}>
                    <div className="h-4 w-2/3 rounded bg-white/[0.06] mb-3" />
                    <div className="h-3 w-1/2 rounded bg-white/[0.04]" />
                  </div>
                ))}
              </div>
            )}

            {!mockLoading && (mockPapers ?? [])
              .filter((p) => mockSection === "all" || p.sections.some((s) => s.label === mockSection))
              .map((paper) => (
                <div
                  key={paper.id}
                  className="group rounded-3xl border backdrop-blur-xl p-5 transition-all hover:bg-white/[0.05]"
                  style={{ borderColor: GLASS_BORDER, background: GLASS_BG }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="size-8 shrink-0 rounded-lg grid place-items-center" style={{ background: `${paper.accent}1a` }}>
                          <FileText size={14} style={{ color: paper.accent }} />
                        </div>
                        <h3 className="text-[13.5px] font-semibold tracking-[-0.01em] text-foreground leading-snug">{paper.title}</h3>
                      </div>
                    </div>
                    <div className="shrink-0 grid size-7 place-items-center rounded-full border border-white/[0.07] text-muted-foreground/50">
                      <ArrowRight size={12} />
                    </div>
                  </div>

                  <p className="text-[10px] text-muted-foreground/50 mt-3 font-normal">
                    {paper.sections.map((s) => s.label).join(" | ")} • {paper.totalQuestions} Questions • {formatDuration(paper.durationMinutes)}
                  </p>

                  <div className="flex items-center justify-between mt-4 gap-3">
                    <div className="flex flex-wrap gap-1.5">
                      {paper.sections.map((s) => (
                        <span key={s.id} className="text-[9px] font-bold px-2 py-0.5 rounded-full border border-white/[0.07]" style={{ color: paper.accent, background: `${paper.accent}0d` }}>
                          {s.label} · {s.questions}
                        </span>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => router.push(`/dashboard/mock/run?paper=${paper.id}&domain=${activeDomain}`)}
                      className="shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-primary to-[#a8e62e] px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-[#0A0C0A] transition-transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <Play size={12} strokeWidth={2.5} /> Take Test
                    </button>
                  </div>
                </div>
              ))}

            {!mockLoading && (mockPapers ?? []).length === 0 && (
              <div className="rounded-3xl border border-dashed border-white/[0.06] py-12 text-center" style={{ background: GLASS_BG }}>
                <FileText size={24} className="mx-auto text-muted-foreground/25 mb-3" />
                <p className="text-[13px] text-muted-foreground/45 font-normal">No papers yet for {DOMAIN_LABELS[activeDomain] || "this exam"}.</p>
                <button
                  type="button"
                  onClick={() => setShowAddPrep(true)}
                  className="mt-4 text-[11px] font-bold uppercase tracking-wider text-primary"
                >
                  Add a prep
                </button>
              </div>
            )}
          </div>
        </motion.div>
        )}
      </AnimatePresence>

      {showAddPrep && (
        <AddPrepModal onClose={() => setShowAddPrep(false)} />
      )}
      </div>
    </div>
  );
}

export default function LearnPage() {
  return (
    <Suspense fallback={null}>
      <LearnPageContent />
    </Suspense>
  );
}

function StatBox({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-3.5">
      <div className="flex items-center justify-between">
        <span className="size-1.5 rounded-full bg-primary/70" />
        <ArrowRight size={10} className="text-muted-foreground/40" />
      </div>
      <div className="mt-2.5 text-[20px] font-bold tracking-[-0.03em] text-foreground leading-none">{value}</div>
      <div className="mt-1.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/45">{label}</div>
    </div>
  );
}
