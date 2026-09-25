import { zipSync } from "fflate";
import { describe, expect, it } from "vitest";

import { extractWebArchive, normalizeArenaArchive, preferredWebEntry } from "./web-archive";

describe("web archive extraction", () => {
  it("keeps nested paths and dot-relative HTML references intact", () => {
    const archive = zipSync({
      "game/index.html": new TextEncoder().encode('<link rel="stylesheet" href="./style.css"><script src="./test.js"></script>'),
      "game/test.js": new TextEncoder().encode("document.body.dataset.ready = 'true'"),
      "game/style.css": new TextEncoder().encode("body{margin:0}"),
    });

    const files = extractWebArchive(archive);

    expect(files.map((file) => file.path)).toEqual([
      "game/index.html",
      "game/style.css",
      "game/test.js",
    ]);
    expect(new TextDecoder().decode(files[0].bytes)).toContain('src="./test.js"');
    expect(preferredWebEntry(files.map((file) => file.path))).toBe("game/index.html");
  });

  it("prefers a root index over nested HTML entries", () => {
    expect(preferredWebEntry(["demo/page.html", "demo/index.html", "index.html"])).toBe("index.html");
  });

  it("normalizes flat, singly wrapped and multiply wrapped archives to the same paths", () => {
    const files = ["index.html", "assets/app.js", "assets/logo.png"];
    for (const wrapper of ["", "example/", "example/dist/"]) {
      const archive = zipSync(Object.fromEntries(files.map((path) => [wrapper + path, new TextEncoder().encode(path)])));
      const normalized = normalizeArenaArchive(extractWebArchive(archive));
      expect(normalized.map((file) => file.path)).toEqual(files.sort());
      expect(preferredWebEntry(normalized.map((file) => file.path))).toBe("index.html");
    }
  });

  it("does not remove directories when files have different top-level roots", () => {
    const archive = zipSync({ "index.html": new Uint8Array([1]), "assets/a.js": new Uint8Array([2]) });
    expect(normalizeArenaArchive(extractWebArchive(archive)).map((file) => file.path)).toEqual(["assets/a.js", "index.html"]);
  });

  it("rejects traversal paths before returning extracted files", () => {
    const archive = zipSync({ "../escape.html": new TextEncoder().encode("unsafe") });
    expect(() => extractWebArchive(archive)).toThrow(/无效文件路径/);
  });
});
