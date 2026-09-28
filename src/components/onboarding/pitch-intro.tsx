"use client";

import { useCallback, useLayoutEffect, useRef } from "react";
import { GLASS_BORDER, LIME, LIME_22, LIME_LIGHT } from "@/lib/theme-tokens";
import { useThemeStore } from "@/stores/theme-store";
import { createPortal } from "react-dom";
import { animate, stagger } from "animejs";
import { useReducedMotion } from "motion/react";
import { Brain, ChevronRight, Crosshair, Flame, Star, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import Backlight from "@/components/ui/backlight";

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

const RATING = 4.8;

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
        "fixed inset-0 z-[var(--z-intro)] overflow-y-auto md:flex md:items-center md:justify-center md:overflow-hidden md:bg-black/60 md:backdrop-blur-sm",
        preloaded && "invisible pointer-events-none",
        theme === "light" && "light",
      )}
      role="dialog"
      aria-modal="true"
      aria-hidden={preloaded || undefined}
      aria-labelledby="pitch-hook-title"
    >
      <div
        className="relative w-full min-h-full md:min-h-0 md:max-w-md md:max-h-[90vh] md:flex md:flex-col md:overflow-hidden md:rounded-3xl md:border md:border-white/[0.06] md:shadow-2xl"
        style={{
          background: "linear-gradient(180deg, var(--screen-tint) 0%, var(--overlay-solid) 100%)",
        }}
      >
        <div className="pointer-events-none absolute left-6 top-24 h-48 w-48 rounded-full bg-fuchsia-500/10 blur-[90px]" />
        <div className="pointer-events-none absolute bottom-10 right-4 h-56 w-56 rounded-full bg-[var(--lime-08)] blur-[90px]" />
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px"
          style={{
            background: "linear-gradient(90deg, transparent, var(--lime-40), transparent)",
          }}
        />

        <div className="relative mx-auto w-full max-w-[400px] px-5 pt-[max(2rem,env(safe-area-inset-top))] pb-8 md:min-h-0 md:max-w-none md:flex-1 md:overflow-y-auto max-[359px]:px-4">
          <section ref={pitchRef}>
          {/* badge */}
          <div
            data-stage
            style={reduceMotion ? undefined : { opacity: 0 }}
            className="mx-auto flex w-fit items-center gap-1.5 rounded-full border border-[var(--lime-30)] bg-[var(--lime-10)] px-3 py-1  text-[9px] font-bold tracking-[0.3em] text-[var(--lime)]"
          >
            <span className="inline-block size-1.5 animate-pulse rounded-full bg-[var(--rose)]" />
            ADAPTIVE TRAINING
          </div>

          {/* headline */}
          <div
            data-stage
            style={reduceMotion ? undefined : { opacity: 0 }}
            className="mt-4 text-center"
          >
            <h1
              id="pitch-hook-title"
              className="text-[34px] font-black uppercase leading-[1.04] tracking-tight text-foreground"
            >
              Stop feeding
              <span className="block bg-gradient-to-r from-[var(--lime)] via-[var(--lime-light)] to-[var(--emerald-pale)] bg-clip-text text-transparent">
                the algorithm
              </span>
            </h1>
          </div>

          {/* progress hero */}
          <div data-stage style={reduceMotion ? undefined : { opacity: 0 }} className="mt-5">
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="pointer-events-none absolute -top-16 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-[var(--lime-10)] blur-3xl" />
              <div className="relative flex items-center gap-5">
                {/* ring */}
                <div className="relative grid size-[104px] shrink-0 place-items-center">
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
                      <div className="text-[22px] font-black leading-none text-white">
                        {Math.round(RING_PCT * 100)}%
                      </div>
                      <div className="mt-0.5  text-[8px] tracking-[0.2em] text-white/50">FOCUS</div>
                    </div>
                  </div>
                </div>

                {/* copy */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <Flame size={14} className="text-orange-400" />
                    <span className=" text-[10px] font-bold text-white">
                      <span ref={streakRef}>0</span>-day streak
                    </span>
                  </div>
                  <p className="mt-2 text-[13px] font-semibold leading-snug text-white/80">
                    You&apos;re <span className="text-white">89% better</span> at avoiding wasteful
                    scrolling than last week.
                  </p>
                  <div className="mt-2.5 flex items-center gap-2  text-[8px] tracking-[0.18em] text-white/45">
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
            className="mt-3 grid grid-cols-2 gap-3"
          >
            <div className="rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2.5">
              <div className=" text-[8px] tracking-[0.2em] text-white/45">SAVED THIS WEEK</div>
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
            <div className="rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2.5">
              <div className=" text-[8px] tracking-[0.2em] text-white/45">AVG SPEED / Q</div>
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

          {/* tracks */}
          <ul className="mt-5 space-y-2.5">
            {TRACKS.map(({ id, lead, punch, sub, Icon, accent, bar }) => (
              <li
                key={id}
                data-stage
                style={reduceMotion ? undefined : { opacity: 0 }}
                className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.02] p-3"
              >
                <div
                  className={`pointer-events-none absolute inset-y-0 left-0 w-px bg-gradient-to-b ${bar}`}
                />
                <div className="flex items-start gap-3">
                  <span
                    className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-white/10 bg-black/30 ${accent}`}
                  >
                    <Icon size={15} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold leading-snug text-white/80">
                      {lead} <span className="text-white">{punch}</span>
                    </p>
                    <p className="mt-0.5 text-[11px] leading-snug text-white/55">
                      {sub}
                    </p>
                  </div>
                  <ChevronRight
                    size={14}
                    className="mt-1 shrink-0 text-white/25 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-[var(--lime)]"
                  />
                </div>
              </li>
            ))}
          </ul>

          {/* fine print */}
          <p
            data-stage
            style={reduceMotion ? undefined : { opacity: 0 }}
            className="mx-auto mt-5 max-w-[330px] text-center text-[10px] italic leading-relaxed text-white/55"
          >
            {FINE_PRINT}
          </p>

          {/* rating */}
          <div
            data-stage
            style={reduceMotion ? undefined : { opacity: 0 }}
            className="mt-3 flex flex-col items-center gap-1"
          >
            <div className="flex gap-1" aria-label={`Rated ${RATING} out of 5`}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={13} className="fill-[var(--lime)] text-[var(--lime)]" />
              ))}
            </div>
            <span className=" text-[9px] tracking-[0.2em] text-white/60">
              USER RATING {RATING}/5
            </span>
          </div>

          {/* CTA */}
          <div data-stage style={reduceMotion ? undefined : { opacity: 0 }} className="mt-5">
            <Backlight color={LIME_22}>
              <button
                onClick={() => exit(onClose)}
                className="w-full rounded-xl py-3.5  text-[12px] font-bold tracking-wider text-[var(--on-accent)] transition hover:brightness-110 active:scale-[0.98]"
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
              className="mx-auto mt-2.5 block text-[10px] text-white/60 underline-offset-2 hover:text-muted-foreground hover:underline transition-colors"
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
