import YAML, { Scalar } from "yaml";

export interface FrontmatterFields {
  title: string;
  published: string;
  updated?: string;
  description: string;
  image: string;
  tags: string[];
  category: string;
  draft: boolean;
  pinned: boolean;
  priority?: number;
  lang: string;
  comment: boolean;
  encrypted: boolean;
  password?: string;
  passwordHint?: string;
  permalink?: string;
  url?: string;
  alias?: string;
  author?: string;
  sourceLink?: string;
  licenseName?: string;
  licenseUrl?: string;
  articleType?: string;
  creationStatement?: string;
  backup?: boolean;
  visibility?: string;
  articleTemplate?: string;
  multiPlatform?: boolean;
  activity?: string;
  topic?: string;
  scheduledAt?: string;
  [key: string]: unknown;
}

export interface ParsedDocument {
  fields: FrontmatterFields;
  body: string;
}

const defaults = (): FrontmatterFields => ({
  title: "",
  published: new Date().toISOString().slice(0, 10),
  description: "",
  image: "",
  tags: [],
  category: "",
  draft: true,
  pinned: false,
  lang: "zh-CN",
  comment: true,
  encrypted: false,
});

function asDate(value: unknown): string {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === "string") return value.slice(0, 10);
  return "";
}

export function parseDocument(content: string): ParsedDocument {
  const match = content.match(/^---\s*\r?\n([\s\S]*?)\r?\n---\s*(?:\r?\n|$)/);
  if (!match) {
    return { fields: defaults(), body: content };
  }

  let parsed: Record<string, unknown> = {};
  try {
    parsed = (YAML.parse(match[1]) as Record<string, unknown> | null) ?? {};
  } catch {
    parsed = {};
  }

  const fields = {
    ...defaults(),
    ...parsed,
    title: typeof parsed.title === "string" ? parsed.title : "",
    published: asDate(parsed.published) || defaults().published,
    updated: asDate(parsed.updated) || undefined,
    description: typeof parsed.description === "string" ? parsed.description : "",
    image: typeof parsed.image === "string" ? parsed.image : "",
    tags: Array.isArray(parsed.tags) ? parsed.tags.map(String) : [],
    category: typeof parsed.category === "string" ? parsed.category : "",
    draft: parsed.draft === true,
    pinned: parsed.pinned === true,
    priority: typeof parsed.priority === "number" ? parsed.priority : undefined,
    lang: typeof parsed.lang === "string" ? parsed.lang : "zh-CN",
    comment: parsed.comment !== false,
    encrypted: parsed.encrypted === true,
    permalink:
      typeof parsed.permalink === "string"
        ? parsed.permalink
        : typeof parsed.url === "string"
          ? parsed.url
          : undefined,
  } satisfies FrontmatterFields;

  return { fields, body: content.slice(match[0].length) };
}

const preferredOrder = [
  "title",
  "published",
  "updated",
  "description",
  "image",
  "tags",
  "category",
  "draft",
  "pinned",
  "priority",
  "lang",
  "comment",
  "permalink",
  "url",
  "alias",
  "author",
  "sourceLink",
  "licenseName",
  "licenseUrl",
  "articleType",
  "creationStatement",
  "backup",
  "visibility",
  "articleTemplate",
  "multiPlatform",
  "activity",
  "topic",
  "scheduledAt",
  "encrypted",
  "password",
  "passwordHint",
];

function serializeFrontmatterValue(key: string, value: unknown): unknown {
  if ((key === "published" || key === "updated") && typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const date = new Scalar(value);
    date.type = Scalar.PLAIN;
    return date;
  }
  return value;
}

export function serializeDocument(fields: FrontmatterFields, body: string): string {
  const ordered: Record<string, unknown> = {};
  const normalizedFields: FrontmatterFields = {
    ...fields,
    url: fields.permalink || undefined,
  };
  for (const key of preferredOrder) {
    const value = normalizedFields[key];
    if (value === undefined || value === null || value === "") continue;
    if (Array.isArray(value) && value.length === 0) continue;
    if (key === "priority" && normalizedFields.pinned !== true) continue;
    if ((key === "password" || key === "passwordHint") && normalizedFields.encrypted !== true) continue;
    ordered[key] = serializeFrontmatterValue(key, value);
  }
  for (const [key, value] of Object.entries(normalizedFields)) {
    if (!(key in ordered) && !preferredOrder.includes(key) && value !== undefined) {
      ordered[key] = value;
    }
  }

  const yaml = YAML.stringify(ordered, {
    lineWidth: 0,
    defaultStringType: "QUOTE_SINGLE",
    defaultKeyType: "PLAIN",
  }).trimEnd();
  return `---\n${yaml}\n---\n\n${body.replace(/^(?:\r?\n)+/, "")}`;
}

export function makePostPath(title: string): string {
  const safe = title
    .trim()
    .normalize("NFKC")
    .replace(/[\\/:*?"<>|#%{}[\]]/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 90);
  return `content/posts/${safe || `untitled-${Date.now()}`}.md`;
}

export function hasUnsafeRichContent(body: string): boolean {
  return /<(?:script|style|iframe|object|embed|form|input|textarea|select|button)\b/i.test(body);
}
