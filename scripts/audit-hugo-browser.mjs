import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { chromium } from "../studio/node_modules/playwright-core/index.mjs";

const baseUrl = new URL(process.argv[2] || "http://127.0.0.1:4321");
const localRun = ["127.0.0.1", "localhost"].includes(baseUrl.hostname);
const outputDirectory = process.argv[3] || join(tmpdir(), "astro-hugo-audit");
const executablePath = [
  process.env.PLAYWRIGHT_CHROME_PATH,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
].filter(Boolean).find(existsSync);
if (!executablePath) throw new Error("Chrome was not found");

await mkdir(outputDirectory, { recursive: true });
const routes = ["/", "/blog/", "/friends/", "/tools/", "/guestbook/", "/posts/20260326/"];
const viewports = [
  { name: "desktop", width: 1440, height: 1000 },
  { name: "mobile", width: 390, height: 844 },
];
const proxy = process.env.PLAYWRIGHT_PROXY;
const browser = await chromium.launch({
  executablePath,
  headless: true,
  ...(proxy ? { proxy: { server: proxy } } : {}),
});
const report = [];

try {
  for (const viewport of viewports) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    if (localRun) {
      await page.route("https://challenges.cloudflare.com/turnstile/v0/api.js**", (route) => route.fulfill({
        contentType: "application/javascript",
        body: `globalThis.turnstile={render(container,options){const mock=document.createElement("div");mock.className="turnstile-visual-mock";mock.dataset.turnstileMock="true";mock.textContent="Cloudflare Turnstile";container.append(mock);queueMicrotask(()=>options.callback("visual-test-token"));return "visual-widget"},reset(){}};`,
      }));
    }
    for (const routePath of routes) {
      const failed = [];
      const httpErrors = [];
      const consoleErrors = [];
      const onFailed = (request) => failed.push({ url: request.url(), error: request.failure()?.errorText || "request failed" });
      const onResponse = (response) => { if (response.status() >= 400) httpErrors.push({ url: response.url(), status: response.status() }); };
      const onConsole = (message) => { if (message.type() === "error") consoleErrors.push(message.text()); };
      page.on("requestfailed", onFailed);
      page.on("response", onResponse);
      page.on("console", onConsole);

      const startedAt = performance.now();
      const response = await page.goto(new URL(routePath, baseUrl).toString(), { waitUntil: "domcontentloaded", timeout: 30_000 });
      await page.waitForTimeout(1_500);
      if (routePath === "/guestbook/") {
        await page.waitForFunction(() => (
          document.querySelector("[data-guestbook-list]")?.dataset.guestbookReady === "true"
          && ["rendered", "ready"].includes(document.querySelector("[data-guestbook-turnstile]")?.dataset.turnstileState || "")
          && (Boolean(document.querySelector('[data-guestbook-turnstile] input[name="cf-turnstile-response"]'))
            || Boolean(document.querySelector("[data-guestbook-turnstile] iframe"))
            || Boolean(document.querySelector('[data-guestbook-turnstile] [data-turnstile-mock="true"]')))
        ), undefined, { timeout: 15_000 });
      }
      const elapsedMs = Math.round(performance.now() - startedAt);
      assert.equal(response?.status(), 200, `${routePath} returned ${response?.status()}`);
      const metrics = await page.evaluate(() => {
        const resources = performance.getEntriesByType("resource").map((entry) => ({
          url: entry.name,
          durationMs: Math.round(entry.duration),
          transferBytes: entry.transferSize || 0,
          decodedBytes: entry.decodedBodySize || 0,
          initiator: entry.initiatorType,
        }));
        return {
          resources: resources.length,
          transferBytes: resources.reduce((sum, item) => sum + item.transferBytes, 0),
          slowest: resources.sort((left, right) => right.durationMs - left.durationMs).slice(0, 5),
          bodyWidth: document.body.scrollWidth,
          viewportWidth: innerWidth,
        };
      });
      assert.ok(metrics.bodyWidth <= metrics.viewportWidth, `${viewport.name} ${routePath} overflows horizontally`);
      const slug = routePath === "/" ? "home" : routePath.split("/").filter(Boolean).join("-");
      await page.screenshot({ path: join(outputDirectory, `${viewport.name}-${slug}.png`), fullPage: false });
      if (routePath === "/blog/") {
        assert.equal(await page.locator(".post-card:visible").count(), 3, `${viewport.name} blog does not start with three cards`);
        await page.locator(".post-load-sentinel:not([hidden])").scrollIntoViewIfNeeded();
        await page.mouse.wheel(0, 180);
        await page.waitForFunction(() => Number(document.querySelector("[data-responsive-post-list]")?.dataset.postVisibleCount || 0) >= 6, undefined, { timeout: 3_000 });
        await page.waitForTimeout(140);
        const particlePixels = await page.locator(".post-card:visible .particle-card-canvas").nth(3).evaluate((canvas) => {
          const pixels = canvas.getContext("2d").getImageData(0, 0, canvas.width, canvas.height).data;
          let visible = 0;
          for (let index = 3; index < pixels.length; index += 4) if (pixels[index] > 0) visible += 1;
          return visible;
        });
        assert.ok(particlePixels > 40, `${viewport.name} newly loaded article card particle canvas is blank`);
        await page.screenshot({ path: join(outputDirectory, `${viewport.name}-blog-after-scroll.png`), fullPage: false });
      }
      if (routePath === "/friends/") {
        await page.locator("[data-friends-apply-open]").click();
        await page.locator("[data-friends-apply-dialog][open]").waitFor();
        await page.screenshot({ path: join(outputDirectory, `${viewport.name}-friends-dialog.png`), fullPage: false });
        await page.locator("[data-friends-apply-close]").first().click();
      }
      if (routePath === "/posts/20260326/") {
        const comments = page.locator(".article-comments");
        await comments.scrollIntoViewIfNeeded();
        if (!localRun) {
          await page.locator(".article-comments iframe.giscus-frame").waitFor({ timeout: 15_000 });
          const giscusBox = page.frameLocator("iframe.giscus-frame").locator(".gsc-comment-box");
          await giscusBox.waitFor({ state: "visible", timeout: 15_000 });
          const giscusStyle = await giscusBox.evaluate((node) => ({
            background: getComputedStyle(node).backgroundColor,
            foreground: getComputedStyle(document.querySelector("main")).getPropertyValue("--color-fg-default").trim(),
          }));
          assert.equal(giscusStyle.background, "rgb(48, 49, 49)", `${viewport.name} Giscus comment box theme did not load`);
          assert.equal(giscusStyle.foreground, "#f5f3ef", `${viewport.name} Giscus text color is not high contrast`);
        }
        await page.waitForTimeout(localRun ? 100 : 1_500);
        await comments.screenshot({ path: join(outputDirectory, `${viewport.name}-article-comments.png`) });
      }
      report.push({ viewport: viewport.name, path: routePath, elapsedMs, ...metrics, failed, httpErrors, consoleErrors });

      page.off("requestfailed", onFailed);
      page.off("response", onResponse);
      page.off("console", onConsole);
    }
    await context.close();
  }
} finally {
  await browser.close();
}

const sameOriginFailures = report.flatMap((entry) => [
  ...entry.failed.filter((item) => new URL(item.url).origin === baseUrl.origin && item.error !== "net::ERR_ABORTED"),
  ...entry.httpErrors.filter((item) => new URL(item.url).origin === baseUrl.origin),
]);
console.log(JSON.stringify({ baseUrl: baseUrl.href, screenshots: outputDirectory, report }, null, 2));
assert.deepEqual(sameOriginFailures, [], `Local resources failed: ${JSON.stringify(sameOriginFailures)}`);
