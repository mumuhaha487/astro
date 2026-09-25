import { cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "node-html-parser";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outputRoot = join(repositoryRoot, "dist");
const manifestPath = join(outputRoot, "post-manifest.json");
const generatedImageDataPath = join(repositoryRoot, "data", "generatedImages.json");
const friendsDataPath = join(repositoryRoot, "data", "friends.json");
const generatedImageData = existsSync(generatedImageDataPath)
  ? JSON.parse(await readFile(generatedImageDataPath, "utf8"))
  : {};
const generatedImages = generatedImageData.images || {};

if (!existsSync(manifestPath)) {
  throw new Error("Hugo did not produce dist/post-manifest.json");
}

const apiRoot = join(outputRoot, "api");
await mkdir(apiRoot, { recursive: true });

const randomCovers = generatedImageData.randomCovers?.desktop || [];
const localeManifests = [
  { locale: "zh", path: manifestPath, required: true },
  { locale: "en", path: join(outputRoot, "en", "post-manifest.json") },
  { locale: "ja", path: join(outputRoot, "ja", "post-manifest.json") },
];
let defaultPosts = [];
for (const manifest of localeManifests) {
  if (!existsSync(manifest.path)) {
    if (manifest.required) throw new Error("Hugo did not produce dist/post-manifest.json");
    continue;
  }
  const posts = JSON.parse(await readFile(manifest.path, "utf8"));
  const safePosts = posts.map((post, index) => ({
    id: post.id,
    url: post.url,
    title: post.title,
    description: post.description,
    published: post.published,
    date: post.date,
    category: post.category,
    tags: Array.isArray(post.tags) ? post.tags : [],
    image: generatedImages[post.image]?.card || post.image || randomCovers[index % Math.max(1, randomCovers.length)] || "",
    pinned: Boolean(post.pinned),
    readingTime: Number(post.readingTime) || 1,
    wordCount: Number(post.wordCount) || 0,
    password: Boolean(post.password),
  }));
  await writeFile(join(apiRoot, `allPostMeta.${manifest.locale}.json`), JSON.stringify(safePosts));
  await writeFile(join(apiRoot, `calendar-data.${manifest.locale}.json`), JSON.stringify(posts.map((post) => ({
    id: post.id,
    title: post.title,
    date: post.date,
  }))));
  if (manifest.locale === "zh") {
    defaultPosts = safePosts;
    await writeFile(join(apiRoot, "allPostMeta.json"), JSON.stringify(safePosts));
    await writeFile(join(apiRoot, "calendar-data.json"), JSON.stringify(posts.map((post) => ({
      id: post.id,
      title: post.title,
      date: post.date,
    }))));
  }
  await rm(manifest.path);
}
if (existsSync(friendsDataPath)) {
  const friends = JSON.parse(await readFile(friendsDataPath, "utf8"));
  await writeFile(join(apiRoot, "friends.json"), JSON.stringify({ items: Array.isArray(friends.items) ? friends.items : [] }));
}

for (const [sourceName, targetName] of [
  ["index.xml", "rss.xml"],
  ["index.xml", "atom.xml"],
  ["sitemap.xml", "sitemap-0.xml"],
  ["sitemap.xml", "sitemap-index.xml"],
]) {
  const source = join(outputRoot, sourceName);
  if (existsSync(source)) await cp(source, join(outputRoot, targetName), { force: true });
}

for (let page = 2; ; page += 1) {
  const source = join(outputRoot, "page", String(page), "index.html");
  if (!existsSync(source)) break;
  const target = join(outputRoot, String(page), "index.html");
  await mkdir(dirname(target), { recursive: true });
  await cp(source, target, { force: true });
}

for (const htmlPath of await listHtmlFiles(outputRoot)) {
  let html = await readFile(htmlPath, "utf8");
  let changed = false;
  if (html.includes("markdown-content")) {
    const document = parse(html);
    for (const image of document.querySelectorAll(".markdown-content img")) {
      const source = image.getAttribute("src");
      const optimized = generatedImages[source]?.content;
      if (optimized) image.setAttribute("src", optimized);
      image.setAttribute("loading", "lazy");
      image.setAttribute("decoding", "async");
      changed = true;
    }
    if (changed) html = document.toString();
  }
  if (changed) await writeFile(htmlPath, html);
}

// Uploaded works are published verbatim, including relative assets from ZIP archives.
await cp(
  join(repositoryRoot, "arena-submissions"),
  join(outputRoot, "model-arena", "submissions"),
  { recursive: true },
);

console.log(`Finalized Hugo output for ${defaultPosts.length} published posts.`);

async function listHtmlFiles(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await listHtmlFiles(path));
    else if (entry.name.endsWith(".html")) files.push(path);
  }
  return files;
}
