import type {
  DraftDocument,
  DraftSummary,
  PostDocument,
  PostMeta,
  ScheduledPost,
  SessionInfo,
} from "../shared/types";

export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && !(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(path, {
    credentials: "same-origin",
    ...init,
    headers,
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => ({
      error: `请求失败 (${response.status})`,
    }))) as { error?: string; code?: string };
    throw new ApiError(payload.error || `请求失败 (${response.status})`, response.status, payload.code);
  }

  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}

export const api = {
  session: () => request<SessionInfo>("/api/session"),
  login: (password: string) =>
    request<SessionInfo>("/api/login", {
      method: "POST",
      body: JSON.stringify({ password }),
    }),
  logout: () => request<void>("/api/logout", { method: "POST" }),
  posts: () => request<{ posts: PostMeta[]; stale?: boolean }>("/api/posts"),
  post: (path: string) =>
    request<PostDocument>(`/api/post?path=${encodeURIComponent(path)}`),
  savePost: (document: PostDocument, message: string) =>
    request<PostDocument>("/api/post", {
      method: "PUT",
      body: JSON.stringify({ ...document, message }),
    }),
  deletePost: (path: string, sha: string) =>
    request<void>("/api/post", {
      method: "DELETE",
      body: JSON.stringify({ path, sha }),
    }),
  drafts: () => request<{ drafts: DraftSummary[] }>("/api/drafts"),
  draft: (key: string) =>
    request<DraftDocument>(`/api/draft?key=${encodeURIComponent(key)}`),
  saveDraft: (draft: Omit<DraftDocument, "key"> & { key?: string }) =>
    request<DraftSummary>("/api/draft", {
      method: "PUT",
      body: JSON.stringify(draft),
    }),
  deleteDraft: (key: string) =>
    request<void>("/api/draft", {
      method: "DELETE",
      body: JSON.stringify({ key }),
    }),
  schedulePost: (schedule: Omit<ScheduledPost, "key" | "createdAt">) =>
    request<ScheduledPost>("/api/schedule", {
      method: "PUT",
      body: JSON.stringify(schedule),
    }),
  uploadImage: async (file: File) => {
    const form = new FormData();
    form.set("file", file);
    return request<{ path: string; url: string }>("/api/image", {
      method: "POST",
      body: form,
    });
  },
  connectGitHub: (token: string) =>
    request<SessionInfo["github"]>("/api/settings/github", {
      method: "PUT",
      body: JSON.stringify({ token }),
    }),
  disconnectGitHub: () =>
    request<void>("/api/settings/github", { method: "DELETE" }),
  changePassword: (password: string) =>
    request<void>("/api/settings/password", {
      method: "PUT",
      body: JSON.stringify({ password }),
    }),
};
