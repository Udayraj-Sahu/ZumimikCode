"use client";

import { useState, useCallback, useMemo, useEffect, Suspense } from "react";
import gsap from "gsap";
import { AnimatePresence, motion } from "motion/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSubjectTree } from "@/hooks/queries/use-explorer";
import { usePageMeta } from "@/hooks/use-page-meta";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { MindMap } from "@/components/explorer/mind-map";
import { Compass, GraduationCap } from "lucide-react";
import { DOMAIN_LABELS } from "@/lib/types/template";
import { getTechniqueIdsForTopic } from "@/lib/mock/topic-node-map";
import type { TopicNode } from "@/lib/types/technique";

function nodeInTree(node: TopicNode, id: string): boolean {
  if (node.id === id || node.slug === id) return true;
  return (node.children ?? []).some((c) => nodeInTree(c, id));
}

function findNodeInTrees(trees: TopicNode[], domain: string, topic: string): { subjectIndex: number; nodeId: string | null } {
  for (let i = 0; i < trees.length; i++) {
    if (nodeInTree(trees[i], topic)) return { subjectIndex: i, nodeId: topic };
  }
  const techs = getTechniqueIdsForTopic(domain, topic);
  const techniqueId = techs[0];
  if (techniqueId) {
    for (let i = 0; i < trees.length; i++) {
      if (nodeInTree(trees[i], techniqueId)) return { subjectIndex: i, nodeId: techniqueId };
    }
  }
  return { subjectIndex: -1, nodeId: null };
}

