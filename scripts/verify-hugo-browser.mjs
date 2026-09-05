import assert from "node:assert/strict";
import { existsSync } from "node:fs";

import { chromium } from "../studio/node_modules/playwright-core/index.mjs";

const baseUrl = process.argv[2] || "http://127.0.0.1:4311";
const executablePath = [
  process.env.PLAYWRIGHT_CHROME_PATH,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
].filter(Boolean).find(existsSync);
if (!executablePath) throw new Error("Chrome was not found");

const browser = await chromium.launch({ executablePath, headless: true });
try {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  const localRun = ["127.0.0.1", "localhost"].includes(new URL(baseUrl).hostname);
  if (localRun) {
    await page.route("**/api/forum/session", (route) => route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({ authenticated: true, user: { id: "qa", username: "forum-qa", role: "admin" }, stats: { topics: 0, comments: 0, users: 1 } }),
    }));
    await page.route("**/api/forum/topics", (route) => route.fulfill({ contentType: "application/json", body: JSON.stringify({ topics: [] }) }));
  }
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));

  let response = await page.goto(new URL("/", baseUrl).toString(), { waitUntil: "domcontentloaded" });
  assert.equal(response?.status(), 200);
  await page.waitForTimeout(500);
  assert.equal(await page.locator(".home-stage").count(), 1, "home workspace is missing");
  assert.equal(await page.locator('#site-wallpaper source[srcset="/assets/mobile-banner/1.webp"]').count(), 1, "mobile home wallpaper is missing");
  assert.equal(await page.locator('.home-backdrop source[srcset="/image/v/2870.webp"]').count(), 1, "mobile home cover is missing");
  assert.equal(await page.locator('[data-visitor-stat="total"]').count(), 1, "home visitor total is missing");
  assert.equal(await page.locator(".mobile-dock:visible").count(), 1, "mobile dock is missing");
  let widths = await page.evaluate(() => ({ body: document.body.scrollWidth, viewport: innerWidth }));
  assert.ok(widths.body <= widths.viewport, `mobile home overflows: ${widths.body}px > ${widths.viewport}px`);
  if (localRun) {
    await page.waitForFunction(() => document.querySelector("[data-forum-auth-button] span")?.textContent === "forum-qa");
    await page.locator("[data-sidebar-open]").click();
    await page.locator("[data-forum-auth-button]").click();
    await page.waitForURL((url) => url.pathname === "/discuss/" && !url.searchParams.has("auth"));
    await page.waitForFunction(() => document.querySelector("[data-forum-account]")?.hidden === false);
    assert.equal(await page.locator("#forum-auth-dialog[open]").count(), 0, "authenticated user was asked to log in again");
  }

  response = await page.goto(new URL("/blog/", baseUrl).toString(), { waitUntil: "domcontentloaded" });
  assert.equal(response?.status(), 200);
  assert.ok(await page.locator(".post-card").count() > 80, "blog articles were not preserved");
  assert.equal(await page.locator('#site-wallpaper source[srcset="/assets/mobile-banner/2.webp"]').count(), 1, "mobile blog wallpaper is missing");
  assert.equal(await page.locator('a[href*="md.vmss.cn"]').count(), 0, "private writing entry is exposed");
  assert.equal(await page.locator("[data-visitor-stat]").count(), 0, "visitor totals leaked into blog page");
  await page.locator("[data-search-trigger]").click();
  const searchInput = page.locator("#search-input");
  await searchInput.fill("海龟汤");
  await page.waitForFunction(() => document.querySelector("#search-results")?.textContent?.includes("海龟汤"), undefined, { timeout: 15_000 });
  assert.match(await page.locator("#search-results").innerText(), /海龟汤/, "Pagefind search did not return the expected article");

  response = await page.goto(new URL("/discuss/", baseUrl).toString(), { waitUntil: "domcontentloaded" });
  assert.equal(response?.status(), 200);
  assert.equal(await page.locator("#forum-app").count(), 1, "forum page is missing");
  assert.equal(await page.locator('#site-wallpaper source[srcset="/assets/mobile-banner/3.webp"]').count(), 1, "mobile forum wallpaper is missing");
  widths = await page.evaluate(() => ({ body: document.body.scrollWidth, viewport: innerWidth }));
  assert.ok(widths.body <= widths.viewport, `mobile forum overflows: ${widths.body}px > ${widths.viewport}px`);
  const editorResponse = await page.request.get(new URL("/forum-editor/forum.html", baseUrl).toString());
  assert.equal(editorResponse.status(), 200, "forum editor bundle is missing");

  response = await page.goto(new URL("/tools/", baseUrl).toString(), { waitUntil: "domcontentloaded" });
  assert.equal(response?.status(), 200);
  assert.equal(await page.locator('#site-wallpaper source[srcset="/assets/mobile-banner/4.webp"]').count(), 1, "mobile tools wallpaper is missing");
  await page.locator("[data-json-input]").fill('{"ok":true}');
  await page.locator("[data-json-format]").click();
  assert.match(await page.locator("[data-json-input]").inputValue(), /\n  "ok": true\n/);

  response = await page.goto(new URL("/posts/20260326/", baseUrl).toString(), { waitUntil: "domcontentloaded" });
  assert.equal(response?.status(), 200);
  assert.equal(await page.locator("#hugo-article-content").count(), 1, "article body is missing");
  assert.equal(await page.locator('#site-wallpaper img[src="/assets/desktop-banner/2.webp"]').count(), 1, "desktop article wallpaper is missing");
  assert.equal(await page.locator('img[src*="image.vmss.cn"]').count(), 0, "remote image.vmss.cn reference remains");
  assert.equal(errors.length, 0, `browser raised: ${errors.join("; ")}`);
  console.log("Browser verification passed: home, blog search, forum, tools, article, and mobile overflow checks.");
} finally {
  await browser.close();
}
