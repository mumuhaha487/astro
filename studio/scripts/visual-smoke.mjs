import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { chromium } from "playwright-core";

const chromeCandidates = [
  process.env.PLAYWRIGHT_CHROME_PATH,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
].filter(Boolean);
const executablePath = chromeCandidates.find(existsSync);
assert(executablePath, "Chrome or Chromium was not found. Set PLAYWRIGHT_CHROME_PATH.");

const outputDirectory = join(tmpdir(), "astro-studio-visual");
await mkdir(outputDirectory, { recursive: true });
const browser = await chromium.launch({ executablePath, headless: true });

async function assertEveryMenuItemIsTopLayer(menu, itemSelector, message) {
  const menuSelector = ".mdxeditor-select-content, .csdn-format-menu-popup, .csdn-color-palette";
  const items = menu.locator(itemSelector);
  const nestedScroll = menu.locator("[data-menu-scroll]");
  const scrollOwner = await nestedScroll.count() ? nestedScroll : menu;
  const initialScrollTop = await scrollOwner.evaluate((element) => element.scrollTop);
  const visibility = [];
  for (let index = 0; index < await items.count(); index += 1) {
    const item = items.nth(index);
    await item.scrollIntoViewIfNeeded();
    visibility.push(await item.evaluate((element, selector) => {
      const owner = element.closest(selector);
      const rect = element.getBoundingClientRect();
      const ownerRect = owner?.getBoundingClientRect();
      if (!ownerRect) return false;
      const left = Math.max(rect.left, ownerRect.left, 0);
      const right = Math.min(rect.right, ownerRect.right, window.innerWidth);
      const top = Math.max(rect.top, ownerRect.top, 0);
      const bottom = Math.min(rect.bottom, ownerRect.bottom, window.innerHeight);
      if (right <= left || bottom <= top) return false;
      const hit = document.elementFromPoint((left + right) / 2, (top + bottom) / 2);
      return hit?.closest(selector) === owner;
    }, menuSelector));
  }
  await scrollOwner.evaluate((element, scrollTop) => { element.scrollTop = scrollTop; }, initialScrollTop);
  assert(visibility.length > 0 && visibility.every(Boolean), `${message}: ${JSON.stringify(visibility)}`);
}

async function selectEditorText(page, text) {
  const selected = await page.locator(".studio-rich-content[contenteditable='true']").evaluate((root, expected) => {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const start = node.textContent?.indexOf(expected) ?? -1;
      if (start < 0) continue;
      const range = document.createRange();
      range.setStart(node, start);
      range.setEnd(node, start + expected.length);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
      return selection?.toString() === expected;
    }
    return false;
  }, text);
  assert.equal(selected, true, `editor text was not selectable: ${text}`);
}

const examplePost = {
  path: "content/posts/visual-history.md",
  sha: "a".repeat(40),
  title: "移动端历史测试文章",
  published: "2026-09-04",
  description: "验证极窄屏下的完整编辑和历史恢复流程",
  image: "",
  tags: ["Astro", "Studio"],
  category: "开发记录",
  draft: false,
  pinned: true,
  priority: 1,
  lang: "zh-CN",
  comment: true,
  encrypted: false,
};

const exampleContent = `---
title: 移动端历史测试文章
published: 2026-09-04
description: 验证极窄屏下的完整编辑和历史恢复流程
image: ""
tags:
  - Astro
  - Studio
category: 开发记录
draft: false
pinned: true
priority: 1
lang: zh-CN
comment: true
encrypted: false
---

## 当前版本

这是当前文章内容。
`;

const historyContent = exampleContent
  .replace("移动端历史测试文章", "历史版本文章")
  .replace("## 当前版本", "## 历史版本")
  .replace("这是当前文章内容。", "这是从 GitHub 历史读取的正文。");

const exampleDraft = {
  key: "visual-orphan-draft",
  path: "draft:new:visual-orphan-draft",
  title: "待删除的云端草稿",
  updatedAt: "2026-09-04T09:30:00Z",
  isNew: true,
};

const exampleDraftContent = exampleContent
  .replaceAll("移动端历史测试文章", exampleDraft.title)
  .replace("draft: false", "draft: true")
  .replace("pinned: true", "pinned: false");

async function mockStudioApi(page, { includeDraft = false, mutations = [] } = {}) {
  let postRecords = [examplePost];
  let draftRecords = includeDraft ? [exampleDraft] : [];
  await page.route("**/api/**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const json = (value, status = 200) => route.fulfill({
      status,
      contentType: "application/json; charset=utf-8",
      body: JSON.stringify(value),
    });
    if (url.pathname === "/api/session") {
      return json({
        authenticated: true,
        github: { connected: true, login: "visual-test", repository: "mumuhaha487/astro", branch: "main" },
      });
    }
    if (url.pathname === "/api/posts") return json({ posts: postRecords });
    if (url.pathname === "/api/post" && request.method() === "GET") {
      return json({ path: examplePost.path, sha: examplePost.sha, content: exampleContent });
    }
    if (url.pathname === "/api/post" && request.method() === "PUT") {
      const body = request.postDataJSON();
      mutations.push({ method: "PUT", path: url.pathname, body });
      return json({ path: body.path, sha: "d".repeat(40), content: body.content });
    }
    if (url.pathname === "/api/post" && request.method() === "DELETE") {
      const body = request.postDataJSON();
      mutations.push({ method: "DELETE", path: url.pathname, body });
      postRecords = postRecords.filter((post) => post.path !== body.path);
      return json({ ok: true });
    }
    if (url.pathname === "/api/history") {
      return json({ revisions: [
        {
          sha: "b".repeat(40),
          message: "更新移动端编辑体验",
          author: "visual-test",
          committedAt: "2026-09-03T08:30:00Z",
          htmlUrl: "https://github.com/mumuhaha487/astro/commit/" + "b".repeat(40),
        },
        {
          sha: "c".repeat(40),
          message: "创建文章",
          author: "visual-test",
          committedAt: "2026-09-02T08:30:00Z",
          htmlUrl: "https://github.com/mumuhaha487/astro/commit/" + "c".repeat(40),
        },
      ] });
    }
    if (url.pathname === "/api/history/content") {
      return json({ path: examplePost.path, commitSha: url.searchParams.get("sha"), content: historyContent });
    }
    if (url.pathname === "/api/drafts" && request.method() === "GET") return json({ drafts: draftRecords });
    if (url.pathname === "/api/draft" && request.method() === "GET") {
      const draft = draftRecords.find((item) => item.key === url.searchParams.get("key"));
      return draft
        ? json({ ...draft, sha: "", content: exampleDraftContent })
        : json({ error: "Draft not found" }, 404);
    }
    if (url.pathname === "/api/draft" && request.method() === "PUT") {
      const body = request.postDataJSON();
      mutations.push({ method: "PUT", path: url.pathname, body });
      const saved = { key: body.key || "visual-draft", path: body.path, title: body.title, updatedAt: body.updatedAt, isNew: body.isNew };
      draftRecords = [saved, ...draftRecords.filter((draft) => draft.key !== saved.key)];
      return json(saved);
    }
    if (url.pathname === "/api/draft" && request.method() === "DELETE") {
      const body = request.postDataJSON();
      mutations.push({ method: "DELETE", path: url.pathname, body });
      draftRecords = draftRecords.filter((draft) => draft.key !== body.key);
      return json({ ok: true });
    }
    if (url.pathname === "/api/schedule" && request.method() === "PUT") {
      const body = request.postDataJSON();
      mutations.push({ method: "PUT", path: url.pathname, body });
      return json({ ...body, key: "visual-schedule", createdAt: new Date().toISOString() });
    }
    if (url.pathname === "/api/image" && request.method() === "POST") {
      return json({ path: "public/image/editor/2026/09/visual-test.png", url: "/image/editor/2026/09/visual-test.png" });
    }
    if (url.pathname === "/api/media" && request.method() === "POST") {
      return json({ path: "public/video/editor/2026/09/visual-test.mp4", url: "/video/editor/2026/09/visual-test.mp4" });
    }
    if (url.pathname === "/api/resources" && request.method() === "GET") {
      return json({ resources: [{ path: "public/resource/editor/2026/09/existing-pack.zip", url: "/resource/editor/2026/09/existing-pack.zip", name: "existing-pack.zip", size: 2048 }] });
    }
    if (url.pathname === "/api/resources" && request.method() === "POST") {
      return json({
        path: "public/resource/editor/2026/09/visual-test.zip",
        url: "/resource/editor/2026/09/visual-test.zip",
        name: "Astro 示例资源",
        size: 4096,
        description: "可运行的 Astro 示例代码",
        category: "code",
        tags: ["Astro", "示例"],
      });
    }
    return json({ error: `Unhandled visual test API: ${request.method()} ${url.pathname}` }, 404);
  });
}

async function openEditor(viewport, { existing = false, includeDraft = false } = {}) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1 });
  const page = await context.newPage();
  const pageErrors = [];
  const mutations = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await mockStudioApi(page, { includeDraft, mutations });
  await page.goto(process.env.STUDIO_VISUAL_URL || "http://127.0.0.1:4174", { waitUntil: "networkidle" });
  if (existing) {
    await page.locator(".editor-back-button").click();
    await page.locator(".post-row").filter({ hasText: examplePost.title }).click();
  } else {
    await page.locator(".empty-editor button").click();
  }
  await page.locator(".csdn-editor-toolbar").waitFor();
  return { context, page, pageErrors, mutations };
}

async function layoutMetrics(page) {
  return page.evaluate(() => {
    const rect = (selector) => {
      const element = document.querySelector(selector);
      if (!element) return null;
      const value = element.getBoundingClientRect();
      return {
        x: Math.round(value.x),
        y: Math.round(value.y),
        width: Math.round(value.width),
        height: Math.round(value.height),
        scrollWidth: element.scrollWidth,
        clientWidth: element.clientWidth,
      };
    };
    return {
      viewport: { width: innerWidth, height: innerHeight },
      body: { scrollWidth: document.body.scrollWidth, clientWidth: document.body.clientWidth },
      topbar: rect(".topbar"),
      topbarBrand: rect(".topbar-brand"),
      topbarBrandItems: [...document.querySelectorAll(".topbar-brand > *")].map((element) => {
        const bounds = element.getBoundingClientRect();
        const icon = element.querySelector("svg");
        const iconBounds = icon?.getBoundingClientRect();
        return {
          className: element.className,
          x: Math.round(bounds.x),
          y: Math.round(bounds.y),
          width: Math.round(bounds.width),
          height: Math.round(bounds.height),
          icon: iconBounds ? {
            x: Math.round(iconBounds.x),
            y: Math.round(iconBounds.y),
            width: Math.round(iconBounds.width),
            height: Math.round(iconBounds.height),
          } : null,
        };
      }),
      topbarSync: rect(".sync-state"),
      topbarActions: rect(".topbar-actions"),
      topbarActionItems: [...document.querySelectorAll(".topbar-actions > *")].map((element) => {
        const bounds = element.getBoundingClientRect();
        return {
          className: element.className,
          x: Math.round(bounds.x),
          y: Math.round(bounds.y),
          width: Math.round(bounds.width),
          height: Math.round(bounds.height),
        };
      }),
      toolbar: rect(".csdn-editor-toolbar"),
      toolbarButtons: [...document.querySelectorAll(".csdn-editor-toolbar button")]
        .filter((element) => {
          const bounds = element.getBoundingClientRect();
          return bounds.width > 0 && bounds.height > 0;
        })
        .map((element) => {
          const bounds = element.getBoundingClientRect();
          return {
            label: element.getAttribute("aria-label") || element.textContent?.trim() || "",
            x: Math.round(bounds.x),
            y: Math.round(bounds.y),
            width: Math.round(bounds.width),
            height: Math.round(bounds.height),
          };
        }),
      toolbarGroups: [...document.querySelectorAll([
        ".csdn-history-tools",
        ".csdn-basestyle-tools",
        ".csdn-insert-tools",
        ".csdn-otherstyle-tools",
      ].join(","))].map((element) => {
        const bounds = element.getBoundingClientRect();
        return {
          className: element.className,
          x: Math.round(bounds.x),
          width: Math.round(bounds.width),
        };
      }),
      toolbarVisuals: [
        "Undo Ctrl+Z",
        "查看文章和草稿历史",
        "格式",
        "Bold",
        "文字颜色",
        "其他样式",
        "Insert thematic break",
        "使用 Markdown 源码编辑器",
      ].map((label) => {
        const button = [...document.querySelectorAll(".csdn-editor-toolbar button")]
          .find((element) => (element.getAttribute("aria-label") || element.textContent?.trim()) === label);
        if (!button) return { label };
        const bounds = (element) => {
          const value = element?.getBoundingClientRect();
          return value ? {
            x: Math.round(value.x),
            y: Math.round(value.y),
            width: Math.round(value.width),
            height: Math.round(value.height),
          } : null;
        };
        const visibleLabel = [...button.querySelectorAll("span")]
          .find((element) => element.children.length === 0 && element.textContent?.trim() && element.getAttribute("aria-hidden") !== "true");
        return {
          label,
          button: bounds(button),
          icon: bounds(button.querySelector("svg, b")),
          visibleLabel: bounds(visibleLabel),
          afterContent: getComputedStyle(button, "::after").content,
        };
      }),
      workspace: rect(".editor-workspace"),
      outline: rect(".outline-pane"),
      compose: rect(".compose-pane"),
      document: rect(".document-scroll"),
      draftBanner: rect(".draft-resume-banner"),
      draftBannerItems: [...document.querySelectorAll(".draft-resume-banner > *")].map((element) => {
        const bounds = element.getBoundingClientRect();
        const icon = element.querySelector("svg");
        const iconBounds = icon?.getBoundingClientRect();
        return {
          className: element.className,
          x: Math.round(bounds.x),
          y: Math.round(bounds.y),
          width: Math.round(bounds.width),
          height: Math.round(bounds.height),
          icon: iconBounds ? {
            x: Math.round(iconBounds.x),
            y: Math.round(iconBounds.y),
            width: Math.round(iconBounds.width),
            height: Math.round(iconBounds.height),
          } : null,
        };
      }),
      outlineHead: rect(".outline-pane-head"),
      outlineHeadItems: [...document.querySelectorAll(".outline-pane-head > *")].map((element) => {
        const bounds = element.getBoundingClientRect();
        return {
          className: element.className,
          x: Math.round(bounds.x),
          y: Math.round(bounds.y),
          width: Math.round(bounds.width),
          height: Math.round(bounds.height),
        };
      }),
      outlineEmpty: rect(".outline-empty"),
      titleInput: rect(".title-input"),
      publish: rect(".publish-bar"),
      publishMeta: rect(".publish-bar-meta"),
      publishMetaItems: [...document.querySelectorAll(".publish-bar-meta > *")].map((element) => {
        const bounds = element.getBoundingClientRect();
        return {
          x: Math.round(bounds.x),
          y: Math.round(bounds.y),
          width: Math.round(bounds.width),
          height: Math.round(bounds.height),
        };
      }),
      publishSync: rect(".publish-sync"),
      publishActions: [...document.querySelectorAll(".publish-bar-actions > button")].map((element) => {
        const bounds = element.getBoundingClientRect();
        return {
          label: element.getAttribute("aria-label") || element.textContent?.trim() || "",
          x: Math.round(bounds.x),
          y: Math.round(bounds.y),
          width: Math.round(bounds.width),
          height: Math.round(bounds.height),
        };
      }),
    };
  });
}

