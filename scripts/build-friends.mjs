import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import {
  normalizeFriendName,
  normalizeFriendUrl,
  parseAndValidateFriendEntry,
} from "./lib/friends-validator.mjs";

const root = process.cwd();
const entriesDirectory = join(root, "friends", "entries");
const outputPath = join(root, "data", "friends.json");
const files = (await readdir(entriesDirectory)).filter((name) => name.endsWith(".json")).sort();

if (files.length === 0) throw new Error("friends/entries must contain at least one JSON file");

const seenUrls = new Set();
const seenNames = new Set();
const items = [];

for (const file of files) {
  const source = await readFile(join(entriesDirectory, file), "utf8");
  const result = parseAndValidateFriendEntry(source, file, {
    strictSchema: true,
    rejectPlaceholders: false,
    rejectSelfHost: true,
    existingUrls: seenUrls,
    existingNames: seenNames,
  });
  if (!result.ok || !result.entry) {
    throw new Error(`${file}: ${result.errors.join("; ")}`);
  }
  seenUrls.add(normalizeFriendUrl(result.entry.url));
  seenNames.add(normalizeFriendName(result.entry.name));
  items.push(result.entry);
}

items.sort((left, right) => left.name.localeCompare(right.name, "zh-CN"));
const output = `${JSON.stringify({ items }, null, 2)}\n`;
await mkdir(join(root, "data"), { recursive: true });
let existing = "";
try { existing = await readFile(outputPath, "utf8"); } catch {}
if (existing !== output) await writeFile(outputPath, output, "utf8");
console.log(`Validated and generated ${items.length} friend links.`);
