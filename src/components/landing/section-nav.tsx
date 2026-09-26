"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";

const NODES = [
  { id: "arena", label: "Arena", icon: "◈" },
  { id: "battles", label: "Battles", icon: "⚔" },
  { id: "champions", label: "Champions", icon: "◉" },
  { id: "ai-coach", label: "AI Coach", icon: "✦" },
  { id: "rankings", label: "Rankings", icon: "▲" },
  { id: "horizon", label: "Horizon", icon: "∞" },
];

export function SectionNav() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const sections = NODES.map((n) => document.getElementById(n.id));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = NODES.findIndex((n) => n.id === entry.target.id);
            if (idx !== -1) setActive(idx);
          }
        });
      },
      { rootMargin: "-40% 0px -40% 0px", threshold: 0 },
    );
    sections.forEach((s) => s && observer.observe(s));
    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav
      aria-label="Section navigation"
      className="fixed left-6 top-1/2 -translate-y-1/2 z-50 hidden lg:flex flex-col items-center gap-0"
      style={{ pointerEvents: "auto" }}
    >
      {NODES.map((node, i) => (
        <div key={node.id} className="flex flex-col items-center">
          {i > 0 && (
            <motion.div
              className="w-px"
              style={{
                height: 32,
                background:
                  i <= active
                    ? "linear-gradient(to bottom, #C8FF5A, var(--lime-bright-30))"
                    : "rgba(255,255,255,0.08)",
              }}
              animate={{ opacity: 1 }}
            />
          )}
          <motion.button
            onClick={() => scrollTo(node.id)}
            type="button"
            aria-current={i === active ? "true" : undefined}
            aria-label={`Scroll to ${node.label}`}
            className="relative flex items-center gap-3 group outline-none focus-visible:ring-2 focus-visible:ring-ring rounded min-h-[44px]"
            style={{ background: "none", border: "none", cursor: "pointer", padding: "4px 0" }}
            whileHover={{ x: 4 }}
          >
            <div className="relative flex items-center justify-center size-[44px]">
              {i <= active && (
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: "rgba(200,255,90,0.15)",
                    border: "1px solid rgba(200,255,90,0.5)",
                  }}
                  layoutId="activeNode"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <span
                className="font-mono text-xs"
                style={{
                  color: i <= active ? "#C8FF5A" : "#8B8B8B",
                  transition: "color 0.3s",
                }}
              >
                {node.icon}
              </span>
            </div>
            <span
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-xs tracking-wider whitespace-nowrap font-display"
              style={{
                fontWeight: 500,
                color: i === active ? "#C8FF5A" : "#ffffff",
              }}
            >
              {node.label}
            </span>
          </motion.button>
        </div>
      ))}
    </nav>
  );
}
