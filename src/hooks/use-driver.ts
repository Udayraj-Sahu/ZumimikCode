"use client";

import { useCallback, useEffect, useRef } from "react";
import { driver, type Config, type DriveStep } from "driver.js";
import "driver.js/dist/driver.css";
import "@/styles/driver-override.css";

type StartOptions = {
  steps: DriveStep[];
  config?: Omit<Config, "steps">;
};

export function useDriver() {
  const driverRef = useRef<ReturnType<typeof driver> | null>(null);

  useEffect(() => {
    return () => {
      driverRef.current?.destroy();
      driverRef.current = null;
    };
  }, []);

  const stop = useCallback(() => {
    driverRef.current?.destroy();
    driverRef.current = null;
  }, []);

  const start = useCallback(({ steps, config }: StartOptions) => {
    if (driverRef.current?.isActive()) return;
    if (typeof document === "undefined" || !document.body) return;

    driverRef.current?.destroy();
    driverRef.current = driver(config ?? {});
    driverRef.current.setSteps(steps);
    driverRef.current.drive();
  }, []);

  const refresh = useCallback(() => {
    driverRef.current?.refresh();
  }, []);

  return { start, stop, refresh };
}
