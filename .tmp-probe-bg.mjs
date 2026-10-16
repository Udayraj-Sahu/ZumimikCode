import { chromium } from "playwright";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { join, extname } from "node:path";

const ROOT = "D:/Exam-Arena-Frontend/out";
const PORT = 3016;
const server = createServer(async (req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]);
  const nx = p.indexOf("/_next/"); if (nx >= 0) p = p.slice(nx);
  const md = p.indexOf("/media/"); if (md >= 0) p = p.slice(md);
  const map = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".webp": "image/webp", ".woff2": "font/woff2", ".jpg": "image/jpeg", ".mp4": "video/mp4" };
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
const out = await page.evaluate(() => {
  const h3 = [...document.querySelectorAll("h3")].find((e) => /Initiate/.test(e.textContent));
  if (!h3) return { err: "no h3" };
  const chain = [];
  let n = h3;
  while (n) {
    const cs = getComputedStyle(n);
    chain.push({
      tag: n.tagName,
      cls: (n.className || "").toString().slice(0, 70),
      bg: cs.backgroundColor,
      bgi: cs.backgroundImage === "none" ? "" : cs.backgroundImage.slice(0, 90),
      inline: (n.getAttribute("style") || "").slice(0, 120),
      light: n.classList ? n.classList.contains("light") : false,
    });
    n = n.parentElement;
  }
  return { color: getComputedStyle(h3).color, chain };
});
console.log(JSON.stringify(out, null, 1));
await browser.close();
server.close();
