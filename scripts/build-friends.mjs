import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

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
  let entry;
  try {
    entry = JSON.parse(source);
  } catch (error) {
    throw new Error(`${file}: invalid JSON (${error.message})`);
  }
  if (!entry || Array.isArray(entry) || typeof entry !== "object") throw new Error(`${file}: entry must be an object`);
  const name = requiredText(entry.name, "name", file, 1, 48);
  const url = requiredUrl(entry.url, "url", file);
  const avatar = entry.avatar == null || entry.avatar === "" ? null : requiredUrl(entry.avatar, "avatar", file);
  const description = optionalText(entry.description, "description", file, 120);
  const tags = Array.isArray(entry.tags)
    ? entry.tags.map((tag, index) => requiredText(tag, `tags[${index}]`, file, 1, 24)).slice(0, 6)
    : [];
  const normalizedUrl = new URL(url).href.replace(/\/$/, "").toLowerCase();
  const normalizedName = name.toLocaleLowerCase();
  if (seenUrls.has(normalizedUrl)) throw new Error(`${file}: duplicate friend URL ${url}`);
  if (seenNames.has(normalizedName)) throw new Error(`${file}: duplicate friend name ${name}`);
  seenUrls.add(normalizedUrl);
  seenNames.add(normalizedName);
  items.push({ name, url, avatar, description, tags });
}

items.sort((left, right) => left.name.localeCompare(right.name, "zh-CN"));
const output = `${JSON.stringify({ items }, null, 2)}\n`;
await mkdir(join(root, "data"), { recursive: true });
let existing = "";
try { existing = await readFile(outputPath, "utf8"); } catch {}
if (existing !== output) await writeFile(outputPath, output, "utf8");
console.log(`Validated and generated ${items.length} friend links.`);

function requiredText(value, field, file, minimum, maximum) {
  if (typeof value !== "string") throw new Error(`${file}: ${field} must be a string`);
  const normalized = value.trim();
  if (normalized.length < minimum || normalized.length > maximum) {
    throw new Error(`${file}: ${field} must contain ${minimum}-${maximum} characters`);
  }
  return normalized;
}

function optionalText(value, field, file, maximum) {
  if (value == null || value === "") return "";
  return requiredText(value, field, file, 1, maximum);
}

function requiredUrl(value, field, file) {
  const normalized = requiredText(value, field, file, 8, 500);
  let url;
  try { url = new URL(normalized); } catch { throw new Error(`${file}: ${field} must be a valid URL`); }
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error(`${file}: ${field} must use http or https`);
  return url.href;
}
