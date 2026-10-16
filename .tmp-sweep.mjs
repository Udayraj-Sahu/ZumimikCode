import { chromium } from "@playwright/test";

const BASE = "http://localhost:3008";

const AUTH = { state: { user: { id: "1", name: "QA Operative", email: "qa@example.com", role: "Champion" }, token: "mock-jwt-token", refreshToken: null, isAuthenticated: true, isOnboarded: true }, version: 0 };
const ONBOARD = { state: { isOnboarded: true, planHookSeen: true, arenaHookSeen: true, pitchHookSeen: true, planId: "cat-fast-track", targetExam: "cat", name: "QA Operative", firstName: "QA" }, version: 1 };
const WALK = { state: { completed: true, completedSteps: [], isActive: false }, version: 0 };
const SEED = [["exam-arena-auth", AUTH], ["exam-arena-onboarding", ONBOARD], ["exam-arena-walkthrough", WALK], ["exam-arena-walkthrough-v2", WALK]];

const VPS = [
  [320, 568], [360, 640], [375, 667], [390, 844], [412, 915], [414, 896],
  [430, 932], [480, 854], [540, 960], [600, 900], [640, 360], [667, 375],
  [768, 1024], [800, 600], [810, 1080], [820, 1180], [912, 1368],
  [960, 600], [1024, 768], [1024, 1366], [1025, 800], [1080, 1920],
  [1180, 820], [1280, 800], [1366, 768], [1440, 900], [1600, 900], [1920, 1080],
];

const browser = await chromium.launch();
const rows = [];

for (const [w, h] of VPS) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  await ctx.addInitScript(({ seed }) => { for (const [k, v] of seed) localStorage.setItem(k, JSON.stringify(v)); }, { seed: SEED });
  const page = await ctx.newPage();
  const errs = [];
  page.on("pageerror", (e) => errs.push(String(e.message).slice(0, 90)));
  await page.goto(`${BASE}/dashboard`, { waitUntil: "networkidle" });
  await page.waitForTimeout(900);

  const r = await page.evaluate(() => {
    const rect = (el) => (el ? el.getBoundingClientRect() : null);
    const cs = (el) => (el ? getComputedStyle(el) : null);
    const shown = (el) => {
      if (!el) return false;
      const s = cs(el);
      if (s.display === "none" || s.visibility === "hidden") return false;
      const rr = rect(el);
      if (!rr || rr.width <= 0 || rr.height <= 0) return false;
      const op = parseFloat(s.opacity);
      return !isNaN(op) && op > 0.05;
    };
    const nav = document.querySelector("[data-tour-mobile-nav]");
    const pill = nav && nav.firstElementChild;
    const pr = rect(pill);
    const aside = document.querySelector("aside");
    const toggle = document.querySelector('button[aria-label*="theme" i],button[aria-label*="toggle" i]');
    const h1s = [...document.querySelectorAll("h1")];
    const h1Mobile = h1s.find((e) => e.className.includes("md:hidden"));
    const h1Desk = h1s.find((e) => !e.className.includes("md:hidden"));
    const colsEl = document.querySelector(".md\\:columns-2");
    const navPillInVp = pr ? pr.bottom <= window.innerHeight + 1 && pr.top >= -1 && pr.left >= -1 && pr.right <= window.innerWidth + 1 : false;
    return {
      url: location.pathname,
      docW: document.documentElement.scrollWidth, clientW: document.documentElement.clientWidth,
      navExists: !!nav, navDisp: nav ? cs(nav).display : "none", navShown: shown(nav), navPillInVp,
      navPillBottom: pr ? Math.round(pr.bottom) : 0, navPillW: pr ? Math.round(pr.width) : 0,
      asideShown: shown(aside), asideW: aside ? Math.round(rect(aside).width) : 0,
      toggleShown: shown(toggle),
      h1MobileShown: shown(h1Mobile), h1DeskShown: shown(h1Desk),
      colsCount: colsEl ? cs(colsEl).columnCount : "none",
      innerW: window.innerWidth, innerH: window.innerHeight,
    };
  });

  const desktop = w >= 1025;
  const exp = {
    nav: !desktop,
    aside: desktop,
  };
  const fail = [];
  if (r.url !== "/dashboard") fail.push("REDIRECT:" + r.url);
  if (r.docW - r.clientW > 1) fail.push("HSCROLL:" + (r.docW - r.clientW));
  if (exp.nav && !r.navShown) fail.push("NAV_HIDDEN");
  if (exp.nav && r.navShown && !r.navPillInVp) fail.push("NAV_OFFSCREEN");
  if (!exp.nav && r.navShown) fail.push("NAV_LEAKS");
  if (exp.aside && !r.asideShown) fail.push("SIDEBAR_MISSING");
  if (!exp.aside && r.asideShown) fail.push("SIDEBAR_LEAKS");
  if (!r.toggleShown) fail.push("TOGGLE_HIDDEN");
  if (w >= 768 && r.h1MobileShown) fail.push("MOBILE_H1_ON_TABLET+");
  if (w < 768 && r.h1DeskShown) fail.push("DESK_H1_ON_PHONE");
  if (errs.length) fail.push("JSERR:" + errs[0]);

  rows.push({ w, h, name: `${w}x${h}`, nav: r.navShown ? (r.navPillInVp ? "on" : "off-scr") : "off", aside: r.asideShown ? "on" : "off", tog: r.toggleShown ? "y" : "n", cols: String(r.colsCount), h1m: r.h1MobileShown ? "y" : "n", h1d: r.h1DeskShown ? "y" : "n", ovf: r.docW - r.clientW, fail });
  await ctx.close();
}

console.log("  VIEWPORT   NAV       SIDEBAR  TOGGLE  COLS  h1mob h1desk  OVF  RESULT");
for (const r of rows) {
  const ok = r.fail.length === 0;
  console.log(`  ${r.name.padEnd(10)} ${r.nav.padEnd(9)} ${r.aside.padEnd(8)} ${r.tog.padEnd(7)} ${r.cols.padEnd(5)} ${r.h1m.padEnd(5)} ${r.h1d.padEnd(6)} ${String(r.ovf).padStart(3)}  ${ok ? "PASS" : "FAIL " + r.fail.join(",")}`);
}
const fails = rows.filter((r) => r.fail.length);
console.log(`\n${rows.length - fails.length}/${rows.length} passed`);
if (fails.length) console.log("FAILING:", fails.map((f) => f.name).join(", "));

await browser.close();
