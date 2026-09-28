import { test, expect } from "@playwright/test";
import {
  PRIMARY_SCREENS,
  SECONDARY_SCREENS,
  loadScreen,
  auditPage,
  auditInputsInView,
  seedAppState,
  isExamRoute,
  type Screen,
} from "./helpers/responsive";

const ALL_SCREENS: Screen[] = [...PRIMARY_SCREENS, ...SECONDARY_SCREENS];

for (const screen of ALL_SCREENS) {
  test.describe(`responsive: ${screen.path}`, () => {
    test("layout audit passes at every breakpoint width", async ({ page }) => {
      test.setTimeout(180_000);
      seedAppState(page);
      const failures: string[] = [];

      for (const width of screen.widths) {
        await loadScreen(page, screen.path, width);
        const first = await auditPage(page, {
          width,
          isExam: isExamRoute(screen.path),
          hasShell: !!screen.shell,
        });
        await page.waitForTimeout(150);
        const second = await auditPage(page, {
          width,
          isExam: isExamRoute(screen.path),
          hasShell: !!screen.shell,
        });
        const stable = first.filter((f) => second.includes(f));
        if (stable.length > 0) failures.push(`[${width}px] ${stable.join(" | ")}`);
        if (screen.checkInputs) {
          const inputs = await auditInputsInView(page);
          if (inputs.length > 0) failures.push(`[${width}px inputs] ${inputs.join(" | ")}`);
        }
      }

      expect(failures, failures.length ? failures.join("\n") : undefined).toEqual([]);
    });
  });
}