"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { DojoShell } from "@/components/dashboard/dojo-shell";

export function ProfileClient({ children }: { children: React.ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (rootRef.current) {
      gsap.fromTo(
        rootRef.current.children,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.08, ease: "power2.out" },
      );
    }
  }, []);

  return (
    <DojoShell>
      <div ref={rootRef}>{children}</div>
    </DojoShell>
  );
}
