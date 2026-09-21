"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "motion/react";
import { ShieldCheck, X, Zap } from "lucide-react";
import { MockArenaSelector } from "@/components/pricing/mock-arena-selector";
import { useOnboardingStore } from "@/stores/onboarding-store";

const ACCENT = "#C8FF4D";

export function MockArenaHook({ onClose }: { onClose: () => void }) {
  const store = useOnboardingStore();
  const overlayRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"idle" | "success">("idle");

  useEffect(() => {
    document.body.style.overflow = "hidden";
    if (overlayRef.current) {
      overlayRef.current.animate([{ transform: "translateX(100%)" }, { transform: "translateX(0%)" }], {
        duration: 320,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
      });
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const closingRef = useRef(false);

  const exit = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    const el = overlayRef.current;
    const done = () => onCloseRef.current();
    if (!el) return done();
    el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 180, easing: "ease-in", fill: "forwards" }).addEventListener("finish", done, { once: true });
  }, []);

  const activate = useCallback(
    (optionId: string) => {
      store.setPlanId(optionId === "bundle" ? "dual-lane" : "single-lane");
      store.setPlanLane(store.targetExam || store.planLane || "cat");
      setState("success");
      setTimeout(exit, 450);
    },
    [store, exit],
  );

  return createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[220] overflow-y-auto"
      style={{ background: "linear-gradient(180deg, rgba(10,12,10,0.99) 0%, rgba(14,17,13,0.99) 100%)" }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="mock-arena-hook-title"
    >
      <div className="pointer-events-none absolute -top-16 right-0 h-56 w-56 rounded-full bg-[#C8FF4D]/[0.08] blur-[90px]" />
      <div className="pointer-events-none absolute left-0 top-[50%] h-64 w-64 rounded-full bg-fuchsia-600/[0.08] blur-[100px]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(200,255,77,0.35), transparent)" }} />

      <div className="relative mx-auto w-full max-w-[400px] min-h-full">
        {/* top bar */}
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#0a0a0d]/85 px-4 py-3 backdrop-blur">
          <div className="flex items-center gap-2.5">
            <span className="grid size-7 place-items-center rounded-lg border border-[#C8FF4D]/40 bg-[#C8FF4D]/10 text-[#C8FF4D]">
              <Zap size={14} />
            </span>
            <div>
              <div className="font-mono text-[11px] font-bold tracking-[0.25em] text-[#C8FF4D]">EXAM ARENA</div>
              <div className="text-[10px] font-medium tracking-wide text-muted-foreground/70">MOCK ARENA ELITE</div>
            </div>
          </div>
          <button aria-label="Close" onClick={exit} className="text-[#C8FF4D] transition-colors hover:text-[#D9FF85] active:scale-95">
            <X size={18} />
          </button>
        </header>

        <div className="relative px-4 pb-8 pt-5">
          {state === "success" ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center"
            >
              <div
                className="flex items-center gap-2 rounded-2xl border border-white/10 px-6 py-4 text-[12px] font-bold uppercase tracking-[0.16em] text-[#0A0C0A]"
                style={{
                  background: `linear-gradient(90deg, ${ACCENT}, #B9F45C)`,
                  boxShadow: "0 10px 34px rgba(200,255,77,0.3), 0 1px 0 rgba(255,255,255,0.25) inset",
                }}
              >
                <ShieldCheck size={15} strokeWidth={2.8} /> Unlimited mocks activated
              </div>
              <p className="font-mono text-[9px] font-bold tracking-wider text-[#C8FF4D]">
                Gates unlocked — unlimited mocks are live.
              </p>
            </motion.div>
          ) : (
            <MockArenaSelector onActivate={activate} />
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}