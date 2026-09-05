import assert from "node:assert/strict";
import { existsSync } from "node:fs";

import { chromium } from "../studio/node_modules/playwright-core/index.mjs";

const baseUrl = process.argv[2] || "http://127.0.0.1:4311";
const verifyEncryptionFixture = process.argv.includes("--encryption-fixture");
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
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));

  let response = await page.goto(new URL("/", baseUrl).toString(), { waitUntil: "domcontentloaded" });
  assert.equal(response?.status(), 200);
  await page.waitForTimeout(1_000);
  assert.equal(await page.locator(".hugo-post-card").count(), 8, "home page must contain eight posts");
  const widths = await page.evaluate(() => ({ body: document.body.scrollWidth, viewport: innerWidth }));
  assert.ok(widths.body <= widths.viewport, `mobile page overflows: ${widths.body}px > ${widths.viewport}px`);

  const searchButton = page.locator("#search-container button").first();
  assert.equal(await searchButton.count(), 1, "search button is missing");
  await searchButton.click();
  const searchInput = page.locator("#search-panel input:visible, #search-container input:visible, input[type=search]:visible").first();
  await searchInput.waitFor({ state: "visible", timeout: 3_000 });
  await searchInput.fill("海龟汤");
  await page.waitForTimeout(1_500);
  const searchText = await page.locator("#search-panel").innerText();
  assert.match(searchText, /海龟汤/, "Pagefind search did not return the expected article");

  if (verifyEncryptionFixture) {
    response = await page.goto(new URL("/posts/codex-hugo-encryption-check/", baseUrl).toString(), { waitUntil: "domcontentloaded" });
    assert.equal(response?.status(), 200);
    await page.waitForTimeout(300);
    assert.equal((await page.locator("body").innerText()).includes("This exact plaintext must not survive"), false);
    const password = page.getByLabel("文章密码");
    await password.fill("wrong-password");
    await page.locator(".hugo-password-submit").click();
    await page.waitForFunction(() => document.querySelector("[role=alert]")?.textContent?.includes("密码错误"));
    await password.fill("codex-test-password");
    await page.locator(".hugo-password-submit").click();
    await page.waitForFunction(() => document.body.innerText.includes("This exact plaintext must not survive"));
    assert.equal(await page.locator(".hugo-protected-extras:visible").count(), 2);
    const iframe = page.locator('.web-page-embed iframe[src*="/web-pages/editor/html/codex-check/index.html"]');
    assert.equal(await iframe.count(), 1, "embedded HTML iframe markup was not restored after decryption");
    await iframe.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    const frame = page.frames().find((candidate) => candidate.url().includes("/web-pages/editor/html/codex-check/index.html"));
    assert.ok(frame, "embedded HTML iframe did not load");
    assert.equal(await frame.locator("#embedded-check").innerText(), "Embedded HTML and JavaScript are working.");
    assert.equal(await frame.locator("html").getAttribute("data-script-ready"), "true");
  }

  const routes = ["about", "albums", "albums/AcgExample", "anime", "atom", "devices", "diary", "friends", "projects", "rss", "skills", "timeline"];
  for (const route of routes) {
    const routeErrors = [];
    const routePage = await context.newPage();
    routePage.on("pageerror", (error) => routeErrors.push(error.message));
    const routeResponse = await routePage.goto(new URL(`/${route}/`, baseUrl).toString(), { waitUntil: "domcontentloaded" });
    await routePage.waitForTimeout(200);
    assert.equal(routeResponse?.status(), 200, `/${route}/ did not load`);
    assert.equal(routeErrors.length, 0, `/${route}/ raised: ${routeErrors.join("; ")}`);
    await routePage.close();
  }
  assert.equal(errors.length, 0, `browser raised: ${errors.join("; ")}`);
  console.log(`Browser verification passed: search, mobile layout, ${verifyEncryptionFixture ? "encryption, embedded HTML/JS, and " : ""}${routes.length} specialty pages.`);
} finally {
  await browser.close();
}
