# Handover — Exam Arena Frontend

> Where the project stands right now. The next AI session should start here.

## Context

- App: **Exam Arena** — exam-prep frontend (Vedic Math / GMAT / CAT / GRE / Banking) that adapts every dashboard page to the user's `targetExam`.
- Stack: Next.js 14 (static export), React 18, TypeScript, Tailwind, TanStack Query, Zustand, GSAP, Firebase Auth (optional), Dexie (offline), Serwist (SW), Capacitor 8 (Android APK).
- Working branch: **`skills-check`** (from `clean-up`, pushed). Android MD3 compliance pass for a Capacitor WebView app. `dynamic-apk` holds the dynamic-by-domain work; `clean-up` holds responsive + onboarding-black-screen fixes. Phase plan lives in `AGENTS.md` (its header branch note `feature/renderer-runtime` is stale — ignore it).

## What is done

- Services + hooks accept a `domain` param (`src/services/*`, `src/hooks/queries/*`).
- Mock data is domain-keyed (`src/lib/mock/*`, e.g. `HISTORY_TOPIC_IDS_BY_DOMAIN`).
- Pages are dynamic by `targetExam`: configure-sprint, sprint, flashcards, duel, questions, practice, history, dashboard, explorer, learn.
- `shell/app-shell.tsx` shows dynamic exam label + first name.
- `CompleteSetupGate` removed from all pages; learn/explorer show clean "no exam selected" empty states with a shared `AddPrepModal`.
- Dead code removed: `complete-setup-gate.tsx`, `SPRINT_TOPICS`, `getTemplateById`, `submitDuelResult`, `getStoredFeedback`, unused imports.
- **MD3/Android compliance pass (`skills-check`):** edge-to-edge safe-area insets (`env(safe-area-inset-*)`), `color-scheme` set per theme, predictive-back manifest flag, modal `role="dialog"`/`aria-modal`, touch targets ≥44px on icon buttons, `system` theme (Dark/Light/System–default stays Dark) with Settings control, `text-micro` (11px) type token + all `text-[10px]` migrated, `chrome` color tokens + `bg-cta` gradient token replacing hardcoded sidebar/CTA colors, contrast bumps on informational captions, and always-visible labels on the mobile bottom nav.
- Typecheck passes; `npm run build` passes clean; APK built successfully.

## What is in progress

- Font-size standardization: migrated `text-[10px]` → `text-micro` (11px) everywhere (~100 spots across 40 files). Remaining: `text-[8px]`/`text-[9px]` micro-annotations (badges, calendar day letters, graph node labels) — **not yet bumped**, mostly decorative, decided to keep until a full design-token pass.

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

- `skills-check` MD3 pass complete: typecheck + `npm run build` green. Branch not yet pushed.
- Next: push `skills-check`; optionally rebuild APK. Then the deferred items: (a) close the ~8 backend drop-in gaps, (b) finish the font/8–9px micro-annotation pass, (c) `v0` API contract doc.

---

## Session handoff (5-line note)

1. Done: MD3 compliance pass on `skills-check` — safe-area insets, predictive-back flag, modal a11y, touch targets, System theme, `text-micro` token, `chrome`/`bg-cta` colors, contrast bumps, always-labeled bottom nav.
2. Remains: push `skills-check` (+ APK); then ~8 direct-mock imports, remaining 8–9px micro text, `v0` API contract.
3. Watch: theme is now Dark/Light/System via settings (`theme-store`/`theme-provider` handle `system` resolution); sidebar toggle still flips dark↔light only.
4. Verify: `npx tsc --noEmit` → `npm run build` (remove `.next` if `PageNotFoundError` appears) → gradle.
5. Mental model: every data path must exit through `src/services/*`; flip `NEXT_PUBLIC_API_MOCK=false` to go live.