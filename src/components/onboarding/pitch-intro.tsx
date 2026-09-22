"use client";

import { useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Brain, Cast, Crosshair, Hammer, Headphones, Pill, Skull, SkipForward, Star } from "lucide-react";

const ACCENT = "#C8FF4D";

const CAPTION =
  "UGC videos discussing the lack of tracking in micro-learning, focusing on speed in obtaining correct answers and verbal speed tracking. + Early starting benefit";

const STATS = [
  {
    id: "waste",
    value: "6H\nWASTED",
    sub: "DRAIN NET / HIGH FATIGUE",
    Icon: Skull,
    card: "border-fuchsia-400/50 bg-fuchsia-400/[0.05] shadow-[0_0_22px_rgba(232,121,249,0.12)]",
    tile: "border-fuchsia-400/40 bg-fuchsia-400/10 text-fuchsia-300",
    text: "text-fuchsia-300",
  },
  {
    id: "focus",
    value: "RAZOR\nFOCUS",
    sub: "THE WEAPON / HIGH XP",
    Icon: Crosshair,
    card: "border-[#C8FF4D]/50 bg-[#C8FF4D]/[0.05] shadow-[0_0_22px_rgba(200,255,77,0.14)]",
    tile: "border-[#C8FF4D]/40 bg-[#C8FF4D]/10 text-[#C8FF4D]",
    text: "text-[#C8FF4D]",
  },
];

const BULLETS = [
  {
    id: "tiktok",
    lead: "Stop letting TikTok lobotomize you.",
    punch: "Reclaim your focus.",
    Icon: Brain,
    tile: "border-cyan-400/40 bg-cyan-400/10 text-cyan-300",
  },
  {
    id: "feeds",
    lead: "Social feeds steal potential.",
    punch: "We build it.",
    Icon: Hammer,
    tile: "border-[#C8FF4D]/40 bg-[#C8FF4D]/10 text-[#C8FF4D]",
  },
  {
    id: "matrix",
    lead: "Escape the matrix of",
    punch: "cheap dopamine.",
    Icon: Pill,
    tile: "border-fuchsia-400/40 bg-fuchsia-400/10 text-fuchsia-300",
  },
];

const FINE_PRINT =
  "Free adaptive learning with ads. Works seamlessly offline. You configure the time, our engine handles practice, reviews, and new topics.";

const RATING = 4.8;

