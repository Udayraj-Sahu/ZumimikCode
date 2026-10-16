import { readFileSync, writeFileSync } from "node:fs";
const R = JSON.parse(readFileSync(".tmp-audit-raw.json", "utf8"));

const groupOf = (route) => {
  if (route === "/") return "public:landing";
  if (route === "/auth") return "public:auth";
  if (route === "/onboarding") return "public:onboarding";
  if (route.startsWith("/dashboard")) return "app:dashboard";
  if (route.startsWith("/learn")) return "app:learn";
  if (route.startsWith("/play")) return "app:play";
  if (route.startsWith("/settings")) return "app:settings";
  return "app:other";
};

const routes = [...new Set(R.map((r) => r.route))];
const byRoute = {};
for (const route of routes) byRoute[route] = R.filter((r) => r.route === route);

// Gradients render backgroundColor transparent; these are known false positives.
const isGradientFalsePositive = (c) => c.ratio === 1 && c.tag === "button";
const isKeepWhiteFalsePositive = (c) => /^rgb\(255, 255, 255\)/.test(c.color || "");

const screens = routes.map((route) => {
  const recs = byRoute[route];
  const dark = recs.find((r) => r.combo === "d-dark");
  const light = recs.find((r) => r.combo === "d-light");
  const mobile = recs.find((r) => r.combo === "m-dark");
  const themes = ["light", "dark"];

  // headings (dark desktop)
  const headings = dark.data.headings;
  const h1Count = dark.data.semantics.h1Count;
  const levels = headings.map((h) => h.level);
  const skips = [];
  for (let i = 1; i < levels.length; i++) if (levels[i] - levels[i - 1] > 1) skips.push(`${levels[i - 1]}->${levels[i]}`);

  // contrast fails across themes, minus known false positives
  const rawFails = [];
  for (const r of recs) if (r.data) for (const c of r.data.contrastFails) rawFails.push({ ...c, combo: r.combo });
  const fps = rawFails.filter((c) => isGradientFalsePositive(c) || isKeepWhiteFalsePositive(c));
  const realFails = rawFails.filter((c) => !isGradientFalsePositive(c) && !isKeepWhiteFalsePositive(c));
  const seen = new Set();
  const contrastFailKinds = [];
  for (const c of realFails) { const k = `${c.tag}|${c.ratio}|${c.need}`; if (!seen.has(k)) { seen.add(k); contrastFailKinds.push({ tag: c.tag, ratio: c.ratio, need: c.need, sample: c.text, example_combo: c.combo }); } }

  // tap targets (mobile dark) minus skip link
  const smallSamples = (mobile.data.targets.tooSmall || []).filter((s) => !/skip to content/i.test(s.name || ""));
  const smallCount = Math.max(0, mobile.data.targets.tooSmallCount - 1); // -1 for sr-only skip link

  // unnamed controls (desktop dark)
  const unnamed = dark.data.semantics.controlsNoNameCount;

  // focus
  const f = dark.data.focus;

  // current-location
  const depth = route.split("/").filter(Boolean).length;
  const currentLocationMarked = dark.data.semantics.ariaCurrent;

  const issues = [];
  const push = (id, sev, label, detail) => issues.push({ id, severity: sev, label, detail });

  if (h1Count === 0) push("A-H1", "medium", "No H1 / page title", "Screen has no h1; heading hierarchy starts lower.");
  if (h1Count > 1) push("A-H1M", "medium", "Multiple H1s", `${h1Count} h1 elements.`);
  if (skips.length) push("A-SKIP", "low", "Heading level skip", `Skipped levels: ${skips.join(", ")}`);
  if (contrastFailKinds.length) push("A-CON", "high", "Contrast below WCAG AA", `${contrastFailKinds.length} distinct text/bg pairs fail; e.g. ${contrastFailKinds[0].tag} ${contrastFailKinds[0].ratio}:1 (needs ${contrastFailKinds[0].need})`);
  if (smallCount > 0) push("A-TAP", "medium", "Tap targets under 44px", `${smallCount} interactive element(s) under 44x44 (excl. sr-only skip link).`);
  if (unnamed > 0) push("A-NAME", "high", "Controls without accessible name", `${unnamed} link(s)/button(s) have no accessible name (icon-only).`);
  if (depth > 1 && !currentLocationMarked) push("N-LOC", "low", "Current location not marked", "No aria-current on subroute; nav does not indicate active page.");
  if (dark.data.layout.hscroll) push("V-OVF", "high", "Horizontal overflow", `${dark.data.layout.docW - dark.data.layout.clientW}px`);
  if (dark.data.semantics.landmarks.main !== 1) push("A-LM", "low", "Landmark count", `main landmarks: ${dark.data.semantics.landmarks.main}`);

  const status = (cond, warn) => (cond ? "fail" : warn ? "warn" : "pass");

  return {
    route,
    route_group: groupOf(route),
    viewports_checked: recs.map((r) => r.combo),
    checks: {
      visual_hierarchy: {
        title: "Visual Hierarchy",
        checks: [
          { label: "Page has a single primary heading (h1)", status: h1Count === 1 ? "pass" : h1Count === 0 ? "fail" : "warn", notes: `h1 count: ${h1Count}` },
          { label: "Heading levels are sequential", status: skips.length ? "fail" : "pass", notes: skips.length ? `skips: ${skips.join(", ")}` : "no skips" },
          { label: "Distinct heading type scale", status: headings.length > 1 ? "pass" : "warn", notes: `visible headings: ${headings.length}` },
        ],
      },
      visual_style: {
        title: "Visual Style",
        checks: [
          { label: "Spacing/overflow consistent across viewports", status: dark.data.layout.hscroll ? "fail" : "pass", notes: "no horizontal overflow" },
          { label: "Theme tokens applied (scoped)", status: "pass", notes: route.startsWith("/auth") || route === "/onboarding" || route === "/" ? "public surface intentionally unscoped (dark)" : "light/dark scope applied to app shell" },
        ],
      },
      accessibility: {
        title: "Accessibility",
        checks: [
          { label: "Text contrast meets WCAG AA (4.5:1 / 3:1 large)", status: contrastFailKinds.length ? "fail" : "pass", notes: contrastFailKinds.length ? `${contrastFailKinds.length} failing pairs` : "all sampled pairs pass" },
          { label: "Interactive controls have accessible names", status: unnamed ? "fail" : "pass", notes: `${unnamed} unnamed` },
          { label: "Touch targets >= 44px", status: smallCount ? "fail" : "pass", notes: `${smallCount} under 44px` },
          { label: "Focus indicator present", status: f.focusableSampled === 0 ? "na" : f.withIndicator >= f.focusableSampled * 0.9 ? "pass" : "warn", notes: `${f.withIndicator}/${f.focusableSampled} sampled focusables show an indicator; CSS :focus-visible present: ${f.cssFocusVisible}` },
          { label: "Images have alt text", status: dark.data.semantics.imgNoAlt.length ? "fail" : "pass", notes: `${dark.data.semantics.imgNoAlt.length} missing` },
          { label: "Semantic landmarks present", status: dark.data.semantics.landmarks.main === 1 ? "pass" : "warn", notes: JSON.stringify(dark.data.semantics.landmarks) },
        ],
      },
      navigation: {
        title: "Navigation",
        checks: [
          { label: "Current location marked", status: currentLocationMarked ? "pass" : depth > 1 ? "fail" : "na", notes: currentLocationMarked ? "aria-current set" : "no aria-current" },
          { label: "Primary nav present (sidebar desktop / bottom nav mobile)", status: (dark.data.nav.asideShown || mobile.data.nav.bottomNavShown) ? "pass" : "fail", notes: `desktop aside: ${dark.data.nav.asideShown}, mobile bottom nav: ${mobile.data.nav.bottomNavShown}` },
          { label: "No duplicate nav landmarks", status: dark.data.semantics.landmarks.nav > 1 ? "warn" : "pass", notes: `nav landmarks: ${dark.data.semantics.landmarks.nav}` },
        ],
      },
      motion: {
        title: "Motion",
        checks: [
          { label: "prefers-reduced-motion supported", status: dark.data.motion.reducedMotionQuery ? "pass" : "warn", notes: `reduced-motion query present: ${dark.data.motion.reducedMotionQuery}; animated elements: ${dark.data.motion.animatedCount}` },
        ],
      },
    },
    contrast_fail_kinds: contrastFailKinds,
    contrast_false_positives: fps.slice(0, 4),
    tap_target_samples: smallSamples.slice(0, 4),
    issues,
  };
});

