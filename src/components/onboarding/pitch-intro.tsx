"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { GLASS_BORDER, LIME, LIME_22, LIME_LIGHT } from "@/lib/theme-tokens";
import { useThemeStore } from "@/stores/theme-store";
import { createPortal } from "react-dom";
import { animate, stagger } from "animejs";
import { useReducedMotion } from "motion/react";
import { Brain, Crosshair, Flame, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import Backlight from "@/components/ui/backlight";
import StockVideoAd from "@/components/ads/stock-video-ad";

const RING_RADIUS = 44;
const RING_CIRC = 2 * Math.PI * RING_RADIUS;
const RING_PCT = 0.72;

const TRACKS = [
  {
    id: "plan",
    lead: "One sprint a day",
    punch: "keeps the feed away.",
    sub: "5-minute adaptive set, tuned to your pace.",
    Icon: Target,
    accent: "text-[var(--lime)]",
    bar: "from-[var(--lime-60)] to-transparent",
  },
  {
    id: "speed",
    lead: "Speed becomes",
    punch: "your unfair advantage.",
    sub: "Shave seconds per question with live feedback.",
    Icon: Crosshair,
    accent: "text-cyan-300",
    bar: "from-cyan-400/60 to-transparent",
  },
  {
    id: "focus",
    lead: "Every session",
    punch: "rewires your attention.",
    sub: "Tight, distraction-free runs that build flow.",
    Icon: Brain,
    accent: "text-fuchsia-300",
    bar: "from-fuchsia-400/60 to-transparent",
  },
];

const FINE_PRINT =
  "Free, adaptive, works offline. You set the time — the engine plans practice, reviews, and new topics around it.";

export function PitchIntro({
  onClose,
  preloaded = false,
}: {
  onClose: () => void;
  preloaded?: boolean;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const closingRef = useRef(false);
  const pitchRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<SVGCircleElement>(null);
  const statRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const streakRef = useRef<HTMLSpanElement>(null);
  const reduceMotion = useReducedMotion();
  const theme = useThemeStore((s) => s.theme);

  useLayoutEffect(() => {
    if (preloaded) return;
    document.body.style.overflow = "hidden";
    if (overlayRef.current) {
      overlayRef.current.animate(
        [{ transform: "translateX(100%)" }, { transform: "translateX(0%)" }],
        {
          duration: 320,
          easing: "cubic-bezier(0.22, 1, 0.36, 1)",
        },
      );
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [preloaded]);

  useLayoutEffect(() => {
    if (preloaded) return;
    if (reduceMotion) return;
    const anims: ReturnType<typeof animate>[] = [];

    if (ringRef.current) {
      anims.push(
        animate(ringRef.current, {
          strokeDashoffset: [RING_CIRC, RING_CIRC * (1 - RING_PCT)],
          duration: 1400,
          ease: "outQuart",
        }),
      );
    }

    const countUp = (el: HTMLSpanElement, target: number, decimals: number) => {
      const state = { v: 0 };
      anims.push(
        animate(state, {
          v: target,
          duration: 1100,
          ease: "outQuint",
          onUpdate: () => {
            el.textContent = decimals ? state.v.toFixed(decimals) : Math.round(state.v).toString();
          },
        }),
      );
    };

    if (streakRef.current) countUp(streakRef.current, 12, 0);
    statRefs.current.forEach((el) => {
      if (!el) return;
      countUp(el, parseFloat(el.dataset.count ?? "0"), Number(el.dataset.decimals ?? 0));
    });

    if (pitchRef.current) {
      const stage = pitchRef.current.querySelectorAll<HTMLElement>("[data-stage]");
      anims.push(
        animate(stage, {
          opacity: [0, 1],
          translateY: [16, 0],
          delay: stagger(70, { start: 120 }),
          duration: 560,
          ease: "outExpo",
        }),
      );
    }

    return () => {
      anims.forEach((a) => a.cancel());
    };
  }, [preloaded, reduceMotion]);

  const exit = useCallback((cb: () => void) => {
    if (closingRef.current) return;
    closingRef.current = true;
    const el = overlayRef.current;
    if (!el) return cb();
    el.animate([{ transform: "translateX(0%)" }, { transform: "translateX(-100%)" }], {
      duration: 280,
      easing: "cubic-bezier(0.55, 0, 0.55, 0.2)",
      fill: "forwards",
    }).addEventListener("finish", cb, { once: true });
  }, []);

  return createPortal(
    <div
      ref={overlayRef}
      data-theme-scope
      className={cn(
        "fixed inset-0 z-[var(--z-intro)] flex overflow-hidden flex-col sm:items-center sm:justify-center sm:bg-black/60 sm:backdrop-blur-sm",
        preloaded && "invisible pointer-events-none",
        theme === "light" && "light",
      )}
      role="dialog"
      aria-modal="true"
      aria-hidden={preloaded || undefined}
      aria-labelledby="pitch-hook-title"
    >
      <div
        className="relative flex h-full w-full shrink-0 flex-col sm:h-[90vh] sm:max-w-md sm:overflow-hidden sm:rounded-3xl sm:border sm:border-white/[0.06] sm:shadow-2xl"
        style={{
          background: "linear-gradient(180deg, var(--screen-tint) 0%, var(--overlay-solid) 100%)",
        }}
      >
        <div className="pointer-events-none absolute left-6 top-[52vh] h-48 w-48 rounded-full bg-fuchsia-500/10 blur-[90px]" />
        <div className="pointer-events-none absolute bottom-10 right-4 h-56 w-56 rounded-full bg-[var(--lime-08)] blur-[90px]" />

        {/* stock video: compact bordered banner */}
        <div className="relative shrink-0 px-4 pt-3 pb-0">
          <div className="relative overflow-hidden rounded-2xl border border-white/10">
            <StockVideoAd
              src="/media/stock-ad.mp4"
              poster="/media/stock-ad-poster.webp"
              alt="Sponsor message"
              className="h-[clamp(120px,25vh,220px)] w-full"
            />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/30 to-transparent" />
          </div>
        </div>

        <div className="relative mx-auto flex w-full max-w-[400px] min-h-0 flex-1 flex-col justify-center overflow-hidden px-5 pb-[max(3px,env(safe-area-inset-bottom))] pt-0 sm:max-w-none max-[359px]:px-4">
          <section ref={pitchRef}>
          {/* headline */}
          <div
            data-stage
            style={reduceMotion ? undefined : { opacity: 0 }}
            className="-mt-1 text-center"
          >
            <h1
              id="pitch-hook-title"
              className="text-[clamp(22px,6.4vw,32px)] font-black uppercase leading-[1.02] tracking-tight text-foreground"
            >
              Stop feeding
              <span className="block bg-gradient-to-r from-[var(--lime)] via-[var(--lime-light)] to-[var(--emerald-pale)] bg-clip-text text-transparent">
                the algorithm
              </span>
            </h1>
          </div>

          {/* progress hero */}
          <div data-stage style={reduceMotion ? undefined : { opacity: 0 }} className="mt-3">
            <div
              className={cn(
                "relative overflow-hidden p-3",
                theme === "light"
                  ? "rounded-[16px] border border-white/[0.07] bg-white/[0.02]"
                  : "rounded-2xl border border-white/10 bg-white/[0.03]",
              )}
            >
              <div className="pointer-events-none absolute -top-16 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-[var(--lime-10)] blur-3xl" />
              <div className="relative flex items-center gap-3.5">
                {/* ring */}
                <div className="relative grid size-[84px] shrink-0 place-items-center">
                  <svg viewBox="0 0 104 104" className="size-full -rotate-90">
                    <circle
                      cx="52"
                      cy="52"
                      r={RING_RADIUS}
                      fill="none"
                      stroke={GLASS_BORDER}
                      strokeWidth="9"
                    />
                    <circle
                      ref={ringRef}
                      cx="52"
                      cy="52"
                      r={RING_RADIUS}
                      fill="none"
                      stroke={LIME}
                      strokeWidth="9"
                      strokeLinecap="round"
                      strokeDasharray={RING_CIRC}
                      strokeDashoffset={reduceMotion ? RING_CIRC * (1 - RING_PCT) : RING_CIRC}
                      style={{ filter: "drop-shadow(0 0 6px var(--lime-50))" }}
                    />
                  </svg>
                  <div className="absolute inset-0 grid place-items-center text-center">
                    <div>
                      <div className="text-[19px] font-black leading-none text-white">
                        {Math.round(RING_PCT * 100)}%
                      </div>
                      <div className="mt-0.5  text-[7px] tracking-[0.2em] text-white/50">FOCUS</div>
                    </div>
                  </div>
                </div>

                {/* copy */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <Flame size={16} className="text-orange-400" />
                    <span className=" text-[12px] font-bold text-white">
                      <span ref={streakRef}>0</span>-day streak
                    </span>
                  </div>
                  <p className="mt-2 text-[14px] font-semibold leading-snug text-white/80">
                    You&apos;re <span className="text-white">89% better</span> at avoiding wasteful
                    scrolling than last week.
                  </p>
                  <div className="mt-2.5 flex items-center gap-2  text-[9px] tracking-[0.18em] text-white/45">
                    <span className="inline-block size-1 rounded-full bg-[var(--lime)]" />
                    NEXT SPRINT · 5 MIN READY
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* stats */}
          <div
            data-stage
            style={reduceMotion ? undefined : { opacity: 0 }}
            className="mt-2.5 grid grid-cols-2 gap-2.5"
          >
            <div className={cn("px-3 py-2.5", theme === "light" ? "rounded-[16px] border border-white/[0.07] bg-white/[0.02]" : "rounded-xl border border-white/10 bg-white/[0.02]")}>
              <div className=" text-[9px] tracking-[0.2em] text-white/45">SAVED THIS WEEK</div>
              <div className="mt-1 flex items-baseline gap-1">
                <span
                  ref={(el) => {
                    statRefs.current[0] = el;
                  }}
                  data-count="6"
                  className=" text-[24px] font-black leading-none text-white"
                >
                  0
                </span>
                <span className=" text-[12px] font-bold text-[var(--lime)]">HRS</span>
              </div>
            </div>
            <div className={cn("px-3 py-2.5", theme === "light" ? "rounded-[16px] border border-white/[0.07] bg-white/[0.02]" : "rounded-xl border border-white/10 bg-white/[0.02]")}>
              <div className=" text-[9px] tracking-[0.2em] text-white/45">AVG SPEED / Q</div>
              <div className="mt-1 flex items-baseline gap-1">
                <span
                  ref={(el) => {
                    statRefs.current[1] = el;
                  }}
                  data-count="1.2"
                  data-decimals="1"
                  className=" text-[24px] font-black leading-none text-[var(--lime)]"
                >
                  0.0
                </span>
                <span className=" text-[12px] font-bold text-white/70">SEC</span>
              </div>
            </div>
          </div>

          {/* tracks: seamless marquee loop */}
          <div
            data-stage
            style={reduceMotion ? undefined : { opacity: 0 }}
            className="mt-3 overflow-hidden"
            aria-label="Why it works"
          >
            <ul
              className={cn(
                "flex w-max gap-2.5 pr-2.5",
                reduceMotion ? "" : "animate-marquee motion-reduce:animate-none",
              )}
            >
              {[...TRACKS, ...TRACKS].map(({ id, lead, punch, sub, Icon, accent, bar }, i) => (
                <li
                  key={`${id}-${i}`}
                  aria-hidden={i >= TRACKS.length ? "true" : undefined}
                  className={cn(
                    "group relative w-[268px] shrink-0 overflow-hidden p-2.5",
                    theme === "light"
                      ? "rounded-[16px] border border-white/[0.07] bg-white/[0.02]"
                      : "rounded-xl border border-white/10 bg-white/[0.02]",
                  )}
                >
                  <div
                    className={`pointer-events-none absolute inset-y-0 left-0 w-px bg-gradient-to-b ${bar}`}
                  />
                  <div className="flex items-start gap-3">
                    <span
                      className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg border ${theme === "light" ? "border-white/[0.07] bg-white/[0.04]" : "border-white/10 bg-black/30"} ${accent}`}
                    >
                      <Icon size={17} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[14px] font-semibold leading-snug text-white/80">
                        {lead} <span className="text-white">{punch}</span>
                      </p>
                      <p className="mt-0.5 text-[12px] leading-snug text-white/55">
                        {sub}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* fine print */}
          <p
            data-stage
            style={reduceMotion ? undefined : { opacity: 0 }}
            className="mx-auto mt-2.5 max-w-[340px] text-center text-[10px] italic leading-relaxed text-white/55"
          >
            {FINE_PRINT}
          </p>

          {/* CTA */}
          <div data-stage style={reduceMotion ? undefined : { opacity: 0 }} className="mt-3">
            <Backlight color={LIME_22}>
              <button
                onClick={() => exit(onClose)}
                className="w-full rounded-xl py-3  text-[13px] font-bold tracking-wider text-[var(--on-accent)] transition hover:brightness-110 active:scale-[0.98]"
                style={{
                  background: `linear-gradient(90deg, ${LIME}, ${LIME_LIGHT})`,
                  boxShadow: "0 0 28px var(--lime-mid-35), 0 1px 0 var(--glass-25) inset",
                }}
              >
                START TRAINING
              </button>
            </Backlight>
            <button
              onClick={() => exit(onClose)}
              className="mx-auto mt-1.5 block text-[11px] leading-none text-white/60 underline-offset-2 hover:text-muted-foreground hover:underline transition-colors"
            >
              Skip for now
            </button>
          </div>
        </section>
        </div>
      </div>
    </div>,
    document.body,
  );
}
