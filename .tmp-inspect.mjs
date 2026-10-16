import { chromium } from "@playwright/test";
const b = await chromium.launch();
const c = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
const p = await c.newPage();
const AUTH = { state: { user: { id: "1", name: "QA", email: "q@q.com", role: "Champion" }, token: "t", isAuthenticated: true, isOnboarded: true }, version: 0 };
const ONB = { state: { isOnboarded: true, planHookSeen: true, arenaHookSeen: true, pitchHookSeen: true, planId: "cat-fast-track", targetExam: "cat" }, version: 1 };
const WK = { state: { completed: true }, version: 0 };
await c.addInitScript(({ s }) => { for (const [k, v] of s) localStorage.setItem(k, JSON.stringify(v)); }, { s: [["exam-arena-auth", AUTH], ["exam-arena-onboarding", ONB], ["exam-arena-walkthrough", WK], ["exam-arena-walkthrough-v2", WK]] });
await p.goto("http://localhost:3008/dashboard.html", { waitUntil: "domcontentloaded", timeout: 30000 });
await p.waitForTimeout(2500);

const info = await p.evaluate(() => {
  const out = [];
  const main = document.querySelector("main");
  const walk = (el, depth) => {
    if (depth > 4 || !el) return;
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    out.push({
      d: depth,
      tag: el.tagName.toLowerCase(),
      cls: (el.className || "").toString().slice(0, 110),
      left: Math.round(r.left),
      w: Math.round(r.width),
      padL: cs.paddingLeft,
      marL: cs.marginLeft,
    });
    for (const ch of el.children) walk(ch, depth + 1);
  };
  walk(main, 0);
  const h1 = document.querySelector("main h1, main h2");
  return { tree: out, h1: h1 ? { txt: h1.textContent.slice(0, 40), left: Math.round(h1.getBoundingClientRect().left) } : null };
});
console.log(JSON.stringify(info, null, 1));
await p.screenshot({ path: ".tmp-dash.png", fullPage: false });
await b.close();
