import { Check, ExternalLink, Layers3, LoaderCircle, Pencil, Plus, RefreshCw, Save, Trash2, Undo2, Upload, X } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { api } from "./api";
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
  resetDraftWithNewBase,
  stageSubmission,
  submissionKey,
  type ArenaDraftState,
} from "./arena-draft";
import {
  ARENA_PROVIDERS,
  type ArenaCategoryKind,
  type ArenaLocation,
  type ArenaTrack,
} from "../shared/model-arena";

export function ArenaManager({ onClose }: { onClose: () => void }) {
  const [draft, setDraft] = useState<ArenaDraftState | null>(null);
  const [trackId, setTrackId] = useState<ArenaTrack["id"]>("frontend");
  const [projectId, setProjectId] = useState("");
  const [providerId, setProviderId] = useState("");
  const [modelId, setModelId] = useState("");
  const [kind, setKind] = useState<ArenaCategoryKind | null>(null);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [html, setHtml] = useState("");
  const [inputMode, setInputMode] = useState<"file" | "paste">("file");
  const [prompt, setPrompt] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function refresh(force = false) {
    if (draft && hasUnsavedChanges(draft) && !force) {
      if (!window.confirm("当前有未发布的暂存修改，刷新将丢弃这些修改。确定刷新吗？")) {
        return;
      }
    }
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const res = await api.arena();
      setDraft(createArenaDraft(res.catalog, res.sha));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "目录加载失败");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    void refresh(true);
  }, []);

  const track = draft?.catalog.tracks.find((item) => item.id === trackId);
  const project = track?.projects.find((item) => item.id === projectId);
  const provider = project?.providers.find((item) => item.id === providerId);
  const model = provider?.models.find((item) => item.id === modelId);
  const location: ArenaLocation = { trackId, projectId, providerId, modelId };

  useEffect(() => {
    setPrompt(project?.prompt || "");
  }, [trackId, projectId, project?.prompt]);

  const unsaved = draft ? hasUnsavedChanges(draft) : false;
  const summary = draft ? getStagedSummary(draft) : { count: 0, label: "" };

  function startCategory(kindValue: ArenaCategoryKind, currentName = "") {
    setKind(kindValue);
    setName(currentName);
    setEditing(!!currentName);
  }

  function saveCategory(event: FormEvent) {
    event.preventDefault();
    if (!draft || !kind) return;
    setError("");
    setNotice("");
    try {
      if (editing) {
        const nextDraft = applyRenameCategory(draft, kind, location, name);
        setDraft(nextDraft);
        setNotice("名称已更新（已暂存，点击【发布更改】后生效）");
      } else {
        const { state: nextDraft, newId } = applyAddCategory(draft, kind, location, name);
        setDraft(nextDraft);
        if (kind === "project") {
          setProjectId(newId);
          setProviderId("");
          setModelId("");
          setPrompt("");
        } else if (kind === "provider") {
          setProviderId(newId);
          setModelId("");
        } else if (kind === "model") {
          setModelId(newId);
        }
        setNotice("分类已创建（已暂存，点击【发布更改】后生效）");
      }
      setName("");
      setKind(null);
      setEditing(false);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "分类操作失败");
    }
  }

  function removeCategory(kindValue: ArenaCategoryKind) {
    if (!draft) return;
    const label = kindValue === "project" ? project?.name : kindValue === "provider" ? provider?.name : model?.name;
    if (!label || !window.confirm(`确定删除“${label}”及其下属分类和作品文件吗？此操作将暂存，点击“发布更改”后生效。`)) return;
    setError("");
    setNotice("");
    try {
      const nextDraft = applyDeleteCategory(draft, kindValue, location);
      setDraft(nextDraft);
      if (kindValue === "project") {
        setProjectId("");
        setProviderId("");
        setModelId("");
      } else if (kindValue === "provider") {
        setProviderId("");
        setModelId("");
      } else if (kindValue === "model") {
        setModelId("");
      }
      setKind(null);
      setNotice("分类及关联作品已加入删除暂存区");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "删除失败");
    }
  }

  function handleSavePrompt(event: FormEvent) {
    event.preventDefault();
    if (!draft || !project) return;
    setError("");
    setNotice("");
    try {
      const nextDraft = applySetPrompt(draft, { trackId, projectId }, prompt);
      setDraft(nextDraft);
      setNotice("提示词已暂存，点击【发布更改】后生效");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "提示词保存失败");
    }
  }

  async function handleStageSubmission(event: FormEvent) {
    event.preventDefault();
    if (!draft || !model || (inputMode === "file" && !files.length) || (inputMode === "paste" && !html.trim())) return;
    setError("");
    setNotice("");
    try {
      const nextDraft = await stageSubmission(draft, location, inputMode, files, html);
      setDraft(nextDraft);
      setFiles([]);
      setHtml("");
      setNotice("作品已暂存，点击右上角【发布更改】一次性同步到仓库");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "作品暂存失败");
    }
  }

  async function handlePublishBatch() {
    if (!draft || busy || !unsaved) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const { batch, files: uploadFiles } = buildBatchPayload(draft);
      const result = await api.publishArenaBatch(batch, uploadFiles);
      setDraft(resetDraftWithNewBase(result.catalog, result.sha));
      setNotice("所有更改已成功发布到仓库！博客部署后即可浏览");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "发布失败，已保留暂存修改，请检查后重试");
    } finally {
      setBusy(false);
    }
  }

  function handleDiscard() {
    if (!draft || !unsaved) return;
    if (!window.confirm("确定要放弃所有未发布的暂存修改吗？此操作不可撤销。")) return;
    setDraft(discardDraft(draft));
    setError("");
    setNotice("已放弃所有未发布的暂存修改");
  }

  function selectTrack(value: ArenaTrack["id"]) {
    setTrackId(value);
    setProjectId("");
    setProviderId("");
    setModelId("");
    setKind(null);
    setFiles([]);
    setPrompt("");
  }

  return (
    <div className="modal-backdrop arena-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="arena-manager" role="dialog" aria-modal="true" aria-label="大模型竞技场管理">
        <header className="arena-manager-head">
          <div className="arena-head-title">
            <small><Layers3 size={15} /> 内容管理</small>
            <h2>大模型竞技场</h2>
          </div>
          <div className="arena-head-actions">
            {unsaved ? <span className="arena-draft-badge" title="当前有未发布的暂存修改">{summary.label}</span> : null}
            <button
              type="button"
              className="arena-btn-discard"
              title="放弃修改"
              aria-label="放弃修改"
              disabled={busy || !unsaved}
              onClick={handleDiscard}
            >
              <Undo2 size={15} /> 放弃修改
            </button>
            <button
              type="button"
              className="arena-btn-publish"
              title="发布更改"
              aria-label="发布更改"
              disabled={busy || !unsaved}
              onClick={() => void handlePublishBatch()}
            >
              {busy ? <LoaderCircle className="spin" size={15} /> : <Upload size={15} />}
              {busy ? "正在发布..." : "发布更改"}
            </button>
            <button
              type="button"
              className="arena-btn-icon"
              title="刷新目录"
              aria-label="刷新目录"
              onClick={() => void refresh(false)}
              disabled={busy}
            >
              <RefreshCw size={18} />
            </button>
            <button
              type="button"
              className="arena-btn-icon"
              title="关闭"
              aria-label="关闭"
              onClick={onClose}
            >
              <X size={20} />
            </button>
          </div>
        </header>

        <div className="arena-manager-tabs" role="tablist" aria-label="竞技场方向">
          {draft?.catalog.tracks.map((item) => (
            <button
              type="button"
              role="tab"
              key={item.id}
              aria-selected={trackId === item.id}
              className={trackId === item.id ? "active" : ""}
              onClick={() => selectTrack(item.id)}
            >
              {item.name}
            </button>
          ))}
        </div>

        {error ? <p className="arena-manager-message error" role="alert">{error}</p> : null}
        {notice ? <p className="arena-manager-message" role="status"><Check size={15} />{notice}</p> : null}
        {busy && !draft ? <div className="arena-loading"><LoaderCircle className="spin" size={20} /></div> : null}

        {track ? (
          <div className="arena-manager-body">
            <nav className="arena-manager-tree" aria-label="竞技场目录">
              <div className="arena-tree-heading">
                <span>测试项目</span>
                <button
                  type="button"
                  title="新建测试项目"
                  aria-label="新建测试项目"
                  disabled={busy}
                  onClick={() => startCategory("project")}
                >
                  <Plus size={17} />
                </button>
              </div>
              {track.projects.map((item) => (
                <button
                  className={projectId === item.id ? "selected" : ""}
                  type="button"
                  key={item.id}
                  onClick={() => {
                    setProjectId(item.id);
                    setProviderId("");
                    setModelId("");
                    setKind(null);
                    setFiles([]);
                    setPrompt(item.prompt || "");
                  }}
                >
                  <span>{item.name}</span>
                </button>
              ))}
              {!track.projects.length ? <p className="arena-tree-empty">暂无测试项目</p> : null}
            </nav>

            <nav className="arena-manager-tree" aria-label="模型厂商">
              <div className="arena-tree-heading">
                <span>模型厂商</span>
                <button
                  type="button"
                  title="新建厂商"
                  aria-label="新建厂商"
                  disabled={!project || busy}
                  onClick={() => startCategory("provider")}
                >
                  <Plus size={17} />
                </button>
              </div>
              {project?.providers.map((item) => (
                <button
                  className={providerId === item.id ? "selected" : ""}
                  type="button"
                  key={item.id}
                  onClick={() => {
                    setProviderId(item.id);
                    setModelId("");
                    setKind(null);
                    setFiles([]);
                  }}
                >
                  <span>{item.name}</span>
                </button>
              ))}
              {!project?.providers.length ? <p className="arena-tree-empty">{project ? "暂无模型厂商" : "先选择测试项目"}</p> : null}
            </nav>

            <nav className="arena-manager-tree" aria-label="具体模型">
              <div className="arena-tree-heading">
                <span>具体模型</span>
                <button
                  type="button"
                  title="新建模型"
                  aria-label="新建模型"
                  disabled={!provider || busy}
                  onClick={() => startCategory("model")}
                >
                  <Plus size={17} />
                </button>
              </div>
              {provider?.models.map((item) => {
                const isStaged = draft?.stagedSubmissions.has(submissionKey({ trackId, projectId, providerId, modelId: item.id }));
                return (
                  <button
                    className={modelId === item.id ? "selected" : ""}
                    type="button"
                    key={item.id}
                    onClick={() => {
                      setModelId(item.id);
                      setKind(null);
                      setFiles([]);
                    }}
                  >
                    <span>{item.name}</span>
                    <span className="arena-model-tree-icons">
                      {isStaged ? <span className="arena-staged-indicator" title="已暂存待发布" /> : null}
                      {item.url ? <span title="已有作品"><Check size={14} /></span> : null}
                    </span>
                  </button>
                );
              })}
              {!provider?.models.length ? <p className="arena-tree-empty">{provider ? "暂无具体模型" : "先选择厂商"}</p> : null}
            </nav>

            <div className="arena-manager-detail">
              {project ? (
                <div className="arena-category-actions">
                  <span>{model?.name || provider?.name || project.name}</span>
                  <div>
                    <button
                      type="button"
                      title={`重命名${model ? "模型" : provider ? "厂商" : "项目"}`}
                      aria-label={`重命名${model ? "模型" : provider ? "厂商" : "项目"}`}
                      disabled={busy}
                      onClick={() => startCategory(model ? "model" : provider ? "provider" : "project", model?.name || provider?.name || project.name)}
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      type="button"
                      title={`删除${model ? "模型" : provider ? "厂商" : "项目"}`}
                      aria-label={`删除${model ? "模型" : provider ? "厂商" : "项目"}`}
                      disabled={busy}
                      onClick={() => void removeCategory(model ? "model" : provider ? "provider" : "project")}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ) : null}

              {kind ? (
                <form onSubmit={saveCategory} className="arena-editor-form">
                  <h3>{editing ? "修改名称" : kind === "project" ? "新建测试项目" : kind === "provider" ? "新建模型厂商" : "新建具体模型"}</h3>
                  {kind === "provider" && !editing ? (
                    <div className="arena-provider-presets">
                      {ARENA_PROVIDERS.map((value) => (
                        <button key={value} type="button" onClick={() => setName(value)}>
                          {value}
                        </button>
                      ))}
                    </div>
                  ) : null}
                  <label>
                    名称
                    <input
                      autoFocus
                      maxLength={64}
                      required
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      placeholder={kind === "model" ? "例如 GPT-5" : kind === "provider" ? "选择厂商或输入名称" : "例如 鸬鹚骑自行车"}
                    />
                  </label>
                  <div className="arena-form-actions">
                    <button type="button" onClick={() => setKind(null)}>取消</button>
                    <button className="arena-submit" disabled={busy || !name.trim()} type="submit">
                      {editing ? "保存" : "创建"}
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  {project ? (
                    <form onSubmit={handleSavePrompt} className="arena-editor-form arena-prompt-form">
                      <h3>{project.name} · 生成提示词</h3>
                      <label>
                        提示词
                        <textarea
                          rows={8}
                          maxLength={20000}
                          value={prompt}
                          onChange={(event) => setPrompt(event.target.value)}
                        />
                      </label>
                      <button className="arena-submit" type="submit" disabled={busy || prompt === (project.prompt || "")}>
                        <Save size={16} />保存提示词
                      </button>
                    </form>
                  ) : null}

                  {model ? (
                    <>
                      <div className="arena-detail-title">
                        <small>{track.name} / {project?.name} / {provider?.name}</small>
                        <h3>{model.name}</h3>
                      </div>
                      <form onSubmit={(event) => void handleStageSubmission(event)} className="arena-editor-form">
                        <div className="arena-input-modes" role="group" aria-label="作品输入方式">
                          <button type="button" aria-pressed={inputMode === "file"} onClick={() => setInputMode("file")}>
                            上传文件
                          </button>
                          <button type="button" aria-pressed={inputMode === "paste"} onClick={() => setInputMode("paste")}>
                            粘贴 HTML
                          </button>
                        </div>
                        {inputMode === "file" ? (
                          <label>
                            网页文件或 ZIP
                            <input
                              key={`${modelId}/${model.url || ""}`}
                              type="file"
                              accept=".html,.htm,.zip,.js,.mjs,.css,.png,.jpg,.jpeg,.webp,.svg,.json,.wasm"
                              multiple
                              onChange={(event) => setFiles(Array.from(event.target.files || []))}
                            />
                          </label>
                        ) : (
                          <label>
                            HTML 源码
                            <textarea rows={12} value={html} onChange={(event) => setHtml(event.target.value)} />
                          </label>
                        )}
                        <button
                          className="arena-submit"
                          type="submit"
                          disabled={busy || (inputMode === "file" ? !files.length : !html.trim())}
                        >
                          <Upload size={16} />
                          {draft?.stagedSubmissions.has(submissionKey(location)) ? "更新暂存作品" : model.url ? "暂存替换作品" : "暂存作品"}
                        </button>
                      </form>

                      {model.url && !model.url.startsWith("/model-arena/submissions/draft-") ? (
                        <div className="arena-editor-preview">
                          <div>
                            <span>当前作品</span>
                            <a
                              href={`https://vmss.cn/model-arena/?track=${trackId}&project=${projectId}&provider=${providerId}&model=${modelId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink size={15} />博客页面
                            </a>
                          </div>
                          <iframe
                            src={model.url}
                            title={`${model.name} 作品预览`}
                            sandbox="allow-scripts allow-forms allow-modals allow-pointer-lock allow-popups allow-downloads"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      ) : draft?.stagedSubmissions.has(submissionKey(location)) ? (
                        <div className="arena-editor-preview">
                          <div>
                            <span>作品已暂存待发布</span>
                          </div>
                          <p className="arena-tree-empty">{draft.stagedSubmissions.get(submissionKey(location))?.summary}</p>
                        </div>
                      ) : null}
                    </>
                  ) : !project ? (
                    <div className="arena-detail-empty">选择左侧目录或新建分类</div>
                  ) : null}
                </>
              )}
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}
