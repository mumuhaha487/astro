const PREFIX = "forum_";
const SESSION_COOKIE = "forum_session";
const SESSION_SECONDS = 60 * 60 * 24 * 7;
const PBKDF2_ITERATIONS = 120000;
const MAX_TOPIC_LENGTH = 64000;
const MAX_COMMENT_LENGTH = 8000;
const BOOTSTRAP_TOKEN_HASH = "53da21a4349ad909ecf2a51b39efb59e642a20cae24d82788e262ae759d3df34";
const RESERVED_NAMES = new Set([
  "admin", "administrator", "info", "mail", "root", "system", "support", "service",
  "security", "official", "moderator", "mod", "webmaster", "hostmaster", "postmaster",
  "help", "contact", "forum", "astro", "客服", "官方", "管理员",
]);
const CATEGORIES = new Set(["question", "share", "chat"]);

class ApiError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

export async function onRequest(context) {
  try {
    const { request } = context;
    const method = request.method.toUpperCase();
    if (method === "OPTIONS") return respond(null, 204);
    if (!["GET", "HEAD"].includes(method)) assertSameOrigin(request);
    const kv = resolveKv(context);
    const path = routeParts(request.url);

    if (path[0] === "health" && method === "GET") return respond({ ok: true, storage: "kv" });
    if (path[0] === "bootstrap" && method === "POST") return await bootstrap(kv, request);
    if (path[0] === "register" && method === "POST") return await register(kv, request);
    if (path[0] === "login" && method === "POST") return await login(kv, request);
    if (path[0] === "logout" && method === "POST") return await logout(kv, request);
    if (path[0] === "session" && method === "GET") return await sessionInfo(kv, request);
    if (path[0] === "account" && method === "DELETE") return await deleteOwnAccount(kv, request);
    if (path[0] === "media" && path.length === 1 && method === "POST") return await uploadMedia(kv, request);
    if (path[0] === "media" && path.length === 2 && method === "GET") return await getMedia(kv, path[1]);

    if (path[0] === "topics" && path.length === 1 && method === "GET") return await listTopics(kv);
    if (path[0] === "topics" && path.length === 1 && method === "POST") return await createTopic(kv, request);
    if (path[0] === "topics" && path.length === 2 && method === "GET") return await getTopic(kv, path[1]);
    if (path[0] === "topics" && path.length === 2 && method === "PATCH") return await updateTopic(kv, request, path[1]);
    if (path[0] === "topics" && path.length === 2 && method === "DELETE") return await deleteTopic(kv, request, path[1]);
    if (path[0] === "topics" && path.length === 3 && path[2] === "comments" && method === "POST") return await createComment(kv, request, path[1]);
    if (path[0] === "comments" && path.length === 2 && method === "PATCH") return await updateComment(kv, request, path[1]);
    if (path[0] === "comments" && path.length === 2 && method === "DELETE") return await deleteComment(kv, request, path[1]);

    if (path[0] === "admin" && path[1] === "users" && path.length === 2 && method === "GET") return await adminListUsers(kv, request);
    if (path[0] === "admin" && path[1] === "users" && path.length === 2 && method === "POST") return await adminCreateUser(kv, request);
    if (path[0] === "admin" && path[1] === "users" && path.length === 3 && method === "PATCH") return await adminUpdateUser(kv, request, path[2]);
    if (path[0] === "admin" && path[1] === "users" && path.length === 3 && method === "DELETE") return await adminDeleteUser(kv, request, path[2]);
    if (path[0] === "admin" && path[1] === "comments" && method === "GET") return await adminListComments(kv, request);

    throw new ApiError(404, "接口不存在");
  } catch (error) {
    const status = error instanceof ApiError ? error.status : 500;
    if (status === 500) console.error("forum_api_error", error?.message || error);
    return respond({ error: status === 500 ? "服务暂时不可用" : error.message }, status);
  }
}

