# Flow — Exam Arena Frontend

> How execution travels through files. Bugs live in the gaps between files.

## Core domain flow (every dashboard page)

```
[onboarding-store].targetExam
        │  read by page (`useOnboardingStore((s) => s.targetExam)`)
        ▼
hooks/queries/use-* (domain in queryKey)
        ▼
services/*  ─── IS_MOCK ? ───►  lib/mock/*  (domain-keyed filter)
        └----------------------►  HTTP GET/POST  /api/v1?domain=
        ▼
Page renders domain-specific content (topics, label, subtitle, questions)
```

## Key paths

### Sprint
`configure-sprint` → `useSprintTopics(domain)` → `services/sprint.ts` → `lib/mock/sprint.ts` (`getTopicsByDomain`, `SPRINT_CONFIG`)
→ user config → `sprint/page` → session via `lib/mock/sprint-session.ts` (`generateSprintSession`) → results → `analysis` (uses `TOPIC_TO_CATEGORY[domain]` → `getTemplatesByCategory(cat, domain)`).

### Practice (MCQ)
`practice/page` → `usePracticeSession(topic, n, difficulty, domain)` → `services/practice.ts` → `generateSprintSession(topic, n, difficulty, domain)`.

### Practice (Technique / Renderer)
`practice/page` (mode=templates) → `getTemplatesByDomain(domain)` + `getCategoriesForDomain(domain)` → `RendererRouter` renders by `visual_scaffold.type`.
`technique/[id]` page → `getAllTechniques()` (currently direct mock — bypasses services).

### Duel
`duel/page` → `useDuelSetup(targetExam)` → `services/duel.ts` (`getDuelTopics(domain)`, `getDuelOpponents()`) → active session via `usePracticeSession(topic, 10, "Intermediate", targetExam)` → result via `generateDuelResult(correct, total)` (currently direct mock — bypasses services).

### Learn / Explorer (no exam selected)
`learn/page`: big ADD PREP → `AddPrepModal` → `onboarding-store.addPrep` (activePreps).
`explorer/page`: `getTechniqueIdsForTopic(topic)` (direct mock) → `getTemplatesByDomain` service → `technique/[id]`.

### Auth & shell
`auth` pages → `services/api.ts` + Firebase (optional) → `auth-store.user`.
`dojo-shell.tsx`: nav from `lib/mock/dashboard.ts` (`NAV_ITEMS`, `MOBILE_NAV`), dynamic exam label + first name from `onboarding-store`.

## Extension point (backend swap)

```ts
// services/X.ts  — the shape every data service follows
if (IS_MOCK) { await delay(...); return mockX(domain); }
return apiGet<X>(`/x?domain=${domain}`);
```

When adding a new feature, trace the above path end-to-end before/after edit and update this file if execution order changes.