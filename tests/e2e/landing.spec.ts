import { test, expect } from "@playwright/test";

test("landing page loads with expected title", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Zuzumik/);
  await expect(page.locator("#main-content")).toBeVisible();
});

test("unknown route renders the 404 page", async ({ page }) => {
  await page.goto("/this-route-does-not-exist");
  await expect(page).toHaveURL(/this-route-does-not-exist/);
});

test("protected app route redirects unauthenticated users", async ({ page }) => {
  await page.goto("/dashboard");
  await page.waitForURL(/onboarding/);
  await expect(page).toHaveURL(/onboarding/);
});