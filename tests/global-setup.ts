import { chromium } from "@playwright/test";

const TEST_EMAIL = process.env.TEST_EMAIL ?? "";
const TEST_PASSWORD = process.env.TEST_PASSWORD ?? "";
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";

export default async function globalSetup() {
  if (!TEST_EMAIL || !TEST_PASSWORD) return;

  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto(`${BASE_URL}/auth/v3/login`);
  // Playwright auto-waits for actionability — no sleep needed
  await page.getByPlaceholder("you@example.com").fill(TEST_EMAIL);
  await page.getByPlaceholder("Enter your password").fill(TEST_PASSWORD);
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL(/\/dashboard/, { timeout: 20000 });

  // Save auth cookies/localStorage for reuse by all tests
  await page.context().storageState({ path: "tests/.auth-state.json" });
  await browser.close();
}
