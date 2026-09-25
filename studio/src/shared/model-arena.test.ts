import { describe, expect, it } from "vitest";
import {
  arenaLocation,
  collectCatalogUrls,
  createArenaCategory,
  deleteArenaCategory,
  renameArenaCategory,
  setArenaProjectPrompt,
  setArenaSubmission,
  validateArenaCatalogStructure,
  type ArenaCatalog,
} from "./model-arena";

const empty = (): ArenaCatalog => ({ tracks: [{ id: "frontend", name: "前端", projects: [] }, { id: "backend", name: "后端", projects: [] }] });

describe("arena catalog", () => {
  it("creates a project, provider and model without changing the source", () => {
    const source = empty();
    const project = createArenaCategory(source, "project", { trackId: "frontend" }, "鹈鹕骑自行车", "project-1");
    const provider = createArenaCategory(project, "provider", { trackId: "frontend", projectId: "project-1" }, "GPT", "provider-1");
    const model = createArenaCategory(provider, "model", { trackId: "frontend", projectId: "project-1", providerId: "provider-1" }, "GPT-5", "model-1");
    expect(source.tracks[0].projects).toHaveLength(0);
    expect(arenaLocation(model, { trackId: "frontend", projectId: "project-1", providerId: "provider-1", modelId: "model-1" }).model?.name).toBe("GPT-5");
    expect(() => createArenaCategory(model, "model", { trackId: "frontend", projectId: "project-1", providerId: "provider-1" }, "gpt-5", "model-2")).toThrow(/相同名称/);
    const uploaded = setArenaSubmission(model, { trackId: "frontend", projectId: "project-1", providerId: "provider-1", modelId: "model-1" }, "/model-arena/submissions/123e4567-e89b-42d3-a456-426614174000/index.html", "2026-09-25T00:00:00Z");
    expect(arenaLocation(uploaded, { trackId: "frontend", projectId: "project-1", providerId: "provider-1", modelId: "model-1" }).model?.url).toBe("/model-arena/submissions/123e4567-e89b-42d3-a456-426614174000/index.html");
    expect(arenaLocation(model, { trackId: "frontend", projectId: "project-1", providerId: "provider-1", modelId: "model-1" }).model?.url).toBeUndefined();
  });

  it("rejects missing ancestors and unsafe names", () => {
    expect(() => createArenaCategory(empty(), "provider", { trackId: "frontend", projectId: "missing" }, "GPT", "provider-1")).toThrow(/不存在/);
    expect(() => createArenaCategory(empty(), "project", { trackId: "frontend" }, "<script>", "project-1")).toThrow(/名称/);
  });

  it("stores a multiline prompt on the project without changing the source", () => {
    const source = createArenaCategory(empty(), "project", { trackId: "frontend" }, "鹈鹕骑自行车", "project-1");
    const location = { trackId: "frontend" as const, projectId: "project-1" };
    const updated = setArenaProjectPrompt(source, location, "  画一只鹈鹕\r\n骑自行车  ");
    expect(arenaLocation(updated, location).project?.prompt).toBe("画一只鹈鹕\n骑自行车");
    expect(arenaLocation(source, location).project?.prompt).toBeUndefined();
    expect(arenaLocation(setArenaProjectPrompt(updated, location, "  "), location).project?.prompt).toBeUndefined();
    expect(() => setArenaProjectPrompt(updated, location, "a".repeat(20001))).toThrow(/20000/);
    expect(() => setArenaProjectPrompt(updated, { trackId: "frontend" }, "test")).toThrow(/选择测试项目/);
  });

  it("renames in place and cascades removal through child submissions", () => {
    const location = { trackId: "frontend" as const, projectId: "p", providerId: "v", modelId: "m" };
    const source: ArenaCatalog = { tracks: [{ id: "frontend", name: "前端", projects: [{ id: "p", name: "Demo", providers: [{ id: "v", name: "GPT", models: [{ id: "m", name: "GPT-6", url: "/model-arena/submissions/123e4567-e89b-42d3-a456-426614174000/index.html" }] }] }] }, { id: "backend", name: "后端", projects: [] }] };
    const renamed = renameArenaCategory(source, "model", location, "GPT-6.1");
    expect(arenaLocation(renamed, location).model?.name).toBe("GPT-6.1");
    expect(arenaLocation(source, location).model?.name).toBe("GPT-6");
    expect(() => renameArenaCategory(source, "provider", { trackId: "frontend" }, "Other")).toThrow(/选择/);
    const removed = deleteArenaCategory(renamed, "project", location);
    expect(removed.urls).toEqual(["/model-arena/submissions/123e4567-e89b-42d3-a456-426614174000/index.html"]);
    expect(removed.catalog.tracks[0].projects).toHaveLength(0);
    expect(renamed.tracks[0].projects).toHaveLength(1);
  });

  it("collects all model URLs correctly", () => {
    const catalog: ArenaCatalog = {
      tracks: [
        {
          id: "frontend",
          name: "前端",
          projects: [
            {
              id: "p1",
              name: "P1",
              providers: [
                {
                  id: "pr1",
                  name: "PR1",
                  models: [
                    { id: "m1", name: "M1", url: "/model-arena/submissions/11111111-1111-1111-1111-111111111111/index.html" },
                    { id: "m2", name: "M2" },
                  ],
                },
              ],
            },
          ],
        },
        { id: "backend", name: "后端", projects: [] },
      ],
    };
    const urls = collectCatalogUrls(catalog);
    expect(urls.size).toBe(1);
    expect(urls.has("/model-arena/submissions/11111111-1111-1111-1111-111111111111/index.html")).toBe(true);
  });

  it("validates catalog structure and catches errors", () => {
    const valid: ArenaCatalog = {
      tracks: [
        { id: "frontend", name: "前端", projects: [] },
        { id: "backend", name: "后端", projects: [] },
      ],
    };
    expect(validateArenaCatalogStructure(valid)).toEqual(valid);

    expect(() => validateArenaCatalogStructure(null)).toThrow(/格式无效/);
    expect(() => validateArenaCatalogStructure({ tracks: [{ id: "frontend", name: "前端", projects: [] }] })).toThrow(/frontend 和 backend/);
    expect(() => validateArenaCatalogStructure({
      tracks: [
        { id: "frontend", name: "前端", projects: [{ id: "p1", name: "Dup", providers: [] }, { id: "p2", name: "dup", providers: [] }] },
        { id: "backend", name: "后端", projects: [] },
      ],
    })).toThrow(/重名测试项目/);
  });
});
