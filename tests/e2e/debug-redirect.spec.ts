import { test } from "@playwright/test";

test("debug: dashboard redirect for unauthenticated user", async ({ page }) => {
  const logs: string[] = [];
  page.on("console", (m) => logs.push(`[console:${m.type()}] ${m.text()}`));
  page.on("requestfailed", (r) => logs.push(`[reqfail] ${r.url()} ${r.failure()?.errorText}`));
  page.on("response", (r) => {
    if (r.status() >= 400) logs.push(`[resp ${r.status()}] ${r.url()}`);
  });

  await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(6000);
  logs.forEach((l) => console.log(l));
  console.log("[final url]", page.url());
});