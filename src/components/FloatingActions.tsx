"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";

export function FloatingActions() {
  const [visible, setVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = document.getElementById("hero-buttons-sentinel");
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible || !containerRef.current) return;
    const btns = containerRef.current.children;
    gsap.fromTo(
      containerRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.2 }
    );
    gsap.fromTo(
      btns,
      { opacity: 0, y: -50 },
      {
        opacity: 1,
        y: 0,
        duration: 0.5,
        stagger: 0.15,
        ease: "back.out(1.7)",
      }
    );
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      ref={containerRef}
      className="fixed right-4 sm:right-8 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3"
    >
      <Link
        href="/dashboard"
        className="px-4 sm:px-5 py-2 sm:py-2.5 text-[clamp(10px,1.5vw,12px)] tracking-wide rounded bg-primary text-primary-foreground border-none cursor-pointer font-display font-semibold hover:brightness-110 hover:scale-[1.03] active:scale-[0.97] transition-all duration-200 whitespace-nowrap inline-block text-center"
      >
        Enter the Arena
      </Link>
      <button
        className="px-4 sm:px-5 py-2 sm:py-2.5 text-[clamp(10px,1.5vw,12px)] tracking-wide rounded bg-transparent text-secondary-foreground border border-border cursor-pointer font-display font-medium hover:border-primary/40 hover:text-foreground transition-all duration-200 whitespace-nowrap"
      >
        Build the Muscle
      </button>
    </div>
  );
}
