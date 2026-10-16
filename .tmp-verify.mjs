import { chromium } from "playwright";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { join, extname } from "node:path";

const ROOT = "D:/Exam-Arena-Frontend/out";
const PORT = 3013;
const server = createServer(async (req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]);
  const nx = p.indexOf("/_next/");
  if (nx >= 0) p = p.slice(nx);
  const md = p.indexOf("/media/");
  if (md >= 0) p = p.slice(md);
  const map = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".webp": "image/webp", ".woff2": "font/woff2", ".jpg": "image/jpeg" };
  const candidates = [p, p + ".html", join(p, "index.html")];
  for (const c of candidates) {
    try {
      const buf = await readFile(join(ROOT, c));
      res.writeHead(200, { "content-type": map[extname(c)] || "application/octet-stream" });
      res.end(buf);
      return;
    } catch {}
  }
  res.writeHead(404); res.end("not found");
});
await new Promise((r) => server.listen(PORT, r));

const BASE = process.env.BASE || `http://127.0.0.1:${PORT}`;
const routes = ["/dashboard", "/learn", "/settings", "/play", "/settings/achievements"];

const lum = ([r, g, b]) => { const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
const ratio = (a, b) => { const x = lum(a), y = lum(b); const [hi, lo] = x > y ? [x, y] : [y, x]; return +(((hi + 0.05) / (lo + 0.05)).toFixed(3)); };
const parse = (c) => { const m = (c || "").match(/[\d.]+/g); return m ? m.map(Number) : [0, 0, 0, 0]; };
const composite = (fg, page) => { const [r, g, b, a = 1] = fg; return [Math.round(r * a + page[0] * (1 - a)), Math.round(g * a + page[1] * (1 - a)), Math.round(b * a + page[2] * (1 - a))]; };

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

for (const route of routes) {
  await page.goto(`${BASE}${route}`, { waitUntil: "domcontentloaded", timeout: 20000 });
  await page.waitForTimeout(800);
  const m = await page.evaluate(() => {
    const scope = document.querySelector("[data-theme-scope]");
    const cards = [...document.querySelectorAll('[style*="--glass-bg"]')];
    const bgSet = new Set(cards.map((e) => getComputedStyle(e).backgroundColor));
    const el = cards[0];
    return {
      light: scope ? scope.classList.contains("light") : null,
      n: cards.length,
      pageBg: scope ? getComputedStyle(scope).backgroundColor : null,
      cardBgs: [...bgSet].slice(0, 6),
      border: el ? getComputedStyle(el).borderTopColor : null,
      shadow: el ? (getComputedStyle(el).boxShadow === "none" ? "none" : "yes") : null,
      tokenGlass: scope ? getComputedStyle(scope).getPropertyValue("--glass-bg").trim() : null,
      tokenBg: scope ? getComputedStyle(scope).getPropertyValue("--background").trim() : null,
    };
  });
  const pageRGB = parse(m.pageBg || "rgb(244,245,241)");
  const sep = (m.cardBgs || []).map((c) => { const comp = composite(parse(c), pageRGB); return { card: c, vsPage: ratio(comp, pageRGB) }; });
  console.log(`\n### ${route}  light=${m.light}  n=${m.n}`);
  console.log(`  tokenBg=${m.tokenBg} tokenGlass=${m.tokenGlass} page=${m.pageBg} border=${m.border} shadow=${m.shadow}`);
  console.log(`  ${JSON.stringify(sep)}`);
}

await browser.close();
