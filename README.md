# 木哈文轩 · 妙想之地

木木em哈哈的个人站点：技术折腾、踩坑记录与生活随想，外加一些浏览器本地小工具。

- 线上地址：<https://vmss.cn>
- 站点由 [Hugo](https://gohugo.io/) 构建，主题位于 `themes/mumuemhaha`，部署在 EdgeOne Pages。
- 写作与资源管理通过仓库内的私有编辑器 [`studio/`](studio/README.md) 完成（部署在 Cloudflare Workers + R2，`https://markdown.inc.re`）。

> 仓库早期基于 Astro 模板 Mizuki，目前线上站点已完全迁移到 Hugo。`src/`、`astro.config.mjs` 等 Astro 文件仅作历史保留（`pnpm legacy:dev`），不参与线上构建。

## 功能

| 页面 | 路径 | 说明 |
| --- | --- | --- |
| 首页 | `/` | 头像粒子组装与旋转、打字机签名、访客统计（Umami）、站点运行天数、最新文章、栏目导航 |
| 博客 | `/blog/` | 置顶优先排序、分类筛选、写作年表、热门标签；桌面每页 30 篇、移动端每页 10 篇并渐进加载 |
| 文章 | `/posts/<文件名>/` | 目录与阅读进度、代码高亮与复制、图片灯箱、KaTeX 公式、Giscus 评论、密码保护文章 |
| 友情链接 | `/friends/` | 通过 PR 提交 JSON 申请，GitHub 机器人自动校验安全范围、格式与 `/friends` 互链后自动合并 |
| 留言板 | `/guestbook/` | Cloudflare Turnstile 验证，数据存储在 Cloudflare Workers + R2 编辑器后端 |
| 工具箱 | `/tools/` | JSON 格式化、Base64、文本统计、时间戳、UUID、Docker 加速、兽音译者，全部在浏览器本地运行 |
| 桌面模式 | `/desktop/` | 仿 Arch Linux + Hyprland 的桌面风格，通过首页头像旁的“切换另外一种风格”进入 |

通用能力：亮色 / 暗色主题（默认亮色，选择会被记住）、中文 / English / 日本語、Pagefind 全文搜索（`Ctrl/⌘ + K`）、页面切换动画与封面图过渡、移动端底部导航。

## 目录结构

```text
content/              文章（content/posts）与各栏目索引
data/                 友链 friends.json 等构建数据
friends/entries/      友链申请 JSON（构建时汇总到 data/friends.json）
public/               静态资源（图片、图标精灵、桌面模式、编辑器上传的文件）
themes/mumuemhaha/    Hugo 主题：layouts 模板、i18n 文案、static/hugo-theme 下的 CSS / JS
scripts/              构建、数据更新、友链自动审核与校验脚本
edge-functions/       EdgeOne 边缘函数（账号接口）
cloud-functions/      EdgeOne 云函数（访客统计）
studio/               私有写作编辑器与留言板后端（部署在 Cloudflare Workers + R2）
```

## 本地开发

需要 Node.js 22+ 与 pnpm，Hugo 由 `hugo-bin` 自动提供，无需单独安装。

```bash
pnpm install
pnpm dev          # Hugo 开发服务器（包含草稿），默认 http://localhost:1313
pnpm build        # 完整生产构建，输出到 dist/
pnpm serve        # 在 http://localhost:4321 预览 dist/
```

`pnpm build` 依次执行：生成响应式图片 → 汇总友链 → 更新番剧数据 → Hugo 构建 → 加密受保护文章 → 生成 API 与订阅 → Pagefind 索引 → `scripts/validate-hugo-build.mjs` 校验。校验失败会中止部署。

### 修改主题样式或脚本时

`/hugo-theme/*` 与 `/icons/*` 在 EdgeOne 上设置了一年的不可变缓存（见 `edgeone.json`）。修改 `themes/mumuemhaha/static/hugo-theme/` 下的 CSS / JS 后，需要同时更新：

1. `themes/mumuemhaha/layouts/_default/baseof.html` 中的 `?v=` 版本号；
2. `scripts/validate-hugo-build.mjs` 中对应的版本断言。

修改 `public/icons/lucide-sprite.svg` 时同理，更新 `layouts/partials/icon.html` 与 `hugo.js` 中的 `?v=`。

## 写作

推荐使用 [`studio/`](studio/README.md) 编辑器（部署在 Cloudflare Workers，`https://markdown.inc.re`）：它通过 GitHub API 把文章提交到 `content/posts/`，图片、视频、资源和内嵌网页分别上传到 `public/image/editor/`、`public/video/editor/`、`public/resource/editor/`、`public/web-pages/editor/`。提交到 `main` 后由 EdgeOne Pages 自动构建上线。

也可以直接编辑 Markdown，常用 Front Matter：

```yaml
---
title: 文章标题
published: 2026-10-04
updated: 2026-10-05        # 可选，显示“更新于”
description: 列表与分享时显示的简介
image: /image/editor/cover.webp
tags: [Linux, Docker]
category: 服务器
draft: false               # true 时不会出现在线上
pinned: false              # 置顶，配合 priority 排序
comment: true              # 是否开启评论
encrypted: false           # 设为 true 并填写 password 即为密码保护文章
password: ''
passwordHint: ''
translationKey: my-post    # 与 .en.md / .ja.md 译文关联
---
```

### Markdown 扩展

| 写法 | 效果 |
| --- | --- |
| `[标题](https://example.com "astro-link-card")` | 链接卡片 |
| `[标题](/web-pages/editor/... "astro-web-embed:640")` | 内嵌网页（高度 320–1200） |
| `$$ ... $$`、`\[ ... \]` | 块级公式（构建时由 KaTeX 渲染） |
| `\( ... \)` | 行内公式 |
| `<video controls src="..."></video>` | 视频 |

单个 `$` 不会被识别为公式，以免误伤 Shell 变量和价格等普通文本。

## 自动化

- **友链自动审核与同步**：在自己站点的 `/friends` 页面添加 `https://vmss.cn` 后，在 `friends/entries/` 新建一个不重复的 `.json` 文件（格式见 `friends/schema.json`）并提交 PR。`.github/workflows/friends-review.yml`（`scripts/review-friend-pr.mjs`）会自动执行安全隔离校验（仅允许新增 `friends/entries/*.json`）、JSON 格式与重复项校验以及 `/friends` 互链校验；全部通过则自动合并到 `main` 触发 EdgeOne Pages 自动构建上线，未通过则自动关闭并说明原因。
- **SEO 与搜索引擎收录优化**：
  - 构建自动生成 `robots.txt`、多语言索引 `sitemap.xml`、扁平化 `sitemap-urls.xml` 与纯文本 `urls.txt`，过滤历史无效路由与单篇薄标签页，并输出完整 `canonical`、Schema.org JSON-LD（`WebSite` / `BlogPosting` / `WebApplication` / `BreadcrumbList`）、百度移动适配防转码标签、文章单 `<h1>` 语义层级与相关文章内链。
  - 可在 `hugo.yaml` 的 `params.seo` 中填写 `baiduSiteVerification` / `googleSiteVerification` / `bingSiteVerification` 输出站长验证 `<meta>` 标签。

## 许可与致谢

本项目以 Apache License 2.0 发布，详见 [LICENSE](LICENSE)。项目最初基于 [Mizuki](https://github.com/matsuzaka-yuki/Mizuki)，其上游 [Fuwari](https://github.com/saicaca/fuwari) 以 MIT License 发布，原始版权与许可声明保留在 [LICENSE.MIT](LICENSE.MIT) 中。

文章内容除特别说明外以 CC BY-NC-SA 4.0 许可发布。
