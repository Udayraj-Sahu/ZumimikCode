# Exam Arena — Project Compaction

## Architecture
- **Landing** (`/`): SSR + metadata + SEO (only page with server rendering)
- **Dashboard** (`/dashboard/*`): CSR only, `"use client"`, no server data
- **Layout chain**: `RootLayout` → `<QueryProvider>` → `<OnlineProvider>` → `<CapacitorInit />` → `<DashboardShell>` → `<DojoShell>` → `{page}`
- **Data flow**: Component → TanStack Query hook → Service (mock/API) → Axios → Express backend *(future)*

## Stack
| Layer | Tech |
|-------|------|
| Framework | Next.js 14.2 (App Router) |
| Styling | Tailwind CSS 3.4, GSAP 3.15 |
| State (server) | TanStack Query v5 |
| State (global) | Zustand v5 |
| HTTP | Axios v1 |
| Offline | Dexie v4 (IndexedDB) |
| PWA | @serwist/next v9 |
| Mobile | @capacitor/core + android/ios |
| Icons | Lucide React |
| Backend *(future)* | Express + PostgreSQL + Redis + Socket.IO |

## Directory Tree
```
src/
├── app/
│   ├── layout.tsx               # Root: metadata, fonts, providers
│   ├── page.tsx                  # Landing page (SSR)
│   ├── sw.ts                    # Service worker source (serwist)
│   ├── capacitor-init.tsx       # Native platform detection
│   └── dashboard/
│       ├── layout.tsx            # Server component w/ metadata
│       ├── dashboard-shell.tsx   # Client wrapper → <DojoShell>
│       ├── page.tsx              # Home — useDashboardData()
│       ├── analytics/page.tsx    # useAnalyticsData()
│       ├── profile/page.tsx      # useProfileData()
│       ├── settings/page.tsx     # useSettingsData() + useUpdateSettings()
│       └── configure-sprint/page.tsx  # useSprintTopics()
├── components/
│   ├── dashboard/
│   │   ├── dojo-shell.tsx        # Sidebar + mobile nav + logout
│   │   └── cognitive-radar.tsx   # React.memo SVG radar
│   └── ui/
│       ├── alert-modal.tsx       # Replaces alert()/confirm()
│       └── splash-screen.tsx     # Mobile-only (lg:hidden) GSAP splash
├── hooks/queries/
│   ├── use-dashboard.ts          # ["dashboard"] + Dexie cache
│   ├── use-analytics.ts          # ["analytics"]
│   ├── use-profile.ts            # ["profile"]
│   ├── use-settings.ts           # ["settings"] + useUpdateSettings mutation
│   └── use-sprint.ts             # ["sprint"]
├── lib/
│   ├── types/                    # dashboard, analytics, profile, settings, sprint
│   ├── mock/                     # dashboard, analytics, profile, settings, sprint
│   └── utils.ts                  # cn() helper
├── providers/
│   ├── query-provider.tsx        # TanStack QueryClient (5min stale, 1 retry)
│   └── online-provider.tsx       # online/offline event listeners → syncAll()
├── services/
│   ├── http.ts                   # Axios + Bearer interceptor + 401 logout
│   ├── api.ts                    # Legacy fetch helper (kept for compat)
│   ├── dashboard.ts              # Mock → apiGet for /dashboard/*
│   ├── analytics.ts              # Mock → apiGet for /analytics/*
│   ├── profile.ts                # Mock → apiGet for /profile/*
│   ├── settings.ts               # Mock → apiGet for /settings/*
│   ├── sprint.ts                 # Mock → apiGet for /sprint/*
│   ├── device.ts                 # @capacitor/device → window fallback
│   ├── storage.ts                # @capacitor/preferences → localStorage
│   ├── share.ts                  # @capacitor/share → clipboard fallback
│   └── offline/
│       ├── db.ts                 # Dexie schema (dashboardCache, userData, bookmarks)
│       └── sync.ts               # cacheQueryData, queueMutation, flushQueue, syncAll
└── stores/
    ├── auth-store.ts             # user, token, login/logout, setToken
    ├── ui-store.ts               # sidebarOpen, modal, openModal/closeModal
    └── network-store.ts          # isOnline, syncQueue, addToQueue/removeFromQueue
```

## Route → Hook → Services
| Route | Hook | Data Entities |
|-------|------|---------------|
| `/dashboard` | `useDashboardData()` | topics, radarAxes, metrics (+ inline leaderboard, events) |
| `/dashboard/analytics` | `useAnalyticsData()` | stats, weekly, recent |
| `/dashboard/profile` | `useProfileData()` | profile, stats, achievements |
| `/dashboard/settings` | `useSettingsData()` + `useUpdateSettings()` | preferences, subscription |
| `/dashboard/configure-sprint` | `useSprintTopics()` | topics, config |

