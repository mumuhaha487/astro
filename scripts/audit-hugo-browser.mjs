import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { chromium } from "../studio/node_modules/playwright-core/index.mjs";

const baseUrl = new URL(process.argv[2] || "http://127.0.0.1:4321");
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
const browser = await chromium.launch({ executablePath, headless: true });
const report = [];

try {
  for (const viewport of viewports) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
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