function resolveKv(context) {
  const binding = context?.env?.astro || (typeof astro !== "undefined" ? astro : globalThis.astro);
  if (!binding?.get || !binding?.put || !binding?.list) throw new ApiError(503, "论坛存储尚未绑定");
  return binding;
}

function routeParts(url) {
  const pathname = new URL(url).pathname.replace(/^\/api\/forum\/?/, "");
  return pathname.split("/").filter(Boolean).map((part) => decodeURIComponent(part));
}

function respond(data, status = 200, headers = {}) {
  const base = {
    "cache-control": "no-store",
    "content-security-policy": "default-src 'none'; frame-ancestors 'none'",
    "referrer-policy": "no-referrer",
    "x-content-type-options": "nosniff",
    ...headers,
  };
  if (status === 204) return new Response(null, { status, headers: base });
  return new Response(JSON.stringify(data), { status, headers: { ...base, "content-type": "application/json; charset=utf-8" } });
}

function assertSameOrigin(request) {
  const url = new URL(request.url);
  const origin = request.headers.get("origin");
  const site = request.headers.get("sec-fetch-site");
  if (origin && new URL(origin).host !== url.host) throw new ApiError(403, "跨站请求已拒绝");
  if (site === "cross-site") throw new ApiError(403, "跨站请求已拒绝");
}

async function readJson(request, maxBytes = 100000) {
  const declared = Number(request.headers.get("content-length") || 0);
  if (declared > maxBytes) throw new ApiError(413, "请求内容过大");
  let body;
  try {
    const text = await request.text();
    if (new TextEncoder().encode(text).byteLength > maxBytes) throw new ApiError(413, "请求内容过大");
    body = JSON.parse(text);
  } catch (error) { if (error instanceof ApiError) throw error; throw new ApiError(400, "请求格式无效"); }
  if (!body || typeof body !== "object" || Array.isArray(body)) throw new ApiError(400, "请求格式无效");
  return body;
}

function normalizeUsername(value) {
  const username = String(value || "").trim();
  if (!/^[A-Za-z0-9_\u4e00-\u9fff]{3,24}$/u.test(username)) throw new ApiError(400, "用户名需为 3-24 位中文、字母、数字或下划线");
  const normalized = username.toLowerCase();
  if (RESERVED_NAMES.has(normalized)) throw new ApiError(400, "该用户名不可注册");
  return { username, normalized };
}

function normalizeEmail(value, required = false) {
  const email = String(value || "").trim().toLowerCase();
  if (!email && !required) return "";
  if (!/^(?:[1-9][0-9]{4,11}@qq\.com|[a-z0-9._-]{3,64}@163\.com)$/.test(email)) throw new ApiError(400, "仅支持 QQ 邮箱或 163 邮箱");
  return email;
}

function validatePassword(value) {
  const password = String(value || "");
  if (password.length < 8 || password.length > 128 || !/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) throw new ApiError(400, "密码需为 8-128 位，并同时包含字母和数字");
  return password;
}

async function sha256(value) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return bytesToHex(new Uint8Array(digest));
}

function bytesToHex(bytes) { return [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join(""); }
function randomToken(size = 24) { const bytes = crypto.getRandomValues(new Uint8Array(size)); return toBase64Url(bytes); }
function toBase64Url(bytes) { let binary = ""; for (const byte of bytes) binary += String.fromCharCode(byte); return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, ""); }
function fromBase64Url(value) { const normalized = value.replaceAll("-", "+").replaceAll("_", "/"); const binary = atob(normalized + "=".repeat((4 - normalized.length % 4) % 4)); return Uint8Array.from(binary, (char) => char.charCodeAt(0)); }

async function passwordHash(password, salt, pepper) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(`${password}\u0000${pepper}`), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: fromBase64Url(salt), iterations: PBKDF2_ITERATIONS }, key, 256);
  return toBase64Url(new Uint8Array(bits));
}

