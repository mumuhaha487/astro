import assert from "node:assert/strict";
import { test } from "node:test";
import { PreconditionFailedError } from "@edgeone/pages-blob";

import onRequest, { handleAccountRequest, resolveKV } from "../edge-functions/api/account.js";

class MemoryKV {
  values = new Map();
  async get(key) { const value = this.values.get(key); return value ? JSON.parse(value) : null; }
  async put(key, value) { this.values.set(key, value); }
  async delete(key) { this.values.delete(key); }
}

class MemoryAccounts {
  values = new Map();
  async get(key) { const value = this.values.get(key); return value ? JSON.parse(value) : null; }
  async setJSON(key, value, options) {
    if (options?.onlyIfNew && this.values.has(key)) throw new PreconditionFailedError();
    this.values.set(key, JSON.stringify(value));
  }
}

function request(method, body, cookie, origin = "https://vmss.cn", url = "https://vmss.cn/api/account") {
  return new Request(url, {
    method,
    headers: { origin, "content-type": "application/json", ...(cookie ? { cookie } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
}

test("register, session, sign out and login without storing a reusable verifier", async () => {
  const kv = new MemoryKV();
  const accounts = new MemoryAccounts();
  const handle = (input) => handleAccountRequest(input, kv, accounts);
  const credentials = { username: "Visitor_01", salt: "a".repeat(32), verifier: "b".repeat(64) };
  const registered = await handle(request("POST", { action: "register", ...credentials }));
  assert.equal(registered.status, 200);
  assert.deepEqual(await registered.json(), { user: { username: "Visitor_01" } });
  assert.match(registered.headers.get("set-cookie"), /HttpOnly; Secure; SameSite=Lax/);
  assert.ok(![...kv.values.values(), ...accounts.values.values()].some((value) => value.includes(credentials.verifier)));
  assert.deepEqual(await (await handle(request("GET", null, null, "https://vmss.cn", "https://vmss.cn/api/account?username=visitor_01"))).json(), { salt: credentials.salt, iterations: 600_000 });
  const cookie = registered.headers.get("set-cookie").split(";")[0];
  assert.deepEqual(await (await handle(request("GET", null, cookie))).json(), { user: { username: "Visitor_01" } });
  assert.equal((await handle(request("POST", { action: "register", ...credentials, username: "vIsItOr_01" }))).status, 409);
  assert.equal((await handle(request("POST", { action: "login", ...credentials, verifier: "c".repeat(64) }))).status, 401);
  assert.equal((await handle(request("POST", { action: "login", ...credentials, verifier: "d".repeat(64) }))).status, 401);
  assert.equal((await handle(request("POST", { action: "logout" }, cookie))).status, 200);
  assert.deepEqual(await (await handle(request("GET", null, cookie))).json(), { user: null });
  assert.equal((await handle(request("POST", { action: "login", ...credentials }))).status, 200);
});

test("rejects reserved names and atomically claims case-insensitive usernames", async () => {
  const kv = new MemoryKV();
  const accounts = new MemoryAccounts();
  const handle = (input) => handleAccountRequest(input, kv, accounts);
  const credentials = { salt: "a".repeat(32), verifier: "b".repeat(64) };
  for (const username of ["admin", "ADMIN_2", "info", "Info007", "site_admin", "system", "support", "webmaster", "No_Reply", "official", "vmss"]) {
    const result = await handle(request("POST", { action: "register", username, ...credentials }));
    assert.equal(result.status, 400, username);
  }
  assert.equal(accounts.values.size, 0);
  const results = await Promise.all(["Reader_42", "reader_42"].map((username) =>
    handle(request("POST", { action: "register", username, ...credentials }))));
  assert.deepEqual(results.map((result) => result.status).sort(), [200, 409]);
  assert.equal(accounts.values.size, 1);
  assert.equal((await handle(request("POST", { action: "login", username: "READER_42", ...credentials }))).status, 200);
});

test("keeps existing KV accounts available and prevents re-registration", async () => {
  const kv = new MemoryKV();
  const accounts = new MemoryAccounts();
  const comparisonSalt = "c".repeat(32);
  const verifier = "b".repeat(64);
  const hash = Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(comparisonSalt + verifier))), (byte) => byte.toString(16).padStart(2, "0")).join("");
  await kv.put("blog_account_existing", JSON.stringify({ username: "Existing", salt: "a".repeat(32), comparisonSalt, hash }));
  const credentials = { username: "existing", salt: "a".repeat(32), verifier };
  assert.equal((await handleAccountRequest(request("POST", { action: "register", ...credentials }), kv, accounts)).status, 409);
  assert.equal((await handleAccountRequest(request("POST", { action: "login", ...credentials }), kv, accounts)).status, 200);
  assert.equal(accounts.values.size, 0);
});

test("fails closed without a KV binding and rejects cross-origin writes", async () => {
  assert.equal((await handleAccountRequest(request("GET"), null)).status, 503);
  assert.equal((await handleAccountRequest(request("GET"), new MemoryKV())).status, 503);
  assert.equal((await handleAccountRequest(request("POST", { action: "register" }, null, "https://other.test"), new MemoryKV(), new MemoryAccounts())).status, 403);
});

test("resolves one bound KV namespace but refuses ambiguous bindings", async () => {
  const accounts = new MemoryKV();
  const another = new MemoryKV();
  assert.equal(resolveKV({ existing_kv: accounts }, {}), accounts);
  assert.equal(resolveKV({ BLOG_AUTH_KV: accounts, another_kv: another }, {}), accounts);
  assert.equal(resolveKV({ first: accounts, second: another }, {}), null);
  assert.equal((await onRequest({ request: request("GET"), env: { BLOG_AUTH_KV: accounts }, accountStore: new MemoryAccounts() })).status, 200);
});
