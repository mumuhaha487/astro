const ACCOUNT_PREFIX = "blog_account_";
const SESSION_PREFIX = "blog_session_";
const COOKIE = "blog_session";
const SESSION_AGE = 7 * 24 * 60 * 60;
const ITERATIONS = 600_000;
const USERNAME_PATTERN = /^[A-Za-z0-9_]{3,24}$/;
const HEX_32 = /^[a-f0-9]{32}$/;
const HEX_64 = /^[a-f0-9]{64}$/;
const encoder = new TextEncoder();

export function resolveKV(env, globals = globalThis) {
  const explicit = env?.BLOG_AUTH_KV || globals.BLOG_AUTH_KV;
  if (explicit && typeof explicit.get === "function" && typeof explicit.put === "function") return explicit;
  const found = new Set();
  for (const scope of [env, globals]) {
    if (!scope) continue;
    for (const name of Object.getOwnPropertyNames(scope)) {
      try {
        const value = scope[name];
        if (value && typeof value.get === "function" && typeof value.put === "function" && typeof value.delete === "function") found.add(value);
      } catch { /* Some runtime globals cannot be read directly. */ }
    }
  }
  return found.size === 1 ? [...found][0] : null;
}

function response(data, status = 200, cookie) {
  const headers = new Headers({ "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
  if (cookie) headers.set("set-cookie", cookie);
  return new Response(JSON.stringify(data), { status, headers });
}

function hex(bytes) {
  return [...new Uint8Array(bytes)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function sha256(value) {
  return hex(await crypto.subtle.digest("SHA-256", encoder.encode(value)));
}

function sameHash(left, right) {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index++) difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  return difference === 0;
}

function cookieValue(request) {
  const match = request.headers.get("cookie")?.match(/(?:^|;\s*)blog_session=([a-f0-9]{64})(?:;|$)/);
  return match?.[1] || null;
}

function setCookie(token, maxAge) {
  return `${COOKIE}=${token}; Path=/; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=Lax`;
}

async function currentSession(request, store) {
  const token = cookieValue(request);
  if (!token) return null;
  const key = SESSION_PREFIX + await sha256(token);
  const session = await store.get(key, { type: "json" });
  if (!session || !Number.isFinite(session.expires) || session.expires <= Date.now()) {
    if (session) await store.delete(key);
    return null;
  }
  return session;
}

export async function handleAccountRequest(request, store) {
  if (!store || typeof store.get !== "function" || typeof store.put !== "function") {
    return response({ error: "账号服务尚未配置 KV 存储" }, 503);
  }
  if (request.method === "GET") {
    const lookup = new URL(request.url).searchParams.get("username");
    if (lookup !== null) {
      if (!USERNAME_PATTERN.test(lookup)) return response({ error: "用户名格式不正确" }, 400);
      const account = await store.get(ACCOUNT_PREFIX + lookup.toLowerCase(), { type: "json" });
      const salt = HEX_32.test(account?.salt || "") ? account.salt : hex(crypto.getRandomValues(new Uint8Array(16)));
      return response({ salt, iterations: account?.iterations || ITERATIONS });
    }
    const session = await currentSession(request, store);
    return response({ user: session ? { username: session.username } : null }, 200, session ? undefined : setCookie("", 0));
  }
  if (request.method !== "POST") return response({ error: "请求方式不受支持" }, 405);
  if (request.headers.get("origin") !== new URL(request.url).origin) return response({ error: "请求来源不受支持" }, 403);
  if (!request.headers.get("content-type")?.startsWith("application/json")) return response({ error: "请求格式不受支持" }, 415);
  if (Number(request.headers.get("content-length") || 0) > 2048) return response({ error: "请求内容过长" }, 413);

  let payload;
  try { payload = await request.json(); } catch { return response({ error: "请求内容无效" }, 400); }
  if (!payload || typeof payload !== "object") return response({ error: "请求内容无效" }, 400);

  if (payload.action === "logout") {
    const token = cookieValue(request);
    if (token) await store.delete(SESSION_PREFIX + await sha256(token));
    return response({ user: null }, 200, setCookie("", 0));
  }
  if (payload.action !== "register" && payload.action !== "login") return response({ error: "操作不受支持" }, 400);

  const username = typeof payload.username === "string" ? payload.username.trim() : "";
  const verifier = payload.verifier;
  if (!USERNAME_PATTERN.test(username) || typeof verifier !== "string" || !HEX_64.test(verifier)) {
    return response({ error: "账号或密码格式不正确" }, 400);
  }
  const key = ACCOUNT_PREFIX + username.toLowerCase();
  let account;
  try { account = await store.get(key, { type: "json" }); }
  catch (cause) { throw Object.assign(new Error("Account lookup failed", { cause }), { code: "KV_READ_ACCOUNT" }); }

  if (payload.action === "register") {
    if (account) return response({ error: "账号已存在" }, 409);
    if (typeof payload.salt !== "string" || !HEX_32.test(payload.salt)) return response({ error: "注册参数不正确" }, 400);
    const comparisonSalt = hex(crypto.getRandomValues(new Uint8Array(16)));
    account = { username, salt: payload.salt, iterations: ITERATIONS, comparisonSalt, hash: await sha256(comparisonSalt + verifier), created: Date.now() };
    try { await store.put(key, JSON.stringify(account)); }
    catch (cause) { throw Object.assign(new Error("Account write failed", { cause }), { code: "KV_WRITE_ACCOUNT" }); }
  } else {
    if (!account || !HEX_32.test(account.comparisonSalt || "") || !HEX_64.test(account.hash || "")) {
      return response({ error: "账号或密码错误" }, 401);
    }
    const actual = await sha256(account.comparisonSalt + verifier);
    if (!sameHash(actual, account.hash)) return response({ error: "账号或密码错误" }, 401);
  }

  const token = hex(crypto.getRandomValues(new Uint8Array(32)));
  try { await store.put(SESSION_PREFIX + await sha256(token), JSON.stringify({ username: account.username, expires: Date.now() + SESSION_AGE * 1000 })); }
  catch (cause) { throw Object.assign(new Error("Session write failed", { cause }), { code: "KV_WRITE_SESSION" }); }
  return response({ user: { username: account.username } }, 200, setCookie(token, SESSION_AGE));
}

export default async function onRequest({ request, env }) {
  // Prefer the account binding; a single existing project KV binding is also safe to reuse.
  const store = resolveKV(env);
  try { return await handleAccountRequest(request, store); }
  catch (error) {
    console.error("Account request failed", error);
    return response({ error: "账号服务暂时不可用", code: error?.code || "UNEXPECTED" }, 503);
  }
}