function constantTimeEqual(left, right) {
  const a = new TextEncoder().encode(left); const b = new TextEncoder().encode(right);
  let mismatch = a.length ^ b.length;
  for (let index = 0; index < Math.max(a.length, b.length); index += 1) mismatch |= (a[index % a.length] || 0) ^ (b[index % b.length] || 0);
  return mismatch === 0;
}

async function securityConfig(kv) {
  const config = await kv.get(`${PREFIX}config_security`, { type: "json" });
  if (!config?.pepper) throw new ApiError(503, "论坛尚未初始化");
  return config;
}

async function userKey(normalized) { return `${PREFIX}user_${await sha256(normalized)}`; }
async function emailKey(email) { return `${PREFIX}email_${await sha256(email)}`; }
const topicKey = (id) => `${PREFIX}topic_${safeId(id)}`;
const commentKey = (id) => `${PREFIX}comment_${safeId(id)}`;
function safeId(value) { const id = String(value || ""); if (!/^[a-f0-9]{24,48}$/.test(id)) throw new ApiError(400, "标识无效"); return id; }

async function bootstrap(kv, request) {
  if (await kv.get(`${PREFIX}bootstrap_complete`)) throw new ApiError(409, "论坛已初始化");
  const body = await readJson(request);
  if (!constantTimeEqual(await sha256(String(body.token || "")), BOOTSTRAP_TOKEN_HASH)) throw new ApiError(403, "初始化凭据无效");
  const password = validatePassword(body.password);
  const pepper = randomToken(32);
  await kv.put(`${PREFIX}config_security`, JSON.stringify({ pepper, version: 1, createdAt: new Date().toISOString() }));
  const username = "admin"; const normalized = "admin"; const email = "vrhjio4405@163.com";
  const salt = randomToken(18); const createdAt = new Date().toISOString();
  const user = { id: randomToken(18), username, normalized, email, role: "admin", banned: false, salt, passwordHash: await passwordHash(password, salt, pepper), iterations: PBKDF2_ITERATIONS, createdAt, updatedAt: createdAt };
  const key = await userKey(normalized);
  await kv.put(key, JSON.stringify(user));
  await kv.put(await emailKey(email), key);
  await kv.put(`${PREFIX}bootstrap_complete`, createdAt);
  return respond({ ok: true, user: publicUser(user, true) }, 201);
}

async function register(kv, request) {
  await rateLimit(kv, request, "register", 6, 3600000);
  const body = await readJson(request);
  const { username, normalized } = normalizeUsername(body.username);
  const email = normalizeEmail(body.email, false);
  const password = validatePassword(body.password);
  if (password !== String(body.confirmPassword || "")) throw new ApiError(400, "两次输入的密码不一致");
  const key = await userKey(normalized);
  if (await kv.get(key)) throw new ApiError(409, "用户名已被使用");
  if (email && await kv.get(await emailKey(email))) throw new ApiError(409, "邮箱已被使用");
  const config = await securityConfig(kv); const createdAt = new Date().toISOString(); const salt = randomToken(18);
  const user = { id: randomToken(18), username, normalized, email, role: "user", banned: false, salt, passwordHash: await passwordHash(password, salt, config.pepper), iterations: PBKDF2_ITERATIONS, createdAt, updatedAt: createdAt };
  await kv.put(key, JSON.stringify(user));
  if (email) await kv.put(await emailKey(email), key);
  const session = await createSession(kv, user, request);
  return respond({ ok: true, user: publicUser(user) }, 201, { "set-cookie": session.cookie });
}

async function login(kv, request) {
  await rateLimit(kv, request, "login", 12, 900000);
  const body = await readJson(request); const identity = String(body.identity || "").trim().toLowerCase(); const password = String(body.password || "");
  if (!identity || !password) throw new ApiError(400, "请输入用户名和密码");
  let key;
  if (identity.includes("@")) { const email = normalizeEmail(identity, true); key = await kv.get(await emailKey(email)); }
  else key = await userKey(identity);
  const user = key ? await kv.get(key, { type: "json" }) : null;
  if (!user) { await dummyPassword(password); throw new ApiError(401, "用户名或密码错误"); }
  if (user.banned) throw new ApiError(403, "账户已被封禁");
  const config = await securityConfig(kv); const candidate = await passwordHash(password, user.salt, config.pepper);
  if (!constantTimeEqual(candidate, user.passwordHash)) throw new ApiError(401, "用户名或密码错误");
  const session = await createSession(kv, user, request);
  return respond({ ok: true, user: publicUser(user) }, 200, { "set-cookie": session.cookie });
}

