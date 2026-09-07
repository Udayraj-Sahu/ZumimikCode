"use client";

import { useState, useCallback, useMemo, useEffect, Suspense } from "react";
import gsap from "gsap";
import { AnimatePresence, motion } from "motion/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSubjectTree } from "@/hooks/queries/use-explorer";
import { useAllTechniques } from "@/hooks/queries/use-technique";
import { usePageMeta } from "@/hooks/use-page-meta";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { MindMap } from "@/components/explorer/mind-map";
import { Compass, GraduationCap, Lock, Plus, ArrowRight, Layers, ClipboardList } from "lucide-react";
import { DOMAIN_LABELS } from "@/lib/types/template";
import { getTechniqueIdsForTopic } from "@/lib/mock/topic-node-map";
import type { TopicNode } from "@/lib/types/technique";
import { AddPrepModal } from "@/components/learn/add-prep-modal";

function nodeInTree(node: TopicNode, id: string): boolean {
  if (node.id === id || node.slug === id) return true;
  return (node.children ?? []).some((c) => nodeInTree(c, id));
}

function findNodeInTrees(trees: TopicNode[], domain: string, topic: string): { subjectIndex: number; nodeId: string | null } {
  for (let i = 0; i < trees.length; i++) {
    if (nodeInTree(trees[i], topic)) return { subjectIndex: i, nodeId: topic };
  }
  const techs = getTechniqueIdsForTopic(domain, topic);
  for (let i = 0; i < trees.length; i++) {
    if (techs.some((id) => nodeInTree(trees[i], id))) return { subjectIndex: i, nodeId: null };
  }
  return { subjectIndex: -1, nodeId: null };
}

