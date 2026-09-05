import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readFile, readdir } from "node:fs/promises";
import { dirname, extname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outputRoot = join(repositoryRoot, "dist");
const requiredFiles = [
  "index.html",
  "404.html",
  "robots.txt",
  "sitemap.xml",
  "rss.xml",
  "atom.xml",
  "api/allPostMeta.json",
  "api/calendar-data.json",
  "pagefind/pagefind.js",
  "pagefind/pagefind-entry.json",
  "icons/search.svg",
  "assets/font/ZenMaruGothic-Medium.woff2",
  "assets/font/loli.woff2",
  ...["about", "albums", "albums/AcgExample", "anime", "archive", "atom", "devices", "diary", "friends", "projects", "rss", "skills", "timeline"].map((route) => `${route}/index.html`),
];

for (const relative of requiredFiles) {
  assert.ok(existsSync(join(outputRoot, relative)), `Missing build output: dist/${relative}`);
}

const posts = JSON.parse(await readFile(join(outputRoot, "api", "allPostMeta.json"), "utf8"));
const calendar = JSON.parse(await readFile(join(outputRoot, "api", "calendar-data.json"), "utf8"));
assert.ok(posts.length > 0, "No published posts were generated");
assert.equal(calendar.length, posts.length, "Post and calendar APIs disagree");

for (const post of posts) {
  const pathname = decodeURIComponent(new URL(post.url, "https://vmss.cn").pathname).replace(/^\/+/, "");
  const outputPath = pathname.endsWith("/") ? join(pathname, "index.html") : pathname;
  const target = resolve(outputRoot, outputPath);
  const targetFromRoot = relative(outputRoot, target);
  assert.ok(
    targetFromRoot !== ".." && !targetFromRoot.startsWith(`..${sep}`) && !isAbsolute(targetFromRoot),
    `Unsafe post URL in manifest: ${post.url}`,
  );
  assert.ok(existsSync(target), `Missing rendered post: ${post.url}`);
  assert.match(await readFile(target, "utf8"), /id="post-container"/, `Post shell is missing: ${post.url}`);
}

const home = await readFile(join(outputRoot, "index.html"), "utf8");
assert.equal((home.match(/hugo-post-card/g) || []).length, Math.min(8, posts.length), "Home pagination is incorrect");
assert.equal(home.includes("{{"), false, "Unrendered Hugo template found on home page");
assert.match(home, /Mumuemhaha Blog - 木哈文轩/);
assert.match(home, /data-hugo-pagefind-preload/, "Pagefind is not preloaded on the home page");

const contentFiles = await listFiles(join(repositoryRoot, "content", "posts"));
const misplaced = contentFiles.filter((path) => [".html", ".htm", ".js", ".zip"].includes(extname(path).toLowerCase()));
assert.deepEqual(misplaced, [], `Web page assets must not be stored with Markdown posts: ${misplaced.join(", ")}`);
for (const markdownPath of contentFiles.filter((path) => extname(path).toLowerCase() === ".md")) {
  assert.equal(
    (await readFile(markdownPath, "utf8")).includes("image.vmss.cn"),
    false,
    `Remote image.vmss.cn reference remains in ${markdownPath}`,
  );
}
for (const directory of ["html", "zip"]) {
  assert.ok(existsSync(join(repositoryRoot, "public", "web-pages", "editor", directory)), `Missing isolated web page directory: ${directory}`);
}

console.log(`Validated Hugo output: ${posts.length} posts, search index, feeds, APIs, and specialty pages.`);

async function listFiles(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await listFiles(path));
    else files.push(path);
  }
  return files;
}
