"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import { X, Check, Crown, Sparkles, ShieldCheck, Infinity as InfinityIcon } from "lucide-react";
import { usePlanStore } from "@/stores/plan-store";
import { usePaywallStore } from "@/stores/paywall-store";
import { cn } from "@/lib/utils";

const COPY = {
  prep: {
    eyebrow: "Extra Prep",
    title: "Add another exam prep",
    desc: "Free users can track one extra prep alongside your primary exam.",
  },
  mock: {
    eyebrow: "Mock Limit",
    title: "Take more mock tests",
    desc: "Free users get one mock test per window. Upgrade for unlimited mocks.",
  },
} as const;

function usePaywallModal() {
  const open = usePaywallStore((s) => s.open);
  const action = usePaywallStore((s) => s.action);
  const closePaywall = usePaywallStore((s) => s.closePaywall);
  const setPro = usePlanStore((s) => s.setPro);
  const [state, setState] = useState<"idle" | "success">("idle");
  const overlayRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && overlayRef.current && dialogRef.current) {
      setState("idle");
      gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.2 });
      gsap.fromTo(dialogRef.current, { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 0.28, ease: "power2.out" });
    }
  }, [open]);

  const handleClose = () => {
    if (overlayRef.current && dialogRef.current) {
      gsap.to(dialogRef.current, { opacity: 0, y: 16, duration: 0.15 });
      gsap.to(overlayRef.current, { opacity: 0, duration: 0.15, onComplete: closePaywall });
    } else {
      closePaywall();
    }
  };

  const goPro = () => {
    setPro();
    if (dialogRef.current) {
      gsap.to(dialogRef.current, { opacity: 0, y: 16, scale: 0.96, duration: 0.15 });
    }
    setState("success");
    setTimeout(handleClose, 350);
  };

  return { open, action, state, overlayRef, dialogRef, handleClose, goPro };
}

export function PaywallModal() {
  const { open, action, state, overlayRef, dialogRef, handleClose, goPro } = usePaywallModal();

  if (!open || !action) return null;
  const copy = COPY[action];

  return createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="paywall-title"
      onClick={handleClose}
    >
      <div
        ref={dialogRef}
        className="relative w-full max-w-sm overflow-hidden rounded-t-3xl sm:rounded-3xl border border-white/[0.08] bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative px-5 pt-6 pb-5 text-center overflow-hidden" style={{ background: "radial-gradient(circle at 50% 0%, rgba(167,139,250,0.16), transparent 70%)" }}>
          <button
            type="button"
            onClick={handleClose}
            className="absolute right-3.5 top-3.5 grid size-8 place-items-center rounded-lg text-muted-foreground/50 hover:text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Close"
          >
            <X size={16} />
          </button>
          <div className="mx-auto grid size-12 place-items-center rounded-2xl" style={{ background: "rgba(167,139,250,0.14)" }}>
            <Crown size={20} className="text-[#A78BFA]" />
          </div>
          <p className="mt-3 text-[9px] font-bold uppercase tracking-[0.2em] text-[#A78BFA]/80">{copy.eyebrow}</p>
          <h2 id="paywall-title" className="mt-1 text-[20px] font-bold tracking-[-0.02em] text-foreground">{state === "success" ? "Welcome to Pro!" : copy.title}</h2>
          <p className="mt-1 text-[11px] text-muted-foreground/55 px-2">{state === "success" ? "Your gates are unlocked. Enjoy the full Exam Arena." : copy.desc}</p>
        </div>

        {/* Plans */}
        <div className="px-5 flex flex-col gap-2.5">
          <div className="flex items-center justify-between rounded-2xl border border-white/[0.07] px-4 py-3.5">
            <div className="flex items-center gap-2.5">
              <Sparkles size={14} className="text-muted-foreground/50" />
              <div>
                <p className="text-[13px] font-bold text-foreground">Free</p>
                <p className="text-[10px] text-muted-foreground/50">1 extra prep · 1 mock</p>
              </div>
            </div>
            <span className="text-[13px] font-bold text-foreground/70">₹0</span>
          </div>

          <div className="relative rounded-2xl border px-4 py-3.5" style={{ borderColor: "rgba(167,139,250,0.4)", background: "rgba(167,139,250,0.07)" }}>
            <span className="absolute -top-2 left-4 rounded-full px-2.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-[#0A0C0A]" style={{ background: "#A78BFA" }}>
              Recommended
            </span>
            {[
              "Unlimited mock tests",
              "Unlimited extra preps",
              "All adaptive features",
              "Priority updates",
            ].map((b) => (
              <div key={b} className="flex items-center gap-2 py-1.5">
                <Check size={12} className="shrink-0 text-[#A78BFA]" strokeWidth={3} />
                <span className="text-[12px] font-semibold text-foreground/80">{b}</span>
              </div>
            ))}
            <div className="flex items-baseline gap-1.5 mt-2">
              <span className="text-[24px] font-black tracking-tight text-[#A78BFA]">₹99</span>
              <span className="text-[11px] text-muted-foreground/50 font-medium">/ month</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 pb-5 pt-4 flex flex-col gap-2.5">
          {state === "success" ? (
            <div className="flex items-center justify-center gap-2 rounded-2xl py-3.5 text-[12px] font-bold tracking-widest text-[#0A0C0A]" style={{ background: "#C8FF4D" }}>
              <ShieldCheck size={14} /> Pro activated
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={goPro}
                className="w-full flex items-center justify-center gap-2 rounded-2xl py-3.5 text-[12px] font-bold uppercase tracking-widest text-[#0A0C0A] transition-all hover:opacity-90 active:scale-[0.98]"
                style={{ background: "#C8FF4D", boxShadow: "0 0 20px rgba(200,255,77,0.25)" }}
              >
                <Crown size={13} /> Go Pro · ₹99/mo
              </button>
              <button
                type="button"
                onClick={handleClose}
                className={cn("w-full rounded-2xl border border-white/[0.08] py-3 text-[11px] font-bold text-muted-foreground/60 transition-all hover:text-foreground hover:bg-white/[0.05] active:scale-[0.98]")}
              >
                Continue Free
              </button>
              <p className="text-center text-[8px] text-muted-foreground/35 font-medium flex items-center justify-center gap-1">
                <InfinityIcon size={10} /> One tap upgrade · Cancel anytime
              </p>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}