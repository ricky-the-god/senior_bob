import { expect, type Page, test } from "@playwright/test";

async function scrollToFooter(page: Page) {
  await page.evaluate(() => {
    const footer = document.querySelector("footer");
    if (footer) footer.scrollIntoView({ block: "end" });
  });
  // Wait for the 3-second framer-motion dash-draw animation to complete
  await page.waitForTimeout(3500);
}

async function shotFooter(page: Page, path: string) {
  const rect = await page.evaluate(() => {
    const el = document.querySelector("footer");
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: r.left, y: r.top, width: r.width, height: r.height };
  });
  expect(rect).not.toBeNull();
  await page.screenshot({ path, clip: rect!, animations: "disabled" });
}

test.describe("Footer neon text effect", () => {
  test("dark mode — footer at rest", async ({ page }) => {
    await page.goto("http://localhost:3000");
    await page.waitForLoadState("networkidle");
    await page.evaluate(() => document.documentElement.classList.add("dark"));
    await scrollToFooter(page);
    await shotFooter(page, "tests/screenshots/footer-neon-dark-rest.png");
  });

  test("dark mode — footer on hover", async ({ page }) => {
    await page.goto("http://localhost:3000");
    await page.waitForLoadState("networkidle");
    await page.evaluate(() => document.documentElement.classList.add("dark"));
    await scrollToFooter(page);

    const box = await page.evaluate(() => {
      const svgs = document.querySelectorAll("footer svg");
      const svg = svgs[svgs.length - 1] as SVGSVGElement | undefined;
      if (!svg) return null;
      const r = svg.getBoundingClientRect();
      return { x: r.left, y: r.top, width: r.width, height: r.height };
    });
    expect(box).not.toBeNull();

    if (box) {
      // Center hover
      await page.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.65);
      await page.waitForTimeout(350);
      await shotFooter(page, "tests/screenshots/footer-neon-dark-hover-center.png");

      // Left edge
      await page.mouse.move(box.x + box.width * 0.08, box.y + box.height * 0.65);
      await page.waitForTimeout(250);
      await shotFooter(page, "tests/screenshots/footer-neon-dark-hover-left.png");

      // Right edge
      await page.mouse.move(box.x + box.width * 0.92, box.y + box.height * 0.65);
      await page.waitForTimeout(250);
      await shotFooter(page, "tests/screenshots/footer-neon-dark-hover-right.png");
    }
  });

  test("light mode — footer at rest", async ({ page }) => {
    await page.goto("http://localhost:3000");
    await page.waitForLoadState("networkidle");
    await page.evaluate(() => document.documentElement.classList.remove("dark"));
    await scrollToFooter(page);
    await shotFooter(page, "tests/screenshots/footer-neon-light-rest.png");
  });

  test("light mode — footer on hover", async ({ page }) => {
    await page.goto("http://localhost:3000");
    await page.waitForLoadState("networkidle");
    await page.evaluate(() => document.documentElement.classList.remove("dark"));
    await scrollToFooter(page);

    const box = await page.evaluate(() => {
      const svgs = document.querySelectorAll("footer svg");
      const svg = svgs[svgs.length - 1] as SVGSVGElement | undefined;
      if (!svg) return null;
      const r = svg.getBoundingClientRect();
      return { x: r.left, y: r.top, width: r.width, height: r.height };
    });
    expect(box).not.toBeNull();

    if (box) {
      await page.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.65);
      await page.waitForTimeout(350);
      await shotFooter(page, "tests/screenshots/footer-neon-light-hover-center.png");

      await page.mouse.move(box.x + box.width * 0.08, box.y + box.height * 0.65);
      await page.waitForTimeout(250);
      await shotFooter(page, "tests/screenshots/footer-neon-light-hover-left.png");

      await page.mouse.move(box.x + box.width * 0.92, box.y + box.height * 0.65);
      await page.waitForTimeout(250);
      await shotFooter(page, "tests/screenshots/footer-neon-light-hover-right.png");
    }
  });
});
