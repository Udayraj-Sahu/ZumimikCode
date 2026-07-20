"use client";

import { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import { Flame, Globe, Smartphone } from "lucide-react";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { useAuthStore } from "@/stores/auth-store";
import { useRouter } from "next/navigation";
import { StepWelcome } from "./step-welcome";
import { StepGoal } from "./step-goal";
import { StepLevel } from "./step-level";
import { StepDone } from "./step-done";
import { AuthPanel } from "@/components/onboarding/auth-panel";

export default function OnboardingPage() {
  const currentStep = useOnboardingStore((s) => s.currentStep);
  const nextStep = useOnboardingStore((s) => s.nextStep);
  const setAuthData = useOnboardingStore((s) => s.setAuthData);
  const authLogin = useAuthStore((s) => s.login);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isOnboarded = useOnboardingStore((s) => s.isOnboarded);
  const router = useRouter();
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAuthenticated && isOnboarded) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, isOnboarded, router]);

  const [currentPanel, setCurrentPanel] = useState(0);
  const [phoneMode, setPhoneMode] = useState(false);

  useEffect(() => {
    if (contentRef.current) {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.fromTo(contentRef.current, { opacity: 0, y: 30, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.25 })
        .fromTo(
          contentRef.current.querySelectorAll<HTMLElement>("[data-step-el]"),
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.2, stagger: 0.05 },
          "-=0.1",
        );
    }
  }, [currentStep]);

  const handleAuthSuccess = (data: { name?: string; phone?: string; authMethod: "google" | "phone" }) => {
    setAuthData(data);
    authLogin(data.phone ?? `${data.name}@google.com`, "mock-password");
    setPhoneMode(false);
    nextStep();
  };

  if (currentStep === 0 && phoneMode) {
    return (
      <main className="flex h-dvh flex-col bg-background overflow-hidden">
        <div className="flex flex-col items-center pt-3 px-5">
          <div className="flex items-center gap-2 mb-1">
            <span className="grid size-6 place-items-center rounded bg-primary text-primary-foreground">
              <Flame size={12} />
            </span>
            <span className="text-[10px] font-bold tracking-wider text-foreground">WELCOME TO EXAM ARENA</span>
          </div>
        </div>
        <div className="flex-1 flex flex-col gap-4 px-5 justify-center min-h-0">
          <button type="button" onClick={() => setPhoneMode(false)}
            className="self-start text-fluid-xs text-muted-foreground/50 underline underline-offset-2 outline-none hover:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring rounded px-1"
          >
            &larr; Back
          </button>
          <AuthPanel onAuthSuccess={handleAuthSuccess} />
        </div>
      </main>
    );
  }

  const stepContent = () => {
    switch (currentStep) {
      case 0: return <StepWelcome onPanelChange={setCurrentPanel} />;
      case 1: return <StepGoal onSelect={() => {}} />;
      case 2: return <StepLevel onSelect={() => {}} />;
      case 3: return <StepDone onSelect={() => {}} />;
      default: return <StepWelcome onPanelChange={setCurrentPanel} />;
    }
  };

  if (isAuthenticated && isOnboarded) return <div className="fixed inset-0 bg-background" />;

  return (
    <main className="flex h-dvh flex-col bg-background justify-between overflow-hidden">
      <div className="flex flex-col items-center pt-3 px-5 shrink-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="grid size-6 place-items-center rounded bg-primary text-primary-foreground">
            <Flame size={12} />
          </span>
          <span className="text-[10px] font-bold tracking-wider text-foreground">WELCOME TO EXAM ARENA</span>
        </div>

        {currentStep === 0 && (
          <div className="flex gap-1.5 w-full px-1 mt-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-1 flex-1 rounded-full bg-border overflow-hidden">
                <div
                  className={`h-full rounded-full bg-primary transition-all duration-200 ${
                    i <= currentPanel ? "" : "w-0"
                  }`}
                  style={{ width: i <= currentPanel ? "100%" : "0%" }}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <div ref={contentRef} className="flex-1 flex items-center justify-center px-5 overflow-hidden min-h-0">
        {stepContent()}
      </div>

      {currentStep === 0 && !phoneMode && (
        <div className="flex flex-col gap-1.5 px-5 pb-3 shrink-0">
          <button type="button" onClick={handleAuthSuccess.bind(null, { name: "Google User", authMethod: "google" })}
            className="group relative flex w-full items-center justify-center gap-2 rounded-xl border border-border/60 bg-card px-4 py-2.5 text-fluid-sm font-semibold text-foreground outline-none transition-all hover:border-primary/40 hover:bg-accent/40 active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-ring overflow-hidden"
            data-step-el
          >
            <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-primary/10 to-transparent" />
            <Globe size={15} className="text-muted-foreground" />
            Continue with Google
          </button>
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground/30 px-2">
            <span className="flex-1 h-px bg-border" />
            <span>— OR —</span>
            <span className="flex-1 h-px bg-border" />
          </div>
          <button type="button" onClick={() => setPhoneMode(true)}
            className="group relative flex w-full items-center justify-center gap-2 rounded-xl border border-border/60 bg-card px-4 py-2.5 text-fluid-sm font-semibold text-foreground outline-none transition-all hover:border-primary/40 hover:bg-accent/40 active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-ring overflow-hidden"
            data-step-el
          >
            <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-primary/10 to-transparent" />
            <Smartphone size={15} className="text-muted-foreground" />
            Continue with Phone Number
          </button>
          <button type="button" onClick={nextStep}
            className="w-full text-center text-[10px] text-muted-foreground/40 underline underline-offset-2 outline-none hover:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring rounded py-0.5 mt-0.5"
            data-step-el
          >
            Skip for now
          </button>
          <p className="text-center text-[9px] text-muted-foreground/25 leading-relaxed px-1">
            By continuing, you agree to our{" "}
            <button type="button" className="underline underline-offset-1 cursor-pointer hover:text-muted-foreground/50 outline-none focus-visible:ring-2 focus-visible:ring-ring rounded">Terms of Service</button>{" "}
            and{" "}
            <button type="button" className="underline underline-offset-1 cursor-pointer hover:text-muted-foreground/50 outline-none focus-visible:ring-2 focus-visible:ring-ring rounded">Privacy Policy</button>
          </p>
        </div>
      )}
    </main>
  );
}
