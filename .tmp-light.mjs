import { chromium } from "@playwright/test";
import { writeFileSync, readFileSync, statSync, existsSync, readdirSync } from "node:fs";
import { createServer } from "node:http";
import { join, extname } from "node:path";

const ROOT = "D:/Exam-Arena-Frontend/out";
const PORT = 3009;
const BASE = `http://localhost:${PORT}`;
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".ico": "image/x-icon", ".woff2": "font/woff2", ".txt": "text/plain", ".webp": "image/webp", ".map": "application/json" };

const server = createServer((req, res) => {
  try {
    let u = decodeURIComponent(req.url.split("?")[0]);
    const nidx = u.indexOf("/_next/");
    if (nidx > 0) u = u.slice(nidx);
    const midx = u.indexOf("/media/");
    if (midx > 0) u = u.slice(midx);
    const cands = [join(ROOT, u), join(ROOT, u + ".html"), join(ROOT, u, "index.html")];
    for (const f of cands) {
      if (existsSync(f) && statSync(f).isFile()) {
        res.writeHead(200, { "content-type": TYPES[extname(f)] || "application/octet-stream" });
        return res.end(readFileSync(f));
      }
    }
    res.writeHead(404); res.end("404");
  } catch { try { res.writeHead(500); res.end("500"); } catch {} }
});
await new Promise((r) => server.listen(PORT, r));

const TARGET = [
  "/", "/auth", "/onboarding",
  "/dashboard", "/dashboard/analytics", "/dashboard/clubs", "/dashboard/feed", "/dashboard/friends",
  "/learn", "/learn/explorer", "/learn/mastery", "/learn/practice", "/learn/mock/run",
  "/learn/technique/data-sufficiency", "/learn/technique/lcm-gcd", "/learn/technique/number-system-factors",
  "/learn/technique/percentage-tricks", "/learn/technique/prime-factorization", "/learn/technique/quant-comparison",
  "/learn/technique/sentence-correction-parallelism", "/learn/technique/speed-distance", "/learn/technique/work-rate",
  "/play", "/play/configure-sprint", "/play/duel", "/play/sprint", "/play/sprint/results", "/play/sprint/results/analysis",
  "/settings", "/settings/achievements", "/settings/help", "/settings/history", "/settings/leaderboard",
  "/settings/linked-devices", "/settings/notifications", "/settings/planner", "/settings/profile",
  "/settings/profile/edit", "/settings/reports", "/settings/scan-to-login",
];

const seed = (theme) => [
  ["exam-arena-auth", { state: { user: { id: "1", name: "Test User", email: "t@x.com", phone: "" }, token: "jwt", refreshToken: null, isAuthenticated: true }, version: 0 }],
  ["exam-arena-onboarding", { state: { isOnboarded: true, targetExam: "CAT", currentStep: 99 }, version: 0 }],
  ["exam-arena-walkthrough-v2", { state: { completed: true }, version: 0 }],
  ["exam-arena-theme", { state: { theme, accent: "violet" }, version: 0 }],
];

