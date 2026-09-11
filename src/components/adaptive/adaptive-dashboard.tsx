"use client";

import { useRouter } from "next/navigation";
import { Play, Grid3x3, Sigma, Pentagon, Sparkles, Target, Flame, Clock, ChevronRight, Calculator, ListChecks, BookOpen, Timer, Zap, Brain, TrendingUp, ShieldCheck, Trophy, CalendarDays } from "lucide-react";
import { useAdaptiveState, useTodayPlan } from "@/hooks/queries/use-adaptive";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { resolveJourneyProfile } from "@/lib/adaptive/modes";
import type { JourneyProfile, TimeBlock } from "@/lib/adaptive/modes";
import type { AdaptiveTopicState, PracticeRecommendation, MockRecommendation, AdaptiveDomainState } from "@/lib/types/adaptive";

const TEMPORAL_LABELS: Record<string, string> = {
  this_year: "This Year",
  whenever: "Flexible",
  not_sure: "Exploring",
};

const TOPIC_ICONS: Record<string, { icon: typeof Grid3x3; color: string }> = {
  "Problem Solving": { icon: Calculator, color: "#34D399" },
  "Data Sufficiency": { icon: ListChecks, color: "#22D3EE" },
  "Sentence Correction": { icon: BookOpen, color: "#A78BFA" },
  "Critical Reasoning": { icon: Target, color: "#FBBF24" },
  "Reading Comp.": { icon: BookOpen, color: "#FB7185" },
  "Quantitative Apt.": { icon: Calculator, color: "#34D399" },
  "LR & DI": { icon: ListChecks, color: "#22D3EE" },
  "Verbal Ability": { icon: BookOpen, color: "#A78BFA" },
  "Quant Comparison": { icon: Sigma, color: "#34D399" },
  "Text Completion": { icon: BookOpen, color: "#A78BFA" },
  "Sentence Equivalence": { icon: Sparkles, color: "#FBBF24" },
  "Numerical Ability": { icon: Calculator, color: "#34D399" },
  "General Awareness": { icon: ListChecks, color: "#FBBF24" },
  "Computer Knowledge": { icon: Pentagon, color: "#A78BFA" },
  "Vedic Addition": { icon: Calculator, color: "#34D399" },
  "Vedic Subtraction": { icon: Sigma, color: "#22D3EE" },
  "Vedic Multiplication": { icon: Zap, color: "#FBBF24" },
  "Squares & Bases": { icon: Pentagon, color: "#A78BFA" },
};

function sprintHref(rec: PracticeRecommendation, domain: string): string {
  return `/play/sprint?topic=${encodeURIComponent(rec.topicId)}&length=${rec.length}&difficulty=${encodeURIComponent(rec.difficulty)}&adaptive=1&domain=${encodeURIComponent(domain)}`;
}

