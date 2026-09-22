"use client";

import { useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { ArrowRight, Cast, CheckCircle2, Headphones, Info, Sparkles, TrendingUp, X, Zap } from "lucide-react";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { DOMAIN_LABELS } from "@/lib/types/template";

const ACCENT = "#C8FF4D";

type Tone = "lime" | "cyan" | "violet";

const TONES: Record<Tone, { card: string; tile: string; badge: string }> = {
  lime: {
    card: "border-[#C8FF4D]/40 bg-[#C8FF4D]/[0.04]",
    tile: "border-[#C8FF4D]/40 bg-[#C8FF4D]/10 text-[#C8FF4D]",
    badge: "border-[#C8FF4D]/50 bg-[#C8FF4D]/10 text-[#C8FF4D]",
  },
  cyan: {
    card: "border-cyan-400/40 bg-cyan-400/[0.04]",
    tile: "border-cyan-400/40 bg-cyan-400/10 text-cyan-300",
    badge: "border-cyan-400/50 bg-cyan-400/10 text-cyan-300",
  },
  violet: {
    card: "border-fuchsia-400/40 bg-fuchsia-400/[0.04]",
    tile: "border-fuchsia-400/40 bg-fuchsia-400/10 text-fuchsia-300",
    badge: "border-fuchsia-400/50 bg-fuchsia-400/10 text-fuchsia-300",
  },
};

function useLanes() {
  const targetExam = useOnboardingStore((s) => s.targetExam);
  const activePreps = useOnboardingStore((s) => s.activePreps);
  const planLane = useOnboardingStore((s) => s.planLane);
  const isVedic = targetExam === "vedic-math";

  const primary = planLane || targetExam || activePreps[0] || "cat";
  const others = activePreps.filter((p) => p !== primary && p !== "vedic-math");
  const hasSpeed = isVedic || activePreps.includes("vedic-math");

  return {
    primary,
    speedLane: hasSpeed,
    second: others[0],
  };
}

export function ArenaIntro({ onClose }: { onClose: () => void }) {
  const store = useOnboardingStore();
  const overlayRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const closingRef = useRef(false);

  const { primary, speedLane, second } = useLanes();

  useEffect(() => {
    document.body.style.overflow = "hidden";
    if (sheetRef.current) {
      sheetRef.current.animate([{ transform: "translateY(100%)" }, { transform: "translateY(0%)" }], {
        duration: 460,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
      });
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const exit = useCallback(
    (cb: () => void) => {
      if (closingRef.current) return;
      closingRef.current = true;
      const sheet = sheetRef.current;
      if (!sheet) return cb();
      sheet
        .animate([{ transform: "translateY(0%)" }, { transform: "translateY(100%)" }], {
          duration: 220,
          easing: "cubic-bezier(0.4, 0, 1, 1)",
          fill: "forwards",
        })
        .addEventListener(
          "finish",
          () => {
            overlayRef.current?.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 160, easing: "ease-in" });
            setTimeout(cb, 140);
          },
          { once: true },
        );
    },
    [],
  );

  const validThrough = useRef(
    new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    }),
  ).current;

  const label = (id: string) => DOMAIN_LABELS[id] ?? id.toUpperCase();

  const lanes: { id: string; title: string; desc: string; Icon: typeof Zap; tone: Tone; badge: string }[] = [];

  if (primary) {
    lanes.push({
      id: primary,
      title: `Lane 01: ${label(primary)} Quantitative Track`,
      desc: "Full syllabus & predictive percentile engine",
      Icon: TrendingUp,
      tone: "lime",
      badge: "ACTIVE\nSYNC",
    });
  }
  if (speedLane || second) {
    lanes.push({
      id: "vedic",
      title: "Lane 02: Vedic Math & Mental Speed",
      desc: "Rapid mental arithmetic pathways unlocked",
      Icon: Zap,
      tone: "cyan",
      badge: "ACTIVE\nSYNC",
    });
  }
  lanes.push({
    id: "bonus",
    title: "Bonus: Ad-Free Void & Unlimited Arena Drills",
    desc: "Zero interruptions with boundless stamina",
    Icon: Sparkles,
    tone: "violet",
    badge: "ENABLED",
  });

  return createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[210] overflow-hidden"
      style={{ background: "linear-gradient(180deg, rgba(10,12,10,0.99) 0%, rgba(14,17,13,0.99) 100%)" }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="arena-hook-title"
    >
      {/* ── ad backdrop ── */}
      <div className="absolute inset-0 bg-[linear-gradient(160deg,#f59e0b_0%,#fb7185_35%,#38bdf8_100%)] opacity-60" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/75" />

      <div className="relative flex items-start justify-between px-3 pt-3 text-white/90">
        <span className="w-[72px]" />
        <div className="flex items-center gap-3 rounded-full bg-black/50 px-3 py-1.5">
          <Headphones size={14} />
          <Cast size={14} />
        </div>
        <span className="w-[72px] text-right text-[10px] font-medium">Visit advertiser</span>
      </div>

      <p className="relative mx-auto mt-6 max-w-[330px] text-center text-[19px] font-extrabold uppercase leading-[1.5]">
        <span className="box-decoration-clone text-[#0A0C0A] px-2 py-0.5 bg-[#C8FF4D]">
          UGC videos on how no one is tracking the micro learning the speed behind getting the right answer, verbal speed
          tracking
        </span>
      </p>

      <div className="absolute inset-x-0 top-[47%] flex items-center gap-1.5 px-3 text-[10px] text-white/80">
        Sponsored 1 of 2 · 3:15 <Info size={11} />
      </div>

      {/* ── clearance sheet ── */}
      <div
        ref={sheetRef}
        className="absolute inset-x-0 bottom-0 rounded-t-3xl border-t bg-[#0a0a0d] px-4 pb-6 pt-4"
        style={{ borderColor: `${ACCENT}40`, boxShadow: `0 -12px 40px rgba(163,230,53,0.12)` }}
      >
        {/* grabber */}
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/15" />

        {/* header */}
        <header className="flex items-center justify-between">
          <span className="font-mono text-[10px] font-bold tracking-[0.22em] text-muted-foreground">
            ACTIVE CLEARANCE MATRIX
          </span>
          <div className="flex items-center gap-2">
            <span className="rounded border border-[#C8FF4D]/40 bg-[#C8FF4D]/10 px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-wider text-[#C8FF4D]">
              {lanes.length}/{lanes.length} SYNC
            </span>
            <button aria-label="Close" onClick={() => exit(onClose)} className="text-muted-foreground/60 hover:text-foreground transition-colors">
              <X size={16} />
            </button>
          </div>
        </header>

        {/* lanes */}
        <ul className="mt-3 space-y-2.5">
          {lanes.map(({ id, title, desc, Icon, tone, badge }) => {
            const t = TONES[tone];
            return (
              <li key={id} className={`flex items-center gap-3 rounded-xl border p-3 ${t.card}`}>
                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg border ${t.tile}`}>
                  <Icon size={16} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-[12px] font-bold leading-snug text-foreground">{title}</div>
                  <div className="mt-0.5 text-[10px] leading-snug text-muted-foreground/70">{desc}</div>
                </div>
                <span
                  className={`shrink-0 whitespace-pre-line rounded border px-1.5 py-1 text-center text-[8px] font-bold leading-tight tracking-wider ${t.badge}`}
                >
                  {badge}
                </span>
              </li>
            );
          })}
        </ul>

        {/* validity */}
        <div className="mt-3 flex items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-black/40 py-2 text-[10px] text-muted-foreground/70">
          <CheckCircle2 size={12} className="text-[#C8FF4D]" />
          Valid through {validThrough} • Auto-Renew Active
        </div>

        {/* CTA */}
        <button
          onClick={() => exit(onClose)}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 font-mono text-[12px] font-bold tracking-wider text-[#0A0C0A] transition hover:brightness-110 active:scale-[0.98]"
          style={{
            background: "linear-gradient(90deg, #C8FF4D, #B9F45C)",
            boxShadow: "0 0 28px rgba(163,230,53,0.35), 0 1px 0 rgba(255,255,255,0.25) inset",
          }}
        >
          ENTER MULTI-LANE ARENA
          <ArrowRight size={14} />
        </button>

        <button
          onClick={() => exit(onClose)}
          className="mx-auto mt-3 block text-[10px] text-muted-foreground/60 underline-offset-2 hover:text-muted-foreground hover:underline transition-colors"
        >
          View Subscription & Invoices
        </button>
      </div>
    </div>,
    document.body,
  );
}