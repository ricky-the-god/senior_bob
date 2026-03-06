import { expect, test } from "@playwright/test";

/**
 * Wizard E2E tests.
 * Auth is pre-loaded via globalSetup → storageState (tests/.auth-state.json).
 * Skipped if TEST_EMAIL / TEST_PASSWORD are missing.
 */
const HAS_CREDENTIALS = Boolean(process.env.TEST_EMAIL && process.env.TEST_PASSWORD);

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function goToWizard(page: import("@playwright/test").Page) {
  await page.goto("/dashboard/create-project");
  // Wait for the wizard card to appear
  await expect(page.locator("textarea")).toBeVisible({ timeout: 10000 });
}

async function fillDescription(page: import("@playwright/test").Page, text: string) {
  await page.locator("textarea").fill(text);
}

// ─── 1. Step 1 — Description ─────────────────────────────────────────────────

test.describe("Wizard — Step 1 (Description)", () => {
  test.skip(!HAS_CREDENTIALS, "Requires TEST_EMAIL + TEST_PASSWORD");

  test.beforeEach(async ({ page }) => {
    await goToWizard(page);
  });

  test("renders heading and textarea", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /describe your project/i })).toBeVisible();
    await expect(page.locator("textarea")).toBeVisible();
  });

  test("Continue button disabled with < 10 chars", async ({ page }) => {
    await fillDescription(page, "short");
    await expect(page.getByRole("button", { name: /continue/i })).toBeDisabled();
  });

  test("Continue button enabled with 10+ chars", async ({ page }) => {
    await fillDescription(page, "A platform for managing freelance projects and clients.");
    await expect(page.getByRole("button", { name: /continue/i })).toBeEnabled();
  });

  test("char counter appears as user types", async ({ page }) => {
    await fillDescription(page, "Hello world test description!");
    await expect(page.getByText(/chars left/i)).toBeVisible();
  });

  test("Continue advances to Step 2 — App Type", async ({ page }) => {
    await fillDescription(page, "A SaaS platform for freelance designers to manage clients.");
    await page.getByRole("button", { name: /continue/i }).click();
    await expect(page.getByRole("heading", { name: /what type of application/i })).toBeVisible({ timeout: 5000 });
  });

  test("progress bar renders 8 pills", async ({ page }) => {
    // 8 motion divs inside the progress row
    const pills = page.locator(".flex.items-center.gap-1 > div");
    await expect(pills).toHaveCount(8);
  });
});

// ─── 2. Step 2 — App Type ────────────────────────────────────────────────────

test.describe("Wizard — Step 2 (App Type)", () => {
  test.skip(!HAS_CREDENTIALS, "Requires TEST_EMAIL + TEST_PASSWORD");

  test.beforeEach(async ({ page }) => {
    await goToWizard(page);
    await fillDescription(page, "A SaaS platform for freelance designers.");
    await page.getByRole("button", { name: /continue/i }).click();
    await expect(page.getByRole("heading", { name: /what type of application/i })).toBeVisible({ timeout: 5000 });
  });

  test("renders all 8 app type labels", async ({ page }) => {
    const labels = [
      "SaaS Platform",
      "Mobile App",
      "Microservices",
      "E-commerce",
      "API Platform",
      "Internal Tool",
      "Data Pipeline",
      "Real-time App",
    ];
    for (const label of labels) {
      await expect(page.getByText(label)).toBeVisible();
    }
  });

  test("Back button returns to Step 1", async ({ page }) => {
    await page.getByRole("button", { name: /back/i }).click();
    await expect(page.getByRole("heading", { name: /describe your project/i })).toBeVisible({ timeout: 3000 });
  });

  test("selecting SaaS Platform advances to Step 3 — Origin", async ({ page }) => {
    await page.getByText("SaaS Platform").click();
    await expect(page.getByRole("heading", { name: /starting point/i })).toBeVisible({ timeout: 5000 });
  });
});

// ─── 3. Step 3 — Origin ──────────────────────────────────────────────────────

