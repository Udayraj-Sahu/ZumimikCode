import { chromium } from "@playwright/test";
import { readFileSync, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { join, extname } from "node:path";

const ROOT = "D:/Exam-Arena-Frontend/out";
const PORT = 3012;
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
const seed = [
  ["exam-arena-auth", { state: { user: { id: "1", name: "Test User", email: "t@x.com", phone: "" }, token: "jwt", refreshToken: null, isAuthenticated: true, isOnboarded: true }, version: 0 }],
  ["exam-arena-onboarding", { state: { isOnboarded: true, targetExam: "CAT", currentStep: 99 }, version: 0 }],
  ["exam-arena-walkthrough-v2", { state: { completed: true }, version: 0 }],
  ["exam-arena-theme", { state: { theme: "light", accent: "violet" }, version: 0 }],
];
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
await ctx.addInitScript(({ s }) => { for (const [k, v] of s) localStorage.setItem(k, JSON.stringify(v)); }, { s: seed });
const page = await ctx.newPage();
await page.goto(`http://localhost:${PORT}/dashboard`, { waitUntil: "domcontentloaded", timeout: 20000 });
await page.waitForTimeout(2000);
const out = await page.evaluate(() => {
  const scopes = [...document.querySelectorAll("[data-theme-scope]")].map((el) => ({ tag: el.tagName, cls: el.className.toString().slice(0, 80), accent: el.getAttribute("data-accent") }));
  const el = [...document.querySelectorAll("*")].find((e) => (e.textContent || "").trim() === "Pick your pace." || (e.innerText || "").trim().startsWith("Pick your"));
  let chain = [];
  let cur = el;
  while (cur && chain.length < 12) {
    const cs = getComputedStyle(cur);
    chain.push({ tag: cur.tagName, cls: cur.className.toString().slice(0, 70), bgc: cs.backgroundColor, bgImg: cs.backgroundImage.slice(0, 60), scope: cur.hasAttribute("data-theme-scope") });
    cur = cur.parentElement;
  }
  const ls = (() => { try { return JSON.parse(localStorage.getItem("exam-arena-theme") || "null"); } catch { return null; } })();
  return { scopes, chain, themeLS: ls, htmlCls: document.documentElement.className, found: !!el };
});
console.log(JSON.stringify(out, null, 2));
await browser.close(); server.close();
