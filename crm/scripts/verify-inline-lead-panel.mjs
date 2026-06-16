/**
 * Manual-test checklist automation for inline create-lead panel.
 * Run: node scripts/verify-inline-lead-panel.mjs
 * Requires dev server at http://localhost:3000
 */
import { chromium } from "playwright";

const BASE = process.env.CRM_BASE_URL ?? "http://localhost:3000";
const results = [];

function pass(name, detail = "") {
  results.push({ name, ok: true, detail });
  console.log(`✓ ${name}${detail ? ` — ${detail}` : ""}`);
}

function fail(name, detail = "") {
  results.push({ name, ok: false, detail });
  console.error(`✗ ${name}${detail ? ` — ${detail}` : ""}`);
}

async function login(page, email, password) {
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 15000 });
}

async function goToLeads(page) {
  await page.goto(`${BASE}/leads`, { waitUntil: "networkidle" });
  await page.waitForSelector('button:has-text("New")', { timeout: 15000 });
}

async function openCreatePanel(page) {
  const newBtn = page.locator('header button:has-text("New")').first();
  await newBtn.waitFor({ state: "visible", timeout: 10000 });
  await newBtn.click();
  // Panel animates 0fr → 1fr; wait for wizard content in DOM then for visibility.
  await page.waitForSelector('[aria-label="Close wizard"]', { state: "attached", timeout: 10000 });
  await page.waitForTimeout(400);
}

async function isWizardVisible(page) {
  const closeBtn = page.locator('[aria-label="Close wizard"]');
  return (await closeBtn.count()) > 0 && (await closeBtn.isVisible());
}

async function main() {
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    await login(page, "admin@jmvisa.com", "admin123");
    await goToLeads(page);
    await page.waitForTimeout(300);

    // 1. Open panel
    await openCreatePanel(page);
    if (await isWizardVisible(page)) {
      pass("Open: + New expands inline wizard");
    } else {
      fail("Open: + New expands inline wizard");
    }

    // 5. Quick tabs + export remain visible
    const quickTabs = page.locator(".crm-header__tabs--list");
    const exportBtn = page.locator('button[aria-label="Export leads"]');
    if ((await quickTabs.isVisible()) && (await exportBtn.isVisible())) {
      pass("Header: quick status tabs and export stay visible while panel open");
    } else {
      fail("Header: quick status tabs and export stay visible while panel open");
    }

    // + New hidden/disabled while open
    const newBtn = page.locator('button:has-text("New")').first();
    if (await newBtn.isDisabled()) {
      pass("Open: + New button disabled while panel is open");
    } else {
      fail("Open: + New button disabled while panel is open");
    }

    // 2. Cancel collapses panel
    await page.click('button:has-text("Cancel")');
    await page.waitForTimeout(400);
    if (!(await isWizardVisible(page))) {
      pass("Cancel: wizard collapses after Cancel");
    } else {
      fail("Cancel: wizard collapses after Cancel");
    }

    // 3. Form reset on re-open
    await openCreatePanel(page);
    await page.click('button:has-text("Study Abroad")');
    await page.waitForSelector("#create-lead-client-name", { timeout: 5000 });
    await page.fill("#create-lead-client-name", "Reset Test Lead");
    await page.click('[aria-label="Close wizard"]');
    await page.waitForTimeout(400);

    await openCreatePanel(page);
    await page.click('button:has-text("Study Abroad")');
    await page.waitForSelector("#create-lead-client-name", { timeout: 5000 });
    const nameValue = await page.inputValue("#create-lead-client-name");
    if (nameValue === "") {
      pass("Form reset: re-opening panel shows empty form");
    } else {
      fail("Form reset: re-opening panel shows empty form", `got "${nameValue}"`);
    }

    // Close before submit test
    await page.click('[aria-label="Close wizard"]');
    await page.waitForTimeout(400);

    // 4. Submit success closes panel and navigates to detail
    await openCreatePanel(page);
    await page.click('button:has-text("Study Abroad")');
    await page.waitForSelector("#create-lead-client-name");
    const uniqueName = `E2E Lead ${Date.now()}`;
    await page.fill("#create-lead-client-name", uniqueName);
    await page.fill("#create-lead-email", `e2e-${Date.now()}@test.com`);
    await page.locator("#create-lead-phone input, #create-lead-phone").first().fill("9876543210");
    await page.click('button:has-text("Next")');

    await page.waitForSelector("#create-lead-immigration-country", { timeout: 5000 });
    await page.click("#create-lead-immigration-country");
    await page.keyboard.type("Malaysia");
    await page.keyboard.press("Enter");
    await page.fill("#create-lead-login-id", "portal-user");
    await page.fill("#create-lead-password", "portal-pass");
    await page.click('button:has-text("Next")');
    await page.click('button:has-text("Next")');
    await page.click('button:has-text("Create Lead")');

    await page.waitForURL(/\/leads\/[^/]+/, { timeout: 15000 });
    const onDetail = page.url().includes("/leads/") && !page.url().endsWith("/leads");
    await page.waitForTimeout(400);
    const wizardGone = !(await isWizardVisible(page));

    if (onDetail && wizardGone) {
      pass("Submit: navigates to lead detail and collapses panel", page.url());
    } else {
      fail("Submit: navigates to lead detail and collapses panel", `url=${page.url()} wizardVisible=${!wizardGone}`);
    }

    // 6. Legacy /leads/new redirect
    await page.goto(`${BASE}/leads/new`, { waitUntil: "networkidle" });
    await page.waitForTimeout(500);
    const legacyUrl = page.url();
    const legacyPanelClosed = !(await isWizardVisible(page));
    if (legacyUrl.endsWith("/leads") && legacyPanelClosed) {
      pass("Legacy URL: /leads/new redirects to /leads with panel closed");
    } else {
      fail("Legacy URL: /leads/new redirects to /leads with panel closed", `url=${legacyUrl}`);
    }

    // 7. Permissions: user without canModifyLeads
    await page.evaluate(() => {
      localStorage.setItem("visa_crm_role", "OTHER");
      localStorage.setItem(
        "visa_crm_user",
        JSON.stringify({
          id: "other-test",
          name: "Other User",
          email: "other@test.com",
          role: "OTHER",
          allowedTabs: ["Dashboard"],
        })
      );
    });
    await page.goto(`${BASE}/leads`, { waitUntil: "networkidle" });
    await page.waitForTimeout(500);
    const newBtnOther = page.locator('button:has-text("New")').first();
    const disabled = await newBtnOther.isDisabled();
    const panelClosed = !(await isWizardVisible(page));
    if (disabled && panelClosed) {
      pass("Permissions: OTHER role cannot open create panel (+ New disabled)");
    } else {
      fail("Permissions: OTHER role cannot open create panel", `disabled=${disabled} panelClosed=${panelClosed}`);
    }

    const failed = results.filter((r) => !r.ok);
    console.log("\n--- Summary ---");
    console.log(`${results.length - failed.length}/${results.length} passed`);
    if (failed.length) {
      process.exitCode = 1;
    }
  } catch (err) {
    console.error("Test runner error:", err);
    try {
      const pages = browser?.contexts?.()?.[0]?.pages?.() ?? [];
      if (pages[0]) {
        await pages[0].screenshot({ path: "scripts/verify-inline-lead-panel-failure.png", fullPage: true });
        console.error("Saved screenshot to scripts/verify-inline-lead-panel-failure.png");
      }
    } catch {
      // ignore screenshot errors
    }
    process.exitCode = 1;
  } finally {
    if (browser) await browser.close();
  }
}

main();
