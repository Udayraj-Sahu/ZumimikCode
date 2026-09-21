"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "motion/react";
import { X, ShieldCheck } from "lucide-react";
import { usePlanStore } from "@/stores/plan-store";
import { usePaywallStore } from "@/stores/paywall-store";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { PlanSelector } from "@/components/onboarding/plan-hook";
import type { PlanId } from "@/lib/types/onboarding";

const ACCENT = "#C8FF4D";

const COPY = {
  prep: {
    desc: "Free users get one extra prep. Pick a plan to unlock every exam track.",
    success: "Gates unlocked — every exam is now open.",
  },
} as const;

export function PaywallModal() {
  const open = usePaywallStore((s) => s.open);
  const action = usePaywallStore((s) => s.action);
  const closePaywall = usePaywallStore((s) => s.closePaywall);
  const setPro = usePlanStore((s) => s.setPro);
  const planId = useOnboardingStore((s) => s.planId);
  const planLane = useOnboardingStore((s) => s.planLane);
  const targetExam = useOnboardingStore((s) => s.targetExam);
  const setPlanId = useOnboardingStore((s) => s.setPlanId);
  const setPlanLane = useOnboardingStore((s) => s.setPlanLane);

  const [selected, setSelected] = useState<PlanId>(planId ?? "dual-lane");
  const [lane, setLane] = useState<string>(planLane || targetExam || "cat");
  const [state, setState] = useState<"idle" | "success">("idle");
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setSelected(planId ?? "dual-lane");
      setLane(planLane || targetExam || "cat");
      setState("idle");
      if (overlayRef.current) {
        overlayRef.current.animate([{ opacity: 0 }, { opacity: 1 }], {
          duration: 300,
          easing: "cubic-bezier(0.22, 1, 0.36, 1)",
          fill: "forwards",
        });
      }
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open, planId, planLane, targetExam]);

  const confirm = () => {
    setPlanId(selected);
    setPlanLane(lane);
    if (selected !== "initiate") {
      setPro();
      setState("success");
      setTimeout(closePaywall, 450);
    } else {
      closePaywall();
    }
  };

  if (!open || !action) return null;
  const copy = action === "mock" ? COPY.prep : COPY[action];

  return createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[70] overflow-hidden flex flex-col items-center px-6 py-10"
      style={{ background: "linear-gradient(180deg, rgba(10,12,10,0.98) 0%, rgba(14,17,13,0.98) 100%)" }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="paywall-title"
    >
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[440px] h-[320px] rounded-full opacity-20" style={{ background: "radial-gradient(circle, #22D3EE3f, transparent 70%)" }} />
      <div className="pointer-events-none absolute bottom-[-140px] left-1/2 -translate-x-1/2 w-[360px] h-[280px] rounded-full opacity-[0.13]" style={{ background: `radial-gradient(circle, ${ACCENT}55, transparent 70%)` }} />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(200,255,77,0.35), transparent)" }} />

      <div className="relative w-full max-w-[340px] flex-1 flex flex-col min-h-0">
        {/* Dashboard-style pill badge — matches Select Your Plan */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 280, damping: 30 }}
          className="flex justify-center mb-3"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.04] backdrop-blur-sm px-4 py-1.5">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#C8FF4D] opacity-50" />
              <span className="relative inline-flex size-1.5 rounded-full bg-[#C8FF4D]" style={{ boxShadow: "0 0 8px rgba(200,255,77,0.8)" }} />
            </span>
            <span id="paywall-title" className="text-[11px] font-semibold tracking-[0.22em] text-[#C8FF4D]/85">
              SELECT YOUR PLAN
            </span>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, type: "spring", stiffness: 280, damping: 30 }}
          className="mb-4 text-center text-[12px] font-medium text-muted-foreground/55"
        >
          {state === "success" ? copy.success : copy.desc}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16, type: "spring", stiffness: 280, damping: 28 }}
          className="flex-1 min-h-0 overflow-y-auto pr-0.5 rounded-[20px]"
          style={{ scrollbarWidth: "none" }}
        >
          <PlanSelector value={selected} onChange={setSelected} lane={lane} onLaneChange={setLane} />
        </motion.div>
      </div>

      <button
        type="button"
        onClick={closePaywall}
        aria-label="Close"
        className="absolute top-5 right-5 grid size-9 place-items-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-muted-foreground/50 transition-colors hover:text-foreground active:scale-95"
      >
        <X size={15} />
      </button>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.24, type: "spring", stiffness: 280, damping: 28 }}
        className="relative w-full max-w-[340px] mt-6"
      >
          {state === "success" ? (
            <div
              className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 py-4 text-[12px] font-bold uppercase tracking-[0.16em] text-[#0A0C0A]"
              style={{
                background: `linear-gradient(90deg, ${ACCENT}, #B9F45C)`,
                boxShadow: "0 10px 34px rgba(200,255,77,0.3), 0 1px 0 rgba(255,255,255,0.25) inset",
              }}
            >
              <ShieldCheck size={15} strokeWidth={2.8} /> Pro activated
            </div>
          ) : (
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
          )}
<p className="mt-2.5 text-center text-[10px] font-medium text-muted-foreground/35">
          You can change this anytime in Settings.
        </p>
      </motion.div>
    </div>,
    document.body,
  );
}