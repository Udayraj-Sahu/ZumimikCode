"use client";

import { useCallback } from "react";
import Link from "next/link";
import gsap from "gsap";
import { Play, Clock, Zap, Award, TrendingUp, ChevronRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { CognitiveRadar } from "@/components/dashboard/cognitive-radar";
import { useDashboardData } from "@/hooks/queries/use-dashboard";

const ICON_MAP: Record<string, LucideIcon> = {
  Zap,
  TrendingUp,
};

const streakDays = [true, true, true, false, true, true, false];
const dayLabels = ["M", "T", "W", "T", "F", "S", "S"];

const upcomingEvents = [
  { title: "Sprint Duel", time: "Today, 8PM", tag: "LIVE" },
  { title: "Mock CAT #7", time: "Thu, 10AM", tag: "MOCK" },
  { title: "Group Challenge", time: "Sat, 3PM", tag: "GROUP" },
];

const leaderboardData = [
  { rank: 1, name: "Priya S.", xp: 4820 },
  { rank: 2, name: "Arjun M.", xp: 4310 },
  { rank: 3, name: "Rohan K.", xp: 3990 },
  { rank: 47, name: "You", xp: 2340, me: true },
];

export default function DashboardPage() {
  const { data, isLoading, error } = useDashboardData();
  const topics = data?.topics ?? [];
  const radarAxes = data?.radarAxes ?? [];
  const metrics = data?.metrics ?? null;

  const metricCards = metrics?.map((m) => {
    const Icon = ICON_MAP[m.icon] || Zap;
    return (
      <div
        key={m.label}
        className="flex items-center justify-between rounded-lg px-3 py-2 bg-card"
      >
        <span className="text-fluid-xs text-muted-foreground/60">{m.label}</span>
        <span className="text-fluid-sm font-bold text-primary font-mono">
          {m.value}
        </span>
      </div>
    );
  });

  const headerRef = useCallback((el: HTMLDivElement | null) => {
    if (el) gsap.fromTo(el, { opacity: 0, y: -8 }, { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" });
  }, []);

  const errorRef = useCallback((el: HTMLDivElement | null) => {
    if (el) gsap.fromTo(el, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" });
  }, []);

  const animateSection = useCallback((el: HTMLDivElement | null) => {
    if (!el || el.dataset.animated) return;
    el.dataset.animated = "true";
    const i = parseInt(el.dataset.sectionIndex || "0");
    gsap.fromTo(el, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.4, delay: i * 0.08, ease: "power2.out" });
  }, []);

  return (
      <div>
        {/* Header */}
        <div
          ref={headerRef}
          className="px-5 md:px-8 pt-6 pb-5 border-b border-border"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-fluid-xs font-semibold tracking-[0.15em] text-muted-foreground/60">
                EXAM ARENA
              </p>
              <p className="mt-0.5 text-fluid-sm text-muted-foreground/50">Welcome back,</p>
              <h1 className="text-fluid-3xl font-black tracking-tight text-primary leading-none mt-0.5">
                Champion
              </h1>
              <p className="mt-1 text-fluid-sm text-muted-foreground/50">
                CAT 2026 Prep &middot; 87 days to exam
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-card border border-border">
                <Zap size={11} className="text-primary" />
                <span className="text-fluid-xs font-bold text-primary">6 DAY STREAK</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-card border border-border">
                <Award size={11} className="text-chart-4" />
                <span className="text-fluid-xs font-bold text-chart-4">2,340 XP</span>
              </div>
            </div>
          </div>

          {/* Stat row */}
          <div className="flex flex-wrap gap-x-6 gap-y-3 mt-5">
            {[
              { label: "ACCURACY", value: "87%", sub: "+3% this week" },
              { label: "QUESTIONS", value: "1,247", sub: "total solved" },
              { label: "PERCENTILE", value: "64%ile", sub: "mock rank" },
              { label: "SPEED", value: "47s", sub: "avg / question" },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-fluid-xs font-semibold tracking-[0.1em] text-muted-foreground/60">{s.label}</p>
                <p className="text-fluid-2xl font-black tracking-tight text-foreground leading-none mt-0.5">
                  {s.value}
                </p>
                <p className="text-fluid-xs text-primary mt-0.5">{s.sub}</p>
              </div>
            ))}
            {/* Streak mini */}
            <div className="ml-auto hidden sm:block">
              <p className="text-fluid-xs font-semibold tracking-[0.1em] text-muted-foreground/60 mb-1">
                THIS WEEK
              </p>
              <div className="flex gap-1">
                {dayLabels.map((day, i) => (
                  <span
                    key={i}
                    className="grid size-7 place-items-center rounded text-[11px] font-bold"
                    style={{
                      background: streakDays[i] ? "var(--primary)" : "#1a1a1a",
                      color: streakDays[i] ? "#0a0a0a" : "#444",
                    }}
                  >
                    {day}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {error ? (
          <div
            ref={errorRef}
            className="mx-5 md:mx-8 mt-6 flex flex-col items-center gap-4 rounded-lg border border-destructive/30 bg-destructive/5 p-6 md:p-8 text-center"
          >
            <p className="text-fluid-base font-semibold text-destructive">{error instanceof Error ? error.message : "Failed to load dashboard data"}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-lg bg-primary px-6 py-2.5 text-fluid-sm font-bold uppercase tracking-widest text-primary-foreground outline-none transition-transform hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-ring"
            >
              Retry
            </button>
          </div>
        ) : isLoading ? (
          <div className="p-5 md:p-8 animate-pulse">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 min-w-0 flex flex-col gap-4">
                <div className="h-32 rounded-lg bg-card" />
                <div className="h-48 rounded-lg bg-card" />
                <div className="h-40 rounded-lg bg-card" />
              </div>
              <div className="flex flex-col gap-4 w-full lg:w-[350px] shrink-0">
                <div className="h-64 rounded-lg bg-card" />
                <div className="h-32 rounded-lg bg-card" />
                <div className="h-40 rounded-lg bg-card" />
              </div>
            </div>
          </div>
        ) : (
          <div className="p-5 md:p-8">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Left col */}
              <div className="flex-1 min-w-0 flex flex-col gap-4">
                {/* Daily Sprint CTA */}
                <div
                  ref={animateSection} data-section-index={0}
                  className="relative overflow-hidden rounded-lg p-5 border border-primary/20"
                  style={{
                    background: "linear-gradient(135deg, #1a1f00 0%, #111 70%)",
                  }}
                >
                  <div
                    className="absolute top-0 right-0 w-28 h-28 opacity-10 rounded-full"
                    style={{ background: "var(--primary)", filter: "blur(36px)" }}
                  />
                  <p className="text-fluid-xs font-semibold tracking-[0.15em] text-primary">
                    TODAY&apos;S CHALLENGE
                  </p>
                  <h2 className="text-fluid-xl font-black tracking-tight text-foreground mt-1">
                    DAILY ARENA SPRINT
                  </h2>
                  <p className="text-fluid-sm text-muted-foreground/60 mt-1 leading-relaxed">
                    30 questions &middot; Timed &middot; Ranked &middot; Earn 150 XP
                  </p>
                  <div className="flex items-center gap-3 mt-4">
                    <Link
                      href="/dashboard/configure-sprint"
                      className="flex items-center gap-2 px-4 py-2 rounded-lg text-fluid-xs font-bold tracking-wide text-[#0a0a0a] transition-all hover:opacity-90 active:scale-95"
                      style={{ background: "var(--primary)" }}
                    >
                      <Play size={12} />
                      START SPRINT
                    </Link>
                    <div className="flex items-center gap-1.5 text-fluid-xs text-muted-foreground/50">
                      <Clock size={10} /> 45 min &middot; 30 Qs
                    </div>
                  </div>
                </div>

                {/* Topic Mastery */}
                <div
                  ref={animateSection} data-section-index={1}
                  className="rounded-lg p-5 bg-card border border-border"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-fluid-lg font-bold tracking-[0.08em] text-foreground">
                      TOPIC MASTERY
                    </h3>
                    <button
                      type="button"
                      className="flex items-center gap-1 text-fluid-sm text-primary outline-none"
                    >
                      VIEW ALL <ChevronRight size={10} />
                    </button>
                  </div>
                  <div className="flex flex-col gap-3">
                    {topics.length === 0 ? (
                      <p className="py-4 text-center text-fluid-sm text-muted-foreground/60">
                        No mastery data available yet. Complete a sprint to see your progress.
                      </p>
                    ) : (
                      topics.map((t) => (
                        <div key={t.name}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-fluid-sm text-muted-foreground">{t.name}</span>
                            <span className="text-fluid-sm font-bold text-primary font-mono">
                              {t.value}%
                            </span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-muted">
                            <div
                              className="h-full rounded-full transition-all duration-1000 ease-out"
                              style={{
                                width: `${t.value}%`,
                                background: t.color === "primary" ? "var(--primary)" : "var(--secondary)",
                              }}
                            />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Recent Activity */}
                <div
                  ref={animateSection} data-section-index={2}
                  className="rounded-lg p-5 bg-card border border-border"
                >
                  <h3 className="text-fluid-lg font-bold tracking-[0.08em] text-foreground mb-3">
                    RECENT ACTIVITY
                  </h3>
                  <div className="flex flex-col gap-0">
                    {[
                      { label: "LR Sprint", score: "22/25", time: "2h ago" },
                      { label: "Quant Set #14", score: "18/20", time: "Yesterday" },
                      { label: "Full CAT Mock", score: "142/300", time: "2d ago" },
                    ].map((a, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between py-2.5 border-b border-border/40"
                      >
                        <span className="text-fluid-sm text-muted-foreground">{a.label}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-fluid-sm text-foreground font-mono">
                            {a.score}
                          </span>
                          <span className="text-fluid-xs text-muted-foreground/40">{a.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right col */}
              <div className="flex flex-col gap-4 w-full lg:w-[350px] shrink-0">
                {/* Cognitive Radar */}
                <div
                  ref={animateSection} data-section-index={3}
                  className="rounded-lg p-4 bg-card border border-border"
                >
                  <h3 className="text-fluid-base font-bold tracking-[0.1em] text-foreground mb-1">
                    COGNITIVE RADAR
                  </h3>
                  {radarAxes.length > 0 ? (
                    <CognitiveRadar axes={radarAxes} size={220} />
                  ) : (
                    <p className="py-8 text-center text-fluid-sm text-muted-foreground/60">
                      No radar data yet.
                    </p>
                  )}
                  <div className="grid grid-cols-2 gap-1.5 mt-2">
                    {metrics && metrics.length > 0 ? (
                      metricCards
                    ) : (
                      <>
                        <div className="flex items-center justify-between px-2 py-1.5 rounded bg-card">
                          <span className="text-fluid-xs text-muted-foreground/60">Action Delay</span>
                          <span className="text-fluid-xs font-bold text-primary font-mono">160ms</span>
                        </div>
                        <div className="flex items-center justify-between px-2 py-1.5 rounded bg-card">
                          <span className="text-fluid-xs text-muted-foreground/60">Focus Density</span>
                          <span className="text-fluid-xs font-bold text-primary font-mono">89%</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Upcoming */}
                <div
                  ref={animateSection} data-section-index={4}
                  className="rounded-lg p-4 bg-card border border-border"
                >
                  <h3 className="text-fluid-base font-bold tracking-[0.1em] text-foreground mb-2">
                    UPCOMING
                  </h3>
                  <div className="flex flex-col gap-2">
                    {upcomingEvents.map((e, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between py-2 px-2.5 rounded bg-card"
                      >
                        <div>
                          <div className="text-fluid-sm font-semibold text-foreground/80">{e.title}</div>
                          <div className="text-fluid-xs text-muted-foreground/40">{e.time}</div>
                        </div>
                        <span
                          className={cn(
                            "px-1.5 py-0.5 rounded text-fluid-xs font-bold tracking-[0.08em]",
                            e.tag === "LIVE"
                              ? "bg-primary/10 text-primary"
                              : "bg-muted text-muted-foreground/60",
                          )}
                        >
                          {e.tag}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Leaderboard */}
                <div
                  ref={animateSection} data-section-index={5}
                  className="rounded-lg p-4 bg-card border border-border"
                >
                  <h3 className="text-fluid-base font-bold tracking-[0.1em] text-foreground mb-2">
                    LEADERBOARD
                  </h3>
                  <div className="flex flex-col gap-1">
                    {leaderboardData.map((u) => (
                      <div
                        key={u.rank}
                        className={cn(
                          "flex items-center gap-2 px-2 py-1.5 rounded",
                          u.me && "bg-primary/5 border border-primary/15",
                        )}
                      >
                        <span
                          className={cn(
                            "text-fluid-xs font-mono w-[18px]",
                            u.rank <= 3 ? "text-primary" : "text-muted-foreground/30",
                          )}
                        >
                          #{u.rank}
                        </span>
                        <span
                          className="flex-1 text-fluid-sm"
                          style={{ color: u.me ? "var(--primary)" : "#888", fontWeight: u.me ? 700 : 400 }}
                        >
                          {u.name}
                        </span>
                        <span className="text-fluid-xs font-mono text-muted-foreground/40">
                          {u.xp.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
  );
}
