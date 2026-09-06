import type { TranslationLanguage } from "./types";

export const TRANSLATION_LANGUAGES: readonly TranslationLanguage[] = ["en", "ja"];
export const DEFAULT_TRANSLATION_API_URL = "https://deepseek.inc.re/";
export const DEFAULT_TRANSLATION_MODEL = "deepseek/deepseek-v4-flash";
export const TRANSLATION_CHUNK_MAX_LENGTH = 1_800;

export interface ProtectedMarkdown {
  text: string;
  fragments: Array<{ token: string; value: string }>;
}

export interface TranslationTextChunk {
  text: string;
  separator: string;
}

export function isTranslationLanguage(value: unknown): value is TranslationLanguage {
  return typeof value === "string" && TRANSLATION_LANGUAGES.includes(value as TranslationLanguage);
}

export function translationPath(sourcePath: string, language: TranslationLanguage): string {
  return sourcePath.replace(/\.md$/i, `.${language}.md`);
}

export function isTranslationPath(path: string): boolean {
  return /\.(?:en|ja)\.md$/i.test(path);
}

export function translationKeyFromPath(path: string): string {
  return path
    .replace(/^content\/posts\//, "")
    .replace(/\.(?:en|ja)\.md$/i, "")
    .replace(/\.md$/i, "");
}

export function protectMarkdownForTranslation(markdown: string): ProtectedMarkdown {
  let text = markdown;
  const fragments: ProtectedMarkdown["fragments"] = [];
  let marker = "ASTRO_TRANSLATION_PROTECTED";
  while (text.includes(marker)) marker += "_X";

  const shield = (value: string): string => {
    const token = `__${marker}_${String(fragments.length).padStart(5, "0")}__`;
    fragments.push({ token, value });
    return token;
  };
  const replace = (pattern: RegExp) => {
    text = text.replace(pattern, (value) => shield(value));
  };

  replace(/^ {0,3}(`{3,}|~{3,})[^\r\n]*(?:\r?\n)[\s\S]*?^ {0,3}\1[ \t]*$/gm);
  replace(/^(?:(?: {4}|\t).*?(?:\r?\n|$))+/gm);
  replace(/^(?: {0,3}>.*(?:\r?\n|$))+/gm);
  replace(/\$\$[\s\S]*?\$\$/g);
  replace(/\\\[[\s\S]*?\\\]/g);
  replace(/<!--([\s\S]*?)-->/g);
  replace(/<(script|style|pre|code|iframe|object|embed)\b[^>]*>[\s\S]*?<\/\1\s*>/gi);
  replace(/<[^>]+>/g);
  replace(/(`+)(?!`)([\s\S]*?[^`])\1(?!`)/g);
  replace(/!\[[^\]]*\]\([^\r\n)]*\)/g);
  replace(/^ {0,3}\[[^\]]+\]:\s*\S+.*$/gm);
  replace(/\]\((?:[^()\r\n]|\([^()\r\n]*\))*\)/g);
  replace(/<https?:\/\/[^>\s]+>/gi);
  replace(/https?:\/\/[^\s<>()]+/gi);
  replace(/(?<!\w)\$[^\r\n$]+\$(?!\w)/g);

  return { text, fragments };
}

export function restoreProtectedMarkdown(translated: string, protectedMarkdown: ProtectedMarkdown): string {
  let restored = translated;
  for (const fragment of protectedMarkdown.fragments) {
    const occurrences = restored.split(fragment.token).length - 1;
    if (occurrences !== 1) {
      throw new Error("翻译结果没有完整保留代码、引用或资源标记，请重试");
    }
    restored = restored.replace(fragment.token, fragment.value);
  }
  return restored;
}

export function splitTranslationText(value: string, maximumLength = TRANSLATION_CHUNK_MAX_LENGTH): TranslationTextChunk[] {
  if (!value) return [];
  if (value.length <= maximumLength) return [{ text: value, separator: "" }];
  const units: TranslationTextChunk[] = [];
  const separatorPattern = /\r?\n{2,}/g;
  let start = 0;
  for (let match = separatorPattern.exec(value); match; match = separatorPattern.exec(value)) {
    units.push({ text: value.slice(start, match.index), separator: match[0] });
    start = match.index + match[0].length;
  }
  units.push({ text: value.slice(start), separator: "" });

  const chunks: TranslationTextChunk[] = [];
  let current = "";
  let currentSeparator = "";
  const flush = () => {
    if (!current) return;
    chunks.push({ text: current, separator: currentSeparator });
    current = "";
    currentSeparator = "";
  };
  for (const unit of units) {
    const candidate = current ? `${current}${currentSeparator}${unit.text}` : unit.text;
    if (candidate.length <= maximumLength) {
      current = candidate;
      currentSeparator = unit.separator;
      continue;
    }
    flush();
    let remaining = unit.text;
    while (remaining.length > maximumLength) {
      const breakpoint = safeTranslationBreakpoint(remaining, maximumLength);
      chunks.push({ text: remaining.slice(0, breakpoint), separator: "" });
      remaining = remaining.slice(breakpoint);
    }
    current = remaining;
    currentSeparator = unit.separator;
  }
  flush();
  return chunks;
}

function safeTranslationBreakpoint(value: string, maximumLength: number): number {
  const minimum = Math.floor(maximumLength * 0.6);
  const prefix = value.slice(0, maximumLength + 1);
  let breakpoint = Math.max(
    prefix.lastIndexOf("\n"),
    prefix.lastIndexOf(" "),
    prefix.lastIndexOf("。"),
    prefix.lastIndexOf("！"),
    prefix.lastIndexOf("？"),
    prefix.lastIndexOf("."),
    prefix.lastIndexOf("!"),
    prefix.lastIndexOf("?"),
  );
  if (breakpoint < minimum) breakpoint = maximumLength;
  else breakpoint += 1;
  const tokenStart = value.lastIndexOf("__ASTRO_TRANSLATION_PROTECTED", breakpoint);
  const tokenEnd = tokenStart >= 0 ? value.indexOf("__", tokenStart + 2) : -1;
  if (tokenStart >= 0 && tokenStart < breakpoint && tokenEnd >= breakpoint) {
    breakpoint = tokenStart >= minimum ? tokenStart : tokenEnd + 2;
  }
  return Math.max(1, breakpoint);
}
