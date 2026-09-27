# Exam Arena — Audit 2 (Design System & Theme)

Companion to `docs/QA-AUDIT.md`. Covers the design-system consistency and
theme-edge-case checklist for the app shell + feature screens.

Status: `[x]` = verified, `(~)` = partial (evidence-cited), `[ ]` = open.

---

## Design System

### Color & token architecture
- [x] **One source of truth for colors/tokens**
  - `src/lib/theme-tokens.ts` + `globals.css :root` (.light overrides in globals).
  - Note: header comment claims "AUTO-GENERATED from palette-map.json", but no
    `palette-map.json` exists in the repo — two files must stay manually in sync.
- [x] **Light theme completely implemented** (Phase 1 QA-AUDIT completed)
- [x] **Dark theme completely implemented** (original; frozen)
- [x] **Theme switching updates all components**
  - `theme-store.ts` toggles `.light` on `[data-theme-scope]`; shell wraps app
    (`app-shell.tsx:82`). All portaled modals self-apply `theme === "light" && "light"`.
- [x] **No hardcoded colors outside design tokens**
  - No hex literals in `.tsx`; only `rgba()` computed from `LIME_BRIGHT_RGB` token
    (adaptive-reprompt) and CSS vars. Landing/hero ARIA ring uses tokens.
- [x] **Primary / secondary / accent / neutral colors have defined usage**
  - `primary`=lime, `accent`/`muted`/`destructive`/`border`/`ring`/`chart-*` all
    mapped in `tailwind.config.ts` and consumed consistently.

### Typography
- (~) **Typography scale is consistent**
  - Scale defined (`text-micro`, `text-fluid-xs..3xl`) but the app also uses 30+
    arbitrary sizes — `text-[13px]` x134, `text-[12px]` x182, `text-[11px]` x116,
    `text-[10px]`/`[9px]`/`[8px]`/`[7px]` etc. Needs a sweep toward the fluid scale.
- [x] **Font weights are consistent**
  - `font-bold`/`semibold`/`medium` dominate; `font-display` and `font-mono` used
    for their purpose. (Minor: Inter only loads 300–600 yet `font-bold`=700 is used
    x541 — synthesized bold.)

### Shape & elevation
- (~) **Border radius system is consistent**
  - Predominantly `rounded-full`/`3xl`/`2xl`/`xl`/`lg`/`md` (tokens). 23 arbitrary
    values remain: `rounded-[20px]`/`[18px]`/`[16px]`/`[10px]`/`[0.12em]`.
- (~) **Shadow/elevation system is consistent**
  - No shadow tokens are defined in `tailwind.config.ts`. 31 arbitrary
    `shadow-[0...]` + `shadow-2xl`/`md`/`sm`/`lg`. Needs an elevation scale.
- [x] **Spacing follows a defined scale**
  - Standard Tailwind scale throughout (`gap-2`/`px-4`/`py-3`…). Rare arbitrary,
    e.g. `gap-[3px]`.

### Icons
- [x] **Icon library is consistent** — 100% `lucide-react`
- (~) **Icons have consistent stroke/fill style**
  - Default strokeWidth=2, but explicit overrides span 1.5/1.8/2.2/2.5/2.8/3/3.5
    (44 total). Sizes mix `size={10..24}`. Standardize to a small set.

### Components
- [x] **Button styles are standardized**
  - Shared **`Button` primitive added** (`src/components/ui/button.tsx`) with
    `variant="cta" | "primary" | "glass" | "destructive" | "ghost"` (default cta),
    `size="lg" | "md" | "sm" | "icon"` (default md), `fullWidth`, `type="button"`
    default + `disabled:opacity-30 disabled:cursor-not-allowed` base.
  - `cta` uses `bg-cta` gradient (single mechanism — the `scan-to-login` inline
    `linear-gradient(90deg, CTA_LIME, LIME_DARK)` drift remains there only).
  - **Migrated ~37 buttons across 14 app pages** to the primitive
    (`play/sprint+results+analysis`, `learn/mock/run`, `learn/practice`,
    `play/duel`, `play/configure-sprint`, `dashboard, +analytics/friends/clubs`,
    `learn`, `settings/profile`, `settings/profile/edit`, `settings/reports`).
    Option/segmented-toggle loops (sprint, mock, duel, settings rows, amber solid
    "Start 5-Question Sprint") intentionally left as-is — a separate category.
  - **Dead-hover fix:** glass buttons previously used inline `style={{ backgroundColor:
    GLASS_BG, borderColor: GLASS_BORDER }}` so `hover:bg-white/[0.06]` was masked by the
    inline style. Added `.btn-glass` in `globals.css @layer components` (border/bg from
    tokens) so utilities-layer hover wins; inline-style glass buttons in results,
    analysis, optimization, sprint, mock/run, practice, duel, learn migrated.
