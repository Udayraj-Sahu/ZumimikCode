"use client";

import { DojoShell } from "@/components/dashboard/dojo-shell";
import { SplashScreen } from "@/components/ui/splash-screen";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SplashScreen />
      <DojoShell>{children}</DojoShell>
    </>
  );
}
