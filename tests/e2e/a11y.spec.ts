import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const PUBLIC_ROUTES = ["/", "/auth", "/onboarding"];

test.describe("automated accessibility scan", () => {
  test.setTimeout(90_000);
  for (const route of PUBLIC_ROUTES) {
    test(`${route} has no serious/critical violations`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(route);
      await page.waitForLoadState("networkidle").catch(() => {});
      const results = await new AxeBuilder({ page }).analyze();
      const serious = results.violations.filter((v) => ["serious", "critical"].includes(v.impact ?? ""));
      expect(
        serious.map((v) => v.id),
        JSON.stringify(serious, null, 2),
      ).toEqual([]);
    });
  }
});