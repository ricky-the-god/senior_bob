import { test } from "@playwright/test";

test("guided setup chat UI", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });

  // Step 1 — description
  await page.goto("http://localhost:3000/dashboard/create-project");
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(800);
  await page.getByRole("textbox").first().fill("A tool that helps solo founders build apps faster.");
  await page.waitForTimeout(300);
  await page.getByRole("button", { name: /continue/i }).click();
  await page.waitForTimeout(1500);

  // Step 2 — click SaaS Platform card
  await page.getByRole("button", { name: "SaaS Platform" }).click();
  await page.waitForTimeout(1000);
  // Auto-advances or needs Continue
  const cont2 = page.getByRole("button", { name: /continue/i });
  if (await cont2.isVisible({ timeout: 2000 }).catch(() => false)) {
    await cont2.click();
    await page.waitForTimeout(1500);
  }

  // Step 3 — origin: click first option (New App / scratch)
  await page.screenshot({ path: "tests/screenshots/wizard_step3.png" });
  const originBtns = ["New App", "Brand new", "Fresh", "Starting fresh", "From scratch"];
  let clicked = false;
  for (const label of originBtns) {
    const btn = page.getByRole("button", { name: new RegExp(label, "i") });
    if (await btn.isVisible({ timeout: 500 }).catch(() => false)) {
      await btn.click();
      clicked = true;
      break;
    }
  }
  if (!clicked) {
    // Click the first visible card-like button
    const stepBtns = page.locator('main button, [role="main"] button').filter({ hasNotText: /continue|back|search/i });
    await stepBtns
      .first()
      .click()
      .catch(() => {
        /* no card buttons visible — skip */
      });
  }
  await page.waitForTimeout(800);
  const cont3 = page.getByRole("button", { name: /continue/i });
  if (await cont3.isVisible({ timeout: 2000 }).catch(() => false)) {
    await cont3.click();
    await page.waitForTimeout(1500);
  }

  // Step 4 — project name
  await page.screenshot({ path: "tests/screenshots/wizard_step4.png" });
  const nameBox = page.getByRole("textbox").first();
  if (await nameBox.isVisible({ timeout: 2000 }).catch(() => false)) {
    await nameBox.fill("Screenshot Test App");
    await page.waitForTimeout(300);
  }
  const cont4 = page.getByRole("button", { name: /continue|create|done|finish/i }).first();
  if (await cont4.isVisible({ timeout: 2000 }).catch(() => false)) {
    await cont4.click();
    await page.waitForTimeout(3000);
  }

  // Wait for redirect to project
  await page.waitForURL(/\/project\//, { timeout: 20000 }).catch(() => {
    /* may already be on project page */
  });
  const url = page.url();
  console.log("URL after create:", url);

  const match = url.match(/\/project\/([a-f0-9-]+)/);
  if (!match) {
    await page.screenshot({ path: "tests/screenshots/wizard_stuck.png" });
    return;
  }

  const pid = match[1];
  console.log("New project ID:", pid);

  // ── Chat UI screenshots ────────────────────────────────────────────────────

  // Workflow step (not yet complete)
  await page.goto(`http://localhost:3000/dashboard/project/${pid}/guided-setup/workflow`);
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(2500);
  await page.screenshot({ path: "tests/screenshots/chat_ui_dark.png" });

  // Light mode
  await page.emulateMedia({ colorScheme: "light" });
  await page.waitForTimeout(600);
  await page.screenshot({ path: "tests/screenshots/chat_ui_light.png" });

  // Integrations step
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto(`http://localhost:3000/dashboard/project/${pid}/guided-setup/integrations`);
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(2000);
  await page.screenshot({ path: "tests/screenshots/chat_ui_integrations.png" });
});
