import { createHash } from "node:crypto";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import YAML from "yaml";

const studioRoot = path.resolve(import.meta.dirname, "..");
const repositoryRoot = path.resolve(studioRoot, "..");
const postsRoot = path.join(repositoryRoot, "content", "posts");
const outputPath = path.join(studioRoot, "public", "post-index.json");

const files = (await readdir(postsRoot, { recursive: true, withFileTypes: true }))
  .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".md"))
  .map((entry) => path.join(entry.parentPath, entry.name));

const posts = await Promise.all(
  files.map(async (filePath) => {
    const content = await readFile(filePath, "utf8");
    const relativePath = path.relative(repositoryRoot, filePath).replaceAll("\\", "/");
    const match = content.match(/^---\s*\r?\n([\s\S]*?)\r?\n---/);
    let data = {};
    if (match) {
      try {
        data = YAML.parse(match[1]) || {};
      } catch {
        data = {};
      }
    }
    const bytes = Buffer.from(content, "utf8");
    const sha = createHash("sha1")
      .update(`blob ${bytes.byteLength}\0`)
      .update(bytes)
      .digest("hex");

    return {
      path: relativePath,
      sha,
      title: typeof data.title === "string" ? data.title : path.basename(filePath, ".md"),
      published: normalizeDate(data.published),
      updated: normalizeDate(data.updated) || undefined,
      description: typeof data.description === "string" ? data.description : "",
      image: typeof data.image === "string" ? data.image : "",
      tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
      category: typeof data.category === "string" ? data.category : "",
      draft: data.draft === true,
      pinned: data.pinned === true,
      priority: typeof data.priority === "number" ? data.priority : undefined,
      lang: typeof data.lang === "string" ? data.lang : "zh-CN",
      comment: data.comment !== false,
      encrypted: data.encrypted === true,
      permalink: typeof data.permalink === "string" ? data.permalink : undefined,
    };
  }),
);

posts.sort((a, b) => {
  if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
  if (a.pinned && b.pinned) {
    const priorityA = a.priority ?? Number.MAX_SAFE_INTEGER;
    const priorityB = b.priority ?? Number.MAX_SAFE_INTEGER;
    if (priorityA !== priorityB) return priorityA - priorityB;
  }
  return b.published.localeCompare(a.published);
});

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify({ posts })}\n`, "utf8");
console.log(`Generated Studio index for ${posts.length} posts.`);

function normalizeDate(value) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  return typeof value === "string" ? value.slice(0, 10) : "";
}
