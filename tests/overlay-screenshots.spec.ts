import { test } from "@playwright/test";

test("capture overlay screenshots", async ({ page }) => {
  // Set viewport
  await page.setViewportSize({ width: 1440, height: 900 });

  // 1. Navigate to landing page
  await page.goto("http://localhost:3000");
  await page.waitForLoadState("networkidle");

  // 2. Screenshot: initial landing page
  await page.screenshot({
    path: "tests/screenshots/overlay_before.png",
    fullPage: false,
  });
  console.log("Saved overlay_before.png");

  // 3. Click the hero "Get started free" button (ShimmerButton)
  const heroButton = page.locator("button").filter({ hasText: /get started free/i });
  await heroButton.first().click();

  // 4. Wait 1.5s for animation
  await page.waitForTimeout(1500);

  // 5. Screenshot: expanded hero overlay
  await page.screenshot({
    path: "tests/screenshots/overlay_hero_expanded.png",
    fullPage: false,
  });
  console.log("Saved overlay_hero_expanded.png");

  // 6. Close the overlay via Escape key
  await page.keyboard.press("Escape");
  await page.waitForTimeout(800);

  // Also try clicking the close button with force in case Escape didn't work
  const closeBtn = page.locator('[aria-label="Close"]');
  const closeBtnVisible = await closeBtn.isVisible().catch(() => false);
  if (closeBtnVisible) {
    await closeBtn.click({ force: true });
    await page.waitForTimeout(800);
  }

  // Wait for overlay to be gone
  await page.waitForSelector('[aria-label="Close"]', { state: "hidden", timeout: 5000 }).catch(() => {
    console.log("Close button still visible after attempts");
  });

  // 7. Click nav "Get started" button — use force to bypass any remaining overlay
  const navGetStarted = page.locator("header").getByRole("button", { name: /get started/i });
  await navGetStarted.first().click({ force: true });

  // 9. Wait 1.5s for animation
  await page.waitForTimeout(1500);

  // 10. Screenshot: nav overlay
  await page.screenshot({
    path: "tests/screenshots/overlay_nav_expanded.png",
    fullPage: false,
  });
  console.log("Saved overlay_nav_expanded.png");
});
