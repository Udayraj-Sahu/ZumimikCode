import { chromium } from "playwright";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { join, extname } from "node:path";

const ROOT = "D:/Exam-Arena-Frontend/out";
const PORT = 3019;
const server = createServer(async (req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]);
  const nx = p.indexOf("/_next/"); if (nx >= 0) p = p.slice(nx);
  const map = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".webp": "image/webp", ".woff2": "font/woff2" };
  for (const c of [p, p + ".html", join(p, "index.html")]) {
    try { const buf = await readFile(join(ROOT, c)); res.writeHead(200, { "content-type": map[extname(c)] || "application/octet-stream" }); res.end(buf); return; } catch {}
  }
  res.writeHead(404); res.end("nf");
});
await new Promise((r) => server.listen(PORT, r));
const BASE = `http://127.0.0.1:${PORT}`;

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 420, height: 860 } });
await ctx.addInitScript(() => {
  const seed = [
    ["exam-arena-auth", { state: { user: { id: "1", name: "Test User", email: "t@x.com", phone: "" }, token: "jwt", refreshToken: null, isAuthenticated: true, isOnboarded: true }, version: 0 }],
    ["exam-arena-onboarding", { state: { isOnboarded: true, targetExam: "CAT", temporalWindow: "this_year", planHookSeen: true, arenaHookSeen: true, pitchHookSeen: true, storyHookSeen: true, hookSeen: true, activePreps: ["cat", "gmat"], examDates: {}, firstName: "", currentStep: 0 }, version: 0 }],
    ["exam-arena-walkthrough-v2", { state: { completed: true }, version: 0 }],
  ];
  for (const [k, v] of seed) localStorage.setItem(k, JSON.stringify(v));
  localStorage.setItem("exam-arena-theme", JSON.stringify({ state: { theme: "light", accent: "lime" }, version: 0 }));
});
const page = await ctx.newPage();
page.setDefaultTimeout(8000);
await page.goto(`${BASE}/learn`, { waitUntil: "domcontentloaded", timeout: 20000 });
await page.waitForTimeout(1500);

const btns = await page.evaluate(() => [...document.querySelectorAll("button")].map((b) => ({ t: (b.textContent || "").trim().slice(0, 30), vis: b.offsetParent !== null })).filter((b) => b.t));
console.log("BUTTONS:", JSON.stringify(btns));

const mockTab = page.locator('button:has-text("Mock")').first();
if (await mockTab.count()) { await mockTab.click({ timeout: 4000 }).catch((e) => console.log("mock err", String(e).split("\n")[0])); }
await page.waitForTimeout(1000);

const gmat = page.locator('button:has-text("GMAT")');
console.log("GMAT count:", await gmat.count());
for (let i = 0; i < await gmat.count(); i++) {
  console.log(`  GMAT[${i}] vis=`, await gmat.nth(i).isVisible().catch(() => "err"), "text=", JSON.stringify((await gmat.nth(i).textContent().catch(() => ""))?.trim()));
}
await gmat.first().click({ timeout: 4000 }).catch((e) => console.log("click err", String(e).split("\n")[0]));
await page.waitForTimeout(1200);

const dump = await page.evaluate(() => {
  const scopes = [...document.querySelectorAll("[data-theme-scope]")].map((d) => ({ cls: (d.className || "").toString().slice(0, 90), role: d.getAttribute("role"), rect: (() => { const r = d.getBoundingClientRect(); return [Math.round(r.width), Math.round(r.height)]; })() }));
  const paywall = document.querySelector('[class*="z-[70]"]');
  const store = JSON.parse(localStorage.getItem("exam-arena-onboarding") || "{}").state;
  const tabs = [...document.querySelectorAll("button")].filter((b) => /(CAT|GMAT|GRE)/.test(b.textContent || "")).map((b) => ({ txt: (b.textContent || "").trim().slice(0, 24), color: getComputedStyle(b).color, svgs: b.querySelectorAll("svg").length, html: b.outerHTML.replace(/\s+/g, " ").slice(0, 200) }));
  return { scopes, hasPaywall: !!paywall, paywallCls: paywall ? paywall.className : null, activeLearnDomain: store?.activeLearnDomain, targetExam: store?.targetExam, activePreps: store?.activePreps, tabs, heads: [...document.querySelectorAll("h1,h2,h3")].map((h) => (h.textContent || "").trim().slice(0, 40)).slice(0, 10) };
});
console.log("AFTER CLICK:", JSON.stringify(dump, null, 2));

await browser.close();
server.close();
