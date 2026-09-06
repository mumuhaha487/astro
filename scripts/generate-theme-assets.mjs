import { mkdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

const root = process.cwd();
const outputDirectory = join(root, "public", "tool-icons");
const coverDirectory = join(root, "public", "tool-covers");
await mkdir(outputDirectory, { recursive: true });
await mkdir(coverDirectory, { recursive: true });

const material = JSON.parse(await readFile(join(root, "node_modules", "@iconify-json", "material-symbols", "icons.json"), "utf8"));
const simple = JSON.parse(await readFile(join(root, "node_modules", "@iconify-json", "simple-icons", "icons.json"), "utf8"));
const icons = [
  ["json", simple, "json"],
  ["base64", material, "password-rounded"],
  ["text-stats", material, "text-ad-rounded"],
  ["timestamp", material, "calendar-clock-rounded"],
  ["uuid", material, "fingerprint"],
  ["docker", simple, "docker"],
  ["beast", material, "translate-rounded"],
];

for (const [file, collection, name] of icons) {
  const icon = collection.icons[name];
  if (!icon) throw new Error(`Icon ${name} is unavailable`);
  const width = icon.width || collection.width || 24;
  const height = icon.height || collection.height || 24;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 ${width} ${height}"><rect width="${width}" height="${height}" rx="5" fill="#353737"/><g color="#e6a185">${icon.body}</g></svg>`;
  await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(join(outputDirectory, `${file}.png`));
}

const grainSize = 128;
const grain = Buffer.alloc(grainSize * grainSize);
let seed = 0x4d554d55;
for (let index = 0; index < grain.length; index += 1) {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  grain[index] = 72 + ((seed >>> 24) % 112);
}
await sharp(grain, { raw: { width: grainSize, height: grainSize, channels: 1 } })
  .png({ compressionLevel: 9 })
  .toFile(join(root, "public", "images", "grain.png"));

for (let index = 1; index <= 6; index += 1) {
  await sharp(join(root, "public", "assets", "desktop-banner", `${index}.webp`))
    .resize(640, 360, { fit: "cover", position: "attention" })
    .webp({ quality: 68, effort: 6 })
    .toFile(join(coverDirectory, `${index}.webp`));
}

console.log(`Generated ${icons.length} local tool icons, 6 wallpaper thumbnails, and the grain texture.`);
