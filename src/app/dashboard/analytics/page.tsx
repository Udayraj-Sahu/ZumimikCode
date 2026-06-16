"use client";

import { useCallback } from "react";
import gsap from "gsap";
import { TrendingUp } from "lucide-react";

const weeklyData = [
  { day: "MON", pct: 80 },
  { day: "TUE", pct: 62 },
  { day: "WED", pct: 78 },
  { day: "THU", pct: 90 },
  { day: "FRI", pct: 68 },
  { day: "SAT", pct: 73 },
  { day: "SUN", pct: 88 },
];

const recentActivity = [
  { title: "Completed Sprint", sub: "Quantitative Aptitude — 92%", time: "2H AGO" },
  { title: "New High Score", sub: "Logical Reasoning — 79%", time: "1D AGO" },
  { title: "Streak Milestone", sub: "12-Day Streak Achieved", time: "2D AGO" },
  { title: "Rank Up", sub: "Climbed to #47 in Arena Rankings", time: "3D AGO" },
];

export default function AnalyticsPage() {
  const headerRef = useCallback((el: HTMLDivElement | null) => {
    if (el) gsap.fromTo(el, { opacity: 0, y: -8 }, { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" });
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
          className="px-6 py-5 border-b border-border"
        >
          <p className="text-fluid-xs font-semibold tracking-[0.15em] text-muted-foreground/60">
            EXAM ARENA
          </p>
          <h1 className="text-fluid-2xl font-black tracking-tight text-foreground mt-0.5">
            Analytics
          </h1>
          <p className="text-fluid-sm text-muted-foreground/60 mt-0.5">
            Deep-dive performance metrics from your last 47 sessions.
          </p>
        </div>

        <div className="p-6 flex flex-col gap-6">
          {/* Stat cards */}
          <div
            ref={animateSection} data-section-index={0}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3"
          >
            {[
              { label: "TOTAL SESSIONS", value: "47" },
              { label: "AVG SCORE", value: "82%" },
              { label: "BEST STREAK", value: "12d" },
              { label: "ARENA RANK", value: "#47" },
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

          {/* Weekly Activity */}
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

            {/* Percentages row */}
            <div className="flex justify-between mb-1">
              {weeklyData.map((d) => (
                <span
                  key={d.day}
                  className="text-fluid-xs text-center flex-1 font-mono text-muted-foreground/50"
                >
                  {d.pct}%
                </span>
              ))}
            </div>

            {/* Bar chart */}
            <div className="flex items-end justify-between gap-[2px] sm:gap-1" style={{ height: "60px" }}>
              {weeklyData.map((d) => (
                <div
                  key={d.day}
                  className="flex-1 mx-[1px] sm:mx-0.5 rounded-t-sm bg-primary"
                  style={{ height: `${d.pct}%`, minHeight: "4px" }}
                />
              ))}
            </div>

            {/* Day labels */}
            <div className="flex justify-between mt-1">
              {weeklyData.map((d) => (
                <span
                  key={d.day}
                  className="text-fluid-xs text-center flex-1 tracking-[0.05em] text-muted-foreground/30"
                >
                  {d.day}
                </span>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div
            ref={animateSection} data-section-index={2}
            className="rounded-lg p-5 bg-card border border-border"
          >
            <h2 className="text-fluid-lg font-bold tracking-[0.08em] text-foreground mb-3">
              RECENT ACTIVITY
            </h2>
            <div className="flex flex-col">
              {recentActivity.map((a, i) => (
                <div
                  key={i}
                  className="flex items-start justify-between py-3 border-b border-border/40"
                >
                  <div>
                    <p className="text-fluid-base font-semibold text-foreground/80">{a.title}</p>
                    <p className="text-fluid-sm text-muted-foreground/60 mt-0.5">{a.sub}</p>
                  </div>
                  <span className="text-fluid-xs font-mono text-muted-foreground/30 whitespace-nowrap ml-4">
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
