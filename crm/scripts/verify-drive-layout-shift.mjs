/**
 * One-off DevTools-style verification for Drive post-create layout shift.
 * Samples body/main inline styles + computed widths during modal open/close/refresh.
 *
 * Usage: node scripts/verify-drive-layout-shift.mjs
 * Requires: dev server on http://localhost:3000, playwright chromium installed.
 */

import { chromium } from "playwright";

const BASE_URL = process.env.CRM_BASE_URL ?? "http://localhost:3000";
const LOGIN_EMAIL = process.env.CRM_LOGIN_EMAIL ?? "admin@jmvisa.com";
const LOGIN_PASSWORD = process.env.CRM_LOGIN_PASSWORD ?? "admin123";

function sampleLayout() {
  const body = document.body;
  const html = document.documentElement;
  const main = document.querySelector("main.flex-1");
  const shell = document.querySelector("div.relative.flex.min-h-screen");
  const tabScroller = document.querySelector(".flex-1.overflow-y-auto");
  const header = document.querySelector("header");
  const sidebar = document.querySelector("aside");

  const rect = (el) =>
    el
      ? {
          width: el.getBoundingClientRect().width,
          left: el.getBoundingClientRect().left,
          right: el.getBoundingClientRect().right,
        }
      : null;

  return {
    ts: new Date().toISOString(),
    windowInnerWidth: window.innerWidth,
    docClientWidth: html.clientWidth,
    scrollbarWidth: window.innerWidth - html.clientWidth,
    body: {
      overflowInline: body.style.overflow || "(empty)",
      paddingRightInline: body.style.paddingRight || "(empty)",
      computedPaddingRight: getComputedStyle(body).paddingRight,
      computedWidth: getComputedStyle(body).width,
      clientWidth: body.clientWidth,
      overflowY: getComputedStyle(body).overflowY,
    },
    html: {
      clientWidth: html.clientWidth,
      scrollWidth: html.scrollWidth,
      overflowY: getComputedStyle(html).overflowY,
      scrollbarGutter: getComputedStyle(html).scrollbarGutter,
    },
    sidebar: sidebar
      ? {
          computedWidth: getComputedStyle(sidebar).width,
          clientWidth: sidebar.clientWidth,
          rect: rect(sidebar),
        }
      : null,
    shell: shell
      ? {
          computedWidth: getComputedStyle(shell).width,
          clientWidth: shell.clientWidth,
          rect: rect(shell),
          children: Array.from(shell.children).map((child) => ({
            tag: child.tagName,
            className: child.className?.slice?.(0, 80) ?? "",
            rect: rect(child),
          })),
        }
      : null,
    main: main
      ? {
          computedWidth: getComputedStyle(main).width,
          clientWidth: main.clientWidth,
          offsetWidth: main.offsetWidth,
          rect: rect(main),
        }
      : null,
    header: header
      ? {
          computedWidth: getComputedStyle(header).width,
          clientWidth: header.clientWidth,
          rect: rect(header),
        }
      : null,
    tabScroller: tabScroller
      ? {
          overflowInline: tabScroller.style.overflow || "(empty)",
          overflowY: getComputedStyle(tabScroller).overflowY,
          scrollbarGutter: getComputedStyle(tabScroller).scrollbarGutter,
          clientWidth: tabScroller.clientWidth,
          scrollHeight: tabScroller.scrollHeight,
          clientHeight: tabScroller.clientHeight,
          rect: rect(tabScroller),
        }
      : null,
    refreshSpinning: !!document.querySelector('[aria-label="Refresh folder"] .animate-spin'),
    modalOpen: !!document.querySelector('[role="dialog"]'),
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
    { timeout: 120000 }
  );
  await page.click('button:has-text("Drive")');
  await browsePromise;
  await page.waitForSelector("text=/Showing \\d+ files/", { timeout: 60000 });
  await page.waitForFunction(
    () => !document.querySelector('[aria-label="Refresh folder"] .animate-spin'),
    { timeout: 120000 }
  );
}

const DRIVE_MODAL = 'div.z-\\[300\\][role="dialog"]';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const samples = [];

  const capture = async (label) => {
    const sample = await page.evaluate(sampleLayout);
    samples.push({ label, ...sample });
    console.log(`\n--- ${label} ---`);
    console.log(JSON.stringify(sample, null, 2));
  };

  try {
    await login(page);
    // Force classic scrollbar so body paddingRight compensation triggers (Windows Chrome).
    await page.addStyleTag({ content: "html { overflow-y: scroll !important; }" });
    await goToDrive(page);
    await capture("baseline_drive_loaded");

    const newMenuBtn = page.locator('button[aria-haspopup="menu"]').first();
    await newMenuBtn.waitFor({ state: "visible", timeout: 15000 });
    await newMenuBtn.click();
    await page.locator('[role="menu"]').waitFor({ state: "visible", timeout: 5000 });
    await page.locator('[role="menuitem"]').filter({ hasText: /new folder/i }).click();
    await page.locator(DRIVE_MODAL).waitFor({ state: "visible" });
    await capture("modal_open");

    const folderName = `layout-verify-${Date.now()}`;
    await page.locator(`${DRIVE_MODAL} input`).fill(folderName);

    const createPromise = page.waitForResponse(
      (res) =>
        res.url().includes("/api/drive/browse") &&
        res.request().method() === "POST",
      { timeout: 120000 }
    );
    const browseRefreshPromise = page.waitForResponse(
      (res) =>
        res.url().includes("/api/drive/browse") &&
        res.request().method() === "GET" &&
        res.status() === 200,
      { timeout: 120000 }
    );

    await page.locator(`${DRIVE_MODAL} button:has-text("Create")`).click();

    let createRes;
    try {
      createRes = await createPromise;
      await capture(`create_response_${createRes.status()}`);
    } catch (err) {
      await capture("create_request_failed");
      throw err;
    }

    await page.locator(DRIVE_MODAL).waitFor({ state: "detached", timeout: 30000 });
    await capture("modal_just_closed");

    for (let i = 0; i < 8; i++) {
      await page.waitForTimeout(400);
      await capture(`post_close_t+${(i + 1) * 400}ms`);
    }

    try {
      await browseRefreshPromise;
      await capture("silent_refresh_completed");
    } catch {
      await capture("silent_refresh_timeout_or_skipped");
    }

    const baseline = samples.find((s) => s.label === "baseline_drive_loaded");
    const postClose = samples.filter((s) => s.label.startsWith("post_close"));
    const maxShift = postClose.reduce((max, s) => {
      const delta =
        baseline?.main?.rect?.width != null && s.main?.rect?.width != null
          ? baseline.main.rect.width - s.main.rect.width
          : 0;
      return Math.max(max, delta);
    }, 0);

    const bodyPaddingDuringModal = samples.find((s) => s.label === "modal_open")?.body
      ?.paddingRightInline;
    const bodyPaddingAfterClose = samples.find((s) => s.label === "modal_just_closed")?.body
      ?.paddingRightInline;

    console.log("\n========== SUMMARY ==========");
    console.log(
      JSON.stringify(
        {
          viewport: { width: 1440, height: 900 },
          baselineMainWidth: baseline?.main?.rect?.width,
          maxMainWidthLossPx: maxShift,
          bodyPaddingDuringModal,
          bodyPaddingAfterClose,
          refreshWasSpinningDuringPostClose: postClose.some((s) => s.refreshSpinning),
          gapDisappearedAfterRefresh: samples
            .filter((s) => s.label.includes("refresh"))
            .map((s) => ({
              label: s.label,
              mainWidth: s.main?.rect?.width,
            })),
        },
        null,
        2
      )
    );
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