function CircularGauge({ percent, accent }: { percent: number; accent: string }) {
  const r = 54;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative size-[120px] shrink-0">
      <svg width="120" height="120" viewBox="0 0 120 120" className="-rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
        <circle
          cx="60" cy="60" r={r} fill="none"
          stroke={accent} strokeWidth="8" strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - Math.max(0, Math.min(100, percent)) / 100)}
          className="transition-all duration-700"
          style={{ filter: `drop-shadow(0 0 8px ${accent}55)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[28px] font-black tracking-tight text-foreground leading-none">{percent}%</span>
        <span className="text-[8px] font-bold uppercase tracking-[0.14em] text-muted-foreground/50 mt-1">ready</span>
      </div>
    </div>
  );
}

type VariantCtx = {
  domain: string;
  router: ReturnType<typeof useRouter>;
  data: AdaptiveDomainState;
  profile: JourneyProfile;
  topics: AdaptiveTopicState[];
  mastered: number;
  overall: number;
  bestStreak: number;
  hours: number;
  weak: PracticeRecommendation | null;
  practice: PracticeRecommendation | null;
  mock: MockRecommendation | null;
  timeBudget: TimeBlock[];
  startHref: string;
  daysRemaining: number | null;
};

/* ── Mode-specific blocks ── */

function ModeHeader({ profile, temporalLabel }: { profile: JourneyProfile; temporalLabel: string }) {
  return (
    <div>
      <div className="inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5" style={{ borderColor: `${profile.accent}30`, background: `${profile.accent}0a` }}>
        <Target size={11} style={{ color: profile.accent }} />
        <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: profile.accent }}>
          {profile.title}{temporalLabel ? ` · ${temporalLabel}` : ""}
        </span>
      </div>
      <h2 className="mt-3 text-[20px] font-bold tracking-[-0.02em] text-foreground">{profile.headlinePrefix === "Path" ? "Your Learning Path" : profile.title}</h2>
      <p className="mt-0.5 text-[11px] text-muted-foreground/45 font-medium">{profile.subtitle}</p>
    </div>
  );
}

function SectionLabel({ children, accent }: { children: React.ReactNode; accent: string }) {
  return (
    <p className="text-[9px] font-semibold tracking-[0.18em] text-muted-foreground/40 uppercase mb-3" style={{ color: `${accent}d9` }}>
      {children}
    </p>
  );
}

function ExamReadyBlock({ ctx }: { ctx: VariantCtx }) {
  const mission = [
    ...(ctx.weak ? [{ n: "01", t: ctx.weak.topicLabel, d: `${ctx.weak.length} q · ${ctx.weak.difficulty}`, href: sprintHref(ctx.weak, ctx.domain) }] : []),
    ...(ctx.practice ? [{ n: "02", t: ctx.practice.topicLabel, d: `${ctx.practice.length} q · spaced review`, href: sprintHref(ctx.practice, ctx.domain) }] : []),
    ...(ctx.mock ? [{ n: "03", t: "Full-length Mock", d: `${ctx.mock.length} q · exam simulation`, href: "/learn?mode=mock" }] : []),
  ];
  return (
    <div className="rounded-3xl border backdrop-blur-xl p-5" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
      <div className="flex items-start justify-between gap-3">
        <SectionLabel accent={ctx.profile.accent}>Today&apos;s Mission</SectionLabel>
        {ctx.daysRemaining !== null && (
          <div className="flex items-center gap-1.5 rounded-full border border-white/[0.07] px-3 py-1">
            <CalendarDays size={11} style={{ color: ctx.profile.accent }} />
            <span className="text-[10px] font-bold" style={{ color: ctx.profile.accent }}>{ctx.daysRemaining} days left</span>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-3">
        {mission.length === 0 && (
          <div className="rounded-2xl border border-dashed border-white/[0.06] px-4 py-6 text-center">
            <p className="text-[11px] text-muted-foreground/50">Complete a sprint to unlock your mission.</p>
          </div>
        )}
        {mission.map((m) => (
          <button
            key={m.n}
            type="button"
            onClick={() => ctx.router.push(m.href)}
            className="flex items-center gap-3 rounded-2xl border border-white/[0.06] px-4 py-3 text-left transition-all hover:bg-white/[0.04] active:scale-[0.98]"
          >
            <span className="font-mono text-[11px] font-bold" style={{ color: ctx.profile.accent }}>{m.n}</span>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-bold text-foreground/85 truncate">{m.t}</p>
              <p className="text-micro text-muted-foreground/50 truncate">{m.d}</p>
            </div>
            <ChevronRight size={12} className="shrink-0 text-muted-foreground/40" />
          </button>
        ))}
      </div>

      <div className="mt-4 rounded-2xl border p-4" style={{ borderColor: `${ctx.profile.accent}25`, background: `${ctx.profile.accent}0a` }}>
        <div className="flex items-center gap-2">
          <Zap size={12} style={{ color: ctx.profile.accent }} />
          <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: ctx.profile.accent }}>Tactical Module</p>
        </div>
        <p className="mt-1.5 text-[13px] font-bold text-foreground leading-tight">
          {ctx.weak ? `Master ${ctx.weak.topicLabel}` : "Targeted intervention"}
        </p>
        <p className="mt-1 text-micro text-muted-foreground/55">
          {ctx.weak ? `${ctx.weak.mastery}% mastered · ${ctx.weak.length} questions → tap to start` : "Your engine will create one after your first sprint."}
        </p>
      </div>
    </div>
  );
}

function GapCloserBlock({ ctx }: { ctx: VariantCtx }) {
  const gap = 100 - ctx.overall;
  const gaps = [...ctx.topics].sort((a, b) => a.mastery - b.mastery).slice(0, 3);
  return (
    <div className="rounded-3xl border backdrop-blur-xl p-5" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
      <SectionLabel accent={ctx.profile.accent}>Your Preparation Gap</SectionLabel>
      <div className="flex items-center gap-5">
        <CircularGauge percent={ctx.overall} accent={ctx.profile.accent} />
        <div>
          <p className="text-[13px] font-semibold text-foreground/80">You don&apos;t need to rush.<br />You need to become ready.</p>
          <p className="mt-2 text-[11px] text-muted-foreground/55">
            Current readiness <span className="font-bold" style={{ color: ctx.profile.accent }}>{ctx.overall}%</span> · Gap <span className="font-bold text-destructive">{gap}%</span>
          </p>
        </div>
      </div>
      {gaps.length > 0 && (
        <div className="mt-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50 mb-2">Your biggest gaps</p>
          <div className="flex flex-wrap gap-1.5">
            {gaps.map((t) => (
              <span key={t.id} className="rounded-full border border-white/[0.07] px-3 py-1 text-[10px] font-bold text-muted-foreground/70" style={{ background: `${t.color}12` }}>
                {t.name} · {t.mastery}%
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const DISCOVERY_PHASES = [
  { t: "Build Foundation", d: "Core concepts, no pressure" },
  { t: "Discover Weak Areas", d: "See where you need reps" },
  { t: "Develop Consistency", d: "Daily check-ins add up" },
  { t: "Track Your Readiness", d: "Watch the gauge climb" },
];

function DiscoveryBlock({ ctx }: { ctx: VariantCtx }) {
  return (
    <div className="rounded-3xl border backdrop-blur-xl p-5" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
      <SectionLabel accent={ctx.profile.accent}>Current Focus</SectionLabel>
      <p className="text-[12px] text-muted-foreground/55 -mt-2 mb-4">
        Your exam date isn&apos;t fixed yet — that&apos;s okay. We&apos;ll build your skills while you figure it out.
      </p>
      <div className="flex flex-col gap-2.5">
        {DISCOVERY_PHASES.map((p, i) => (
          <div key={p.t} className="flex items-center gap-3 rounded-2xl border border-white/[0.06] px-4 py-3">
            <span className="font-mono text-[11px] font-bold" style={{ color: ctx.profile.accent }}>0{i + 1}</span>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-bold text-foreground/85">{p.t}</p>
              <p className="text-micro text-muted-foreground/50">{p.d}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function GuidedLearningBlock({ ctx }: { ctx: VariantCtx }) {
  const weak = ctx.topics[0];
  const next = ctx.topics[1] ?? weak;
  return (
    <div className="rounded-3xl border backdrop-blur-xl p-5" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
      <SectionLabel accent={ctx.profile.accent}>Today&apos;s Lesson</SectionLabel>
      <div className="flex flex-col gap-2">
        {ctx.topics.slice(0, 3).map((t, i) => (
          <div key={t.id} className="flex items-center gap-3 rounded-2xl border border-white/[0.06] px-4 py-3">
            <span className="grid size-7 place-items-center rounded-lg" style={{ background: `${t.color}15` }}>
              <span className="text-[11px] font-bold" style={{ color: t.color }}>{["①", "②", "③"][i]}</span>
            </span>
            <p className="text-[13px] font-bold text-foreground/85">{t.name}</p>
            <span className="ml-auto text-micro font-bold" style={{ color: t.color }}>{["Foundation", "Learn", "Practice"][i]}</span>
          </div>
        ))}
      </div>
      {weak && (
        <div className="mt-4 rounded-2xl border p-4" style={{ borderColor: `${ctx.profile.accent}25`, background: `${ctx.profile.accent}0a` }}>
          <div className="flex items-center gap-2">
            <Brain size={12} style={{ color: ctx.profile.accent }} />
            <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: ctx.profile.accent }}>Adaptive Note</p>
          </div>
          <p className="mt-1.5 text-[12px] text-foreground/75 leading-snug">
            {weak.mastery === 0
              ? `Start with ${weak.name.toLowerCase()} — we'll keep it light and build up.`
              : `${weak.name} is ${weak.mastery}% there. Next recommended skill: ${next?.name?.toLowerCase() ?? "a review round"}.`}
          </p>
        </div>
      )}
    </div>
  );
}

