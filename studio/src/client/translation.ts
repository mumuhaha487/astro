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
  await mapConcurrent(jobs, 3, async (job) => {
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
