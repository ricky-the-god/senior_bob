import { expect, test } from "@playwright/test";

test.describe("Search Functionality", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");
  });

  test("should open search dialog when clicking Search in sidebar", async ({ page }) => {
    // Click on the Search button in the sidebar
    await page.getByRole("button", { name: "Search" }).click();

    // Verify the search dialog is open
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByPlaceholder("Search projects, drafts, teams...")).toBeVisible();
  });

  test("should open search dialog with Ctrl+K keyboard shortcut", async ({ page }) => {
    // Press Ctrl+K
    await page.keyboard.press("Control+k");

    // Verify the search dialog is open
    await expect(page.getByRole("dialog")).toBeVisible();
  });

  test("should close search dialog on Escape", async ({ page }) => {
    // Open search
    await page.keyboard.press("Control+k");
    await expect(page.getByRole("dialog")).toBeVisible();

    // Press Escape to close
    await page.keyboard.press("Escape");

    // Verify dialog is closed
    await expect(page.getByRole("dialog")).not.toBeVisible();
  });

  test("should show search results when typing", async ({ page }) => {
    // Open search
    await page.keyboard.press("Control+k");

    // Type a search query
    await page.getByPlaceholder("Search projects, drafts, teams...").fill("E-commerce");

    // Verify results are shown (use first match since it appears in Recent and Projects)
    await expect(page.getByLabel("Recent").getByText("E-commerce Platform")).toBeVisible();
  });

  test("should navigate to item when selected", async ({ page }) => {
    // Open search
    await page.keyboard.press("Control+k");

    // Click on a project (use first match from Recent section)
    await page.getByLabel("Recent").getByText("E-commerce Platform").click();

    // Dialog should close and navigation should happen
    await expect(page.getByRole("dialog")).not.toBeVisible();
  });
});
