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
  prompt?: string;
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

export function renameArenaCategory(catalog: ArenaCatalog, kind: ArenaCategoryKind, location: ArenaLocation, value: unknown): ArenaCatalog {
  const name = arenaName(value);
  const next = structuredClone(catalog);
  const { track, project, provider, model } = arenaLocation(next, location);
  const siblings = kind === "project" ? track.projects : kind === "provider" ? project?.providers : provider?.models;
  const target = kind === "project" ? project : kind === "provider" ? provider : model;
  if (!siblings || !target) throw new Error("请选择要修改的分类");
  if (siblings.some((item) => item.id !== target.id && item.name.toLocaleLowerCase() === name.toLocaleLowerCase())) throw new Error("同级分类已有相同名称");
  target.name = name;
  return next;
}

export function deleteArenaCategory(catalog: ArenaCatalog, kind: ArenaCategoryKind, location: ArenaLocation): { catalog: ArenaCatalog; urls: string[] } {
  const next = structuredClone(catalog);
  const { track, project, provider, model } = arenaLocation(next, location);
  const siblings = kind === "project" ? track.projects : kind === "provider" ? project?.providers : provider?.models;
  const target = kind === "project" ? project : kind === "provider" ? provider : model;
  if (!siblings || !target) throw new Error("请选择要删除的分类");
  const urls = kind === "project"
    ? project!.providers.flatMap((item) => item.models.map((entry) => entry.url).filter((url): url is string => !!url))
    : kind === "provider"
      ? provider!.models.map((entry) => entry.url).filter((url): url is string => !!url)
      : model!.url ? [model!.url] : [];
  siblings.splice(siblings.findIndex((item) => item.id === target.id), 1);
  return { catalog: next, urls };
}

export function setArenaProjectPrompt(catalog: ArenaCatalog, location: ArenaLocation, value: unknown): ArenaCatalog {
  if (typeof value !== "string") throw new Error("提示词格式无效");
  const prompt = value.replace(/\r\n?/g, "\n").trim();
  if (prompt.length > 20000 || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(prompt)) {
    throw new Error("提示词不能超过 20000 个字符或包含控制字符");
  }
  const next = structuredClone(catalog);
  const { project } = arenaLocation(next, location);
  if (!project) throw new Error("请先选择测试项目");
  if (prompt) project.prompt = prompt;
  else delete project.prompt;
  return next;
}

export function collectCatalogUrls(catalog: ArenaCatalog): Set<string> {
  const urls = new Set<string>();
  for (const track of catalog.tracks) {
    for (const project of track.projects) {
      for (const provider of project.providers) {
        for (const model of provider.models) {
          if (model.url) urls.add(model.url);
        }
      }
    }
  }
  return urls;
}

export function validateArenaCatalogStructure(catalog: unknown): ArenaCatalog {
  if (!catalog || typeof catalog !== "object") throw new Error("竞技场目录格式无效");
  const raw = catalog as ArenaCatalog;
  if (!Array.isArray(raw.tracks) || raw.tracks.length !== 2) throw new Error("一级分类必须包含 frontend 和 backend");
  const expectedTracks = ["frontend", "backend"] as const;
  for (const expectedId of expectedTracks) {
    const track = raw.tracks.find((t) => t.id === expectedId);
    if (!track) throw new Error(`缺少分类 ${expectedId}`);
    if (typeof track.name !== "string" || !track.name.trim()) throw new Error(`分类 ${expectedId} 名称无效`);
    if (!Array.isArray(track.projects)) throw new Error(`分类 ${expectedId} 测试项目列表无效`);
    const projectNames = new Set<string>();
    const projectIds = new Set<string>();
    for (const project of track.projects) {
      arenaId(project.id);
      if (projectIds.has(project.id)) throw new Error(`测试项目 ID 重复：${project.id}`);
      projectIds.add(project.id);
      arenaName(project.name);
      const nameKey = project.name.toLocaleLowerCase();
      if (projectNames.has(nameKey)) throw new Error(`存在重名测试项目：${project.name}`);
      projectNames.add(nameKey);
      if (project.prompt !== undefined) {
        if (typeof project.prompt !== "string" || project.prompt.length > 20000 || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(project.prompt)) {
          throw new Error("提示词格式无效");
        }
      }
      if (!Array.isArray(project.providers)) throw new Error(`项目 ${project.name} 厂商列表无效`);
      const providerNames = new Set<string>();
      const providerIds = new Set<string>();
      for (const provider of project.providers) {
        arenaId(provider.id);
        if (providerIds.has(provider.id)) throw new Error(`模型厂商 ID 重复：${provider.id}`);
        providerIds.add(provider.id);
        arenaName(provider.name);
        const provNameKey = provider.name.toLocaleLowerCase();
        if (providerNames.has(provNameKey)) throw new Error(`项目 ${project.name} 下存在同名厂商：${provider.name}`);
        providerNames.add(provNameKey);
        if (!Array.isArray(provider.models)) throw new Error(`厂商 ${provider.name} 模型列表无效`);
        const modelNames = new Set<string>();
        const modelIds = new Set<string>();
        for (const model of provider.models) {
          arenaId(model.id);
          if (modelIds.has(model.id)) throw new Error(`模型 ID 重复：${model.id}`);
          modelIds.add(model.id);
          arenaName(model.name);
          const modNameKey = model.name.toLocaleLowerCase();
          if (modelNames.has(modNameKey)) throw new Error(`厂商 ${provider.name} 下存在同名模型：${model.name}`);
          modelNames.add(modNameKey);
          if (model.url !== undefined) {
            if (typeof model.url !== "string" || !/^\/model-arena\/submissions\/[0-9a-f-]{36}(?:\.html|\/(?:[^/?#]+\/)*[^/?#]+\.html?)$/.test(model.url)) {
              throw new Error(`模型作品 URL 格式无效：${model.url}`);
            }
          }
          if (model.updatedAt !== undefined) {
            if (typeof model.updatedAt !== "string" || Number.isNaN(Date.parse(model.updatedAt))) {
              throw new Error(`作品更新时间无效：${model.updatedAt}`);
            }
          }
        }
      }
    }
  }
  return raw;
}
