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
    await page.route("https://umami.vmss.cn/script.js", (route) => route.fulfill({ contentType: "application/javascript", body: "" }));
    await page.route("https://umami.vmss.cn/api/share/hJgv7MWzlfs3JTnu", (route) => route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({ websiteId: "993c6970-8f42-4804-a055-38b6b9c01810", token: "read-only-qa-token" }),
    }));
    await page.route("https://umami.vmss.cn/api/websites/993c6970-8f42-4804-a055-38b6b9c01810/active", (route) => route.fulfill({ contentType: "application/json", body: JSON.stringify({ visitors: 3 }) }));
    await page.route("https://umami.vmss.cn/api/websites/993c6970-8f42-4804-a055-38b6b9c01810/stats?**", (route) => route.fulfill({ contentType: "application/json", body: JSON.stringify({ pageviews: 61756, visitors: 24388, visits: 19853 }) }));
  }
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));

  let response = await page.goto(new URL("/", baseUrl).toString(), { waitUntil: "domcontentloaded" });
  assert.equal(response?.status(), 200);
  await page.waitForTimeout(500);
  assert.equal(await page.locator(".home-stage").count(), 1, "home workspace is missing");
  assert.equal(await page.locator('#site-wallpaper source[srcset="/assets/mobile-banner/1.webp"]').count(), 1, "mobile home wallpaper is missing");
  assert.equal(await page.locator('.home-backdrop source[srcset="/image/v/2870.webp"]').count(), 1, "mobile home cover is missing");
  assert.equal(await page.locator('script[src="https://umami.vmss.cn/script.js"][defer][data-website-id="993c6970-8f42-4804-a055-38b6b9c01810"]').count(), 1, "self-hosted Umami tracker is missing");
  await page.waitForFunction(() => [...document.querySelectorAll("[data-umami-stat]")].every((node) => node.textContent !== "--"), undefined, { timeout: 15_000 });
  assert.equal(await page.locator('[data-umami-stat="active"]').count(), 1, "active visitor statistic is missing");
  assert.equal(await page.locator('[data-umami-stat="visitors"]').count(), 1, "unique visitor statistic is missing");
  assert.equal(await page.locator('[data-umami-stat="visits"]').count(), 1, "visit statistic is missing");
  assert.match(await page.locator("#home-visitors").innerText(), /当前访客[\s\S]*累计访客[\s\S]*累计访问次数/);
  const mobileStatsPosition = await page.evaluate(() => ({
    kickerBottom: document.querySelector(".home-kicker")?.getBoundingClientRect().bottom,
    statsTop: document.querySelector(".visitor-strip")?.getBoundingClientRect().top,
    statsBottom: document.querySelector(".visitor-strip")?.getBoundingClientRect().bottom,
    statusTop: document.querySelector(".status-panel")?.getBoundingClientRect().top,
  }));
  assert.ok(mobileStatsPosition.statsTop >= mobileStatsPosition.kickerBottom, "mobile statistics are not below WELCOME / 2026");
  assert.ok(mobileStatsPosition.statsBottom <= mobileStatsPosition.statusTop, "mobile statistics are not above the status panel");
  if (localRun) {
    assert.equal(await page.locator('[data-umami-stat="active"]').innerText(), "3");
    assert.equal(await page.locator('[data-umami-stat="visitors"]').innerText(), "24,388");
    assert.equal(await page.locator('[data-umami-stat="visits"]').innerText(), "19,853");
  }
  assert.equal(await page.locator('a[href^="/discuss/"], [data-forum-auth-button], [data-forum-admin-nav]').count(), 0, "forum navigation remains");
  assert.equal(await page.locator(".mobile-dock:visible").count(), 1, "mobile dock is missing");
  let widths = await page.evaluate(() => ({ body: document.body.scrollWidth, viewport: innerWidth }));
  assert.ok(widths.body <= widths.viewport, `mobile home overflows: ${widths.body}px > ${widths.viewport}px`);

  response = await page.goto(new URL("/blog/", baseUrl).toString(), { waitUntil: "domcontentloaded" });
  assert.equal(response?.status(), 200);
  assert.ok(await page.locator(".post-card").count() > 80, "blog articles were not preserved");
  assert.equal(await page.locator('#site-wallpaper source[srcset="/assets/mobile-banner/2.webp"]').count(), 1, "mobile blog wallpaper is missing");
  assert.equal(await page.locator('a[href*="md.vmss.cn"]').count(), 0, "private writing entry is exposed");
  assert.equal(await page.locator("[data-umami-stat]").count(), 0, "homepage statistics leaked into blog page");
  await page.locator("[data-search-trigger]").click();
  const searchInput = page.locator("#search-input");
  await searchInput.fill("海龟汤");
  await page.waitForFunction(() => document.querySelector("#search-results")?.textContent?.includes("海龟汤"), undefined, { timeout: 15_000 });
  assert.match(await page.locator("#search-results").innerText(), /海龟汤/, "Pagefind search did not return the expected article");

  const forumResponse = await page.request.get(new URL("/discuss/", baseUrl).toString());
  assert.equal(forumResponse.status(), 404, "removed forum page is still published");
  const editorResponse = await page.request.get(new URL("/forum-editor/forum.html", baseUrl).toString());
  assert.equal(editorResponse.status(), 404, "removed forum editor is still published");

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
  console.log("Browser verification passed: self-hosted Umami stats, home, blog search, tools, article, forum removal, and mobile overflow checks.");
} finally {
  await browser.close();
}
