import { describe, expect, it, vi } from "vitest";

import {
  extractPageTitle,
  fetchLinkPreview,
  normalizePublicHttpUrl,
} from "./link-preview";

describe("link preview metadata", () => {
  it("prefers Open Graph titles and decodes HTML entities", () => {
    const html = '<title>Fallback</title><meta content="Astro &amp; Studio" property="og:title">';
    expect(extractPageTitle(html)).toBe("Astro & Studio");
  });

  it("follows safe redirects and returns a hostname fallback", async () => {
    const fetcher = vi.fn()
      .mockResolvedValueOnce(new Response(null, {
        status: 302,
        headers: { Location: "https://docs.astro.build/en/start/" },
      }))
      .mockResolvedValueOnce(new Response("<html><head></head></html>", {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      }));

    await expect(fetchLinkPreview("https://astro.build/docs", fetcher)).resolves.toEqual({
      url: "https://docs.astro.build/en/start/",
      title: "docs.astro.build",
      siteName: "docs.astro.build",
    });
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it.each([
    "http://127.0.0.1/admin",
    "http://10.1.2.3/",
    "http://169.254.169.254/latest/meta-data/",
    "http://100.64.0.1/",
    "http://localhost/",
    "http://router/",
    "http://service.internal/",
    "ftp://example.com/file",
    "https://example.com:8443/",
  ])("rejects unsafe destination %s", (url) => {
    expect(() => normalizePublicHttpUrl(url)).toThrow();
  });
});
