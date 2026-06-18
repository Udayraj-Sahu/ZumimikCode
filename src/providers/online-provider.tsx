"use client";

import { useEffect, useRef } from "react";
import { useNetworkStore } from "@/stores/network-store";
import { syncAll } from "@/services/offline/sync";

export function OnlineProvider({ children }: { children: React.ReactNode }) {
  const setOnline = useNetworkStore((s) => s.setOnline);
  const mounted = useRef(false);

  useEffect(() => {
    if (mounted.current) return;
    mounted.current = true;

    setOnline(navigator.onLine);

    const goOnline = () => {
      setOnline(true);
      syncAll();
    };
    const goOffline = () => setOnline(false);

    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);

    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, [setOnline]);

  return <>{children}</>;
}
