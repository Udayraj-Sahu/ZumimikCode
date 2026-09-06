# Test Checklist — Exam Arena Frontend

> Exactly what must be run and checked before a change is "done". "AI says it works" ≠ "it works".

## Always (every change)

```bash
npx tsc --noEmit
# if tsconfig.tsbuildinfo got modified as a side effect:
git checkout tsconfig.tsbuildinfo
```

Expected: no type errors.

## Build (required before push / APK)

```bash
npm run build
```

Expected: `✓ Generating static pages (48/48)`, `fix-asset-paths` prints "Done.".
Lint warnings are non-blocking but note them in the commit.
If `PageNotFoundError: Cannot find module for page: /robots.txt` → delete `.next/`, rebuild (stale-cache artifact).

## Lint (optional, non-blocking)

```bash
npm run lint
```

Known pre-existing warnings: `<img>` in `clubs/page.tsx` + `feed/page.tsx`; exhaustive-deps in `configure-sprint/page.tsx:41`, `practice/page.tsx:198`, `explorer/mind-map.tsx:57`.

## APK (when the Android app is part of the change)

```bash
npm run build
npx cap copy android
cd android
.\gradlew.bat assembleDebug
```

Expected: `BUILD SUCCESSFUL`. APK: `android/app/build/outputs/apk/debug/app-debug.apk`.

## Manual / functional checks

Dynamic-by-exam behavior:
- [ ] Onboard as GMAT → dashboard, sprint topics (ps/ds/sc/cr/rc), flashcards subtitle, duel topics, history filters, questions topics all show exam-specific content.
- [ ] Onboard as CAT → topics = qa/lrdi/va; unknown exam → CAT fallback.
- [ ] Clear the exam → each feature page shows empty state + ADD PREP; explore shows Explorer badge pill, learn shows EXAM PREP card "Select exam via add prep", mock tab keeps ADD PREP on Papers header.
- [ ] Backend posture: with `NEXT_PUBLIC_API_MOCK=false` and no backend, services must error gracefully (no crash); no page may silently keep serving mock data.

## MD3 / Android compliance checks (added on `skills-check`)

- [ ] Theme: Settings > APPEARANCE — Dark / Light / System all apply; System follows device live; default is Dark; sidebar toggle still flips dark↔light.
- [ ] No regressions from `text-[10px]` → `text-micro` (11px) across dashboard/onboarding; no overflowing buttons/chips.
- [ ] Mobile bottom nav (5 items) shows labels on all items at 360px; active item keeps primary pill.
- [ ] Edge-to-edge: on a targetSdk-36 (Android 15/16) device, content isn't clipped under the status bar; floating nav clears the gesture bar (`env(safe-area-inset-bottom)`).
- [ ] Predictive back: `android:enableOnBackInvokedCallback="true"` present; hardware back still walks the SPA stack then double-tap-to-exit.
- [ ] Modal a11y: onboarding-modal, add-prep-modal, habit-tracker-modal announce `dialog` + name (aria-modal/labelledby); close buttons ≥44px.
- [ ] `git diff` contains no `text-[10px]` and no dojo-shell hardcoded sidebar hexes (`#0d0d0d`, `#1f1f1f`, `#8a8f87`, `#eaeae5`).

## Backend drop-in readiness gate

Every new data consumer must satisfy the constraint: **page code contains zero `@/lib/mock/` imports.** Known remaining offenders in Handover.md ("What is broken"). When they are resolved, run:

```bash
Select-String -Path "src\app\dashboard\*\*.tsx","src\components\*\*.tsx" -Pattern 'from "@/lib/mock/'
```

Expected: no matches (except `dojo-shell` nav — accepted static config).