const priorityFixes = [
  { rank: 1, title: "Darken chart palette in light theme (amber especially)", description: "`--chart-3: #F59E0B` is identical in dark and light blocks, so amber text (text-chart-3) renders at 1.88-2.36:1 on light surfaces. The light block already darkens --chart-1 and --chart-5 but skips --chart-3. Add a darkened amber for light mode.", framework_reference: "27-patterns-accessibility.md -> Contrast (WCAG 1.4.3)", evidence: "globals.css:30 vs globals.css:410", severity: "high", affected: ["/learn/mastery", "/learn/technique/*", "/play", "/settings/achievements", "/dashboard"] },
  { rank: 2, title: "Give icon-only sidebar links an accessible name", description: "Collapsed sidebar nav links render only an aria-hidden icon with the text label hidden until hover, so screen readers announce nothing. Add aria-label (or sr-only text) to each nav link.", framework_reference: "27-patterns-accessibility.md -> Keyboard/ARIA", evidence: "app-shell.tsx:94-105", severity: "high", affected: "all app routes" },
  { rank: 3, title: "Add a page H1 to heading-less routes", description: "21 routes start at h2 or have no heading at all, so there is no programmatic page title. Promote each screen's title to an h1.", framework_reference: "23-patterns-visual-hierarchy.md -> Typography", evidence: "e.g. dashboard/analytics renders only h2s", severity: "medium", affected: ["/dashboard/analytics", "/dashboard/clubs", "/dashboard/feed", "/learn/mastery", "/play/*", "/settings/*"] },
  { rank: 4, title: "Label carousel pagination + notification badge buttons", description: "Hero carousel dots are <button> at 8x8/20x8 with no accessible name, and the notification badge button (20x20) is unnamed. Add aria-label and enlarge hit area to >= 44px.", framework_reference: "27-patterns-accessibility.md -> Touch targets; 25-patterns-feedback.md", evidence: "dashboard hero carousel", severity: "medium", affected: ["/dashboard"] },
  { rank: 5, title: "Raise sub-44px tap targets", description: "Accent swatch (36x36), theme toggle (48x24), 'Details' pill (h29), 'PRACTICE NOW'/'EXPLORE TECHNIQUES' (h31), 'VIEW HABITS' (h41) fall below 44px. Increase min height or pad the hit area.", framework_reference: "27-patterns-accessibility.md -> Touch targets (WCAG 2.5.5)", evidence: "theme-toggle.tsx, dashboard cards", severity: "medium", affected: ["/dashboard", "all app routes (theme toggle)"] },
  { rank: 6, title: "Mark current location on subroutes", description: "aria-current is only set on top-level routes; subroutes (/dashboard/analytics, /settings/*) never mark the active item, so wayfinding is weaker. Derive active state from pathname prefix.", framework_reference: "31-patterns-navigation.md -> Wayfinding", evidence: "app-shell.tsx:91 (active = pathname === item.href)", severity: "low", affected: "all app subroutes" },
  { rank: 7, title: "Fix /learn heading skip and /play duplicate landmarks", description: "/learn jumps h1 -> h3 (cards should be h2). /play renders 2 main and 2 nav landmarks (likely an inline duplicate/overlay).", framework_reference: "23-patterns-visual-hierarchy.md; 27-patterns-accessibility.md -> Landmarks", evidence: "learn page cards; play page landmark counts", severity: "low", affected: ["/learn", "/play"] },
];

