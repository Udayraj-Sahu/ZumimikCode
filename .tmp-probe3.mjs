import { chromium } from "@playwright/test";
import { readFileSync, existsSync, statSync, readdirSync } from "node:fs";
import { createServer } from "node:http";
import { join, extname } from "node:path";

const ROOT = "D:/Exam-Arena-Frontend/out";
const PORT = 3011;
const BASE = `http://localhost:${PORT}`;
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".ico": "image/x-icon", ".woff2": "font/woff2", ".txt": "text/plain", ".webp": "image/webp", ".map": "application/json" };
const server = createServer((req, res) => {
  try {
    let u = decodeURIComponent(req.url.split("?")[0]);
    const n = u.indexOf("/_next/"); if (n > 0) u = u.slice(n);
    const m = u.indexOf("/media/"); if (m > 0) u = u.slice(m);
    for (const f of [join(ROOT, u), join(ROOT, u + ".html"), join(ROOT, u, "index.html")]) {
      if (existsSync(f) && statSync(f).isFile()) { res.writeHead(200, { "content-type": TYPES[extname(f)] || "application/octet-stream" }); return res.end(readFileSync(f)); }
    }
    res.writeHead(404); res.end("404");
  } catch { try { res.writeHead(500); res.end("500"); } catch {} }
});
await new Promise((r) => server.listen(PORT, r));

const seed = (theme) => [
  ["exam-arena-auth", { state: { user: { id: "1", name: "Test User", email: "t@x.com", phone: "" }, token: "jwt", refreshToken: null, isAuthenticated: true }, version: 0 }],
  ["exam-arena-onboarding", { state: { isOnboarded: true, targetExam: "CAT", currentStep: 99 }, version: 0 }],
  ["exam-arena-walkthrough-v2", { state: { completed: true }, version: 0 }],
  ["exam-arena-theme", { state: { theme, accent: "violet" }, version: 0 }],
];

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
await ctx.addInitScript(({ s }) => { for (const [k, v] of s) localStorage.setItem(k, JSON.stringify(v)); }, { s: seed("light") });
const page = await ctx.newPage();
for (const [route, want] of [["/play", "MATH"], ["/settings/reports", "%"], ["/dashboard", "MEMBERSHIP"]]) {
  await page.goto(`${BASE}${route}`, { waitUntil: "domcontentloaded", timeout: 20000 });
  await page.waitForTimeout(1200);
  const out = await page.evaluate(({ want }) => {
    const scope = document.querySelector("[data-theme-scope]");
    const root = document.documentElement;
    const gv = (el, v) => getComputedStyle(el).getPropertyValue(v).trim();
    const accent = scope?.getAttribute("data-accent");
    const els = [...document.querySelectorAll("p,span,a,button,li,label,h1,h2,h3,h4,strong,small,div")]
      .filter((e) => (e.innerText || "").trim().includes(want) && e.children.length === 0)
      .map((e) => ({ text: (e.innerText || "").trim().slice(0, 24), inline: e.getAttribute("style"), color: getComputedStyle(e).color, cls: e.className.toString().slice(0, 60) }));
    return {
      scopeClass: scope?.className, accent,
      vars: { amber: gv(root, "--amber"), chart1: gv(root, "--chart-1"), chart3: gv(root, "--chart-3"), primary: gv(root, "--primary"), lime: gv(root, "--lime"), whiteRgb: gv(root, "--color-white-rgb"), foreground: gv(root, "--foreground") },
      matches: els.slice(0, 6),
    };
  }, { want });
  console.log("\n=== " + route);
  console.log(JSON.stringify(out, null, 2));
}
await browser.close(); server.close();