## Conventions
- **Types**: `lib/types/<entity>.ts`, plain `type` (not `interface`), LucideIcon for icon props
- **Mock data**: `lib/mock/<entity>.ts`, typed const arrays matching types
- **Services**: exported async fns, `IS_MOCK` guard, `setTimeout` delay, real path stubs in comments
- **Query hooks**: `hooks/queries/use-<entity>.ts`, flat string `queryKey`, `useEffect` → Dexie cache
- **Stores**: Zustand `create<State>()`, exported as `use<Name>Store`
- **CSS**: Tailwind theme tokens (`bg-card`, `text-foreground`, `border-border`), `text-fluid-*` typography
- **GSAP**: `useRef` + `useEffect` or stable `useCallback` refs with `data-animated` + `data-section-index` guard
- **Modals**: `useUiStore.openModal()` → `<AlertModal />` renders at page root

## Key Decisions
- `layout.tsx` stays server component (metadata export); `<DashboardShell>` client wrapper provides DojoShell
- TanStack Query + Zustand + Axios on top of mock services — real API swap requires zero component changes
- `useEffect` → Dexie `cacheQueryData` on every successful query (not TanStack v5 `onSuccess`)
- `overflow-x-clip` not `overflow-x-hidden` (prevents double scrollbar)
- `fluid-xs` min 11px, `fluid-sm` min 12px (WCAG on 320px screens)
- Mobile splash screen only in dashboard context (`lg:hidden` on container, rendered in `DashboardShell`)

## State of Completion

### ✅ Done
- GSAP migration (replace motion/react), sidebar refactor (stable refs, data-animated)
- `overflow-x-clip`, dead code removal, profile/configure-sprint mobile redesign
- CognitiveRadar `React.memo`, JSON-LD inline, skip-link fix, DeleteModal `</div>` fix
- TanStack Query hooks for all 5 dashboard pages
- Zustand stores (auth, UI, network)
- Axios HTTP service + JWT interceptor stubs
- AlertModal replacing all `alert()`/`confirm()` calls
- Mobile splash screen (fades after 2s, dashboard-only, `lg:hidden`)
- Capacitor packages: core, cli, android, ios, device, share, preferences installed
- Capacitor service wrappers (`device.ts`, `storage.ts`, `share.ts`) with plugin → fallback pattern
- Capacitor platform detection (`capacitor-init.tsx`)
- PWA via serwist v9 (auto-generated SW, precaching, skipWaiting, clientsClaim)
- PWA metadata: manifest link, theme-color, iOS meta tags in layout
- Offline Dexie schema (3 tables) + sync stubs + `cacheQueryData` wired into useDashboard
- `OnlineProvider` + `network-store` (online/offline listeners, mutation queue)
- Mobile font fixes: `fluid-xs` 11px, `fluid-sm` 12px, streak cells `size-7` `text-[11px]`, nav `py-3`
- Bottom nav active state fix (unique href per tab)
- Dashboard home: all inline data (stats, streak, events, leaderboard, recent activity) moved to typed mock service + TanStack Query

### ❌ Not Yet
- Express backend (PostgreSQL + Redis + Socket.IO)
- Real JWT auth flow (login/logout stubs exist)
- Capacitor APK build (needs `output: 'export'` + APK landing redirect)
- Vercel deploy preview / production deploy
- Socket.IO real-time features (auto-reconnect, background recovery)
- PWA PNG icons (192x192, 512x512) — currently SVG only with `sizes: any`

## Relevant Files Quick Reference
```
layout.tsx           → src/app/layout.tsx
sw.ts                → src/app/sw.ts
dashboard/page.tsx   → src/app/dashboard/page.tsx
dojo-shell.tsx       → src/components/dashboard/dojo-shell.tsx
alert-modal.tsx      → src/components/ui/alert-modal.tsx
splash-screen.tsx    → src/components/ui/splash-screen.tsx
http.ts              → src/services/http.ts
sync.ts              → src/services/offline/sync.ts
auth-store.ts        → src/stores/auth-store.ts
ui-store.ts          → src/stores/ui-store.ts
network-store.ts     → src/stores/network-store.ts
query-provider.tsx   → src/providers/query-provider.tsx
online-provider.tsx  → src/providers/online-provider.tsx
capacitor-init.tsx   → src/app/capacitor-init.tsx
capacitor.config.ts  → capacitor.config.ts (root)
next.config.mjs      → next.config.mjs (root, serwist wrapped)
```
