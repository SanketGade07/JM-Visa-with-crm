/**
 * Regression: Drive tab layout stability across create/upload/rename/delete/refresh.
 *
 * Usage: node scripts/regression-drive-layout.mjs
 * Requires: dev server on http://localhost:3000, playwright chromium.
 */

import { chromium } from "playwright";
import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE_URL = process.env.CRM_BASE_URL ?? "http://localhost:3000";
const LOGIN_EMAIL = process.env.CRM_LOGIN_EMAIL ?? "admin@jmvisa.com";
const LOGIN_PASSWORD = process.env.CRM_LOGIN_PASSWORD ?? "admin123";
const VIEWPORT = { width: 1440, height: 900 };
const MAX_ALLOWED_WIDTH_LOSS_PX = 2;
const DRIVE_MODAL = 'div.z-\\[300\\][role="dialog"]';

function sampleLayout() {
  const main = document.querySelector("main.flex-1");
  const header = document.querySelector("header");
  const shell = document.querySelector("div.relative.flex.min-h-screen");
  const tabScroller = document.querySelector("[data-crm-scroll-container]");

  const rect = (el) =>
    el
      ? {
          width: el.getBoundingClientRect().width,
          right: el.getBoundingClientRect().right,
        }
      : null;

  const mainRect = rect(main);
  const deadZonePx =
    mainRect?.right != null ? Math.max(0, window.innerWidth - mainRect.right) : null;

  return {
    windowInnerWidth: window.innerWidth,
    main: mainRect,
    header: rect(header),
    tabScroller: tabScroller
      ? {
          rect: rect(tabScroller),
          overflowInline: tabScroller.style.overflow || "(empty)",
        }
      : null,
    deadZonePx,
    shellChildCount: shell?.children?.length ?? null,
    refreshSpinning: !!document.querySelector('[aria-label="Refresh folder"] .animate-spin'),
    modalOpen: !!document.querySelector('[role="dialog"]'),
    toastVisible: !!document.querySelector('[role="status"][aria-live="polite"]'),
    body: {
      overflowInline: document.body.style.overflow || "(empty)",
      paddingRightInline: document.body.style.paddingRight || "(empty)",
    },
  };
}

