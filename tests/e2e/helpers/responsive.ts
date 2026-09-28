import type { Page } from "@playwright/test";

export const AUTH_KEY = "exam-arena-auth";
export const ONBOARD_KEY = "exam-arena-onboarding";
export const WALKTHROUGH_KEY = "exam-arena-walkthrough-v2";

export const PRIMARY_WIDTHS = [320, 360, 375, 390, 414, 768, 1024, 1280, 1440, 1920];
export const EXTREME_WIDTHS = [320, 375, 768, 1024, 1280, 1920];

export const EXAM_PREFIXES = ["/play/sprint", "/learn/mock/run", "/learn/practice"];
export const isExamRoute = (path: string) => EXAM_PREFIXES.some((r) => path.startsWith(r));

export type Screen = {
  path: string;
  widths: number[];
  shell?: boolean;
  checkInputs?: boolean;
};

export const PRIMARY_SCREENS: Screen[] = [
  { path: "/", widths: PRIMARY_WIDTHS },
  { path: "/auth", widths: PRIMARY_WIDTHS },
  { path: "/onboarding", widths: PRIMARY_WIDTHS },
  { path: "/dashboard", widths: PRIMARY_WIDTHS, shell: true },
  { path: "/dashboard/feed", widths: PRIMARY_WIDTHS, shell: true },
  { path: "/learn", widths: PRIMARY_WIDTHS, shell: true },
  { path: "/play", widths: PRIMARY_WIDTHS, shell: true },
  { path: "/settings", widths: PRIMARY_WIDTHS, shell: true },
  { path: "/play/sprint", widths: PRIMARY_WIDTHS, shell: true },
  { path: "/learn/mock/run", widths: PRIMARY_WIDTHS, shell: true },
  { path: "/settings/profile/edit", widths: PRIMARY_WIDTHS, shell: true, checkInputs: true },
];

export const SECONDARY_SCREENS: Screen[] = [
  { path: "/dashboard/analytics", widths: EXTREME_WIDTHS, shell: true },
  { path: "/dashboard/friends", widths: EXTREME_WIDTHS, shell: true },
  { path: "/dashboard/clubs", widths: EXTREME_WIDTHS, shell: true },
  { path: "/learn/explorer", widths: EXTREME_WIDTHS, shell: true },
  { path: "/learn/mastery", widths: EXTREME_WIDTHS, shell: true },
  { path: "/learn/practice", widths: EXTREME_WIDTHS, shell: true },
  { path: "/learn/technique/quant-comparison", widths: EXTREME_WIDTHS, shell: true },
  { path: "/play/configure-sprint", widths: EXTREME_WIDTHS, shell: true },
  { path: "/play/duel", widths: EXTREME_WIDTHS, shell: true },
  { path: "/play/sprint/results", widths: EXTREME_WIDTHS, shell: true },
  { path: "/play/sprint/results/analysis", widths: EXTREME_WIDTHS, shell: true },
  { path: "/settings/profile", widths: EXTREME_WIDTHS, shell: true },
  { path: "/settings/achievements", widths: EXTREME_WIDTHS, shell: true },
  { path: "/settings/leaderboard", widths: EXTREME_WIDTHS, shell: true },
  { path: "/settings/history", widths: EXTREME_WIDTHS, shell: true },
  { path: "/settings/reports", widths: EXTREME_WIDTHS, shell: true },
  { path: "/settings/planner", widths: EXTREME_WIDTHS, shell: true },
  { path: "/settings/notifications", widths: EXTREME_WIDTHS, shell: true },
  { path: "/settings/linked-devices", widths: EXTREME_WIDTHS, shell: true },
  { path: "/settings/help", widths: EXTREME_WIDTHS, shell: true },
  { path: "/settings/scan-to-login", widths: EXTREME_WIDTHS, shell: true },
];

const BLOB_AUTH = {
  state: {
    user: { id: "1", name: "QA Operative", email: "qa@example.com", role: "Champion" },
    token: "mock-jwt-token",
    refreshToken: null,
    isAuthenticated: true,
    isOnboarded: true,
  },
  version: 0,
};

const BLOB_ONBOARD = {
  state: {
    isOnboarded: true,
    planHookSeen: true,
    arenaHookSeen: true,
    pitchHookSeen: true,
    planId: "cat-fast-track",
    targetExam: "cat",
  },
  version: 1,
};

const BLOB_WALKTHROUGH = { state: { completed: true }, version: 0 };

