"use client";

import { useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import gsap from "gsap";
import { ArrowLeft } from "lucide-react";
import { useTechnique } from "@/hooks/queries/use-technique";
import { usePageMeta } from "@/hooks/use-page-meta";
import { QuickReferenceCard } from "@/components/technique/quick-reference-card";
import { DifficultyTabs } from "@/components/technique/difficulty-tabs";

export function ClientTechniquePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data: technique, isLoading, error } = useTechnique(params.id);
  usePageMeta(technique ? `${technique.name} — Exam Arena` : "Technique — Exam Arena");

  const headerRef = useCallback((el: HTMLDivElement | null) => {
    if (el) gsap.fromTo(el, { opacity: 0, y: -8 }, { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" });
  }, []);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 pt-6 animate-pulse">
        <div className="h-10 w-32 rounded-lg bg-card mb-4" />
        <div className="h-32 rounded-2xl bg-card mb-4" />
        <div className="h-64 rounded-2xl bg-card" />
      </div>
    );
  }

  if (error || !technique) {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 pt-6">
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-destructive/20 bg-destructive/5 p-8 text-center">
          <p className="text-fluid-base font-semibold text-destructive">Technique not found</p>
          <button
            type="button"
            onClick={() => { if (window.history.length > 1) router.back(); else router.push("/dashboard/explorer"); }}
            className="rounded-xl bg-primary px-5 py-2.5 text-fluid-xs font-bold uppercase tracking-wider text-primary-foreground outline-none transition-transform hover:scale-[1.02] active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-ring"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 pt-6 pb-10">
      <div ref={headerRef} className="text-center">
        <button
          type="button"
          onClick={() => { if (window.history.length > 1) router.back(); else router.push("/dashboard/explorer"); }}
          className="inline-flex items-center gap-1.5 text-fluid-xs font-bold uppercase tracking-wider text-muted-foreground outline-none transition-colors hover:text-foreground active:text-foreground focus-visible:ring-2 focus-visible:ring-ring mb-3"
        >
          <ArrowLeft size={14} /> Back
        </button>

        <p className="text-fluid-xs font-semibold tracking-[0.15em] text-muted-foreground/60">
          EXAM ARENA
        </p>
        <h1 className="text-fluid-2xl font-black tracking-tight text-foreground mt-0.5">
          {technique.name}
        </h1>
        {technique.topicPath.length > 0 && (
          <p className="text-fluid-xs text-muted-foreground/50 mt-1">
            {technique.topicPath.join(" › ")}
          </p>
        )}
      </div>

      {/* Quick Reference Card */}
      <div className="mt-6">
        <p className="text-fluid-xs font-bold uppercase tracking-[0.15em] text-muted-foreground/50 mb-3">
          Quick Reference
        </p>
        <QuickReferenceCard card={technique.quickReference} />
      </div>

      {/* Difficulty Levels */}
      <div className="mt-8">
        <p className="text-fluid-xs font-bold uppercase tracking-[0.15em] text-muted-foreground/50 mb-3">
          Difficulty Levels
        </p>
        <DifficultyTabs levels={technique.levels} techniqueName={technique.name} />
      </div>
    </div>
  );
}
