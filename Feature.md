# Feature Trace — Exam Arena Frontend

> One entry per feature: discovery → implementation → verification. Readable cold.

## Template

```markdown
## Feature: <short title>  · status: <planned|in-progress|done>

### Scope
- Goal: <what the user can do after this>
- Non-goals: <explicitly out>

### Plan & reasoning (ask "why" before "what")
- <approach, alternatives considered, why chosen>
- Files expected to change: <paths>

### Implementation
- <what was built, commit(s)>
- <trade-offs accepted>

### Verified
- [ ] typecheck · [ ] build · [ ] APK (if affected) · [ ] manual test
- <commands + results>

### Rollback
- <commit/commands to undo>

### Follow-ups
- <anything left>
```

---

## Log

### Feature: App dynamic by target exam — DONE (`62b586d9`, branch `dynamic-apk`)

- **Scope:** Every dashboard data source adapts to `targetExam` (gmat/cat/gre/banking); clean "no exam" empty states instead of a gate; dead code removed.
- **Plan:** Thread `domain` through services/hooks (Phase 1) → domain-keyed mocks (Phase 2) → dynamic pages (Phase 3) → shell branding (Phase 4); AGENTS.md was the checklist.
- **Implementation:** Services practice/dashboard/history/duel + hooks accept `domain`; history mock keyed by domain; pages dynamic (configure-sprint, flashcards, duel, questions, practice categories); app-shell exam label + first name; removed CompleteSetupGate + older empty-state work (`clean-up`). Dead code deleted (complete-setup-gate, SPRINT_TOPICS, getTemplateById, submitDuelResult, getStoredFeedback, unused imports).
- **Verified:** `npx tsc --noEmit` PASS; `npm run build` PASS (48/48 static pages); `gradlew assembleDebug` BUILD SUCCESSFUL (48s).
- **Rollback:** `git revert 62b586d9`, or restore `clean-up` (`ee7f0f4a`).
- **Follow-ups:** close ~8 direct-mock imports; font-size standardization (undecided approach); `v0` API contract for missing services.