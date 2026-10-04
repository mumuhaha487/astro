import assert from "node:assert/strict";
import { test } from "node:test";
import {
  DEFAULT_BASE_URL,
  DEFAULT_MODEL,
  getChatCompletionsUrl,
  getModelsUrl,
  normalizeBaseUrl,
  parseChatCompletionResponse,
  resolveDeepSeekModel,
  selectDeepSeekModel,
} from "./deepseek-client.mjs";
import { analyze, parseTrending, rankRepositories, request, selectFeatures } from "./update-github-trending.mjs";
import { categories, classifyRepositories, validateClassification } from "./github-trending-tags.mjs";

function createSseResponse(chunks, headers = {}) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      for (const chunk of chunks) {
        controller.enqueue(typeof chunk === "string" ? encoder.encode(chunk) : chunk);
      }
      controller.close();
    },
  });
  return {
    ok: true,
    status: 200,
    headers: new Headers({ "content-type": "text/event-stream; charset=utf-8", ...headers }),
    body: stream,
  };
}

test("normalizes endpoint root and /v1 paths without query credentials or duplication", () => {
  assert.equal(DEFAULT_BASE_URL, "https://api.vmss.cn/");
  assert.equal(DEFAULT_MODEL, "auto-sh");
  assert.equal(normalizeBaseUrl("https://api.vmss.cn"), "https://api.vmss.cn/v1");
  assert.equal(normalizeBaseUrl("https://api.vmss.cn/"), "https://api.vmss.cn/v1");
  assert.equal(normalizeBaseUrl("https://api.vmss.cn/v1"), "https://api.vmss.cn/v1");
  assert.equal(normalizeBaseUrl("https://api.vmss.cn/v1/"), "https://api.vmss.cn/v1");
  assert.equal(normalizeBaseUrl("https://custom.gateway:8443/proxy"), "https://custom.gateway:8443/proxy/v1");
  assert.equal(normalizeBaseUrl("https://custom.gateway:8443/proxy/v1/"), "https://custom.gateway:8443/proxy/v1");
  assert.equal(normalizeBaseUrl("https://user:pass@api.vmss.cn/v1?token=secret#frag"), "https://api.vmss.cn/v1");
  assert.equal(getChatCompletionsUrl("https://api.vmss.cn/"), "https://api.vmss.cn/v1/chat/completions");
  assert.equal(getModelsUrl("https://api.vmss.cn/"), "https://api.vmss.cn/v1/models");
});

test("explicit model or default bypasses /models discovery without network requests", async () => {
  let fetchCalled = false;
  const failingFetch = async () => {
    fetchCalled = true;
    throw new Error("fetch should not be called when model is configured");
  };

  const defaultModel = await resolveDeepSeekModel("test-key", { fetchImpl: failingFetch });
  assert.equal(defaultModel, "auto-sh");
  assert.equal(fetchCalled, false);

  const customModel = await resolveDeepSeekModel("test-key", { preferred: "custom-model", fetchImpl: failingFetch });
  assert.equal(customModel, "custom-model");
  assert.equal(fetchCalled, false);

  await assert.rejects(() => resolveDeepSeekModel("", { fetchImpl: failingFetch }), /DEEPSEEK_API_KEY is required/);
});

test("model discovery fallback when preferred model is explicitly empty", async () => {
  assert.equal(selectDeepSeekModel(["embedding/model", "deepseek/deepseek-v4.1-flash", "deepseek/chat"]), "deepseek/deepseek-v4.1-flash");
  assert.equal(selectDeepSeekModel(["deepseek/old", "deepseek/custom"], "deepseek/custom"), "deepseek/custom");
  assert.throws(() => selectDeepSeekModel(["other/model"]), /No DeepSeek text model/);

  let requestedUrl = "";
  let authHeader = "";
  const model = await resolveDeepSeekModel("test-key", {
    preferred: "",
    baseUrl: "https://api.vmss.cn/",
    fetchImpl: async (url, options) => {
      requestedUrl = url;
      authHeader = options?.headers?.Authorization || "";
      return { ok: true, json: async () => ({ data: [{ id: "deepseek/deepseek-v4.1-flash" }] }) };
    },
  });
  assert.equal(requestedUrl, "https://api.vmss.cn/v1/models");
  assert.equal(authHeader, "Bearer test-key");
  assert.equal(model, "deepseek/deepseek-v4.1-flash");
});

