import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { parseAndValidateFriendEntry } from "./lib/friends-validator.mjs";
import { findBacklinkInHtml, isPrivateIpAddress, verifyFriendBacklink } from "./lib/friends-backlink.mjs";
import { evaluateFriendPullRequest } from "./review-friend-pr.mjs";

function makeTempEntries(entries = {}) {
  return mkdtemp(join(tmpdir(), "friends-test-")).then(async (dir) => {
    for (const [name, content] of Object.entries(entries)) {
      await writeFile(join(dir, name), JSON.stringify(content, null, 2), "utf8");
    }
    return dir;
  });
}

function mockGitHubApi({ pr, files, contents = {} }) {
  const calls = { comments: [], closed: 0, merges: [] };
  const fetchImpl = async (url, init = {}) => {
    const method = init.method || "GET";
    const parsed = new URL(url);
    const path = parsed.pathname;

    if (method === "GET" && path === "/repos/mumuhaha487/astro/pulls/42") {
      return new Response(JSON.stringify(pr), { status: 200 });
    }
    if (method === "GET" && path === "/repos/mumuhaha487/astro/pulls/42/files") {
      return new Response(JSON.stringify(files), { status: 200 });
    }
    if (method === "GET" && path.startsWith("/repos/mumuhaha487/astro/contents/")) {
      const key = decodeURIComponent(path.replace("/repos/mumuhaha487/astro/contents/", ""));
      if (!Object.hasOwn(contents, key)) {
        return new Response(JSON.stringify({ message: "Not Found" }), { status: 404 });
      }
      return new Response(JSON.stringify(contents[key]), { status: 200 });
    }
    if (method === "POST" && path === "/repos/mumuhaha487/astro/issues/42/comments") {
      calls.comments.push(JSON.parse(init.body).body);
      return new Response(JSON.stringify({ id: 1 }), { status: 201 });
    }
    if (method === "PATCH" && path === "/repos/mumuhaha487/astro/pulls/42") {
      const body = JSON.parse(init.body);
      if (body.state === "closed") calls.closed += 1;
      return new Response(JSON.stringify({ ...pr, ...body }), { status: 200 });
    }
    if (method === "PUT" && path === "/repos/mumuhaha487/astro/pulls/42/merge") {
      calls.merges.push(JSON.parse(init.body));
      return new Response(JSON.stringify({ merged: true }), { status: 200 });
    }
    return new Response(JSON.stringify({ message: `Unhandled ${method} ${path}` }), { status: 404 });
  };
  return { fetchImpl, calls };
}

test("validates friend JSON strictly against schema and rejects placeholders/unknown keys", () => {
  const ok = parseAndValidateFriendEntry(
    JSON.stringify({
      name: "Alice Blog",
      url: "https://alice.dev/",
      avatar: "https://alice.dev/avatar.png",
      description: "Notes on systems",
      tags: ["博客", "Rust"],
    }),
    "alice-blog.json",
    { strictSchema: true, rejectPlaceholders: true, rejectSelfHost: true },
  );
  assert.equal(ok.ok, true);

  const extraKey = parseAndValidateFriendEntry(
    JSON.stringify({ name: "Alice", url: "https://alice.dev/", evil: true }),
    "alice.json",
    { strictSchema: true },
  );
  assert.equal(extraKey.ok, false);
  assert.match(extraKey.errors.join("\n"), /未允许的字段/);

  const placeholder = parseAndValidateFriendEntry(
    JSON.stringify({ name: "你的站点名称", url: "https://example.com/" }),
    "placeholder.json",
    { strictSchema: true, rejectPlaceholders: true },
  );
  assert.equal(placeholder.ok, false);
  assert.match(placeholder.errors.join("\n"), /占位/);

  const badName = parseAndValidateFriendEntry(
    JSON.stringify({ name: "Valid", url: "https://valid.dev/" }),
    "Bad_Name.JSON",
    { strictSchema: true },
  );
  assert.equal(badName.ok, false);
});

