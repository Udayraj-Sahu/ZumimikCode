"use client";

import { useMemo } from "react";
import type { RendererProps } from "@/lib/types/template";
import { resolveRenderer } from "@/lib/utils/renderer-registry";
import TextScaffold from "./TextScaffold";

export default function RendererRouter({
  template,
  visibleSteps,
  mode,
  onStepReveal,
}: RendererProps) {
  const scaffoldType = useMemo(
    () => template.visual_scaffold?.type?.toLowerCase() ?? "",
    [template.visual_scaffold?.type],
  );

  const Renderer = useMemo(
    () => resolveRenderer(scaffoldType),
    [scaffoldType],
  );

  return (
    <Renderer template={template} visibleSteps={visibleSteps} mode={mode} onStepReveal={onStepReveal} />
  );
}
