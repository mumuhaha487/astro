import assert from "node:assert/strict";
import test from "node:test";

import { onRequest } from "../edge-functions/api/forum/[[default]].js";

class FakeKv {
  data = new Map();
  async put(key, value) { this.data.set(key, typeof value === "string" ? value : String(value)); }
  async get(key, options) { const value = this.data.get(key) ?? null; return value && options?.type === "json" ? JSON.parse(value) : value; }
  async delete(key) { this.data.delete(key); }
  async list({ prefix = "", limit = 256 } = {}) { const keys = [...this.data.keys()].filter((key) => key.startsWith(prefix)).sort().slice(0, limit).map((key) => ({ key })); return { complete: true, cursor: null, keys }; }
}

const bootstrapToken = process.env.FORUM_BOOTSTRAP_TOKEN;

test("forum authentication, CRUD, media, and admin boundaries", { skip: !bootstrapToken && "FORUM_BOOTSTRAP_TOKEN is required" }, async () => {
  const kv = new FakeKv();
  async function call(path, { method = "GET", body, cookie } = {}) {
    const headers = { origin: "https://vmss.cn", "sec-fetch-site": "same-origin" };
    if (body !== undefined) headers["content-type"] = "application/json";
    if (cookie) headers.cookie = cookie;
    const response = await onRequest({ env: { astro: kv }, request: new Request(`https://vmss.cn/api/forum/${path}`, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) }) });
    return { response, data: await response.clone().json().catch(() => null) };
  }

  const bootstrap = await call("bootstrap", { method: "POST", body: { token: bootstrapToken, password: "Testpass123" } });
  assert.equal(bootstrap.response.status, 201);
  assert.equal(bootstrap.data.user.role, "admin");
  assert.equal(JSON.stringify(bootstrap.data).includes("passwordHash"), false);

  const reserved = await call("register", { method: "POST", body: { username: "info", email: "123456@qq.com", password: "Testpass123", confirmPassword: "Testpass123" } });
  assert.equal(reserved.response.status, 400);
  const invalidEmail = await call("register", { method: "POST", body: { username: "InvalidMail", email: "me@example.com", password: "Testpass123", confirmPassword: "Testpass123" } });
  assert.equal(invalidEmail.response.status, 400);

  const registration = await call("register", { method: "POST", body: { username: "Alice_01", email: "123456@qq.com", password: "Testpass123", confirmPassword: "Testpass123" } });
  assert.equal(registration.response.status, 201);
  const userCookie = registration.response.headers.get("set-cookie").split(";")[0];

  const created = await call("topics", { method: "POST", cookie: userCookie, body: { title: "这是一个测试主题", category: "question", content: "## 测试\n\n论坛正文" } });
  assert.equal(created.response.status, 201);
  const topicId = created.data.topic.id;
  const commented = await call(`topics/${topicId}/comments`, { method: "POST", cookie: userCookie, body: { content: "第一条回复" } });
  assert.equal(commented.response.status, 201);
  const detail = await call(`topics/${topicId}`);
  assert.equal(detail.data.comments.length, 1);

  const media = await call("media", { method: "POST", cookie: userCookie, body: { type: "image/png", data: Buffer.from("png").toString("base64") } });
  assert.equal(media.response.status, 201);
  const mediaResponse = await call(media.data.url.replace("/api/forum/", ""));
  assert.equal(mediaResponse.response.headers.get("content-type"), "image/png");

  const login = await call("login", { method: "POST", body: { identity: "admin", password: "Testpass123" } });
  assert.equal(login.response.status, 200);
  const adminCookie = login.response.headers.get("set-cookie").split(";")[0];
  const pinned = await call(`topics/${topicId}`, { method: "PATCH", cookie: adminCookie, body: { pinned: true, locked: true } });
  assert.equal(pinned.data.topic.pinned, true);
  const users = await call("admin/users", { cookie: adminCookie });
  assert.equal(users.response.status, 200);
  assert.equal(users.data.users.length, 2);
  assert.equal(JSON.stringify(users.data).includes("passwordHash"), false);
  const anonDelete = await call(`topics/${topicId}`, { method: "DELETE", body: {} });
  assert.equal(anonDelete.response.status, 401);

  const deleted = await call("account", { method: "DELETE", body: {}, cookie: userCookie });
  assert.equal(deleted.response.status, 200);
  const deletedSession = await call("session", { cookie: userCookie });
  assert.equal(deletedSession.data.authenticated, false);
});
