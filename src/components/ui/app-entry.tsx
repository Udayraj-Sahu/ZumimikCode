"use client";

import { useState, useLayoutEffect, useCallback, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { SplashScreen } from "@/components/ui/splash-screen";
import { useAuthStore } from "@/stores/auth-store";
import { useOnboardingStore } from "@/stores/onboarding-store";

export function AppEntry({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<"loading" | "native" | "web">("loading");
  const [pendingNav, setPendingNav] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useLayoutEffect(() => {
    try {
      if ((window as any).Capacitor?.isNativePlatform?.()) {
        setState("native");
        return;
      }
    } catch {}

    let cancelled = false;
    import("@capacitor/core")
      .then(({ Capacitor }) => {
        if (cancelled) return;
        setState(Capacitor.isNativePlatform() ? "native" : "web");
      })
      .catch(() => {
        if (!cancelled) setState("web");
      });

    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (pendingNav && (pathname.startsWith("/dashboard") || pathname.startsWith("/onboarding"))) {
      setPendingNav(false);
      setState("web");
    }
  }, [pendingNav, pathname]);

  useEffect(() => {
    if (!pendingNav) return;
    const timer = setTimeout(() => {
      setPendingNav(false);
      setState("web");
    }, 5000);
    return () => clearTimeout(timer);
  }, [pendingNav]);

  const handleComplete = useCallback(() => {
    const isAuth = useAuthStore.getState().isAuthenticated;
    const isOnboarded = useOnboardingStore.getState().isOnboarded;
    setPendingNav(true);
    router.replace(isAuth && isOnboarded ? "/dashboard" : "/onboarding");
  }, [router]);

  if (state === "loading" || pendingNav) return <div className="fixed inset-0 bg-background" />;
  if (state === "native") return <SplashScreen onComplete={handleComplete} />;
  return <>{children}</>;
}
