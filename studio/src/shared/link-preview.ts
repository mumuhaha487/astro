export interface LinkPreview {
  url: string;
  title: string;
  siteName: string;
}

export class LinkPreviewError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "LinkPreviewError";
    this.status = status;
  }
}

const MAX_REDIRECTS = 3;
const MAX_HTML_BYTES = 512 * 1024;

export function normalizePublicHttpUrl(value: string): URL {
  if (value.length > 2048) throw new LinkPreviewError(400, "链接过长");

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new LinkPreviewError(400, "请输入有效的 HTTP 或 HTTPS 链接");
  }

  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) {
    throw new LinkPreviewError(400, "仅支持公开的 HTTP 或 HTTPS 链接");
  }
  if (url.port && !["80", "443"].includes(url.port)) {
    throw new LinkPreviewError(400, "链接端口不受支持");
  }
  if (isPrivateHostname(url.hostname)) {
    throw new LinkPreviewError(400, "不能读取本地或私有网络地址");
  }

  url.hash = "";
  return url;
}

export async function fetchLinkPreview(
  value: string,
  fetcher: typeof fetch = fetch,
): Promise<LinkPreview> {
  let url = normalizePublicHttpUrl(value);

  for (let redirect = 0; redirect <= MAX_REDIRECTS; redirect += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    let response: Response;
    try {
      response = await fetcher(url, {
        redirect: "manual",
        signal: controller.signal,
        headers: {
          Accept: "text/html,application/xhtml+xml;q=0.9",
          "User-Agent": "Astro-Blog-Studio-Link-Preview/1.0",
        },
      });
    } catch {
      throw new LinkPreviewError(502, "无法读取这个链接");
    } finally {
      clearTimeout(timeout);
    }

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("Location");
      if (!location || redirect === MAX_REDIRECTS) {
        throw new LinkPreviewError(502, "链接重定向次数过多");
      }
      url = normalizePublicHttpUrl(new URL(location, url).toString());
      continue;
    }

    if (!response.ok) throw new LinkPreviewError(502, `链接返回了 ${response.status}`);
    const contentType = response.headers.get("Content-Type") || "";
    if (contentType && !/\b(?:text\/html|application\/xhtml\+xml)\b/i.test(contentType)) {
      throw new LinkPreviewError(422, "这个链接不是网页");
    }

    const bytes = await readLimitedBody(response);
    const html = decodeHtml(bytes, contentType);
    const title = extractPageTitle(html) || displayHostname(url.hostname);
    const siteName = extractMetaContent(html, "og:site_name") || displayHostname(url.hostname);
    return { url: url.toString(), title, siteName };
  }

  throw new LinkPreviewError(502, "无法读取这个链接");
}

export function extractPageTitle(html: string): string {
  return cleanMetadataText(
    extractMetaContent(html, "og:title")
      || extractMetaContent(html, "twitter:title")
      || html.match(/<title\b[^>]*>([\s\S]*?)<\/title\s*>/i)?.[1]
      || "",
  );
}

function extractMetaContent(html: string, expectedName: string): string {
  for (const match of html.matchAll(/<meta\b[^>]*>/gi)) {
    const attributes = parseHtmlAttributes(match[0]);
    const name = (attributes.property || attributes.name || "").toLowerCase();
    if (name === expectedName.toLowerCase()) return cleanMetadataText(attributes.content || "");
  }
  return "";
}

function parseHtmlAttributes(tag: string): Record<string, string> {
  const attributes: Record<string, string> = {};
  for (const match of tag.matchAll(/([^\s=<>/]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/g)) {
    attributes[match[1].toLowerCase()] = match[2] ?? match[3] ?? match[4] ?? "";
  }
  return attributes;
}

function cleanMetadataText(value: string): string {
  return decodeHtmlEntities(value.replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 160);
}

function decodeHtmlEntities(value: string): string {
  const named: Record<string, string> = {
    amp: "&",
    apos: "'",
    gt: ">",
    lt: "<",
    nbsp: " ",
    quot: '"',
  };
  return value.replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (entity, body: string) => {
    if (body[0] === "#") {
      const radix = body[1]?.toLowerCase() === "x" ? 16 : 10;
      const digits = radix === 16 ? body.slice(2) : body.slice(1);
      const codePoint = Number.parseInt(digits, radix);
      return Number.isSafeInteger(codePoint) && codePoint > 0 && codePoint <= 0x10ffff
        ? String.fromCodePoint(codePoint)
        : entity;
    }
    return named[body.toLowerCase()] ?? entity;
  });
}

async function readLimitedBody(response: Response): Promise<Uint8Array> {
  const declaredLength = Number(response.headers.get("Content-Length") || 0);
  if (declaredLength > MAX_HTML_BYTES) throw new LinkPreviewError(413, "网页内容过大，无法生成预览");
  if (!response.body) return new Uint8Array(await response.arrayBuffer());

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let length = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    length += value.byteLength;
    if (length > MAX_HTML_BYTES) {
      await reader.cancel();
      throw new LinkPreviewError(413, "网页内容过大，无法生成预览");
    }
    chunks.push(value);
  }

  const merged = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return merged;
}

function decodeHtml(bytes: Uint8Array, contentType: string): string {
  const headerCharset = contentType.match(/charset\s*=\s*["']?([^;\s"']+)/i)?.[1];
  const probe = new TextDecoder().decode(bytes.slice(0, 8192));
  const documentCharset = probe.match(/<meta\b[^>]*charset\s*=\s*["']?([^\s"'/>;]+)/i)?.[1];
  try {
    return new TextDecoder(headerCharset || documentCharset || "utf-8").decode(bytes);
  } catch {
    return new TextDecoder().decode(bytes);
  }
}

function displayHostname(hostname: string): string {
  return hostname.toLowerCase().replace(/^www\./, "");
}

function isPrivateHostname(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, "").replace(/\.$/, "");
  if (
    host === "localhost"
    || !host
    || [".localhost", ".local", ".internal", ".home", ".lan", ".test", ".invalid", ".onion"]
      .some((suffix) => host.endsWith(suffix))
  ) return true;

  const ipv4 = parseIpv4(host);
  if (ipv4) {
    const [a, b] = ipv4;
    return a === 0
      || a === 10
      || a === 127
      || (a === 100 && b >= 64 && b <= 127)
      || (a === 169 && b === 254)
      || (a === 172 && b >= 16 && b <= 31)
      || (a === 192 && b === 168)
      || (a === 192 && b === 0)
      || (a === 198 && [18, 19, 51].includes(b))
      || (a === 203 && b === 0)
      || a >= 224;
  }

  if (host.includes(":")) {
    if (["::", "::1"].includes(host)) return true;
    if (/^(?:fc|fd|fe[89ab]|ff)/i.test(host)) return true;
    if (/^2001:db8(?::|$)/i.test(host)) return true;
    const mappedIpv4 = host.match(/::ffff:(\d+\.\d+\.\d+\.\d+)$/i)?.[1];
    if (mappedIpv4) return isPrivateHostname(mappedIpv4);
  }
  return !host.includes(".");
}

function parseIpv4(hostname: string): number[] | null {
  if (!/^\d+(?:\.\d+){3}$/.test(hostname)) return null;
  const parts = hostname.split(".").map(Number);
  return parts.every((part) => Number.isInteger(part) && part >= 0 && part <= 255) ? parts : null;
}
