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
  const switchButton = page.locator(".home-style-switch");
  assert.equal(await switchButton.getAttribute("href"), "/desktop/");
  assert.match(await switchButton.textContent(), /切换另外一种风格/);

  response = await page.goto(new URL("/desktop/", baseUrl).toString(), { waitUntil: "domcontentloaded" });
  assert.equal(response?.status(), 200);
  await page.waitForFunction(() => document.querySelector("#hypr-desktop")?.dataset.desktopReady === "true");
  await page.waitForTimeout(700);
  assert.equal(await page.locator(".hypr-window").count(), 1, "desktop should start with one welcome window");
  assert.equal(await page.locator(".desktop-icon").count(), 6, "desktop icons are incomplete");
  assert.equal(await page.locator("[data-workspace-target]").count(), 5, "workspace switcher is incomplete");

  await page.locator('.hypr-dock [data-app="blog"]').click();
  await page.locator('.hypr-dock [data-app="tools"]').click();
  await page.waitForFunction(() => document.querySelectorAll(".hypr-window").length === 3);
  await page.waitForFunction(() => [...document.querySelectorAll(".hypr-window[data-app=blog], .hypr-window[data-app=tools]")].every(windowElement => windowElement.classList.contains("is-loaded")));
  assert.equal(await page.locator('.hypr-window[data-app="blog"] iframe').getAttribute("src"), "/blog/");
  assert.equal(await page.locator('.hypr-window[data-app="tools"] iframe').getAttribute("src"), "/tools/");

  const tiledRects = await page.locator('.hypr-window:not(.is-floating)').evaluateAll(elements => elements.map(element => {
    const rect = element.getBoundingClientRect();
    return { width: rect.width, height: rect.height, left: rect.left, top: rect.top };
  }));
  assert.equal(tiledRects.length, 2);
  assert.ok(tiledRects.every(rect => rect.width > 400 && rect.height > 500), "tiled windows did not fill the desktop area");
  assert.notEqual(Math.round(tiledRects[0].left), Math.round(tiledRects[1].left), "tiled windows overlap instead of splitting");

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
  await page.keyboard.press("Alt+f");
  assert.equal(await page.locator('.hypr-window[data-app="tools"]').evaluate(element => element.classList.contains("is-floating")), true);

  const wallBefore = await page.locator("#wallpaper-image").getAttribute("src");
  await page.locator("[data-quick-settings]").click();
  await page.locator("[data-wallpaper-next]").click();
  await page.waitForFunction(previous => document.querySelector("#wallpaper-image")?.getAttribute("src") !== previous, wallBefore);
  assert.equal(errors.length, 0, `desktop emitted page errors: ${errors.join(" | ")}`);
  await page.screenshot({ path: `${process.env.TEMP}\\hypr-desktop-1600x900.png`, fullPage: true });
  await desktop.close();

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
  await mobilePage.screenshot({ path: `${process.env.TEMP}\\hypr-desktop-mobile-390x844.png`, fullPage: true });
  await mobile.close();

  console.log("Hyprland desktop verification passed: homepage entry, desktop icons, dynamic tiling, workspaces, launcher, terminal, floating mode, wallpaper switching, embedded routes, and mobile window behavior.");
} finally {
  await browser.close();
}
