import { unzipSync } from "fflate";

import {
  isIgnoredWebArchivePath,
  MAX_WEB_ARCHIVE_BYTES,
  MAX_WEB_FILE_BYTES,
  MAX_WEB_FILES,
  MAX_WEB_TOTAL_BYTES,
  WEB_FILE_EXTENSIONS,
  webFileExtension,
} from "../shared/web-files";

export interface ExtractedWebFile {
  path: string;
  bytes: Uint8Array;
}

export function extractWebArchive(bytes: Uint8Array): ExtractedWebFile[] {
  if (bytes.byteLength === 0) throw new Error("ZIP 压缩包不能为空");
  if (bytes.byteLength > MAX_WEB_ARCHIVE_BYTES) throw new Error("ZIP 压缩包不能超过 20 MB");

  let fileCount = 0;
  let totalSize = 0;
  let validationError = "";
  const archiveNames = new Set<string>();
  try {
    const extracted = unzipSync(bytes, {
      filter(info) {
        if (info.name.endsWith("/") || isIgnoredWebArchivePath(info.name)) return false;
        try {
          const path = normalizeArchivePath(info.name);
          const key = path.toLocaleLowerCase();
          if (archiveNames.has(key)) {
            validationError = `网页包内存在重名文件：${path}`;
            return false;
          }
          archiveNames.add(key);
        } catch (error) {
          validationError = error instanceof Error ? error.message : "ZIP 中存在无效文件路径";
          return false;
        }
        fileCount += 1;
        totalSize += info.originalSize;
        if (fileCount > MAX_WEB_FILES) validationError = `ZIP 解压后的文件不能超过 ${MAX_WEB_FILES} 个`;
        if (info.originalSize > MAX_WEB_FILE_BYTES) validationError = `ZIP 中的单个文件不能超过 20 MB：${info.name}`;
        if (totalSize > MAX_WEB_TOTAL_BYTES) validationError = "ZIP 解压后的总大小不能超过 40 MB";
        return !validationError;
      },
    });
    if (validationError) throw new Error(validationError);

    const files = Object.entries(extracted)
      .filter(([path]) => !path.endsWith("/") && !isIgnoredWebArchivePath(path))
      .map(([path, content]) => ({ path: normalizeArchivePath(path), bytes: content }))
      .sort((left, right) => left.path.localeCompare(right.path));
    validateExtractedFiles(files);
    return files;
  } catch (error) {
    if (error instanceof Error && (
      error.message.startsWith("ZIP ")
      || error.message.startsWith("不支持网页文件类型")
      || error.message.startsWith("网页包内存在重名文件")
      || error.message === "静态网页中没有可上传的文件"
    )) throw error;
    throw new Error("ZIP 压缩包已损坏或使用了不支持的压缩格式");
  }
}

export function preferredWebEntry(paths: string[]): string {
  const htmlPaths = paths.filter((path) => ["html", "htm"].includes(webFileExtension(path)));
  const rootIndex = htmlPaths.find((path) => path.toLocaleLowerCase() === "index.html");
  if (rootIndex) return rootIndex;
  const nestedIndexes = htmlPaths
    .filter((path) => /(^|\/)index\.html?$/i.test(path))
    .sort(comparePathDepth);
  if (nestedIndexes[0]) return nestedIndexes[0];
  return htmlPaths.sort(comparePathDepth)[0] || "";
}

export function webFileContentType(path: string): string {
  const extension = webFileExtension(path);
  if (["html", "htm"].includes(extension)) return "text/html";
  if (extension === "css") return "text/css";
  if (["js", "mjs"].includes(extension)) return "text/javascript";
  if (extension === "json" || extension === "map") return "application/json";
  if (extension === "svg") return "image/svg+xml";
  return "application/octet-stream";
}

function validateExtractedFiles(files: ExtractedWebFile[]): void {
  if (files.length === 0) throw new Error("静态网页中没有可上传的文件");
  if (files.length > MAX_WEB_FILES) throw new Error(`ZIP 解压后的文件不能超过 ${MAX_WEB_FILES} 个`);
  const names = new Set<string>();
  let totalSize = 0;
  for (const file of files) {
    const extension = webFileExtension(file.path);
    if (extension && !WEB_FILE_EXTENSIONS.has(extension)) throw new Error(`不支持网页文件类型：${file.path}`);
    const key = file.path.toLocaleLowerCase();
    if (names.has(key)) throw new Error(`网页包内存在重名文件：${file.path}`);
    names.add(key);
    if (file.bytes.byteLength > MAX_WEB_FILE_BYTES) throw new Error(`ZIP 中的单个文件不能超过 20 MB：${file.path}`);
    totalSize += file.bytes.byteLength;
  }
  if (totalSize > MAX_WEB_TOTAL_BYTES) throw new Error("ZIP 解压后的总大小不能超过 40 MB");
}

function normalizeArchivePath(value: string): string {
  const normalized = value.normalize("NFKC").replace(/^\.\//, "");
  if (!normalized || normalized.length > 300 || normalized.startsWith("/") || normalized.includes("\\") || /[\u0000-\u001f\u007f]/.test(normalized)) {
    throw new Error(`ZIP 中存在无效文件路径：${value.slice(0, 80)}`);
  }
  const segments = normalized.split("/");
  if (segments.some((segment) => !segment || segment === "." || segment === ".." || segment.length > 120)) {
    throw new Error(`ZIP 中存在无效文件路径：${value.slice(0, 80)}`);
  }
  return segments.join("/");
}

function comparePathDepth(left: string, right: string): number {
  return left.split("/").length - right.split("/").length || left.localeCompare(right);
}
