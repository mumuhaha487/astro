import type { ArenaCatalog, ArenaCategoryKind, ArenaLocation, ArenaTrack } from "../shared/model-arena";
import {
  arenaLocation,
  collectCatalogUrls,
  createArenaCategory,
  deleteArenaCategory,
  renameArenaCategory,
  setArenaProjectPrompt,
  setArenaSubmission,
} from "../shared/model-arena";
import type { ArenaBatchRequest, ArenaBatchSubmissionItem } from "../shared/types";
import { extractWebArchive, normalizeArenaArchive, preferredWebEntry } from "./web-archive";

export interface StagedSubmission {
  location: ArenaLocation;
  files: File[];
  paths: string[];
  entry: string;
  html?: string;
  sourceType: "file" | "paste" | "zip";
  summary: string;
  oldUrl?: string;
}

export interface ArenaDraftState {
  baseCatalog: ArenaCatalog;
  baseSha: string;
  catalog: ArenaCatalog;
  stagedSubmissions: Map<string, StagedSubmission>;
  removedUrls: Set<string>;
}

export function submissionKey(location: ArenaLocation): string {
  return `${location.trackId}::${location.projectId || ""}::${location.providerId || ""}::${location.modelId || ""}`;
}

export function createArenaDraft(baseCatalog: ArenaCatalog, baseSha: string): ArenaDraftState {
  return {
    baseCatalog: structuredClone(baseCatalog),
    baseSha,
    catalog: structuredClone(baseCatalog),
    stagedSubmissions: new Map(),
    removedUrls: new Set(),
  };
}

export function hasUnsavedChanges(state: ArenaDraftState): boolean {
  if (state.stagedSubmissions.size > 0) return true;
  if (state.removedUrls.size > 0) return true;
  const cleanCurrent = getCleanDraftCatalog(state);
  return JSON.stringify(state.baseCatalog) !== JSON.stringify(cleanCurrent);
}

export function getCleanDraftCatalog(state: ArenaDraftState): ArenaCatalog {
  const clean = structuredClone(state.catalog);
  for (const track of clean.tracks) {
    for (const project of track.projects) {
      for (const provider of project.providers) {
        for (const model of provider.models) {
          if (model.url && model.url.startsWith("/model-arena/submissions/draft-")) {
            const staged = state.stagedSubmissions.get(submissionKey({ trackId: track.id, projectId: project.id, providerId: provider.id, modelId: model.id }));
            if (staged?.oldUrl) {
              model.url = staged.oldUrl;
            } else {
              delete model.url;
            }
          }
        }
      }
    }
  }
  return clean;
}

export function getStagedSummary(state: ArenaDraftState): { count: number; label: string } {
  const stagedCount = state.stagedSubmissions.size + state.removedUrls.size;
  const changed = hasUnsavedChanges(state);
  const count = stagedCount > 0 ? stagedCount : changed ? 1 : 0;
  return {
    count,
    label: count > 0 ? `${count} 项待发布更改` : "无未发布更改",
  };
}

export function applyAddCategory(
  state: ArenaDraftState,
  kind: ArenaCategoryKind,
  location: ArenaLocation,
  name: string,
  id: string = crypto.randomUUID(),
): { state: ArenaDraftState; newId: string } {
  const nextCatalog = createArenaCategory(state.catalog, kind, location, name, id);
  return {
    state: {
      ...state,
      catalog: nextCatalog,
    },
    newId: id,
  };
}

export function applyRenameCategory(
  state: ArenaDraftState,
  kind: ArenaCategoryKind,
  location: ArenaLocation,
  name: string,
): ArenaDraftState {
  const nextCatalog = renameArenaCategory(state.catalog, kind, location, name);
  return {
    ...state,
    catalog: nextCatalog,
  };
}

export function applyDeleteCategory(
  state: ArenaDraftState,
  kind: ArenaCategoryKind,
  location: ArenaLocation,
): ArenaDraftState {
  const { catalog: nextCatalog, urls } = deleteArenaCategory(state.catalog, kind, location);
  const nextStaged = new Map(state.stagedSubmissions);
  const nextRemoved = new Set(state.removedUrls);

  // Any staged submission that belonged to the deleted branch should be discarded
  for (const [key, staged] of nextStaged.entries()) {
    const loc = staged.location;
    let matches = loc.trackId === location.trackId;
    if (kind === "project") matches = matches && loc.projectId === location.projectId;
    else if (kind === "provider") matches = matches && loc.projectId === location.projectId && loc.providerId === location.providerId;
    else if (kind === "model") matches = matches && loc.projectId === location.projectId && loc.providerId === location.providerId && loc.modelId === location.modelId;
    if (matches) {
      nextStaged.delete(key);
      if (staged.oldUrl) {
        nextRemoved.add(staged.oldUrl);
      }
    }
  }

  // Base catalog URLs that are now deleted need to be cleaned up
  const baseUrls = collectCatalogUrls(state.baseCatalog);
  for (const url of urls) {
    if (baseUrls.has(url)) {
      nextRemoved.add(url);
    }
  }

  return {
    ...state,
    catalog: nextCatalog,
    stagedSubmissions: nextStaged,
    removedUrls: nextRemoved,
  };
}

