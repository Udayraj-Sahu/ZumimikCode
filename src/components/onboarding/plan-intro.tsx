"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, type Variants } from "motion/react";
import { ArrowRight, Check, CreditCard, Lock, QrCode, ShieldCheck, Smartphone, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { PLANS } from "@/lib/types/onboarding";
import type { PlanId } from "@/lib/types/onboarding";
import { useOnboardingStore } from "@/stores/onboarding-store";

const ACCENT = "#C8FF4D";
const inr = (n: number) => `₹${new Intl.NumberFormat("en-IN").format(n)}`;

/* ── Presentational: plan selector (reused by AdaptiveReprompt) ── */

export function PlanSelector({
  value,
  onChange,
  billing,
}: {
  value: PlanId;
  onChange: (plan: PlanId) => void;
  onLaneChange: (lane: string) => void;
  lane: string;
  billing?: "annual" | "monthly";
}) {
  return (
    <div className="flex flex-col gap-3">
      {PLANS.map((p, idx) => {
        const selected = p.id === value;
        const unit = billing === "monthly" ? "mo" : "yr";
        const shown = p.billing[billing ?? "annual"];
        return (
          <motion.button
            key={p.id}
            type="button"
            onClick={() => onChange(p.id)}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + idx * 0.05, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              "relative w-full rounded-2xl border p-3 text-left transition",
              selected
                ? "border-[#C8FF4D]/55 bg-[#C8FF4D]/[0.06] shadow-[0_0_24px_rgba(200,255,77,0.12)]"
                : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.14]",
            )}
          >
            {p.badge && selected && (
              <span className="absolute -top-2 right-3 rounded-full bg-[#C8FF4D] px-2 py-0.5 font-mono text-[8px] font-bold tracking-[0.14em] text-[#0A0C0A]">
                {p.badge}
              </span>
            )}

            <div className="flex items-start gap-3">
              {/* radio */}
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
                      <span className={cn("text-[13px] font-bold", selected ? "text-foreground" : "text-foreground/80")}>
                        {p.name}
                      </span>
                      {p.id === "single-lane" && (
                        <span className="rounded bg-[#C8FF4D]/15 px-1.5 py-0.5 text-[8px] font-bold tracking-[0.1em] text-[#C8FF4D]">
                          TARGET×3
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 text-[11px] leading-snug text-muted-foreground/55">{p.desc}</div>
                  </div>
                  <div className="shrink-0 text-right text-[13px] font-bold text-[#C8FF4D]">
                    {inr(shown)}
                    <span className="text-[10px] font-normal text-muted-foreground/45">/{unit}</span>
                  </div>
                </div>

                {p.tracks && selected && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[9px] tracking-[0.14em] text-muted-foreground/50">
                        UNLOCKED TRACKS:
                      </span>
                      <span className="font-mono text-[9px] font-bold text-cyan-400">{p.lanes} Lanes Active</span>
                    </div>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {p.tracks.map((t) => (
                        <span
                          key={t}
                          className="inline-flex items-center gap-1 rounded border border-cyan-400/40 bg-cyan-400/10 px-2 py-1 text-[10px] text-cyan-300"
                        >
                          <Check size={10} /> {t}
                        </span>
                      ))}
                      {p.extra && (
                        <span className="rounded border border-dashed border-white/15 px-2 py-1 text-[10px] text-muted-foreground/50">
                          {p.extra}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {!p.tracks && (
                  <ul className="mt-2.5 flex flex-col gap-1.5">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-[11px] font-medium text-muted-foreground/50">
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

const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05, delayChildren: 0.04 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] } },
};

const PAY_MODES: { id: "upi" | "wallet" | "card"; label: string; Icon: typeof QrCode }[] = [
  { id: "upi", label: "UPI / QR", Icon: QrCode },
  { id: "wallet", label: "GPay / Apple", Icon: Smartphone },
  { id: "card", label: "Card / Net", Icon: CreditCard },
];

const COUPON = { code: "VIP_EARLYBIRD", amount: 100, note: "Early Adopter Neural Grant" };

export function PlanIntro({ onClose }: { onClose: () => void }) {
  const store = useOnboardingStore();
  const overlayRef = useRef<HTMLDivElement>(null);

  const [billing, setBilling] = useState<"annual" | "monthly">("annual");
  const [planId, setPlanId] = useState<PlanId>(store.planId ?? "dual-lane");
  const [pay, setPay] = useState<"upi" | "wallet" | "card">("upi");
  const [couponOn, setCouponOn] = useState(true);

  const plan = PLANS.find((p) => p.id === planId)!;
  const unit = billing === "annual" ? "yr" : "mo";

  const subtotal = plan.billing[billing];
  const discount = couponOn ? Math.min(COUPON.amount, subtotal) : 0;
  const total = subtotal - discount;

  useEffect(() => {
    if (overlayRef.current) {
      const el = overlayRef.current;
      el.animate([{ transform: "translateX(100%)" }, { transform: "translateX(0%)" }], {
        duration: 320,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
      });
    }
  }, []);

  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const closingRef = useRef(false);

  const confirm = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    store.setPlanId(planId);
    store.setPlanLane(store.targetExam || "cat");
    const done = () => onCloseRef.current();
    const el = overlayRef.current;
    if (!el) return done();
    el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 180, easing: "ease-in", fill: "forwards" }).addEventListener("finish", done, { once: true });
  }, [store, planId]);

  const skip = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    const done = () => onCloseRef.current();
    const el = overlayRef.current;
    if (!el) return done();
    el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 180, easing: "ease-in", fill: "forwards" }).addEventListener("finish", done, { once: true });
  }, []);

  return createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[70] flex overflow-y-auto justify-center"
      style={{ background: "linear-gradient(180deg, rgba(10,12,10,0.99) 0%, rgba(14,17,13,0.99) 100%)" }}
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-[400px] min-h-full px-4 pb-8 pt-4">
        {/* ambient glows */}
        <div aria-hidden className="pointer-events-none absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[90px]" />
        <div aria-hidden className="pointer-events-none absolute bottom-0 right-0 h-56 w-56 rounded-full bg-[#C8FF4D]/[0.07] blur-[90px]" />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(200,255,77,0.35), transparent)" }} />

        {/* top bar */}
        <header className="relative flex items-center justify-center">
          <button aria-label="Close" onClick={skip} className="absolute left-0 text-[#C8FF4D] transition-colors hover:text-[#D9FF85] active:scale-95">
            <X size={18} />
          </button>
          <span className="font-mono text-[11px] font-bold tracking-[0.28em] text-[#C8FF4D]/90">EXAM ARENA</span>
        </header>

        {/* heading */}
        <section className="relative mt-6 text-center">
          <motion.p variants={itemVariants} initial="hidden" animate="show" className="font-mono text-[9px] tracking-[0.2em] text-fuchsia-400">
            INITIALIZE ELITE PROTOCOL // PLAN
          </motion.p>
          <motion.h1
            variants={itemVariants}
            initial="hidden"
            animate="show"
            className="mt-2 text-[clamp(1.4rem,6.5vw,1.75rem)] font-bold leading-tight text-foreground uppercase tracking-[-0.02em]"
          >
            Unlock{" "}
            <span className="bg-gradient-to-r from-[#C8FF4D] to-[#A9E93E] bg-clip-text text-transparent">
              Multi-Lane Prep
            </span>
          </motion.h1>
          <motion.p variants={itemVariants} initial="hidden" animate="show" className="mx-auto mt-2 max-w-[300px] text-[12px] leading-relaxed text-muted-foreground/60">
            Bypass all limiters. Engage concurrent training modes for ultimate algorithmic mastery.
          </motion.p>
        </section>

        {/* billing toggle */}
        <div className="relative mt-5 grid grid-cols-2 gap-1 rounded-2xl border border-white/[0.08] bg-black/40 p-1">
          {(["annual", "monthly"] as const).map((b) => {
            const active = billing === b;
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
                  <span className={cn("font-mono text-[10px] font-bold tracking-widest", active ? "text-foreground" : "text-muted-foreground/70")}>
                    {b.toUpperCase()}
                  </span>
                  {b === "annual" && (
                    <span className="rounded bg-[#C8FF4D] px-1 py-px text-[8px] font-bold text-[#0A0C0A]">-40%</span>
                  )}
                </div>
                <div className="mt-0.5 text-[11px] text-muted-foreground/60">
                  {inr(PLANS[0].billing[b])}/{b === "annual" ? "yr" : "mo"}
                </div>
              </button>
            );
          })}
        </div>

        {/* plans */}
        <div className="relative mt-4">
          <PlanSelector
            value={planId}
            onChange={setPlanId}
            lane={store.targetExam || "cat"}
            onLaneChange={() => {}}
            billing={billing}
          />
        </div>

        {/* coupon */}
        {couponOn && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="relative mt-4 flex items-center justify-between rounded-2xl border border-dashed border-[#C8FF4D]/40 bg-[#C8FF4D]/[0.05] px-3 py-2.5"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] font-bold text-[#C8FF4D]">{COUPON.code}</span>
                <span className="rounded bg-[#C8FF4D] px-1.5 py-px text-[8px] font-bold text-[#0A0C0A]">
                  -{inr(COUPON.amount)} APPLIED
                </span>
              </div>
              <div className="mt-0.5 text-[10px] text-muted-foreground/60">{COUPON.note}</div>
            </div>
            <button
              type="button"
              onClick={() => setCouponOn(false)}
              className="font-mono text-[10px] font-bold tracking-wider text-red-400 transition-colors hover:text-red-300"
            >
              REMOVE
            </button>
          </motion.div>
        )}

        {/* payment mode */}
        <div className="relative mt-5">
          <p className="mb-2 font-mono text-[9px] tracking-[0.2em] text-muted-foreground/60">PAYMENT MODE</p>
          <div className="grid grid-cols-3 gap-2">
            {PAY_MODES.map(({ id, label, Icon }) => {
              const active = pay === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setPay(id)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 rounded-2xl border py-3 text-[10px] font-medium transition",
                    active
                      ? "border-[#C8FF4D]/50 bg-[#C8FF4D]/10 text-[#C8FF4D] shadow-[0_0_16px_rgba(200,255,77,0.12)]"
                      : "border-white/[0.08] bg-white/[0.02] text-muted-foreground/60 hover:border-white/[0.16]",
                  )}
                >
                  <Icon size={16} />
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* summary */}
        <div className="relative mt-5 space-y-1.5 rounded-2xl border border-white/[0.08] bg-black/40 p-3 text-[12px]">
          <div className="flex justify-between text-muted-foreground/70">
            <span>
              Subtotal ({plan.lanes} {plan.lanes === 1 ? "Lane" : "Lanes"} · {billing === "annual" ? "Annual" : "Monthly"})
            </span>
            <span>{inr(subtotal)}</span>
          </div>
          {couponOn && (
            <div className="flex justify-between text-[#C8FF4D]">
              <span>
                Code <span className="font-mono">{COUPON.code}</span>
              </span>
              <span>-{inr(discount)}</span>
            </div>
          )}
          <div className="flex items-center justify-between border-t border-white/[0.08] pt-2 text-[13px] font-bold">
            <span>Total Due Today</span>
            <span className="text-base text-foreground">
              {inr(total)}/{unit}
            </span>
          </div>
        </div>

        {/* CTA */}
        <button
          type="button"
          onClick={confirm}
          className="group relative mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 py-3.5 text-[12px] font-bold uppercase tracking-[0.14em] text-[#0A0C0A] transition active:scale-[0.98]"
          style={{
            background: "linear-gradient(90deg, #C8FF4D, #B9F45C)",
            boxShadow: "0 10px 30px rgba(200,255,77,0.25), 0 1px 0 rgba(255,255,255,0.25) inset",
          }}
        >
          <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/55 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full" />
          <Lock size={14} strokeWidth={2.5} className="relative" />
          <span className="relative">Start Protocol</span>
          <span className="relative font-mono text-[10px] font-bold tracking-normal opacity-80">
            {inr(total)}/{billing === "annual" ? "YEAR" : "MONTH"}
          </span>
        </button>

        <p className="relative mt-3 flex items-center justify-center gap-1.5 text-center text-[10px] text-muted-foreground/45">
          <ShieldCheck size={12} />
          Adaptive engine calibrated • Change anytime in Settings
        </p>
        <button onClick={skip} className="relative mx-auto mt-2 block text-center text-[10px] text-muted-foreground/40 underline-offset-2 transition-colors hover:text-foreground/70 hover:underline">
          Cancel and return to training
        </button>
      </div>
    </div>,
    document.body,
  );
}