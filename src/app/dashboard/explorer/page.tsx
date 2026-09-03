"use client";

import { useState, useCallback, useMemo } from "react";
import gsap from "gsap";
import { cn } from "@/lib/utils";
import { useSubjectTree } from "@/hooks/queries/use-explorer";
import { usePageMeta } from "@/hooks/use-page-meta";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { TopicTree } from "@/components/explorer/topic-tree";
import { Compass, BookOpen, Layers, GraduationCap, Lightbulb, ChevronRight } from "lucide-react";
import { DOMAIN_LABELS } from "@/lib/types/template";
import type { TopicNode } from "@/lib/types/technique";

const ACCENT = "#C7F252";
const GLASS_BG = "rgba(255,255,255,0.04)";
const GLASS_BORDER = "rgba(255,255,255,0.08)";

function countNodes(nodes: TopicNode[]): { topics: number; techniques: number } {
  let topics = 0;
  let techniques = 0;
  const walk = (list: TopicNode[]) => {
    for (const n of list) {
      if (n.type === "topic") topics++;
      if (n.type === "technique") techniques++;
      if (n.children) walk(n.children);
    }
  };
  walk(nodes);
  return { topics, techniques };
}

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
  const activeSubjectNode = subjects[activeSubject];
  const subjectTotals = activeSubjectNode ? countNodes([activeSubjectNode]) : { topics: 0, techniques: 0 };

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
    <div className="min-h-screen max-w-5xl mx-auto px-5 pt-6 pb-6 overflow-x-hidden">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[280px] rounded-full opacity-20 overflow-hidden" style={{ background: "radial-gradient(circle, rgba(199,242,82,0.22) 0%, transparent 70%)" }} />

      {/* Header */}
      <div ref={headerRef} className="relative text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.04] backdrop-blur-sm px-4 py-1.5 mb-4">
          <Compass size={12} className="text-primary" />
          <span className="text-[10px] font-semibold tracking-[0.22em] text-primary/80">EXPLORER</span>
        </div>
        <h1 className="text-[24px] font-bold tracking-[-0.02em] text-foreground leading-tight">
          Explore <span className="bg-gradient-to-r from-primary via-[#d4ff6e] to-primary bg-clip-text text-transparent">{DOMAIN_LABELS[activeDomain]}</span>
        </h1>
        <p className="mt-1.5 text-[12px] text-muted-foreground/45 font-normal">Browse every technique, topic and subject in your study map.</p>
      </div>

      {/* Exam switcher */}
      {prepExams.length > 1 && (
        <div ref={animateSection} data-section-index={0} className="relative mt-7">
          <div className="rounded-3xl border p-1.5 backdrop-blur-xl" style={{ borderColor: GLASS_BORDER, background: GLASS_BG }}>
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
                        ? "bg-gradient-to-r from-[#C7F252] to-[#a8e62e] text-[#0A0C0A] shadow-[0_0_20px_-6px_var(--primary)]"
                        : "text-muted-foreground/60 hover:text-foreground hover:bg-white/[0.04]",
                    )}
                  >
                    <GraduationCap size={14} />
                    {DOMAIN_LABELS[id] ?? id}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Subject overview hero */}
      {activeSubjectNode && (
        <div ref={animateSection} data-section-index={1} className="relative mt-6">
          <div className="relative overflow-hidden rounded-3xl border border-primary/15 p-5" style={{ background: "linear-gradient(135deg, rgba(199,242,82,0.07) 0%, rgba(255,255,255,0.02) 55%, rgba(199,242,82,0.03) 100%)" }}>
            <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-15 pointer-events-none" style={{ background: "radial-gradient(circle, rgba(199,242,82,0.35), transparent)" }} />
            <div className="relative flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="size-12 shrink-0 rounded-2xl flex items-center justify-center border border-primary/20" style={{ background: "rgba(199,242,82,0.1)", boxShadow: "0 8px 30px -12px rgba(199,242,82,0.4)" }}>
                  <Layers size={20} className="text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold tracking-[0.18em] text-primary/70 uppercase">Current Subject</p>
                  <h2 className="text-[18px] font-bold tracking-[-0.02em] text-foreground leading-tight">{activeSubjectNode.title}</h2>
                  <p className="text-[11.5px] text-muted-foreground/45 mt-0.5 font-normal leading-snug max-w-[320px] truncate">
                    {activeSubjectNode.description || "Browse topics and techniques to level up your mastery."}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <div className="text-center rounded-2xl border border-white/[0.06] px-3 py-2.5" style={{ background: "rgba(255,255,255,0.03)" }}>
                  <p className="text-[18px] font-black text-foreground leading-none">{subjectTotals.topics}</p>
                  <p className="text-[8.5px] font-semibold uppercase tracking-wider text-muted-foreground/40 mt-1">Topics</p>
                </div>
                <div className="text-center rounded-2xl border border-white/[0.06] px-3 py-2.5" style={{ background: "rgba(255,255,255,0.03)" }}>
                  <p className="text-[18px] font-black text-foreground leading-none">{subjectTotals.techniques}</p>
                  <p className="text-[8.5px] font-semibold uppercase tracking-wider text-muted-foreground/40 mt-1">Techniques</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subject tabs */}
      {subjects.length > 1 && (
        <div ref={animateSection} data-section-index={2} className="relative mt-5 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          <BookOpen size={13} className="shrink-0 text-muted-foreground/30" />
          {subjects.map((subject, idx) => {
            const active = activeSubject === idx;
            return (
              <button
                key={subject.id}
                type="button"
                onClick={() => setActiveSubject(idx)}
                className={cn(
                  "shrink-0 flex items-center gap-1.5 rounded-full border px-4 py-2 text-[11px] font-semibold tracking-wide outline-none transition-all whitespace-nowrap focus-visible:ring-2 focus-visible:ring-ring backdrop-blur-xl",
                  active
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : "border-white/[0.07] text-muted-foreground hover:text-foreground hover:border-white/[0.14]",
                )}
              >
                <GraduationCap size={12} />
                {subject.title}
              </button>
            );
          })}
        </div>
      )}

      {/* Subject tabs legend hint */}
      {subjects.length > 1 && (
        <p ref={animateSection} data-section-index={2.5} className="relative mt-1 flex items-center gap-1.5 text-[10px] text-muted-foreground/30">
          <Lightbulb size={10} className="text-primary/50" />
          Switch subject to focus your map
        </p>
      )}

      {/* Topic tree */}
      <div ref={animateSection} data-section-index={3} className="mt-6">
        {subjects.length > 0 ? (
          <TopicTree trees={activeSubject < subjects.length ? [subjects[activeSubject]] : subjects} isLoading={isLoading} />
        ) : (
          <TopicTree trees={[]} isLoading={isLoading} />
        )}
      </div>
    </div>
  );
}
