import { chromium } from "playwright";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { join, extname } from "node:path";

const ROOT = "D:/Exam-Arena-Frontend/out";
const PORT = 3014;
const server = createServer(async (req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]);
  const nx = p.indexOf("/_next/");
  if (nx >= 0) p = p.slice(nx);
  const md = p.indexOf("/media/");
  if (md >= 0) p = p.slice(md);
  const map = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".webp": "image/webp", ".woff2": "font/woff2", ".jpg": "image/jpeg" };
  for (const c of [p, p + ".html", join(p, "index.html")]) {
    try {
      const buf = await readFile(join(ROOT, c));
      const ext = c.slice(c.lastIndexOf("."));
      res.writeHead(200, { "content-type": map[ext] || "text/html" });
      res.end(buf);
      return;
    } catch {}
  }
  res.writeHead(404); res.end("not found");
});
await new Promise((r) => server.listen(PORT, r));

const BASE = `http://127.0.0.1:${PORT}`;
const seed = [
  ["exam-arena-auth", { state: { user: { id: "1", name: "Test User", email: "t@x.com", phone: "" }, token: "jwt", refreshToken: null, isAuthenticated: true, isOnboarded: true }, version: 0 }],
  ["exam-arena-onboarding", { state: { isOnboarded: true, targetExam: "CAT", currentStep: 99 }, version: 0 }],
  ["exam-arena-walkthrough-v2", { state: { completed: true }, version: 0 }],
];
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
await ctx.addInitScript(({ s, theme }) => {
  for (const [k, v] of s) localStorage.setItem(k, JSON.stringify(v));
  localStorage.setItem("exam-arena-theme", JSON.stringify({ state: { theme, accent: "violet" }, version: 0 }));
}, { s: seed, theme: process.env.THEME || "light" });
const page = await ctx.newPage();

for (const route of ["/dashboard", "/settings"]) {
  await page.goto(`${BASE}${route}`, { waitUntil: "domcontentloaded", timeout: 20000 });
  await page.waitForTimeout(900);
  const out = await page.evaluate(() => {
    const pick = (el) => {
      if (!el) return null;
      const s = getComputedStyle(el);
      return { bg: s.backgroundColor, img: s.backgroundImage.slice(0, 70), border: s.borderTopColor, shadow: s.boxShadow === "none" ? "none" : s.boxShadow.slice(0, 80), color: s.color };
    };
    const cards = [...document.querySelectorAll("[data-carousel-card]")].map((el) => {
      const s = getComputedStyle(el);
      return { bg: s.backgroundColor, border: s.borderTopColor, cls: (el.className || "").match(/border[^ ]*/g)?.join(",") };
    });
    return {
      cards,
      carousel: pick(document.querySelector("[data-carousel-card]")),
      pill: pick(document.querySelector(".pill")),
      pillCount: document.querySelectorAll(".pill").length,
      glass: document.querySelectorAll('[style*="--glass-bg"]').length,
      scope: !!document.querySelector("[data-theme-scope]"),
      url: location.pathname,
      text: (document.body.innerText || "").replace(/\s+/g, " ").slice(0, 100),
    };
  });
  console.log(route, process.env.THEME || "light");
  console.log("  carousel:", JSON.stringify(out.carousel));
  console.log("  pill    :", JSON.stringify(out.pill), "count=" + out.pillCount);
  console.log("  diag    :", "glass=" + out.glass, "scope=" + out.scope, "url=" + out.url);
  if (out.cards) console.log("  cards   :", JSON.stringify(out.cards));
}

await browser.close();
server.close();
process.exit(0);
