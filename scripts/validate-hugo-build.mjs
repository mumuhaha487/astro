import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readFile, readdir } from "node:fs/promises";
import { dirname, extname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outputRoot = join(repositoryRoot, "dist");
const requiredFiles = [
  "index.html",
  "404.html",
  "robots.txt",
  "sitemap.xml",
  "rss.xml",
  "atom.xml",
  "api/allPostMeta.json",
  "api/calendar-data.json",
  "pagefind/pagefind.js",
  "pagefind/pagefind-entry.json",
  "icons/search.svg",
  "icons/lucide-sprite.svg",
  "assets/font/ZenMaruGothic-Medium.woff2",
  "assets/font/loli.woff2",
  "blog/index.html",
  "en/index.html",
  "en/blog/index.html",
  "en/posts/测试文章标题/index.html",
  "ja/index.html",
  "ja/blog/index.html",
  "ja/posts/测试文章标题/index.html",
  "tools/index.html",
  "category/index.html",
  "tags/index.html",
];
const forbiddenFiles = [
  "discuss/index.html",
  "forum-editor/forum.html",
  "forum-editor/assets/forum-editor.js",
  "hugo-theme/forum.js",
];

for (const relative of requiredFiles) {
  assert.ok(existsSync(join(outputRoot, relative)), `Missing build output: dist/${relative}`);
}
for (const relative of forbiddenFiles) {
  assert.equal(existsSync(join(outputRoot, relative)), false, `Removed forum artifact remains: dist/${relative}`);
}

const posts = JSON.parse(await readFile(join(outputRoot, "api", "allPostMeta.json"), "utf8"));
const calendar = JSON.parse(await readFile(join(outputRoot, "api", "calendar-data.json"), "utf8"));
assert.ok(posts.length > 0, "No published posts were generated");
assert.equal(calendar.length, posts.length, "Post and calendar APIs disagree");

for (const post of posts) {
  const pathname = decodeURIComponent(new URL(post.url, "https://vmss.cn").pathname).replace(/^\/+/, "");
  const outputPath = pathname.endsWith("/") ? join(pathname, "index.html") : pathname;
  const target = resolve(outputRoot, outputPath);
  const targetFromRoot = relative(outputRoot, target);
  assert.ok(
    targetFromRoot !== ".." && !targetFromRoot.startsWith(`..${sep}`) && !isAbsolute(targetFromRoot),
    `Unsafe post URL in manifest: ${post.url}`,
  );
  assert.ok(existsSync(target), `Missing rendered post: ${post.url}`);
  assert.match(await readFile(target, "utf8"), /id="hugo-article-content"/, `Post shell is missing: ${post.url}`);
}

const home = await readFile(join(outputRoot, "index.html"), "utf8");
const blog = await readFile(join(outputRoot, "blog", "index.html"), "utf8");
assert.match(home, /class="home-stage"/, "Home workspace is missing");
assert.match(home, /data-umami-stat="active"/, "Home active visitor statistic is missing");
assert.match(home, /data-umami-stat="visitors"/, "Home unique visitor statistic is missing");
assert.match(home, /data-umami-stat="visits"/, "Home visit statistic is missing");
assert.match(home, /当前访客/, "Current visitor label is missing");
assert.match(home, /累计访客/, "Total visitor label is missing");
assert.match(home, /累计访问次数/, "Total visit label is missing");
assert.match(home, /data-typewriter="不乱于心，不困于情，不畏将来，不惧过去"/, "Looping homepage typewriter is missing");
assert.match(home, /data-typewriter-output/, "Homepage typewriter output is missing");
assert.match(home, /<link rel="preconnect" href="https:\/\/umami\.vmss\.cn" crossorigin>/, "Umami preconnect is missing");
assert.match(home, /<link rel="preload" as="image" href="\/image\/v\/2870\.webp" media="\(max-width: 760px\)">/, "Optimized mobile home cover preload is missing");
assert.match(home, /<link rel="preload" as="image" href="\/image\/h\/132\.webp" media="\(min-width: 761px\)">/, "Optimized desktop home cover preload is missing");
assert.doesNotMatch(home, /id="site-wallpaper"/, "Duplicate homepage wallpaper layer remains");
assert.match(home, /<script async fetchpriority="low" src="https:\/\/umami\.vmss\.cn\/script\.js" data-website-id="993c6970-8f42-4804-a055-38b6b9c01810"><\/script>/, "Non-blocking self-hosted Umami tracker is missing");
for (const [page, name] of [[home, "home"], [blog, "blog"]]) {
  assert.match(page, /<a href="https:\/\/beian\.miit\.gov\.cn\/" target="_blank" rel="noopener noreferrer">赣ICP备2024038464号-3<\/a>/, `ICP filing link is missing on ${name}`);
}
assert.doesNotMatch(blog, /data-umami-stat=/, "Homepage statistics must only appear on the home page");
assert.doesNotMatch(home, /(?:href|src)="\/discuss\//, "Forum link remains on the home page");
assert.doesNotMatch(home, /data-forum-|\/api\/forum|forum-editor/, "Forum code remains on the home page");
const blogServerPageSize = 30;
const blogPageCount = Math.ceil(posts.length / blogServerPageSize);
for (let pageNumber = 1; pageNumber <= blogPageCount; pageNumber += 1) {
  const pagePath = pageNumber === 1 ? join(outputRoot, "blog", "index.html") : join(outputRoot, "blog", "page", String(pageNumber), "index.html");
  assert.ok(existsSync(pagePath), `Missing blog page ${pageNumber}`);
  const pageHtml = await readFile(pagePath, "utf8");
  const expectedCards = Math.min(blogServerPageSize, posts.length - ((pageNumber - 1) * blogServerPageSize));
  assert.equal((pageHtml.match(/class="post-card(?: |")/g) || []).length, expectedCards, `Blog page ${pageNumber} has the wrong number of posts`);
  assert.match(pageHtml, new RegExp(`data-responsive-post-list data-post-list-total="${posts.length}" data-post-list-page="${pageNumber}"`), `Blog page ${pageNumber} is missing responsive pagination metadata`);
  assert.match(pageHtml, new RegExp(`aria-current="page">${pageNumber}<`), `Blog page ${pageNumber} is missing its active pagination state`);
}
assert.match(blog, /rel="next" aria-label="下一页"/, "Blog first page is missing its next-page link");
assert.match(blog, /hugo\.js\?v=20260906-i18n/, "Multilingual asset version is missing");
const linuxTagPath = join(outputRoot, "tags", "linux", "index.html");
assert.ok(existsSync(linuxTagPath), "Linux tag page is missing");
const linuxTag = await readFile(linuxTagPath, "utf8");
const linuxTotal = Number(linuxTag.match(/data-post-list-total="(\d+)"/)?.[1]);
assert.ok(linuxTotal > 10, "Linux tag fixture must exercise mobile pagination");
assert.equal((linuxTag.match(/class="post-card(?: |")/g) || []).length, Math.min(blogServerPageSize, linuxTotal), "Linux tag first server page has the wrong number of posts");
assert.match(linuxTag, /data-responsive-post-list/, "Linux tag page is missing responsive pagination");

