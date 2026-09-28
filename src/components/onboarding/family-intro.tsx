"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { LIME, LIME_LIGHT, LIME_MID_2 } from "@/lib/theme-tokens";
import { useThemeStore } from "@/stores/theme-store";
import { createPortal } from "react-dom";
import {
  ArrowRight,
  Baby,
  BookOpen,
  EyeOff,
  HeartHandshake,
  Moon,
  ShieldCheck,
  Sparkles,
  Users,
  WifiOff,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ACCENT = LIME;

type Persona = "parent" | "student";

const PERSONA_COPY: Record<
  Persona,
  { eyebrow: string; who: string; quote: string; sub: string; iconClass: string }
> = {
  parent: {
    eyebrow: "FOR THE PROUD PARENT",
    who: "PARENT MODE",
    quote:
      "I see exactly where my child is strong — and exactly where they aren't. No arguments, no guessing.",
    sub: "Real progress you can trust, in minutes a day.",
    iconClass: "text-[var(--lime)]",
  },
  student: {
    eyebrow: "FOR THE CURIOUS STUDENT",
    who: "STUDENT MODE",
    quote: "It feels like a game — and I keep winning. My streak grows every day I try.",
    sub: "Quick wins, cool drills and a board that celebrates you.",
    iconClass: "text-emerald-300",
  },
};

const GROWTH: {
  id: string;
  time: string;
  title: string;
  desc: string;
  Icon: typeof Baby;
}[] = [
  {
    id: "kid",
    time: "AGES 6-12",
    title: "Tactile Foundation",
    desc: "Printable zero-screen drills and 5-minute micro-games that build number sense through touch.",
    Icon: Baby,
  },
  {
    id: "student",
    time: "AGES 10-15",
    title: "Family Co-op Sessions",
    desc: "Parent and child solve together — synchronized mental sparring that replaces homework fights.",
    Icon: Users,
  },
  {
    id: "exam",
    time: "AGES 16+",
    title: "99+ %ile Engine",
    desc: "Executive speed math tuned for high-stakes exams, carried by the same daily habit.",
    Icon: BookOpen,
  },
];

const PEACEOF_MIND: { label: string; Icon: typeof ShieldCheck }[] = [
  { label: "DPDP & COPPA safe", Icon: ShieldCheck },
  { label: "Works offline", Icon: WifiOff },
  { label: "Zero ads, zero tracking", Icon: EyeOff },
];

function FadeUp({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const anim = el.animate(
      [
        { opacity: 0, transform: "translateY(14px)" },
        { opacity: 1, transform: "translateY(0)" },
      ],
      { duration: 500, delay, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "backwards" },
    );
    return () => anim.cancel();
  }, [delay]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

function GlowBall({ className }: { className: string }) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute rounded-full blur-[90px]", className)}
      style={{ willChange: "transform" }}
    />
  );
}

