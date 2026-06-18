"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSprintTopics } from "@/hooks/queries/use-sprint";

export default function ConfigureSprintPage() {
  const router = useRouter();
  const { data, isLoading } = useSprintTopics();
  const [topic, setTopic] = useState("addition");
  const [length, setLength] = useState(10);
  const [difficulty, setDifficulty] = useState("Beginner");

  const headerRef = useCallback((el: HTMLDivElement | null) => {
    if (el) gsap.fromTo(el, { opacity: 0, y: -8 }, { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" });
  }, []);

  const animateSection = useCallback((el: HTMLDivElement | null) => {
    if (!el || el.dataset.animated) return;
    el.dataset.animated = "true";
    const i = parseInt(el.dataset.sectionIndex || "0");
    gsap.fromTo(el, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.45, delay: 0.1 + i * 0.1, ease: "power2.out" });
  }, []);

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const { topics, config } = data;

  return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div ref={headerRef} className="pt-5 pb-4 border-b border-border mb-6">
          <p className="text-fluid-xs font-semibold tracking-[0.15em] text-muted-foreground/60">
            EXAM ARENA
          </p>
          <h1 className="mt-0.5 text-fluid-2xl font-black tracking-tight text-foreground">
            Configure Sprint
          </h1>
          <p className="mt-0.5 text-fluid-sm text-muted-foreground/60">
            Choose your topic, duration, and difficulty level.
          </p>
        </div>

        <section
          ref={animateSection} data-section-index={0}
          aria-label="Choose your topic"
        >
          <div className="mb-4 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1 text-fluid-xs font-bold uppercase tracking-wider text-primary">
              Step 1
            </span>
            <h2 className="text-fluid-sm font-bold uppercase tracking-[0.15em] text-muted-foreground/80">
              Topic
            </h2>
          </div>
          <div
            role="radiogroup"
            aria-label="Choose your topic"
            className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3"
          >
            {topics.map((t) => {
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
                    "relative flex flex-col items-center justify-center gap-2 rounded-2xl border p-4 outline-none transition-all duration-200 focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.97] sm:gap-3 sm:p-6",
                    active
                      ? "border-primary bg-accent shadow-[0_0_0_1px_var(--primary),0_0_24px_-4px_var(--primary)]"
                      : "border-border/60 bg-card hover:border-border hover:bg-accent/40",
                  )}
                >
                  <Icon
                    className={cn("size-6 sm:size-8", active ? "text-primary" : t.color)}
                    aria-hidden="true"
                  />
                  <span className="text-center text-[11px] font-bold uppercase tracking-wide sm:text-fluid-sm">
                    {t.label}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:gap-6 sm:mt-10">
          <section
            ref={animateSection} data-section-index={1}
            className="flex-1"
          >
            <div className="mb-4 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1 text-fluid-xs font-bold uppercase tracking-wider text-primary">
                Step 2
              </span>
              <h2 className="text-fluid-sm font-bold uppercase tracking-[0.15em] text-muted-foreground/80">
                Duration
              </h2>
            </div>
            <div
              role="radiogroup"
              aria-label="Session length"
              className="flex gap-2.5 sm:gap-3"
            >
              {config.lengths.map((m) => {
                const active = length === m;
                return (
                  <button
                    key={m}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setLength(m)}
                    className={cn(
                      "relative flex flex-1 flex-col items-center gap-1 rounded-2xl border py-4 outline-none transition-all duration-200 focus-visible:ring-2 focus-visible:ring-ring sm:py-5",
                      active
                        ? "border-primary bg-accent shadow-[0_0_0_1px_var(--primary),0_0_24px_-4px_var(--primary)]"
                        : "border-border/60 bg-card text-muted-foreground hover:border-border hover:bg-accent/40",
                    )}
                  >
                    <span className="text-fluid-xl font-black italic tracking-tight sm:text-fluid-2xl">{m}</span>
                    <span className="text-fluid-xs font-bold uppercase tracking-widest">
                      min
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <section
            ref={animateSection} data-section-index={2}
            className="flex-1"
          >
            <div className="mb-4 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1 text-fluid-xs font-bold uppercase tracking-wider text-primary">
                Step 3
              </span>
              <h2 className="text-fluid-sm font-bold uppercase tracking-[0.15em] text-muted-foreground/80">
                Difficulty
              </h2>
            </div>
            <div
              role="radiogroup"
              aria-label="Difficulty"
              className="flex gap-2.5 sm:gap-3"
            >
              {config.difficulties.map((d) => {
                const active = difficulty === d;
                return (
                  <button
                    key={d}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setDifficulty(d)}
                    className={cn(
                      "relative flex flex-1 flex-col items-center gap-1 rounded-2xl border py-4 outline-none transition-all duration-200 focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.97] sm:py-5",
                      active
                        ? "border-primary bg-accent shadow-[0_0_0_1px_var(--primary),0_0_24px_-4px_var(--primary)]"
                        : "border-border/60 bg-card text-muted-foreground hover:border-border hover:bg-accent/40",
                    )}
                  >
                    <span className="text-fluid-sm font-extrabold uppercase tracking-wider sm:text-fluid-base">
                      {d}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        <div ref={animateSection} data-section-index={3} className="mt-8 sm:mt-10">
          <button
            type="button"
            onClick={() =>
              router.push(`/dashboard?topic=${topic}&length=${length}&difficulty=${difficulty.toLowerCase()}`)
            }
            className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-primary/60 py-4 text-fluid-base font-bold uppercase tracking-widest text-primary-foreground outline-none transition-transform hover:scale-[1.01] active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-ring sm:text-fluid-lg"
          >
            <span className="absolute inset-0 translate-y-full bg-gradient-to-r from-primary/0 via-white/10 to-primary/0 transition-transform duration-500 group-hover:translate-y-0" />
            <span className="relative flex items-center gap-3">
              Start Sprint
              <ArrowRight className="size-5 transition-transform duration-300 group-hover:translate-x-1" />
            </span>
          </button>
        </div>
      </div>
  );
}
