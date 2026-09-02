"use client";

import { useState, useRef, useLayoutEffect } from "react";
import { animate } from "motion";
import { useRouter } from "next/navigation";
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
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePageMeta } from "@/hooks/use-page-meta";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { useDashboardData } from "@/hooks/queries/use-dashboard";
import { DOMAIN_LABELS } from "@/lib/types/template";
import { AddPrepModal } from "@/components/learn/add-prep-modal";

const GLASS_BG = "rgba(255,255,255,0.04)";
const GLASS_BORDER = "rgba(255,255,255,0.08)";

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

const CURVE_WIDTH = 14;
const BOTTOM_INSET = 5;

function buildTabPath(left: number, width: number, top: number, base: number, fullWidth: number) {
  const right = left + width;
  const leftFoot = Math.max(0, left - CURVE_WIDTH);
  const rightFoot = Math.min(fullWidth, right + CURVE_WIDTH);
  const lc = Math.max(0, left - CURVE_WIDTH / 2);
  const rc = Math.min(fullWidth, right + CURVE_WIDTH / 2);
  return `M0,${base} L${leftFoot},${base} C${lc},${base} ${lc},${top} ${left},${top} L${right},${top} C${rc},${top} ${rc},${base} ${rightFoot},${base} L${fullWidth},${base}`;
}

function buildTabFill(left: number, width: number, top: number, base: number, fullWidth: number) {
  const right = left + width;
  const lc = Math.max(0, left - CURVE_WIDTH / 2);
  const rc = Math.min(fullWidth, right + CURVE_WIDTH / 2);
  const leftFoot = Math.max(0, left - CURVE_WIDTH);
  const rightFoot = Math.min(fullWidth, right + CURVE_WIDTH);
  return `M${leftFoot},${base} C${lc},${base} ${lc},${top} ${left},${top} L${right},${top} C${rc},${top} ${rc},${base} ${rightFoot},${base} L${leftFoot},${base} Z`;
}