function SpeedTrainingBlock({ ctx }: { ctx: VariantCtx }) {
  const accuracy = ctx.data?.lastSession?.accuracy ?? 0;
  const avgSec = ctx.data && ctx.data.totalTimeSpent > 0 && ctx.data.sessionCount > 0
    ? Math.max(3, Math.round((ctx.data.totalTimeSpent / (ctx.data.sessionCount * Math.max(ctx.data.topics.length, 1))) / 6))
    : 8.4;
  const target = Math.max(4, avgSec - 1.5);
  const weak = ctx.topics[0];
  return (
    <div className="rounded-3xl border backdrop-blur-xl p-5" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
      <SectionLabel accent={ctx.profile.accent}>Speed Training</SectionLabel>
      <div className="grid grid-cols-2 gap-2.5">
        <div className="rounded-2xl border border-white/[0.06] p-3.5">
          <p className="text-micro font-semibold uppercase tracking-[0.14em] text-muted-foreground/50">Current Speed</p>
          <p className="mt-1.5 text-[22px] font-black tracking-tight text-foreground leading-none">
            {avgSec}<span className="text-[12px] font-bold text-muted-foreground/50"> sec/q</span>
          </p>
        </div>
        <div className="rounded-2xl border border-white/[0.06] p-3.5">
          <p className="text-micro font-semibold uppercase tracking-[0.14em] text-muted-foreground/50">Accuracy</p>
          <p className="mt-1.5 text-[22px] font-black tracking-tight text-foreground leading-none">
            {accuracy > 0 ? `${accuracy}%` : "--"}<span className="text-[12px] font-bold text-muted-foreground/50"> last</span>
          </p>
        </div>
      </div>
      {weak && (
        <div className="mt-4 rounded-2xl border p-4" style={{ borderColor: `${ctx.profile.accent}25`, background: `${ctx.profile.accent}0a` }}>
          <div className="flex items-center justify-between gap-2">
            <p className="text-[13px] font-bold text-foreground">Today&apos;s Challenge</p>
            <span className="rounded-full bg-white/[0.06] px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider" style={{ color: ctx.profile.accent }}>
              Target &lt; {target}s
            </span>
          </div>
          <p className="mt-1.5 text-[12px] text-foreground/70">
            {ctx.practice?.length ?? ctx.weak?.length ?? 20} calculations · focus: {weak.name}
          </p>
        </div>
      )}
    </div>
  );
}