async function login(page) {
  await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle" });
  await page.fill('input[type="email"], input[placeholder*="email" i]', LOGIN_EMAIL);
  await page.fill('input[type="password"]', LOGIN_PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL(`${BASE_URL}/**`, { timeout: 15000 });
}

async function goToDrive(page) {
  const browsePromise = page.waitForResponse(
    (res) =>
      res.url().includes("/api/drive/browse?") &&
      res.request().method() === "GET" &&
      res.status() === 200,
    { timeout: 120000 },
  );
  await page.click('button:has-text("Drive")');
  await browsePromise;
  await page.waitForSelector("text=/Showing \\d+ files/", { timeout: 60000 });
  await page.waitForFunction(
    () => !document.querySelector('[aria-label="Refresh folder"] .animate-spin'),
    { timeout: 120000 },
  );
}

class LayoutMonitor {
  constructor(page) {
    this.page = page;
    this.baseline = null;
    this.samples = [];
  }

  async capture(label) {
    const sample = await this.page.evaluate(sampleLayout);
    this.samples.push({ label, ...sample });
    return sample;
  }

  async setBaseline(label = "baseline") {
    const sample = await this.capture(label);
    this.baseline = sample;
    return sample;
  }

  analyzeFlow(flowName) {
    const baselineWidth = this.baseline?.main?.width ?? null;
    const flowSamples = this.samples.slice(
      this.samples.findIndex((s) => s.label === `${flowName}_start`) + 1,
    );
    const endIdx = flowSamples.findIndex((s) => s.label === `${flowName}_end`);
    const relevant = endIdx >= 0 ? flowSamples.slice(0, endIdx + 1) : flowSamples;

    let maxWidthLoss = 0;
    let maxDeadZone = 0;
    for (const s of relevant) {
      if (baselineWidth != null && s.main?.width != null) {
        maxWidthLoss = Math.max(maxWidthLoss, baselineWidth - s.main.width);
      }
      if (s.deadZonePx != null) {
        maxDeadZone = Math.max(maxDeadZone, s.deadZonePx);
      }
    }

    const pass =
      maxWidthLoss <= MAX_ALLOWED_WIDTH_LOSS_PX && maxDeadZone <= MAX_ALLOWED_WIDTH_LOSS_PX;

    return {
      flow: flowName,
      pass,
      baselineMainWidth: baselineWidth,
      maxMainWidthLossPx: maxWidthLoss,
      maxDeadZonePx: maxDeadZone,
      sampleCount: relevant.length,
      refreshSpinningObserved: relevant.some((s) => s.refreshSpinning),
      toastVisibleObserved: relevant.some((s) => s.toastVisible),
    };
  }
}

async function openNewMenu(page) {
  const newMenuBtn = page.locator('button[aria-haspopup="menu"]').first();
  await newMenuBtn.click();
  await page.locator('[role="menu"]').waitFor({ state: "visible", timeout: 5000 });
}

async function waitForModalClose(page) {
  await page.locator(DRIVE_MODAL).waitFor({ state: "detached", timeout: 30000 });
}

async function samplePostActionWindow(monitor, prefix, iterations = 6) {
  for (let i = 0; i < iterations; i++) {
    await monitor.page.waitForTimeout(400);
    await monitor.capture(`${prefix}_t+${(i + 1) * 400}ms`);
  }
}

async function testCreateFolder(page, monitor) {
  await monitor.capture("create_folder_start");
  await openNewMenu(page);
  await page.locator('[role="menuitem"]').filter({ hasText: /new folder/i }).click();
  await page.locator(DRIVE_MODAL).waitFor({ state: "visible" });
  await monitor.capture("create_folder_modal_open");

  const folderName = `regression-folder-${Date.now()}`;
  await page.locator(`${DRIVE_MODAL} input`).fill(folderName);

  const createPromise = page.waitForResponse(
    (res) =>
      res.url().includes("/api/drive/browse") && res.request().method() === "POST",
    { timeout: 120000 },
  );
  await page.locator(`${DRIVE_MODAL} button:has-text("Create")`).click();
  await createPromise;
  await waitForModalClose(page);
  await monitor.capture("create_folder_modal_closed");
  await samplePostActionWindow(monitor, "create_folder");
  await monitor.capture("create_folder_end");
  return folderName;
}

async function testCreateFile(page, monitor) {
  await monitor.capture("create_file_start");
  await openNewMenu(page);
  await page.locator('[role="menuitem"]').filter({ hasText: /^new file$/i }).click();
  await page.locator(DRIVE_MODAL).waitFor({ state: "visible" });

  const fileName = `regression-file-${Date.now()}.txt`;
  await page.locator(`${DRIVE_MODAL} input`).fill(fileName);

  const createPromise = page.waitForResponse(
    (res) =>
      res.url().includes("/api/drive/browse") && res.request().method() === "POST",
    { timeout: 120000 },
  );
  await page.locator(`${DRIVE_MODAL} button:has-text("Create")`).click();
  await createPromise;
  await waitForModalClose(page);
  await monitor.capture("create_file_modal_closed");
  await samplePostActionWindow(monitor, "create_file");
  await monitor.capture("create_file_end");
  return fileName;
}

async function testUpload(page, monitor) {
  await monitor.capture("upload_start");

  const uploadPromise = page.waitForResponse(
    (res) =>
      res.url().includes("/api/drive/browse") &&
      res.request().method() === "POST" &&
      res.request().postData()?.includes?.("multipart") !== false,
    { timeout: 120000 },
  );

  const fileName = `regression-upload-${Date.now()}.txt`;
  await page.locator('input[type="file"]:not([webkitdirectory])').first().setInputFiles({
    name: fileName,
    mimeType: "text/plain",
    buffer: Buffer.from("regression upload content"),
  });

  try {
    await uploadPromise;
  } catch {
    // multipart detection can vary; still sample layout
  }

  await monitor.capture("upload_posted");
  await samplePostActionWindow(monitor, "upload");
  await monitor.capture("upload_end");
  return fileName;
}

const DRIVE_CONTEXT_MENU = 'div.z-\\[200\\][role="menu"]';

async function openItemActions(page, itemName) {
  await page.getByText(itemName, { exact: true }).first().waitFor({ state: "visible", timeout: 30000 });
  const actionsBtn = page.locator(`button[aria-label="Actions for ${itemName}"]`).first();
  await actionsBtn.waitFor({ state: "visible", timeout: 15000 });
  await actionsBtn.click();
  await page.locator(DRIVE_CONTEXT_MENU).waitFor({ state: "visible", timeout: 5000 });
}

async function clickContextMenuItem(page, label) {
  await page
    .locator(`${DRIVE_CONTEXT_MENU} [role="menuitem"]`)
    .filter({ hasText: new RegExp(label, "i") })
    .first()
    .click();
}

async function testRename(page, monitor, itemName) {
  await monitor.capture("rename_start");
  await openItemActions(page, itemName);
  await clickContextMenuItem(page, "Rename");
  await page.locator(DRIVE_MODAL).waitFor({ state: "visible" });

  const renamed = `${itemName}-renamed`;
  await page.locator(`${DRIVE_MODAL} input`).fill(renamed);

  const patchPromise = page.waitForResponse(
    (res) =>
      res.url().includes("/api/drive/browse") &&
      (res.request().method() === "PATCH" || res.request().method() === "PUT"),
    { timeout: 120000 },
  );
  await page.locator(`${DRIVE_MODAL} button:has-text("Save"), ${DRIVE_MODAL} button:has-text("Rename")`).first().click();
  try {
    await patchPromise;
  } catch {
    // API may use POST; continue sampling
  }
  await waitForModalClose(page);
  await monitor.capture("rename_modal_closed");
  await samplePostActionWindow(monitor, "rename");
  await monitor.capture("rename_end");
  return renamed;
}

async function testDelete(page, monitor, itemName) {
  await monitor.capture("delete_start");
  await openItemActions(page, itemName);
  await clickContextMenuItem(page, "Delete");
  await page.locator(DRIVE_MODAL).waitFor({ state: "visible" });

  const deletePromise = page.waitForResponse(
    (res) =>
      res.url().includes("/api/drive/browse") && res.request().method() === "DELETE",
    { timeout: 120000 },
  );
  await page.locator(`${DRIVE_MODAL} button:has-text("Delete")`).click();
  try {
    await deletePromise;
  } catch {
    // continue
  }
  await waitForModalClose(page);
  await monitor.capture("delete_modal_closed");
  await samplePostActionWindow(monitor, "delete");
  await monitor.capture("delete_end");
}

async function testManualRefresh(page, monitor) {
  await monitor.capture("manual_refresh_start");
  const refreshPromise = page.waitForResponse(
    (res) =>
      res.url().includes("/api/drive/browse?") &&
      res.request().method() === "GET" &&
      res.status() === 200,
    { timeout: 120000 },
  );
  await page.locator('[aria-label="Refresh folder"]').click();
  await monitor.capture("manual_refresh_spinning");
  try {
    await refreshPromise;
  } catch {
    // continue
  }
  await page.waitForFunction(
    () => !document.querySelector('[aria-label="Refresh folder"] .animate-spin'),
    { timeout: 120000 },
  );
  await monitor.capture("manual_refresh_complete");
  await monitor.capture("manual_refresh_end");
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: VIEWPORT });
  const page = await context.newPage();
  const monitor = new LayoutMonitor(page);
  const results = { flows: [], errors: [] };

  try {
    await login(page);
    await page.addStyleTag({ content: "html { overflow-y: scroll !important; }" });
    await goToDrive(page);
    await monitor.setBaseline("drive_baseline");

    const folderName = await testCreateFolder(page, monitor);
    results.flows.push(monitor.analyzeFlow("create_folder"));

    const fileName = await testCreateFile(page, monitor);
    results.flows.push(monitor.analyzeFlow("create_file"));

    const uploadName = await testUpload(page, monitor);
    results.flows.push(monitor.analyzeFlow("upload"));

    try {
      const renamed = await testRename(page, monitor, fileName);
      results.flows.push(monitor.analyzeFlow("rename"));
      await testDelete(page, monitor, renamed);
      results.flows.push(monitor.analyzeFlow("delete"));
    } catch (err) {
      results.errors.push({ step: "rename_or_delete", message: String(err) });
      results.flows.push({ flow: "rename", pass: false, error: String(err) });
      results.flows.push({ flow: "delete", pass: false, error: String(err) });
    }

    try {
      await testDelete(page, monitor, folderName);
    } catch {
      // folder cleanup best-effort
    }
    try {
      await testDelete(page, monitor, uploadName);
    } catch {
      // upload cleanup best-effort
    }

    await testManualRefresh(page, monitor);
    results.flows.push(monitor.analyzeFlow("manual_refresh"));

    results.allPass = results.flows.every((f) => f.pass === true);
    results.viewport = VIEWPORT;
    results.thresholdPx = MAX_ALLOWED_WIDTH_LOSS_PX;

    console.log("\n========== REGRESSION SUMMARY ==========");
    console.log(JSON.stringify(results, null, 2));

    const outPath = join(__dirname, "regression-drive-layout-output.json");
    writeFileSync(outPath, JSON.stringify({ results, samples: monitor.samples }, null, 2));
    console.log(`\nFull log: ${outPath}`);

    if (!results.allPass) {
      process.exit(1);
    }
  } catch (err) {
    console.error(err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

main();
