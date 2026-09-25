import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { mkdir, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { zipSync } from "fflate";
import { chromium } from "playwright-core";
import { preview } from "vite";

const executablePath = [
  process.env.PLAYWRIGHT_CHROME_PATH,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
].find((path) => path && existsSync(path));
assert(executablePath, "Chrome not found");

const initialCatalog = {
  tracks: [
    {
      id: "frontend",
      name: "前端",
      projects: [
        {
          id: "proj-1",
          name: "测试项目",
          prompt: "画一只鹈鹕",
          providers: [
            {
              id: "prov-1",
              name: "GPT",
              models: [{ id: "model-1", name: "GPT-6" }],
            },
          ],
        },
      ],
    },
    { id: "backend", name: "后端", projects: [] },
  ],
};

const sha = "a".repeat(40);
const output = join(tmpdir(), "astro-arena-visual");
await mkdir(output, { recursive: true });

let previewServer;
try {
  const existing = await fetch("http://127.0.0.1:4174/").catch(() => null);
  if (!existing || !existing.ok) {
    previewServer = await preview({
      preview: { port: 4174, host: "127.0.0.1" },
      configFile: join(import.meta.dirname, "../vite.config.ts"),
    });
  }
} catch {
  // If preview already running or failed to bind, continue
}

const browser = await chromium.launch({ executablePath, headless: true });

try {
  for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    const errors = [];
    const batchRequests = [];
    let currentCatalog = structuredClone(initialCatalog);
    let currentSha = sha;

    page.on("pageerror", (error) => errors.push(error.message));

    await page.route("**/api/**", async (route) => {
      const { pathname } = new URL(route.request().url());
      const reply = (value, status = 200) =>
        route.fulfill({
          status,
          contentType: "application/json",
          body: JSON.stringify(value),
        });

      if (pathname === "/api/session") {
        return reply({
          authenticated: true,
          github: { connected: true, branch: "main", repository: "astro" },
          translation: { configured: false },
        });
      }
      if (pathname === "/api/posts") return reply({ posts: [] });
      if (pathname === "/api/drafts") return reply({ drafts: [] });
      if (pathname === "/api/model-arena") {
        return reply({ catalog: currentCatalog, sha: currentSha });
      }
      if (pathname === "/api/model-arena/batch") {
        const formData = route.request().postData() || "";
        batchRequests.push(formData);
        currentSha = "b".repeat(40);
        return reply({
          catalog: currentCatalog,
          sha: currentSha,
          commitSha: "commit-sha-" + Math.random().toString(36).slice(2, 8),
          publishedCount: 1,
        });
      }
      return reply({});
    });

    await page.goto(process.env.STUDIO_VISUAL_URL || "http://127.0.0.1:4174", { waitUntil: "networkidle" });
    assert.equal(
      await page.getByTitle("文章列表").count(),
      1,
      `studio did not mount: ${JSON.stringify(errors)} ${(await page.locator("body").innerText()).slice(0, 200)}`,
    );

    // Open Arena Manager dialog
    await page.getByTitle("文章列表").click();
    await page.getByTitle("管理大模型竞技场").click();

    const dialog = page.getByRole("dialog", { name: "大模型竞技场管理" });
    await dialog.waitFor({ state: "visible" });

    // 1. Full batch creation: Project -> Provider -> Model
    // Create new Project
    await dialog.getByTitle("新建测试项目").click();
    await dialog.getByLabel("名称").fill("全流程项目");
    await dialog.getByRole("button", { name: "创建" }).click();
    await dialog.getByText("分类已创建").waitFor();

    // Create new Provider
    await dialog.getByTitle("新建厂商").click();
    await dialog.getByLabel("名称").fill("DeepSeek");
    await dialog.getByRole("button", { name: "创建" }).click();
    await dialog.getByText("分类已创建").waitFor();

    // Create new Model
    await dialog.getByTitle("新建模型").click();
    await dialog.getByLabel("名称").fill("DeepSeek-V3");
    await dialog.getByRole("button", { name: "创建" }).click();
    await dialog.getByText("分类已创建").waitFor();

    // 2. Edit project prompt and stage locally
    await dialog.getByRole("navigation", { name: "竞技场目录" }).getByText("全流程项目").click();
    const promptInput = dialog.locator("textarea").first();
    await promptInput.fill("全流程提示词：画一只代码猫在写程序");
    await dialog.getByRole("button", { name: "保存提示词" }).click();
    await dialog.getByText("提示词已暂存").waitFor();

    // 3. Select the new model and stage nested ZIP submission
    await dialog.getByRole("navigation", { name: "模型厂商" }).getByText("DeepSeek").click();
    await dialog.getByRole("navigation", { name: "具体模型" }).getByText("DeepSeek-V3").click();

    const zip = zipSync({
      "nested/dist/index.html": new TextEncoder().encode('<!doctype html><html><script src="assets/app.js"></script></html>'),
      "nested/dist/assets/app.js": new TextEncoder().encode("document.body.dataset.ready='yes'"),
    });
    await dialog.locator('input[type="file"]').setInputFiles({
      name: "bundle.zip",
      mimeType: "application/zip",
      buffer: Buffer.from(zip),
    });

    await dialog.getByRole("button", { name: /暂存/ }).click();
    await dialog.getByRole("status").getByText("作品已暂存").waitFor();

    // 4. Strict layout, button geometry & containment assertions:
    const head = dialog.locator(".arena-manager-head");
    const headBox = await head.boundingBox();
    assert(headBox, "header bounding box missing");

    const tabs = dialog.locator(".arena-manager-tabs");
    const tabsBox = await tabs.boundingBox();
    assert(tabsBox, "tabs bounding box missing");
    // Ensure header does not vertically collide/overflow into tabs
    assert(
      headBox.y + headBox.height <= tabsBox.y + 2,
      `Header overlaps tabs at ${viewport.width}px: head bottom ${headBox.y + headBox.height} > tabs top ${tabsBox.y}`
    );

    const publishBtn = dialog.getByRole("button", { name: "发布更改" });
    const discardBtn = dialog.getByRole("button", { name: "放弃修改" });
    const publishBox = await publishBtn.boundingBox();
    const discardBox = await discardBtn.boundingBox();
    assert(publishBox, "publish button missing bounding box");
    assert(discardBox, "discard button missing bounding box");

    // Ensure buttons have proper rectangular shape with horizontal text (NOT squashed to 32x32 square!)
    assert(
      publishBox.width >= 70,
      `Publish button too narrow (${publishBox.width}px) at ${viewport.width}px, indicates label squashing/vertical wrapping`
    );
    assert(
      publishBox.height >= 26 && publishBox.height <= 44,
      `Publish button unexpected height (${publishBox.height}px) at ${viewport.width}px`
    );
    assert(
      discardBox.width >= 70,
      `Discard button too narrow (${discardBox.width}px) at ${viewport.width}px, indicates label squashing/vertical wrapping`
    );
    assert(
      discardBox.height >= 26 && discardBox.height <= 44,
      `Discard button unexpected height (${discardBox.height}px) at ${viewport.width}px`
    );

    // Verify all head action buttons are fully contained inside dialog width
    const dialogBox = await dialog.boundingBox();
    assert(dialogBox, "dialog bounding box missing");
    assert(
      publishBox.x + publishBox.width <= dialogBox.x + dialogBox.width,
      `Publish button overflows dialog right edge at ${viewport.width}px`
    );
    assert(
      discardBox.x + discardBox.width <= dialogBox.x + dialogBox.width,
      `Discard button overflows dialog right edge at ${viewport.width}px`
    );

    // Verify no scroll overflow
    const overflow = await dialog.evaluate((element) => element.scrollWidth > element.clientWidth + 1);
    assert(!overflow, `arena modal horizontally overflows at ${viewport.width}px`);
    assert.deepEqual(errors, []);

    // Screenshot staged state
    await page.screenshot({ path: join(output, `arena-${viewport.width}-staged.png`), fullPage: true });

    // 5. Atomic Batch Publish
    await publishBtn.click();
    await dialog.getByText("所有更改已成功发布到仓库").waitFor();

    assert.equal(batchRequests.length, 1);
    assert(batchRequests[0].includes("全流程项目"));
    assert(batchRequests[0].includes("DeepSeek"));
    assert(batchRequests[0].includes("DeepSeek-V3"));
    assert(batchRequests[0].includes("app.js"));

    // Screenshot published state
    await page.screenshot({ path: join(output, `arena-${viewport.width}.png`), fullPage: true });
    await context.close();
  }

  // 6. Verify blog-relative rendering in theme model-arena.js
  const site = await browser.newPage();
  const siteErrors = [];
  site.on("pageerror", (error) => siteErrors.push(error.message));
  const id = "123e4567-e89b-42d3-a456-426614174000";
  const requested = [];

  await site.route("https://vmss.cn/model-arena/submissions/**", (route) => {
    requested.push(route.request().url());
    const asset = route.request().url().endsWith("app.js");
    return route.fulfill({
      contentType: asset ? "text/javascript" : "text/html",
      body: asset
        ? "document.body.dataset.loaded = 'yes'"
        : '<!doctype html><html><body><script src="assets/app.js"></script></body></html>',
    });
  });

  await site.goto("https://vmss.cn/model-arena/", { waitUntil: "commit" }).catch(() => {});
  await site.setContent(`<section data-arena>
    <button data-arena-track="frontend">前端</button>
    <button data-arena-project="project" data-track="frontend" data-prompt="绘制网页">项目</button>
    <button data-arena-provider="provider" data-project="project">GPT</button>
    <button data-arena-model="model" data-provider="provider" data-name="GPT-6" data-url="/model-arena/submissions/${id}/index.html">GPT-6</button>
    <p data-empty="projects"></p><p data-empty="providers"></p><p data-empty="models"></p>
    <section data-arena-prompt hidden><p data-arena-prompt-text></p></section>
    <h2 data-arena-title></h2><p data-arena-path></p><p data-arena-placeholder></p>
    <iframe data-arena-frame hidden></iframe>
  </section>`);

  await site.addScriptTag({ content: await readFile(new URL("../../themes/mumuemhaha/static/hugo-theme/model-arena.js", import.meta.url), "utf8") });
  assert.deepEqual(requested, []);
  assert.equal(await site.locator("[data-arena-prompt-text]").innerText(), "绘制网页");
  await site.locator("[data-arena-provider]").click();
  await site.locator("[data-arena-model]").click();

  assert.equal(await site.locator("[data-arena-frame]").getAttribute("src"), `/model-arena/submissions/${id}/index.html`);
  await site.frameLocator("[data-arena-frame]").locator("body[data-loaded=yes]").waitFor({ state: "attached" });
  assert.deepEqual(siteErrors, []);
  assert.deepEqual(requested, [
    `https://vmss.cn/model-arena/submissions/${id}/index.html`,
    `https://vmss.cn/model-arena/submissions/${id}/assets/app.js`,
  ]);
  await site.close();

  console.log(`Arena visual checks passed. Screenshots: ${output}`);
} finally {
  await browser.close();
  if (previewServer) {
    await previewServer.close();
  }
}
