import { describe, expect, it } from "vitest";
import YAML from "yaml";
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

  it("serializes Astro date fields as plain YAML dates without weakening other strings", () => {
    const fields = parseDocument("---\ntitle: Base\npublished: 2026-09-05\n---\n").fields;
    const serialized = serializeDocument({
      ...fields,
      title: "true",
      published: "2026-09-05",
      updated: "2026-09-06",
      description: "2026-09-07",
      tags: ["null", "001", "2026-09-08"],
    }, "Body");

    expect(serialized).toMatch(/^published: 2026-09-05$/m);
    expect(serialized).toMatch(/^updated: 2026-09-06$/m);
    expect(serialized).toContain("title: 'true'");
    expect(serialized).toContain("description: '2026-09-07'");
    expect(serialized).toContain("  - 'null'");
    expect(serialized).toContain("  - '001'");
    expect(serialized).toContain("  - '2026-09-08'");

    const yaml = serialized.match(/^---\n([\s\S]*?)\n---/)?.[1];
    const astroCompatible = YAML.parse(yaml || "", { schema: "yaml-1.1" }) as Record<string, unknown>;
    expect(astroCompatible.published).toBeInstanceOf(Date);
    expect(astroCompatible.updated).toBeInstanceOf(Date);
    expect(astroCompatible.title).toBe("true");
    expect(astroCompatible.description).toBe("2026-09-07");
    expect(astroCompatible.tags).toEqual(["null", "001", "2026-09-08"]);
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
    expect(serializeDocument(parsed.fields, parsed.body)).toContain("url: '/notes/drawer-settings/'");
  });

  it("uses a Hugo url as the editor permalink when loading migrated content", () => {
    const parsed = parseDocument("---\ntitle: Hugo URL\npublished: 2026-09-05\nurl: /notes/hugo-url/\n---\n\nBody");
    expect(parsed.fields.permalink).toBe("/notes/hugo-url/");
  });
});
