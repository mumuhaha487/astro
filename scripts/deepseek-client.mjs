export const DEFAULT_BASE_URL = "https://api.vmss.cn/";
export const DEFAULT_MODEL = "auto-sh";

export function normalizeBaseUrl(raw = process.env.DEEPSEEK_BASE_URL || DEFAULT_BASE_URL) {
  const value = String(raw || DEFAULT_BASE_URL).trim();
  const parsed = new URL(value);
  parsed.search = "";
  parsed.hash = "";
  parsed.username = "";
  parsed.password = "";
  let pathname = parsed.pathname.replace(/\/+$/, "");
  if (pathname.endsWith("/v1")) {
    parsed.pathname = pathname;
  } else if (pathname === "" || pathname === "/") {
    parsed.pathname = "/v1";
  } else {
    parsed.pathname = `${pathname}/v1`;
  }
  return parsed.origin + parsed.pathname;
}

export function getChatCompletionsUrl(baseUrl = process.env.DEEPSEEK_BASE_URL) {
  return `${normalizeBaseUrl(baseUrl)}/chat/completions`;
}

export function getModelsUrl(baseUrl = process.env.DEEPSEEK_BASE_URL) {
  return `${normalizeBaseUrl(baseUrl)}/models`;
}

export function selectDeepSeekModel(ids, preferred = "") {
  const available = [...new Set(ids.filter((id) => typeof id === "string" && id.trim()).map((id) => id.trim()))];
  if (preferred) {
    if (!available.includes(preferred)) throw new Error(`Configured DeepSeek model is unavailable: ${preferred}`);
    return preferred;
  }
  const priorities = [
    /^deepseek\/deepseek-v4(?:\.\d+)?-flash(?:-|$)/i,
    /^deepseek\/.*flash/i,
    /^deepseek\/.*chat/i,
    /^deepseek-chat$/i,
    /deepseek/i,
  ];
  for (const pattern of priorities) {
    const model = available.find((id) => pattern.test(id) && !/(embed|rerank|image|audio|speech|vision)/i.test(id));
    if (model) return model;
  }
  throw new Error("No DeepSeek text model is available from the API gateway");
}

export async function resolveDeepSeekModel(apiKey, {
  preferred = process.env.DEEPSEEK_MODEL || DEFAULT_MODEL,
  baseUrl = process.env.DEEPSEEK_BASE_URL,
  fetchImpl = fetch,
} = {}) {
  if (!apiKey) throw new Error("DEEPSEEK_API_KEY is required");
  const modelToUse = (preferred ?? "").trim();
  if (modelToUse) {
    console.log(`Using DeepSeek model: ${modelToUse}`);
    return modelToUse;
  }
  const response = await fetchImpl(getModelsUrl(baseUrl), {
    signal: AbortSignal.timeout(45000),
    headers: { Authorization: `Bearer ${apiKey}`, Accept: "application/json" },
  });
  if (!response.ok) throw new Error(`DeepSeek model discovery: HTTP ${response.status}`);
  const payload = await response.json();
  const ids = Array.isArray(payload?.data) ? payload.data.map((item) => item?.id) : [];
  const model = selectDeepSeekModel(ids, preferred);
  console.log(`Using DeepSeek model: ${model}`);
  return model;
}

export async function parseChatCompletionResponse(response) {
  if (!response.ok) {
    throw new Error(`AI service: HTTP ${response.status}`);
  }

  const contentType = response.headers?.get?.("content-type") || "";
  if (contentType.includes("application/json") || (!response.body && typeof response.json === "function")) {
    const payload = await response.json();
    if (payload?.error) {
      throw new Error(payload.error.message || `AI gateway error: ${JSON.stringify(payload.error)}`);
    }
    const text = payload?.choices?.[0]?.message?.content;
    if (typeof text !== "string" || !text.trim()) {
      throw new Error("Invalid AI JSON response: missing or empty content");
    }
    return text;
  }

  if (!response.body) {
    throw new Error("Empty response body from AI service");
  }

  const decoder = new TextDecoder("utf-8");
  let buffer = "";
  let fullContent = "";
  let sawDone = false;
  let currentEvent = "";

  const processLine = (rawLine) => {
    const line = rawLine.replace(/\r$/, "");
    if (!line || line.startsWith(":")) return;
    if (line.startsWith("event:")) {
      currentEvent = line.slice(6).trim();
      if (currentEvent === "error") {
        throw new Error("AI stream sent error event");
      }
      return;
    }
    if (line.startsWith("data:")) {
      const dataStr = line.slice(5).trim();
      if (!dataStr) return;
      if (dataStr === "[DONE]") {
        sawDone = true;
        return;
      }
      let parsed;
      try {
        parsed = JSON.parse(dataStr);
      } catch {
        throw new Error(`Invalid SSE data JSON: ${dataStr}`);
      }
      if (parsed?.error) {
        throw new Error(parsed.error.message || `AI stream error: ${JSON.stringify(parsed.error)}`);
      }
      if (currentEvent === "error") {
        throw new Error(parsed.message || JSON.stringify(parsed));
      }
      const delta = parsed?.choices?.[0]?.delta?.content;
      if (typeof delta === "string") {
        fullContent += delta;
      }
    }
  };

  const stream = response.body;
  if (typeof stream[Symbol.asyncIterator] === "function") {
    for await (const chunk of stream) {
      const text = typeof chunk === "string" ? chunk : decoder.decode(chunk, { stream: true });
      buffer += text;
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        processLine(line);
        if (sawDone) break;
      }
      if (sawDone) break;
    }
  } else if (typeof stream.getReader === "function") {
    const reader = stream.getReader();
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = typeof value === "string" ? value : decoder.decode(value, { stream: true });
        buffer += text;
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          processLine(line);
          if (sawDone) break;
        }
        if (sawDone) break;
      }
    } finally {
      reader.releaseLock();
    }
  } else {
    throw new Error("Unsupported stream body type");
  }

  const remaining = decoder.decode();
  if (remaining) buffer += remaining;
  if (buffer) {
    const lines = buffer.split("\n");
    for (const line of lines) {
      processLine(line);
    }
  }

  if (!sawDone) {
    throw new Error("AI stream closed prematurely without [DONE]");
  }
  if (!fullContent || !fullContent.trim()) {
    throw new Error("Empty AI stream completion content");
  }
  return fullContent;
}