function PerformanceBlock({ ctx }: { ctx: VariantCtx }) {
  const weak = ctx.topics[0];
  return (
    <div className="rounded-3xl border backdrop-blur-xl p-5" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
      <SectionLabel accent={ctx.profile.accent}>Competitive Exam Mode</SectionLabel>
      <div className="flex items-center gap-5">
        <CircularGauge percent={ctx.overall} accent={ctx.profile.accent} />
        <div>
          <p className="text-[13px] font-semibold text-foreground/80">Speed + accuracy under exam conditions.</p>
          <p className="mt-2 text-[11px] text-muted-foreground/55">
            Weak area: <span className="font-bold" style={{ color: ctx.profile.accent }}>{weak?.name ?? "—"}</span>
          </p>
        </div>
      </div>
      {weak && (
        <div className="mt-4 rounded-2xl border p-4" style={{ borderColor: `${ctx.profile.accent}25`, background: `${ctx.profile.accent}0a` }}>
          <div className="flex items-center gap-2">
            <ShieldCheck size={12} style={{ color: ctx.profile.accent }} />
            <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: ctx.profile.accent }}>Tactical Module</p>
          </div>
          <p className="mt-1.5 text-[13px] font-bold text-foreground leading-tight">{ctx.weak?.topicLabel ?? `Rapid ${weak.name}`}</p>
          <p className="mt-1 text-micro text-muted-foreground/55">{ctx.weak ? `${ctx.weak.length} questions · target 90%+ accuracy` : "Start with a sprint to calibrate speed."}</p>
        </div>
      )}
    </div>
  );
}

