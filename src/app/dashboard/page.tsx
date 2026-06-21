"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { Play, Clock, Zap, Award, TrendingUp, ChevronRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { CognitiveRadar } from "@/components/dashboard/cognitive-radar";
import { useDashboardData } from "@/hooks/queries/use-dashboard";
import { usePageMeta } from "@/hooks/use-page-meta";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { DOMAIN_LABELS } from "@/lib/types/template";

const ICON_MAP: Record<string, LucideIcon> = {
  Zap,
  TrendingUp,
};

export default function DashboardPage() {
  usePageMeta("Dashboard — Exam Arena");
  const router = useRouter();
  const targetExam = useOnboardingStore((s) => s.targetExam);
  const { data, isLoading, error } = useDashboardData(targetExam);
  const topics = data?.topics ?? [];
  const radarAxes = data?.radarAxes ?? [];
  const metrics = data?.metrics ?? null;
  const stats = data?.stats ?? null;
  const streak = data?.streak ?? null;
  const upcoming = data?.upcoming ?? [];
  const leaderboard = data?.leaderboard ?? [];
  const recent = data?.recent ?? [];

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
          <p className="text-center text-fluid-xs font-semibold tracking-[0.15em] text-muted-foreground/60">
            EXAM ARENA
          </p>
          <div className="text-center mt-2">
            <p className="text-fluid-sm text-muted-foreground/50">
              Welcome back,{" "}
              <span className="text-fluid-xl font-black tracking-tight text-primary">
                Champion
              </span>
            </p>
            <p className="mt-0.5 text-fluid-sm text-muted-foreground/50">
              {DOMAIN_LABELS[targetExam] ?? "Exam"} Prep
            </p>
          </div>
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-card border border-border">
              <Zap size={11} className="text-primary" />
              <span className="text-fluid-xs font-bold text-primary">{streak?.current ?? 6} DAY STREAK</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-card border border-border">
              <Award size={11} className="text-chart-4" />
              <span className="text-fluid-xs font-bold text-chart-4">{(streak?.xp ?? 2340).toLocaleString()} XP</span>
            </div>
          </div>

          {/* Stat row */}
          <div className="mt-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "ACCURACY", value: `${stats?.accuracy ?? 87}%`, sub: "+3% this week" },
                { label: "QUESTIONS", value: (stats?.questions ?? 1247).toLocaleString(), sub: "total solved" },
                { label: "PERCENTILE", value: `${stats?.percentile ?? 64}%ile`, sub: "mock rank" },
                { label: "SPEED", value: `${stats?.speed ?? 47}s`, sub: "avg / question" },
              ].map((s) => (
                <div key={s.label} className="rounded-xl border border-border/40 bg-card p-4">
                  <p className="text-fluid-xs font-semibold tracking-[0.1em] text-muted-foreground/60">{s.label}</p>
                  <p className="text-fluid-2xl font-black tracking-tight text-foreground leading-none mt-0.5">
                    {s.value}
                  </p>
                  <p className="text-fluid-xs text-primary mt-0.5">{s.sub}</p>
                </div>
              ))}
            </div>
            {/* THIS WEEK */}
            <div className="flex items-center justify-between sm:justify-end mt-3">
              <span className="text-fluid-xs font-semibold tracking-[0.1em] text-muted-foreground/60 sm:hidden">
                THIS WEEK
              </span>
              <div className="flex gap-1">
                {(streak?.labels ?? ["M","T","W","T","F","S","S"]).map((day, i) => {
                  const active = (streak?.days ?? [true,true,true,false,true,true,false])[i];
                  return (
                    <span
                      key={i}
                      className={cn(
                        "grid size-6 place-items-center rounded text-[10px] font-bold",
                        active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                      )}
                    >
                      {day}
                    </span>
                  );
                })}
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
              onClick={() => router.refresh()}
              className="rounded-lg bg-primary px-6 py-3 text-fluid-sm font-bold uppercase tracking-widest text-primary-foreground outline-none transition-transform hover:scale-[1.02] active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-ring"
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
              <div className="flex flex-col gap-4 w-full lg:w-80 shrink-0">
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
                    className="relative overflow-hidden rounded-lg p-5 border border-chart-4/20 bg-gradient-to-br from-chart-4/[0.04] to-background"
                  >
                    <div
                      className="absolute top-0 right-0 w-28 h-28 opacity-10 rounded-full"
                      style={{ background: "#a855f7", filter: "blur(36px)" }}
                    />
                    <p className="text-fluid-xs font-semibold tracking-[0.15em] text-chart-4">
                      PRACTICE MODE
                    </p>
                    <h2 className="text-fluid-xl font-black tracking-tight text-foreground mt-1">
                      MASTER WITH TEMPLATES
                    </h2>
                    <p className="text-fluid-sm text-muted-foreground/60 mt-1 leading-relaxed">
                      Guided exercises &middot; Step-by-step &middot; Build speed &amp; accuracy
                    </p>
                    <div className="flex items-center gap-3 mt-4">
                      <button
                        type="button"
                        onClick={() => router.push("/dashboard/practice?type=templates")}
                        className="flex items-center gap-2 rounded-lg bg-chart-4 px-4 py-3 text-fluid-xs font-bold tracking-wide text-white transition-all hover:opacity-90 active:scale-95 focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <Play size={12} />
                        PRACTICE NOW
                      </button>
                      <div className="flex items-center gap-1.5 text-fluid-xs text-muted-foreground/50">
                        <Clock size={10} /> 5&ndash;15 min each
                      </div>
                    </div>
                  </div>

                {/* Learn a New Technique CTA */}
                <div
                  ref={animateSection} data-section-index={1}
                  className="relative overflow-hidden rounded-lg p-5 border border-chart-3/20 bg-gradient-to-br from-chart-3/[0.04] to-background"
                >
                  <div
                    className="absolute top-0 left-0 w-28 h-28 opacity-10 rounded-full"
                    style={{ background: "#22c55e", filter: "blur(36px)" }}
                  />
                  <p className="text-fluid-xs font-semibold tracking-[0.15em] text-chart-3">
                    TECHNIQUE LIBRARY
                  </p>
                  <h2 className="text-fluid-xl font-black tracking-tight text-foreground mt-1">
                    LEARN A TECHNIQUE
                  </h2>
                  <p className="text-fluid-sm text-muted-foreground/60 mt-1 leading-relaxed">
                    Browse core methods &middot; Visual breakdowns &middot; Master each approach
                  </p>
                  <div className="flex items-center gap-3 mt-4">
                    <button
                      type="button"
                      onClick={() => router.push("/dashboard/explorer")}
                      className="flex items-center gap-2 rounded-lg bg-chart-3 px-4 py-3 text-fluid-xs font-bold tracking-wide text-white transition-all hover:opacity-90 active:scale-95 focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      EXPLORE TECHNIQUES
                    </button>
                    <div className="flex items-center gap-1.5 text-fluid-xs text-muted-foreground/50">
                      <Play size={10} /> 5&ndash;15 min each
                    </div>
                  </div>
                </div>

                {/* Topic Mastery */}
                <div
                  ref={animateSection} data-section-index={2}
                  className="rounded-lg p-5 bg-card border border-border"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-fluid-lg font-bold tracking-[0.08em] text-foreground">
                      TOPIC MASTERY
                    </h3>
                    <button
                      type="button"
                      onClick={() => router.push("/dashboard/mastery")}
                      className="flex items-center gap-1 text-fluid-sm text-primary outline-none focus-visible:ring-2 focus-visible:ring-ring rounded min-h-[44px]"
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
                  ref={animateSection} data-section-index={3}
                  className="rounded-lg p-5 bg-card border border-border"
                >
                  <h3 className="text-fluid-lg font-bold tracking-[0.08em] text-foreground mb-3">
                    RECENT ACTIVITY
                  </h3>
                  <div className="flex flex-col gap-0">
                    {recent.length === 0 ? (
                      <p className="py-4 text-center text-fluid-sm text-muted-foreground/60">
                        No recent activity yet.
                      </p>
                    ) : (
                      recent.map((a, i) => (
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
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Right col */}
              <div className="flex flex-col gap-4 w-full lg:w-80 shrink-0">
                {/* Cognitive Radar */}
                <div
                  ref={animateSection} data-section-index={4}
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mt-2">
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
                  ref={animateSection} data-section-index={5}
                  className="rounded-lg p-4 bg-card border border-border"
                >
                  <h3 className="text-fluid-base font-bold tracking-[0.1em] text-foreground mb-2">
                    UPCOMING
                  </h3>
                  <div className="flex flex-col gap-2">
                    {upcoming.length === 0 ? (
                      <p className="py-2 text-center text-fluid-sm text-muted-foreground/60">
                        No upcoming events.
                      </p>
                    ) : (
                      upcoming.map((e, i) => (
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
                      ))
                    )}
                  </div>
                </div>

                {/* Leaderboard */}
                <div
                  ref={animateSection} data-section-index={6}
                  className="rounded-lg p-4 bg-card border border-border"
                >
                  <h3 className="text-fluid-base font-bold tracking-[0.1em] text-foreground mb-2">
                    LEADERBOARD
                  </h3>
                  <div className="flex flex-col gap-1">
                    {leaderboard.length === 0 ? (
                      <p className="py-2 text-center text-fluid-sm text-muted-foreground/60">
                        No leaderboard data yet.
                      </p>
                    ) : (
                      leaderboard.map((u) => (
                        <div
                          key={u.rank}
                          className={cn(
                            "flex items-center gap-2 px-2 py-1.5 rounded",
                            u.me && "bg-primary/5 border border-primary/15",
                          )}
                        >
                          <span
                            className={cn(
                              "text-fluid-xs font-mono w-4",
                              u.rank <= 3 ? "text-primary" : "text-muted-foreground/50",
                            )}
                          >
                            #{u.rank}
                          </span>
                          <span
                            className={cn(
                              "flex-1 text-fluid-sm",
                              u.me ? "font-bold text-primary" : "text-muted-foreground",
                            )}
                          >
                            {u.name}
                          </span>
                          <span className="text-fluid-xs font-mono text-muted-foreground/40">
                            {u.xp.toLocaleString()}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
  );
}
