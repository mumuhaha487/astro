import assert from "node:assert/strict";
import { test } from "node:test";
import { mkdtemp, rm, writeFile, readFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { version } from "./github-trending-tags.mjs";
import { updateDailySnapshots, updatePeriodSnapshots } from "./backfill-github-trending-tags.mjs";

test("updateDailySnapshots propagates model and apiKey to classifier for outdated snapshots", async () => {
  const tempDir = await mkdtemp(join(tmpdir(), "trending-daily-test-"));
  const dailyPath = join(tempDir, "2026-09-01.json");
  const initialSnapshot = {
    date: "2026-09-01",
    tagVersion: version - 1,
    candidates: [
      { repo: "owner/repo1", name: "repo1", tags: ["其他"] },
      { repo: "owner/repo2", name: "repo2", tags: ["AI"] },
    ],
  };
  await writeFile(dailyPath, JSON.stringify(initialSnapshot, null, 2) + "\n");

  const originalFetch = globalThis.fetch;
  let requestedUrl = "";
  let requestBody;
  let authHeader = "";

  globalThis.fetch = async (url, options) => {
    requestedUrl = url;
    authHeader = options?.headers?.Authorization || "";
    requestBody = JSON.parse(options.body);
    return {
      ok: true,
      json: async () => ({
        choices: [{
          message: {
            content: JSON.stringify({
              items: [
                { id: 0, tags: ["开发工具"] },
                { id: 1, tags: ["AI"] },
              ],
            }),
          },
        }],
      }),
    };
  };

  try {
    const snapshots = await updateDailySnapshots("test-api-key", {
      model: "auto-sh",
      baseUrl: "https://api.vmss.cn/",
      root: tempDir,
    });

    assert.equal(requestedUrl, "https://api.vmss.cn/v1/chat/completions");
    assert.equal(authHeader, "Bearer test-api-key");
    assert.equal(requestBody.model, "auto-sh");
    assert.equal(snapshots.size, 1);

    const updatedSnapshot = JSON.parse(await readFile(dailyPath, "utf8"));
    assert.equal(updatedSnapshot.tagVersion, version);
    assert.deepEqual(updatedSnapshot.candidates[0].tags, ["开发工具"]);
    assert.deepEqual(updatedSnapshot.candidates[1].tags, ["AI"]);
  } finally {
    globalThis.fetch = originalFetch;
    await rm(tempDir, { recursive: true, force: true });
  }
});

test("updateDailySnapshots skips API classification if snapshot is already up to date", async () => {
  const tempDir = await mkdtemp(join(tmpdir(), "trending-daily-uptodate-"));
  const dailyPath = join(tempDir, "2026-09-02.json");
  const upToDateSnapshot = {
    date: "2026-09-02",
    tagVersion: version,
    candidates: [
      { repo: "owner/repo1", name: "repo1", tags: ["开发工具"] },
    ],
  };
  await writeFile(dailyPath, JSON.stringify(upToDateSnapshot, null, 2) + "\n");

  let fetchCalled = false;
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => {
    fetchCalled = true;
    throw new Error("Should not be called");
  };

  try {
    const snapshots = await updateDailySnapshots("test-api-key", {
      model: "auto-sh",
      baseUrl: "https://api.vmss.cn/",
      root: tempDir,
    });
    assert.equal(fetchCalled, false);
    assert.equal(snapshots.size, 1);
  } finally {
    globalThis.fetch = originalFetch;
    await rm(tempDir, { recursive: true, force: true });
  }
});

test("updatePeriodSnapshots updates period tags matching daily snapshots", async () => {
  const tempDir = await mkdtemp(join(tmpdir(), "trending-period-test-"));
  const periodPath = join(tempDir, "weekly-2026-w36.json");
  const initialPeriod = {
    period: "weekly",
    tagVersion: version - 1,
    candidates: [
      { repo: "owner/repo1", latestSeen: "2026-09-01", tags: ["其他"] },
    ],
  };
  await writeFile(periodPath, JSON.stringify(initialPeriod, null, 2) + "\n");

  const daily = new Map();
  daily.set("2026-09-01", {
    date: "2026-09-01",
    tagVersion: version,
    candidates: [
      { repo: "owner/repo1", tags: ["开发工具", "AI"] },
    ],
  });

  try {
    const periods = await updatePeriodSnapshots(daily, { root: tempDir });
    assert.equal(periods.size, 1);
    const updatedPeriod = JSON.parse(await readFile(periodPath, "utf8"));
    assert.equal(updatedPeriod.tagVersion, version);
    assert.deepEqual(updatedPeriod.candidates[0].tags, ["开发工具", "AI"]);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});
