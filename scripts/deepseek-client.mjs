const modelsUrl = "https://deepseek.inc.re/v1/models";

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

export async function resolveDeepSeekModel(apiKey, { preferred = process.env.DEEPSEEK_MODEL || "", fetchImpl = fetch } = {}) {
  if (!apiKey) throw new Error("DEEPSEEK_API_KEY is required");
  const response = await fetchImpl(modelsUrl, {
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
