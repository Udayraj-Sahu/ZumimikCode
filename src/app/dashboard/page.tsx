"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import {
  Play,
  Clock,
  Zap,
  Award,
  ChevronDown,
  ChevronRight,
  Target,
  Calendar,
  Users,
  ShoppingBag,
  Rss,
  Home,
  Plus,
  ArrowUpRight,
  Radio,
  Flame,
  BookOpen,
  User,
  Sparkles,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDashboardData } from "@/hooks/queries/use-dashboard";
import { usePageMeta } from "@/hooks/use-page-meta";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { DOMAIN_LABELS } from "@/lib/types/template";
import { OnboardingModal } from "@/components/onboarding/onboarding-modal";

const ACCENT = "#C7F252";
const GLASS_BG = "rgba(255,255,255,0.04)";
const GLASS_BORDER = "rgba(255,255,255,0.08)";

const FALLBACK_TOPICS = [
  { name: "Quantitative Aptitude", value: 92, color: "primary" as const },
  { name: "Logical Reasoning", value: 78, color: "primary" as const },
  { name: "Data Interpretation", value: 85, color: "primary" as const },
  { name: "Verbal Ability", value: 64, color: "primary" as const },
  { name: "General Knowledge", value: 41, color: "primary" as const },
];

const FALLBACK_RADAR = [
  { label: "SPEED", value: 0.95 },
  { label: "LOGIC", value: 0.85 },
  { label: "STAMINA", value: 0.8 },
  { label: "FOCUS", value: 0.9 },
  { label: "MEMORY", value: 0.75 },
  { label: "REFLEX", value: 0.88 },
];

const FALLBACK_STATS = { accuracy: 87, questions: 1247, percentile: 64, speed: 47 };
const FALLBACK_STREAK = { current: 6, xp: 2340, days: [true, true, true, false, true, true, false], labels: ["M", "T", "W", "T", "F", "S", "S"] };
const FALLBACK_UPCOMING = [
  { title: "LRDI Sprint", time: "Today, 8PM", tag: "LIVE" },
  { title: "Mock CAT #7", time: "Thu, 10AM", tag: "MOCK" },
  { title: "VA Sectional", time: "Sat, 3PM", tag: "GROUP" },
];
const FALLBACK_LEADERBOARD = [
  { rank: 1, name: "Priya S.", xp: 4820 },
  { rank: 2, name: "Arjun M.", xp: 4310 },
  { rank: 3, name: "Rohan K.", xp: 3990 },
  { rank: 47, name: "You", xp: 2340, me: true },
];
const FALLBACK_RECENT = [
  { label: "LR Sprint", score: "22/25", time: "2h ago" },
  { label: "Quant Set #14", score: "18/20", time: "Yesterday" },
  { label: "Full CAT Mock", score: "142/300", time: "2d ago" },
];

const QUICK_ACCESS_ROW1 = [
  { label: "Exam Prep", icon: Target, color: "#7C6CF0", bg: "rgba(124,108,240,0.12)", href: "/dashboard/learn" },
  { label: "Skill Build", icon: Zap, color: "#3DD6F5", bg: "rgba(61,214,245,0.12)", href: "/dashboard/mastery" },
  { label: "Train Plan", icon: Calendar, color: "#B98CF0", bg: "rgba(185,140,240,0.12)", href: "/dashboard/planner" },
  { label: "Clubs", icon: Users, color: "#F0A93D", bg: "rgba(240,169,61,0.12)", href: "/dashboard/clubs" },
];

const QUICK_ACCESS_ROW2 = [
  { label: "Store", icon: ShoppingBag, color: "#F05C7A", bg: "rgba(240,92,122,0.12)", href: "/dashboard" },
  { label: "Feed", icon: Rss, color: "#7DDB6A", bg: "rgba(125,219,106,0.12)", href: "/dashboard/feed" },
  { label: "Family", icon: Home, color: "#F05C7A", bg: "rgba(240,92,122,0.12)", href: "/dashboard" },
];

