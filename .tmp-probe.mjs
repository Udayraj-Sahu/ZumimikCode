import { chromium } from "@playwright/test";
import { readFile, statSync, existsSync } from "node:fs";
import { createServer } from "node:http";
import { join, extname, normalize } from "node:path";
const ROOT = "D:/Exam-Arena-Frontend/out";
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".ico": "image/x-icon", ".woff2": "font/woff2", ".txt": "text/plain", ".webp": "image/webp" };
const server = createServer((req, res) => {
  try {
    const clean = normalize(decodeURIComponent((req.url || "/").split("?")[0])).replace(/\\/g, "/");
    const cands = [join(ROOT, clean)];
    if (clean.endsWith("/")) cands.push(join(ROOT, clean + "index.html"));
    cands.push(join(ROOT, clean + ".html"), join(ROOT, clean, "index.html"));
    for (const c of cands) if (existsSync(c) && statSync(c).isFile()) { readFile(c, (e, d) => { if (e) { res.writeHead(500); res.end(); } else { res.writeHead(200, { "content-type": TYPES[extname(c)] || "application/octet-stream", "cache-control": "no-store" }); res.end(d); } }); return; }
    res.writeHead(404); res.end("404");
  } catch { try { res.writeHead(500); res.end(); } catch {} }
});
server.on("clientError", (e, s) => { try { s.destroy(); } catch {} });
await new Promise((r) => server.listen(3008, r));
console.log("probe server up");

const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
ctx.setDefaultTimeout(15000);
const AUTH = { state: { user: { id: "1", name: "QA Operative", email: "q@a.com", role: "Champion" }, token: "t", isAuthenticated: true, isOnboarded: true }, version: 0 };
const ONB = { state: { isOnboarded: true, planHookSeen: true, arenaHookSeen: true, pitchHookSeen: true, planId: "cat-fast-track", targetExam: "cat" }, version: 1 };
const WK = { state: { completed: true } };
const TH = { state: { theme: "dark", accent: "violet" }, version: 0 };
await ctx.addInitScript(({ s }) => { for (const [k, v] of s) localStorage.setItem(k, JSON.stringify(v)); }, { s: [["exam-arena-auth", AUTH], ["exam-arena-onboarding", ONB], ["exam-arena-walkthrough", WK], ["exam-arena-walkthrough-v2", WK], ["exam-arena-theme", TH]] });
const p = await ctx.newPage();

async function probe(route, fn) {
  await p.goto("http://localhost:3008" + route, { waitUntil: "domcontentloaded" });
  await p.waitForTimeout(1500);
  const out = await p.evaluate(fn);
  console.log("\n=== " + route);
  console.log(JSON.stringify(out, null, 1));
}

await probe("/dashboard", () => {
  const btn = [...document.querySelectorAll("button")].find((b) => /CONTINUE SETUP/i.test(b.innerText || ""));
  const cs = btn ? getComputedStyle(btn) : null;
  const inter = [...document.querySelectorAll("a,button,[role=button],input,select")].filter((e) => { const r = e.getBoundingClientRect(); const s = getComputedStyle(e); return r.width > 0 && r.height > 0 && s.display !== "none" && s.visibility !== "hidden"; });
  const small = inter.filter((e) => { const r = e.getBoundingClientRect(); return r.width < 44 || r.height < 44; }).map((e) => { const r = e.getBoundingClientRect(); return { tag: e.tagName.toLowerCase(), cls: (e.className || "").toString().slice(0, 70), name: (e.getAttribute("aria-label") || e.innerText || "").trim().slice(0, 25), w: Math.round(r.width), h: Math.round(r.height) }; });
  const unnamed = inter.filter((e) => { const t = (e.innerText || "").trim(); const al = e.getAttribute("aria-label"); return !t && !al; }).map((e) => { const r = e.getBoundingClientRect(); return { tag: e.tagName.toLowerCase(), cls: (e.className || "").toString().slice(0, 90), html: e.outerHTML.slice(0, 140), w: Math.round(r.width), h: Math.round(r.height) }; });
  return {
    continueBtn: btn ? { cls: (btn.className || "").toString().slice(0, 120), color: cs.color, bg: cs.backgroundColor, bgImg: cs.backgroundImage.slice(0, 40) } : null,
    smallCount: small.length,
    small: small.filter((s) => !/skip/i.test(s.name)).slice(0, 12),
    unnamedCount: unnamed.length,
    unnamed,
  };
});

await b.close();
server.close();
process.exit(0);

