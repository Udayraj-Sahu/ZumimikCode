# Architecture — Exam Arena Frontend

> System shape: modules, data movement, boundaries. Focus on form, not implementation detail.

## High-level shape

```
src/
├── app/            Next.js pages (auth, onboarding, dashboard/*)
│   └── dashboard/  Feature pages; every one reads targetExam from the store
├── components/     UI (ui/, dashboard shell, learn, explorer, renderers, sprint, technique, wall)
├── services/       THE ONLY data entry point  →  mock | real API via IS_MOCK
│   ├── api.ts      axios client + apiUrl() (API_BASE_URL + /api/v1)
│   └── offline/    Dexie offline cache bridges
├── hooks/queries/  TanStack Query wrappers over services (domain in queryKey)
├── stores/         Zustand stores (onboarding: targetExam, auth, theme, sprint, templates, selected-prep)
├── lib/
│   ├── mock/       Domain-keyed mock datasets + generators
│   ├── types/      TS + zod schemas (template.ts = DOMAINS, DOMAIN_LABELS)
│   └── utils/      cn(), topic-template-map, topic-node-map, feedback
├── providers/      ReactQuery / auth / theme providers
└── types/          global type declarations
```

## Data movement (the only rule)

```
Page/Component  →  hooks/queries/*  →  services/*  →  (IS_MOCK ? lib/mock/* : HTTP /api/v1)
                                              ↘  store (Zustand: targetExam, auth, ...)
```

- **Domain flow:** `onboarding-store.targetExam` is read by pages → passed as `domain` to hooks → services → mock filter / `?domain=` query param.
- **Persistence:** Dexie for offline cache; Firebase for auth; Capacitor Preferences for small settings.

## Key boundaries

- `services/*` mocks the backend 1:1. When the backend ships, **only** `lib/mock` + the mock branches change — page logic stays.
- `lib/mock/dashboard.ts` sources `NAV_ITEMS`/`MOBILE_NAV` (used by `shell/app-shell.tsx`) and the topic mastery/radar data.
- Custom **RendererRouter** (`components/renderers/`) renders technique templates by `visual_scaffold.type` (solve-along/quick/guided modes).

## Apps / run targets

| Target | Build | Entry |
|--------|-------|-------|
| Web    | `npm run dev` / `next build` | root |
| APK    | `npm run build` → `npx cap copy android` → `gradlew assembleDebug` | `out/` → `android/app/src/main/assets/public` → `app-debug.apk` |

## Known seams (current, from Handover.md)

- ~8 page imports still bypass `services/*` (see Handover.md "broken"). Once closed, `NEXT_PUBLIC_API_MOCK=false` is a full backend drop-in.
- Build-time dynamic pages are static exports; no SSR routes.