import { cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "node-html-parser";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outputRoot = join(repositoryRoot, "dist");
const siteOrigin = "https://vmss.cn";
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
  ["sitemap.xml", "sitemap-index.xml"],
]) {
  const source = join(outputRoot, sourceName);
  if (existsSync(source)) await cp(source, join(outputRoot, targetName), { force: true });
}

// Build flat XML sitemap (sitemap-urls.xml & sitemap-0.xml) and plain-text urls.txt
// for Baidu Webmaster Platform, Google, and IndexNow.
const flatSitemapEntries = await collectFlatSitemapEntries(outputRoot);
const flatXml = renderFlatSitemapXml(flatSitemapEntries);
await writeFile(join(outputRoot, "sitemap-urls.xml"), flatXml, "utf8");
await writeFile(join(outputRoot, "sitemap-0.xml"), flatXml, "utf8");
await writeFile(join(outputRoot, "urls.txt"), `${flatSitemapEntries.map((item) => item.loc).join("\n")}\n`, "utf8");

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
  const relPath = relative(outputRoot, htmlPath).replaceAll("\\", "/");
  const pageMatch = relPath.match(/^(.*\/)?page\/(\d+)\/index\.html$/);
  const needsMarkdownPostProcess = html.includes("markdown-content");
  const hasPagination = html.includes("hugo-pagination");

  if (needsMarkdownPostProcess || pageMatch || hasPagination) {
    const document = parse(html);

    if (needsMarkdownPostProcess) {
      // Ensure strictly one <h1> (the article title) per page by demoting any legacy HTML <h1> in body to <h2>.
      const articleBody = document.querySelector("#hugo-article-content");
      if (articleBody) {
        for (const bodyH1 of articleBody.querySelectorAll("h1")) {
          bodyH1.rawTagName = "h2";
          changed = true;
        }
      }
      const heading = document.querySelector("h1")?.textContent?.trim() || "";
      let imageIndex = 0;
      for (const image of document.querySelectorAll(".markdown-content img")) {
        imageIndex += 1;
        const source = image.getAttribute("src");
        const optimized = generatedImages[source]?.content;
        if (optimized) image.setAttribute("src", optimized);
        image.setAttribute("loading", "lazy");
        image.setAttribute("decoding", "async");
        const currentAlt = (image.getAttribute("alt") || "").trim();
        if (!currentAlt && heading) {
          image.setAttribute("alt", `${heading} - 配图 ${imageIndex}`);
        }
        changed = true;
      }
    }

    if (hasPagination) {
      const headEl = document.querySelector("head");
      const prevHref = document.querySelector('.hugo-pagination a[rel="prev"]')?.getAttribute("href");
      const nextHref = document.querySelector('.hugo-pagination a[rel="next"]')?.getAttribute("href");
      if (headEl && (prevHref || nextHref)) {
        if (prevHref && !headEl.querySelector('link[rel="prev"]')) {
          headEl.insertAdjacentHTML("beforeend", `\n  <link rel="prev" href="${new URL(prevHref, siteOrigin).href}">`);
          changed = true;
        }
        if (nextHref && !headEl.querySelector('link[rel="next"]')) {
          headEl.insertAdjacentHTML("beforeend", `\n  <link rel="next" href="${new URL(nextHref, siteOrigin).href}">`);
          changed = true;
        }
      }
    }

    if (pageMatch) {
      const pageNum = Number(pageMatch[2]);
      const encodedDir = relPath
        .replace(/\/index\.html$/, "")
        .split("/")
        .map((segment) => encodeURIComponent(segment))
        .join("/");
      const selfCanonical = `${siteOrigin}/${encodedDir}/`;
      const canonicalEl = document.querySelector('link[rel="canonical"]');
      if (canonicalEl) canonicalEl.setAttribute("href", selfCanonical);
      const ogUrlEl = document.querySelector('meta[property="og:url"]');
      if (ogUrlEl) ogUrlEl.setAttribute("content", selfCanonical);
      const titleEl = document.querySelector("title");
      if (titleEl && pageNum > 1) {
        const currentTitle = titleEl.textContent;
        const isEn = relPath.startsWith("en/");
        const isJa = relPath.startsWith("ja/");
        const suffix = isEn ? ` - Page ${pageNum}` : isJa ? ` - ${pageNum}ページ` : ` - 第 ${pageNum} 页`;
        if (!currentTitle.includes(suffix.trim())) {
          titleEl.textContent = currentTitle.includes(" | ")
            ? currentTitle.replace(" | ", `${suffix} | `)
            : `${currentTitle}${suffix}`;
        }
      }
      changed = true;
    }

    if (changed) html = document.toString();
  }
  if (changed) await writeFile(htmlPath, html);
}

console.log(`Finalized Hugo output for ${defaultPosts.length} published posts and ${flatSitemapEntries.length} flat sitemap URLs.`);

async function collectFlatSitemapEntries(distDir) {
  const sources = [
    { path: join(distDir, "zh", "sitemap.xml"), langRank: 0 },
    { path: join(distDir, "en", "sitemap.xml"), langRank: 1 },
    { path: join(distDir, "ja", "sitemap.xml"), langRank: 2 },
  ];
  const seen = new Map();

  for (const source of sources) {
    if (!existsSync(source.path)) continue;
    const xml = await readFile(source.path, "utf8");
    const blocks = xml.match(/<url>[\s\S]*?<\/url>/g) || [];
    for (const block of blocks) {
      const loc = block.match(/<loc>([^<]+)<\/loc>/)?.[1]?.trim();
      if (!loc || seen.has(loc)) continue;
      const lastmod = block.match(/<lastmod>([^<]+)<\/lastmod>/)?.[1]?.trim() || "";
      const changefreq = block.match(/<changefreq>([^<]+)<\/changefreq>/)?.[1]?.trim() || "";
      const priority = block.match(/<priority>([^<]+)<\/priority>/)?.[1]?.trim() || "0.5";
      seen.set(loc, { loc, lastmod, changefreq, priority, langRank: source.langRank });
    }
  }

  return [...seen.values()].sort((left, right) => {
    if (left.langRank !== right.langRank) return left.langRank - right.langRank;
    const priDiff = Number(right.priority) - Number(left.priority);
    if (priDiff !== 0) return priDiff;
    if (left.lastmod !== right.lastmod) return right.lastmod.localeCompare(left.lastmod);
    return left.loc.localeCompare(right.loc);
  });
}

function renderFlatSitemapXml(entries) {
  const lines = [
    '<?xml version="1.0" encoding="utf-8" standalone="yes"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ];
  for (const entry of entries) {
    lines.push("  <url>");
    lines.push(`    <loc>${escapeXml(entry.loc)}</loc>`);
    if (entry.lastmod) lines.push(`    <lastmod>${escapeXml(entry.lastmod)}</lastmod>`);
    if (entry.changefreq) lines.push(`    <changefreq>${escapeXml(entry.changefreq)}</changefreq>`);
    if (entry.priority) lines.push(`    <priority>${escapeXml(entry.priority)}</priority>`);
    lines.push("  </url>");
  }
  lines.push("</urlset>");
  return `${lines.join("\n")}\n`;
}

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

async function listHtmlFiles(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await listHtmlFiles(path));
    else if (entry.name.endsWith(".html")) files.push(path);
  }
  return files;
}
