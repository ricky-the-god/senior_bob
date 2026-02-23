import { expect, test } from "@playwright/test";

test.describe("Cosmos Auth V3 - Visual Tests", () => {
  test("Login page - Dark mode screenshot", async ({ page }) => {
    await page.goto("/auth/v3/login");
    // Wait for animations to complete
    await page.waitForTimeout(1500);
    await expect(page).toHaveScreenshot("auth-v3-login-dark.png", {
      fullPage: true,
    });
  });

  test("Login page - Light mode screenshot", async ({ page }) => {
    await page.goto("/auth/v3/login");
    await page.waitForTimeout(500);
    // Click theme toggle
    await page.getByRole("button", { name: /toggle theme/i }).click();
    await page.waitForTimeout(1000);
    await expect(page).toHaveScreenshot("auth-v3-login-light.png", {
      fullPage: true,
    });
  });

  test("Signup page - Dark mode screenshot", async ({ page }) => {
    await page.goto("/auth/v3/signup");
    await page.waitForTimeout(1500);
    await expect(page).toHaveScreenshot("auth-v3-signup-dark.png", {
      fullPage: true,
    });
  });

  test("Signup page - Light mode screenshot", async ({ page }) => {
    await page.goto("/auth/v3/signup");
    await page.waitForTimeout(500);
    // Click theme toggle
    await page.getByRole("button", { name: /toggle theme/i }).click();
    await page.waitForTimeout(1000);
    await expect(page).toHaveScreenshot("auth-v3-signup-light.png", {
      fullPage: true,
    });
  });

  test("Login form - Input focus glow effect", async ({ page }) => {
    await page.goto("/auth/v3/login");
    await page.waitForTimeout(1000);
    // Focus on email input
    await page.getByPlaceholder("you@example.com").focus();
    await page.waitForTimeout(300);
    await expect(page).toHaveScreenshot("auth-v3-login-input-focus.png", {
      fullPage: true,
    });
  });

  test("Signup form - Password strength indicators", async ({ page }) => {
    await page.goto("/auth/v3/signup");
    await page.waitForTimeout(1000);
    // Type password to show strength indicators
    await page.getByPlaceholder("Create a strong password").fill("Test123");
    await page.waitForTimeout(500);
    await expect(page).toHaveScreenshot("auth-v3-signup-password-strength.png", {
      fullPage: true,
    });
  });

  test("Login page - Google button hover", async ({ page }) => {
    await page.goto("/auth/v3/login");
    await page.waitForTimeout(1000);
    // Hover Google button
    await page.getByRole("button", { name: /continue with google/i }).hover();
    await page.waitForTimeout(300);
    await expect(page).toHaveScreenshot("auth-v3-login-google-hover.png", {
      fullPage: true,
    });
  });
});
