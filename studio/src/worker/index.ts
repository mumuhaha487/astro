import YAML from "yaml";
import { unzipSync } from "fflate";

import seedPostIndex from "../../public/post-index.json";
import type {
  DraftDocument,
  DraftSummary,
  PostDocument,
  PostMeta,
  PostRevision,
  PostRevisionDocument,
  ScheduledPost,
  SessionInfo,
  WebEmbedRecord,
} from "../shared/types";
import { validateScheduleTime } from "../shared/schedule";
import { fetchLinkPreview, LinkPreviewError } from "../shared/link-preview";
import { clampWebEmbedHeight } from "../shared/web-embed";

export interface ObjectBucket {
  get(key: string): Promise<{ json<T>(): Promise<T> } | null>;
  put(key: string, value: string | ArrayBuffer | ArrayBufferView | ReadableStream, options?: unknown): Promise<void>;
  delete(key: string): Promise<void>;
  list(options?: { prefix?: string; limit?: number }): Promise<{ objects: Array<{ key: string }> }>;
}

export interface BlogStudioEnv {
  ASSETS: Pick<Fetcher, "fetch">;
  DRAFTS: ObjectBucket;
  EDITOR_PASSWORD: string;
  SESSION_SECRET: string;
  GITHUB_TOKEN?: string;
  GITHUB_OWNER: string;
  GITHUB_REPO: string;
  GITHUB_BRANCH: string;
}

type Env = BlogStudioEnv;

interface GitHubTreeItem {
  path: string;
  mode: string;
  type: "blob" | "tree";
  sha: string;
  size?: number;
  url: string;
}

interface GitHubTreeResponse {
  sha: string;
  truncated: boolean;
  tree: GitHubTreeItem[];
}

interface GitHubCommitListItem {
  sha: string;
  html_url: string;
  author?: { login?: string } | null;
  commit: {
    message: string;
    author?: { name?: string; date?: string } | null;
    committer?: { name?: string; date?: string } | null;
  };
}

interface StoredGitHubToken {
  iv: string;
  cipher: string;
  login: string;
  updatedAt: string;
}

interface StoredPassword {
  salt: string;
  hash: string;
  iterations: number;
}

class HttpError extends Error {
  status: number;
  code?: string;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

const SESSION_COOKIE = "astro_studio_session";
const SESSION_MAX_AGE = 60 * 60 * 12;
const POST_PREFIX = "content/posts/";
const MAX_DOCUMENT_BYTES = 2 * 1024 * 1024;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_MEDIA_BYTES = 25 * 1024 * 1024;
const MAX_RESOURCE_BYTES = 25 * 1024 * 1024;
const MAX_WEB_ARCHIVE_BYTES = 20 * 1024 * 1024;
const MAX_WEB_TOTAL_BYTES = 40 * 1024 * 1024;
const MAX_WEB_FILE_BYTES = 20 * 1024 * 1024;
const MAX_WEB_FILES = 240;

const webEmbedSecurityHeaders: Record<string, string> = {
  "Content-Security-Policy": [
    "default-src 'self' data: blob: https:",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: https:",
    "style-src 'self' 'unsafe-inline' https:",
    "img-src 'self' data: blob: https:",
    "media-src 'self' data: blob: https:",
    "font-src 'self' data: https:",
    "connect-src 'self' https: wss:",
    "object-src 'none'",
    "base-uri 'self'",
    "frame-ancestors 'self'",
  ].join("; "),
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=()",
  "X-Robots-Tag": "noindex, nofollow",
};

const securityHeaders: Record<string, string> = {
  "Content-Security-Policy": [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "media-src 'self' blob: https:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'none'",
    "frame-ancestors 'none'",
    "form-action 'self'",
  ].join("; "),
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=()",
  "Cross-Origin-Opener-Policy": "same-origin",
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    try {
      if (url.pathname.startsWith("/api/")) {
        const response = await routeApi(request, env, url);
        return secureResponse(response, true);
      }
      const repositoryAssetPath = repositoryPublicAssetPath(url.pathname);
      if (repositoryAssetPath && (request.method === "GET" || request.method === "HEAD")) {
        const webEmbed = repositoryAssetPath.startsWith("public/web-pages/editor/");
        return secureResponse(await proxyEditorAsset(request, env, repositoryAssetPath), false, webEmbed);
      }
      const response = await env.ASSETS.fetch(request);
      return secureResponse(response, false);
    } catch (error) {
      const status = error instanceof HttpError ? error.status : 500;
      const message =
        error instanceof HttpError ? error.message : "服务器暂时无法处理该请求";
      const code = error instanceof HttpError ? error.code : undefined;
      return secureResponse(json({ error: message, ...(code ? { code } : {}) }, status), true);
    }
  },
  async scheduled(_controller: ScheduledController, env: Env, context: ExecutionContext): Promise<void> {
    context.waitUntil(publishScheduledPosts(env));
  },
};

async function routeApi(request: Request, env: Env, url: URL): Promise<Response> {
  if (!["GET", "HEAD", "OPTIONS"].includes(request.method)) {
    assertSameOrigin(request, url);
  }
  if (request.method === "OPTIONS") return new Response(null, { status: 204 });

  if (url.pathname === "/api/login" && request.method === "POST") {
    return login(request, env);
  }

  if (!(await isAuthenticated(request, env))) {
    throw new HttpError(401, "登录已过期，请重新登录", "UNAUTHORIZED");
  }

  if (url.pathname === "/api/session" && request.method === "GET") {
    return json(await getSessionInfo(env));
  }
  if (url.pathname === "/api/link-preview" && request.method === "GET") {
    try {
      return json(await fetchLinkPreview(url.searchParams.get("url") || ""));
    } catch (error) {
      if (error instanceof LinkPreviewError) throw new HttpError(error.status, error.message);
      throw error;
    }
  }
  if (url.pathname === "/api/asset" && ["GET", "HEAD"].includes(request.method)) {
    const repositoryPath = repositoryPublicAssetPath(url.searchParams.get("path") || "");
    if (!repositoryPath) throw new HttpError(400, "静态资源路径无效");
    return proxyEditorAsset(request, env, repositoryPath);
  }
  if (url.pathname === "/api/logout" && request.method === "POST") {
    return json({}, 200, { "Set-Cookie": expiredSessionCookie() });
  }
  if (url.pathname === "/api/posts" && request.method === "GET") {
    return json(await listPosts(env, url.searchParams.get("refresh") === "1"));
  }
  if (url.pathname === "/api/post" && request.method === "GET") {
    const path = assertPostPath(url.searchParams.get("path"));
    return json(await getPost(env, path));
  }
  if (url.pathname === "/api/history" && request.method === "GET") {
    const path = assertPostPath(url.searchParams.get("path"));
    return json({ revisions: await listPostHistory(env, path) });
  }
  if (url.pathname === "/api/history/content" && request.method === "GET") {
    const path = assertPostPath(url.searchParams.get("path"));
    return json(await getPostRevision(env, path, assertCommitSha(url.searchParams.get("sha"))));
  }
  if (url.pathname === "/api/post" && request.method === "PUT") {
    return json(await savePost(env, await readJson(request)));
  }
  if (url.pathname === "/api/post" && request.method === "DELETE") {
    await deletePost(env, await readJson(request));
    return new Response(null, { status: 204 });
  }
  if (url.pathname === "/api/drafts" && request.method === "GET") {
    return json({ drafts: await listDrafts(env) });
  }
  if (url.pathname === "/api/draft" && request.method === "GET") {
    return json(await getDraft(env, url.searchParams.get("key")));
  }
  if (url.pathname === "/api/draft" && request.method === "PUT") {
    return json(await saveDraft(env, await readJson(request)));
  }
  if (url.pathname === "/api/draft" && request.method === "DELETE") {
    const body = await readJson<{ key?: string }>(request);
    await deleteDraft(env, body.key);
    return new Response(null, { status: 204 });
  }
  if (url.pathname === "/api/schedule" && request.method === "PUT") {
    return json(await saveScheduledPost(env, await readJson(request)));
  }
  if (url.pathname === "/api/image" && request.method === "POST") {
    return json(await uploadImage(env, request));
  }
  if (url.pathname === "/api/media" && request.method === "POST") {
    return json(await uploadMedia(env, request));
  }
  if (url.pathname === "/api/resources" && request.method === "GET") {
    return json({ resources: await listResources(env) });
  }
  if (url.pathname === "/api/resources" && request.method === "POST") {
    return json(await uploadResource(env, request));
  }
  if (url.pathname === "/api/web-embeds" && request.method === "POST") {
    return json(await uploadWebEmbed(env, request));
  }
  if (url.pathname === "/api/settings/github" && request.method === "PUT") {
    return json(await connectGitHub(env, await readJson(request)));
  }
  if (url.pathname === "/api/settings/github" && request.method === "DELETE") {
    await env.DRAFTS.delete("config/github-token");
    return new Response(null, { status: 204 });
  }
  if (url.pathname === "/api/settings/password" && request.method === "PUT") {
    await changePassword(env, await readJson(request));
    return new Response(null, { status: 204 });
  }

  throw new HttpError(404, "接口不存在");
}