async function verifyDesktop() {
  const { context, page, pageErrors } = await openEditor({ width: 1264, height: 720 });
  const metrics = await layoutMetrics(page);
  assert.equal(metrics.body.scrollWidth, metrics.body.clientWidth, "desktop body must not overflow horizontally");
  assert.equal(metrics.topbar.height, 48);
  assert.deepEqual(
    metrics.topbarBrandItems,
    [
      {
        className: "editor-back-button",
        x: 122,
        y: 13,
        width: 20,
        height: 25,
        icon: { x: 122, y: 15, width: 20, height: 20 },
      },
      {
        className: "astro-wordmark",
        x: 24,
        y: 14,
        width: 74,
        height: 20,
        icon: null,
      },
      {
        className: "editor-title-button",
        x: 142,
        y: 0,
        width: 108,
        height: 48,
        icon: { x: 230, y: 15, width: 20, height: 20 },
      },
    ],
    "desktop brand navigation must match the CSDN header geometry",
  );
  assert.equal(metrics.toolbar.height, 61);
  assert.equal(metrics.toolbar.scrollWidth, 1324);
  assert.deepEqual(
    metrics.toolbarButtons.map(({ x, width }) => [x, width]),
    [
      [36, 36], [82, 36], [128, 40], [191, 43], [241, 36], [287, 36], [333, 36], [374, 43],
      [441, 43], [491, 43], [541, 48], [599, 48], [660, 43], [709, 60], [779, 36], [841, 36],
      [887, 36], [933, 36], [979, 36], [1025, 36], [1071, 36], [1117, 36], [1180, 97],
    ],
    "desktop toolbar controls must preserve the CSDN horizontal geometry",
  );
  assert.deepEqual(
    metrics.toolbarGroups.map(({ x, width }) => [x, width]),
    [[31, 152], [183, 249], [433, 396], [828, 464]],
    "desktop toolbar groups must preserve the CSDN horizontal geometry",
  );
  const toolbarVisuals = Object.fromEntries(metrics.toolbarVisuals.map((item) => [item.label, item]));
  assert.deepEqual(toolbarVisuals["Undo Ctrl+Z"].icon, { x: 42, y: 55, width: 24, height: 24 });
  assert.deepEqual(toolbarVisuals["查看文章和草稿历史"].visibleLabel, { x: 136, y: 80, width: 24, height: 18 });
  assert.deepEqual(toolbarVisuals["格式"].icon, { x: 194, y: 53, width: 24, height: 24 });
  assert.deepEqual(toolbarVisuals["Bold"].icon, { x: 247, y: 53, width: 24, height: 24 });
  assert.deepEqual(toolbarVisuals["文字颜色"].icon, { x: 293, y: 53, width: 24, height: 24 });
  assert.deepEqual(toolbarVisuals["其他样式"].icon, { x: 377, y: 53, width: 24, height: 24 });
  assert.deepEqual(toolbarVisuals["Insert thematic break"].icon, { x: 553, y: 53, width: 24, height: 24 });
  assert.deepEqual(toolbarVisuals["使用 Markdown 源码编辑器"].icon, { x: 1217, y: 53, width: 24, height: 24 });
  assert.deepEqual(toolbarVisuals["使用 Markdown 源码编辑器"].visibleLabel, { x: 1186, y: 78, width: 85, height: 18 });
  assert.deepEqual(
    { x: metrics.outline.x, y: metrics.outline.y, width: metrics.outline.width, bottom: metrics.outline.y + metrics.outline.height },
    { x: 24, y: 132, width: 280, bottom: 652 },
  );
  assert.deepEqual(
    { x: metrics.compose.x, width: metrics.compose.width, documentY: metrics.document.y },
    { x: 224, width: 816, documentY: 133 },
  );
  assert.deepEqual(
    { x: metrics.draftBanner.x, y: metrics.draftBanner.y, width: metrics.draftBanner.width, height: metrics.draftBanner.height },
    { x: 288, y: 165, width: 688, height: 54 },
  );
  assert.deepEqual(
    metrics.draftBannerItems,
    [
      { className: "draft-badge", x: 312, y: 182, width: 42, height: 20, icon: null },
      { className: "draft-resume-title", x: 370, y: 181, width: 372, height: 22, icon: null },
      { className: "draft-resume-action", x: 766, y: 182, width: 70, height: 20, icon: null },
      { className: "", x: 860, y: 181, width: 56, height: 22, icon: null },
      { className: "draft-banner-close", x: 940, y: 186, width: 12, height: 12, icon: { x: 940, y: 186, width: 12, height: 12 } },
    ],
    "desktop draft banner must match the CSDN internal geometry",
  );
  assert.deepEqual(
    { x: metrics.outlineHead.x, y: metrics.outlineHead.y, width: metrics.outlineHead.width, height: metrics.outlineHead.height },
    { x: 40, y: 132, width: 248, height: 49 },
  );
  assert.deepEqual(
    metrics.outlineHeadItems,
    [
      { className: "", x: 40, y: 150, width: 28, height: 20 },
      { className: "", x: 272, y: 148, width: 16, height: 24 },
    ],
    "desktop outline header must match the CSDN internal geometry",
  );
  assert.deepEqual(
    { x: metrics.outlineEmpty.x, y: metrics.outlineEmpty.y, width: metrics.outlineEmpty.width, height: metrics.outlineEmpty.height },
    { x: 40, y: 181, width: 248, height: 455 },
  );
  assert.deepEqual(
    { x: metrics.titleInput.x, y: metrics.titleInput.y, width: metrics.titleInput.width, height: metrics.titleInput.height },
    { x: 288, y: 243, width: 688, height: 55 },
  );
  assert.equal(metrics.publish.height, 68);
  assert.deepEqual(
    metrics.publishMetaItems,
    [
      { x: 107, y: 669, width: 50, height: 32 },
      { x: 165, y: 674, width: 86, height: 22 },
    ],
    "desktop publish metadata must match the CSDN geometry",
  );
  assert.deepEqual(
    metrics.publishActions,
    [
      { label: "删除当前草稿", x: 741, y: 665, width: 40, height: 40 },
      { label: "保存草稿", x: 797, y: 665, width: 116, height: 40 },
      { label: "定时发布", x: 929, y: 665, width: 116, height: 40 },
      { label: "发布博客", x: 1061, y: 665, width: 96, height: 40 },
    ],
    "desktop publish actions must match the CSDN geometry while retaining delete",
  );
  await page.getByTitle("同步消息").click();
  await page.locator(".toast", { hasText: "等待同步" }).waitFor();
  await page.locator(".title-input").fill("短标题");
  await page.getByRole("button", { name: "发布博客" }).click();
  await page.locator(".toast", { hasText: "文章标题不能少于 5 个字" }).waitFor();
  await page.locator(".title-input").fill("有效的文章标题");
  await page.getByRole("button", { name: "发布博客" }).click();
  await page.locator(".toast", { hasText: "请至少添加 1 个文章标签" }).waitFor();
  await page.locator(".title-input").focus();
  assert.equal(await page.locator(".title-input").evaluate((element) => getComputedStyle(element).outlineStyle), "none");
  await page.locator(".title-input").fill("");
  await page.locator(".toast").waitFor({ state: "detached", timeout: 6_000 });
  assert.equal(await page.getByText("AI助手", { exact: true }).count(), 0, "the unconfigured AI assistant must not be rendered");

  await page.locator(".editor-title-button").click();
  await page.locator(".post-sidebar.open").waitFor();
  await page.locator(".sidebar-scrim").click();
  await page.locator(".post-sidebar.open").waitFor({ state: "detached" });

  await page.locator(".connection-pill").click();
  const connectionSettings = page.getByRole("dialog", { name: "设置" });
  await connectionSettings.waitFor();
  await connectionSettings.getByTitle("关闭").click();
  await connectionSettings.waitFor({ state: "detached" });

  const baselinePath = join(outputDirectory, "desktop-1264-baseline.png");
  await page.screenshot({ path: baselinePath, animations: "disabled" });

  await page.locator(".csdn-toolbar-action").filter({ hasText: "历史" }).click();
  const historyDialog = page.locator(".history-dialog");
  await historyDialog.waitFor();
  assert.deepEqual(await historyDialog.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return {
      top: Math.round(rect.top),
      left: Math.round(rect.left),
      width: Math.round(rect.width),
      height: Math.round(rect.height),
      radius: getComputedStyle(element).borderRadius,
    };
  }), { top: 54, left: 152, width: 960, height: 612, radius: "4px" });
  assert.deepEqual(await historyDialog.locator(".history-sidebar").evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return { top: Math.round(rect.top), left: Math.round(rect.left), width: Math.round(rect.width), height: Math.round(rect.height) };
  }), { top: 54, left: 152, width: 250, height: 612 });
  assert.deepEqual(await historyDialog.locator(".history-sidebar h1, .history-filter-trigger").evaluateAll((elements) => elements.map((element) => {
    const rect = element.getBoundingClientRect();
    return { top: Math.round(rect.top), left: Math.round(rect.left), width: Math.round(rect.width), height: Math.round(rect.height) };
  })), [
    { top: 54, left: 152, width: 249, height: 54 },
    { top: 108, left: 152, width: 249, height: 56 },
  ]);
  assert.equal(await historyDialog.locator(".history-filter-options input").count(), 5);
  assert.equal(
    await page.locator(".history-backdrop").evaluate((element) => getComputedStyle(element).backgroundColor),
    "rgba(0, 0, 0, 0.6)",
  );
  assert.deepEqual(await historyDialog.getByTitle("关闭").evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return {
      top: Math.round(rect.top),
      right: Math.round(innerWidth - rect.right),
      width: Math.round(rect.width),
      height: Math.round(rect.height),
    };
  }), { top: 54, right: 152, width: 36, height: 36 });
  assert.deepEqual(await historyDialog.getByRole("button", { name: "恢复到这个版本" }).evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return {
      right: Math.round(innerWidth - rect.right),
      bottom: Math.round(innerHeight - rect.bottom),
      width: Math.round(rect.width),
      height: Math.round(rect.height),
    };
  }), { right: 184, bottom: 67, width: 144, height: 32 });
  assert.equal(await page.evaluate(() => document.documentElement.style.overflow), "hidden");
  await page.screenshot({ path: join(outputDirectory, "desktop-1264-history.png"), animations: "disabled" });
  await page.keyboard.press("Escape");
  await historyDialog.waitFor({ state: "detached" });
  assert.equal(await page.evaluate(() => document.documentElement.style.overflow), "");

  const publishingSettingsButton = page.locator(".publish-bar-meta button");
  await publishingSettingsButton.click();
  await page.locator(".advanced-fields").waitFor();
  await page.waitForTimeout(500);
  assert.match(await publishingSettingsButton.textContent(), /回到顶部/);
  assert.equal(await page.getByRole("option", { name: "本文包含 AI 辅助内容" }).count(), 0);
  const advancedLayout = await page.locator(".advanced-fields").evaluate((root) => {
    const rootRect = root.getBoundingClientRect();
    const rootStyle = getComputedStyle(root);
    return {
      root: {
        width: Math.round(rootRect.width),
        padding: rootStyle.padding,
        marginTop: rootStyle.marginTop,
      },
      rows: [...root.querySelectorAll(":scope > .setting-row")].slice(0, 3).map((row) => {
        const rowRect = row.getBoundingClientRect();
        const labelRect = row.querySelector(".setting-label").getBoundingClientRect();
        const controlRect = row.querySelector(".setting-control").getBoundingClientRect();
        return {
          x: Math.round(rowRect.x - rootRect.x),
          width: Math.round(rowRect.width),
          height: Math.round(rowRect.height),
          labelX: Math.round(labelRect.x - rootRect.x),
          labelWidth: Math.round(labelRect.width),
          labelHeight: Math.round(labelRect.height),
          controlX: Math.round(controlRect.x - rootRect.x),
          controlWidth: Math.round(controlRect.width),
          controlHeight: Math.round(controlRect.height),
        };
      }),
    };
  });
  assert.deepEqual(
    advancedLayout,
    {
      root: { width: 816, padding: "8px 32px 32px", marginTop: "24px" },
      rows: [
        { x: 32, width: 752, height: 48, labelX: 40, labelWidth: 88, labelHeight: 32, controlX: 128, controlWidth: 648, controlHeight: 32 },
        { x: 32, width: 752, height: 106, labelX: 40, labelWidth: 88, labelHeight: 32, controlX: 128, controlWidth: 648, controlHeight: 90 },
        { x: 32, width: 752, height: 164, labelX: 40, labelWidth: 88, labelHeight: 32, controlX: 128, controlWidth: 648, controlHeight: 148 },
      ],
    },
    "desktop publishing settings must match the measured CSDN form geometry",
  );
  const advancedPath = join(outputDirectory, "desktop-1264-publishing-settings.png");
  await page.screenshot({ path: advancedPath, animations: "disabled" });
  await page.getByRole("radio", { name: "简洁模板" }).check();
  await page.locator('.cover-setting input[type="file"]').setInputFiles({ name: "cover.png", mimeType: "image/png", buffer: Buffer.from("visual-cover") });
  await page.locator('.cover-preview-box img[alt="文章封面预览"]').waitFor();
  await publishingSettingsButton.click();
  await page.locator(".advanced-fields").waitFor({ state: "detached" });

  const sourceModeButton = page.getByRole("button", { name: "使用 Markdown 源码编辑器" });
  await sourceModeButton.scrollIntoViewIfNeeded();
  await sourceModeButton.click();
  await page.locator(".source-editor").fill("基础段落\n\n样式文字\n\n列表项目");
  await page.getByRole("button", { name: "预览" }).click();
  await page.locator(".article-preview.compact").waitFor();
  await page.getByRole("button", { name: "富文本" }).click();
  await selectEditorText(page, "基础段落");
  await page.getByRole("combobox", { name: "段落对齐" }).click();
  const alignmentMenu = page.locator(".mdxeditor-select-content");
  await assertEveryMenuItemIsTopLayer(alignmentMenu, '[role="option"]', "alignment menu must stay above the article title");
  assert.deepEqual(await alignmentMenu.getByRole("option").allTextContents(), ["左对齐", "居中对齐", "右对齐", "两端对齐"]);
  await page.getByRole("option", { name: "右对齐" }).click();
  await page.waitForFunction(() => Object.keys(localStorage).some((key) => (localStorage.getItem(key) || "").includes("text-align:right")));
  await page.locator('.studio-rich-content div[style="text-align:right"]', { hasText: "基础段落" }).waitFor();

  await selectEditorText(page, "样式文字");
  await page.locator('button[aria-label="Bold"]').click();
  await page.locator(".studio-rich-content strong", { hasText: "样式文字" }).waitFor();
  await selectEditorText(page, "样式文字");
  await page.getByRole("combobox", { name: "其他样式" }).click();
  await page.getByRole("option", { name: "倾斜" }).click();
  const styledText = page.locator(".studio-rich-content strong", { hasText: "样式文字" });
  await styledText.waitFor();
  assert.equal(await styledText.evaluate((element) => getComputedStyle(element).fontStyle), "italic");
  await selectEditorText(page, "样式文字");
  await page.getByRole("combobox", { name: "其他样式" }).click();
  await page.getByRole("option", { name: "下划线" }).click();
  assert.match(await styledText.evaluate((element) => getComputedStyle(element).textDecorationLine), /underline/);
  await selectEditorText(page, "样式文字");
  await page.getByRole("combobox", { name: "其他样式" }).click();
  await page.getByRole("option", { name: "删除线" }).click();
  assert.match(await styledText.evaluate((element) => getComputedStyle(element).textDecorationLine), /line-through/);

  await selectEditorText(page, "列表项目");
  await page.getByRole("combobox", { name: "列表" }).click();
  await page.getByRole("option", { name: "无序列表" }).click();
  await page.locator(".studio-rich-content ul li", { hasText: "列表项目" }).waitFor();

  const horizontalRuleCount = await page.locator(".studio-rich-content hr").count();
  await page.locator(".csdn-line-tool button").click();
  await page.locator(".studio-rich-content hr").nth(horizontalRuleCount).waitFor();
  await page.locator('button[aria-label^="Undo"]').click();
  await page.waitForFunction((count) => document.querySelectorAll(".studio-rich-content hr").length === count, horizontalRuleCount);
  await page.locator('button[aria-label^="Redo"]').click();
  await page.locator(".studio-rich-content hr").nth(horizontalRuleCount).waitFor();

  const blockquoteCount = await page.locator(".studio-rich-content blockquote").count();
  await page.getByRole("button", { name: "插入块引用" }).click();
  await page.locator(".studio-rich-content blockquote").nth(blockquoteCount).waitFor();

  const wideButton = page.getByRole("button", { name: "切换宽屏编辑" });
  await wideButton.scrollIntoViewIfNeeded();
  await wideButton.click();
  const wideWorkspace = page.locator(".editor-workspace.wide-editor");
  await wideWorkspace.waitFor();
  assert.deepEqual(await wideWorkspace.locator(".compose-pane").evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return {
      x: Math.round(rect.x),
      width: Math.round(rect.width),
      maxWidth: getComputedStyle(element).maxWidth,
      transform: getComputedStyle(element).transform,
    };
  }), { x: 139, width: 1011, maxWidth: "none", transform: "matrix(1, 0, 0, 1, 13, 0)" });
  assert.equal(await wideWorkspace.locator(".outline-pane").evaluate((element) => getComputedStyle(element).visibility), "hidden");
  await wideButton.click();
  await page.locator(".editor-workspace.wide-editor").waitFor({ state: "detached" });

  await page.locator(".csdn-code-block-tool button").click();
  const codeMenu = page.locator(".mdxeditor-select-content");
  assert.deepEqual(await codeMenu.getByRole("option").allTextContents(), ["代码", "运行代码"]);
  assert.equal(await codeMenu.locator(".csdn-dropdown-option svg").count(), 2, "code options must use the CSDN-style leading icons");
  await page.getByRole("option", { name: "代码", exact: true }).click();
  await page.waitForFunction(() => Object.keys(localStorage).some((key) => {
    const value = localStorage.getItem(key) || "";
    return value.includes("```typescript") && value.includes("在这里编写代码");
  }));
  await page.locator(".studio-rich-content", { hasText: "在这里编写代码" }).waitFor();

  await page.locator(".csdn-code-block-tool").scrollIntoViewIfNeeded();
  await page.locator(".csdn-code-block-tool button").click();
  await assertEveryMenuItemIsTopLayer(page.locator(".mdxeditor-select-content"), '[role="option"]', "code menu must stay above the article title");
  await page.getByRole("option", { name: "运行代码" }).click();
  await page.locator(".code-runner-dialog").waitFor();
  await page.screenshot({ path: join(outputDirectory, "desktop-1264-code-runner.png"), animations: "disabled" });
  const codePreview = page.frameLocator('iframe[title="代码运行预览"]');
  await codePreview.getByRole("button", { name: "运行交互" }).click();
  await codePreview.locator("#result", { hasText: "代码运行成功" }).waitFor();
  await page.locator(".code-runner-dialog").getByRole("button", { name: "插入文章" }).click();
  await page.locator(".code-runner-dialog").waitFor({ state: "detached" });
  await page.waitForFunction(() => document.querySelector(".pageel-editor-slot")?.textContent?.includes("Hello, Astro!"));

  const imageTool = page.locator(".csdn-toolbar-action").filter({ hasText: "图像" });
  await imageTool.scrollIntoViewIfNeeded();
  await imageTool.click();
  await page.locator(".image-insert-drawer").waitFor();
  const imageDrawerRect = await page.locator(".image-insert-drawer").evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return { left: Math.round(rect.left), width: Math.round(rect.width), right: Math.round(rect.right), height: Math.round(rect.height) };
  });
  assert.deepEqual(imageDrawerRect, { left: 581, width: 683, right: 1264, height: 720 });
  assert.equal(
    await page.locator(".insert-drawer-backdrop").evaluate((element) => getComputedStyle(element).backgroundColor),
    "rgba(0, 0, 0, 0.5)",
  );
  assert.deepEqual(await page.locator(".insert-drawer-tabs button").evaluateAll((elements) => elements.map((element) => {
    const rect = element.getBoundingClientRect();
    return {
      text: element.textContent,
      x: Math.round(rect.x),
      y: Math.round(rect.y),
      width: Math.round(rect.width),
      height: Math.round(rect.height),
      color: getComputedStyle(element).color,
    };
  })), [
    { text: "图片上传", x: 625, y: 28, width: 84, height: 40, color: "rgb(26, 26, 26)" },
    { text: "链接添加", x: 709, y: 28, width: 84, height: 40, color: "rgb(153, 153, 153)" },
  ]);
  assert.deepEqual(await page.getByRole("button", { name: "选择图片", exact: true }).evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return { x: Math.round(rect.x), y: Math.round(rect.y), width: Math.round(rect.width), height: Math.round(rect.height) };
  }), { x: 863, y: 254, width: 104, height: 40 });
  assert.equal(await page.getByRole("button", { name: "选择图片", exact: true }).locator("svg").count(), 0, "CSDN image upload button is text-only");
  assert.equal(
    await page.locator(".image-upload-empty p").textContent(),
    "支持jpg、gif、png、bmp、jpeg、webp等多种格式，单张图片最大支持5MB",
  );
  await page.screenshot({ path: join(outputDirectory, "desktop-1264-image-upload.png"), animations: "disabled" });
  await page.getByRole("tab", { name: "链接添加" }).click();
  await page.getByPlaceholder("图片URL").fill("https://example.com/architecture.png");
  const imageUrlRect = await page.getByPlaceholder("图片URL").evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return { top: Math.round(rect.top), width: Math.round(rect.width), height: Math.round(rect.height) };
  });
  assert.deepEqual(imageUrlRect, { top: 274, width: 315, height: 32 });
  await page.screenshot({ path: join(outputDirectory, "desktop-1264-image-drawer.png"), animations: "disabled" });
  await page.locator(".image-link-panel .drawer-primary-button").click();
  await page.locator(".image-insert-drawer").waitFor({ state: "detached" });

  const formulaTool = page.locator(".csdn-toolbar-action").filter({ hasText: "公式" });
  await formulaTool.scrollIntoViewIfNeeded();
  await formulaTool.click();
  const formulaDialog = page.locator(".formula-dialog");
  await formulaDialog.waitFor();
  assert.deepEqual(await formulaDialog.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return { top: Math.round(rect.top), left: Math.round(rect.left), width: Math.round(rect.width), height: Math.round(rect.height) };
  }), { top: 104, left: 332, width: 600, height: 512 });
  assert.equal(
    await page.locator(".formula-backdrop").evaluate((element) => getComputedStyle(element).backgroundColor),
    "rgba(0, 0, 0, 0.25)",
  );
  assert.equal(await formulaDialog.locator('select[aria-label="常用函数"] option').count(), 44);
  const formulaControlRects = await formulaDialog.locator(".formula-clear-button, .formula-history-actions select").evaluateAll((elements) => elements.map((element) => {
    const rect = element.getBoundingClientRect();
    return { tag: element.tagName, x: Math.round(rect.x), y: Math.round(rect.y), width: Math.round(rect.width), height: Math.round(rect.height) };
  }));
  assert.deepEqual(formulaControlRects, [
    { tag: "BUTTON", x: 411, y: 173, width: 34, height: 20 },
    { tag: "SELECT", x: 448, y: 172, width: 83, height: 21 },
  ]);
  const formulaCategoryRects = await formulaDialog.locator(".formula-category-button").evaluateAll((buttons) => buttons.map((button) => {
    const rect = button.getBoundingClientRect();
    return { title: button.getAttribute("title"), x: Math.round(rect.x), y: Math.round(rect.y), width: Math.round(rect.width), height: Math.round(rect.height) };
  }));
  assert.deepEqual(formulaCategoryRects, [
    { title: "样式", x: 356, y: 212, width: 111, height: 23 },
    { title: "空格", x: 467, y: 212, width: 36, height: 34 },
    { title: "二元运算符", x: 503, y: 212, width: 73, height: 34 },
    { title: "常用符号", x: 576, y: 212, width: 73, height: 34 },
    { title: "数集", x: 649, y: 212, width: 39, height: 34 },
    { title: "上下标", x: 688, y: 212, width: 39, height: 34 },
    { title: "重音符号", x: 727, y: 212, width: 39, height: 34 },
    { title: "扩展重音", x: 766, y: 212, width: 30, height: 34 },
    { title: "箭头", x: 796, y: 212, width: 60, height: 34 },
    { title: "大型运算符", x: 356, y: 264, width: 173, height: 28 },
    { title: "括号", x: 529, y: 264, width: 61, height: 28 },
    { title: "小写希腊字母", x: 590, y: 264, width: 73, height: 34 },
    { title: "大写希腊字母", x: 663, y: 264, width: 39, height: 34 },
    { title: "关系符号", x: 702, y: 264, width: 56, height: 34 },
    { title: "矩阵", x: 758, y: 264, width: 106, height: 34 },
  ]);
  assert.equal(await formulaDialog.locator(".formula-category-button .katex-error").count(), 0);
  for (const category of formulaCategoryRects) {
    await formulaDialog.getByTitle(category.title).click();
    const symbolPopover = formulaDialog.locator(".formula-symbol-popover");
    assert(await symbolPopover.locator('[role="menuitem"]').count() > 0, `${category.title} must expose insertable symbols`);
    assert.equal(await symbolPopover.locator(".katex-error").count(), 0, `${category.title} contains an invalid formula symbol`);
  }
  const formulaTextarea = formulaDialog.locator(".formula-input-label textarea");
  const formulaPrimaryButton = formulaDialog.locator(".dialog-primary-button");
  assert.equal(await formulaPrimaryButton.isDisabled(), true);
  assert.deepEqual(await formulaTextarea.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return { x: Math.round(rect.x), y: Math.round(rect.y), width: Math.round(rect.width), height: Math.round(rect.height), value: element.value };
  }), { x: 356, y: 344, width: 552, height: 104, value: "" });
  const formulaFooterRects = await formulaDialog.locator("footer button").evaluateAll((buttons) => buttons.map((button) => {
    const rect = button.getBoundingClientRect();
    return { text: button.textContent?.trim(), x: Math.round(rect.x), y: Math.round(rect.y), width: Math.round(rect.width), height: Math.round(rect.height) };
  }));
  assert.deepEqual(formulaFooterRects, [
    { text: "确定", x: 727, y: 558, width: 82, height: 34 },
    { text: "取消", x: 826, y: 558, width: 82, height: 34 },
  ]);
  await formulaDialog.getByTitle("大型运算符").click();
  assert.equal(await formulaDialog.locator('.formula-symbol-popover [role="menuitem"]').count(), 13);
  await page.screenshot({ path: join(outputDirectory, "desktop-1264-formula-symbols.png"), animations: "disabled" });
  await formulaDialog.getByTitle("插入 分数").click();
  assert.equal(await formulaTextarea.inputValue(), "\\frac{a}{b}");
  assert.equal(await formulaPrimaryButton.isEnabled(), true);
  await formulaDialog.locator('select[aria-label="常用函数"]').selectOption({ label: "sin" });
  assert.equal(await formulaTextarea.inputValue(), "\\frac{a}{b}\\sin(x)");
  await formulaDialog.getByTitle("撤销").click();
  assert.equal(await formulaTextarea.inputValue(), "\\frac{a}{b}");
  await formulaDialog.getByTitle("重做").click();
  assert.equal(await formulaTextarea.inputValue(), "\\frac{a}{b}\\sin(x)");
  await formulaTextarea.fill("\\frac{a}{b} + \\alpha");
  await page.locator(".formula-preview .katex").waitFor();
  await page.screenshot({ path: join(outputDirectory, "desktop-1264-formula-dialog.png"), animations: "disabled" });
  await formulaDialog.locator(".dialog-primary-button").click();
  await formulaDialog.waitFor({ state: "detached" });

  const linkTool = page.locator(".csdn-toolbar-action").filter({ hasText: "链接" });
  await linkTool.scrollIntoViewIfNeeded();
  await linkTool.click();
  const linkDialog = page.locator(".link-insert-dialog");
  await linkDialog.waitFor();
  const linkDialogRect = await linkDialog.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return { top: Math.round(rect.top), left: Math.round(rect.left), width: Math.round(rect.width), height: Math.round(rect.height) };
  });
  assert.deepEqual(linkDialogRect, { top: 244, left: 390, width: 484, height: 232 });
  assert.equal(
    await page.locator(".link-dialog-backdrop").evaluate((element) => getComputedStyle(element).backgroundColor),
    "rgba(0, 0, 0, 0.25)",
  );
  assert.equal(await linkDialog.locator("input").first().evaluate((element) => getComputedStyle(element).borderColor), "rgb(188, 188, 188)");
  const linkFieldRects = await linkDialog.locator("label").evaluateAll((labels) => labels.map((label) => {
    const labelRect = label.getBoundingClientRect();
    const inputRect = label.querySelector("input").getBoundingClientRect();
    return {
      label: { x: Math.round(labelRect.x), y: Math.round(labelRect.y), width: Math.round(labelRect.width), height: Math.round(labelRect.height) },
      input: { x: Math.round(inputRect.x), y: Math.round(inputRect.y), width: Math.round(inputRect.width), height: Math.round(inputRect.height) },
    };
  }));
  assert.deepEqual(linkFieldRects, [
    { label: { x: 414, y: 318, width: 436, height: 28 }, input: { x: 490, y: 318, width: 360, height: 28 } },
    { label: { x: 414, y: 362, width: 436, height: 28 }, input: { x: 490, y: 362, width: 360, height: 28 } },
  ]);
  const linkActionRects = await linkDialog.locator("footer button").evaluateAll((buttons) => buttons.map((button) => {
    const rect = button.getBoundingClientRect();
    const style = getComputedStyle(button);
    return {
      text: button.textContent,
      x: Math.round(rect.x),
      y: Math.round(rect.y),
      width: Math.round(rect.width),
      height: Math.round(rect.height),
      radius: style.borderRadius,
      background: style.backgroundColor,
      disabled: button.disabled,
    };
  }));
  assert.deepEqual(linkActionRects, [
    { text: "确定", x: 670, y: 418, width: 82, height: 34, radius: "18px", background: "rgb(252, 85, 49)", disabled: false },
    { text: "取消", x: 768, y: 418, width: 82, height: 34, radius: "18px", background: "rgb(255, 255, 255)", disabled: false },
  ]);
  await page.screenshot({ path: join(outputDirectory, "desktop-1264-link-dialog.png"), animations: "disabled" });
  await linkDialog.getByRole("button", { name: "确定" }).click();
  await linkDialog.getByText("请输入有效的 HTTP 或 HTTPS 链接").waitFor();
  assert.equal(await linkDialog.isVisible(), true, "invalid links must keep the CSDN-style dialog open");
  await linkDialog.locator("input").nth(0).fill("https://docs.astro.build/");
  await linkDialog.locator("input").nth(1).fill("Astro 文档");
  await page.locator(".link-insert-dialog .dialog-primary-button").click();
  await page.locator(".link-insert-dialog").waitFor({ state: "detached" });

  const videoTool = page.locator(".csdn-toolbar-action").filter({ hasText: "视频" });
  await videoTool.scrollIntoViewIfNeeded();
  await videoTool.click();
  const videoDialog = page.locator(".video-insert-dialog");
  await videoDialog.waitFor();
  assert.deepEqual(await videoDialog.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return { top: Math.round(rect.top), left: Math.round(rect.left), width: Math.round(rect.width), height: Math.round(rect.height) };
  }), { top: 163, left: 332, width: 600, height: 394 });
  assert.equal(
    await page.locator(".media-dialog-backdrop").evaluate((element) => getComputedStyle(element).backgroundColor),
    "rgba(0, 0, 0, 0.25)",
  );
  assert.deepEqual(await videoDialog.locator("#video-dialog-title").evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return { text: element.textContent, x: Math.round(rect.x), y: Math.round(rect.y), width: Math.round(rect.width), height: Math.round(rect.height) };
  }), { text: "插入视频", x: 356, y: 187, width: 64, height: 24 });
  assert.deepEqual(await videoDialog.locator(".video-empty-illustration").evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return { x: Math.round(rect.x), y: Math.round(rect.y), width: Math.round(rect.width), height: Math.round(rect.height) };
  }), { x: 582, y: 286, width: 100, height: 100 });
  assert.equal(await videoDialog.locator(".video-empty-state p").textContent(), "暂无视频内容，去上传");
  const videoFooterRects = await videoDialog.locator(".video-dialog-footer button").evaluateAll((buttons) => buttons.map((button) => {
    const rect = button.getBoundingClientRect();
    return { text: button.textContent, x: Math.round(rect.x), y: Math.round(rect.y), width: Math.round(rect.width), height: Math.round(rect.height) };
  }));
  assert.deepEqual(videoFooterRects, [
    { text: "去上传", x: 356, y: 499, width: 39, height: 34 },
    { text: "确定", x: 728, y: 499, width: 82, height: 34 },
    { text: "取消", x: 826, y: 499, width: 82, height: 34 },
  ]);
  await page.screenshot({ path: join(outputDirectory, "desktop-1264-video-dialog.png"), animations: "disabled" });
  await videoDialog.locator(".dialog-primary-button").click();
  await videoDialog.getByText("请先上传或添加一个视频").waitFor();
  await videoDialog.locator(".video-dialog-footer > .video-upload-link").click();
  await videoDialog.locator(".video-upload-view").waitFor();
  await videoDialog.getByLabel("视频地址").fill("not-a-video-url");
  await videoDialog.getByRole("button", { name: "添加地址" }).click();
  await videoDialog.getByText("请输入有效的 HTTP 或 HTTPS 视频地址").waitFor();
  await videoDialog.getByLabel("视频标题").fill("教程视频");
  await page.screenshot({ path: join(outputDirectory, "desktop-1264-video-upload.png"), animations: "disabled" });
  await videoDialog.locator('input[type="file"]').setInputFiles({ name: "tutorial.mp4", mimeType: "video/mp4", buffer: Buffer.from("visual-video") });
  const selectedVideo = videoDialog.locator(".video-library-card");
  await selectedVideo.waitFor();
  assert.match(await selectedVideo.textContent(), /教程视频.*\/video\/editor\/2026\/09\/visual-test\.mp4/s);
  await page.screenshot({ path: join(outputDirectory, "desktop-1264-video-selected.png"), animations: "disabled" });
  await videoDialog.locator(".dialog-primary-button").click();
  await videoDialog.waitFor({ state: "detached" });

  const templateTool = page.locator(".csdn-toolbar-action").filter({ hasText: "模版" });
  await templateTool.scrollIntoViewIfNeeded();
  await templateTool.click();
  await page.locator(".template-insert-drawer").waitFor();
  const templateDrawerRect = await page.locator(".template-insert-drawer").evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return { left: Math.round(rect.left), width: Math.round(rect.width), right: Math.round(rect.right), height: Math.round(rect.height) };
  });
  assert.deepEqual(templateDrawerRect, { left: 564, width: 700, right: 1264, height: 720 });
  assert.equal(await page.locator(".template-card.selected").count(), 0, "CSDN template drawer must not preselect a template");
  assert.equal(await page.locator(".template-card-preview.official img").count(), 6, "all six official templates need their visual previews");
  await page.waitForFunction(() => [...document.querySelectorAll(".template-card-preview.official img, .template-contributors img")].every((image) => image.complete && image.naturalWidth > 0));
  assert.deepEqual(await page.locator(".template-card").evaluateAll((cards) => cards.slice(0, 4).map((card) => {
    const rect = card.getBoundingClientRect();
    return { x: Math.round(rect.x), y: Math.round(rect.y), width: Math.round(rect.width), height: Math.round(rect.height) };
  })), [
    { x: 608, y: 87, width: 282, height: 264 },
    { x: 914, y: 87, width: 282, height: 264 },
    { x: 608, y: 375, width: 282, height: 264 },
    { x: 914, y: 375, width: 282, height: 264 },
  ]);
  assert.deepEqual(await page.locator(".template-insert-drawer > footer").evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return { x: Math.round(rect.x), y: Math.round(rect.y), width: Math.round(rect.width), height: Math.round(rect.height) };
  }), { x: 564, y: 632, width: 700, height: 88 });
  assert.equal(await page.locator(".template-contributors img").count(), 7);
  await page.getByRole("button", { name: "添加到正文", exact: true }).click();
  await page.getByText("请选择一个模板").waitFor();
  await page.getByRole("button", { name: "选择记录bug模板" }).click();
  assert.equal(await page.locator(".template-card.selected .template-card-check").count(), 1, "selected template must show the CSDN check overlay");
  await page.screenshot({ path: join(outputDirectory, "desktop-1264-template-drawer.png"), animations: "disabled" });
  await page.getByRole("button", { name: "添加到正文", exact: true }).click();
  await page.locator(".template-insert-drawer").waitFor({ state: "detached" });

  await templateTool.scrollIntoViewIfNeeded();
  await templateTool.click();
  const customTemplateDrawer = page.locator(".template-insert-drawer");
  await customTemplateDrawer.getByRole("tab", { name: "我的模板" }).click();
  assert.equal(await customTemplateDrawer.getByText("暂无数据").count(), 1);
  await customTemplateDrawer.getByRole("button", { name: "创建新模板" }).click();
  await customTemplateDrawer.getByLabel("模板名称").fill("测试模板");
  await customTemplateDrawer.getByLabel("模板内容").fill("## 自定义模板内容\n\n正文占位符");
  await customTemplateDrawer.getByRole("button", { name: "保存模板", exact: true }).click();
  const savedTemplateCard = customTemplateDrawer.locator(".template-card").filter({ hasText: "测试模板" });
  await savedTemplateCard.waitFor();
  assert.match(await page.evaluate(() => localStorage.getItem("astro-studio:templates") || ""), /测试模板/);
  await savedTemplateCard.hover();
  await customTemplateDrawer.getByTitle("编辑模板 测试模板").click();
  await customTemplateDrawer.getByLabel("模板名称").fill("更新后的模板");
  await customTemplateDrawer.getByRole("button", { name: "保存模板", exact: true }).click();
  const updatedTemplateCard = customTemplateDrawer.locator(".template-card").filter({ hasText: "更新后的模板" });
  await updatedTemplateCard.waitFor();
  await updatedTemplateCard.hover();
  page.once("dialog", async (dialog) => {
    assert.match(dialog.message(), /确定删除模板“更新后的模板”吗/);
    await dialog.accept();
  });
  await customTemplateDrawer.getByTitle("删除模板 更新后的模板").click();
  await customTemplateDrawer.getByText("暂无数据").waitFor();
  assert.doesNotMatch(await page.evaluate(() => localStorage.getItem("astro-studio:templates") || ""), /更新后的模板/);
  await customTemplateDrawer.getByRole("button", { name: "取消", exact: true }).click();
  await customTemplateDrawer.waitFor({ state: "detached" });

  const resourceTool = page.locator(".csdn-toolbar-action").filter({ hasText: "资源绑定" });
  await resourceTool.scrollIntoViewIfNeeded();
  await resourceTool.click();
  await page.locator(".resource-binding-dialog").waitFor();
  await page.getByRole("tab", { name: "已有资源" }).click();
  await page.locator(".resource-existing-panel article").waitFor();
  await page.locator(".resource-existing-panel article").getByRole("button", { name: "绑定" }).click();
  await page.locator(".resource-binding-dialog").waitFor({ state: "detached" });

  await resourceTool.scrollIntoViewIfNeeded();
  await resourceTool.click();
  await page.locator(".resource-binding-dialog").waitFor();
  await page.locator('.resource-binding-dialog input[type="file"]').setInputFiles({ name: "astro-example.zip", mimeType: "application/zip", buffer: Buffer.from("visual-resource") });
  await page.locator(".resource-upload-form input").nth(1).fill("Astro 示例资源");
  await page.locator(".resource-upload-form textarea").fill("可运行的 Astro 示例代码");
  await page.locator(".resource-upload-form select").selectOption("code");
  await page.locator(".resource-upload-form input").nth(2).fill("Astro, 示例");
  await page.screenshot({ path: join(outputDirectory, "desktop-1264-resource-dialog.png"), animations: "disabled" });
  await page.locator(".resource-upload-form .dialog-primary-button").click();
  await page.locator(".resource-binding-dialog").waitFor({ state: "detached" });

  const tableTool = page.locator(".csdn-toolbar-action").filter({ hasText: "表格" });
  await tableTool.scrollIntoViewIfNeeded();
  await tableTool.click();
  const tableDialog = page.locator(".table-properties-dialog");
  await tableDialog.waitFor();
  const tableDialogRect = await tableDialog.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return { top: Math.round(rect.top), left: Math.round(rect.left), width: Math.round(rect.width), height: Math.round(rect.height) };
  });
  assert.deepEqual(tableDialogRect, { top: 28, left: 453, width: 358, height: 664 });
  assert.equal(
    await page.locator(".table-dialog-backdrop").evaluate((element) => getComputedStyle(element).backgroundColor),
    "rgba(0, 0, 0, 0.25)",
  );
  assert.equal(await tableDialog.getByRole("spinbutton", { name: "行数" }).evaluate((element) => getComputedStyle(element).borderColor), "rgb(188, 188, 188)");
  const tableFieldRects = await tableDialog.locator(".table-properties-grid input, .table-properties-grid select").evaluateAll((fields) => fields.map((field) => {
    const rect = field.getBoundingClientRect();
    return {
      label: field.getAttribute("aria-label"),
      x: Math.round(rect.x),
      y: Math.round(rect.y),
      width: Math.round(rect.width),
      height: Math.round(rect.height),
    };
  }));
  assert.deepEqual(tableFieldRects, [
    { label: "行数", x: 477, y: 134, width: 60, height: 28 },
    { label: "宽度", x: 690, y: 134, width: 60, height: 28 },
    { label: "列数", x: 477, y: 210, width: 60, height: 28 },
    { label: "高度", x: 690, y: 210, width: 60, height: 28 },
    { label: "标题单元格", x: 478, y: 286, width: 115, height: 28 },
    { label: "间距", x: 690, y: 286, width: 36, height: 28 },
    { label: "边框", x: 477, y: 362, width: 36, height: 28 },
    { label: "边距", x: 690, y: 362, width: 36, height: 28 },
    { label: "对齐方式", x: 478, y: 438, width: 93, height: 28 },
    { label: "标题", x: 477, y: 514, width: 310, height: 28 },
    { label: "摘要", x: 477, y: 590, width: 310, height: 28 },
  ]);
  const tableActionRects = await tableDialog.locator("footer button").evaluateAll((buttons) => buttons.map((button) => {
    const rect = button.getBoundingClientRect();
    return { text: button.textContent, x: Math.round(rect.x), y: Math.round(rect.y), width: Math.round(rect.width), height: Math.round(rect.height) };
  }));
  assert.deepEqual(tableActionRects, [
    { text: "确定", x: 607, y: 634, width: 82, height: 34 },
    { text: "取消", x: 705, y: 634, width: 82, height: 34 },
  ]);
  await page.screenshot({ path: join(outputDirectory, "desktop-1264-table-dialog.png"), animations: "disabled" });
  await page.getByRole("combobox", { name: "标题单元格" }).selectOption("both");
  await page.getByRole("textbox", { name: "标题", exact: true }).fill("功能对比表");
  await page.getByRole("textbox", { name: "摘要", exact: true }).fill("编辑器功能验证");
  await tableDialog.locator(".dialog-primary-button").click();
  await tableDialog.waitFor({ state: "detached" });

  await page.waitForTimeout(1_000);
  const insertedDraft = await page.evaluate(() => Object.keys(localStorage)
    .filter((key) => key.startsWith("astro-studio:") && key !== "astro-studio:templates")
    .map((key) => localStorage.getItem(key) || "")
    .join("\n"));
  for (const expected of ["architecture.png", "frac{a}{b}", "docs.astro.build", "visual-test.mp4", "教程视频", "问题描述", "existing-pack.zip", "Astro 示例资源", "功能对比表", "编辑器功能验证"]) {
    assert(insertedDraft.includes(expected), `inserted content is missing ${expected}: ${insertedDraft.slice(-1200)}`);
  }

  await page.locator(".studio-rich-content[contenteditable='true']").click({ position: { x: 160, y: 24 } });
  await page.locator(".csdn-editor-toolbar").evaluate((element) => { element.scrollLeft = 0; });
  const formatButton = page.getByRole("button", { name: "格式" });
  await formatButton.scrollIntoViewIfNeeded();
  await formatButton.click();
  const formatMenu = page.locator(".csdn-format-menu-popup");
  await formatMenu.waitFor();
  assert.deepEqual(await formatMenu.getByRole("menuitem").allTextContents(), ["正文", "标题一", "标题二", "标题三", "标题四", "标题五", "标题六"]);
  const formatMenuRect = await formatMenu.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return { top: Math.round(rect.top), left: Math.round(rect.left), width: Math.round(rect.width), height: Math.round(rect.height) };
  });
  assert.deepEqual(formatMenuRect, { top: 98, left: 191, width: 140, height: 260 });
  const formatItemLayout = await formatMenu.getByRole("menuitem").evaluateAll((elements) => {
    const menuRect = elements[0].parentElement.getBoundingClientRect();
    return elements.map((element) => {
      const rect = element.getBoundingClientRect();
      const label = element.firstElementChild;
      const labelStyle = getComputedStyle(label);
      return {
        x: Math.round(rect.x - menuRect.x),
        y: Math.round(rect.y - menuRect.y),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        fontSize: labelStyle.fontSize,
        lineHeight: labelStyle.lineHeight,
      };
    });
  });
  assert.deepEqual(formatItemLayout, [
    { x: 8, y: 8, width: 109, height: 32, fontSize: "16px", lineHeight: "16px" },
    { x: 8, y: 48, width: 109, height: 38, fontSize: "22px", lineHeight: "22px" },
    { x: 8, y: 94, width: 109, height: 36, fontSize: "20px", lineHeight: "20px" },
    { x: 8, y: 138, width: 109, height: 34, fontSize: "18px", lineHeight: "18px" },
    { x: 8, y: 180, width: 109, height: 32, fontSize: "16px", lineHeight: "16px" },
    { x: 8, y: 220, width: 109, height: 32, fontSize: "16px", lineHeight: "16px" },
    { x: 8, y: 260, width: 109, height: 32, fontSize: "16px", lineHeight: "16px" },
  ]);
  const formatScrollbar = await formatMenu.locator(".csdn-format-scrollbar").evaluate((element) => {
    const track = element.querySelector(".csdn-format-scroll-track").getBoundingClientRect();
    const thumb = element.querySelector(".csdn-format-scroll-thumb").getBoundingClientRect();
    return {
      width: Math.round(element.getBoundingClientRect().width),
      trackHeight: Math.round(track.height),
      thumbWidth: Math.round(thumb.width),
      thumbHeight: Math.round(thumb.height),
    };
  });
  assert.deepEqual(formatScrollbar, { width: 15, trackHeight: 230, thumbWidth: 7, thumbHeight: 199 });
  const formatScroll = formatMenu.locator("[data-menu-scroll]");
  await formatMenu.getByRole("button", { name: "向下滚动格式菜单" }).click();
  assert.equal(await formatScroll.evaluate((element) => element.scrollTop), 40, "format menu down arrow must scroll one item step");
  await formatMenu.getByRole("button", { name: "向上滚动格式菜单" }).click();
  assert.equal(await formatScroll.evaluate((element) => element.scrollTop), 0, "format menu up arrow must return to the top");
  await assertEveryMenuItemIsTopLayer(formatMenu, '[role="menuitem"]', "format menu must stay above the article title");
  await page.screenshot({ path: join(outputDirectory, "desktop-1264-format-menu.png"), animations: "disabled" });
  await formatMenu.getByRole("menuitem", { name: "标题六" }).click();
  await page.locator(".studio-rich-content h6").waitFor();

  const textColorButton = page.locator('button[aria-label="文字颜色"]');
  await textColorButton.scrollIntoViewIfNeeded();
  await textColorButton.click();
  const colorPalette = page.locator(".csdn-color-palette");
  await colorPalette.waitFor();
  assert.equal(await colorPalette.getByRole("menuitem").count(), 45, "CSDN color palette must contain clear plus 44 colors");
  const colorPaletteRect = await colorPalette.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return { top: Math.round(rect.top), left: Math.round(rect.left), width: Math.round(rect.width), height: Math.round(rect.height) };
  });
  assert.deepEqual(colorPaletteRect, { top: 98, left: 287, width: 272, height: 180 });
  const colorSwatchLayout = await colorPalette.getByRole("menuitem").evaluateAll((elements) => {
    const paletteRect = elements[0].parentElement.getBoundingClientRect();
    return [0, 1, 9].map((index) => {
      const buttonRect = elements[index].getBoundingClientRect();
      const swatchRect = elements[index].firstElementChild.getBoundingClientRect();
      return {
        button: {
          x: Math.round(buttonRect.x - paletteRect.x),
          y: Math.round(buttonRect.y - paletteRect.y),
          width: Math.round(buttonRect.width),
          height: Math.round(buttonRect.height),
        },
        swatch: {
          x: Math.round(swatchRect.x - paletteRect.x),
          y: Math.round(swatchRect.y - paletteRect.y),
          width: Math.round(swatchRect.width),
          height: Math.round(swatchRect.height),
        },
      };
    });
  });
  assert.deepEqual(colorSwatchLayout, [
    { button: { x: 10, y: 22, width: 28, height: 28 }, swatch: { x: 14, y: 26, width: 20, height: 20 } },
    { button: { x: 38, y: 22, width: 28, height: 28 }, swatch: { x: 42, y: 26, width: 20, height: 20 } },
    { button: { x: 10, y: 50, width: 28, height: 28 }, swatch: { x: 14, y: 54, width: 20, height: 20 } },
  ]);
  await assertEveryMenuItemIsTopLayer(colorPalette, '[role="menuitem"]', "color menu must stay above the article title");
  await page.screenshot({ path: join(outputDirectory, "desktop-1264-color-palette.png"), animations: "disabled" });
  await page.getByTitle("文字颜色 #FE2C24", { exact: true }).click();
  await selectEditorText(page, "基础段落");
  const backgroundColorButton = page.locator('button[aria-label="文字背景色"]');
  await backgroundColorButton.scrollIntoViewIfNeeded();
  assert.equal(await backgroundColorButton.count(), 1);
  await backgroundColorButton.click();
  const backgroundPalette = page.locator(".csdn-color-palette");
  await backgroundPalette.waitFor();
  const backgroundPaletteRect = await backgroundPalette.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return { top: Math.round(rect.top), left: Math.round(rect.left), width: Math.round(rect.width), height: Math.round(rect.height) };
  });
  assert.deepEqual(backgroundPaletteRect, { top: 98, left: 333, width: 272, height: 180 });
  assert.equal(await backgroundPalette.getByRole("menuitem").count(), 45);
  await assertEveryMenuItemIsTopLayer(backgroundPalette, '[role="menuitem"]', "background menu must stay above the article title");
  await page.screenshot({ path: join(outputDirectory, "desktop-1264-background-palette.png"), animations: "disabled" });
  await page.getByTitle("文字背景色 #FFD900", { exact: true }).click();

  const moreStyleButton = page.getByRole("combobox", { name: "其他样式" });
  await moreStyleButton.scrollIntoViewIfNeeded();
  await moreStyleButton.click();
  const moreStyleMenu = page.locator(".mdxeditor-select-content");
  assert.deepEqual(await moreStyleMenu.getByRole("option").allTextContents(), ["倾斜", "下划线", "删除线"]);
  assert.equal(await moreStyleMenu.locator(".csdn-dropdown-option svg").count(), 3, "more-style options must use the CSDN-style leading icons");
  assert.equal(
    await moreStyleMenu.getByRole("option").first().evaluate((element) => getComputedStyle(element).backgroundColor),
    "rgba(0, 0, 0, 0)",
    "opening a menu must not paint an option as hovered",
  );
  const moreStyleMenuRect = await moreStyleMenu.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return { top: Math.round(rect.top), width: Math.round(rect.width), height: Math.round(rect.height) };
  });
  assert.deepEqual(moreStyleMenuRect, { top: 98, width: 140, height: 128 });
  await assertEveryMenuItemIsTopLayer(moreStyleMenu, '[role="option"]', "more-style menu must stay above the article title");
  await page.screenshot({ path: join(outputDirectory, "desktop-1264-more-style-menu.png"), animations: "disabled" });
  await page.keyboard.press("Escape");

  const listButton = page.getByRole("combobox", { name: "列表" });
  await listButton.scrollIntoViewIfNeeded();
  await listButton.click();
  const listMenu = page.locator(".mdxeditor-select-content");
  assert.deepEqual(await listMenu.getByRole("option").allTextContents(), ["有序列表", "无序列表"]);
  assert.equal(await listMenu.locator(".csdn-dropdown-option svg").count(), 2, "list options must use the CSDN-style leading icons");
  const listMenuRect = await listMenu.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return { width: Math.round(rect.width), height: Math.round(rect.height) };
  });
  assert.deepEqual(listMenuRect, { width: 140, height: 86 });
  await assertEveryMenuItemIsTopLayer(listMenu, '[role="option"]', "list menu must stay above the article title");
  await page.keyboard.press("Escape");

  await page.waitForTimeout(500);
  const styledDraft = await page.evaluate(() => Object.keys(localStorage)
    .filter((key) => key.startsWith("astro-studio:") && key !== "astro-studio:templates")
    .map((key) => localStorage.getItem(key) || "")
    .join("\n"));
  assert(styledDraft.includes("color:#FE2C24"), "selected text color must persist in Markdown");
  assert(styledDraft.includes("background-color:#FFD900"), "selected text background must persist in Markdown");
  const editorText = await page.locator(".studio-rich-content[contenteditable='true']").textContent();
  assert(editorText?.includes("文字") && editorText.includes("基础段落"), `toolbar insertion failed: ${JSON.stringify({ editorText, pageErrors })}`);
  const visibleToast = page.locator(".toast");
  if (await visibleToast.isVisible()) await visibleToast.waitFor({ state: "detached", timeout: 6_000 });
  assert.deepEqual(pageErrors, [], `desktop page errors: ${pageErrors.join("; ")}`);
  const path = join(outputDirectory, "desktop-1264-functional.png");
  await page.screenshot({ path, animations: "disabled" });
  await context.close();
  return { path, baselinePath, advancedPath, metrics };
}

