"use client";

import { cn } from "@/lib/utils";

type Axis = { label: string; value: number };

interface CognitiveRadarProps {
  axes: Axis[];
  className?: string;
  size?: number;
}

export function CognitiveRadar({ axes, className, size = 260 }: CognitiveRadarProps) {
  const center = size / 2;
  const radius = size / 2 - 36;
  const rings = [0.25, 0.5, 0.75, 1];

  const point = (value: number, index: number) => {
    const angle = (Math.PI * 2 * index) / axes.length - Math.PI / 2;
    return {
      x: center + Math.cos(angle) * radius * value,
      y: center + Math.sin(angle) * radius * value,
    };
  };

  const polygon = (factor: number) =>
    axes.map((_, i) => point(factor, i)).map((p) => `${p.x},${p.y}`).join(" ");

  const dataPolygon = axes.map((a, i) => point(a.value, i)).map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <svg
        viewBox={`0 0 ${size} ${size}`}
        width="100%"
        height="100%"
        role="img"
        aria-label="Cognitive performance radar chart"
        className="max-w-full"
      >
        {rings.map((r) => (
          <polygon
            key={r}
            points={polygon(r)}
            fill="none"
            stroke="var(--border)"
            strokeWidth={1}
          />
        ))}
        {axes.map((_, i) => {
          const p = point(1, i);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={p.x}
              y2={p.y}
              stroke="var(--border)"
              strokeWidth={1}
            />
          );
        })}
        <polygon
          points={dataPolygon}
          fill="var(--primary)"
          fillOpacity={0.22}
          stroke="var(--primary)"
          strokeWidth={2}
          strokeLinejoin="round"
        />
        {axes.map((a, i) => {
          const p = point(a.value, i);
          return <circle key={i} cx={p.x} cy={p.y} r={3.5} fill="var(--primary)" />;
        })}
        {axes.map((a, i) => {
          const p = point(1.18, i);
          return (
            <text
              key={a.label}
              x={p.x}
              y={p.y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-muted-foreground text-[9px] font-semibold uppercase tracking-widest"
            >
              {a.label}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
