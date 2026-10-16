import { chromium } from "@playwright/test";
const BASE = process.env.BASE || "http://localhost:3005";
const AUTH = { state: { user: { id: "1", name: "QA Operative", email: "qa@example.com", role: "Champion" }, token: "mock-jwt-token", refreshToken: null, isAuthenticated: true, isOnboarded: true }, version: 0 };
const ONBOARD = { state: { isOnboarded: true, planHookSeen: true, arenaHookSeen: true, pitchHookSeen: true, planId: "cat-fast-track", targetExam: "cat" }, version: 1 };
const WALK = { state: { completed: true }, version: 0 };

const VIEWPORTS = [
  [320, 568], [360, 640], [375, 667], [390, 844], [412, 915], [414, 896],
  [430, 932], [480, 854], [600, 900], [640, 360], [768, 1024], [810, 1280],
  [820, 1180], [912, 1368], [1024, 1366], [1025, 800], [1080, 800],
  [1280, 800], [1440, 900], [1920, 1080],
];

const browser = await chromium.launch();
for (const [w, h] of VIEWPORTS) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  await ctx.addInitScript(({ e }) => { for (const [k, v] of e) localStorage.setItem(k, JSON.stringify(v)); }, { e: [["exam-arena-auth", AUTH], ["exam-arena-onboarding", ONBOARD], ["exam-arena-walkthrough-v2", WALK]] });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e).slice(0, 120)));
  await page.goto(`${BASE}/dashboard`, { waitUntil: "networkidle" });
  await page.waitForTimeout(700);
  const r = await page.evaluate(() => {
    const nav = document.querySelector("[data-tour-mobile-nav]");
    const pill = nav?.firstElementChild;
    const aside = document.querySelector("aside");
    const toggle = document.querySelector('button[aria-label*="theme"]');
    const cols = document.querySelector(".md\\:columns-2");
    const rect = (el) => (el ? el.getBoundingClientRect() : null);
    const navRect = rect(pill);
    const st = (el) => (el ? getComputedStyle(el) : null);
    const vis = (el) => { const s = st(el); return !!el && s.display !== "none" && s.visibility !== "hidden" && parseFloat(s.opacity) > 0.5 && el.getBoundingClientRect().width > 0; };
    const doc = document.documentElement;
    return {
      overflowX: doc.scrollWidth - doc.clientWidth,
      navVisible: vis(nav),
      navDisplay: nav ? st(nav).display : "MISSING",
      navOpacity: pill ? st(pill).opacity : "n/a",
      navY: navRect ? Math.round(navRect.bottom) : null,
      navInVp: navRect ? navRect.bottom <= window.innerHeight + 1 && navRect.top >= 0 : false,
      sidebarW: aside && st(aside).display !== "none" ? Math.round(aside.getBoundingClientRect().width) : 0,
      toggleVisible: vis(toggle),
      colsDisplay: cols ? st(cols).columnCount + "/" + st(cols).display : "MISSING",
      mobileH1: vis([...document.querySelectorAll("h1")].find(e => e.className.includes("md:hidden"))),
      heroH1: vis([...document.querySelectorAll("h1")].find(e => !e.className.includes("md:hidden"))),
      heroSub: vis([...document.querySelectorAll("p")].find(e => (e.textContent||"").includes("Zero lag, zero distractions"))),
      headerRowH: (() => { const r = rect([...document.querySelectorAll("div")].find(e => (e.className||"").toString().includes("EXAM ARENA"))); return r ? Math.round(r.height) : null; })(),
      innerH: window.innerHeight,
      innerW: window.innerWidth,
    };
  });
  const flags = [];
  if (r.overflowX > 0) flags.push(`OVERFLOW_X=${r.overflowX}`);
  if (w < 1025 && !r.navVisible) flags.push("NO_MOBILE_NAV");
  if (w >= 1025 && r.navVisible) flags.push("NAV_LEAKS_ON_DESKTOP");
  if (w < 1025 && r.sidebarW > 0) flags.push("SIDEBAR_SHOWN");
  if (w >= 1025 && r.sidebarW === 0) flags.push("SIDEBAR_MISSING");
  if (w >= 768 && !r.mobileH1) flags.push("mobile-h1-hidden-ok");
  if (errors.length) flags.push("JS_ERR:" + errors.join("|"));
  console.log(`${String(w).padStart(4)}x${String(h).padEnd(4)} nav=${r.navVisible ? "y" : "n"}(${r.navDisplay}|op${r.navOpacity}|inVp=${r.navInVp}|y${r.navY}/${r.innerH}) side=${r.sidebarW} toggle=${r.toggleVisible ? "y" : "n"} cols=${r.colsDisplay} h1m=${r.mobileH1 ? "y" : "n"} hero=${r.heroH1 ? "y" : "n"} sub=${r.heroSub ? "y" : "n"} ovf=${r.overflowX} ${flags.join(" ")}`);
  await ctx.close();
}
await browser.close();