async function login(request: Request, env: Env): Promise<Response> {
  const ip = request.headers.get("CF-Connecting-IP") || "local";
  await enforceLoginLimit(env, ip);
  const body = await readJson<{ password?: string }>(request);
  if (typeof body.password !== "string" || !(await verifyEditorPassword(env, body.password))) {
    await recordLoginFailure(env, ip);
    throw new HttpError(401, "密码不正确", "INVALID_PASSWORD");
  }
  await clearLoginFailures(env, ip);

  const token = await createSession(env);
  const info = await getSessionInfo(env);
  return json(info, 200, { "Set-Cookie": sessionCookie(token) });
}

async function getSessionInfo(env: Env): Promise<SessionInfo> {
  const stored = await readJsonObject<StoredGitHubToken>(env.DRAFTS, "config/github-token");
  return {
    authenticated: true,
    github: {
      connected: Boolean(env.GITHUB_TOKEN || stored?.cipher),
      login: stored?.login,
      repository: `${env.GITHUB_OWNER}/${env.GITHUB_REPO}`,
      branch: env.GITHUB_BRANCH,
    },
  };
}

async function listPosts(
  env: Env,
  forceRefresh: boolean,
): Promise<{ posts: PostMeta[]; stale?: boolean }> {
  const cached = await readJsonObject<{ generatedAt: number; posts: PostMeta[] }>(
    env.DRAFTS,
    "cache/posts-index",
  );
  if (!forceRefresh && cached && Date.now() - cached.generatedAt < 120_000) {
    return { posts: cached.posts };
  }

  const fallbackPosts = cached?.posts ?? loadSeedPosts();

  try {
    const token = await getGitHubToken(env);
    const tree = await githubJson<GitHubTreeResponse>(
      env,
      `/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/git/trees/${encodeURIComponent(env.GITHUB_BRANCH)}?recursive=1`,
      { method: "GET" },
      token,
    );
    if (tree.truncated) {
      throw new HttpError(502, "仓库文件树过大，GitHub 返回了截断结果");
    }

    const files = tree.tree.filter(
      (item) =>
        item.type === "blob" &&
        item.path.startsWith(POST_PREFIX) &&
        item.path.toLowerCase().endsWith(".md"),
    );
    const knownPosts = new Map(fallbackPosts.map((post) => [post.path, post]));
    const posts = await mapConcurrent(files, 8, async (file) => {
      const known = knownPosts.get(file.path);
      if (known?.sha === file.sha) return known;
      const response = await fetch(rawGitHubUrl(env, file.path), {
        headers: { "User-Agent": "astro-blog-studio" },
      });
      if (!response.ok) {
        throw new HttpError(502, `无法读取文章：${file.path}`);
      }
      return parsePostMeta(file.path, file.sha, await response.text());
    });
    posts.sort(comparePosts);
    await writePostsCache(env, posts);
    return { posts };
  } catch (error) {
    if (fallbackPosts.length > 0) return { posts: fallbackPosts, stale: true };
    throw error;
  }
}

async function getPost(env: Env, path: string): Promise<PostDocument> {
  const token = await getGitHubToken(env);
  const result = await githubJson<{ content: string; encoding: string; sha: string }>(
    env,
    `/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/contents/${encodeGitHubPath(path)}?ref=${encodeURIComponent(env.GITHUB_BRANCH)}`,
    { method: "GET" },
    token,
  );
  if (result.encoding !== "base64") {
    throw new HttpError(502, "GitHub 返回了不支持的文章编码");
  }
  return { path, sha: result.sha, content: fromBase64(result.content) };
}

async function listPostHistory(env: Env, path: string): Promise<PostRevision[]> {
  const token = await getGitHubToken(env);
  const commits = await githubJson<GitHubCommitListItem[]>(
    env,
    `/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/commits?sha=${encodeURIComponent(env.GITHUB_BRANCH)}&path=${encodeURIComponent(path)}&per_page=30`,
    { method: "GET" },
    token,
  );
  return commits.map((item) => ({
    sha: item.sha,
    message: item.commit.message.split("\n", 1)[0]?.slice(0, 240) || "更新文章",
    author: item.author?.login || item.commit.author?.name || item.commit.committer?.name || "未知作者",
    committedAt: item.commit.author?.date || item.commit.committer?.date || "",
    htmlUrl: item.html_url,
  }));
}

async function getPostRevision(env: Env, path: string, commitSha: string): Promise<PostRevisionDocument> {
  const token = await getGitHubToken(env);
  const result = await githubJson<{ content: string; encoding: string }>(
    env,
    `/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/contents/${encodeGitHubPath(path)}?ref=${commitSha}`,
    { method: "GET" },
    token,
  );
  if (result.encoding !== "base64") {
    throw new HttpError(502, "GitHub 返回了不支持的文章编码");
  }
  return { path, commitSha, content: fromBase64(result.content) };
}

async function savePost(env: Env, input: unknown): Promise<PostDocument> {
  const body = input as Partial<PostDocument> & { message?: string };
  const path = assertPostPath(body.path);
  if (typeof body.content !== "string") throw new HttpError(400, "文章内容无效");
  assertByteLength(body.content, MAX_DOCUMENT_BYTES, "文章内容不能超过 2 MB");
  const token = await requireGitHubToken(env);
  const payload: Record<string, unknown> = {
    message: cleanCommitMessage(body.message, `更新文章：${path.slice(POST_PREFIX.length)}`),
    content: toBase64(body.content),
    branch: env.GITHUB_BRANCH,
  };
  if (body.sha) payload.sha = body.sha;

  const result = await githubJson<{ content: { sha: string } }>(
    env,
    `/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/contents/${encodeGitHubPath(path)}`,
    { method: "PUT", body: JSON.stringify(payload) },
    token,
  );
  await upsertPostCache(env, parsePostMeta(path, result.content.sha, body.content));
  return { path, sha: result.content.sha, content: body.content };
}

