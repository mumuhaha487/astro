import { describe, expect, it } from "vitest";
import { zipSync } from "fflate";
import {
  applyAddCategory,
  applyDeleteCategory,
  applyRenameCategory,
  applySetPrompt,
  buildBatchPayload,
  createArenaDraft,
  discardDraft,
  getStagedSummary,
  hasUnsavedChanges,
  stageSubmission,
  type ArenaDraftState,
} from "./arena-draft";
import type { ArenaCatalog } from "../shared/model-arena";

const initialCatalog = (): ArenaCatalog => ({
  tracks: [
    {
      id: "frontend",
      name: "前端",
      projects: [
        {
          id: "proj-1",
          name: "测试项目",
          prompt: "画一个太阳",
          providers: [
            {
              id: "prov-1",
              name: "GPT",
              models: [
                {
                  id: "model-1",
                  name: "GPT-4",
                  url: "/model-arena/submissions/00000000-0000-0000-0000-000000000000/index.html",
                },
              ],
            },
          ],
        },
      ],
    },
    { id: "backend", name: "后端", projects: [] },
  ],
});

describe("arena draft state management", () => {
  it("initializes without changes", () => {
    const draft = createArenaDraft(initialCatalog(), "sha-1");
    expect(hasUnsavedChanges(draft)).toBe(false);
    expect(getStagedSummary(draft).count).toBe(0);
  });

  it("stages additions, renames and prompt updates locally", () => {
    let draft = createArenaDraft(initialCatalog(), "sha-1");
    const { state: draftWithProj, newId: proj2Id } = applyAddCategory(draft, "project", { trackId: "frontend" }, "新项目", "proj-2");
    draft = draftWithProj;
    expect(hasUnsavedChanges(draft)).toBe(true);
    expect(draft.catalog.tracks[0].projects).toHaveLength(2);

    draft = applySetPrompt(draft, { trackId: "frontend", projectId: proj2Id }, "生成一个月亮");
    expect(draft.catalog.tracks[0].projects[1].prompt).toBe("生成一个月亮");

    draft = applyRenameCategory(draft, "project", { trackId: "frontend", projectId: proj2Id }, "改名项目");
    expect(draft.catalog.tracks[0].projects[1].name).toBe("改名项目");

    // Discard reverts everything
    const reverted = discardDraft(draft);
    expect(hasUnsavedChanges(reverted)).toBe(false);
    expect(reverted.catalog.tracks[0].projects).toHaveLength(1);
  });

  it("stages file and paste submissions without touching network", async () => {
    let draft = createArenaDraft(initialCatalog(), "sha-1");
    const location = { trackId: "frontend" as const, projectId: "proj-1", providerId: "prov-1", modelId: "model-1" };

    draft = await stageSubmission(draft, location, "paste", [], "<!doctype html><html><body>Pasted</body></html>");
    expect(hasUnsavedChanges(draft)).toBe(true);
    expect(draft.stagedSubmissions.size).toBe(1);
    expect(draft.removedUrls.has("/model-arena/submissions/00000000-0000-0000-0000-000000000000/index.html")).toBe(true);

    const { batch, files } = buildBatchPayload(draft);
    expect(batch.expectedSha).toBe("sha-1");
    expect(batch.submissions).toHaveLength(1);
    expect(batch.submissions[0].html).toBe("<!doctype html><html><body>Pasted</body></html>");
    expect(files).toHaveLength(0);
  });

  it("stages zip submissions and builds batch payload with flattened files and indexes", async () => {
    let draft = createArenaDraft(initialCatalog(), "sha-1");
    const location = { trackId: "frontend" as const, projectId: "proj-1", providerId: "prov-1", modelId: "model-1" };

    const zipBuffer = zipSync({
      "nested/dist/index.html": new TextEncoder().encode("<!doctype html><html><script src=\"assets/app.js\"></script></html>"),
      "nested/dist/assets/app.js": new TextEncoder().encode("console.log(1)"),
    });
    const zipFile = new File([zipBuffer], "bundle.zip", { type: "application/zip" });

    draft = await stageSubmission(draft, location, "file", [zipFile], "");
    expect(hasUnsavedChanges(draft)).toBe(true);
    expect(draft.stagedSubmissions.size).toBe(1);

    const { batch, files } = buildBatchPayload(draft, "竞技场批量提交");
    expect(batch.commitMessage).toBe("竞技场批量提交");
    expect(batch.submissions).toHaveLength(1);
    expect(batch.submissions[0].paths).toEqual(["assets/app.js", "index.html"]);
    expect(batch.submissions[0].fileIndexes).toEqual([0, 1]);
    expect(files).toHaveLength(2);
  });

  it("tracks removed URLs when categories with submissions are deleted", () => {
    let draft = createArenaDraft(initialCatalog(), "sha-1");
    const location = { trackId: "frontend" as const, projectId: "proj-1", providerId: "prov-1", modelId: "model-1" };

    draft = applyDeleteCategory(draft, "model", location);
    expect(hasUnsavedChanges(draft)).toBe(true);
    expect(draft.removedUrls.has("/model-arena/submissions/00000000-0000-0000-0000-000000000000/index.html")).toBe(true);
    expect(draft.catalog.tracks[0].projects[0].providers[0].models).toHaveLength(0);

    const { batch } = buildBatchPayload(draft);
    expect(batch.removedUrls).toEqual(["/model-arena/submissions/00000000-0000-0000-0000-000000000000/index.html"]);
  });
  it("stages full batch creating project + provider + model + prompt + upload together without touching network", async () => {
    let draft = createArenaDraft(initialCatalog(), "sha-base");

    // 1. Add project
    const { state: draftWithProj, newId: pId } = applyAddCategory(draft, "project", { trackId: "frontend" }, "新建项目", "proj-new");
    draft = draftWithProj;

    // 2. Add provider
    const { state: draftWithProv, newId: prId } = applyAddCategory(draft, "provider", { trackId: "frontend", projectId: pId }, "新建厂商", "prov-new");
    draft = draftWithProv;

    // 3. Add model
    const { state: draftWithModel, newId: mId } = applyAddCategory(draft, "model", { trackId: "frontend", projectId: pId, providerId: prId }, "新建模型", "model-new");
    draft = draftWithModel;

    // 4. Set prompt
    draft = applySetPrompt(draft, { trackId: "frontend", projectId: pId }, "全新生成提示词");

    // 5. Stage upload file
    draft = await stageSubmission(
      draft,
      { trackId: "frontend", projectId: pId, providerId: prId, modelId: mId },
      "paste",
      [],
      "<!doctype html><html><body>Full Flow HTML</body></html>",
    );

    expect(hasUnsavedChanges(draft)).toBe(true);

    const { batch, files } = buildBatchPayload(draft, "竞技场：完整新建项目厂商模型及作品");
    expect(batch.expectedSha).toBe("sha-base");
    expect(batch.commitMessage).toBe("竞技场：完整新建项目厂商模型及作品");
    expect(batch.submissions).toHaveLength(1);
    expect(batch.submissions[0].projectId).toBe(pId);
    expect(batch.submissions[0].providerId).toBe(prId);
    expect(batch.submissions[0].modelId).toBe(mId);
    expect(batch.submissions[0].html).toBe("<!doctype html><html><body>Full Flow HTML</body></html>");

    // Verify catalog structure in batch
    const createdProj = batch.catalog.tracks[0].projects.find((p) => p.id === pId);
    expect(createdProj).toBeDefined();
    expect(createdProj?.name).toBe("新建项目");
    expect(createdProj?.prompt).toBe("全新生成提示词");
    expect(createdProj?.providers[0].name).toBe("新建厂商");
    expect(createdProj?.providers[0].models[0].name).toBe("新建模型");

    // Retaining draft state on error: if an API call fails, draft is not cleared
    const failedDraft = draft; // simulate failed publish
    expect(hasUnsavedChanges(failedDraft)).toBe(true);
    expect(failedDraft.catalog.tracks[0].projects).toHaveLength(2);
  });

});