async function verifyMobile(width) {
  const height = width === 390 ? 844 : 800;
  const { context, page, pageErrors } = await openEditor({ width, height });
  const metrics = await layoutMetrics(page);
  assert.equal(metrics.body.scrollWidth, metrics.body.clientWidth, `${width}px body must not overflow horizontally`);
  assert.equal(metrics.topbar.height, 48);
  assert(
    metrics.topbarBrand.x + metrics.topbarBrand.width <= metrics.topbarActions.x,
    `${width}px header brand and actions must not overlap`,
  );
  assert.equal(metrics.toolbar.height, 61);
  assert.equal(metrics.publish.height, 64);
  assert.deepEqual(
    { x: metrics.titleInput.x, y: metrics.titleInput.y, width: metrics.titleInput.width, height: metrics.titleInput.height },
    { x: 14, y: 189, width: width - 28, height: 49 },
  );
  assert.equal(await page.getByText("AI助手", { exact: true }).count(), 0, "mobile must not render the unconfigured AI assistant");

  await page.locator(".title-input").fill("移动端编辑验证");
  const markdownButton = page.getByRole("button", { name: "使用 Markdown 源码编辑器" });
  await markdownButton.scrollIntoViewIfNeeded();
  await markdownButton.click();
  await page.locator(".source-editor").fill("## 背景\n\n这是移动端正文。\n\n~~~markdown\n# 代码块里的标题\n~~~\n\nSetext 标题\n---\n\n## 总结\n\n验证完成。");
  await page.getByRole("button", { name: "富文本" }).click();
  const mobileCodeBlockLayout = await page.locator('.studio-rich-content [class*="_codeMirrorWrapper_"]').evaluate((wrapper) => {
    const toolbar = wrapper.querySelector('[class*="_codeMirrorToolbar_"]');
    const editor = wrapper.querySelector('.cm-editor');
    const wrapperRect = wrapper.getBoundingClientRect();
    const toolbarRect = toolbar.getBoundingClientRect();
    const editorRect = editor.getBoundingClientRect();
    return {
      toolbarBottom: Math.round(toolbarRect.bottom),
      editorTop: Math.round(editorRect.top),
      toolbarRight: Math.round(toolbarRect.right),
      wrapperRight: Math.round(wrapperRect.right),
    };
  });
  assert(
    mobileCodeBlockLayout.editorTop >= mobileCodeBlockLayout.toolbarBottom,
    `mobile code text must start below its toolbar: ${JSON.stringify(mobileCodeBlockLayout)}`,
  );
  assert(
    mobileCodeBlockLayout.toolbarRight <= mobileCodeBlockLayout.wrapperRight,
    `mobile code toolbar must stay inside the code block: ${JSON.stringify(mobileCodeBlockLayout)}`,
  );

  const outlineTool = page.locator(".csdn-toolbar-action").filter({ hasText: "目录" });
  await outlineTool.scrollIntoViewIfNeeded();
  await outlineTool.click();
  await page.locator(".mobile-utility-drawer").waitFor();
  assert.deepEqual(
    (await page.locator(".mobile-outline-list > button").allTextContents()).map((text) => text.trim()),
    ["背景", "Setext 标题", "总结"],
    "the outline must include real Markdown headings and ignore headings inside code fences",
  );
  const drawerPath = join(outputDirectory, `mobile-${width}-drawer.png`);
  await page.screenshot({ path: drawerPath, animations: "disabled" });
  await page.locator(".mobile-outline-list > button").first().click();

  await page.getByRole("button", { name: "发文设置" }).click();
  await page.locator(".advanced-fields").waitFor();
  await page.getByRole("button", { name: "提取摘要" }).click();
  assert.notEqual(await page.locator(".summary-setting textarea").inputValue(), "");
  const settingsRect = await page.locator(".advanced-fields").evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return { top: Math.round(rect.top), bottom: Math.round(rect.bottom), width: Math.round(rect.width) };
  });
  assert.deepEqual(settingsRect, { top: 109, bottom: height - 64, width });
  const firstSettingRowRect = await page.locator(".setting-row").first().evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return { left: Math.round(rect.left), width: Math.round(rect.width) };
  });
  assert.deepEqual(firstSettingRowRect, { left: 14, width: width - 28 });
  assert.equal(await page.locator(".mobile-settings-head").isVisible(), true);
  const settingsPath = join(outputDirectory, `mobile-${width}-settings.png`);
  await page.screenshot({ path: settingsPath, animations: "disabled" });
  await page.locator(".mobile-settings-head button").click();

  if (width === 390) {
    await page.getByRole("button", { name: "定时发布", exact: true }).click();
    await page.locator(".schedule-dialog").waitFor();
    const scheduleRect = await page.locator(".schedule-dialog").evaluate((element) => {
      const rect = element.getBoundingClientRect();
      return { top: Math.round(rect.top), left: Math.round(rect.left), width: Math.round(rect.width), height: Math.round(rect.height) };
    });
    assert.deepEqual(scheduleRect, { top: 0, left: 0, width, height }, "mobile schedule dialog must use the full viewport");
    await page.screenshot({ path: join(outputDirectory, "mobile-390-schedule-dialog.png"), animations: "disabled" });
    await page.getByTitle("关闭定时发布").click();
    await page.locator(".schedule-dialog").waitFor({ state: "detached" });

    const imageTool = page.locator(".csdn-toolbar-action").filter({ hasText: "图像" });
    await imageTool.scrollIntoViewIfNeeded();
    await imageTool.click();
    await page.locator(".image-insert-drawer").waitFor();
    const imageDrawerRect = await page.locator(".image-insert-drawer").evaluate((element) => {
      const rect = element.getBoundingClientRect();
      return { top: Math.round(rect.top), left: Math.round(rect.left), width: Math.round(rect.width), height: Math.round(rect.height) };
    });
    assert.deepEqual(imageDrawerRect, { top: 0, left: 0, width, height }, "mobile image drawer must use the full viewport");
    await page.screenshot({ path: join(outputDirectory, "mobile-390-image-drawer.png"), animations: "disabled" });
    await page.locator('.image-insert-drawer input[type="file"]').setInputFiles({
      name: "diagram.png",
      mimeType: "image/png",
      buffer: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=", "base64"),
    });
    await page.locator(".image-upload-list").waitFor();
    const uploadedImagePreview = page.locator(".image-upload-list img[alt='diagram']");
    assert.equal(await uploadedImagePreview.count(), 1, "uploaded image must be previewed before insertion");
    await page.waitForFunction(() => document.querySelector(".image-upload-list img")?.naturalWidth > 0);
    assert.equal(await page.locator(".image-upload-footer").getByText("已选择 1 张").count(), 1);
    const imageConfirm = page.locator(".image-upload-footer .drawer-primary-button");
    assert.equal(await imageConfirm.isEnabled(), true);
    await page.getByRole("checkbox", { name: "取消选择图片 diagram" }).click();
    assert.equal(await imageConfirm.isDisabled(), true, "image confirmation must require a selected image");
    await page.getByRole("checkbox", { name: "选择图片 diagram" }).click();
    await page.screenshot({ path: join(outputDirectory, "mobile-390-image-selected.png"), animations: "disabled" });
    await imageConfirm.click();
    await page.locator(".image-insert-drawer").waitFor({ state: "detached" });
    await page.waitForFunction(() => Object.keys(localStorage).some((key) => (localStorage.getItem(key) || "").includes("/image/editor/2026/09/visual-test.png")));

    const templateTool = page.locator(".csdn-toolbar-action").filter({ hasText: "模版" });
    await templateTool.scrollIntoViewIfNeeded();
    await templateTool.click();
    const templateDrawer = page.locator(".template-insert-drawer");
    await templateDrawer.waitFor();
    assert.deepEqual(await templateDrawer.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      return { top: Math.round(rect.top), left: Math.round(rect.left), width: Math.round(rect.width), height: Math.round(rect.height) };
    }), { top: 0, left: 0, width, height }, "mobile template drawer must use the full viewport");
    const mobileTemplateCard = templateDrawer.locator(".template-card").first();
    assert.deepEqual(await mobileTemplateCard.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      return { left: Math.round(rect.left), right: Math.round(rect.right), height: Math.round(rect.height) };
    }), { left: 16, right: width - 16, height: 264 });
    await page.screenshot({ path: join(outputDirectory, "mobile-390-template-drawer.png"), animations: "disabled" });
    await page.keyboard.press("Escape");
    await templateDrawer.waitFor({ state: "detached" });

    const formulaTool = page.locator(".csdn-toolbar-action").filter({ hasText: "公式" });
    await formulaTool.scrollIntoViewIfNeeded();
    await formulaTool.click();
    const formulaDialog = page.locator(".formula-dialog");
    await formulaDialog.waitFor();
    const formulaRect = await formulaDialog.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      return { top: Math.round(rect.top), left: Math.round(rect.left), width: Math.round(rect.width), height: Math.round(rect.height) };
    });
    assert.deepEqual(formulaRect, { top: 0, left: 0, width, height }, "mobile formula editor must use the full viewport");
    assert.equal(await formulaDialog.locator(".formula-category-button").count(), 15);
    assert.deepEqual(await formulaDialog.locator(".formula-input-label textarea").evaluate((element) => {
      const rect = element.getBoundingClientRect();
      return { left: Math.round(rect.left), right: Math.round(rect.right), height: Math.round(rect.height) };
    }), { left: 14, right: width - 14, height: 100 });
    const formulaCategories = formulaDialog.locator(".formula-category-rows");
    await formulaCategories.evaluate((element) => { element.scrollLeft = element.scrollWidth; });
    const matrixRect = await formulaDialog.getByTitle("矩阵").evaluate((element) => {
      const rect = element.getBoundingClientRect();
      return { left: Math.round(rect.left), right: Math.round(rect.right) };
    });
    assert(matrixRect.left >= 0 && matrixRect.right <= width, `mobile formula categories must expose the last group: ${JSON.stringify(matrixRect)}`);
    await formulaCategories.evaluate((element) => { element.scrollLeft = 0; });
    await page.screenshot({ path: join(outputDirectory, "mobile-390-formula-dialog.png"), animations: "disabled" });
    const mobileFormulaTextareaRect = await formulaDialog.locator(".formula-input-label textarea").evaluate((element) => {
      const rect = element.getBoundingClientRect();
      return { bottom: Math.round(rect.bottom) };
    });
    await formulaDialog.getByTitle("大型运算符").click();
    const mobileFormulaPopoverRect = await formulaDialog.locator(".formula-symbol-popover").evaluate((element) => {
      const rect = element.getBoundingClientRect();
      return { top: Math.round(rect.top), bottom: Math.round(rect.bottom) };
    });
    const mobileFormulaFooterTop = await formulaDialog.locator("footer").evaluate((element) => Math.round(element.getBoundingClientRect().top));
    assert(mobileFormulaPopoverRect.top >= mobileFormulaTextareaRect.bottom, "mobile formula symbols must not cover the LaTeX field");
    assert(mobileFormulaPopoverRect.bottom <= mobileFormulaFooterTop, "mobile formula symbols must stay above the footer");
    await formulaDialog.getByTitle("关闭").click();
    await formulaDialog.waitFor({ state: "detached" });

    if (width === 390) {
      await page.setViewportSize({ width, height: 400 });
      await formulaTool.scrollIntoViewIfNeeded();
      await formulaTool.click();
      const landscapeFormulaDialog = page.locator(".formula-dialog");
      await landscapeFormulaDialog.waitFor();
      assert.equal(await landscapeFormulaDialog.evaluate((element) => Math.round(element.getBoundingClientRect().height)), 512);
      const landscapeTextareaBottom = await landscapeFormulaDialog.locator(".formula-input-label textarea").evaluate((element) => Math.round(element.getBoundingClientRect().bottom));
      const landscapeFooterTop = await landscapeFormulaDialog.locator("footer").evaluate((element) => Math.round(element.getBoundingClientRect().top));
      assert(landscapeTextareaBottom < landscapeFooterTop, "landscape formula footer must not overlap the LaTeX field");
      await landscapeFormulaDialog.getByTitle("大型运算符").click();
      const landscapePopoverRect = await landscapeFormulaDialog.locator(".formula-symbol-popover").evaluate((element) => {
        const rect = element.getBoundingClientRect();
        return { top: Math.round(rect.top), bottom: Math.round(rect.bottom) };
      });
      assert(landscapePopoverRect.top >= landscapeTextareaBottom && landscapePopoverRect.bottom <= landscapeFooterTop, "landscape formula symbols must fit between the field and footer");
      const shortBackdrop = page.locator(".formula-backdrop");
      const shortBackdropScroll = await shortBackdrop.evaluate((element) => ({ clientHeight: element.clientHeight, scrollHeight: element.scrollHeight }));
      assert.deepEqual(shortBackdropScroll, { clientHeight: 400, scrollHeight: 512 });
      await landscapeFormulaDialog.getByTitle("关闭").click();
      await landscapeFormulaDialog.waitFor({ state: "detached" });
      await page.setViewportSize({ width, height });
    }

    const linkTool = page.locator(".csdn-toolbar-action").filter({ hasText: "链接" });
    await linkTool.scrollIntoViewIfNeeded();
    await linkTool.click();
    const linkDialog = page.locator(".link-insert-dialog");
    await linkDialog.waitFor();
    const linkRect = await linkDialog.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      return { top: Math.round(rect.top), left: Math.round(rect.left), width: Math.round(rect.width), height: Math.round(rect.height) };
    });
    assert.deepEqual(linkRect, { top: 0, left: 0, width, height }, "mobile link dialog must use the full viewport");
    const mobileLinkInputs = await linkDialog.locator("input").evaluateAll((inputs) => inputs.map((input) => {
      const rect = input.getBoundingClientRect();
      return { left: Math.round(rect.left), right: Math.round(rect.right), width: Math.round(rect.width), height: Math.round(rect.height) };
    }));
    assert.deepEqual(mobileLinkInputs, [
      { left: 16, right: width - 16, width: width - 32, height: 36 },
      { left: 16, right: width - 16, width: width - 32, height: 36 },
    ]);
    const mobileToast = page.locator(".toast");
    if (await mobileToast.isVisible()) await mobileToast.waitFor({ state: "detached", timeout: 6_000 });
    await page.screenshot({ path: join(outputDirectory, "mobile-390-link-dialog.png"), animations: "disabled" });
    await linkDialog.getByTitle("关闭").click();
    await linkDialog.waitFor({ state: "detached" });

    const videoTool = page.locator(".csdn-toolbar-action").filter({ hasText: "视频" });
    await videoTool.scrollIntoViewIfNeeded();
    await videoTool.click();
    const videoDialog = page.locator(".video-insert-dialog");
    await videoDialog.waitFor();
    assert.deepEqual(await videoDialog.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      return { top: Math.round(rect.top), left: Math.round(rect.left), width: Math.round(rect.width), height: Math.round(rect.height) };
    }), { top: 0, left: 0, width, height }, "mobile video dialog must use the full viewport");
    const mobileVideoFooter = await videoDialog.locator(".video-dialog-footer").evaluate((element) => {
      const rect = element.getBoundingClientRect();
      return { left: Math.round(rect.left), right: Math.round(rect.right), bottom: Math.round(rect.bottom) };
    });
    assert.deepEqual(mobileVideoFooter, { left: 16, right: width - 16, bottom: height - 14 });
    await page.screenshot({ path: join(outputDirectory, `mobile-${width}-video-dialog.png`), animations: "disabled" });
    await videoDialog.locator(".video-dialog-footer > .video-upload-link").click();
    await videoDialog.locator(".video-upload-view").waitFor();
    const mobileVideoInputs = await videoDialog.locator(".video-address-fields input").evaluateAll((inputs) => inputs.map((input) => {
      const rect = input.getBoundingClientRect();
      return { left: Math.round(rect.left), right: Math.round(rect.right), height: Math.round(rect.height) };
    }));
    assert.deepEqual(mobileVideoInputs, [
      { left: 16, right: width - 16, height: 36 },
      { left: 16, right: width - 16, height: 36 },
    ]);
    await page.keyboard.press("Escape");
    await videoDialog.waitFor({ state: "detached" });

    if (width === 390) {
      await page.setViewportSize({ width, height: 360 });
      await videoTool.scrollIntoViewIfNeeded();
      await videoTool.click();
      const shortVideoDialog = page.locator(".video-insert-dialog");
      await shortVideoDialog.waitFor();
      assert.equal(await shortVideoDialog.evaluate((element) => Math.round(element.getBoundingClientRect().height)), 394);
      assert.deepEqual(await page.locator(".media-dialog-backdrop").evaluate((element) => ({ clientHeight: element.clientHeight, scrollHeight: element.scrollHeight })), { clientHeight: 360, scrollHeight: 394 });
      const shortVideoContentBottom = await shortVideoDialog.locator(".video-empty-state p").evaluate((element) => Math.round(element.getBoundingClientRect().bottom));
      const shortVideoFooterTop = await shortVideoDialog.locator(".video-dialog-footer").evaluate((element) => Math.round(element.getBoundingClientRect().top));
      assert(shortVideoContentBottom < shortVideoFooterTop, "short mobile video content must not overlap the footer");
      await shortVideoDialog.getByTitle("关闭").click();
      await shortVideoDialog.waitFor({ state: "detached" });
      await page.setViewportSize({ width, height });
    }

    const resourceTool = page.locator(".csdn-toolbar-action").filter({ hasText: "资源绑定" });
    await resourceTool.scrollIntoViewIfNeeded();
    await resourceTool.click();
    await page.locator(".resource-binding-dialog").waitFor();
    const resourceRect = await page.locator(".resource-binding-dialog").evaluate((element) => {
      const rect = element.getBoundingClientRect();
      return { top: Math.round(rect.top), left: Math.round(rect.left), width: Math.round(rect.width), height: Math.round(rect.height) };
    });
    assert.deepEqual(resourceRect, { top: 0, left: 0, width, height }, "mobile resource dialog must use the full viewport");
    await page.screenshot({ path: join(outputDirectory, "mobile-390-resource-dialog.png"), animations: "disabled" });
    await page.locator(".resource-binding-dialog").getByTitle("关闭").click();
    await page.locator(".resource-binding-dialog").waitFor({ state: "detached" });

    const tableTool = page.locator(".csdn-toolbar-action").filter({ hasText: "表格" });
    await tableTool.scrollIntoViewIfNeeded();
    await tableTool.click();
    await page.locator(".table-properties-dialog").waitFor();
    const tableRect = await page.locator(".table-properties-dialog").evaluate((element) => {
      const rect = element.getBoundingClientRect();
      return { top: Math.round(rect.top), left: Math.round(rect.left), width: Math.round(rect.width), height: Math.round(rect.height) };
    });
    assert.deepEqual(tableRect, { top: 0, left: 0, width, height }, "mobile table dialog must use the full viewport");
    const mobileTableFields = await page.locator(".table-properties-grid input, .table-properties-grid select").evaluateAll((fields) => fields.map((field) => {
      const rect = field.getBoundingClientRect();
      return { left: Math.round(rect.left), right: Math.round(rect.right), height: Math.round(rect.height) };
    }));
    assert(mobileTableFields.every((field) => field.left >= 16 && field.right <= width - 16 && field.height === 36), `mobile table fields must be reachable and touch-sized: ${JSON.stringify(mobileTableFields)}`);
    await page.screenshot({ path: join(outputDirectory, "mobile-390-table-dialog.png"), animations: "disabled" });
    await page.locator(".table-properties-dialog").getByTitle("关闭").click();
    await page.locator(".table-properties-dialog").waitFor({ state: "detached" });

    await page.locator(".csdn-code-block-tool").scrollIntoViewIfNeeded();
    await page.locator(".csdn-code-block-tool button").click();
    await page.getByRole("option", { name: "运行代码" }).click();
    await page.locator(".code-runner-dialog").waitFor();
    const runnerRect = await page.locator(".code-runner-dialog").evaluate((element) => {
      const rect = element.getBoundingClientRect();
      return { top: Math.round(rect.top), left: Math.round(rect.left), width: Math.round(rect.width), height: Math.round(rect.height) };
    });
    assert.deepEqual(runnerRect, { top: 0, left: 0, width, height }, "mobile code runner must use the full viewport");
    await page.screenshot({ path: join(outputDirectory, "mobile-390-code-runner.png"), animations: "disabled" });
    const codePreview = page.frameLocator('iframe[title="代码运行预览"]');
    await codePreview.getByRole("button", { name: "运行交互" }).click();
    await codePreview.locator("#result", { hasText: "代码运行成功" }).waitFor();
    await page.locator(".code-runner-dialog").getByRole("button", { name: "取消" }).click();
    await page.locator(".code-runner-dialog").waitFor({ state: "detached" });
  }

  await page.locator(".csdn-editor-toolbar").evaluate((element) => { element.scrollLeft = element.scrollWidth; });
  const markdownVisible = await page.getByRole("button", { name: "使用 Markdown 源码编辑器" }).evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return rect.left >= 0 && rect.right <= innerWidth;
  });
  assert.equal(markdownVisible, true, "the final mobile toolbar command must be reachable");
  assert.deepEqual(pageErrors, [], `${width}px page errors: ${pageErrors.join("; ")}`);
  const path = join(outputDirectory, `mobile-${width}.png`);
  await page.screenshot({ path, animations: "disabled" });
  await context.close();
  return { path, drawerPath, settingsPath, metrics };
}

