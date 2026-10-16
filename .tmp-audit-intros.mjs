import { chromium } from "playwright";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { join, extname } from "node:path";

const ROOT = "D:/Exam-Arena-Frontend/out";
const PORT = 3014;
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
const ONLY = process.env.ONLY || "";

const BASE_ONBOARDING = {
  isOnboarded: true, targetExam: "CAT", temporalWindow: "this_year",
  planHookSeen: true, arenaHookSeen: true, pitchHookSeen: true, storyHookSeen: true,
  hookSeen: true, activePreps: ["cat"], examDates: {}, firstName: "", currentStep: 0,
};

const TARGETS = [
  { label: "arena", onboarding: { arenaHookSeen: false, planHookSeen: true, temporalWindow: "this_year" }, wait: '[aria-labelledby="arena-hook-title"]' },
  { label: "plan", onboarding: { planHookSeen: false }, wait: '[aria-labelledby="plan-hook-title"]' },
  { label: "seat", onboarding: { planHookSeen: false, targetExam: "vedic-math" }, wait: '[role="radiogroup"][aria-label="Primary seat"]' },
  { label: "pitch", onboarding: { pitchHookSeen: false, temporalWindow: "whenever" }, wait: '[aria-labelledby="pitch-hook-title"]' },
  { label: "feature", drive: "exam", wait: '[aria-labelledby="feature-hook-title"]', skipStrays: true },
  { label: "story", drive: "story", wait: 'button:has-text("Start configuring")', skipStrays: true, presence: true },
  { label: "family", drive: "family", wait: '[aria-labelledby="family-hook-title"]', skipStrays: true },
  { label: "family-hub", drive: "hub", wait: '[aria-labelledby="family-hub-hook-title"]', skipStrays: true },
  { label: "paywall", url: "/learn", onboarding: { activePreps: ["cat", "gmat"] }, wait: '[data-theme-scope][class*="z-\\[70\\]"]', scan: '[data-theme-scope][class*="z-\\[70\\]"]', pre: "paywall", skipStrays: true },
];

const browser = await chromium.launch();

const lum = ([r, g, b]) => { const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
const ratio = (a, b) => { const x = lum(a), y = lum(b); const [hi, lo] = x > y ? [x, y] : [y, x]; return +(((hi + 0.05) / (lo + 0.05)).toFixed(2)); };
const parse = (c) => { const m = (c || "").match(/[\d.]+/g); return m ? m.map(Number) : [0, 0, 0, 0]; };
const comp = (fg, page) => { const [r, g, b, a = 1] = fg; return [Math.round(r * a + page[0] * (1 - a)), Math.round(g * a + page[1] * (1 - a)), Math.round(b * a + page[2] * (1 - a))]; };

const evaluateAudit = (scanSel) => {
  const alphaOf = (c) => {
    const m = (c || "").match(/[\d.]+/g);
    if (!m) return 1;
    return m.length > 3 ? Number(m[3]) : 1;
  };
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
  const bgOf = (el) => {
    const stack = [];
    let n = el;
    while (n && n !== document.documentElement) {
      const cs = getComputedStyle(n);
      const bg = cs.backgroundColor;
      let topA = 0;
      if (bg && bg !== "rgba(0, 0, 0, 0)" && !/rgba\(.*, 0\)$/.test(bg)) {
        const m = bg.match(/[\d.]+/g).map(Number);
        const layer = m.slice(0, 3).concat(m.length > 3 ? m[3] : 1);
        stack.push([layer, n.tagName + "." + (n.className || "").toString().slice(0, 110)]);
        topA = layer[3];
      }
      if (cs.backgroundImage && cs.backgroundImage !== "none") {
        const gl = gradLayer(cs.backgroundImage);
        if (gl) { stack.push([gl, "grad:" + n.tagName + "." + (n.className || "").toString().slice(0, 100)]); topA = gl[3]; }
      }
      if (topA >= 0.999) break;
      n = n.parentElement;
    }
    let out = [255, 255, 255];
    for (let i = stack.length - 1; i >= 0; i--) {
      const [r, g, b, a] = stack[i][0];
      out = [Math.round(r * a + out[0] * (1 - a)), Math.round(g * a + out[1] * (1 - a)), Math.round(b * a + out[2] * (1 - a))];
    }
    return { c: `rgb(${out[0]}, ${out[1]}, ${out[2]})`, dbg: stack.map(([l, c]) => `${c}:[${l.join(",")}]`).join(" > ") };
  };
  const vis = (el) => {
    const cs = getComputedStyle(el);
    if (cs.visibility === "hidden" || cs.display === "none" || parseFloat(cs.opacity) < 0.05) return false;
    const r = el.getBoundingClientRect();
    return r.width >= 4 && r.height >= 4;
  };
  const out = [];
  const roots = [...document.querySelectorAll(scanSel)].filter(vis);
  for (const root of roots) {
    const walk = root.querySelectorAll("h1,h2,h3,p,span,div,button,label,li,i,strong,b");
    for (const el of walk) {
      if (!vis(el)) continue;
      const txt = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent.trim()).join(" ").trim();
      if (!txt || txt.length > 90) continue;
      const cs = getComputedStyle(el);
      if (cs.webkitBackgroundClip === "text" || cs.backgroundClip === "text") continue;
      if (alphaOf(cs.color) === 0) continue;
      const b = bgOf(el);
      out.push({ txt: txt.slice(0, 60), color: cs.color, bg: b.c, dbg: b.dbg, cls: (el.className || "").toString().slice(0, 110) });
    }
  }
  return out;
};

