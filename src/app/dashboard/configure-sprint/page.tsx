"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Zap,
  Minus,
  X,
  Percent,
  Square,
  Shuffle,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DojoShell } from "@/components/dashboard/dojo-shell";

type Topic = { id: string; label: string; icon: LucideIcon; color: string };

const TOPICS: Topic[] = [
  { id: "addition", label: "Rapid Addition", icon: Zap, color: "text-primary" },
  { id: "subtraction", label: "Fast Subtraction", icon: Minus, color: "text-secondary" },
  { id: "multiplication", label: "Speed Mult.", icon: X, color: "text-chart-4" },
  { id: "division", label: "Quick Division", icon: Percent, color: "text-chart-3" },
  { id: "squares", label: "Mental Squares", icon: Square, color: "text-chart-3" },
  { id: "mixed", label: "Mixed Challenge", icon: Shuffle, color: "text-foreground" },
];

const LENGTHS = [5, 10, 15];
const DIFFICULTIES = ["Adaptive", "Beginner", "Advanced"];

export default function ConfigureSprintPage() {
  const router = useRouter();
  const [topic, setTopic] = useState("addition");
  const [length, setLength] = useState(10);
  const [difficulty, setDifficulty] = useState("Beginner");

  return (
    <DojoShell>
      <div className="mx-auto max-w-2xl">
        <header className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Go back"
            className="grid size-10 place-items-center rounded-xl text-primary outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ArrowLeft className="size-5" aria-hidden="true" />
          </button>
          <h1 className="text-lg font-bold uppercase tracking-widest text-primary">
            Configure Sprint
          </h1>
        </header>

        <section className="mt-10">
          <h2 className="text-center text-sm font-semibold uppercase tracking-[0.25em] text-muted-foreground">
            Choose Your Topic
          </h2>
          <div
            role="radiogroup"
            aria-label="Choose your topic"
            className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3"
          >
            {TOPICS.map((t) => {
              const active = topic === t.id;
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setTopic(t.id)}
                  className={cn(
                    "flex flex-col items-center justify-center gap-3 rounded-2xl border p-5 outline-none transition-all focus-visible:ring-2 focus-visible:ring-ring",
                    active
                      ? "border-primary bg-accent shadow-[0_0_0_1px_var(--primary)]"
                      : "border-border bg-card hover:border-border/80 hover:bg-accent/50",
                  )}
                >
                  <Icon className={cn("size-7", active ? "text-primary" : t.color)} aria-hidden="true" />
                  <span className="text-center text-xs font-semibold uppercase tracking-wide">
                    {t.label}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-center text-sm font-semibold uppercase tracking-[0.25em] text-muted-foreground">
            Session Length
          </h2>
          <div role="radiogroup" aria-label="Session length" className="mt-5 grid grid-cols-3 gap-3">
            {LENGTHS.map((m) => {
              const active = length === m;
              return (
                <button
                  key={m}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setLength(m)}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-2xl border py-6 outline-none transition-all focus-visible:ring-2 focus-visible:ring-ring",
                    active
                      ? "border-primary bg-accent text-primary"
                      : "border-border bg-card text-muted-foreground hover:bg-accent/50",
                  )}
                >
                  <span className="text-4xl font-bold italic tracking-tight">{m}</span>
                  <span className="text-[10px] font-semibold uppercase tracking-widest">Minutes</span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-center text-sm font-semibold uppercase tracking-[0.25em] text-muted-foreground">
            Difficulty
          </h2>
          <div
            role="radiogroup"
            aria-label="Difficulty"
            className="mx-auto mt-5 flex max-w-md flex-wrap items-center justify-center gap-3"
          >
            {DIFFICULTIES.map((d) => {
              const active = difficulty === d;
              return (
                <button
                  key={d}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setDifficulty(d)}
                  className={cn(
                    "rounded-full px-6 py-3 text-sm font-bold uppercase tracking-widest outline-none transition-all focus-visible:ring-2 focus-visible:ring-ring",
                    active
                      ? "bg-primary text-primary-foreground shadow-[0_0_20px_-2px_var(--primary)]"
                      : "bg-card text-muted-foreground hover:bg-accent",
                  )}
                >
                  {d}
                </button>
              );
            })}
          </div>
        </section>

        <button
          type="button"
          onClick={() =>
            router.push(`/dashboard?topic=${topic}&length=${length}&difficulty=${difficulty.toLowerCase()}`)
          }
          className="mt-12 flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-primary to-secondary py-4 text-base font-bold uppercase tracking-widest text-primary-foreground outline-none transition-transform hover:scale-[1.01] focus-visible:ring-2 focus-visible:ring-ring"
        >
          Start Sprint
          <ArrowRight className="size-5" aria-hidden="true" />
        </button>
      </div>
    </DojoShell>
  );
}
