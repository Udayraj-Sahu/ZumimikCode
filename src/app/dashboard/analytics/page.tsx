"use client";

import { useCallback } from "react";
import gsap from "gsap";
import { TrendingUp } from "lucide-react";
import { useAnalyticsData } from "@/hooks/queries/use-analytics";
import { usePageMeta } from "@/hooks/use-page-meta";

export default function AnalyticsPage() {
  usePageMeta("Analytics — Exam Arena");
  const { data, isLoading, error } = useAnalyticsData();

  const headerRef = useCallback((el: HTMLDivElement | null) => {
    if (el) gsap.fromTo(el, { opacity: 0, y: -8 }, { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" });
  }, []);

  const animateSection = useCallback((el: HTMLDivElement | null) => {
    if (!el || el.dataset.animated) return;
    el.dataset.animated = "true";
    const i = parseInt(el.dataset.sectionIndex || "0");
    gsap.fromTo(el, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.4, delay: i * 0.08, ease: "power2.out" });
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-fluid-base text-muted-foreground">Failed to load analytics.</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-xl bg-primary px-5 py-2.5 text-fluid-xs font-bold uppercase tracking-wider text-primary-foreground outline-none transition-transform hover:scale-[1.02] active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-ring"
        >
          Retry
        </button>
      </div>
    );
  }

  const { stats, weekly, recent } = data;

  return (
      <div>
        <div
          ref={headerRef}
          className="px-6 py-5 border-b border-border text-center"
        >
          <p className="text-fluid-xs font-semibold tracking-[0.15em] text-muted-foreground/60">
            EXAM ARENA
          </p>
          <h1 className="text-fluid-2xl font-black tracking-tight text-foreground mt-0.5">
            Analytics
          </h1>
          <p className="text-fluid-sm text-muted-foreground/60 mt-0.5">
            Deep-dive performance metrics from your last {stats.totalSessions} sessions.
          </p>
        </div>

        <div className="p-6 flex flex-col gap-6">
          <div
            ref={animateSection} data-section-index={0}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3"
          >
            {[
              { label: "TOTAL SESSIONS", value: String(stats.totalSessions) },
              { label: "AVG SCORE", value: `${stats.avgScore}%` },
              { label: "BEST STREAK", value: `${stats.bestStreak}d` },
              { label: "ARENA RANK", value: `#${stats.arenaRank}` },
            ].map((s, i) => (
              <div
                key={i}
                className="rounded-lg p-4 bg-card border border-border"
              >
                <p className="text-fluid-xs font-semibold tracking-[0.12em] text-muted-foreground/60 mb-1.5">
                  {s.label}
                </p>
                <p className="text-fluid-3xl font-black tracking-tight text-primary leading-none">
                  {s.value}
                </p>
              </div>
            ))}
          </div>

          <div
            ref={animateSection} data-section-index={1}
            className="rounded-lg p-5 bg-card border border-border"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-fluid-lg font-bold tracking-[0.08em] text-foreground">
                WEEKLY ACTIVITY
              </h2>
              <TrendingUp size={13} className="text-muted-foreground/50" />
            </div>

            <div className="flex justify-between mb-1">
              {weekly.map((d) => (
                <span
                  key={d.day}
                  className="text-fluid-xs text-center flex-1 font-mono text-muted-foreground/50"
                >
                  {d.pct}%
                </span>
              ))}
            </div>

            <div className="flex items-end justify-between gap-[3px] sm:gap-1.5 h-16 sm:h-20">
              {weekly.map((d) => (
                  <div
                    key={d.day}
                    className="flex-1 rounded-t-sm bg-primary"
                  style={{ height: `${d.pct}%`, minHeight: "4px" }}
                />
              ))}
            </div>

            <div className="flex justify-between mt-1">
              {weekly.map((d) => (
                <span
                  key={d.day}
                  className="text-fluid-xs text-center flex-1 tracking-[0.05em] text-muted-foreground/50"
                >
                  {d.day}
                </span>
              ))}
            </div>
          </div>

          <div
            ref={animateSection} data-section-index={2}
            className="rounded-lg p-5 bg-card border border-border"
          >
            <h2 className="text-fluid-lg font-bold tracking-[0.08em] text-foreground mb-3">
              RECENT ACTIVITY
            </h2>
            <div className="flex flex-col">
              {recent.map((a, i) => (
                <div
                  key={i}
                  className="flex items-start justify-between py-3 border-b border-border/40"
                >
                  <div>
                    <p className="text-fluid-base font-semibold text-foreground/80">{a.title}</p>
                    <p className="text-fluid-sm text-muted-foreground/60 mt-0.5">{a.sub}</p>
                  </div>
                  <span className="text-fluid-xs font-mono text-muted-foreground/50 whitespace-nowrap ml-4">
                    {a.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
  );
}
