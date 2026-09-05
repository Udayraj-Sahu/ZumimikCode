# Decisions — Exam Arena Frontend

> Rationale behind meaningful technical decisions. Code tells you *what*; this tells you *why*.

## 1. Every data path exits through `src/services/*` with an `IS_MOCK` branch

- **Decision:** All data access goes through a service (`src/services/*.ts`). Each service branches on `IS_MOCK = env NEXT_PUBLIC_API_MOCK !== "false"` — mock branch returns bundled data, real branch calls `apiGet`/`apiPost` against `API_BASE_URL + API_PREFIX` (`/api/v1`).
- **Why:** Backend drop-in without touching page logic. Flip `NEXT_PUBLIC_API_MOCK=false` and every service switches to real HTTP.
- **Trade-off accepted:** Some API endpoints have no backend today, so mock is the default.

## 2. Mock data is domain-keyed (`Record<string, DataType>`)

- **Decision:** Mock structures are keyed by domain id (`gmat`, `cat`, `gre`, `banking`) and filtered by a `domain` param in services (e.g. `getTopicsByDomain(domain)`, `HISTORY_TOPIC_IDS_BY_DOMAIN`).
- **Why:** Zero logic coupling — pure data maps. A new exam is a new key.
- **Fallback:** Unknown/empty domain falls back to CAT topics (`SPRINT_TOPICS_BY_DOMAIN["cat"]`).

## 3. Hooks include `domain` in the `queryKey`

- **Decision:** `src/hooks/queries/*` accept `domain` and use it in the TanStack Query key.
- **Why:** Cache is per-domain; switching target exam never shows stale data from another exam.

## 4. "No exam selected" is a first-class, empty-state UX — no gate

- **Decision:** `CompleteSetupGate` was removed from every page. With no `targetExam`, feature pages show a branded empty state with an **ADD PREP** entry point (`AddPrepModal`, shared by learn + explorer).
- **Why:** Gating hid the dashboard and blocked exploration before onboarding; empty states + a single CTA keep onboarding visible while making the app usable immediately.
- **Trade-off:** Pages must handle empty topic arrays and `""` topic defaults (defaults sync from `setup.topics[0]` via `useEffect`, never to a hardcoded `"addition"`).

## 5. APK ships as a Capacitor wrapper over a static export

- **Decision:** Next uses `output: "export"`; `scripts/fix-asset-paths.js` rewrites asset paths so `out/` opens under `file://`; Capacitor (`webDir: "out"`, appId `com.examarena.app`) wraps it for Android.
- **Why:** Web and APK are the same codebase. APK flow: `npm run build` → `npx cap copy android` → `gradlew assembleDebug`.
- **Trade-off:** Static export only — no server routes, no dynamic SSG per request.

## 6. TanStack Query + Zustand + Dexie + Serwist

- **Decision:** Server-ish data via TanStack Query hooks; UI/client state (onboarding `targetExam`, theme, auth, sprint) via Zustand; offline cache via Dexie (`src/services/offline/`); service worker via Serwist.
- **Why:** Matches the offline-first + mock-first posture of the app.

## 7. Firebase Auth is optional

- **Decision:** Google/phone sign-in enables only when `NEXT_PUBLIC_FIREBASE_*` envs are set. Local mock auth otherwise.
- **Why:** Keep onboarding friction low for demos; no backend dependency to sign in.

## 8. No secrets in the repo

- **Decision:** All keys live in `.env.local` / CI env vars; `.env*` is gitignored. The API base URL is read from `NEXT_PUBLIC_API_URL` at build time.
- **Why:** The bundle is a static export shipped inside an APK — anything baked in at build time is extractable. Secrets are never committed.