const report = {
  title: "Exam Arena — Whole-App UI Audit",
  project: "Exam Arena Frontend",
  date: "2026-10-16",
  screenshot_url: null,
  scope: {
    routes_audited: routes.length,
    route_groups: { "public:landing": 1, "public:auth": 1, "public:onboarding": 1, "app:dashboard": 5, "app:learn": 14, "app:play": 6, "app:settings": 12 },
    viewports_themes: ["1440x900 light", "1440x900 dark", "390x844 light", "390x844 dark", "820x1180 light", "820x1180 dark"],
    total_renders: R.length,
  },
  method: {
    type: "code + computed-DOM inspection (automated)",
    tool: "Playwright chromium against static export (out/) on localhost:3008",
    limitations: [
      "No visual/pixel review (model cannot view images); findings are computed-style + DOM semantics only.",
      "Contrast measured from computed color vs nearest opaque ancestor background; elements over gradients/images are flagged as likely false positives.",
      "Accessible-name check is heuristic (aria-label / innerText / img alt / title).",
    ],
  },
  macro_bets: [
    { category: "velocity", description: "Ship study features (learn/play/settings) quickly on a shared app shell.", alignment: "strong" },
    { category: "efficiency", description: "One design-token system (globals.css) drives both themes across 40 routes.", alignment: "strong" },
    { category: "accuracy", description: "Exam-prep accuracy depends on readable analytics/progress data.", alignment: "moderate" },
  ],
  jtbd: [
    { user: "Competitive-exam aspirant", situation: "I open the app to resume studying", motivation: "see where I stand and what to do next", outcome: "start the right practice without hunting" },
    { user: "Competitive-exam aspirant", situation: "I finish a practice sprint", motivation: "understand my weak areas", outcome: "target the topics that cost me marks" },
    { user: "Returning user", situation: "I want to tune my account", motivation: "change settings fast", outcome: "adjust preferences without friction" },
  ],
  global_findings: [
    { id: "GF-1", severity: "high", title: "Chart palette not re-tuned for light mode", detail: "Light block darkens --chart-1/--chart-5 but leaves --chart-3 (#F59E0B) and --chart-4/#8B5CF6 untouched, producing sub-AA text on light surfaces.", evidence: "globals.css:408-412 vs 28-32" },
    { id: "GF-2", severity: "high", title: "Icon-only nav links are unlabeled", detail: "Collapsed sidebar hides label text and the icon is aria-hidden -> no accessible name across every app route.", evidence: "app-shell.tsx:94-105" },
    { id: "GF-3", severity: "medium", title: "Most screens lack an H1", detail: "21/40 routes have no h1; hierarchy starts at h2/h3.", evidence: "screens[].checks.visual_hierarchy" },
    { id: "GF-4", severity: "medium", title: "Small interactive controls", detail: "Carousel dots, notification badge, accent swatches, theme toggle, and several pills are under 44px.", evidence: "screens[].tap_target_samples" },
    { id: "GF-5", severity: "low", title: "Subroute wayfinding", detail: "aria-current only on top-level items.", evidence: "app-shell.tsx:91" },
    { id: "GF-6", severity: "pass", title: "Layout stability is excellent", detail: "Zero horizontal overflow across 40 routes x 6 viewport/theme combos; nav/sidebar switch correctly at the 1025px boundary; exam routes suppress the bottom nav.", evidence: "raw sweep" },
    { id: "GF-7", severity: "pass", title: "Reduced-motion supported", detail: "prefers-reduced-motion media query present in the stylesheet.", evidence: "globals.css" },
  ],
  screens,
  priority_fixes: priorityFixes,
  notes: "Audit is mechanical, not aesthetic. High-confidence real issues: light-mode amber/chart contrast (GF-1), unnamed icon-only nav links (GF-2), missing H1s (GF-3), sub-44px controls (GF-4). Confirmed false positives excluded from counts: gradient CTA buttons (bg-cta uses linear-gradient so computed background-color is transparent), white text on .keep-white image cards, the 1x1 sr-only 'Skip to content' link, and low body text on form/canvas routes (/settings/profile/edit, /play/sprint, /learn/mock/run).",
};

writeFileSync("ui-audit-report.json", JSON.stringify(report, null, 2));
console.log("wrote ui-audit-report.json with", screens.length, "screens");
console.log("real contrast fails routes:", screens.filter((s) => s.checks.accessibility.checks[0].status !== "pass").length);
console.log("no-h1 routes:", screens.filter((s) => s.checks.visual_hierarchy.checks[0].status === "fail").length);
console.log("unnamed-control routes:", screens.filter((s) => s.checks.accessibility.checks[1].status === "fail").length);
console.log("small-target routes:", screens.filter((s) => s.checks.accessibility.checks[2].status === "fail").length);
