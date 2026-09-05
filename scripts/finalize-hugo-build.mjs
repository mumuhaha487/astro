import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outputRoot = join(repositoryRoot, "dist");
const manifestPath = join(outputRoot, "post-manifest.json");

if (!existsSync(manifestPath)) {
  throw new Error("Hugo did not produce dist/post-manifest.json");
}

const posts = JSON.parse(await readFile(manifestPath, "utf8"));
const apiRoot = join(outputRoot, "api");
await mkdir(apiRoot, { recursive: true });

await writeFile(join(apiRoot, "allPostMeta.json"), JSON.stringify(posts.map((post) => ({
  id: post.id,
  url: post.url,
  title: post.title,
  description: post.description,
  published: post.published,
  category: post.category,
  password: post.password,
}))));
await writeFile(join(apiRoot, "calendar-data.json"), JSON.stringify(posts.map((post) => ({
  id: post.id,
  title: post.title,
  date: post.date,
}))));

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

await rm(manifestPath);
console.log(`Finalized Hugo output for ${posts.length} published posts.`);