function BrainGymBlock({ ctx }: { ctx: VariantCtx }) {
  const score = Math.round(ctx.overall * 0.9);
  const pb = Math.max(score, 91);
  const workouts = [
    { t: "Quick Calculation", d: "5 min" },
    { t: "Number Pattern", d: "5 min" },
    { t: "Mental Arithmetic", d: "5 min" },
    { t: "Memory Challenge", d: "5 min" },
  ];
  return (
    <div className="rounded-3xl border backdrop-blur-xl p-5" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
      <SectionLabel accent={ctx.profile.accent}>Today&apos;s Mental Workout</SectionLabel>
      <div className="grid grid-cols-2 gap-2.5">
        <div className="rounded-2xl border border-white/[0.06] p-3.5">
          <div className="flex items-center gap-1.5 text-micro font-semibold uppercase tracking-[0.14em] text-muted-foreground/50">
            <Trophy size={11} style={{ color: ctx.profile.accent }} /> Today&apos;s Score
          </div>
          <p className="mt-1.5 text-[22px] font-black tracking-tight text-foreground leading-none">{score}</p>
        </div>
        <div className="rounded-2xl border border-white/[0.06] p-3.5">
          <div className="flex items-center gap-1.5 text-micro font-semibold uppercase tracking-[0.14em] text-muted-foreground/50">
            <TrendingUp size={11} style={{ color: ctx.profile.accent }} /> Personal Best
          </div>
          <p className="mt-1.5 text-[22px] font-black tracking-tight text-foreground leading-none">{pb}</p>
        </div>
      </div>
      <div className="mt-4 flex flex-col gap-2">
        {workouts.map((w, i) => (
          <div key={w.t} className="flex items-center gap-3 rounded-2xl border border-white/[0.06] px-4 py-2.5">
            <span className="font-mono text-[10px] font-bold" style={{ color: ctx.profile.accent }}>⚡</span>
            <p className="text-[12px] font-bold text-foreground/80">{w.t}</p>
            <span className="ml-auto text-micro text-muted-foreground/50">{w.d}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Shared blocks ── */

function StatsBlock({ ctx }: { ctx: VariantCtx }) {
  return (
    <div className="rounded-3xl border backdrop-blur-xl p-5 flex items-center gap-5" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
      <CircularGauge percent={ctx.overall} accent={ctx.profile.accent} />
      <div className="flex-1 min-w-0">
        <p className="text-[17px] font-bold tracking-[-0.02em] text-foreground leading-tight">Curriculum Preparedness</p>
        <div className="mt-4 flex flex-col gap-2.5">
          <div className="flex items-center gap-2.5">
            <div className="size-7 rounded-lg flex items-center justify-center" style={{ background: `${ctx.profile.accent}12` }}>
              <Grid3x3 size={12} style={{ color: ctx.profile.accent }} />
            </div>
            <span className="text-[13px] font-semibold text-foreground/80">Topics Mastered</span>
            <span className="ml-auto text-[13px] font-bold" style={{ color: ctx.profile.accent }}>{ctx.mastered}/{ctx.topics.length}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="size-7 rounded-lg flex items-center justify-center" style={{ background: `${ctx.profile.accent}12` }}>
              <Flame size={12} style={{ color: ctx.profile.accent }} />
            </div>
            <span className="text-[13px] font-semibold text-foreground/80">Daily Streak</span>
            <span className="ml-auto text-[13px] font-bold" style={{ color: ctx.profile.accent }}>{ctx.bestStreak} days</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="size-7 rounded-lg flex items-center justify-center" style={{ background: `${ctx.profile.accent}12` }}>
              <Clock size={12} style={{ color: ctx.profile.accent }} />
            </div>
            <span className="text-[13px] font-semibold text-foreground/80">Time Spent</span>
            <span className="ml-auto text-[13px] font-bold" style={{ color: ctx.profile.accent }}>{ctx.hours}h</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function TimeBudgetBlock({ ctx }: { ctx: VariantCtx }) {
  if (ctx.timeBudget.length === 0) return null;
  return (
    <div className="flex flex-col gap-2">
      <SectionLabel accent={ctx.profile.accent}>Daily Budget</SectionLabel>
      <div className="flex items-center gap-1.5 rounded-2xl border border-white/[0.06] px-4 py-3">
        <Timer size={12} className="shrink-0" style={{ color: ctx.profile.accent }} />
        {ctx.timeBudget.map((b) => (
          <span key={b.label} className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold" style={{ background: `${ctx.profile.accent}12`, color: ctx.profile.accent }}>
            {b.minutes} min {b.label}
          </span>
        ))}
        <span className="ml-auto text-[10px] font-bold text-muted-foreground/50">
          {ctx.timeBudget.reduce((s, b) => s + b.minutes, 0)} min
        </span>
      </div>
    </div>
  );
}

function TodayPlanCards({ ctx }: { ctx: VariantCtx }) {
  return (
    <div>
      <SectionLabel accent={ctx.profile.accent}>Today&apos;s Plan</SectionLabel>
      <div className="flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {ctx.weak && (
          <div className="min-w-[160px] rounded-2xl border border-destructive/20 bg-destructive/5 p-4 flex flex-col">
            <p className="text-[8px] font-bold uppercase tracking-wider text-destructive/80">Weak Topic</p>
            <p className="mt-1.5 text-[14px] font-bold tracking-[-0.01em] text-foreground leading-tight">{ctx.weak.topicLabel}</p>
            <p className="mt-1 text-[12px] text-muted-foreground/50">{ctx.weak.mastery}% mastered</p>
            <button
              type="button"
              onClick={() => ctx.router.push(sprintHref(ctx.weak!, ctx.domain))}
              className="mt-auto pt-3 inline-flex self-start items-center gap-1 rounded-full bg-destructive/15 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-destructive/90 transition-all hover:bg-destructive/25 active:scale-95"
            >
              Practice <ChevronRight size={10} />
            </button>
          </div>
        )}
        {ctx.practice && (
          <div className="min-w-[160px] rounded-2xl border border-primary/20 bg-primary/5 p-4 flex flex-col">
            <p className="text-[8px] font-bold uppercase tracking-wider text-primary/80">Practice Set</p>
            <p className="mt-1.5 text-[14px] font-bold tracking-[-0.01em] text-foreground leading-tight">{ctx.practice.length} questions</p>
            <p className="mt-1 text-[12px] text-muted-foreground/50">Spaced review</p>
            <button
              type="button"
              onClick={() => ctx.router.push(sprintHref(ctx.practice!, ctx.domain))}
              className="mt-auto pt-3 inline-flex self-start items-center gap-1 rounded-full bg-primary/15 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-primary transition-all hover:bg-primary/25 active:scale-95"
            >
              Start <ChevronRight size={10} />
            </button>
          </div>
        )}
        {ctx.mock && (
          <div className="min-w-[160px] rounded-2xl border border-chart-4/20 bg-chart-4/5 p-4 flex flex-col">
            <p className="text-[8px] font-bold uppercase tracking-wider text-chart-4/80">Mock Test</p>
            <p className="mt-1.5 text-[14px] font-bold tracking-[-0.01em] text-foreground leading-tight">Full-length</p>
            <p className="mt-1 text-[12px] text-muted-foreground/50">Every 5 sessions</p>
            <button
              type="button"
              onClick={() => ctx.router.push("/learn?mode=mock")}
              className="mt-auto pt-3 inline-flex self-start items-center gap-1 rounded-full bg-chart-4/15 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-chart-4 transition-all hover:bg-chart-4/25 active:scale-95"
            >
              Take <ChevronRight size={10} />
            </button>
          </div>
        )}
        {!ctx.weak && !ctx.practice && !ctx.mock && (
          <div className="min-w-[160px] rounded-2xl border border-white/[0.06] p-4 flex flex-col items-center justify-center text-center">
            <Sparkles size={16} className="text-muted-foreground/30 mb-2" />
            <p className="text-[11px] font-semibold text-muted-foreground/50">No recommendations yet</p>
            <p className="text-[9px] text-muted-foreground/40 mt-1">Complete a sprint to get a plan.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function TopicMasteryList({ ctx }: { ctx: VariantCtx }) {
  return (
    <div>
      <SectionLabel accent={ctx.profile.accent}>Your Topics</SectionLabel>
      <div className="flex flex-col gap-2">
        {ctx.topics.map((t) => {
          const iconMeta = TOPIC_ICONS[t.name];
          const Icon = iconMeta?.icon ?? Grid3x3;
          const iconColor = iconMeta?.color ?? t.color;
          return (
            <div key={t.id} className="flex items-center gap-3 rounded-2xl border border-white/[0.06] px-4 py-3">
              <div className="size-8 shrink-0 rounded-lg flex items-center justify-center" style={{ background: `${iconColor}12` }}>
                <Icon size={14} style={{ color: iconColor }} />
              </div>
              <span className="max-w-[110px] truncate text-[13px] font-semibold text-foreground/85">{t.name}</span>
              <div className="flex-1 h-2 rounded-full bg-white/[0.05] overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${t.mastery}%`, background: `linear-gradient(90deg, ${t.color}88, ${t.color})` }} />
              </div>
              <span className="w-8 text-right text-[13px] font-bold" style={{ color: t.color }}>{t.mastery}%</span>
              {t.status === "NEW" && (
                <span className="text-[8px] font-bold uppercase tracking-wider rounded-full px-2 py-0.5" style={{ background: `${t.color}18`, color: t.color }}>New</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Root dispatcher ── */

export function AdaptiveDashboard({ domain }: { domain: string }) {
  const router = useRouter();
  const temporalWindow = useOnboardingStore((s) => s.temporalWindow);
  const vedicUseCase = useOnboardingStore((s) => s.vedicUseCase);
  const focusMode = useOnboardingStore((s) => s.focusMode);
  const dailyMinutes = useOnboardingStore((s) => s.dailyMinutes);
  const examDates = useOnboardingStore((s) => s.examDates);
  const { data } = useAdaptiveState(domain);
  const plan = useTodayPlan(domain).data;

  const temporalLabel = temporalWindow ? (TEMPORAL_LABELS[temporalWindow] ?? "") : "";

  const profile = resolveJourneyProfile({
    domain,
    temporalWindow,
    vedicUseCase,
    focusMode,
    dailyMinutes: dailyMinutes ?? 30,
  });

  const daysRemaining = (() => {
    const raw = examDates[domain];
    if (!raw) return null;
    const parsed = new Date(raw);
    if (Number.isNaN(parsed.getTime())) return null;
    return Math.max(0, Math.ceil((parsed.getTime() - Date.now()) / 86400000));
  })();

  if (!data) {
    return (
      <div className="rounded-3xl border border-white/[0.08] px-5 py-6" style={{ background: "rgba(255,255,255,0.04)" }}>
        <div className="h-4 w-40 rounded-xl bg-white/[0.06] animate-pulse mb-4" />
        <div className="size-[120px] rounded-full bg-white/[0.06] animate-pulse mx-auto" />
        <div className="h-3 w-3/4 rounded-xl bg-white/[0.05] animate-pulse mt-5 mx-auto" />
      </div>
    );
  }

  const topics = data.topics;
  const mastered = topics.filter((t) => t.mastery >= 80).length;
  const overall = topics.length > 0 ? Math.round(topics.reduce((s, t) => s + t.mastery, 0) / topics.length) : 0;
  const bestStreak = topics.reduce((m, t) => Math.max(m, t.bestStreak), 0);
  const hours = Math.max(0, Math.round((data.totalTimeSpent ?? 0) / 3600));

  const weak = plan?.weakTopic ?? null;
  const practice = plan?.practice ?? null;
  const mock = plan?.mock ?? null;
  const startRec = weak ?? practice;
  const startHref = startRec ? sprintHref(startRec, domain) : "/play/configure-sprint";

  const ctx: VariantCtx = {
    domain,
    router,
    data,
    profile,
    topics,
    mastered,
    overall,
    bestStreak,
    hours,
    weak,
    practice,
    mock,
    timeBudget: plan?.timeBudget ?? [],
    startHref,
    daysRemaining,
  };

  return (
    <div className="flex flex-col gap-5">
      <ModeHeader profile={profile} temporalLabel={temporalLabel} />

      {profile.mode === "exam_ready" && <ExamReadyBlock ctx={ctx} />}
      {profile.mode === "gap_closer" && <GapCloserBlock ctx={ctx} />}
      {profile.mode === "discovery" && <DiscoveryBlock ctx={ctx} />}
      {profile.mode === "guided_learning" && <GuidedLearningBlock ctx={ctx} />}
      {profile.mode === "speed" && <SpeedTrainingBlock ctx={ctx} />}
      {profile.mode === "performance" && <PerformanceBlock ctx={ctx} />}
      {profile.mode === "brain_gym" && <BrainGymBlock ctx={ctx} />}

      <StatsBlock ctx={ctx} />
      <TimeBudgetBlock ctx={ctx} />
      <TodayPlanCards ctx={ctx} />
      <TopicMasteryList ctx={ctx} />

      <button
        type="button"
        onClick={() => router.push(ctx.startHref)}
        className="w-full flex items-center justify-center gap-2 rounded-2xl py-4 text-[12px] font-bold uppercase tracking-widest text-[#0A0C0A] transition-all hover:opacity-90 active:scale-[0.98]"
        style={{ background: "#C8FF4D", boxShadow: "0 0 24px rgba(200,255,77,0.25)" }}
      >
        <Play size={13} strokeWidth={2.5} /> Start {profile.mode === "brain_gym" ? "Today's Workout" : "Today's Practice"}
      </button>
      <p className="text-center text-[10px] text-muted-foreground/40 -mt-2">Based on your goal and daily budget</p>
    </div>
  );
}