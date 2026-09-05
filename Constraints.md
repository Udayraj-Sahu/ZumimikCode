# Constraints — Exam Arena Frontend

> Short, explicit boundaries. "Allow" never means "allow anything".

## Hard rules

1. **Pages/components must NOT import `src/lib/mock/*` directly.** All data goes through `src/services/*` (via `hooks/queries/*`). When the backend drops in, mock imports keep serving mock data. Known offenders to fix — see Handover.md → "What is broken": `duel`, `clubs`, `feed`, `flashcards`, `history`, `explorer`, `technique/[id]`, `questions`, `practice`, `dojo-shell` (nav).
2. **Never hardcode a fallback topic back to `"addition"` / vedic-math.** Use `""` as the default state and sync from `setup.topics[0]` via `useEffect`.
3. **No new dependencies** without explicit approval.
4. **No secrets in the repo.** API/Firebase keys are `.env.local`-only (gitignored). Never log or commit them.
5. **Do not re-introduce a "setup complete" gate.** "No exam selected" = branded empty state + ADD PREP (`AddPrepModal`).
6. **Follow existing conventions:** Tailwind glassmorphism, `text-[Npx]` scale, `GLASS_BG`/`GLASS_BORDER` constants, service `IS_MOCK` branching, lowercase-prefixed commit messages (`feat:`, `fix:`, `revert:`, `chore:`).
7. **Do not add code comments** unless the logic is non-obvious and you would otherwise have to reverse-engineer it.
8. **Submit to verification before "done".** See `Test-Checklist.md` — typecheck, build, and (for APK work) the gradle build must pass.

## State setup for any new feature

- Core feature pages that are NOT domain-agnostic (Leaderboard, Reports, Planner, More, Profile, Friends, Help, Notifications, Achievements, Settings) may stay as-is.
- New features that render exam content must (a) key mock data by domain in `lib/mock/`, (b) expose a service, (c) accept `domain`, (d) include `domain` in the query key.