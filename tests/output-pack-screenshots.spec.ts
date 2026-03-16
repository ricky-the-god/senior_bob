import { test } from "@playwright/test";

test("Output pack - screenshot", async ({ page }) => {
  // Login first
  await page.goto("/auth/v3/login");
  await page.waitForTimeout(1000);
  await page.getByPlaceholder("you@example.com").fill("rickyvnguyen12@gmail.com");
  await page.getByPlaceholder("Enter your password").fill("Ricky123");
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForTimeout(3000);

  // Should be redirected to dashboard
  await page.screenshot({ path: "tests/screenshots/output_pack_after_login.png", fullPage: false });

  // Navigate to dashboard
  await page.goto("/dashboard/default");
  await page.waitForTimeout(2000);
  await page.screenshot({ path: "tests/screenshots/output_pack_dashboard.png", fullPage: false });

  // Get the URL to find a project ID
  const url = page.url();
  console.log("Dashboard URL:", url);

  // Look for project links
  const projectLinks = await page.locator('a[href*="/dashboard/project/"]').all();
  console.log("Project links found:", projectLinks.length);

  if (projectLinks.length > 0) {
    const href = await projectLinks[0].getAttribute("href");
    console.log("First project href:", href);

    // Extract project ID from href
    const match = href?.match(/\/dashboard\/project\/([^/]+)/);
    if (match) {
      const projectId = match[1];
      console.log("Project ID:", projectId);

      // Navigate to output-pack
      await page.goto(`/dashboard/project/${projectId}/output-pack`);
      await page.waitForTimeout(2000);
      await page.screenshot({ path: "tests/screenshots/output_pack_page.png", fullPage: true });
      console.log("Output pack screenshot taken");
    }
  } else {
    // Try to find any project by looking at the page
    console.log("No project links found on dashboard");
    await page.screenshot({ path: "tests/screenshots/output_pack_no_projects.png", fullPage: true });
  }
});
