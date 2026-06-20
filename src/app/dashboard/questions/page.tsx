"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import gsap from "gsap";
import { Check, X, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { SPRINT_TOPICS } from "@/lib/mock/sprint";
import { usePracticeSession } from "@/hooks/queries/use-practice";
import type { Question } from "@/lib/types/sprint-session";

export default function QuestionsPage() {
  const [topic, setTopic] = useState("addition");
  const { data: session, isLoading } = usePracticeSession(topic, 20, "Beginner");
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [search, setSearch] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

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
    if (listRef.current && session) {
      const cards = listRef.current.querySelectorAll<HTMLElement>("[data-q-card]");
      if (cards.length) {
        gsap.fromTo(cards, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.3, stagger: 0.04, ease: "power2.out" });
      }
    }
  }, [session, topic]);

  const questions = (session?.questions ?? []).filter((q) =>
    !search || q.text.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="px-4 sm:px-6 pt-6 pb-10">
      <div ref={headerRef}>
        <p className="text-fluid-xs font-semibold tracking-[0.15em] text-muted-foreground/60">EXAM ARENA</p>
        <h1 className="text-fluid-2xl font-black tracking-tight text-foreground">Question Bank</h1>
        <p className="text-fluid-sm text-muted-foreground/60">Browse questions by topic</p>
      </div>

      <div ref={animateSection} data-section-index="0" className="mt-5">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {SPRINT_TOPICS.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => { setTopic(t.id); setRevealed({}); }}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3 py-2 text-fluid-xs font-bold uppercase tracking-wider whitespace-nowrap outline-none transition-all focus-visible:ring-2 focus-visible:ring-ring",
                  topic === t.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon size={14} />
                {t.label}
              </button>
            );
          })}
        </div>

        <div className="mt-3 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions..."
            className="w-full rounded-xl border border-border/40 bg-card py-2.5 pl-9 pr-4 text-fluid-sm text-foreground outline-none placeholder:text-muted-foreground/30 focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      <div ref={animateSection} data-section-index="1" className="mt-4">
        {isLoading && (
          <div className="animate-pulse space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-24 rounded-xl bg-card" />
            ))}
          </div>
        )}

        {!isLoading && questions.length === 0 && (
          <div className="py-14 text-center">
            <p className="text-fluid-sm text-muted-foreground/60">No questions found{search ? " matching your search" : ""}.</p>
          </div>
        )}

        {questions.length > 0 && (
          <div ref={listRef} className="flex flex-col gap-3">
            {questions.map((q, i) => (
              <div
                key={q.id}
                data-q-card
                className="rounded-xl border border-border/40 bg-card overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setRevealed((prev) => ({ ...prev, [q.id]: !prev[q.id] }))}
                  className="flex w-full items-start gap-3 p-4 text-left outline-none transition-colors hover:bg-accent/20 focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-muted text-fluid-xs font-bold font-mono text-muted-foreground">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-fluid-sm font-semibold text-foreground/80 leading-relaxed">{q.text}</p>
                    {revealed[q.id] && (
                      <div className="mt-3 flex flex-col gap-1.5">
                        {q.options.map((opt, oi) => (
                          <div
                            key={oi}
                            className={cn(
                              "flex items-center gap-2 rounded-lg border px-3 py-2 text-fluid-xs",
                              oi === q.correctIndex
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-transparent bg-muted/50 text-muted-foreground/50",
                            )}
                          >
                            <span className="font-mono text-[10px] opacity-60 w-3">{String.fromCharCode(65 + oi)}</span>
                            <span className="flex-1">{opt}</span>
                            {oi === q.correctIndex && <Check size={12} className="text-primary shrink-0" />}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <ChevronRightIcon
                    rotated={revealed[q.id]}
                    className="shrink-0 mt-1 text-muted-foreground/20"
                  />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ChevronRightIcon({ rotated, className }: { rotated?: boolean; className?: string }) {
  return (
    <svg
      width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      className={cn("transition-transform duration-200", rotated && "rotate-90", className)}
    >
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}
