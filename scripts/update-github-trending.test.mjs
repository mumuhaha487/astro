import assert from "node:assert/strict";
import { test } from "node:test";
import { parseTrending, rankRepositories, selectFeatures } from "./update-github-trending.mjs";

test("parses daily growth and repository metadata", () => {
  const html = `<article class="Box-row"><h2><a href="/Example/Alpha">Alpha</a></h2><p class="col-9">Useful  framework</p><span itemprop="programmingLanguage">Rust</span><span>1,234 stars today</span></article>`;
  assert.deepEqual(parseTrending(html), [{
    repo: "Example/Alpha", name: "Alpha", url: "https://github.com/Example/Alpha",
    starsToday: 1234, language: "Rust", description: "Useful framework",
  }]);
  assert.deepEqual(parseTrending('<article class="Box-row"><h2><a href="/bad/path/more">x</a></h2><span>12 stars today</span></article>'), []);
});

test("ranks unique repositories and skips names featured previously", () => {
  const a = { repo: "team/Alpha", name: "Alpha", starsToday: 30, language: "Other" };
  const b = { repo: "TEAM/alpha", name: "alpha", starsToday: 40, language: "Rust" };
  const c = { repo: "other/Beta", name: "Beta", starsToday: 20, language: "Go" };
  const ranked = rankRepositories([[a, c], [b]]);
  assert.equal(ranked.length, 2);
  assert.equal(ranked[0].starsToday, 40);
  assert.deepEqual(selectFeatures(ranked, new Set(["alpha"])).map((repo) => repo.name), ["Beta"]);
});
