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

## Backend drop-in readiness gate

Every new data consumer must satisfy the constraint: **page code contains zero `@/lib/mock/` imports.** Known remaining offenders in Handover.md ("What is broken"). When they are resolved, run:

```bash
Select-String -Path "src\app\dashboard\*\*.tsx","src\components\*\*.tsx" -Pattern 'from "@/lib/mock/'
```

Expected: no matches (except `dojo-shell` nav — accepted static config).