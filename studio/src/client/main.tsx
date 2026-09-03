import DOMPurify from "dompurify";
import {
  AlertCircle,
  Check,
  ChevronLeft,
  Cloud,
  Code2,
  ExternalLink,
  Eye,
  FilePlus2,
  FolderGit2,
  GitBranch,
  ImagePlus,
  KeyRound,
  LoaderCircle,
  LogOut,
  Menu,
  PanelRightOpen,
  PencilLine,
  Pin,
  RefreshCw,
  Save,
  Search,
  Settings,
  SlidersHorizontal,
  Trash2,
  X,
} from "lucide-react";
import { marked } from "marked";
import {
  type ClipboardEvent,
  type FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createRoot } from "react-dom/client";
import { ApiError, api } from "./api";
import {
  type FrontmatterFields,
  hasUnsafeRichContent,
  makePostPath,
  parseDocument,
  serializeDocument,
} from "./frontmatter";
import {
  MdxEditorSlot,
  type MdxEditorSlotHandle,
} from "./MdxEditorSlot";
import type {
  DraftDocument,
  DraftSummary,
  PostDocument,
  PostMeta,
  SessionInfo,
} from "../shared/types";
import "./styles.css";

type EditorMode = "rich" | "source" | "preview";
type ListFilter = "all" | "published" | "draft" | "pinned";
type SyncState = "idle" | "saving" | "saved" | "error";

interface WorkingDocument extends PostDocument {
  draftKey?: string;
  isNew: boolean;
}

interface ToastMessage {
  text: string;
  tone: "success" | "error" | "info";
}

marked.setOptions({ gfm: true, breaks: true });