export default function LearnPage() {
  usePageMeta("Learn — Exam Arena");
  const router = useRouter();
  const targetExam = useOnboardingStore((s) => s.targetExam);
  const [mode, setMode] = useState<Mode>("explore");
  const [activeDomain, setActiveDomain] = useState(targetExam || "cat");
  const [showAddPrep, setShowAddPrep] = useState(false);
  const { data } = useDashboardData(activeDomain);
  const topics = data?.topics ?? [];

  const activeMode = MODES.find((m) => m.id === mode)!;
  const outerBg = "linear-gradient(180deg, rgba(20,23,15,0.9) 0%, rgba(10,12,10,0.85) 100%)";

  const tabRowRef = useRef<HTMLDivElement | null>(null);
  const tabBtnRefs = useRef<Record<Mode, HTMLButtonElement | null>>({
    explore: null,
    adaptive: null,
    mock: null,
  });
  const tabPathRef = useRef<SVGPathElement | null>(null);
  const tabFillRef = useRef<SVGPathElement | null>(null);
  const tabCurrentRef = useRef({ left: 0, width: 0 });
  const tabMotionRef = useRef<ReturnType<typeof animate> | null>(null);

  const measureTab = (tab: Mode) => {
    const btn = tabBtnRefs.current[tab];
    if (!btn) return { left: 0, width: 0 };
    return { left: btn.offsetLeft, width: btn.offsetWidth };
  };

  const drawTabPath = (left: number, width: number) => {
    const row = tabRowRef.current;
    if (!row) return;
    const base = row.clientHeight - BOTTOM_INSET;
    const curveTop = Math.max(0, row.clientHeight - 40);
    const full = row.clientWidth;
    if (tabPathRef.current) {
      tabPathRef.current.setAttribute(
        "d",
        buildTabPath(left, width, curveTop, base, full),
      );
    }
    if (tabFillRef.current) {
      tabFillRef.current.setAttribute(
        "d",
        buildTabFill(left, width, curveTop, base, full),
      );
    }
  };

  useLayoutEffect(() => {
    const target = measureTab(mode);
    tabCurrentRef.current = target;
    drawTabPath(target.left, target.width);
    return () => tabMotionRef.current?.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goTo = (tab: Mode) => {
    if (tab === mode) return;
    const from = tabCurrentRef.current;
    const to = measureTab(tab);
    setMode(tab);

    tabMotionRef.current?.stop();
    tabMotionRef.current = animate(0, 1, {
      type: "spring",
      stiffness: 380,
      damping: 32,
      onUpdate: (t) => {
        const left = from.left + (to.left - from.left) * t;
        const width = from.width + (to.width - from.width) * t;
        tabCurrentRef.current = { left, width };
        drawTabPath(left, width);
      },
      onComplete: () => {
        tabCurrentRef.current = to;
        drawTabPath(to.left, to.width);
      },
    });
  };

  return (
    <div className="min-h-screen max-w-5xl mx-auto px-5 pt-6 pb-6">
      {/* Page header — matches app pattern */}
      <header className="mb-5">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.04] backdrop-blur-sm px-4 py-1.5">
          <BookOpen size={12} className="text-primary" />
          <span className="text-[10px] font-semibold tracking-[0.22em] text-primary/80">LEARN</span>
        </div>
        <h1 className="mt-3 text-[20px] font-bold tracking-[-0.02em] text-foreground leading-tight">Choose Your path</h1>
        <p className="mt-1 text-[12px] text-muted-foreground/45 font-normal">Master topics, adaptive sprints &amp; timed mocks.</p>
      </header>

      {/* Outer glass card wrapping all content */}
      <div
        className="relative overflow-hidden rounded-3xl border backdrop-blur-xl px-5 pt-4 pb-4 transition-colors duration-500"
        style={{ borderColor: GLASS_BORDER, background: outerBg }}
      >
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-15 pointer-events-none transition-opacity duration-500" style={{ background: `radial-gradient(circle, ${activeMode.color}33, transparent)` }} />
          <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full opacity-10 pointer-events-none transition-opacity duration-500" style={{ background: `radial-gradient(circle, ${activeMode.color}44, transparent)` }} />

          {/* Tab mode selector — S-curve underline animates between tabs */}
          <div ref={tabRowRef} className="relative mt-3 mb-2">
            <svg
              className="absolute inset-0 pointer-events-none"
              width="100%"
              height="100%"
              aria-hidden="true"
              focusable="false"
            >
              <path
                ref={tabFillRef}
                fill="#0A0C0A"
                fillOpacity="1"
                style={{ filter: "drop-shadow(0 6px 14px rgba(0,0,0,0.7))" }}
              />
              <path
                ref={tabPathRef}
                fill="none"
                stroke="#ffffff"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ filter: "drop-shadow(0 0 4px rgba(255,255,255,0.5))" }}
              />
            </svg>
            <div className="grid grid-cols-3 gap-2">
              {MODES.map((m) => {
                const isActive = m.id === mode;
                return (
                  <button
                    key={m.id}
                    ref={(el) => { tabBtnRefs.current[m.id] = el; }}
                    type="button"
                    onClick={() => goTo(m.id)}
                    className="relative flex items-center justify-center py-4"
                  >
                    <span
                      className="relative z-10 text-[11px] font-semibold leading-none transition-colors duration-300"
                      style={{
                        color: isActive ? "#ffffff" : "rgba(255,255,255,0.55)",
                        textShadow: isActive ? `0 0 10px ${m.color}66` : "none",
                      }}
                    >
                      {m.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

      {mode === "explore" && (
        <>
          {/* Add Prep CTA */}
          <button
            type="button"
            onClick={() => setShowAddPrep(true)}
            className="w-full rounded-2xl border border-primary/20 bg-primary/5 backdrop-blur-xl py-3.5 min-h-[44px] flex items-center justify-center gap-2 text-[13px] font-semibold tracking-widest uppercase text-primary transition-all hover:bg-primary/[0.08] hover:border-primary/35 active:scale-[0.98] outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Plus size={15} strokeWidth={2.5} />
            ADD PREP
          </button>

          {/* Exam Tabs */}
          <div className="rounded-3xl border backdrop-blur-xl p-4 mt-5" style={{ borderColor: GLASS_BORDER, background: GLASS_BG }}>
            <p className="text-[10px] font-semibold tracking-[0.18em] text-muted-foreground/40 uppercase mb-3">EXAM PREP</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(DOMAIN_LABELS).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveDomain(id)}
                  className={cn(
                    "text-[11px] font-semibold rounded-full px-3.5 py-1.5 transition-all",
                    activeDomain === id
                      ? "bg-gradient-to-r from-primary to-[#a8e62e] text-primary-foreground shadow-[0_0_12px_rgba(199,242,82,0.25)]"
                      : "bg-white/[0.04] text-muted-foreground/50 border border-white/[0.06] hover:bg-white/[0.07]"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
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
                  onClick={() => router.push("/dashboard/explorer")}
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
                    <span className="text-[13px] font-bold tracking-[-0.02em]" style={{ color }}>
                      {topic.value}%
                    </span>
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
          <button
            type="button"
            onClick={() => router.push("/dashboard/explorer")}
            className="w-full mt-5 rounded-3xl border backdrop-blur-xl py-4 flex items-center justify-center gap-2 text-[13px] font-semibold text-foreground/70 transition-all hover:bg-white/[0.06] active:scale-[0.98]"
            style={{ borderColor: GLASS_BORDER, background: GLASS_BG }}
          >
            EXPLORE TECHNIQUES
            <ArrowRight size={14} />
          </button>
        </>
      )}

      {(mode === "adaptive" || mode === "mock") && (
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

      {showAddPrep && (
        <AddPrepModal onClose={() => setShowAddPrep(false)} />
      )}
      </div>
    </div>
  );
}
