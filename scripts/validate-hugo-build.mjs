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
  "api/allPostMeta.zh.json",
  "api/allPostMeta.en.json",
  "api/allPostMeta.ja.json",
  "api/calendar-data.json",
  "api/friends.json",
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
  "desktop/index.html",
  "desktop/desktop.css",
  "desktop/desktop.js",
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
for (const locale of ["zh", "en", "ja"]) {
  const localizedPosts = JSON.parse(await readFile(join(outputRoot, "api", `allPostMeta.${locale}.json`), "utf8"));
  assert.ok(localizedPosts.length > 0, `No ${locale} desktop posts were generated`);
  if (locale !== "zh") assert.ok(localizedPosts.every(post => post.url.startsWith(`/${locale}/posts/`)), `${locale} desktop posts use the wrong route prefix`);
  assert.ok(localizedPosts.every(post => !Object.hasOwn(post, "encryptionPassword") && typeof post.password === "boolean"), `${locale} desktop metadata exposes private password data`);
}
for (const relative of ["post-manifest.json", "en/post-manifest.json", "ja/post-manifest.json"]) {
  assert.equal(existsSync(join(outputRoot, relative)), false, `Private source manifest remains in dist/${relative}`);
}

for (const post of posts) {
  for (const field of ["date", "tags", "image", "pinned", "readingTime", "wordCount"]) {
    assert.ok(Object.hasOwn(post, field), `Desktop post metadata is missing ${field}: ${post.url}`);
  }
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
const desktopPage = await readFile(join(outputRoot, "desktop", "index.html"), "utf8");
const desktopScript = await readFile(join(outputRoot, "desktop", "desktop.js"), "utf8");
const desktopStyles = await readFile(join(outputRoot, "desktop", "desktop.css"), "utf8");
const hugoStyles = await readFile(join(outputRoot, "hugo-theme", "hugo.css"), "utf8");
const desktop = await readFile(join(outputRoot, "desktop", "index.html"), "utf8");
assert.match(desktop, /id="windows-layer"/, "HyDE desktop window layer is missing");
assert.equal((desktop.match(/data-workspace-target=/g) || []).length, 5, "HyDE desktop must expose five workspaces");
assert.equal((desktop.match(/class="desktop-icon"/g) || []).length, 6, "HyDE desktop icon set is incomplete");
assert.match(desktop, /id="desktop-entry-sequence"/, "HyDE barrage entry sequence is missing");
assert.match(home, /class="home-stage"/, "Home workspace is missing");
assert.match(home, /data-umami-stat="active"/, "Home active visitor statistic is missing");
assert.match(home, /data-umami-stat="visitors"/, "Home unique visitor statistic is missing");
assert.match(home, /data-umami-stat="visits"/, "Home visit statistic is missing");
assert.match(home, /当前访客/, "Current visitor label is missing");
assert.match(home, /累计访客/, "Total visitor label is missing");
assert.match(home, /累计访问次数/, "Total visit label is missing");
assert.match(home, /data-typewriter="不乱于心，不困于情，不畏将来，不惧过去"/, "Looping homepage typewriter is missing");
assert.match(home, /data-typewriter-output/, "Homepage typewriter output is missing");
assert.doesNotMatch(home, /rel="preconnect" href="https:\/\/umami\.vmss\.cn"/, "Umami still competes with critical resources during initial loading");
assert.match(home, /<link rel="preload" as="image" href="\/optimized\/images\/[a-f0-9]+-mobileBackdrop\.webp" media="\(max-width: 760px\)">/, "Optimized mobile home cover preload is missing");
assert.match(home, /<link rel="preload" as="image" href="\/optimized\/images\/[a-f0-9]+-desktopBackdrop\.webp" media="\(min-width: 761px\)">/, "Optimized desktop home cover preload is missing");
assert.doesNotMatch(home, /id="site-wallpaper"/, "Duplicate homepage wallpaper layer remains");
assert.match(home, /data-analytics-src="https:\/\/umami\.vmss\.cn\/script\.js"/, "Deferred self-hosted Umami tracker configuration is missing");
assert.doesNotMatch(home, /<script[^>]+src="https:\/\/umami\.vmss\.cn\/script\.js"/, "Umami tracker still blocks the initial HTML parse");
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
assert.equal((home.match(/class="home-doc-item/g) || []).length, 3, "Homepage document list must contain three content sections");
assert.match(home, /class="home-doc-list home-doc-list-unframed"/, "Homepage information area still uses the framed glass container");
assert.match(home, /hugo\.css\?v=20260915-hyprliquid-v5/, "Current stylesheet cache version is missing");
assert.match(home, /hugo\.js\?v=20260914-hyprliquid-v4/, "Current script cache version is missing");
assert.match(hugoStyles, /@media\(max-width:760px\)[\s\S]*?\.home-grid\{[^}]*flex-direction:column;/, "Mobile homepage does not place the profile first");
assert.match(hugoStyles, /\.home-profile\{order:-1;/, "Mobile profile is not pinned ahead of homepage details");
assert.match(home, /class="avatar-style-switch" href="\/desktop\/" data-desktop-transition/, "HyDE desktop transition trigger is missing from the avatar");
assert.match(home, /class="archlinux-logo" viewBox="0 0 24 24"/, "Desktop switch is missing its Arch Linux icon");
assert.doesNotMatch(home, /home-desktop-switch|sidebar-desktop-switch|data-nav="desktop"/, "Unrequested duplicate desktop switch entry remains");
assert.match(desktopPage, /data-layout-mode="stacked"/, "HyDE desktop does not default to stacked windows");
assert.match(desktopPage, /data-layout-toggle/, "Global window layout toggle is missing");
assert.match(desktopPage, /Alt \+ G/, "Global window layout shortcut is not explained");
assert.match(desktopPage, /class="dock-glyph dock-grid"/, "Always-available all-app launcher is missing from the dock");
assert.match(desktopPage, /data-return-classic/, "Desktop has no visible control for returning to classic mode");
assert.match(desktopPage, /切回经典博客模式/, "Desktop classic-mode return control is not labelled");
assert.match(desktopPage, /class="dock-return" href="\/" data-return-classic aria-label="切回原来的样式"/, "Dock is missing its classic-style return control");
assert.match(desktopPage, /desktop\.css\?v=20260915-hyprliquid-v13/, "Current desktop stylesheet cache version is missing");
assert.match(desktopPage, /desktop\.js\?v=20260915-hyprliquid-v13/, "Current desktop script cache version is missing");
assert.match(desktopPage, /data-language-toggle/, "Desktop language switch is missing");
assert.match(desktopPage, /<strong>English<\/strong>/, "English desktop language option is missing");
assert.match(desktopPage, /<strong>日本語<\/strong>/, "Japanese desktop language option is not explicit");
assert.match(desktopScript, /allPostMeta\.\$\{currentLocale\}\.json/, "Desktop does not load locale-specific article data");
assert.match(desktopStyles, /grid-template-columns:\s*repeat\(auto-fit,\s*minmax\(72px,\s*1fr\)\)/, "Mobile desktop icon columns do not expand proportionally");
assert.match(desktopStyles, /column-gap:\s*clamp\(18px,\s*5vw,\s*28px\)/, "Mobile desktop icon gaps do not scale with viewport width");
assert.doesNotMatch(desktopScript, /document\.createElement\("iframe"\)/, "Desktop applications still use iframe wrappers");
assert.match(desktopScript, /function safeLocalURL\(/, "Desktop native views do not enforce same-origin reads");
assert.match(desktopScript, /async function renderNativeArticle\(/, "Desktop article reader is missing");
assert.match(desktopScript, /const pageSize = matchMedia\("\(max-width: 680px\)"\)\.matches \? 10 : 30/, "Desktop blog pagination is not viewport-aware");
assert.match(desktopStyles, /\.native-scroll[^}]*overflow-y:\s*auto[^}]*touch-action:\s*pan-y/, "Native desktop views cannot scroll by touch");
assert.match(desktopStyles, /\.launcher\s*\{[^}]*grid-template-rows:\s*auto auto minmax\(0, 1fr\) auto[^}]*overflow:\s*hidden/, "Launcher does not constrain its scroll area");
assert.match(desktopStyles, /\.launcher-grid[^}]*overflow-y:\s*auto[^}]*touch-action:\s*pan-y/, "Launcher application list cannot scroll by touch");
assert.match(desktopStyles, /\.hypr-desktop\s*\{[^}]*position:\s*fixed[^}]*inset:\s*0/, "Desktop root is not locked to the viewport");
for (const [source, label] of [[desktopPage, "desktop page"], [desktopScript, "desktop script"]]) {
  assert.doesNotMatch(source, /(?:github_pat_|ghp_[A-Za-z0-9]|[A-Za-z]:\\Users\\|[A-Za-z]:\\project\\|\/workspace\/)/, `${label} exposes a token or local filesystem path`);
}
assert.match(desktopScript, /function toggleLayoutMode\(\)/, "Global stacked/tiled window logic is missing");
assert.match(desktopScript, /layoutMode === "stacked" \? "tiled" : "stacked"/, "Global window layout toggle is not reversible");
assert.match(desktopScript, /getPropertyValue\("--window-gap"\)/, "Tiled windows do not read the responsive gap setting");
assert.match(desktopStyles, /--window-gap:\s*12px/, "Desktop liquid-window gap is missing");
assert.match(desktopStyles, /--window-radius:\s*34px/, "Desktop liquid-window corner radius is missing");
assert.match(desktopStyles, /border-radius:\s*var\(--window-radius\)/, "Window corners do not use the shared liquid radius");
assert.match(desktopStyles, /backdrop-filter:\s*blur\(30px\) saturate\(1\.42\)/, "Liquid acrylic window material is missing");
assert.doesNotMatch(desktopScript, /STACKED WINDOWS|WORKSPACES|LIQUID TILING/, "Removed welcome explanation sections remain");
assert.doesNotMatch(desktopStyles, /\.welcome-card|\.welcome-grid/, "Removed welcome explanation styles remain");
assert.match(desktopPage, /class="layout-mode-glyph" aria-hidden="true"><\/span>/, "Bounded layout-mode icon is missing");
assert.match(desktopScript, /function returnToClassic\(\)/, "Desktop cannot return to classic mode");
assert.match(desktopScript, /classic-return-transition/, "Desktop classic-mode return has no transition sequence");
assert.match(desktopStyles, /@keyframes classic-window-collapse/, "Desktop windows do not animate when returning to classic mode");
assert.match(home, /desktop-returned-to-classic/, "Classic homepage does not detect a desktop return");
assert.match(home, /from-hypr-desktop/, "Classic homepage return animation is missing");
assert.match(desktopScript, /name === "fastfetch"/, "Extended terminal system commands are missing");
assert.match(desktopScript, /这是一个启发于 Arch Linux \+ Hyprland，让你更加方便地浏览博客中的各个网页（甚至可以做到嵌套运行）。/, "Desktop welcome copy is not the requested Arch Linux and Hyprland description");
assert.doesNotMatch(desktopScript, /这里不是一张静态“桌面皮肤”/, "Legacy desktop welcome copy remains");
assert.match(desktopScript, /const terminalCommands = \[/, "Terminal command completion registry is missing");
assert.match(desktopScript, /name === "pacman"/, "Terminal is missing Arch package command examples");
assert.match(desktopScript, /name === "fortune" \|\| name === "quote"/, "Terminal is missing static fun commands");
assert.match(desktopScript, /event\.key === "ArrowUp" \|\| event\.key === "ArrowDown"/, "Terminal command history navigation is missing");
assert.match(desktopScript, /event\.key === "Tab"/, "Terminal command completion is missing");
assert.match(desktopScript, /function syncToastViewport\(\)/, "Mobile notifications do not reserve non-overlapping window space");
assert.match(desktopScript, /name === "layout"/, "Terminal cannot control window layout");
assert.match(desktopScript, /name === "wallpaper"/, "Terminal cannot control wallpapers");
assert.match(desktopScript, /name === "classic"/, "Terminal cannot return to classic mode");
assert.doesNotMatch(desktopPage, /data-window-action="(?:float|maximize)"/, "A third per-window layout mode remains available");
assert.doesNotMatch(desktopScript, /toggleFloating|toggleMaximize|layoutMode === "arranged"/, "Legacy free/maximized layout logic remains available");
assert.doesNotMatch(home, /cursor-ring|cursor-dot|has-custom-cursor/, "Removed custom cursor remains in the homepage output");
assert.doesNotMatch(home, /particle-card|data-particle-card/, "Removed card particle rendering remains on the homepage");
assert.match(home, /data-avatar-particles/, "Homepage avatar particle assembly is missing");
assert.match(home, /class="profile-particles"/, "Homepage avatar particle canvas is missing");
assert.match(home, /data-idle-spin-direction="counterclockwise" data-idle-spin-velocity="-180" data-hover-spin-direction="clockwise" data-hover-spin-acceleration="180" data-spin-recovery="3000"/, "Avatar spin metadata is missing");
assert.match(home, /data-random-post-covers="{&#34;desktop&#34;:\[&#34;\/optimized\/images\/[a-f0-9]+-card\.webp&#34;/, "Optimized random post cover pool is missing");
const blogServerPageSize = 30;
const blogPageCount = Math.ceil(posts.length / blogServerPageSize);
for (let pageNumber = 1; pageNumber <= blogPageCount; pageNumber += 1) {
  const pagePath = pageNumber === 1 ? join(outputRoot, "blog", "index.html") : join(outputRoot, "blog", "page", String(pageNumber), "index.html");
  assert.ok(existsSync(pagePath), `Missing blog page ${pageNumber}`);
  const pageHtml = await readFile(pagePath, "utf8");
  const expectedCards = Math.min(blogServerPageSize, posts.length - ((pageNumber - 1) * blogServerPageSize));
  assert.equal((pageHtml.match(/class="post-card(?: |")/g) || []).length, expectedCards, `Blog page ${pageNumber} has the wrong number of posts`);
  assert.doesNotMatch(pageHtml, /particle-card|data-particle/, `Blog page ${pageNumber} still contains particle rendering`);
  assert.equal((pageHtml.match(/data-progressive-src=/g) || []).length, (pageHtml.match(/class="post-cover"/g) || []).length, `Blog page ${pageNumber} does not defer every cover`);
  assert.match(pageHtml, new RegExp(`data-responsive-post-list data-post-list-total="${posts.length}" data-post-list-page="${pageNumber}"`), `Blog page ${pageNumber} is missing responsive pagination metadata`);
  assert.match(pageHtml, new RegExp(`aria-current="page">${pageNumber}<`), `Blog page ${pageNumber} is missing its active pagination state`);
}
assert.match(blog, /rel="next" aria-label="下一页"/, "Blog first page is missing its next-page link");
assert.match(blog, /data-random-post-cover/, "Posts without artwork do not receive a random local cover");
assert.doesNotMatch(blog, /post-cover-placeholder/, "Legacy empty cover placeholder remains");
assert.match(blog, /data-progressive-src="\/optimized\/images\/[a-f0-9]+-card\.webp"/, "Article cards do not use generated cover thumbnails");
assert.match(blog, /hugo\.js\?v=20260914-hyprliquid-v4/, "Current interactive asset version is missing");
assert.match(blog, /hugo\.css\?v=20260915-hyprliquid-v5/, "Current stylesheet asset version is missing");
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
assert.doesNotMatch(home, /data-hugo-pagefind-preload/, "Pagefind should load only after the visitor opens search");

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