function App() {
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [booting, setBooting] = useState(true);
  const [posts, setPosts] = useState<PostMeta[]>([]);
  const [drafts, setDrafts] = useState<DraftSummary[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [working, setWorking] = useState<WorkingDocument | null>(null);
  const [fields, setFields] = useState<FrontmatterFields | null>(null);
  const [body, setBody] = useState("");
  const [tagsText, setTagsText] = useState("");
  const [mode, setMode] = useState<EditorMode>("rich");
  const [filter, setFilter] = useState<ListFilter>("all");
  const [query, setQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [syncState, setSyncState] = useState<SyncState>("idle");
  const [syncLabel, setSyncLabel] = useState("未修改");
  const [revision, setRevision] = useState(0);
  const [draftSyncedRevision, setDraftSyncedRevision] = useState(0);
  const [publishedRevision, setPublishedRevision] = useState(0);
  const [editorEpoch, setEditorEpoch] = useState(0);
  const [publishing, setPublishing] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const editorRef = useRef<MdxEditorSlotHandle>(null);

  useEffect(() => {
    void api
      .session()
      .then((value) => {
        setSession(value);
        return loadPostsAndDrafts();
      })
      .catch(() => setSession(null))
      .finally(() => setBooting(false));
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 4200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const currentFields = useCallback((): FrontmatterFields | null => {
    if (!fields) return null;
    return { ...fields, tags: parseTags(tagsText) };
  }, [fields, tagsText]);

  const currentContent = useCallback(() => {
    const normalizedFields = currentFields();
    return normalizedFields ? serializeDocument(normalizedFields, body) : "";
  }, [body, currentFields]);

  const isDirty = revision !== publishedRevision;
  const richModeBlocked = hasUnsafeRichContent(body);

  useEffect(() => {
    if (!working || !fields || revision === 0) return;
    const snapshot = {
      path: working.path,
      sha: working.sha,
      title: fields.title || "未命名文章",
      updatedAt: new Date().toISOString(),
      isNew: working.isNew,
      content: currentContent(),
    };
    window.localStorage.setItem(`astro-studio:${working.path}`, JSON.stringify(snapshot));
  }, [body, currentContent, fields, revision, tagsText, working]);

  useEffect(() => {
    if (!working || !fields || revision === 0 || revision === draftSyncedRevision) return;
    const targetRevision = revision;
    const timer = window.setTimeout(async () => {
      setSyncState("saving");
      setSyncLabel("正在同步草稿");
      try {
        const saved = await api.saveDraft({
          key: working.draftKey,
          path: working.path,
          sha: working.sha,
          title: fields.title || "未命名文章",
          updatedAt: new Date().toISOString(),
          isNew: working.isNew,
          content: currentContent(),
        });
        setWorking((current) =>
          current ? { ...current, draftKey: saved.key } : current,
        );
        setDraftSyncedRevision(targetRevision);
        setSyncState("saved");
        setSyncLabel(`云端草稿 ${formatTime(saved.updatedAt)}`);
        setDrafts((current) => [
          saved,
          ...current.filter((draft) => draft.key !== saved.key),
        ]);
      } catch (error) {
        setSyncState("error");
        setSyncLabel(errorMessage(error));
      }
    }, 8_000);
    return () => window.clearTimeout(timer);
  }, [currentContent, draftSyncedRevision, fields, revision, working]);

  async function loadPostsAndDrafts(force = false) {
    setLoadingPosts(true);
    try {
      const [postResult, draftResult] = await Promise.all([
        force ? fetch("/api/posts?refresh=1", { credentials: "same-origin" }).then(async (response) => {
          if (!response.ok) throw new Error("刷新文章失败");
          return (await response.json()) as { posts: PostMeta[]; stale?: boolean };
        }) : api.posts(),
        api.drafts(),
      ]);
      setPosts(postResult.posts);
      setDrafts(draftResult.drafts);
      if (postResult.stale) {
        showToast("GitHub 暂时不可用，当前显示最近缓存", "info");
      }
    } catch (error) {
      showToast(errorMessage(error), "error");
    } finally {
      setLoadingPosts(false);
    }
  }

  function showToast(text: string, tone: ToastMessage["tone"] = "info") {
    setToast({ text, tone });
  }

  function markChanged() {
    setRevision((value) => value + 1);
    setSyncState("idle");
    setSyncLabel("等待同步");
  }

  function setField<K extends keyof FrontmatterFields>(
    key: K,
    value: FrontmatterFields[K],
  ) {
    setFields((current) => (current ? { ...current, [key]: value } : current));
    markChanged();
  }

  function updateBody(markdown: string) {
    setBody((current) => {
      if (current === markdown) return current;
      markChanged();
      return markdown;
    });
  }

  function hydrateDocument(document: WorkingDocument, restored = false) {
    const parsed = parseDocument(document.content);
    setWorking(document);
    setFields(parsed.fields);
    setBody(parsed.body);
    setTagsText(parsed.fields.tags.join(", "));
    const blocked = hasUnsafeRichContent(parsed.body);
    setMode(blocked ? "source" : "rich");
    setAdvancedOpen(false);
    setRevision(restored ? 1 : 0);
    setPublishedRevision(0);
    setDraftSyncedRevision(restored ? 1 : 0);
    setEditorEpoch((value) => value + 1);
    setSyncState(restored ? "saved" : "idle");
    setSyncLabel(restored ? "已恢复云端草稿" : "未修改");
    setSidebarOpen(false);
  }

  async function openPost(post: PostMeta) {
    try {
      setSyncLabel("正在打开");
      const remoteDraft = drafts.find((draft) => draft.path === post.path);
      const [document, restoredDraft] = await Promise.all([
        api.post(post.path),
        remoteDraft ? api.draft(remoteDraft.key) : Promise.resolve(null),
      ]);
      const local = readLocalDraft(post.path);
      const bestDraft = pickNewestDraft(restoredDraft, local);
      if (bestDraft) {
        hydrateDocument(
          {
            path: post.path,
            sha: document.sha,
            content: bestDraft.content,
            draftKey: bestDraft.key || remoteDraft?.key,
            isNew: false,
          },
          true,
        );
      } else {
        hydrateDocument({ ...document, isNew: false });
      }
    } catch (error) {
      showToast(errorMessage(error), "error");
      setSyncLabel("打开失败");
    }
  }

  async function openDraft(draft: DraftSummary) {
    try {
      const document = await api.draft(draft.key);
      hydrateDocument(
        {
          path: document.path,
          sha: document.sha,
          content: document.content,
          draftKey: document.key,
          isNew: document.isNew,
        },
        true,
      );
    } catch (error) {
      showToast(errorMessage(error), "error");
    }
  }

  function createPost() {
    const id = crypto.randomUUID().replaceAll("-", "");
    const initialFields: FrontmatterFields = {
      title: "",
      published: new Date().toISOString().slice(0, 10),
      description: "",
      image: "",
      tags: [],
      category: "",
      draft: true,
      pinned: false,
      lang: "zh-CN",
      comment: true,
      encrypted: false,
    };
    hydrateDocument(
      {
        path: `draft:new:${id}`,
        sha: "",
        content: serializeDocument(initialFields, ""),
        isNew: true,
      },
      false,
    );
    setRevision(1);
  }

  async function publishPost() {
    if (!working || !fields) return;
    const normalizedFields = currentFields();
    if (!normalizedFields) return;
    if (!normalizedFields.title.trim()) {
      showToast("请填写文章标题", "error");
      return;
    }
    if (!normalizedFields.published) {
      showToast("请选择发布日期", "error");
      return;
    }

    setPublishing(true);
    setSyncState("saving");
    setSyncLabel("正在提交 GitHub");
    const path = working.isNew ? makePostPath(normalizedFields.title) : working.path;
    try {
      const saved = await api.savePost(
        {
          path,
          sha: working.isNew ? "" : working.sha,
          content: serializeDocument(normalizedFields, body),
        },
        working.isNew
          ? `发布文章：${normalizedFields.title}`
          : `更新文章：${normalizedFields.title}`,
      );
      if (working.draftKey) await api.deleteDraft(working.draftKey).catch(() => undefined);
      window.localStorage.removeItem(`astro-studio:${working.path}`);
      setWorking({ ...saved, isNew: false });
      setFields(normalizedFields);
      setRevision(0);
      setPublishedRevision(0);
      setDraftSyncedRevision(0);
      setSyncState("saved");
      setSyncLabel(`已提交 ${formatTime(new Date().toISOString())}`);
      showToast(normalizedFields.draft ? "草稿已保存到 GitHub" : "文章已发布，EdgeOne 正在构建", "success");
      await loadPostsAndDrafts(true);
    } catch (error) {
      setSyncState("error");
      setSyncLabel(errorMessage(error));
      showToast(errorMessage(error), "error");
      if (error instanceof ApiError && error.code === "GITHUB_NOT_CONNECTED") {
        setSettingsOpen(true);
      }
    } finally {
      setPublishing(false);
    }
  }

  async function removePost() {
    if (!working || working.isNew) return;
    const confirmed = window.confirm("确定要从 GitHub 删除这篇文章吗？此操作会产生一次删除提交。");
    if (!confirmed) return;
    try {
      await api.deletePost(working.path, working.sha);
      if (working.draftKey) await api.deleteDraft(working.draftKey).catch(() => undefined);
      window.localStorage.removeItem(`astro-studio:${working.path}`);
      setWorking(null);
      setFields(null);
      setBody("");
      showToast("文章已从 GitHub 删除", "success");
      await loadPostsAndDrafts(true);
    } catch (error) {
      showToast(errorMessage(error), "error");
    }
  }

  function changeMode(nextMode: EditorMode) {
    if (nextMode === "rich" && richModeBlocked) {
      showToast("这篇文章包含脚本或嵌入标签，请使用源码模式编辑以避免内容丢失", "info");
      return;
    }
    if (mode === "rich") {
      const latest = editorRef.current?.getMarkdown();
      if (latest !== undefined && latest !== body) updateBody(latest);
    }
    if (nextMode === "rich") setEditorEpoch((value) => value + 1);
    setMode(nextMode);
  }

  const uploadImage = useCallback(async (file: File) => {
    setSyncState("saving");
    setSyncLabel("正在上传图片");
    try {
      const result = await api.uploadImage(file);
      setSyncState("saved");
      setSyncLabel("图片已写入静态目录");
      showToast("图片已上传到 public/image/editor", "success");
      return result.url;
    } catch (error) {
      setSyncState("error");
      setSyncLabel(errorMessage(error));
      showToast(errorMessage(error), "error");
      if (error instanceof ApiError && error.code === "GITHUB_NOT_CONNECTED") {
        setSettingsOpen(true);
      }
      throw error;
    }
  }, []);

  async function handleSourcePaste(event: ClipboardEvent<HTMLTextAreaElement>) {
    const images = Array.from(event.clipboardData.files).filter((file) =>
      file.type.startsWith("image/"),
    );
    if (images.length === 0) return;
    event.preventDefault();
    const start = event.currentTarget.selectionStart;
    const end = event.currentTarget.selectionEnd;
    try {
      const snippets = await Promise.all(
        images.map(async (file) => `![${file.name || "image"}](${await uploadImage(file)})`),
      );
      updateBody(`${body.slice(0, start)}${snippets.join("\n\n")}${body.slice(end)}`);
    } catch {
      // uploadImage already reports the actionable error.
    }
  }

  async function logout() {
    await api.logout().catch(() => undefined);
    setSession(null);
    setWorking(null);
  }

  const filteredPosts = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase();
    return posts.filter((post) => {
      if (filter === "published" && post.draft) return false;
      if (filter === "draft" && !post.draft) return false;
      if (filter === "pinned" && !post.pinned) return false;
      if (!normalized) return true;
      return [post.title, post.category, post.tags.join(" "), post.path]
        .join(" ")
        .toLocaleLowerCase()
        .includes(normalized);
    });
  }, [filter, posts, query]);

  const orphanDrafts = drafts.filter(
    (draft) => draft.isNew && !posts.some((post) => post.path === draft.path),
  );

  const previewHtml = useMemo(() => {
    const rendered = marked.parse(body) as string;
    return DOMPurify.sanitize(rendered, {
      ADD_ATTR: ["target", "rel", "class", "id"],
    });
  }, [body]);

  if (booting) {
    return (
      <div className="boot-screen">
        <LoaderCircle className="spin" size={24} />
      </div>
    );
  }

  if (!session) {
    return <Login onAuthenticated={(value) => { setSession(value); void loadPostsAndDrafts(); }} />;
  }

  return (
    <div className="studio-shell">
      <header className="topbar">
        <div className="topbar-brand">
          <button
            className="icon-button mobile-only"
            onClick={() => setSidebarOpen((value) => !value)}
            title="文章列表"
          >
            <Menu size={19} />
          </button>
          <div className="brand-mark">A</div>
          <div className="brand-copy">
            <strong>Astro Studio</strong>
            <span>{session.github.repository}</span>
          </div>
        </div>

        <div className={`sync-state ${syncState}`} aria-live="polite">
          {syncState === "saving" ? <LoaderCircle className="spin" size={15} /> : null}
          {syncState === "saved" ? <Check size={15} /> : null}
          {syncState === "error" ? <AlertCircle size={15} /> : null}
          {syncState === "idle" ? <Cloud size={15} /> : null}
          <span>{syncLabel}</span>
        </div>

        <div className="topbar-actions">
          <button
            className={`connection-pill ${session.github.connected ? "connected" : ""}`}
            onClick={() => setSettingsOpen(true)}
          >
            <FolderGit2 size={15} />
            <span>{session.github.connected ? session.github.login || "GitHub 已连接" : "连接 GitHub"}</span>
          </button>
          <button className="icon-button" onClick={() => setSettingsOpen(true)} title="设置">
            <Settings size={18} />
          </button>
          <button className="icon-button" onClick={() => void logout()} title="退出登录">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <div className="workspace">
        <aside className={`post-sidebar ${sidebarOpen ? "open" : ""}`}>
          <div className="sidebar-head">
            <div>
              <h2>文章</h2>
              <span>{posts.length} 篇</span>
            </div>
            <button className="primary-icon-button" onClick={createPost} title="新建文章">
              <FilePlus2 size={18} />
            </button>
          </div>

          <div className="search-control">
            <Search size={16} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="搜索标题、标签或分类"
            />
            {query ? (
              <button onClick={() => setQuery("")} title="清空搜索">
                <X size={14} />
              </button>
            ) : null}
          </div>

          <div className="filter-tabs" role="tablist" aria-label="文章筛选">
            {(
              [
                ["all", "全部"],
                ["published", "已发布"],
                ["draft", "草稿"],
                ["pinned", "置顶"],
              ] as Array<[ListFilter, string]>
            ).map(([value, label]) => (
              <button
                key={value}
                className={filter === value ? "active" : ""}
                onClick={() => setFilter(value)}
                role="tab"
                aria-selected={filter === value}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="post-list">
            {orphanDrafts.length ? (
              <div className="draft-section">
                <div className="list-section-label">未发布草稿</div>
                {orphanDrafts.map((draft) => (
                  <button
                    className={`post-row ${working?.draftKey === draft.key ? "selected" : ""}`}
                    key={draft.key}
                    onClick={() => void openDraft(draft)}
                  >
                    <span className="post-row-title">{draft.title || "未命名文章"}</span>
                    <span className="post-row-meta">云端草稿 · {formatDate(draft.updatedAt)}</span>
                  </button>
                ))}
              </div>
            ) : null}

            {loadingPosts && posts.length === 0 ? (
              <div className="list-empty"><LoaderCircle className="spin" size={20} /></div>
            ) : null}
            {!loadingPosts && filteredPosts.length === 0 && orphanDrafts.length === 0 ? (
              <div className="list-empty">没有匹配的文章</div>
            ) : null}
            {filteredPosts.map((post) => (
              <button
                className={`post-row ${working?.path === post.path ? "selected" : ""}`}
                key={post.path}
                onClick={() => void openPost(post)}
              >
                <span className="post-row-title">
                  {post.pinned ? <Pin size={13} fill="currentColor" /> : null}
                  <span>{post.title}</span>
                </span>
                <span className="post-row-meta">
                  <span className={post.draft ? "draft-dot" : "published-dot"} />
                  {post.draft ? "草稿" : formatDate(post.published)}
                  {post.category ? ` · ${post.category}` : ""}
                </span>
              </button>
            ))}
          </div>

          <div className="sidebar-footer">
            <button onClick={() => void loadPostsAndDrafts(true)} disabled={loadingPosts}>
              <RefreshCw className={loadingPosts ? "spin" : ""} size={15} />
              刷新仓库
            </button>
            <span><GitBranch size={13} /> {session.github.branch}</span>
          </div>
        </aside>

        {sidebarOpen ? <button className="sidebar-scrim" onClick={() => setSidebarOpen(false)} /> : null}

        <main className={`editor-workspace mode-${mode}`}>
          {!working || !fields ? (
            <EmptyEditor onCreate={createPost} />
          ) : (
            <>
              <section className="compose-pane">
                <div className="document-head">
                  <div className="document-title-row">
                    <textarea
                      className="title-input"
                      value={fields.title}
                      onChange={(event) => setField("title", event.target.value)}
                      placeholder="请输入文章标题"
                      rows={1}
                    />
                    <div className="document-actions">
                      {!working.isNew ? (
                        <button className="icon-button danger" onClick={() => void removePost()} title="删除文章">
                          <Trash2 size={17} />
                        </button>
                      ) : null}
                      <button
                        className="publish-button"
                        onClick={() => void publishPost()}
                        disabled={publishing}
                      >
                        {publishing ? <LoaderCircle className="spin" size={17} /> : <Save size={17} />}
                        {fields.draft ? "保存到 GitHub" : "发布文章"}
                      </button>
                    </div>
                  </div>

                  <div className="metadata-grid">
                    <label>
                      <span>发布日期</span>
                      <input
                        type="date"
                        value={fields.published}
                        onChange={(event) => setField("published", event.target.value)}
                      />
                    </label>
                    <label>
                      <span>分类</span>
                      <input
                        value={fields.category}
                        onChange={(event) => setField("category", event.target.value)}
                        placeholder="未分类"
                      />
                    </label>
                    <label className="tags-field">
                      <span>标签</span>
                      <input
                        value={tagsText}
                        onChange={(event) => {
                          const value = event.target.value;
                          setTagsText(value);
                          setFields((current) => current ? { ...current, tags: parseTags(value) } : current);
                          markChanged();
                        }}
                        placeholder="使用逗号分隔"
                      />
                    </label>
                    <div className="compact-toggles">
                      <Toggle
                        checked={!fields.draft}
                        label="发布"
                        onChange={(checked) => setField("draft", !checked)}
                      />
                      <Toggle
                        checked={fields.pinned}
                        label="置顶"
                        accent="pin"
                        onChange={(checked) => setField("pinned", checked)}
                      />
                    </div>
                  </div>

                  <div className="editor-controls">
                    <div className="mode-switch" role="tablist" aria-label="编辑模式">
                      <button className={mode === "rich" ? "active" : ""} onClick={() => changeMode("rich")} title={richModeBlocked ? "复杂 HTML 仅支持源码模式" : "富文本编辑"}>
                        <PencilLine size={15} /> 富文本
                      </button>
                      <button className={mode === "source" ? "active" : ""} onClick={() => changeMode("source")}>
                        <Code2 size={15} /> 源码
                      </button>
                      <button className={mode === "preview" ? "active" : ""} onClick={() => changeMode("preview")}>
                        <Eye size={15} /> 预览
                      </button>
                    </div>
                    <button
                      className={`advanced-button ${advancedOpen ? "active" : ""}`}
                      onClick={() => setAdvancedOpen((value) => !value)}
                    >
                      <SlidersHorizontal size={15} /> 更多字段
                    </button>
                  </div>

                  {advancedOpen ? (
                    <AdvancedFields fields={fields} setField={setField} />
                  ) : null}
                </div>

                <div className="editor-surface">
                  {mode === "rich" ? (
                    <MdxEditorSlot
                      key={`${working.path}:${editorEpoch}`}
                      ref={editorRef}
                      initialValue={body}
                      onChange={updateBody}
                      onUploadImage={uploadImage}
                    />
                  ) : null}
                  {mode === "source" ? (
                    <textarea
                      className="source-editor"
                      value={body}
                      onChange={(event) => updateBody(event.target.value)}
                      onPaste={(event) => void handleSourcePaste(event)}
                      spellCheck={false}
                    />
                  ) : null}
                  {mode === "preview" ? (
                    <ArticlePreview fields={fields} html={previewHtml} />
                  ) : null}
                </div>
              </section>

              <aside className="preview-pane">
                <div className="preview-pane-head">
                  <span><PanelRightOpen size={15} /> 实时预览</span>
                  <span>{countWords(body)} 字</span>
                </div>
                <ArticlePreview fields={fields} html={previewHtml} compact />
              </aside>
            </>
          )}
        </main>
      </div>

      {settingsOpen ? (
        <SettingsDialog
          session={session}
          onClose={() => setSettingsOpen(false)}
          onSessionChange={setSession}
          showToast={showToast}
        />
      ) : null}

      {toast ? (
        <div className={`toast ${toast.tone}`} role="status">
          {toast.tone === "success" ? <Check size={17} /> : <AlertCircle size={17} />}
          {toast.text}
        </div>
      ) : null}
    </div>
  );
}

function Login({ onAuthenticated }: { onAuthenticated: (session: SessionInfo) => void }) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      onAuthenticated(await api.login(password));
    } catch (reason) {
      setError(errorMessage(reason));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-screen">
      <form className="login-panel" onSubmit={(event) => void submit(event)}>
        <div className="login-brand"><span>A</span></div>
        <h1>Astro Studio</h1>
        <label>
          <span>访问密码</span>
          <div className="password-control">
            <KeyRound size={17} />
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              autoFocus
            />
          </div>
        </label>
        {error ? <div className="form-error"><AlertCircle size={15} /> {error}</div> : null}
        <button className="login-button" disabled={loading || !password}>
          {loading ? <LoaderCircle className="spin" size={18} /> : null}
          登录
        </button>
      </form>
    </main>
  );
}

function EmptyEditor({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="empty-editor">
      <div className="empty-mark"><PencilLine size={26} /></div>
      <h2>选择一篇文章开始编辑</h2>
      <button onClick={onCreate}><FilePlus2 size={17} /> 新建文章</button>
    </div>
  );
}

function Toggle({
  checked,
  label,
  onChange,
  accent,
}: {
  checked: boolean;
  label: string;
  onChange: (checked: boolean) => void;
  accent?: "pin";
}) {
  return (
    <label className={`toggle-control ${accent === "pin" ? "pin-toggle" : ""}`}>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span className="toggle-track"><span /></span>
      {accent === "pin" ? <Pin size={13} /> : null}
      <span>{label}</span>
    </label>
  );
}

function AdvancedFields({
  fields,
  setField,
}: {
  fields: FrontmatterFields;
  setField: <K extends keyof FrontmatterFields>(key: K, value: FrontmatterFields[K]) => void;
}) {
  return (
    <div className="advanced-fields">
      <label className="wide-field">
        <span>摘要</span>
        <textarea
          value={fields.description}
          onChange={(event) => setField("description", event.target.value)}
          rows={2}
          maxLength={320}
        />
      </label>
      <label className="wide-field">
        <span>封面路径</span>
        <div className="input-with-icon"><ImagePlus size={15} /><input value={fields.image} onChange={(event) => setField("image", event.target.value)} placeholder="/image/cover.webp" /></div>
      </label>
      <label>
        <span>更新日期</span>
        <input type="date" value={fields.updated || ""} onChange={(event) => setField("updated", event.target.value || undefined)} />
      </label>
      <label>
        <span>语言</span>
        <select value={fields.lang} onChange={(event) => setField("lang", event.target.value)}>
          <option value="zh-CN">简体中文</option>
          <option value="zh-TW">繁体中文</option>
          <option value="en">English</option>
          <option value="ja">日本語</option>
        </select>
      </label>
      <label>
        <span>置顶顺序</span>
        <input
          type="number"
          min="0"
          disabled={!fields.pinned}
          value={fields.priority ?? ""}
          onChange={(event) => setField("priority", event.target.value ? Number(event.target.value) : undefined)}
          placeholder="数字越小越靠前"
        />
      </label>
      <label>
        <span>固定链接</span>
        <input value={fields.permalink || ""} onChange={(event) => setField("permalink", event.target.value || undefined)} />
      </label>
      <div className="advanced-toggles wide-field">
        <Toggle checked={fields.comment} label="允许评论" onChange={(checked) => setField("comment", checked)} />
        <Toggle checked={fields.encrypted} label="文章加密" onChange={(checked) => setField("encrypted", checked)} />
      </div>
      {fields.encrypted ? (
        <>
          <label>
            <span>文章密码</span>
            <input type="password" value={fields.password || ""} onChange={(event) => setField("password", event.target.value)} />
          </label>
          <label>
            <span>密码提示</span>
            <input value={fields.passwordHint || ""} onChange={(event) => setField("passwordHint", event.target.value)} />
          </label>
        </>
      ) : null}
    </div>
  );
}

function ArticlePreview({
  fields,
  html,
  compact,
}: {
  fields: FrontmatterFields;
  html: string;
  compact?: boolean;
}) {
  return (
    <article className={`article-preview ${compact ? "compact" : ""}`}>
      <header>
        {fields.pinned ? <span className="preview-pin"><Pin size={12} fill="currentColor" /> 置顶</span> : null}
        <h1>{fields.title || "未命名文章"}</h1>
        <div className="preview-meta">
          <span>{formatDate(fields.published)}</span>
          {fields.category ? <span>{fields.category}</span> : null}
          {fields.tags.map((tag) => <span key={tag}>#{tag}</span>)}
        </div>
        {fields.description ? <p className="preview-description">{fields.description}</p> : null}
      </header>
      <div className="preview-content" dangerouslySetInnerHTML={{ __html: html }} />
    </article>
  );
}

function SettingsDialog({
  session,
  onClose,
  onSessionChange,
  showToast,
}: {
  session: SessionInfo;
  onClose: () => void;
  onSessionChange: (session: SessionInfo) => void;
  showToast: (message: string, tone?: ToastMessage["tone"]) => void;
}) {
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState<"github" | "password" | "disconnect" | null>(null);

  async function connect(event: FormEvent) {
    event.preventDefault();
    setBusy("github");
    try {
      const github = await api.connectGitHub(token);
      onSessionChange({ ...session, github });
      setToken("");
      showToast("GitHub 已连接", "success");
    } catch (error) {
      showToast(errorMessage(error), "error");
    } finally {
      setBusy(null);
    }
  }

  async function disconnect() {
    setBusy("disconnect");
    try {
      await api.disconnectGitHub();
      onSessionChange({ ...session, github: { ...session.github, connected: false, login: undefined } });
      showToast("GitHub 授权已移除", "success");
    } catch (error) {
      showToast(errorMessage(error), "error");
    } finally {
      setBusy(null);
    }
  }

  async function changePassword(event: FormEvent) {
    event.preventDefault();
    setBusy("password");
    try {
      await api.changePassword(password);
      setPassword("");
      showToast("访问密码已更新", "success");
    } catch (error) {
      showToast(errorMessage(error), "error");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="settings-dialog" role="dialog" aria-modal="true" aria-labelledby="settings-title">
        <header>
          <div>
            <h2 id="settings-title">设置</h2>
            <span>{session.github.repository} · {session.github.branch}</span>
          </div>
          <button className="icon-button" onClick={onClose} title="关闭"><X size={18} /></button>
        </header>

        <div className="settings-section">
          <div className="settings-section-title">
            <FolderGit2 size={18} />
            <div><strong>GitHub</strong><span>{session.github.connected ? `已连接 ${session.github.login || ""}` : "尚未连接"}</span></div>
          </div>
          {session.github.connected ? (
            <button className="secondary-button danger-text" onClick={() => void disconnect()} disabled={Boolean(busy)}>
              {busy === "disconnect" ? <LoaderCircle className="spin" size={16} /> : null} 移除授权
            </button>
          ) : (
            <form onSubmit={(event) => void connect(event)}>
              <label>
                <span>Fine-grained personal access token</span>
                <input type="password" value={token} onChange={(event) => setToken(event.target.value)} autoComplete="off" />
              </label>
              <div className="form-actions split">
                <a href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noreferrer">
                  创建令牌 <ExternalLink size={13} />
                </a>
                <button className="secondary-button" disabled={busy === "github" || !token}>
                  {busy === "github" ? <LoaderCircle className="spin" size={16} /> : null} 连接
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="settings-section">
          <div className="settings-section-title">
            <KeyRound size={18} />
            <div><strong>访问密码</strong><span>更新后默认密码将立即失效</span></div>
          </div>
          <form onSubmit={(event) => void changePassword(event)}>
            <label>
              <span>新密码</span>
              <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} autoComplete="new-password" />
            </label>
            <div className="form-actions">
              <button className="secondary-button" disabled={busy === "password" || password.length < 8}>
                {busy === "password" ? <LoaderCircle className="spin" size={16} /> : null} 更新密码
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}

function parseTags(value: string): string[] {
  return [...new Set(value.split(/[,，\n]/).map((tag) => tag.trim()).filter(Boolean))];
}

function formatDate(value: string): string {
  if (!value) return "未设置日期";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("zh-CN", { year: "numeric", month: "short", day: "numeric" }).format(date);
}

function formatTime(value: string): string {
  const date = new Date(value);
  return new Intl.DateTimeFormat("zh-CN", { hour: "2-digit", minute: "2-digit" }).format(date);
}

function countWords(value: string): number {
  return value.replace(/[`#>*_\-[\]()!]/g, "").replace(/\s+/g, "").length;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "操作失败，请稍后再试";
}

function readLocalDraft(path: string): DraftDocument | null {
  try {
    const value = window.localStorage.getItem(`astro-studio:${path}`);
    return value ? (JSON.parse(value) as DraftDocument) : null;
  } catch {
    return null;
  }
}

function pickNewestDraft(
  remote: DraftDocument | null,
  local: DraftDocument | null,
): DraftDocument | null {
  if (!remote) return local;
  if (!local) return remote;
  return local.updatedAt > remote.updatedAt ? local : remote;
}

createRoot(document.getElementById("app")!).render(<App />);
