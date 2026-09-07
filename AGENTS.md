# AGENTS.md — Exam Arena

## Goal
Full frontend dynamic by user's target exam (domain). Every dashboard page, component, and data source adapts based on `targetExam` from onboarding (`vedic-math`, `gmat`, `cat`, `gre`, `banking`). Mock data is cleanly separated in `src/lib/mock/` with `IS_MOCK` service branching — backend drop-in ready.

## Branch
`feature/renderer-runtime`

---

## Progress Dashboard

### Legend
`[✓]` Done · `[~]` In Progress · `[ ]` Pending · `[-]` Not Needed

---

### Phase 1 — Service Layer (accept `domain` param)

| # | File | Status | Notes |
|---|------|--------|-------|
| 1.1 | `src/services/dashboard.ts` | [ ] | Add optional `domain` → filter mock data |
| 1.2 | `src/services/sprint.ts` | [ ] | Add optional `domain` → `getTopicsByDomain(domain)` |
| 1.3 | `src/services/sprint-session.ts` | [ ] | Add optional `domain` → domain question pool |
| 1.4 | `src/services/practice.ts` | [✓] | Add optional `domain` → domain MCQ questions |
| 1.5 | `src/services/duel.ts` | [ ] | Add optional `domain` → domain topics |
| 1.6 | `src/services/history.ts` | [ ] | Add optional `domain` → domain topic labels |
| 1.7 | `src/hooks/queries/use-dashboard.ts` | [ ] | Accept `domain`, pass to service |
| 1.8 | `src/hooks/queries/use-sprint.ts` | [ ] | Accept `domain` |
| 1.9 | `src/hooks/queries/use-practice.ts` | [✓] | Accept `domain`, pass to service (fixes CAT-always bug) |
| 1.10 | `src/hooks/queries/use-duel-setup.ts` | [ ] | Accept `domain` |

### Phase 2 — Mock Data (domain-keyed structures)

| # | File | Status | Notes |
|---|------|--------|-------|
| 2.1 | `src/lib/mock/dashboard.ts` | [ ] | Per-exam topic mastery, stats, radar axes |
| 2.2 | `src/lib/mock/sprint.ts` | [ ] | Domain-keyed topic sets |
| 2.3 | `src/lib/mock/sprint-session.ts` | [ ] | Domain-keyed question pools |
| 2.4 | `src/lib/mock/flashcards.ts` | [~] | NEW — domain-keyed flashcard decks |
| 2.5 | `src/lib/mock/duel.ts` | [ ] | Domain-keyed topics |
| 2.6 | `src/lib/mock/history.ts` | [ ] | Domain-appropriate topic IDs |

### Phase 3 — Pages (read `targetExam`, dynamic content)

| # | Page | Status | Notes |
|---|------|--------|-------|
| 3.1 | `dashboard/page.tsx` | [ ] | Dynamic heading, per-exam topic mastery, stats |
| 3.2 | `dashboard/configure-sprint/page.tsx` | [ ] | Domain topic filter, no-exam prompt |
| 3.3 | `dashboard/sprint/page.tsx` | [ ] | Read domain from search params |
| 3.4 | `dashboard/flashcards/page.tsx` | [ ] | NEW `FLASHCARDS_BY_DOMAIN` integration |
| 3.5 | `dashboard/questions/page.tsx` | [ ] | Filter by domain |
| 3.6 | `dashboard/duel/page.tsx` | [ ] | Domain topic filter |
| 3.7 | `dashboard/practice/page.tsx` | [ ] | Already partially done — integrate MCQ domain |

### Phase 4 — Shell & Walkthrough (branding)

| # | Component | Status | Notes |
|---|-----------|--------|-------|
| 4.1 | `dojo-shell.tsx` | [ ] | Dynamic logo/subtitle |
| 4.2 | `walkthrough.tsx` | [ ] | Dynamic welcome messages |

### Build

| # | Item | Status | Notes |
|---|------|--------|-------|
| B.1 | `npm run build` | [ ] | Must pass clean |

---

## Key Decisions
- All services accept `domain?: string` — mock branches filter by domain, API branches append `?domain=` query param.
- Mock data uses `Record<string, DataType>` keyed by domain ID — zero logic coupling, pure data.
- Pages that are domain-agnostic (Leaderboard, Reports, Planner, More, Profile, Friends, Help, Notifications, Achievements, Settings) are left unchanged.
- Hooks use domain in `queryKey` so cache is per-domain.
- Existing `IS_MOCK` pattern stays — when backend is ready, replace mock files, not page logic.

---

## Relevant Files
- `src/lib/types/template.ts` — DOMAIN_LABELS, DOMAINS constants
- `src/stores/onboarding-store.ts` — targetExam (user's chosen domain)
- `src/services/api.ts` — base API client with auth
- All files listed in phases above
