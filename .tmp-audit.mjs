import { chromium } from "@playwright/test";
import { writeFileSync, readFile, statSync, existsSync } from "node:fs";
import { createServer } from "node:http";
import { join, extname, normalize } from "node:path";

const ROOT = "D:/Exam-Arena-Frontend/out";
const PORT = 3008;
const BASE = `http://localhost:${PORT}`;
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".ico": "image/x-icon", ".woff2": "font/woff2", ".txt": "text/plain", ".webp": "image/webp", ".map": "application/json" };

process.on("unhandledRejection", (e) => console.error("[unhandledRejection]", e));
process.on("uncaughtException", (e) => console.error("[uncaughtException]", e));

const server = createServer((req, res) => {
  try {
    let url = decodeURIComponent((req.url || "/").split("?")[0]);
    const clean = normalize(url).replace(/\\/g, "/");
    const cands = [join(ROOT, clean)];
    if (clean.endsWith("/")) cands.push(join(ROOT, clean + "index.html"));
    cands.push(join(ROOT, clean + ".html"), join(ROOT, clean, "index.html"));
    for (const c of cands) {
      try {
        if (existsSync(c) && statSync(c).isFile()) {
          const body = readFile(c, (err, data) => {
            if (err) { res.writeHead(500); res.end("500"); return; }
            res.writeHead(200, { "content-type": TYPES[extname(c)] || "application/octet-stream", "cache-control": "no-store" });
            res.end(data);
          });
          return;
        }
      } catch {}
    }
    res.writeHead(404, { "content-type": "text/plain" });
    res.end("404");
  } catch (e) {
    try { res.writeHead(500); res.end("500"); } catch {}
  }
});
server.on("clientError", (e, socket) => { try { socket.destroy(); } catch {} });
await new Promise((r) => server.listen(PORT, r));
console.log("inline server on", BASE);

const APP_ROUTES = [
  "/dashboard", "/dashboard/analytics", "/dashboard/clubs", "/dashboard/feed", "/dashboard/friends",
  "/learn", "/learn/explorer", "/learn/mastery", "/learn/mock/run", "/learn/practice",
  "/learn/technique/data-sufficiency", "/learn/technique/lcm-gcd", "/learn/technique/number-system-factors",
  "/learn/technique/percentage-tricks", "/learn/technique/prime-factorization", "/learn/technique/quant-comparison",
  "/learn/technique/sentence-correction-parallelism", "/learn/technique/speed-distance", "/learn/technique/work-rate",
  "/play", "/play/configure-sprint", "/play/duel", "/play/sprint", "/play/sprint/results", "/play/sprint/results/analysis",
  "/settings", "/settings/achievements", "/settings/help", "/settings/history", "/settings/leaderboard",
  "/settings/linked-devices", "/settings/notifications", "/settings/planner", "/settings/profile",
  "/settings/profile/edit", "/settings/reports", "/settings/scan-to-login",
];
const PUBLIC_ROUTES = ["/", "/auth", "/onboarding"];
const ALL_ROUTES = [...PUBLIC_ROUTES, ...APP_ROUTES];

const COMBOS = [
  { name: "d-light", w: 1440, h: 900, theme: "light" },
  { name: "d-dark", w: 1440, h: 900, theme: "dark" },
  { name: "m-light", w: 390, h: 844, theme: "light" },
  { name: "m-dark", w: 390, h: 844, theme: "dark" },
  { name: "t-light", w: 820, h: 1180, theme: "light" },
  { name: "t-dark", w: 820, h: 1180, theme: "dark" },
];

const AUTH = { state: { user: { id: "1", name: "QA Operative", email: "qa@example.com", role: "Champion" }, token: "mock-jwt-token", refreshToken: null, isAuthenticated: true, isOnboarded: true }, version: 0 };
const ONBOARD = { state: { isOnboarded: true, planHookSeen: true, arenaHookSeen: true, pitchHookSeen: true, planId: "cat-fast-track", targetExam: "cat", name: "QA Operative", firstName: "QA" }, version: 1 };
const WALK = { state: { completed: true, completedSteps: [], isActive: false }, version: 0 };
const EXAM_ROUTES = ["/play/sprint", "/learn/mock/run", "/learn/practice"];

const browser = await chromium.launch();
const records = [];

