"use client";
import { PageContainer } from "@/components/ui/page-container";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trophy, Puzzle, Brain, Zap, Clock, Flame, Gamepad2, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePageMeta } from "@/hooks/use-page-meta";

const GLASS_BG = "rgba(255,255,255,0.04)";
const GLASS_BORDER = "rgba(255,255,255,0.08)";

const TABS = [
  { id: "math", label: "Math", icon: Zap, color: "#F59E0B" },
  { id: "puzzle", label: "Puzzle", icon: Puzzle, color: "#C7F252" },
  { id: "memory", label: "Memory", icon: Brain, color: "#3B82F6" },
  { id: "logic", label: "Logic", icon: Trophy, color: "#A855F7" },
] as const;

type TabId = (typeof TABS)[number]["id"];

type ModeCard = {
  id: string;
  category: string;
  title: string;
  desc: string;
  color: string;
  icon: LucideIcon;
  badge?: string;
  href?: string;
};

const MATH_MODES: ModeCard[] = [
  {
    id: "sprint",
    category: "MATH",
    title: "SPRINT DUELS",
    desc: "Race to solve the most in 1 minute.",
    color: "#F59E0B",
    icon: Clock,
    href: "/play/configure-sprint",
  },
  {
    id: "fast",
    category: "MATH",
    title: "FAST & FIRST DUELS",
    desc: "Be the first to answer each question.",
    color: "#C7F252",
    icon: Flame,
    badge: "2P",
    href: "/play/duel",
  },
];

const MODES_BY_TAB: Record<TabId, ModeCard[]> = {
  math: MATH_MODES,
  puzzle: [],
  memory: [],
  logic: [],
};

const COMING_SOON: Record<TabId, string> = {
  math: "",
  puzzle: "Puzzle modes coming soon",
  memory: "Memory modes coming soon",
  logic: "Logic modes coming soon",
};

/* ------------------------------------------------------------------ */
/*  Mode card                                                           */
/* ------------------------------------------------------------------ */
function ModeCardButton({ mode }: { mode: ModeCard }) {
  const router = useRouter();
  const Icon = mode.icon;

  return (
    <button
      type="button"
      onClick={() => mode.href && router.push(mode.href)}
      className="relative w-full rounded-3xl border backdrop-blur-xl p-5 text-left transition-all hover:bg-white/[0.06] active:scale-[0.98] overflow-hidden"
      style={{ borderColor: GLASS_BORDER, background: GLASS_BG }}
    >
      <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10" style={{ background: `radial-gradient(circle, ${mode.color}, transparent)` }} />

      <div className="flex items-center justify-between mb-4 relative">
        <span
          className="text-micro font-bold tracking-[0.14em] rounded-full px-3 py-1 uppercase"
          style={{ color: mode.color, background: `${mode.color}15`, border: `1px solid ${mode.color}20` }}
        >
          {mode.category}
        </span>
        {mode.badge && (
          <span className="text-micro font-bold rounded-full px-3 py-1 bg-primary/15 text-primary border border-primary/20">
            {mode.badge}
          </span>
        )}
      </div>

      <h2 className="relative text-[17px] font-bold tracking-[-0.02em] text-foreground mb-1.5">
        {mode.title}
      </h2>
      <p className="relative text-[12px] text-muted-foreground/45 font-normal max-w-[80%] leading-relaxed">
        {mode.desc}
      </p>

      <div className="absolute right-5 bottom-4 opacity-60" style={{ color: mode.color }}>
        <Icon size={32} strokeWidth={1.8} />
      </div>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Main page                                                           */
/* ------------------------------------------------------------------ */
export default function PlayPage() {
  usePageMeta("Play — Exam Arena");
  const [activeTab, setActiveTab] = useState<TabId>("math");
  const modes = MODES_BY_TAB[activeTab];
  const comingSoon = COMING_SOON[activeTab];

  return (
    <PageContainer>
      {/* Header */}
      <header className="mb-5">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.04] backdrop-blur-sm px-4 py-1.5 mb-3">
          <Gamepad2 size={12} className="text-primary" />
          <span className="text-micro font-semibold tracking-[0.22em] text-primary/80">PLAY</span>
        </div>
        <h1 className="text-[20px] font-bold tracking-[-0.02em] text-foreground leading-tight">
          Duels &amp; Challenges
        </h1>
        <p className="text-[12px] text-muted-foreground/45 font-normal mt-1">
          Compete, learn, and climb the leaderboard
        </p>
      </header>

      {/* Tabs */}
      <nav className="grid grid-cols-4 gap-2.5 mb-5">
        {TABS.map((tab) => {
          const isActive = tab.id === activeTab;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex flex-col items-center gap-2 py-3 rounded-2xl transition-all",
                isActive
                  ? "border border-white/[0.08] bg-white/[0.06] backdrop-blur-xl shadow-lg"
                  : "border border-transparent bg-white/[0.02]"
              )}
            >
              <div
                className="h-9 w-9 rounded-xl flex items-center justify-center transition-all"
                style={{
                  background: isActive ? `${tab.color}18` : "rgba(255,255,255,0.04)",
                }}
              >
                <Icon size={16} strokeWidth={2.2} style={{ color: isActive ? tab.color : "#6B7280" }} />
              </div>
              <span
                className="text-micro font-semibold tracking-[0.02em]"
                style={{ color: isActive ? tab.color : "rgba(107,114,128,0.5)" }}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Mode Cards */}
      <main className="flex flex-col gap-3">
        {modes.length > 0 ? (
          modes.map((mode) => <ModeCardButton key={mode.id} mode={mode} />)
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center rounded-3xl border border-dashed border-white/[0.06]" style={{ background: GLASS_BG }}>
            <div className="h-14 w-14 rounded-2xl bg-white/[0.04] flex items-center justify-center mb-4">
              <Trophy size={24} className="text-muted-foreground/20" />
            </div>
            <p className="text-[14px] font-semibold text-muted-foreground/45">
              {comingSoon}
            </p>
            <p className="text-[12px] text-muted-foreground/55 mt-1.5 font-normal">
              Stay tuned for new game modes
            </p>
          </div>
        )}
      </main>
    </PageContainer>
  );
}
