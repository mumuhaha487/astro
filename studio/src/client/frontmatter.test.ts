import { describe, expect, it } from "vitest";
import { makePostPath, parseDocument, serializeDocument } from "./frontmatter";

describe("frontmatter documents", () => {
  it("round-trips pin state and priority", () => {
    const parsed = parseDocument("---\ntitle: Test\npublished: 2026-09-03\npinned: true\npriority: 2\ntags: [one, two]\n---\n\nHello");
    expect(parsed.fields.pinned).toBe(true);
    expect(parsed.fields.priority).toBe(2);
    expect(parsed.fields.tags).toEqual(["one", "two"]);
    expect(serializeDocument(parsed.fields, parsed.body)).toContain("pinned: true");
  });

  it("creates a safe path while keeping Chinese titles", () => {
    expect(makePostPath("  我的 / 新文章  ")).toBe("content/posts/我的-新文章.md");
  });

  it("preserves CSDN-compatible publishing settings", () => {
    const fields = parseDocument("---\ntitle: 发布设置\npublished: 2026-09-04\narticleType: translation\ncreationStatement: ai-assisted\nbackup: true\nvisibility: followers\narticleTemplate: compact\nmultiPlatform: true\nactivity: 开源实践\ntopic: Astro\n---\n\n正文").fields;
    const serialized = serializeDocument(fields, "正文");
    const roundTrip = parseDocument(serialized).fields;
    expect(roundTrip).toMatchObject({
      articleType: "translation",
      creationStatement: "ai-assisted",
      backup: true,
      visibility: "followers",
      articleTemplate: "compact",
      multiPlatform: true,
      activity: "开源实践",
      topic: "Astro",
    });
  });
});