async function dummyPassword(password) {
  const salt = "AAAAAAAAAAAAAAAAAAAAAAAA"; await passwordHash(password, salt, "dummy-pepper");
}

async function createSession(kv, user, request) {
  const token = randomToken(32); const now = Date.now(); const key = `${PREFIX}session_${await sha256(token)}`;
  await kv.put(key, JSON.stringify({ userKey: await userKey(user.normalized), createdAt: now, expiresAt: now + SESSION_SECONDS * 1000, ipHash: await requestFingerprint(request) }));
  return { cookie: `${SESSION_COOKIE}=${token}; Path=/; Max-Age=${SESSION_SECONDS}; HttpOnly; Secure; SameSite=Strict` };
}

async function auth(kv, request, required = true) {
  const token = parseCookies(request.headers.get("cookie") || "")[SESSION_COOKIE];
  if (!token) { if (required) throw new ApiError(401, "请先登录"); return null; }
  const sessionKey = `${PREFIX}session_${await sha256(token)}`; const session = await kv.get(sessionKey, { type: "json" });
  if (!session || session.expiresAt < Date.now()) { if (session) await kv.delete(sessionKey); if (required) throw new ApiError(401, "登录已过期"); return null; }
  const user = await kv.get(session.userKey, { type: "json" });
  if (!user || user.banned) { await kv.delete(sessionKey); if (required) throw new ApiError(403, "账户不可用"); return null; }
  return { user, sessionKey };
}

function parseCookies(value) { return Object.fromEntries(value.split(";").map((item) => item.trim().split(/=(.*)/s).slice(0, 2)).filter(([key]) => key)); }
function publicUser(user, includeEmail = false) { return { id: user.id, username: user.username, role: user.role, banned: Boolean(user.banned), createdAt: user.createdAt, ...(includeEmail ? { email: user.email || "" } : {}) }; }

async function logout(kv, request) {
  const current = await auth(kv, request, false); if (current) await kv.delete(current.sessionKey);
  return respond({ ok: true }, 200, { "set-cookie": `${SESSION_COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict` });
}

async function deleteOwnAccount(kv, request) {
  const current = await auth(kv, request);
  if (current.user.role === "admin") throw new ApiError(400, "管理员账户不能在前台注销");
  await kv.delete(await userKey(current.user.normalized));
  if (current.user.email) await kv.delete(await emailKey(current.user.email));
  await kv.delete(current.sessionKey);
  return respond({ ok: true }, 200, { "set-cookie": `${SESSION_COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict` });
}

async function sessionInfo(kv, request) {
  const current = await auth(kv, request, false); const [topics, comments, users] = await Promise.all([countKeys(kv, `${PREFIX}topic_`), countKeys(kv, `${PREFIX}comment_`), countKeys(kv, `${PREFIX}user_`)]);
  return respond({ authenticated: Boolean(current), user: current ? publicUser(current.user, true) : null, emailVerification: false, stats: { topics, comments, users } });
}

async function uploadMedia(kv, request) {
  const current = await auth(kv, request); await rateLimit(kv, request, `media_${current.user.id}`, 20, 3600000);
  const body = await readJson(request, 1000000); const type = String(body.type || "").toLowerCase();
  if (!new Set(["image/png", "image/jpeg", "image/gif", "image/webp"]).has(type)) throw new ApiError(400, "仅支持 PNG、JPG、GIF 或 WebP 图片");
  const data = String(body.data || ""); if (!/^[A-Za-z0-9+/]+={0,2}$/.test(data) || data.length > 920000) throw new ApiError(413, "图片不能超过 680KB");
  const id = bytesToHex(crypto.getRandomValues(new Uint8Array(16))); const media = { id, type, data, ownerId: current.user.id, createdAt: new Date().toISOString() };
  await kv.put(`${PREFIX}media_${id}`, JSON.stringify(media)); return respond({ url: `/api/forum/media/${id}` }, 201);
}

