"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import gsap from "gsap";
import { FileText, Download, Zap, Target, TrendingUp, Clock, Award } from "lucide-react";
import { cn } from "@/lib/utils";
import { useReports } from "@/hooks/queries/use-reports";
import { usePageMeta } from "@/hooks/use-page-meta";

function formatTime(s: number): string {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export default function ReportsPage() {
  usePageMeta("Reports — Exam Arena");
  const { data, isLoading, error } = useReports();
  const [period, setPeriod] = useState<"7d" | "30d" | "90d">("30d");
  const gridRef = useRef<HTMLDivElement>(null);
  const topicRef = useRef<HTMLDivElement>(null);

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
      const cards = gridRef.current.querySelectorAll<HTMLElement>("[data-stat-card]");
      if (cards.length) {
        gsap.fromTo(cards, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.35, stagger: 0.06, ease: "power2.out" });
      }
    }
  }, [data, period]);

  useEffect(() => {
    if (topicRef.current && data) {
      const rows = topicRef.current.querySelectorAll<HTMLElement>("[data-topic-row]");
      if (rows.length) {
        gsap.fromTo(rows, { opacity: 0, x: -8 }, { opacity: 1, x: 0, duration: 0.3, stagger: 0.05, ease: "power2.out" });
      }
    }
  }, [data, period]);

  return (
    <div className="px-4 sm:px-6 pt-6 pb-10">
      <div ref={headerRef}>
        <p className="text-fluid-xs font-semibold tracking-[0.15em] text-muted-foreground/60">EXAM ARENA</p>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-fluid-2xl font-black tracking-tight text-foreground">Reports</h1>
            <p className="text-fluid-sm text-muted-foreground/60">Detailed performance analytics</p>
          </div>
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-fluid-xs font-bold uppercase tracking-wider text-primary-foreground outline-none transition-transform hover:scale-[1.05] active:scale-[0.95] focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Download size={14} /> Export
          </button>
        </div>
      </div>

      <div ref={animateSection} data-section-index="0" className="mt-5 flex gap-2">
        {(["7d", "30d", "90d"] as const).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPeriod(p)}
            className={cn(
              "rounded-lg px-4 py-2 text-fluid-xs font-bold uppercase tracking-wider outline-none transition-all focus-visible:ring-2 focus-visible:ring-ring",
              period === p
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground",
            )}
          >
            {p}
          </button>
        ))}
      </div>

      <div ref={animateSection} data-section-index="1" className="mt-6">
        {isLoading && (
          <div className="animate-pulse space-y-4">
            <div className="h-24 rounded-xl bg-card" />
            <div className="h-48 rounded-xl bg-card" />
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
            <p className="text-fluid-sm font-semibold text-destructive">Failed to load reports</p>
          </div>
        )}

        {data && (
          <>
            {/* Summary stats */}
            <div ref={gridRef} className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <div data-stat-card className="rounded-xl border border-border/40 bg-card p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Zap size={14} className="text-primary" />
                  <p className="text-fluid-xs text-muted-foreground/50 font-semibold tracking-wider">SPRINTS</p>
                </div>
                <p className="text-fluid-2xl font-black text-foreground">{data.summary.totalSprints}</p>
              </div>
              <div data-stat-card className="rounded-xl border border-border/40 bg-card p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Award size={14} className="text-chart-2" />
                  <p className="text-fluid-xs text-muted-foreground/50 font-semibold tracking-wider">TOTAL XP</p>
                </div>
                <p className="text-fluid-2xl font-black text-primary">{data.summary.totalXP.toLocaleString()}</p>
              </div>
              <div data-stat-card className="rounded-xl border border-border/40 bg-card p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Target size={14} className="text-chart-3" />
                  <p className="text-fluid-xs text-muted-foreground/50 font-semibold tracking-wider">AVG ACC.</p>
                </div>
                <p className="text-fluid-2xl font-black text-foreground">{data.summary.avgAccuracy}%</p>
              </div>
              <div data-stat-card className="rounded-xl border border-border/40 bg-card p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Clock size={14} className="text-chart-4" />
                  <p className="text-fluid-xs text-muted-foreground/50 font-semibold tracking-wider">TOTAL TIME</p>
                </div>
                <p className="text-fluid-2xl font-black text-foreground">{formatTime(data.summary.totalTime)}</p>
              </div>
            </div>

            {/* Topic breakdown */}
            <p className="text-fluid-xs font-bold uppercase tracking-widest text-muted-foreground/50 mb-3">Topic Breakdown</p>
            <div ref={topicRef} className="rounded-xl border border-border/40 bg-card divide-y divide-border/40 overflow-hidden">
              {data.topics.map((t) => (
                <div
                  key={t.topic}
                  data-topic-row
                  className="flex items-center gap-3 px-4 py-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-fluid-sm font-semibold text-foreground/80">{t.label}</p>
                    <div className="flex items-center gap-3 text-fluid-xs text-muted-foreground/40 mt-0.5">
                      <span>{t.sprints} sprints</span>
                      <span>{t.xp} XP</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="w-16 sm:w-24 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          t.accuracy >= 80 ? "bg-primary" : t.accuracy >= 60 ? "bg-chart-3" : "bg-destructive",
                        )}
                        style={{ width: `${t.accuracy}%` }}
                      />
                    </div>
                    <span className={cn(
                      "text-fluid-sm font-bold font-mono w-8 text-right",
                      t.accuracy >= 80 ? "text-primary" : t.accuracy >= 60 ? "text-chart-3" : "text-destructive",
                    )}>
                      {t.accuracy}%
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Best accuracy highlight */}
            <div className="mt-6 rounded-xl border border-primary/30 bg-primary/5 p-4 flex items-center gap-3">
              <Award size={20} className="text-primary shrink-0" />
              <div>
                <p className="text-fluid-sm font-bold text-primary">Best Accuracy: {data.summary.bestAccuracy}%</p>
                <p className="text-fluid-xs text-muted-foreground/60 mt-0.5">Keep pushing for perfection!</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