/* ------------------------------------------------------------------ */
/*  Radar Chart                                                         */
/* ------------------------------------------------------------------ */
function RadarChart({ axes, values, size = 280 }: { axes: string[]; values: number[]; size?: number }) {
  const center = size / 2;
  const radius = size * 0.34;
  const n = axes.length;

  const pointFor = (i: number, r: number) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    return { x: center + r * Math.cos(angle), y: center + r * Math.sin(angle) };
  };

  const rings = [0.25, 0.5, 0.75, 1];
  const dataPoints = values.map((v, i) => pointFor(i, radius * v));
  const dataPath = dataPoints.map((p) => `${p.x},${p.y}`).join(" ") + ` ${dataPoints[0].x},${dataPoints[0].y}`;

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width="100%" height="auto">
      <defs>
        <linearGradient id="radarFill" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={ACCENT} stopOpacity={0.3} />
          <stop offset="100%" stopColor={ACCENT} stopOpacity={0.08} />
        </linearGradient>
      </defs>
      {rings.map((r, idx) => {
        const pts = axes.map((_, i) => { const p = pointFor(i, radius * r); return `${p.x},${p.y}`; }).join(" ");
        return <polygon key={idx} points={pts} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={0.8} />;
      })}
      {axes.map((_, i) => {
        const p = pointFor(i, radius);
        return <line key={i} x1={center} y1={center} x2={p.x} y2={p.y} stroke="rgba(255,255,255,0.06)" strokeWidth={0.8} />;
      })}
      <polygon points={dataPath} fill="url(#radarFill)" stroke={ACCENT} strokeWidth={2} strokeLinejoin="round" />
      {dataPoints.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={4} fill={ACCENT} stroke="rgba(0,0,0,0.3)" strokeWidth={1.5} />)}
      {axes.map((label, i) => {
        const p = pointFor(i, radius + 26);
        return <text key={label} x={p.x} y={p.y} fill="#9CA3AF" fontSize={11} fontWeight={700} letterSpacing={1} textAnchor="middle" dominantBaseline="middle">{label}</text>;
      })}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Section heading                                                     */
/* ------------------------------------------------------------------ */
function SectionHeading({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h3 className={cn("text-[17px] font-semibold tracking-[-0.02em] text-foreground/90", className)}>
      {children}
    </h3>
  );
}

function SectionLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn("text-[10px] font-semibold tracking-[0.18em] text-muted-foreground/40 uppercase", className)}>
      {children}
    </p>
  );
}