async function deletePost(env: Env, input: unknown): Promise<void> {
  const body = input as { path?: string; sha?: string };
  const path = assertPostPath(body.path);
  if (!body.sha) throw new HttpError(400, "缺少文章版本信息");
  const token = await requireGitHubToken(env);
  await githubJson(
    env,
    `/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/contents/${encodeGitHubPath(path)}`,
    {
      method: "DELETE",
      body: JSON.stringify({
        message: `删除文章：${path.slice(POST_PREFIX.length)}`,
        sha: body.sha,
        branch: env.GITHUB_BRANCH,
      }),
    },
    token,
  );
  await removePostFromCache(env, path);
}

async function listDrafts(env: Env): Promise<DraftSummary[]> {
  const listing = await env.DRAFTS.list({ prefix: "drafts/", limit: 1000 });
  const drafts = await mapConcurrent(listing.objects, 8, async (entry) => {
    const document = await readJsonObject<DraftDocument>(env.DRAFTS, entry.key);
    if (!document) return null;
    const { key, path, title, updatedAt, isNew } = document;
    return { key, path, title, updatedAt, isNew } satisfies DraftSummary;
  });
  return drafts
    .filter((draft): draft is DraftSummary => Boolean(draft))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

async function getDraft(env: Env, key: string | null): Promise<DraftDocument> {
  const safeKey = assertDraftKey(key);
  const draft = await readJsonObject<DraftDocument>(env.DRAFTS, `drafts/${safeKey}`);
  if (!draft) throw new HttpError(404, "草稿不存在");
  return draft;
}

async function saveDraft(env: Env, input: unknown): Promise<DraftSummary> {
  const body = input as Partial<DraftDocument>;
  if (typeof body.content !== "string") throw new HttpError(400, "草稿内容无效");
  assertByteLength(body.content, MAX_DOCUMENT_BYTES, "草稿内容不能超过 2 MB");
  const key = body.key ? assertDraftKey(body.key) : crypto.randomUUID().replaceAll("-", "");
  const path = typeof body.path === "string" ? body.path : "";
  if (path && !path.startsWith("draft:") && !isPostPath(path)) {
    throw new HttpError(400, "草稿路径无效");
  }
  const document: DraftDocument = {
    key,
    path,
    sha: typeof body.sha === "string" ? body.sha : "",
    title: typeof body.title === "string" ? body.title.slice(0, 200) : "未命名文章",
    updatedAt: new Date().toISOString(),
    isNew: body.isNew === true,
    content: body.content,
  };
  await env.DRAFTS.put(`drafts/${key}`, JSON.stringify(document), {
    httpMetadata: { contentType: "application/json" },
  });
  const { content: _content, sha: _sha, ...summary } = document;
  return summary;
}

async function deleteDraft(env: Env, key: string | undefined): Promise<void> {
  await env.DRAFTS.delete(`drafts/${assertDraftKey(key ?? null)}`);
}

async function saveScheduledPost(env: Env, input: unknown): Promise<ScheduledPost> {
  const body = input as Partial<ScheduledPost>;
  const path = assertPostPath(body.path);
  if (typeof body.content !== "string") throw new HttpError(400, "定时发布内容无效");
  assertByteLength(body.content, MAX_DOCUMENT_BYTES, "文章内容不能超过 2 MB");
  const publishAt = typeof body.publishAt === "string" ? new Date(body.publishAt) : new Date(Number.NaN);
  const scheduleTimeError = validateScheduleTime(publishAt);
  if (scheduleTimeError === "invalid" || scheduleTimeError === "too-early") {
    throw new HttpError(400, "定时发布时间至少需要晚于当前时间 4 小时");
  }
  if (scheduleTimeError === "too-late") {
    throw new HttpError(400, "定时发布时间不能超过 7 天");
  }
  await requireGitHubToken(env);
  const schedule: ScheduledPost = {
    key: crypto.randomUUID().replaceAll("-", ""),
    path,
    sha: typeof body.sha === "string" ? body.sha : "",
    title: typeof body.title === "string" ? body.title.slice(0, 200) : "未命名文章",
    publishAt: publishAt.toISOString(),
    content: body.content,
    createdAt: new Date().toISOString(),
  };
  await env.DRAFTS.put(`schedules/${schedule.key}`, JSON.stringify(schedule), {
    httpMetadata: { contentType: "application/json" },
  });
  return schedule;
}

async function publishScheduledPosts(env: Env): Promise<void> {
  const listing = await env.DRAFTS.list({ prefix: "schedules/", limit: 1000 });
  const now = Date.now();
  await mapConcurrent(listing.objects, 3, async (entry) => {
    const schedule = await readJsonObject<ScheduledPost>(env.DRAFTS, entry.key);
    if (!schedule || new Date(schedule.publishAt).getTime() > now) return;
    await savePost(env, {
      path: schedule.path,
      sha: schedule.sha,
      content: schedule.content,
      message: `定时发布文章：${schedule.title}`,
    });
    await env.DRAFTS.delete(entry.key);
  });
}

async function uploadImage(env: Env, request: Request): Promise<{ path: string; url: string }> {
  const token = await requireGitHubToken(env);
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) throw new HttpError(400, "请选择图片文件");
  const allowedTypes: Record<string, string> = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/gif": "gif",
    "image/webp": "webp",
    "image/avif": "avif",
    "image/bmp": "bmp",
  };
  const extension = allowedTypes[file.type];
  if (!extension) throw new HttpError(415, "仅支持 PNG、JPEG、GIF、BMP、WebP 和 AVIF 图片");
  if (file.size > MAX_IMAGE_BYTES) throw new HttpError(413, "单张图片不能超过 5 MB");

  const now = new Date();
  const id = crypto.randomUUID().replaceAll("-", "").slice(0, 16);
  const relativePath = `image/editor/${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, "0")}/${id}.${extension}`;
  const repositoryPath = `public/${relativePath}`;
  const bytes = new Uint8Array(await file.arrayBuffer());
  await githubJson(
    env,
    `/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/contents/${encodeGitHubPath(repositoryPath)}`,
    {
      method: "PUT",
      body: JSON.stringify({
        message: `上传文章图片：${id}.${extension}`,
        content: bytesToBase64(bytes),
        branch: env.GITHUB_BRANCH,
      }),
    },
    token,
  );
  return { path: repositoryPath, url: `/${relativePath}` };
}

