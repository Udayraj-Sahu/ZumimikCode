"use client";

import { useCallback, useRef, useEffect } from "react";
import gsap from "gsap";
import {
  Flame, Target, Zap, Swords, Medal, Trophy, LayoutGrid, Timer, Users,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAchievements } from "@/hooks/queries/use-achievements";
import type { AchievementItem } from "@/lib/types/achievements";

const ICON_MAP: Record<string, LucideIcon> = {
  Flame, Target, Zap, Swords, Medal, Trophy, LayoutGrid, Timer, Users,
};

function AchievementCard({ item, index }: { item: AchievementItem; index: number }) {
  const Icon = ICON_MAP[item.icon] ?? Flame;

  return (
    <div
      data-achievement-card
      className={cn(
        "rounded-xl border p-4 flex flex-col items-center text-center transition-all",
        item.unlocked
          ? "border-border/40 bg-card"
          : "border-dashed border-border/20 bg-card/50 opacity-50",
      )}
    >
      <div className={cn(
        "grid size-10 place-items-center rounded-lg mb-3",
        item.unlocked ? "bg-primary/10" : "bg-muted",
      )}>
        <Icon size={20} className={item.unlocked ? "text-primary" : "text-muted-foreground/40"} />
      </div>
      <p className={cn(
        "text-fluid-sm font-bold tracking-wide",
        item.unlocked ? "text-foreground" : "text-muted-foreground/60",
      )}>
        {item.label}
      </p>
      <p className="text-fluid-xs text-muted-foreground/50 mt-0.5 leading-tight">
        {item.description}
      </p>
      {item.unlocked && (
        <span className="mt-2 text-fluid-xs font-bold text-primary">Unlocked</span>
      )}
      {!item.unlocked && item.progress !== undefined && item.progress > 0 && (
        <div className="mt-3 w-full">
          <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary/60"
              style={{ width: `${item.progress}%` }}
            />
          </div>
          <p className="mt-1 text-fluid-xs text-muted-foreground/40 font-mono">{item.progress}%</p>
        </div>
      )}
    </div>
  );
}

export default function AchievementsPage() {
  const { data: achievements, isLoading, error } = useAchievements();
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
    if (gridRef.current && achievements && achievements.length > 0) {
      const cards = gridRef.current.querySelectorAll<HTMLElement>("[data-achievement-card]");
      if (cards.length) {
        gsap.fromTo(cards, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.35, stagger: 0.05, ease: "power2.out" });
      }
    }
  }, [achievements]);

  const unlocked = achievements?.filter((a) => a.unlocked).length ?? 0;
  const total = achievements?.length ?? 0;

  return (
    <div className="px-4 sm:px-6 pt-6 pb-10">
      {/* Header */}
      <div ref={headerRef}>
        <p className="text-fluid-xs font-semibold tracking-[0.15em] text-muted-foreground/60">EXAM ARENA</p>
        <h1 className="text-fluid-2xl font-black tracking-tight text-foreground">Achievements</h1>
        <p className="text-fluid-sm text-muted-foreground/60">
          {total > 0 ? `${unlocked}/${total} unlocked` : "Unlock badges as you train"}
        </p>
      </div>

      {/* Progress bar */}
      {total > 0 && (
        <div ref={animateSection} data-section-index="0" className="mt-5">
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-700"
              style={{ width: `${(unlocked / total) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Content */}
      <div ref={animateSection} data-section-index="1" className="mt-6">
        {isLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-36 rounded-xl bg-card animate-pulse" />
            ))}
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
            <p className="text-fluid-sm font-semibold text-destructive">Failed to load achievements</p>
            <p className="mt-1 text-fluid-xs text-muted-foreground/60">{error instanceof Error ? error.message : "Something went wrong"}</p>
          </div>
        )}

        {achievements && achievements.length === 0 && (
          <div className="py-10 text-center">
            <p className="text-fluid-sm text-muted-foreground/60">No achievements yet. Complete sprints to unlock them!</p>
          </div>
        )}

        {achievements && achievements.length > 0 && (
          <div ref={gridRef} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {achievements.map((item, i) => (
              <AchievementCard key={item.id} item={item} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
