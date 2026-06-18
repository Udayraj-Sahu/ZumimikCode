"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useUiStore } from "@/stores/ui-store";

export function AlertModal() {
  const { modal, closeModal } = useUiStore();
  const overlayRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (modal.type !== "none" && overlayRef.current && dialogRef.current) {
      gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.2, ease: "power2.out" });
      gsap.fromTo(dialogRef.current, { opacity: 0, scale: 0.95, y: 8 }, { opacity: 1, scale: 1, y: 0, duration: 0.25, ease: "power2.out" });
    }
  }, [modal.type]);

  if (modal.type === "none") return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={closeModal}
      role="dialog"
      aria-modal="true"
      aria-labelledby="alert-title"
    >
      <div
        ref={dialogRef}
        className="mx-4 w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {modal.title && (
          <h3 id="alert-title" className="text-fluid-lg font-bold text-foreground">{modal.title}</h3>
        )}
        {modal.message && (
          <p className="mt-2 text-fluid-sm text-muted-foreground">{modal.message}</p>
        )}
        <div className="mt-6 flex justify-end gap-3">
          {modal.type === "confirm" && (
            <button
              type="button"
              onClick={() => { closeModal(); modal.onConfirm?.(); }}
              className="rounded-lg bg-destructive px-4 py-2 text-fluid-sm font-bold uppercase tracking-widest text-destructive-foreground outline-none transition-colors hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring"
            >
              Confirm
            </button>
          )}
          <button
            type="button"
            onClick={closeModal}
            className="rounded-lg bg-muted px-4 py-2 text-fluid-sm font-bold uppercase tracking-widest text-foreground outline-none transition-colors hover:bg-muted/70 focus-visible:ring-2 focus-visible:ring-ring"
          >
            {modal.type === "alert" ? "OK" : "Cancel"}
          </button>
        </div>
      </div>
    </div>
  );
}