export function PitchIntro({ onClose }: { onClose: () => void }) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const closingRef = useRef(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    if (overlayRef.current) {
      overlayRef.current.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 280, easing: "ease-out" });
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const exit = useCallback(
    (cb: () => void) => {
      if (closingRef.current) return;
      closingRef.current = true;
      const el = overlayRef.current;
      if (!el) return cb();
      el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, easing: "ease-in", fill: "forwards" }).addEventListener(
        "finish",
        cb,
        { once: true },
      );
    },
    [],
  );

  return createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[210] overflow-y-auto"
      style={{ background: "linear-gradient(180deg, rgba(10,12,10,0.99) 0%, rgba(14,17,13,0.99) 100%)" }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="pitch-hook-title"
    >
      <div className="pointer-events-none absolute left-0 top-64 h-56 w-56 rounded-full bg-fuchsia-500/10 blur-[90px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-64 w-64 rounded-full bg-[#C8FF4D]/[0.07] blur-[90px]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(200,255,77,0.35), transparent)" }} />

      <div className="relative min-h-full w-full max-w-[400px] mx-auto">
        {/* ── ad frame ── */}
        <div className="relative h-[210px] overflow-hidden bg-black">
          <div className="absolute inset-0 bg-[linear-gradient(160deg,#f59e0b_0%,#fb7185_40%,#0ea5e9_100%)] opacity-50" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/70" />

          <div className="relative flex items-start justify-between px-3 pt-3 text-white/90">
            <span className="w-[72px]" />
            <div className="flex items-center gap-3 rounded-full bg-black/50 px-3 py-1.5">
              <Headphones size={13} />
              <Cast size={13} />
            </div>
            <span className="w-[72px] text-right text-[9px] font-medium">Visit advertiser</span>
          </div>

          <p className="relative mx-auto mt-5 max-w-[330px] text-center text-[11px] font-extrabold uppercase leading-[1.8]">
            <span className="box-decoration-clone bg-[#C8FF4D] px-1.5 py-0.5 text-[#0A0C0A]">{CAPTION}</span>
          </p>

          <button className="absolute bottom-2 right-0 flex items-center gap-1 bg-black/60 py-1.5 pl-3 pr-2 text-[10px] font-medium">
            Skip ad <SkipForward size={11} />
          </button>
          <div className="absolute inset-x-0 bottom-0 h-[3px] bg-white/20">
            <div className="h-full w-1/3 bg-[#C8FF4D]" />
          </div>
        </div>

        {/* ── pitch ── */}
        <section className="relative px-5 pt-7 pb-8">
          <div className="text-center">
            <h1 id="pitch-hook-title" className="text-[30px] font-black uppercase leading-[1.05] tracking-tight text-foreground">
              Stop feeding
              <br />
              <span className="bg-gradient-to-r from-[#C8FF4D] to-[#B9F45C] bg-clip-text text-transparent">the algorithm</span>
            </h1>
            <p className="mt-2 font-mono text-[10px] font-bold tracking-[0.3em] text-[#C8FF4D]">TACTICAL EFFICIENCY</p>
          </div>

          {/* stat cards */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            {STATS.map(({ id, value, sub, Icon, card, tile, text }) => (
              <div key={id} className={`flex flex-col items-center rounded-2xl border px-3 py-4 text-center ${card}`}>
                <span className={`grid h-10 w-10 place-items-center rounded-full border ${tile}`}>
                  <Icon size={18} />
                </span>
                <div className={`mt-3 whitespace-pre-line text-[17px] font-black leading-tight ${text}`}>{value}</div>
                <div className={`mt-2 font-mono text-[8px] tracking-wider text-muted-foreground/60`}>{sub}</div>
              </div>
            ))}
          </div>

          {/* bullets */}
          <ul className="mt-6 space-y-3">
            {BULLETS.map(({ id, lead, punch, Icon, tile }) => (
              <li key={id} className="flex items-center gap-3">
                <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg border ${tile}`}>
                  <Icon size={15} />
                </span>
                <p className="text-[12px] leading-snug text-muted-foreground/75">
                  {lead} <span className="font-semibold text-foreground">{punch}</span>
                </p>
              </li>
            ))}
          </ul>

          {/* fine print */}
          <p className="mx-auto mt-6 max-w-[320px] text-center text-[10px] italic leading-relaxed text-muted-foreground/60">
            {FINE_PRINT}
          </p>

          {/* rating */}
          <div className="mt-4 flex flex-col items-center gap-1">
            <div className="flex gap-1" aria-label={`Rated ${RATING} out of 5`}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={14} className="fill-[#C8FF4D] text-[#C8FF4D]" />
              ))}
            </div>
            <span className="font-mono text-[9px] tracking-[0.2em] text-muted-foreground/60">
              USER RATING {RATING}/5
            </span>
          </div>

          {/* CTA */}
          <button
            onClick={() => exit(onClose)}
            className="mt-5 w-full rounded-xl py-3.5 font-mono text-[12px] font-bold tracking-wider text-[#0A0C0A] transition hover:brightness-110 active:scale-[0.98]"
            style={{
              background: "linear-gradient(90deg, #C8FF4D, #B9F45C)",
              boxShadow: "0 0 28px rgba(163,230,53,0.35), 0 1px 0 rgba(255,255,255,0.25) inset",
            }}
          >
            WEAPONIZE MY FREE TIME
          </button>

          <button
            onClick={() => exit(onClose)}
            className="mx-auto mt-3 block text-[10px] text-muted-foreground/60 underline-offset-2 hover:text-muted-foreground hover:underline transition-colors"
          >
            Skip for now
          </button>
        </section>
      </div>
    </div>,
    document.body,
  );
}