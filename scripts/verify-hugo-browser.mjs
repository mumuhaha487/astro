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

const proxy = process.env.PLAYWRIGHT_PROXY;
const browser = await chromium.launch({
  executablePath,
  headless: true,
  ...(proxy ? { proxy: { server: proxy } } : {}),
});

async function revealPostCards(page, target) {
  while (await page.locator(".post-card:visible").count() < target) {
    const current = await page.locator(".post-card:visible").count();
    const expected = Math.min(target, current + 3);
    await page.locator(".post-load-sentinel:not([hidden])").scrollIntoViewIfNeeded();
    await page.mouse.wheel(0, 180);
    await page.waitForTimeout(800);
    const afterScroll = Number(await page.locator("[data-responsive-post-list]").getAttribute("data-post-visible-count"));
    if (afterScroll < expected) await page.locator("[data-responsive-post-list]").dispatchEvent("progressive-post-reveal");
    await page.waitForFunction((count) => Number(document.querySelector("[data-responsive-post-list]")?.dataset.postVisibleCount || 0) >= count, expected, { timeout: 5_000 });
    await page.waitForTimeout(380);
  }
}

try {
  const desktopContext = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  await desktopContext.grantPermissions(["clipboard-read", "clipboard-write"], { origin: new URL(baseUrl).origin });
  const desktopPage = await desktopContext.newPage();
  let desktopResponse = await desktopPage.goto(new URL("/blog/", baseUrl).toString(), { waitUntil: "domcontentloaded" });
  assert.equal(desktopResponse?.status(), 200);
  assert.equal(await desktopPage.locator(".post-card").count(), 30, "desktop blog page does not contain exactly thirty articles");
  assert.equal(await desktopPage.locator(".post-card:visible").count(), 3, "desktop blog page must initially render only three articles");
  assert.equal(await desktopPage.locator('.post-card:visible img[data-progressive-src]').count(), 0, "visible covers were not hydrated");
  assert.ok(await desktopPage.locator('.post-card.is-progressive-hidden img[data-progressive-src]').count() > 0, "offscreen covers were hydrated before scrolling");
  assert.equal(await desktopPage.locator(".post-cover-placeholder").count(), 0, "empty cover placeholder remains");
  assert.match(await desktopPage.locator('.post-card.random-cover img').first().getAttribute("src"), /^\/image\/h\/\d+\.webp$/, "post without a cover did not receive a stable local random image");
  assert.equal(await desktopPage.locator(".pagination-summary").innerText(), "第 1 / 4 页", "desktop pagination does not use 30-item pages");
  await desktopPage.waitForFunction(() => [...document.querySelectorAll(".post-card")].filter((card) => !card.hidden && !card.classList.contains("is-progressive-hidden")).every((card) => card.dataset.particleMode === "image-pixels" && Number(card.dataset.imageParticleCount) >= 900 && card.dataset.particleRenderer === "batched-2d" && card.dataset.particleFps === "30"), undefined, { timeout: 5_000 });
  await desktopPage.waitForTimeout(180);
  const firstCardParticles = await desktopPage.locator(".post-card:visible .particle-card-canvas").first().evaluate((canvas) => {
    const pixels = canvas.getContext("2d").getImageData(0, 0, canvas.width, canvas.height).data;
    let visible = 0;
    for (let index = 3; index < pixels.length; index += 4) if (pixels[index] > 0) visible += 1;
    return visible;
  });
  assert.ok(firstCardParticles > 40, "desktop article card particle canvas is blank");
  assert.equal(await desktopPage.locator('.post-card:visible[data-particle-mode="image-pixels"]').count(), 3, "desktop cards do not use image pixel assembly");
  const desktopLayout = await desktopPage.evaluate(() => {
    const cards = [...document.querySelectorAll(".post-card")].filter((card) => !card.hidden && !card.classList.contains("is-progressive-hidden"));
    const covers = cards.map((card) => card.querySelector(".post-cover")).filter(Boolean);
    const gridStyle = getComputedStyle(document.querySelector(".post-grid"));
    const titleOverflow = cards.some((card) => {
      const title = card.querySelector("h2 a span");
      const summary = card.querySelector(".post-card-body > p");
      const cardRect = card.getBoundingClientRect();
      return [title, summary].some((node) => {
        if (!node) return false;
        const rect = node.getBoundingClientRect();
        const style = getComputedStyle(node);
        return rect.left < cardRect.left - 1 || rect.right > cardRect.right + 1 || rect.bottom > cardRect.bottom + 1 || style.overflow !== "hidden";
      });
    });
    return {
      columns: gridStyle.gridTemplateColumns.split(" ").filter(Boolean).length,
      cardWidths: cards.map((card) => Math.round(card.getBoundingClientRect().width)),
      cardHeights: cards.map((card) => Math.round(card.getBoundingClientRect().height)),
      coverRatios: covers.map((cover) => {
        const rect = cover.getBoundingClientRect();
        return rect.width / rect.height;
      }),
      titleOverflow,
      hasCustomCursor: document.body.classList.contains("has-custom-cursor"),
      nativeCursor: getComputedStyle(document.body).cursor,
      cursorSize: (() => {
        const dot = document.querySelector(".cursor-dot");
        const ring = document.querySelector(".cursor-ring");
        if (!dot || !ring) return null;
        return {
          dot: parseFloat(getComputedStyle(dot).width),
          ring: parseFloat(getComputedStyle(ring).width),
          followMode: ring.dataset.followMode,
          followMs: Number(ring.dataset.followMs),
        };
      })(),
    };
  });
  assert.equal(desktopLayout.columns, 3, "desktop blog must use a three-column card grid");
  assert.equal(new Set(desktopLayout.cardWidths).size, 1, `desktop card widths differ: ${desktopLayout.cardWidths.join(", ")}`);
  assert.equal(new Set(desktopLayout.cardHeights).size, 1, `desktop card heights differ: ${desktopLayout.cardHeights.join(", ")}`);
  assert.ok(desktopLayout.coverRatios.every((ratio) => Math.abs(ratio - 16 / 9) < 0.02), `desktop covers must be cropped to 16:9: ${desktopLayout.coverRatios.join(", ")}`);
  assert.equal(desktopLayout.titleOverflow, false, "desktop card text overflows its container");
  assert.equal(desktopLayout.hasCustomCursor, true, "custom cursor was not enabled for a fine pointer");
  assert.equal(desktopLayout.nativeCursor, "none", "native cursor remains visible behind the custom cursor");
  assert.ok(desktopLayout.cursorSize?.ring >= 18 && desktopLayout.cursorSize?.ring <= 22 && desktopLayout.cursorSize?.dot === 4, "custom cursor was not reduced to the requested compact size");
  assert.equal(desktopLayout.cursorSize?.followMode, "straight-line", "cursor ring does not use the direct path");
  assert.ok(desktopLayout.cursorSize?.followMs >= 40 && desktopLayout.cursorSize?.followMs <= 90, "cursor response is not short and slightly delayed");
  await desktopPage.mouse.move(260, 220);
  await desktopPage.waitForTimeout(1_000);
  await desktopPage.mouse.move(760, 520);
  assert.equal(await desktopPage.locator(".cursor-dot.visible").count(), 1, "custom cursor does not follow pointer movement");
  const cursorPositions = await desktopPage.evaluate(() => {
    const dot = document.querySelector(".cursor-dot").getBoundingClientRect();
    const ring = document.querySelector(".cursor-ring").getBoundingClientRect();
    return { dot: { x: dot.x + dot.width / 2, y: dot.y + dot.height / 2 }, ring: { x: ring.x + ring.width / 2, y: ring.y + ring.height / 2 } };
  });
  assert.ok(Math.abs(cursorPositions.dot.x - 760) < 5, "cursor center dot is not immediate");
  assert.ok(cursorPositions.ring.x < cursorPositions.dot.x - 20, "cursor ring no longer has a visible short delay");
  await desktopPage.waitForTimeout(320);
  const settledRingX = await desktopPage.locator(".cursor-ring").evaluate((ring) => {
    const rect = ring.getBoundingClientRect();
    return rect.x + rect.width / 2;
  });
  assert.ok(Math.abs(settledRingX - 760) < 5, "cursor ring does not catch up after 0.2 seconds");

  await revealPostCards(desktopPage, 6);
  assert.equal(await desktopPage.locator(".post-card:visible").count(), 6, "desktop blog did not append exactly three cards after scrolling");
  await desktopPage.waitForFunction(() => [...document.querySelectorAll('.post-card[data-particle-mode="image-pixels"]')].filter((card) => !card.hidden && !card.classList.contains("is-progressive-hidden")).length === 6, undefined, { timeout: 5_000 });
  await desktopPage.waitForTimeout(120);
  const secondBatchParticles = await desktopPage.locator(".post-card:visible .particle-card-canvas").nth(3).evaluate((canvas) => {
    const pixels = canvas.getContext("2d").getImageData(0, 0, canvas.width, canvas.height).data;
    let visible = 0;
    for (let index = 3; index < pixels.length; index += 4) if (pixels[index] > 0) visible += 1;
    return visible;
  });
  assert.ok(secondBatchParticles > 40, "new desktop article batch did not assemble from particles");

  desktopResponse = await desktopPage.goto(new URL("/", baseUrl).toString(), { waitUntil: "domcontentloaded" });
  assert.equal(desktopResponse?.status(), 200);
  assert.equal(await desktopPage.locator(".workspace-brand-title", { hasText: "工作空间" }).count(), 1, "compact workspace brand is missing");
  assert.equal(await desktopPage.locator(".workspace-brand .workspace-avatar, .workspace-brand", { hasText: "木木em哈哈" }).count(), 0, "removed sidebar identity remains");
  assert.equal(await desktopPage.locator('a[href="/archive/"][data-nav="archive"]').count(), 0, "removed archive navigation remains visible");
  assert.equal(await desktopPage.locator('a[href="/friends/"][data-nav="friends"]').count(), 1, "friends navigation is missing");
  assert.equal(await desktopPage.locator('a[href="/guestbook/"][data-nav="guestbook"]').count(), 1, "guestbook navigation is missing");
  assert.match(await desktopPage.locator(".status-panel").innerText(), /一个可能特别有想法的博主。[\s\S]*这是一个建立在21世纪的边缘小站。/);
  assert.match(await desktopPage.locator(".profile-overline").innerText(), /我の小小窝。/);
  assert.equal(await desktopPage.locator('a[href="https://github.com/mumuhaha487"]').count(), 1, "production GitHub contact is missing");
  assert.equal(await desktopPage.locator('a[href="https://space.bilibili.com/334584883"]').count(), 1, "production Bilibili contact is missing");
  assert.equal(await desktopPage.locator('a[href="https://space.bilibili.com/334584883"] use[href="/icons/lucide-sprite.svg#bilibili"]').count(), 1, "Bilibili brand icon is missing");
  await desktopPage.waitForTimeout(500);
  const particleAlpha = await desktopPage.locator(".profile-particles").evaluate((canvas) => {
    const pixels = canvas.getContext("2d").getImageData(0, 0, canvas.width, canvas.height).data;
    let visible = 0;
    for (let index = 3; index < pixels.length; index += 4) if (pixels[index] > 0) visible += 1;
    return visible;
  });
  assert.ok(particleAlpha > 100, "avatar particle canvas is blank during assembly");
  const homeCardParticleAlpha = await desktopPage.locator(".home-doc-item .particle-card-canvas").first().evaluate((canvas) => {
    const pixels = canvas.getContext("2d").getImageData(0, 0, canvas.width, canvas.height).data;
    let visible = 0;
    for (let index = 3; index < pixels.length; index += 4) if (pixels[index] > 0) visible += 1;
    return visible;
  });
  assert.ok(homeCardParticleAlpha > 40, "homepage document card particle canvas is blank");
  await desktopPage.waitForTimeout(2_800);
  assert.equal(await desktopPage.locator("[data-avatar-particles].is-ready").count(), 1, "avatar does not transition to the rotating image");
  const earlySpin = await desktopPage.locator("[data-avatar-image]").evaluate((image) => ({
    direction: image.dataset.spinDirection,
    targetPeriod: Number(image.dataset.spinTargetPeriod),
    velocity: Math.abs(Number(image.dataset.spinVelocity)),
  }));
  await desktopPage.waitForTimeout(1_000);
  const laterSpinVelocity = await desktopPage.locator("[data-avatar-image]").evaluate((image) => Math.abs(Number(image.dataset.spinVelocity)));
  assert.equal(earlySpin.direction, "counterclockwise", "avatar does not rotate counterclockwise");
  assert.equal(earlySpin.targetPeriod, 3_000, "avatar target period is not three seconds");
  assert.ok(laterSpinVelocity > earlySpin.velocity, "avatar rotation does not accelerate gradually");
  await desktopPage.waitForTimeout(3_900);
  const targetSpinVelocity = await desktopPage.locator("[data-avatar-image]").evaluate((image) => Math.abs(Number(image.dataset.spinVelocity)));
  assert.ok(targetSpinVelocity >= 118 && targetSpinVelocity <= 121, `avatar did not settle at one rotation per three seconds: ${targetSpinVelocity}`);

  desktopResponse = await desktopPage.goto(new URL("/friends/", baseUrl).toString(), { waitUntil: "domcontentloaded" });
  assert.equal(desktopResponse?.status(), 200);
  assert.equal(await desktopPage.locator(".friend-card").count(), 4, "validated friend entries are missing");
  assert.equal(await desktopPage.locator('a[href="https://github.com/mumuhaha487/astro/tree/main/friends"]').count(), 1, "friends repository uses a non-production URL");
  await desktopPage.locator("[data-friends-apply-open]").click();
  assert.equal(await desktopPage.locator("[data-friends-apply-dialog]").getAttribute("open"), "", "friend application dialog did not open");
  assert.equal(await desktopPage.locator('a[href="https://github.com/mumuhaha487/astro/new/main/friends/entries"]').count(), 1, "friend contribution URL is not filename-neutral");
  assert.doesNotMatch(await desktopPage.locator("[data-friends-apply-dialog]").innerText(), /friend\.json|your-site-2026\.json/, "friend dialog suggests a fixed filename");
  assert.match(await desktopPage.locator("[data-friends-template]").innerText(), /"name": "你的站点名称"[\s\S]*"tags": \["博客"\]/, "friend JSON template is incomplete");
  await desktopPage.locator("[data-friends-template-copy]").click();
  await desktopPage.waitForFunction(() => /已复制|Copied|コピー済み/.test(document.querySelector("[data-friends-template-copy]")?.textContent || ""));
  assert.match(await desktopPage.locator("[data-friends-template-copy]").innerText(), /已复制|Copied|コピー済み/, "friend template copy did not confirm success");
  assert.match(await desktopPage.evaluate(() => navigator.clipboard.readText()), /"name": "你的站点名称"[\s\S]*"tags": \["博客"\]/, "friend JSON template was not copied to the clipboard");
  await desktopPage.locator("[data-friends-apply-close]").first().click();
  assert.equal(await desktopPage.locator("[data-friends-apply-dialog]").getAttribute("open"), null, "friend application dialog did not close");
  await desktopPage.locator("[data-friends-search]").fill("Astro");
  assert.equal(await desktopPage.locator(".friend-card:visible").count(), 1, "friends search does not filter cards");

  desktopResponse = await desktopPage.goto(new URL("/posts/20260326/", baseUrl).toString(), { waitUntil: "domcontentloaded" });
  assert.equal(desktopResponse?.status(), 200);
  const headingCount = await desktopPage.locator("#hugo-article-content h1, #hugo-article-content h2").count();
  assert.ok(headingCount >= 2, "article fixture does not contain enough headings");
  assert.equal(await desktopPage.locator("[data-article-toc-nav] [data-toc-id]").count(), headingCount, "desktop TOC did not recognize every H1/H2 heading");
  assert.equal(await desktopPage.locator("[data-article-float]").evaluate((node) => node.classList.contains("is-visible")), false, "desktop back-to-top button is visible before scrolling");
  await desktopPage.evaluate(() => scrollTo(0, 900));
  await desktopPage.waitForTimeout(250);
  assert.equal(await desktopPage.locator("[data-article-float]").evaluate((node) => node.classList.contains("is-visible")), true, "desktop back-to-top button does not appear after scrolling");
  assert.equal(await desktopPage.locator(".mobile-article-action:visible").count(), 0, "mobile article controls leaked into desktop layout");
  await desktopPage.locator(".desktop-back-to-top").click();
  await desktopPage.waitForFunction(() => scrollY < 20, undefined, { timeout: 2_000 });

  desktopResponse = await desktopPage.goto(new URL("/posts/2022蓝桥杯题目山/", baseUrl).toString(), { waitUntil: "domcontentloaded" });
  assert.equal(desktopResponse?.status(), 200);
  assert.ok(await desktopPage.locator(".code-copy-button").count() > 0, "code copy buttons were not added");
  await desktopPage.locator(".code-copy-button").first().click();
  await desktopPage.waitForFunction(() => document.querySelector(".code-copy-button")?.textContent?.includes("已复制"), undefined, { timeout: 2_000 });
  assert.match(await desktopPage.locator(".code-copy-button").first().innerText(), /已复制/, "code copy button did not confirm the copy action");
  const collapsibleCode = desktopPage.locator(".code-block-shell.is-collapsible").first();
  assert.equal(await collapsibleCode.count(), 1, "long code blocks are not collapsible");
  assert.equal(await collapsibleCode.evaluate((node) => node.classList.contains("is-collapsed")), true, "long code block is not collapsed initially");
  await collapsibleCode.locator(".code-expand-button").click();
  assert.equal(await collapsibleCode.evaluate((node) => node.classList.contains("is-collapsed")), false, "long code block cannot be expanded");
  await desktopContext.close();

  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  const localRun = ["127.0.0.1", "localhost"].includes(new URL(baseUrl).hostname);
  let submittedGuestbookBody;
  if (localRun) {
    await page.route("https://umami.vmss.cn/script.js", (route) => route.fulfill({ contentType: "application/javascript", body: "" }));
    await page.route("https://giscus.app/**", (route) => route.fulfill({ contentType: "application/javascript", body: "" }));
    await page.route("https://challenges.cloudflare.com/turnstile/v0/api.js**", (route) => route.fulfill({
      contentType: "application/javascript",
      body: `globalThis.turnstile={render(container,options){const mock=document.createElement("div");mock.dataset.turnstileMock="true";mock.textContent="Cloudflare Turnstile";container.append(mock);queueMicrotask(()=>options.callback("test-turnstile-token"));return "mock-widget"},reset(){}};`,
    }));
    const delayedFulfill = async (route, body) => {
      await new Promise((resolve) => setTimeout(resolve, 250));
      await route.fulfill({ contentType: "application/json", body: JSON.stringify(body) });
    };
    await page.route("https://umami.vmss.cn/api/share/hJgv7MWzlfs3JTnu", (route) => delayedFulfill(route, {
      websiteId: "993c6970-8f42-4804-a055-38b6b9c01810", token: "read-only-qa-token",
    }));
    await page.route("https://umami.vmss.cn/api/websites/993c6970-8f42-4804-a055-38b6b9c01810/active", (route) => delayedFulfill(route, { visitors: 3 }));
    await page.route("https://umami.vmss.cn/api/websites/993c6970-8f42-4804-a055-38b6b9c01810/stats?**", (route) => delayedFulfill(route, {
      pageviews: 61756, visitors: 24388, visits: 19853,
    }));
    await page.route("https://astro-blog-studio.vrhjio4405.workers.dev/api/guestbook/turnstile/verify", async (route) => {
      assert.deepEqual(route.request().postDataJSON(), { turnstileToken: "test-turnstile-token" }, "browser sent the wrong Turnstile token to the verifier");
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({ success: true, ticket: "v1.test-payload.test-signature" }),
      });
    });
    let guestbookMessages = [{ id: "message-1", name: "访客", content: "这是一条公开留言", createdAt: "2026-09-06T08:00:00.000Z" }];
    await page.route("https://md.vmss.cn/api/guestbook/**", async (route) => {
      const request = route.request();
      const json = (body, status = 200) => route.fulfill({ status, contentType: "application/json", body: JSON.stringify(body) });
      if (request.method() === "GET") return json({ messages: guestbookMessages });
      const body = request.postDataJSON();
      submittedGuestbookBody = body;
      const created = { id: "message-2", name: body.name, content: body.content, createdAt: "2026-09-06T08:05:00.000Z" };
      guestbookMessages = [created, ...guestbookMessages];
      return json(created, 201);
    });
  }
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));

  let response = await page.goto(new URL("/", baseUrl).toString(), { waitUntil: "domcontentloaded" });
  assert.equal(response?.status(), 200);
  assert.equal(await page.locator(".home-stage").count(), 1, "home workspace is missing");
  assert.equal(await page.locator("#site-wallpaper").count(), 0, "duplicate home wallpaper layer remains");
  assert.equal(await page.locator('.home-backdrop source[srcset="/image/v/2870.webp"]').count(), 1, "mobile home cover is missing");
  assert.equal(await page.locator('link[rel="preload"][href="/image/v/2870.webp"][media="(max-width: 760px)"]').count(), 1, "mobile home cover is not preloaded");
  assert.equal(await page.locator('link[rel="preconnect"][href="https://umami.vmss.cn"]').count(), 1, "Umami preconnect is missing");
  assert.equal(await page.locator('script[src="https://umami.vmss.cn/script.js"][async][fetchpriority="low"][data-website-id="993c6970-8f42-4804-a055-38b6b9c01810"]').count(), 1, "non-blocking self-hosted Umami tracker is missing");
  assert.equal(await page.locator('[data-umami-stat="active"]').count(), 1, "active visitor statistic is missing");
  assert.equal(await page.locator('[data-umami-stat="visitors"]').count(), 1, "unique visitor statistic is missing");
  assert.equal(await page.locator('[data-umami-stat="visits"]').count(), 1, "visit statistic is missing");
  if (localRun) assert.deepEqual(await page.locator("[data-umami-stat]").allInnerTexts(), ["0", "0", "0"], "statistics do not begin at zero");
  const typewriter = page.locator("[data-typewriter-output]");
  assert.equal(await typewriter.count(), 1, "homepage typewriter is missing");
  assert.equal(await page.locator('[data-typewriter="不乱于心，不困于情，不畏将来，不惧过去"]').count(), 1, "homepage typewriter text is incorrect");
  assert.equal(await page.locator('.language-switch a[lang="ja"]', { hasText: "日本語" }).count(), 1, "Japanese language option is ambiguous");
  await page.waitForTimeout(1_100);
  const typedText = await typewriter.innerText();
  assert.ok([...typedText].length >= 1 && [...typedText].length <= 3, `typewriter pace is incorrect: ${typedText}`);
  const mobileTypewriterLayout = await page.evaluate(() => {
    const output = document.querySelector("[data-typewriter-output]");
    const bio = document.querySelector(".profile-bio");
    const button = document.querySelector(".profile-actions .button");
    const initialButtonWidth = button?.getBoundingClientRect().width || 0;
    if (output) output.textContent = "不乱于心，不困于情，不畏将来，不惧过去";
    return {
      initialButtonWidth,
      fullButtonWidth: button?.getBoundingClientRect().width || 0,
      bioClientWidth: bio?.clientWidth || 0,
      bioScrollWidth: bio?.scrollWidth || 0,
    };
  });
  assert.ok(Math.abs(mobileTypewriterLayout.initialButtonWidth - mobileTypewriterLayout.fullButtonWidth) < 1, "mobile read button changes width while the quote is typed");
  assert.ok(mobileTypewriterLayout.bioScrollWidth <= mobileTypewriterLayout.bioClientWidth, "mobile typewriter text overflows its fixed region");
  if (localRun) {
    await page.waitForFunction(() => {
      const value = Number(document.querySelector('[data-umami-stat="visitors"]')?.textContent?.replaceAll(",", ""));
      return value > 0 && value < 24388;
    }, undefined, { timeout: 5_000 });
  }
  await page.waitForFunction(() => [...document.querySelectorAll("[data-umami-stat]")].every((node) => node.dataset.umamiReady === "true"), undefined, { timeout: 15_000 });
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
  assert.equal(await page.locator('footer.site-footer a[href="https://beian.miit.gov.cn/"]').innerText(), "赣ICP备2024038464号-3", "ICP filing link is incorrect");
  assert.equal(await page.locator(".mobile-dock:visible").count(), 1, "mobile dock is missing");
  let widths = await page.evaluate(() => ({ body: document.body.scrollWidth, viewport: innerWidth }));
  assert.ok(widths.body <= widths.viewport, `mobile home overflows: ${widths.body}px > ${widths.viewport}px`);

  response = await page.goto(new URL("/blog/", baseUrl).toString(), { waitUntil: "domcontentloaded" });
  assert.equal(response?.status(), 200);
  assert.equal(await page.locator(".post-card").count(), 30, "mobile blog page does not retain the complete desktop page group");
  assert.equal(await page.locator(".post-card:visible").count(), 3, "mobile blog page must initially render only three articles");
  await page.waitForFunction(() => [...document.querySelectorAll(".post-card")].filter((card) => !card.hidden && !card.classList.contains("is-progressive-hidden")).every((card) => card.dataset.particleMode === "image-pixels" && Number(card.dataset.imageParticleCount) >= 900 && card.dataset.particleRenderer === "batched-2d" && card.dataset.particleFps === "30"), undefined, { timeout: 5_000 });
  await page.waitForTimeout(160);
  const mobileCardParticles = await page.locator(".post-card:visible .particle-card-canvas").first().evaluate((canvas) => {
    const pixels = canvas.getContext("2d").getImageData(0, 0, canvas.width, canvas.height).data;
    let visible = 0;
    for (let index = 3; index < pixels.length; index += 4) if (pixels[index] > 0) visible += 1;
    return visible;
  });
  assert.ok(mobileCardParticles > 40, "mobile article card particle canvas is blank");
  await revealPostCards(page, 6);
  assert.equal(await page.locator(".post-card:visible").count(), 6, "mobile blog did not append three cards after scrolling");
  await revealPostCards(page, 10);
  assert.equal(await page.locator(".post-card:visible").count(), 10, "mobile blog page does not stop at its ten-article page boundary");
  const firstPageTitles = await page.locator(".post-card:visible h2").allInnerTexts();
  assert.equal(await page.locator('.pagination-page[aria-current="page"]').innerText(), "1", "blog first page is not active");
  assert.match(await page.locator('a[rel="next"]').getAttribute("href"), /\/blog\/\?mobile-page=2$/, "mobile blog next-page URL is incorrect");
  assert.equal(await page.locator('#site-wallpaper source[srcset="/assets/mobile-banner/2.webp"]').count(), 1, "mobile blog wallpaper is missing");
  assert.equal(await page.locator('a[href*="md.vmss.cn"]').count(), 0, "private writing entry is exposed");
  assert.equal(await page.locator("[data-umami-stat]").count(), 0, "homepage statistics leaked into blog page");
  assert.equal(await page.locator('footer.site-footer a[href="https://beian.miit.gov.cn/"]').innerText(), "赣ICP备2024038464号-3", "blog ICP filing link is incorrect");
  await page.locator("[data-search-trigger]").click();
  const searchInput = page.locator("#search-input");
  await searchInput.fill("海龟汤");
  await page.waitForFunction(() => document.querySelector("#search-results")?.textContent?.includes("海龟汤"), undefined, { timeout: 15_000 });
  assert.match(await page.locator("#search-results").innerText(), /海龟汤/, "Pagefind search did not return the expected article");
  await searchInput.fill("的");
  await page.waitForFunction(() => !document.querySelector("#search-pagination")?.hidden && document.querySelectorAll("#search-results .search-result").length === 10, undefined, { timeout: 15_000 });
  const firstSearchPageTitles = await page.locator("#search-results .search-result strong").allInnerTexts();
  assert.match(await page.locator("#search-page-status").innerText(), /^第 1 \/ \d+ 页$/, "search first-page status is incorrect");
  await page.locator("[data-search-next]").click();
  await page.waitForFunction(() => document.querySelector("#search-page-status")?.textContent?.startsWith("第 2 /"), undefined, { timeout: 5_000 });
  assert.equal(await page.locator("#search-results .search-result").count(), 10, "search second page does not contain ten results");
  assert.notDeepEqual(await page.locator("#search-results .search-result strong").allInnerTexts(), firstSearchPageTitles, "search second page repeated the first page");

  response = await page.goto(new URL("/blog/?mobile-page=2", baseUrl).toString(), { waitUntil: "domcontentloaded" });
  assert.equal(response?.status(), 200);
  assert.equal(await page.locator(".post-card:visible").count(), 3, "mobile blog second page does not start with three articles");
  await revealPostCards(page, 10);
  assert.equal(await page.locator(".post-card:visible").count(), 10, "mobile blog second page does not contain exactly ten articles");
  assert.equal(await page.locator('.pagination-page[aria-current="page"]').innerText(), "2", "blog second page is not active");
  assert.notDeepEqual(await page.locator(".post-card:visible h2").allInnerTexts(), firstPageTitles, "blog second page repeated the first page");

  response = await page.goto(new URL("/blog/?mobile-page=3", baseUrl).toString(), { waitUntil: "domcontentloaded" });
  assert.equal(response?.status(), 200);
  await revealPostCards(page, 10);
  const thirdPageTitles = await page.locator(".post-card:visible h2").allInnerTexts();
  assert.equal(thirdPageTitles.length, 10, "mobile blog third page does not contain exactly ten articles");
  assert.match(await page.locator('a[rel="next"]').getAttribute("href"), /\/blog\/page\/2\/\?mobile-page=4$/, "mobile pagination does not cross into the next 30-item group");

  response = await page.goto(new URL("/blog/page/2/?mobile-page=4", baseUrl).toString(), { waitUntil: "domcontentloaded" });
  assert.equal(response?.status(), 200);
  await revealPostCards(page, 10);
  assert.equal(await page.locator(".post-card:visible").count(), 10, "mobile blog fourth page does not contain exactly ten articles");
  assert.equal(await page.locator('.pagination-page[aria-current="page"]').innerText(), "4", "blog fourth page is not active");
  assert.notDeepEqual(await page.locator(".post-card:visible h2").allInnerTexts(), thirdPageTitles, "blog fourth page repeated the third page");

  response = await page.goto(new URL("/tags/linux/", baseUrl).toString(), { waitUntil: "domcontentloaded" });
  assert.equal(response?.status(), 200);
  assert.ok(await page.locator(".post-card").count() > 10, "Linux tag page does not retain its desktop article group");
  assert.equal(await page.locator(".post-card:visible").count(), 3, "Linux tag page does not start with three articles");
  await revealPostCards(page, 10);
  assert.equal(await page.locator(".post-card:visible").count(), 10, "Linux tag mobile page does not contain ten articles");
  assert.match(await page.locator('a[rel="next"]').getAttribute("href"), /\/tags\/linux\/\?mobile-page=2$/, "Linux tag mobile next-page URL is incorrect");

  response = await page.goto(new URL("/category/python/", baseUrl).toString(), { waitUntil: "domcontentloaded" });
  assert.equal(response?.status(), 200);
  assert.ok(await page.locator(".post-card").count() > 10, "category page does not retain its desktop article group");
  assert.equal(await page.locator(".post-card:visible").count(), 3, "category page does not start with three articles");
  await revealPostCards(page, 10);
  assert.equal(await page.locator(".post-card:visible").count(), 10, "category mobile page does not contain ten articles");
  assert.match(await page.locator('a[rel="next"]').getAttribute("href"), /\/category\/python\/\?mobile-page=2$/, "category mobile next-page URL is incorrect");

  const forumResponse = await page.request.get(new URL("/discuss/", baseUrl).toString());
  assert.equal(forumResponse.status(), 404, "removed forum page is still published");
  const editorResponse = await page.request.get(new URL("/forum-editor/forum.html", baseUrl).toString());
  assert.equal(editorResponse.status(), 404, "removed forum editor is still published");

  response = await page.goto(new URL("/tools/", baseUrl).toString(), { waitUntil: "domcontentloaded" });
  assert.equal(response?.status(), 200);
  assert.equal(await page.locator('#site-wallpaper source[srcset="/assets/mobile-banner/4.webp"]').count(), 1, "mobile tools wallpaper is missing");
  assert.equal(await page.locator(".tool-card").count(), 7, "toolbox cards are missing");
  await page.waitForTimeout(250);
  const loadedToolCovers = await page.locator('[data-random-cover][src]').count();
  assert.ok(loadedToolCovers > 0 && loadedToolCovers < 7, `tool covers are not loaded on demand: ${loadedToolCovers}/7`);
  assert.equal(await page.locator('.tool-card-icon img[src^="/tool-icons/"]').count(), 7, "toolbox representative icons are not local");

  response = await page.goto(new URL("/friends/", baseUrl).toString(), { waitUntil: "domcontentloaded" });
  assert.equal(response?.status(), 200);
  assert.equal(await page.locator(".friend-card").count(), 4, "mobile friends page is incomplete");
  assert.equal(await page.locator('a[href="https://github.com/mumuhaha487/astro/tree/main/friends"]').count(), 1, "mobile friends page has no real repository URL");
  await page.locator("[data-friends-search]").fill("没有这个站点");
  assert.equal(await page.locator(".friend-card:visible").count(), 0, "friends search does not hide unmatched entries");
  assert.equal(await page.locator("[data-friends-empty]:visible").count(), 1, "friends empty state is missing");

  response = await page.goto(new URL("/guestbook/", baseUrl).toString(), { waitUntil: "domcontentloaded" });
  assert.equal(response?.status(), 200);
  await page.waitForFunction(() => {
    const container = document.querySelector("[data-guestbook-turnstile]");
    return ["rendered", "ready"].includes(container?.dataset.turnstileState || "")
      && (Boolean(container?.querySelector('input[name="cf-turnstile-response"]')) || Boolean(container?.querySelector("iframe")) || Boolean(container?.querySelector('[data-turnstile-mock="true"]')));
  }, undefined, { timeout: 15_000 });
  assert.equal(await page.locator('[data-guestbook-form] input[name="name"]').count(), 1, "guestbook name input is missing");
  assert.equal(await page.locator('[data-guestbook-form] textarea[name="content"]').count(), 1, "guestbook content input is missing");
  assert.equal(await page.locator('[data-guestbook-form] input[name="captchaAnswer"], [data-guestbook-captcha]').count(), 0, "legacy arithmetic captcha remains");
  if (localRun) {
    assert.equal(await page.locator('[data-turnstile-mock="true"]').count(), 1, "Turnstile test widget did not render");
    assert.equal(await page.locator(".guestbook-message").count(), 1, "public guestbook messages did not load");
    await page.locator('input[name="name"]').fill("浏览器测试");
    await page.locator('textarea[name="content"]').fill("公开留言提交正常");
    await page.locator("[data-guestbook-form]").evaluate((form) => form.requestSubmit());
    await page.waitForFunction(() => document.querySelectorAll(".guestbook-message").length === 2, undefined, { timeout: 5_000 });
    assert.equal(submittedGuestbookBody?.turnstileTicket, "v1.test-payload.test-signature", "signed Turnstile ticket was not sent to EdgeOne");
    assert.equal("turnstileToken" in submittedGuestbookBody, false, "raw Turnstile token leaked to EdgeOne");
    assert.match(await page.locator("[data-guestbook-status]").innerText(), /留言/);
  } else {
    await page.waitForFunction(() => document.querySelector("[data-guestbook-list]")?.dataset.guestbookReady === "true", undefined, { timeout: 10_000 });
  }

  response = await page.goto(new URL("/tools/json-formatter/", baseUrl).toString(), { waitUntil: "domcontentloaded" });
  assert.equal(response?.status(), 200);
  await page.locator("[data-json-input]").fill('{"ok":true}');
  await page.locator("[data-json-format]").click();
  assert.match(await page.locator("[data-json-input]").inputValue(), /\n  "ok": true\n/);

  response = await page.goto(new URL("/tools/timestamp/", baseUrl).toString(), { waitUntil: "domcontentloaded" });
  assert.equal(response?.status(), 200);
  await page.locator("[data-time-input]").fill("1760000000");
  await page.locator("[data-time-to-date]").click();
  assert.match(await page.locator("[data-date-input]").inputValue(), /^2025-/);

  response = await page.goto(new URL("/tools/text-stats/", baseUrl).toString(), { waitUntil: "domcontentloaded" });
  assert.equal(response?.status(), 200);
  await page.locator("[data-text-input]").fill("你好 world\n\n第二段");
  assert.equal(await page.locator('[data-stat="paragraphs"]').innerText(), "2");

  response = await page.goto(new URL("/tools/base64/", baseUrl).toString(), { waitUntil: "domcontentloaded" });
  assert.equal(response?.status(), 200);
  await page.locator("[data-base64-source]").fill("你好 Astro");
  await page.locator("[data-base64-encode]").click();
  const encodedBase64 = await page.locator("[data-base64-result]").inputValue();
  assert.ok(encodedBase64.length > 8, "Base64 encoder returned no data");
  await page.locator("[data-base64-source]").fill(encodedBase64);
  await page.locator("[data-base64-decode]").click();
  assert.equal(await page.locator("[data-base64-result]").inputValue(), "你好 Astro");

  response = await page.goto(new URL("/tools/uuid/", baseUrl).toString(), { waitUntil: "domcontentloaded" });
  assert.equal(response?.status(), 200);
  await page.locator("[data-uuid-count]").fill("3");
  await page.locator("[data-uuid-generate]").click();
  const uuids = (await page.locator("[data-uuid-result]").inputValue()).split("\n");
  assert.equal(uuids.length, 3, "UUID generator ignored the configured count");
  assert.equal(new Set(uuids).size, 3, "UUID generator produced duplicates");
  assert.ok(uuids.every((uuid) => /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(uuid)), "UUID generator returned an invalid v4 UUID");

  response = await page.goto(new URL("/tools/beast-translator/", baseUrl).toString(), { waitUntil: "domcontentloaded" });
  assert.equal(response?.status(), 200);
  await page.locator("[data-beast-source]").fill("你好 Astro");
  await page.locator("[data-beast-encode]").click();
  const beastText = await page.locator("[data-beast-result]").inputValue();
  assert.match(beastText, /^[嗷呜啊~]+$/, "beast translator returned invalid symbols");
  await page.locator("[data-beast-source]").fill(beastText);
  await page.locator("[data-beast-decode]").click();
  assert.equal(await page.locator("[data-beast-result]").inputValue(), "你好 Astro");

  response = await page.goto(new URL("/tools/docker-accelerator/", baseUrl).toString(), { waitUntil: "domcontentloaded" });
  assert.equal(response?.status(), 200);
  assert.equal(await page.locator('iframe.tool-service-frame[src="https://docker.0ha.top/"]').count(), 1, "Docker accelerator is not embedded");

  response = await page.goto(new URL("/posts/20260326/", baseUrl).toString(), { waitUntil: "domcontentloaded" });
  assert.equal(response?.status(), 200);
  assert.equal(await page.locator("#hugo-article-content").count(), 1, "article body is missing");
  assert.equal(await page.locator('#site-wallpaper img[src="/assets/desktop-banner/2.webp"]').count(), 1, "desktop article wallpaper is missing");
  assert.equal(await page.locator('img[src*="image.vmss.cn"]').count(), 0, "remote image.vmss.cn reference remains");
  assert.equal(await page.locator('script[src="https://giscus.app/client.js"][data-repo-id="R_kgDOPjTkdA"][data-category-id="DIC_kwDOPjTkdM4CuiIf"]').count(), 1, "restored Giscus configuration is missing");
  assert.match(await page.locator('script[src="https://giscus.app/client.js"]').getAttribute("data-theme"), /\/hugo-theme\/giscus-theme\.css\?v=20260907-contrast4$/, "Giscus high-contrast dark theme is missing");
  const articleAnimation = await page.locator(".article-shell").evaluate((node) => ({ name: getComputedStyle(node).animationName, duration: getComputedStyle(node).animationDuration }));
  assert.deepEqual(articleAnimation, { name: "workspace-page-enter", duration: "0.4s" }, "article does not use the 0.4-second side fade-in");
  const commentSurface = await page.locator(".article-comments").evaluate((node) => ({ background: getComputedStyle(node).backgroundColor, color: getComputedStyle(node.querySelector("h2")).color }));
  assert.equal(commentSurface.background, "rgba(48, 49, 49, 0.92)", "comment shell is not a readable gray panel");
  assert.equal(commentSurface.color, "rgb(255, 255, 255)", "comment shell heading is not high contrast");
  if (!localRun) {
    await page.locator(".article-comments").scrollIntoViewIfNeeded();
    const giscusBox = page.frameLocator("iframe.giscus-frame").locator(".gsc-comment-box");
    await giscusBox.waitFor({ state: "visible", timeout: 15_000 });
    const giscusStyle = await giscusBox.evaluate((node) => ({
      background: getComputedStyle(node).backgroundColor,
      foreground: getComputedStyle(document.querySelector("main")).getPropertyValue("--color-fg-default").trim(),
    }));
    assert.equal(giscusStyle.background, "rgb(48, 49, 49)", "Giscus comment box theme did not load inside the iframe");
    assert.equal(giscusStyle.foreground, "#f5f3ef", "Giscus iframe text color is not high contrast");
  }
  const mobileHeadingCount = await page.locator("#hugo-article-content h1, #hugo-article-content h2").count();
  assert.equal(await page.locator("[data-mobile-toc-nav] [data-toc-id]").count(), mobileHeadingCount, "mobile TOC did not recognize H1/H2 headings");
  assert.equal(await page.locator(".article-toc-top-trigger:visible").count(), 1, "mobile top-right TOC button is missing");
  await page.evaluate(() => scrollTo(0, 700));
  await page.waitForTimeout(250);
  await page.locator("[data-mobile-actions-toggle]").click();
  assert.equal(await page.locator(".mobile-article-action:visible").count(), 2, "mobile article launcher did not expose TOC and back-to-top actions");
  await page.locator(".mobile-article-action[data-toc-open]").click();
  assert.equal(await page.locator("#article-toc-dialog").getAttribute("open"), "", "mobile TOC dialog did not open");
  await page.locator("[data-mobile-toc-nav] [data-toc-id]").nth(1).click();
  assert.equal(await page.locator("#article-toc-dialog").getAttribute("open"), null, "mobile TOC dialog did not close after a heading jump");

  const translatedPath = `/posts/${encodeURIComponent("测试文章标题")}/`;
  response = await page.goto(new URL(`/en${translatedPath}`, baseUrl).toString(), { waitUntil: "domcontentloaded" });
  assert.equal(response?.status(), 200);
  assert.equal(await page.locator("html").getAttribute("lang"), "en-US");
  assert.equal(await page.locator(".language-switch a.active").innerText(), "EN");
  assert.equal(await page.locator(".article-header h1").innerText(), "Test Article Title");
  assert.match(await page.locator("#hugo-article-content").innerText(), /Does this count as another kind of editor\?/);
  const sharedCommentTerm = await page.locator('script[src="https://giscus.app/client.js"]').getAttribute("data-term");
  assert.equal(sharedCommentTerm, "posts/%E6%B5%8B%E8%AF%95%E6%96%87%E7%AB%A0%E6%A0%87%E9%A2%98/");
  assert.equal(await page.locator('.language-switch a[lang="ja"]').getAttribute("href"), `/ja${translatedPath}`);
  widths = await page.evaluate(() => ({ body: document.body.scrollWidth, viewport: innerWidth }));
  assert.ok(widths.body <= widths.viewport, `mobile English article overflows: ${widths.body}px > ${widths.viewport}px`);

  response = await page.goto(new URL(`/ja${translatedPath}`, baseUrl).toString(), { waitUntil: "domcontentloaded" });
  assert.equal(response?.status(), 200);
  assert.equal(await page.locator("html").getAttribute("lang"), "ja-JP");
  assert.equal(await page.locator(".language-switch a.active").innerText(), "日本語");
  assert.equal(await page.locator(".article-header h1").innerText(), "テスト記事のタイトル");
  assert.equal(await page.locator('script[src="https://giscus.app/client.js"]').getAttribute("data-term"), sharedCommentTerm);
  assert.equal(await page.locator("[data-responsive-post-list], .post-load-sentinel").count(), 0, "article details incorrectly use progressive list loading");

  response = await page.goto(new URL("/en/blog/", baseUrl).toString(), { waitUntil: "domcontentloaded" });
  assert.equal(response?.status(), 200);
  assert.equal(await page.locator(".language-switch a.active").innerText(), "EN");
  assert.equal(await page.locator(".post-card h2", { hasText: "Test Article Title" }).count(), 1, "English blog does not show its translated article");
  assert.equal(await page.locator(".post-card h2", { hasText: "测试文章标题" }).count(), 0, "English blog shows the Chinese variant at the same time");
  assert.equal(errors.length, 0, `browser raised: ${errors.join("; ")}`);
  console.log("Browser verification passed: three-card progressive particle loading within 30-item desktop and 10-item mobile pages, accelerated avatar rotation, compact cursor, three-language UI/content switching, full article details, and overflow checks.");
} finally {
  await browser.close();
}