async function verifyCompactDropdownLayer() {
  const width = 579;
  const { context, page, pageErrors } = await openEditor({ width, height: 720 });
  await page.locator(".csdn-editor-toolbar").evaluate((element) => { element.scrollLeft = 160; });
  const moreStyleButton = page.getByRole("combobox", { name: "其他样式" });
  await moreStyleButton.scrollIntoViewIfNeeded();
  await moreStyleButton.click();
  const moreStyleMenu = page.locator(".mdxeditor-select-content");
  await moreStyleMenu.waitFor();
  await assertEveryMenuItemIsTopLayer(
    moreStyleMenu,
    '[role="option"]',
    "compact more-style menu must stay above the article title",
  );
  const path = join(outputDirectory, "compact-579-more-style-menu.png");
  await page.screenshot({ path, animations: "disabled" });
  assert.deepEqual(pageErrors, [], `579px page errors: ${pageErrors.join("; ")}`);
  await context.close();
  return { path };
}

async function verifyNarrowExistingArticle() {
  const width = 320;
  const height = 720;
  const { context, page, pageErrors } = await openEditor({ width, height }, { existing: true });
  const metrics = await layoutMetrics(page);
  assert.equal(metrics.body.scrollWidth, metrics.body.clientWidth, "320px body must not overflow horizontally");
  assert.equal(metrics.publish.height, 64);

  const actionRects = await page.locator(".publish-bar-actions > button").evaluateAll((buttons) => buttons.map((button) => {
    const rect = button.getBoundingClientRect();
    return { left: Math.round(rect.left), right: Math.round(rect.right), width: Math.round(rect.width) };
  }));
  assert.equal(actionRects.length, 4, "existing articles must keep delete, save, schedule, and publish actions");
  assert.deepEqual(actionRects, [
    { left: 44, right: 80, width: 36 },
    { left: 87, right: 158, width: 71 },
    { left: 165, right: 236, width: 71 },
    { left: 243, right: 312, width: 69 },
  ], "320px publish actions must retain stable, non-overlapping geometry");
  for (const rect of actionRects) {
    assert(rect.left >= 0 && rect.right <= width && rect.width > 0, `publish action is clipped: ${JSON.stringify(rect)}`);
  }
  for (let index = 1; index < actionRects.length; index += 1) {
    assert(actionRects[index - 1].right <= actionRects[index].left, "publish actions must not overlap");
  }

  const textColorButton = page.locator('button[aria-label="文字颜色"]');
  await textColorButton.scrollIntoViewIfNeeded();
  await textColorButton.click();
  const colorPalette = page.locator(".csdn-color-palette");
  await colorPalette.waitFor();
  const colorPaletteRect = await colorPalette.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return {
      left: Math.round(rect.left),
      right: Math.round(rect.right),
      width: Math.round(rect.width),
      height: Math.round(rect.height),
    };
  });
  assert.equal(colorPaletteRect.width, 272);
  assert.equal(colorPaletteRect.height, 180);
  assert(colorPaletteRect.left >= 8 && colorPaletteRect.right <= width - 8, `mobile color palette must stay inside viewport: ${JSON.stringify(colorPaletteRect)}`);
  assert.equal(await colorPalette.getByRole("menuitem").count(), 45);
  await page.screenshot({ path: join(outputDirectory, "mobile-320-color-palette.png"), animations: "disabled" });
  await page.keyboard.press("Escape");
  await colorPalette.waitFor({ state: "detached" });

  await page.locator(".studio-rich-content[contenteditable='true']").click({ position: { x: 80, y: 80 } });
  const formatButton = page.getByRole("button", { name: "格式" });
  await formatButton.scrollIntoViewIfNeeded();
  await formatButton.click();
  const formatMenu = page.locator(".csdn-format-menu-popup");
  await formatMenu.waitFor();
  const formatMenuRect = await formatMenu.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return {
      left: Math.round(rect.left),
      right: Math.round(rect.right),
      width: Math.round(rect.width),
      height: Math.round(rect.height),
    };
  });
  assert.equal(formatMenuRect.width, 140);
  assert.equal(formatMenuRect.height, 260);
  assert(formatMenuRect.left >= 8 && formatMenuRect.right <= width - 8, `mobile format menu must stay inside viewport: ${JSON.stringify(formatMenuRect)}`);
  assert.equal(await formatMenu.getByRole("menuitem").count(), 7);
  await page.screenshot({ path: join(outputDirectory, "mobile-320-format-menu.png"), animations: "disabled" });
  await formatMenu.getByRole("menuitem", { name: "标题六" }).click();
  await page.locator(".studio-rich-content h6").waitFor();

  await page.locator(".csdn-toolbar-action").filter({ hasText: "历史" }).click();
  await page.locator(".history-dialog").waitFor();
  await page.locator(".history-list > button").first().click();
  await page.waitForFunction(() => document.querySelector(".history-preview pre")?.textContent?.includes("GitHub 历史读取"));
  const historyFilter = page.locator(".history-filter-trigger");
  assert.match(await historyFilter.textContent(), /共\s*2\s*条历史版本/);
  await historyFilter.click();
  const historyTypeFilters = page.locator(".history-filter-options input");
  assert.equal(await historyTypeFilters.count(), 5);
  assert.deepEqual(await historyTypeFilters.evaluateAll((elements) => elements.map((element) => element.checked)), [true, true, true, true, true]);
  await page.getByLabel("手动保存").uncheck();
  assert.equal(await page.locator(".history-list > button").count(), 0);
  await page.getByText("当前筛选条件下暂无历史").waitFor();
  await page.getByLabel("手动保存").check();
  await page.locator(".history-list > button").first().waitFor();
  await historyFilter.click();
  await page.locator(".history-list > button").first().click();
  await page.waitForFunction(() => document.querySelector(".history-preview pre")?.textContent?.includes("GitHub 历史读取"));
  const historyRect = await page.locator(".history-dialog").evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return { top: Math.round(rect.top), left: Math.round(rect.left), width: Math.round(rect.width), height: Math.round(rect.height) };
  });
  assert.deepEqual(historyRect, { top: 0, left: 0, width, height });
  const path = join(outputDirectory, "mobile-320-history.png");
  await page.screenshot({ path, animations: "disabled" });
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "恢复到这个版本" }).click();
  await page.locator(".history-dialog").waitFor({ state: "detached" });
  await page.waitForFunction(() => document.querySelector(".studio-rich-content")?.textContent?.includes("GitHub 历史读取"));
  assert.equal(await page.locator(".title-input").inputValue(), "历史版本文章");
  assert.deepEqual(pageErrors, [], `320px page errors: ${pageErrors.join("; ")}`);
  await context.close();
  return { path, metrics, actionRects, historyRect };
}

