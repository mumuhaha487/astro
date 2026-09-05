export const MAX_WEB_ARCHIVE_BYTES = 20 * 1024 * 1024;
export const MAX_WEB_TOTAL_BYTES = 40 * 1024 * 1024;
export const MAX_WEB_FILE_BYTES = 20 * 1024 * 1024;
export const MAX_WEB_FILES = 240;

export const WEB_FILE_EXTENSIONS = new Set([
  "html", "htm", "css", "js", "mjs", "json", "map", "txt", "xml", "csv",
  "wasm", "data", "bin", "webmanifest", "glb", "gltf", "obj", "mtl",
  "png", "jpg", "jpeg", "gif", "webp", "avif", "svg", "ico", "bmp",
  "woff", "woff2", "ttf", "otf", "eot",
  "mp3", "wav", "ogg", "oga", "mp4", "webm", "ogv", "vtt",
  "unityweb", "mem", "bundle", "pak", "atlas", "fnt", "vert", "frag", "glsl", "wgsl",
]);

export function webFileExtension(path: string): string {
  const name = path.split("/").pop() || "";
  return name.includes(".") ? name.split(".").pop()?.toLocaleLowerCase() || "" : "";
}

export function isIgnoredWebArchivePath(path: string): boolean {
  return path.startsWith("__MACOSX/") || path.endsWith("/.DS_Store") || path === ".DS_Store";
}