async function getMedia(kv, id) {
  const mediaId = String(id || ""); if (!/^[a-f0-9]{32}$/.test(mediaId)) throw new ApiError(400, "媒体标识无效");
  const media = await kv.get(`${PREFIX}media_${mediaId}`, { type: "json" }); if (!media) throw new ApiError(404, "图片不存在");
  const binary = atob(media.data); const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new Response(bytes, { headers: { "content-type": media.type, "cache-control": "public, max-age=31536000, immutable", "content-security-policy": "default-src 'none'", "x-content-type-options": "nosniff" } });
}

async function listTopics(kv) {
  const records = await readAll(kv, `${PREFIX}topic_`);
  records.sort((a, b) => Number(Boolean(b.pinned)) - Number(Boolean(a.pinned)) || String(b.updatedAt).localeCompare(String(a.updatedAt)));
  return respond({ topics: records.map(publicTopic) });
}

async function getTopic(kv, id) {
  const topic = await kv.get(topicKey(id), { type: "json" }); if (!topic) throw new ApiError(404, "主题不存在");
  const comments = (await readAll(kv, `${PREFIX}comment_`)).filter((comment) => comment.topicId === topic.id).sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt)));
  return respond({ topic: publicTopic(topic, true), comments: comments.map(publicComment) });
}

async function createTopic(kv, request) {
  const current = await auth(kv, request); await rateLimit(kv, request, `topic_${current.user.id}`, 8, 3600000);
  const body = await readJson(request); const title = cleanText(body.title, 5, 100, "主题标题"); const content = cleanText(body.content, 1, MAX_TOPIC_LENGTH, "主题内容"); const category = CATEGORIES.has(body.category) ? body.category : "question";
  const now = new Date().toISOString(); const topic = { id: bytesToHex(crypto.getRandomValues(new Uint8Array(12))), title, content, category, authorId: current.user.id, authorName: current.user.username, pinned: false, locked: false, commentCount: 0, createdAt: now, updatedAt: now };
  await kv.put(topicKey(topic.id), JSON.stringify(topic)); return respond({ topic: publicTopic(topic, true) }, 201);
}

async function updateTopic(kv, request, id) {
  const current = await auth(kv, request); const key = topicKey(id); const topic = await kv.get(key, { type: "json" }); if (!topic) throw new ApiError(404, "主题不存在");
  const isAdmin = current.user.role === "admin"; if (!isAdmin && topic.authorId !== current.user.id) throw new ApiError(403, "无权编辑该主题");
  const body = await readJson(request);
  if (body.title !== undefined) topic.title = cleanText(body.title, 5, 100, "主题标题");
  if (body.content !== undefined) topic.content = cleanText(body.content, 1, MAX_TOPIC_LENGTH, "主题内容");
  if (body.category !== undefined) { if (!CATEGORIES.has(body.category)) throw new ApiError(400, "主题分类无效"); topic.category = body.category; }
  if (isAdmin && body.pinned !== undefined) topic.pinned = Boolean(body.pinned);
  if (isAdmin && body.locked !== undefined) topic.locked = Boolean(body.locked);
  topic.updatedAt = new Date().toISOString(); await kv.put(key, JSON.stringify(topic)); return respond({ topic: publicTopic(topic, true) });
}

