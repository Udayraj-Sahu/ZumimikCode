"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { DojoShell } from "@/components/dashboard/dojo-shell";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { useAuthStore } from "@/stores/auth-store";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const isOnboarded = useOnboardingStore((s) => s.isOnboarded);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/onboarding");
    } else if (!isOnboarded) {
      router.replace("/onboarding");
    }
  }, [isAuthenticated, isOnboarded, router]);

  if (!isAuthenticated || !isOnboarded) return null;

  return (
    <DojoShell>{children}</DojoShell>
  );
}
