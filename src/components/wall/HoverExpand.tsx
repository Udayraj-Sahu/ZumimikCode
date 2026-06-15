"use client";

import { useState } from "react";

interface HoverExpandProps {
  label: string;
  chain: string[];
  tag?: string;
}

export function HoverExpand({ label, chain, tag }: HoverExpandProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} style={{ cursor: "default", display: "inline-block", transition: "all 0.3s ease" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        {tag && <span className="font-sans uppercase" style={{ fontSize: "10px", letterSpacing: "0.15em", color: "#C8FF5A", opacity: 0.7 }}>{tag}</span>}
        <span className="font-display" style={{ fontSize: "clamp(1.2rem, 3vw, 2rem)", fontWeight: 600, color: hovered ? "#C8FF5A" : "#ffffff", transition: "color 0.3s ease", letterSpacing: "-0.02em" }}>{label}</span>
      </div>
      <div style={{
        overflow: "hidden",
        maxHeight: hovered ? `${chain.length * 36}px` : "0px",
        opacity: hovered ? 1 : 0,
        transition: "max-height 0.4s ease, opacity 0.3s ease",
        marginTop: hovered ? "12px" : "0"
      }}>
        {chain.map((item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "6px 0" }}>
            <span style={{ color: "#C8FF5A", fontSize: "12px", opacity: 0.6 }}>↓</span>
            <span className="font-sans" style={{ fontSize: "13px", color: "#8B8B8B", letterSpacing: "0.01em" }}>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
