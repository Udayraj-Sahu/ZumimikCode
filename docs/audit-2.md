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
- (~) **Button styles are standardized**
  - No shared Button component. Primary CTA uses `bg-cta` (tailwind gradient) in
    most places, but `scan-to-login` uses an inline
    `linear-gradient(90deg, CTA_LIME, LIME_DARK)` — two mechanisms for the same look.
- (~) **Input styles are standardized**
  - Single family: `rounded-2xl border-white/[0.06-0.08] bg-white/[0.04] px-4
    py-3.5`. Minor border-alpha drift; no shared component.
- [x] **Card styles are standardized**
  - Recurring `rounded-2xl/3xl border + glass (bg-white/alpha + backdrop-blur)`.
- (~) **Modal/dialog styles are standardized**
  - All use `createPortal` + `fixed inset-0` + `backdrop-blur`, but z-index is
    inconsistent: `z-[70]`/`[60]`/`[200]`/`[210]`/`[220]`/`[9999]`.
- [ ] **Toast/notification styles are standardized**
  - No toast system exists. Errors are inline `destructive/5 bg + destructive/30
    border` banners. A shared toast/notification mechanism is missing.

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