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

## 9. Theme is three-state, default stays Dark (`skills-check`)

- **Decision:** `theme-store` now supports `"dark" | "light" | "system"` (default `"dark"`). `theme-provider` resolves `system` live via `matchMedia("(prefers-color-scheme: light)")`. Settings has an **APPEARANCE** segmented control; the sidebar `SunMoon` toggle still flips dark↔light only (from `"system"` it flips to light).
- **Why:** Android guidelines call for a manual System/Light/Dark override (R1.9) while preserving the existing dark-first look on first run. Dark stays default to avoid a silent visual change for current users.

## 10. MD3 compliance applied as web-equivalent tokens (not native components)

- **Decision:** This is a Capacitor WebView app — native Compose/XML MD3 (`MaterialTheme`, `sp`, `NavigationBar`, dynamic-color APIs, `ExploreByTouchHelper`) is N/A. Compliance is mapped to web equivalents: `color-scheme` per theme, `env(safe-area-inset-*)` for edge-to-edge (targetSdk 36 enforces it), 44px touch targets, `text-micro` (11px) minimum label size, always-labeled bottom nav (5 items), `chrome` + `bg-cta` design tokens replacing hardcoded sidebar/CTA hexes.
- **Why:** Rules about semantics, contrast, touch targets, and mode support apply to rendered UI regardless of rendering tech; component-level rules apply only to native apps.
- **Trade-off accepted:** hardcoded hex remains in lower-traffic decorative spots; 8–9px micro-annotations (badges/calendar/graph) kept until a full design-token pass.