export const WEB_EMBED_MARKER_PREFIX = "astro-web-embed:";
export const WEB_EMBED_MIN_HEIGHT = 320;
export const WEB_EMBED_MAX_HEIGHT = 1200;
export const WEB_EMBED_DEFAULT_HEIGHT = 640;

export function clampWebEmbedHeight(value: number): number {
  if (!Number.isFinite(value)) return WEB_EMBED_DEFAULT_HEIGHT;
  return Math.min(WEB_EMBED_MAX_HEIGHT, Math.max(WEB_EMBED_MIN_HEIGHT, Math.round(value)));
}

export function buildWebEmbedMarker(height: number): string {
  return `${WEB_EMBED_MARKER_PREFIX}${clampWebEmbedHeight(height)}`;
}

export function parseWebEmbedMarker(value: string | null | undefined): number | null {
  const match = value?.match(/^astro-web-embed:(\d{3,4})$/);
  if (!match) return null;
  const height = Number.parseInt(match[1], 10);
  return height >= WEB_EMBED_MIN_HEIGHT && height <= WEB_EMBED_MAX_HEIGHT ? height : null;
}
