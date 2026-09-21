"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, type Variants } from "motion/react";
import { Check, Crown, Rocket, ShieldCheck, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { PLANS } from "@/lib/types/onboarding";
import type { PlanId } from "@/lib/types/onboarding";
import { useOnboardingStore } from "@/stores/onboarding-store";

const ACCENT = "#C8FF4D";

const TIER_ICON: Record<string, { Icon: typeof Zap; chip: string }> = {
  initiate: { Icon: Zap, chip: "text-slate-300" },
  "single-lane": { Icon: Rocket, chip: "text-sky-300" },
  "dual-lane": { Icon: Crown, chip: "text-amber-300" },
};

const railVariants: Variants = {
  hidden: { scaleY: 0, opacity: 0 },
  show: {
    scaleY: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 500, damping: 30 },
  },
};

const listVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05, delayChildren: 0.04 } },
};

const featureVariants: Variants = {
  hidden: { opacity: 0, x: -10 },
  show: {
    opacity: 1,
    x: 0,
    transition: { type: "spring", stiffness: 420, damping: 28 },
  },
};

/* ── Presentational: plan selector (reused by AdaptiveReprompt) ── */

export function PlanSelector({
  value,
  onChange,
  lane,
  onLaneChange,
}: {
  value: PlanId;
  onChange: (plan: PlanId) => void;
  lane: string;
  onLaneChange: (lane: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2.5">
      {PLANS.map((p, idx) => {
        const active = value === p.id;
        const isSingle = p.id === "single-lane";
        const { Icon: TierIcon, chip } = TIER_ICON[p.id];
        return (
          <motion.div
            key={p.id}
            role="button"
            tabIndex={0}
            onClick={() => onChange(p.id)}
            onKeyDown={(e) => e.key === "Enter" && onChange(p.id)}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 + idx * 0.06, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              "relative cursor-pointer rounded-[20px] border text-left transition-colors duration-300",
              active
                ? "border-[#C8FF4D]/60 bg-[#C8FF4D]/[0.05]"
                : "border-white/[0.06] bg-gradient-to-b from-white/[0.045] to-white/[0.012] hover:border-white/[0.12]",
            )}
            style={active ? { boxShadow: "0 0 34px rgba(200,255,77,0.15)" } : undefined}
          >
            {active && (
              <motion.span
                variants={railVariants}
                initial="hidden"
                animate="show"
                className="absolute left-0 top-4 bottom-4 w-[3px] origin-top rounded-full bg-[#C8FF4D]"
                style={{ boxShadow: "0 0 14px rgba(200,255,77,0.65)" }}
              />
            )}

            {p.highlight && (
              <motion.span
                initial={{ x: 10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.24 + idx * 0.07, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="absolute -top-2 right-4 flex items-center gap-1 rounded-full bg-[#C8FF4D] px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.14em] text-[#0A0C0A]"
                style={{ boxShadow: "0 0 18px rgba(200,255,77,0.45)" }}
              >
                <span className="size-1 rounded-full bg-[#0A0C0A]" />
                Recommended
              </motion.span>
            )}

            <motion.div
              variants={listVariants}
              initial="hidden"
              animate="show"
              className="px-4 pt-3.5 pb-4"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={active ? { scale: [1, 1.08, 1], rotate: [0, active && p.id === "dual-lane" ? 6 : -4, 0] } : { scale: 1, rotate: 0 }}
                    transition={{ duration: 0.4 }}
                    className={cn(
                      "grid size-9 shrink-0 place-items-center rounded-xl border transition-colors duration-300",
                      active
                        ? "border-[#C8FF4D]/40 bg-[#C8FF4D]/10"
                        : "border-white/[0.08] bg-white/[0.04]",
                    )}
                    style={active ? { boxShadow: "0 0 16px rgba(200,255,77,0.25)" } : undefined}
                  >
                    <TierIcon size={17} strokeWidth={2.2} className={cn(chip, active && "text-[#C8FF4D]")} />
                  </motion.div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className={cn("text-[13px] font-bold transition-colors duration-300", active ? "text-foreground" : "text-foreground/75")}>
                        {p.name}
                      </p>
                      {isSingle && (
                        <span className="rounded-full bg-[#C8FF4D]/15 px-2 py-0.5 text-[9px] font-bold text-[#C8FF4D]">
                          TARGET×3
                        </span>
                      )}
                    </div>
                    <p className="text-[12px] font-black text-foreground/90">
                      {p.price}
                      <span className="ml-1 text-[10px] font-medium text-muted-foreground/45">{p.cadence}</span>
                    </p>
                  </div>
                </div>
                <RadioDot active={active} />
              </div>

              {isSingle && (
                <div className="mb-2.5 mt-1">
                  <span className="rounded-full bg-[#C8FF4D]/15 px-2 py-0.5 text-[9px] font-bold text-[#C8FF4D]">
                    TARGET×3
                  </span>
                </div>
              )}

              <div className="mb-2.5 flex flex-wrap items-center gap-1.5">
                {p.id === "dual-lane" && (
                  <motion.span
                    variants={featureVariants}
                    className="rounded-full bg-[#C8FF4D]/10 px-2 py-0.5 text-[9px] font-bold text-[#C8FF4D]"
                  >
                    SAVE — BEST VALUE
                  </motion.span>
                )}
              </div>

              <ul className="flex flex-col gap-1.5">
                {p.features.map((f) => (
                  <motion.li
                    key={f}
                    variants={featureVariants}
                    className="flex items-center gap-2 text-[12px] font-medium text-muted-foreground/60"
                  >
                    <span className="grid size-4 shrink-0 place-items-center rounded-full bg-[#C8FF4D]/12 text-[#C8FF4D]">
                      <Check size={9} strokeWidth={3.5} />
                    </span>
                    {f}
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
}

function RadioDot({ active }: { active: boolean }) {
  return (
    <motion.div
      animate={{ scale: active ? [1, 1.18, 1] : 1 }}
      transition={{ duration: 0.35 }}
      className={cn(
        "size-5 shrink-0 rounded-full border-2 flex items-center justify-center transition-colors duration-300",
        active ? "border-[#C8FF4D] bg-[#C8FF4D]" : "border-white/20 bg-transparent",
      )}
      style={active ? { boxShadow: "0 0 12px rgba(200,255,77,0.5)" } : undefined}
    >
      {active && <Check size={12} className="text-[#0A0C0A]" strokeWidth={3.5} />}
    </motion.div>
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

export function PlanHook({ onClose }: { onClose: () => void }) {
  const store = useOnboardingStore();
  const overlayRef = useRef<HTMLDivElement>(null);

  const [selected, setSelected] = useState<PlanId>(store.planId ?? "initiate");
  const [lane, setLane] = useState<string>(store.planLane || store.targetExam || "cat");

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
    store.setPlanId(selected);
    store.setPlanLane(lane);
    const done = () => onCloseRef.current();
    const el = overlayRef.current;
    if (!el) return done();
    el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 180, easing: "ease-in", fill: "forwards" }).addEventListener("finish", done, { once: true });
  }, [store, selected, lane]);

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
      className="fixed inset-0 z-[70] overflow-hidden flex flex-col items-center px-6 py-10"
      style={{ background: "linear-gradient(180deg, rgba(10,12,10,0.98) 0%, rgba(14,17,13,0.98) 100%)" }}
      role="dialog"
      aria-modal="true"
    >
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[440px] h-[320px] rounded-full opacity-20" style={{ background: "radial-gradient(circle, #22D3EE3f, transparent 70%)" }} />
      <div className="pointer-events-none absolute bottom-[-140px] left-1/2 -translate-x-1/2 w-[360px] h-[280px] rounded-full opacity-[0.13]" style={{ background: `radial-gradient(circle, ${ACCENT}55, transparent 70%)` }} />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(200,255,77,0.35), transparent)" }} />

      <div className="relative w-full max-w-[340px] flex-1 flex flex-col min-h-0">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="flex flex-col flex-1 min-h-0"
        >
          {/* Dashboard-style pill badge */}
          <motion.div variants={itemVariants} className="flex justify-center mb-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.04] backdrop-blur-sm px-4 py-1.5">
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#C8FF4D] opacity-50" />
                <span className="relative inline-flex size-1.5 rounded-full bg-[#C8FF4D]" style={{ boxShadow: "0 0 8px rgba(200,255,77,0.8)" }} />
              </span>
              <span className="text-[11px] font-semibold tracking-[0.22em] text-[#C8FF4D]/85">
                SELECT YOUR PLAN
              </span>
            </div>
          </motion.div>

          <motion.p variants={itemVariants} className="mb-4 text-center text-[12px] font-medium text-muted-foreground/50">
            One lane or two — pick how you train.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="flex-1 min-h-0 overflow-y-auto pr-0.5 rounded-[20px]"
            style={{ scrollbarWidth: "none" }}
          >
            <PlanSelector
              value={selected}
              onChange={setSelected}
              lane={lane}
              onLaneChange={setLane}
            />
          </motion.div>
        </motion.div>
      </div>

      <button
        type="button"
        onClick={skip}
        className="absolute top-5 right-5 text-[12px] font-bold text-muted-foreground/40 transition-colors hover:text-foreground/70 active:scale-95"
      >
        Skip
      </button>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, type: "spring", stiffness: 280, damping: 28 }}
        className="relative w-full max-w-[340px] mt-6"
      >
        <button
          type="button"
          onClick={confirm}
          className="group relative flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 py-4 text-[12px] font-bold uppercase tracking-[0.16em] text-[#0A0C0A] transition-transform active:scale-[0.98]"
          style={{
            background: `linear-gradient(90deg, ${ACCENT}, #B9F45C)`,
            boxShadow: "0 10px 34px rgba(200,255,77,0.3), 0 1px 0 rgba(255,255,255,0.25) inset",
          }}
        >
          <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/55 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full" />
          <span className="relative flex items-center gap-2.5">
            <ShieldCheck size={15} strokeWidth={2.8} className="opacity-70" />
            Confirm Selection
          </span>
        </button>
        <p className="mt-2.5 text-center text-[10px] font-medium text-muted-foreground/35">
          You can change this anytime in Settings.
        </p>
      </motion.div>
    </div>,
    document.body,
  );
}