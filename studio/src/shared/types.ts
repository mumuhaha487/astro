export interface PostMeta {
  path: string;
  sha: string;
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
  permalink?: string;
}

export interface PostDocument {
  path: string;
  sha: string;
  content: string;
}

export type TranslationLanguage = "en" | "ja";
export type TranslationContentType = "文章标题" | "文章简介" | "Markdown 正文";

export interface TranslationDocument extends PostDocument {
  language: TranslationLanguage;
}

export interface TranslationReference {
  language: TranslationLanguage;
  path: string;
  sha: string;
}

export interface PostBundleResult {
  source: PostDocument;
  translations: TranslationDocument[];
}

export interface TranslationResult {
  language: TranslationLanguage;
  title: string;
  description: string;
  body: string;
}

export interface TranslationSegmentResult {
  text: string;
}

export interface TranslationSettingsSummary {
  apiUrl: string;
  model: string;
  configured: boolean;
  updatedAt?: string;
}

export interface PostRevision {
  sha: string;
  message: string;
  author: string;
  committedAt: string;
  htmlUrl: string;
}

export interface PostRevisionDocument {
  path: string;
  commitSha: string;
  content: string;
}

export interface DraftSummary {
  key: string;
  path: string;
  title: string;
  updatedAt: string;
  isNew: boolean;
}

export interface DraftDocument extends DraftSummary {
  sha: string;
  content: string;
  translations?: TranslationDocument[];
  translationTargets?: TranslationLanguage[];
}

export interface ScheduledPost {
  key: string;
  path: string;
  sha: string;
  title: string;
  publishAt: string;
  content: string;
  translations?: TranslationDocument[];
  deleteTranslations?: TranslationReference[];
  createdAt: string;
}

export interface WebEmbedRecord {
  id: string;
  path: string;
  url: string;
  title: string;
  entry: string;
  height: number;
  fileCount: number;
  totalSize: number;
  sourceType: "html" | "zip";
  reused: boolean;
}

export interface GuestbookMessage {
  id: string;
  name: string;
  content: string;
  createdAt: string;
}

export interface SessionInfo {
  authenticated: boolean;
  github: {
    connected: boolean;
    login?: string;
    repository: string;
    branch: string;
  };
  translation: TranslationSettingsSummary;
}

export interface ApiErrorShape {
  error: string;
  code?: string;
}
