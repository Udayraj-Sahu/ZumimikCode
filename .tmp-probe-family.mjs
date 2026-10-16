import { chromium } from "playwright";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { join, extname } from "node:path";

const ROOT = "D:/Exam-Arena-Frontend/out";
const PORT = 3018;
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
  ["exam-arena-onboarding", { state: { isOnboarded: true, targetExam: "CAT", temporalWindow: "this_year", planHookSeen: true, arenaHookSeen: true, pitchHookSeen: true, storyHookSeen: true, hookSeen: true, activePreps: ["cat"], examDates: {}, firstName: "", currentStep: 0 }, version: 0 }],
  ["exam-arena-walkthrough-v2", { state: { completed: true }, version: 0 }],
];

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 420, height: 860 } });
await ctx.addInitScript(({ s, theme }) => {
  for (const [k, v] of s) localStorage.setItem(k, JSON.stringify(v));
  localStorage.setItem("exam-arena-theme", JSON.stringify({ state: { theme, accent: "lime" }, version: 0 }));
}, { s: seed, theme: THEME });
const page = await ctx.newPage();
page.setDefaultTimeout(8000);
const clickText = async (txt) => {
  const el = page.locator(`button:has-text("${txt}")`).first();
  if (await el.isVisible().catch(() => false)) { await el.click({ timeout: 4000 }).catch(() => {}); return true; }
  return false;
};
const clickLastEnabled = async () => {
  const btns = page.locator('[data-theme-scope][role="dialog"] button:not([disabled])');
  const n = await btns.count();
  for (let i = n - 1; i >= 0; i--) { const b = btns.nth(i); if (await b.isVisible().catch(() => false)) { await b.click({ timeout: 4000 }).catch(() => {}); return true; } }
  return false;
};
await page.goto(`${BASE}/dashboard`, { waitUntil: "domcontentloaded", timeout: 20000 });
await page.waitForTimeout(900);
const actionable = async (sel) => page.locator(sel).first().click({ trial: true, timeout: 1500 }).then(() => true).catch(() => false);
for (let i = 0; i < 8; i++) {
  if (await actionable("[data-tour-continue-setup]")) break;
  const skip = page.locator('button:has-text("Skip for now")').first();
  if (await skip.isVisible().catch(() => false)) { await skip.click({ timeout: 4000 }).catch(() => {}); await page.waitForTimeout(600); continue; }
  await page.waitForTimeout(300);
}
await page.locator("[data-tour-continue-setup]").first().click({ timeout: 4000 }).catch(() => {});
await page.waitForTimeout(900);
const ni = page.locator('input[placeholder="Type your name..."]');
if (await ni.count()) { await ni.fill("Test"); await page.waitForTimeout(150); }
await clickLastEnabled();
await page.waitForTimeout(800);
await clickText("Student");
await clickLastEnabled();
await page.waitForTimeout(800);
await clickText("Master speed math");
await page.waitForTimeout(500);
await clickText("Teaching My Kid");
await page.waitForTimeout(1800);

const out = await page.evaluate(() => {
  const needle = "AGES 6";
  const el = [...document.querySelectorAll("h1,h2,h3,p,span,div")].find((e) => (e.textContent || "").includes(needle) && ![...e.children].some((c) => (c.textContent || "").includes(needle)));
  const gradLayer = (img) => {
    const stops = [];
    const re = /rgba?\([^)]+\)/g;
    let m;
    while ((m = re.exec(img))) {
      const v = m[0].match(/[\d.]+/g).map(Number);
      stops.push(v.slice(0, 3).concat(v.length > 3 ? v[3] : 1));
    }
    if (/\btransparent\b/.test(img)) stops.push([0, 0, 0, 0]);
    if (!stops.length) return null;
    const wa = stops.reduce((s, c) => s + c[3], 0) || 1;
    const ch = [0, 1, 2].map((i) => Math.round(stops.reduce((s, c) => s + c[i] * c[3], 0) / wa));
    return ch.concat(wa / stops.length);
  };
  const stack = [];
  const entries = [];
  let n = el;
  while (n && n !== document.documentElement) {
    const cs = getComputedStyle(n);
    const bg = cs.backgroundColor;
    let topA = 0;
    const entry = { tag: n.tagName, cls: (n.className || "").toString().slice(0, 60), bg, bgi: cs.backgroundImage === "none" ? "" : cs.backgroundImage.slice(0, 80), pushed: null };
    if (bg && bg !== "rgba(0, 0, 0, 0)" && !/rgba\(.*, 0\)$/.test(bg)) {
      const m2 = bg.match(/[\d.]+/g).map(Number);
      const layer = m2.slice(0, 3).concat(m2.length > 3 ? m2[3] : 1);
      stack.push(layer); topA = layer[3]; entry.pushed = layer;
    }
    if (cs.backgroundImage && cs.backgroundImage !== "none") {
      const gl = gradLayer(cs.backgroundImage);
      if (gl) { stack.push(gl); topA = gl[3]; entry.pushedGrad = gl; }
    }
    entry.topA = topA;
    entries.push(entry);
    if (topA >= 0.999) break;
    n = n.parentElement;
  }
  let o = [255, 255, 255];
  for (let i = stack.length - 1; i >= 0; i--) {
    const [r, g, b, a] = stack[i];
    o = [Math.round(r * a + o[0] * (1 - a)), Math.round(g * a + o[1] * (1 - a)), Math.round(b * a + o[2] * (1 - a))];
  }
  return { color: getComputedStyle(el).color, result: `rgb(${o.join(", ")})`, stack, entries };
});
console.log(JSON.stringify(out, null, 1));
await browser.close();
server.close();
