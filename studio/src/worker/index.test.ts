import { afterEach, describe, expect, it, vi } from "vitest";
import worker from "./index";

function testEnv(assetFetch = vi.fn()) {
  return {
    ASSETS: { fetch: assetFetch },
    DRAFTS: {},
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
