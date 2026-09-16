import assert from "node:assert/strict";
import { test } from "node:test";

import { handleAccountRequest } from "../edge-functions/api/account.js";

class MemoryKV {
  values = new Map();
  async get(key) { const value = this.values.get(key); return value ? JSON.parse(value) : null; }
  async put(key, value) { this.values.set(key, value); }
  async delete(key) { this.values.delete(key); }
}

function request(method, body, cookie, origin = "https://vmss.cn") {
  return new Request("https://vmss.cn/api/account", {
    method,
    headers: { origin, "content-type": "application/json", ...(cookie ? { cookie } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
}

test("register, session, sign out and login without storing a plaintext password", async () => {
  const kv = new MemoryKV();
  const credentials = { username: "Visitor_01", password: "a sufficiently long password" };
  const registered = await handleAccountRequest(request("POST", { action: "register", ...credentials }), kv);
  assert.equal(registered.status, 200);
  assert.deepEqual(await registered.json(), { user: { username: "Visitor_01" } });
  assert.match(registered.headers.get("set-cookie"), /HttpOnly; Secure; SameSite=Lax/);
  assert.ok(![...kv.values.values()].some((value) => value.includes(credentials.password)));
  const cookie = registered.headers.get("set-cookie").split(";")[0];
  assert.deepEqual(await (await handleAccountRequest(request("GET", null, cookie), kv)).json(), { user: { username: "Visitor_01" } });
  assert.equal((await handleAccountRequest(request("POST", { action: "register", ...credentials }), kv)).status, 409);
  assert.equal((await handleAccountRequest(request("POST", { action: "login", ...credentials, password: "wrong password" }), kv)).status, 401);
  assert.equal((await handleAccountRequest(request("POST", { action: "login", ...credentials, password: "incorrect password" }), kv)).status, 401);
  assert.equal((await handleAccountRequest(request("POST", { action: "logout" }, cookie), kv)).status, 200);
  assert.deepEqual(await (await handleAccountRequest(request("GET", null, cookie), kv)).json(), { user: null });
  assert.equal((await handleAccountRequest(request("POST", { action: "login", ...credentials }), kv)).status, 200);
});

test("fails closed without a KV binding and rejects cross-origin writes", async () => {
  assert.equal((await handleAccountRequest(request("GET"), null)).status, 503);
  assert.equal((await handleAccountRequest(request("POST", { action: "register" }, null, "https://other.test"), new MemoryKV())).status, 403);
});
