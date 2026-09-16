import { readFile, readdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseDocument } from "yaml";
import { classifyRepository } from "./github-trending-tags.mjs";
import { run as updateIndex } from "./update-github-trending-periods.mjs";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const dailyRoot = join(root, "data", "github_trending");
const periodRoot = join(root, "data", "github_trending_periods");
const contentRoot = join(root, "content", "github-trending");

async function updateSnapshots(directory) {
  const files = (await readdir(directory)).filter((name) => name.endsWith(".json"));
  const snapshots = new Map();
  for (const name of files) {
    const path = join(directory, name);
    const snapshot = JSON.parse(await readFile(path, "utf8"));
    snapshot.candidates.forEach((item) => { item.tags = classifyRepository(item); });
    snapshots.set(name.slice(0, -5), snapshot);
    await writeFile(path, JSON.stringify(snapshot, null, 2) + "\n");
  }
  return snapshots;
}

async function updateArticles(directory, daily, periods) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) { await updateArticles(path, daily, periods); continue; }
    if (!entry.name.endsWith(".md") || entry.name === "_index.md") continue;
    const content = await readFile(path, "utf8");
    if (!content.startsWith("---\n")) continue;
    const end = content.indexOf("\n---\n", 4);
    if (end < 0) continue;
    const document = parseDocument(content.slice(4, end));
    if (document.errors.length) throw new Error(`Invalid frontmatter: ${path}`);
    const repo = document.get("repository");
    const snapshot = !document.get("period_key")
      ? daily.get(document.get("date")?.slice(0, 10))
      : periods.get(document.get("period_key"));
    const tags = snapshot?.candidates.find((item) => item.repo.toLowerCase() === repo?.toLowerCase())?.tags;
    if (!tags) throw new Error(`No matching snapshot entry: ${path}`);
    document.set("tags", tags);
    await writeFile(path, `---\n${document.toString({ lineWidth: 0 })}---${content.slice(end + 4)}`);
  }
}

const daily = await updateSnapshots(dailyRoot);
const periods = await updateSnapshots(periodRoot);
await updateArticles(contentRoot, daily, periods);
await updateIndex({ indexOnly: true });
console.log(`Tagged ${daily.size} daily snapshots and ${periods.size} period snapshots`);
