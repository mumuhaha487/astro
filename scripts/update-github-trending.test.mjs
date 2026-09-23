import assert from "node:assert/strict";
import { test } from "node:test";
import { parseTrending, rankRepositories, request, selectFeatures } from "./update-github-trending.mjs";
import { categories, classifyRepositories, validateClassification } from "./github-trending-tags.mjs";

test("AI classification uses the fixed taxonomy and preserves repository order across batches", async () => {
  const repositories = [{ repo: "a/security", description: "" }, { repo: "b/skills" }, { repo: "c/unknown" }];
  const batches = [];
  const result = await classifyRepositories(repositories, { apiKey: "test", batchSize: 2, generate: async (batch) => {
    batches.push(batch.map((repo) => repo.repo));
    return batch.length === 2
      ? JSON.stringify({ items: [{ id: 1, tags: ["AI", "Skill"] }, { id: 0, tags: ["安全", "开发工具"] }] })
      : JSON.stringify({ items: [{ id: 0, tags: ["其他"] }] });
  } });
  assert.deepEqual(batches, [["a/security", "b/skills"], ["c/unknown"]]);
  assert.deepEqual(result.map((repo) => repo.tags), [["安全", "开发工具"], ["AI", "Skill"], ["其他"]]);
  assert.equal(categories.includes("Rust"), false);
  assert.equal(categories.length, 12);
});

test("bounds AI tags and isolates incomplete classification", async () => {
  const classify = (tags) => validateClassification({ items: [{ id: 0, tags }] }, 1)[0];
  assert.deepEqual(classify(["AI", "金融", "未列出", "AI", "安全", "教程"]), ["AI", "金融", "安全"]);
  assert.deepEqual(classify(["Rust"]), ["其他"]);
  assert.deepEqual(classify(["AI", "其他"]), ["AI"]);
  assert.throws(() => validateClassification({ items: [{ id: 1, tags: ["AI"] }] }, 1));
  assert.throws(() => validateClassification({ items: [{ id: 0, tags: [] }] }, 1));
  const warnings = [];
  const originalWarn = console.warn;
  console.warn = (message) => warnings.push(message);
  try {
    const calls = [];
    const tagged = await classifyRepositories([{ repo: "good/ai" }, { repo: "bad/response" }, { repo: "good/security" }], {
      apiKey: "test", generate: async (batch) => {
        calls.push(batch.map((item) => item.repo));
        if (batch.length > 1 || batch[0].repo === "bad/response") return { items: [] };
        return { items: [{ id: 0, tags: [batch[0].repo === "good/ai" ? "AI" : "安全"] }] };
      },
    });
    assert.deepEqual(tagged.map((item) => item.tags), [["AI"], ["其他"], ["安全"]]);
    assert.ok(calls.some((batch) => batch.length === 3));
    assert.ok(calls.some((batch) => batch.length === 1));
    assert.ok(warnings.some((message) => message.includes("bad/response")));
  } finally { console.warn = originalWarn; }
  await assert.rejects(() => classifyRepositories([{ repo: "owner/repo" }], {
    apiKey: "test", generate: async () => { throw new Error("AI tag service: HTTP 401"); },
  }), /HTTP 401/);
  console.warn = () => {};
  try {
    await assert.rejects(() => classifyRepositories(Array.from({ length: 5 }, (_, index) => ({ repo: `bad/${index}` })), {
      apiKey: "test", generate: async () => ({ items: [] }),
    }), /refusing mostly unclassified snapshot/);
  } finally { console.warn = originalWarn; }
});

test("AI request sends the bounded taxonomy and repository evidence", async () => {
  const originalFetch = globalThis.fetch;
  let body;
  globalThis.fetch = async (url, options) => {
    assert.equal(url, "https://deepseek.inc.re/v1/chat/completions");
    assert.equal(options.headers.Authorization, "Bearer test");
    body = JSON.parse(options.body);
    return { ok: true, json: async () => ({ choices: [{ message: { content: '{"items":[{"id":0,"tags":["教程"]}]}' } }] }) };
  };
  try {
    const tagged = await classifyRepositories([{ repo: "owner/guide", description: "A course" }], { apiKey: "test" });
    assert.deepEqual(tagged[0].tags, ["教程"]);
    assert.match(body.messages[0].content, /AI、安全/);
    assert.match(body.messages[0].content, /1 至 3/);
    assert.match(body.messages[1].content, /owner\/guide/);
  } finally { globalThis.fetch = originalFetch; }
});

test("parses daily growth and repository metadata", () => {
  const html = `<article class="Box-row"><h2><a href="/Example/Alpha">Alpha</a></h2><p class="col-9">Useful  framework</p><span itemprop="programmingLanguage">Rust</span><span>1,234 stars today</span></article>`;
  assert.deepEqual(parseTrending(html), [{
    repo: "Example/Alpha", name: "Alpha", url: "https://github.com/Example/Alpha",
    starsToday: 1234, language: "Rust", description: "Useful framework",
  }]);
  assert.deepEqual(parseTrending('<article class="Box-row"><h2><a href="/bad/path/more">x</a></h2><span>12 stars today</span></article>'), []);
});

test("retries transient network failures and stops on permanent HTTP errors", async () => {
  const originalFetch = globalThis.fetch;
  try {
    let calls = 0;
    globalThis.fetch = async () => {
      calls++;
      if (calls < 3) throw new TypeError("fetch failed");
      return { ok: true };
    };
    assert.equal((await request("https://example.test/transient", {}, 3, 0)).ok, true);
    assert.equal(calls, 3);

    calls = 0;
    globalThis.fetch = async () => {
      calls++;
      return { ok: false, status: 404, headers: new Headers() };
    };
    await assert.rejects(() => request("https://example.test/missing", {}, 3, 0), /HTTP 404/);
    assert.equal(calls, 1);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("ranks unique repositories and skips names featured previously", () => {
  const a = { repo: "team/Alpha", name: "Alpha", starsToday: 30, language: "Other" };
  const b = { repo: "TEAM/alpha", name: "alpha", starsToday: 40, language: "Rust" };
  const c = { repo: "other/Beta", name: "Beta", starsToday: 20, language: "Go" };
  const ranked = rankRepositories([[a, c], [b]]);
  assert.equal(ranked.length, 2);
  assert.equal(ranked[0].starsToday, 40);
  assert.deepEqual(selectFeatures(ranked, new Set(["alpha"])).map((repo) => repo.name), ["Beta"]);
});
