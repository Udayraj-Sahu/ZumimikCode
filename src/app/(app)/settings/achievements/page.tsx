"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import gsap from "gsap";
import { Flame, Target, Zap, Swords, Medal, Trophy, LayoutGrid, Timer, Users, ChevronRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAchievements } from "@/hooks/queries/use-achievements";
import { usePageMeta } from "@/hooks/use-page-meta";
import type { AchievementItem, AchievementTier, AchievementCategory } from "@/lib/types/achievements";

const GLASS_BG = "rgba(255,255,255,0.04)";
const GLASS_BORDER = "rgba(255,255,255,0.08)";

const ICON_MAP: Record<string, LucideIcon> = {
  Flame, Target, Zap, Swords, Medal, Trophy, LayoutGrid, Timer, Users,
};

const CATEGORIES: { id: AchievementCategory | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "streak", label: "Streak" },
  { id: "accuracy", label: "Accuracy" },
  { id: "speed", label: "Speed" },
  { id: "social", label: "Social" },
];

const TIER_STYLES: Record<AchievementTier, { ring: string; ringTrack: string; label: string }> = {
  bronze:   { ring: "#CD7F32", ringTrack: "rgba(205,127,50,0.15)", label: "Bronze" },
  silver:   { ring: "#94A3B8", ringTrack: "rgba(148,163,184,0.15)", label: "Silver" },
  gold:     { ring: "#F59E0B", ringTrack: "rgba(245,158,11,0.15)", label: "Gold" },
  platinum: { ring: "#C7F252", ringTrack: "rgba(199,242,82,0.15)", label: "Platinum" },
};