test("findBacklinkInHtml matches visible https://vmss.cn links and ignores comments or hidden links", () => {
  assert.equal(
    findBacklinkInHtml('<main><a href="https://vmss.cn/">木哈文轩</a></main>', "https://friend.dev/friends").found,
    true,
  );
  assert.equal(
    findBacklinkInHtml('<main><a href="https://www.vmss.cn">木哈文轩</a></main>', "https://friend.dev/friends").found,
    true,
  );
  assert.equal(
    findBacklinkInHtml('<!-- <a href="https://vmss.cn/">木哈文轩</a> -->', "https://friend.dev/friends").found,
    false,
  );
  assert.equal(
    findBacklinkInHtml('<div hidden><a href="https://vmss.cn/">木哈文轩</a></div>', "https://friend.dev/friends").found,
    false,
  );
  assert.equal(
    findBacklinkInHtml('<a style="display: none" href="https://vmss.cn/">木哈文轩</a>', "https://friend.dev/friends").found,
    false,
  );
  assert.equal(
    findBacklinkInHtml('<script>const u = "<a href=\\"https://vmss.cn/\\">x</a>";</script>', "https://friend.dev/friends").found,
    false,
  );
  assert.equal(
    findBacklinkInHtml('<a href="http://vmss.cn/">non-https</a>', "https://friend.dev/friends").found,
    false,
  );
});

test("verifyFriendBacklink blocks private IPs (SSRF) and follows safe /friends/ fallback", async () => {
  assert.equal(isPrivateIpAddress("127.0.0.1"), true);
  assert.equal(isPrivateIpAddress("169.254.169.254"), true);
  assert.equal(isPrivateIpAddress("10.0.0.1"), true);
  assert.equal(isPrivateIpAddress("::1"), true);
  assert.equal(isPrivateIpAddress("::ffff:127.0.0.1"), true);
  assert.equal(isPrivateIpAddress("1.1.1.1"), false);

  const ssrf = await verifyFriendBacklink("https://evil.dev/", {
    dnsLookup: async () => [{ address: "127.0.0.1", family: 4 }],
    fetchImpl: async () => {
      throw new Error("Should never fetch private IP");
    },
  });
  assert.equal(ssrf.ok, false);
  assert.match(ssrf.reason, /内网或保留地址/);

  const ok = await verifyFriendBacklink("https://good-friend.dev/blog", {
    dnsLookup: async () => [{ address: "93.184.216.34", family: 4 }],
    fetchImpl: async (url) => {
      if (url === "https://good-friend.dev/friends") return new Response("Not Found", { status: 404 });
      if (url === "https://good-friend.dev/friends/") {
        return new Response('<html><body><a href="https://vmss.cn/">木哈文轩</a></body></html>', {
          status: 200,
          headers: { "content-type": "text/html; charset=utf-8" },
        });
      }
      return new Response("Unexpected", { status: 500 });
    },
  });
  assert.equal(ok.ok, true);
  assert.equal(ok.matchedHref, "https://vmss.cn/");
});

