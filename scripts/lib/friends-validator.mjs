export const FRIEND_FILENAME_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?\.json$/;
export const FRIEND_ENTRY_PATH_PATTERN = /^friends\/entries\/([a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?\.json)$/;

const ALLOWED_KEYS = new Set(["name", "url", "avatar", "description", "tags"]);
const PLACEHOLDER_NAMES = new Set(["你的站点名称", "your site name", "site name", "example"]);
const PLACEHOLDER_HOSTS = new Set(["你的域名", "example.com", "www.example.com", "example.org", "example.net", "yourdomain.com", "your-domain.com"]);
const SELF_HOSTS = new Set(["vmss.cn", "www.vmss.cn"]);
const CONTROL_CHARS = /[\u0000-\u001f\u007f]/;

export function normalizeFriendUrl(rawUrl) {
  const parsed = new URL(rawUrl);
  return parsed.href.replace(/\/$/, "").toLowerCase();
}

export function normalizeFriendName(name) {
  return name.trim().toLocaleLowerCase();
}

export function isValidFriendFilename(filename) {
  return typeof filename === "string" && FRIEND_FILENAME_PATTERN.test(filename);
}

export function isDisallowedHostname(hostname) {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (!host) return true;
  if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local") || host.endsWith(".internal") || host.endsWith(".arpa")) {
    return true;
  }
  if (/^\d{1,3}(?:\.\d{1,3}){3}$/.test(host)) {
    const parts = host.split(".").map(Number);
    if (parts.some((n) => n < 0 || n > 255)) return true;
    const [a, b] = parts;
    if (a === 0 || a === 10 || a === 127) return true;
    if (a === 100 && b >= 64 && b <= 127) return true;
    if (a === 169 && b === 254) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 192 && b === 0) return true;
    if (a === 198 && (b === 18 || b === 19)) return true;
    if (a >= 224) return true;
    return false;
  }
  if (host.includes(":")) {
    return true;
  }
  if (!host.includes(".") || host.startsWith(".") || host.endsWith(".")) return true;
  return false;
}

