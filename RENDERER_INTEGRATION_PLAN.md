# Renderer Runtime — Integration Plan & Architecture

> **Status:** Phase 1 implementation complete (see `feature/renderer-runtime` branch)
> **Date:** 2026-06-21
> **Source:** `RENDERER_RUNTIME.md` — Runtime Renderer Architecture v1.0

---

## 1. Architecture Overview

### Problem Solved
The existing Exam Arena only supports **multiple-choice questions** (MCQ). The renderer system enables **step-by-step visual teaching** for Vedic Math techniques — showing the *process*, not just the answer.

### How It Fits
```
Existing MCQ Questions ──► Practice / Sprint / Question Bank
                                  │
New Vedic Math Templates ──► Solve-Along Experience
                                  │
                          Renderer Runtime
                          (step-by-step visual SVG guidance)
```

### Core Concept
- **Template JSON** — question data with problem statement, solution steps, hints
- **RendererRouter** — maps `visual_scaffold.type` to specific renderer component
- **TextScaffold** — base engine providing L1-L5 slot layout (problem, steps, hints, traps, visual)
- **Renderers** — generate inline SVG for each technique (arrow matrix, place value, number line, etc.)

---

## 2. Components & Responsibilities

### RendererRouter (`src/components/renderers/renderer-router.tsx`)
- Single decision point: `visual_scaffold.type` → component
- Fallback to `TextScaffold` for unknown types
- Dynamic imports via Next.js `dynamic()` for code splitting

### TextScaffold (`src/components/renderers/text-scaffold.tsx`)
- Base engine — 5 visual slots (L1-L5)
- L1: Problem statement + technique tag + difficulty
- L2: Step cards (visibility controlled by `visibleSteps`)
- L3: HintDrawer (tap-to-reveal key reminders)
- L4: TrapBadge (common mistakes, shown after all steps)
- L5: Visual canvas (`{children}` — SVG from specific renderer)
- Plus: AnswerInput for free-form answer validation

### ArrowMatrixRenderer (405 templates)
- Visualize vertical multiplication: "764 × 38"
- SVG grid cells + diagonal arrows + product row
- Parses digits from problem, intermediate products from steps

### StrikePadRenderer (183 templates)
- Visualize long division: "84 ÷ 7"
- SVG place-value columns + quotient row + strike-through

### NumberLineRenderer (38 templates)
- Visualize estimation: "√50"
- SVG horizontal line with ticks, estimation zone, result marker

### GridDerivationRenderer (8+ templates)
- Visualize base-method squaring: "97²"
- 3-row SVG grid: Number/Base → Deficiency → Result

### EquationChainRenderer (0 deployed, 48 candidates)
- Visualize algebraic equation solving
- SVG chain of equation nodes connected by arrows

### ShapeCanvasRenderer (0 deployed, 71 candidates)
- Visualize geometry problems
- SVG polygons/circles with dimension labels

### Sub-Components
- **StepCard** — individual step with visibility toggle
- **HintDrawer** — collapsible hint list
- **TrapBadge** — common mistakes highlight
- **AnswerInput** — text input + submit/retry

---

## 3. Rendering Pipeline

```
Template JSON
  ├── problem_statement: "Multiply 764 by 38"
  ├── visual_scaffold.type: "arrow_matrix"
  ├── examples[0].solution: [{ step_num, operation }, ...]
  └── key_reminders / common_mistakes
           │
           ▼
  ┌─────────────────────┐
  │   RendererRouter    │  ← reads visual_scaffold.type
  └─────────┬───────────┘
            │ maps to
  ┌─────────▼───────────┐
  │ ArrowMatrixRenderer │  ← parses digits, generates SVG
  └─────────┬───────────┘
            │ renders inside
  ┌─────────▼───────────┐
  │    TextScaffold     │  ← controls layout, step visibility,
  │  (L1-L5 slot engine)│     hints, traps, answer input
  └─────────────────────┘
            │
            ▼
  Interactive UI: "Show Next Step" → opacity 0→1 → user types answer
```

---

## 4. Folder Structure (Phase 1)

```
src/
├── components/
│   ├── renderers/                    ← NEW
│   │   ├── renderer-router.tsx
│   │   ├── text-scaffold.tsx
│   │   ├── arrow-matrix-renderer.tsx
│   │   ├── strike-pad-renderer.tsx
│   │   ├── number-line-renderer.tsx
│   │   ├── grid-derivation-renderer.tsx
│   │   ├── equation-chain-renderer.tsx
│   │   ├── shape-canvas-renderer.tsx
│   │   ├── step-card.tsx
│   │   ├── hint-drawer.tsx
│   │   ├── trap-badge.tsx
│   │   └── answer-input.tsx
├── hooks/
│   ├── use-step-progress.ts          ← NEW
├── lib/
│   ├── types/
│   │   ├── template.ts               ← NEW
│   ├── utils/
│   │   ├── renderer-registry.ts      ← NEW
│   │   ├── parse-multiplication.ts   ← NEW
│   │   ├── parse-division.ts         ← NEW
│   │   ├── parse-square.ts           ← NEW
│   │   └── parse-number-line.ts      ← NEW
│   ├── mock/
│   │   ├── templates.ts              ← NEW
├── services/
│   ├── templates.ts                  ← NEW
├── stores/
│   ├── template-store.ts             ← NEW
└── app/
    └── dashboard/
        └── practice/
            └── page.tsx              ← MODIFIED (added Vedic Math mode)
```