test("auto-merges a compliant friend PR with pinned head SHA", async () => {
  const dir = await makeTempEntries({
    "existing.json": { name: "Existing", url: "https://existing.dev/" },
  });
  try {
    const friendJson = JSON.stringify({
      name: "Alice Blog",
      url: "https://alice.dev/",
      avatar: "https://alice.dev/avatar.png",
      description: "Personal engineering blog",
      tags: ["博客"],
    });
    const { fetchImpl, calls } = mockGitHubApi({
      pr: { number: 42, state: "open", draft: false, base: { ref: "main" }, head: { sha: "deadbeef1234" }, user: { login: "alice" } },
      files: [{ filename: "friends/entries/alice.json", status: "added" }],
      contents: {
        "friends/entries/alice.json": {
          type: "file",
          encoding: "base64",
          size: Buffer.byteLength(friendJson),
          content: Buffer.from(friendJson).toString("base64"),
        },
      },
    });
    const result = await evaluateFriendPullRequest({
      owner: "mumuhaha487",
      repo: "astro",
      prNumber: 42,
      token: "test-token",
      entriesDir: dir,
      fetchImpl,
      backlinkVerifier: async () => ({
        ok: true,
        checkedUrl: "https://alice.dev/friends",
        finalUrl: "https://alice.dev/friends/",
        status: 200,
        matchedHref: "https://vmss.cn/",
        reason: null,
      }),
    });
    assert.equal(result.action, "merged");
    assert.equal(calls.closed, 0);
    assert.equal(calls.merges.length, 1);
    assert.equal(calls.merges[0].sha, "deadbeef1234");
    assert.equal(calls.merges[0].merge_method, "squash");
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("rejects and closes PR touching files outside friends/entries/", async () => {
  const dir = await makeTempEntries();
  try {
    const { fetchImpl, calls } = mockGitHubApi({
      pr: { number: 42, state: "open", draft: false, base: { ref: "main" }, head: { sha: "abc" }, user: { login: "attacker" } },
      files: [
        { filename: "friends/entries/alice.json", status: "added" },
        { filename: ".github/workflows/friends-review.yml", status: "modified" },
      ],
    });
    const result = await evaluateFriendPullRequest({
      owner: "mumuhaha487",
      repo: "astro",
      prNumber: 42,
      token: "test-token",
      entriesDir: dir,
      fetchImpl,
    });
    assert.equal(result.action, "rejected");
    assert.equal(result.stage, "isolation");
    assert.equal(calls.closed, 1);
    assert.equal(calls.merges.length, 0);
    assert.match(calls.comments[0], /安全隔离拦截/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("rejects and closes PR when applicant /friends page lacks https://vmss.cn backlink", async () => {
  const dir = await makeTempEntries();
  try {
    const friendJson = JSON.stringify({
      name: "Bob Site",
      url: "https://bob.dev/",
      avatar: null,
      description: "Bob's blog",
      tags: ["博客"],
    });
    const { fetchImpl, calls } = mockGitHubApi({
      pr: { number: 42, state: "open", draft: false, base: { ref: "main" }, head: { sha: "abc" }, user: { login: "bob" } },
      files: [{ filename: "friends/entries/bob.json", status: "added" }],
      contents: {
        "friends/entries/bob.json": {
          type: "file",
          encoding: "base64",
          size: Buffer.byteLength(friendJson),
          content: Buffer.from(friendJson).toString("base64"),
        },
      },
    });
    const result = await evaluateFriendPullRequest({
      owner: "mumuhaha487",
      repo: "astro",
      prNumber: 42,
      token: "test-token",
      entriesDir: dir,
      fetchImpl,
      backlinkVerifier: async () => ({
        ok: false,
        checkedUrl: "https://bob.dev/friends",
        finalUrl: "https://bob.dev/friends",
        status: 200,
        matchedHref: null,
        reason: "未在可见链接中找到 https://vmss.cn",
      }),
    });
    assert.equal(result.action, "rejected");
    assert.equal(result.stage, "backlink");
    assert.equal(calls.closed, 1);
    assert.equal(calls.merges.length, 0);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("skips unrelated PRs (e.g. Dependabot) without commenting or closing", async () => {
  const dir = await makeTempEntries();
  try {
    const { fetchImpl, calls } = mockGitHubApi({
      pr: { number: 42, state: "open", draft: false, base: { ref: "main" }, head: { sha: "abc" }, user: { login: "dependabot[bot]" } },
      files: [{ filename: "package.json", status: "modified" }],
    });
    const result = await evaluateFriendPullRequest({
      owner: "mumuhaha487",
      repo: "astro",
      prNumber: 42,
      token: "test-token",
      entriesDir: dir,
      fetchImpl,
    });
    assert.equal(result.action, "skipped");
    assert.equal(calls.closed, 0);
    assert.equal(calls.merges.length, 0);
    assert.equal(calls.comments.length, 0);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
