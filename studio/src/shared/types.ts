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
}

export interface ScheduledPost {
  key: string;
  path: string;
  sha: string;
  title: string;
  publishAt: string;
  content: string;
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

export interface SessionInfo {
  authenticated: boolean;
  github: {
    connected: boolean;
    login?: string;
    repository: string;
    branch: string;
  };
}

export interface ApiErrorShape {
  error: string;
  code?: string;
}
