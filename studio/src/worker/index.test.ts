import { afterEach, describe, expect, it, vi } from "vitest";
import worker from "./index";

function testEnv(assetFetch = vi.fn()) {
  return {
    ASSETS: { fetch: assetFetch },
    DRAFTS: {
      get: vi.fn(async () => null),
      put: vi.fn(async () => undefined),
      delete: vi.fn(async () => undefined),
      list: vi.fn(async () => ({ objects: [] })),
    },
    EDITOR_PASSWORD: "test-password",
    SESSION_SECRET: "test-secret",
    GITHUB_TOKEN: "test-token",
    GITHUB_OWNER: "mumuhaha487",
    GITHUB_REPO: "astro",
    GITHUB_BRANCH: "main",
  } as unknown as Parameters<typeof worker.fetch>[1];
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("editor asset proxy", () => {
  it("serves existing blog covers through the authenticated API route", async () => {
    const upstreamFetch = vi.fn(async (_input: string | URL | Request, _init?: RequestInit) => new Response("cover-bytes", {
      headers: { "Content-Type": "image/png" },
    }));
    vi.stubGlobal("fetch", upstreamFetch);
    const assetFetch = vi.fn();
    const env = testEnv(assetFetch);
    const login = await worker.fetch(new Request("https://studio.example/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: "https://studio.example" },
      body: JSON.stringify({ password: "test-password" }),
    }), env);
    const cookie = login.headers.get("Set-Cookie")?.split(";", 1)[0] || "";

    const response = await worker.fetch(
      new Request("https://studio.example/api/asset?path=%2Fimage%2F20260320image.png", {
        headers: { Cookie: cookie },
      }),
      env,
    );

    expect(assetFetch).not.toHaveBeenCalled();
    expect(upstreamFetch.mock.calls[0][0]).toBe(
      "https://raw.githubusercontent.com/mumuhaha487/astro/main/public/image/20260320image.png",
    );
    expect(response.headers.get("Content-Type")).toBe("image/png");
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(await response.text()).toBe("cover-bytes");
  });

  it("serves embedded HTML with an iframe-compatible content type and policy", async () => {
    const upstreamFetch = vi.fn(async () => new Response("<!doctype html><title>Game</title>", {
      headers: {
        "Content-Disposition": "attachment",
        "Content-Type": "text/plain",
      },
    }));
    vi.stubGlobal("fetch", upstreamFetch);
    const hash = "1".repeat(24);

    const response = await worker.fetch(
      new Request(`https://studio.example/web-pages/editor/html/${hash}/index.html`),
      testEnv(),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("text/html; charset=utf-8");
    expect(response.headers.get("Content-Disposition")).toBeNull();
    expect(response.headers.get("X-Frame-Options")).toBeNull();
    expect(response.headers.get("Content-Security-Policy")).toContain("frame-ancestors 'self'");
    expect(response.headers.get("Cache-Control")).toBe("public, max-age=31536000, immutable");
  });

  it("serves uploaded videos from the repository and forwards byte ranges", async () => {
    const upstreamFetch = vi.fn(async (_input: string | URL | Request, _init?: RequestInit) => new Response("video-bytes", {
      status: 206,
      headers: {
        "Accept-Ranges": "bytes",
        "Content-Range": "bytes 0-10/100",
        "Content-Type": "video/mp4",
        "Set-Cookie": "must-not-leak=1",
      },
    }));
    vi.stubGlobal("fetch", upstreamFetch);
    const assetFetch = vi.fn();

    const response = await worker.fetch(
      new Request("https://studio.example/video/editor/2026/09/demo.mp4", {
        headers: { Accept: "video/*", Range: "bytes=0-10" },
      }),
      testEnv(assetFetch),
    );

    expect(assetFetch).not.toHaveBeenCalled();
    expect(upstreamFetch).toHaveBeenCalledOnce();
    const [url, init] = upstreamFetch.mock.calls[0];
    expect(url).toBe("https://raw.githubusercontent.com/mumuhaha487/astro/main/public/video/editor/2026/09/demo.mp4");
    const headers = new Headers(init?.headers);
    expect(headers.get("Range")).toBe("bytes=0-10");
    expect(headers.get("Authorization")).toBe("Bearer test-token");
    expect(response.status).toBe(206);
    expect(response.headers.get("Content-Type")).toBe("video/mp4");
    expect(response.headers.get("Content-Range")).toBe("bytes 0-10/100");
    expect(response.headers.get("Set-Cookie")).toBeNull();
    expect(response.headers.get("Content-Security-Policy")).toContain("media-src 'self' blob: https:");
    expect(await response.text()).toBe("video-bytes");
  });

  it("serves uploaded resources from the repository as downloads", async () => {
    const upstreamFetch = vi.fn(async (_input: string | URL | Request, _init?: RequestInit) => new Response("archive-bytes", {
      headers: {
        "Content-Disposition": 'attachment; filename="source.zip"',
        "Content-Type": "application/zip",
      },
    }));
    vi.stubGlobal("fetch", upstreamFetch);
    const assetFetch = vi.fn();

    const response = await worker.fetch(
      new Request("https://studio.example/resource/editor/2026/09/source.zip"),
      testEnv(assetFetch),
    );

    expect(assetFetch).not.toHaveBeenCalled();
    expect(upstreamFetch).toHaveBeenCalledOnce();
    expect(upstreamFetch.mock.calls[0][0]).toBe(
      "https://raw.githubusercontent.com/mumuhaha487/astro/main/public/resource/editor/2026/09/source.zip",
    );
    expect(response.headers.get("Content-Type")).toBe("application/zip");
    expect(response.headers.get("Content-Disposition")).toBe('attachment; filename="source.zip"');
    expect(await response.text()).toBe("archive-bytes");
  });

  it("leaves unrelated static paths with the Studio asset binding", async () => {
    const assetFetch = vi.fn(async () => new Response("studio-asset"));
    vi.stubGlobal("fetch", vi.fn());

    const response = await worker.fetch(
      new Request("https://studio.example/assets/logo.svg"),
      testEnv(assetFetch),
    );

    expect(assetFetch).toHaveBeenCalledOnce();
    expect(await response.text()).toBe("studio-asset");
  });

  it("rejects encoded backslashes from repository asset paths", async () => {
    const assetFetch = vi.fn(async () => new Response("studio-fallback"));
    const upstreamFetch = vi.fn();
    vi.stubGlobal("fetch", upstreamFetch);

    const response = await worker.fetch(
      new Request("https://studio.example/video/editor/2026%5Cprivate.mp4"),
      testEnv(assetFetch),
    );

    expect(upstreamFetch).not.toHaveBeenCalled();
    expect(assetFetch).toHaveBeenCalledOnce();
    expect(await response.text()).toBe("studio-fallback");
  });
});

describe("web page uploads", () => {
  async function authenticatedCookie(env: ReturnType<typeof testEnv>): Promise<string> {
    const response = await worker.fetch(new Request("https://studio.example/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: "https://studio.example" },
      body: JSON.stringify({ password: "test-password" }),
    }), env);
    return response.headers.get("Set-Cookie")?.split(";", 1)[0] || "";
  }

  it("commits the editor-extracted ZIP file tree and preserves dot-relative references", async () => {
    let blobIndex = 0;
    const requests: Array<{ path: string; method: string; body?: unknown }> = [];
    const githubFetch = vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
      const url = new URL(String(input));
      const body = typeof init?.body === "string" ? JSON.parse(init.body) : undefined;
      requests.push({ path: url.pathname, method: init?.method || "GET", body });
      if (url.pathname.includes("/contents/")) {
        return new Response(JSON.stringify({ message: "Not Found" }), { status: 404, headers: { "Content-Type": "application/json" } });
      }
      if (url.pathname.includes("/git/ref/heads/")) return Response.json({ object: { sha: "a".repeat(40) } });
      if (url.pathname.endsWith(`/git/commits/${"a".repeat(40)}`)) return Response.json({ tree: { sha: "b".repeat(40) } });
      if (url.pathname.endsWith("/git/blobs")) return Response.json({ sha: String(++blobIndex).padStart(40, "0") });
      if (url.pathname.endsWith("/git/trees")) return Response.json({ sha: "c".repeat(40) });
      if (url.pathname.endsWith("/git/commits")) return Response.json({ sha: "d".repeat(40) });
      if (url.pathname.includes("/git/refs/heads/")) return Response.json({ object: { sha: "d".repeat(40) } });
      return new Response(JSON.stringify({ message: "Unexpected request" }), { status: 500 });
    });
    vi.stubGlobal("fetch", githubFetch);
    const env = testEnv();
    const cookie = await authenticatedCookie(env);
    const form = new FormData();
    form.append("files", new File(['<link rel="stylesheet" href="./style.css"><script src="./test.js"></script>'], "index.html", { type: "text/html" }));
    form.append("files", new File(["document.body.textContent = 'ready'"], "test.js", { type: "text/javascript" }));
    form.append("files", new File(["body{margin:0}"], "style.css", { type: "text/css" }));
    form.set("paths", JSON.stringify(["game/index.html", "game/test.js", "game/style.css"]));
    form.set("title", "网页小游戏");
    form.set("height", "700");
    form.set("sourceType", "zip");
    form.set("entry", "game/index.html");

    const response = await worker.fetch(new Request("https://studio.example/api/web-embeds", {
      method: "POST",
      headers: { Cookie: cookie, Origin: "https://studio.example" },
      body: form,
    }), env);
    const result = await response.json() as { path: string; url: string; fileCount: number; reused: boolean };

    expect(response.status).toBe(200);
    expect(result.path).toMatch(/^public\/web-pages\/editor\/zip\/[0-9a-f]{24}\/game\/index\.html$/);
    expect(result.url).toMatch(/^\/web-pages\/editor\/zip\/[0-9a-f]{24}\/game\/index\.html$/);
    expect(result.fileCount).toBe(3);
    expect(result.reused).toBe(false);
    expect(requests.filter((entry) => entry.path.endsWith("/git/blobs"))).toHaveLength(3);
    expect(requests.filter((entry) => entry.path.endsWith("/git/trees"))).toHaveLength(1);
    expect(requests.filter((entry) => entry.method === "PATCH" && entry.path.includes("/git/refs/heads/"))).toHaveLength(1);
    const treeRequest = requests.find((entry) => entry.path.endsWith("/git/trees"));
    expect(JSON.stringify(treeRequest?.body)).not.toContain("content/posts");
    expect(JSON.stringify(treeRequest?.body)).toContain("public/web-pages/editor/zip/");
    expect(JSON.stringify(treeRequest?.body)).toContain("/game/test.js");
    expect(JSON.stringify(treeRequest?.body)).not.toContain(".zip");
    const htmlBlob = requests.find((entry) => entry.path.endsWith("/git/blobs") && Buffer.from(String((entry.body as { content?: string })?.content || ""), "base64").toString().includes("<script"));
    expect(Buffer.from(String((htmlBlob?.body as { content?: string })?.content || ""), "base64").toString()).toContain('src="./test.js"');
  });

  it("reuses an identical HTML upload without creating another commit", async () => {
    const githubFetch = vi.fn(async (input: string | URL | Request) => {
      const url = new URL(String(input));
      if (url.pathname.includes("/contents/")) return Response.json({ sha: "e".repeat(40) });
      return new Response(JSON.stringify({ message: "Unexpected request" }), { status: 500 });
    });
    vi.stubGlobal("fetch", githubFetch);
    const env = testEnv();
    const cookie = await authenticatedCookie(env);
    const form = new FormData();
    form.set("files", new File(["<!doctype html><title>Same</title>"], "index.html", { type: "text/html" }));
    form.set("paths", JSON.stringify(["index.html"]));
    form.set("title", "相同网页");
    form.set("height", "640");
    form.set("sourceType", "html");

    const response = await worker.fetch(new Request("https://studio.example/api/web-embeds", {
      method: "POST",
      headers: { Cookie: cookie, Origin: "https://studio.example" },
      body: form,
    }), env);
    const result = await response.json() as { path: string; reused: boolean };

    expect(response.status).toBe(200);
    expect(result.reused).toBe(true);
    expect(result.path).toMatch(/^public\/web-pages\/editor\/html\/[0-9a-f]{24}\/index\.html$/);
    expect(githubFetch).toHaveBeenCalledOnce();
  });

  it("rejects extracted ZIP traversal paths before contacting GitHub", async () => {
    const githubFetch = vi.fn();
    vi.stubGlobal("fetch", githubFetch);
    const env = testEnv();
    const cookie = await authenticatedCookie(env);
    const form = new FormData();
    form.set("files", new File(["unsafe"], "escape.html", { type: "text/html" }));
    form.set("paths", JSON.stringify(["../escape.html"]));
    form.set("title", "不安全网页");
    form.set("sourceType", "zip");

    const response = await worker.fetch(new Request("https://studio.example/api/web-embeds", {
      method: "POST",
      headers: { Cookie: cookie, Origin: "https://studio.example" },
      body: form,
    }), env);

    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ error: expect.stringContaining("路径无效") });
    expect(githubFetch).not.toHaveBeenCalled();
  });

  it("rejects a ZIP binary because only editor-extracted files may be uploaded", async () => {
    const githubFetch = vi.fn();
    vi.stubGlobal("fetch", githubFetch);
    const env = testEnv();
    const cookie = await authenticatedCookie(env);
    const form = new FormData();
    form.set("files", new File(["zip-bytes"], "game.zip", { type: "application/zip" }));
    form.set("paths", JSON.stringify(["game.zip"]));
    form.set("title", "未解压网页");
    form.set("sourceType", "zip");

    const response = await worker.fetch(new Request("https://studio.example/api/web-embeds", {
      method: "POST",
      headers: { Cookie: cookie, Origin: "https://studio.example" },
      body: form,
    }), env);

    expect(response.status).toBe(415);
    expect(await response.json()).toMatchObject({ error: expect.stringContaining("编辑器中解压") });
    expect(githubFetch).not.toHaveBeenCalled();
  });
});