async function verifyContentCrud() {
  const { context, page, pageErrors, mutations } = await openEditor(
    { width: 1264, height: 720 },
    { includeDraft: true },
  );

  assert.equal(await page.getByRole("button", { name: "删除当前草稿" }).count(), 1, "new drafts must have a delete action");
  await page.locator(".editor-back-button").click();
  const listPath = join(outputDirectory, "desktop-content-management.png");
  await page.screenshot({ path: listPath, animations: "disabled" });

  await page.getByRole("tab", { name: "已发布" }).click();
  assert.equal(await page.getByRole("button", { name: `删除草稿 ${exampleDraft.title}` }).count(), 0, "published filter must hide cloud drafts");
  assert.equal(await page.getByRole("button", { name: `删除文章 ${examplePost.title}` }).count(), 1);
  await page.getByRole("tab", { name: "草稿" }).click();
  assert.equal(await page.getByRole("button", { name: `删除草稿 ${exampleDraft.title}` }).count(), 1, "draft filter must include cloud drafts");
  assert.equal(await page.getByRole("button", { name: `删除文章 ${examplePost.title}` }).count(), 0);
  await page.getByPlaceholder("搜索标题、标签或分类").fill("不存在的标题");
  assert.equal(await page.getByRole("button", { name: `删除草稿 ${exampleDraft.title}` }).count(), 0, "search must filter cloud drafts");
  await page.getByPlaceholder("搜索标题、标签或分类").fill("");

  const deleteDraftButton = page.getByRole("button", { name: `删除草稿 ${exampleDraft.title}` });
  await deleteDraftButton.waitFor();
  page.once("dialog", (dialog) => dialog.accept());
  await deleteDraftButton.click();
  await deleteDraftButton.waitFor({ state: "detached" });
  assert.deepEqual(mutations.find((mutation) => mutation.method === "DELETE" && mutation.path === "/api/draft"), {
    method: "DELETE",
    path: "/api/draft",
    body: { key: exampleDraft.key },
  });

  await page.getByRole("tab", { name: "全部" }).click();
  const deleteArticleButton = page.getByRole("button", { name: `删除文章 ${examplePost.title}` });
  await deleteArticleButton.waitFor();
  page.once("dialog", (dialog) => dialog.accept());
  await deleteArticleButton.click();
  await deleteArticleButton.waitFor({ state: "detached" });
  assert.deepEqual(mutations.find((mutation) => mutation.method === "DELETE" && mutation.path === "/api/post"), {
    method: "DELETE",
    path: "/api/post",
    body: { path: examplePost.path, sha: examplePost.sha },
  });

  await page.locator(".editor-back-button").click();
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "删除当前草稿" }).click();
  await page.locator(".empty-editor").waitFor();
  assert.deepEqual(pageErrors, [], `CRUD page errors: ${pageErrors.join("; ")}`);
  await context.close();
  return { listPath, mutations };
}

