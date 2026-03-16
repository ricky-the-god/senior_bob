/**
 * Live conversation quality test for the LLM-driven guided setup.
 */
import { expect, test } from "@playwright/test";

test.setTimeout(300_000);

const BASE = "http://localhost:3000";

async function waitForBotResponse(page: import("@playwright/test").Page) {
  await page.waitForSelector("text=Thinking", { timeout: 15000 }).catch(() => {
    /* thinking bubble may not appear */
  });
  await page.waitForFunction(() => !document.body.innerText.includes("Thinking"), { timeout: 45000 });
  await page.waitForTimeout(600);
}

// Returns false if the input is gone/disabled (i.e., [[READY]] fired and redirect is imminent)
async function sendMsg(page: import("@playwright/test").Page, text: string): Promise<boolean> {
  const input = page.locator('input[type="text"]:not([disabled]), textarea:not([disabled])').first();
  const visible = await input.isVisible({ timeout: 5000 }).catch(() => false);
  if (!visible) return false;
  await input.fill(text);
  await page.waitForTimeout(200);
  await input.press("Enter");
  return true;
}

// Wait for bot response, then give [[READY]]-triggered redirect a moment to start
async function waitForBotAndMaybeRedirect(page: import("@playwright/test").Page, stepPath: string) {
  await waitForBotResponse(page);
  // If extract triggered, redirect starts shortly after — give it 3s
  await page.waitForTimeout(3000);
  // If already redirected, no point continuing
  return !page.url().includes(stepPath);
}

async function lastBotText(page: import("@playwright/test").Page): Promise<string> {
  const bubbles = page.locator(".rounded-tl-sm");
  const count = await bubbles.count();
  if (count === 0) return "";
  return bubbles.nth(count - 1).innerText();
}

