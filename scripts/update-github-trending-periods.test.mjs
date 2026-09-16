import assert from "node:assert/strict";
import { test } from "node:test";
import { aggregatePeriod, buildSearchIndex, periodDefinitions } from "./update-github-trending-periods.mjs";

const repo = (name, stars, article = "") => ({
  repo: `owner/${name}`, name, url: `https://github.com/owner/${name}`,
  language: "Go", description: `${name} tool`, tags: ["AI", "Skill"], starsToday: stars, ...(article ? { article } : {}),
});

test("ISO weeks cross years and calendar periods stay distinct", () => {
  const [week, month, year] = periodDefinitions("2021-01-01");
  assert.equal(week.key, "weekly-2020-w53");
  assert.equal(week.start, "2020-12-28");
  assert.equal(month.key, "monthly-2021-01");
  assert.equal(year.key, "yearly-2021");
});

test("cumulative ranking counts one observed day at a time", () => {
  const snapshots = [
    { date: "2026-09-14", candidates: [repo("Alpha", 100, "/a/"), repo("Beta", 80)] },
    { date: "2026-09-15", candidates: [repo("Beta", 150), repo("Alpha", 60)] },
    { date: "2026-09-16", candidates: [repo("Alpha", 120), repo("Gamma", 90)] },
  ];
  const [week] = periodDefinitions("2026-09-16");
  const result = aggregatePeriod(snapshots, week);
  assert.equal(result.observedDays, 3);
  assert.deepEqual(result.candidates[0].tags, ["AI", "Skill"]);
  assert.deepEqual(result.candidates.map((item) => [item.name, item.totalStars, item.days, item.firstPlaceDays]), [
    ["Alpha", 280, 3, 2], ["Beta", 230, 2, 1], ["Gamma", 90, 1, 0],
  ]);
  const older = aggregatePeriod(snapshots, { ...week, through: "2026-09-15" });
  assert.equal(older.observedDays, 2);
  assert.equal(older.candidates[0].name, "Beta");
});

test("search index finds archive entries and period articles without duplicate repositories", () => {
  const snapshots = [
    { date: "2026-09-14", candidates: [repo("Alpha", 100, "/daily/alpha/"), repo("Beta", 80)] },
    { date: "2026-09-15", candidates: [repo("Alpha", 120)] },
  ];
  const period = { period: "weekly", candidates: [{ repo: "owner/Alpha", article: "/weekly/alpha/" }] };
  const result = buildSearchIndex(snapshots, [period]);
  assert.equal(result.length, 2);
  assert.equal(result[0].repo, "owner/Alpha");
  assert.equal(result[0].days, 2);
  assert.equal(result[0].dailyArticle, "/daily/alpha/");
  assert.equal(result[0].periods.weekly, "/weekly/alpha/");
  assert.deepEqual(result[0].tags, ["AI", "Skill"]);
  assert.equal(result[1].repo, "owner/Beta");
});