function ExplorerContent() {
  usePageMeta("Topic Explorer — Exam Arena");
  const searchParams = useSearchParams();
  const router = useRouter();
  const targetExam = useOnboardingStore((s) => s.targetExam);
  const activePreps = useOnboardingStore((s) => s.activePreps);

  const prepExams = useMemo(() => {
    const others = activePreps.filter((id) => id !== targetExam && id in DOMAIN_LABELS);
    const list = [...others];
    if (targetExam && targetExam in DOMAIN_LABELS) list.unshift(targetExam);
    return list;
  }, [activePreps, targetExam]);

  const urlDomain = searchParams.get("domain");
  const urlTopic = searchParams.get("topic");
  const initialDomain = urlDomain && prepExams.includes(urlDomain) ? urlDomain : null;

  const [activeDomain, setActiveDomain] = useState(() => initialDomain || prepExams[0] || targetExam || "vedic-math");
  const [activeSubject, setActiveSubject] = useState(0);
  const [slideDir, setSlideDir] = useState(1);
  const [focusNodeId, setFocusNodeId] = useState<string | null>(null);
  const [paramsProcessed, setParamsProcessed] = useState(false);

  const { data: trees, isLoading } = useSubjectTree(activeDomain);
  const subjects = trees ?? [];

  useEffect(() => {
    if (paramsProcessed) return;
    if (!urlTopic) {
      setParamsProcessed(true);
      return;
    }
    if (!trees || trees.length === 0) return;
    const { subjectIndex, nodeId } = findNodeInTrees(trees, activeDomain, urlTopic);
    if (nodeId) {
      setFocusNodeId(nodeId);
      if (subjectIndex >= 0) setActiveSubject(subjectIndex);
    }
    setParamsProcessed(true);
    router.replace("/dashboard/explorer", { scroll: false });
  }, [trees, activeDomain, urlTopic, paramsProcessed, router]);

  const handleExamSwitch = (id: string) => {
    if (id !== activeDomain) {
      setSlideDir(prepExams.indexOf(id) > prepExams.indexOf(activeDomain) ? 1 : -1);
      setActiveDomain(id);
      setActiveSubject(0);
    }
  };

  const handleSubjectSwitch = (idx: number) => {
    if (idx !== activeSubject) {
      setSlideDir(idx > activeSubject ? 1 : -1);
      setActiveSubject(idx);
    }
  };

  const headerRef = useCallback((el: HTMLDivElement | null) => {
    if (el) gsap.fromTo(el, { opacity: 0, y: -8 }, { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" });
  }, []);

  const animateSection = useCallback((el: HTMLDivElement | null) => {
    if (!el || el.dataset.animated) return;
    el.dataset.animated = "true";
    const i = parseInt(el.dataset.sectionIndex || "0");
    gsap.fromTo(el, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.4, delay: i * 0.08, ease: "power2.out" });
  }, []);

  const label = DOMAIN_LABELS[activeDomain] ?? activeDomain;

  return (
    <div className="min-h-screen max-w-5xl mx-auto px-5 pt-6 pb-4 overflow-x-hidden">
      {/* Header */}
      <div ref={headerRef} className="relative text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.04] px-4 py-1.5 mb-4">
          <Compass size={12} className="text-primary" />
          <span className="text-[10px] font-semibold tracking-[0.22em] text-primary/80">EXPLORER</span>
        </div>
        <h1 className="text-[24px] font-bold tracking-[-0.02em] text-foreground leading-tight">
          Explore <span className="bg-gradient-to-r from-primary via-[#d4ff6e] to-primary bg-clip-text text-transparent">{label}</span>
        </h1>
        <p className="mt-1.5 text-[12px] text-muted-foreground/45 font-normal">Tap nodes to branch out and explore your study map.</p>
      </div>

      {/* Exam switcher — sliding segmented control */}
      {prepExams.length > 1 && (
        <div ref={animateSection} data-section-index={0} className="relative mt-7">
          <div
            className="relative flex gap-1 p-1 overflow-x-auto rounded-3xl border [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)" }}
          >
            {prepExams.map((id) => {
              const active = activeDomain === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => handleExamSwitch(id)}
                  className="relative flex-1 flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl px-4 py-3 text-[11px] font-bold uppercase tracking-wider outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  style={{ color: active ? "#0A0C0A" : "rgba(255,255,255,0.55)" }}
                >
                  {active && (
                    <motion.div
                      layoutId="explorer-exam-slider"
                      transition={{ type: "spring", stiffness: 400, damping: 32 }}
                      className="absolute inset-0 rounded-2xl"
                      style={{ background: "linear-gradient(180deg, #d7ff7e, #a8e62e)", boxShadow: "0 6px 16px -4px rgba(199,242,82,0.4)" }}
                    />
                  )}
                  <span className="relative flex items-center gap-2 transition-colors duration-300" style={{ textShadow: active ? "0 1px 0 rgba(255,255,255,0.35)" : "none" }}>
                    <GraduationCap size={14} className="relative" />
                    <span className="relative">{DOMAIN_LABELS[id] ?? id}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Subject tabs */}
      {subjects.length > 1 && (
        <div ref={animateSection} data-section-index={1} className="relative mt-6 flex items-center gap-2.5 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {subjects.map((subject, idx) => {
            const active = activeSubject === idx;
            return (
              <motion.button
                key={subject.id}
                type="button"
                onClick={() => handleSubjectSwitch(idx)}
                initial={false}
                animate={{ y: active ? -2 : 0, scale: active ? 1.04 : 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 30 }}
                className="relative shrink-0"
              >
                <div
                  className="absolute inset-x-1.5 top-0 h-px rounded-full transition-opacity duration-500 ease-out pointer-events-none"
                  style={{
                    opacity: active ? 1 : 0,
                    background: "linear-gradient(90deg, transparent, rgba(199,242,82,0.8), transparent)",
                  }}
                />
                <div
                  className="relative flex items-center gap-1.5 rounded-full border px-4 py-2 text-[11px] font-semibold tracking-wide whitespace-nowrap transition-all duration-500 ease-out focus-visible:ring-2 focus-visible:ring-ring"
                  style={
                    active
                      ? {
                          borderColor: "rgba(199,242,82,0.35)",
                          background: "linear-gradient(180deg, rgba(199,242,82,0.18), rgba(199,242,82,0.05))",
                          color: "var(--primary)",
                          boxShadow:
                            "0 8px 18px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.3), inset 0 -2px 6px rgba(0,0,0,0.35)",
                        }
                      : {
                          borderColor: "rgba(255,255,255,0.07)",
                          background: "rgba(255,255,255,0.02)",
                          color: "rgba(255,255,255,0.5)",
                          boxShadow: "inset 0 2px 4px rgba(0,0,0,0.4)",
                        }
                  }
                >
                  <GraduationCap size={12} className={active ? "text-primary" : "text-muted-foreground"} />
                  <span
                    style={
                      active
                        ? { textShadow: "0 1px 1px rgba(0,0,0,0.6)" }
                        : { textShadow: "0 1px 2px rgba(0,0,0,0.7)" }
                    }
                  >
                    {subject.title}
                  </span>
                </div>
              </motion.button>
            );
          })}
        </div>
      )}

      {/* Mind map */}
      <div ref={animateSection} data-section-index={2} className="relative mt-6">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={`${activeDomain}-${activeSubject}`}
            initial={{ opacity: 0, x: slideDir * 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: slideDir * -24 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <MindMap
              tree={(activeSubject < subjects.length ? subjects[activeSubject] : subjects[0]) ?? null}
              isLoading={isLoading}
              focusNodeId={focusNodeId ?? undefined}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function ExplorerPage() {
  return (
    <Suspense fallback={null}>
      <ExplorerContent />
    </Suspense>
  );
}
