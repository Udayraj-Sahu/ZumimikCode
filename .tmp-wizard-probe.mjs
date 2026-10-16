import { chromium } from "playwright";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { join, extname } from "node:path";

const ROOT = "D:/Exam-Arena-Frontend/out";
const PORT = 3017;
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
  ["exam-arena-onboarding", { state: { isOnboarded: true, targetExam: "CAT", currentStep: 0, temporalWindow: "this_year", planHookSeen: true, arenaHookSeen: true, pitchHookSeen: true, storyHookSeen: true, hookSeen: true, activePreps: ["cat"], examDates: {}, firstName: "" }, version: 0 }],
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
await page.waitForTimeout(1200);

const dump = async (tag) => {
  const info = await page.evaluate(() => {
    const vis = (el) => {
      const r = el.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) return false;
      const cs = getComputedStyle(el);
      return cs.visibility !== "hidden" && cs.display !== "none" && +cs.opacity > 0.05;
    };
    const scope = [...document.querySelectorAll("[data-theme-scope]")].filter(vis).pop();
    const root = scope || document.body;
    const btns = [...root.querySelectorAll("button")].filter(vis).map((b) => ({
      t: (b.textContent || "").trim().replace(/\s+/g, " ").slice(0, 50),
      aria: b.getAttribute("aria-label") || "",
      dis: b.disabled,
    }));
    const inputs = [...root.querySelectorAll("input,select,textarea")].filter(vis).map((i) => ({
      type: i.type, ph: i.placeholder || "", id: i.id, val: i.value,
    }));
    const heads = [...root.querySelectorAll("h1,h2,h3")].filter(vis).map((h) => (h.textContent || "").trim().replace(/\s+/g, " ").slice(0, 70));
    const labels = [...root.querySelectorAll("label")].filter(vis).map((l) => (l.textContent || "").trim().replace(/\s+/g, " ").slice(0, 40));
    return { heads, btns: btns.slice(0, 25), inputs, labels: labels.slice(0, 25) };
  });
  console.log(`\n---- ${tag} ----`);
  console.log(JSON.stringify(info, null, 1));
};

await dump("initial dashboard");
const visibleSkip = async () =>
  page.locator('button:has-text("Skip for now")').first();
const actionable = async (sel) =>
  page.locator(sel).first().click({ trial: true, timeout: 1500 }).then(() => true).catch(() => false);
const settle = async (expectSel) => {
  for (let i = 0; i < 8; i++) {
    if (await actionable(expectSel)) return true;
    const skip = page.locator('button:has-text("Skip for now")').first();
    if (await skip.isVisible().catch(() => false)) {
      await skip.click({ timeout: 4000 }).catch(() => {});
      await page.waitForTimeout(600);
      continue;
    }
    await page.waitForTimeout(300);
  }
  return actionable(expectSel);
};
await settle('[data-tour-continue-setup]');
const cont = page.locator('[data-tour-continue-setup]');
if (await cont.count()) { await cont.first().click(); await page.waitForTimeout(900); }
await dump("after continue-setup click");

const clickText = async (txt) => {
  const el = page.locator(`button:has-text("${txt}")`).first();
  if (await el.isVisible().catch(() => false)) { await el.click({ timeout: 4000 }).catch(() => {}); return true; }
  return false;
};
const clickLastEnabled = async () => {
  const btns = page.locator('[data-theme-scope][role="dialog"] button:not([disabled])');
  const n = await btns.count();
  for (let i = n - 1; i >= 0; i--) {
    const b = btns.nth(i);
    if (await b.isVisible().catch(() => false)) { await b.click({ timeout: 4000 }).catch(() => {}); return { i, n }; }
  }
  return { i: -1, n };
};

const nameInput = page.locator('input[placeholder="Type your name..."]');
if (await nameInput.count()) { await nameInput.fill("Test"); await page.waitForTimeout(200); }
console.log("submit name:", JSON.stringify(await clickLastEnabled()));
await page.waitForTimeout(900);
await dump("step2 (persona?)");

if (await clickText("Student")) { await page.waitForTimeout(400); }
console.log("submit persona:", JSON.stringify(await clickLastEnabled()));
await page.waitForTimeout(900);
await dump("step3 (goal?)");

if (await clickText("Prepare for CAT")) { await page.waitForTimeout(700); }
await dump("step4 (after goal click)");

if (await clickText("Taking an exam this year")) { console.log("clicked temporal"); }
await page.waitForTimeout(1500);
await dump("after temporal click (FeatureIntro?)");

await browser.close();
server.close();
