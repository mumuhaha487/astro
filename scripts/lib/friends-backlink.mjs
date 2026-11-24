import { lookup } from "node:dns/promises";
import net from "node:net";

const DEFAULT_TARGET_HOSTS = ["vmss.cn", "www.vmss.cn"];
const MAX_REDIRECTS = 5;
const MAX_BODY_BYTES = 2 * 1024 * 1024;
const REQUEST_TIMEOUT_MS = 15_000;
const USER_AGENT = "vmss-cn-friends-bot/1.0 (+https://vmss.cn/friends/)";

export function isPrivateIpAddress(ip) {
  const cleaned = ip.toLowerCase().replace(/^\[|\]$/g, "");
  const version = net.isIP(cleaned);
  if (version === 4) {
    return isPrivateIPv4(cleaned);
  }
  if (version === 6) {
    return isPrivateIPv6(cleaned);
  }
  return true;
}

function isPrivateIPv4(ip) {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some((n) => Number.isNaN(n) || n < 0 || n > 255)) return true;
  const [a, b, c] = parts;
  if (a === 0) return true; // 0.0.0.0/8
  if (a === 10) return true; // 10.0.0.0/8
  if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT 100.64.0.0/10
  if (a === 127) return true; // Loopback 127.0.0.0/8
  if (a === 169 && b === 254) return true; // Link-local 169.254.0.0/16
  if (a === 172 && b >= 16 && b <= 31) return true; // RFC1918 172.16.0.0/12
  if (a === 192 && b === 0 && c === 0) return true; // 192.0.0.0/24
  if (a === 192 && b === 0 && c === 2) return true; // TEST-NET-1
  if (a === 192 && b === 168) return true; // RFC1918 192.168.0.0/16
  if (a === 198 && (b === 18 || b === 19)) return true; // Benchmark 198.18.0.0/15
  if (a === 198 && b === 51 && c === 100) return true; // TEST-NET-2
  if (a === 203 && b === 0 && c === 113) return true; // TEST-NET-3
  if (a >= 224) return true; // Multicast & Reserved
  return false;
}

function isPrivateIPv6(ip) {
  const zoneStripped = ip.split("%")[0];
  if (zoneStripped === "::" || zoneStripped === "::1") return true;
  const mappedV4 = zoneStripped.match(/^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/);
  if (mappedV4) {
    return isPrivateIPv4(mappedV4[1]);
  }
  const mappedHex = zoneStripped.match(/^::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/);
  if (mappedHex) {
    const hi = parseInt(mappedHex[1], 16);
    const lo = parseInt(mappedHex[2], 16);
    return isPrivateIPv4(`${(hi >> 8) & 255}.${hi & 255}.${(lo >> 8) & 255}.${lo & 255}`);
  }
  const firstSegment = zoneStripped.split(":")[0];
  if (firstSegment) {
    const val = parseInt(firstSegment, 16);
    if (!Number.isNaN(val)) {
      if ((val & 0xfe00) === 0xfc00) return true; // fc00::/7 Unique local
      if ((val & 0xffc0) === 0xfe80) return true; // fe80::/10 Link-local
      if ((val & 0xff00) === 0xff00) return true; // ff00::/8 Multicast
    }
  }
  return false;
}

async function assertSafePublicUrl(rawUrl, dnsLookup = lookup) {
  let parsed;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new Error(`无效的目标 URL：${rawUrl}`);
  }
  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error(`不允许的协议：${parsed.protocol}`);
  }
  if (parsed.username || parsed.password) {
    throw new Error("目标 URL 不允许携带认证凭据");
  }
  const host = parsed.hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (!host || host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local") || host.endsWith(".internal") || host.endsWith(".arpa")) {
    throw new Error(`目标主机 \`${host}\` 不允许访问`);
  }
  if (net.isIP(host)) {
    if (isPrivateIpAddress(host)) {
      throw new Error(`目标 IP \`${host}\` 属于内网或保留地址`);
    }
    return parsed;
  }
  const records = await dnsLookup(host, { all: true, verbatim: true });
  if (!Array.isArray(records) || records.length === 0) {
    throw new Error(`无法解析域名 \`${host}\``);
  }
  for (const record of records) {
    if (isPrivateIpAddress(record.address)) {
      throw new Error(`域名 \`${host}\` 解析到了内网或保留地址`);
    }
  }
  return parsed;
}