---

## 5. State Management

### Zustand Store (`template-store.ts`)
- `visibleSteps` — how many steps revealed (0 to N)
- `templates` — array of SolveAlongTemplate in session
- `currentIndex` — current template index
- `stepProgress` — Record<templateId, { visibleSteps, completed, correct, timeSpent }>
- Actions: `revealNextStep`, `revealAllSteps`, `resetSteps`, `nextTemplate`, `loadTemplates`, etc.

### TanStack Query (ready for backend)
- `useTemplate(id)` — fetch single template
- `useTemplateSession(params)` — fetch session bundle
- Follows existing `IS_MOCK` pattern from `services/api.ts`

---

## 6. TypeScript Interfaces

```typescript
interface SolveAlongTemplate {
  id: string;
  concept: { technique_name: string; category: string; sub_category?: string };
  difficulty: number;          // 1-5
  expected_time: number;       // seconds
  visual_scaffold: { type: ScaffoldType; config?: Record<string, unknown> };
  examples: TemplateExample[];
  key_reminders?: string[];
  common_mistakes?: string[];
}

interface TemplateExample {
  problem_statement: string;
  solution: SolutionStep[];
  answer?: string;
}

interface SolutionStep {
  step_num: number;
  operation: string;
  result?: string;
  description?: string;
}

type RenderMode = "quick" | "solve_along" | "guided";
```

Full Zod validation schemas in `src/lib/types/template.ts`.

---

## 7. Step-by-Step Reveal

- `visibleSteps` starts at 0 (all hidden)
- Click "Show Next Step" → `visibleSteps++` → StepCard opacity 0→1 + SVG elements fade in
- When `visibleSteps >= totalSteps` → all revealed, traps shown
- User types answer in AnswerInput → validated against expected answer
- Correct → proceed to next template; Wrong → hint/trap guidance

---

## 8. Three Modes

| Mode | Steps | Hints | Timer | Use Case |
|------|-------|-------|-------|----------|
| **solve_along** | Hidden (tap to reveal) | Tap to show | No | Learning |
| **quick** | All visible | Hidden | Yes | Speed practice |
| **guided** | Auto-reveal + verbose | Auto-shown | No | Beginner |

---

## 9. PostgreSQL Schema (Future)

```sql
CREATE TABLE templates (
  id UUID PRIMARY KEY,
  concept_id UUID REFERENCES concepts(id),
  difficulty SMALLINT CHECK (difficulty BETWEEN 1 AND 5),
  expected_time INTEGER,
  scaffold_type VARCHAR(50),
  scaffold_config JSONB,
  problem_statement TEXT,
  solution_steps JSONB,
  hints TEXT[],
  traps TEXT[],
  active BOOLEAN DEFAULT true
);

CREATE TABLE template_sessions (
  id UUID PRIMARY KEY,
  user_id UUID,
  mode VARCHAR(20),
  status VARCHAR(20) DEFAULT 'in_progress',
  current_index INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

CREATE TABLE template_session_items (
  id UUID PRIMARY KEY,
  session_id UUID REFERENCES template_sessions(id),
  template_id UUID REFERENCES templates(id),
  sort_order INTEGER,
  visible_steps INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  correct BOOLEAN,
  user_answer TEXT,
  time_spent INTEGER DEFAULT 0
);
```

---

## 10. API Contract

```
GET  /api/templates              → SolveAlongTemplate[]
GET  /api/templates/:id          → SolveAlongTemplate
POST /api/template-sessions      → TemplateSession
PATCH /api/template-sessions/:id/progress → StepProgress
```

---

## 11. Critical Review

### Missing from RENDERER_RUNTIME.md
- Error boundaries around each renderer (crashes → TextScaffold fallback)
- Loading/skeleton states
- Keyboard accessibility (aria-live, aria-label on SVGs)
- Mobile responsiveness (responsive viewBox on SVG)
- Undo/Previous Step button
- Skip button
- Compound answer types

### Risks
- **Parser failure** → defensive regex + unit tests + fallback
- **SVG bloat** → memoized parsers + code-split renderers
- **State sync** → Zustand + Dexie for offline session persistence

---

## 12. Implementation Roadmap

### Phase 1 ✅ (Complete — 2 weeks)
- TypeScript types + Zod schemas
- All 7 renderers + TextScaffold + RendererRouter
- Step tracking store + hook
- Mock data + service layer
- Integration into Practice page (MCQ + Vedic Math mode toggle)

### Phase 2 (Next — 3 weeks)
- Dedicated `/dashboard/templates/[id]` route
- Backend API + PostgreSQL schema
- Sprint mode integration (mixed MCQ + renderer)
- EquationChainRenderer + ShapeCanvasRenderer (candidates)
- Offline support (Dexie caching)
- Analytics telemetry

### Phase 3 (Future — 3 weeks)
- Template browser with search/filter
- Adaptive difficulty progression
- Admin template preview dashboard
- Content bulk import pipeline
- PWA pre-caching for top templates
- Performance budget enforcement
