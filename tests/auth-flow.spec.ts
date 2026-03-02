import { expect, test } from "@playwright/test";

/**
 * Set TEST_EMAIL and TEST_PASSWORD in .env.local (a confirmed Supabase account).
 * Tests that require real credentials are skipped if those vars are missing.
 */
const TEST_EMAIL = process.env.TEST_EMAIL ?? "";
const TEST_PASSWORD = process.env.TEST_PASSWORD ?? "";
const HAS_CREDENTIALS = Boolean(TEST_EMAIL && TEST_PASSWORD);

// ─── 1. Route Protection ─────────────────────────────────────────────────────

test.describe("Route protection", () => {
  test("unauthenticated → /dashboard redirects to login", async ({ page }) => {
    await page.goto("/dashboard/default");
    await page.waitForURL(/\/auth\/v3\/login/);
    await expect(page).toHaveURL(/\/auth\/v3\/login/);
  });

  test("redirectTo param is preserved in the URL", async ({ page }) => {
    await page.goto("/dashboard/default");
    await page.waitForURL(/\/auth\/v3\/login/);
    expect(page.url()).toContain("redirectTo=%2Fdashboard%2Fdefault");
  });

  test("auth pages are accessible without auth", async ({ page }) => {
    await page.goto("/auth/v3/login");
    await expect(page.getByRole("heading", { name: /welcome back/i })).toBeVisible();
  });
});

// ─── 2. Login form validation ─────────────────────────────────────────────────

test.describe("Login form validation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/auth/v3/login");
    await page.waitForTimeout(800); // wait for Framer Motion entrance
  });

  test("shows error for empty email on submit", async ({ page }) => {
    // Leave email empty — Zod fires before HTML5 blocks anything
    await page.getByPlaceholder("Enter your password").fill("password123");
    await page.getByRole("button", { name: /sign in/i }).click();
    await expect(page.getByText(/valid email/i)).toBeVisible();
  });

  test("shows error when password is too short", async ({ page }) => {
    await page.getByPlaceholder("you@example.com").fill("test@example.com");
    await page.getByPlaceholder("Enter your password").fill("abc");
    await page.getByRole("button", { name: /sign in/i }).click();
    await expect(page.getByText(/at least 6 characters/i)).toBeVisible();
  });
});

// ─── 3. Signup form validation ────────────────────────────────────────────────

test.describe("Signup form validation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/auth/v3/signup");
    await page.waitForTimeout(800);
  });

  test("password strength indicators appear while typing", async ({ page }) => {
    await page.getByPlaceholder("Create a strong password").fill("weak");
    await expect(page.getByText(/at least 8 characters/i)).toBeVisible();
  });

  test("shows error when passwords do not match", async ({ page }) => {
    await page.getByPlaceholder("John Doe").fill("Test User");
    await page.getByPlaceholder("you@example.com").fill("test@example.com");
    await page.getByPlaceholder("Create a strong password").fill("Password1");
    await page.getByPlaceholder("Confirm your password").fill("Password2");
    await page.getByRole("button", { name: /create account/i }).click();
    await expect(page.getByText(/do not match/i)).toBeVisible();
  });
});

// ─── 4. Full authenticated flow (requires TEST_EMAIL + TEST_PASSWORD) ─────────

test.describe("Authenticated flow", () => {
  test.skip(!HAS_CREDENTIALS, "Set TEST_EMAIL and TEST_PASSWORD in .env.local to run");

  test("login with valid credentials → dashboard", async ({ page }) => {
    await page.goto("/auth/v3/login");
    await page.waitForTimeout(800);

    await page.getByPlaceholder("you@example.com").fill(TEST_EMAIL);
    await page.getByPlaceholder("Enter your password").fill(TEST_PASSWORD);
    await page.getByRole("button", { name: /sign in/i }).click();

    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("wrong password → error toast", async ({ page }) => {
    await page.goto("/auth/v3/login");
    await page.waitForTimeout(800);

    await page.getByPlaceholder("you@example.com").fill(TEST_EMAIL);
    await page.getByPlaceholder("Enter your password").fill("wrong-password-123");
    await page.getByRole("button", { name: /sign in/i }).click();

    await expect(page.getByText(/sign in failed/i)).toBeVisible({ timeout: 8000 });
  });

  test("authenticated user visiting /auth/v3/login → redirected to dashboard", async ({ page, context }) => {
    // Log in first
    await page.goto("/auth/v3/login");
    await page.waitForTimeout(800);
    await page.getByPlaceholder("you@example.com").fill(TEST_EMAIL);
    await page.getByPlaceholder("Enter your password").fill(TEST_PASSWORD);
    await page.getByRole("button", { name: /sign in/i }).click();
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });

    // Now try to access login again
    await page.goto("/auth/v3/login");
    await page.waitForURL(/\/dashboard/, { timeout: 8000 });
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("logout from header → redirected to login", async ({ page }) => {
    await page.goto("/auth/v3/login");
    await page.waitForTimeout(800);
    await page.getByPlaceholder("you@example.com").fill(TEST_EMAIL);
    await page.getByPlaceholder("Enter your password").fill(TEST_PASSWORD);
    await page.getByRole("button", { name: /sign in/i }).click();
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });

    // Click logout button in header
    await page.getByRole("button", { name: /sign out/i }).click();
    await page.waitForURL(/\/auth\/v3\/login/, { timeout: 8000 });
    await expect(page).toHaveURL(/\/auth\/v3\/login/);
  });

  test("after logout, /dashboard redirects to login", async ({ page }) => {
    // Login
    await page.goto("/auth/v3/login");
    await page.waitForTimeout(800);
    await page.getByPlaceholder("you@example.com").fill(TEST_EMAIL);
    await page.getByPlaceholder("Enter your password").fill(TEST_PASSWORD);
    await page.getByRole("button", { name: /sign in/i }).click();
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });

    // Logout
    await page.getByRole("button", { name: /sign out/i }).click();
    await page.waitForURL(/\/auth\/v3\/login/, { timeout: 8000 });

    // Try to access dashboard again
    await page.goto("/dashboard/default");
    await page.waitForURL(/\/auth\/v3\/login/, { timeout: 8000 });
    await expect(page).toHaveURL(/\/auth\/v3\/login/);
  });
});