export function seedAppState(page: Page) {
  page.addInitScript(
    ({ entries }) => {
      try {
        for (const [key, value] of entries as Array<[string, unknown]>) {
          localStorage.setItem(key, JSON.stringify(value));
        }
      } catch {
        /* ignore */
      }
    },
    {
      entries: [
        [AUTH_KEY, BLOB_AUTH],
        [ONBOARD_KEY, BLOB_ONBOARD],
        [WALKTHROUGH_KEY, BLOB_WALKTHROUGH],
      ],
    },
  );
}

export async function loadScreen(page: Page, path: string, width: number) {
  await page.setViewportSize({ width, height: 800 });
  await page.goto(path, { waitUntil: "domcontentloaded" });
  let content = "";
  for (let i = 0; i < 6; i++) {
    content = (await page.evaluate(() => document.body.innerText.trim())) ?? "";
    if (content.length >= 40) break;
    await page.waitForTimeout(400);
  }
  if (content.length === 0) throw new Error(`no content rendered at ${path} (${width}px)`);
  await page.waitForTimeout(500);
}

type AuditContext = { width: number; isExam: boolean; hasShell: boolean };

export async function auditPage(page: Page, ctx: AuditContext): Promise<string[]> {
  return page.evaluate(
    ({ width, isExam, hasShell }) => {
      const results: string[] = [];
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const doc = document.documentElement;
      const cls = (el: Element) =>
        `${el.tagName.toLowerCase()}.${String((el as HTMLElement).className).slice(0, 40)}`;

      const hasScrollableXAncestor = (el: Element) => {
        let p = el.parentElement;
        while (p && p !== document.body) {
          const ox = getComputedStyle(p).overflowX;
          if (ox === "auto" || ox === "scroll") return true;
          p = p.parentElement;
        }
        return false;
      };

      const isSvgChild = (el: Element) => {
        let e: Element | null = el;
        while (e) {
          if (e.tagName.toLowerCase() === "svg") return true;
          e = e.parentElement;
        }
        return false;
      };

      const isDecorNonInteractive = (el: HTMLElement) => {
        const cs = getComputedStyle(el);
        return cs.position === "absolute" && cs.pointerEvents === "none";
      };

      if (doc.scrollWidth > vw + 1) {
        results.push(`doc-hscroll w=${doc.scrollWidth} vw=${vw}`);
      }

      const all = Array.from(document.body.querySelectorAll<HTMLElement>("*"));
      const visible = (el: HTMLElement) => {
        const cs = getComputedStyle(el);
        return cs.display !== "none" && cs.visibility !== "hidden" && el.getBoundingClientRect().width > 0;
      };

      let widest: HTMLElement | null = null;
      for (const el of all) {
        if (!visible(el)) continue;
        if (hasScrollableXAncestor(el) || isSvgChild(el) || isDecorNonInteractive(el)) continue;
        const r = el.getBoundingClientRect();
        if (!widest || r.right > widest.getBoundingClientRect().right) widest = el;
      }
      if (widest && widest.getBoundingClientRect().right > vw + 1) {
        results.push(
          `clipped ${cls(widest)} right=${Math.round(widest.getBoundingClientRect().right)} vw=${vw}`,
        );
      }

      for (const el of all) {
        const cs = getComputedStyle(el);
        if (cs.position !== "fixed" || !visible(el)) continue;
        const r = el.getBoundingClientRect();
        if (r.right > vw + 1 && r.left <= vw + 1) results.push(`fixed-x ${cls(el)} r=${Math.round(r.right)}`);
        if (r.bottom > vh + 1 && r.top <= vh + 1) results.push(`fixed-y ${cls(el)} b=${Math.round(r.bottom)}`);
        if (r.left < -1 && r.right >= -1) results.push(`fixed-neg-x ${cls(el)} l=${Math.round(r.left)}`);
      }

      for (const el of all) {
        if (!/^(a|button|input|select|textarea)$/i.test(el.tagName) && el.getAttribute("role") !== "button") {
          continue;
        }
        if (!visible(el) || isSvgChild(el)) continue;
        if (hasScrollableXAncestor(el) || isDecorNonInteractive(el)) continue;
        const r = el.getBoundingClientRect();
        if (r.right > vw + 1 || r.left < -1) {
          results.push(`interactive-x ${cls(el)} l=${Math.round(r.left)} r=${Math.round(r.right)}`);
        }
      }

      for (const el of all) {
        if (!/^(p|h1|h2|h3|h4|h5|h6|li|td|th|button|a|legend|figcaption|dt|dd)$/i.test(el.tagName)) continue;
        if (!visible(el) || isSvgChild(el)) continue;
        const cs = getComputedStyle(el);
        if (cs.textOverflow === "ellipsis" || cs.textOverflow === "clip") continue;
        if (cs.overflowX !== "visible") continue;
        const r = el.getBoundingClientRect();
        if (el.scrollWidth > el.clientWidth + 1) {
          results.push(
            `unwrapped ${cls(el)} sw=${el.scrollWidth} cw=${el.clientWidth} text="${String(
              el.textContent || "",
            )
              .replace(/\s+/g, " ")
              .slice(0, 36)}"`,
          );
        }
        if (r.right > vw + 1 && !hasScrollableXAncestor(el)) {
          results.push(`text-x ${cls(el)} r=${Math.round(r.right)}`);
        }
      }

      for (const el of all) {
        if (el.tagName.toLowerCase() !== "table" || !visible(el)) continue;
        const sw = el.scrollWidth;
        const cw = el.clientWidth;
        if (sw <= cw + 1) continue;
        let node: HTMLElement | null = el;
        let scrollable = false;
        while (node && node !== document.body) {
          const ox = getComputedStyle(node).overflowX;
          if (ox === "auto" || ox === "scroll") {
            scrollable = true;
            break;
          }
          node = node.parentElement;
        }
        if (!scrollable) results.push(`stuck-table ${cls(el)} sw=${sw} cw=${cw}`);
      }

      if (hasShell) {
        const pill = document.querySelector<HTMLElement>("[data-tour-mobile-nav]");
        const sidebar = Array.from(document.querySelectorAll<HTMLElement>("aside")).find(
          (a) => getComputedStyle(a).position === "fixed" && a.getBoundingClientRect().width === 250,
        );
        const main = document.querySelector<HTMLElement>("main");
        const pillVisible = pill ? getComputedStyle(pill).display !== "none" : false;
        const sidebarVisible = sidebar ? getComputedStyle(sidebar).display !== "none" : false;

        if (isExam) {
          if (pillVisible) results.push("exam-pill-visible");
        } else if (width <= 1024) {
          if (!pillVisible) results.push(`pill-hidden at ${width}px`);
          if (sidebarVisible) results.push(`sidebar-shown at ${width}px`);
          if (pill) {
            const pr = pill.getBoundingClientRect();
            if (pr.left < -1 || pr.right > vw + 1) {
              results.push(`pill-x ${Math.round(pr.left)}..${Math.round(pr.right)} vw=${vw}`);
            }
            if (pr.width > vw) results.push(`pill-wider-than-viewport w=${Math.round(pr.width)}`);
          }
        } else {
          if (!sidebarVisible) results.push(`sidebar-hidden at ${width}px`);
          if (pillVisible) results.push("pill-visible-on-desktop");
        }

        if (main) {
          const ml = parseInt(getComputedStyle(main).marginLeft, 10);
          if (width >= 1025 && ml !== 250) results.push(`main-margin-left=${ml} expected 250`);
          if (width <= 1024 && !isExam && ml !== 0) results.push(`main-margin-left=${ml} expected 0`);
          if (width <= 1024 && !isExam) {
            const pb = parseFloat(getComputedStyle(main).paddingBottom);
            if (pb < 80) results.push(`main-pb=${pb} nav-overlap-risk`);
          }
        }
      }

      for (const el of all) {
        const role = el.getAttribute("role");
        if (role !== "dialog" && role !== "alertdialog") continue;
        if (!visible(el)) continue;
        const r = el.getBoundingClientRect();
        if (r.left < -1 || r.right > vw + 1) {
          results.push(`dialog-x ${cls(el)} ${Math.round(r.left)}..${Math.round(r.right)} vw=${vw}`);
        }
        if (r.top < -1 || r.bottom > vh + 1) {
          results.push(`dialog-y ${cls(el)} ${Math.round(r.top)}..${Math.round(r.bottom)} vh=${vh}`);
        }
      }

      return results;
    },
    { width: ctx.width, isExam: ctx.isExam, hasShell: ctx.hasShell },
  );
}

export async function auditInputsInView(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const results: string[] = [];
    const vh = window.innerHeight;
    const inputs = Array.from(document.querySelectorAll<HTMLElement>("input, textarea, select"));
    const visible = inputs.filter((el) => {
      const cs = getComputedStyle(el);
      return cs.display !== "none" && cs.visibility !== "hidden" && el.getBoundingClientRect().height > 0;
    });
    for (const el of visible.slice(0, 6)) {
      el.scrollIntoView({ block: "center" });
      const r = el.getBoundingClientRect();
      if (r.top < -1 || r.bottom > vh + 1) {
        results.push(
          `input-offscreen ${el.tagName.toLowerCase()} t=${Math.round(r.top)} b=${Math.round(r.bottom)} vh=${vh}`,
        );
      }
    }
    return results;
  });
}