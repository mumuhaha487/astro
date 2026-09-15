import { describe, expect, it } from "vitest";

import { TRANSLATION_CHUNK_MAX_LENGTH } from "../shared/translation";
import {
  buildManualTranslationPackage,
  parseManualTranslation,
  translateArticleBySegments,
} from "./translation";

describe("browser translation orchestration", () => {
  it("translates long articles through bounded segments and restores protected Markdown", async () => {
    const protectedQuote = "> 引用内容保持原文\n";
    const protectedCode = "```sh\nnpm run build\n```";
    const body = Array.from({ length: 45 }, (_, index) =>
      `## 第 ${index + 1} 节\n\n${"这是需要翻译的正文。".repeat(12)}`).join("\n\n")
      + `\n\n${protectedQuote}\n${protectedCode}\n\n![封面](/image/cover.webp)`;
    const calls: Array<{ text: string; language: string; contentType: string }> = [];
    const progress: Array<[number, number]> = [];
    let active = 0;
    let maximumActive = 0;

    const translations = await translateArticleBySegments(
      "中文标题",
      "中文简介",
      body,
      ["en", "ja"],
      async (text, language, contentType) => {
        active += 1;
        maximumActive = Math.max(maximumActive, active);
        calls.push({ text, language, contentType });
        await Promise.resolve();
        active -= 1;
        return text
          .replaceAll("中文标题", language === "en" ? "English title" : "日本語タイトル")
          .replaceAll("中文简介", language === "en" ? "English description" : "日本語の概要")
          .replaceAll("需要翻译", language === "en" ? "translated" : "翻訳済み");
      },
      (completed, total) => progress.push([completed, total]),
    );

    expect(translations).toHaveLength(2);
    expect(translations[0].title).toBe("English title");
    expect(translations[1].title).toBe("日本語タイトル");
    expect(translations[0].body).toContain("translated");
    expect(translations[1].body).toContain("翻訳済み");
    for (const translation of translations) {
      expect(translation.body).toContain(protectedQuote.trim());
      expect(translation.body).toContain(protectedCode);
      expect(translation.body).toContain("![封面](/image/cover.webp)");
    }
    expect(calls.filter((call) => call.contentType === "Markdown 正文").length).toBeGreaterThan(4);
    expect(calls.every((call) => call.text.length <= TRANSLATION_CHUNK_MAX_LENGTH)).toBe(true);
    expect(maximumActive).toBe(1);
    expect(progress[0]).toEqual([0, calls.length]);
    expect(progress.at(-1)).toEqual([calls.length, calls.length]);
  });

  it("builds a protected full-document prompt and accepts a valid pasted translation", () => {
    const sourceBody = [
      "## 中文小节",
      "",
      "正文需要翻译。",
      "",
      "```ts",
      "const label = '不要修改';",
      "```",
      "",
      "![封面](/image/cover.webp)",
      "",
      '<iframe src="/web-pages/demo/index.html"></iframe>',
    ].join("\n");
    const translationPackage = buildManualTranslationPackage(
      "中文标题",
      "中文简介",
      sourceBody,
      "en",
    );
    const pasted = translationPackage.protectedDocument.text
      .replace('title: "中文标题"', 'title: "English title"')
      .replace('description: "中文简介"', 'description: "English description"')
      .replace("中文小节", "English section")
      .replace("正文需要翻译。", "The body is translated.");
    const result = parseManualTranslation(`\`\`\`markdown\n${pasted}\n\`\`\``, translationPackage);

    expect(translationPackage.prompt).not.toContain("Japanese");
    expect(translationPackage.prompt).toContain("完整 Markdown 文档");
    expect(result).toMatchObject({
      language: "en",
      title: "English title",
      description: "English description",
    });
    expect(result.body).toContain("## English section");
    expect(result.body).toContain("const label = '不要修改';");
    expect(result.body).toContain("![封面](/image/cover.webp)");
    expect(result.body).toContain('<iframe src="/web-pages/demo/index.html"></iframe>');
  });

  it("rejects pasted translations that damage a protected fragment", () => {
    const translationPackage = buildManualTranslationPackage(
      "中文标题",
      "中文简介",
      "正文 `npm run build`",
      "ja",
    );
    const damaged = translationPackage.protectedDocument.text.replace(
      translationPackage.protectedDocument.fragments[0].token,
      "",
    );
    expect(() => parseManualTranslation(damaged, translationPackage)).toThrow(/保留/);
    expect(translationPackage.prompt).toContain("Japanese (日本語)");
  });
});
