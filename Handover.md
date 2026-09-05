# Handover — Exam Arena Frontend

> Where the project stands right now. The next AI session should start here.

## Context

- App: **Exam Arena** — exam-prep frontend (Vedic Math / GMAT / CAT / GRE / Banking) that adapts every dashboard page to the user's `targetExam`.
- Stack: Next.js 14 (static export), React 18, TypeScript, Tailwind, TanStack Query, Zustand, GSAP, Firebase Auth (optional), Dexie (offline), Serwist (SW), Capacitor 8 (Android APK).
- Working branch: **`dynamic-apk`** (pushed to origin). Phase plan lives in `AGENTS.md` (its header branch note `feature/renderer-runtime` is stale — ignore it).

## What is done

- Services + hooks accept a `domain` param (`src/services/*`, `src/hooks/queries/*`).
- Mock data is domain-keyed (`src/lib/mock/*`, e.g. `HISTORY_TOPIC_IDS_BY_DOMAIN`).
- Pages are dynamic by `targetExam`: configure-sprint, sprint, flashcards, duel, questions, practice, history, dashboard, explorer, learn.
- `dojo-shell.tsx` shows dynamic exam label + first name.
- `CompleteSetupGate` removed from all pages; learn/explorer show clean "no exam selected" empty states with a shared `AddPrepModal`.
- Dead code removed: `complete-setup-gate.tsx`, `SPRINT_TOPICS`, `getTemplateById`, `submitDuelResult`, `getStoredFeedback`, unused imports.
- Typecheck passes; `npm run build` passes clean; APK built successfully.

## What is in progress

- Font-size standardization: codebase is heavy with arbitrary `text-[Npx]` (dashboard home ~80 occurrences). **Not started — approach not yet decided (token mapping vs bounded pass). High visual-regression risk.**

## What is broken / not done

- **Backend drop-in is ~90% but incomplete.** ~8 spots still import `src/lib/mock/*` directly, bypassing the service layer (see `Constraints.md` §1):
  - `src/app/dashboard/duel/page.tsx` — `generateDuelResult`
  - `src/app/dashboard/clubs/page.tsx` — `MOCK_CLUBS, CLUB_FILTERS` (no clubs service exists)
  - `src/app/dashboard/feed/page.tsx` — `FEED_*` (no feed service exists)
  - `src/app/dashboard/flashcards/page.tsx` — `getFlashcards`, `getTopicsByDomain`
  - `src/app/dashboard/history/page.tsx` — `getTopicFilters, DIFFICULTY_FILTER`
  - `src/app/dashboard/explorer/page.tsx` — `getTechniqueIdsForTopic`
  - `src/app/dashboard/technique/[id]/page.tsx` — `getAllTechniques`
  - `src/app/dashboard/questions/page.tsx`, `practice/page.tsx` — `getTopicsByDomain`
- `duel/page.tsx` was wired to `useDuelSetup` topics/opponents but still calls `generateDuelResult` locally — should route through a service when the backend lands.
- Build warnings (non-fatal): `<img>` usage in `clubs`, `feed`; two `exhaustive-deps` warnings (configure-sprint line 41, practice line 198, explorer/mind-map line 57).

## Avoid

- Do **not** re-add `CompleteSetupGate` or gate content on a "setup complete" flag — the agreed UX is "no exam selected → empty state with ADD PREP".
- Do **not** hardcode a domain fallback for a page's topic data back to `"addition"`/vedic-math — use `""` default + effect syncing to `setup.topics[0]`.
- Do **not** edit `src/lib/mock/*` from page code — route through `src/services/*`.

## Where the session stopped

- APK build finished (`BUILD SUCCESSFUL in 48s`). Web assets copied via `npx cap copy android`.
- Next decision pending with the user: (a) close the ~8 backend drop-in gaps, (b) font-size standardization approach, (c) `v0` API contract doc for the missing services.

---

## Session handoff (5-line note)

1. Done: dynamic-by-domain app merged to `dynamic-apk` (`62b586d9`), pushed, APK built.
2. Remains: close ~8 direct-mock imports; decide font-size approach; build `v0` API contract.
3. Watch: duel/page still uses local `generateDuelResult`; `duel/page.tsx` currently compiles but must not stay mock-bound on the backend.
4. Verify: `npx tsc --noEmit` → `npm run build` (remove `.next` if `PageNotFoundError` for `/robots.txt` appears) → gradle.
5. Mental model: every data path must exit through `src/services/*`; flip `NEXT_PUBLIC_API_MOCK=false` to go live.