test.describe("Wizard — Step 3 (Origin)", () => {
  test.skip(!HAS_CREDENTIALS, "Requires TEST_EMAIL + TEST_PASSWORD");

  test.beforeEach(async ({ page }) => {
    await goToWizard(page);
    await fillDescription(page, "A SaaS platform for freelance designers.");
    await page.getByRole("button", { name: /continue/i }).click();
    await page.getByText("SaaS Platform").click();
    await expect(page.getByRole("heading", { name: /starting point/i })).toBeVisible({ timeout: 5000 });
  });

  test("renders Brand new app and Existing app cards", async ({ page }) => {
    await expect(page.getByText("Brand new app")).toBeVisible();
    await expect(page.getByText("Existing app")).toBeVisible();
  });

  test("selecting Brand new app advances to Step 4 — Tech Stack", async ({ page }) => {
    await page.getByText("Brand new app").click();
    await expect(page.getByRole("heading", { name: /tech stack/i })).toBeVisible({ timeout: 5000 });
  });

  test("selecting Existing app also advances to Step 4", async ({ page }) => {
    await page.getByText("Existing app").click();
    await expect(page.getByRole("heading", { name: /tech stack/i })).toBeVisible({ timeout: 5000 });
  });
});

// ─── 4. Step 4 — Tech Stack ──────────────────────────────────────────────────

test.describe("Wizard — Step 4 (Tech Stack)", () => {
  test.skip(!HAS_CREDENTIALS, "Requires TEST_EMAIL + TEST_PASSWORD");

  test.beforeEach(async ({ page }) => {
    await goToWizard(page);
    await fillDescription(page, "A SaaS platform for freelance designers.");
    await page.getByRole("button", { name: /continue/i }).click();
    await page.getByText("SaaS Platform").click();
    await page.getByText("Brand new app").click();
    await expect(page.getByRole("heading", { name: /tech stack/i })).toBeVisible({ timeout: 5000 });
  });

  test("tech chips and Continue button are visible", async ({ page }) => {
    await expect(page.getByRole("button", { name: /^React$/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /^Node\.js$/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /continue/i })).toBeVisible();
  });

  test("chips toggle on and off", async ({ page }) => {
    const chip = page.getByRole("button", { name: /^React$/ });
    await chip.click(); // select
    await chip.click(); // deselect
    await expect(chip).toBeVisible();
  });

  test("Continue advances to Step 5 — User Scale", async ({ page }) => {
    await page.getByRole("button", { name: /continue/i }).click();
    await expect(page.getByRole("heading", { name: /expected scale/i })).toBeVisible({ timeout: 5000 });
  });
});

// ─── 5. Steps 5-7 — Scale → Infra → Backend ──────────────────────────────────

test.describe("Wizard — Steps 5-7 (Scale → Infra → Backend)", () => {
  test.skip(!HAS_CREDENTIALS, "Requires TEST_EMAIL + TEST_PASSWORD");

  test.beforeEach(async ({ page }) => {
    await goToWizard(page);
    await fillDescription(page, "A SaaS platform for freelance designers.");
    await page.getByRole("button", { name: /continue/i }).click();
    await page.getByText("SaaS Platform").click();
    await page.getByText("Brand new app").click();
    await page.getByRole("button", { name: /continue/i }).click();
    await expect(page.getByRole("heading", { name: /expected scale/i })).toBeVisible({ timeout: 5000 });
  });

  test("Step 5: scale cards are visible", async ({ page }) => {
    for (const label of ["Solo / hobby", "Small team", "Startup", "Scale-up", "Enterprise"]) {
      await expect(page.getByText(label)).toBeVisible();
    }
  });

  test("Step 5 → Step 6: selecting Startup shows Infra", async ({ page }) => {
    await page.getByText("Startup").click();
    await expect(page.getByRole("heading", { name: /infrastructure/i })).toBeVisible({ timeout: 5000 });
  });

  test("Step 6 → Step 7: selecting Containers shows Backend", async ({ page }) => {
    await page.getByText("Startup").click();
    await page.getByText("Containers").click();
    await expect(page.getByRole("heading", { name: /backend language/i })).toBeVisible({ timeout: 5000 });
  });

  test("Step 7 → Step 8: selecting Node.js shows Name step", async ({ page }) => {
    await page.getByText("Startup").click();
    await page.getByText("Containers").click();
    await page.getByText("Node.js").click();
    await expect(page.getByRole("heading", { name: /name your project/i })).toBeVisible({ timeout: 5000 });
  });
});