async function uploadMedia(env: Env, request: Request): Promise<{ path: string; url: string }> {
  const token = await requireGitHubToken(env);
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) throw new HttpError(400, "请选择视频文件");
  const allowedTypes: Record<string, string> = {
    "video/mp4": "mp4",
    "video/webm": "webm",
    "video/ogg": "ogv",
  };
  const extension = allowedTypes[file.type];
  if (!extension) throw new HttpError(415, "仅支持 MP4、WebM 和 Ogg 视频");
  if (file.size > MAX_MEDIA_BYTES) throw new HttpError(413, "单个视频不能超过 25 MB");

  const now = new Date();
  const id = crypto.randomUUID().replaceAll("-", "").slice(0, 16);
  const relativePath = `video/editor/${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, "0")}/${id}.${extension}`;
  const repositoryPath = `public/${relativePath}`;
  const bytes = new Uint8Array(await file.arrayBuffer());
  await githubJson(
    env,
    `/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/contents/${encodeGitHubPath(repositoryPath)}`,
    {
      method: "PUT",
      body: JSON.stringify({
        message: `上传文章视频：${id}.${extension}`,
        content: bytesToBase64(bytes),
        branch: env.GITHUB_BRANCH,
      }),
    },
    token,
  );
  return { path: repositoryPath, url: `/${relativePath}` };
}

interface ResourceRecord {
  path: string;
  url: string;
  name: string;
  size: number;
  description?: string;
  category?: string;
  tags?: string[];
}

async function listResources(env: Env): Promise<ResourceRecord[]> {
  const token = await requireGitHubToken(env);
  const tree = await githubJson<{
    tree?: Array<{ path?: string; type?: string; size?: number }>;
  }>(
    env,
    `/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/git/trees/${encodeURIComponent(env.GITHUB_BRANCH)}?recursive=1`,
    { method: "GET" },
    token,
  );
  return (tree.tree || [])
    .filter((entry) => entry.type === "blob" && entry.path?.startsWith("public/resource/editor/"))
    .map((entry) => {
      const path = entry.path || "";
      const storedName = path.split("/").pop() || "resource";
      return {
        path,
        url: repositoryPathToPublicUrl(path),
        name: storedName.replace(/^[a-f0-9]{16}-/, ""),
        size: entry.size || 0,
      };
    })
    .sort((a, b) => b.path.localeCompare(a.path));
}

async function uploadResource(env: Env, request: Request): Promise<ResourceRecord> {
  const token = await requireGitHubToken(env);
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) throw new HttpError(400, "请选择代码包资源");

  const name = String(form.get("name") || "").trim();
  const description = String(form.get("description") || "").trim();
  const category = String(form.get("category") || "").trim();
  let tags: string[] = [];
  try {
    const parsed = JSON.parse(String(form.get("tags") || "[]"));
    if (Array.isArray(parsed)) tags = parsed.map(String).map((tag) => tag.trim()).filter(Boolean);
  } catch {
    throw new HttpError(400, "资源标签格式无效");
  }
  if (!name || name.length > 64) throw new HttpError(400, "资源名称需要在 1 到 64 个字符之间");
  if (!description || description.length > 500) throw new HttpError(400, "资源描述需要在 1 到 500 个字符之间");
  if (!category || category.length > 32) throw new HttpError(400, "请选择有效的资源分类");
  if (tags.length > 5 || tags.some((tag) => tag.length > 24)) throw new HttpError(400, "最多添加 5 个资源标签，每个标签不超过 24 个字符");
  if (file.size === 0) throw new HttpError(400, "资源文件不能为空");
  if (file.size > MAX_RESOURCE_BYTES) throw new HttpError(413, "单个资源不能超过 25 MB");

  const originalName = (file.name.split(/[\\/]/).pop() || "resource").normalize("NFKC");
  const extension = originalName.includes(".") ? originalName.split(".").pop()?.toLowerCase() || "" : "";
  const allowedExtensions = new Set(["zip", "rar", "7z", "tar", "gz", "tgz", "bz2", "xz", "pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx"]);
  if (!allowedExtensions.has(extension)) throw new HttpError(415, "仅支持压缩包、PDF 和常用 Office 文档");

  const safeOriginalName = originalName
    .replace(/[^\p{L}\p{N}._-]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(-96) || `resource.${extension}`;
  const now = new Date();
  const id = crypto.randomUUID().replaceAll("-", "").slice(0, 16);
  const relativePath = `resource/editor/${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, "0")}/${id}-${safeOriginalName}`;
  const repositoryPath = `public/${relativePath}`;
  const bytes = new Uint8Array(await file.arrayBuffer());
  await githubJson(
    env,
    `/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/contents/${encodeGitHubPath(repositoryPath)}`,
    {
      method: "PUT",
      body: JSON.stringify({
        message: `上传文章资源：${name}`,
        content: bytesToBase64(bytes),
        branch: env.GITHUB_BRANCH,
      }),
    },
    token,
  );
  return {
    path: repositoryPath,
    url: repositoryPathToPublicUrl(repositoryPath),
    name,
    size: file.size,
    description,
    category,
    tags,
  };
}

interface WebUploadFile {
  path: string;
  bytes: Uint8Array;
}

const WEB_FILE_EXTENSIONS = new Set([
  "html", "htm", "css", "js", "mjs", "json", "map", "txt", "xml", "csv",
  "wasm", "data", "bin", "webmanifest", "glb", "gltf", "obj", "mtl",
  "png", "jpg", "jpeg", "gif", "webp", "avif", "svg", "ico", "bmp",
  "woff", "woff2", "ttf", "otf", "eot",
  "mp3", "wav", "ogg", "oga", "mp4", "webm", "ogv",
]);

async function uploadWebEmbed(env: Env, request: Request): Promise<WebEmbedRecord> {
  const token = await requireGitHubToken(env);
  const form = await request.formData();
  const title = String(form.get("title") || "").trim();
  const sourceType = form.get("sourceType") === "zip" ? "zip" : "html";
  const height = clampWebEmbedHeight(Number(form.get("height")));
  const uploads = form.getAll("files").filter((value): value is File => value instanceof File);

  if (!title || title.length > 100) throw new HttpError(400, "网页标题需要在 1 到 100 个字符之间");
  if (uploads.length === 0) throw new HttpError(400, "请选择 HTML 网页、JS 文件或 ZIP 压缩包");

  let files: WebUploadFile[];
  if (sourceType === "zip") {
    if (uploads.length !== 1 || fileExtension(uploads[0].name) !== "zip") {
      throw new HttpError(415, "ZIP 模式仅支持上传一个 .zip 压缩包");
    }
    if (uploads[0].size === 0) throw new HttpError(400, "ZIP 压缩包不能为空");
    if (uploads[0].size > MAX_WEB_ARCHIVE_BYTES) throw new HttpError(413, "ZIP 压缩包不能超过 20 MB");
    files = extractWebArchive(new Uint8Array(await uploads[0].arrayBuffer()));
  } else {
    if (uploads.length > MAX_WEB_FILES) throw new HttpError(413, `网页文件不能超过 ${MAX_WEB_FILES} 个`);
    let paths: string[] = [];
    try {
      const parsed = JSON.parse(String(form.get("paths") || "[]"));
      if (Array.isArray(parsed)) paths = parsed.map(String);
    } catch {
      throw new HttpError(400, "网页文件路径格式无效");
    }
    if (paths.length !== 0 && paths.length !== uploads.length) throw new HttpError(400, "网页文件与路径数量不一致");
    files = await Promise.all(uploads.map(async (file, index) => {
      if (file.size > MAX_WEB_FILE_BYTES) throw new HttpError(413, `网页文件 ${file.name} 不能超过 20 MB`);
      return {
        path: normalizeWebFilePath(paths[index] || file.name),
        bytes: new Uint8Array(await file.arrayBuffer()),
      };
    }));
  }

  files = normalizeWebFiles(files);
  let entry = selectWebEntry(files, String(form.get("entry") || ""));
  if (!entry) {
    const runnableFiles = files.filter((file) => ["js", "mjs", "css"].includes(fileExtension(file.path)));
    if (runnableFiles.length === 0) throw new HttpError(400, "静态网页中至少需要一个 HTML 或 JS 文件");
    files.push({ path: "index.html", bytes: new TextEncoder().encode(generatedWebEntry(title, runnableFiles)) });
    files = normalizeWebFiles(files);
    entry = "index.html";
  }

  const totalSize = files.reduce((total, file) => total + file.bytes.byteLength, 0);
  if (totalSize > MAX_WEB_TOTAL_BYTES) throw new HttpError(413, "网页解压后的总大小不能超过 40 MB");

  const id = await webBundleId(files);
  const root = `public/web-pages/editor/${sourceType}/${id}`;
  const repositoryEntry = `${root}/${entry}`;
  if (await githubPathExists(env, repositoryEntry, token)) {
    return webEmbedRecord({ id, root, entry, title, height, files, sourceType, reused: true });
  }

  await commitWebFiles(env, token, root, files, title);
  return webEmbedRecord({ id, root, entry, title, height, files, sourceType, reused: false });
}

