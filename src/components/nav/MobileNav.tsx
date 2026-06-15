"use client";

import { useEffect, useState } from "react";

const NODES = [
  { id: "arena", label: "Arena", icon: "◈" },
  { id: "battles", label: "Battles", icon: "⚔" },
  { id: "champions", label: "Champions", icon: "◉" },
  { id: "ai-coach", label: "AI Coach", icon: "✦" },
  { id: "rankings", label: "Rankings", icon: "▲" },
  { id: "horizon", label: "Horizon", icon: "∞" },
];

export function MobileNav() {
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
      aria-label="Mobile navigation"
      className="fixed bottom-0 left-0 right-0 z-50 flex lg:hidden items-center justify-around px-2 py-2"
      style={{
        background: "rgba(5, 5, 5, 0.92)",
        borderTop: "1px solid rgba(200, 255, 90, 0.15)",
        backdropFilter: "blur(12px)",
      }}
    >
      {NODES.map((node, i) => (
        <button
          key={node.id}
          onClick={() => scrollTo(node.id)}
          aria-current={i === active ? "true" : undefined}
          className="flex flex-col items-center gap-0.5 px-1 py-1 rounded-lg transition-colors min-w-0"
          style={{
            background: i === active ? "rgba(200,255,90,0.08)" : "transparent",
            border: "none",
            cursor: "pointer",
          }}
        >
          <span
            className="font-mono"
            style={{
              fontSize: 14,
              color: i <= active ? "#C8FF5A" : "#8B8B8B",
              transition: "color 0.3s",
            }}
          >
            {node.icon}
          </span>
          <span
            className="font-display"
            style={{
              fontSize: 9,
              fontWeight: 500,
              color: i <= active ? "#C8FF5A" : "#8B8B8B",
              lineHeight: 1,
            }}
          >
            {node.label}
          </span>
        </button>
      ))}
    </nav>
  );
}