async function verifyDraftBackupPublishing() {
  const results = [];
  for (const backup of [true, false]) {
    const { context, page, pageErrors, mutations } = await openEditor(
      { width: 1264, height: 720 },
      { includeDraft: true },
    );
    await page.locator(".editor-back-button").click();
    await page.locator(".post-row").filter({ hasText: exampleDraft.title }).click();
    if (backup) {
      await page.locator(".publish-bar-meta button").click();
      await page.getByLabel("同时保留云端编辑草稿").check();
      await page.locator(".publish-bar-meta button").click();
    }
    await page.getByRole("button", { name: "发布博客" }).click();
    await page.locator(".toast", { hasText: "文章已发布" }).waitFor();

    const postMutation = mutations.find((mutation) => mutation.method === "PUT" && mutation.path === "/api/post");
    assert(postMutation, "publishing a cloud draft must save the article to GitHub");
    assert.equal(postMutation.body.path, `content/posts/${exampleDraft.title}.md`);
    assert.match(postMutation.body.content, /draft: false/);

    const finalDraftSave = mutations.find((mutation) =>
      mutation.method === "PUT"
      && mutation.path === "/api/draft"
      && mutation.body.path === postMutation.body.path
      && mutation.body.sha === "d".repeat(40));
    const draftDelete = mutations.find((mutation) => mutation.method === "DELETE" && mutation.path === "/api/draft");
    if (backup) {
      assert(finalDraftSave, "backup publishing must retain the cloud draft with the published path and SHA");
      assert.equal(finalDraftSave.body.key, exampleDraft.key);
      assert.equal(finalDraftSave.body.isNew, false);
      assert.match(finalDraftSave.body.content, /draft: true/);
      assert.match(finalDraftSave.body.content, /backup: true/);
      assert.equal(draftDelete, undefined, "backup publishing must not delete the cloud draft");
    } else {
      assert.equal(finalDraftSave, undefined, "ordinary publishing must not retain the cloud draft");
      assert.deepEqual(draftDelete, {
        method: "DELETE",
        path: "/api/draft",
        body: { key: exampleDraft.key },
      });
    }
    assert.deepEqual(pageErrors, [], `draft backup page errors: ${pageErrors.join("; ")}`);
    results.push({ backup, mutations });
    await context.close();
  }
  return results;
}

