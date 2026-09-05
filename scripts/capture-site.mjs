import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";

import { chromium } from "../studio/node_modules/playwright-core/index.mjs";

const baseUrl = process.argv[2];
const outputDirectory = resolve(process.argv[3] || ".visual-capture");
if (!baseUrl) throw new Error("Usage: node scripts/capture-site.mjs <base-url> <output-directory>");

const executablePath = [
  process.env.PLAYWRIGHT_CHROME_PATH,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
].filter(Boolean).find(existsSync);
if (!executablePath) throw new Error("Chrome was not found");

await mkdir(outputDirectory, { recursive: true });
const browser = await chromium.launch({ executablePath, headless: true });
const routes = [
  ["home", "/"],
  ["archive", "/archive/"],
  ["post", "/posts/13行纯python代码把目录下相应后缀名称的文件写入txt中/"],
  ["about", "/about/"],
  ["albums", "/albums/"],
];
const viewports = [
  ["desktop", { width: 1440, height: 900 }],
  ["mobile", { width: 390, height: 844 }],
];
const report = [];

try {
  for (const [viewportName, viewport] of viewports) {
    const context = await browser.newContext({ viewport, deviceScaleFactor: 1 });
    for (const [routeName, route] of routes) {
      const page = await context.newPage();
      const pageErrors = [];
      page.on("pageerror", (error) => pageErrors.push(error.message));
      const response = await page.goto(new URL(route, baseUrl).toString(), { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(1200);
      await page.evaluate(async () => {
        for (let top = 0; top < document.documentElement.scrollHeight; top += innerHeight * .8) {
          scrollTo(0, top);
          await new Promise((resolve) => setTimeout(resolve, 25));
        }
        scrollTo(0, 0);
      });
      await page.waitForTimeout(150);
      const metrics = await page.evaluate(() => {
        const element = document.querySelector("#content-wrapper");
        const rect = element?.getBoundingClientRect();
        return {
          title: document.title,
          bodyWidth: document.body.scrollWidth,
          viewportWidth: innerWidth,
          clientWidth: document.documentElement.clientWidth,
          content: rect ? { x: Math.round(rect.x), y: Math.round(rect.y), width: Math.round(rect.width), height: Math.round(rect.height) } : null,
          cards: document.querySelectorAll(".card-base").length,
          articles: document.querySelectorAll("#post-container").length,
          overflow: [...document.querySelectorAll("*")]
            .map((node) => ({ node, rect: node.getBoundingClientRect() }))
            .filter(({ rect }) => rect.width > 0 && (rect.left < -1 || rect.right > innerWidth + 1))
            .sort((a, b) => (b.rect.right - innerWidth) - (a.rect.right - innerWidth))
            .slice(0, 8)
            .map(({ node, rect }) => ({
              selector: `${node.tagName.toLowerCase()}${node.id ? `#${node.id}` : ""}${node.classList.length ? `.${[...node.classList].slice(0, 3).join(".")}` : ""}`,
              left: Math.round(rect.left),
              right: Math.round(rect.right),
              width: Math.round(rect.width),
            })),
          navBoxes: (() => {
            const boxes = [];
            let node = document.querySelector("#nav-menu-switch");
            while (node && boxes.length < 7) {
              const rect = node.getBoundingClientRect();
              const style = getComputedStyle(node);
              boxes.push({
                selector: `${node.tagName.toLowerCase()}${node.id ? `#${node.id}` : ""}${node.classList.length ? `.${[...node.classList].slice(0, 3).join(".")}` : ""}`,
                left: Math.round(rect.left),
                right: Math.round(rect.right),
                width: Math.round(rect.width),
                cssWidth: style.width,
                minWidth: style.minWidth,
                maxWidth: style.maxWidth,
                padding: style.padding,
                boxSizing: style.boxSizing,
              });
              node = node.parentElement;
            }
            return boxes;
          })(),
          firstPostCard: (() => {
            const node = document.querySelector(".hugo-post-card");
            if (!node) return null;
            const rect = node.getBoundingClientRect();
            const style = getComputedStyle(node);
            const firstChild = node.firstElementChild;
            const childRect = firstChild?.getBoundingClientRect();
            const childStyle = firstChild ? getComputedStyle(firstChild) : null;
            return {
              rect: { left: Math.round(rect.left), top: Math.round(rect.top), width: Math.round(rect.width), height: Math.round(rect.height) },
              display: style.display,
              visibility: style.visibility,
              opacity: style.opacity,
              contentVisibility: style.contentVisibility,
              overflow: style.overflow,
              position: style.position,
              child: childRect && childStyle ? {
                rect: { left: Math.round(childRect.left), top: Math.round(childRect.top), width: Math.round(childRect.width), height: Math.round(childRect.height) },
                display: childStyle.display,
                visibility: childStyle.visibility,
                opacity: childStyle.opacity,
              } : null,
            };
          })(),
        };
      });
      const screenshot = join(outputDirectory, `${viewportName}-${routeName}.png`);
      await page.screenshot({ path: screenshot, fullPage: true, animations: "disabled" });
      if (viewportName === "mobile" && routeName === "home") {
        const firstCard = page.locator(".hugo-post-card").first();
        await firstCard.screenshot({ path: join(outputDirectory, "mobile-home-first-card.png"), animations: "disabled" });
        await firstCard.scrollIntoViewIfNeeded();
        await page.screenshot({ path: join(outputDirectory, "mobile-home-scrolled.png"), animations: "disabled" });
      }
      report.push({ viewportName, routeName, status: response?.status(), pageErrors, metrics, screenshot });
      await page.close();
    }
    await context.close();
  }
} finally {
  await browser.close();
}

await writeFile(join(outputDirectory, "report.json"), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