async function createProject(page: import("@playwright/test").Page): Promise<string> {
  await page.goto(`${BASE}/dashboard/create-project`);
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(500);

  // Step 1 — description
  await page.getByRole("textbox").first().fill("An AI code review tool for solo developers.");
  await page.waitForTimeout(300);
  await page.getByRole("button", { name: /continue/i }).click();
  await page.waitForTimeout(1500);

  // Step 2 — app type (SaaS Platform)
  const saasBtn = page.getByRole("button", { name: /saas/i });
  if (await saasBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await saasBtn.click();
    await page.waitForTimeout(800);
  }
  const cont2 = page.getByRole("button", { name: /continue/i });
  if (await cont2.isVisible({ timeout: 2000 }).catch(() => false)) {
    await cont2.click();
    await page.waitForTimeout(1500);
  }

  // Step 3 — origin (Brand new app)
  const brandNew = page.getByRole("button", { name: /brand new/i });
  if (await brandNew.isVisible({ timeout: 3000 }).catch(() => false)) {
    await brandNew.click();
    await page.waitForTimeout(600);
  }
  const cont3 = page.getByRole("button", { name: /continue/i });
  if (await cont3.isVisible({ timeout: 2000 }).catch(() => false)) {
    await cont3.click();
    await page.waitForTimeout(1500);
  }

  // Step 4 — project name
  const nameBox = page.getByRole("textbox").first();
  if (await nameBox.isVisible({ timeout: 3000 }).catch(() => false)) {
    await nameBox.fill("CodeReview AI");
    await page.waitForTimeout(300);
  }
  const cont4 = page.getByRole("button", { name: /continue|create|done|finish/i }).first();
  if (await cont4.isVisible({ timeout: 2000 }).catch(() => false)) {
    await cont4.click();
    await page.waitForTimeout(4000);
  }

  await page.waitForURL(/\/project\//, { timeout: 25000 });
  const url = page.url();
  const match = url.match(/\/project\/([a-f0-9-]+)/);
  if (!match) throw new Error(`Could not extract project ID from ${url}`);
  console.log("✓ Project created:", match[1]);
  return match[1];
}

test("Guided Setup — full LLM conversation: workflow → features → integrations", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });

  const pid = await createProject(page);

  // ── STEP 1: Workflow ────────────────────────────────────────────────────────
  console.log("\n── STEP 1: Workflow ──");
  await page.goto(`${BASE}/dashboard/project/${pid}/guided-setup/workflow`);
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(1000);
  await page.screenshot({ path: "tests/screenshots/convo_1_workflow_start.png" });

  // Turn 1: vague
  console.log('  → Sending vague answer: "a code review tool"');
  await sendMsg(page, "a code review tool");
  const done1 = await waitForBotAndMaybeRedirect(page, "/workflow");
  const reply1 = await lastBotText(page);
  console.log("  ← Bot:", reply1.slice(0, 250));
  await page.screenshot({ path: "tests/screenshots/convo_1_workflow_reply1.png" });

  if (!done1 && page.url().includes("/workflow")) {
    // Turn 2: detailed
    console.log("  → Sending detailed answer...");
    const sent = await sendMsg(
      page,
      "It helps solo devs paste their code and get line-by-line feedback like a senior engineer. " +
        "User pastes code snippet, picks the language, clicks Review, and gets back a markdown report " +
        "with bugs, style issues, and specific suggestions. Main flow: login → paste code → click Review → read AI feedback.",
    );
    if (sent) {
      const done2 = await waitForBotAndMaybeRedirect(page, "/workflow");
      const reply2 = await lastBotText(page);
      console.log("  ← Bot:", reply2.slice(0, 250));
      await page.screenshot({ path: "tests/screenshots/convo_1_workflow_reply2.png" });

      if (!done2 && page.url().includes("/workflow")) {
        await sendMsg(page, "That's everything. The goal is to help solo devs ship cleaner code faster.");
        await waitForBotAndMaybeRedirect(page, "/workflow");
      }
    }
  }

  await page.waitForURL(/\/guided-setup$/, { timeout: 60000 });
  console.log("  ✓ Workflow done →", page.url());
  await page.screenshot({ path: "tests/screenshots/convo_1_workflow_done.png" });

  // ── STEP 2: Features ────────────────────────────────────────────────────────
  console.log("\n── STEP 2: Features ──");
  await page.goto(`${BASE}/dashboard/project/${pid}/guided-setup/features`);
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(1000);
  await page.screenshot({ path: "tests/screenshots/convo_2_features_start.png" });

  // Select chips
  for (const chip of ["Authentication", "AI generation", "Dashboard", "File upload"]) {
    const btn = page.getByRole("button", { name: chip });
    if (await btn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await btn.click();
      await page.waitForTimeout(200);
    }
  }
  await page.screenshot({ path: "tests/screenshots/convo_2_features_chips.png" });

  const confirmBtn = page.getByRole("button", { name: /confirm|done/i }).first();
  if (await confirmBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await confirmBtn.click();
    console.log("  → Chips confirmed: Authentication, AI generation, Dashboard, File upload");
  }
  await page.waitForTimeout(400);
  const fDone1 = await waitForBotAndMaybeRedirect(page, "/features");

  const featReply1 = await lastBotText(page);
  console.log("  ← Bot:", featReply1.slice(0, 250));
  await page.screenshot({ path: "tests/screenshots/convo_2_features_reply1.png" });

  if (!fDone1 && page.url().includes("/features")) {
    const fSent2 = await sendMsg(
      page,
      "Also search and filtering to find past reviews. No payments or admin panel needed.",
    );
    if (fSent2) {
      const fDone2 = await waitForBotAndMaybeRedirect(page, "/features");
      const featReply2 = await lastBotText(page);
      console.log("  ← Bot:", featReply2.slice(0, 250));
      await page.screenshot({ path: "tests/screenshots/convo_2_features_reply2.png" });

      if (!fDone2 && page.url().includes("/features")) {
        await sendMsg(page, "That's the complete list.");
        await waitForBotAndMaybeRedirect(page, "/features");
      }
    }
  }

  await page.waitForURL(/\/guided-setup$/, { timeout: 60000 });
  console.log("  ✓ Features done →", page.url());
  await page.screenshot({ path: "tests/screenshots/convo_2_features_done.png" });

  // ── STEP 3: Integrations ────────────────────────────────────────────────────
  console.log("\n── STEP 3: Integrations ──");
  await page.goto(`${BASE}/dashboard/project/${pid}/guided-setup/integrations`);
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(1000);
  await page.screenshot({ path: "tests/screenshots/convo_3_integrations_start.png" });

  // Select OpenAI + Supabase chips
  for (const chip of ["OpenAI", "Supabase"]) {
    const btn = page.getByRole("button", { name: chip });
    if (await btn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await btn.click();
      await page.waitForTimeout(200);
    }
  }

  const confirmBtn2 = page.getByRole("button", { name: /confirm|done/i }).first();
  if (await confirmBtn2.isVisible({ timeout: 3000 }).catch(() => false)) {
    await confirmBtn2.click();
    console.log("  → Chips confirmed: OpenAI, Supabase");
  }
  await page.waitForTimeout(400);
  const iDone1 = await waitForBotAndMaybeRedirect(page, "/integrations");

  const intReply1 = await lastBotText(page);
  console.log("  ← Bot:", intReply1.slice(0, 250));
  await page.screenshot({ path: "tests/screenshots/convo_3_integrations_reply1.png" });

  if (!iDone1 && page.url().includes("/integrations")) {
    const iSent2 = await sendMsg(
      page,
      "Next.js 15 on Vercel, Supabase for auth and DB, OpenAI GPT-4o for AI reviews. No compliance constraints or budget limits.",
    );
    if (iSent2) {
      const iDone2 = await waitForBotAndMaybeRedirect(page, "/integrations");
      const intReply2 = await lastBotText(page);
      console.log("  ← Bot:", intReply2.slice(0, 250));
      await page.screenshot({ path: "tests/screenshots/convo_3_integrations_reply2.png" });

      if (!iDone2 && page.url().includes("/integrations")) {
        await sendMsg(page, "That covers everything for integrations.");
        await waitForBotAndMaybeRedirect(page, "/integrations");
      }
    }
  }

  await page.waitForURL(/\/guided-setup$/, { timeout: 60000 });
  console.log("  ✓ Integrations done →", page.url());
  await page.screenshot({ path: "tests/screenshots/convo_3_integrations_done.png" });

  // ── Final ───────────────────────────────────────────────────────────────────
  console.log("\n✓ ALL 3 STEPS COMPLETE");
  await page.screenshot({ path: "tests/screenshots/convo_all_done.png", fullPage: true });

  expect(page.url()).toMatch(/\/guided-setup$/);
});
