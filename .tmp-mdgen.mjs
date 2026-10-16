import { readFileSync, writeFileSync } from "node:fs";
const r = JSON.parse(readFileSync("ui-audit-report.json", "utf8"));
const L = [];
const S = (x) => (x === "pass" ? "PASS" : x === "warn" ? "WARN" : x === "fail" ? "FAIL" : "n/a");
const icon = (x) => (x === "pass" ? "OK" : x === "warn" ? "!" : x === "fail" ? "X" : "-");

L.push(`# Exam Arena — Whole-App UI Audit`);
L.push("");
L.push(`**Project:** ${r.project}  `);
L.push(`**Date:** ${r.date}  `);
L.push(`**Screens audited:** ${r.scope.routes_audited} routes x ${r.scope.viewports_themes.length} viewport/theme combos (${r.scope.total_renders} renders)  `);
L.push(`**Method:** ${r.method.type} — ${r.method.tool}`);
L.push("");
L.push(`> This is a **mechanical** audit (computed styles + DOM semantics), not a visual one. The model cannot view screenshots, so aesthetic judgments are out of scope.`);
L.push("");

L.push(`## Executive Summary`);
L.push("");
L.push(`The app shell is **structurally very strong**: 40 routes render with **zero horizontal overflow** across all 6 viewport/theme combinations, navigation switches cleanly at the 1025px boundary, exam routes correctly suppress the bottom nav, and \`prefers-reduced-motion\` is honoured.`);
L.push("");
L.push(`The real problems are concentrated in **accessibility polish**, and one has a single, precise root cause:`);
L.push("");
L.push(`1. **Light-mode chart text fails WCAG AA** — \`--chart-3: #F59E0B\` (amber) is defined identically in the dark and light token blocks. The light block deliberately darkens \`--chart-1\` and \`--chart-5\` but **skips chart-3**, so amber text renders at ~1.7–2.4:1 on light surfaces (needs 4.5:1). This single token explains most contrast failures across 22 routes.`);
L.push(`2. **Icon-only sidebar links have no accessible name** — when the sidebar is collapsed the label text is hidden and the icon is \`aria-hidden\`, so screen readers announce nothing on every app route.`);
L.push(`3. **21 of 40 routes have no \`<h1>\`** — several pages start at \`<h2>\` or have no heading at all.`);
L.push(`4. **Sub-44px touch targets** — the theme toggle (48x24), accent swatches (36x36), carousel dots (8x8), and several pill buttons sit below the 44px guideline.`);
L.push("");
L.push(`Layout/responsiveness — the area we just refactored — is **clean**. No regressions were found in the sidebar-shove / centered-content work.`);
L.push("");

L.push(`## Scope & Method`);
L.push("");
L.push(`- **Routes:** ${r.scope.routes_audited}. Groups: ` + Object.entries(r.scope.route_groups).map(([k, v]) => `${k} (${v})`).join(", ") + `.`);
L.push(`- **Viewports/themes:** ${r.scope.viewports_themes.join(", ")}.`);
L.push(`- **Collector:** Playwright (chromium) against the static export in \`out/\` served on \`localhost:3008\`; seeded auth/onboarding/walkthrough/theme localStorage per combo.`);
L.push("");
L.push(`**Limitations (read before acting on any single row):**`);
L.push("");
for (const x of r.method.limitations) L.push(`- ${x}`);
L.push("");

L.push(`## Priority Fixes (ranked)`);
L.push("");
L.push(`| # | Severity | Fix | Evidence | Affected |`);
L.push(`|---|----------|-----|----------|----------|`);
for (const f of r.priority_fixes) L.push(`| ${f.rank} | ${f.severity.toUpperCase()} | **${f.title}** — ${f.description} _(${f.framework_reference})_ | \`${f.evidence}\` | ${Array.isArray(f.affected) ? f.affected.join(", ") : f.affected} |`);
L.push("");

L.push(`## App-wide Findings`);
L.push("");
L.push(`| ID | Severity | Finding | Evidence |`);
L.push(`|----|----------|---------|----------|`);
for (const g of r.global_findings) L.push(`| ${g.id} | ${g.severity.toUpperCase()} | **${g.title}** — ${g.detail} | \`${g.evidence}\` |`);
L.push("");

L.push(`## Confirmed False Positives (excluded from counts)`);
L.push("");
L.push(`The contrast heuristic compares text colour to the nearest opaque ancestor background. These are **not** real failures:`);
L.push("");
L.push(`- **\`bg-cta\` buttons** (e.g. "CONTINUE SETUP", "PRACTICE NOW", "VIEW HABITS"): use \`background-image: linear-gradient(...)\`, so computed \`background-color\` is \`transparent\` and the heuristic grabs a near-black ancestor. Actual near-black text on the violet/lime CTA gradient is ~4.5:1+.`);
L.push(`- **White text on \`.keep-white\` image cards** (e.g. \`/dashboard/feed\` "Can you beat yesterday's accuracy?"): the card carries an \`<img>\` and \`.keep-white\` (\`globals.css:1028\`) intentionally restores true white — deliberate overlay text.`);
L.push(`- **The 1x1 sr-only "Skip to content" link** — inflates every tap-target count by 1 (already subtracted).`);
L.push(`- **Low body text on form/canvas routes** (\`/settings/profile/edit\` = 3 inputs+labels, \`/play/sprint\`, \`/learn/mock/run\`) — content lives in inputs/canvas, not DOM text.`);
L.push("");

L.push(`## Per-Route Matrix`);
L.push("");
L.push(`\`X\` = fail, \`!\` = warn, \`OK\` = pass, \`-\` = n/a.`);
L.push("");
L.push(`| Route | Group | H1 | Contrast | Names | Tap | Focus | Current | Notes |`);
L.push(`|-------|-------|:--:|:--------:|:-----:|:---:|:-----:|:-------:|-------|`);
for (const s of r.screens) {
  const vh = s.checks.visual_hierarchy.checks;
  const ac = s.checks.accessibility.checks;
  const nv = s.checks.navigation.checks;
  const h1 = vh[0].status;
  const con = ac[0].status;
  const nam = ac[1].status;
  const tap = ac[2].status;
  const foc = ac[3].status;
  const cur = nv[0].status;
  const notes = s.issues.length ? s.issues.map((i) => i.label).join("; ") : "—";
  L.push(`| \`${s.route}\` | ${s.route_group} | ${icon(h1)} | ${icon(con)} | ${icon(nam)} | ${icon(tap)} | ${icon(foc)} | ${icon(cur)} | ${notes} |`);
}
L.push("");

L.push(`## What's Working Well`);
L.push("");
L.push(`- **Zero horizontal overflow** on all 40 routes x 6 viewport/theme combos.`);
L.push(`- **Responsive nav** — desktop sidebar / mobile bottom nav switch correctly; exam routes intentionally omit the bottom nav.`);
L.push(`- **Token-driven theming** — light/dark scope applies to the app shell; public routes stay on the unscoped dark surface by design.`);
L.push(`- **\`prefers-reduced-motion\`** media query present.`);
L.push(`- **Forms are labelled** — \`/settings/profile/edit\` pairs 3 inputs with 3 labels.`);
L.push(`- **The \`.keep-white\` escape hatch works** — white overlay text on image cards is preserved in light mode.`);
L.push("");

writeFileSync("ui-audit-report.md", L.join("\n"));
console.log("wrote ui-audit-report.md", L.length, "lines");
