import { expect, test } from "@playwright/test";

import path from "node:path";

const SCREENSHOT_DIR = path.join(__dirname, "screenshots");

test.describe("System Design — Edge connections", () => {
  test("open canvas, add nodes, connect with arrow tool", async ({ page }) => {
    test.setTimeout(90_000);

    // ── Navigate to the first project ────────────────────────────────────────
    await page.goto("/dashboard/projects");
    await page.waitForLoadState("networkidle");

    const firstProject = page.locator(".grid a, [href*='/dashboard/project/']").first();
    await firstProject.click();
    await page.waitForLoadState("networkidle");
    await page.screenshot({ path: `${SCREENSHOT_DIR}/sd-01-project-overview.png`, fullPage: true });

    // ── Navigate to System Design ─────────────────────────────────────────────
    await page.getByRole("link", { name: /system design/i }).click();
    await page.waitForLoadState("networkidle");
    await page.screenshot({ path: `${SCREENSHOT_DIR}/sd-02-system-design-page.png`, fullPage: true });

    // ── Open canvas if empty state ────────────────────────────────────────────
    const openBtn = page.getByRole("button", { name: /open architect mode/i });
    if (await openBtn.isVisible({ timeout: 3000 })) {
      await openBtn.click();
      await page.waitForTimeout(600);
    }
    await page.screenshot({ path: `${SCREENSHOT_DIR}/sd-03-canvas-open.png`, fullPage: true });

    // ── Drag two fresh nodes onto the canvas ──────────────────────────────────
    // Drop them into a predictable area within the visible canvas viewport.
    const canvas = page.locator(".react-flow__renderer").first();
    const canvasBox = await canvas.boundingBox();
    if (!canvasBox) throw new Error("Canvas not found");

    // Use explicit screen-space positions that land inside the visible viewport.
    const dropX1 = canvasBox.x + canvasBox.width * 0.3;
    const dropY = canvasBox.y + canvasBox.height * 0.5;
    const dropX2 = canvasBox.x + canvasBox.width * 0.7;

    const serviceItem = page
      .locator("[aria-label*='Drag to add Service'], [title*='Service']")
      .or(page.getByText("Service").locator(".."))
      .first();
    if (await serviceItem.isVisible({ timeout: 3000 })) {
      await serviceItem.dragTo(canvas, {
        targetPosition: { x: canvasBox.width * 0.3, y: canvasBox.height * 0.5 },
      });
      await page.waitForTimeout(400);
    }

    const dbItem = page
      .locator("[aria-label*='Drag to add Database'], [title*='Database']")
      .or(page.getByText("Database").locator(".."))
      .first();
    if (await dbItem.isVisible({ timeout: 2000 })) {
      await dbItem.dragTo(canvas, {
        targetPosition: { x: canvasBox.width * 0.7, y: canvasBox.height * 0.5 },
      });
      await page.waitForTimeout(400);
    }

    // ── Fit view to bring all nodes (including newly dropped ones) into viewport
    const fitBtn = page
      .locator("button[title='Fit view']")
      .or(page.locator("button").filter({ hasText: /^Fit$/ }))
      .first();
    if (await fitBtn.isVisible({ timeout: 2000 })) {
      await fitBtn.click();
      await page.waitForTimeout(600);
    }
    await page.screenshot({ path: `${SCREENSHOT_DIR}/sd-05-two-nodes.png`, fullPage: true });

    // ── Count edges BEFORE connecting ─────────────────────────────────────────
    const edgesBefore = await page.locator(".react-flow__edge").count();

    // ── Activate "Arrow" connect mode ─────────────────────────────────────────
    const arrowBtn = page.getByTitle(/arrow/i).or(page.locator("button").filter({ hasText: /^Arrow$/i }));
    if (await arrowBtn.isVisible({ timeout: 2000 })) {
      await arrowBtn.click();
      await page.waitForTimeout(300);
    }
    await page.screenshot({ path: `${SCREENSHOT_DIR}/sd-06-connect-mode-active.png`, fullPage: true });

    // ── Click-to-connect: source handle → target handle ───────────────────────
    // Pick the last two nodes in the DOM — the ones we just dragged are appended
    // last, so they are the freshest and guaranteed to have no edge between them.
    const allNodes = page.locator(".react-flow__node");
    const nodeCount = await allNodes.count();

    if (nodeCount >= 2) {
      const firstNode = allNodes.nth(nodeCount - 2);
      const secondNode = allNodes.nth(nodeCount - 1);

      // Hover the first node so handles become visible
      const firstNodeBox = await firstNode.boundingBox();
      if (!firstNodeBox) throw new Error("First node has no bounding box");
      await page.mouse.move(firstNodeBox.x + firstNodeBox.width / 2, firstNodeBox.y + firstNodeBox.height / 2);
      await page.waitForTimeout(300);
      await page.screenshot({ path: `${SCREENSHOT_DIR}/sd-07-hover-source-node.png`, fullPage: true });

      // Click the bottom (source) handle — index 0 after handle reorder
      // base-node.tsx HANDLE_POSITIONS: [bottom, top, left, right]
      const firstNodeHandles = firstNode.locator(".react-flow__handle");
      const handleCount = await firstNodeHandles.count();
      expect(handleCount).toBeGreaterThan(0);

      // bottom = index 0 (first) per the HANDLE_POSITIONS order in base-node.tsx
      const sourceHandle = firstNodeHandles.nth(0);
      const sourceBox = await sourceHandle.boundingBox();
      if (!sourceBox) throw new Error("Source handle has no bounding box");

      await page.mouse.click(sourceBox.x + sourceBox.width / 2, sourceBox.y + sourceBox.height / 2);
      await page.waitForTimeout(400);
      await page.screenshot({ path: `${SCREENSHOT_DIR}/sd-08-pending-connection.png`, fullPage: true });

      // Move toward the second node to trigger magnetic snap
      const secondNodeBox = await secondNode.boundingBox();
      if (!secondNodeBox) throw new Error("Second node has no bounding box");
      await page.mouse.move(secondNodeBox.x + secondNodeBox.width / 2, secondNodeBox.y + secondNodeBox.height / 2);
      await page.waitForTimeout(300);
      await page.screenshot({ path: `${SCREENSHOT_DIR}/sd-09-magnetic-snap.png`, fullPage: true });

      // Click the top (target) handle on the second node — index 1 after reorder
      // base-node.tsx HANDLE_POSITIONS: [bottom, top, left, right]
      const secondNodeHandles = secondNode.locator(".react-flow__handle");
      const targetHandle = secondNodeHandles.nth(1); // top = index 1
      const targetBox = await targetHandle.boundingBox();
      if (!targetBox) throw new Error("Target handle has no bounding box");

      await page.mouse.click(targetBox.x + targetBox.width / 2, targetBox.y + targetBox.height / 2);
      await page.waitForTimeout(600);
      await page.screenshot({ path: `${SCREENSHOT_DIR}/sd-10-edge-created.png`, fullPage: true });

      // ── Assert a NEW edge was created ────────────────────────────────────────
      const edgesAfter = await page.locator(".react-flow__edge").count();
      expect(edgesAfter).toBeGreaterThan(edgesBefore);
    }

    // ── Verify edges are curved (bezier), not step-style ─────────────────────
    // Bezier paths contain 'C' curves; SmoothStep paths only contain 'M', 'L', 'Q'
    const firstEdgePath = page.locator(".react-flow__edge path").first();
    if (await firstEdgePath.isVisible({ timeout: 2000 })) {
      const d = await firstEdgePath.getAttribute("d");
      expect(d).toMatch(/C[\s\d-]/); // bezier curve command (C may be followed by digits without space)
    }
  });
});
