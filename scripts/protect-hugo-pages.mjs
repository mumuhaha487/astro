import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { parse, parseFragment, serialize } from "parse5";

import { encryptHtml } from "./lib/content-protection.mjs";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outputRoot = join(repositoryRoot, "dist");
const manifestPath = join(outputRoot, "post-manifest.json");
if (!existsSync(manifestPath)) throw new Error("Hugo did not produce dist/post-manifest.json");

const posts = JSON.parse(await readFile(manifestPath, "utf8"));
let protectedCount = 0;
for (const post of posts) {
  if (!post.password || !post.encryptionPassword) continue;
  const pagePath = resolveOutputPath(post.url);
  if (!existsSync(pagePath)) throw new Error(`Encrypted page output is missing: ${post.url}`);
  const document = parse(await readFile(pagePath, "utf8"));
  const content = findElement(document, (node) => getAttribute(node, "id") === "hugo-article-content");
  if (!content) throw new Error(`Encrypted page has no article content container: ${post.url}`);
  const plaintext = serialize(content);
  const payload = await encryptHtml(plaintext, String(post.encryptionPassword));
  const hint = escapeHtml(String(post.passwordHint || ""));
  const payloadJson = JSON.stringify(payload).replaceAll("<", "\\u003c");
  const fragment = parseFragment(`
    <div class="hugo-password-protection" data-hugo-encrypted-panel data-pagefind-ignore>
      <div class="hugo-password-container card-base">
        <div class="hugo-password-lock" aria-hidden="true">&#128274;</div>
        <h2>此内容受密码保护</h2>
        <p class="hugo-password-description">请输入密码以查看受保护的内容</p>
        ${hint ? `<p class="hugo-password-hint">提示：${hint}</p>` : ""}
        <form class="hugo-password-form">
          <input class="hugo-password-input" type="password" autocomplete="current-password" placeholder="请输入密码" aria-label="文章密码" required>
          <button class="hugo-password-submit" type="submit">解锁</button>
        </form>
        <p class="hugo-password-error" role="alert" aria-live="polite"></p>
      </div>
    </div>
    <script type="application/json" data-hugo-encrypted-payload>${payloadJson}</script>
  `);
  content.childNodes = fragment.childNodes;
  for (const child of content.childNodes) child.parentNode = content;
  const output = serialize(document);
  if (output.includes(plaintext)) throw new Error(`Plaintext survived encryption for ${post.url}`);
  await writeFile(pagePath, output);
  for (const feed of [join(outputRoot, "index.xml"), join(outputRoot, "posts", "index.xml")]) {
    if (existsSync(feed) && (await readFile(feed, "utf8")).includes(post.url)) {
      throw new Error(`Encrypted page leaked into feed: ${post.url}`);
    }
  }
  protectedCount += 1;
}

console.log(`Protected ${protectedCount} encrypted Hugo page${protectedCount === 1 ? "" : "s"}.`);

function resolveOutputPath(url) {
  const pathname = decodeURIComponent(new URL(url, "https://vmss.cn").pathname).replace(/^\/+/, "");
  const relative = pathname.endsWith("/") ? join(pathname, "index.html") : pathname;
  const target = resolve(outputRoot, relative);
  if (!target.startsWith(`${outputRoot}\\`) && target !== outputRoot) throw new Error(`Unsafe page URL: ${url}`);
  return target;
}

function findElement(node, predicate) {
  if (predicate(node)) return node;
  for (const child of node.childNodes || []) {
    const match = findElement(child, predicate);
    if (match) return match;
  }
  return null;
}

function getAttribute(node, name) {
  return node.attrs?.find((attribute) => attribute.name === name)?.value;
}

function escapeHtml(value) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}
