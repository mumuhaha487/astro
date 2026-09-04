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

async function mockStudioApi(page) {
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
    if (url.pathname === "/api/posts") return json({ posts: [examplePost] });
    if (url.pathname === "/api/post" && request.method() === "GET") {
      return json({ path: examplePost.path, sha: examplePost.sha, content: exampleContent });
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
    if (url.pathname === "/api/academic-search") {
      return json({ works: [{
        id: "https://openalex.org/W123",
        title: "Astro Studio Editing Research",
        year: 2026,
        authors: ["Ada Lovelace", "Alan Turing"],
        venue: "Open Web Journal",
        url: "https://doi.org/10.1000/astro-studio",
        doi: "10.1000/astro-studio",
      }] });
    }
    if (url.pathname === "/api/drafts" && request.method() === "GET") return json({ drafts: [] });
    if (url.pathname === "/api/draft" && request.method() === "PUT") {
      const body = request.postDataJSON();
      return json({ key: "visual-draft", path: body.path, title: body.title, updatedAt: body.updatedAt, isNew: body.isNew });
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

async function openEditor(viewport, { existing = false } = {}) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1 });
  const page = await context.newPage();
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await mockStudioApi(page);
  await page.goto(process.env.STUDIO_VISUAL_URL || "http://127.0.0.1:4174", { waitUntil: "networkidle" });
  if (existing) {
    await page.locator(".editor-back-button").click();
    await page.locator(".post-row").filter({ hasText: examplePost.title }).click();
  } else {
    await page.locator(".empty-editor button").click();
  }
  await page.locator(".csdn-editor-toolbar").waitFor();
  return { context, page, pageErrors };
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
      toolbar: rect(".csdn-editor-toolbar"),
      workspace: rect(".editor-workspace"),
      outline: rect(".outline-pane"),
      assistant: rect(".assistant-card"),
      assistantDrawer: rect(".assistant-drawer"),
      compose: rect(".compose-pane"),
      document: rect(".document-scroll"),
      draftBanner: rect(".draft-resume-banner"),
      titleInput: rect(".title-input"),
      publish: rect(".publish-bar"),
    };
  });
}