// ─── 6. Step 8 — Name + Final Submit ─────────────────────────────────────────

test.describe("Wizard — Step 8 (Name + Submit)", () => {
  test.skip(!HAS_CREDENTIALS, "Requires TEST_EMAIL + TEST_PASSWORD");

  async function goToStep8(page: import("@playwright/test").Page) {
    await goToWizard(page);
    await fillDescription(page, "A SaaS tool for freelance designers to manage clients and invoices.");
    await page.getByRole("button", { name: /continue/i }).click();
    await page.getByText("SaaS Platform").click();
    await page.getByText("Brand new app").click();
    await page.getByRole("button", { name: /continue/i }).click();
    await page.getByText("Startup").click();
    await page.getByText("Containers").click();
    await page.getByText("Node.js").click();
    await expect(page.getByRole("heading", { name: /name your project/i })).toBeVisible({ timeout: 5000 });
  }

  test("renders name input and Create & Generate button", async ({ page }) => {
    await goToStep8(page);
    await expect(page.getByLabel(/project name/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /create & generate/i })).toBeVisible();
  });

  test("Create button enabled when name is filled", async ({ page }) => {
    await goToStep8(page);
    await page.getByLabel(/project name/i).fill("My Freelance Platform");
    await expect(page.getByRole("button", { name: /create & generate/i })).toBeEnabled();
  });

  test("FULL FLOW: create project → generating diagram → redirect to /system-design", async ({ page }) => {
    test.setTimeout(120000);
    await goToStep8(page);

    const projectName = `PW Test ${Date.now()}`;
    await page.getByLabel(/project name/i).fill(projectName);
    await page.getByRole("button", { name: /create & generate/i }).click();

    // Phase 1: creating
    await expect(page.getByText(/creating project/i)).toBeVisible({ timeout: 10000 });

    // Phase 2: generating (may be brief)
    // Final: redirected to /system-design canvas
    await page.waitForURL(/\/system-design/, { timeout: 90000 });
    await expect(page).toHaveURL(/\/dashboard\/project\/.+\/system-design/);
  });
});

// ─── 7. Screenshots ───────────────────────────────────────────────────────────

test.describe("Wizard — screenshots", () => {
  test.skip(!HAS_CREDENTIALS, "Requires TEST_EMAIL + TEST_PASSWORD");

  test("step 1 — description blank", async ({ page }) => {
    await goToWizard(page);
    await page.screenshot({ path: "test-results/wizard-step1-description.png" });
  });

  test("step 2 — app type (wait for AI badge)", async ({ page }) => {
    await goToWizard(page);
    await fillDescription(page, "A SaaS platform for freelance designers to manage clients.");
    await page.getByRole("button", { name: /continue/i }).click();
    await expect(page.getByRole("heading", { name: /what type of application/i })).toBeVisible({ timeout: 5000 });
    await page.waitForTimeout(3000); // let AI recommendation arrive
    await page.screenshot({ path: "test-results/wizard-step2-apptype.png" });
  });

  test("step 8 — name with AI suggestion", async ({ page }) => {
    await goToWizard(page);
    await fillDescription(page, "A SaaS platform for freelance designers to manage clients.");
    await page.getByRole("button", { name: /continue/i }).click();
    await page.getByText("SaaS Platform").click();
    await page.getByText("Brand new app").click();
    await page.getByRole("button", { name: /continue/i }).click();
    await page.getByText("Startup").click();
    await page.getByText("Containers").click();
    await page.getByText("Node.js").click();
    await expect(page.getByRole("heading", { name: /name your project/i })).toBeVisible({ timeout: 5000 });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: "test-results/wizard-step8-name.png" });
  });
});