function extractWebArchive(bytes: Uint8Array): WebUploadFile[] {
  let fileCount = 0;
  let totalSize = 0;
  let validationError = "";
  try {
    const extracted = unzipSync(bytes, {
      filter(info) {
        if (info.name.endsWith("/") || isIgnoredArchivePath(info.name)) return false;
        fileCount += 1;
        totalSize += info.originalSize;
        if (fileCount > MAX_WEB_FILES) validationError = `ZIP 解压后的文件不能超过 ${MAX_WEB_FILES} 个`;
        if (info.originalSize > MAX_WEB_FILE_BYTES) validationError = `ZIP 中的单个文件不能超过 20 MB：${info.name}`;
        if (totalSize > MAX_WEB_TOTAL_BYTES) validationError = "ZIP 解压后的总大小不能超过 40 MB";
        return !validationError;
      },
    });
    if (validationError) throw new HttpError(413, validationError);
    return Object.entries(extracted)
      .filter(([path]) => !path.endsWith("/") && !isIgnoredArchivePath(path))
      .map(([path, content]) => ({ path: normalizeWebFilePath(path), bytes: content }));
  } catch (error) {
    if (error instanceof HttpError) throw error;
    throw new HttpError(400, "ZIP 压缩包已损坏或使用了不支持的压缩格式");
  }
}

function normalizeWebFiles(files: WebUploadFile[]): WebUploadFile[] {
  if (files.length === 0) throw new HttpError(400, "静态网页中没有可上传的文件");
  if (files.length > MAX_WEB_FILES) throw new HttpError(413, `网页文件不能超过 ${MAX_WEB_FILES} 个`);
  const unique = new Map<string, WebUploadFile>();
  let totalSize = 0;
  for (const file of files) {
    const path = normalizeWebFilePath(file.path);
    const extension = fileExtension(path);
    if (extension && !WEB_FILE_EXTENSIONS.has(extension)) {
      throw new HttpError(415, `不支持网页文件类型：${path}`);
    }
    if (file.bytes.byteLength > MAX_WEB_FILE_BYTES) throw new HttpError(413, `网页文件 ${path} 不能超过 20 MB`);
    if (unique.has(path.toLocaleLowerCase())) throw new HttpError(409, `网页包内存在重名文件：${path}`);
    unique.set(path.toLocaleLowerCase(), { path, bytes: file.bytes });
    totalSize += file.bytes.byteLength;
  }
  if (totalSize > MAX_WEB_TOTAL_BYTES) throw new HttpError(413, "网页文件总大小不能超过 40 MB");
  return [...unique.values()].sort((left, right) => left.path.localeCompare(right.path));
}