test("AI classification uses the fixed taxonomy and preserves repository order across batches", async () => {
  const repositories = [{ repo: "a/security", description: "" }, { repo: "b/skills" }, { repo: "c/unknown" }];
  const batches = [];
  const result = await classifyRepositories(repositories, { apiKey: "test", model: "auto-sh", batchSize: 2, generate: async (batch) => {
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
      apiKey: "test", model: "auto-sh", generate: async (batch) => {
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
    apiKey: "test", model: "auto-sh", generate: async () => { throw new Error("AI tag service: HTTP 401"); },
  }), /HTTP 401/);
  console.warn = () => {};
  try {
    await assert.rejects(() => classifyRepositories(Array.from({ length: 5 }, (_, index) => ({ repo: `bad/${index}` })), {
      apiKey: "test", model: "auto-sh", generate: async () => ({ items: [] }),
    }), /refusing mostly unclassified snapshot/);
  } finally { console.warn = originalWarn; }
});

test("AI request routes with stream: true to configured endpoint and parses SSE stream", async () => {
  const originalFetch = globalThis.fetch;
  let targetUrl = "";
  let body;
  globalThis.fetch = async (url, options) => {
    targetUrl = url;
    assert.equal(options.headers.Authorization, "Bearer test-key");
    body = JSON.parse(options.body);
    const part1 = JSON.stringify("{\"items\":[{\"id\":0,\"tags\":[");
    const part2 = JSON.stringify("\"教程\"]}]}");
    return createSseResponse([
      `data: {"choices":[{"delta":{"content":${part1}}}]}\n\n`,
      `data: {"choices":[{"delta":{"content":${part2}}}]}\n\n`,
      "data: [DONE]\n\n",
    ]);
  };
  try {
    const tagged = await classifyRepositories(
      [{ repo: "owner/guide", description: "A course" }],
      { apiKey: "test-key", model: "auto-sh", baseUrl: "https://api.vmss.cn/" },
    );
    assert.equal(targetUrl, "https://api.vmss.cn/v1/chat/completions");
    assert.deepEqual(tagged[0].tags, ["教程"]);
    assert.match(body.messages[0].content, /AI、安全/);
    assert.match(body.messages[0].content, /1 至 3/);
    assert.match(body.messages[1].content, /owner\/guide/);
    assert.equal(body.model, "auto-sh");
    assert.equal(body.stream, true);
  } finally { globalThis.fetch = originalFetch; }
});

test("AI request seamlessly falls back to application/json completion response", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => ({
    ok: true,
    status: 200,
    headers: new Headers({ "content-type": "application/json" }),
    json: async () => ({ choices: [{ message: { content: '{"items":[{"id":0,"tags":["AI","Skill"]}]}' } }] }),
  });
  try {
    const tagged = await classifyRepositories(
      [{ repo: "owner/agent", description: "An agent" }],
      { apiKey: "test-key", model: "auto-sh" },
    );
    assert.deepEqual(tagged[0].tags, ["AI", "Skill"]);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("SSE parser decodes split multi-byte UTF-8 across chunk boundaries", async () => {
  const encoder = new TextEncoder();
  const text = "技术创新与实践探索";
  const encoded = encoder.encode(text);
  const part1 = encoder.encode('data: {"choices":[{"delta":{"content":"');
  const part2 = encoded.slice(0, 5); // Split inside a 3-byte UTF-8 character
  const part3 = encoded.slice(5);
  const part4 = encoder.encode('"}}]}' + "\n\n" + "data: [DONE]\n\n");

  const chunkA = new Uint8Array(part1.length + part2.length);
  chunkA.set(part1);
  chunkA.set(part2, part1.length);

  const chunkB = new Uint8Array(part3.length + part4.length);
  chunkB.set(part3);
  chunkB.set(part4, part3.length);

  const response = {
    ok: true,
    headers: new Headers({ "content-type": "text/event-stream" }),
    body: new ReadableStream({
      start(controller) {
        controller.enqueue(chunkA);
        controller.enqueue(chunkB);
        controller.close();
      },
    }),
  };

  const parsed = await parseChatCompletionResponse(response);
  assert.equal(parsed, text);
});

test("SSE parser handles multi-event frames and comments cleanly", async () => {
  const frame = [
    ": keep-alive ping",
    'data: {"choices":[{"delta":{"content":"Hello "}}]}',
    "",
    'data: {"choices":[{"delta":{"content":"World"}}]}',
    "",
    "data: [DONE]",
    "",
  ].join("\n");

  const response = createSseResponse([frame]);
  const parsed = await parseChatCompletionResponse(response);
  assert.equal(parsed, "Hello World");
});

test("SSE parser detects upstream stream errors and event errors", async () => {
  const errorEventResponse = createSseResponse([
    "event: error\ndata: {\"message\": \"Upstream gateway error\"}\n\n",
  ]);
  await assert.rejects(
    () => parseChatCompletionResponse(errorEventResponse),
    /AI stream/,
  );

  const inlineErrorResponse = createSseResponse([
    "data: {\"error\": {\"message\": \"Token limit exceeded\"}}\n\n",
  ]);
  await assert.rejects(
    () => parseChatCompletionResponse(inlineErrorResponse),
    /Token limit exceeded/,
  );
});

test("SSE parser rejects truncated streams closed prematurely without [DONE]", async () => {
  const truncatedResponse = createSseResponse([
    'data: {"choices":[{"delta":{"content":"Partial content without done"}}]}\n\n',
  ]);
  await assert.rejects(
    () => parseChatCompletionResponse(truncatedResponse),
    /closed prematurely without \[DONE\]/,
  );
});

test("analyze sends request with stream: true to normalized endpoint and validates structure", async () => {
  const originalFetch = globalThis.fetch;
  let targetUrl = "";
  let body;
  const analysisPayload = {
    summary: "这是一个高性能开发工具，提供便捷的代码分析与自动化构建能力，满足团队规范要求。",
    purpose: "该项目主要用于解决多语言项目的依赖管理和自动化分析问题，统一并优化工程环境。",
    advantages: "与同类传统脚本相比，采用原生二进制并行执行，吞吐量提升明显且整体系统资源消耗更低。",
    innovations: "创新性地采用增量图分析与细粒度缓存机制，全面避免日常开发中无效的重复分析计算过程。",
    scenarios: "适用于大规模微服务仓库的持续集成流水线，以及团队本地多模块跨语言协同开发调试场景。",
    usefulness: "工程效率团队、平台架构师与后端开发人员可以借此大幅简化日常流水线配置并加速迭代。",
    limitations: "目前对某些冷门特定语法的支持仍在持续完善中，在复杂混合语言场景需要额外的调试配置。",
  };
  globalThis.fetch = async (url, options) => {
    targetUrl = url;
    body = JSON.parse(options.body);
    const jsonStr = JSON.stringify(analysisPayload);
    const half1 = jsonStr.slice(0, 100);
    const half2 = jsonStr.slice(100);
    return createSseResponse([
      `data: {"choices":[{"delta":{"content":${JSON.stringify(half1)}}}]}\n\n`,
      `data: {"choices":[{"delta":{"content":${JSON.stringify(half2)}}}]}\n\n`,
      "data: [DONE]\n\n",
    ]);
  };
  try {
    const result = await analyze(
      { repo: "owner/cool-tool", description: "A cool tool", language: "TypeScript" },
      "# Cool Tool\nDetailed README documentation",
      "test-key",
      "auto-sh",
      "https://api.vmss.cn/",
    );
    assert.equal(targetUrl, "https://api.vmss.cn/v1/chat/completions");
    assert.equal(body.model, "auto-sh");
    assert.equal(body.stream, true);
    assert.ok(result.summary.length >= 20);
    assert.ok(result.purpose.length >= 35);
  } finally {
    globalThis.fetch = originalFetch;
  }
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

test("recovers from attempt timeout with a fresh non-aborted signal on retry without poisoning", async () => {
  const originalFetch = globalThis.fetch;
  const signalsSeen = [];
  const optionsSeen = [];
  let calls = 0;
  globalThis.fetch = async (url, options) => {
    calls++;
    signalsSeen.push(options.signal);
    optionsSeen.push(options);
    if (calls === 1) {
      await new Promise((r) => setTimeout(r, 40));
      assert.equal(options.signal?.aborted, true);
      assert.equal(options.signal?.reason?.name, "TimeoutError");
      const error = new DOMException("The operation was aborted due to timeout", "TimeoutError");
      throw error;
    }
    return { ok: true, status: 200 };
  };
  try {
    const response = await request("https://example.test/timeout-retry", { timeoutMs: 20 }, 3, 0);
    assert.equal(response.ok, true);
    assert.equal(calls, 2);
    assert.equal(signalsSeen.length, 2);
    assert.notEqual(signalsSeen[0], signalsSeen[1]);
    assert.equal(signalsSeen[0].aborted, true);
    assert.equal(signalsSeen[1].aborted, false);
    assert.equal("timeoutMs" in optionsSeen[0], false);
    assert.equal("timeoutMs" in optionsSeen[1], false);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("retries parseResponse stream failures and succeeds on subsequent attempt", async () => {
  const originalFetch = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async () => {
    calls++;
    if (calls === 1) {
      // Attempt 1: premature stream disconnect
      return createSseResponse(['data: {"choices":[{"delta":{"content":"incomplete"}}]}']);
    }
    // Attempt 2: valid complete stream
    return createSseResponse([
      'data: {"choices":[{"delta":{"content":"complete response"}}]}',
      "\n\ndata: [DONE]\n\n",
    ]);
  };
  try {
    const text = await request("https://example.test/stream-retry", {
      parseResponse: parseChatCompletionResponse,
      timeoutMs: 500,
    }, 3, 0);
    assert.equal(calls, 2);
    assert.equal(text, "complete response");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("respects explicit caller signal cancellation across retries", async () => {
  const originalFetch = globalThis.fetch;
  const controller = new AbortController();
  let calls = 0;
  globalThis.fetch = async (url, options) => {
    calls++;
    controller.abort(new Error("Caller cancelled"));
    throw new TypeError("network failed");
  };
  try {
    await assert.rejects(
      () => request("https://example.test/caller-cancel", { signal: controller.signal }, 3, 0),
      /Caller cancelled/,
    );
    assert.equal(calls, 1);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
