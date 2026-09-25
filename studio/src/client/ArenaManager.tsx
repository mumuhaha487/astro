import { Check, ExternalLink, Layers3, LoaderCircle, Pencil, Plus, RefreshCw, Save, Trash2, Upload, X } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { api } from "./api";
import { extractWebArchive, normalizeArenaArchive, preferredWebEntry } from "./web-archive";
import {
  ARENA_PROVIDERS,
  type ArenaCatalog,
  type ArenaCategoryKind,
  type ArenaLocation,
  type ArenaTrack,
} from "../shared/model-arena";

type CatalogState = { catalog: ArenaCatalog; sha: string };

export function ArenaManager({ onClose }: { onClose: () => void }) {
  const [data, setData] = useState<CatalogState | null>(null);
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

  async function refresh() {
    setBusy(true);
    setError("");
    setNotice("");
    try { setData(await api.arena()); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "目录加载失败"); }
    finally { setBusy(false); }
  }

  useEffect(() => { void refresh(); }, []);

  const track = data?.catalog.tracks.find((item) => item.id === trackId);
  const project = track?.projects.find((item) => item.id === projectId);
  const provider = project?.providers.find((item) => item.id === providerId);
  const model = provider?.models.find((item) => item.id === modelId);
  const location: ArenaLocation = { trackId, projectId, providerId, modelId };

  useEffect(() => { setPrompt(project?.prompt || ""); }, [trackId, projectId, project?.prompt]);

  async function create(event: FormEvent) {
    event.preventDefault();
    if (!data || !kind) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const next = editing
        ? await api.changeArenaCategory(kind, location, name, data.sha)
        : await api.createArenaCategory(kind, location, name, data.sha);
      setData(next);
      const updatedTrack = next.catalog.tracks.find((item) => item.id === trackId);
      if (!editing && kind === "project") { setProjectId(updatedTrack?.projects.at(-1)?.id || ""); setPrompt(""); }
      if (!editing && kind === "provider") setProviderId(updatedTrack?.projects.find((item) => item.id === projectId)?.providers.at(-1)?.id || "");
      if (!editing && kind === "model") setModelId(updatedTrack?.projects.find((item) => item.id === projectId)?.providers.find((item) => item.id === providerId)?.models.at(-1)?.id || "");
      setName("");
      setKind(null);
      setEditing(false);
      setNotice(editing ? "名称已更新" : "分类已写入仓库");
    } catch (reason) { setError(reason instanceof Error ? reason.message : "分类创建失败"); }
    finally { setBusy(false); }
  }

  async function upload(event: FormEvent) {
    event.preventDefault();
    if (!data || !model || (inputMode === "file" && !files.length) || (inputMode === "paste" && !html.trim())) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      let uploads = files;
      let paths = files.map((item) => item.name);
      let entry = "";
      if (inputMode === "paste") uploads = [];
      else if (files.some((item) => /\.zip$/i.test(item.name))) {
        if (files.length !== 1 || !/\.zip$/i.test(files[0].name)) throw new Error("ZIP 压缩包请单独上传");
        const extracted = normalizeArenaArchive(extractWebArchive(new Uint8Array(await files[0].arrayBuffer())));
        paths = extracted.map((item) => item.path);
        entry = preferredWebEntry(paths);
        uploads = extracted.map((item) => new File([item.bytes.slice().buffer as ArrayBuffer], item.path.split("/").at(-1)!, { type: "application/octet-stream" }));
      }
      setData(await api.uploadArenaSubmission(location, uploads, paths, entry, inputMode === "paste" ? html : "", data.sha));
      setFiles([]);
      setHtml("");
      setNotice("作品已提交到仓库，博客部署后即可浏览");
    } catch (reason) { setError(reason instanceof Error ? reason.message : "作品上传失败"); }
    finally { setBusy(false); }
  }

  function startCategory(kindValue: ArenaCategoryKind, currentName = "") {
    setKind(kindValue); setName(currentName); setEditing(!!currentName);
  }

  async function removeCategory(kindValue: ArenaCategoryKind) {
    if (!data) return;
    const label = kindValue === "project" ? project?.name : kindValue === "provider" ? provider?.name : model?.name;
    if (!label || !window.confirm(`确定删除“${label}”及其下属分类和作品文件吗？此操作不可撤销。`)) return;
    setBusy(true); setError(""); setNotice("");
    try {
      setData(await api.changeArenaCategory(kindValue, location, null, data.sha));
      if (kindValue === "project") { setProjectId(""); setProviderId(""); setModelId(""); }
      if (kindValue === "provider") { setProviderId(""); setModelId(""); }
      if (kindValue === "model") setModelId("");
      setKind(null); setNotice("分类和对应作品已删除");
    } catch (reason) { setError(reason instanceof Error ? reason.message : "删除失败"); }
    finally { setBusy(false); }
  }

  async function savePrompt(event: FormEvent) {
    event.preventDefault();
    if (!data || !project) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      setData(await api.saveArenaPrompt({ trackId, projectId }, prompt, data.sha));
      setNotice("生成提示词已写入仓库，博客部署后更新");
    } catch (reason) { setError(reason instanceof Error ? reason.message : "提示词保存失败"); }
    finally { setBusy(false); }
  }

  function selectTrack(value: ArenaTrack["id"]) {
    setTrackId(value); setProjectId(""); setProviderId(""); setModelId(""); setKind(null); setFiles([]); setPrompt("");
  }

  return (
    <div className="modal-backdrop arena-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="arena-manager" role="dialog" aria-modal="true" aria-label="大模型竞技场管理">
        <header className="arena-manager-head">
          <div><small><Layers3 size={15} /> 内容管理</small><h2>大模型竞技场</h2></div>
          <div className="arena-head-actions">
            <button type="button" title="刷新目录" aria-label="刷新目录" onClick={() => void refresh()} disabled={busy}><RefreshCw size={18} /></button>
            <button type="button" title="关闭" aria-label="关闭" onClick={onClose}><X size={20} /></button>
          </div>
        </header>
        <div className="arena-manager-tabs" role="tablist" aria-label="竞技场方向">
          {data?.catalog.tracks.map((item) => <button type="button" role="tab" key={item.id} aria-selected={trackId === item.id} className={trackId === item.id ? "active" : ""} onClick={() => selectTrack(item.id)}>{item.name}</button>)}
        </div>
        {error ? <p className="arena-manager-message error" role="alert">{error}</p> : null}
        {notice ? <p className="arena-manager-message" role="status"><Check size={15} />{notice}</p> : null}
        {busy && !data ? <div className="arena-loading"><LoaderCircle className="spin" size={20} /></div> : null}
        {track ? <div className="arena-manager-body">
          <nav className="arena-manager-tree" aria-label="竞技场目录">
            <div className="arena-tree-heading"><span>测试项目</span><button type="button" title="新建测试项目" aria-label="新建测试项目" disabled={busy} onClick={() => startCategory("project")}><Plus size={17} /></button></div>
            {track.projects.map((item) => <button className={projectId === item.id ? "selected" : ""} type="button" key={item.id} onClick={() => { setProjectId(item.id); setProviderId(""); setModelId(""); setKind(null); setFiles([]); setPrompt(item.prompt || ""); }}>{item.name}</button>)}
            {!track.projects.length ? <p className="arena-tree-empty">暂无测试项目</p> : null}
          </nav>
          <nav className="arena-manager-tree" aria-label="模型厂商">
            <div className="arena-tree-heading"><span>模型厂商</span><button type="button" title="新建厂商" aria-label="新建厂商" disabled={!project || busy} onClick={() => startCategory("provider")}><Plus size={17} /></button></div>
            {project?.providers.map((item) => <button className={providerId === item.id ? "selected" : ""} type="button" key={item.id} onClick={() => { setProviderId(item.id); setModelId(""); setKind(null); setFiles([]); }}>{item.name}</button>)}
            {!project?.providers.length ? <p className="arena-tree-empty">{project ? "暂无模型厂商" : "先选择测试项目"}</p> : null}
          </nav>
          <nav className="arena-manager-tree" aria-label="具体模型">
            <div className="arena-tree-heading"><span>具体模型</span><button type="button" title="新建模型" aria-label="新建模型" disabled={!provider || busy} onClick={() => startCategory("model")}><Plus size={17} /></button></div>
            {provider?.models.map((item) => <button className={modelId === item.id ? "selected" : ""} type="button" key={item.id} onClick={() => { setModelId(item.id); setKind(null); setFiles([]); }}>{item.name}{item.url ? <Check size={14} /> : null}</button>)}
            {!provider?.models.length ? <p className="arena-tree-empty">{provider ? "暂无具体模型" : "先选择厂商"}</p> : null}
          </nav>
          <div className="arena-manager-detail">
            {project ? <div className="arena-category-actions"><span>{model?.name || provider?.name || project.name}</span><div>
              <button type="button" title={`重命名${model ? "模型" : provider ? "厂商" : "项目"}`} aria-label={`重命名${model ? "模型" : provider ? "厂商" : "项目"}`} disabled={busy} onClick={() => startCategory(model ? "model" : provider ? "provider" : "project", model?.name || provider?.name || project.name)}><Pencil size={16} /></button>
              <button type="button" title={`删除${model ? "模型" : provider ? "厂商" : "项目"}`} aria-label={`删除${model ? "模型" : provider ? "厂商" : "项目"}`} disabled={busy} onClick={() => void removeCategory(model ? "model" : provider ? "provider" : "project")}><Trash2 size={16} /></button>
            </div></div> : null}
            {kind ? <form onSubmit={(event) => void create(event)} className="arena-editor-form">
              <h3>{editing ? "修改名称" : kind === "project" ? "新建测试项目" : kind === "provider" ? "新建模型厂商" : "新建具体模型"}</h3>
              {kind === "provider" && !editing ? <div className="arena-provider-presets">{ARENA_PROVIDERS.map((value) => <button key={value} type="button" onClick={() => setName(value)}>{value}</button>)}</div> : null}
              <label>名称<input autoFocus maxLength={64} required value={name} onChange={(event) => setName(event.target.value)} placeholder={kind === "model" ? "例如 GPT-5" : kind === "provider" ? "选择厂商或输入名称" : "例如 鹈鹕骑自行车"} /></label>
              <div className="arena-form-actions"><button type="button" onClick={() => setKind(null)}>取消</button><button className="arena-submit" disabled={busy || !name.trim()} type="submit">{editing ? "保存" : "创建"}</button></div>
            </form> : <>
              {project ? <form onSubmit={(event) => void savePrompt(event)} className="arena-editor-form arena-prompt-form">
                <h3>{project.name} · 生成提示词</h3>
                <label>提示词<textarea rows={8} maxLength={20000} value={prompt} onChange={(event) => setPrompt(event.target.value)} /></label>
                <button className="arena-submit" type="submit" disabled={busy || prompt === (project.prompt || "")}><Save size={16} />保存提示词</button>
              </form> : null}
              {model ? <>
                <div className="arena-detail-title"><small>{track.name} / {project?.name} / {provider?.name}</small><h3>{model.name}</h3></div>
                <form onSubmit={(event) => void upload(event)} className="arena-editor-form">
                  <div className="arena-input-modes" role="group" aria-label="作品输入方式"><button type="button" aria-pressed={inputMode === "file"} onClick={() => setInputMode("file")}>上传文件</button><button type="button" aria-pressed={inputMode === "paste"} onClick={() => setInputMode("paste")}>粘贴 HTML</button></div>
                  {inputMode === "file" ? <label>网页文件或 ZIP<input key={`${modelId}/${model.url || ""}`} type="file" accept=".html,.htm,.zip,.js,.mjs,.css,.png,.jpg,.jpeg,.webp,.svg,.json,.wasm" multiple onChange={(event) => setFiles(Array.from(event.target.files || []))} /></label> : <label>HTML 源码<textarea rows={12} value={html} onChange={(event) => setHtml(event.target.value)} /></label>}
                  <button className="arena-submit" type="submit" disabled={busy || (inputMode === "file" ? !files.length : !html.trim())}><Upload size={16} />{busy ? "正在上传" : model.url ? "替换作品" : "发布作品"}</button>
                </form>
                {model.url ? <div className="arena-editor-preview"><div><span>当前作品</span><a href={`https://vmss.cn/model-arena/?track=${trackId}&project=${projectId}&provider=${providerId}&model=${modelId}`} target="_blank" rel="noopener noreferrer"><ExternalLink size={15} />博客页面</a></div><iframe src={model.url} title={`${model.name} 作品预览`} sandbox="allow-scripts allow-forms allow-modals allow-pointer-lock allow-popups allow-downloads" referrerPolicy="no-referrer" /></div> : null}
              </> : !project ? <div className="arena-detail-empty">选择左侧目录或新建分类</div> : null}
            </>}
          </div>
        </div> : null}
      </section>
    </div>
  );
}