async function verifyDesktop() {
  const { context, page, pageErrors } = await openEditor({ width: 1264, height: 720 });
  const metrics = await layoutMetrics(page);
  assert.equal(metrics.body.scrollWidth, metrics.body.clientWidth, "desktop body must not overflow horizontally");
  assert.equal(metrics.topbar.height, 48);
  assert.equal(metrics.toolbar.height, 61);
  assert.equal(metrics.toolbar.scrollWidth, 1324);
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
    { x: metrics.assistantDrawer.x, y: metrics.assistantDrawer.y, width: metrics.assistantDrawer.width, bottom: metrics.assistantDrawer.y + metrics.assistantDrawer.height },
    { x: 874, y: 100, width: 390, bottom: 652 },
  );
  assert.equal(metrics.assistant.width, 104);
  assert.equal(metrics.publish.height, 68);
  assert.equal(await page.locator(".mobile-writing-tools-button").isVisible(), false);
  const baselinePath = join(outputDirectory, "desktop-1264-baseline.png");
  await page.screenshot({ path: baselinePath, animations: "disabled" });

  await page.getByRole("tab", { name: "Chat" }).click();
  await page.locator(".assistant-drawer textarea").fill("请检查文章结构");
  await page.locator(".assistant-drawer .assistant-send").click();
  await page.waitForFunction(() => document.querySelectorAll(".assistant-drawer .assistant-messages p").length === 2);
  await page.getByRole("tab", { name: "Agent" }).click();
  await page.locator(".assistant-drawer textarea").fill("生成大纲");
  await page.locator(".assistant-drawer .assistant-send").click();
  await page.waitForFunction(() => document.querySelectorAll(".studio-rich-content h2").length === 3);

  await page.getByTitle("收起AI助手").click();
  await page.locator(".assistant-card > button").filter({ hasText: "学术搜索" }).click();
  await page.locator(".academic-dialog input").fill("Astro editing");
  await page.locator(".academic-search-form > button").click();
  await page.locator(".academic-result").waitFor();
  await page.getByRole("button", { name: "插入引用" }).click();
  await page.waitForFunction(() => document.querySelector(".studio-rich-content")?.textContent?.includes("Astro Studio Editing Research"));

  await page.locator(".csdn-code-block-tool").scrollIntoViewIfNeeded();
  await page.locator(".csdn-code-block-tool button").click();
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
  await page.getByRole("tab", { name: "链接添加" }).click();
  await page.getByPlaceholder("图片URL").fill("https://example.com/architecture.png");
  const imageUrlRect = await page.getByPlaceholder("图片URL").evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return { top: Math.round(rect.top), height: Math.round(rect.height) };
  });
  assert.deepEqual(imageUrlRect, { top: 274, height: 36 });
  await page.screenshot({ path: join(outputDirectory, "desktop-1264-image-drawer.png"), animations: "disabled" });
  await page.locator(".image-link-panel .drawer-primary-button").click();
  await page.locator(".image-insert-drawer").waitFor({ state: "detached" });

  const formulaTool = page.locator(".csdn-toolbar-action").filter({ hasText: "公式" });
  await formulaTool.scrollIntoViewIfNeeded();
  await formulaTool.click();
  await page.locator(".formula-dialog").waitFor();
  await page.locator(".formula-input-label textarea").fill("\\frac{a}{b} + \\alpha");
  await page.locator(".formula-preview .katex").waitFor();
  await page.screenshot({ path: join(outputDirectory, "desktop-1264-formula-dialog.png"), animations: "disabled" });
  await page.locator(".formula-dialog .dialog-primary-button").click();
  await page.locator(".formula-dialog").waitFor({ state: "detached" });

  const linkTool = page.locator(".csdn-toolbar-action").filter({ hasText: "链接" });
  await linkTool.scrollIntoViewIfNeeded();
  await linkTool.click();
  await page.locator(".link-insert-dialog").waitFor();
  await page.locator(".link-insert-dialog input").nth(0).fill("https://docs.astro.build/");
  await page.locator(".link-insert-dialog input").nth(1).fill("Astro 文档");
  await page.locator(".link-insert-dialog .dialog-primary-button").click();
  await page.locator(".link-insert-dialog").waitFor({ state: "detached" });

  const videoTool = page.locator(".csdn-toolbar-action").filter({ hasText: "视频" });
  await videoTool.scrollIntoViewIfNeeded();
  await videoTool.click();
  await page.locator(".video-insert-dialog").waitFor();
  await page.locator('.video-insert-dialog input[type="file"]').setInputFiles({ name: "tutorial.mp4", mimeType: "video/mp4", buffer: Buffer.from("visual-video") });
  await page.locator(".video-insert-dialog").waitFor({ state: "detached" });

  const templateTool = page.locator(".csdn-toolbar-action").filter({ hasText: "模版" });
  await templateTool.scrollIntoViewIfNeeded();
  await templateTool.click();
  await page.locator(".template-insert-drawer").waitFor();
  const templateDrawerRect = await page.locator(".template-insert-drawer").evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return { left: Math.round(rect.left), width: Math.round(rect.width), right: Math.round(rect.right), height: Math.round(rect.height) };
  });
  assert.deepEqual(templateDrawerRect, { left: 564, width: 700, right: 1264, height: 720 });
  await page.getByRole("button", { name: "选择记录bug模板" }).click();
  await page.screenshot({ path: join(outputDirectory, "desktop-1264-template-drawer.png"), animations: "disabled" });
  await page.locator(".template-insert-drawer .drawer-primary-button").click();
  await page.locator(".template-insert-drawer").waitFor({ state: "detached" });

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
  await page.locator(".table-properties-dialog").waitFor();
  await page.getByRole("combobox", { name: "标题单元格" }).selectOption("both");
  await page.getByRole("textbox", { name: "标题", exact: true }).fill("功能对比表");
  await page.getByRole("textbox", { name: "摘要", exact: true }).fill("编辑器功能验证");
  await page.screenshot({ path: join(outputDirectory, "desktop-1264-table-dialog.png"), animations: "disabled" });
  await page.locator(".table-properties-dialog .dialog-primary-button").click();
  await page.locator(".table-properties-dialog").waitFor({ state: "detached" });

  await page.waitForTimeout(1_000);
  const insertedDraft = await page.evaluate(() => Object.keys(localStorage)
    .filter((key) => key.startsWith("astro-studio:") && key !== "astro-studio:templates")
    .map((key) => localStorage.getItem(key) || "")
    .join("\n"));
  for (const expected of ["architecture.png", "frac{a}{b}", "docs.astro.build", "visual-test.mp4", "问题描述", "existing-pack.zip", "Astro 示例资源", "功能对比表", "编辑器功能验证"]) {
    assert(insertedDraft.includes(expected), `inserted content is missing ${expected}: ${insertedDraft.slice(-1200)}`);
  }

  await page.locator(".studio-rich-content[contenteditable='true']").click({ position: { x: 160, y: 24 } });
  const formatButton = page.getByRole("button", { name: "格式" });
  await formatButton.scrollIntoViewIfNeeded();
  await formatButton.click();
  const formatMenu = page.locator(".csdn-format-menu-popup");
  await formatMenu.waitFor();
  assert.deepEqual(await formatMenu.getByRole("menuitem").allTextContents(), ["正文", "标题一", "标题二", "标题三", "标题四", "标题五", "标题六"]);
  const formatMenuRect = await formatMenu.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return { width: Math.round(rect.width), height: Math.round(rect.height) };
  });
  assert.deepEqual(formatMenuRect, { width: 139, height: 257 });
  const formatMenuIsTopLayer = await formatMenu.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return Boolean(document.elementFromPoint(rect.left + 20, rect.top + 84)?.closest(".csdn-format-menu-popup"));
  });
  assert.equal(formatMenuIsTopLayer, true, "format menu must render above the outline panel");
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
    return { top: Math.round(rect.top), width: Math.round(rect.width), height: Math.round(rect.height) };
  });
  assert.deepEqual(colorPaletteRect, { top: 98, width: 270, height: 181 });
  await page.screenshot({ path: join(outputDirectory, "desktop-1264-color-palette.png"), animations: "disabled" });
  await page.getByTitle("文字颜色 #FE2C24", { exact: true }).click();
  await page.locator(".studio-rich-content[contenteditable='true']").click();
  await page.locator(".studio-rich-content[contenteditable='true']").press("End");
  const backgroundColorButton = page.locator('button[aria-label="文字背景色"]');
  await backgroundColorButton.scrollIntoViewIfNeeded();
  await backgroundColorButton.click();
  await page.getByTitle("文字背景色 #FEFCD8", { exact: true }).click();
  await page.locator(".studio-rich-content[contenteditable='true']").click();
  await page.locator(".studio-rich-content[contenteditable='true']").press("End");

  const moreStyleButton = page.getByRole("combobox", { name: "其他样式" });
  await moreStyleButton.scrollIntoViewIfNeeded();
  await moreStyleButton.click();
  const moreStyleMenu = page.locator(".mdxeditor-select-content");
  assert.deepEqual(await moreStyleMenu.getByRole("option").allTextContents(), ["倾斜", "下划线", "删除线"]);
  const moreStyleMenuRect = await moreStyleMenu.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return { top: Math.round(rect.top), width: Math.round(rect.width), height: Math.round(rect.height) };
  });
  assert.deepEqual(moreStyleMenuRect, { top: 98, width: 139, height: 126 });
  await page.screenshot({ path: join(outputDirectory, "desktop-1264-more-style-menu.png"), animations: "disabled" });
  await page.keyboard.press("Escape");

  const listButton = page.getByRole("combobox", { name: "列表" });
  await listButton.scrollIntoViewIfNeeded();
  await listButton.click();
  const listMenu = page.locator(".mdxeditor-select-content");
  assert.deepEqual(await listMenu.getByRole("option").allTextContents(), ["有序列表", "无序列表"]);
  const listMenuRect = await listMenu.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return { width: Math.round(rect.width), height: Math.round(rect.height) };
  });
  assert.deepEqual(listMenuRect, { width: 139, height: 84 });
  await page.keyboard.press("Escape");

  await page.getByRole("combobox", { name: "段落对齐" }).click();
  await page.getByRole("option", { name: "右对齐" }).click();
  await page.waitForTimeout(500);
  const styledDraft = await page.evaluate(() => Object.keys(localStorage)
    .filter((key) => key.startsWith("astro-studio:") && key !== "astro-studio:templates")
    .map((key) => localStorage.getItem(key) || "")
    .join("\n"));
  assert(styledDraft.includes("color:#FE2C24"), "selected text color must persist in Markdown");
  assert(styledDraft.includes("background-color:#FEFCD8"), "selected background color must persist in Markdown");
  const editorText = await page.locator(".studio-rich-content[contenteditable='true']").textContent();
  assert(editorText?.includes("文字") && editorText.includes("段落内容"), `toolbar insertion failed: ${JSON.stringify({ editorText, pageErrors })}`);
  await page.locator(".assistant-title").click();
  await page.locator(".assistant-drawer").waitFor();
  const visibleToast = page.locator(".toast");
  if (await visibleToast.isVisible()) await visibleToast.waitFor({ state: "detached", timeout: 6_000 });
  assert.deepEqual(pageErrors, [], `desktop page errors: ${pageErrors.join("; ")}`);
  const path = join(outputDirectory, "desktop-1264-functional.png");
  await page.screenshot({ path, animations: "disabled" });
  await context.close();
  return { path, baselinePath, metrics };
}