/* ------------------------------------------------------------------ */
/*  Main page                                                           */
/* ------------------------------------------------------------------ */
export default function DashboardPage() {
  usePageMeta("Dashboard — Exam Arena");
  const router = useRouter();
  const firstName = useOnboardingStore((s) => s.firstName);
  const isOnboarded = useOnboardingStore((s) => s.isOnboarded);
  const targetExam = useOnboardingStore((s) => s.targetExam);
  const { data } = useDashboardData(targetExam);

  const [statsOpen, setStatsOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const modalShownRef = useRef(false);

  useEffect(() => {
    if (modalShownRef.current) return;
    if (!isOnboarded || !firstName) {
      modalShownRef.current = true;
      setShowOnboarding(true);
    }
  }, [isOnboarded, firstName]);

  const topics = data?.topics ?? FALLBACK_TOPICS;
  const radarAxes = data?.radarAxes ?? FALLBACK_RADAR;
  const stats = data?.stats ?? FALLBACK_STATS;
  const streak = data?.streak ?? FALLBACK_STREAK;
  const upcoming = data?.upcoming ?? FALLBACK_UPCOMING;
  const leaderboard = data?.leaderboard ?? FALLBACK_LEADERBOARD;
  const recent = data?.recent ?? FALLBACK_RECENT;

  const radarLabels = radarAxes.map((a) => a.label);
  const radarValues = radarAxes.map((a) => a.value);

  const displayName = firstName || "Champion";
  const examLabel = DOMAIN_LABELS[targetExam] ?? "Exam";

  const animateSection = useCallback((el: HTMLDivElement | null) => {
    if (!el || el.dataset.animated) return;
    el.dataset.animated = "true";
    const i = parseInt(el.dataset.sectionIndex || "0");
    gsap.fromTo(el, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.45, delay: i * 0.06, ease: "power3.out" });
  }, []);

  return (
    <div className="min-h-screen pb-28">

      {/* Ambient glow behind header */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full opacity-20" style={{ background: "radial-gradient(circle, rgba(199,242,82,0.25) 0%, transparent 70%)" }} />

      {/* Header */}
      <div ref={animateSection} data-section-index={0} className="relative px-6 pt-8 pb-2 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.04] backdrop-blur-sm px-4 py-1.5 mb-4">
          <Sparkles size={12} className="text-primary" />
          <span className="text-[11px] font-semibold tracking-[0.22em] text-primary/80">EXAM ARENA</span>
        </div>
        <h1 className="text-[28px] font-bold tracking-[-0.03em] text-foreground leading-[1.15]">
          Welcome back,<br />
          <span className="bg-gradient-to-r from-primary via-[#d4ff6e] to-primary bg-clip-text text-transparent">{displayName}</span>
        </h1>
        <p className="mt-2 text-[13px] text-muted-foreground/45 font-normal tracking-[0.01em]">{examLabel} Prep</p>

        <div className="mt-5 flex items-center justify-center gap-3">
          <div className="flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.04] backdrop-blur-md px-4 py-2.5">
            <Flame size={15} className="text-[#FF6B35]" strokeWidth={2.5} />
            <span className="text-[13px] font-semibold tracking-[-0.01em] text-[#FF6B35]">{streak.current} Day</span>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.04] backdrop-blur-md px-4 py-2.5">
            <Zap size={15} className="text-primary" strokeWidth={2.5} />
            <span className="text-[13px] font-semibold tracking-[-0.01em] text-primary">{streak.xp.toLocaleString()} XP</span>
          </div>
        </div>
      </div>

      {/* Your Stats — collapsible */}
      <div ref={animateSection} data-section-index={1} className="px-5 mt-6">
        <button
          type="button"
          onClick={() => setStatsOpen((v) => !v)}
          className="w-full flex items-center justify-between rounded-2xl border backdrop-blur-xl px-5 py-4 transition-all hover:bg-white/[0.06]"
          style={{ borderColor: GLASS_BORDER, background: GLASS_BG }}
        >
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <TrendingUp size={16} className="text-primary" />
            </div>
            <span className="text-[13px] font-semibold tracking-[-0.01em] text-foreground">YOUR STATS</span>
          </div>
          <ChevronDown
            size={16}
            className={cn("text-muted-foreground/40 transition-transform duration-200", statsOpen && "rotate-180")}
          />
        </button>
        {statsOpen && (
          <div className="grid grid-cols-2 gap-3 mt-3">
            {[
              { label: "Accuracy", value: `${stats.accuracy}%`, icon: Target },
              { label: "Questions", value: stats.questions.toLocaleString(), icon: BookOpen },
              { label: "Percentile", value: `${stats.percentile}%ile`, icon: Award },
              { label: "Speed", value: `${stats.speed}s avg`, icon: Zap },
            ].map((s) => (
              <button
                key={s.label}
                type="button"
                onClick={() => router.push("/dashboard/analytics")}
                className="group rounded-2xl border backdrop-blur-xl px-4 py-4 text-left transition-all hover:bg-white/[0.06] active:scale-[0.97]"
                style={{ borderColor: GLASS_BORDER, background: GLASS_BG }}
              >
                <div className="flex items-center justify-between mb-2.5">
                  <s.icon size={14} className="text-primary/60" />
                  <ArrowUpRight size={12} className="text-muted-foreground/20 group-hover:text-primary/60 transition-colors" />
                </div>
                <p className="text-[20px] font-bold tracking-[-0.03em] text-foreground">{s.value}</p>
                <p className="text-[10px] font-semibold tracking-[0.14em] text-muted-foreground/35 mt-1.5 uppercase">{s.label}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* This Week — label + circles in one row */}
      <div ref={animateSection} data-section-index={2} className="px-5 mt-5">
        <div className="flex items-center gap-3 rounded-2xl border backdrop-blur-xl px-4 py-4 overflow-hidden" style={{ borderColor: GLASS_BORDER, background: GLASS_BG }}>
          <span className="text-[10px] font-semibold tracking-[0.18em] text-muted-foreground/35 shrink-0 uppercase">This Week</span>
          <div className="flex items-center gap-[6px] flex-1 justify-end">
            {streak.labels.map((day, i) => {
              const done = streak.days[i];
              return (
                <div
                  key={i}
                  className={cn(
                    "h-8 w-8 rounded-full flex items-center justify-center text-[10px] font-bold border shrink-0 transition-all",
                    done ? "shadow-[0_0_12px_rgba(199,242,82,0.3)]" : ""
                  )}
                  style={{
                    background: done ? `linear-gradient(135deg, ${ACCENT}, #a8e62e)` : "rgba(255,255,255,0.03)",
                    color: done ? "#0A0C08" : "#4B5563",
                    borderColor: done ? "transparent" : "rgba(255,255,255,0.06)",
                  }}
                >
                  {day}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Complete Account Details */}
      {!isOnboarded && (
        <div ref={animateSection} data-section-index={2.5} className="px-5 mt-4">
          <button
            type="button"
            onClick={() => setShowOnboarding(true)}
            className="w-full rounded-2xl border border-dashed border-primary/20 backdrop-blur-xl px-5 py-4 text-left transition-all hover:border-primary/40 hover:bg-white/[0.03] active:scale-[0.98]"
          >
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <Sparkles size={16} className="text-primary" />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-primary tracking-[-0.01em]">Complete your account details</p>
                <p className="text-[12px] text-muted-foreground/35 mt-0.5 font-normal">Set your goals &amp; targets for a personalized experience</p>
              </div>
            </div>
          </button>
        </div>
      )}

      {/* Practice Mode */}
      <div ref={animateSection} data-section-index={3} className="px-5 mt-5">
        <div className="relative overflow-hidden rounded-3xl border backdrop-blur-xl p-5" style={{ borderColor: GLASS_BORDER, background: "linear-gradient(135deg, rgba(139,92,246,0.06) 0%, rgba(255,255,255,0.03) 100%)" }}>
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-20" style={{ background: "radial-gradient(circle, rgba(139,92,246,0.3), transparent)" }} />
          <SectionLabel className="text-[#800080]">PRACTICE MODE</SectionLabel>
          <h2 className="relative mt-2 text-[22px] font-bold tracking-[-0.03em] text-foreground leading-tight">Master with templates</h2>
          <p className="relative mt-1.5 text-[13px] text-muted-foreground/45 font-normal">Guided exercises · Step-by-step · Build speed &amp; accuracy</p>
          <div className="relative mt-5 flex items-center justify-between">
            <button
              type="button"
              onClick={() => router.push("/dashboard/practice")}
              className="flex items-center gap-2.5 rounded-full px-6 py-3 text-[13px] font-semibold tracking-[-0.01em] bg-gradient-to-r from-[#8B5CF6] to-[#A78BFA] text-white shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all hover:shadow-[0_0_30px_rgba(139,92,246,0.45)] active:scale-95"
            >
              <Play size={15} fill="currentColor" />
              PRACTICE NOW
            </button>
            <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground/35 font-normal">
              <Clock size={12} />
              5–15 min each
            </div>
          </div>
        </div>
      </div>

      {/* Technique Library */}
      <div ref={animateSection} data-section-index={4} className="px-5 mt-4">
        <div className="relative overflow-hidden rounded-3xl border backdrop-blur-xl p-5" style={{ borderColor: GLASS_BORDER, background: "linear-gradient(135deg, rgba(124,108,240,0.06) 0%, rgba(255,255,255,0.03) 100%)" }}>
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-20" style={{ background: "radial-gradient(circle, rgba(124,108,240,0.3), transparent)" }} />
          <SectionLabel>TECHNIQUE LIBRARY</SectionLabel>
          <h2 className="relative mt-2 text-[22px] font-bold tracking-[-0.03em] text-foreground leading-tight">Learn a technique</h2>
          <p className="relative mt-1.5 text-[13px] text-muted-foreground/45 font-normal">Browse core methods · Visual breakdowns · Master each approach</p>
          <div className="relative mt-5 flex items-center justify-between">
            <button
              type="button"
              onClick={() => router.push("/dashboard/explorer")}
              className="flex items-center gap-2 rounded-full border border-[#7C6CF0]/30 bg-[#7C6CF0]/10 backdrop-blur-sm px-6 py-3 text-[13px] font-semibold tracking-[-0.01em] text-[#7C6CF0] transition-all hover:bg-[#7C6CF0]/15 active:scale-95"
            >
              EXPLORE TECHNIQUES
            </button>
            <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground/35 font-normal">
              <Clock size={12} />
              5–15 min each
            </div>
          </div>
        </div>
      </div>

      {/* Quick Access */}
      <div ref={animateSection} data-section-index={5} className="px-5 mt-6">
        <div className="rounded-3xl border backdrop-blur-xl p-5" style={{ borderColor: GLASS_BORDER, background: GLASS_BG }}>
          <SectionLabel>QUICK ACCESS</SectionLabel>
          <div className="grid grid-cols-4 gap-3 mt-4">
            {QUICK_ACCESS_ROW1.map((q) => (
              <button
                key={q.label}
                type="button"
                onClick={() => router.push(q.href)}
                className="group flex flex-col items-center gap-2.5 rounded-2xl border border-white/[0.04] bg-[#0a0a0a] backdrop-blur-sm py-4 transition-all hover:bg-[#111] active:scale-95"
              >
                <div className="h-11 w-11 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110" style={{ background: q.bg }}>
                  <q.icon size={18} color={q.color} />
                </div>
                <span className="text-[10px] font-semibold text-foreground/65 text-center leading-tight tracking-[0.01em]">{q.label}</span>
              </button>
            ))}
          </div>
          <div className="grid grid-cols-4 gap-3 mt-3">
            {QUICK_ACCESS_ROW2.map((q) => (
              <button
                key={q.label}
                type="button"
                onClick={() => router.push(q.href)}
                className="group flex flex-col items-center gap-2.5 rounded-2xl border border-white/[0.04] bg-[#0a0a0a] backdrop-blur-sm py-4 transition-all hover:bg-[#111] active:scale-95"
              >
                <div className="h-11 w-11 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110" style={{ background: q.bg }}>
                  <q.icon size={18} color={q.color} />
                </div>
                <span className="text-[10px] font-semibold text-foreground/65 text-center leading-tight tracking-[0.01em]">{q.label}</span>
              </button>
            ))}
            <div className="flex flex-col items-center justify-center gap-2.5 rounded-2xl border border-dashed border-white/[0.08] bg-white/[0.02] py-4 opacity-40">
              <div className="h-11 w-11 rounded-2xl flex items-center justify-center border border-dashed border-white/10">
                <Plus size={16} className="text-muted-foreground" />
              </div>
              <span className="text-[10px] font-semibold text-muted-foreground text-center leading-tight tracking-[0.01em]">Coming Soon</span>
            </div>
          </div>
        </div>
      </div>

      {/* Topic Mastery */}
      <div ref={animateSection} data-section-index={6} className="px-5 mt-6">
        <div className="rounded-3xl border backdrop-blur-xl p-5" style={{ borderColor: GLASS_BORDER, background: GLASS_BG }}>
          <div className="flex items-center justify-between mb-5">
            <SectionHeading>Topic mastery</SectionHeading>
            <button
              type="button"
              onClick={() => router.push("/dashboard/mastery")}
              className="flex items-center gap-1.5 text-[13px] font-semibold text-primary transition-all hover:gap-2.5"
            >
              View all <ArrowUpRight size={13} />
            </button>
          </div>
          <div className="flex flex-col gap-4">
            {topics.map((t) => (
              <div key={t.name}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[13px] text-muted-foreground/55 font-normal tracking-[0.01em]">{t.name}</span>
                  <span className="text-[13px] font-bold text-primary tracking-[-0.01em]">{t.value}%</span>
                </div>
                <div className="h-[7px] w-full rounded-full bg-white/[0.05] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${t.value}%`,
                      background: `linear-gradient(90deg, ${ACCENT}77, ${ACCENT})`,
                      boxShadow: `0 0 10px ${ACCENT}40`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div ref={animateSection} data-section-index={7} className="px-5 mt-4">
        <div className="rounded-3xl border backdrop-blur-xl p-5" style={{ borderColor: GLASS_BORDER, background: GLASS_BG }}>
          <SectionHeading className="mb-4">Recent activity</SectionHeading>
          <div className="flex flex-col">
            {recent.map((a, i) => (
              <div
                key={a.label}
                className={cn("flex items-center justify-between py-3.5", i !== recent.length - 1 && "border-b border-white/[0.05]")}
              >
                <div className="flex items-center gap-3">
                  <div className="h-[5px] w-[5px] rounded-full bg-primary/50" />
                  <span className="text-[13px] text-muted-foreground/55 font-normal tracking-[0.01em]">{a.label}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[13px] font-bold text-primary tracking-[-0.01em]">{a.score}</span>
                  <span className="text-[11px] text-muted-foreground/25 w-16 text-right font-normal">{a.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cognitive Radar */}
      <div ref={animateSection} data-section-index={8} className="px-5 mt-4">
        <div className="rounded-3xl border backdrop-blur-xl p-5" style={{ borderColor: GLASS_BORDER, background: GLASS_BG }}>
          <SectionHeading className="mb-2">Cognitive radar</SectionHeading>
          <RadarChart axes={radarLabels} values={radarValues} />
          <div className="flex flex-col gap-2.5 mt-3">
            <div className="flex items-center justify-between rounded-xl border border-white/[0.05] bg-white/[0.03] px-4 py-3">
              <span className="flex items-center gap-2 text-[13px] text-muted-foreground/55 font-normal">
                <Zap size={13} className="text-primary" />
                Action Delay
              </span>
              <span className="text-[13px] font-bold text-primary tracking-[-0.01em]">142ms</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-white/[0.05] bg-white/[0.03] px-4 py-3">
              <span className="flex items-center gap-2 text-[13px] text-muted-foreground/55 font-normal">
                <ArrowUpRight size={13} className="text-primary" />
                Focus Density
              </span>
              <span className="text-[13px] font-bold text-primary tracking-[-0.01em]">89%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming */}
      <div ref={animateSection} data-section-index={9} className="px-5 mt-4">
        <div className="rounded-3xl border backdrop-blur-xl p-5" style={{ borderColor: GLASS_BORDER, background: GLASS_BG }}>
          <SectionHeading className="mb-4">Upcoming</SectionHeading>
          <div className="flex flex-col gap-2.5">
            {upcoming.map((u) => (
              <div
                key={u.title}
                className="flex items-center justify-between rounded-xl border border-white/[0.05] bg-white/[0.03] px-4 py-3.5"
              >
                <div>
                  <p className="text-[13px] font-semibold text-foreground tracking-[-0.01em]">{u.title}</p>
                  <p className="text-[11px] text-muted-foreground/35 mt-0.5 font-normal">{u.time}</p>
                </div>
                {u.tag === "LIVE" ? (
                  <span className="flex items-center gap-1.5 rounded-full bg-[#FF6B35]/15 px-3 py-1 text-[11px] font-semibold text-[#FF6B35]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#FF6B35] animate-pulse" />
                    {u.tag}
                  </span>
                ) : (
                  <span className="rounded-full bg-white/[0.05] px-3 py-1 text-[11px] font-semibold text-muted-foreground/50">
                    {u.tag}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      <div ref={animateSection} data-section-index={10} className="px-5 mt-4 mb-4">
        <div className="rounded-3xl border backdrop-blur-xl p-5" style={{ borderColor: GLASS_BORDER, background: GLASS_BG }}>
          <SectionHeading className="mb-4">Leaderboard</SectionHeading>
          <div className="flex flex-col">
            {leaderboard.map((l, i) => (
              <div
                key={l.rank}
                className={cn(
                  "flex items-center justify-between py-3.5",
                  i !== leaderboard.length - 1 && "border-b border-white/[0.05]",
                  l.me && "rounded-xl px-3 -mx-3 bg-primary/[0.06] border border-primary/10",
                )}
              >
                <div className="flex items-center gap-3">
                  <span className={cn(
                    "text-[13px] font-bold w-8 tracking-[-0.01em]",
                    l.rank === 1 ? "text-[#FFD700]" : l.rank === 2 ? "text-[#C0C0C0]" : l.rank === 3 ? "text-[#CD7F32]" : "text-muted-foreground/35"
                  )}>
                    {l.rank <= 3 ? ["🥇", "🥈", "🥉"][l.rank - 1] : `#${l.rank}`}
                  </span>
                  <span className={cn("text-[13px]", l.me ? "font-bold text-primary" : "font-medium text-foreground/65")}>
                    {l.name}
                  </span>
                </div>
                <span className={cn("text-[13px] font-bold tracking-[-0.01em]", l.me ? "text-primary" : "text-muted-foreground/40")}>{l.xp.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showOnboarding && (
        <OnboardingModal onClose={() => setShowOnboarding(false)} />
      )}
    </div>
  );
}
