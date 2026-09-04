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

  it("preserves unsupported legacy publishing settings without data loss", () => {
    const fields = parseDocument("---\ntitle: 发布设置\npublished: 2026-09-04\narticleType: translation\ncreationStatement: original\nbackup: true\nvisibility: followers\narticleTemplate: compact\nmultiPlatform: true\nactivity: 开源实践\ntopic: Astro\n---\n\n正文").fields;
    const serialized = serializeDocument(fields, "正文");
    const roundTrip = parseDocument(serialized).fields;
    expect(roundTrip).toMatchObject({
      articleType: "translation",
      creationStatement: "original",
      backup: true,
      visibility: "followers",
      articleTemplate: "compact",
      multiPlatform: true,
      activity: "开源实践",
      topic: "Astro",
    });
  });

  it("round-trips every setting exposed by the blog settings drawer", () => {
    const parsed = parseDocument(`---
title: Drawer settings
published: 2026-09-05
updated: 2026-09-06
description: A concise introduction
image: /image/cover.webp
tags: [Astro, Studio]
category: Engineering
draft: true
pinned: true
priority: 3
lang: en
comment: false
encrypted: true
password: secret
passwordHint: six letters
permalink: /notes/drawer-settings/
---

Body`);

    expect(parseDocument(serializeDocument(parsed.fields, parsed.body)).fields).toMatchObject({
      title: "Drawer settings",
      published: "2026-09-05",
      updated: "2026-09-06",
      description: "A concise introduction",
      image: "/image/cover.webp",
      tags: ["Astro", "Studio"],
      category: "Engineering",
      draft: true,
      pinned: true,
      priority: 3,
      lang: "en",
      comment: false,
      encrypted: true,
      password: "secret",
      passwordHint: "six letters",
      permalink: "/notes/drawer-settings/",
    });
  });
});
