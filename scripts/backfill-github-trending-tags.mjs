import { readFile, readdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseDocument } from "yaml";
import { classifyRepositories, categories, maxTags, version } from "./github-trending-tags.mjs";
import { resolveDeepSeekModel } from "./deepseek-client.mjs";
import { run as updateIndex } from "./update-github-trending-periods.mjs";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const dailyRoot = join(root, "data", "github_trending");
const periodRoot = join(root, "data", "github_trending_periods");
const contentRoot = join(root, "content", "github-trending");

export const validTags = (tags) => Array.isArray(tags) && tags.length > 0 && tags.length <= maxTags
  && new Set(tags).size === tags.length && tags.every((tag) => categories.includes(tag))
  && (tags.length === 1 || !tags.includes("其他"));

export async function updateDailySnapshots(apiKey, { model, baseUrl, root: customRoot = dailyRoot } = {}) {
  const files = (await readdir(customRoot)).filter((name) => /^\d{4}-\d{2}-\d{2}\.json$/.test(name)).sort();
  const snapshots = new Map();
  let resolvedModel = model;
  for (const name of files) {
    const path = join(customRoot, name);
    const snapshot = JSON.parse(await readFile(path, "utf8"));
    if (snapshot.tagVersion !== version || snapshot.candidates.some((item) => !validTags(item.tags))) {
      if (!resolvedModel) {
        resolvedModel = await resolveDeepSeekModel(apiKey, { baseUrl });
      }
      snapshot.candidates = await classifyRepositories(snapshot.candidates, { apiKey, model: resolvedModel, baseUrl });
      snapshot.tagVersion = version;
      await writeFile(path, JSON.stringify(snapshot, null, 2) + "\n");
    }
    snapshots.set(name.slice(0, -5), snapshot);
  }
  return snapshots;
}

export async function updatePeriodSnapshots(daily, { root: customRoot = periodRoot } = {}) {
  const files = (await readdir(customRoot).catch(() => [])).filter((name) => name.endsWith(".json"));
  const periods = new Map();
  for (const name of files) {
    const path = join(customRoot, name);
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

export async function updateArticles(directory = contentRoot, daily, periods) {
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

export async function run({
  apiKey = process.env.DEEPSEEK_API_KEY,
  model = process.env.DEEPSEEK_MODEL,
  baseUrl = process.env.DEEPSEEK_BASE_URL,
} = {}) {
  const daily = await updateDailySnapshots(apiKey, { model, baseUrl });
  const periods = await updatePeriodSnapshots(daily);
  await updateArticles(contentRoot, daily, periods);
  await updateIndex({ indexOnly: true });
  console.log(`AI tags: ${daily.size} daily snapshots and ${periods.size} period snapshots`);
  return { daily, periods };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  run().catch((error) => { console.error(error.message); process.exitCode = 1; });
}
