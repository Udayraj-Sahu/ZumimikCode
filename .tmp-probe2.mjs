import { chromium } from "@playwright/test";
import { createServer } from "node:http";
import { readFileSync, existsSync, statSync } from "node:fs";
import { join, extname } from "node:path";
const ROOT = "D:/Exam-Arena-Frontend/out";
const T = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".ico": "image/x-icon", ".woff2": "font/woff2", ".txt": "text/plain", ".webp": "image/webp" };
const s = createServer((q, r) => {
  const u = decodeURIComponent(q.url.split("?")[0]);
  for (const f of [join(ROOT, u), join(ROOT, u + ".html"), join(ROOT, u, "index.html")]) {
    if (existsSync(f) && statSync(f).isFile()) { r.writeHead(200, { "content-type": T[extname(f)] || "application/octet-stream" }); return r.end(readFileSync(f)); }
  }
  r.writeHead(404); r.end("404");
});
await new Promise((res) => s.listen(3011, res));
const b = await chromium.launch();
const c = await b.newContext({ viewport: { width: 1440, height: 900 } });
await c.addInitScript(() => {
  localStorage.setItem("exam-arena-auth", JSON.stringify({ state: { user: { id: "1", name: "T" }, token: "j", isAuthenticated: true }, version: 0 }));
  localStorage.setItem("exam-arena-onboarding", JSON.stringify({ state: { isOnboarded: true, targetExam: "CAT" }, version: 0 }));
  localStorage.setItem("exam-arena-theme", JSON.stringify({ state: { theme: "light", accent: "violet" }, version: 0 }));
});
const route = process.argv[2] || "/dashboard/analytics";
const page = await c.newPage();
page.on("console", (m) => console.log("[console." + m.type() + "]", m.text().slice(0, 160)));
page.on("pageerror", (e) => console.log("[pageerror]", String(e).slice(0, 200)));
page.on("requestfailed", (r) => console.log("[reqfail]", r.url().slice(-70), r.failure()?.errorText));
await page.goto(`http://localhost:3011${route}`, { waitUntil: "load", timeout: 20000 }).catch((e) => console.log("[nav]", e.message));
await page.waitForTimeout(2500);
const info = await page.evaluate(() => ({ len: document.body.innerText.length, html: document.documentElement.outerHTML.length, scripts: document.querySelectorAll("script[src]").length, scope: !!document.querySelector("[data-theme-scope]") }));
console.log(route, JSON.stringify(info));
await b.close(); s.close();
