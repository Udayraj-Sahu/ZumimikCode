"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { DojoShell } from "@/components/dashboard/dojo-shell";
import { SplashScreen } from "@/components/ui/splash-screen";
import { useOnboardingStore } from "@/stores/onboarding-store";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const isOnboarded = useOnboardingStore((s) => s.isOnboarded);

  useEffect(() => {
    if (!isOnboarded) {
      router.replace("/onboarding");
    }
  }, [isOnboarded, router]);

  if (!isOnboarded) return null;

  return (
    <>
      <SplashScreen />
      <DojoShell>{children}</DojoShell>
    </>
  );
}