async function verifyScheduledPublish() {
  const { context, page, pageErrors, mutations } = await openEditor({ width: 1264, height: 720 });
  await page.locator(".title-input").fill("定时发布验证文章");
  await page.locator(".publish-bar-meta button").click();
  await page.locator(".setting-input-with-action input").fill("Astro, 定时发布");
  await page.locator(".publish-bar-meta button").click();
  await page.getByRole("button", { name: "定时发布" }).click();
  const scheduleLayout = await page.locator(".schedule-dialog").evaluate((dialog) => {
    const dialogRect = dialog.getBoundingClientRect();
    const relativeRect = (selector) => {
      const rect = dialog.querySelector(selector).getBoundingClientRect();
      return {
        x: Math.round(rect.x - dialogRect.x),
        y: Math.round(rect.y - dialogRect.y),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
      };
    };
    return {
      dialog: { x: Math.round(dialogRect.x), y: Math.round(dialogRect.y), width: Math.round(dialogRect.width), height: Math.round(dialogRect.height) },
      header: relativeRect(":scope > header"),
      body: relativeRect(".schedule-dialog-body"),
      fields: [...dialog.querySelectorAll(".schedule-field")].map((element) => {
        const rect = element.getBoundingClientRect();
        return { x: Math.round(rect.x - dialogRect.x), y: Math.round(rect.y - dialogRect.y), width: Math.round(rect.width), height: Math.round(rect.height) };
      }),
      footer: relativeRect(".schedule-dialog-actions"),
    };
  });
  assert.deepEqual(
    scheduleLayout,
    {
      dialog: { x: 449, y: 249, width: 366, height: 223 },
      header: { x: 24, y: 24, width: 318, height: 49 },
      body: { x: 24, y: 73, width: 318, height: 70 },
      fields: [
        { x: 24, y: 111, width: 155, height: 32 },
        { x: 187, y: 111, width: 155, height: 32 },
      ],
      footer: { x: 24, y: 159, width: 318, height: 40 },
    },
    "desktop schedule dialog must match the measured CSDN geometry",
  );
  assert.match(await page.locator(".schedule-dialog-body").textContent(), /4小时.*7天/);
  const schedulePath = join(outputDirectory, "desktop-1264-schedule-dialog.png");
  await page.screenshot({ path: schedulePath, animations: "disabled" });
  const target = await page.evaluate(() => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    const shifted = new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString();
    return { date: shifted.slice(0, 10), time: "12:00" };
  });
  await page.getByLabel("选择日期").fill(target.date);
  await page.getByLabel("选择时间").selectOption(target.time);
  await page.locator(".schedule-dialog-actions .csdn-publish-button").click();
  await page.locator(".schedule-dialog").waitFor({ state: "detached" });
  await page.locator(".toast", { hasText: "已安排在" }).waitFor();
  const scheduleMutation = mutations.find((mutation) => mutation.path === "/api/schedule");
  assert(scheduleMutation, "scheduled publish must call the schedule API");
  assert.match(scheduleMutation.body.content, new RegExp(`published: '${target.date}'`));
  assert.match(scheduleMutation.body.content, /draft: false/);
  assert.match(scheduleMutation.body.content, /scheduledAt:/);
  assert.deepEqual(pageErrors, [], `scheduled publish page errors: ${pageErrors.join("; ")}`);
  await context.close();
  return { schedulePath, scheduleMutation };
}

try {
  const results = [
    await verifyDesktop(),
    await verifyMobile(390),
    await verifyMobile(360),
    await verifyCompactDropdownLayer(),
    await verifyNarrowExistingArticle(),
    await verifyContentCrud(),
    await verifyDraftBackupPublishing(),
    await verifyScheduledPublish(),
  ];
  console.log(JSON.stringify(results, null, 2));
} finally {
  await browser.close();
}