const browser = await chromium.launch();
const results = {};
for (const theme of ["dark", "light"]) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.addInitScript(({ s }) => { for (const [k, v] of s) localStorage.setItem(k, JSON.stringify(v)); }, { s: seed(theme) });
  const page = await ctx.newPage();
  for (const route of TARGET) {
    try {
      await page.goto(`${BASE}${route}`, { waitUntil: "domcontentloaded", timeout: 20000 });
      await page.waitForTimeout(1200);
      const data = await page.evaluate(() => {
        const parse = (c) => { const m = String(c).match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(",").map((x) => parseFloat(x.trim())); return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 }; };
        const blend = (fg, bg) => { const a = fg.a + bg.a * (1 - fg.a); const f = (x, y) => (x * fg.a + y * bg.a * (1 - fg.a)) / (a || 1); return { r: f(fg.r, bg.r), g: f(fg.g, bg.g), b: f(fg.b, bg.b), a }; };
        const effBg = (el) => { let cur = el, acc = null; while (cur && cur !== document.documentElement) { const bg = parse(getComputedStyle(cur).backgroundColor); if (bg && bg.a > 0) acc = acc ? blend(acc, bg) : bg; if (acc && acc.a >= 0.999) break; cur = cur.parentElement; } if (!acc) acc = parse(getComputedStyle(document.body).backgroundColor) || { r: 255, g: 255, b: 255, a: 1 }; return acc; };
        const lum = (c) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b); };
        const ratio = (a, b) => { const l1 = lum(a), l2 = lum(b); const hi = Math.max(l1, l2), lo = Math.min(l1, l2); return (hi + 0.05) / (lo + 0.05); };
        const vis = (el) => { const s = getComputedStyle(el); if (s.display === "none" || s.visibility === "hidden") return false; const r = el.getBoundingClientRect(); if (r.width <= 0 || r.height <= 0) return false; const o = parseFloat(s.opacity); return isNaN(o) ? true : o > 0.05; };
        const scope = document.querySelector("[data-theme-scope]");
        const src = scope || document.documentElement;
        const bgv = parse(getComputedStyle(document.body).backgroundColor);
        const rootBg = parse(getComputedStyle(document.documentElement).backgroundColor);
        const text = [...document.querySelectorAll("p,span,a,button,li,label,h1,h2,h3,h4,strong,small,td,th,div")].filter((e) => vis(e) && (e.innerText || "").trim().length > 1 && e.children.length === 0);
        const fails = [];
        const hasGradient = (el) => { let cur = el, n = 0; while (cur && cur !== document.body && n < 4) { const bi = getComputedStyle(cur).backgroundImage; if (bi && bi !== "none" && /gradient/.test(bi)) return true; cur = cur.parentElement; n++; } return false; };
        for (const el of text) {
          const txt = (el.innerText || "").trim();
          if (txt === "Skip to content") continue;
          if (hasGradient(el)) continue;
          const cs = getComputedStyle(el);
          const fg = parse(cs.color); if (!fg || fg.a === 0) continue;
          const bg = effBg(el);
          const px = parseFloat(cs.fontSize); const bold = parseInt(cs.fontWeight) >= 700;
          const large = px >= 24 || (px >= 18.66 && bold);
          const need = large ? 3 : 4.5;
          const r = ratio(fg, bg);
          if (r < need) fails.push({ t: (el.innerText || "").trim().slice(0, 32).replace(/\s+/g, " "), fg: cs.color.replace("rgb(", "").replace(", 1)", ""), bg: `${Math.round(bg.r)},${Math.round(bg.g)},${Math.round(bg.b)}`, r: +r.toFixed(2), need, px: Math.round(px) });
        }
        return { light: scope ? scope.classList.contains("light") : null, scopeBg: getComputedStyle(src).getPropertyValue("--background").trim(), whiteRgb: getComputedStyle(src).getPropertyValue("--color-white-rgb").trim(), bodyBg: bgv ? `${Math.round(bgv.r)},${Math.round(bgv.g)},${Math.round(bgv.b)}` : null, rootBg: rootBg ? `${Math.round(rootBg.r)},${Math.round(rootBg.g)},${Math.round(rootBg.b)}` : null, failCount: fails.length, fails, bodyLen: document.body.innerText.length };
      });
      results[`${route}|${theme}`] = data;
    } catch (e) { results[`${route}|${theme}`] = { error: String(e.message).slice(0, 80) }; }
  }
  await ctx.close();
}
writeFileSync("D:/Exam-Arena-Frontend/.tmp-light.json", JSON.stringify(results, null, 1));

console.log(`\nRoutes: ${TARGET.length}`);
for (const route of TARGET) {
  const d = results[`${route}|dark`] || {};
  const l = results[`${route}|light`] || {};
  if (d.failCount || l.failCount) {
    console.log(`\n=== ${route}  dark:${d.failCount ?? "-"} light:${l.failCount ?? "-"} L=${l.light} wrgb:${l.whiteRgb} bg:${l.bodyBg} len:${l.bodyLen}`);
    for (const f of (l.fails || []).slice(0, 8)) console.log(`  L r=${f.r} <${f.need} [${f.px}px] "${f.t}" fg=${f.fg} bg=${f.bg}`);
    for (const f of (d.fails || []).slice(0, 4)) console.log(`  D r=${f.r} <${f.need} [${f.px}px] "${f.t}" fg=${f.fg} bg=${f.bg}`);
  }
}
await browser.close(); server.close();
