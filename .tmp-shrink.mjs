import { chromium } from "@playwright/test";
const b = await chromium.launch();
const c = await b.newContext({ viewport: { width: 1440, height: 900 } });
const p = await c.newPage();
const AUTH = { state: { user: { id: "1", name: "QA", email: "q@q.com", role: "Champion" }, token: "t", isAuthenticated: true, isOnboarded: true }, version: 0 };
const ONB = { state: { isOnboarded: true, planHookSeen: true, arenaHookSeen: true, pitchHookSeen: true, planId: "cat-fast-track", targetExam: "cat" }, version: 1 };
const WK = { state: { completed: true }, version: 0 };
await c.addInitScript(({ s }) => { for (const [k, v] of s) localStorage.setItem(k, JSON.stringify(v)); }, { s: [["exam-arena-auth", AUTH], ["exam-arena-onboarding", ONB], ["exam-arena-walkthrough", WK], ["exam-arena-walkthrough-v2", WK]] });
await p.goto("http://localhost:3008/dashboard.html", { waitUntil: "domcontentloaded", timeout: 30000 });
await p.waitForTimeout(2500);

const snap = async (label) => {
  const r = await p.evaluate(() => {
    const pc = document.querySelector("main > div > div[class*='overflow-x-hidden']");
    const aside = document.querySelector("aside");
    const main = document.querySelector("main");
    if (!pc || !main) return { err: "missing" };
    const cs = getComputedStyle(pc);
    const pr = pc.getBoundingClientRect();
    const mr = main.getBoundingClientRect();
    const sr = aside ? aside.getBoundingClientRect() : null;
    const left = pr.left + parseFloat(cs.paddingLeft);
    const right = pr.right - parseFloat(cs.paddingRight);
    const mainLeft = mr.left;
    const mainRight = mr.right;
    return {
      asideW: sr ? Math.round(sr.width) : null,
      contentLeft: Math.round(left),
      contentRight: Math.round(right),
      contentW: Math.round(right - left),
      areaLeft: Math.round(mainLeft),
      areaRight: Math.round(mainRight),
      gapL: Math.round(left - mainLeft),
      gapR: Math.round(mainRight - right),
      centerDelta: Math.round(((left + right) / 2) - ((mainLeft + mainRight) / 2)),
      hscroll: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    };
  });
  console.log(label, JSON.stringify(r));
  return r;
};

await snap("COLLAPSED");
await p.hover("aside");
await p.waitForTimeout(800);
await snap("EXPANDED ");
await b.close();
