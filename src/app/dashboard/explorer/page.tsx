"use client";

import { useState, useCallback, useMemo } from "react";
import gsap from "gsap";
import { cn } from "@/lib/utils";
import { useSubjectTree } from "@/hooks/queries/use-explorer";
import { usePageMeta } from "@/hooks/use-page-meta";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { TopicTree } from "@/components/explorer/topic-tree";
import { Compass, BookOpen } from "lucide-react";
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

  const [activeDomain, setActiveDomain] = useState(prepExams[0] || targetExam || "vedic-math");
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
    setActiveDomain(id);
    setActiveSubject(0);
  };

  return (
    <div className="min-h-screen max-w-5xl mx-auto px-5 pt-6 pb-6">
      <div ref={headerRef} className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.04] backdrop-blur-sm px-4 py-1.5 mb-3">
          <Compass size={12} className="text-primary" />
          <span className="text-[10px] font-semibold tracking-[0.22em] text-primary/80">EXPLORER</span>
        </div>
        <p className="text-[12px] text-muted-foreground/45 font-normal mt-1">Browse techniques by subject and topic</p>
      </div>

      {prepExams.length > 1 && (
        <div ref={animateSection} data-section-index={0} className="mt-6 flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {prepExams.map((id) => {
            const active = activeDomain === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => handleExamSwitch(id)}
                className={cn(
                  "flex items-center gap-1.5 rounded-full border px-4 py-2 text-[10px] font-bold uppercase tracking-wider outline-none transition-all whitespace-nowrap focus-visible:ring-2 focus-visible:ring-ring backdrop-blur-xl",
                  active
                    ? "bg-primary text-primary-foreground border-primary shadow-[0_0_16px_-4px_var(--primary)]"
                    : "border-white/[0.06] text-muted-foreground hover:text-foreground active:text-foreground",
                )}
                style={!active ? { background: GLASS_BG, borderColor: "rgba(255,255,255,0.06)" } : undefined}
              >
                <BookOpen size={14} />
                {DOMAIN_LABELS[id] ?? id}
              </button>
            );
          })}
        </div>
      )}

      {subjects.length > 1 && (
        <div ref={animateSection} data-section-index={1} className="mt-6 flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {subjects.map((subject, idx) => (
            <button
              key={subject.id}
              type="button"
              onClick={() => setActiveSubject(idx)}
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-3 py-2 text-[10px] font-bold uppercase tracking-wider outline-none transition-all whitespace-nowrap focus-visible:ring-2 focus-visible:ring-ring backdrop-blur-xl",
                activeSubject === idx
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-white/[0.06] text-muted-foreground hover:text-foreground active:text-foreground",
              )}
              style={activeSubject !== idx ? { background: GLASS_BG, borderColor: "rgba(255,255,255,0.06)" } : undefined}
            >
              <BookOpen size={14} />
              {subject.title}
            </button>
          ))}
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
