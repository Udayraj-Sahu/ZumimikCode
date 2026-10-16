import { readFileSync } from "node:fs";
const R = JSON.parse(readFileSync(".tmp-audit-raw.json", "utf8"));

const loadErrs = R.filter((r) => r.loadErr);
console.log("=== LOAD ERRORS:", loadErrs.length);
for (const r of loadErrs.slice(0, 20)) console.log(" ", r.route, r.combo, r.loadErr);

const jsErrs = R.filter((r) => r.jsErr && r.jsErr.length);
console.log("\n=== JS ERRORS on", jsErrs.length, "renders");
const jsMap = {};
for (const r of jsErrs) for (const e of r.jsErr) jsMap[e] = (jsMap[e] || 0) + 1;
for (const [k, v] of Object.entries(jsMap)) console.log(" ", v + "x", k);

const nil = R.filter((r) => !r.data);
console.log("\n=== NULL DATA:", nil.length);

const withData = R.filter((r) => r.data);
const hscroll = withData.filter((r) => r.data.layout.hscroll);
console.log("\n=== HSCROLL:", hscroll.length);
for (const r of hscroll.slice(0, 30)) console.log(" ", r.route, r.combo, r.data.layout.docW - r.data.layout.clientW);

console.log("\n=== SMALL BODY (<200 chars => likely redirect/blocked):");
for (const r of withData.filter((r) => r.data.bodyLen < 200).slice(0, 30)) console.log(" ", r.route, r.combo, "len", r.data.bodyLen, "title", JSON.stringify(r.data.title));

console.log("\n=== THEME APPLIED CHECK (expected vs actual):");
let themeBad = 0;
for (const r of withData) { const exp = r.theme === "light"; if (r.data.themeLight !== exp) { themeBad++; if (themeBad <= 12) console.log(" ", r.route, r.combo, "expected light?", exp, "got", r.data.themeLight); } }
console.log("theme mismatches:", themeBad);

console.log("\n=== NAV expectations:");
for (const r of withData) {
  const desktop = r.vw >= 1025;
  const issues = [];
  if (desktop && !r.data.nav.asideShown) issues.push("no-aside");
  if (!desktop && !r.examFlow && !r.data.nav.bottomNavShown) issues.push("no-bottomnav");
  if (!desktop && r.data.nav.bottomNavShown && r.examFlow) issues.push("bottomnav-on-exam");
  if (desktop && r.data.nav.bottomNavShown) issues.push("bottomnav-on-desktop");
  if (issues.length && (r.combo === "d-dark" || r.combo === "m-dark")) console.log(" ", r.route, r.combo, issues.join(","));
}

// Heading structure
console.log("\n=== MULTIPLE H1 / MISSING H1 (dark combos):");
for (const r of withData.filter((x) => x.combo.endsWith("dark"))) {
  const msgs = [];
  if (r.data.semantics.h1Count === 0) msgs.push("no-h1");
  if (r.data.semantics.h1Count > 1) msgs.push("multi-h1(" + r.data.semantics.h1Count + ")");
  if (msgs.length) console.log(" ", r.route, r.combo, msgs.join(","));
}

// Heading level skips
console.log("\n=== HEADING LEVEL SKIPS (dark combos):");
for (const r of withData.filter((x) => x.combo.endsWith("dark"))) {
  const lv = r.data.headings.map((h) => h.level).filter((l) => l > 0);
  const skips = [];
  for (let i = 1; i < lv.length; i++) if (lv[i] - lv[i - 1] > 1) skips.push(lv[i - 1] + "->" + lv[i]);
  if (skips.length) console.log(" ", r.route, r.combo, skips.join(","), "| lv:", lv.join(""));
}

// Contrast
console.log("\n=== CONTRAST FAILS (all combos, grouped by tag+ratio):");
const cAgg = {};
for (const r of withData) for (const c of r.data.contrastFails) { const k = c.tag + "|" + c.ratio + "|" + c.need; (cAgg[k] = cAgg[k] || []).push(r.route + "@" + r.combo); }
const cSorted = Object.entries(cAgg).sort((a, b) => b[1].length - a[1].length);
for (const [k, v] of cSorted) console.log(" ", v.length + "x", k, "| e.g.", v[0], "| txt:", JSON.stringify(withData.find((r) => (r.route + "@" + r.combo) === v[0])?.data.contrastFails.find((c) => (c.tag + "|" + c.ratio + "|" + c.need) === k)?.text || ""));

// Tap targets
console.log("\n=== TAP TARGETS <44 (dark combos):");
for (const r of withData.filter((x) => x.combo === "m-dark")) {
  if (r.data.targets.tooSmallCount > 0) console.log(" ", r.route, "count", r.data.targets.tooSmallCount, "e.g.", JSON.stringify(r.data.targets.tooSmall[0]));
}

// a11y names
console.log("\n=== CONTROLS WITHOUT ACCESSIBLE NAME (dark combos):");
for (const r of withData.filter((x) => x.combo === "d-dark")) {
  if (r.data.semantics.controlsNoNameCount > 0) console.log(" ", r.route, r.data.semantics.controlsNoNameCount);
}

// imgs no alt
console.log("\n=== IMG NO ALT (dark combos):");
for (const r of withData.filter((x) => x.combo === "d-dark")) {
  if (r.data.semantics.imgNoAlt.length) console.log(" ", r.route, JSON.stringify(r.data.semantics.imgNoAlt));
}

// Focus
console.log("\n=== FOCUS INDICATOR (dark combos):");
for (const r of withData.filter((x) => x.combo === "d-dark")) {
  const f = r.data.focus;
  if (f.focusableSampled > 0 && f.withIndicator < f.focusableSampled) console.log(" ", r.route, "withIndicator", f.withIndicator, "/", f.focusableSampled, "cssFocusVisible", f.cssFocusVisible);
}

// motion
console.log("\n=== MOTION: reduced-motion query present:", withData[0]?.data.motion.reducedMotionQuery);
const anim = withData.filter((r) => r.combo === "d-dark").map((r) => [r.route, r.data.motion.animatedCount]).sort((a, b) => b[1] - a[1]);
console.log(" ", JSON.stringify(anim.slice(0, 10)));

// landmarks
console.log("\n=== LANDMARKS (d-dark):");
for (const r of withData.filter((x) => x.combo === "d-dark")) console.log(" ", r.route, JSON.stringify(r.data.semantics.landmarks), "aria-current:", r.data.semantics.ariaCurrent);
