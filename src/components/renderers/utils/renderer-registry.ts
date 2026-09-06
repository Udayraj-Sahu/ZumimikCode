import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import type { RendererProps } from "@/lib/types/template";

const ArrowMatrixRenderer = dynamic(
  () => import("@/components/renderers/ArrowMatrixRenderer"),
  { ssr: false },
);
const StrikePadRenderer = dynamic(
  () => import("@/components/renderers/StrikePadRenderer"),
  { ssr: false },
);
const NumberLineRenderer = dynamic(
  () => import("@/components/renderers/NumberLineRenderer"),
  { ssr: false },
);
const GridDerivationRenderer = dynamic(
  () => import("@/components/renderers/GridDerivationRenderer"),
  { ssr: false },
);
const EquationChainRenderer = dynamic(
  () => import("@/components/renderers/EquationChainRenderer"),
  { ssr: false },
);
const ShapeCanvasRenderer = dynamic(
  () => import("@/components/renderers/ShapeCanvasRenderer"),
  { ssr: false },
);
const TextScaffold = dynamic(
  () => import("@/components/renderers/TextScaffold"),
  { ssr: false },
);

export const SCAFFOLD_TO_RENDERER: Record<
  string,
  ComponentType<RendererProps>
> = {
  arrow_matrix: ArrowMatrixRenderer,
  place_value_chart: StrikePadRenderer,
  number_line: NumberLineRenderer,
  grid_construction: GridDerivationRenderer,
  equation_chain: EquationChainRenderer,
  shape_canvas: ShapeCanvasRenderer,
};

export function resolveRenderer(
  scaffoldType: string,
): ComponentType<RendererProps> {
  const key = scaffoldType?.toLowerCase() ?? "";
  return SCAFFOLD_TO_RENDERER[key] || TextScaffold;
}