for (const combo of COMBOS) {
  const themeSeed = { state: { theme: combo.theme, accent: "violet" }, version: 0 };
  const seedApp = [
    ["exam-arena-auth", AUTH], ["exam-arena-onboarding", ONBOARD],
    ["exam-arena-walkthrough", WALK], ["exam-arena-walkthrough-v2", WALK],
    ["exam-arena-theme", themeSeed],
  ];
  const seedPublic = [
    ["exam-arena-onboarding", ONBOARD], ["exam-arena-walkthrough", WALK],
    ["exam-arena-walkthrough-v2", WALK], ["exam-arena-theme", themeSeed],
  ];
  const ctxApp = await browser.newContext({ viewport: { width: combo.w, height: combo.h }, deviceScaleFactor: 1 });
  await ctxApp.addInitScript(({ seed }) => { for (const [k, v] of seed) localStorage.setItem(k, JSON.stringify(v)); }, { seed: seedApp });
  const ctxPub = await browser.newContext({ viewport: { width: combo.w, height: combo.h }, deviceScaleFactor: 1 });
  await ctxPub.addInitScript(({ seed }) => { for (const [k, v] of seed) localStorage.setItem(k, JSON.stringify(v)); }, { seed: seedPublic });

  for (const route of ALL_ROUTES) {
    const isPublic = PUBLIC_ROUTES.includes(route);
    const ctx = isPublic ? ctxPub : ctxApp;
    const page = await ctx.newPage();
    const je = [];
    page.on("pageerror", (e) => je.push(String(e.message).slice(0, 120)));
    let loadErr = null;
    try {
      let navOk = false;
      for (let attempt = 0; attempt < 2 && !navOk; attempt++) {
        try { await page.goto(`${BASE}${route}`, { waitUntil: "domcontentloaded", timeout: 25000 }); navOk = true; }
        catch (e) { if (attempt === 1) throw e; await page.waitForTimeout(500); }
      }
      await page.waitForTimeout(1400);
      const data = await page.evaluate(() => {
        const vis = (el) => {
          if (!el) return false;
          const s = getComputedStyle(el);
          if (s.display === "none" || s.visibility === "hidden") return false;
          const r = el.getBoundingClientRect();
          if (r.width <= 0 || r.height <= 0) return false;
          const o = parseFloat(s.opacity);
          return isNaN(o) ? true : o > 0.05;
        };
        const parse = (c) => {
          const m = String(c).match(/rgba?\(([^)]+)\)/);
          if (!m) return null;
          const p = m[1].split(",").map((x) => parseFloat(x.trim()));
          return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
        };
        const blend = (fg, bg) => {
          const a = fg.a + bg.a * (1 - fg.a);
          const f = (x, y) => (x * fg.a + y * bg.a * (1 - fg.a)) / (a || 1);
          return { r: f(fg.r, bg.r), g: f(fg.g, bg.g), b: f(fg.b, bg.b), a };
        };
        const effBg = (el) => {
          let cur = el, acc = null;
          while (cur && cur !== document.documentElement) {
            const bg = parse(getComputedStyle(cur).backgroundColor);
            if (bg && bg.a > 0) acc = acc ? blend(acc, bg) : bg;
            if (acc && acc.a >= 0.999) break;
            cur = cur.parentElement;
          }
          if (!acc) {
            const root = parse(getComputedStyle(document.body).backgroundColor) || { r: 255, g: 255, b: 255, a: 1 };
            acc = root;
          }
          if (acc.a < 0.999) acc = blend(acc, { r: 12, g: 12, b: 16, a: 1 });
          return acc;
        };
        const lum = (c) => {
          const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
          return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
        };
        const ratio = (a, b) => { const l1 = lum(a), l2 = lum(b); const hi = Math.max(l1, l2), lo = Math.min(l1, l2); return (hi + 0.05) / (lo + 0.05); };
        const accName = (el) => {
          const al = el.getAttribute("aria-label");
          if (al && al.trim()) return al.trim();
          const t = (el.innerText || el.textContent || "").trim();
          if (t) return t.slice(0, 40);
          const img = el.querySelector("img[alt]");
          if (img && img.alt.trim()) return img.alt.trim();
          const ti = el.getAttribute("title");
          if (ti && ti.trim()) return ti.trim();
          return "";
        };
        const cssText = () => {
          let s = "";
          for (const sh of document.styleSheets) {
            try { for (const r of sh.cssRules) s += r.cssText + "\n"; } catch {}
          }
          return s;
        };
        const CSS = cssText();

        // Headings
        const headingSel = "h1,h2,h3,h4,h5,h6,[role=heading]";
        const headings = [...document.querySelectorAll(headingSel)].filter(vis).map((h) => {
          const lvl = h.tagName.startsWith("H") ? parseInt(h.tagName[1]) : parseInt(h.getAttribute("aria-level") || "0");
          const cs = getComputedStyle(h);
          const fg = parse(cs.color) || { r: 0, g: 0, b: 0, a: 1 };
          const bg = effBg(h);
          return { level: lvl, text: (h.innerText || "").trim().slice(0, 70), fontPx: Math.round(parseFloat(cs.fontSize)), weight: cs.fontWeight, ratio: +ratio(fg, bg).toFixed(2) };
        });

        // Contrast sample
        const textEls = [...document.querySelectorAll("p,a,button,span,li,label,td,th,h1,h2,h3,h4,h5,h6,strong,em,small,div")].filter((e) => vis(e) && (e.innerText || "").trim().length > 0 && e.children.length <= 3).slice(0, 120);
        const seen = new Set();
        const contrast = [];
        for (const el of textEls) {
          const cs = getComputedStyle(el);
          const fg = parse(cs.color);
          if (!fg || fg.a === 0) continue;
          const bg = effBg(el);
          const fontPx = parseFloat(cs.fontSize);
          const bold = parseInt(cs.fontWeight) >= 700;
          const large = fontPx >= 24 || (fontPx >= 18.66 && bold);
          const need = large ? 3 : 4.5;
          const r = +ratio(fg, bg).toFixed(2);
          const key = cs.color + "|" + JSON.stringify(bg) + "|" + Math.round(fontPx);
          if (seen.has(key)) continue;
          seen.add(key);
          contrast.push({ tag: el.tagName.toLowerCase(), text: (el.innerText || "").trim().slice(0, 40), fontPx: Math.round(fontPx), bold, ratio: r, need, pass: r >= need });
        }
        const contrastFails = contrast.filter((c) => !c.pass);

        // Tap targets
        const inter = [...document.querySelectorAll("a,button,[role=button],input,select,textarea,[tabindex]:not([tabindex='-1'])")].filter(vis);
        const tooSmall = [];
        for (const el of inter) {
          const r = el.getBoundingClientRect();
          if (r.width < 44 || r.height < 44) tooSmall.push({ tag: el.tagName.toLowerCase(), name: accName(el).slice(0, 30), w: Math.round(r.width), h: Math.round(r.height) });
        }

        // Semantics
        const imgs = [...document.querySelectorAll("img")].filter(vis);
        const imgNoAlt = imgs.filter((i) => !i.hasAttribute("alt")).map((i) => (i.getAttribute("src") || "").slice(-40));
        const controlsNoName = inter.filter((e) => ["a", "button"].includes(e.tagName.toLowerCase()) || e.getAttribute("role") === "button").filter((e) => !accName(e)).map((e) => e.tagName.toLowerCase());
        const landmarks = {
          main: document.querySelectorAll("main").length,
          nav: [...document.querySelectorAll("nav")].filter(vis).length,
          aside: [...document.querySelectorAll("aside")].filter(vis).length,
          header: [...document.querySelectorAll("header")].filter(vis).length,
          footer: [...document.querySelectorAll("footer")].filter(vis).length,
        };
        const ariaCurrent = !!document.querySelector("[aria-current='page']");

        // Focus visibility
        const focusables = inter.slice(0, 40);
        let withIndicator = 0;
        for (const el of focusables) {
          try { el.focus(); } catch {}
          const cs = getComputedStyle(el);
          const ow = parseFloat(cs.outlineWidth) || 0;
          const os = cs.outlineStyle;
          const shadow = cs.boxShadow && cs.boxShadow !== "none";
          if ((ow > 0 && os !== "none") || shadow) withIndicator++;
        }
        try { document.activeElement && document.activeElement.blur(); } catch {}

        // Motion
        const reducedMotionQuery = /prefers-reduced-motion/.test(CSS);
        const animated = [...document.querySelectorAll("*")].filter((e) => vis(e) && getComputedStyle(e).animationName !== "none").length;

        // Layout
        const docW = document.documentElement.scrollWidth, clientW = document.documentElement.clientWidth;
        const overflowEls = [...document.querySelectorAll("*")].filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && (r.right > clientW + 1 || r.left < -1); }).slice(0, 5).map((e) => ({ tag: e.tagName.toLowerCase(), cls: (e.className || "").toString().slice(0, 50), right: Math.round(e.getBoundingClientRect().right) }));

        // Nav
        const aside = document.querySelector("aside");
        const bnav = document.querySelector("[data-tour-mobile-nav]");
        const scope = document.querySelector("[data-theme-scope]");
        return {
          themeLight: scope ? scope.classList.contains("light") : null,
          title: document.title,
          headingCount: headings.length,
          headings,
          contrastChecked: contrast.length,
          contrastFails,
          targets: { total: inter.length, tooSmall: tooSmall.slice(0, 3), tooSmallCount: tooSmall.length },
          focus: { focusableSampled: focusables.length, withIndicator, cssFocusVisible: /:focus-visible|focus-visible/.test(CSS) },
          semantics: { landmarks, h1Count: headings.filter((h) => h.level === 1).length, imgCount: imgs.length, imgNoAlt, controlsNoNameCount: controlsNoName.length, ariaCurrent },
          motion: { reducedMotionQuery, animatedCount: animated },
          layout: { docW, clientW, hscroll: docW - clientW > 1, overflowEls },
          nav: { asideShown: vis(aside), bottomNavShown: vis(bnav) },
          bodyLen: (document.body.innerText || "").length,
        };
      });
      records.push({ route, combo: combo.name, theme: combo.theme, vw: combo.w, isPublic, examFlow: EXAM_ROUTES.some((r) => route.startsWith(r)), loadErr: null, jsErr: je.slice(0, 2), data });
    } catch (e) {
      records.push({ route, combo: combo.name, theme: combo.theme, vw: combo.w, isPublic, examFlow: EXAM_ROUTES.some((r) => route.startsWith(r)), loadErr: String(e.message).slice(0, 150), jsErr: je.slice(0, 2), data: null });
    }
    await page.close();
  }
  await ctxApp.close();
  await ctxPub.close();
  console.log("done combo", combo.name, "records:", records.length);
}

writeFileSync(".tmp-audit-raw.json", JSON.stringify(records, null, 1));
console.log("TOTAL", records.length, "written to .tmp-audit-raw.json");
await browser.close();
server.close();
process.exit(0);
