"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { BG_MOSS, FOREST, GLASS_BORDER, LIME, LIME_20, LIME_LIGHT, LIME_TINT, PANEL } from "@/lib/theme-tokens";
import { useThemeStore } from "@/stores/theme-store";
import { createPortal } from "react-dom";
import {
  ArrowRight,
  Calendar,
  Flame,
  Play,
  Radar,
  Swords,
  TrendingUp,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import StockVideoAd from "@/components/ads/stock-video-ad";
import { ClearanceTiers } from "@/components/paywall/clearance-tiers";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { DOMAIN_LABELS } from "@/lib/types/template";
import { useDashboardData } from "@/hooks/queries/use-dashboard";

const ACCENT = LIME;

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ── Using real dashboard data (mock service, backend drop-in) ── */

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

type Tone = {
  card: string;
  panel: string;
  inset: string;
  soft: string;
  faint: string;
  rest: string;
  dot: string;
};

/** Theme-aware class sets — no raw colour literals in the markup. */
function useArenaTone(): Tone {
  const theme = useThemeStore((s) => s.theme);
  const light = theme === "light";
  return {
    card: light ? "border-black/[0.10] bg-black/[0.04]" : "border-white/[0.08] bg-black/25",
    panel: light ? "border-black/[0.10] bg-black/[0.04]" : "border-white/[0.07] bg-white/[0.02]",
    inset: light
      ? "border-black/[0.10] bg-black/[0.03]"
      : "border-[var(--lime-20)] bg-[var(--lime-04)]",
    soft: light ? "text-black/70" : "text-white/70",
    faint: light ? "text-black/60" : "text-white/60",
    rest: light ? "border-black/[0.10] bg-black/[0.04]" : "border-white/10 bg-black/30",
    dot: light ? "bg-black/10" : "bg-white/10",
  };
}

export function ArenaIntro({
  onClose,
  onSkip,
  preloaded = false,
}: {
  onClose: () => void;
  /** "Skip for now": dismiss the whole intro with no goal recorded. */
  onSkip?: () => void;
  preloaded?: boolean;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const closingRef = useRef(false);

  const theme = useThemeStore((s) => s.theme);
  const tone = useArenaTone();
  const [active, setActive] = useState(0);
  const [tier, setTier] = useState("dual-lane");

  const { primary, speedLane, second } = useLanes();
  const { data } = useDashboardData(primary);

  const radar = data?.radarAxes ?? [];
  const upcoming = data?.upcoming ?? [];

  const label = (id: string) => DOMAIN_LABELS[id] ?? id.toUpperCase();

  /* Every lane lives inside a single card, so this is one flat list. */
  const lanes: {
    id: string;
    title: string;
    desc: string;
    Icon: typeof Zap;
    tone: string;
  }[] = [];

  if (primary) {
    lanes.push({
      id: primary,
      title: `Lane 01 · ${label(primary)} Quant`,
      desc: "Full syllabus, predictive percentile, timed drills",
      Icon: TrendingUp,
      tone: "text-[var(--lime)] border-[var(--lime-40)] bg-[var(--lime-10)]",
    });
  }
  if (speedLane) {
    lanes.push({
      id: "vedic",
      title: "Lane 02 · Vedic Speed Math",
      desc: "Mental arithmetic bursts and reflex sprints",
      Icon: Zap,
      tone: "text-cyan-300 border-cyan-400/40 bg-cyan-400/10",
    });
  }
  if (second) {
    lanes.push({
      id: second,
      title: `Lane 03 · ${label(second)}`,
      desc: "Parallel prep lane synced to the same arena clock",
      Icon: Swords,
      tone: "text-fuchsia-300 border-fuchsia-400/40 bg-fuchsia-400/10",
    });
  }

  /** Slides: lanes, skill radar, sponsor reel (video only), up next. Empty ones are skipped. */
  const slides: {
    id: string;
    num: string;
    tag: string;
    title: string;
    sub: string;
    Icon: typeof Zap;
    bare?: boolean;
    body: ReactNode;
  }[] = [
    ...(lanes.length > 0
      ? [
          {
            id: "lanes",
            num: "01",
            tag: "ACTIVE LANES",
            title: `${lanes.length} lane${lanes.length > 1 ? "s" : ""} running now`,
            sub: "Every lane shares one arena clock and one checkpoint.",
            Icon: Flame,
            body: (
              <div className="flex flex-1 flex-col gap-2.5">
                <ul className="flex flex-1 flex-col justify-center gap-2">
                  {lanes.map(({ id, title, desc, Icon }) => (
                    <li
                      key={id}
                      className={cn("flex items-center gap-3 rounded-xl border px-3 py-2.5", tone.panel)}
                    >
                      <span className={cn("grid size-9 shrink-0 place-items-center rounded-xl border", lanes.find((l) => l.id === id)?.tone)}>
                        <Icon size={16} />
                      </span>
                      <div className="min-w-0">
                        <div className="text-[11.5px] font-bold leading-tight text-foreground">
                          {title}
                        </div>
                        <div className={cn("mt-0.5 text-[10px] leading-snug", tone.soft)}>{desc}</div>
                      </div>
                    </li>
                  ))}
                </ul>

                <ul className="flex shrink-0 flex-wrap items-center justify-center gap-1.5">
                  {[
                    `${lanes.length} ${lanes.length === 1 ? "lane" : "lanes"}`,
                    "1 shared clock",
                    "1 checkpoint",
                  ].map((chip) => (
                    <li
                      key={chip}
                      className={cn(
                        "rounded-full border px-2 py-1 text-[8.5px] font-bold uppercase tracking-[0.1em]",
                        tone.panel,
                        tone.faint,
                      )}
                    >
                      {chip}
                    </li>
                  ))}
                </ul>
              </div>
            ),
          },
        ]
      : []),
    ...(radar.length > 0
      ? [
          {
            id: "radar",
            num: "02",
            tag: "SKILL RADAR",
            title: "Where you stand",
            sub: "Live read on every skill the arena tracks.",
            Icon: Radar,
            body: (
              <ul className="flex flex-1 flex-col gap-1.5">
                {radar.map((axis) => (
                  <li
                    key={axis.label}
                    className={cn(
                      "flex min-h-0 flex-1 items-center gap-2 rounded-xl border px-3 py-1.5",
                      tone.panel,
                    )}
                  >
                    <span className={cn("w-[58px] shrink-0 truncate text-[10px]", tone.soft)}>
                      {axis.label}
                    </span>
                    <div className={cn("h-1.5 flex-1 overflow-hidden rounded-full", tone.rest)}>
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.round(axis.value * 100)}%`,
                          background: `linear-gradient(90deg, ${LIME_20}, ${LIME})`,
                        }}
                      />
                    </div>
                    <span className="w-8 shrink-0 text-right text-[10px] font-bold tabular-nums text-[var(--lime)]">
                      {Math.round(axis.value * 100)}%
                    </span>
                  </li>
                ))}
              </ul>
            ),
          },
        ]
      : []),
    {
      id: "sponsor",
      num: "03",
      tag: "SPONSOR REEL",
      title: "",
      sub: "",
      Icon: Play,
      bare: true,
      body: (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-[var(--glass-border)]">
          <StockVideoAd
            src="/media/stock-ad.mp4"
            poster="/media/stock-ad-poster.webp"
            alt="Sponsor message"
            className="h-full w-full min-h-[160px]"
          />
        </div>
      ),
    },
    ...(upcoming.length > 0
      ? [
          {
            id: "next",
            num: "04",
            tag: "UP NEXT",
            title: "What's queued",
            sub: "The next two sessions already scheduled for you.",
            Icon: Calendar,
            body: (
              <ul className="flex flex-1 flex-col gap-1.5">
                {upcoming.map((ev) => (
                  <li
                    key={ev.title}
                    className={cn(
                      "flex min-h-0 flex-1 items-center gap-2 rounded-xl border px-3 py-1.5",
                      tone.panel,
                    )}
                  >
                    <span className={cn("min-w-0 flex-1 truncate text-[11px] text-foreground")}>
                      {ev.title}
                    </span>
                    <span className={cn("shrink-0 text-[10px]", tone.soft)}>{ev.time}</span>
                    <span className="shrink-0 rounded border border-[var(--lime-40)] bg-[var(--lime-10)] px-1.5 py-0.5 text-[8px] font-bold text-[var(--lime)]">
                      {ev.tag}
                    </span>
                  </li>
                ))}
              </ul>
            ),
          },
        ]
      : []),
  ];

  const TOTAL = slides.length;

  const goTo = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(TOTAL - 1, index));
      setActive(clamped);
      const track = trackRef.current;
      const slide = track?.children[clamped] as HTMLElement | undefined;
      if (!track || !slide) return;
      const behavior: ScrollBehavior = prefersReducedMotion() ? "auto" : "smooth";
      track.scrollTo({ left: slide.offsetLeft - track.offsetLeft, behavior });
    },
    [TOTAL],
  );

  /** Keeps dots in sync when the user swipes by hand. */
  const onTrackScroll = useCallback(() => {
    const track = trackRef.current;
    const slide = track?.firstElementChild as HTMLElement | null;
    if (!track || !slide || slide.offsetWidth === 0) return;
    const index = Math.round(
      (track.scrollLeft + track.offsetLeft - slide.offsetLeft) / slide.offsetWidth,
    );
    setActive((prev) => (prev === index ? prev : Math.max(0, Math.min(TOTAL - 1, index))));
  }, [TOTAL]);

  useEffect(() => {
    if (preloaded) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        goTo(active + 1);
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goTo(active - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, goTo, preloaded]);

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
      aria-labelledby="arena-hook-title"
    >
      <div
        className="relative flex h-full w-full shrink-0 flex-col sm:h-[92vh] sm:max-w-md sm:overflow-hidden sm:rounded-3xl sm:border sm:shadow-2xl"
        style={{
          borderColor: GLASS_BORDER,
          background:
            theme === "light"
              ? "linear-gradient(180deg, var(--screen-tint) 0%, var(--overlay-solid) 100%)"
              : `radial-gradient(130% 90% at 50% 0%, ${PANEL} 0%, ${BG_MOSS} 48%, ${FOREST} 100%)`,
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.5]"
          style={{
            backgroundImage: "radial-gradient(var(--glass-045) 1px, transparent 1px)",
            backgroundSize: "26px 26px",
          }}
        />

        {/* brand + hero */}
        <div className="relative shrink-0 px-5 pt-[max(0.75rem,var(--sat))] text-center">
          <div className="inline-flex items-center gap-2.5 rounded-full border border-[var(--lime-25)] bg-[var(--lime-07)] px-3.5 py-1">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--lime)] opacity-60" />
              <span className="relative h-1.5 w-1.5 rounded-full bg-[var(--lime)]" />
            </span>
            <span className="text-[10px] font-bold tracking-[0.22em] text-[var(--lime)]">ARENA</span>
          </div>
          <h1
            id="arena-hook-title"
            className="mt-2 text-[clamp(21px,6vw,28px)] font-extrabold uppercase leading-[1.02] tracking-tight text-foreground"
          >
            The arena is{" "}
            <span
              className="text-transparent"
              style={{
                background: `linear-gradient(90deg, ${LIME}, ${LIME_TINT})`,
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
              }}
            >
              live.
            </span>
          </h1>
        </div>

        {/* carousel: fills remaining space, video + CTA below */}
        <div className="relative flex min-h-0 flex-1 flex-col px-5 pt-3">
          <section
            aria-roledescription="carousel"
            aria-label="Arena overview"
            className="flex min-h-0 flex-1 flex-col"
          >
            <div
              ref={trackRef}
              onScroll={onTrackScroll}
              className="flex min-h-0 flex-1 snap-x snap-mandatory gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {slides.map((card, i) => {
                const Icon = card.Icon;
                return (
                  <article
                    key={card.id}
                    aria-label={`${i + 1} of ${TOTAL}: ${card.tag}`}
                    aria-hidden={i !== active ? "true" : undefined}
                    className="flex w-full shrink-0 snap-start snap-always flex-col overflow-hidden"
                  >
                    <div
                      className={cn(
                        "flex min-h-0 flex-1 flex-col rounded-[18px] border p-2.5",
                        tone.card,
                      )}
                    >
                      {!card.bare && (
                        <>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-black leading-none text-[var(--lime)]">
                              {card.num}
                            </span>
                            <span className="min-w-0 flex-1 truncate text-[8px] font-bold uppercase tracking-[0.16em] text-foreground">
                              {card.tag}
                            </span>
                            <span className="grid size-6 shrink-0 place-items-center rounded-lg border border-[var(--lime-25)] bg-[var(--lime-08)] text-[var(--lime)]">
                              <Icon size={12} />
                            </span>
                          </div>

                          {card.title && (
                            <h2 className="mt-3 text-[14px] font-bold uppercase leading-[1.15] tracking-[-0.01em] text-foreground">
                              {card.title}
                            </h2>
                          )}
                          {card.sub && (
                            <p className={cn("mt-1.5 text-[10px] leading-snug", tone.soft)}>{card.sub}</p>
                          )}
                        </>
                      )}

                      <div className={cn("flex min-h-0 flex-1 flex-col", card.bare ? "" : "mt-4")}>
                        {card.body}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* dots */}
            <nav className="mt-2.5 flex shrink-0 items-center justify-center gap-2">
              {slides.map((c, i) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`Go to slide ${i + 1} of ${TOTAL}: ${c.tag}`}
                  aria-current={i === active ? "true" : undefined}
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    i === active ? "w-5 bg-[var(--lime)]" : "w-1.5 bg-white/25",
                  )}
                />
              ))}
            </nav>
          </section>
        </div>

        <div className="relative mx-auto flex w-full max-w-[400px] shrink-0 flex-col px-5 pb-[max(0.5rem,var(--sab))] pt-0 sm:max-w-none max-[359px]:px-4">
          {/* clearance tiers: replaces the stock video, mirrors the paywall */}
          <div className="mt-3 shrink-0">
            <ClearanceTiers value={tier} onChange={setTier} />
          </div>

          {/* fixed CTA */}
          <footer className="mt-2.5 shrink-0">
            <button
              onClick={() => exit(onClose)}
              className="flex w-full items-center justify-center gap-2 rounded-[16px] py-3.5 text-[12px] font-bold tracking-[0.12em] text-[var(--on-accent)] transition hover:brightness-110 active:scale-[0.98]"
              style={{
                background: `linear-gradient(90deg, ${LIME}, ${LIME_LIGHT})`,
                boxShadow: "0 10px 34px var(--lime-mid-25), 0 1px 0 var(--glass-25) inset",
              }}
            >
              ENTER {lanes.length > 1 ? "MULTI-LANE" : "YOUR"} ARENA
              <ArrowRight size={14} />
            </button>
            <button
              onClick={() => exit(onSkip ?? onClose)}
              className={cn(
                "mx-auto mt-2 block text-[10px] underline-offset-2 transition-colors hover:text-muted-foreground hover:underline",
                tone.faint,
              )}
            >
              Skip for now
            </button>
          </footer>
        </div>
      </div>
    </div>,
    document.body,
  );
}
