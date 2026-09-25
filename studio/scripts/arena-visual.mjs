import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { mkdir, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { zipSync } from "fflate";
import { chromium } from "playwright-core";

const executablePath = [
  process.env.PLAYWRIGHT_CHROME_PATH,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
].find((path) => path && existsSync(path));
assert(executablePath, "Chrome not found");

const catalog = { tracks: [
  { id: "frontend", name: "前端", projects: [{ id: "project", name: "测试项目", prompt: "画一只鹈鹕", providers: [{ id: "provider", name: "GPT", models: [{ id: "model", name: "GPT-6" }] }] }] },
  { id: "backend", name: "后端", projects: [] },
] };
const sha = "a".repeat(40);
const output = join(tmpdir(), "astro-arena-visual");
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ executablePath, headless: true });

try {
  for (const viewport of [{ width: 1280, height: 800 }, { width: 390, height: 844 }]) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    const errors = [];
    const uploads = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.route("**/api/**", async (route) => {
      const { pathname } = new URL(route.request().url());
      const reply = (value) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(value) });
      if (pathname === "/api/session") return reply({ authenticated: true, github: { connected: true, branch: "main" }, translation: { configured: false } });
      if (pathname === "/api/posts") return reply({ posts: [] });
      if (pathname === "/api/drafts") return reply({ drafts: [] });
      if (pathname === "/api/model-arena") return reply({ catalog, sha });
      if (pathname === "/api/model-arena/submissions") {
        uploads.push(route.request().postData() || "");
        return reply({ catalog, sha });
      }
      return reply({});
    });
    await page.goto(process.env.STUDIO_VISUAL_URL || "http://127.0.0.1:4174", { waitUntil: "networkidle" });
    await page.getByTitle("文章列表").click();
    await page.getByTitle("管理大模型竞技场").click();
    const dialog = page.getByRole("dialog", { name: "大模型竞技场管理" });
    await dialog.getByRole("navigation", { name: "竞技场目录" }).getByText("测试项目").last().click();
    await dialog.getByRole("navigation", { name: "模型厂商" }).getByText("GPT").click();
    await dialog.getByRole("navigation", { name: "具体模型" }).getByText("GPT-6").click();
    assert(await dialog.getByTitle("重命名模型").isVisible());
    assert(await dialog.getByTitle("删除模型").isVisible());
    await dialog.getByRole("button", { name: "粘贴 HTML" }).click();
    assert(await dialog.getByRole("textbox", { name: "HTML 源码" }).isVisible());
    await dialog.getByRole("button", { name: "上传文件" }).click();
    const zip = zipSync({
      "example/dist/index.html": new TextEncoder().encode('<!doctype html><html><script src="assets/app.js"></script></html>'),
      "example/dist/assets/app.js": new TextEncoder().encode("document.body.dataset.ready='yes'"),
    });
    await dialog.locator('input[type="file"]').setInputFiles({ name: "example.zip", mimeType: "application/zip", buffer: Buffer.from(zip) });
    await dialog.getByRole("button", { name: "发布作品" }).click();
    await dialog.getByText("作品已提交到仓库").waitFor();
    assert.match(uploads[0], /index\.html/);
    assert.match(uploads[0], /assets\/app\.js/);
    assert(!uploads[0].includes("example/dist/"));
    const overflow = await dialog.evaluate((element) => element.scrollWidth > element.clientWidth + 1);
    assert(!overflow, `arena modal overflows at ${viewport.width}px`);
    assert.deepEqual(errors, []);
    await page.screenshot({ path: join(output, `arena-${viewport.width}.png`), fullPage: true });
    await context.close();
  }
  const site = await browser.newPage();
  const siteErrors = [];
  site.on("pageerror", (error) => siteErrors.push(error.message));
  const id = "123e4567-e89b-42d3-a456-426614174000";
  const requested = [];
  await site.route("https://md.vmss.cn/model-arena/submissions/**", (route) => {
    requested.push(route.request().url());
    const asset = route.request().url().endsWith("app.js");
    return route.fulfill({ contentType: asset ? "text/javascript" : "text/html", body: asset
      ? "document.body.dataset.loaded = 'yes'"
      : '<!doctype html><html><body><script src="assets/app.js"></script></body></html>' });
  });
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
  await site.frameLocator("[data-arena-frame]").locator("body[data-loaded=yes]").waitFor({ state: "attached" });
  assert.deepEqual(siteErrors, []);
  assert.deepEqual(requested, [
    `https://md.vmss.cn/model-arena/submissions/${id}/index.html`,
    `https://md.vmss.cn/model-arena/submissions/${id}/assets/app.js`,
  ]);
  await site.close();
  console.log(`Arena visual checks passed. Screenshots: ${output}`);
} finally {
  await browser.close();
}
