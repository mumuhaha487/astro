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