- (~) **Input styles are standardized**
  - Single family: `rounded-2xl border-white/[0.06-0.08] bg-white/[0.04] px-4
    py-3.5`. Minor border-alpha drift; no shared component.
- [x] **Card styles are standardized**
  - Recurring `rounded-2xl/3xl border + glass (bg-white/alpha + backdrop-blur)`.
  - **Shared `GlassCard` component added** (`src/components/ui/glass-card.tsx`) with
    `radius="2xl" | "3xl"` (default 3xl), base `relative border backdrop-blur-xl`,
    and default style `{ borderColor: GLASS_BORDER, background: GLASS_BG }`
    (caller className/style merge last).
  - **Refactored to `GlassCard` across static (app) pages** (~18 sites): dashboard
    (Quick Access, Topic mastery, Recent Activity, Cognitive radar, Upcoming,
    Leaderboard), dashboard sub-pages (analytics stat cards via border override,
    ClubCard, feed stories, friends rows + error banner), learn (Exam Tabs, mock
    paper cards, StatsSummary, practice result stat cards + hint box), play
    (sprint result stat cards, analysis wrong-answer cards), settings (StatCard,
    prep list, planner error banner + stat cards).
  - Kept as-is intentionally: interactive buttons/segmented controls, gradient &
    tinted *spotlight* cards, dashed-edge inputs, `divide-y` list containers,
    skeletons (all remain standard `rounded-2xl/3xl + glass` recipe).
  - NOTE: this standardization also fixes light-mode borders — cards previously
    hardcoded `border-white/[0.06]` now use `--glass-border` (black-alpha 0.08 in
    light), so the border remains visible in light mode.
- [x] **Modal/dialog styles are standardized**
  - Shared **`Dialog` primitive added** (`src/components/ui/dialog.tsx`): portal,
    `placement="bottom-sheet" | "center"`, Escape-close, basic focus trap
    (restores prior focus), `data-theme-scope` + light auto-apply, aria
    `role/aria-modal/labelledby/describedby/label` passthrough, caller-forwardable
    overlay/panel refs (keeps existing gsap entry/exit in callers), optional
    `panelStyle`. Backed by **`useLockBodyScroll`** (`src/hooks/use-lock-body-scroll.ts`,
    ref-counted, locks `body` + `main` scroller, restores prior overflow) — no
    scroll-lock existed before this.
  - **Migrated bottom-sheet family**: `learn/add-prep-modal`, `dashboard/exam-date-modal`,
    `adaptive/adaptive-reprompt`, `shell/rate-prompt` (center). Legacy modals
    (`onboarding-modal`, intro family, `habit-tracker-modal`, `paywall-modal`) still use
    their own `createPortal`; only z-index normalized.
  - **Elevation scale added** in `globals.css :root`: `--z-fab` 40 / `--z-nav` 50 /
    `--z-dialog` 60 / `--z-toast` 90 / `--z-intro` 200 / `--z-splash` 9999. All legacy
    `z-[60/70/200/210/220/9999]` bands wired to tokens (intro family, splash,
    habit, onboarding-modal → `--z-dialog`, auth-modal/nav-shell → `--z-nav`).
    `paywall-modal` + `offline-banner` remain at `z-[70]` (above dialog, below toast)
    pending a dedicated overlay band.
- [x] **Toast/notification styles are standardized**
  - Added minimal toast system: **`toast-store`** (`src/stores/toast-store.ts`, zustand,
    `toast.success/info/error` facades, auto-dismiss ~3.5s) + **`Toaster`**
    (`src/components/ui/toaster.tsx`, motion entry/exit, `--z-toast`, `role="alert"`
    for errors / `role="status"` otherwise, bottom-center mobile / bottom-right sm+,
    mounted in `app-shell`).
  - Demo wiring: `content-feedback` submit failure → `toast.error(...)` (was silent
    `catch { setSubmitted(null) }`).
  - Note: inline `destructive/5` error banners remain the standard for in-form
    validation errors; toasts cover transient system/async feedback.

---

## Theme edge cases
- [x] Text remains readable in both themes
- [x] Disabled elements remain distinguishable
- [x] Placeholder text has sufficient contrast — fixed: all 5 inputs now use
  full `text-muted-foreground` instead of `/20–/30` (was ~1.5:1 in light; now
  4.7:1 light, 5.5:1 dark — AA).
- [x] Borders don't disappear in dark mode
- [x] Shadows work appropriately in dark mode
- [x] Images/logos don't become invisible (feed hero is `keep-white` + gradient overlay)
- [x] SVG icons inherit theme correctly (lucide, colored via theme tokens)
- [x] Charts adapt to theme (`chart-1..5` defined per theme in globals.css)
- [x] Loading skeletons adapt to theme
- [x] Empty states adapt to theme