export function parseAndValidateFriendEntry(source, fileLabel, options = {}) {
  const {
    strictSchema = true,
    rejectPlaceholders = false,
    rejectSelfHost = false,
    existingUrls = new Set(),
    existingNames = new Set(),
  } = options;

  const errors = [];

  if (strictSchema && !isValidFriendFilename(fileLabel)) {
    errors.push(`文件名 \`${fileLabel}\` 不合法：只允许小写字母、数字和连字符，并以 \`.json\` 结尾（例如 \`my-blog.json\`）。`);
  }

  let raw;
  try {
    raw = JSON.parse(source);
  } catch (error) {
    return {
      ok: false,
      errors: [`JSON 解析失败：${error.message}`],
      entry: null,
    };
  }

  if (!raw || Array.isArray(raw) || typeof raw !== "object") {
    return {
      ok: false,
      errors: ["JSON 根节点必须是一个对象 `{ ... }`。"],
      entry: null,
    };
  }

  if (strictSchema) {
    const unknownKeys = Object.keys(raw).filter((key) => !ALLOWED_KEYS.has(key));
    if (unknownKeys.length > 0) {
      errors.push(`包含未允许的字段：${unknownKeys.map((k) => `\`${k}\``).join("、")}（仅允许 \`name\`、\`url\`、\`avatar\`、\`description\`、\`tags\`）。`);
    }
  }

  const name = validateTextField(raw.name, "name", 1, 48, true, errors);
  if (name && rejectPlaceholders && PLACEHOLDER_NAMES.has(name.toLocaleLowerCase())) {
    errors.push("`name` 不能使用模板占位符，请填写你的真实站点名称。");
  }

  const url = validateUrlField(raw.url, "url", true, { rejectPlaceholders, rejectSelfHost }, errors);

  let avatar = null;
  if (raw.avatar !== undefined && raw.avatar !== null) {
    if (raw.avatar === "" && !strictSchema) {
      avatar = null;
    } else if (raw.avatar === "") {
      errors.push("`avatar` 不可为空字符串；如无头像请填写 `null` 或省略该字段。");
    } else {
      avatar = validateUrlField(raw.avatar, "avatar", false, { rejectPlaceholders, rejectSelfHost: false }, errors);
    }
  }

  let description = "";
  if (raw.description !== undefined && raw.description !== null) {
    if (typeof raw.description !== "string") {
      errors.push("`description` 必须是字符串。");
    } else {
      const trimmed = raw.description.trim();
      if (CONTROL_CHARS.test(trimmed)) {
        errors.push("`description` 不能包含换行或控制字符。");
      } else if (trimmed.length > 120) {
        errors.push("`description` 长度不能超过 120 个字符。");
      } else if (rejectPlaceholders && trimmed === "一句话介绍你的站点") {
        errors.push("`description` 请修改为真实的站点简介，不要保留模板占位文案。");
      } else {
        description = trimmed;
      }
    }
  }

  const tags = [];
  if (raw.tags !== undefined && raw.tags !== null) {
    if (!Array.isArray(raw.tags)) {
      errors.push("`tags` 必须是字符串数组。");
    } else {
      if (strictSchema && raw.tags.length > 6) {
        errors.push("`tags` 最多允许 6 个标签。");
      }
      const seenTags = new Set();
      const limit = strictSchema ? raw.tags.length : Math.min(raw.tags.length, 6);
      for (let index = 0; index < limit; index += 1) {
        const tag = validateTextField(raw.tags[index], `tags[${index}]`, 1, 24, true, errors);
        if (tag) {
          const normalizedTag = tag.toLocaleLowerCase();
          if (strictSchema && seenTags.has(normalizedTag)) {
            errors.push(`\`tags\` 中存在重复标签：\`${tag}\`。`);
          } else {
            seenTags.add(normalizedTag);
            tags.push(tag);
          }
        }
      }
    }
  }

  if (url) {
    const normalizedUrl = normalizeFriendUrl(url);
    if (existingUrls.has(normalizedUrl)) {
      errors.push(`站点链接 \`${url}\` 已存在于现有友链列表中，请勿重复提交。`);
    }
  }

  if (name) {
    const normalizedName = normalizeFriendName(name);
    if (existingNames.has(normalizedName)) {
      errors.push(`站点名称 \`${name}\` 已存在于现有友链列表中，请勿重复提交。`);
    }
  }

  if (errors.length > 0) {
    return { ok: false, errors, entry: null };
  }

  return {
    ok: true,
    errors: [],
    entry: {
      name,
      url,
      avatar,
      description,
      tags,
    },
  };
}

function validateTextField(value, field, min, max, required, errors) {
  if (typeof value !== "string") {
    if (required) errors.push(`\`${field}\` 必须是字符串。`);
    return null;
  }
  const normalized = value.trim();
  if (CONTROL_CHARS.test(normalized)) {
    errors.push(`\`${field}\` 不能包含换行或控制字符。`);
    return null;
  }
  if (normalized.length < min || normalized.length > max) {
    errors.push(`\`${field}\` 长度需在 ${min}–${max} 个字符之间。`);
    return null;
  }
  return normalized;
}

function validateUrlField(value, field, required, options, errors) {
  const normalized = validateTextField(value, field, 8, 500, required, errors);
  if (!normalized) return null;
  let parsed;
  try {
    parsed = new URL(normalized);
  } catch {
    errors.push(`\`${field}\` 不是有效的 URL：\`${normalized}\`。`);
    return null;
  }
  if (!["http:", "https:"].includes(parsed.protocol)) {
    errors.push(`\`${field}\` 仅支持 \`http://\` 或 \`https://\` 协议。`);
    return null;
  }
  if (parsed.username || parsed.password) {
    errors.push(`\`${field}\` 不允许包含账号或密码凭据。`);
    return null;
  }
  const host = parsed.hostname.toLowerCase();
  if (options.rejectPlaceholders && (PLACEHOLDER_HOSTS.has(host) || normalized.includes("你的域名"))) {
    errors.push(`\`${field}\` 不能使用示例或占位域名，请填写你的真实站点地址。`);
    return null;
  }
  if (options.rejectSelfHost && SELF_HOSTS.has(host)) {
    errors.push(`\`${field}\` 不能填写本站域名 \`${host}\`。`);
    return null;
  }
  if (isDisallowedHostname(host)) {
    errors.push(`\`${field}\` 的域名 \`${host}\` 无效或属于本地/内网地址。`);
    return null;
  }
  return parsed.href;
}