function countConquestStats(subject: TopicNode): { topics: number; practiceSets: number } {
  let topics = 0;
  let practiceSets = 0;
  function walk(node: TopicNode) {
    if (node.type === "technique") {
      practiceSets += 1;
    } else if (node.type === "topic" || node.type === "subtopic") {
      topics += 1;
    }
    (node.children ?? []).forEach(walk);
  }
  walk(subject);
  return { topics, practiceSets };
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

  const [activeDomain, setActiveDomain] = useState(() => initialDomain || prepExams[0] || "");
  const [activeSubject, setActiveSubject] = useState(0);
  const [slideDir, setSlideDir] = useState(1);
  const [focusNodeId, setFocusNodeId] = useState<string | null>(null);
  const [paramsProcessed, setParamsProcessed] = useState(false);
  const [showAddPrep, setShowAddPrep] = useState(false);

  const { data: trees, isLoading } = useSubjectTree(activeDomain);
  const subjects = trees ?? [];

  const { data: allTechniques } = useAllTechniques();
  const availableTechniqueIds = useMemo(
    () => new Set((allTechniques ?? []).map((t) => t.id)),
    [allTechniques],
  );

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
    router.replace("/learn/explorer", { scroll: false });
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

  const conquest = useMemo(
    () => (subjects[activeSubject] ? countConquestStats(subjects[activeSubject]) : { topics: 0, practiceSets: 0 }),
    [subjects, activeSubject],
  );

  if (prepExams.length === 0) {
    return (
      <div className="min-h-screen max-w-5xl mx-auto px-5 pt-6 pb-4">
        {/* Branded header at top */}
        <div className="relative text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.04] px-4 py-1.5">
            <Compass size={12} className="text-primary" />
            <span className="text-micro font-semibold tracking-[0.22em] text-primary/80">EXPLORER</span>
          </div>
        </div>

        <div className="flex items-center justify-center pt-14 pb-10">
          <div className="relative w-full max-w-sm rounded-3xl border border-white/[0.08] backdrop-blur-xl px-6 py-8" style={{ background: "rgba(255,255,255,0.04)" }}>
            <div className="absolute -top-12 -right-12 size-40 rounded-full opacity-[0.07] pointer-events-none" style={{ background: "radial-gradient(circle, var(--primary), transparent 70%)" }} />
            <div className="flex flex-col items-center gap-4 text-center">
              <span className="relative grid size-14 place-items-center rounded-2xl bg-white/[0.05] border border-white/[0.06]">
                <Lock size={20} className="text-muted-foreground/45" />
              </span>
              <div>
                <h1 className="text-[18px] font-bold tracking-[-0.02em] text-foreground">No exam selected</h1>
                <p className="mt-1.5 text-[12px] text-muted-foreground/45 font-normal leading-relaxed max-w-[240px] mx-auto">
                  Add a prep to explore topics and techniques in your study map.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddPrep(true)}
                className="mt-1 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-[12px] font-bold text-[#0A0C0A] transition-all hover:opacity-90 active:scale-[0.97] outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Plus size={13} strokeWidth={3} /> ADD PREP
                <ArrowRight size={13} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </div>

        {showAddPrep && <AddPrepModal onClose={() => setShowAddPrep(false)} />}
      </div>
    );
  }

  return (
    <div className="min-h-screen max-w-5xl mx-auto px-5 pt-6 pb-4 overflow-x-hidden">
      {/* Header */}
      <div ref={headerRef} className="relative text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.04] px-4 py-1.5 mb-4">
          <Compass size={12} className="text-primary" />
          <span className="text-micro font-semibold tracking-[0.22em] text-primary/80">EXPLORER</span>
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

      {/* Conquest stats */}
      {subjects.length > 0 && (
        <div ref={animateSection} data-section-index={2} className="mt-6 grid grid-cols-2 gap-3">
          <div
            className="relative overflow-hidden rounded-2xl border backdrop-blur-xl px-4 py-4"
            style={{ borderColor: "rgba(34,211,238,0.18)", background: "rgba(255,255,255,0.03)" }}
          >
            <div className="pointer-events-none absolute -top-8 -right-8 size-24 rounded-full opacity-[0.12]" style={{ background: "radial-gradient(circle, #22D3EE, transparent 70%)" }} />
            <div className="relative flex items-center justify-between">
              <span className="grid size-9 place-items-center rounded-xl" style={{ background: "rgba(34,211,238,0.14)" }}>
                <Layers size={15} className="text-[#22D3EE]" />
              </span>
              <span className="text-[26px] font-black leading-none tracking-[-0.02em] text-[#22D3EE]">
                {conquest.topics}
              </span>
            </div>
            <p className="relative mt-3 text-micro font-semibold tracking-[0.14em] uppercase" style={{ color: "rgba(34,211,238,0.85)" }}>
              Topics to conquer
            </p>
          </div>
          <div
            className="relative overflow-hidden rounded-2xl border backdrop-blur-xl px-4 py-4"
            style={{ borderColor: "rgba(139,92,246,0.18)", background: "rgba(255,255,255,0.03)" }}
          >
            <div className="pointer-events-none absolute -top-8 -right-8 size-24 rounded-full opacity-[0.12]" style={{ background: "radial-gradient(circle, #8B5CF6, transparent 70%)" }} />
            <div className="relative flex items-center justify-between">
              <span className="grid size-9 place-items-center rounded-xl" style={{ background: "rgba(139,92,246,0.14)" }}>
                <ClipboardList size={15} className="text-[#8B5CF6]" />
              </span>
              <span className="text-[26px] font-black leading-none tracking-[-0.02em] text-[#8B5CF6]">
                {conquest.practiceSets}
              </span>
            </div>
            <p className="relative mt-3 text-micro font-semibold tracking-[0.14em] uppercase" style={{ color: "rgba(139,92,246,0.85)" }}>
              Practice sets to conquer
            </p>
          </div>
        </div>
      )}

      {/* Mind map */}
      <div ref={animateSection} data-section-index={3} className="relative mt-6">
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
              availableTechniqueIds={availableTechniqueIds}
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
