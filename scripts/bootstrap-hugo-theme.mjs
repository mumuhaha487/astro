import { cp, mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parse, serialize } from "parse5";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const legacyOutput = resolve(process.argv[2] || join(repositoryRoot, "dist"));
const themeRoot = join(repositoryRoot, "themes", "mumuemhaha");
const staticRoot = join(themeRoot, "static");
const layoutsRoot = join(themeRoot, "layouts");
const featureRoutes = ["about", "albums", "anime", "atom", "devices", "diary", "friends", "projects", "rss", "skills", "timeline"];

if (!existsSync(join(legacyOutput, "index.html"))) {
  throw new Error(`Missing rendered site at ${legacyOutput}.`);
}

await mkdir(staticRoot, { recursive: true });
await mkdir(join(layoutsRoot, "_default"), { recursive: true });
await mkdir(join(layoutsRoot, "archive"), { recursive: true });

for (const route of featureRoutes) {
  const source = join(legacyOutput, route);
  if (!existsSync(source)) continue;
  const target = join(staticRoot, route);
  await cp(source, target, { recursive: true, force: true });
  const page = join(target, "index.html");
  if (existsSync(page)) await injectThemeAssets(page);
}
for (const route of ["api", "js"]) {
  const source = join(legacyOutput, route);
  if (existsSync(source)) await cp(source, join(staticRoot, route), { recursive: true, force: true });
}
for (const file of ["404.html", "scroll-protection.js"]) {
  const source = join(legacyOutput, file);
  if (existsSync(source)) await cp(source, join(staticRoot, file), { force: true });
}

const homeHtml = await readFile(join(legacyOutput, "index.html"), "utf8");
const firstPost = await findFirstPostHtml(join(legacyOutput, "posts"));
const postHtml = await readFile(firstPost, "utf8");

await writeFile(join(layoutsRoot, "index.html"), createShell(homeHtml, "home-content.html", { home: true }));
await writeFile(join(layoutsRoot, "_default", "list.html"), createShell(postHtml, "list-content.html"));
await writeFile(join(layoutsRoot, "_default", "single.html"), createShell(postHtml, "article-content.html", { article: true }));
await writeFile(join(layoutsRoot, "archive", "list.html"), createShell(postHtml, "archive-content.html"));

const sources = [
  join(layoutsRoot, "index.html"),
  join(layoutsRoot, "_default", "list.html"),
  join(layoutsRoot, "_default", "single.html"),
  join(layoutsRoot, "archive", "list.html"),
  ...await listFiles(staticRoot),
];
const assetNames = new Set();
for (const source of sources) await collectAssetReferences(source, assetNames);

let previousSize = -1;
while (assetNames.size !== previousSize) {
  previousSize = assetNames.size;
  for (const name of [...assetNames]) {
    const source = join(legacyOutput, "_astro", name);
    if (existsSync(source) && [".css", ".js"].includes(extname(source))) {
      await collectAssetReferences(source, assetNames, true);
    }
  }
}

await mkdir(join(staticRoot, "_astro"), { recursive: true });
for (const name of assetNames) {
  const source = join(legacyOutput, "_astro", name);
  if (!existsSync(source)) continue;
  const target = join(staticRoot, "_astro", name);
  await mkdir(dirname(target), { recursive: true });
  await cp(source, target, { force: true });
}

console.log(`Bootstrapped Hugo theme with ${assetNames.size} referenced Astro assets.`);