function normalizeWebFilePath(value: string): string {
  const normalized = value.normalize("NFKC").replace(/^\.\//, "");
  if (!normalized || normalized.length > 300 || normalized.startsWith("/") || normalized.includes("\\") || /[\u0000-\u001f\u007f]/.test(normalized)) {
    throw new HttpError(400, `网页文件路径无效：${value.slice(0, 80)}`);
  }
  const segments = normalized.split("/");
  if (segments.some((segment) => !segment || segment === "." || segment === ".." || segment.length > 120)) {
    throw new HttpError(400, `网页文件路径无效：${value.slice(0, 80)}`);
  }
  return segments.join("/");
}

function isIgnoredArchivePath(path: string): boolean {
  return path.startsWith("__MACOSX/") || path.endsWith("/.DS_Store") || path === ".DS_Store";
}

function selectWebEntry(files: WebUploadFile[], requested: string): string | null {
  if (requested.trim()) {
    const normalized = normalizeWebFilePath(requested.trim());
    if (!files.some((file) => file.path === normalized) || !["html", "htm"].includes(fileExtension(normalized))) {
      throw new HttpError(400, "选择的网页入口不存在或不是 HTML 文件");
    }
    return normalized;
  }
  const htmlFiles = files.filter((file) => ["html", "htm"].includes(fileExtension(file.path)));
  const rootIndex = htmlFiles.find((file) => file.path.toLocaleLowerCase() === "index.html");
  if (rootIndex) return rootIndex.path;
  const nestedIndexes = htmlFiles
    .filter((file) => file.path.toLocaleLowerCase().endsWith("/index.html"))
    .sort((left, right) => left.path.split("/").length - right.path.split("/").length || left.path.localeCompare(right.path));
  if (nestedIndexes[0]) return nestedIndexes[0].path;
  return htmlFiles
    .sort((left, right) => left.path.split("/").length - right.path.split("/").length || left.path.localeCompare(right.path))[0]?.path || null;
}

function generatedWebEntry(title: string, files: WebUploadFile[]): string {
  const styles = files
    .filter((file) => fileExtension(file.path) === "css")
    .map((file) => `<link rel="stylesheet" href="${escapeHtmlAttribute(encodePublicPath(file.path))}">`)
    .join("\n");
  const scripts = files
    .filter((file) => ["js", "mjs"].includes(fileExtension(file.path)))
    .map((file) => `<script${fileExtension(file.path) === "mjs" ? ' type="module"' : ""} src="${escapeHtmlAttribute(encodePublicPath(file.path))}"></script>`)
    .join("\n");
  return `<!doctype html>\n<html lang="zh-CN">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1">\n<title>${escapeHtmlText(title)}</title>\n${styles}\n</head>\n<body>\n<div id="app"></div>\n${scripts}\n</body>\n</html>\n`;
}

function encodePublicPath(path: string): string {
  return path.split("/").map(encodeURIComponent).join("/");
}

function fileExtension(path: string): string {
  const name = path.split("/").pop() || "";
  return name.includes(".") ? name.split(".").pop()?.toLocaleLowerCase() || "" : "";
}

async function webBundleId(files: WebUploadFile[]): Promise<string> {
  const encoder = new TextEncoder();
  const parts = files.flatMap((file) => [encoder.encode(file.path), new Uint8Array([0]), file.bytes, new Uint8Array([0])]);
  const size = parts.reduce((total, part) => total + part.byteLength, 0);
  const payload = new Uint8Array(size);
  let offset = 0;
  for (const part of parts) {
    payload.set(part, offset);
    offset += part.byteLength;
  }
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", payload));
  return [...digest].map((byte) => byte.toString(16).padStart(2, "0")).join("").slice(0, 24);
}

async function githubPathExists(env: Env, path: string, token: string): Promise<boolean> {
  try {
    await githubJson(
      env,
      `/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/contents/${encodeGitHubPath(path)}?ref=${encodeURIComponent(env.GITHUB_BRANCH)}`,
      { method: "GET" },
      token,
    );
    return true;
  } catch (error) {
    if (error instanceof HttpError && error.status === 404) return false;
    throw error;
  }
}

async function commitWebFiles(env: Env, token: string, root: string, files: WebUploadFile[], title: string): Promise<void> {
  const reference = await githubJson<{ object: { sha: string } }>(
    env,
    `/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/git/ref/heads/${encodeGitHubPath(env.GITHUB_BRANCH)}`,
    { method: "GET" },
    token,
  );
  const parent = await githubJson<{ tree: { sha: string } }>(
    env,
    `/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/git/commits/${reference.object.sha}`,
    { method: "GET" },
    token,
  );
  const blobs = await mapConcurrent(files, 4, async (file) => {
    const blob = await githubJson<{ sha: string }>(
      env,
      `/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/git/blobs`,
      { method: "POST", body: JSON.stringify({ content: bytesToBase64(file.bytes), encoding: "base64" }) },
      token,
    );
    return { path: `${root}/${file.path}`, mode: "100644", type: "blob", sha: blob.sha };
  });
  const tree = await githubJson<{ sha: string }>(
    env,
    `/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/git/trees`,
    { method: "POST", body: JSON.stringify({ base_tree: parent.tree.sha, tree: blobs }) },
    token,
  );
  const commit = await githubJson<{ sha: string }>(
    env,
    `/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/git/commits`,
    {
      method: "POST",
      body: JSON.stringify({
        message: `上传内嵌网页：${cleanCommitMessage(title, "静态网页")}`,
        tree: tree.sha,
        parents: [reference.object.sha],
      }),
    },
    token,
  );
  await githubJson(
    env,
    `/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/git/refs/heads/${encodeGitHubPath(env.GITHUB_BRANCH)}`,
    { method: "PATCH", body: JSON.stringify({ sha: commit.sha, force: false }) },
    token,
  );
}

function webEmbedRecord(input: {
  id: string;
  root: string;
  entry: string;
  title: string;
  height: number;
  files: WebUploadFile[];
  sourceType: "html" | "zip";
  reused: boolean;
}): WebEmbedRecord {
  const path = `${input.root}/${input.entry}`;
  return {
    id: input.id,
    path,
    url: repositoryPathToPublicUrl(path),
    title: input.title,
    entry: input.entry,
    height: input.height,
    fileCount: input.files.length,
    totalSize: input.files.reduce((total, file) => total + file.bytes.byteLength, 0),
    sourceType: input.sourceType,
    reused: input.reused,
  };
}

function escapeHtmlAttribute(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function escapeHtmlText(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function repositoryPathToPublicUrl(path: string): string {
  return `/${path.replace(/^public\//, "").split("/").map(encodeURIComponent).join("/")}`;
}

async function connectGitHub(
  env: Env,
  input: unknown,
): Promise<SessionInfo["github"]> {
  const body = input as { token?: string };
  const token = typeof body.token === "string" ? body.token.trim() : "";
  if (token.length < 20 || token.length > 500) throw new HttpError(400, "GitHub 令牌格式无效");
  const user = await githubJson<{ login: string }>(env, "/user", { method: "GET" }, token);
  await githubJson(
    env,
    `/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}`,
    { method: "GET" },
    token,
  );
  const encrypted = await encryptSecret(env, token);
  const stored: StoredGitHubToken = {
    ...encrypted,
    login: user.login,
    updatedAt: new Date().toISOString(),
  };
  await env.DRAFTS.put("config/github-token", JSON.stringify(stored), {
    httpMetadata: { contentType: "application/json" },
  });
  return {
    connected: true,
    login: user.login,
    repository: `${env.GITHUB_OWNER}/${env.GITHUB_REPO}`,
    branch: env.GITHUB_BRANCH,
  };
}

async function changePassword(env: Env, input: unknown): Promise<void> {
  const body = input as { password?: string };
  const password = typeof body.password === "string" ? body.password : "";
  if (password.length < 8 || password.length > 128) {
    throw new HttpError(400, "密码长度需要在 8 到 128 个字符之间");
  }
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iterations = 120_000;
  const hash = await derivePassword(password, salt, iterations);
  const stored: StoredPassword = {
    salt: bytesToBase64Url(salt),
    hash: bytesToBase64Url(hash),
    iterations,
  };
  await env.DRAFTS.put("config/password", JSON.stringify(stored), {
    httpMetadata: { contentType: "application/json" },
  });
}

function parsePostMeta(path: string, sha: string, content: string): PostMeta {
  const match = content.match(/^---\s*\r?\n([\s\S]*?)\r?\n---/);
  let data: Record<string, unknown> = {};
  if (match) {
    try {
      data = (YAML.parse(match[1]) as Record<string, unknown> | null) ?? {};
    } catch {
      data = {};
    }
  }
  return {
    path,
    sha,
    title: typeof data.title === "string" ? data.title : path.slice(POST_PREFIX.length, -3),
    published: normalizeDate(data.published),
    updated: normalizeDate(data.updated) || undefined,
    description: typeof data.description === "string" ? data.description : "",
    image: typeof data.image === "string" ? data.image : "",
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    category: typeof data.category === "string" ? data.category : "",
    draft: data.draft === true,
    pinned: data.pinned === true,
    priority: typeof data.priority === "number" ? data.priority : undefined,
    lang: typeof data.lang === "string" ? data.lang : "zh-CN",
    comment: data.comment !== false,
    encrypted: data.encrypted === true,
    permalink: typeof data.permalink === "string" ? data.permalink : undefined,
  };
}

function comparePosts(a: PostMeta, b: PostMeta): number {
  if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
  if (a.pinned && b.pinned) {
    const priorityA = a.priority ?? Number.MAX_SAFE_INTEGER;
    const priorityB = b.priority ?? Number.MAX_SAFE_INTEGER;
    if (priorityA !== priorityB) return priorityA - priorityB;
  }
  return b.published.localeCompare(a.published);
}

async function githubJson<T = unknown>(
  env: Env,
  path: string,
  init: RequestInit,
  token?: string,
): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/vnd.github+json");
  headers.set("X-GitHub-Api-Version", "2022-11-28");
  headers.set("User-Agent", "astro-blog-studio");
  if (init.body) headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const response = await fetch(`https://api.github.com${path}`, { ...init, headers });
  if (!response.ok) {
    const details = (await response.json().catch(() => ({}))) as { message?: string };
    if (response.status === 409 || response.status === 422) {
      throw new HttpError(409, "仓库内容已变化，请刷新后再试", "GITHUB_CONFLICT");
    }
    if (response.status === 401 || response.status === 403) {
      throw new HttpError(502, "GitHub 授权无效或缺少 Contents 读写权限", "GITHUB_AUTH");
    }
    if (response.status === 404) {
      throw new HttpError(404, details.message || "GitHub 中未找到对应内容");
    }
    throw new HttpError(502, details.message || `GitHub 请求失败 (${response.status})`);
  }
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

async function getGitHubToken(env: Env): Promise<string | undefined> {
  if (env.GITHUB_TOKEN) return env.GITHUB_TOKEN;
  const stored = await readJsonObject<StoredGitHubToken>(env.DRAFTS, "config/github-token");
  if (!stored) return undefined;
  try {
    return await decryptSecret(env, stored);
  } catch {
    throw new HttpError(500, "已保存的 GitHub 授权无法解密，请重新连接", "GITHUB_TOKEN_DECRYPT");
  }
}

async function requireGitHubToken(env: Env): Promise<string> {
  const token = await getGitHubToken(env);
  if (!token) {
    throw new HttpError(428, "请先在设置中连接 GitHub", "GITHUB_NOT_CONNECTED");
  }
  return token;
}

async function encryptSecret(env: Env, value: string): Promise<{ iv: string; cipher: string }> {
  const key = await secretEncryptionKey(env);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const cipher = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    new TextEncoder().encode(value),
  );
  return { iv: bytesToBase64Url(iv), cipher: bytesToBase64Url(new Uint8Array(cipher)) };
}

async function decryptSecret(env: Env, value: { iv: string; cipher: string }): Promise<string> {
  const key = await secretEncryptionKey(env);
  const clear = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: base64UrlToBytes(value.iv) },
    key,
    base64UrlToBytes(value.cipher),
  );
  return new TextDecoder().decode(clear);
}

