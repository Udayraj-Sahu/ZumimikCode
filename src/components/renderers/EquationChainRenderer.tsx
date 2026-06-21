"use client";

import { useMemo } from "react";
import type { RendererProps } from "@/lib/types/template";
import TextScaffold from "./TextScaffold";

export default function EquationChainRenderer({
  template,
  visibleSteps,
  mode,
  onStepReveal,
}: RendererProps) {
  const steps = template.examples?.[0]?.solution ?? [];

  const svgWidth = useMemo(() => Math.max(400, 60 + steps.length * 120 + 60), [steps.length]);

  return (
    <TextScaffold
      template={template}
      visibleSteps={visibleSteps}
      mode={mode}
      onStepReveal={onStepReveal}
    >
      <svg
        viewBox={`0 0 ${svgWidth} 200`}
        className="w-full h-auto max-w-[450px]"
        role="img"
        aria-label="Equation chain"
      >
        {steps.map((step, i) => {
          const x = 60 + i * 120;
          const y = 80;
          const visible = visibleSteps > i;
          return (
            <g
              key={step.step_num}
              opacity={visible ? 1 : 0.2}
              className="transition-opacity duration-300"
            >
              <rect
                x={x - 45}
                y={y - 18}
                width={90}
                height={36}
                rx={8}
                fill="var(--card)"
                stroke={visible ? "var(--primary)" : "var(--border)"}
                strokeWidth={1.5}
              />
              <text
                x={x}
                y={y + 5}
                textAnchor="middle"
                fill="var(--foreground)"
                fontSize="13"
                fontWeight="600"
              >
                {step.operation}
              </text>
              {/* ARROW */}
              {i < steps.length - 1 && (
                <line
                  x1={x + 45}
                  y1={y}
                  x2={x + 75}
                  y2={y}
                  stroke="var(--primary)"
                  strokeWidth={2}
                  markerEnd="url(#eq-arrow)"
                  opacity={visibleSteps > i + 1 ? 1 : 0}
                  className="transition-opacity duration-300"
                />
              )}
            </g>
          );
        })}

        {/* STEP NUMBERS */}
        {steps.map((step, i) => (
          <text
            key={`label-${step.step_num}`}
            x={60 + i * 120}
            y={60}
            textAnchor="middle"
            fill="var(--muted-foreground)"
            fontSize="10"
            opacity={visibleSteps > i ? 1 : 0.2}
            className="transition-opacity duration-300"
          >
            Step {step.step_num}
          </text>
        ))}

        <defs>
          <marker
            id="eq-arrow"
            markerWidth="8"
            markerHeight="6"
            refX="8"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 8 3, 0 6" fill="var(--primary)" />
          </marker>
        </defs>
      </svg>
    </TextScaffold>
  );
}