function createShell(html, partial, options = {}) {
  const document = parse(html);
  const content = findElement(document, (node) => getAttribute(node, "id") === "content-wrapper");
  if (!content) throw new Error(`Missing #content-wrapper for ${partial}`);
  const placeholder = { nodeName: "#comment", data: "HUGO_PARTIAL", parentNode: content };
  content.childNodes = [placeholder];

  const head = findElement(document, (node) => node.tagName === "head");
  if (!head) throw new Error(`Missing <head> for ${partial}`);
  const oldTitle = findElement(head, (node) => node.tagName === "title");
  if (oldTitle) {
    oldTitle.childNodes = [createTextNode(options.home ? "Mumuemhaha Blog - 木哈文轩" : "{{ .Title }} - Mumuemhaha Blog", oldTitle)];
  }
  for (const meta of findElements(head, (node) => node.tagName === "meta")) {
    const key = getAttribute(meta, "name") || getAttribute(meta, "property") || "";
    if (![
      "description",
      "og:title",
      "og:description",
      "og:url",
      "twitter:title",
      "twitter:description",
      "twitter:url",
      "generator",
      "og:type",
    ].includes(key)) continue;
    if (key === "generator") setAttribute(meta, "content", "Hugo {{ hugo.Version }}");
    else if (key === "og:type") setAttribute(meta, "content", options.article ? "article" : "website");
    else if (key.endsWith("url")) setAttribute(meta, "content", "{{ .Permalink }}");
    else if (key.endsWith("title")) setAttribute(meta, "content", options.article ? "{{ .Title }}" : "Mumuemhaha Blog");
    else setAttribute(meta, "content", options.article ? "{{ if and (.Params.encrypted | default false) .Params.password }}此内容受密码保护{{ else }}{{ .Params.description | default .Plain | truncate 160 }}{{ end }}" : "木哈文轩");
  }
  for (const script of findElements(head, (node) => node.tagName === "script" && getAttribute(node, "type") === "application/ld+json")) {
    const schema = options.article
      ? '{{- $schemaDescription := .Params.description | default .Plain | truncate 160 -}}{{- if and (.Params.encrypted | default false) .Params.password -}}{{- $schemaDescription = "此内容受密码保护" -}}{{- end -}}{{ dict "@context" "https://schema.org" "@type" "BlogPosting" "headline" .Title "description" $schemaDescription "author" (dict "@type" "Person" "name" site.Params.author "url" site.BaseURL) "datePublished" (.Date.Format "2006-01-02") "dateModified" (.Lastmod.Format "2006-01-02") "inLanguage" site.Language.Locale | jsonify | safeJS }}'
      : '{{ dict "@context" "https://schema.org" "@type" "WebSite" "name" site.Title "url" site.BaseURL | jsonify | safeJS }}';
    script.childNodes = [createTextNode(schema, script)];
  }
  const body = findElement(document, (node) => node.tagName === "body");
  if (body) setAttribute(body, "data-hugo-page", options.home ? "home" : options.article ? "article" : "list");

  const additions = [];
  if (!findElement(head, (node) => node.tagName === "link" && getAttribute(node, "rel") === "canonical")) {
    additions.push('<link rel="canonical" href="{{ .Permalink }}">');
  }
  if (!findElement(head, (node) => node.tagName === "link" && getAttribute(node, "href") === "/hugo-theme/hugo.css")) {
    additions.push('<link rel="stylesheet" href="/hugo-theme/hugo.css">');
  }
  if (!findElement(head, (node) => node.tagName === "script" && getAttribute(node, "src") === "/hugo-theme/hugo.js")) {
    additions.push('<script defer src="/hugo-theme/hugo.js"></script>');
  }
  let output = serialize(document).replace("<!--HUGO_PARTIAL-->", `\n{{ partial "${partial}" . }}\n`);
  if (additions.length) output = output.replace("</head>", `${additions.join("")}</head>`);
  return output;
}

function findElement(node, predicate) {
  if (predicate(node)) return node;
  for (const child of node.childNodes || []) {
    const match = findElement(child, predicate);
    if (match) return match;
  }
  return null;
}

function findElements(node, predicate, matches = []) {
  if (predicate(node)) matches.push(node);
  for (const child of node.childNodes || []) findElements(child, predicate, matches);
  return matches;
}

function getAttribute(node, name) {
  return node.attrs?.find((attribute) => attribute.name === name)?.value;
}

function setAttribute(node, name, value) {
  node.attrs ||= [];
  const attribute = node.attrs.find((item) => item.name === name);
  if (attribute) attribute.value = value;
  else node.attrs.push({ name, value });
}

function createTextNode(value, parentNode) {
  return { nodeName: "#text", value, parentNode };
}

async function collectAssetReferences(path, names, includeRelative = false) {
  if (!existsSync(path) || !(await stat(path)).isFile()) return;
  const source = await readFile(path, "utf8");
  for (const match of source.matchAll(/\/_astro\/([A-Za-z0-9_.-]+)/g)) names.add(match[1]);
  if (includeRelative) {
    for (const match of source.matchAll(/["']\.\/([A-Za-z0-9_.-]+\.(?:js|css|woff2?|ttf|png|jpe?g|webp|gif))["']/g)) {
      names.add(match[1]);
    }
  }
}

async function injectThemeAssets(path) {
  const source = await readFile(path, "utf8");
  if (source.includes('/hugo-theme/hugo.css')) return;
  await writeFile(path, source.replace("</head>", '<link rel="stylesheet" href="/hugo-theme/hugo.css"><script defer src="/hugo-theme/hugo.js"></script></head>'));
}

async function listFiles(directory) {
  const files = [];
  if (!existsSync(directory)) return files;
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await listFiles(path));
    else files.push(path);
  }
  return files;
}

async function findFirstPostHtml(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      const candidate = join(path, "index.html");
      if (existsSync(candidate)) return candidate;
    }
  }
  throw new Error("No rendered Astro post was found for the Hugo article shell.");
}
