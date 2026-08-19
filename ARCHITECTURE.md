# ARCHITECTURE.md — Exam Arena

How the application works, end to end, plus which branch contains what.

---

## 1. Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router), React 18, TypeScript |
| Styling | Tailwind CSS, `cn()` helper (`clsx` + `tailwind-merge`) |
| Server state | TanStack Query (React Query v5) |
| Client state | Zustand (persisted to localStorage) |
| Offline / cache | Dexie (IndexedDB), Serwist (PWA) |
| Animations | GSAP, Motion |
| Mobile | Capacitor 8 (Android + iOS) wrapping the static export (`out/`) |
| Auth | Firebase (Google/phone) + mock fallback |
| Validation | Zod |
| Icons | lucide-react |

---

## 2. Entry flow — web vs. mobile

The app has **two entry paths**, chosen at runtime by `AppEntry` (`src/components/ui/app-entry.tsx`), which detects `window.Capacitor.isNativePlatform()`.

```
WEB (browser)                        MOBILE (Capacitor)
─────────────────                    ──────────────────
/ → Landing page (SEO surface)       SplashScreen
       ↓ (auth + onboarded?)              ↓
/onboarding (4-step)                 /onboarding (4-step)
       ↓                                  ↓
/dashboard (DojoShell + pages)       /dashboard (DojoShell + pages)
```

- **Web:** the landing page (`/`) is public and crawlable. Authenticated + onboarded visitors are auto-redirected to `/dashboard` (`page.tsx`).
- **Mobile:** the landing page is **never shown** — the native build starts with the splash screen, then goes straight to `/onboarding` (or `/dashboard` if already authed + onboarded).
- The 4-step onboarding (welcome → goal → level → done) writes the user's target exam (`targetExam`) into the onboarding store; this drives domain-aware content across the app.

### Route guards
- `src/app/dashboard/dashboard-shell.tsx` — redirects to `/onboarding` when `!isAuthenticated || !isOnboarded`, otherwise renders `DojoShell`.
- `src/app/capacitor-init.tsx` — registers the hardware back button, tracks SPA nav depth, and exits the app on double-back.

---

## 3. Directory layout

```
src/
├── app/                    # App Router pages + root layout
│   ├── page.tsx            # Landing page (/)
│   ├── onboarding/         # 4-step onboarding flow
│   ├── dashboard/          # Shell + 23 dashboard sub-routes
│   │   ├── layout.tsx      # Dashboard layout (guards → DojoShell)
│   │   ├── dashboard-shell.tsx
│   │   └── <route>/        # sprint, configure-sprint, analytics, practice,
│   │                       # leaderboard, profile, settings, duel, friends,
│   │                       # history, planner, reports, questions, flashcards,
│   │                       # achievements, notifications, help, mastery,
│   │                       # explorer, technique, more, …
│   ├── layout.tsx          # Root layout: fonts, providers, metadata, JSON-LD
│   ├── robots.ts, sitemap.ts, not-found.tsx, error.tsx, sw.ts
├── components/             # UI components (dashboard/, explorer/, onboarding/,
│   │                       # renderers/, sections/, technique/, ui/, nav/, wall/)
│   └── dashboard/
│       └── dojo-shell.tsx  # Desktop sidebar (Matiks style) + mobile bottom nav
├── hooks/
│   └── queries/            # 19 TanStack Query hooks (use-dashboard, use-sprint, …)
├── lib/
│   ├── types/              # Typed models (17 files) incl. template, technique,
│   │                       # sprint-session, content-feedback
│   ├── mock/               # Domain-keyed mock data (21 files) — backend drop-in ready
│   └── utils/, browser.ts, haptics.ts, sound.ts, firebase/, topic-template-map.ts
├── providers/              # Query, theme, online providers
├── services/               # Service layer (24 files) with IS_MOCK branching + offline/
├── stores/                 # 10 Zustand stores (auth, onboarding, theme, sprint,
│                           # template, walkthrough, rate, settings, ui, network)
└── types/
```