async function secretEncryptionKey(env: Env): Promise<CryptoKey> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(env.SESSION_SECRET));
  return crypto.subtle.importKey("raw", digest, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
}

async function verifyEditorPassword(env: Env, password: string): Promise<boolean> {
  const stored = await readJsonObject<StoredPassword>(env.DRAFTS, "config/password");
  if (stored) {
    const hash = await derivePassword(password, base64UrlToBytes(stored.salt), stored.iterations);
    return timingSafeEqual(bytesToBase64Url(hash), stored.hash);
  }
  const [left, right] = await Promise.all([sha256(password), sha256(env.EDITOR_PASSWORD)]);
  return timingSafeEqual(left, right);
}

async function derivePassword(
  password: string,
  salt: Uint8Array<ArrayBuffer>,
  iterations: number,
): Promise<Uint8Array<ArrayBuffer>> {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations },
    keyMaterial,
    256,
  );
  return new Uint8Array(bits);
}

async function createSession(env: Env): Promise<string> {
  const payload = bytesToBase64Url(
    new TextEncoder().encode(
      JSON.stringify({ exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE }),
    ),
  );
  return `${payload}.${await sign(env, payload)}`;
}

async function isAuthenticated(request: Request, env: Env): Promise<boolean> {
  const token = getCookie(request, SESSION_COOKIE);
  if (!token) return false;
  const [payload, signature, extra] = token.split(".");
  if (!payload || !signature || extra) return false;
  const expected = await sign(env, payload);
  if (!timingSafeEqual(signature, expected)) return false;
  try {
    const parsed = JSON.parse(new TextDecoder().decode(base64UrlToBytes(payload))) as {
      exp?: number;
    };
    return typeof parsed.exp === "number" && parsed.exp > Date.now() / 1000;
  } catch {
    return false;
  }
}

async function sign(env: Env, payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(env.SESSION_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return bytesToBase64Url(new Uint8Array(signature));
}

async function enforceLoginLimit(env: Env, ip: string): Promise<void> {
  const key = `auth/${await sha256(ip)}`;
  const attempt = await readJsonObject<{ count: number; resetAt: number }>(env.DRAFTS, key);
  if (attempt && attempt.resetAt > Date.now() && attempt.count >= 5) {
    throw new HttpError(429, "尝试次数过多，请稍后再试", "LOGIN_RATE_LIMIT");
  }
  if (attempt && attempt.resetAt <= Date.now()) await env.DRAFTS.delete(key);
}

async function recordLoginFailure(env: Env, ip: string): Promise<void> {
  const key = `auth/${await sha256(ip)}`;
  const existing = await readJsonObject<{ count: number; resetAt: number }>(env.DRAFTS, key);
  const active = existing && existing.resetAt > Date.now() ? existing : undefined;
  await env.DRAFTS.put(
    key,
    JSON.stringify({ count: (active?.count ?? 0) + 1, resetAt: Date.now() + 10 * 60_000 }),
    { httpMetadata: { contentType: "application/json" } },
  );
}

async function clearLoginFailures(env: Env, ip: string): Promise<void> {
  await env.DRAFTS.delete(`auth/${await sha256(ip)}`);
}

async function sha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return bytesToBase64Url(new Uint8Array(digest));
}

function timingSafeEqual(left: string, right: string): boolean {
  const length = Math.max(left.length, right.length);
  let mismatch = left.length ^ right.length;
  for (let index = 0; index < length; index += 1) {
    mismatch |= (left.charCodeAt(index) || 0) ^ (right.charCodeAt(index) || 0);
  }
  return mismatch === 0;
}

async function readJson<T = unknown>(request: Request): Promise<T> {
  const contentLength = Number(request.headers.get("Content-Length") || 0);
  if (contentLength > MAX_DOCUMENT_BYTES + 64_000) throw new HttpError(413, "请求内容过大");
  try {
    return (await request.json()) as T;
  } catch {
    throw new HttpError(400, "请求内容不是有效的 JSON");
  }
}

async function readJsonObject<T>(bucket: ObjectBucket, key: string): Promise<T | null> {
  const object = await bucket.get(key);
  if (!object) return null;
  try {
    return (await object.json()) as T;
  } catch {
    return null;
  }
}

function assertPostPath(value: unknown): string {
  if (typeof value !== "string" || !isPostPath(value)) {
    throw new HttpError(400, "文章路径无效");
  }
  return value;
}

function assertCommitSha(value: string | null): string {
  if (!value || !/^[0-9a-f]{40}$/i.test(value)) {
    throw new HttpError(400, "文章版本无效");
  }
  return value.toLowerCase();
}

function isPostPath(value: string): boolean {
  return (
    value.startsWith(POST_PREFIX) &&
    value.toLowerCase().endsWith(".md") &&
    !value.includes("..") &&
    !value.includes("\\") &&
    value.length <= 300
  );
}

function assertDraftKey(value: string | null): string {
  if (!value || !/^[a-zA-Z0-9_-]{8,80}$/.test(value)) {
    throw new HttpError(400, "草稿标识无效");
  }
  return value;
}

function normalizeDate(value: unknown): string {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  return typeof value === "string" ? value.slice(0, 10) : "";
}

function rawGitHubUrl(env: Env, path: string): string {
  return `https://raw.githubusercontent.com/${encodeURIComponent(env.GITHUB_OWNER)}/${encodeURIComponent(env.GITHUB_REPO)}/${encodeURIComponent(env.GITHUB_BRANCH)}/${encodeGitHubPath(path)}`;
}

