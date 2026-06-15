"use client";

import { useRef, useState, useEffect } from "react";

interface RankMarkerProps {
  rank: string;
  isYouHere?: boolean;
  offset?: number;
}

export function RankMarker({ rank, isYouHere = false, offset = 0 }: RankMarkerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} style={{
      display: "flex", alignItems: "center", gap: "16px",
      opacity: visible ? 1 : 0,
      transform: visible ? "translateX(0)" : `translateX(${offset < 0 ? "-" : ""}40px)`,
      transition: `opacity 0.6s ease ${Math.abs(offset) * 0.05}s, transform 0.6s ease ${Math.abs(offset) * 0.05}s`
    }}>
      <div style={{
        width: isYouHere ? "8px" : "4px", height: isYouHere ? "8px" : "4px", borderRadius: "50%",
        background: isYouHere ? "#C8FF5A" : "rgba(255,255,255,0.2)",
        boxShadow: isYouHere ? "0 0 12px #C8FF5A, 0 0 24px rgba(200,255,90,0.4)" : "none",
        flexShrink: 0
      }} />
      <span className="font-mono uppercase" style={{ fontSize: isYouHere ? "15px" : "12px", color: isYouHere ? "#C8FF5A" : "rgba(255,255,255,0.25)", letterSpacing: "0.12em" }}>{rank}</span>
      {isYouHere && (
        <span className="font-sans uppercase" style={{ fontSize: "10px", color: "#C8FF5A", letterSpacing: "0.2em", opacity: 0.8, border: "1px solid rgba(200,255,90,0.3)", padding: "2px 8px" }}>YOU ARE HERE</span>
      )}
    </div>
  );
}
