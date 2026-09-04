import { describe, expect, it } from "vitest";
import {
  consumeTagInput,
  MAX_ARTICLE_TAGS,
  mergeTagText,
  normalizeTags,
  tagColorHue,
  tagsFromText,
} from "./tags";

describe("article tags", () => {
  it("keeps comma-separated input compatible across supported separators", () => {
    expect(tagsFromText(" Astro,Studio， 编辑器\nMDX ")).toEqual(["Astro", "Studio", "编辑器", "MDX"]);
    expect(consumeTagInput("Astro, Studio，编辑器")).toEqual({
      committed: ["Astro", "Studio"],
      pending: "编辑器",
    });
  });

  it("deduplicates tags and preserves the first spelling", () => {
    expect(normalizeTags([" Astro ", "astro", "ＡＳＴＲＯ", "Studio"])).toEqual(["Astro", "Studio"]);
    expect(mergeTagText(["Astro"], "Studio, astro, MDX")).toEqual(["Astro", "Studio", "MDX"]);
  });

  it("limits articles to ten tags", () => {
    const tags = Array.from({ length: MAX_ARTICLE_TAGS + 3 }, (_, index) => `tag-${index + 1}`);
    expect(normalizeTags(tags)).toEqual(tags.slice(0, MAX_ARTICLE_TAGS));
  });

  it("maps a tag name to a stable color", () => {
    expect(tagColorHue("Astro")).toBe(tagColorHue("Astro"));
    expect(new Set(["Astro", "Studio", "编辑器"].map(tagColorHue)).size).toBe(3);
  });
});
