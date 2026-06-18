"use client";

import { AuthPanel } from "@/components/onboarding/auth-panel";
import { useOnboardingStore } from "@/stores/onboarding-store";

export function StepAuth() {
  const nextStep = useOnboardingStore((s) => s.nextStep);
  const setAuthData = useOnboardingStore((s) => s.setAuthData);

  const handleAuthSuccess = (data: { name?: string; phone?: string; authMethod: "google" | "phone" }) => {
    setAuthData(data);
    nextStep();
  };

  return <AuthPanel onAuthSuccess={handleAuthSuccess} />;
}
