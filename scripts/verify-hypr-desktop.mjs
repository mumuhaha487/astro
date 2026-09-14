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

function assertLiquidTiling(rects, layer, expectedGap, label) {
  const layerArea = layer.width * layer.height;
  const usedArea = rects.reduce((total, rect) => total + rect.width * rect.height, 0);
  const unusedRatio = (layerArea - usedArea) / layerArea;
  const separations = [];
  for (let index = 0; index < rects.length; index += 1) {
    for (let compare = index + 1; compare < rects.length; compare += 1) {
      const first = rects[index];
      const second = rects[compare];
      const horizontalOverlap = Math.min(first.right, second.right) - Math.max(first.left, second.left);
      const verticalOverlap = Math.min(first.bottom, second.bottom) - Math.max(first.top, second.top);
      assert.ok(horizontalOverlap <= 1 || verticalOverlap <= 1, `${label} windows overlap`);
      if (verticalOverlap > 4) separations.push(Math.max(second.left - first.right, first.left - second.right));
      if (horizontalOverlap > 4) separations.push(Math.max(second.top - first.bottom, first.top - second.bottom));
    }
  }
  assert.ok(
    unusedRatio > .002 && unusedRatio < .06,
    `${label} does not reserve a controlled liquid-window gap (unused=${unusedRatio.toFixed(4)}, layer=${Math.round(layer.width)}x${Math.round(layer.height)}, windows=${rects.map(rect => `${Math.round(rect.width)}x${Math.round(rect.height)}`).join("+")})`,
  );
  assert.ok(separations.some(gap => Math.abs(gap - expectedGap) <= 1.5), `${label} does not expose the configured ${expectedGap}px gap`);
}

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
  assert.equal(await avatarSwitch.locator(".archlinux-logo").count(), 1, "desktop switch has no Arch Linux icon");
  assert.equal(await page.locator(".home-desktop-switch, .sidebar-desktop-switch").count(), 0, "duplicate desktop switch entry remains");
  const homeInfoSurface = await page.locator(".home-doc-list-unframed").evaluate(element => {
    const style = getComputedStyle(element);
    const itemStyle = getComputedStyle(element.querySelector(".home-doc-item"));
    return {
      borderWidth: style.borderTopWidth,
      borderRadius: style.borderTopLeftRadius,
      background: style.backgroundColor,
      boxShadow: style.boxShadow,
      backdropFilter: style.backdropFilter || style.webkitBackdropFilter,
      itemBackground: itemStyle.backgroundColor,
    };
  });
  assert.equal(homeInfoSurface.borderWidth, "0px", "homepage information area still has an outer border");
  assert.equal(homeInfoSurface.borderRadius, "0px", "homepage information area still has glass-frame corners");
  assert.match(homeInfoSurface.background, /rgba\([^)]*, 0\)/, "homepage information area still has a visible glass background");
  assert.equal(homeInfoSurface.boxShadow, "none", "homepage information area still has a glass shadow");
  assert.equal(homeInfoSurface.backdropFilter, "none", "homepage information area still blurs the wallpaper");
  assert.match(homeInfoSurface.itemBackground, /rgba\([^)]*, 0\)/, "homepage content sections still have glass backgrounds");
  await page.screenshot({ path: `${process.env.TEMP}\\hypr-home-switch-1600x900.png`, fullPage: true });
  await avatarSwitch.click();
  await page.waitForFunction(() => document.querySelector(".desktop-transition-overlay")?.dataset.transitionState === "particles");
  await page.waitForFunction(() => document.querySelector(".desktop-transition-overlay")?.dataset.transitionState === "loading");
  await page.waitForFunction(() => {
    const overlay = document.querySelector(".desktop-transition-overlay");
    const barrage = document.querySelector(".desktop-transition-barrage");
    const loading = document.querySelector(".desktop-transition-loading");
    const visibleLabel = [...document.querySelectorAll(".desktop-transition-barrage span")].some(element => {
      const rect = element.getBoundingClientRect();
      return rect.left < innerWidth && rect.right > 0;
    });
    return overlay?.dataset.transitionState === "barrage"
      && Number(getComputedStyle(barrage).opacity) > .5
      && Number(getComputedStyle(loading).opacity) < .2
      && visibleLabel;
  });
  await page.waitForURL(/\/desktop\/\?from=classic/, { timeout: 8_000 });
  await page.waitForFunction(() => document.querySelector("#hypr-desktop")?.dataset.desktopReady === "true");
  await page.waitForFunction(() => document.querySelector("#hypr-desktop")?.dataset.entryState === "complete", { timeout: 4_000 });
  await page.waitForTimeout(200);
  assert.equal(await page.locator(".hypr-window").count(), 1, "desktop should start with one welcome window");
  assert.equal(await page.locator(".desktop-icon").count(), 6, "desktop icons are incomplete");
  assert.equal(await page.locator("[data-workspace-target]").count(), 5, "workspace switcher is incomplete");
  assert.equal(await page.locator("#hypr-desktop").getAttribute("data-layout-mode"), "stacked", "desktop should default to the HyDE stacked layout");
  assert.equal(await page.locator("[data-layout-toggle]").getAttribute("aria-pressed"), "true", "layout toggle state does not match the default stack");
  assert.equal(await page.locator(".waybar [data-return-classic]").isVisible(), true, "waybar cannot visibly return to classic mode");
  assert.equal(await page.locator(".hypr-dock [data-return-classic]").isVisible(), true, "dock has no classic-style return control");
  assert.equal(await page.locator("[data-language-toggle]").isVisible(), true, "desktop language control is not visible");
  const desktopIconPositions = await page.locator(".desktop-icon").evaluateAll(elements => elements.slice(0, 3).map(element => {
    const rect = element.getBoundingClientRect();
    return { left: Math.round(rect.left), top: Math.round(rect.top) };
  }));
  assert.equal(new Set(desktopIconPositions.map(item => item.left)).size, 1, "desktop application icons are no longer arranged vertically");
  assert.ok(desktopIconPositions[1].top > desktopIconPositions[0].top, "desktop application icons overlap vertically");
  await page.locator("[data-language-toggle]").click();
  assert.equal(await page.locator("#language-panel [data-locale]").count(), 3, "language panel does not expose three languages");
  assert.equal(await page.locator('#language-panel [data-locale="ja"] strong').textContent(), "日本語", "Japanese is not named explicitly for Japanese visitors");
  await page.screenshot({ path: `${process.env.TEMP}\\hypr-language-panel-1600x900.png`, fullPage: true });
  await page.locator('#language-panel [data-locale="en"]').click();
  await page.waitForFunction(() => document.querySelector("#hypr-desktop")?.dataset.locale === "en" && document.documentElement.lang === "en");
  await page.waitForFunction(() => document.querySelector(".welcome-heading h1")?.textContent.includes("desktop workspace"));
  await page.locator('.hypr-dock [data-app="blog"]').click();
  await page.waitForSelector('.hypr-window[data-app="blog"] .native-blog-app');
  assert.ok(await page.locator('.hypr-window[data-app="blog"] [data-post-url^="/en/posts/"]').count() > 0, "English desktop blog did not load English articles");
  assert.match(await page.locator('.hypr-window[data-app="blog"] .native-result-line').textContent(), /articles/, "English blog controls are not translated");
  await page.locator("[data-language-toggle]").click();
  await page.locator('#language-panel [data-locale="ja"]').click();
  await page.waitForFunction(() => document.querySelector("#hypr-desktop")?.dataset.locale === "ja" && document.documentElement.lang === "ja");
  await page.waitForFunction(() => document.querySelector('.hypr-window[data-app="blog"] [data-post-url^="/ja/posts/"]'));
  assert.match(await page.locator('.hypr-window[data-app="blog"] .native-result-line').textContent(), /全 \d+ 件/, "Japanese blog controls are not translated");
  await page.screenshot({ path: `${process.env.TEMP}\\hypr-japanese-blog-1600x900.png`, fullPage: true });
  await page.locator('.hypr-window[data-app="blog"] [data-window-action="close"]').click();
  await page.waitForSelector('.hypr-window[data-app="blog"]', { state: "detached" });
  await page.locator("[data-language-toggle]").click();
  await page.locator('#language-panel [data-locale="zh"]').click();
  await page.waitForFunction(() => document.querySelector("#hypr-desktop")?.dataset.locale === "zh-CN" || document.querySelector("#hypr-desktop")?.dataset.locale === "zh");
  await page.waitForFunction(() => document.querySelector(".welcome-copy")?.textContent.startsWith("这是一个启发于"));
  assert.equal(await page.locator(".welcome-mark .archlinux-logo").count(), 1, "welcome title has no Arch Linux icon");
  assert.equal(await page.locator(".welcome-copy").textContent(), "这是一个启发于 Arch Linux + Hyprland，让你更加方便地浏览博客中的各个网页（甚至可以做到嵌套运行）。");
  assert.equal(await page.locator(".welcome-card, .welcome-grid").count(), 0, "removed welcome explanation sections remain");

  await page.locator('.hypr-dock [data-app="home"]').click();
  await page.waitForSelector('.hypr-window[data-app="home"] .native-home-app');
  assert.ok(await page.locator('.hypr-window[data-app="home"] .native-post-card').count() >= 1, "native home view has no recent articles");
  assert.equal(await page.locator('.hypr-window[data-app="home"] iframe').count(), 0, "home still opens as an embedded website");
  await page.locator('.hypr-window[data-app="home"] [data-window-action="close"]').click();
  await page.waitForSelector('.hypr-window[data-app="home"]', { state: "detached" });

  await page.locator('.hypr-dock [data-app="blog"]').click();
  await page.locator('.hypr-dock [data-app="tools"]').click();
  await page.waitForFunction(() => document.querySelectorAll(".hypr-window").length === 3);
  await page.waitForFunction(() => [...document.querySelectorAll(".hypr-window[data-app=blog], .hypr-window[data-app=tools]")].every(windowElement => windowElement.classList.contains("is-loaded")));
  await page.waitForTimeout(650);
  assert.equal(await page.locator('.hypr-window[data-app="blog"] .native-blog-app').count(), 1, "blog did not open as a native desktop view");
  assert.equal(await page.locator('.hypr-window[data-app="tools"] .native-tools-app').count(), 1, "tools did not open as a native desktop view");
  assert.equal(await page.locator('.window-content > iframe').count(), 0, "desktop applications still open in iframe wrappers");
  assert.ok(await page.locator('.hypr-window[data-app="blog"] .native-post-card').count() >= 1, "native blog list is empty");
  await page.locator('.hypr-dock [data-app="blog"]').click();
  await page.locator('.hypr-window[data-app="blog"] .native-post-card').first().click();
  await page.waitForSelector('.hypr-window[data-app="blog"] .native-reader .native-article-body');
  assert.ok((await page.locator('.hypr-window[data-app="blog"] .native-article-body').textContent()).trim().length > 20, "native article reader has no content");
  await page.locator('.hypr-window[data-app="blog"] [data-reader-back]').click();
  await page.waitForSelector('.hypr-window[data-app="blog"] .native-blog-app');

  const stackedRects = await page.locator('.hypr-window.is-floating').evaluateAll(elements => elements.map(element => {
    const rect = element.getBoundingClientRect();
    return { width: rect.width, height: rect.height, left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom };
  }));
  assert.equal(stackedRects.length, 3, "applications should open in the stacked layout");
  assert.equal(new Set(stackedRects.map(rect => Math.round(rect.width))).size, 1, "stacked windows do not share one readable size");
  assert.ok(new Set(stackedRects.map(rect => `${Math.round(rect.left)}:${Math.round(rect.top)}`)).size > 1, "stacked windows do not form a visible cascade");
  assert.ok(stackedRects.every(rect => rect.width >= 600 && rect.height >= 420 && rect.left >= 0 && rect.right <= 1600 && rect.top >= 45 && rect.bottom <= 900), `stacked layout squeezes or overflows a window: ${JSON.stringify(stackedRects)}`);
  assert.ok(Number.parseFloat(await page.locator(".hypr-window").first().evaluate(element => getComputedStyle(element).borderTopLeftRadius)) >= 30, "stacked windows lost the large Hyprliquid corner radius");

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
  const tiledGap = await page.locator("#hypr-desktop").evaluate(element => Number.parseFloat(getComputedStyle(element).getPropertyValue("--window-gap")));
  assert.equal(await page.locator("[data-layout-toggle]").getAttribute("aria-pressed"), "false", "layout toggle did not enter tiled mode");
  assert.equal(tiledRects.length, 3, "all open windows were not included in the tiled layout");
  assert.ok(tiledRects.every(rect => rect.left >= tiledLayer.left - 1 && rect.right <= tiledLayer.right + 1 && rect.top >= tiledLayer.top - 1 && rect.bottom <= tiledLayer.bottom + 1), "a tiled window overflows the usable work area");
  assertLiquidTiling(tiledRects, tiledLayer, tiledGap, "desktop tiled layout");
  assert.equal(await page.locator(".hypr-dock [data-launcher-open]").isVisible(), true, "all-app launcher is hidden behind tiled windows");
  await page.screenshot({ path: `${process.env.TEMP}\\hypr-liquid-tiled-1600x900.png`, fullPage: true });
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
  const terminalInput = page.locator('.hypr-window[data-app="terminal"] .terminal-command input');
  assert.equal(await terminalInput.count(), 1);
  await terminalInput.fill("help");
  await terminalInput.press("Enter");
  assert.match(await page.locator('.hypr-window[data-app="terminal"] .terminal-output').textContent(), /fastfetch[\s\S]*layout \[stacked\|tiled\][\s\S]*classic/, "extended terminal help is incomplete");
  await terminalInput.fill("fast");
  await terminalInput.press("Tab");
  assert.equal(await terminalInput.inputValue(), "fastfetch ", "terminal Tab completion does not complete a unique command");
  await terminalInput.press("Enter");
  assert.match(await page.locator('.hypr-window[data-app="terminal"] .terminal-output').textContent(), /OS: Arch Linux \(web\)/, "fastfetch static output is missing");
  await terminalInput.press("ArrowUp");
  assert.equal(await terminalInput.inputValue(), "fastfetch", "terminal history does not recall the last command");
  await terminalInput.press("ArrowDown");
  assert.equal(await terminalInput.inputValue(), "", "terminal history cannot return to an empty prompt");
  await terminalInput.fill("cat /etc/os-release");
  await terminalInput.press("Enter");
  assert.match(await page.locator('.hypr-window[data-app="terminal"] .terminal-output').textContent(), /NAME="Arch Linux"[\s\S]*BUILD_ID=rolling/, "Arch os-release example is missing");
  await terminalInput.fill("fortune");
  await terminalInput.press("Enter");
  assert.match(await page.locator('.hypr-window[data-app="terminal"] .terminal-output').textContent(), /保持好奇|清晰的目录|今天写下/, "terminal fun command has no output");
  await page.screenshot({ path: `${process.env.TEMP}\\hypr-terminal-commands-1600x900.png`, fullPage: true });
  await terminalInput.fill("history");
  await terminalInput.press("Enter");
  assert.match(await page.locator('.hypr-window[data-app="terminal"] .terminal-output').textContent(), /1  help[\s\S]*2  fastfetch[\s\S]*history/, "terminal history does not show the current session");
  await terminalInput.press("Control+l");
  assert.equal(await page.locator('.hypr-window[data-app="terminal"] .terminal-output').textContent(), "", "terminal Ctrl+L does not clear the output");
  await terminalInput.fill("layout tiled");
  await terminalInput.press("Enter");
  await page.waitForFunction(() => document.querySelector("#hypr-desktop")?.dataset.layoutMode === "tiled");
  await terminalInput.fill("layout stacked");
  await terminalInput.press("Enter");
  await page.waitForFunction(() => document.querySelector("#hypr-desktop")?.dataset.layoutMode === "stacked");
  const terminalWallBefore = await page.locator("#wallpaper-image").getAttribute("src");
  await terminalInput.fill("wallpaper next");
  await terminalInput.press("Enter");
  await page.waitForFunction(previous => document.querySelector("#wallpaper-image")?.getAttribute("src") !== previous, terminalWallBefore);

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
  await page.locator(".hypr-dock [data-return-classic]").click();
  await page.waitForFunction(() => document.querySelector("#hypr-desktop")?.dataset.returnState === "collapsing");
  assert.ok(await page.locator(".classic-return-window").count() >= 1, "return animation does not collapse the open windows");
  await page.waitForFunction(() => document.querySelector(".classic-return-transition")?.dataset.phase === "ready");
  assert.equal(await page.locator(".classic-return-message").isVisible(), true, "return animation confirmation never appears");
  await page.waitForTimeout(220);
  assert.ok(Number(await page.locator(".classic-return-message").evaluate(element => getComputedStyle(element).opacity)) > .45, "return animation confirmation remains visually hidden");
  await page.screenshot({ path: `${process.env.TEMP}\\hypr-classic-return-transition.png`, fullPage: true });
  await page.waitForURL(new URL("/", baseUrl).toString());
  assert.equal(new URL(page.url()).pathname, "/", "classic-mode return control did not leave the desktop");
  assert.equal(await page.locator("html.from-hypr-desktop").count(), 1, "classic homepage does not animate after the desktop return");
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
  const compactLayer = await compactPage.locator("#windows-layer").evaluate(element => {
    const rect = element.getBoundingClientRect();
    return { width: rect.width, height: rect.height, left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom };
  });
  const compactGap = await compactPage.locator("#hypr-desktop").evaluate(element => Number.parseFloat(getComputedStyle(element).getPropertyValue("--window-gap")));
  assert.ok(compactTiledRects.every(rect => rect.left >= 0 && rect.right <= 1024 && rect.top >= 45 && rect.bottom <= 768), "compact tiled layout overflows the viewport");
  assertLiquidTiling(compactTiledRects, compactLayer, compactGap, "compact tiled layout");
  await compact.close();

  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const mobilePage = await mobile.newPage();
  response = await mobilePage.goto(new URL("/desktop/", baseUrl).toString(), { waitUntil: "domcontentloaded" });
  assert.equal(response?.status(), 200);
  await mobilePage.waitForFunction(() => document.querySelector("#hypr-desktop")?.dataset.desktopReady === "true");
  const responsiveMobileIcons = await mobilePage.locator(".desktop-icon").evaluateAll(elements => elements.map(element => {
    const rect = element.getBoundingClientRect();
    return { left: Math.round(rect.left), top: Math.round(rect.top) };
  }));
  assert.equal(new Set(responsiveMobileIcons.slice(0, 4).map(item => item.top)).size, 1, "390px mobile viewport does not expand to four icon columns");
  assert.ok(responsiveMobileIcons[4].top > responsiveMobileIcons[0].top, "responsive mobile icon rows overlap");
  await mobilePage.waitForSelector(".desktop-toast");
  await mobilePage.waitForTimeout(450);
  const mobileWelcomeAndToast = await mobilePage.locator(".hypr-window, .desktop-toast").evaluateAll(elements => elements.map(element => {
    const rect = element.getBoundingClientRect();
    return { className: element.className, top: rect.top, bottom: rect.bottom };
  }));
  const mobileWelcomeRect = mobileWelcomeAndToast.find(rect => rect.className.includes("hypr-window"));
  const mobileToastRect = mobileWelcomeAndToast.find(rect => rect.className.includes("desktop-toast"));
  assert.ok(mobileWelcomeRect && mobileToastRect && mobileWelcomeRect.bottom <= mobileToastRect.top - 4, "mobile notification overlaps the welcome window");
  await mobilePage.screenshot({ path: `${process.env.TEMP}\\hypr-welcome-unframed-mobile-390x844.png`, fullPage: true });
  await mobilePage.waitForSelector(".desktop-toast", { state: "detached" });
  await mobilePage.waitForTimeout(450);
  await mobilePage.keyboard.press("Alt+Space");
  const launcherGeometry = await mobilePage.locator(".launcher-grid").evaluate(element => ({ clientHeight: element.clientHeight, scrollHeight: element.scrollHeight }));
  assert.ok(launcherGeometry.clientHeight > 0, "mobile launcher has no usable scroll area");
  await mobilePage.locator('.launcher-app[data-launcher-app="welcome"]').scrollIntoViewIfNeeded();
  const launcherLastItem = await mobilePage.locator('.launcher-app[data-launcher-app="welcome"]').evaluate(element => {
    const rect = element.getBoundingClientRect();
    const grid = element.closest(".launcher-grid").getBoundingClientRect();
    return { top: rect.top, bottom: rect.bottom, gridTop: grid.top, gridBottom: grid.bottom };
  });
  assert.ok(launcherLastItem.top >= launcherLastItem.gridTop - 1 && launcherLastItem.bottom <= launcherLastItem.gridBottom + 1, "mobile launcher cannot scroll to its last application");
  await mobilePage.screenshot({ path: `${process.env.TEMP}\\hypr-launcher-mobile-390x844.png`, fullPage: true });
  await mobilePage.keyboard.press("Escape");
  await mobilePage.locator('.hypr-dock [data-app="blog"]').tap();
  await mobilePage.waitForFunction(() => document.querySelector('.hypr-window[data-app="blog"]')?.classList.contains("is-loaded"));
  await mobilePage.waitForSelector('.hypr-window[data-app="blog"] .native-blog-app');
  await mobilePage.waitForTimeout(650);
  assert.equal(await mobilePage.locator('.hypr-window[data-app="blog"] .native-post-card').count(), 10, "mobile native blog does not show ten posts per page");
  const mobileScroll = await mobilePage.locator('.hypr-window[data-app="blog"] .native-scroll').evaluate(element => {
    const before = element.scrollTop;
    element.scrollTop = Math.min(180, element.scrollHeight - element.clientHeight);
    return { before, after: element.scrollTop, clientHeight: element.clientHeight, scrollHeight: element.scrollHeight, touchAction: getComputedStyle(element).touchAction };
  });
  assert.ok(mobileScroll.scrollHeight > mobileScroll.clientHeight && mobileScroll.after > mobileScroll.before, "mobile blog content cannot scroll");
  assert.equal(mobileScroll.touchAction, "pan-y", "mobile blog does not allow vertical touch panning");
  await mobilePage.locator('.hypr-window[data-app="blog"] .native-scroll').evaluate(element => { element.scrollTop = 0; });
  await mobilePage.screenshot({ path: `${process.env.TEMP}\\hypr-blog-native-mobile-390x844.png`, fullPage: true });
  await mobilePage.locator('.hypr-window[data-app="blog"] .native-post-card').nth(1).tap();
  await mobilePage.waitForSelector('.hypr-window[data-app="blog"] .native-article-body');
  const mobileArticleFont = await mobilePage.locator('.hypr-window[data-app="blog"] .native-article-body').evaluate(element => Number.parseFloat(getComputedStyle(element).fontSize));
  assert.ok(mobileArticleFont <= 13, `mobile article font is too large (${mobileArticleFont}px)`);
  assert.equal(await mobilePage.locator('.hypr-window[data-app="blog"] .native-article-body script').count(), 0, "native article reader retained executable scripts");
  await mobilePage.screenshot({ path: `${process.env.TEMP}\\hypr-article-native-mobile-390x844.png`, fullPage: true });
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
  const mobileLayer = await mobilePage.locator("#windows-layer").evaluate(element => {
    const rect = element.getBoundingClientRect();
    return { width: rect.width, height: rect.height, left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom };
  });
  const mobileGap = await mobilePage.locator("#hypr-desktop").evaluate(element => Number.parseFloat(getComputedStyle(element).getPropertyValue("--window-gap")));
  assertLiquidTiling(mobileWindows.map(rect => ({ ...rect, width: rect.right - rect.left, height: rect.bottom - rect.top })), mobileLayer, mobileGap, "mobile tiled layout");
  await mobilePage.screenshot({ path: `${process.env.TEMP}\\hypr-desktop-mobile-390x844.png`, fullPage: true });
  await mobile.close();

  const narrow = await browser.newContext({ viewport: { width: 360, height: 780 }, isMobile: true, hasTouch: true });
  const narrowPage = await narrow.newPage();
  response = await narrowPage.goto(new URL("/desktop/", baseUrl).toString(), { waitUntil: "domcontentloaded" });
  assert.equal(response?.status(), 200);
  await narrowPage.waitForFunction(() => document.querySelector("#hypr-desktop")?.dataset.desktopReady === "true");
  const narrowIconGeometry = await narrowPage.locator(".desktop-icon, .desktop-icon-shape").evaluateAll(elements => elements.map(element => {
    const rect = element.getBoundingClientRect();
    return { className: element.className, width: rect.width, height: rect.height, left: rect.left, top: rect.top };
  }));
  const narrowAppIcons = narrowIconGeometry.filter(item => item.className === "desktop-icon");
  const narrowIconShapes = narrowIconGeometry.filter(item => item.className.includes("desktop-icon-shape"));
  assert.ok(narrowAppIcons.every(item => item.width <= 72 && item.height >= 44 && item.height <= 68), "mobile desktop app targets are oversized or too small to tap");
  assert.ok(narrowIconShapes.every(item => item.width <= 34 && item.height <= 34), "mobile desktop icon artwork is still oversized");
  assert.equal(new Set(narrowAppIcons.slice(0, 3).map(item => Math.round(item.top))).size, 1, "mobile desktop does not place three applications in the first row");
  assert.ok(narrowAppIcons[3].top > narrowAppIcons[0].top, "mobile desktop application rows overlap");
  const narrowColumnGaps = narrowAppIcons.slice(1, 3).map((item, index) => Math.round(item.left - narrowAppIcons[index].left - narrowAppIcons[index].width));
  assert.ok(narrowColumnGaps.every(gap => Math.abs(gap - 18) <= 1), `mobile desktop icon gaps are not fixed at 18px: ${narrowColumnGaps.join(", ")}`);
  const narrowBarGeometry = await narrowPage.locator(".waybar-left, .layout-mode-toggle, .layout-mode-glyph, .waybar-right").evaluateAll(elements => elements.map(element => {
    const rect = element.getBoundingClientRect();
    return { className: element.className, left: rect.left, right: rect.right, width: rect.width };
  }));
  const narrowLeft = narrowBarGeometry.find(rect => rect.className.includes("waybar-left"));
  const narrowLayout = narrowBarGeometry.find(rect => rect.className === "layout-mode-toggle");
  const narrowGlyph = narrowBarGeometry.find(rect => rect.className === "layout-mode-glyph");
  const narrowRight = narrowBarGeometry.find(rect => rect.className.includes("waybar-right"));
  assert.ok(narrowLeft && narrowLayout && narrowGlyph && narrowRight, "narrow status-bar geometry is incomplete");
  assert.ok(narrowLeft.right <= narrowRight.left, "narrow status-bar groups overlap");
  assert.equal(Math.round(narrowLayout.width), 29, "narrow layout button is compressed");
  assert.ok(narrowLayout.left <= narrowGlyph.left && narrowGlyph.right <= narrowLayout.right, "layout glyph overflows its button");
  assert.equal(await narrowPage.locator(".waybar .classic-return").isVisible(), false, "duplicate top return control still crowds the narrow status bar");
  assert.equal(await narrowPage.locator(".hypr-dock [data-return-classic]").isVisible(), true, "narrow desktop lost its classic-mode return control");
  await narrowPage.locator('.hypr-window[data-app="welcome"] [data-window-action="close"]').tap();
  await narrowPage.waitForSelector('.hypr-window[data-app="welcome"]', { state: "detached" });
  await narrowPage.screenshot({ path: `${process.env.TEMP}\\hypr-icons-mobile-360x780.png`, fullPage: true });
  await narrowPage.locator('.desktop-icon[data-app="blog"]').tap();
  await narrowPage.waitForSelector('.hypr-window[data-app="blog"] .native-blog-app');
  await narrowPage.waitForTimeout(650);
  assert.equal(await narrowPage.locator('.hypr-window[data-app="blog"]').count(), 1, "a single mobile tap does not open an application");
  await narrowPage.screenshot({ path: `${process.env.TEMP}\\hypr-desktop-narrow-360x780.png`, fullPage: true });
  await narrow.close();

  const shortMobile = await browser.newContext({ viewport: { width: 360, height: 600 }, isMobile: true, hasTouch: true });
  const shortPage = await shortMobile.newPage();
  response = await shortPage.goto(new URL("/desktop/", baseUrl).toString(), { waitUntil: "domcontentloaded" });
  assert.equal(response?.status(), 200);
  await shortPage.waitForFunction(() => document.querySelector("#hypr-desktop")?.dataset.desktopReady === "true");
  await shortPage.keyboard.press("Alt+Space");
  const shortLauncher = await shortPage.locator(".launcher-grid").evaluate(element => ({ clientHeight: element.clientHeight, scrollHeight: element.scrollHeight }));
  assert.ok(shortLauncher.scrollHeight > shortLauncher.clientHeight, "short mobile launcher does not create a bounded scroll area");
  await shortPage.locator('.launcher-app[data-launcher-app="welcome"]').scrollIntoViewIfNeeded();
  const shortLastVisible = await shortPage.locator('.launcher-app[data-launcher-app="welcome"]').evaluate(element => {
    const item = element.getBoundingClientRect();
    const grid = element.closest(".launcher-grid").getBoundingClientRect();
    return item.top >= grid.top - 1 && item.bottom <= grid.bottom + 1;
  });
  assert.equal(shortLastVisible, true, "short mobile launcher cannot reach its final row");
  await shortPage.screenshot({ path: `${process.env.TEMP}\\hypr-launcher-short-mobile-360x600.png`, fullPage: true });
  await shortPage.locator('.launcher-app[data-launcher-app="archive"]').tap();
  await shortPage.waitForSelector('.hypr-window[data-app="archive"] .native-archive-app');
  assert.equal(await shortPage.locator('.hypr-window[data-app="archive"] [data-post-url]').count(), 95, "native archive does not expose all posts");
  await shortPage.locator('.hypr-window[data-app="archive"] [data-window-action="close"]').tap();
  await shortPage.waitForSelector('.hypr-window[data-app="archive"]', { state: "detached" });
  await shortPage.keyboard.press("Alt+Space");
  await shortPage.locator('.launcher-app[data-launcher-app="friends"]').tap();
  await shortPage.waitForSelector('.hypr-window[data-app="friends"] .native-friends-app');
  assert.equal(await shortPage.locator('.hypr-window[data-app="friends"] .native-friend').count(), 4, "native friends view did not load local build data");
  await shortPage.locator('.hypr-window[data-app="friends"] [data-window-action="close"]').tap();
  await shortPage.waitForSelector('.hypr-window[data-app="friends"]', { state: "detached" });
  await shortPage.keyboard.press("Alt+Space");
  await shortPage.locator('.launcher-app[data-launcher-app="guestbook"]').tap();
  await shortPage.waitForSelector('.hypr-window[data-app="guestbook"] .native-guestbook-app');
  assert.equal(await shortPage.locator('.hypr-window[data-app="guestbook"] a[href="/guestbook/"]').count(), 1, "native guestbook gateway is missing its functional local route");
  await shortMobile.close();

  console.log("Hyprland desktop verification passed: responsive mobile icon columns, vertical desktop icons, Chinese/English/Japanese native views, local article routes, scrollable mobile content, stacked/tiled windows, terminal commands, workspaces, wallpapers, and compact screens.");
} finally {
  await browser.close();
}
