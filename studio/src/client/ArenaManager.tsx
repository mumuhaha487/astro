import { Check, ExternalLink, Layers3, LoaderCircle, Plus, RefreshCw, Save, Upload, X } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { api } from "./api";
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
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);
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
      const next = await api.createArenaCategory(kind, location, name, data.sha);
      setData(next);
      const updatedTrack = next.catalog.tracks.find((item) => item.id === trackId);
      if (kind === "project") { setProjectId(updatedTrack?.projects.at(-1)?.id || ""); setPrompt(""); }
      if (kind === "provider") setProviderId(updatedTrack?.projects.find((item) => item.id === projectId)?.providers.at(-1)?.id || "");
      if (kind === "model") setModelId(updatedTrack?.projects.find((item) => item.id === projectId)?.providers.find((item) => item.id === providerId)?.models.at(-1)?.id || "");
      setName("");
      setKind(null);
      setNotice("分类已写入仓库");
    } catch (reason) { setError(reason instanceof Error ? reason.message : "分类创建失败"); }
    finally { setBusy(false); }
  }

  async function upload(event: FormEvent) {
    event.preventDefault();
    if (!data || !model || !file) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      setData(await api.uploadArenaSubmission(location, file, data.sha));
      setFile(null);
      setNotice("作品已提交到仓库，博客部署后即可浏览");
    } catch (reason) { setError(reason instanceof Error ? reason.message : "作品上传失败"); }
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
    setTrackId(value); setProjectId(""); setProviderId(""); setModelId(""); setKind(null); setFile(null); setPrompt("");
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
            <div className="arena-tree-heading"><span>测试项目</span><button type="button" title="新建测试项目" aria-label="新建测试项目" onClick={() => { setKind("project"); setName(""); }}><Plus size={17} /></button></div>
            {track.projects.map((item) => <button className={projectId === item.id ? "selected" : ""} type="button" key={item.id} onClick={() => { setProjectId(item.id); setProviderId(""); setModelId(""); setKind(null); setFile(null); setPrompt(item.prompt || ""); }}>{item.name}</button>)}
            {!track.projects.length ? <p className="arena-tree-empty">暂无测试项目</p> : null}
          </nav>
          <nav className="arena-manager-tree" aria-label="模型厂商">
            <div className="arena-tree-heading"><span>模型厂商</span><button type="button" title="新建厂商" aria-label="新建厂商" disabled={!project} onClick={() => { setKind("provider"); setName(""); }}><Plus size={17} /></button></div>
            {project?.providers.map((item) => <button className={providerId === item.id ? "selected" : ""} type="button" key={item.id} onClick={() => { setProviderId(item.id); setModelId(""); setKind(null); setFile(null); }}>{item.name}</button>)}
            {!project?.providers.length ? <p className="arena-tree-empty">{project ? "暂无模型厂商" : "先选择测试项目"}</p> : null}
          </nav>
          <nav className="arena-manager-tree" aria-label="具体模型">
            <div className="arena-tree-heading"><span>具体模型</span><button type="button" title="新建模型" aria-label="新建模型" disabled={!provider} onClick={() => { setKind("model"); setName(""); }}><Plus size={17} /></button></div>
            {provider?.models.map((item) => <button className={modelId === item.id ? "selected" : ""} type="button" key={item.id} onClick={() => { setModelId(item.id); setKind(null); setFile(null); }}>{item.name}{item.url ? <Check size={14} /> : null}</button>)}
            {!provider?.models.length ? <p className="arena-tree-empty">{provider ? "暂无具体模型" : "先选择厂商"}</p> : null}
          </nav>
          <div className="arena-manager-detail">
            {kind ? <form onSubmit={(event) => void create(event)} className="arena-editor-form">
              <h3>{kind === "project" ? "新建测试项目" : kind === "provider" ? "新建模型厂商" : "新建具体模型"}</h3>
              {kind === "provider" ? <div className="arena-provider-presets">{ARENA_PROVIDERS.map((value) => <button key={value} type="button" onClick={() => setName(value)}>{value}</button>)}</div> : null}
              <label>名称<input autoFocus maxLength={64} required value={name} onChange={(event) => setName(event.target.value)} placeholder={kind === "model" ? "例如 GPT-5" : kind === "provider" ? "选择厂商或输入名称" : "例如 鹈鹕骑自行车"} /></label>
              <div className="arena-form-actions"><button type="button" onClick={() => setKind(null)}>取消</button><button className="arena-submit" disabled={busy || !name.trim()} type="submit">创建</button></div>
            </form> : <>
              {project ? <form onSubmit={(event) => void savePrompt(event)} className="arena-editor-form arena-prompt-form">
                <h3>{project.name} · 生成提示词</h3>
                <label>提示词<textarea rows={8} maxLength={20000} value={prompt} onChange={(event) => setPrompt(event.target.value)} /></label>
                <button className="arena-submit" type="submit" disabled={busy || prompt === (project.prompt || "")}><Save size={16} />保存提示词</button>
              </form> : null}
              {model ? <>
                <div className="arena-detail-title"><small>{track.name} / {project?.name} / {provider?.name}</small><h3>{model.name}</h3></div>
                <form onSubmit={(event) => void upload(event)} className="arena-editor-form">
                  <label>HTML 作品<input key={`${modelId}/${model.url || ""}`} type="file" accept=".html,.htm,text/html" onChange={(event) => setFile(event.target.files?.[0] || null)} required /></label>
                  <button className="arena-submit" type="submit" disabled={busy || !file}><Upload size={16} />{busy ? "正在上传" : model.url ? "替换 HTML" : "上传 HTML"}</button>
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
