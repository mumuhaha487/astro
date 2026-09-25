export interface ArenaModel {
  id: string;
  name: string;
  url?: string;
  updatedAt?: string;
}

export interface ArenaProvider {
  id: string;
  name: string;
  models: ArenaModel[];
}

export interface ArenaProject {
  id: string;
  name: string;
  providers: ArenaProvider[];
}

export interface ArenaTrack {
  id: "frontend" | "backend";
  name: string;
  projects: ArenaProject[];
}

export interface ArenaCatalog {
  tracks: ArenaTrack[];
}

export interface ArenaLocation {
  trackId: ArenaTrack["id"];
  projectId?: string;
  providerId?: string;
  modelId?: string;
}

export type ArenaCategoryKind = "project" | "provider" | "model";

export const ARENA_PROVIDERS = ["GPT", "Gemini", "Claude", "GLM", "DeepSeek", "豆包"];

export function arenaName(value: unknown): string {
  const name = typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
  if (!name || name.length > 64 || /[<>\u0000-\u001f\u007f]/.test(name)) {
    throw new Error("名称应为 1 到 64 个字符，且不能包含控制字符或尖括号");
  }
  return name;
}

export function arenaId(value: unknown): string {
  if (typeof value !== "string" || !/^[a-z0-9-]{1,64}$/.test(value)) throw new Error("分类标识无效");
  return value;
}

export function arenaLocation(catalog: ArenaCatalog, location: ArenaLocation) {
  const track = catalog.tracks.find((item) => item.id === location.trackId);
  if (!track) throw new Error("一级分类不存在");
  const project = location.projectId ? track.projects.find((item) => item.id === arenaId(location.projectId)) : undefined;
  if (location.projectId && !project) throw new Error("测试项目不存在");
  const provider = location.providerId ? project?.providers.find((item) => item.id === arenaId(location.providerId)) : undefined;
  if (location.providerId && !provider) throw new Error("模型厂商不存在");
  const model = location.modelId ? provider?.models.find((item) => item.id === arenaId(location.modelId)) : undefined;
  if (location.modelId && !model) throw new Error("模型不存在");
  return { track, project, provider, model };
}

export function createArenaCategory(catalog: ArenaCatalog, kind: ArenaCategoryKind, location: ArenaLocation, nameValue: unknown, id: string): ArenaCatalog {
  const name = arenaName(nameValue);
  arenaId(id);
  const next = structuredClone(catalog);
  const { track, project, provider } = arenaLocation(next, location);
  const siblings = kind === "project" ? track.projects : kind === "provider" ? project?.providers : provider?.models;
  if (!siblings) throw new Error("请先选择上级分类");
  if (siblings.some((item) => item.name.toLocaleLowerCase() === name.toLocaleLowerCase())) throw new Error("同级分类已有相同名称");
  if (kind === "project") track.projects.push({ id, name, providers: [] });
  else if (kind === "provider") project!.providers.push({ id, name, models: [] });
  else provider!.models.push({ id, name });
  return next;
}

export function setArenaSubmission(catalog: ArenaCatalog, location: ArenaLocation, url: string, updatedAt: string): ArenaCatalog {
  const next = structuredClone(catalog);
  const { model } = arenaLocation(next, location);
  if (!model) throw new Error("请选择要上传作品的模型");
  model.url = url;
  model.updatedAt = updatedAt;
  return next;
}
