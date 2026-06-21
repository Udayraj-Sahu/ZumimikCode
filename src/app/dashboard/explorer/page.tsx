"use client";

import { useState, useCallback } from "react";
import gsap from "gsap";
import { cn } from "@/lib/utils";
import { useSubjectTree } from "@/hooks/queries/use-explorer";
import { usePageMeta } from "@/hooks/use-page-meta";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { TopicTree } from "@/components/explorer/topic-tree";
import { Compass, BookOpen } from "lucide-react";

export default function ExplorerPage() {
  usePageMeta("Topic Explorer — Exam Arena");
  const targetExam = useOnboardingStore((s) => s.targetExam);
  const { data: trees, isLoading } = useSubjectTree();
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

  return (
    <div className="px-4 sm:px-6 pt-6 pb-10">
      <div ref={headerRef} className="text-center">
        <p className="text-fluid-xs font-semibold tracking-[0.15em] text-muted-foreground/60">EXAM ARENA</p>
        <h1 className="text-fluid-2xl font-black tracking-tight text-foreground flex items-center justify-center gap-2">
          <Compass size={22} className="text-primary" /> Topic Explorer
        </h1>
        <p className="text-fluid-sm text-muted-foreground/60">Browse techniques by subject and topic</p>
      </div>

      {subjects.length > 1 && (
        <div ref={animateSection} data-section-index={0} className="mt-6 flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {subjects.map((subject, idx) => (
            <button
              key={subject.id}
              type="button"
              onClick={() => setActiveSubject(idx)}
              className={cn(
                "flex items-center gap-1.5 rounded-xl border px-3 py-2 text-fluid-xs font-bold uppercase tracking-wider outline-none transition-all whitespace-nowrap focus-visible:ring-2 focus-visible:ring-ring",
                activeSubject === idx
                  ? "border-primary bg-accent text-foreground shadow-[0_0_0_1px_var(--primary)]"
                    : "border-border/40 bg-card text-muted-foreground hover:border-border hover:text-foreground active:border-border active:text-foreground",
              )}
            >
              <BookOpen size={14} />
              {subject.title}
            </button>
          ))}
        </div>
      )}

      <div ref={animateSection} data-section-index={1} className="mt-6">
        {subjects.length > 0 ? (
          <TopicTree trees={activeSubject < subjects.length ? [subjects[activeSubject]] : subjects} isLoading={isLoading} />
        ) : (
          <TopicTree trees={[]} isLoading={isLoading} />
        )}
      </div>
    </div>
  );
}
