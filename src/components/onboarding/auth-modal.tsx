"use client";

import { useEffect, useRef, useCallback } from "react";
import gsap from "gsap";
import { X, Flame } from "lucide-react";
import { AuthPanel } from "./auth-panel";
import { useAuthStore } from "@/stores/auth-store";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { useRouter } from "next/navigation";

type AuthModalProps = {
  onClose: () => void;
};

export function AuthModal({ onClose }: AuthModalProps) {
  const router = useRouter();
  const overlayRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const completeOnboarding = useOnboardingStore((s) => s.completeOnboarding);
  const setAuthData = useOnboardingStore((s) => s.setAuthData);
  const authLogin = useAuthStore((s) => s.login);

  useEffect(() => {
    if (overlayRef.current && dialogRef.current) {
      gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.2, ease: "power2.out" });
      gsap.fromTo(dialogRef.current, { opacity: 0, scale: 0.95, y: 8 }, { opacity: 1, scale: 1, y: 0, duration: 0.25, ease: "power2.out" });
    }
    closeBtnRef.current?.focus();
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    }
  }, [onClose]);

  const handleAuthSuccess = (data: { name?: string; phone?: string; authMethod: "google" | "phone" }) => {
    setAuthData(data);
    completeOnboarding();
    authLogin(data.phone ?? `${data.name}@google.com`, "mock-password");
    router.push("/dashboard");
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div
        ref={dialogRef}
        className="mx-4 w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <span className="grid size-7 place-items-center rounded bg-primary text-primary-foreground">
              <Flame size={14} />
            </span>
            <span id="auth-modal-title" className="text-fluid-sm font-bold tracking-wider text-foreground">EXAM ARENA</span>
          </div>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            className="grid size-8 place-items-center rounded-lg outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Close"
          >
            <X size={18} className="text-muted-foreground" />
          </button>
        </div>
        <AuthPanel onAuthSuccess={handleAuthSuccess} />
      </div>
    </div>
  );
}