async function readLimitedText(response, maxBytes = MAX_BODY_BYTES) {
  const lengthHeader = Number(response.headers.get("content-length"));
  if (Number.isFinite(lengthHeader) && lengthHeader > maxBytes) {
    throw new Error(`友链页面体积过大（超过 ${Math.round(maxBytes / 1024 / 1024)} MB）`);
  }
  if (!response.body) return await response.text();
  const reader = response.body.getReader();
  const chunks = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > maxBytes) {
        throw new Error(`友链页面体积过大（超过 ${Math.round(maxBytes / 1024 / 1024)} MB）`);
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const merged = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder("utf-8", { fatal: false }).decode(merged);
}

async function safeFetchPage(startUrl, options = {}) {
  const fetchImpl = options.fetchImpl ?? globalThis.fetch;
  const dnsLookup = options.dnsLookup ?? lookup;
  const timeoutMs = options.timeoutMs ?? REQUEST_TIMEOUT_MS;
  let currentUrl = startUrl;

  for (let hop = 0; hop <= MAX_REDIRECTS; hop += 1) {
    await assertSafePublicUrl(currentUrl, dnsLookup);
    const response = await fetchImpl(currentUrl, {
      method: "GET",
      redirect: "manual",
      signal: AbortSignal.timeout(timeoutMs),
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.1",
        "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
      },
    });

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location) {
        return { status: response.status, finalUrl: currentUrl, contentType: "", body: "" };
      }
      currentUrl = new URL(location, currentUrl).href;
      continue;
    }

    const contentType = (response.headers.get("content-type") || "").toLowerCase();
    const body = response.ok ? await readLimitedText(response) : "";
    return { status: response.status, finalUrl: currentUrl, contentType, body };
  }

  throw new Error(`重定向次数超过上限（${MAX_REDIRECTS} 次）`);
}

function decodeHtmlEntities(value) {
  return value
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#(\d+);/g, (_, num) => String.fromCodePoint(Number(num)))
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)));
}

