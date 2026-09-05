"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import gsap from "gsap";
import { Check, X, Search, FileQuestion } from "lucide-react";
import { cn } from "@/lib/utils";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { getTopicsByDomain } from "@/lib/mock/sprint";
import type { SprintTopic } from "@/lib/types/sprint";
import { usePracticeSession } from "@/hooks/queries/use-practice";
import { usePageMeta } from "@/hooks/use-page-meta";
import type { Question } from "@/lib/types/sprint-session";

const GLASS_BG = "rgba(255,255,255,0.04)";
const GLASS_BORDER = "rgba(255,255,255,0.08)";

export default function QuestionsPage() {
  usePageMeta("Question Bank — Exam Arena");
  const targetExam = useOnboardingStore((s) => s.targetExam);
  const domain = targetExam;
  const topics = getTopicsByDomain(domain);
  const defaultTopic = topics.length > 0 ? topics[0].id : "addition";
  const [topic, setTopic] = useState(defaultTopic);
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
    <div className="min-h-screen max-w-5xl mx-auto px-5 pt-6 pb-4">
      <div ref={headerRef} className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.04] backdrop-blur-sm px-4 py-1.5 mb-3 mx-auto">
          <FileQuestion size={12} className="text-primary" />
          <span className="text-[10px] font-semibold tracking-[0.22em] text-primary/80">QUESTIONS</span>
        </div>
        <h1 className="text-[20px] font-bold tracking-[-0.02em] text-foreground leading-tight">Question Bank</h1>
        <p className="text-[12px] text-muted-foreground/45 font-normal mt-1">Browse questions by topic</p>
      </div>

      <div ref={animateSection} data-section-index="0" className="mt-5">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {topics.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => { setTopic(t.id); setRevealed({}); }}
                className={cn(
                  "flex items-center gap-1.5 rounded-xl px-3 py-2 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap outline-none transition-all focus-visible:ring-2 focus-visible:ring-ring backdrop-blur-xl",
                  topic === t.id
                    ? "bg-primary text-primary-foreground border border-white/[0.06]"
                    : "border border-white/[0.06] text-muted-foreground hover:text-foreground active:text-foreground",
                )}
                style={{ backgroundColor: topic === t.id ? undefined : GLASS_BG }}
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
            aria-label="Search questions"
            className="w-full rounded-xl border border-white/[0.06] backdrop-blur-xl py-2.5 pl-9 pr-4 text-[12px] text-foreground outline-none placeholder:text-muted-foreground/30 focus:border-primary focus:ring-1 focus:ring-primary"
            style={{ backgroundColor: GLASS_BG }}
          />
        </div>
      </div>

      <div ref={animateSection} data-section-index="1" className="mt-4">
        {isLoading && (
          <div className="animate-pulse space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-24 rounded-xl backdrop-blur-xl" style={{ backgroundColor: GLASS_BG }} />
            ))}
          </div>
        )}

        {!isLoading && questions.length === 0 && (
          <div className="py-14 text-center">
            <p className="text-[12px] text-muted-foreground/60">No questions found{search ? " matching your search" : ""}.</p>
          </div>
        )}

        {questions.length > 0 && (
          <div ref={listRef} className="flex flex-col gap-3">
            {questions.map((q, i) => (
              <div
                key={q.id}
                data-q-card
                className="rounded-3xl border backdrop-blur-xl overflow-hidden"
                style={{ backgroundColor: GLASS_BG, borderColor: GLASS_BORDER }}
              >
                <button
                  type="button"
                  onClick={() => setRevealed((prev) => ({ ...prev, [q.id]: !prev[q.id] }))}
                  className="flex w-full items-start gap-3 p-4 text-left outline-none transition-colors hover:bg-white/[0.06] active:bg-white/[0.06] focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className="grid size-7 shrink-0 place-items-center rounded-xl bg-muted text-[10px] font-bold font-mono text-muted-foreground">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold text-foreground/80 leading-relaxed">{q.text}</p>
                    {revealed[q.id] && (
                      <div className="mt-3 flex flex-col gap-1.5">
                        {q.options.map((opt, oi) => (
                          <div
                            key={oi}
                            className={cn(
                              "flex items-center gap-2 rounded-xl border px-3 py-2 text-[10px]",
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
