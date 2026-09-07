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
  "blog/index.html",
  "friends/index.html",
  "guestbook/index.html",
  "en/friends/index.html",
  "en/guestbook/index.html",
  "ja/friends/index.html",
  "ja/guestbook/index.html",
  "en/index.html",
  "en/blog/index.html",
  "en/posts/测试文章标题/index.html",
  "ja/index.html",
  "ja/blog/index.html",
  "ja/posts/测试文章标题/index.html",
  "tools/index.html",
  "tools/json-formatter/index.html",
  "tools/timestamp/index.html",
  "tools/text-stats/index.html",
  "tools/base64/index.html",
  "tools/uuid/index.html",
  "tools/beast-translator/index.html",
  "tools/docker-accelerator/index.html",
  "tool-icons/json.png",
  "tool-icons/base64.png",
  "tool-icons/text-stats.png",
  "tool-icons/timestamp.png",
  "tool-icons/uuid.png",
  "tool-icons/docker.png",
  "tool-icons/beast.png",
  "tool-covers/1.webp",
  "tool-covers/2.webp",
  "tool-covers/3.webp",
  "tool-covers/4.webp",
  "tool-covers/5.webp",
  "tool-covers/6.webp",
  "images/grain.png",
  "hugo-theme/giscus-theme.css",
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
assert.match(home, /workspace-brand-title[^>]*>工作空间<\//, "Compact workspace brand is missing");
assert.doesNotMatch(home, /workspace-brand[\s\S]{0,500}木木em哈哈/, "Removed sidebar identity remains");
assert.doesNotMatch(home, /href="\/archive\/" data-nav="archive"/, "Removed archive sidebar link remains");
assert.match(home, /href="\/friends\/" data-nav="friends"/, "Friends sidebar link is missing");
assert.match(home, /href="\/guestbook\/" data-nav="guestbook"/, "Guestbook sidebar link is missing");
assert.match(home, /这是一个建立在21世纪的边缘小站。/, "Homepage status description is incorrect");
assert.match(home, /一个可能特别有想法的博主。/, "Homepage status title is incorrect");
assert.match(home, /我の小小窝。/, "Homepage workspace label is incorrect");
assert.match(home, /https:\/\/github\.com\/mumuhaha487/, "Production GitHub contact is missing");
assert.match(home, /https:\/\/space\.bilibili\.com\/334584883/, "Production Bilibili contact is missing");
assert.match(home, /lucide-sprite\.svg#bilibili/, "Bilibili brand icon is missing");
assert.match(home, /data-avatar-particles/, "Particle avatar stage is missing");
assert.equal((home.match(/class="home-doc-item/g) || []).length, 3, "Homepage document list must contain three particle cards");
assert.equal((home.match(/data-particle-card/g) || []).length, 3, "Homepage particle card metadata is incomplete");
assert.match(home, /data-random-post-covers="\[&#34;\/image\/h\/132\.webp&#34;/, "Local random post cover pool is missing");
const blogServerPageSize = 30;
const blogPageCount = Math.ceil(posts.length / blogServerPageSize);
for (let pageNumber = 1; pageNumber <= blogPageCount; pageNumber += 1) {
  const pagePath = pageNumber === 1 ? join(outputRoot, "blog", "index.html") : join(outputRoot, "blog", "page", String(pageNumber), "index.html");
  assert.ok(existsSync(pagePath), `Missing blog page ${pageNumber}`);
  const pageHtml = await readFile(pagePath, "utf8");
  const expectedCards = Math.min(blogServerPageSize, posts.length - ((pageNumber - 1) * blogServerPageSize));
  assert.equal((pageHtml.match(/class="post-card(?: |")/g) || []).length, expectedCards, `Blog page ${pageNumber} has the wrong number of posts`);
  assert.equal((pageHtml.match(/data-particle-pattern="post"/g) || []).length, expectedCards, `Blog page ${pageNumber} is missing particle cards`);
  assert.equal((pageHtml.match(/data-progressive-src=/g) || []).length, (pageHtml.match(/class="post-cover"/g) || []).length, `Blog page ${pageNumber} does not defer every cover`);
  assert.match(pageHtml, new RegExp(`data-responsive-post-list data-post-list-total="${posts.length}" data-post-list-page="${pageNumber}"`), `Blog page ${pageNumber} is missing responsive pagination metadata`);
  assert.match(pageHtml, new RegExp(`aria-current="page">${pageNumber}<`), `Blog page ${pageNumber} is missing its active pagination state`);
}
assert.match(blog, /rel="next" aria-label="下一页"/, "Blog first page is missing its next-page link");
assert.match(blog, /data-random-post-cover/, "Posts without artwork do not receive a random local cover");
assert.doesNotMatch(blog, /post-cover-placeholder/, "Legacy empty cover placeholder remains");
assert.match(blog, /hugo\.js\?v=20260907-pixel-cover-particles/, "Current interactive asset version is missing");
assert.match(blog, /hugo\.css\?v=20260907-pixel-cover-particles/, "Current stylesheet asset version is missing");
assert.match(blog, /data-responsive-post-list/, "Progressive post list metadata is missing");
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
  assert.match(article, /data-theme="https:\/\/vmss\.cn\/hugo-theme\/giscus-theme\.css\?v=20260907-contrast4"/, "Giscus high-contrast dark theme is missing");
  assert.match(article, /data-article-toc-nav/, "Article TOC shell is missing");
  assert.match(article, /data-mobile-actions-toggle/, "Mobile article action launcher is missing");
}

const toolsIndex = await readFile(join(outputRoot, "tools", "index.html"), "utf8");
assert.equal((toolsIndex.match(/class="tool-card"/g) || []).length, 7, "Toolbox does not contain seven routed tool cards");
assert.equal((toolsIndex.match(/data-random-cover/g) || []).length, 7, "Toolbox cards are missing deferred cover slots");
assert.equal((toolsIndex.match(/src="\/tool-icons\//g) || []).length, 7, "Toolbox icons are not local files");
assert.match(toolsIndex, /data-tool-covers="\[&#34;\/tool-covers\/1\.webp&#34;/, "Toolbox does not use local wallpaper thumbnails");
for (const route of ["json-formatter", "timestamp", "text-stats", "base64", "uuid", "beast-translator", "docker-accelerator"]) {
  assert.ok(toolsIndex.includes(`href="/tools/${route}/"`), `Tool card route is missing: ${route}`);
}
const dockerTool = await readFile(join(outputRoot, "tools", "docker-accelerator", "index.html"), "utf8");
assert.match(dockerTool, /<iframe class="tool-service-frame" src="https:\/\/docker\.0ha\.top\/"[^>]*loading="lazy"/, "Docker accelerator iframe is not loaded on demand");

const friendsPage = await readFile(join(outputRoot, "friends", "index.html"), "utf8");
assert.equal((friendsPage.match(/class="friend-card"/g) || []).length, 4, "Friends page did not render every validated entry");
assert.match(friendsPage, /https:\/\/github\.com\/mumuhaha487\/astro\/tree\/main\/friends/, "Friends repository link is not production-ready");
assert.match(friendsPage, /href="https:\/\/github\.com\/mumuhaha487\/astro\/new\/main\/friends\/entries"/, "Friends contribution link is not filename-neutral");
assert.doesNotMatch(friendsPage, /new\/main\/friends\/entries\?filename=/, "Friends contribution link still presets a conflicting filename");
assert.match(friendsPage, /data-friends-apply-dialog/, "Friends application dialog is missing");
assert.match(friendsPage, /data-friends-template/, "Friends JSON copy template is missing");
assert.doesNotMatch(friendsPage, /friend\.json|your-site-2026\.json/, "Friends dialog suggests a fixed filename");
assert.doesNotMatch(friendsPage, /static\/friends|astro-island/, "Legacy generated friends page overrode the Hugo route");

const guestbookPage = await readFile(join(outputRoot, "guestbook", "index.html"), "utf8");
assert.match(guestbookPage, /data-guestbook-api="https:\/\/md\.vmss\.cn"/, "Guestbook production API is missing");
assert.match(guestbookPage, /data-guestbook-form/, "Guestbook public form is missing");
assert.match(guestbookPage, /data-turnstile-site-key="0x4AAAAAAEqYCxmwdT2EkFet"/, "Guestbook Turnstile site key is missing");
assert.match(guestbookPage, /data-turnstile-verifier="https:\/\/astro-blog-studio\.vrhjio4405\.workers\.dev\/api\/guestbook\/turnstile\/verify"/, "Guestbook Turnstile ticket verifier is missing");
assert.match(guestbookPage, /challenges\.cloudflare\.com\/turnstile\/v0\/api\.js\?render=explicit/, "Guestbook Turnstile client is missing");
assert.match(guestbookPage, /data-guestbook-turnstile/, "Guestbook Turnstile mount is missing");
assert.doesNotMatch(guestbookPage, /captchaAnswer|data-guestbook-captcha|算术验证码/, "Legacy arithmetic captcha remains");
const giscusTheme = await readFile(join(outputRoot, "hugo-theme", "giscus-theme.css"), "utf8");
assert.match(giscusTheme, /--color-canvas-default:transparent/, "Giscus theme is not dark-theme compatible");
assert.match(giscusTheme, /--color-canvas-subtle:#303131/, "Giscus comment panels do not use the readable gray surface");
assert.match(giscusTheme, /--color-fg-default:#f5f3ef/, "Giscus comment text is not high contrast");
assert.match(giscusTheme, /cursor:url/, "Giscus cursor styling is missing");
const responseHeaders = await readFile(join(outputRoot, "_headers"), "utf8");
assert.match(responseHeaders, /\/hugo-theme\/\*\r?\n  Access-Control-Allow-Origin: \*\r?\n  Access-Control-Allow-Methods: GET/, "Theme assets do not expose the CORS headers Giscus requires");
const edgeOneConfiguration = JSON.parse(await readFile(join(repositoryRoot, "edgeone.json"), "utf8"));
const themeHeaders = edgeOneConfiguration.headers.find((rule) => rule.source === "/hugo-theme/*")?.headers || [];
assert.equal(themeHeaders.find((header) => header.key === "Access-Control-Allow-Origin")?.value, "*", "EdgeOne does not expose theme assets cross-origin");
const legacyCommentArticle = await readFile(join(outputRoot, "posts", "20250825", "index.html"), "utf8");
assert.match(legacyCommentArticle, /data-term="posts\/20250825\/"/, "Existing Astro discussion mapping was not restored");
const englishHome = await readFile(join(outputRoot, "en", "index.html"), "utf8");
const japaneseHome = await readFile(join(outputRoot, "ja", "index.html"), "utf8");
assert.match(englishHome, /<html lang="en-US">/);
assert.match(englishHome, /aria-label="Switch language"/);
assert.match(japaneseHome, /<html lang="ja-JP">/);
assert.match(japaneseHome, /aria-label="言語を切り替える"/);
assert.match(japaneseHome, /<a[^>]*lang="ja"[^>]*>日本語<\/a>/, "Japanese language option is not explicit");

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

console.log(`Validated Hugo output: ${posts.length} Chinese posts, friends, guestbook, local tool assets, English/Japanese variants, responsive pagination, feeds, and isolated web pages.`);

async function listFiles(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await listFiles(path));
    else files.push(path);
  }
  return files;
}