function parseAttributes(rawAttrs) {
  const attrs = new Map();
  const attrPattern = /([a-zA-Z_:][a-zA-Z0-9_.:-]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  let match;
  while ((match = attrPattern.exec(rawAttrs)) !== null) {
    const name = match[1].toLowerCase();
    const value = match[2] ?? match[3] ?? match[4] ?? "";
    attrs.set(name, decodeHtmlEntities(value));
  }
  return attrs;
}

function isHiddenTag(attrs, isAnchor) {
  if (attrs.has("hidden")) return true;
  if (isAnchor && (attrs.get("aria-hidden") || "").trim().toLowerCase() === "true") return true;
  const style = (attrs.get("style") || "").replace(/\s+/g, "").toLowerCase();
  if (style.includes("display:none") || style.includes("visibility:hidden") || /(?:^|;)opacity:0(?:;|$)/.test(style)) {
    return true;
  }
  return false;
}

const VOID_TAGS = new Set([
  "area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr",
]);

export function findBacklinkInHtml(html, baseUrl, targetHosts = DEFAULT_TARGET_HOSTS) {
  const allowedHosts = new Set(targetHosts.map((host) => host.toLowerCase()));
  // Strip comments and non-rendered blocks where links are not visible page anchors.
  const cleaned = html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<(script|style|template|textarea|noscript)\b[^>]*>[\s\S]*?<\/\1>/gi, "");

  const tagPattern = /<(\/?)([a-zA-Z][a-zA-Z0-9:-]*)((?:\s+[^>"']*(?:"[^"]*"|'[^']*'))*[^>]*)(\/?)>/g;
  const hiddenStack = [];
  let match;

  while ((match = tagPattern.exec(cleaned)) !== null) {
    const isClosing = match[1] === "/";
    const tagName = match[2].toLowerCase();
    const rawAttrs = match[3] || "";
    const isSelfClosing = match[4] === "/" || VOID_TAGS.has(tagName);

    if (isClosing) {
      for (let idx = hiddenStack.length - 1; idx >= 0; idx -= 1) {
        if (hiddenStack[idx].tag === tagName) {
          hiddenStack.splice(idx);
          break;
        }
      }
      continue;
    }

    const attrs = parseAttributes(rawAttrs);
    const hiddenSelf = isHiddenTag(attrs, tagName === "a");
    const insideHidden = hiddenStack.some((item) => item.hidden);

    if (tagName === "a" && !hiddenSelf && !insideHidden) {
      const rawHref = (attrs.get("href") || "").trim();
      if (rawHref) {
        try {
          const resolved = new URL(rawHref, baseUrl);
          if (resolved.protocol === "https:" && allowedHosts.has(resolved.hostname.toLowerCase())) {
            return {
              found: true,
              matchedHref: resolved.href,
            };
          }
        } catch {}
      }
    }

    if (!isSelfClosing) {
      hiddenStack.push({ tag: tagName, hidden: hiddenSelf });
    }
  }

  return { found: false, matchedHref: null };
}

export async function verifyFriendBacklink(siteUrl, options = {}) {
  const targetHosts = options.targetHosts ?? DEFAULT_TARGET_HOSTS;
  const origin = new URL(siteUrl).origin;
  const candidates = [`${origin}/friends`, `${origin}/friends/`];
  let lastError = null;
  let lastResult = null;

  for (let index = 0; index < candidates.length; index += 1) {
    const candidate = candidates[index];
    try {
      const response = await safeFetchPage(candidate, options);
      lastResult = { checkedUrl: candidate, finalUrl: response.finalUrl, status: response.status };

      if (response.status === 404 && index === 0) {
        continue;
      }
      if (response.status < 200 || response.status >= 300) {
        return {
          ok: false,
          checkedUrl: candidate,
          finalUrl: response.finalUrl,
          status: response.status,
          matchedHref: null,
          reason: `访问 \`${candidate}\` 返回 HTTP ${response.status}，无法确认友链页面。`,
        };
      }

      const match = findBacklinkInHtml(response.body, response.finalUrl, targetHosts);
      if (match.found) {
        return {
          ok: true,
          checkedUrl: candidate,
          finalUrl: response.finalUrl,
          status: response.status,
          matchedHref: match.matchedHref,
          reason: null,
        };
      }

      if (index === 0 && response.finalUrl !== candidates[1]) {
        continue;
      }

      return {
        ok: false,
        checkedUrl: candidate,
        finalUrl: response.finalUrl,
        status: response.status,
        matchedHref: null,
        reason: `已在 \`${response.finalUrl}\` 读取页面，但未在可见的 \`<a href>\` 链接中找到 \`https://vmss.cn\`。请先在你的 \`/friends\` 页面添加指向 \`https://vmss.cn\` 的友链后再提交申请。`,
      };
    } catch (error) {
      lastError = error;
      if (index === 0 && !String(error?.message || "").includes("内网或保留地址")) {
        continue;
      }
      return {
        ok: false,
        checkedUrl: candidate,
        finalUrl: candidate,
        status: null,
        matchedHref: null,
        reason: `访问 \`${candidate}\` 失败：${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  return {
    ok: false,
    checkedUrl: lastResult?.checkedUrl || candidates[0],
    finalUrl: lastResult?.finalUrl || candidates[0],
    status: lastResult?.status ?? null,
    matchedHref: null,
    reason: lastError
      ? `访问 \`${candidates[0]}\` 失败：${lastError.message}`
      : `访问 \`${candidates[0]}\` 返回 HTTP ${lastResult?.status ?? "未知"}，未找到指向 \`https://vmss.cn\` 的友链。`,
  };
}
