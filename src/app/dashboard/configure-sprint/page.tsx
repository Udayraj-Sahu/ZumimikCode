"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { ArrowRight, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSprintTopics } from "@/hooks/queries/use-sprint";
import { usePageMeta } from "@/hooks/use-page-meta";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { getTemplatesByCategory } from "@/services/templates";
import { getTemplateCategoriesForTopic } from "@/lib/topic-template-map";
import type { SolveAlongTemplate } from "@/lib/types/template";

const GLASS_BG = "rgba(255,255,255,0.04)";
const GLASS_BORDER = "rgba(255,255,255,0.08)";

export default function ConfigureSprintPage() {
  usePageMeta("Configure Sprint — Exam Arena");
  const router = useRouter();
  const targetExam = useOnboardingStore((s) => s.targetExam);
  const { data, isLoading } = useSprintTopics(targetExam);
  const [topic, setTopic] = useState("addition");
  const [length, setLength] = useState(10);
  const [difficulty, setDifficulty] = useState("Beginner");
  const [templates, setTemplates] = useState<SolveAlongTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  useEffect(() => {
    const cats = getTemplateCategoriesForTopic(targetExam, topic);
    if (cats.length === 0) {
      setTemplates([]);
      return;
    }
    setLoadingTemplates(true);
    getTemplatesByCategory(cats[0], targetExam).then((results) => {
      setTemplates(results);
      setLoadingTemplates(false);
    });
  }, [topic, targetExam]);

  const headerRef = useCallback((el: HTMLDivElement | null) => {
    if (el) gsap.fromTo(el, { opacity: 0, y: -8 }, { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" });
  }, []);

  const animateSection = useCallback((el: HTMLDivElement | null) => {
    if (!el || el.dataset.animated) return;
    el.dataset.animated = "true";
    const i = parseInt(el.dataset.sectionIndex || "0");
    gsap.fromTo(el, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.45, delay: 0.1 + i * 0.1, ease: "power2.out" });
  }, []);

  if (isLoading || !data) {
    return (
      <div className="min-h-screen max-w-5xl mx-auto px-5 pt-6 pb-4 flex items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const { topics, config } = data;

  return (
      <div className="min-h-screen max-w-5xl mx-auto px-5 pt-6 pb-4">
        <div ref={headerRef} className="text-center mb-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.04] backdrop-blur-sm px-4 py-1.5 mb-3">
            <BookOpen size={12} className="text-primary" />
            <span className="text-micro font-semibold tracking-[0.22em] text-primary/80">SPRINT</span>
          </div>
          <p className="text-[12px] text-muted-foreground/45 font-normal mt-1">Choose your topic, duration, and difficulty level.</p>
        </div>

        <section
          ref={animateSection} data-section-index={0}
          aria-label="Choose your topic"
        >
          <div className="mb-4 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-xl bg-primary/10 px-3 py-1 text-micro font-bold uppercase tracking-wider text-primary">
              Step 1
            </span>
            <h2 className="text-micro font-bold uppercase tracking-[0.18em] text-muted-foreground/40">
              Topic
            </h2>
          </div>
          <div
            role="radiogroup"
            aria-label="Choose your topic"
            className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3"
          >
            {topics.map((t) => {
              const active = topic === t.id;
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setTopic(t.id)}
                  className={cn(
                    "relative flex flex-col items-center justify-center gap-2 rounded-3xl border backdrop-blur-xl p-4 outline-none transition-all duration-200 focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.97] sm:gap-3 sm:p-6",
                    active
                      ? "border-primary shadow-[0_0_0_1px_var(--primary),0_0_24px_-4px_var(--primary)]"
                      : "hover:border-white/[0.12] active:border-white/[0.12]",
                  )}
                  style={{
                    background: active ? "rgba(255,255,255,0.06)" : GLASS_BG,
                    borderColor: active ? undefined : GLASS_BORDER,
                  }}
                >
                  <Icon
                    className={cn("size-6 sm:size-8", active ? "text-primary" : t.color)}
                    aria-hidden="true"
                  />
                  <span className="text-center text-micro font-bold uppercase tracking-wide sm:text-[12px]">
                    {t.label}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:gap-6 sm:mt-10">
          <section
            ref={animateSection} data-section-index={1}
            className="flex-1"
          >
            <div className="mb-4 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-xl bg-primary/10 px-3 py-1 text-micro font-bold uppercase tracking-wider text-primary">
                Step 2
              </span>
              <h2 className="text-micro font-bold uppercase tracking-[0.18em] text-muted-foreground/40">
                Duration
              </h2>
            </div>
            <div
              role="radiogroup"
              aria-label="Session length"
              className="flex gap-2.5 sm:gap-3"
            >
              {config.lengths.map((m) => {
                const active = length === m;
                return (
                  <button
                    key={m}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setLength(m)}
                    className={cn(
                      "relative flex flex-1 flex-col items-center gap-1 rounded-3xl border backdrop-blur-xl py-4 outline-none transition-all duration-200 focus-visible:ring-2 focus-visible:ring-ring sm:py-5",
                      active
                        ? "border-primary shadow-[0_0_0_1px_var(--primary),0_0_24px_-4px_var(--primary)]"
                        : "text-muted-foreground hover:border-white/[0.12]",
                    )}
                    style={{
                      background: active ? "rgba(255,255,255,0.06)" : GLASS_BG,
                      borderColor: active ? undefined : GLASS_BORDER,
                    }}
                  >
                    <span className="text-[16px] font-black italic tracking-tight sm:text-[20px]">{m}</span>
                    <span className="text-micro font-bold uppercase tracking-widest">
                      min
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <section
            ref={animateSection} data-section-index={2}
            className="flex-1"
          >
            <div className="mb-4 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-xl bg-primary/10 px-3 py-1 text-micro font-bold uppercase tracking-wider text-primary">
                Step 3
              </span>
              <h2 className="text-micro font-bold uppercase tracking-[0.18em] text-muted-foreground/40">
                Difficulty
              </h2>
            </div>
            <div
              role="radiogroup"
              aria-label="Difficulty"
              className="flex gap-2.5 sm:gap-3"
            >
              {config.difficulties.map((d) => {
                const active = difficulty === d;
                return (
                  <button
                    key={d}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setDifficulty(d)}
                    className={cn(
                      "relative flex flex-1 flex-col items-center gap-1 rounded-3xl border backdrop-blur-xl py-4 outline-none transition-all duration-200 focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.97] sm:py-5",
                      active
                        ? "border-primary shadow-[0_0_0_1px_var(--primary),0_0_24px_-4px_var(--primary)]"
                        : "text-muted-foreground hover:border-white/[0.12]",
                    )}
                    style={{
                      background: active ? "rgba(255,255,255,0.06)" : GLASS_BG,
                      borderColor: active ? undefined : GLASS_BORDER,
                    }}
                  >
                    <span className="text-[12px] font-extrabold uppercase tracking-wider sm:text-[13px]">
                      {d}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        {(templates.length > 0 || loadingTemplates) && (
          <section
            ref={animateSection} data-section-index={3}
            className="mt-6"
          >
            <div className="mb-3 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-xl bg-chart-3/10 px-3 py-1 text-micro font-bold uppercase tracking-wider text-chart-3">
                Learn
              </span>
              <h2 className="text-micro font-bold uppercase tracking-[0.18em] text-muted-foreground/40">
                Learn the Technique
              </h2>
            </div>
            {loadingTemplates ? (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin snap-x snap-mandatory">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="min-w-[65vw] sm:min-w-[260px] snap-start rounded-3xl border border-white/[0.06] backdrop-blur-xl p-4 animate-pulse" style={{ background: GLASS_BG }}>
                    <div className="h-4 w-24 rounded-xl bg-white/[0.06] mb-3" />
                    <div className="h-3 w-32 rounded-xl bg-white/[0.06] mb-2" />
                    <div className="h-8 w-20 rounded-xl bg-white/[0.06] mt-3" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin snap-x snap-mandatory">
                {templates.map((tpl) => (
                  <div
                    key={tpl.id}
                    className="min-w-[65vw] sm:min-w-[240px] snap-start shrink-0 rounded-3xl border border-white/[0.06] backdrop-blur-xl p-4 flex flex-col"
                    style={{ background: GLASS_BG }}
                  >
                    <p className="text-micro font-bold uppercase tracking-wider text-chart-3 mb-1">
                      {tpl.concept.category}
                    </p>
                    <p className="text-[12px] font-bold text-foreground leading-snug">
                      {tpl.concept.technique_name}
                    </p>
                    <p className="text-micro text-muted-foreground/50 mt-1">
                      {tpl.examples.length} example{tpl.examples.length > 1 ? "s" : ""} &middot; ~{tpl.expected_time}s
                    </p>
                    <div className="flex items-center gap-1 mt-1.5">
                      {[1, 2, 3, 4, 5].map((d) => (
                        <span
                          key={d}
                          className={cn(
                            "size-1.5 rounded-full",
                            d <= tpl.difficulty ? "bg-chart-3" : "bg-white/[0.06]",
                          )}
                        />
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        router.push(`/dashboard/practice?templateId=${tpl.id}&returnTo=/dashboard/configure-sprint&topic=${topic}&difficulty=${difficulty.toLowerCase()}`)
                      }
                      className="mt-3 flex items-center justify-center gap-1.5 rounded-xl py-3 text-micro font-bold uppercase tracking-wider text-chart-3 outline-none transition-colors hover:bg-chart-3/20 active:bg-chart-3/30 focus-visible:ring-2 focus-visible:ring-ring min-h-[44px]"
                      style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${GLASS_BORDER}` }}
                    >
                      <BookOpen size={12} />
                      Learn
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        <div ref={animateSection} data-section-index={4} className="mt-6 sm:mt-8">
          <button
            type="button"
            onClick={() =>
              router.push(`/dashboard/sprint?topic=${topic}&length=${length}&difficulty=${difficulty.toLowerCase()}`)
            }
            className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-3xl bg-cta py-4 text-[13px] font-bold uppercase tracking-widest text-[#0A0C0A] outline-none transition-transform hover:scale-[1.01] active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-ring sm:text-[16px]"
          >
            <span className="absolute inset-0 translate-y-full bg-gradient-to-r from-primary/0 via-white/10 to-primary/0 transition-transform duration-500 group-hover:translate-y-0" />
            <span className="relative flex items-center gap-3">
              Start Sprint
              <ArrowRight className="size-5 transition-transform duration-300 group-hover:translate-x-1" />
            </span>
          </button>
        </div>
      </div>
  );
}
