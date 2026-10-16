import { chromium } from "playwright";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { join, extname } from "node:path";

const ROOT = "D:/Exam-Arena-Frontend/out";
const PORT = 3015;
const server = createServer(async (req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]);
  const nx = p.indexOf("/_next/"); if (nx >= 0) p = p.slice(nx);
  const md = p.indexOf("/media/"); if (md >= 0) p = p.slice(md);
  const map = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".webp": "image/webp", ".woff2": "font/woff2", ".jpg": "image/jpeg" };
  for (const c of [p, p + ".html", join(p, "index.html")]) {
    try { const buf = await readFile(join(ROOT, c)); res.writeHead(200, { "content-type": map[extname(c)] || "application/octet-stream" }); res.end(buf); return; } catch {}
  }
  res.writeHead(404); res.end("not found");
});
await new Promise((r) => server.listen(PORT, r));
const BASE = `http://127.0.0.1:${PORT}`;
const THEME = process.env.THEME || "light";

const seed = [
  ["exam-arena-auth", { state: { user: { id: "1", name: "Test User", email: "t@x.com", phone: "" }, token: "jwt", refreshToken: null, isAuthenticated: true, isOnboarded: true }, version: 0 }],
  ["exam-arena-onboarding", { state: { isOnboarded: true, targetExam: "CAT", currentStep: 99, temporalWindow: "this_year", planHookSeen: true, arenaHookSeen: false, pitchHookSeen: true, storyHookSeen: true, hookSeen: true, activePreps: ["cat"], examDates: {} }, version: 0 }],
  ["exam-arena-walkthrough-v2", { state: { completed: true }, version: 0 }],
];

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 420, height: 860 } });
await ctx.addInitScript(({ s, theme }) => {
  for (const [k, v] of s) localStorage.setItem(k, JSON.stringify(v));
  localStorage.setItem("exam-arena-theme", JSON.stringify({ state: { theme, accent: "lime" }, version: 0 }));
}, { s: seed, theme: THEME });
const page = await ctx.newPage();
await page.goto(`${BASE}/dashboard`, { waitUntil: "domcontentloaded", timeout: 20000 });
try { await page.waitForSelector('[role="radiogroup"][aria-label="Clearance tiers"]', { timeout: 12000 }); } catch { console.log("no intro"); }
await page.waitForTimeout(700);
const info = await page.evaluate(() => {
  const rg = document.querySelector('[role="radiogroup"][aria-label="Clearance tiers"]');
  const chain = [];
  let n = rg;
  while (n && chain.length < 8) {
    chain.push({ tag: n.tagName, cls: (n.className || "").toString().slice(0, 90), light: n.classList ? n.classList.contains("light") : null, dataScope: n.hasAttribute ? n.hasAttribute("data-theme-scope") : false });
    n = n.parentElement;
  }
  const h3 = rg.querySelector("h3");
  const desc = rg.querySelector("p");
  const rootCS = getComputedStyle(document.documentElement);
  const scopeEl = document.querySelector("[data-theme-scope].light") || document.querySelector("[data-theme-scope]");
  const scopeCS = scopeEl ? getComputedStyle(scopeEl) : null;
  return {
    themeAttr: document.documentElement.getAttribute("data-theme") || document.documentElement.className,
    h3color: h3 ? getComputedStyle(h3).color : null,
    h3cls: h3 ? h3.className : null,
    pcolor: desc ? getComputedStyle(desc).color : null,
    pcls: desc ? desc.className : null,
    rootFg: rootCS.getPropertyValue("--foreground"),
    rootWhite: rootCS.getPropertyValue("--color-white-rgb"),
    scopeLight: scopeEl ? scopeEl.classList.contains("light") : null,
    scopeFg: scopeCS ? scopeCS.getPropertyValue("--foreground") : null,
    scopeWhite: scopeCS ? scopeCS.getPropertyValue("--color-white-rgb") : null,
    chain,
  };
});
console.log(JSON.stringify(info, null, 2));
await browser.close();
server.close();
