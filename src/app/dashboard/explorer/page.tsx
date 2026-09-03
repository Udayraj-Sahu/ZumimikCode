"use client";

import { useState, useCallback, useMemo } from "react";
import gsap from "gsap";
import { cn } from "@/lib/utils";
import { useSubjectTree } from "@/hooks/queries/use-explorer";
import { usePageMeta } from "@/hooks/use-page-meta";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { TopicTree } from "@/components/explorer/topic-tree";
import { Compass, BookOpen, Layers } from "lucide-react";
import { DOMAIN_LABELS } from "@/lib/types/template";

const GLASS_BG = "rgba(255,255,255,0.04)";
const GLASS_BORDER = "rgba(255,255,255,0.08)";

export default function ExplorerPage() {
  usePageMeta("Topic Explorer — Exam Arena");
  const targetExam = useOnboardingStore((s) => s.targetExam);
  const activePreps = useOnboardingStore((s) => s.activePreps);

  const prepExams = useMemo(() => {
    const union = new Set<string>(activePreps);
    if (targetExam) union.add(targetExam);
    return [...union].filter((id) => id in DOMAIN_LABELS);
  }, [activePreps, targetExam]);

  const initialDomain = prepExams[0] || targetExam || "vedic-math";
  const [activeDomain, setActiveDomain] = useState(initialDomain);
  const { data: trees, isLoading } = useSubjectTree(activeDomain);
  const [activeSubject, setActiveSubject] = useState(0);

  const subjects = trees ?? [];

  const headerRef = useCallback((el: HTMLDivElement | null) => {
    if (el) gsap.fromTo(el, { opacity: 0, y: -8 }, { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" });
  }, []);

  const animateSection = useCallback((el: HTMLDivElement | null) => {
    if (!el || el.dataset.animated) return;
    el.dataset.animated = "true";
    const i = parseInt(el.dataset.sectionIndex || "0");
    gsap.fromTo(el, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.4, delay: i * 0.08, ease: "power2.out" });
  }, []);

  const handleExamSwitch = (id: string) => {
    if (id !== activeDomain) {
      setActiveDomain(id);
      setActiveSubject(0);
    }
  };

  return (
    <div className="min-h-screen max-w-5xl mx-auto px-5 pt-6 pb-6">
      <div ref={headerRef} className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.04] backdrop-blur-sm px-4 py-1.5 mb-4">
          <Compass size={12} className="text-primary" />
          <span className="text-[10px] font-semibold tracking-[0.22em] text-primary/80">EXPLORER</span>
        </div>
        <h1 className="text-[22px] font-bold tracking-[-0.02em] text-foreground leading-tight">Topic Explorer</h1>
        <p className="mt-1.5 text-[12px] text-muted-foreground/45 font-normal max-w-[280px] mx-auto">
          Browse every technique, topic and subject in your study map.
        </p>
      </div>

      {prepExams.length > 1 && (
        <div ref={animateSection} data-section-index={0} className="mt-7">
          <div
            className="relative rounded-3xl border p-1.5 backdrop-blur-xl"
            style={{ borderColor: GLASS_BORDER, background: GLASS_BG }}
          >
            <div className="flex gap-1.5 overflow-x-auto scrollbar-thin">
              {prepExams.map((id) => {
                const active = activeDomain === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => handleExamSwitch(id)}
                    className={cn(
                      "flex flex-1 items-center justify-center gap-2 rounded-2xl px-4 py-3 text-[11px] font-bold uppercase tracking-wider outline-none transition-all duration-200 whitespace-nowrap focus-visible:ring-2 focus-visible:ring-ring",
                      active
                        ? "bg-gradient-to-r from-primary to-[#a8e62e] text-primary-foreground shadow-[0_0_20px_-6px_var(--primary)]"
                        : "text-muted-foreground/60 hover:text-foreground hover:bg-white/[0.04]",
                    )}
                  >
                    <BookOpen size={14} />
                    {DOMAIN_LABELS[id] ?? id}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {subjects.length > 1 && (
        <div ref={animateSection} data-section-index={1} className="mt-5 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          <Layers size={13} className="shrink-0 text-muted-foreground/30" />
          {subjects.map((subject, idx) => {
            const active = activeSubject === idx;
            return (
              <button
                key={subject.id}
                type="button"
                onClick={() => setActiveSubject(idx)}
                className={cn(
                  "shrink-0 rounded-full border px-4 py-2 text-[11px] font-semibold tracking-wide outline-none transition-all whitespace-nowrap focus-visible:ring-2 focus-visible:ring-ring backdrop-blur-xl",
                  active
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : "border-white/[0.07] text-muted-foreground hover:text-foreground hover:border-white/[0.14]",
                )}
              >
                {subject.title}
              </button>
            );
          })}
        </div>
      )}

      <div ref={animateSection} data-section-index={2} className="mt-6">
        {subjects.length > 0 ? (
          <TopicTree trees={activeSubject < subjects.length ? [subjects[activeSubject]] : subjects} isLoading={isLoading} />
        ) : (
          <TopicTree trees={[]} isLoading={isLoading} />
        )}
      </div>
    </div>
  );
}