const categoryPath = join(outputRoot, "category", "python", "index.html");
assert.ok(existsSync(categoryPath), "Python category page is missing");
const categoryPage = await readFile(categoryPath, "utf8");
const categoryTotal = Number(categoryPage.match(/data-post-list-total="(\d+)"/)?.[1]);
assert.ok(categoryTotal > 10, "Python category fixture must exercise mobile pagination");
assert.equal((categoryPage.match(/class="post-card(?: |")/g) || []).length, Math.min(blogServerPageSize, categoryTotal), "Category first server page has the wrong number of posts");
assert.match(categoryPage, /data-responsive-post-list/, "Category page is missing responsive pagination");

const archive = await readFile(join(outputRoot, "archive", "index.html"), "utf8");
assert.equal((archive.match(/class="post-card(?: |")/g) || []).length, Math.min(blogServerPageSize, posts.length), "Archive first server page has the wrong number of posts");
assert.match(archive, /data-responsive-post-list/, "Archive page is missing responsive pagination");
assert.equal(home.includes("{{"), false, "Unrendered Hugo template found on home page");
assert.match(home, /<title>Mumuemhaha Blog<\/title>/);
assert.match(home, /data-hugo-pagefind-preload/, "Pagefind is not preloaded on the home page");

const translatedArticleFiles = [
  join(outputRoot, "posts", "测试文章标题", "index.html"),
  join(outputRoot, "en", "posts", "测试文章标题", "index.html"),
  join(outputRoot, "ja", "posts", "测试文章标题", "index.html"),
];
const translatedArticles = await Promise.all(translatedArticleFiles.map((path) => readFile(path, "utf8")));
assert.match(translatedArticles[0], /<html lang="zh-CN">/);
assert.match(translatedArticles[1], /<html lang="en-US">/);
assert.match(translatedArticles[1], /<h1[^>]*>Test Article Title<\/h1>/);
assert.match(translatedArticles[1], /Does this count as another kind of editor\?/);
assert.doesNotMatch(translatedArticles[1], /这算不算另外一种编辑器呢/);
assert.match(translatedArticles[2], /<html lang="ja-JP">/);
assert.match(translatedArticles[2], /<h1[^>]*>テスト記事のタイトル<\/h1>/);
const expectedCommentTerm = "posts/%E6%B5%8B%E8%AF%95%E6%96%87%E7%AB%A0%E6%A0%87%E9%A2%98/";
for (const article of translatedArticles) {
  assert.match(article, /data-repo-id="R_kgDOPjTkdA"/, "Giscus repository ID does not match the original Astro comments");
  assert.match(article, /data-category-id="DIC_kwDOPjTkdM4CuiIf"/, "Giscus category ID does not match the original Astro comments");
  assert.match(article, /data-mapping="specific"/, "Giscus must use a shared explicit discussion key");
  assert.ok(article.includes(`data-term="${expectedCommentTerm}"`), "Language variants do not share the Chinese discussion key");
}
const legacyCommentArticle = await readFile(join(outputRoot, "posts", "20250825", "index.html"), "utf8");
assert.match(legacyCommentArticle, /data-term="posts\/20250825\/"/, "Existing Astro discussion mapping was not restored");
const englishHome = await readFile(join(outputRoot, "en", "index.html"), "utf8");
const japaneseHome = await readFile(join(outputRoot, "ja", "index.html"), "utf8");
assert.match(englishHome, /<html lang="en-US">/);
assert.match(englishHome, /aria-label="Switch language"/);
assert.match(japaneseHome, /<html lang="ja-JP">/);
assert.match(japaneseHome, /aria-label="言語を切り替える"/);

const contentFiles = await listFiles(join(repositoryRoot, "content", "posts"));
const misplaced = contentFiles.filter((path) => [".html", ".htm", ".js", ".zip"].includes(extname(path).toLowerCase()));
assert.deepEqual(misplaced, [], `Web page assets must not be stored with Markdown posts: ${misplaced.join(", ")}`);
for (const markdownPath of contentFiles.filter((path) => extname(path).toLowerCase() === ".md")) {
  assert.equal(
    (await readFile(markdownPath, "utf8")).includes("image.vmss.cn"),
    false,
    `Remote image.vmss.cn reference remains in ${markdownPath}`,
  );
}
for (const directory of ["html", "zip"]) {
  assert.ok(existsSync(join(repositoryRoot, "public", "web-pages", "editor", directory)), `Missing isolated web page directory: ${directory}`);
}

console.log(`Validated Hugo output: ${posts.length} Chinese posts, English/Japanese variants with shared comments, 30-item desktop and 10-item mobile list pagination, 10-item search pagination, feeds, and isolated web pages.`);

async function listFiles(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await listFiles(path));
    else files.push(path);
  }
  return files;
}
