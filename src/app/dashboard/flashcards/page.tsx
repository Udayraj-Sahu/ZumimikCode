"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import gsap from "gsap";
import { ChevronLeft, ChevronRight, RotateCw, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { getTopicsByDomain } from "@/lib/mock/sprint";
import type { SprintTopic } from "@/lib/types/sprint";
import { getFlashcards } from "@/lib/mock/flashcards";
import type { Flashcard } from "@/lib/mock/flashcards";
import { usePageMeta } from "@/hooks/use-page-meta";

export default function FlashcardsPage() {
  usePageMeta("Flashcards — Exam Arena");
  const targetExam = useOnboardingStore((s) => s.targetExam);
  const domain = targetExam || "vedic-math";
  const topics = getTopicsByDomain(domain);
  const defaultTopic = topics.length > 0 ? topics[0].id : "addition";
  const [topic, setTopic] = useState(defaultTopic);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState<number[]>([]);
  const cardRef = useRef<HTMLDivElement>(null);

  const cards: Flashcard[] = getFlashcards(domain, topic);
  const current = cards[index];
  const progress = cards.length > 0 ? ((known.length) / cards.length) * 100 : 0;

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
    if (cardRef.current) {
      gsap.fromTo(cardRef.current, { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1, duration: 0.2, ease: "power2.out" });
    }
  }, [index, topic]);

  const flip = () => {
    if (cardRef.current) {
      gsap.timeline()
        .to(cardRef.current, { rotationY: 90, duration: 0.1, ease: "power2.in" })
        .call(() => setFlipped(!flipped))
        .to(cardRef.current, { rotationY: 0, duration: 0.1, ease: "power2.out" });
    }
  };

  const markKnown = () => {
    if (!known.includes(index)) setKnown((prev) => [...prev, index]);
    goNext();
  };

  const goNext = () => {
    if (index < cards.length - 1) {
      setFlipped(false);
      setIndex((i) => i + 1);
    }
  };

  const goPrev = () => {
    if (index > 0) {
      setFlipped(false);
      setIndex((i) => i - 1);
    }
  };

  const resetTopic = (t: string) => {
    setTopic(t);
    setIndex(0);
    setFlipped(false);
    setKnown([]);
  };

  return (
    <div className="px-4 sm:px-6 pt-6 pb-10">
      <div ref={headerRef} className="text-center">
        <p className="text-fluid-xs font-semibold tracking-[0.15em] text-muted-foreground/60">EXAM ARENA</p>
        <h1 className="text-fluid-2xl font-black tracking-tight text-foreground">Flashcards</h1>
        <p className="text-fluid-sm text-muted-foreground/60">Quick mental math review</p>
      </div>

      <div ref={animateSection} data-section-index="0" className="mt-5 flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {topics.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => resetTopic(t.id)}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-2 text-fluid-xs font-bold uppercase tracking-wider whitespace-nowrap outline-none transition-all focus-visible:ring-2 focus-visible:ring-ring",
                topic === t.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground active:text-foreground",
              )}
            >
              <Icon size={14} />
              {t.label}
            </button>
          );
        })}
      </div>

      <div ref={animateSection} data-section-index="1" className="mt-6">
        {cards.length === 0 && (
          <div className="py-14 text-center">
            <BookOpen size={32} className="mx-auto text-muted-foreground/20 mb-3" />
            <p className="text-fluid-sm text-muted-foreground/60">No flashcards for this topic.</p>
          </div>
        )}

        {current && (
          <>
            {/* Progress */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-fluid-xs text-muted-foreground/40 font-mono">{index + 1}/{cards.length}</span>
              <span className="text-fluid-xs text-muted-foreground/40">{known.length} known</span>
            </div>
            <div className="h-1 w-full rounded-full bg-muted overflow-hidden mb-6">
              <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>

            {/* Card */}
            <div
              ref={cardRef}
              onClick={flip}
              className="relative cursor-pointer rounded-2xl border border-border/40 bg-card p-8 sm:p-12 min-h-[200px] sm:min-h-[260px] flex items-center justify-center outline-none focus-visible:ring-2 focus-visible:ring-ring"
              role="button"
              tabIndex={0}
              aria-label={flipped ? "Tap to see question" : "Tap to reveal answer"}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") flip(); }}
            >
              <div className="text-center">
                {!flipped ? (
                  <>
                    <p className="text-fluid-xs font-bold uppercase tracking-widest text-muted-foreground/50 mb-4">Question</p>
                    <p className="text-fluid-2xl sm:text-3xl font-black tracking-tight text-foreground">{current.front}</p>
                  </>
                ) : (
                  <>
                    <p className="text-fluid-xs font-bold uppercase tracking-widest text-muted-foreground/50 mb-4">Answer</p>
                    <p className="text-fluid-3xl sm:text-4xl font-black text-primary">{current.back}</p>
                  </>
                )}
              </div>
            </div>

            <p className="text-center text-fluid-xs text-muted-foreground/50 mt-3">Tap card to flip</p>

            {/* Controls */}
            <div className="mt-6 flex items-center justify-center gap-3 flex-wrap">
              <button
                type="button"
                onClick={goPrev}
                disabled={index === 0}
                className="flex items-center gap-1 rounded-lg bg-muted px-4 py-3 text-fluid-xs font-bold text-muted-foreground outline-none transition-colors hover:text-foreground active:text-foreground active:bg-muted/70 disabled:opacity-30 focus-visible:ring-2 focus-visible:ring-ring"
              >
                <ChevronLeft size={16} /> Prev
              </button>
              <button
                type="button"
                onClick={markKnown}
                className="rounded-lg bg-primary px-5 py-3 text-fluid-xs font-bold text-primary-foreground outline-none transition-transform hover:scale-[1.05] active:scale-[0.95] focus-visible:ring-2 focus-visible:ring-ring"
              >
                <RotateCw size={14} className="inline mr-1" /> Mark Known
              </button>
              <button
                type="button"
                onClick={goNext}
                disabled={index >= cards.length - 1}
                className="flex items-center gap-1 rounded-lg bg-muted px-4 py-3 text-fluid-xs font-bold text-muted-foreground outline-none transition-colors hover:text-foreground active:text-foreground active:bg-muted/70 disabled:opacity-30 focus-visible:ring-2 focus-visible:ring-ring"
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          </>
        )}

        {known.length === cards.length && cards.length > 0 && (
          <div className="mt-4 rounded-xl border border-primary/30 bg-primary/5 p-4 text-center">
            <p className="text-fluid-sm font-bold text-primary">All cards marked known!</p>
            <p className="text-fluid-xs text-muted-foreground/60 mt-1">Great work on {topic}!</p>
          </div>
        )}
      </div>
    </div>
  );
}
