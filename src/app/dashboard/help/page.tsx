"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import gsap from "gsap";
import { ChevronDown, HelpCircle, Mail, FileText, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useHelpData } from "@/hooks/queries/use-help";
import { usePageMeta } from "@/hooks/use-page-meta";
import type { FaqItem } from "@/lib/types/help";

const GLASS_BG = "rgba(255,255,255,0.04)";
const GLASS_BORDER = "rgba(255,255,255,0.08)";

function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const contentRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const toggle = (id: string) => {
    const prev = openId;
    const next = prev === id ? null : id;

    if (prev) {
      const prevEl = contentRefs.current.get(prev);
      if (prevEl) {
        gsap.to(prevEl, { height: 0, opacity: 0, duration: 0.2, ease: "power2.in" });
      }
    }

    if (next) {
      const nextEl = contentRefs.current.get(next);
      if (nextEl) {
        const scrollHeight = nextEl.scrollHeight;
        gsap.set(nextEl, { height: scrollHeight });
        gsap.fromTo(nextEl, { height: 0, opacity: 0 }, { height: scrollHeight, opacity: 1, duration: 0.25, ease: "power2.out" });
      }
    }

    setOpenId(next);
  };

  return (
    <div className="divide-y divide-white/[0.06]">
      {items.map((item) => (
        <div key={item.id}>
          <button
            type="button"
            onClick={() => toggle(item.id)}
            className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left outline-none transition-colors hover:bg-white/[0.04] active:bg-white/[0.06] focus-visible:ring-2 focus-visible:ring-ring rounded-xl"
          >
            <span className="text-[12px] font-semibold text-foreground/80">{item.question}</span>
            <ChevronDown
              size={16}
              className={cn(
                "shrink-0 text-muted-foreground/40 transition-transform duration-200",
                openId === item.id && "rotate-180",
              )}
            />
          </button>
          <div
            ref={(el) => { if (el) contentRefs.current.set(item.id, el); }}
            className={cn(
              "overflow-hidden",
              openId !== item.id && "h-0 opacity-0",
            )}
            style={openId === item.id ? undefined : { height: 0, opacity: 0 }}
          >
            <div className="px-4 pb-4 text-[12px] text-muted-foreground/60 leading-relaxed">
              {item.answer}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function HelpPage() {
  usePageMeta("Help & About — Exam Arena");
  const { data, isLoading, error } = useHelpData();
  const sectionsRef = useRef<HTMLDivElement>(null);

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
    if (sectionsRef.current && data) {
      const cards = sectionsRef.current.querySelectorAll<HTMLElement>("[data-help-section]");
      if (cards.length) {
        gsap.fromTo(cards, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.35, stagger: 0.08, ease: "power2.out" });
      }
    }
  }, [data]);

  return (
    <div className="min-h-screen max-w-5xl mx-auto px-5 pt-6 pb-6">
      <div ref={headerRef} className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.04] backdrop-blur-sm px-4 py-1.5 mb-3">
          <HelpCircle size={12} className="text-primary" />
          <span className="text-[10px] font-semibold tracking-[0.22em] text-primary/80">HELP</span>
        </div>
        <p className="text-[12px] text-muted-foreground/45 font-normal mt-1">Frequently asked questions and app information</p>
      </div>

      <div ref={sectionsRef} className="mt-6 flex flex-col gap-6">
        {isLoading && (
          <div className="animate-pulse space-y-4">
            <div className="h-52 rounded-3xl" style={{ background: GLASS_BG }} />
            <div className="h-24 rounded-3xl" style={{ background: GLASS_BG }} />
            <div className="h-20 rounded-3xl" style={{ background: GLASS_BG }} />
          </div>
        )}

        {error && (
          <div className="rounded-3xl border border-destructive/30 bg-destructive/5 p-6 text-center backdrop-blur-xl">
            <p className="text-[12px] font-semibold text-destructive">Failed to load help content</p>
            <p className="mt-1 text-[10px] text-muted-foreground/60">{error instanceof Error ? error.message : "Something went wrong"}</p>
          </div>
        )}

        {data && (
          <>
            <div data-help-section className="rounded-3xl border border-white/[0.06] backdrop-blur-xl overflow-hidden" style={{ background: GLASS_BG }}>
              <div className="px-4 pt-4 pb-2 flex items-center gap-2">
                <HelpCircle size={16} className="text-primary" />
                <h2 className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground/40">FAQ</h2>
              </div>
              <FaqAccordion items={data.faq} />
            </div>

            <div data-help-section className="rounded-3xl border border-white/[0.06] backdrop-blur-xl p-4 sm:p-5" style={{ background: GLASS_BG }}>
              <h2 className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground/40 mb-3">App Info</h2>
              <div className="space-y-2 text-[12px]">
                <div className="flex justify-between">
                  <span className="text-muted-foreground/60">Version</span>
                  <span className="font-semibold text-foreground/80">{data.appInfo.version}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground/60">Platform</span>
                  <span className="font-semibold text-foreground/80">{data.appInfo.platform}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground/60">Build</span>
                  <span className="font-semibold text-foreground/80">{data.appInfo.buildNumber}</span>
                </div>
              </div>
            </div>

            <div data-help-section className="rounded-3xl border border-white/[0.06] backdrop-blur-xl p-4 sm:p-5" style={{ background: GLASS_BG }}>
              <h2 className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground/40 mb-3">Contact & Support</h2>
              <a
                href="mailto:report@examarena.io"
                className="flex items-center gap-3 rounded-xl border border-white/[0.06] px-4 py-3 text-[12px] font-semibold text-foreground/80 outline-none transition-colors hover:bg-white/[0.04] active:bg-white/[0.06] focus-visible:ring-2 focus-visible:ring-ring backdrop-blur-xl"
                style={{ background: GLASS_BG }}
              >
                <Mail size={16} className="text-muted-foreground/40" />
                report@examarena.io
              </a>
            </div>

            <div data-help-section className="rounded-3xl border border-white/[0.06] backdrop-blur-xl overflow-hidden divide-y divide-white/[0.06]" style={{ background: GLASS_BG }}>
              <h2 className="px-4 pt-4 pb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground/40">Legal</h2>
              <button
                type="button"
                className="flex w-full items-center gap-3 px-4 py-3.5 text-left text-[12px] font-semibold text-foreground/80 outline-none transition-colors hover:bg-white/[0.04] active:bg-white/[0.06] focus-visible:ring-2 focus-visible:ring-ring"
              >
                <FileText size={16} className="text-muted-foreground/40" />
                Terms of Service
              </button>
              <button
                type="button"
                className="flex w-full items-center gap-3 px-4 py-3.5 text-left text-[12px] font-semibold text-foreground/80 outline-none transition-colors hover:bg-white/[0.04] active:bg-white/[0.06] focus-visible:ring-2 focus-visible:ring-ring"
              >
                <ShieldCheck size={16} className="text-muted-foreground/40" />
                Privacy Policy
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
