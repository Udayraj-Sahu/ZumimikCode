"use client";

import { useCallback, useRef, useEffect } from "react";
import gsap from "gsap";
import { Calendar, Zap, Flame, Target, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePlanner } from "@/hooks/queries/use-planner";
import { usePageMeta } from "@/hooks/use-page-meta";

export default function PlannerPage() {
  usePageMeta("Study Planner — Exam Arena");
  const { data, isLoading, error } = usePlanner();
  const gridRef = useRef<HTMLDivElement>(null);

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
    if (gridRef.current && data) {
      const cards = gridRef.current.querySelectorAll<HTMLElement>("[data-day-card]");
      if (cards.length) {
        gsap.fromTo(cards, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.35, stagger: 0.06, ease: "power2.out" });
      }
    }
  }, [data]);

  return (
    <div className="px-4 sm:px-6 pt-6 pb-10">
      {/* Header */}
      <div ref={headerRef}>
        <p className="text-fluid-xs font-semibold tracking-[0.15em] text-muted-foreground/60">EXAM ARENA</p>
        <h1 className="text-fluid-2xl font-black tracking-tight text-foreground">Study Planner</h1>
        <p className="text-fluid-sm text-muted-foreground/60">Plan your sprints and track consistency</p>
      </div>

      {/* Content */}
      <div ref={animateSection} data-section-index="0" className="mt-6">
        {isLoading && (
          <div className="animate-pulse space-y-4">
            <div className="h-24 rounded-xl bg-card" />
            <div className="h-48 rounded-xl bg-card" />
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
            <p className="text-fluid-sm font-semibold text-destructive">Failed to load planner data</p>
          </div>
        )}

        {data && (
          <>
            {/* Stats summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <div className="rounded-xl border border-border/40 bg-card p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Flame size={14} className="text-primary" />
                  <p className="text-fluid-xs text-muted-foreground/50 font-semibold tracking-wider">STREAK</p>
                </div>
                <p className="text-fluid-2xl font-black text-foreground">{data.stats.weekStreak}d</p>
              </div>
              <div className="rounded-xl border border-border/40 bg-card p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Target size={14} className="text-chart-2" />
                  <p className="text-fluid-xs text-muted-foreground/50 font-semibold tracking-wider">PLANNED</p>
                </div>
                <p className="text-fluid-2xl font-black text-foreground">{data.stats.totalPlanned}</p>
              </div>
              <div className="rounded-xl border border-border/40 bg-card p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Zap size={14} className="text-chart-3" />
                  <p className="text-fluid-xs text-muted-foreground/50 font-semibold tracking-wider">DONE</p>
                </div>
                <p className="text-fluid-2xl font-black text-foreground">{data.stats.totalCompleted}</p>
              </div>
              <div className="rounded-xl border border-border/40 bg-card p-4">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp size={14} className="text-chart-4" />
                  <p className="text-fluid-xs text-muted-foreground/50 font-semibold tracking-wider">RATE</p>
                </div>
                <p className="text-fluid-2xl font-black text-foreground">{data.stats.completionRate}%</p>
              </div>
            </div>

            {/* Week days */}
            <p className="text-fluid-xs font-bold uppercase tracking-widest text-muted-foreground/50 mb-3">This Week</p>
            <div ref={gridRef} className="flex gap-2 overflow-x-auto pb-2 sm:grid sm:grid-cols-7 sm:overflow-x-visible sm:pb-0">
              {data.days.map((day) => {
                const pct = day.planned > 0 ? Math.round((day.completed / day.planned) * 100) : 0;
                return (
                  <div
                    key={day.date}
                    data-day-card
                    className={cn(
                      "rounded-xl border p-2 sm:p-3 flex flex-col items-center text-center transition-all shrink-0 w-[72px] sm:w-auto",
                      day.isToday
                        ? "border-primary bg-primary/5"
                        : "border-border/40 bg-card",
                    )}
                  >
                    <p className={cn(
                      "text-fluid-xs font-semibold mb-1",
                      day.isToday ? "text-primary" : "text-muted-foreground/40",
                    )}>
                      {day.dayLabel.slice(0, 2)}
                    </p>
                    <p className={cn(
                      "text-fluid-lg font-black",
                      day.isToday ? "text-foreground" : "text-muted-foreground/60",
                    )}>
                      {new Date(day.date).getDate()}
                    </p>
                    <div className="mt-1.5 flex items-center gap-0.5">
                      <span className={cn(
                        "text-fluid-xs font-bold font-mono",
                        day.completed >= day.planned && day.planned > 0
                          ? "text-primary"
                          : "text-muted-foreground/40",
                      )}>
                        {day.completed}
                      </span>
                      <span className="text-fluid-xs text-muted-foreground/20">/</span>
                      <span className="text-fluid-xs font-mono text-muted-foreground/40">{day.planned}</span>
                    </div>
                    {day.planned > 0 && (
                      <div className="mt-2 w-full h-1 rounded-full bg-muted overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all duration-500",
                            pct >= 100 ? "bg-primary" : "bg-chart-3/60",
                          )}
                          style={{ width: `${Math.min(100, pct)}%` }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* CTA */}
            <div className="mt-6 rounded-xl border border-border/40 bg-card p-5 text-center">
              <Calendar size={24} className="mx-auto text-muted-foreground/20 mb-2" />
              <p className="text-fluid-sm font-semibold text-foreground/80">Stay Consistent</p>
              <p className="text-fluid-xs text-muted-foreground/60 mt-1">Complete your daily planned sprints to build momentum</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