async function deleteTopic(kv, request, id) {
  const current = await auth(kv, request); const key = topicKey(id); const topic = await kv.get(key, { type: "json" }); if (!topic) throw new ApiError(404, "主题不存在");
  if (current.user.role !== "admin" && topic.authorId !== current.user.id) throw new ApiError(403, "无权删除该主题");
  const comments = (await listKeys(kv, `${PREFIX}comment_`));
  for (const commentKeyValue of comments) { const comment = await kv.get(commentKeyValue, { type: "json" }); if (comment?.topicId === topic.id) await kv.delete(commentKeyValue); }
  await kv.delete(key); return respond({ ok: true });
}

async function createComment(kv, request, topicId) {
  const current = await auth(kv, request); await rateLimit(kv, request, `comment_${current.user.id}`, 20, 3600000);
  const topic = await kv.get(topicKey(topicId), { type: "json" }); if (!topic) throw new ApiError(404, "主题不存在"); if (topic.locked && current.user.role !== "admin") throw new ApiError(409, "主题已锁定");
  const body = await readJson(request); const content = cleanText(body.content, 1, MAX_COMMENT_LENGTH, "评论内容"); const now = new Date().toISOString();
  const comment = { id: bytesToHex(crypto.getRandomValues(new Uint8Array(12))), topicId: topic.id, content, authorId: current.user.id, authorName: current.user.username, createdAt: now, updatedAt: now };
  await kv.put(commentKey(comment.id), JSON.stringify(comment)); topic.commentCount = Number(topic.commentCount || 0) + 1; topic.updatedAt = now; await kv.put(topicKey(topic.id), JSON.stringify(topic));
  return respond({ comment: publicComment(comment) }, 201);
}

async function updateComment(kv, request, id) {
  const current = await auth(kv, request); const key = commentKey(id); const comment = await kv.get(key, { type: "json" }); if (!comment) throw new ApiError(404, "评论不存在");
  if (current.user.role !== "admin" && comment.authorId !== current.user.id) throw new ApiError(403, "无权编辑该评论");
  const body = await readJson(request); comment.content = cleanText(body.content, 1, MAX_COMMENT_LENGTH, "评论内容"); comment.updatedAt = new Date().toISOString(); await kv.put(key, JSON.stringify(comment)); return respond({ comment: publicComment(comment) });
}

async function deleteComment(kv, request, id) {
  const current = await auth(kv, request); const key = commentKey(id); const comment = await kv.get(key, { type: "json" }); if (!comment) throw new ApiError(404, "评论不存在");
  if (current.user.role !== "admin" && comment.authorId !== current.user.id) throw new ApiError(403, "无权删除该评论");
  await kv.delete(key); const topic = await kv.get(topicKey(comment.topicId), { type: "json" }); if (topic) { topic.commentCount = Math.max(0, Number(topic.commentCount || 0) - 1); await kv.put(topicKey(topic.id), JSON.stringify(topic)); }
  return respond({ ok: true });
}

async function requireAdmin(kv, request) { const current = await auth(kv, request); if (current.user.role !== "admin") throw new ApiError(403, "仅管理员可操作"); return current; }
async function adminListUsers(kv, request) { await requireAdmin(kv, request); return respond({ users: (await readAll(kv, `${PREFIX}user_`)).map((user) => publicUser(user, true)).sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt))) }); }
async function adminListComments(kv, request) { await requireAdmin(kv, request); return respond({ comments: (await readAll(kv, `${PREFIX}comment_`)).map(publicComment).sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt))) }); }

async function adminCreateUser(kv, request) {
  await requireAdmin(kv, request); const body = await readJson(request); const { username, normalized } = normalizeUsername(body.username); const email = normalizeEmail(body.email, false); const password = validatePassword(body.password); const role = body.role === "admin" ? "admin" : "user";
  const key = await userKey(normalized); if (await kv.get(key)) throw new ApiError(409, "用户名已被使用"); if (email && await kv.get(await emailKey(email))) throw new ApiError(409, "邮箱已被使用");
  const config = await securityConfig(kv); const salt = randomToken(18); const now = new Date().toISOString(); const user = { id: randomToken(18), username, normalized, email, role, banned: false, salt, passwordHash: await passwordHash(password, salt, config.pepper), iterations: PBKDF2_ITERATIONS, createdAt: now, updatedAt: now };
  await kv.put(key, JSON.stringify(user)); if (email) await kv.put(await emailKey(email), key); return respond({ user: publicUser(user, true) }, 201);
}

