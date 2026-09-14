import assert from "node:assert/strict";
import { existsSync } from "node:fs";

import { chromium } from "../studio/node_modules/playwright-core/index.mjs";

const baseUrl = process.argv[2] || "http://127.0.0.1:4321";
const executablePath = [
  process.env.PLAYWRIGHT_CHROME_PATH,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
].filter(Boolean).find(existsSync);
if (!executablePath) throw new Error("Chrome was not found");

const browser = await chromium.launch({ executablePath, headless: true });

try {
  const desktop = await browser.newContext({ viewport: { width: 1600, height: 900 } });
  const page = await desktop.newPage();
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));

  let response = await page.goto(new URL("/", baseUrl).toString(), { waitUntil: "domcontentloaded" });
  assert.equal(response?.status(), 200);
  const avatarSwitch = page.locator(".avatar-style-switch");
  assert.equal(await avatarSwitch.getAttribute("href"), "/desktop/");
  assert.match(await avatarSwitch.textContent(), /切换另外一种风格/);
  await avatarSwitch.click();
  await page.waitForFunction(() => document.querySelector(".desktop-transition-overlay")?.dataset.transitionState === "particles");
  await page.waitForFunction(() => document.querySelector(".desktop-transition-overlay")?.dataset.transitionState === "loading");
  await page.waitForFunction(() => document.querySelector(".desktop-transition-overlay")?.dataset.transitionState === "barrage");
  await page.waitForTimeout(320);
  assert.equal(await page.locator(".desktop-transition-barrage").evaluate(element => getComputedStyle(element).opacity), "1", "barrage stage stays hidden");
  assert.ok(Number(await page.locator(".desktop-transition-loading").evaluate(element => getComputedStyle(element).opacity)) < .02, "loading indicator does not leave before the barrage");
  assert.equal(await page.locator(".desktop-transition-barrage span").evaluateAll(elements => elements.some(element => {
    const rect = element.getBoundingClientRect();
    return rect.left < innerWidth && rect.right > 0;
  })), true, "barrage labels animate before they become visible");
  await page.waitForURL(/\/desktop\/\?from=classic/, { timeout: 8_000 });
  await page.waitForFunction(() => document.querySelector("#hypr-desktop")?.dataset.desktopReady === "true");
  await page.waitForFunction(() => document.querySelector("#hypr-desktop")?.dataset.entryState === "complete", { timeout: 4_000 });
  await page.waitForTimeout(200);
  assert.equal(await page.locator(".hypr-window").count(), 1, "desktop should start with one welcome window");
  assert.equal(await page.locator(".desktop-icon").count(), 6, "desktop icons are incomplete");
  assert.equal(await page.locator("[data-workspace-target]").count(), 5, "workspace switcher is incomplete");
  assert.equal(await page.locator("#hypr-desktop").getAttribute("data-layout-mode"), "stacked", "desktop should default to the HyDE stacked layout");
  assert.equal(await page.locator("[data-layout-toggle]").getAttribute("aria-pressed"), "true", "layout toggle state does not match the default stack");

  await page.locator('.hypr-dock [data-app="blog"]').click();
  await page.locator('.hypr-dock [data-app="tools"]').click();
  await page.waitForFunction(() => document.querySelectorAll(".hypr-window").length === 3);
  await page.waitForFunction(() => [...document.querySelectorAll(".hypr-window[data-app=blog], .hypr-window[data-app=tools]")].every(windowElement => windowElement.classList.contains("is-loaded")));
  await page.waitForTimeout(650);
  assert.equal(await page.locator('.hypr-window[data-app="blog"] iframe').getAttribute("src"), "/blog/");
  assert.equal(await page.locator('.hypr-window[data-app="tools"] iframe').getAttribute("src"), "/tools/");

  const stackedRects = await page.locator('.hypr-window.is-floating').evaluateAll(elements => elements.map(element => {
    const rect = element.getBoundingClientRect();
    return { width: rect.width, height: rect.height, left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom };
  }));
  assert.equal(stackedRects.length, 3, "applications should open in the stacked layout");
  assert.equal(new Set(stackedRects.map(rect => Math.round(rect.width))).size, 1, "stacked windows do not share one readable size");
  assert.ok(new Set(stackedRects.map(rect => `${Math.round(rect.left)}:${Math.round(rect.top)}`)).size > 1, "stacked windows do not form a visible cascade");
  assert.ok(stackedRects.every(rect => rect.width >= 600 && rect.height >= 420 && rect.left >= 0 && rect.right <= 1600 && rect.top >= 45 && rect.bottom <= 900), "stacked layout squeezes or overflows a window");

  await page.keyboard.press("Alt+g");
  await page.waitForFunction(() => document.querySelector("#hypr-desktop")?.dataset.layoutMode === "tiled");
  await page.waitForTimeout(550);
  const tiledRects = await page.locator('.hypr-window:not(.is-workspace-hidden)').evaluateAll(elements => elements.map(element => {
    const rect = element.getBoundingClientRect();
    return { width: rect.width, height: rect.height, left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom };
  }));
  const tiledLayer = await page.locator("#windows-layer").evaluate(element => {
    const rect = element.getBoundingClientRect();
    return { width: rect.width, height: rect.height, left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom };
  });
  const tiledArea = tiledRects.reduce((total, rect) => total + rect.width * rect.height, 0);
  assert.equal(await page.locator("[data-layout-toggle]").getAttribute("aria-pressed"), "false", "layout toggle did not enter tiled mode");
  assert.equal(tiledRects.length, 3, "all open windows were not included in the tiled layout");
  assert.ok(tiledRects.every(rect => rect.left >= tiledLayer.left - 1 && rect.right <= tiledLayer.right + 1 && rect.top >= tiledLayer.top - 1 && rect.bottom <= tiledLayer.bottom + 1), "a tiled window overflows the usable work area");
  assert.ok(tiledArea >= tiledLayer.width * tiledLayer.height * .995, "gapless tiling leaves unused work-area space");
  assert.equal(await page.locator(".hypr-dock [data-launcher-open]").isVisible(), true, "all-app launcher is hidden behind tiled windows");
  await page.keyboard.press("Alt+g");
  await page.waitForFunction(() => document.querySelector("#hypr-desktop")?.dataset.layoutMode === "stacked");
  await page.waitForTimeout(550);
  const restoredPositions = await page.locator('.hypr-window:not(.is-workspace-hidden)').evaluateAll(elements => elements.map(element => {
    const rect = element.getBoundingClientRect();
    return `${Math.round(rect.left)}:${Math.round(rect.top)}:${Math.round(rect.width)}`;
  }));
  assert.ok(new Set(restoredPositions).size > 1, "second shortcut press did not restore the stacked layout");

  await page.keyboard.press("Alt+2");
  await page.waitForFunction(() => document.querySelector("#hypr-desktop")?.dataset.activeWorkspace === "2");
  assert.equal(await page.locator('.hypr-window:not(.is-workspace-hidden)').count(), 0);
  await page.keyboard.press("Alt+Enter");
  await page.waitForFunction(() => document.querySelector('.hypr-window[data-app="terminal"][data-workspace="2"]'));
  assert.equal(await page.locator('.hypr-window[data-app="terminal"] .terminal-command input').count(), 1);

  await page.keyboard.press("Alt+Space");
  assert.equal(await page.locator("#launcher").isVisible(), true);
  assert.equal(await page.locator(".launcher-app").count(), 8);
  await page.keyboard.press("Escape");
  assert.equal(await page.locator("#launcher").isVisible(), false);

  await page.keyboard.press("Alt+1");
  await page.waitForFunction(() => document.querySelector("#hypr-desktop")?.dataset.activeWorkspace === "1");

  const wallBefore = await page.locator("#wallpaper-image").getAttribute("src");
  await page.locator("[data-quick-settings]").click();
  await page.locator("[data-wallpaper-next]").click();
  await page.waitForFunction(previous => document.querySelector("#wallpaper-image")?.getAttribute("src") !== previous, wallBefore);
  assert.equal(errors.length, 0, `desktop emitted page errors: ${errors.join(" | ")}`);
  await page.screenshot({ path: `${process.env.TEMP}\\hypr-desktop-1600x900.png`, fullPage: true });
  await desktop.close();

  const compact = await browser.newContext({ viewport: { width: 1024, height: 768 } });
  const compactPage = await compact.newPage();
  response = await compactPage.goto(new URL("/desktop/", baseUrl).toString(), { waitUntil: "domcontentloaded" });
  assert.equal(response?.status(), 200);
  await compactPage.waitForFunction(() => document.querySelector("#hypr-desktop")?.dataset.desktopReady === "true");
  await compactPage.locator('.hypr-dock [data-app="blog"]').click();
  await compactPage.locator('.hypr-dock [data-app="tools"]').click();
  await compactPage.waitForTimeout(650);
  const compactRects = await compactPage.locator(".hypr-window").evaluateAll(elements => elements.map(element => {
    const rect = element.getBoundingClientRect();
    return { width: rect.width, left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom };
  }));
  assert.ok(compactRects.every(rect => rect.width >= 360 && rect.left >= 0 && rect.right <= 1024 && rect.top >= 45 && rect.bottom <= 768), "compact desktop resolution squeezes or overflows a window");
  await compactPage.keyboard.press("Alt+g");
  await compactPage.waitForFunction(() => document.querySelector("#hypr-desktop")?.dataset.layoutMode === "tiled");
  await compactPage.waitForTimeout(550);
  const compactTiledRects = await compactPage.locator(".hypr-window").evaluateAll(elements => elements.map(element => {
    const rect = element.getBoundingClientRect();
    return { width: rect.width, height: rect.height, left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom };
  }));
  const compactLayerArea = await compactPage.locator("#windows-layer").evaluate(element => element.clientWidth * element.clientHeight);
  assert.ok(compactTiledRects.every(rect => rect.left >= 0 && rect.right <= 1024 && rect.top >= 45 && rect.bottom <= 768), "compact tiled layout overflows the viewport");
  assert.ok(compactTiledRects.reduce((total, rect) => total + rect.width * rect.height, 0) >= compactLayerArea * .995, "compact tiled layout leaves empty work-area space");
  await compact.close();

  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const mobilePage = await mobile.newPage();
  response = await mobilePage.goto(new URL("/desktop/", baseUrl).toString(), { waitUntil: "domcontentloaded" });
  assert.equal(response?.status(), 200);
  await mobilePage.waitForFunction(() => document.querySelector("#hypr-desktop")?.dataset.desktopReady === "true");
  await mobilePage.locator('.hypr-dock [data-app="blog"]').tap();
  await mobilePage.waitForFunction(() => document.querySelector('.hypr-window[data-app="blog"]')?.classList.contains("is-loaded"));
  const mobileRect = await mobilePage.locator('.hypr-window[data-app="blog"]').evaluate(element => {
    const rect = element.getBoundingClientRect();
    return { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom };
  });
  assert.ok(mobileRect.left >= 0 && mobileRect.right <= 390 && mobileRect.top >= 45 && mobileRect.bottom <= 844, "mobile app window overflows the viewport");
  assert.equal(await mobilePage.locator('.hypr-window[data-app="welcome"]').evaluate(element => getComputedStyle(element).pointerEvents), "none");
  await mobilePage.locator("[data-layout-toggle]").tap();
  assert.equal(await mobilePage.locator("#hypr-desktop").getAttribute("data-layout-mode"), "tiled", "mobile layout switch does not respond");
  await mobilePage.waitForTimeout(500);
  const mobileWindows = await mobilePage.locator(".hypr-window").evaluateAll(elements => elements.map(element => {
    const rect = element.getBoundingClientRect();
    return { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom };
  }));
  assert.ok(mobileWindows.every(rect => rect.left >= 0 && rect.right <= 390 && rect.top >= 45 && rect.bottom <= 844), "mobile layout mode creates a narrow or overflowing window");
  const mobileLayerArea = await mobilePage.locator("#windows-layer").evaluate(element => element.clientWidth * element.clientHeight);
  assert.ok(mobileWindows.reduce((total, rect) => total + (rect.right - rect.left) * (rect.bottom - rect.top), 0) >= mobileLayerArea * .995, "mobile tiled layout leaves empty work-area space");
  await mobilePage.screenshot({ path: `${process.env.TEMP}\\hypr-desktop-mobile-390x844.png`, fullPage: true });
  await mobile.close();

  console.log("Hyprland desktop verification passed: homepage entry, default stacked windows, reversible gapless tiling, always-on-top app launcher, workspaces, terminal, wallpaper switching, embedded routes, compact screens, and mobile behavior.");
} finally {
  await browser.close();
}
