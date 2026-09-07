import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import { dirname, extname, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

import { marked } from "marked";
import { parse as parseHtml } from "node-html-parser";
import sharp from "sharp";
import YAML from "yaml";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const publicRoot = resolve(repositoryRoot, "public");
const generatedRoot = resolve(publicRoot, "optimized", "images");
const generatedDataPath = resolve(repositoryRoot, "data", "generatedImages.json");
const contentRoot = resolve(repositoryRoot, "content", "posts");
const rasterExtensions = new Set([".avif", ".jpeg", ".jpg", ".png", ".tif", ".tiff", ".webp"]);
const references = new Map();

function register(reference, role) {
  if (typeof reference !== "string") return;
  const value = reference.trim();
  if (!value.startsWith("/") || value.startsWith("//")) return;
  if (!references.has(value)) references.set(value, new Set());
  references.get(value).add(role);
}

function splitFrontMatter(markdown) {
  const match = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  return match ? { metadata: YAML.parse(match[1]) || {}, body: markdown.slice(match[0].length) } : { metadata: {}, body: markdown };
}

async function listFiles(directory, extension) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const filePath = resolve(directory, entry.name);
    if (entry.isDirectory()) files.push(...await listFiles(filePath, extension));
    else if (entry.name.toLowerCase().endsWith(extension)) files.push(filePath);
  }
  return files;
}

function collectMarkdownImages(body) {
  const tokens = marked.lexer(body);
  marked.walkTokens(tokens, (token) => {
    if (token.type === "image") register(token.href, "content");
    if (token.type !== "html") return;
    for (const image of parseHtml(token.raw).querySelectorAll("img")) register(image.getAttribute("src"), "content");
  });
}

function resolvePublicImage(reference) {
  const pathname = reference.split(/[?#]/, 1)[0];
  let decoded;
  try { decoded = decodeURIComponent(pathname); } catch { decoded = pathname; }
  const absolutePath = resolve(publicRoot, decoded.replace(/^\/+/, ""));
  if (absolutePath !== publicRoot && !absolutePath.startsWith(`${publicRoot}${sep}`)) return null;
  if (!rasterExtensions.has(extname(absolutePath).toLowerCase()) || !existsSync(absolutePath)) return null;
  return absolutePath;
}

const config = YAML.parse(await readFile(resolve(repositoryRoot, "hugo.yaml"), "utf8"));
for (const source of config?.params?.wallpapers?.desktop || []) register(source, "desktopBackdrop");
for (const source of config?.params?.wallpapers?.mobile || []) register(source, "mobileBackdrop");
for (const source of config?.params?.covers?.desktop || []) {
  register(source, "card");
  register(source, "desktopBackdrop");
}
for (const source of config?.params?.covers?.mobile || []) {
  register(source, "card");
  register(source, "mobileBackdrop");
}

for (const markdownPath of await listFiles(contentRoot, ".md")) {
  const markdown = await readFile(markdownPath, "utf8");
  const { metadata, body } = splitFrontMatter(markdown);
  if (metadata.image) {
    register(metadata.image, "card");
    register(metadata.image, "content");
  }
  try { collectMarkdownImages(body); }
  catch (error) { console.warn(`Could not inspect images in ${relative(repositoryRoot, markdownPath)}: ${error.message}`); }
}

const sourceGroups = new Map();
for (const [reference, roles] of references) {
  const sourcePath = resolvePublicImage(reference);
  if (!sourcePath) continue;
  if (!sourceGroups.has(sourcePath)) sourceGroups.set(sourcePath, { references: new Set(), roles: new Set() });
  const group = sourceGroups.get(sourcePath);
  group.references.add(reference);
  roles.forEach((role) => group.roles.add(role));
}

await rm(generatedRoot, { recursive: true, force: true });
await mkdir(generatedRoot, { recursive: true });
await mkdir(dirname(generatedDataPath), { recursive: true });

const imageMap = {};
let sourceBytes = 0;
let generatedBytes = 0;
let generatedFiles = 0;
const groups = [...sourceGroups.entries()];
let cursor = 0;

const variants = {
  card: { width: 720, height: 405, fit: "cover", position: "centre", quality: 68 },
  content: { width: 1280, height: 1280, fit: "inside", position: "centre", quality: 76 },
  desktopBackdrop: { width: 1600, height: 900, fit: "cover", position: "centre", quality: 60 },
  mobileBackdrop: { width: 900, height: 1600, fit: "cover", position: "centre", quality: 60 },
};

async function createVariant(sourceBuffer, role) {
  const options = variants[role];
  const digest = createHash("sha256").update(`responsive-image-v1:${role}:${JSON.stringify(options)}:`).update(sourceBuffer).digest("hex").slice(0, 20);
  const filename = `${digest}-${role}.webp`;
  const outputPath = resolve(generatedRoot, filename);
  await sharp(sourceBuffer, { animated: false, limitInputPixels: false })
    .rotate()
    .resize({ width: options.width, height: options.height, fit: options.fit, position: options.position, withoutEnlargement: true })
    .webp({ quality: options.quality, effort: 5, smartSubsample: true })
    .toFile(outputPath);
  generatedBytes += (await stat(outputPath)).size;
  generatedFiles += 1;
  return `/optimized/images/${filename}`;
}

async function processGroup() {
  while (cursor < groups.length) {
    const [sourcePath, group] = groups[cursor++];
    const sourceBuffer = await readFile(sourcePath);
    sourceBytes += sourceBuffer.length;
    const output = {};
    try {
      for (const role of group.roles) output[role] = await createVariant(sourceBuffer, role);
    } catch (error) {
      console.warn(`Could not optimize ${relative(publicRoot, sourcePath)}: ${error.message}`);
    }
    for (const reference of group.references) imageMap[reference] = output;
  }
}

await Promise.all(Array.from({ length: Math.min(4, groups.length) }, () => processGroup()));

const sortedImages = Object.fromEntries(Object.entries(imageMap).sort(([left], [right]) => left.localeCompare(right)));
const randomCovers = Object.fromEntries(["desktop", "mobile"].map((kind) => [
  kind,
  (config?.params?.covers?.[kind] || []).map((source) => sortedImages[source]?.card || source),
]));
await writeFile(generatedDataPath, `${JSON.stringify({ images: sortedImages, randomCovers }, null, 2)}\n`);

console.log(`Generated ${generatedFiles} responsive images from ${groups.length} sources (${Math.round(sourceBytes / 1024)} KiB source -> ${Math.round(generatedBytes / 1024)} KiB derivatives).`);
