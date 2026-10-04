import assert from "node:assert/strict";
import { test } from "node:test";
import { readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const workflowPath = join(root, ".github", "workflows", "github-trending.yml");

test("github-trending workflow has daily cron timer, dispatch trigger and 350-minute timeout", async () => {
  const content = await readFile(workflowPath, "utf8");
  const doc = parse(content);

  assert.ok(doc.on, "workflow has triggers defined");
  assert.ok(doc.on.schedule, "workflow has schedule defined");
  assert.equal(doc.on.schedule[0].cron, "0 5 * * *");
  assert.equal(doc.on.schedule[0].timezone, "Asia/Shanghai");
  assert.ok("workflow_dispatch" in doc.on, "workflow has workflow_dispatch trigger");

  const job = doc.jobs?.update;
  assert.ok(job, "workflow defines update job");
  assert.equal(job["timeout-minutes"], 350);
});

test("github-trending workflow sets base url and auto-sh model with retry loop", async () => {
  const content = await readFile(workflowPath, "utf8");
  const doc = parse(content);
  const steps = doc.jobs?.update?.steps || [];

  const testStep = steps.find((s) => s.name === "Verify ranking and deduplication");
  assert.ok(testStep, "test verification step exists");
  assert.ok(testStep.run.includes("scripts/update-github-trending.test.mjs"));
  assert.ok(testStep.run.includes("scripts/update-github-trending-periods.test.mjs"));
  assert.ok(testStep.run.includes("scripts/github-trending-ui.test.mjs"));
  assert.ok(testStep.run.includes("scripts/backfill-github-trending-tags.test.mjs"));
  assert.ok(testStep.run.includes("scripts/github-trending-workflow.test.mjs"));

  const generateStep = steps.find((s) => s.name === "Generate trending data with retries");
  assert.ok(generateStep, "generate step exists");
  assert.equal(generateStep.env?.DEEPSEEK_BASE_URL, "https://api.vmss.cn/");
  assert.equal(generateStep.env?.DEEPSEEK_MODEL, "auto-sh");
  assert.equal(generateStep.env?.DEEPSEEK_API_KEY, "${{ secrets.DEEPSEEK_API_KEY }}");

  assert.ok(generateStep.run.includes("scripts/backfill-github-trending-tags.mjs"));
  assert.ok(generateStep.run.includes("scripts/update-github-trending.mjs"));
  assert.ok(generateStep.run.includes("scripts/update-github-trending-periods.mjs"));
  assert.ok(generateStep.run.includes("while true; do"));
});
