"use client";

import { useState, useCallback } from "react";
import gsap from "gsap";
import { Trophy, Medal, ArrowUp, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLeaderboard } from "@/hooks/queries/use-leaderboard";
import type { LeaderboardEntry } from "@/lib/types/dashboard";

const PERIODS = ["week", "month", "all"] as const;

function RankMedal({ rank }: { rank: number }) {
  if (rank === 1) return <Trophy size={18} className="text-chart-3" />;
  if (rank === 2) return <Medal size={18} className="text-muted-foreground" />;
  if (rank === 3) return <Medal size={18} className="text-chart-4" />;
  return null;
}

function LeaderboardRow({ entry, index }: { entry: LeaderboardEntry; index: number }) {
  return (
    <div
      data-leaderboard-row
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
        entry.me ? "bg-primary/5 border border-primary/20" : "hover:bg-accent/20",
      )}
    >
      <span className={cn(
        "w-8 text-center text-fluid-sm font-bold font-mono",
        entry.rank <= 3 ? "text-foreground" : "text-muted-foreground/40",
        entry.me && "text-primary",
      )}>
        {entry.rank <= 3 ? <RankMedal rank={entry.rank} /> : entry.rank}
      </span>
      <div className="flex-1 min-w-0">
        <p className={cn(
          "text-fluid-sm font-semibold truncate",
          entry.me ? "text-primary" : "text-foreground/80",
        )}>
          {entry.name}
          {entry.me && <span className="ml-2 text-fluid-xs text-primary/60 font-normal">(You)</span>}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <div className="hidden sm:block w-20 h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-primary/60"
            style={{ width: `${Math.min(100, (entry.xp / 5000) * 100)}%` }}
          />
        </div>
        <span className={cn(
          "text-fluid-sm font-bold font-mono",
          entry.me ? "text-primary" : "text-foreground/80",
        )}>
          {entry.xp.toLocaleString()}
        </span>
        <span className="text-fluid-xs text-muted-foreground/40 hidden sm:inline">XP</span>
      </div>
    </div>
  );
}

export default function LeaderboardPage() {
  const [period, setPeriod] = useState<"week" | "month" | "all">("all");
  const { data: entries, isLoading, error } = useLeaderboard();

  const headerRef = useCallback((el: HTMLDivElement | null) => {
    if (el) gsap.fromTo(el, { opacity: 0, y: -8 }, { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" });
  }, []);

  const animateSection = useCallback((el: HTMLDivElement | null) => {
    if (el && !el.dataset.animated) {
      el.dataset.animated = "true";
      const index = parseInt(el.dataset.sectionIndex ?? "0", 10);
      gsap.fromTo(el, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.4, delay: index * 0.08, ease: "power2.out" });
    }
  }, []);

  const animateRows = useCallback((el: HTMLDivElement | null) => {
    if (el && !el.dataset.animated) {
      el.dataset.animated = "true";
      const cards = el.querySelectorAll<HTMLElement>("[data-leaderboard-row]");
      if (cards.length) {
        gsap.fromTo(cards, { opacity: 0, x: -8 }, { opacity: 1, x: 0, duration: 0.35, stagger: 0.03, ease: "power2.out" });
      } else {
        gsap.fromTo(el, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" });
      }
    }
  }, []);

  const me = entries?.find((e) => e.me);
  const prevRank = me ? entries?.find((e) => e.rank === me.rank - 1) : null;
  const xpToNext = prevRank && me ? prevRank.xp - me.xp : 0;

  return (
    <div className="px-4 sm:px-6 pt-6 pb-10">
      {/* Header */}
      <div ref={headerRef}>
        <p className="text-fluid-xs font-semibold tracking-[0.15em] text-muted-foreground/60">EXAM ARENA</p>
        <h1 className="text-fluid-2xl font-black tracking-tight text-foreground">Leaderboard</h1>
        <p className="text-fluid-sm text-muted-foreground/60">Track your ranking across all arenas</p>
      </div>

      {/* Period tabs */}
      <div ref={animateSection} data-section-index="0" className="mt-5 flex gap-2">
        {PERIODS.map((p) => (
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

      {/* Content */}
      <div ref={animateRows} data-section-index="1" className="mt-4">
        {isLoading && (
          <div className="animate-pulse space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-14 rounded-lg bg-card" />
            ))}
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
            <p className="text-fluid-sm font-semibold text-destructive">Failed to load leaderboard</p>
            <p className="mt-1 text-fluid-xs text-muted-foreground/60">{error instanceof Error ? error.message : "Something went wrong"}</p>
          </div>
        )}

        {entries && entries.length === 0 && (
          <div className="py-10 text-center">
            <p className="text-fluid-sm text-muted-foreground/60">No rankings yet. Complete a sprint to get on the board!</p>
          </div>
        )}

        {entries && entries.length > 0 && (
          <>
            <div className="rounded-xl border border-border/40 bg-card divide-y divide-border/40 overflow-hidden">
              {entries.map((entry, i) => (
                <LeaderboardRow key={entry.rank} entry={entry} index={i} />
              ))}
            </div>

            {/* Your rank summary */}
            {me && (
              <div ref={animateSection} data-section-index="2" className="mt-6 rounded-xl border border-border/40 bg-card p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6">
                  <div className="flex items-center gap-3">
                    <div className="grid size-10 place-items-center rounded-full bg-primary/10">
                      <Target size={18} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-fluid-sm font-bold text-foreground">Your Rank</p>
                      <p className="text-fluid-xs text-muted-foreground/60">
                        #{me.rank} of {entries.length}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 sm:gap-6 text-fluid-sm">
                    <div>
                      <span className="text-muted-foreground/60">XP: </span>
                      <span className="font-bold font-mono text-foreground">{me.xp.toLocaleString()}</span>
                    </div>
                    {xpToNext > 0 && prevRank && (
                      <div className="flex items-center gap-1 text-chart-3">
                        <ArrowUp size={14} />
                        <span className="font-bold font-mono">{xpToNext.toLocaleString()} XP</span>
                        <span className="text-muted-foreground/60 text-fluid-xs">to #{prevRank.rank}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
