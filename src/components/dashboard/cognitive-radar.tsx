"use client";

import { memo, useMemo } from "react";
import { cn } from "@/lib/utils";

type Axis = { label: string; value: number };

interface CognitiveRadarProps {
  axes: Axis[];
  className?: string;
  size?: number;
}

export const CognitiveRadar = memo(function CognitiveRadar({
  axes,
  className,
  size = 280,
}: CognitiveRadarProps) {
  const center = useMemo(() => size / 2, [size]);
  const radius = useMemo(() => size / 2 - 36, [size]);
  const rings = [0.25, 0.5, 0.75, 1];

  const point = useMemo(
    () => (value: number, index: number) => {
      const angle = (Math.PI * 2 * index) / axes.length - Math.PI / 2;
      return {
        x: center + Math.cos(angle) * radius * value,
        y: center + Math.sin(angle) * radius * value,
      };
    },
    [center, radius, axes.length],
  );

  const polygon = useMemo(
    () => (factor: number) =>
      axes.map((_, i) => point(factor, i)).map((p) => `${p.x},${p.y}`).join(" "),
    [axes, point],
  );

  const dataPolygon = useMemo(
    () => axes.map((a, i) => point(a.value, i)).map((p) => `${p.x},${p.y}`).join(" "),
    [axes, point],
  );

  const viewBox = useMemo(() => `0 0 ${size} ${size}`, [size]);

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <svg
        viewBox={viewBox}
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
            stroke="rgb(rgb(rgb(var(--border))))"
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
              stroke="rgb(rgb(rgb(var(--border))))"
              strokeWidth={1}
            />
          );
        })}
        <polygon
          points={dataPolygon}
          fill="rgb(rgb(rgb(var(--primary))))"
          fillOpacity={0.22}
          stroke="rgb(rgb(rgb(var(--primary))))"
          strokeWidth={2}
          strokeLinejoin="round"
        />
        {axes.map((a, i) => {
          const p = point(a.value, i);
          return <circle key={i} cx={p.x} cy={p.y} r={3.5} fill="rgb(rgb(rgb(var(--primary))))" />;
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
              fill="rgb(rgb(rgb(var(--muted-foreground))))"
              className="text-fluid-xs font-semibold uppercase tracking-widest"
            >
              {a.label}
            </text>
          );
        })}
      </svg>
    </div>
  );
});
