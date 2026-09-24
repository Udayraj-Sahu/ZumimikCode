"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MotionConfig, motion } from "motion/react";
import { Check, CreditCard, Lock, QrCode, ShieldCheck, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";
import { PLANS } from "@/lib/types/onboarding";
import type { PlanId } from "@/lib/types/onboarding";
import { DOMAIN_LABELS } from "@/lib/types/template";
import { useOnboardingStore } from "@/stores/onboarding-store";

const ACCENT = "#C8FF4D";
const inr = (n: number) => `₹${new Intl.NumberFormat("en-IN").format(n)}`;

const EXAM_QUALIFIER: Record<string, string> = {
  cat: "Verbal & Quant",
  gmat: "Quant · Verbal · DI",
  gre: "Verbal · Quant · AWA",
  banking: "Quant · Reasoning · English",
  "vedic-math": "Speed Math trees",
};

function laneLabel(lane: string | null | undefined): string {
  if (!lane) return "Your Exam";
  return DOMAIN_LABELS[lane] ?? lane;
}

function laneQualifier(lane: string | null | undefined): string {
  if (!lane) return "adaptive syllabus";
  return EXAM_QUALIFIER[lane] ?? "adaptive syllabus";
}

function realDiscount(annual: number, monthly: number): number {
  if (monthly <= 0 || annual <= 0) return 0;
  return Math.max(0, Math.round((1 - annual / (monthly * 12)) * 100));
}

const DECK_STYLE: Record<
  PlanId,
  {
    ring: string;
    glow: string;
    price: string;
    tag: string;
    grad: string;
    chip: string;
    holo: string;
  }
> = {
  initiate: {
    ring: "border-white/[0.18] bg-white/[0.04]",
    glow: "",
    price: "text-white/85",
    tag: "border-white/20 bg-white/10 text-white/70",
    grad: "from-white/[0.06] via-white/[0.02] to-transparent",
    chip: "from-slate-400/70 to-slate-500/40 border-white/30",
    holo: "from-slate-500/50 via-white/20 to-slate-500/50",
  },
  "single-lane": {
    ring: "border-cyan-400/40 bg-cyan-400/[0.06]",
    glow: "shadow-[0_0_30px_rgba(34,211,238,0.22)]",
    price: "text-cyan-300",
    tag: "border-cyan-400/50 bg-cyan-400/15 text-cyan-300",
    grad: "from-cyan-400/[0.14] via-cyan-400/[0.04] to-transparent",
    chip: "from-cyan-300/80 to-cyan-500/40 border-cyan-200/60",
    holo: "from-cyan-500/60 via-white/25 to-cyan-500/60",
  },
  "dual-lane": {
    ring: "border-[#C8FF4D]/50 bg-[#C8FF4D]/[0.07]",
    glow: "shadow-[0_0_34px_rgba(200,255,77,0.32)]",
    price: "text-[#C8FF4D]",
    tag: "border-[#C8FF4D]/50 bg-[#C8FF4D]/15 text-[#C8FF4D]",
    grad: "from-[#C8FF4D]/[0.16] via-[#C8FF4D]/[0.04] to-transparent",
    chip: "from-[#C8FF4D] to-lime-500/60 border-[#E9FFA8]/70",
    holo: "from-[#C8FF4D]/70 via-white/30 to-[#C8FF4D]/70",
  },
};

const CARD_CODE: Record<PlanId, string> = {
  initiate: "0000 0000 0101",
  "single-lane": "0000 077 0132",
  "dual-lane": "0000 7070 1340",
};

function FadeUp({
  delay = 0,
  className,
  children,
}: {
  delay?: number;
  className?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.animate(
      [
        { opacity: 0, transform: "translateY(14px)" },
        { opacity: 1, transform: "translateY(0)" },
      ],
      {
        duration: 550,
        delay,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
        fill: "backwards",
      },
    );
  }, [delay]);
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

/* ── Presentational: plan selector (reused by AdaptiveReprompt & paywall) ── */

export function PlanSelector({
  value,
  onChange,
  billing,
  lane,
}: {
  value: PlanId;
  onChange: (plan: PlanId) => void;
  onLaneChange: (lane: string) => void;
  lane: string;
  billing?: "annual" | "monthly";
}) {
  const store = useOnboardingStore();
  const second = (store.activePreps.find((p) => p !== lane) ??
    (lane && lane !== "gmat" ? "gmat" : "cat")) as string;

  const dualTracks =
    lane in DOMAIN_LABELS
      ? [
          `${DOMAIN_LABELS[lane]} (${laneQualifier(lane)})`,
          `${DOMAIN_LABELS[second] ?? "Second"} Fast-Track`,
          "+ Vedic Math HUD",
        ]
      : undefined;

  return (
    <div className="flex flex-col gap-3">
      {PLANS.map((p, idx) => {
        const selected = p.id === value;
        const unit = billing === "monthly" ? "mo" : "yr";
        const shown = p.billing[billing ?? "annual"];
        const tracks = p.id === "dual-lane" && dualTracks ? dualTracks : p.tracks;
        return (
          <motion.button
            key={p.id}
            type="button"
            onClick={() => onChange(p.id)}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + idx * 0.05, duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              "relative w-full rounded-[20px] border p-3.5 text-left transition",
              selected
                ? "border-[#C8FF4D]/55 bg-[#C8FF4D]/[0.06] shadow-[0_0_24px_rgba(200,255,77,0.12)]"
                : "border-white/[0.07] bg-black/25 hover:border-white/[0.16]",
            )}
          >
            {p.badge && selected && (
              <span className="absolute -top-2 right-3 rounded-full bg-[#C8FF4D] px-2 py-0.5 text-[8px] font-bold tracking-[0.14em] text-[#0A0C0A]">
                {p.badge}
              </span>
            )}

            <div className="flex items-start gap-3">
              <span
                className={cn(
                  "mt-0.5 grid size-4 shrink-0 place-items-center rounded-full border-2 transition-colors",
                  selected
                    ? "border-[#C8FF4D] bg-[#C8FF4D] shadow-[0_0_10px_rgba(200,255,77,0.4)]"
                    : "border-white/20 bg-transparent",
                )}
              >
                {selected && <Check size={9} className="text-[#0A0C0A]" strokeWidth={3.5} />}
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "text-[13px] font-bold",
                          selected ? "text-foreground" : "text-foreground/80",
                        )}
                      >
                        {p.name}
                      </span>
                      {p.id === "single-lane" && (
                        <span className="rounded bg-[#C8FF4D]/15 px-1.5 py-0.5 text-[8px] font-bold tracking-[0.1em] text-[#C8FF4D]">
                          {laneLabel(lane).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 text-[11px] leading-snug text-muted-foreground/55">
                      {p.desc}
                    </div>
                  </div>
                  <div className="shrink-0 text-right text-[13px] font-bold text-[#C8FF4D]">
                    {inr(shown)}
                    <span className="text-[10px] font-normal text-muted-foreground/45">
                      /{unit}
                    </span>
                  </div>
                </div>

                {tracks && selected && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] tracking-[0.14em] text-muted-foreground/50">
                        UNLOCKED TRACKS:
                      </span>
                      <span className="text-[9px] font-bold text-cyan-400">
                        {p.lanes} Lanes Active
                      </span>
                    </div>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {tracks.map((t) =>
                        t.startsWith("+") ? (
                          <span
                            key={t}
                            className="rounded border border-dashed border-white/15 px-2 py-1 text-[10px] text-muted-foreground/50"
                          >
                            {t}
                          </span>
                        ) : (
                          <span
                            key={t}
                            className="inline-flex items-center gap-1 rounded border border-cyan-400/40 bg-cyan-400/10 px-2 py-1 text-[10px] text-cyan-300"
                          >
                            <Check size={10} /> {t}
                          </span>
                        ),
                      )}
                    </div>
                  </div>
                )}

                {!p.tracks && !(p.id === "dual-lane" && dualTracks) && (
                  <ul className="mt-2.5 flex flex-col gap-1.5">
                    {p.features.map((f) => (
                      <li
                        key={f}
                        className="flex items-center gap-2 text-[11px] font-medium text-muted-foreground/50"
                      >
                        <span className="grid size-4 shrink-0 place-items-center rounded-full bg-[#C8FF4D]/12 text-[#C8FF4D]">
                          <Check size={9} strokeWidth={3.5} />
                        </span>
                        {f}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}

/* ── Plan hook overlay ── */

const PAY_MODES: { id: "upi" | "wallet" | "card"; label: string; Icon: typeof QrCode }[] = [
  { id: "upi", label: "U", Icon: QrCode },
  { id: "wallet", label: "GPay", Icon: Smartphone },
  { id: "card", label: "Card", Icon: CreditCard },
];

const COUPON = { code: "VIP_EARLYBIRD", amount: 100, note: "Early Adopter Neural Grant" };

export function PlanIntro({
  onClose,
  preloaded = false,
}: {
  onClose: () => void;
  preloaded?: boolean;
}) {
  const store = useOnboardingStore();
  const overlayRef = useRef<HTMLDivElement>(null);

  const [billing, setBilling] = useState<"annual" | "monthly">("annual");
  const [planId, setPlanId] = useState<PlanId>(store.planId ?? "dual-lane");
  const [pay, setPay] = useState<"upi" | "wallet" | "card">("upi");
  const [couponOn, setCouponOn] = useState(true);

  const lane = store.targetExam || store.planLane || "cat";
  const plan = PLANS.find((p) => p.id === planId)!;
  const unit = billing === "annual" ? "yr" : "mo";
  const pct = realDiscount(plan.billing.annual, plan.billing.monthly);
  const price = plan.billing[billing];

  const subtotal = price;
  const discount = couponOn ? Math.min(COUPON.amount, subtotal) : 0;
  const total = subtotal - discount;

  const deckIndex = PLANS.findIndex((p) => p.id === planId);

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

  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const closingRef = useRef(false);

  const fadeOut = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    const done = () => onCloseRef.current();
    const el = overlayRef.current;
    if (!el) return done();
    el.animate([{ transform: "translateX(0%)" }, { transform: "translateX(-100%)" }], {
      duration: 280,
      easing: "cubic-bezier(0.55, 0, 0.55, 0.2)",
      fill: "forwards",
    }).addEventListener("finish", done, { once: true });
  }, []);

  const confirm = useCallback(() => {
    store.setPlanId(planId);
    store.setPlanLane(lane);
    fadeOut();
  }, [store, planId, lane, fadeOut]);

  return createPortal(
    <MotionConfig reducedMotion="user">
      <div
        ref={overlayRef}
        className={cn(
"fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm",
        preloaded && "invisible pointer-events-none",
      )}
      role="dialog"
      aria-modal="true"
      aria-hidden={preloaded || undefined}
      aria-labelledby="plan-hook-title"
    >
      <div
        className="relative flex w-full max-w-md max-h-[90vh] flex-col overflow-hidden rounded-t-3xl sm:rounded-3xl border border-white/[0.06] shadow-2xl"
        style={{
          background: "radial-gradient(130% 90% at 50% 0%, #10140e 0%, #0a0b08 48%, #070907 100%)",
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-[-90px] h-56 w-56 -translate-x-1/2 rounded-full bg-[#C8FF4D]/[0.12] blur-[95px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(200,255,77,0.4), transparent)",
          }}
        />

        <div className="flex-1 min-h-0 overflow-y-auto px-5 pb-8 pt-[max(2rem,env(safe-area-inset-top))]">
          {/* centered brand */}
          <FadeUp className="flex justify-center">
            <div className="inline-flex items-center gap-2.5 rounded-full border border-[#C8FF4D]/25 bg-[#C8FF4D]/[0.07] px-4 py-1.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#C8FF4D] opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#C8FF4D]" />
              </span>
              <span className="text-[11px] font-bold tracking-[0.22em] text-[#C8FF4D]">
                MEMBERSHIP
              </span>
            </div>
          </FadeUp>

          {/* hero */}
          <FadeUp delay={80} className="mt-5 text-center">
            <h1
              id="plan-hook-title"
              className="text-[34px] font-extrabold uppercase leading-[0.98] tracking-tight text-foreground"
            >
              Pick your{" "}
              <span
                className="text-transparent"
                style={{
                  background: "linear-gradient(90deg, #C8FF4D, #e8ffb0)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                }}
              >
                pace.
              </span>
            </h1>
            <p className="mx-auto mt-3 max-w-[320px] text-[12.5px] leading-relaxed text-muted-foreground/80">
              One pass, tuned to your exam —{" "}
              <span className="font-semibold text-foreground">{laneLabel(lane)}</span>. Upgrade
              lanes any time from Settings.
            </p>
          </FadeUp>

          {/* billing switch */}
          <FadeUp delay={140} className="mt-6">
            <div className="grid grid-cols-2 gap-1 rounded-2xl border border-white/[0.08] bg-black/40 p-1">
              {(["annual", "monthly"] as const).map((b) => {
                const active = billing === b;
                const off =
                  b === "annual"
                    ? realDiscount(PLANS[0].billing.annual, PLANS[0].billing.monthly)
                    : 0;
                return (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setBilling(b)}
                    className={cn(
                      "rounded-xl px-3 py-2 text-center transition",
                      active
                        ? "border border-[#C8FF4D]/50 bg-[#C8FF4D]/10 shadow-[0_0_18px_rgba(200,255,77,0.12)]"
                        : "border border-transparent hover:bg-white/5",
                    )}
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <span
                        className={cn(
                          "text-[10px] font-bold tracking-widest",
                          active ? "text-foreground" : "text-muted-foreground/70",
                        )}
                      >
                        {b.toUpperCase()}
                      </span>
                      {off > 0 && (
                        <span className="rounded bg-[#C8FF4D] px-1 py-px text-[8px] font-bold text-[#0A0C0A]">
                          -{off}%
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 text-[11px] text-muted-foreground/60">
                      {inr(PLANS[0].billing[b])}/{b === "annual" ? "yr" : "mo"}
                    </div>
                  </button>
                );
              })}
            </div>
          </FadeUp>

          {/* fanned plan deck */}
          <FadeUp delay={200} className="mt-5">
            <div style={{ perspective: 1000 }}>
              <div className="relative h-[216px]">
                {PLANS.map((p, idx) => {
                  const diff = idx - deckIndex;
                  const sel = diff === 0;
                  const s = DECK_STYLE[p.id];
                  const tag =
                    p.id === "initiate"
                      ? "FREE · FOREVER"
                      : p.id === "single-lane"
                        ? laneLabel(lane).toUpperCase()
                        : "×2 LANES";
                  return (
                    <motion.button
                      key={p.id}
                      type="button"
                      onClick={() => setPlanId(p.id)}
                      aria-pressed={sel}
                      initial={false}
                      animate={{
                        rotateY: diff * -17,
                        x: diff * 34,
                        scale: 1 - Math.min(0.14, Math.abs(diff) * 0.07),
                        opacity: 1 - Math.min(0.45, Math.abs(diff) * 0.22),
                        zIndex: 10 - Math.abs(diff),
                      }}
                      transition={{ type: "spring", stiffness: 240, damping: 26 }}
                      className={cn(
                        "absolute inset-x-0 top-0 mx-auto w-[300px] overflow-hidden rounded-[22px] border p-4 text-left backdrop-blur-xl transition-shadow",
                        s.ring,
                        sel && s.glow,
                      )}
                    >
                      <div
                        className={cn(
                          "pointer-events-none absolute inset-0 bg-gradient-to-br",
                          s.grad,
                        )}
                      />

                      <div
                        aria-hidden
                        className="pointer-events-none absolute -top-16 left-1/2 h-32 w-[260px] -translate-x-1/2 rotate-[-14deg] opacity-60"
                        style={{
                          background:
                            "linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)",
                          filter: "blur(6px)",
                        }}
                      />

                      <div className="relative">
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-[15px] font-black uppercase tracking-tight text-white">
                            {p.name}
                          </span>
                          <span
                            className={cn(
                              "rounded-md border px-1.5 py-0.5 text-[8px] font-bold tracking-[0.14em]",
                              s.tag,
                              sel ? "opacity-100" : "opacity-60",
                            )}
                          >
                            {tag}
                          </span>
                        </div>

                        <div className="mt-3 flex items-center justify-between">
                          <span
                            className={cn(
                              "grid h-8 w-11 place-items-center rounded-md border bg-gradient-to-br",
                              s.chip,
                            )}
                          >
                            <span className="h-4 w-7 rounded-[3px] border border-black/30 bg-black/20" />
                          </span>
                          <span className="text-[10px] font-bold tracking-[0.22em] text-white/70">
                            {CARD_CODE[p.id]}
                          </span>
                        </div>

                        <div className="mt-3 flex items-baseline gap-1.5">
                          <motion.span
                            key={`${planId}-${billing}`}
                            initial={{ y: -8, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                            className={cn(
                              "text-[34px] font-black leading-none tracking-tight",
                              s.price,
                            )}
                          >
                            {inr(price)}
                          </motion.span>
                          <span className="text-[11px] font-medium text-muted-foreground/60">
                            /{unit}
                          </span>
                          {pct > 0 && billing === "annual" && (
                            <span className="ml-auto rounded bg-[#FB7185]/15 px-1.5 py-0.5 text-[8px] font-bold text-rose-300">
                              SAVE {pct}%
                            </span>
                          )}
                        </div>

                        <p
                          className={cn(
                            "mt-1 text-[11px] leading-snug",
                            sel ? "text-muted-foreground/70" : "text-muted-foreground/40",
                          )}
                        >
                          {p.id === "dual-lane"
                            ? `${laneLabel(lane)} (${laneQualifier(lane)}) + 1 more lane in parallel`
                            : p.desc}
                        </p>

                        <div
                          className="mt-3 h-1.5 rounded-full opacity-70"
                          style={{
                            background:
                              "repeating-linear-gradient(90deg, rgba(255,255,255,0.35) 0 5px, rgba(255,255,255,0.05) 5px 9px)",
                          }}
                        />
                        <div className="mt-1.5 flex items-center justify-between text-[7px] tracking-[0.2em] text-white/30">
                          <span>ARENA · {p.id.toUpperCase()}</span>
                          <span>{sel ? "ACTIVE" : "SLOT"}</span>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </FadeUp>

          {/* deck selector tabs */}
          <FadeUp delay={240} className="mt-2 flex gap-1.5">
            {PLANS.map((p) => {
              const active = p.id === planId;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPlanId(p.id)}
                  className={cn(
                    "flex-1 rounded-lg border px-1 py-1.5 text-center transition",
                    active
                      ? "border-[#C8FF4D]/50 bg-[#C8FF4D]/10"
                      : "border-white/[0.08] bg-white/[0.02] hover:border-white/[0.16]",
                  )}
                >
                  <div
                    className={cn(
                      "text-[8px] font-bold tracking-widest",
                      active ? "text-[#C8FF4D]" : "text-muted-foreground/60",
                    )}
                  >
                    {p.name.toUpperCase()}
                  </div>
                  <div className="text-[10px] font-bold text-muted-foreground/70">
                    {p.billing[billing] ? inr(p.billing[billing]) : "FREE"}
                    <span className="text-[8px] font-normal">
                      /{billing === "annual" ? "Yr" : "Mo"}
                    </span>
                  </div>
                </button>
              );
            })}
          </FadeUp>

          {/* voucher */}
          {couponOn && (
            <FadeUp delay={260} className="mt-4">
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="relative overflow-hidden rounded-[20px] border border-dashed border-[#C8FF4D]/40 bg-gradient-to-r from-[#C8FF4D]/[0.08] to-transparent"
              >
                <div className="relative flex items-center justify-between gap-2 px-4 py-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-[#C8FF4D] px-1 py-px text-[7px] font-black tracking-[0.18em] text-[#0A0C0A]">
                        VIP WINTER
                      </span>
                      <span className="text-[11px] font-bold tracking-[0.14em] text-[#C8FF4D]">
                        {COUPON.code}
                      </span>
                    </div>
                    <div className="mt-1 text-[10px] text-muted-foreground/60">{COUPON.note}</div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="text-[9px] tracking-[0.14em] text-[#C8FF4D]/80">CASHBACK</div>
                    <div className="text-[18px] font-black leading-none text-white">
                      -{inr(COUPON.amount)}
                    </div>
                    <button
                      type="button"
                      onClick={() => setCouponOn(false)}
                      className="mt-0.5 text-[8px] font-bold tracking-wider text-red-400/80 transition-colors hover:text-red-300"
                    >
                      REMOVE
                    </button>
                  </div>
                </div>
              </motion.div>
            </FadeUp>
          )}

          {/* payment modes */}
          <FadeUp delay={320} className="mt-5">
            <p className="mb-2 text-[9px] tracking-[0.2em] text-muted-foreground/60">PAY WITH</p>
            <div className="grid grid-cols-3 gap-2">
              {PAY_MODES.map(({ id, label, Icon }) => {
                const active = pay === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setPay(id)}
                    className={cn(
                      "flex h-14 flex-col items-center justify-center gap-1 rounded-[18px] border text-[10px] font-medium transition",
                      active
                        ? "border-[#C8FF4D]/50 bg-[#C8FF4D]/10 text-[#C8FF4D] shadow-[0_0_16px_rgba(200,255,77,0.12)]"
                        : "border-white/[0.08] bg-black/25 text-muted-foreground/60 hover:border-white/[0.16]",
                    )}
                  >
                    {active && (
                      <span className="pointer-events-none absolute inset-x-2 top-0 h-px bg-gradient-to-r from-transparent via-[#C8FF4D]/70 to-transparent" />
                    )}
                    <Icon size={15} />
                    {label}
                  </button>
                );
              })}
            </div>
          </FadeUp>

          {/* receipt */}
          <FadeUp delay={380} className="mt-4">
            <div className="space-y-1.5 rounded-[20px] border border-dashed border-white/15 bg-black/40 p-3.5 text-[12px]">
              <div className="flex justify-between text-muted-foreground/70">
                <span>
                  Subtotal ({plan.lanes} {plan.lanes === 1 ? "Lane" : "Lanes"} ·{" "}
                  {billing === "annual" ? "Annual" : "Monthly"})
                </span>
                <span>{inr(subtotal)}</span>
              </div>
              {couponOn && (
                <div className="flex justify-between text-[#C8FF4D]">
                  <span>Code {COUPON.code}</span>
                  <span>-{inr(discount)}</span>
                </div>
              )}
              <div className="flex items-end justify-between border-t border-dashed border-white/10 pt-2">
                <span className="text-[13px] font-bold text-muted-foreground/80">
                  Total Due Today
                </span>
                <span>
                  <motion.span
                    key={`${total}-${unit}`}
                    initial={{ y: -6, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                    className="text-[22px] font-black leading-none text-foreground"
                  >
                    {inr(total)}
                  </motion.span>
                  <span className="ml-1 text-[10px] font-bold text-muted-foreground/60">
                    /{unit}
                  </span>
                </span>
              </div>
            </div>
          </FadeUp>

          {/* CTA */}
          <FadeUp delay={440} className="mt-4">
            <button
              type="button"
              onClick={confirm}
              className="group relative flex w-full items-center justify-center gap-2 rounded-[18px] py-4 text-[12px] font-bold uppercase tracking-[0.14em] text-[#0A0C0A] transition active:scale-[0.98]"
              style={{
                background: "linear-gradient(90deg, #C8FF4D, #B9F45C)",
                boxShadow:
                  "0 10px 30px rgba(200,255,77,0.25), 0 1px 0 rgba(255,255,255,0.25) inset",
              }}
            >
              <Lock size={14} strokeWidth={2.5} className="relative" />
              <span className="relative">
                {planId === "initiate" ? "Start Free Plan" : "Start My Pass"}
              </span>
              <span className="relative font-bold tracking-normal opacity-80">
                {inr(total)}/{billing === "annual" ? "YEAR" : "MONTH"}
              </span>
            </button>

            <button
              onClick={fadeOut}
              className="mx-auto mt-3 block text-[10px] text-muted-foreground/50 underline-offset-2 transition-colors hover:text-muted-foreground hover:underline"
            >
              Skip for now
            </button>

            <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-[10px] text-muted-foreground/45">
              <ShieldCheck size={12} />
              Adaptive engine calibrated • Change anytime in Settings
            </p>
          </FadeUp>
        </div>
      </div>
      </div>,
    </MotionConfig>,
    document.body,
  );
}
