"use client";

import { useState, useLayoutEffect, useEffect, useCallback, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { SplashScreen } from "@/components/shell/splash-screen";
import { useAuthStore } from "@/stores/auth-store";
import OnboardingPage from "@/app/onboarding/page";

export function AppEntry({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<"loading" | "native" | "web">("loading");
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const platformRef = useRef<"native" | "web">("web");

  useLayoutEffect(() => {
    document.documentElement.classList.remove("loading");

    if (isAuthenticated) {
      router.prefetch("/dashboard");
    }

    try {
      if ((window as any).Capacitor?.isNativePlatform?.()) {
        platformRef.current = "native";
        setState("native");
        return;
      }
    } catch {}

    let cancelled = false;
    import("@capacitor/core")
      .then(({ Capacitor }) => {
        if (cancelled) return;
        platformRef.current = Capacitor.isNativePlatform() ? "native" : "web";
        setState(Capacitor.isNativePlatform() ? "native" : "web");
      })
      .catch(() => {
        if (!cancelled) setState("web");
      });

    return () => { cancelled = true; };
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (state === "native" && isAuthenticated && pathname !== "/") {
      setState("web");
    }
  }, [state, isAuthenticated, pathname]);

  const handleSplashComplete = useCallback(() => {
    if (useAuthStore.getState().isAuthenticated && pathname === "/") {
      router.replace("/dashboard");
      return;
    }
    setState("web");
  }, [pathname, router]);

  if (state === "loading") return <div className="fixed inset-0 bg-background" />;
  if (state === "native") return <SplashScreen onComplete={handleSplashComplete} />;

  if (!isAuthenticated) {
    if (pathname === "/" && platformRef.current === "web") return <>{children}</>;
    return <OnboardingPage />;
  }

  return <>{children}</>;
}
