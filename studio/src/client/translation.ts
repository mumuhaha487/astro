import type {
  TranslationContentType,
  TranslationLanguage,
  TranslationResult,
} from "../shared/types";
import {
  protectMarkdownForTranslation,
  restoreProtectedMarkdown,
  splitTranslationText,
  type ProtectedMarkdown,
  type TranslationTextChunk,
} from "../shared/translation";
import { parseDocument } from "./frontmatter";

interface PreparedTranslationValue {
  protectedMarkdown: ProtectedMarkdown;
  chunks: TranslationTextChunk[];
  translatedChunks: string[];
}

interface PreparedTranslation {
  language: TranslationLanguage;
  title: PreparedTranslationValue;
  description: PreparedTranslationValue;
  body: PreparedTranslationValue;
}

interface SegmentJob {
  language: TranslationLanguage;
  contentType: TranslationContentType;
  value: PreparedTranslationValue;
  chunkIndex: number;
}

export type SegmentTranslator = (
  text: string,
  language: TranslationLanguage,
  contentType: TranslationContentType,
) => Promise<string>;

export interface ManualTranslationPackage {
  language: TranslationLanguage;
  prompt: string;
  protectedDocument: ProtectedMarkdown;
  sourceHasDescription: boolean;
  sourceHasBody: boolean;
}

export async function translateArticleBySegments(
  title: string,
  description: string,
  body: string,
  languages: TranslationLanguage[],
  translateSegment: SegmentTranslator,
  onProgress?: (completed: number, total: number) => void,
): Promise<TranslationResult[]> {
  const targets = [...new Set(languages)];
  const prepared = targets.map((language): PreparedTranslation => ({
    language,
    title: prepareValue(title),
    description: prepareValue(description),
    body: prepareValue(body),
  }));
  const jobs: SegmentJob[] = [];
  for (const translation of prepared) {
    addJobs(jobs, translation.language, "文章标题", translation.title);
    addJobs(jobs, translation.language, "文章简介", translation.description);
    addJobs(jobs, translation.language, "Markdown 正文", translation.body);
  }

  let completed = 0;
  onProgress?.(completed, jobs.length);
  await mapConcurrent(jobs, 1, async (job) => {
    job.value.translatedChunks[job.chunkIndex] = await translateSegment(
      job.value.chunks[job.chunkIndex].text,
      job.language,
      job.contentType,
    );
    completed += 1;
    onProgress?.(completed, jobs.length);
  });

  return prepared.map((translation) => ({
    language: translation.language,
    title: restoreValue(translation.title),
    description: restoreValue(translation.description),
    body: restoreValue(translation.body),
  }));
}

export function buildManualTranslationPackage(
  title: string,
  description: string,
  body: string,
  language: TranslationLanguage,
): ManualTranslationPackage {
  const languageName = language === "en" ? "English" : "Japanese (日本語)";
  const sourceDocument = [
    "---",
    `title: ${JSON.stringify(title)}`,
    `description: ${JSON.stringify(description)}`,
    "---",
    "",
    body,
  ].join("\n");
  const protectedDocument = protectMarkdownForTranslation(sourceDocument);
  const prompt = [
    `请把下面的完整 Markdown 文档从中文翻译成自然、准确的 ${languageName}。`,
    "只输出翻译后的完整 Markdown 文档，不要解释，不要添加外层代码围栏。",
    "必须保留 YAML frontmatter，并只翻译 title、description 的值和普通正文。",
    "所有以 __ASTRO_TRANSLATION_PROTECTED 开头的占位符都必须原样保留，不能修改、删除、复制或调整顺序。",
    "代码块、行内代码、引用、公式、HTML、图片、链接、URL 和资源路径已经由占位符保护。",
    "不要翻译产品名、命令、标识符；保持 Markdown 的标题层级、列表与空行结构。",
    "",
    protectedDocument.text,
  ].join("\n");
  return {
    language,
    prompt,
    protectedDocument,
    sourceHasDescription: Boolean(description.trim()),
    sourceHasBody: Boolean(body.trim()),
  };
}

export function parseManualTranslation(
  value: string,
  translationPackage: ManualTranslationPackage,
): TranslationResult {
  const unwrapped = unwrapMarkdownFence(value.trim());
  if (!/^---\s*\r?\n/.test(unwrapped)) {
    throw new Error("请粘贴包含 YAML frontmatter 的完整 Markdown 译文");
  }
  const restored = restoreProtectedMarkdown(unwrapped, translationPackage.protectedDocument);
  const parsed = parseDocument(restored);
  const title = parsed.fields.title.trim();
  const description = parsed.fields.description.trim();
  const body = parsed.body.replace(/^(?:\r?\n)+/, "").trimEnd();
  if (!title) throw new Error("译文 frontmatter 中缺少 title");
  if (translationPackage.sourceHasDescription && !description) {
    throw new Error("译文 frontmatter 中缺少 description");
  }
  if (translationPackage.sourceHasBody && !body.trim()) {
    throw new Error("译文正文不能为空");
  }
  return {
    language: translationPackage.language,
    title,
    description,
    body,
  };
}

function unwrapMarkdownFence(value: string): string {
  const match = value.match(/^```(?:markdown|md)?[ \t]*\r?\n([\s\S]*?)\r?\n```[ \t]*$/i);
  return match ? match[1].trim() : value;
}

function prepareValue(value: string): PreparedTranslationValue {
  const protectedMarkdown = protectMarkdownForTranslation(value);
  const chunks = splitTranslationText(protectedMarkdown.text);
  return {
    protectedMarkdown,
    chunks,
    translatedChunks: new Array<string>(chunks.length),
  };
}

function addJobs(
  jobs: SegmentJob[],
  language: TranslationLanguage,
  contentType: TranslationContentType,
  value: PreparedTranslationValue,
): void {
  value.chunks.forEach((_chunk, chunkIndex) => {
    jobs.push({ language, contentType, value, chunkIndex });
  });
}

function restoreValue(value: PreparedTranslationValue): string {
  if (!value.chunks.length) return "";
  const translated = value.translatedChunks
    .map((chunk, index) => `${chunk}${value.chunks[index].separator}`)
    .join("");
  return restoreProtectedMarkdown(translated, value.protectedMarkdown).trim();
}

async function mapConcurrent<T>(
  items: T[],
  concurrency: number,
  mapper: (item: T) => Promise<void>,
): Promise<void> {
  let nextIndex = 0;
  const worker = async () => {
    while (nextIndex < items.length) {
      const index = nextIndex;
      nextIndex += 1;
      await mapper(items[index]);
    }
  };
  await Promise.all(Array.from(
    { length: Math.min(concurrency, items.length) },
    () => worker(),
  ));
}