async function verifyMobile(width) {
  const height = width === 390 ? 844 : 800;
  const { context, page, pageErrors } = await openEditor({ width, height });
  const metrics = await layoutMetrics(page);
  assert.equal(metrics.body.scrollWidth, metrics.body.clientWidth, `${width}px body must not overflow horizontally`);
  assert.equal(metrics.topbar.height, 48);
  assert.equal(metrics.toolbar.height, 61);
  assert.equal(metrics.publish.height, 64);
  assert.equal(await page.locator(".mobile-writing-tools-button").isVisible(), true);

  await page.locator(".mobile-writing-tools-button").click();
  await page.locator(".mobile-utility-drawer").waitFor();
  const assistantPath = join(outputDirectory, `mobile-${width}-assistant.png`);
  await page.screenshot({ path: assistantPath, animations: "disabled" });
  await page.locator(".mobile-assistant-workspace textarea").fill("生成大纲");
  await page.locator(".mobile-assistant-workspace .assistant-send").click();
  await page.waitForFunction(() => document.querySelectorAll(".studio-rich-content h2").length === 3);
  await page.getByRole("tab", { name: "目录" }).click();
  assert.equal(await page.locator(".mobile-outline-list > button").count(), 3);
  const drawerPath = join(outputDirectory, `mobile-${width}-drawer.png`);
  await page.screenshot({ path: drawerPath, animations: "disabled" });
  await page.locator(".mobile-outline-list > button").first().click();

  await page.locator(".mobile-writing-tools-button").click();
  await page.locator(".mobile-assistant-workspace textarea").fill("插入代码");
  await page.locator(".mobile-assistant-workspace .assistant-send").click();
  await page.waitForFunction(() => document.querySelector(".pageel-editor-slot")?.textContent?.includes("在这里编写代码"));
  await page.locator(".mobile-assistant-workspace .assistant-quick-actions > button").filter({ hasText: "提取摘要" }).click();
  await page.locator(".advanced-fields").waitFor();
  assert.notEqual(await page.locator(".summary-setting textarea").inputValue(), "");
  const settingsRect = await page.locator(".advanced-fields").evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return { top: Math.round(rect.top), bottom: Math.round(rect.bottom), width: Math.round(rect.width) };
  });
  assert.deepEqual(settingsRect, { top: 109, bottom: height - 64, width });
  assert.equal(await page.locator(".mobile-settings-head").isVisible(), true);
  const settingsPath = join(outputDirectory, `mobile-${width}-settings.png`);
  await page.screenshot({ path: settingsPath, animations: "disabled" });
  await page.locator(".mobile-settings-head button").click();

  if (width === 390) {
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
    await page.locator('.image-insert-drawer input[type="file"]').setInputFiles({ name: "diagram.bmp", mimeType: "image/bmp", buffer: Buffer.from("visual-image") });
    await page.locator(".image-insert-drawer").waitFor({ state: "detached" });
    await page.waitForFunction(() => Object.keys(localStorage).some((key) => (localStorage.getItem(key) || "").includes("/image/editor/2026/09/visual-test.png")));

    const formulaTool = page.locator(".csdn-toolbar-action").filter({ hasText: "公式" });
    await formulaTool.scrollIntoViewIfNeeded();
    await formulaTool.click();
    await page.locator(".formula-dialog").waitFor();
    const formulaRect = await page.locator(".formula-dialog").evaluate((element) => {
      const rect = element.getBoundingClientRect();
      return { top: Math.round(rect.top), left: Math.round(rect.left), width: Math.round(rect.width), height: Math.round(rect.height) };
    });
    assert.deepEqual(formulaRect, { top: 0, left: 0, width, height }, "mobile formula editor must use the full viewport");
    await page.screenshot({ path: join(outputDirectory, "mobile-390-formula-dialog.png"), animations: "disabled" });
    await page.locator(".formula-dialog").getByTitle("关闭").click();
    await page.locator(".formula-dialog").waitFor({ state: "detached" });

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
  return { path, assistantPath, drawerPath, settingsPath, metrics };
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
  assert.equal(colorPaletteRect.width, 270);
  assert.equal(colorPaletteRect.height, 181);
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
  assert.equal(formatMenuRect.width, 139);
  assert.equal(formatMenuRect.height, 257);
  assert(formatMenuRect.left >= 8 && formatMenuRect.right <= width - 8, `mobile format menu must stay inside viewport: ${JSON.stringify(formatMenuRect)}`);
  assert.equal(await formatMenu.getByRole("menuitem").count(), 7);
  await page.screenshot({ path: join(outputDirectory, "mobile-320-format-menu.png"), animations: "disabled" });
  await formatMenu.getByRole("menuitem", { name: "标题六" }).click();
  await page.locator(".studio-rich-content h6").waitFor();

  await page.locator(".csdn-toolbar-action").filter({ hasText: "历史" }).click();
  await page.locator(".history-dialog").waitFor();
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
  await page.getByRole("button", { name: "恢复此版本" }).click();
  await page.locator(".history-dialog").waitFor({ state: "detached" });
  await page.waitForFunction(() => document.querySelector(".studio-rich-content")?.textContent?.includes("GitHub 历史读取"));
  assert.equal(await page.locator(".title-input").inputValue(), "历史版本文章");
  assert.deepEqual(pageErrors, [], `320px page errors: ${pageErrors.join("; ")}`);
  await context.close();
  return { path, metrics, actionRects, historyRect };
}

try {
  const results = [await verifyDesktop(), await verifyMobile(390), await verifyMobile(360), await verifyNarrowExistingArticle()];
  console.log(JSON.stringify(results, null, 2));
} finally {
  await browser.close();
}
