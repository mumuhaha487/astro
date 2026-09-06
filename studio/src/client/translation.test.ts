import { describe, expect, it } from "vitest";

import { TRANSLATION_CHUNK_MAX_LENGTH } from "../shared/translation";
import { translateArticleBySegments } from "./translation";

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
    expect(maximumActive).toBeLessThanOrEqual(3);
    expect(progress[0]).toEqual([0, calls.length]);
    expect(progress.at(-1)).toEqual([calls.length, calls.length]);
  });
});