/* ------------------------------------------------------------------ */
/*  SVG Circular Progress Ring                                          */
/* ------------------------------------------------------------------ */
function ProgressRing({ progress, tier, size = 40, stroke = 3 }: { progress: number; tier: AchievementTier; size?: number; stroke?: number }) {
  const styles = TIER_STYLES[tier];
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(progress, 100) / 100) * circumference;

  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={styles.ringTrack}
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={styles.ring}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className="transition-all duration-700 ease-out"
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Achievement row                                                     */
/* ------------------------------------------------------------------ */
function AchievementRow({ item }: { item: AchievementItem }) {
  const Icon = ICON_MAP[item.icon] ?? Flame;
  const tier = TIER_STYLES[item.tier];

  const progress = item.unlocked
    ? 100
    : item.progress !== undefined && item.progress > 0
      ? item.progress
      : 0;

  return (
    <div
      data-achievement-row
      className={cn(
        "flex items-center gap-4 px-5 py-4 transition-colors",
        item.unlocked ? "bg-transparent" : "opacity-55",
      )}
    >
      {/* Ring + icon */}
      <div className="relative shrink-0">
        <ProgressRing progress={progress} tier={item.tier} />
        <div className="absolute inset-0 grid place-items-center">
          <Icon
            size={14}
            style={{ color: item.unlocked ? tier.ring : "rgba(107,114,128,0.45)" }}
          />
        </div>
      </div>

      {/* Label + description */}
      <div className="flex-1 min-w-0">
        <p className={cn("text-[13px] font-semibold tracking-[-0.01em]", item.unlocked ? "text-foreground" : "text-muted-foreground/70")}>
          {item.label}
        </p>
        <p className="mt-0.5 text-[11px] text-muted-foreground/50 font-normal leading-snug truncate">
          {item.description}
        </p>
        {!item.unlocked && progress > 0 && (
          <p className="mt-0.5 text-[10px] text-muted-foreground/40 font-mono">{progress}%</p>
        )}
      </div>

      {/* Tier badge */}
      <span
        className="shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider"
        style={{
          color: item.unlocked ? tier.ring : "rgba(107,114,128,0.45)",
          backgroundColor: item.unlocked ? `${tier.ring}12` : "rgba(255,255,255,0.03)",
        }}
      >
        {tier.label}
      </span>

      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/30" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main page                                                           */
/* ------------------------------------------------------------------ */
export default function AchievementsPage() {
  usePageMeta("Achievements — Exam Arena");
  const { data: achievements, isLoading, error } = useAchievements();
  const [activeCategory, setActiveCategory] = useState<AchievementCategory | "all">("all");
  const listRef = useRef<HTMLDivElement>(null);

  const headerRef = useCallback((el: HTMLDivElement | null) => {
    if (el) gsap.fromTo(el, { opacity: 0, y: -8 }, { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" });
  }, []);

  const animateSection = useCallback((el: HTMLDivElement | null) => {
    if (el && !el.dataset.animated) {
      el.dataset.animated = "true";
      gsap.fromTo(el, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" });
    }
  }, []);

  useEffect(() => {
    if (listRef.current) {
      const rows = listRef.current.querySelectorAll<HTMLElement>("[data-achievement-row]");
      if (rows.length) {
        gsap.fromTo(rows, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.35, stagger: 0.04, ease: "power2.out" });
      }
    }
  }, [achievements, activeCategory]);

  const filtered = useMemo(() => {
    if (!achievements) return [];
    if (activeCategory === "all") return achievements;
    return achievements.filter((a) => a.category === activeCategory);
  }, [achievements, activeCategory]);

  const unlocked = achievements?.filter((a) => a.unlocked).length ?? 0;
  const total = achievements?.length ?? 0;
  const percent = total > 0 ? Math.round((unlocked / total) * 100) : 0;

  return (
    <div className="min-h-screen px-5 pt-6 pb-4 max-w-5xl mx-auto">
      {/* Header */}
      <div ref={headerRef} className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.04] backdrop-blur-sm px-4 py-1.5 mb-3">
          <Trophy size={12} className="text-primary" />
          <span className="text-micro font-semibold tracking-[0.22em] text-primary/80">ACHIEVEMENTS</span>
        </div>
        <p className="text-[12px] text-muted-foreground/45 font-normal mt-1">
          {total > 0 ? `${unlocked}/${total} unlocked · ${percent}%` : "Unlock badges as you train"}
        </p>
      </div>

      {/* Category chips */}
      <div ref={animateSection} data-section-index="0" className="mt-5 flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setActiveCategory(cat.id)}
            className={cn(
              "shrink-0 rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider outline-none transition-all focus-visible:ring-2 focus-visible:ring-ring min-h-[28px] backdrop-blur-xl",
              activeCategory === cat.id
                ? "bg-primary text-primary-foreground"
                : "border border-white/[0.06] text-muted-foreground hover:text-foreground active:text-foreground",
            )}
            style={activeCategory !== cat.id ? { background: GLASS_BG } : undefined}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div ref={animateSection} data-section-index="1" className="mt-5">
        {isLoading && (
          <div className="animate-pulse space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-20 rounded-3xl" style={{ background: GLASS_BG }} />
            ))}
          </div>
        )}

        {error && (
          <div className="rounded-3xl border border-destructive/30 bg-destructive/5 p-6 text-center backdrop-blur-xl">
            <p className="text-[12px] font-semibold text-destructive">Failed to load achievements</p>
            <p className="mt-1 text-micro text-muted-foreground/60">{error instanceof Error ? error.message : "Something went wrong"}</p>
          </div>
        )}

        {achievements && filtered.length === 0 && (
          <div className="py-10 text-center">
            <p className="text-[12px] text-muted-foreground/60">No achievements in this category yet.</p>
          </div>
        )}

        {filtered.length > 0 && (
          <div
            ref={listRef}
            role="list"
            className="rounded-3xl border border-white/[0.06] backdrop-blur-xl divide-y divide-white/[0.06] overflow-hidden"
            style={{ background: GLASS_BG }}
          >
            {filtered.map((item) => (
              <AchievementRow key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}