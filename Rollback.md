# Rollback — Exam Arena Frontend

> How to undo risky or large changes. Confidence comes from knowing the way back.

## Known-good anchors

| Commit | Branch | State |
|--------|--------|-------|
| `ee7f0f4a` | `clean-up` (pushed) | Last pre-`dynamic-apk` state — UI/empty-state work done, no domain-threading. |
| `d72a2865` | `clean-up` | Pre-commit baseline before explorer empty-state redesign. |
| `62b586d9` | `dynamic-apk` (pushed, HEAD) | Latest: dynamic-by-domain + dead-code cleanup. |

## How to undo by scenario

### 1. Revert a merged commit cleanly
```bash
git revert <commit>        # creates a new commit, history stays intact
```

### 2. Full rollback of the dynamic-apk work
```bash
git checkout clean-up -- .        # working tree = clean-up files
# or, keep branch history:
git cherry-pick ee7f0f4a..62b586d9  # in reverse order if needed
```

### 3. Discard uncommitted work (use with care)
```bash
git restore .    # working tree only
git clean -fd    # untracked files too (NOT recommended unless sure)
```

## What must be re-checked after any revert

1. `npx tsc --noEmit` — no type errors. (`git checkout tsconfig.tsbuildinfo` if the tsbuildinfo changed.)
2. `npm run build` — clean. If "PageNotFoundError: Cannot find module for page: /robots.txt" appears, delete `.next/` and rebuild — it is a stale-cache artifact, not a code issue.
3. APK flows recheck after reverting anything under `src/services/`, `src/app/dashboard/`:
   - `npm run build`
   - `npx cap copy android`
   - `.\gradlew.bat assembleDebug` (in `android/`) → APK at `android/app/build/outputs/apk/debug/app-debug.apk`
4. Spot-check the domain flow on the affected page: select an exam in onboarding → topic list / label / subtitle changes; clear exam → empty state with ADD PREP appears.

## Rollback risk flags

- **High risk:** anything touching `services/*`, `lib/mock/*`, or `hooks/queries/*` (data paths) — re-run full checklist.
- **Low risk:** cosmetic/text changes in a single page — typecheck + targeted visual check is enough.
- Font-size standardization (not started) is flagged **high visual-regression risk** — if ever done, keep it behind a separate branch and confirm with the user before merging.