import { beforeEach, describe, expect, it, vi } from "vitest";

const blob = vi.hoisted(() => ({
  getStore: vi.fn(),
}));

vi.mock("@edgeone/pages-blob", () => ({ getStore: blob.getStore }));

import { handleEdgeOneRequest } from "./handler";

const values = new Map<string, string>();
const store = {
  get: vi.fn(async (key: string) => values.get(key) ?? null),
  set: vi.fn(async (key: string, value: string | ArrayBuffer | ReadableStream) => {
    values.set(key, typeof value === "string" ? value : new TextDecoder().decode(value as ArrayBuffer));
  }),
  delete: vi.fn(async (key: string) => {
    values.delete(key);
  }),
  list: vi.fn(async ({ prefix = "" }: { prefix?: string } = {}) => ({
    blobs: [...values.keys()].filter((key) => key.startsWith(prefix)).map((key) => ({ key, etag: key })),
  })),
};

function context(request: Request, env: Record<string, string | undefined>) {
  return {
    request,
    env,
    clientIp: "203.0.113.8",
  };
}

const runtimeEnv = {
  EDITOR_PASSWORD: "test-password",
  SESSION_SECRET: "test-session-secret",
};

beforeEach(() => {
  values.clear();
  vi.clearAllMocks();
  blob.getStore.mockReturnValue(store);
});

describe("EdgeOne Makers adapter", () => {
  it("fails closed when required environment variables are missing", async () => {
    const response = await handleEdgeOneRequest(
      context(new Request("https://studio.example/api/session"), {}),
    );

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ error: "EdgeOne 环境变量尚未配置" });
  });

  it("persists draft CRUD through EdgeOne Blob", async () => {
    const login = await handleEdgeOneRequest(
      context(new Request("https://studio.example/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json", Origin: "https://studio.example" },
        body: JSON.stringify({ password: "test-password" }),
      }), runtimeEnv),
    );
    expect(login.status).toBe(200);
    const cookie = login.headers.get("Set-Cookie")?.split(";", 1)[0];
    expect(cookie).toContain("astro_studio_session=");

    const headers = {
      "Content-Type": "application/json",
      Cookie: cookie || "",
      Origin: "https://studio.example",
    };
    const saved = await handleEdgeOneRequest(
      context(new Request("https://studio.example/api/draft", {
        method: "PUT",
        headers,
        body: JSON.stringify({
          path: "draft:edgeone-adapter-test",
          title: "EdgeOne adapter test",
          content: "---\ntitle: EdgeOne adapter test\n---\nDraft body.",
          isNew: true,
        }),
      }), runtimeEnv),
    );
    expect(saved.status).toBe(200);
    const summary = await saved.json() as { key: string };

    const loaded = await handleEdgeOneRequest(
      context(new Request(`https://studio.example/api/draft?key=${summary.key}`, {
        headers: { Cookie: cookie || "" },
      }), runtimeEnv),
    );
    expect(loaded.status).toBe(200);
    expect(await loaded.json()).toMatchObject({ title: "EdgeOne adapter test" });

    const listing = await handleEdgeOneRequest(
      context(new Request("https://studio.example/api/drafts", {
        headers: { Cookie: cookie || "" },
      }), runtimeEnv),
    );
    expect(listing.status).toBe(200);
    expect(await listing.json()).toMatchObject({ drafts: [{ key: summary.key }] });

    const removed = await handleEdgeOneRequest(
      context(new Request("https://studio.example/api/draft", {
        method: "DELETE",
        headers,
        body: JSON.stringify({ key: summary.key }),
      }), runtimeEnv),
    );
    expect(removed.status).toBe(204);
    expect(values.has(`drafts/${summary.key}`)).toBe(false);
  });

  it("uses the forwarded public host for same-origin checks", async () => {
    const response = await handleEdgeOneRequest(
      context(new Request("https://internal-function.example/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Host: "studio.example",
          Origin: "https://studio.example",
          "X-Forwarded-Proto": "https",
        },
        body: JSON.stringify({ password: "test-password" }),
      }), runtimeEnv),
    );

    expect(response.status).toBe(200);
  });
});
