import { describe, expect, it } from "vitest";

import {
  isTranslationPath,
  protectMarkdownForTranslation,
  restoreProtectedMarkdown,
  splitTranslationText,
  translationKeyFromPath,
  translationPath,
} from "./translation";

describe("translation paths", () => {
  it("creates adjacent Hugo language files", () => {
    expect(translationPath("content/posts/demo.md", "en")).toBe("content/posts/demo.en.md");
    expect(translationPath("content/posts/demo.md", "ja")).toBe("content/posts/demo.ja.md");
    expect(isTranslationPath("content/posts/demo.en.md")).toBe(true);
    expect(isTranslationPath("content/posts/demo.md")).toBe(false);
    expect(translationKeyFromPath("content/posts/guide/demo.ja.md")).toBe("guide/demo");
  });
});

describe("Markdown translation protection", () => {
  it("restores code, quotes, HTML, formulas, links, images, and URLs byte for byte", () => {
    const source = [
      "## 可以翻译的标题",
      "",
      "普通正文和 [链接文字](/docs/start.html) 可以翻译。",
      "",
      "> 引用内容保持中文",
      "> `quoted_code()` 也保持不变",
      "",
      "```ts",
      "const greeting = '不要翻译';",
      "```",
      "",
      "行内 `npm run build` 与 $x + y$ 不变。",
      "",
      "![封面](/image/cover.webp)",
      "",
      "<iframe src=\"/web-pages/editor/html/demo/index.html\"></iframe>",
      "",
      "访问 https://vmss.cn/posts/demo/ 查看。",
    ].join("\n");
    const protectedMarkdown = protectMarkdownForTranslation(source);
    expect(protectedMarkdown.fragments.length).toBeGreaterThanOrEqual(7);
    const simulatedTranslation = protectedMarkdown.text
      .replace("可以翻译的标题", "Translatable title")
      .replace("普通正文和", "Normal prose and")
      .replace("可以翻译。", "can be translated.")
      .replace("访问", "Visit")
      .replace("查看。", "for details.");
    const restored = restoreProtectedMarkdown(simulatedTranslation, protectedMarkdown);
    expect(restored).toContain("const greeting = '不要翻译';");
    expect(restored).toContain("> 引用内容保持中文");
    expect(restored).toContain("`npm run build`");
    expect(restored).toContain("![封面](/image/cover.webp)");
    expect(restored).toContain('<iframe src="/web-pages/editor/html/demo/index.html"></iframe>');
    expect(restored).toContain("https://vmss.cn/posts/demo/");
    expect(restored).toContain("## Translatable title");
  });

  it("rejects damaged placeholder output", () => {
    const protectedMarkdown = protectMarkdownForTranslation("正文 `locked()`");
    expect(() => restoreProtectedMarkdown("translated", protectedMarkdown)).toThrow(/完整保留/);
    expect(() => restoreProtectedMarkdown(`${protectedMarkdown.text} ${protectedMarkdown.fragments[0].token}`, protectedMarkdown)).toThrow(/完整保留/);
  });

  it("splits long prose without dropping content", () => {
    const source = `${"a".repeat(20)}\n\n${"b".repeat(20)}\n\n${"c".repeat(20)}`;
    const chunks = splitTranslationText(source, 25);
    expect(chunks).toEqual([
      { text: "a".repeat(20), separator: "\n\n" },
      { text: "b".repeat(20), separator: "\n\n" },
      { text: "c".repeat(20), separator: "" },
    ]);
    expect(chunks.map((chunk) => `${chunk.text}${chunk.separator}`).join("")).toBe(source);
  });

  it("reassembles an oversized single paragraph without adding line breaks", () => {
    const source = `${"长句内容。".repeat(20)}END`;
    const chunks = splitTranslationText(source, 30);
    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks.map((chunk) => `${chunk.text}${chunk.separator}`).join("")).toBe(source);
  });
});
