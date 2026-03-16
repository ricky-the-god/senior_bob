import { test } from "@playwright/test";

test("capture overlay centered screenshot", async ({ page }) => {
  // Set viewport
  await page.setViewportSize({ width: 1440, height: 900 });

  // 1. Navigate to landing page
  await page.goto("http://localhost:3000");
  await page.waitForTimeout(1000);

  // 2. Click the hero "Get started free" CTA button
  const heroButton = page.locator("button").filter({ hasText: /get started free/i });
  await heroButton.first().click();

  // 3. Wait 1.5s for spring animation to fully complete
  await page.waitForTimeout(1500);

  // 4. Take screenshot
  await page.screenshot({
    path: "tests/screenshots/overlay_centered.png",
    fullPage: false,
  });

  console.log("Saved overlay_centered.png");
});
