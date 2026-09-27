"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { BG_MOSS, FOREST, LIME, LIME_LIGHT, PANEL } from "@/lib/theme-tokens";
import { useThemeStore } from "@/stores/theme-store";
import { createPortal } from "react-dom";
import {
  ArrowRight,
  Baby,
  Clock,
  Flame,
  GraduationCap,
  HeartHandshake,
  Home,
  NotebookPen,
  PiggyBank,
  ShieldCheck,
  Sparkles,
  Star,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ACCENT = LIME;

const SEATS: { id: string; label: string; desc: string; Icon: typeof Baby }[] = [
  { id: "little", label: "Little", desc: "Tactile base", Icon: Baby },
  { id: "child", label: "Child", desc: "Co-op drills", Icon: Star },
  { id: "teen", label: "Teen", desc: "Exam engine", Icon: GraduationCap },
  { id: "parent", label: "Parent", desc: "Guardian eye", Icon: HeartHandshake },
  { id: "grand", label: "Grand", desc: "Keep-sharp", Icon: User },
  { id: "guest", label: "Guest", desc: "Momentum seat", Icon: Sparkles },
];

const WALL: { Icon: typeof Flame; title: string; desc: string }[] = [
  {
    Icon: Flame,
    title: "One household streak",
    desc: "Every seat's minutes merge into a single flame the whole house protects.",
  },
  {
    Icon: NotebookPen,
    title: "One board, all lanes",
    desc: "Each member's next drill shows up on the same shared wall. No hunting.",
  },
  {
    Icon: Star,
    title: "Wins are shared",
    desc: "A chest by any seat lights up the whole house — that's the point of a family.",
  },
];

const SAVINGS: { Icon: typeof PiggyBank; title: string; text: string }[] = [
  {
    Icon: PiggyBank,
    title: "Stack seats, save 30%",
    text: "Two or more seats drop the household bill.",
  },
  {
    Icon: ShieldCheck,
    title: "One dashboard",
    text: "Every member's data, one calm page, zero clutter.",
  },
  {
    Icon: Clock,
    title: "Grows with age",
    text: "The same routine upgrades the whole house forward.",
  },
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
        { opacity: 0, transform: "translateY(12px)" },
        { opacity: 1, transform: "translateY(0)" },
      ],
      { duration: 480, delay, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "backwards" },
    );
    return () => anim.cancel();
  }, [delay]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

export function FamilyHubIntro({
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
      aria-labelledby="family-hub-hook-title"
    >
      <div
        className="relative w-full min-h-full md:min-h-0 md:max-w-md md:max-h-[90vh] md:flex md:flex-col md:overflow-hidden md:rounded-3xl md:border md:border-white/[0.06] md:shadow-2xl"
        style={{
          background: `radial-gradient(130% 90% at 50% 0%, ${PANEL} 0%, ${BG_MOSS} 48%, ${FOREST} 100%)`,
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
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px"
          style={{
            background: "linear-gradient(90deg, transparent, var(--lime-40), transparent)",
          }}
        />

        <div className="relative mx-auto flex min-h-full w-full max-w-[400px] flex-col px-5 pb-8 pt-[max(1.5rem,env(safe-area-inset-top))] md:min-h-0 md:max-w-none md:flex-1 md:overflow-y-auto max-[359px]:px-4">
        <div className="mt-4">
          <FadeUp delay={60}>
            <h1
              id="family-hub-hook-title"
              className="text-center text-[32px] font-extrabold uppercase leading-[0.98] tracking-tight text-foreground"
            >
              Whole house.
              <br />
              <span className="text-[var(--lime)]">One plan.</span>
            </h1>
          </FadeUp>

          <FadeUp delay={130}>
            <p className="mx-auto mt-3 max-w-[320px] text-center text-[12.5px] leading-relaxed text-muted-foreground/80">
              Give everyone their own lane on a single subscription — and watch one household streak
              grow on a shared wall.
            </p>
          </FadeUp>
        </div>

        <div className="mt-6">
          <FadeUp delay={200}>
            <div className="rounded-[18px] border border-dashed border-white/15 bg-white/[0.02] p-3.5">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[9px] font-bold tracking-[0.2em] text-muted-foreground/70">
                  OPEN SEATS
                </span>
                <span className="rounded-full border border-[var(--lime-25)] bg-[var(--lime-10)] px-2 py-px text-[8px] font-bold text-[var(--lime)]">
                  ADD ON PASS
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {SEATS.map(({ id, label, desc, Icon }) => (
                  <div
                    key={id}
                    className="keep-white rounded-xl border border-white/[0.06] bg-black/30 px-2 py-2.5 text-center"
                  >
                    <Icon size={14} className="mx-auto text-[var(--lime)]" />
                    <div className="mt-1.5 text-[10px] font-bold text-foreground">{label}</div>
                    <div className="text-[8.5px] leading-snug text-muted-foreground/60">{desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </FadeUp>
        </div>

        <div className="mt-4">
          <FadeUp delay={280}>
            <div className="rounded-[18px] border border-white/[0.08] bg-white/[0.03] p-3.5">
              <div className="mb-3 flex items-center gap-1.5">
                <Home size={12} className="text-[var(--lime)]" />
                <span className="text-[9px] font-bold tracking-[0.2em] text-muted-foreground/70">
                  SHARED FAMILY WALL
                </span>
              </div>
              <ul className="space-y-2.5">
                {WALL.map(({ Icon, title, desc }) => (
                  <li key={title} className="flex items-start gap-3">
                    <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-[var(--lime)]">
                      <Icon size={13} />
                    </span>
                    <div className="min-w-0">
                      <div className="text-[11px] font-bold text-foreground">{title}</div>
                      <div className="mt-0.5 text-[10px] leading-snug text-muted-foreground/70">
                        {desc}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </FadeUp>
        </div>

        <div className="mt-4">
          <FadeUp delay={360}>
            <div className="rounded-[18px] border border-[var(--lime-20)] bg-[var(--lime-04)] p-4">
              <ul className="space-y-2.5">
                {SAVINGS.map(({ Icon, title, text }) => (
                  <li key={title} className="flex items-center gap-3">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-[var(--lime-25)] bg-black/30 text-[var(--lime)]">
                      <Icon size={14} />
                    </span>
                    <div className="min-w-0">
                      <div className="text-[11px] font-bold text-foreground">{title}</div>
                      <div className="mt-0.5 text-[10px] leading-snug text-muted-foreground/75">
                        {text}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </FadeUp>
        </div>

        <div className="mt-auto pt-6">
          <FadeUp delay={440}>
            <button
              onClick={() => exit(onDone)}
              className="flex w-full items-center justify-center gap-2 rounded-[16px] py-4 text-[12px] font-bold tracking-[0.12em] text-[var(--on-accent)] transition hover:brightness-110 active:scale-[0.98]"
              style={{
                background: `linear-gradient(90deg, ${LIME}, ${LIME_LIGHT})`,
                boxShadow:
                  "0 10px 34px var(--lime-mid-25), 0 1px 0 var(--glass-25) inset",
              }}
            >
              CONFIGURE HOUSEHOLD SEATS
              <ArrowRight size={14} />
            </button>
          </FadeUp>

          <button
            onClick={() => exit(onClose)}
            className="mx-auto mt-3 block text-[10px] text-muted-foreground/60 underline-offset-2 hover:text-muted-foreground hover:underline transition-colors"
          >
            Skip for now
          </button>
        </div>
      </div>
      </div>
    </div>,
    document.body,
  );
}
