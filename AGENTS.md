# AGENTS.md — Exam Arena

## Goal
Build a competitive exam platform featuring Vedic Math templates, interactive solve-along experience, mobile-first design, PWA support, and Capacitor APK readiness.

## Current Focus
Phase 1 of the Renderer Runtime integration — building the visual step-by-step teaching engine that makes the platform fundamentally different from MCQ-only apps.

## Branch
`feature/renderer-runtime`

## Progress

### Done
- **Types + Zod**: `src/lib/types/template.ts` — SolveAlongTemplate, SolutionStep, RenderMode, ScaffoldType, full Zod validation
- **Parser utilities**: `src/lib/utils/parse-multiplication.ts`, `parse-division.ts`, `parse-square.ts`, `parse-number-line.ts` — extract digits/products/quotients/bases from problem statements and solution steps
- **Renderer registry**: `src/lib/utils/renderer-registry.ts` — dynamic imports mapping `visual_scaffold.type` → component
- **TextScaffold**: `src/components/renderers/TextScaffold.tsx` — base engine with L1-L5 slots (problem, steps, hints, traps, visual, answer)
- **Sub-components**: `StepCard.tsx`, `HintDrawer.tsx`, `TrapBadge.tsx`, `AnswerInput.tsx`
- **ArrowMatrixRenderer**: SVG grid + diagonal arrows for cross-multiplication (405 templates)
- **StrikePadRenderer**: SVG place-value columns + quotient/remainder for division (183 templates)
- **NumberLineRenderer**: SVG horizontal line with ticks, zone, result marker (38 templates)
- **GridDerivationRenderer**: 3-row SVG grid for base-method squaring (8 templates)
- **EquationChainRenderer**: SVG equation chain nodes + arrows (48 candidates)
- **ShapeCanvasRenderer**: SVG polygons/circles with dimensions (71 candidates)
- **RendererRouter**: `visual_scaffold.type` → renderer component with TextScaffold fallback
- **Zustand store**: `template-store.ts` — visibleSteps, progress tracking, session management
- **`useStepProgress` hook**: `use-step-progress.ts` — wraps store for component ease
- **Mock data**: `src/lib/mock/templates.ts` — 6 sample templates across multiplication/division
- **Service layer**: `src/services/templates.ts` — getTemplate, getAllTemplates, createTemplateSession (mock + API)
- **Practice page integration**: Added Vedic Math mode with technique category selector, mode toggle (solve-along/quick/guided), RendererRouter integration, previous/next navigation, progress tracking
- **Architecture doc**: `RENDERER_INTEGRATION_PLAN.md` — full architecture, folder structure, data flow, roadmap

### In Progress
- Build verification

### Blocked
- Backend (Express + PostgreSQL + Redis) — deferred
- Real JWT auth — deferred until backend exists
- `middleware.ts` auth guard — deferred

## Key Decisions
- Renderers use **inline SVG** (no Canvas API, no external SVG files) — pure React components
- All renderers are **dynamic imports** with `ssr: false` (consistent with dashboard client-only pattern)
- Parsers extracted to **testable utility functions** in `src/lib/utils/`
- Practice page **augmented** (not replaced) — existing MCQ mode untouched, Vedic Math added as new mode
- `visibleSteps` tracking in Zustand with reset per-template, resume from `stepProgress` record
- AnswerInput validates free-form text against expected answer (not MCQ options)
- Three modes: `solve_along` (step reveal), `quick` (all visible + timer), `guided` (auto-advance)

## Next Steps
1. Verify `npm run build` passes
2. Dedicated `/dashboard/templates` route for direct template practice
3. Backend API + PostgreSQL tables
4. Sprint mode integration (mixed MCQ + renderer questions)
5. Offline support via Dexie

## Relevant Files
- `src/lib/types/template.ts` — types + Zod schemas
- `src/components/renderers/RendererRouter.tsx` — router
- `src/components/renderers/TextScaffold.tsx` — base engine
- `src/components/renderers/ArrowMatrixRenderer.tsx` — multiplication
- `src/components/renderers/StrikePadRenderer.tsx` — division
- `src/components/renderers/NumberLineRenderer.tsx` — estimation
- `src/components/renderers/GridDerivationRenderer.tsx` — squaring
- `src/components/renderers/EquationChainRenderer.tsx` — algebra
- `src/components/renderers/ShapeCanvasRenderer.tsx` — geometry
- `src/stores/template-store.ts` — Zustand state
- `src/hooks/use-step-progress.ts` — progress hook
- `src/lib/utils/renderer-registry.ts` — dynamic component registry
- `src/lib/utils/parse-multiplication.ts` — multiplication parser
- `src/lib/utils/parse-division.ts` — division parser
- `src/lib/utils/parse-square.ts` — square parser
- `src/lib/utils/parse-number-line.ts` — number line parser
- `src/lib/mock/templates.ts` — sample templates
- `src/services/templates.ts` — service layer
- `src/app/dashboard/practice/page.tsx` — integrated practice page
