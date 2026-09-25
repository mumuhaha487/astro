import { describe, expect, it } from "vitest";
import { arenaLocation, createArenaCategory, setArenaSubmission, type ArenaCatalog } from "./model-arena";

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
    const uploaded = setArenaSubmission(model, { trackId: "frontend", projectId: "project-1", providerId: "provider-1", modelId: "model-1" }, "/model-arena/submissions/a.html", "2026-09-25T00:00:00Z");
    expect(arenaLocation(uploaded, { trackId: "frontend", projectId: "project-1", providerId: "provider-1", modelId: "model-1" }).model?.url).toBe("/model-arena/submissions/a.html");
    expect(arenaLocation(model, { trackId: "frontend", projectId: "project-1", providerId: "provider-1", modelId: "model-1" }).model?.url).toBeUndefined();
  });

  it("rejects missing ancestors and unsafe names", () => {
    expect(() => createArenaCategory(empty(), "provider", { trackId: "frontend", projectId: "missing" }, "GPT", "provider-1")).toThrow(/不存在/);
    expect(() => createArenaCategory(empty(), "project", { trackId: "frontend" }, "<script>", "project-1")).toThrow(/名称/);
  });
});