export function applySetPrompt(
  state: ArenaDraftState,
  location: ArenaLocation,
  prompt: string,
): ArenaDraftState {
  const nextCatalog = setArenaProjectPrompt(state.catalog, location, prompt);
  return {
    ...state,
    catalog: nextCatalog,
  };
}

export async function stageSubmission(
  state: ArenaDraftState,
  location: ArenaLocation,
  inputMode: "file" | "paste",
  files: File[],
  htmlText: string,
): Promise<ArenaDraftState> {
  const { model } = arenaLocation(state.catalog, location);
  if (!model) throw new Error("请先选择模型");

  let uploads: File[] = [];
  let paths: string[] = [];
  let entry = "";
  let sourceType: "file" | "paste" | "zip" = inputMode === "paste" ? "paste" : "file";
  let summary = "";

  if (inputMode === "paste") {
    if (!htmlText.trim()) throw new Error("请输入 HTML 内容");
    summary = "粘贴 HTML (index.html)";
    paths = ["index.html"];
    entry = "index.html";
    uploads = [];
  } else {
    if (!files.length) throw new Error("请选择要上传的文件");
    if (files.some((item) => /\.zip$/i.test(item.name))) {
      if (files.length !== 1 || !/\.zip$/i.test(files[0].name)) throw new Error("ZIP 压缩包请单独上传");
      sourceType = "zip";
      const buffer = new Uint8Array(await files[0].arrayBuffer());
      const extracted = normalizeArenaArchive(extractWebArchive(buffer));
      paths = extracted.map((item) => item.path);
      entry = preferredWebEntry(paths);
      uploads = extracted.map((item) => new File([item.bytes.slice().buffer as ArrayBuffer], item.path.split("/").at(-1)!, { type: "application/octet-stream" }));
      summary = `ZIP 压缩包 (${files[0].name}, ${paths.length} 个文件)`;
    } else {
      sourceType = "file";
      paths = files.map((item) => item.name);
      entry = preferredWebEntry(paths);
      uploads = files;
      summary = `${files.length} 个网页文件 (${entry || files[0].name})`;
    }
  }

  const key = submissionKey(location);
  const existingStaged = state.stagedSubmissions.get(key);
  const baseModel = (() => {
    try {
      return arenaLocation(state.baseCatalog, location).model;
    } catch {
      return undefined;
    }
  })();
  const oldUrl = existingStaged?.oldUrl || baseModel?.url;

  const nextStaged = new Map(state.stagedSubmissions);
  nextStaged.set(key, {
    location: { ...location },
    files: uploads,
    paths,
    entry,
    html: inputMode === "paste" ? htmlText : undefined,
    sourceType,
    summary,
    oldUrl,
  });

  const simulatedUrl = `/model-arena/submissions/draft-${model.id}/${entry || "index.html"}`;
  const nextCatalog = setArenaSubmission(state.catalog, location, simulatedUrl, new Date().toISOString());

  const nextRemoved = new Set(state.removedUrls);
  if (oldUrl) {
    nextRemoved.add(oldUrl);
  }

  return {
    ...state,
    catalog: nextCatalog,
    stagedSubmissions: nextStaged,
    removedUrls: nextRemoved,
  };
}

export function buildBatchPayload(state: ArenaDraftState, commitMessage?: string): { batch: ArenaBatchRequest; files: File[] } {
  const cleanCatalog = getCleanDraftCatalog(state);
  const allFiles: File[] = [];
  const submissions: ArenaBatchSubmissionItem[] = [];

  for (const staged of state.stagedSubmissions.values()) {
    const fileIndexes: number[] = [];
    for (const file of staged.files) {
      fileIndexes.push(allFiles.length);
      allFiles.push(file);
    }
    submissions.push({
      trackId: staged.location.trackId,
      projectId: staged.location.projectId!,
      providerId: staged.location.providerId!,
      modelId: staged.location.modelId!,
      entry: staged.entry,
      paths: staged.paths,
      fileIndexes,
      html: staged.html,
      oldUrl: staged.oldUrl,
    });
  }

  const batch: ArenaBatchRequest = {
    expectedSha: state.baseSha,
    catalog: cleanCatalog,
    submissions,
    removedUrls: Array.from(state.removedUrls),
    commitMessage,
  };

  return { batch, files: allFiles };
}

export function discardDraft(state: ArenaDraftState): ArenaDraftState {
  return createArenaDraft(state.baseCatalog, state.baseSha);
}

export function resetDraftWithNewBase(baseCatalog: ArenaCatalog, baseSha: string): ArenaDraftState {
  return createArenaDraft(baseCatalog, baseSha);
}
