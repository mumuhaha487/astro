import DOMPurify from "dompurify";
import {
  AlertCircle,
  Bell,
  BookOpenText,
  Check,
  ChevronDown,
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
  ListTree,
  LoaderCircle,
  MessageSquareText,
  PencilLine,
  Pin,
  RefreshCw,
  Save,
  Search,
  Settings,
  Sparkles,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import { marked } from "marked";
import {
  type ClipboardEvent,
  type FormEvent,
  type ReactNode,
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
  PostRevision,
  SessionInfo,
} from "../shared/types";
import "./styles.css";

type EditorMode = "rich" | "source" | "preview";
type ListFilter = "all" | "published" | "draft" | "pinned";
type SyncState = "idle" | "saving" | "saved" | "error";
type MobilePanel = "outline" | "assistant" | null;

interface OutlineItem {
  depth: number;
  text: string;
  line: number;
}

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
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [outlineVisible, setOutlineVisible] = useState(true);
  const [wideEditor, setWideEditor] = useState(false);
  const [mobilePanel, setMobilePanel] = useState<MobilePanel>(null);
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

  const outlineItems = useMemo(() => extractOutline(body), [body]);

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

  async function saveDraftNow() {
    if (!working || !fields) return;
    setSyncState("saving");
    setSyncLabel("正在保存草稿");
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
      setWorking((current) => current ? { ...current, draftKey: saved.key } : current);
      setDraftSyncedRevision(revision);
      setSyncState("saved");
      setSyncLabel(`草稿已保存 ${formatTime(saved.updatedAt)}`);
      setDrafts((current) => [saved, ...current.filter((draft) => draft.key !== saved.key)]);
      showToast("草稿已保存到云端", "success");
    } catch (error) {
      setSyncState("error");
      setSyncLabel(errorMessage(error));
      showToast(errorMessage(error), "error");
    }
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

  function replaceEditorBody(markdown: string) {
    editorRef.current?.setMarkdown(markdown);
    updateBody(markdown);
  }

  function togglePostSidebar() {
    setAdvancedOpen(false);
    setMobilePanel(null);
    setSidebarOpen((value) => !value);
  }

  function openPostSidebar() {
    setAdvancedOpen(false);
    setMobilePanel(null);
    setHistoryOpen(false);
    setSidebarOpen(true);
  }

  function openHistory() {
    setSidebarOpen(false);
    setAdvancedOpen(false);
    setMobilePanel(null);
    setHistoryOpen(true);
  }

  function toggleOutlinePanel() {
    if (window.matchMedia("(max-width: 900px)").matches) {
      setAdvancedOpen(false);
      setMobilePanel((current) => current === "outline" ? null : "outline");
      return;
    }
    setOutlineVisible((value) => !value);
  }

  function openMobilePanel(panel: Exclude<MobilePanel, null>) {
    setSidebarOpen(false);
    setAdvancedOpen(false);
    setMobilePanel((current) => current === panel ? null : panel);
  }

  function toggleAdvancedFields() {
    setSidebarOpen(false);
    setMobilePanel(null);
    setAdvancedOpen((value) => !value);
  }

  function jumpToOutline(item: OutlineItem, index: number) {
    if (mode === "source") {
      const source = document.querySelector<HTMLTextAreaElement>(".source-editor");
      if (source) {
        const lines = body.split(/\r?\n/);
        const position = lines.slice(0, item.line).reduce((total, line) => total + line.length + 1, 0);
        source.focus();
        source.setSelectionRange(position, position);
        source.scrollTop = Math.max(0, item.line * 24 - source.clientHeight / 3);
      }
    } else {
      const rootSelector = mode === "preview" ? ".preview-content" : ".studio-rich-content";
      const heading = document.querySelectorAll<HTMLElement>(`${rootSelector} h1, ${rootSelector} h2, ${rootSelector} h3, ${rootSelector} h4, ${rootSelector} h5, ${rootSelector} h6`)[index];
      heading?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    setMobilePanel(null);
  }

  function generateOutline() {
    if (outlineItems.length) {
      if (window.matchMedia("(max-width: 900px)").matches) setMobilePanel("outline");
      else setOutlineVisible(true);
      showToast(`已识别 ${outlineItems.length} 个标题`, "success");
      return;
    }
    replaceEditorBody(`${body}${body ? "\n\n" : ""}## 背景\n\n## 实现过程\n\n## 总结\n`);
    showToast("已生成文章大纲", "success");
  }

  function generateCodeBlock() {
    replaceEditorBody(`${body}${body ? "\n\n" : ""}\`\`\`typescript\n// 在这里编写代码\n\`\`\`\n`);
    showToast("已插入代码块", "success");
  }

  function generateSummary() {
    const summary = plainText(body).slice(0, 256);
    setField("description", summary);
    setMobilePanel(null);
    setAdvancedOpen(true);
    showToast(summary ? "摘要已生成" : "正文中还没有内容", summary ? "success" : "info");
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
    setMobilePanel(null);
    setHistoryOpen(false);
  }

  function restoreHistoryVersion(content: string) {
    const parsed = parseDocument(content);
    setFields(parsed.fields);
    setBody(parsed.body);
    setTagsText(parsed.fields.tags.join(", "));
    const blocked = hasUnsafeRichContent(parsed.body);
    setMode(blocked ? "source" : "rich");
    setEditorEpoch((value) => value + 1);
    markChanged();
    setHistoryOpen(false);
    showToast("历史版本已恢复到当前草稿，发布前不会覆盖 GitHub", "success");
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

  async function publishPost(draftOverride?: boolean) {
    if (!working || !fields) return;
    const current = currentFields();
    const normalizedFields = current && draftOverride !== undefined
      ? { ...current, draft: draftOverride }
      : current;
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

  async function schedulePost(publishAt: string) {
    if (!working || !fields) return;
    const current = currentFields();
    if (!current?.title.trim()) {
      showToast("请填写文章标题", "error");
      return;
    }
    const path = working.isNew ? makePostPath(current.title) : working.path;
    const scheduledFields = { ...current, draft: false, scheduledAt: publishAt };
    setPublishing(true);
    setSyncState("saving");
    setSyncLabel("正在设置定时发布");
    try {
      await api.schedulePost({
        path,
        sha: working.isNew ? "" : working.sha,
        title: current.title,
        publishAt,
        content: serializeDocument(scheduledFields, body),
      });
      setScheduleOpen(false);
      setSyncState("saved");
      setSyncLabel(`定时发布 ${formatDateTime(publishAt)}`);
      showToast(`已安排在 ${formatDateTime(publishAt)} 发布`, "success");
    } catch (error) {
      setSyncState("error");
      setSyncLabel(errorMessage(error));
      showToast(errorMessage(error), "error");
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
            className="editor-back-button"
            onClick={togglePostSidebar}
            title="文章列表"
          >
            <ChevronLeft size={21} />
          </button>
          <div className="astro-wordmark"><span>AS</span><strong>tro</strong></div>
          <button className="editor-title-button" onClick={openPostSidebar}>
            发布文章 <ChevronDown size={15} fill="currentColor" />
          </button>
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
            <span>{session.github.connected ? "GitHub 同步" : "连接 GitHub"}</span>
            <ChevronDown size={13} />
          </button>
          <button className="icon-button topbar-notification" title="同步消息"><Bell size={18} /></button>
          <span className="topbar-separator" />
          <button
            className={`icon-button mobile-writing-tools-button ${mobilePanel ? "active" : ""}`}
            onClick={() => openMobilePanel("assistant")}
            title="目录与AI助手"
          >
            <Sparkles size={18} />
          </button>
          <button className="icon-button" onClick={() => setSettingsOpen(true)} title="设置">
            <Settings size={18} />
          </button>
          <button className="user-menu-button" onClick={() => void logout()} title="退出登录">
            <UserRound size={17} />
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

        <main className={`editor-workspace mode-${mode} ${wideEditor ? "wide-editor" : ""} ${outlineVisible ? "outline-visible" : "outline-hidden"}`}>
          {!working || !fields ? (
            <EmptyEditor onCreate={createPost} />
          ) : (
            <>
              <aside className="outline-pane">
                <div className="outline-pane-head">
                  <span>目录</span>
                  <button onClick={() => setOutlineVisible(false)} title="收起目录"><ChevronLeft size={20} /></button>
                </div>
                {outlineItems.length ? (
                  <nav className="outline-list" aria-label="文章目录">
                    {outlineItems.map((item, index) => (
                      <button key={`${item.text}-${index}`} style={{ paddingLeft: `${16 + (item.depth - 1) * 14}px` }} onClick={() => jumpToOutline(item, index)}>
                        {item.text}
                      </button>
                    ))}
                  </nav>
                ) : (
                  <p className="outline-empty">为文内增加标题，这里将生成目录</p>
                )}
              </aside>

              <section className="compose-pane">
                <div className="document-scroll">
                  <div className="draft-resume-banner">
                    <span className="draft-badge">{working.isNew ? "草稿" : fields.draft ? "草稿" : "已发布"}</span>
                    <span className="draft-resume-title">{fields.title || "未命名文章"}</span>
                    <span className="draft-resume-action">{syncLabel}</span>
                    <button onClick={openPostSidebar}>更多文章</button>
                    <button className="draft-banner-close" onClick={() => setWorking(null)} title="关闭文章"><X size={15} /></button>
                  </div>

                  <div className="editor-paper">
                    <div className="document-head">
                      <div className="document-title-row">
                        <textarea
                          className="title-input"
                          value={fields.title}
                          onChange={(event) => setField("title", event.target.value)}
                          placeholder="请输入文章标题（5～100个字）"
                          maxLength={100}
                          rows={1}
                        />
                        <div className="title-side-tools">
                          <Sparkles size={17} />
                          <span>{fields.title.length < 5 ? `还需输入${5 - fields.title.length}个字` : `${fields.title.length}/100`}</span>
                        </div>
                      </div>
                    </div>

                    {mode !== "rich" ? (
                      <div className="alternate-mode-toolbar">
                        <button onClick={() => changeMode("rich")} disabled={richModeBlocked}><PencilLine size={16} /> 富文本</button>
                        <button className={mode === "source" ? "active" : ""} onClick={() => changeMode("source")}><Code2 size={16} /> 源码</button>
                        <button className={mode === "preview" ? "active" : ""} onClick={() => changeMode("preview")}><Eye size={16} /> 预览</button>
                      </div>
                    ) : null}

                    <div className="editor-surface">
                      {mode === "rich" ? (
                        <MdxEditorSlot
                          key={`${working.path}:${editorEpoch}`}
                          ref={editorRef}
                          initialValue={body}
                          onChange={updateBody}
                          onUploadImage={uploadImage}
                          onHistory={openHistory}
                          onSourceMode={() => changeMode("source")}
                          onToggleOutline={toggleOutlinePanel}
                          onToggleWide={() => setWideEditor((value) => !value)}
                          outlineVisible={outlineVisible}
                          wide={wideEditor}
                        />
                      ) : null}
                      {mode === "source" ? (
                        <textarea
                          className="source-editor"
                          value={body}
                          onChange={(event) => updateBody(event.target.value)}
                          onPaste={(event) => void handleSourcePaste(event)}
                          spellCheck={false}
                          placeholder="使用 Markdown 编写文章正文"
                        />
                      ) : null}
                      {mode === "preview" ? (
                        <ArticlePreview fields={fields} html={previewHtml} />
                      ) : null}
                    </div>
                  </div>

                  {advancedOpen ? (
                    <AdvancedFields
                      fields={fields}
                      setField={setField}
                      tagsText={tagsText}
                      onTagsChange={(value) => {
                        setTagsText(value);
                        setFields((current) => current ? { ...current, tags: parseTags(value) } : current);
                        markChanged();
                      }}
                      onUploadImage={uploadImage}
                      onExtractSummary={() => {
                        const summary = plainText(body).slice(0, 256);
                        setField("description", summary);
                        showToast(summary ? "已从正文提取摘要" : "正文中还没有可提取的内容", summary ? "success" : "info");
                      }}
                      onClose={() => setAdvancedOpen(false)}
                    />
                  ) : null}
                </div>
              </section>

              <aside className="assistant-pane">
                <div className="assistant-card">
                  <div className="assistant-title"><Sparkles size={22} /><strong>AI助手</strong><ChevronDown size={14} /></div>
                  <AssistantActions onOutline={generateOutline} onCode={generateCodeBlock} onSummary={generateSummary} />
                </div>
              </aside>
            </>
          )}
        </main>
      </div>

      {working && fields && mobilePanel ? (
        <>
          <button className="mobile-utility-scrim" onClick={() => setMobilePanel(null)} aria-label="关闭写作工具" />
          <aside className="mobile-utility-drawer" aria-label="移动端写作工具">
            <header>
              <div className="mobile-utility-tabs" role="tablist" aria-label="写作工具">
                <button className={mobilePanel === "outline" ? "active" : ""} onClick={() => setMobilePanel("outline")} role="tab" aria-selected={mobilePanel === "outline"}><ListTree size={17} /> 目录</button>
                <button className={mobilePanel === "assistant" ? "active" : ""} onClick={() => setMobilePanel("assistant")} role="tab" aria-selected={mobilePanel === "assistant"}><Sparkles size={17} /> AI助手</button>
              </div>
              <button className="mobile-utility-close" onClick={() => setMobilePanel(null)} title="关闭"><X size={19} /></button>
            </header>
            {mobilePanel === "outline" ? (
              outlineItems.length ? (
                <nav className="mobile-outline-list" aria-label="移动端文章目录">
                  {outlineItems.map((item, index) => (
                    <button key={`${item.text}-${index}`} style={{ paddingLeft: `${16 + (item.depth - 1) * 14}px` }} onClick={() => jumpToOutline(item, index)}>{item.text}</button>
                  ))}
                </nav>
              ) : <p className="mobile-panel-empty">为正文添加标题后，将在这里自动生成目录</p>
            ) : (
              <div className="mobile-assistant-actions">
                <AssistantActions onOutline={generateOutline} onCode={generateCodeBlock} onSummary={generateSummary} />
              </div>
            )}
          </aside>
        </>
      ) : null}

      {working && fields ? (
        <footer className="publish-bar">
          <div className="publish-bar-meta">
            <span>共 {countWords(body)} 字</span>
            <button className={advancedOpen ? "active" : ""} onClick={toggleAdvancedFields}>
              发文设置 <ChevronDown size={14} />
            </button>
          </div>
          <div className={`publish-sync ${syncState}`}>
            {syncState === "saving" ? <LoaderCircle className="spin" size={16} /> : syncState === "saved" ? <Check size={16} /> : <Cloud size={16} />}
            <span>{syncLabel}</span>
          </div>
          <div className="publish-bar-actions">
            {!working.isNew ? (
              <button className="bottom-delete-button" onClick={() => void removePost()} title="删除文章"><Trash2 size={17} /></button>
            ) : null}
            <button className="draft-save-button" onClick={() => void saveDraftNow()} disabled={publishing}>
              <Save size={16} /> 保存草稿 <ChevronDown size={14} />
            </button>
            <button className="schedule-button" onClick={() => setScheduleOpen(true)} disabled={publishing}>定时发布 <ChevronLeft size={15} className="arrow-right" /></button>
            <button className="csdn-publish-button" onClick={() => void publishPost(false)} disabled={publishing}>
              {publishing ? <LoaderCircle className="spin" size={17} /> : null} 发布博客
            </button>
          </div>
        </footer>
      ) : null}

      {settingsOpen ? (
        <SettingsDialog
          session={session}
          onClose={() => setSettingsOpen(false)}
          onSessionChange={setSession}
          showToast={showToast}
        />
      ) : null}

      {scheduleOpen && working && fields ? (
        <ScheduleDialog
          publishing={publishing}
          onClose={() => setScheduleOpen(false)}
          onSchedule={(value) => void schedulePost(value)}
        />
      ) : null}

      {historyOpen && working ? (
        <HistoryDialog
          path={working.path}
          isNew={working.isNew}
          onClose={() => setHistoryOpen(false)}
          onRestore={restoreHistoryVersion}
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

function AssistantActions({
  onOutline,
  onCode,
  onSummary,
}: {
  onOutline: () => void;
  onCode: () => void;
  onSummary: () => void;
}) {
  return (
    <>
      <button onClick={onOutline}><BookOpenText size={16} /> 大纲生成</button>
      <button onClick={onCode}><Code2 size={16} /> 代码生成</button>
      <button onClick={onSummary}><MessageSquareText size={16} /> 摘要生成</button>
    </>
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
  tagsText,
  onTagsChange,
  onUploadImage,
  onExtractSummary,
  onClose,
}: {
  fields: FrontmatterFields;
  setField: <K extends keyof FrontmatterFields>(key: K, value: FrontmatterFields[K]) => void;
  tagsText: string;
  onTagsChange: (value: string) => void;
  onUploadImage: (file: File) => Promise<string>;
  onExtractSummary: () => void;
  onClose: () => void;
}) {
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [coverUploading, setCoverUploading] = useState(false);

  async function uploadCover(file: File | undefined) {
    if (!file) return;
    setCoverUploading(true);
    try {
      setField("image", await onUploadImage(file));
    } finally {
      setCoverUploading(false);
      if (coverInputRef.current) coverInputRef.current.value = "";
    }
  }

  return (
    <section className="advanced-fields" aria-label="发文设置">
      <header className="mobile-settings-head">
        <strong>发文设置</strong>
        <button onClick={onClose} title="关闭发文设置"><X size={19} /></button>
      </header>
      <SettingRow label="文章标签" required>
        <div className="setting-input-with-action">
          <input value={tagsText} onChange={(event) => onTagsChange(event.target.value)} placeholder="请输入文章标签，使用逗号分隔" />
          <span>{fields.tags.length}/10</span>
        </div>
      </SettingRow>

      <SettingRow label="添加封面">
        <div className="cover-setting">
          <input
            ref={coverInputRef}
            className="visually-hidden"
            type="file"
            accept="image/png,image/jpeg,image/gif,image/webp,image/avif"
            onChange={(event) => void uploadCover(event.target.files?.[0])}
          />
          <button className="cover-upload-button" onClick={() => coverInputRef.current?.click()} disabled={coverUploading}>
            {coverUploading ? <LoaderCircle className="spin" size={20} /> : <ImagePlus size={22} />}
            <span>{coverUploading ? "正在上传" : "从本地上传"}</span>
          </button>
          <div className="cover-preview-box">
            {fields.image ? <><BookOpenText size={24} /><span>{fields.image}</span></> : <span>暂无内容图片，请在正文中添加图片</span>}
          </div>
        </div>
      </SettingRow>

      <SettingRow label="文章摘要">
        <div className="summary-setting">
          <textarea
            value={fields.description}
            onChange={(event) => setField("description", event.target.value)}
            rows={3}
            maxLength={256}
            placeholder="摘要：会在推荐、列表等场景外露，帮助读者快速了解内容"
          />
          <span>{fields.description.length} / 256</span>
          <button onClick={onExtractSummary}><Sparkles size={15} /> AI提取摘要</button>
        </div>
      </SettingRow>

      <SettingRow label="分类专栏">
        <input value={fields.category} onChange={(event) => setField("category", event.target.value)} placeholder="请选择或输入分类" />
      </SettingRow>

      <SettingRow label="文章类型">
        <RadioGroup
          name="article-type"
          value={(fields.articleType as string) || "original"}
          options={[["original", "原创"], ["repost", "转载"], ["translation", "翻译"]]}
          onChange={(value) => setField("articleType", value)}
        />
      </SettingRow>

      <SettingRow label="创作声明">
        <select value={(fields.creationStatement as string) || "none"} onChange={(event) => setField("creationStatement", event.target.value)}>
          <option value="none">无声明</option>
          <option value="original">本文为原创内容</option>
          <option value="reprint">本文允许规范转载</option>
          <option value="ai-assisted">本文包含 AI 辅助内容</option>
        </select>
      </SettingRow>

      <SettingRow label="文章备份">
        <label className="check-option">
          <input type="checkbox" checked={fields.backup === true} onChange={(event) => setField("backup", event.target.checked)} />
          <span>同时保留云端编辑草稿</span>
        </label>
      </SettingRow>

      <SettingRow label="可见范围">
        <RadioGroup
          name="visibility"
          value={(fields.visibility as string) || "public"}
          options={[["public", "全部可见"], ["private", "仅我可见"], ["followers", "订阅读者可见"], ["password", "密码可见"]]}
          onChange={(value) => setField("visibility", value)}
        />
      </SettingRow>

      <SettingRow label="文章模板">
        <RadioGroup
          name="article-template"
          value={(fields.articleTemplate as string) || "default"}
          options={[["default", "默认模板"], ["compact", "简洁模板"]]}
          onChange={(value) => setField("articleTemplate", value)}
        />
      </SettingRow>

      <SettingRow label="多平台发布">
        <RadioGroup
          name="multi-platform"
          value={fields.multiPlatform === true ? "yes" : "no"}
          options={[["no", "否"], ["yes", "是"]]}
          onChange={(value) => setField("multiPlatform", value === "yes")}
        />
      </SettingRow>

      <SettingRow label="参与活动 /话题">
        <div className="activity-fields">
          <input value={(fields.activity as string) || ""} onChange={(event) => setField("activity", event.target.value)} placeholder="请选择创作活动" />
          <input value={(fields.topic as string) || ""} onChange={(event) => setField("topic", event.target.value)} placeholder="请选择创作话题" />
        </div>
      </SettingRow>

      <div className="astro-settings-divider"><span>博客属性</span></div>

      <SettingRow label="发布日期" required>
        <input type="date" value={fields.published} onChange={(event) => setField("published", event.target.value)} />
      </SettingRow>

      <SettingRow label="发布选项">
        <div className="advanced-toggles">
          <Toggle checked={!fields.draft} label="发布" onChange={(checked) => setField("draft", !checked)} />
          <Toggle checked={fields.pinned} label="置顶" accent="pin" onChange={(checked) => setField("pinned", checked)} />
          <Toggle checked={fields.comment} label="允许评论" onChange={(checked) => setField("comment", checked)} />
          <Toggle checked={fields.encrypted} label="文章加密" onChange={(checked) => setField("encrypted", checked)} />
        </div>
      </SettingRow>

      {fields.pinned ? (
        <SettingRow label="置顶顺序">
          <input type="number" min="0" value={fields.priority ?? ""} onChange={(event) => setField("priority", event.target.value ? Number(event.target.value) : undefined)} placeholder="数字越小越靠前" />
        </SettingRow>
      ) : null}

      <SettingRow label="更多属性">
        <div className="activity-fields three-columns">
          <input type="date" value={fields.updated || ""} onChange={(event) => setField("updated", event.target.value || undefined)} aria-label="更新日期" />
          <select value={fields.lang} onChange={(event) => setField("lang", event.target.value)} aria-label="语言">
            <option value="zh-CN">简体中文</option>
            <option value="zh-TW">繁体中文</option>
            <option value="en">English</option>
            <option value="ja">日本語</option>
          </select>
          <input value={fields.permalink || ""} onChange={(event) => setField("permalink", event.target.value || undefined)} placeholder="固定链接" />
        </div>
      </SettingRow>

      {fields.encrypted ? (
        <SettingRow label="加密设置">
          <div className="activity-fields">
            <input type="password" value={fields.password || ""} onChange={(event) => setField("password", event.target.value)} placeholder="文章密码" />
            <input value={fields.passwordHint || ""} onChange={(event) => setField("passwordHint", event.target.value)} placeholder="密码提示" />
          </div>
        </SettingRow>
      ) : null}
    </section>
  );
}

function SettingRow({ label, required, children }: { label: string; required?: boolean; children: ReactNode }) {
  return (
    <div className="setting-row">
      <div className="setting-label">{label}{required ? <span>*</span> : null}</div>
      <div className="setting-control">{children}</div>
    </div>
  );
}

function RadioGroup({
  name,
  value,
  options,
  onChange,
}: {
  name: string;
  value: string;
  options: Array<[string, string]>;
  onChange: (value: string) => void;
}) {
  return (
    <div className="radio-options" role="radiogroup" aria-label={name}>
      {options.map(([optionValue, label]) => (
        <label key={optionValue}>
          <input type="radio" name={name} checked={value === optionValue} onChange={() => onChange(optionValue)} />
          <span>{label}</span>
        </label>
      ))}
    </div>
  );
}

function ScheduleDialog({
  publishing,
  onClose,
  onSchedule,
}: {
  publishing: boolean;
  onClose: () => void;
  onSchedule: (value: string) => void;
}) {
  const earliest = new Date(Date.now() + 5 * 60 * 1000);
  const defaultValue = new Date(Date.now() + 60 * 60 * 1000);
  const toLocalInput = (date: Date) => new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
  const [value, setValue] = useState(toLocalInput(defaultValue));
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="schedule-dialog" role="dialog" aria-modal="true" aria-labelledby="schedule-title">
        <header><h2 id="schedule-title">定时发布</h2><button className="icon-button" onClick={onClose} title="关闭"><X size={18} /></button></header>
        <label><span>发布时间</span><input type="datetime-local" min={toLocalInput(earliest)} value={value} onChange={(event) => setValue(event.target.value)} /></label>
        <div className="schedule-dialog-actions">
          <button className="secondary-button" onClick={onClose}>取消</button>
          <button className="csdn-publish-button" disabled={publishing || !value} onClick={() => onSchedule(new Date(value).toISOString())}>确认定时发布</button>
        </div>
      </section>
    </div>
  );
}

function HistoryDialog({
  path,
  isNew,
  onClose,
  onRestore,
}: {
  path: string;
  isNew: boolean;
  onClose: () => void;
  onRestore: (content: string) => void;
}) {
  const [revisions, setRevisions] = useState<PostRevision[]>([]);
  const [selectedSha, setSelectedSha] = useState("");
  const [selectedContent, setSelectedContent] = useState("");
  const [loading, setLoading] = useState(!isNew);
  const [loadingContent, setLoadingContent] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isNew) return;
    let active = true;
    void api.history(path)
      .then(({ revisions: nextRevisions }) => {
        if (!active) return;
        setRevisions(nextRevisions);
        if (nextRevisions[0]) setSelectedSha(nextRevisions[0].sha);
      })
      .catch((reason) => {
        if (active) setError(errorMessage(reason));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [isNew, path]);

  useEffect(() => {
    if (!selectedSha) {
      setSelectedContent("");
      return;
    }
    let active = true;
    setLoadingContent(true);
    setError("");
    void api.postRevision(path, selectedSha)
      .then((document) => {
        if (active) setSelectedContent(document.content);
      })
      .catch((reason) => {
        if (active) setError(errorMessage(reason));
      })
      .finally(() => {
        if (active) setLoadingContent(false);
      });
    return () => { active = false; };
  }, [path, selectedSha]);

  const selectedRevision = revisions.find((revision) => revision.sha === selectedSha);
  const preview = selectedContent ? parseDocument(selectedContent) : null;

  function restore() {
    if (!selectedContent) return;
    if (window.confirm("将此历史版本载入当前草稿？当前未发布的编辑内容会被替换。")) {
      onRestore(selectedContent);
    }
  }

  return (
    <div className="modal-backdrop history-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="history-dialog" role="dialog" aria-modal="true" aria-labelledby="history-title">
        <header>
          <div><h2 id="history-title">历史版本</h2><span>{path}</span></div>
          <button className="icon-button" onClick={onClose} title="关闭"><X size={18} /></button>
        </header>

        {isNew ? (
          <div className="history-empty">新文章还没有 GitHub 历史版本</div>
        ) : loading ? (
          <div className="history-loading"><LoaderCircle className="spin" size={20} /> 正在读取 GitHub 历史</div>
        ) : error && revisions.length === 0 ? (
          <div className="history-error"><AlertCircle size={18} /> {error}</div>
        ) : revisions.length === 0 ? (
          <div className="history-empty">GitHub 中没有找到这篇文章的历史版本</div>
        ) : (
          <div className="history-body">
            <div className="history-list" role="listbox" aria-label="文章历史版本">
              {revisions.map((revision) => (
                <button
                  key={revision.sha}
                  className={revision.sha === selectedSha ? "active" : ""}
                  onClick={() => setSelectedSha(revision.sha)}
                  role="option"
                  aria-selected={revision.sha === selectedSha}
                >
                  <strong>{revision.message}</strong>
                  <span>{revision.author} · {formatDateTime(revision.committedAt)}</span>
                  <code>{revision.sha.slice(0, 7)}</code>
                </button>
              ))}
            </div>
            <div className="history-preview">
              <div className="history-preview-head">
                <div>
                  <strong>{preview?.fields.title || selectedRevision?.message || "文章版本"}</strong>
                  <span>{selectedRevision ? formatDateTime(selectedRevision.committedAt) : ""}</span>
                </div>
                {selectedRevision?.htmlUrl ? <a href={selectedRevision.htmlUrl} target="_blank" rel="noreferrer" title="在 GitHub 查看"><ExternalLink size={16} /></a> : null}
              </div>
              {loadingContent ? (
                <div className="history-loading"><LoaderCircle className="spin" size={20} /> 正在读取版本内容</div>
              ) : error ? (
                <div className="history-error"><AlertCircle size={18} /> {error}</div>
              ) : (
                <pre>{preview?.body || "这个版本没有正文内容"}</pre>
              )}
            </div>
          </div>
        )}

        <footer>
          <span>恢复后会先成为当前草稿</span>
          <div>
            <button className="secondary-button" onClick={onClose}>取消</button>
            <button className="csdn-publish-button history-restore-button" onClick={restore} disabled={!selectedContent || loadingContent}>恢复此版本</button>
          </div>
        </footer>
      </section>
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

function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("zh-CN", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function plainText(value: string): string {
  return value
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[`#>*_~|\-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractOutline(value: string): OutlineItem[] {
  return value
    .split(/\r?\n/)
    .map((line, index) => ({ match: line.match(/^(#{1,6})\s+(.+?)\s*#*$/), line: index }))
    .filter((item): item is { match: RegExpMatchArray; line: number } => Boolean(item.match))
    .map(({ match, line }) => ({ depth: match[1].length, text: plainText(match[2]), line }))
    .filter((item) => item.text);
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
