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
];

const CANDS = {
  A_current: null,
  B: { bg: "#F4F5F1", glass: "#FFFFFF", border: "rgba(0,0,0,0.10)", shadow: "0 1px 2px rgba(16,24,40,0.04), 0 2px 8px rgba(16,24,40,0.05)" },
  C: { bg: "#F2F3EE", glass: "#FFFFFF", border: "rgba(0,0,0,0.12)", shadow: "0 1px 3px rgba(16,24,40,0.06), 0 4px 16px rgba(16,24,40,0.07)" },
  D: { bg: "#F5F6F2", glass: "rgba(255,255,255,0.75)", border: "rgba(0,0,0,0.10)", shadow: "0 1px 2px rgba(16,24,40,0.05), 0 2px 10px rgba(16,24,40,0.06)" },
};

const lum = ([r, g, b]) => { const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
const ratio = (a, b) => { const x = lum(a), y = lum(b); const [hi, lo] = x > y ? [x, y] : [y, x]; return +(((hi + 0.05) / (lo + 0.05)).toFixed(3)); };
const parse = (c) => { const m = (c || "").match(/[\d.]+/g); return m ? m.map(Number) : [0, 0, 0, 0]; };
const composite = (fg, page) => { const [r, g, b, a = 1] = fg; return [Math.round(r * a + page[0] * (1 - a)), Math.round(g * a + page[1] * (1 - a)), Math.round(b * a + page[2] * (1 - a))]; };

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
await ctx.addInitScript(({ s }) => { for (const [k, v] of s) localStorage.setItem(k, JSON.stringify(v)); localStorage.setItem("exam-arena-theme", JSON.stringify({ state: { theme: "light", accent: "violet" }, version: 0 })); }, { s: seed });
const page = await ctx.newPage();

for (const route of ["/dashboard", "/learn", "/settings", "/play", "/settings/achievements"]) {
  await page.goto(`${BASE}${route}`, { waitUntil: "domcontentloaded", timeout: 20000 });
  await page.waitForTimeout(700);
  console.log("\n### " + route);
  for (const [name, c] of Object.entries(CANDS)) {
    if (c) {
      await page.addStyleTag({ content: `.light{--background:${c.bg} !important;--surface:${c.bg} !important;--glass-bg:${c.glass} !important;--glass-border:${c.border} !important;} .light [style*="--glass-bg"]{box-shadow:${c.shadow} !important;}` });
    }
    const m = await page.evaluate(() => {
      const scope = document.querySelector("[data-theme-scope]");
      const cards = [...document.querySelectorAll('[style*="--glass-bg"]')];
      const bgSet = new Set(cards.map((e) => getComputedStyle(e).backgroundColor));
      const el = cards[0];
      return {
        n: cards.length,
        pageBg: scope ? getComputedStyle(scope).backgroundColor : null,
        cardBgs: [...bgSet].slice(0, 6),
        border: el ? getComputedStyle(el).borderTopColor : null,
        shadow: el ? (getComputedStyle(el).boxShadow === "none" ? "none" : "yes") : null,
      };
    });
    const pageRGB = parse(m.pageBg || "rgb(250,250,250)");
    const sep = (m.cardBgs || []).map((c) => { const comp = composite(parse(c), pageRGB); return { card: c, vsPage: ratio(comp, pageRGB) }; });
    console.log(name.padEnd(9), "page=" + m.pageBg, "cards=" + m.n, "border=" + m.border, "shadow=" + m.shadow, JSON.stringify(sep));
  }
}

await browser.close(); server.close();