function repositoryPublicAssetPath(pathname: string): string | null {
  let decoded: string;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    return null;
  }
  if (decoded.length > 500 || decoded.includes("\\") || /[\u0000-\u001f\u007f]/.test(decoded)) return null;
  const segments = decoded.split("/").filter(Boolean);
  const isBlogImage = segments.length >= 2 && ["image", "images"].includes(segments[0]);
  const isEditorUpload = segments.length >= 3 && ["video", "resource"].includes(segments[0]) && segments[1] === "editor";
  const isWebEmbed = segments.length >= 5
    && segments[0] === "web-pages"
    && segments[1] === "editor"
    && ["html", "zip"].includes(segments[2])
    && /^[0-9a-f]{24}$/.test(segments[3]);
  if (!isBlogImage && !isEditorUpload && !isWebEmbed) return null;
  if (segments.some((segment) => segment === "." || segment === "..")) return null;
  return `public/${segments.join("/")}`;
}

async function proxyEditorAsset(request: Request, env: Env, repositoryPath: string): Promise<Response> {
  const headers = new Headers({
    Accept: request.headers.get("Accept") || "*/*",
    "User-Agent": "astro-blog-studio",
  });
  for (const name of ["Range", "If-None-Match", "If-Modified-Since"]) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }
  const token = await getGitHubToken(env);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const response = await fetch(rawGitHubUrl(env, repositoryPath), {
    method: request.method,
    headers,
    redirect: "follow",
  });
  const responseHeaders = new Headers(response.headers);
  responseHeaders.delete("Set-Cookie");
  if (repositoryPath.startsWith("public/web-pages/editor/")) {
    responseHeaders.delete("Content-Disposition");
    responseHeaders.set("Content-Type", webAssetContentType(repositoryPath));
  }
  if (response.ok) {
    responseHeaders.set(
      "Cache-Control",
      repositoryPath.startsWith("public/web-pages/editor/")
        ? "public, max-age=31536000, immutable"
        : "public, max-age=300",
    );
  }
  return new Response(request.method === "HEAD" ? null : response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
  });
}

function webAssetContentType(path: string): string {
  const extension = fileExtension(path);
  const types: Record<string, string> = {
    html: "text/html; charset=utf-8",
    htm: "text/html; charset=utf-8",
    css: "text/css; charset=utf-8",
    js: "text/javascript; charset=utf-8",
    mjs: "text/javascript; charset=utf-8",
    json: "application/json; charset=utf-8",
    map: "application/json; charset=utf-8",
    txt: "text/plain; charset=utf-8",
    xml: "application/xml; charset=utf-8",
    csv: "text/csv; charset=utf-8",
    wasm: "application/wasm",
    webmanifest: "application/manifest+json; charset=utf-8",
    svg: "image/svg+xml",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    gif: "image/gif",
    webp: "image/webp",
    avif: "image/avif",
    ico: "image/x-icon",
    bmp: "image/bmp",
    woff: "font/woff",
    woff2: "font/woff2",
    ttf: "font/ttf",
    otf: "font/otf",
    eot: "application/vnd.ms-fontobject",
    mp3: "audio/mpeg",
    wav: "audio/wav",
    ogg: "audio/ogg",
    oga: "audio/ogg",
    mp4: "video/mp4",
    webm: "video/webm",
    ogv: "video/ogg",
    glb: "model/gltf-binary",
    gltf: "model/gltf+json",
  };
  return types[extension] || "application/octet-stream";
}

function encodeGitHubPath(path: string): string {
  return path.split("/").map(encodeURIComponent).join("/");
}

function cleanCommitMessage(value: unknown, fallback: string): string {
  if (typeof value !== "string") return fallback;
  const cleaned = value.replace(/[\r\n]+/g, " ").trim().slice(0, 160);
  return cleaned || fallback;
}

function assertByteLength(value: string, max: number, message: string): void {
  if (new TextEncoder().encode(value).byteLength > max) throw new HttpError(413, message);
}

function loadSeedPosts(): PostMeta[] {
  const payload = seedPostIndex as unknown as { posts?: PostMeta[] };
  return Array.isArray(payload.posts) ? payload.posts : [];
}

async function writePostsCache(env: Env, posts: PostMeta[]): Promise<void> {
  posts.sort(comparePosts);
  await env.DRAFTS.put(
    "cache/posts-index",
    JSON.stringify({ generatedAt: Date.now(), posts }),
    { httpMetadata: { contentType: "application/json" } },
  );
}

async function upsertPostCache(env: Env, post: PostMeta): Promise<void> {
  const cached = await readJsonObject<{ posts: PostMeta[] }>(env.DRAFTS, "cache/posts-index");
  const posts = cached?.posts ?? loadSeedPosts();
  await writePostsCache(env, [post, ...posts.filter((entry) => entry.path !== post.path)]);
}

async function removePostFromCache(env: Env, path: string): Promise<void> {
  const cached = await readJsonObject<{ posts: PostMeta[] }>(env.DRAFTS, "cache/posts-index");
  const posts = cached?.posts ?? loadSeedPosts();
  await writePostsCache(env, posts.filter((entry) => entry.path !== path));
}

async function mapConcurrent<T, R>(
  items: T[],
  concurrency: number,
  mapper: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let cursor = 0;
  const workers = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await mapper(items[index], index);
    }
  });
  await Promise.all(workers);
  return results;
}

function toBase64(value: string): string {
  return bytesToBase64(new TextEncoder().encode(value));
}

function fromBase64(value: string): string {
  const clean = value.replace(/\s/g, "");
  const binary = atob(clean);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return new TextDecoder().decode(bytes);
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunkSize = 0x8000;
  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + chunkSize));
  }
  return btoa(binary);
}

function bytesToBase64Url(bytes: Uint8Array): string {
  return bytesToBase64(bytes).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/g, "");
}

function base64UrlToBytes(value: string): Uint8Array<ArrayBuffer> {
  const padded = value.replaceAll("-", "+").replaceAll("_", "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

function getCookie(request: Request, name: string): string | undefined {
  const cookie = request.headers.get("Cookie") || "";
  for (const part of cookie.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return rest.join("=");
  }
  return undefined;
}

function sessionCookie(token: string): string {
  return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${SESSION_MAX_AGE}`;
}

function expiredSessionCookie(): string {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;
}

function assertSameOrigin(request: Request, url: URL): void {
  const origin = request.headers.get("Origin");
  if (origin && origin !== url.origin) throw new HttpError(403, "跨站请求已被拒绝");
}

function json(value: unknown, status = 200, extraHeaders: HeadersInit = {}): Response {
  const headers = new Headers(extraHeaders);
  headers.set("Content-Type", "application/json; charset=utf-8");
  return new Response(JSON.stringify(value), { status, headers });
}

function secureResponse(response: Response, noStore: boolean, webEmbed = false): Response {
  const headers = new Headers(response.headers);
  const selectedHeaders = webEmbed ? webEmbedSecurityHeaders : securityHeaders;
  for (const [name, value] of Object.entries(selectedHeaders)) headers.set(name, value);
  if (webEmbed) {
    headers.delete("X-Frame-Options");
    headers.delete("Cross-Origin-Opener-Policy");
  }
  if (noStore) headers.set("Cache-Control", "no-store");
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
