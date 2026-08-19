"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Grid3x3, Sigma, Pentagon, Sparkles, Plus, ArrowRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePageMeta } from "@/hooks/use-page-meta";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { useDashboardData } from "@/hooks/queries/use-dashboard";
import { DOMAIN_LABELS } from "@/lib/types/template";
import { AddPrepModal } from "@/components/learn/add-prep-modal";

const TOPIC_ICONS: Record<string, LucideIcon> = {
  "Addition": Grid3x3,
  "Subtraction": Pentagon,
  "Multiplication": Sigma,
  "Division": Grid3x3,
  "Squares": Pentagon,
  "Quantitative Aptitude": Grid3x3,
  "Logical Reasoning": Sigma,
  "Data Interpretation": Pentagon,
  "Verbal Ability": Sparkles,
  "General Knowledge": Grid3x3,
  "Problem Solving": Grid3x3,
  "Data Sufficiency": Sigma,
  "Sentence Correction": Sparkles,
  "Critical Reasoning": Pentagon,
  "Reading Comprehension": Sparkles,
  "Quantitative Reasoning": Grid3x3,
  "Verbal Reasoning": Sparkles,
  "Text Completion": Sigma,
  "Sentence Equivalence": Sparkles,
  "Numerical Ability": Grid3x3,
  "Reasoning Ability": Sigma,
  "English Language": Sparkles,
  "General Awareness": Grid3x3,
  "Computer Knowledge": Pentagon,
};

const TOPIC_COLORS = ["#34D399", "#22D3EE", "#A78BFA", "#FBBF24", "#FB7185"];

function getInsight(topics: { name: string; value: number }[]): string {
  if (topics.length === 0) return "Start a sprint to see your Sensei Insight.";
  const sorted = [...topics].sort((a, b) => b.value - a.value);
  const best = sorted[0];
  const worst = sorted[sorted.length - 1];
  if (best.value === worst.value) return `Consistent across all topics at ${best.value}%. Keep building!`;
  if (best.value >= 80 && worst.value >= 60) return `Strong across the board. ${best.name} (${best.value}%) leads the way.`;
  if (worst.value < 50) return `${best.name} (${best.value}%) is your strength. Focus on ${worst.name} (${worst.value}%) to close the gap.`;
  return `${best.name} (${best.value}%) leads. ${worst.name} (${worst.value}%) needs more practice.`;
}

export default function LearnPage() {
  usePageMeta("Learn — Exam Arena");
  const router = useRouter();
  const targetExam = useOnboardingStore((s) => s.targetExam);
  const [activeDomain, setActiveDomain] = useState(targetExam || "cat");
  const [showAddPrep, setShowAddPrep] = useState(false);
  const { data } = useDashboardData(activeDomain);
  const topics = data?.topics ?? [];

  return (
    <div className="px-4 pt-6 pb-24">
      <header className="mb-5">
        <p className="text-[11px] font-bold tracking-[0.15em] text-primary">
          ADAPTIVE LEARNING ENGINE
        </p>
        <h1 className="text-fluid-xl font-black tracking-tight text-foreground mt-1">
          Topic Explorer
        </h1>
        <p className="text-fluid-xs text-muted-foreground/60 mt-0.5">
          Navigate the mathematical landscape
        </p>
      </header>

      <button
        type="button"
        onClick={() => setShowAddPrep(true)}
        className="w-full rounded-full bg-foreground text-background font-bold text-fluid-sm py-3.5 flex items-center justify-center gap-2 outline-none transition-all hover:opacity-90 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-ring mb-5"
      >
        <Plus size={16} strokeWidth={3} />
        <span className="tracking-wide">ADD PREP</span>
      </button>

      <div className="rounded-2xl border border-border/40 bg-card p-5 mb-5">
        <div className="flex items-start gap-3 mb-4">
          <div className="grid size-10 place-items-center rounded-xl bg-primary/10 shrink-0">
            <Sparkles size={18} className="text-primary" />
          </div>
          <div>
            <h2 className="text-fluid-sm font-bold text-foreground leading-tight">
              Topic Explorer
            </h2>
            <p className="text-fluid-xs text-muted-foreground/60 mt-0.5">
              Navigate the mathematical landscape
            </p>
          </div>
        </div>

        <div className="rounded-xl bg-muted/30 p-4">
          <p className="text-[11px] font-bold tracking-widest text-primary mb-2">
            EXAM PREP
          </p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(DOMAIN_LABELS).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveDomain(id)}
                className={cn(
                  "text-[11px] font-semibold rounded-full px-3 py-1 transition-all outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  activeDomain === id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground/70 hover:bg-muted/80",
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 mb-5">
        {topics.map((topic, i) => {
          const Icon = TOPIC_ICONS[topic.name] || Grid3x3;
          const color = TOPIC_COLORS[i % TOPIC_COLORS.length];
          return (
            <button
              key={topic.name}
              type="button"
              onClick={() => router.push("/dashboard/explorer")}
              className="rounded-2xl border border-border/40 bg-card p-5 text-left outline-none transition-all hover:border-border hover:bg-accent/40 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-ring"
            >
              <div className="flex items-center justify-between mb-6">
                <div
                  className="grid size-9 place-items-center rounded-lg"
                  style={{ backgroundColor: `${color}1A` }}
                >
                  <Icon size={16} style={{ color }} />
                </div>
                <span className="text-fluid-xs text-muted-foreground/60 font-mono">
                  {topic.value}%
                </span>
              </div>
              <h3 className="text-fluid-sm font-bold text-foreground mb-3">
                {topic.name}
              </h3>
              <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${topic.value}%`, backgroundColor: color }}
                />
              </div>
            </button>
          );
        })}
      </div>

      <div className="relative rounded-2xl border border-border/40 bg-card p-5 pl-6 overflow-hidden">
        <div className="absolute left-0 top-0 h-full w-1 bg-chart-2" />
        <div className="flex items-center gap-2 mb-3">
          <div className="grid size-8 place-items-center rounded-lg bg-chart-2/10">
            <Sparkles size={14} className="text-chart-2" />
          </div>
          <div className="flex-1 flex items-center justify-between">
            <p className="text-[11px] font-bold tracking-widest text-chart-2">
              SENSEI INSIGHT
            </p>
          </div>
        </div>
        <p className="italic text-fluid-sm text-foreground/80 leading-relaxed">
          &ldquo;{getInsight(topics)}&rdquo;
        </p>
      </div>

      <button
        type="button"
        onClick={() => router.push("/dashboard/explorer")}
        className="w-full mt-5 rounded-2xl border border-border/40 bg-card py-4 flex items-center justify-center gap-2 text-fluid-sm font-bold text-foreground/80 outline-none transition-all hover:bg-accent/40 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-ring"
      >
        EXPLORE TECHNIQUES
        <ArrowRight size={14} />
      </button>

      {showAddPrep && (
        <AddPrepModal onClose={() => setShowAddPrep(false)} />
      )}
    </div>
  );
}
