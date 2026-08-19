"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trophy, Puzzle, Brain, Zap, Clock, Flame, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePageMeta } from "@/hooks/use-page-meta";

const TABS = [
  { id: "math", label: "Math", icon: Zap, color: "text-chart-3" },
  { id: "puzzle", label: "Puzzle", icon: Puzzle, color: "text-primary" },
  { id: "memory", label: "Memory", icon: Brain, color: "text-chart-2" },
  { id: "logic", label: "Logic", icon: Trophy, color: "text-chart-4" },
] as const;

type TabId = (typeof TABS)[number]["id"];

type ModeCard = {
  id: string;
  category: string;
  title: string;
  desc: string;
  accentClass: string;
  icon: LucideIcon;
  badge?: string;
  href?: string;
};

const MATH_MODES: ModeCard[] = [
  {
    id: "sprint",
    category: "MATH",
    title: "SPRINT DUELS",
    desc: "RACE TO SOLVE THE MOST IN 1 MINUTE.",
    accentClass: "text-chart-3",
    icon: Clock,
    href: "/dashboard/configure-sprint",
  },
  {
    id: "fast",
    category: "MATH",
    title: "FAST & FIRST DUELS",
    desc: "BE THE FIRST TO ANSWER EACH QUESTION.",
    accentClass: "text-primary",
    icon: Flame,
    badge: "2S",
    href: "/dashboard/duel",
  },
];

const MODES_BY_TAB: Record<TabId, ModeCard[]> = {
  math: MATH_MODES,
  puzzle: [],
  memory: [],
  logic: [],
};

const COMING_SOON_LABEL: Record<TabId, string> = {
  math: "",
  puzzle: "Puzzle modes coming soon",
  memory: "Memory modes coming soon",
  logic: "Logic modes coming soon",
};

function ModeCardButton({ mode }: { mode: ModeCard }) {
  const router = useRouter();
  const Icon = mode.icon;

  return (
    <button
      type="button"
      onClick={() => mode.href && router.push(mode.href)}
      className="relative w-full rounded-2xl border border-border/40 bg-card p-5 text-left outline-none transition-all hover:border-border hover:bg-accent/40 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-ring overflow-hidden"
    >
      <div className="flex items-center justify-between mb-3">
        <span className={cn(
          "text-[10px] font-extrabold tracking-widest border rounded-md px-2 py-0.5",
          mode.accentClass,
          "border-current",
        )}>
          {mode.category}
        </span>
        {mode.badge && (
          <span className={cn(
            "text-[10px] font-extrabold rounded-md px-2 py-0.5 bg-primary text-primary-foreground",
          )}>
            {mode.badge}
          </span>
        )}
      </div>

      <h2 className="text-fluid-lg font-black tracking-tight text-foreground mb-1">
        {mode.title}
      </h2>
      <p className="text-fluid-xs text-muted-foreground/60 font-semibold tracking-wide max-w-[78%]">
        {mode.desc}
      </p>

      <div className={cn("absolute right-5 bottom-4 opacity-80", mode.accentClass)}>
        <Icon size={34} strokeWidth={2} />
      </div>
    </button>
  );
}

export default function PlayPage() {
  usePageMeta("Play — Exam Arena");
  const [activeTab, setActiveTab] = useState<TabId>("math");
  const modes = MODES_BY_TAB[activeTab];
  const comingSoon = COMING_SOON_LABEL[activeTab];

  return (
    <div className="px-4 pt-6 pb-24">
      <header className="mb-5">
        <h1 className="text-fluid-sm font-extrabold tracking-[0.15em] text-muted-foreground/60">
          DUELS
        </h1>
      </header>

      <nav className="flex gap-2 mb-6">
        {TABS.map((tab) => {
          const isActive = tab.id === activeTab;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex-1 flex flex-col items-center gap-1.5 py-2.5 rounded-2xl outline-none transition-all",
                "focus-visible:ring-2 focus-visible:ring-ring",
                isActive ? "bg-accent" : "bg-transparent",
              )}
            >
              <span className={cn(
                "grid size-8 place-items-center rounded-xl transition-colors",
                isActive ? "bg-foreground text-background" : "bg-muted text-muted-foreground/50",
              )}>
                <Icon size={15} strokeWidth={2.5} />
              </span>
              <span className={cn(
                "text-[10px] font-bold tracking-wide transition-colors",
                isActive ? tab.color : "text-muted-foreground/50",
              )}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>

      <main className="flex flex-col gap-3">
        {modes.length > 0 ? (
          modes.map((mode) => <ModeCardButton key={mode.id} mode={mode} />)
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="grid size-16 place-items-center rounded-2xl bg-muted/50 mb-4">
              <Trophy size={28} className="text-muted-foreground/30" />
            </div>
            <p className="text-fluid-sm font-semibold text-muted-foreground/60">
              {comingSoon}
            </p>
            <p className="text-fluid-xs text-muted-foreground/40 mt-1">
              Stay tuned for new game modes
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