async function adminUpdateUser(kv, request, id) {
  const admin = await requireAdmin(kv, request); const found = await findUserById(kv, id); if (!found) throw new ApiError(404, "用户不存在"); const { key, user } = found; const body = await readJson(request);
  if (user.id === admin.user.id && (body.banned === true || body.role === "user")) throw new ApiError(400, "不能封禁自己或移除自己的管理员权限");
  if (body.banned !== undefined) user.banned = Boolean(body.banned); if (body.role !== undefined) user.role = body.role === "admin" ? "admin" : "user"; user.updatedAt = new Date().toISOString(); await kv.put(key, JSON.stringify(user)); return respond({ user: publicUser(user, true) });
}

async function adminDeleteUser(kv, request, id) {
  const admin = await requireAdmin(kv, request); if (admin.user.id === id) throw new ApiError(400, "不能删除当前管理员账户"); const found = await findUserById(kv, id); if (!found) throw new ApiError(404, "用户不存在");
  await kv.delete(found.key); if (found.user.email) await kv.delete(await emailKey(found.user.email)); return respond({ ok: true });
}

async function findUserById(kv, id) { const keys = await listKeys(kv, `${PREFIX}user_`); for (const key of keys) { const user = await kv.get(key, { type: "json" }); if (user?.id === id) return { key, user }; } return null; }
function publicTopic(topic, withContent = false) { return { id: topic.id, title: topic.title, category: topic.category, authorId: topic.authorId, authorName: topic.authorName, pinned: Boolean(topic.pinned), locked: Boolean(topic.locked), commentCount: Number(topic.commentCount || 0), createdAt: topic.createdAt, updatedAt: topic.updatedAt, ...(withContent ? { content: topic.content } : { excerpt: String(topic.content || "").replace(/[#>*_`\[\]()!-]/g, " ").replace(/\s+/g, " ").trim().slice(0, 140) }) }; }
function publicComment(comment) { return { id: comment.id, topicId: comment.topicId, content: comment.content, authorId: comment.authorId, authorName: comment.authorName, createdAt: comment.createdAt, updatedAt: comment.updatedAt }; }
function cleanText(value, min, max, label) { const text = String(value || "").trim(); if (text.length < min) throw new ApiError(400, `${label}不能为空`); if (text.length > max) throw new ApiError(400, `${label}不能超过 ${max} 个字符`); return text.replaceAll("\u0000", ""); }

async function listKeys(kv, prefix) { const keys = []; let cursor; do { const page = await kv.list({ prefix, limit: 256, ...(cursor ? { cursor } : {}) }); keys.push(...(page?.keys || []).map((item) => item.key)); cursor = page?.complete ? null : page?.cursor; } while (cursor && keys.length < 4096); return keys; }
async function readAll(kv, prefix) { const values = []; for (const key of await listKeys(kv, prefix)) { const value = await kv.get(key, { type: "json" }); if (value) values.push(value); } return values; }
async function countKeys(kv, prefix) { return (await listKeys(kv, prefix)).length; }
async function requestFingerprint(request) { const ip = request.headers.get("eo-connecting-ip") || request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown"; return (await sha256(ip)).slice(0, 24); }
async function rateLimit(kv, request, action, limit, windowMs) { const fingerprint = await requestFingerprint(request); const actionHash = (await sha256(action)).slice(0, 16); const key = `${PREFIX}rate_${actionHash}_${fingerprint}`; const now = Date.now(); const value = await kv.get(key, { type: "json" }); const next = !value || value.resetAt <= now ? { count: 1, resetAt: now + windowMs } : { count: value.count + 1, resetAt: value.resetAt }; if (next.count > limit) throw new ApiError(429, "操作过于频繁，请稍后再试"); await kv.put(key, JSON.stringify(next)); }