const run = async (t) => {
  const ctx = await browser.newContext({ viewport: { width: 420, height: 860 } });
  const seed = [
    ["exam-arena-auth", { state: { user: { id: "1", name: "Test User", email: "t@x.com", phone: "" }, token: "jwt", refreshToken: null, isAuthenticated: true, isOnboarded: true }, version: 0 }],
    ["exam-arena-onboarding", { state: { ...BASE_ONBOARDING, ...(t.onboarding || {}) }, version: 0 }],
    ["exam-arena-walkthrough-v2", { state: { completed: true }, version: 0 }],
  ];
  await ctx.addInitScript(({ s, theme }) => {
    for (const [k, v] of s) localStorage.setItem(k, JSON.stringify(v));
    localStorage.setItem("exam-arena-theme", JSON.stringify({ state: { theme, accent: "lime" }, version: 0 }));
  }, { s: seed, theme: THEME });
  const page = await ctx.newPage();
  page.setDefaultTimeout(8000);
  const log = (m) => console.log(`  [${t.label}] ${m}`);

  const actionable = async (sel) => page.locator(sel).first().click({ trial: true, timeout: 1500 }).then(() => true).catch(() => false);
  const settle = async (expectSel, skipStrays = false) => {
    for (let i = 0; i < 12; i++) {
      if (await actionable(expectSel)) return true;
      if (skipStrays) {
        const skip = page.locator('button:has-text("Skip for now")').first();
        if (await skip.isVisible().catch(() => false)) { await skip.click({ timeout: 4000 }).catch(() => {}); await page.waitForTimeout(600); continue; }
      }
      const present = await page.locator(expectSel).count().catch(() => 0);
      if (present > 0) { await page.waitForTimeout(300); continue; }
      await page.waitForTimeout(300);
    }
    return actionable(expectSel);
  };
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
      if (await b.isVisible().catch(() => false)) { await b.click({ timeout: 4000 }).catch(() => {}); return true; }
    }
    return false;
  };

  try {
    await page.goto(`${BASE}${t.url || "/dashboard"}`, { waitUntil: "domcontentloaded", timeout: 20000 });
    await page.waitForTimeout(900);

    if (t.pre === "paywall") {
      // switch to Mock view, then click the gated non-primary prep tab -> opens paywall
      const mockTab = page.locator('button:has-text("Mock")').first();
      if (await mockTab.count()) { await mockTab.click({ timeout: 4000 }).catch(() => {}); }
      await page.waitForTimeout(900);
      const tabs = page.locator('button:has-text("GMAT")');
      if (await tabs.count()) { await tabs.first().click({ timeout: 4000 }).catch(() => {}); }
      await page.waitForTimeout(900);
    } else if (t.drive) {
      if (!(await settle("[data-tour-continue-setup]", true))) log("WARN: continue-setup not reachable");
      await clickText("Continue setup") || await page.locator("[data-tour-continue-setup]").first().click({ timeout: 4000 }).catch(() => {});
      await page.waitForTimeout(900);
      const nameInput = page.locator('input[placeholder="Type your name..."]');
      if (await nameInput.count()) { await nameInput.fill("Test"); await page.waitForTimeout(150); }
      await clickLastEnabled();
      await page.waitForTimeout(800);
      await clickText("Student");
      await clickLastEnabled();
      await page.waitForTimeout(800);
      if (t.drive === "family" || t.drive === "hub") {
        await clickText("Master speed math");
        await page.waitForTimeout(500);
        await clickText("Teaching My Kid");
        await page.waitForTimeout(1500);
      } else {
        await clickText("Prepare for CAT");
        await page.waitForTimeout(500);
        await clickText("Taking an exam this year");
        await page.waitForTimeout(1500);
      }
      if (t.drive === "story") {
        await clickText("Enter Exam Arena");
        await page.waitForTimeout(1200);
        await clickText("ARENA");       // primary arena CTA "ENTER MULTI-LANE ARENA"
        await page.waitForTimeout(1200);
        await clickText("Continue Free");
        await page.waitForTimeout(1200);
      }
      if (t.drive === "hub") {
        await clickText("SET UP FAMILY SEATS");       // family CTA -> family hub
        await page.waitForTimeout(1500);
      }
    } else {
      await settle(t.wait, t.skipStrays);
    }

    const ok = t.presence ? (await page.locator(t.wait).count().catch(() => 0)) > 0 : await settle(t.wait, false);
    if (!ok) {
      log(`MISSING wait selector: ${t.wait}`);
      const dbg = await page.evaluate(() => {
        const ds = [...document.querySelectorAll('[data-theme-scope][role="dialog"]')].filter((d) => { const r = d.getBoundingClientRect(); const cs = getComputedStyle(d); return r.width > 4 && +cs.opacity > 0.05 && cs.display !== "none"; });
        return { dialogs: ds.length, heads: ds.map((d) => [...d.querySelectorAll("h1,h2,h3")].slice(0, 6).map((h) => (h.textContent || "").trim().slice(0, 40))), btns: [...document.querySelectorAll("button")].filter((b) => b.offsetParent !== null).map((b) => (b.textContent || "").trim().slice(0, 30)).filter(Boolean).slice(0, 12), scopes: document.querySelectorAll("[data-theme-scope]").length, store: JSON.parse(localStorage.getItem("exam-arena-onboarding") || "{}").state };
      });
      log(`DEBUG dialogs=${dbg.dialogs} scopes=${dbg.scopes} store=${JSON.stringify(dbg.store)}`);
    }
    await page.waitForTimeout(600);
    const rows = await page.evaluate(evaluateAudit, t.scan || '[data-theme-scope][role="dialog"]');
    const bad = [];
    for (const r of rows) {
      const fg = parse(r.color), bg = parse(r.bg);
      const eff = fg[3] !== undefined && fg[3] < 1 ? comp(fg, bg.slice(0, 3)) : fg.slice(0, 3);
      const cr = ratio(eff, bg.slice(0, 3));
      if (cr < 3.0) bad.push({ ...r, cr });
    }
    console.log(`\n=== ${t.label} (THEME=${THEME}) scanned=${rows.length} low-contrast=${bad.length}`);
    const seen = new Set();
    for (const b of bad) {
      const k = b.txt + b.color + b.bg;
      if (seen.has(k)) continue; seen.add(k);
      console.log(`  ${b.cr}:1  "${b.txt}"  fg=${b.color} bg=${b.bg}  cls="${b.cls}"\n      stack: ${b.dbg}`);
    }
  } catch (e) {
    console.log(`  [${t.label}] ERROR: ${String(e).split("\n")[0]}`);
  } finally {
    await ctx.close();
  }
};

for (const t of TARGETS) {
  if (ONLY && t.label !== ONLY) continue;
  await run(t);
}

await browser.close();
server.close();
