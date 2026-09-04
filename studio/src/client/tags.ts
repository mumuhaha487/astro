export const MAX_ARTICLE_TAGS = 10;

const TAG_SEPARATOR = /[,，\n]/;

function tagIdentity(tag: string): string {
  return tag.normalize("NFKC").toLocaleLowerCase();
}

export function normalizeTags(tags: Iterable<string>, limit = MAX_ARTICLE_TAGS): string[] {
  const normalized: string[] = [];
  const seen = new Set<string>();

  for (const value of tags) {
    const tag = value.trim();
    const identity = tagIdentity(tag);
    if (!tag || seen.has(identity)) continue;
    seen.add(identity);
    normalized.push(tag);
    if (normalized.length === limit) break;
  }

  return normalized;
}

export function tagsFromText(value: string): string[] {
  return normalizeTags(value.split(TAG_SEPARATOR));
}

export function mergeTagText(tags: readonly string[], value: string): string[] {
  return normalizeTags([...tags, ...value.split(TAG_SEPARATOR)]);
}

export function consumeTagInput(value: string): { committed: string[]; pending: string } {
  const parts = value.split(TAG_SEPARATOR);
  if (parts.length === 1) return { committed: [], pending: value };

  return {
    committed: normalizeTags(parts.slice(0, -1)),
    pending: parts.at(-1) ?? "",
  };
}

export function tagColorHue(tag: string): number {
  let hash = 2166136261;
  for (let index = 0; index < tag.length; index += 1) {
    hash ^= tag.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) % 360;
}
