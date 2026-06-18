"use client";

import { useEffect } from "react";
import { setPlatform } from "@/services/device";

export function CapacitorInit() {
  useEffect(() => {
    (async () => {
      try {
        const { Capacitor } = await import("@capacitor/core");
        if (Capacitor.isNativePlatform()) {
          setPlatform(Capacitor.getPlatform() as "android" | "ios");
        }
      } catch {
        // Not running in Capacitor
      }
    })();
  }, []);

  return null;
}