export function FamilyIntro({
  onDone,
  onClose,
  preloaded = false,
}: {
  onDone: () => void;
  onClose: () => void;
  preloaded?: boolean;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const closingRef = useRef(false);
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

  const exit = (cb: () => void) => {
    if (closingRef.current) return;
    closingRef.current = true;
    const el = overlayRef.current;
    if (!el) return cb();
    el.animate([{ transform: "translateX(0%)" }, { transform: "translateX(-100%)" }], {
      duration: 280,
      easing: "cubic-bezier(0.55, 0, 0.55, 0.2)",
      fill: "forwards",
    }).addEventListener(
      "finish",
      () => {
        setTimeout(cb, 60);
      },
      { once: true },
    );
  };

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
      aria-labelledby="family-hook-title"
    >
      <div
        className="relative w-full min-h-full md:min-h-0 md:max-w-md md:max-h-[90vh] md:flex md:flex-col md:overflow-hidden md:rounded-3xl md:border md:border-white/[0.06] md:shadow-2xl"
        style={{
          background: "linear-gradient(180deg, var(--screen-tint) 0%, var(--overlay-solid) 100%)",
        }}
      >
        <GlowBall className="left-1/2 top-[-70px] h-56 w-56 -translate-x-1/2 bg-[var(--lime-14)]" />
        <GlowBall className="right-[-60px] top-[38%] h-52 w-52 bg-emerald-400/[0.10]" />
        <GlowBall className="bottom-[12%] left-[-70px] h-52 w-52 bg-[var(--lime-08)]" />

        <div className="relative mx-auto flex min-h-full w-full max-w-[400px] flex-col px-5 pb-8 pt-[max(1rem,env(safe-area-inset-top))] md:min-h-0 md:max-w-none md:flex-1 md:overflow-y-auto max-[359px]:px-4">
        <header className="flex items-center justify-center">
          <span className="grid h-8 w-8 place-items-center rounded-xl border border-[var(--lime-25)] bg-[var(--lime-08)]">
            <Sparkles size={15} className="text-[var(--lime)]" />
          </span>
          <div className="ml-2.5">
            <div className="text-[15px] font-bold tracking-[0.2em] text-foreground">FAMILY HUB</div>
            <div className="text-center text-[9px] font-medium tracking-wider text-white/70">
              ONE APP FOR EVERYONE
            </div>
          </div>
        </header>

        <div className="flex grow flex-col justify-center py-10">
          <FadeUp delay={70}>
            <h1
              id="family-hook-title"
              className="mt-4 text-center text-[37px] font-extrabold uppercase leading-[0.98] tracking-tight text-foreground"
            >
              Learning together
              <br />
              <span
                className="text-transparent"
                style={{
                  background: `linear-gradient(90deg,${LIME},${LIME_MID_2})`,
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                }}
              >
                family style.
              </span>
            </h1>
          </FadeUp>

          <FadeUp delay={140}>
            <p className="mx-auto mt-3 max-w-[320px] text-center text-[12.5px] leading-relaxed text-white/80">
              One calm routine grows with every age — from tactile drills for the little ones to a
              99+ %ile engine for the older preps.
            </p>
          </FadeUp>

          <div className="mt-5 space-y-3">
            {(Object.keys(PERSONA_COPY) as Persona[]).map((p, i) => {
              const c = PERSONA_COPY[p];
              return (
                <FadeUp key={p} delay={200 + i * 90}>
                  <div
                    className={cn(
                      "relative rounded-[20px] border bg-white/[0.035] p-4",
                      p === "parent" ? "border-[var(--lime-20)]" : "border-emerald-200/15",
                    )}
                  >
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-x-0 top-0 h-px"
                      style={{
                        background:
                          p === "parent"
                            ? "linear-gradient(90deg, transparent, var(--lime-45), transparent)"
                            : "linear-gradient(90deg, transparent, var(--emerald-light-40), transparent)",
                      }}
                    />
                    <div className="flex items-center justify-between">
                      <span
                        className={cn(
                          "text-[8px] font-bold tracking-[0.18em]",
                          p === "parent" ? "text-[var(--lime)]" : "text-emerald-300",
                        )}
                      >
                        {c.eyebrow}
                      </span>
                      <span className="keep-white rounded-full border border-white/10 bg-black/30 px-2 py-0.5 text-[7px] font-bold tracking-wider text-muted-foreground">
                        {c.who}
                      </span>
                    </div>
                    <blockquote className="mt-2.5 text-[13px] font-semibold leading-snug text-foreground">
                      {`\u201C${c.quote}\u201D`}
                    </blockquote>
                    <p className="mt-1.5 text-[9.5px] leading-snug text-white/70">
                      {c.sub}
                    </p>
                  </div>
                </FadeUp>
              );
            })}
          </div>
        </div>

        <div className="mt-auto">
          <FadeUp delay={380}>
            <div className="rounded-[20px] border border-white/[0.07] bg-white/[0.03] p-1.5">
              {GROWTH.map((g, i) => (
                <div key={g.id} className="flex items-center gap-3 rounded-[14px] px-3 py-2.5">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-[var(--lime-20)] bg-[var(--lime-07)] text-[var(--lime)]">
                    <g.Icon size={16} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[8px] font-bold tracking-[0.14em] text-white/70">
                        {g.time}
                      </span>
                      {i === 0 && (
                        <span className="rounded-full border border-[var(--lime-30)] bg-[var(--lime-10)] px-1.5 py-px text-[7px] font-bold text-[var(--lime)]">
                          STARTS HERE
                        </span>
                      )}
                    </div>
                    <div className="text-[12px] font-bold leading-snug text-foreground">
                      {g.title}
                    </div>
                    <div className="mt-0.5 text-[9.5px] leading-snug text-white/70">
                      {g.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </FadeUp>

          <div className="keep-white mt-3 flex items-center gap-4 rounded-2xl border border-white/[0.06] bg-black/25 px-4 py-3">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[var(--lime-10)] text-[var(--lime)]">
              <HeartHandshake size={15} />
            </span>
            <div className="flex flex-1 flex-wrap gap-x-3 gap-y-1">
              {PEACEOF_MIND.map(({ label, Icon }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-white/75"
                >
                  <Icon size={11} /> {label}
                </span>
              ))}
            </div>
          </div>

          <FadeUp delay={460}>
            <button
              onClick={() => exit(onDone)}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-[16px] py-4 text-[12px] font-bold tracking-[0.12em] text-[var(--on-accent)] transition hover:brightness-110 active:scale-[0.98]"
              style={{
                background: `linear-gradient(90deg, ${LIME}, ${LIME_LIGHT})`,
                boxShadow:
                  "0 10px 34px var(--lime-mid-28), 0 1px 0 var(--glass-25) inset",
              }}
            >
              BRING THE WHOLE FAMILY IN
              <ArrowRight size={14} />
            </button>
          </FadeUp>

          <button
            onClick={() => exit(onClose)}
            className="mx-auto mt-3 flex items-center gap-1.5 text-[10px] text-white/60 underline-offset-2 hover:text-muted-foreground hover:underline transition-colors"
          >
            <Moon size={11} /> Skip for now
          </button>
        </div>
      </div>
      </div>
    </div>,
    document.body,
  );
}