---

## 4. Data layer

Data flows **page → Query hook → service → mock data**, with an `IS_MOCK` switch so the backend can be dropped in without rewriting pages.

```
useDashboardData()            useSprintSession()            useLeaderboard()
      │                             │                            │
      ▼                             ▼                            ▼
  services/dashboard.ts        services/sprint-session.ts    services/leaderboard.ts
      │                             │                            │
      ▼                             ▼                            ▼
  lib/mock/dashboard.ts        lib/mock/sprint-session.ts    lib/mock/leaderboard.ts
      └── all keyed by targetExam (vedic-math, gmat, cat, gre, banking)
```

- **Types** (`lib/types/`) define the contracts; **mock** (`lib/mock/`) provides domain-keyed data; **services** (`services/`) pick mock vs. API via `IS_MOCK` (`NEXT_PUBLIC_API_MOCK !== "false"`).
- **Query hooks** use the domain in the `queryKey`, so React Query caches per-exam.
- **Offline** (`services/offline/`): Dexie-backed cache + feedback queue with trust-aware TTLs, synced when the network returns.

### Key stores (`src/stores/`)
- `auth-store` — user, token, `isAuthenticated`, login (mock / Firebase)
- `onboarding-store` — `targetExam`, `isOnboarded`
- `sprint-store`, `template-store`, `walkthrough-store`, `rate-store`, `theme-store`, `settings-store`, `ui-store`, `network-store`

---

## 5. Core user flows

1. **Onboarding** — `/onboarding`: welcome → goal (target exam) → level → done → `/dashboard`.
2. **Sprint** — `/dashboard/configure-sprint` (topic/length/difficulty) → `/dashboard/sprint` (timed quiz) → `/dashboard/sprint/results` (review).
3. **Practice** — `/dashboard/practice`: untimed topic practice with feedback.
4. **Content pipeline** — content marked by trust tier (`trusted` / `sandbox` / `live`) with provenance (`sourceId`, `techniqueId`) and prerequisite edges; user feedback queues offline and syncs.
5. **Shell navigation** — desktop sidebar (Arena / Quests / Compete / Practice / Analytics + a "More" flyout for the remaining 12 routes); mobile uses a bottom nav bar.

---


## 6. Branch inventory

All branches derive from `master` (tip `6c703faf`). Ordered oldest → newest:

| Branch | What it contains | Based on |
|--------|------------------|----------|
| `master` | Production base: landing page, 404, coach, animations, theme | — |
| `refactor/dashboard-core` | Dashboard-core refactor: typed mock service + `useDashboardData`, TanStack hooks across pages, Dexie offline + PWA (Serwist), Capacitor wrappers, theme tokens, slim mobile nav | master |
| `feature/5-new-screens` | 5 new screens (sprint results, leaderboard, achievements, notifications, help), More screen + mobile drawer nav | master |
| `feature/sprint-timed-quiz` | Timed sprint quiz UI + sprint results review | master |
| `feature/onboarding-flow` | 4-panel themed onboarding (Matiks ref), auth → goal → level → done flow | master |
| `feature/renderer-runtime` | Domain-aware renderer + domain-agnostic pipeline (all services/hooks/pages/shell read `targetExam`), Vedic Math step-by-step engine | master |
| `feature/sprint-template-analysis` | Sprint analysis page, Capacitor init, auth flow, renderer improvements (shares tip `8786a869` with `feature/renderer-runtime`) | master |
| `feat/rag-content-alignment` | RAG content alignment: trust ladder (`trusted`/`sandbox`/`live`), provenance, prerequisites, content feedback pipeline, trust-aware offline cache (4 phases) | `feature/sprint-template-analysis` |
| `UI-Changes` | Matiks-style desktop sidebar (250px, More flyout, avatar card) — the current UI restyle | `feat/rag-content-alignment` |

> Note: `AGENTS.md` still references `feature/renderer-runtime` as the active branch; the current work lives on `UI-Changes`.