import { readFile, readdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseDocument } from "yaml";
import { classifyRepositories, categories, maxTags, version } from "./github-trending-tags.mjs";
import { run as updateIndex } from "./update-github-trending-periods.mjs";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const dailyRoot = join(root, "data", "github_trending");
const periodRoot = join(root, "data", "github_trending_periods");
const contentRoot = join(root, "content", "github-trending");

const validTags = (tags) => Array.isArray(tags) && tags.length > 0 && tags.length <= maxTags
  && new Set(tags).size === tags.length && tags.every((tag) => categories.includes(tag))
  && (tags.length === 1 || !tags.includes("其他"));

async function updateDailySnapshots(apiKey) {
  const files = (await readdir(dailyRoot)).filter((name) => /^\d{4}-\d{2}-\d{2}\.json$/.test(name)).sort();
  const snapshots = new Map();
  for (const name of files) {
    const path = join(dailyRoot, name);
    const snapshot = JSON.parse(await readFile(path, "utf8"));
    if (snapshot.tagVersion !== version || snapshot.candidates.some((item) => !validTags(item.tags))) {
      snapshot.candidates = await classifyRepositories(snapshot.candidates, { apiKey });
      snapshot.tagVersion = version;
      await writeFile(path, JSON.stringify(snapshot, null, 2) + "\n");
    }
    snapshots.set(name.slice(0, -5), snapshot);
  }
  return snapshots;
}

async function updatePeriodSnapshots(daily) {
  const files = (await readdir(periodRoot)).filter((name) => name.endsWith(".json"));
  const periods = new Map();
  for (const name of files) {
    const path = join(periodRoot, name);
    const snapshot = JSON.parse(await readFile(path, "utf8"));
    if (snapshot.tagVersion !== version || snapshot.candidates.some((item) => !validTags(item.tags))) {
      for (const item of snapshot.candidates) {
        const source = daily.get(item.latestSeen)?.candidates.find((repo) => repo.repo.toLowerCase() === item.repo.toLowerCase());
        if (!source) throw new Error(`No daily AI tags for ${item.repo} on ${item.latestSeen}`);
        item.tags = source.tags;
      }
      snapshot.tagVersion = version;
      await writeFile(path, JSON.stringify(snapshot, null, 2) + "\n");
    }
    periods.set(name.slice(0, -5), snapshot);
  }
  return periods;
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
    if (JSON.stringify(document.get("tags")) !== JSON.stringify(tags)) {
      document.set("tags", tags);
      await writeFile(path, `---\n${document.toString({ lineWidth: 0 })}---${content.slice(end + 4)}`);
    }
  }
}

const daily = await updateDailySnapshots(process.env.DEEPSEEK_API_KEY);
const periods = await updatePeriodSnapshots(daily);
await updateArticles(contentRoot, daily, periods);
await updateIndex({ indexOnly: true });
console.log(`AI tags: ${daily.size} daily snapshots and ${periods.size} period snapshots`);
