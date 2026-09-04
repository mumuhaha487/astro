import DOMPurify from "dompurify";
import katex from "katex";
import "katex/dist/katex.min.css";
import {
  AlertCircle,
  Bell,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  Clock3,
  Cloud,
  Code2,
  ExternalLink,
  Eye,
  FileArchive,
  FilePlus2,
  FolderGit2,
  GitBranch,
  ImagePlus,
  KeyRound,
  Link2,
  ListTree,
  LoaderCircle,
  Medal,
  MessageSquareText,
  PencilLine,
  Pin,
  Play,
  Plus,
  RefreshCw,
  Redo2,
  Search,
  Settings,
  Sigma,
  Table2,
  Trash2,
  Undo2,
  Upload,
  UserRound,
  Video,
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
import {
  SCHEDULE_MAX_DELAY_MS,
  SCHEDULE_MIN_DELAY_MS,
  validateScheduleTime,
} from "../shared/schedule";
import "./styles.css";

type EditorMode = "rich" | "source" | "preview";
type ListFilter = "all" | "published" | "draft" | "pinned";
type SyncState = "idle" | "saving" | "saved" | "error";
type MobilePanel = "outline" | null;
type RunnableCodeTab = "html" | "css" | "javascript";
type InsertPanel = "image" | "video" | "formula" | "link" | "template" | "resource" | "table" | null;

interface SavedTemplate {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
  previewUrl?: string;
}

interface ResourceRecord {
  path: string;
  url: string;
  name: string;
  size: number;
  description?: string;
  category?: string;
  tags?: string[];
}

interface TableOptions {
  rows: number;
  columns: number;
  header: "none" | "row" | "column" | "both";
  width?: number;
  height?: number;
  spacing: number;
  padding: number;
  border: number;
  align: "" | "left" | "center" | "right";
  title: string;
  summary: string;
}

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

function validateTitle(title: string): string | null {
  const length = title.trim().length;
  if (length === 0) return "请填写文章标题";
  if (length < 5) return "文章标题不能少于 5 个字";
  if (length > 100) return "文章标题不能超过 100 个字";
  return null;
}

function validatePublishingFields(fields: FrontmatterFields): string | null {
  const titleError = validateTitle(fields.title);
  if (titleError) return titleError;
  if (!fields.published) return "请选择发布日期";
  if (fields.tags.length === 0) return "请至少添加 1 个文章标签";
  if (fields.tags.length > 10) return "文章标签不能超过 10 个";
  return null;
}

function localDateValue(date: Date): string {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
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
  const [runnableCodeOpen, setRunnableCodeOpen] = useState(false);
  const [insertPanel, setInsertPanel] = useState<InsertPanel>(null);
  const [linkSelection, setLinkSelection] = useState("");
  const [outlineVisible, setOutlineVisible] = useState(true);
  const [wideEditor, setWideEditor] = useState(false);
  const [mobilePanel, setMobilePanel] = useState<MobilePanel>(null);
  const [deletingKey, setDeletingKey] = useState<string | null>(null);
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
    if (!working || !fields || deletingKey || revision === 0 || revision === draftSyncedRevision) return;
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
  }, [currentContent, deletingKey, draftSyncedRevision, fields, revision, working]);

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

  function openRunnableCode() {
    setSidebarOpen(false);
    setAdvancedOpen(false);
    setMobilePanel(null);
    setRunnableCodeOpen(true);
  }

  function openInsertPanel(panel: Exclude<InsertPanel, null>) {
    setSidebarOpen(false);
    setAdvancedOpen(false);
    setMobilePanel(null);
    if (panel === "link") {
      setLinkSelection(editorRef.current?.getSelectionMarkdown() || "");
    }
    setInsertPanel(panel);
  }

  function insertMarkdownAtCursor(markdown: string, message: string) {
    if (mode === "rich" && editorRef.current) {
      editorRef.current.insertMarkdown(markdown);
    } else {
      replaceEditorBody(`${body}${body ? "\n\n" : ""}${markdown}`);
    }
    setInsertPanel(null);
    showToast(message, "success");
  }

  function insertMarkdownAtTop(markdown: string, message: string) {
    const latestBody = mode === "rich" ? editorRef.current?.getMarkdown() ?? body : body;
    replaceEditorBody(`${markdown.trim()}${latestBody.trim() ? `\n\n${latestBody.trimStart()}` : ""}`);
    setInsertPanel(null);
    showToast(message, "success");
  }

  function toggleOutlinePanel() {
    if (window.matchMedia("(max-width: 900px)").matches) {
      setAdvancedOpen(false);
      setMobilePanel((current) => current === "outline" ? null : "outline");
      return;
    }
    setOutlineVisible((value) => !value);
  }

  function toggleAdvancedFields() {
    setSidebarOpen(false);
    setMobilePanel(null);
    if (advancedOpen) {
      setAdvancedOpen(false);
      document.querySelector(".document-scroll")?.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setAdvancedOpen(true);
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

  function insertRunnableCode(snippet: string) {
    replaceEditorBody(`${body}${body ? "\n\n" : ""}${snippet}\n`);
    setRunnableCodeOpen(false);
    showToast("可运行代码已插入正文", "success");
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
    setSyncLabel("等待同步");
  }

  async function publishPost(draftOverride?: boolean) {
    if (!working || !fields) return;
    const current = currentFields();
    const normalizedFields = current && draftOverride !== undefined
      ? { ...current, draft: draftOverride }
      : current;
    if (!normalizedFields) return;
    const validationError = validatePublishingFields(normalizedFields);
    if (validationError) {
      showToast(validationError, "error");
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
      let backupFailed = false;
      if (working.draftKey && normalizedFields.backup === true) {
        try {
          const savedDraft = await api.saveDraft({
            key: working.draftKey,
            path: saved.path,
            sha: saved.sha,
            title: normalizedFields.title,
            updatedAt: new Date().toISOString(),
            isNew: false,
            content: serializeDocument({ ...normalizedFields, draft: true }, body),
          });
          setDrafts((currentDrafts) => [
            savedDraft,
            ...currentDrafts.filter((draft) => draft.key !== savedDraft.key),
          ]);
        } catch {
          backupFailed = true;
        }
      } else if (working.draftKey) {
        await api.deleteDraft(working.draftKey).catch(() => undefined);
      }
      window.localStorage.removeItem(`astro-studio:${working.path}`);
      setWorking({
        ...saved,
        isNew: false,
        ...(normalizedFields.backup === true && working.draftKey ? { draftKey: working.draftKey } : {}),
      });
      setFields(normalizedFields);
      setRevision(0);
      setPublishedRevision(0);
      setDraftSyncedRevision(0);
      setSyncState("saved");
      setSyncLabel(`已提交 ${formatTime(new Date().toISOString())}`);
      showToast(
        backupFailed
          ? "文章已发布，但云端草稿保留失败"
          : normalizedFields.draft
            ? "草稿已保存到 GitHub"
            : "文章已发布，EdgeOne 正在构建",
        backupFailed ? "error" : "success",
      );
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
    if (!current) return;
    const validationError = validatePublishingFields(current);
    if (validationError) {
      showToast(validationError, "error");
      return;
    }
    const path = working.isNew ? makePostPath(current.title) : working.path;
    const scheduledFields = {
      ...current,
      published: localDateValue(new Date(publishAt)),
      draft: false,
      scheduledAt: publishAt,
    };
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

  function clearWorkingDocument() {
    setWorking(null);
    setFields(null);
    setBody("");
    setTagsText("");
    setMode("rich");
    setRevision(0);
    setPublishedRevision(0);
    setDraftSyncedRevision(0);
    setSyncState("idle");
    setSyncLabel("未修改");
    setAdvancedOpen(false);
    setMobilePanel(null);
    setHistoryOpen(false);
    setEditorEpoch((value) => value + 1);
    setSidebarOpen(true);
  }

  async function removeDraft(draft: DraftSummary) {
    const title = draft.title || "未命名文章";
    if (!window.confirm(`确定要删除草稿“${title}”吗？删除后无法恢复。`)) return;
    setDeletingKey(`draft:${draft.key}`);
    try {
      await api.deleteDraft(draft.key);
      window.localStorage.removeItem(`astro-studio:${draft.path}`);
      setDrafts((current) => current.filter((item) => item.key !== draft.key));
      if (working?.draftKey === draft.key || (working?.isNew && working.path === draft.path)) {
        clearWorkingDocument();
      }
      showToast("草稿已删除", "success");
      await loadPostsAndDrafts(true);
    } catch (error) {
      showToast(errorMessage(error), "error");
    } finally {
      setDeletingKey(null);
    }
  }

  async function removeArticle(article: Pick<PostMeta, "path" | "sha" | "title">) {
    if (!window.confirm(`确定要从 GitHub 删除文章“${article.title || "未命名文章"}”吗？此操作会产生一次删除提交。`)) return;
    setDeletingKey(`post:${article.path}`);
    try {
      await api.deletePost(article.path, article.sha);
      const relatedDrafts = drafts.filter((draft) => draft.path === article.path);
      await Promise.all(relatedDrafts.map((draft) => api.deleteDraft(draft.key).catch(() => undefined)));
      window.localStorage.removeItem(`astro-studio:${article.path}`);
      setPosts((current) => current.filter((post) => post.path !== article.path));
      setDrafts((current) => current.filter((draft) => draft.path !== article.path));
      if (working?.path === article.path) clearWorkingDocument();
      showToast("文章已从 GitHub 删除", "success");
      await loadPostsAndDrafts(true);
    } catch (error) {
      showToast(errorMessage(error), "error");
    } finally {
      setDeletingKey(null);
    }
  }

  async function removeCurrentDocument() {
    if (!working || !fields) return;
    if (!working.isNew) {
      await removeArticle({ path: working.path, sha: working.sha, title: fields.title });
      return;
    }
    if (working.draftKey) {
      await removeDraft({
        key: working.draftKey,
        path: working.path,
        title: fields.title,
        updatedAt: new Date().toISOString(),
        isNew: true,
      });
      return;
    }
    if (!window.confirm(`确定要放弃草稿“${fields.title || "未命名文章"}”吗？`)) return;
    window.localStorage.removeItem(`astro-studio:${working.path}`);
    clearWorkingDocument();
    showToast("草稿已删除", "success");
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

  const uploadVideo = useCallback(async (file: File) => {
    setSyncState("saving");
    setSyncLabel("正在上传视频");
    try {
      const result = await api.uploadMedia(file);
      setSyncState("saved");
      setSyncLabel("视频已写入静态目录");
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

  const uploadResource = useCallback(async (
    file: File,
    metadata: Pick<ResourceRecord, "name" | "description" | "category" | "tags">,
  ) => {
    setSyncState("saving");
    setSyncLabel("正在上传资源");
    try {
      const result = await api.uploadResource(file, metadata);
      setSyncState("saved");
      setSyncLabel("资源已写入静态目录");
      showToast("资源已上传到 public/resource/editor", "success");
      return result;
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

  const orphanDrafts = useMemo(() => {
    if (filter !== "all" && filter !== "draft") return [];
    const normalized = query.trim().toLocaleLowerCase();
    return drafts.filter((draft) => {
      if (!draft.isNew || posts.some((post) => post.path === draft.path)) return false;
      if (!normalized) return true;
      return [draft.title, draft.path]
        .join(" ")
        .toLocaleLowerCase()
        .includes(normalized);
    });
  }, [drafts, filter, posts, query]);

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
            <span>发布文章</span><ChevronDown size={20} fill="currentColor" />
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
          <button
            className="icon-button topbar-notification"
            onClick={() => showToast(syncLabel, syncState === "error" ? "error" : "info")}
            title="同步消息"
          >
            <Bell size={18} />
          </button>
          <span className="topbar-separator" />
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
                  <div className="post-row-wrap" key={draft.key}>
                    <button
                      className={`post-row ${working?.draftKey === draft.key ? "selected" : ""}`}
                      onClick={() => void openDraft(draft)}
                    >
                      <span className="post-row-title">{draft.title || "未命名文章"}</span>
                      <span className="post-row-meta">云端草稿 · {formatDate(draft.updatedAt)}</span>
                    </button>
                    <button
                      aria-label={`删除草稿 ${draft.title || "未命名文章"}`}
                      className="post-row-delete"
                      disabled={deletingKey !== null}
                      onClick={() => void removeDraft(draft)}
                      title="删除草稿"
                    >
                      {deletingKey === `draft:${draft.key}` ? <LoaderCircle className="spin" size={15} /> : <Trash2 size={15} />}
                    </button>
                  </div>
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
              <div className="post-row-wrap" key={post.path}>
                <button
                  className={`post-row ${working?.path === post.path ? "selected" : ""}`}
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
                <button
                  aria-label={`删除文章 ${post.title}`}
                  className="post-row-delete"
                  disabled={deletingKey !== null}
                  onClick={() => void removeArticle(post)}
                  title="删除文章"
                >
                  {deletingKey === `post:${post.path}` ? <LoaderCircle className="spin" size={15} /> : <Trash2 size={15} />}
                </button>
              </div>
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

        <main className={`editor-workspace mode-${mode} ${wideEditor ? "wide-editor" : ""} ${outlineVisible ? "outline-visible" : "outline-hidden"} ${advancedOpen ? "settings-open" : ""}`}>
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
                          onRunnableCode={openRunnableCode}
                          onInsertImage={() => openInsertPanel("image")}
                          onInsertVideo={() => openInsertPanel("video")}
                          onInsertFormula={() => openInsertPanel("formula")}
                          onInsertLink={() => openInsertPanel("link")}
                          onInsertTemplate={() => openInsertPanel("template")}
                          onInsertResource={() => openInsertPanel("resource")}
                          onInsertTable={() => openInsertPanel("table")}
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
                        <ArticlePreview fields={fields} html={previewHtml} compact={fields.articleTemplate === "compact"} />
                      ) : null}
                    </div>
                  </div>

                </div>
              </section>

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
            </>
          )}
        </main>
      </div>

      {working && fields && mobilePanel ? (
        <>
          <button className="mobile-utility-scrim" onClick={() => setMobilePanel(null)} aria-label="关闭写作工具" />
          <aside className="mobile-utility-drawer" aria-label="移动端文章目录">
            <header>
              <div className="mobile-utility-title"><ListTree size={17} /> 目录</div>
              <button className="mobile-utility-close" onClick={() => setMobilePanel(null)} title="关闭"><X size={19} /></button>
            </header>
            {outlineItems.length ? (
              <nav className="mobile-outline-list" aria-label="移动端文章目录">
                {outlineItems.map((item, index) => (
                  <button key={`${item.text}-${index}`} style={{ paddingLeft: `${16 + (item.depth - 1) * 14}px` }} onClick={() => jumpToOutline(item, index)}>{item.text}</button>
                ))}
              </nav>
            ) : <p className="mobile-panel-empty">为正文添加标题后，将在这里自动生成目录</p>}
          </aside>
        </>
      ) : null}

      {working && fields ? (
        <footer className="publish-bar">
          <div className="publish-bar-meta">
            <span>共 {countWords(body)} 字</span>
            <button className={advancedOpen ? "active" : ""} onClick={toggleAdvancedFields}>
              {advancedOpen ? "关闭设置" : "发文设置"} <ChevronDown size={14} />
            </button>
          </div>
          <div className={`publish-sync ${syncState}`}>
            {syncState === "saving" ? <LoaderCircle className="spin" size={16} /> : syncState === "saved" ? <Check size={16} /> : <Cloud size={16} />}
            <span>{syncLabel}</span>
          </div>
          <div className="publish-bar-actions">
            <button
              aria-label={working.isNew ? "删除当前草稿" : "删除当前文章"}
              className="bottom-delete-button"
              disabled={deletingKey !== null}
              onClick={() => void removeCurrentDocument()}
              title={working.isNew ? "删除草稿" : "删除文章"}
            >
              {deletingKey ? <LoaderCircle className="spin" size={17} /> : <Trash2 size={17} />}
            </button>
            <button className="draft-save-button" onClick={() => void saveDraftNow()} disabled={publishing}>
              保存草稿 <ChevronDown size={16} />
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

      {runnableCodeOpen ? (
        <RunnableCodeDialog
          onClose={() => setRunnableCodeOpen(false)}
          onInsert={insertRunnableCode}
        />
      ) : null}

      {insertPanel === "image" ? (
        <ImageInsertDrawer
          onClose={() => setInsertPanel(null)}
          onUpload={uploadImage}
          onInsert={(images) => insertMarkdownAtCursor(
            images.map(({ url, alt }) => `![${escapeMarkdownInline(alt || "image")}](${url})`).join("\n\n"),
            images.length > 1 ? `${images.length} 张图片已插入正文` : "图片已插入正文",
          )}
        />
      ) : null}

      {insertPanel === "video" ? (
        <VideoInsertDialog
          onClose={() => setInsertPanel(null)}
          onUpload={uploadVideo}
          onInsert={(url, title) => insertMarkdownAtCursor(`\n<video controls preload="metadata" src="${escapeHtmlAttribute(url)}" title="${escapeHtmlAttribute(title || "视频")}"></video>\n`, "视频已插入正文")}
        />
      ) : null}

      {insertPanel === "formula" ? (
        <FormulaDialog
          onClose={() => setInsertPanel(null)}
          onInsert={(formula) => insertMarkdownAtCursor(`\n$$\n${formula}\n$$\n`, "公式已插入正文")}
        />
      ) : null}

      {insertPanel === "link" ? (
        <LinkInsertDialog
          initialText={plainText(linkSelection)}
          onClose={() => setInsertPanel(null)}
          onInsert={(url, text) => insertMarkdownAtCursor(`[${escapeMarkdownInline(text || url)}](${url})`, "链接已插入正文")}
        />
      ) : null}

      {insertPanel === "template" ? (
        <TemplateInsertDrawer
          currentTitle={fields?.title || "未命名文章"}
          currentBody={body}
          onClose={() => setInsertPanel(null)}
          onInsert={(template) => insertMarkdownAtCursor(template, "模板已添加到正文")}
        />
      ) : null}

      {insertPanel === "resource" ? (
        <ResourceBindingDialog
          onClose={() => setInsertPanel(null)}
          onUpload={uploadResource}
          onInsert={(resource) => insertMarkdownAtTop(
            buildResourceMarkdown(resource),
            "资源已绑定到正文顶部",
          )}
        />
      ) : null}

      {insertPanel === "table" ? (
        <TablePropertiesDialog
          onClose={() => setInsertPanel(null)}
          onInsert={(options) => insertMarkdownAtCursor(buildTableMarkup(options), "表格已插入正文")}
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
  const coverPreviewRef = useRef<string | null>(null);
  const [coverUploading, setCoverUploading] = useState(false);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  useEffect(() => () => {
    if (coverPreviewRef.current) URL.revokeObjectURL(coverPreviewRef.current);
  }, []);

  function replaceCoverPreview(value: string | null) {
    if (coverPreviewRef.current) URL.revokeObjectURL(coverPreviewRef.current);
    coverPreviewRef.current = value;
    setCoverPreview(value);
  }

  async function uploadCover(file: File | undefined) {
    if (!file) return;
    replaceCoverPreview(URL.createObjectURL(file));
    setCoverUploading(true);
    try {
      setField("image", await onUploadImage(file));
    } catch {
      replaceCoverPreview(null);
      // The shared uploader already reports the failure in the editor toast.
    } finally {
      setCoverUploading(false);
      if (coverInputRef.current) coverInputRef.current.value = "";
    }
  }

  return (
    <section className="advanced-fields" aria-label="发文设置">
      <header className="mobile-settings-head">
        <div><strong>发文设置</strong><span>文章属性会随内容保存</span></div>
        <button onClick={onClose} title="关闭发文设置"><X size={19} /></button>
      </header>

      <div className="astro-settings-divider"><span>文章信息</span></div>

      <SettingRow label="标题" required>
        <input
          aria-label="标题"
          value={fields.title}
          onChange={(event) => setField("title", event.target.value)}
          maxLength={100}
          placeholder="请输入文章标题"
        />
      </SettingRow>

      <SettingRow label="封面">
        <div className="cover-setting">
          <div className="cover-controls">
            <input
              aria-label="封面 URL 或路径"
              value={fields.image}
              onChange={(event) => {
                replaceCoverPreview(null);
                setField("image", event.target.value);
              }}
              placeholder="/image/cover.webp 或 https://..."
            />
            <input
              ref={coverInputRef}
              className="visually-hidden"
              type="file"
              accept="image/png,image/jpeg,image/gif,image/webp,image/avif,image/bmp"
              onChange={(event) => void uploadCover(event.target.files?.[0])}
            />
            <div className="cover-actions">
              <button className="cover-upload-button" onClick={() => coverInputRef.current?.click()} disabled={coverUploading}>
                {coverUploading ? <LoaderCircle className="spin" size={17} /> : <ImagePlus size={17} />}
                <span>{coverUploading ? "正在上传" : "本地上传"}</span>
              </button>
              {fields.image || coverPreview ? <button className="cover-clear-button" onClick={() => { replaceCoverPreview(null); setField("image", ""); }}>移除封面</button> : null}
            </div>
          </div>
          <div className="cover-preview-box">
            {coverPreview || fields.image ? <img src={coverPreview || fields.image} alt="文章封面预览" /> : <span>输入图片路径或上传本地图片</span>}
          </div>
        </div>
      </SettingRow>

      <SettingRow label="简介">
        <div className="summary-setting">
          <textarea
            aria-label="简介"
            value={fields.description}
            onChange={(event) => setField("description", event.target.value)}
            rows={3}
            maxLength={256}
            placeholder="用于文章列表、分享和搜索摘要"
          />
          <span>{fields.description.length} / 256</span>
          <button onClick={onExtractSummary}><MessageSquareText size={15} /> 从正文提取</button>
        </div>
      </SettingRow>

      <SettingRow label="标签">
        <div className="setting-input-with-action">
          <input aria-label="标签" value={tagsText} onChange={(event) => onTagsChange(event.target.value)} placeholder="使用逗号分隔多个标签" />
          <span>{fields.tags.length}/10</span>
        </div>
      </SettingRow>

      <SettingRow label="分类">
        <input aria-label="分类" value={fields.category} onChange={(event) => setField("category", event.target.value)} placeholder="请输入文章分类" />
      </SettingRow>

      <div className="astro-settings-divider"><span>发布属性</span></div>

      <SettingRow label="发布日期" required>
        <input aria-label="发布日期" type="date" value={fields.published} onChange={(event) => setField("published", event.target.value)} />
      </SettingRow>

      <SettingRow label="状态">
        <div className="advanced-toggles">
          <Toggle checked={fields.draft} label="草稿" onChange={(checked) => setField("draft", checked)} />
          <Toggle checked={fields.pinned} label="置顶" accent="pin" onChange={(checked) => setField("pinned", checked)} />
        </div>
      </SettingRow>

      {fields.pinned ? (
        <SettingRow label="置顶优先级">
          <input aria-label="置顶优先级" type="number" min="0" value={fields.priority ?? ""} onChange={(event) => setField("priority", event.target.value ? Number(event.target.value) : undefined)} placeholder="数字越小越靠前" />
        </SettingRow>
      ) : null}

      <SettingRow label="语言">
        <select value={fields.lang} onChange={(event) => setField("lang", event.target.value)} aria-label="语言">
          <option value="">跟随站点默认</option>
          <option value="zh-CN">简体中文</option>
          <option value="zh-TW">繁体中文</option>
          <option value="en">English</option>
          <option value="ja">日本語</option>
        </select>
      </SettingRow>

      <div className="astro-settings-divider"><span>博客功能</span></div>

      <SettingRow label="功能">
        <div className="advanced-toggles">
          <Toggle checked={fields.comment} label="允许评论" onChange={(checked) => setField("comment", checked)} />
          <Toggle checked={fields.encrypted} label="文章加密" onChange={(checked) => setField("encrypted", checked)} />
        </div>
      </SettingRow>

      {fields.encrypted ? (
        <SettingRow label="加密设置">
          <div className="settings-field-grid">
            <input aria-label="文章密码" type="password" value={fields.password || ""} onChange={(event) => setField("password", event.target.value)} placeholder="文章密码" />
            <input aria-label="密码提示" value={fields.passwordHint || ""} onChange={(event) => setField("passwordHint", event.target.value)} placeholder="密码提示" />
          </div>
        </SettingRow>
      ) : null}

      <SettingRow label="更新日期">
        <input aria-label="更新日期" type="date" value={fields.updated || ""} onChange={(event) => setField("updated", event.target.value || undefined)} />
      </SettingRow>

      <SettingRow label="固定链接">
        <input aria-label="固定链接" value={fields.permalink || ""} onChange={(event) => setField("permalink", event.target.value || undefined)} placeholder="例如 /notes/astro-editor/" />
      </SettingRow>
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

function ScheduleDialog({
  publishing,
  onClose,
  onSchedule,
}: {
  publishing: boolean;
  onClose: () => void;
  onSchedule: (value: string) => void;
}) {
  const [{ earliest, latest }] = useState(() => ({
    earliest: new Date(Date.now() + SCHEDULE_MIN_DELAY_MS),
    latest: new Date(Date.now() + SCHEDULE_MAX_DELAY_MS),
  }));
  const [dateValue, setDateValue] = useState("");
  const [timeValue, setTimeValue] = useState("");
  const publishAt = dateValue && timeValue ? new Date(`${dateValue}T${timeValue}`) : null;
  const isValid = publishAt !== null && validateScheduleTime(publishAt, earliest.getTime() - SCHEDULE_MIN_DELAY_MS) === null;
  const timeOptions = Array.from({ length: 48 }, (_, index) => {
    const hours = String(Math.floor(index / 2)).padStart(2, "0");
    const minutes = index % 2 === 0 ? "00" : "30";
    return `${hours}:${minutes}`;
  });

  return (
    <div className="modal-backdrop schedule-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="schedule-dialog" role="dialog" aria-modal="true" aria-labelledby="schedule-title">
        <header><h2 id="schedule-title">定时发布</h2><button className="icon-button" onClick={onClose} title="关闭定时发布"><X size={18} /></button></header>
        <div className="schedule-dialog-body">
          <p>请选择当前时间后 <strong>4小时</strong> 至 <strong>7天</strong> 进行定时发布</p>
          <div className="schedule-dialog-controls">
            <label className="schedule-field schedule-date-field">
              <CalendarDays size={15} />
              <span className={dateValue ? "selected" : ""}>{dateValue || "选择日期"}</span>
              <input
                aria-label="选择日期"
                type="date"
                min={localDateValue(earliest)}
                max={localDateValue(latest)}
                value={dateValue}
                onChange={(event) => setDateValue(event.target.value)}
              />
            </label>
            <label className="schedule-field schedule-time-field">
              <Clock3 size={15} />
              <select aria-label="选择时间" value={timeValue} onChange={(event) => setTimeValue(event.target.value)} disabled={!dateValue}>
                <option value="">选择时间</option>
                {timeOptions.map((time) => <option key={time} value={time}>{time}</option>)}
              </select>
              <ChevronDown size={15} />
            </label>
          </div>
        </div>
        <footer className="schedule-dialog-actions">
          <button className="secondary-button" onClick={onClose}>取消</button>
          <button
            className="csdn-publish-button"
            disabled={publishing}
            aria-disabled={!isValid}
            onClick={() => { if (publishAt && isValid) onSchedule(publishAt.toISOString()); }}
          >
            定时发布
          </button>
        </footer>
      </section>
    </div>
  );
}

type HistoryRevisionType = "1" | "2" | "3" | "4" | "5";

const HISTORY_REVISION_TYPES: Array<{ type: HistoryRevisionType; label: string }> = [
  { type: "1", label: "自动保存" },
  { type: "2", label: "手动保存" },
  { type: "3", label: "发布更新" },
  { type: "4", label: "版本恢复" },
  { type: "5", label: "定时发布" },
];

function historyRevisionType(message: string): HistoryRevisionType {
  const normalized = message.toLocaleLowerCase();
  if (/自动|auto.?save/.test(normalized)) return "1";
  if (/定时|schedule/.test(normalized)) return "5";
  if (/恢复|回滚|restore|recover|revert/.test(normalized)) return "4";
  if (/发布|上线|publish|release|update post/.test(normalized)) return "3";
  return "2";
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
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<HistoryRevisionType[]>(HISTORY_REVISION_TYPES.map(({ type }) => type));
  const onCloseRef = useRef(onClose);
  const filteredRevisions = useMemo(
    () => revisions.filter((revision) => selectedTypes.includes(historyRevisionType(revision.message))),
    [revisions, selectedTypes],
  );

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = "hidden";

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") onCloseRef.current();
    }

    window.addEventListener("keydown", closeOnEscape);
    return () => {
      root.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

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

  useEffect(() => {
    if (filteredRevisions.some((revision) => revision.sha === selectedSha)) return;
    setSelectedSha(filteredRevisions[0]?.sha || "");
  }, [filteredRevisions, selectedSha]);

  const selectedRevision = revisions.find((revision) => revision.sha === selectedSha);
  const preview = selectedContent ? parseDocument(selectedContent) : null;

  function restore() {
    if (!selectedContent) return;
    if (window.confirm("将此历史版本载入当前草稿？当前未发布的编辑内容会被替换。")) {
      onRestore(selectedContent);
    }
  }

  function toggleType(type: HistoryRevisionType) {
    setSelectedTypes((current) => current.includes(type)
      ? current.filter((item) => item !== type)
      : [...current, type]);
  }

  return (
    <div className="modal-backdrop history-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="history-dialog" role="dialog" aria-modal="true" aria-labelledby="history-title">
        <button className="history-close-button" onClick={onClose} title="关闭"><X size={22} /></button>
        <div className="history-body">
          <aside className="history-sidebar">
            <h1 id="history-title" title={path}>历史版本</h1>
            <div className={`history-filter${filterOpen ? " open" : ""}`}>
              <button
                className="history-filter-trigger"
                type="button"
                aria-expanded={filterOpen}
                onClick={() => setFilterOpen((current) => !current)}
              >
                <Clock3 size={24} />
                <span>共 {filteredRevisions.length} 条历史版本</span>
                <span className="history-filter-label">筛选 <ChevronDown size={14} /></span>
              </button>
              <div className="history-filter-options">
                {HISTORY_REVISION_TYPES.map(({ type, label }) => (
                  <label key={type}>
                    <input
                      type="checkbox"
                      checked={selectedTypes.includes(type)}
                      onChange={() => toggleType(type)}
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="history-list" role="listbox" aria-label="文章历史版本">
              {filteredRevisions.map((revision) => {
                const type = HISTORY_REVISION_TYPES.find((item) => item.type === historyRevisionType(revision.message));
                return (
                <button
                  key={revision.sha}
                  className={revision.sha === selectedSha ? "active" : ""}
                  onClick={() => setSelectedSha(revision.sha)}
                  role="option"
                  aria-selected={revision.sha === selectedSha}
                  title={`${revision.message} · ${revision.author}`}
                >
                  <span className="history-kind">{type?.label || "手动保存"}</span>
                  <span className="history-relative-time">{formatRelativeTime(revision.committedAt)}</span>
                  <span className="history-exact-time">{formatDateTime(revision.committedAt)}</span>
                </button>
                );
              })}
            </div>
          </aside>
          <main className="history-preview">
            {selectedRevision ? (
              <div className="history-preview-head">
                <h2>{preview?.fields.title || selectedRevision.message || "文章版本"}</h2>
                {selectedRevision?.htmlUrl ? <a href={selectedRevision.htmlUrl} target="_blank" rel="noreferrer" title="在 GitHub 查看"><ExternalLink size={16} /></a> : null}
              </div>
            ) : null}
            {isNew ? (
              <div className="history-empty">新文章还没有 GitHub 历史版本</div>
            ) : loading ? (
              <div className="history-loading"><LoaderCircle className="spin" size={20} /> 正在读取 GitHub 历史</div>
            ) : error && revisions.length === 0 ? (
              <div className="history-error"><AlertCircle size={18} /> {error}</div>
            ) : revisions.length === 0 ? (
              <div className="history-empty">暂无历史</div>
            ) : filteredRevisions.length === 0 ? (
              <div className="history-empty">当前筛选条件下暂无历史</div>
            ) : loadingContent ? (
              <div className="history-loading"><LoaderCircle className="spin" size={20} /> 正在读取版本内容</div>
            ) : error ? (
              <div className="history-error"><AlertCircle size={18} /> {error}</div>
            ) : (
              <pre>{preview?.body || "这个版本没有正文内容"}</pre>
            )}
            <div className="history-operate-box">
              {selectedRevision ? <span>{formatDateTime(selectedRevision.committedAt)}</span> : null}
              <button className="history-restore-button" onClick={restore} disabled={!selectedContent || loadingContent}>恢复到这个版本</button>
            </div>
          </main>
        </div>
      </section>
    </div>
  );
}

function ImageInsertDrawer({
  onClose,
  onUpload,
  onInsert,
}: {
  onClose: () => void;
  onUpload: (file: File) => Promise<string>;
  onInsert: (images: Array<{ url: string; alt: string }>) => void;
}) {
  const [tab, setTab] = useState<"upload" | "link">("upload");
  const [url, setUrl] = useState("");
  const [images, setImages] = useState<Array<{
    id: string;
    url: string;
    alt: string;
    previewUrl: string;
    selected: boolean;
  }>>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const activeRef = useRef(true);
  const onCloseRef = useRef(onClose);
  const previewUrlsRef = useRef<string[]>([]);
  const selectedCount = images.filter((image) => image.selected).length;

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    activeRef.current = true;
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") onCloseRef.current();
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      activeRef.current = false;
      window.removeEventListener("keydown", closeOnEscape);
      previewUrlsRef.current.forEach((previewUrl) => URL.revokeObjectURL(previewUrl));
      previewUrlsRef.current = [];
    };
  }, []);

  async function upload(file: File | undefined) {
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    previewUrlsRef.current.push(previewUrl);
    setUploading(true);
    setError("");
    try {
      const uploadedUrl = await onUpload(file);
      if (!activeRef.current) return;
      setImages((current) => [...current, {
        id: `${uploadedUrl}:${Date.now()}`,
        url: uploadedUrl,
        alt: file.name.replace(/\.[^.]+$/, "") || "image",
        previewUrl,
        selected: true,
      }]);
    } catch (reason) {
      URL.revokeObjectURL(previewUrl);
      previewUrlsRef.current = previewUrlsRef.current.filter((value) => value !== previewUrl);
      if (activeRef.current) setError(errorMessage(reason));
    } finally {
      if (activeRef.current) {
        setUploading(false);
        if (inputRef.current) inputRef.current.value = "";
      }
    }
  }

  function confirmUploads() {
    const selectedImages = images.filter((image) => image.selected).map(({ url: imageUrl, alt }) => ({ url: imageUrl, alt }));
    if (!selectedImages.length) return;
    onInsert(selectedImages);
  }

  function insertLink(event: FormEvent) {
    event.preventDefault();
    const normalized = safeHttpUrl(url);
    if (!normalized) {
      setError("请输入有效的 HTTP 或 HTTPS 图片地址");
      return;
    }
    let imageName = "image";
    try {
      imageName = decodeURIComponent(new URL(normalized).pathname.split("/").pop() || "image").replace(/\.[^.]+$/, "") || "image";
    } catch {
      // URL validity was already checked above.
    }
    onInsert([{ url: normalized, alt: imageName }]);
  }

  return (
    <div className="insert-drawer-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="insert-drawer image-insert-drawer" role="dialog" aria-modal="true" aria-labelledby="image-drawer-title">
        <header>
          <div className="insert-drawer-tabs" role="tablist" aria-label="图片插入方式">
            <button id="image-drawer-title" className={tab === "upload" ? "active" : ""} onClick={() => { setTab("upload"); setError(""); }} role="tab" aria-selected={tab === "upload"}>图片上传</button>
            <button className={tab === "link" ? "active" : ""} onClick={() => { setTab("link"); setError(""); }} role="tab" aria-selected={tab === "link"}>链接添加</button>
          </div>
          <button className="insert-drawer-close" onClick={onClose} title="关闭"><X size={21} /></button>
        </header>
        {tab === "upload" ? (
          <div className={`image-upload-panel${images.length ? " has-images" : ""}`}>
            <input ref={inputRef} className="visually-hidden" type="file" accept=".png,.jpg,.jpeg,.gif,.webp,.bmp" onChange={(event) => void upload(event.target.files?.[0])} />
            {images.length ? (
              <div className="image-upload-list" aria-label="已上传图片">
                {images.map((image) => (
                  <button
                    aria-checked={image.selected}
                    aria-label={`${image.selected ? "取消选择" : "选择"}图片 ${image.alt}`}
                    className={image.selected ? "selected" : ""}
                    key={image.id}
                    onClick={() => setImages((current) => current.map((item) => item.id === image.id ? { ...item, selected: !item.selected } : item))}
                    role="checkbox"
                    type="button"
                  >
                    <img alt={image.alt} src={image.previewUrl} />
                    <span aria-hidden><Check size={13} /></span>
                  </button>
                ))}
                <button className="image-upload-more" disabled={uploading} onClick={() => inputRef.current?.click()} title="继续添加图片" type="button">
                  {uploading ? <LoaderCircle className="spin" size={24} /> : <Plus size={28} />}
                </button>
              </div>
            ) : (
              <div className="image-upload-empty">
                <button className="drawer-primary-button" onClick={() => inputRef.current?.click()} disabled={uploading}>
                  {uploading ? "正在上传" : "选择图片"}
                </button>
                <p>支持jpg、gif、png、bmp、jpeg、webp等多种格式，单张图片最大支持5MB</p>
              </div>
            )}
            {error ? <span className="insert-dialog-error"><AlertCircle size={15} /> {error}</span> : null}
            {images.length ? (
              <footer className="image-upload-footer">
                <span>已选择 {selectedCount} 张</span>
                <div>
                  <button className="image-upload-cancel" onClick={onClose} type="button">取消</button>
                  <button className="drawer-primary-button" disabled={!selectedCount || uploading} onClick={confirmUploads} type="button">确定</button>
                </div>
              </footer>
            ) : null}
          </div>
        ) : (
          <form className="image-link-panel" onSubmit={insertLink}>
            <span className="image-link-label">图片URL <b>*</b></span>
            <input aria-label="图片URL" value={url} onChange={(event) => setUrl(event.target.value)} placeholder="图片URL" autoFocus />
            <button className="drawer-primary-button" disabled={!url.trim()}>确定</button>
            {error ? <span className="insert-dialog-error"><AlertCircle size={15} /> {error}</span> : null}
          </form>
        )}
      </section>
    </div>
  );
}

function VideoInsertDialog({
  onClose,
  onUpload,
  onInsert,
}: {
  onClose: () => void;
  onUpload: (file: File) => Promise<string>;
  onInsert: (url: string, title: string) => void;
}) {
  const [view, setView] = useState<"library" | "upload">("library");
  const [selectedVideo, setSelectedVideo] = useState<{ url: string; title: string } | null>(null);
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const activeRef = useRef(true);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    activeRef.current = true;
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") onCloseRef.current();
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      activeRef.current = false;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  async function upload(file: File | undefined) {
    if (!file) return;
    const requestedTitle = title.trim();
    setUploading(true);
    setError("");
    try {
      const uploadedUrl = await onUpload(file);
      if (!activeRef.current) return;
      setSelectedVideo({ url: uploadedUrl, title: requestedTitle || file.name.replace(/\.[^.]+$/, "") || "视频" });
      setView("library");
    } catch (reason) {
      if (activeRef.current) setError(errorMessage(reason));
    } finally {
      if (activeRef.current) {
        setUploading(false);
        if (inputRef.current) inputRef.current.value = "";
      }
    }
  }

  function addVideoAddress(event: FormEvent) {
    event.preventDefault();
    const normalized = safeHttpUrl(url);
    if (!normalized) {
      setError("请输入有效的 HTTP 或 HTTPS 视频地址");
      return;
    }
    setSelectedVideo({ url: normalized, title: title.trim() || "视频" });
    setError("");
    setView("library");
  }

  function insertSelectedVideo() {
    if (!selectedVideo) {
      setError("请先上传或添加一个视频");
      return;
    }
    onInsert(selectedVideo.url, selectedVideo.title);
  }

  function openUploadView() {
    setError("");
    setView("upload");
  }

  return (
    <div className="modal-backdrop media-dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="media-dialog video-insert-dialog" role="dialog" aria-modal="true" aria-labelledby="video-dialog-title">
        <header><h2 id="video-dialog-title">插入视频</h2><button className="icon-button" onClick={onClose} title="关闭"><X size={18} /></button></header>
        {view === "library" ? (
          <div className="video-library-view">
            <div className="video-library-content">
              {selectedVideo ? (
                <button aria-checked="true" className="video-library-card" onClick={() => setSelectedVideo(selectedVideo)} role="radio" type="button">
                  <span className="video-card-preview"><Video aria-hidden="true" size={38} /></span>
                  <span><b>{selectedVideo.title}</b><small>{selectedVideo.url}</small></span>
                  <Check aria-hidden="true" size={18} />
                </button>
              ) : (
                <div className="video-empty-state">
                  <span className="video-empty-illustration" aria-hidden="true"><Video size={52} strokeWidth={1.25} /></span>
                  <p>暂无视频内容，<button onClick={openUploadView} type="button">去上传</button></p>
                </div>
              )}
            </div>
            {error ? <span className="insert-dialog-error video-library-error"><AlertCircle size={15} /> {error}</span> : null}
            <footer className="video-dialog-footer">
              <button autoFocus className="video-upload-link" onClick={openUploadView} type="button">去上传</button>
              <span>
                <button className="dialog-primary-button" onClick={insertSelectedVideo} type="button">确定</button>
                <button className="secondary-button" onClick={onClose} type="button">取消</button>
              </span>
            </footer>
          </div>
        ) : (
          <form className="video-upload-view" onSubmit={addVideoAddress}>
            <button className="video-upload-back" onClick={() => { setError(""); setView("library"); }} type="button"><ChevronLeft size={16} /> 插入已有视频</button>
            <div className="video-upload-dropzone">
              <input ref={inputRef} className="visually-hidden" type="file" accept="video/mp4,video/webm,video/ogg" onChange={(event) => void upload(event.target.files?.[0])} />
              <button className="drawer-primary-button" onClick={() => inputRef.current?.click()} disabled={uploading} type="button">
                {uploading ? <LoaderCircle className="spin" size={16} /> : <Upload size={16} />} {uploading ? "正在上传到静态目录" : "选择本地视频"}
              </button>
              <p>支持 MP4、WebM、Ogg，单个视频最大 25MB</p>
            </div>
            <div className="video-address-fields">
              <label><span>视频地址</span><input aria-label="视频地址" value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://example.com/video.mp4" /></label>
              <label><span>视频标题</span><input aria-label="视频标题" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="可选" /></label>
            </div>
            {error ? <span className="insert-dialog-error"><AlertCircle size={15} /> {error}</span> : null}
            <footer><button className="secondary-button" onClick={() => { setError(""); setView("library"); }} type="button">返回</button><button className="dialog-primary-button" disabled={!url.trim()}>添加地址</button></footer>
          </form>
        )}
      </section>
    </div>
  );
}

interface FormulaSymbol {
  label: string;
  preview?: string;
  value: string;
}

interface FormulaCategory {
  id: string;
  title: string;
  preview: string;
  width: number;
  symbols: FormulaSymbol[];
}

const formulaFunctions = [
  ["display style", "\\displaystyle "],
  ["sin", "\\sin(x)"], ["cos", "\\cos(x)"], ["tan", "\\tan(x)"],
  ["csc", "\\csc(x)"], ["sec", "\\sec(x)"], ["cot", "\\cot(x)"],
  ["sinh", "\\sinh(x)"], ["cosh", "\\cosh(x)"], ["tanh", "\\tanh(x)"], ["coth", "\\coth(x)"],
  ["arcsin", "\\arcsin(x)"], ["arccos", "\\arccos(x)"], ["arctan", "\\arctan(x)"],
  ["arccsc", "\\operatorname{arccsc}(x)"], ["arcsec", "\\operatorname{arcsec}(x)"], ["arccot", "\\operatorname{arccot}(x)"],
  ["sin-1", "\\sin^{-1}(x)"], ["cos-1", "\\cos^{-1}(x)"], ["tan-1", "\\tan^{-1}(x)"],
  ["sinh-1", "\\sinh^{-1}(x)"], ["cosh-1", "\\cosh^{-1}(x)"], ["tanh-1", "\\tanh^{-1}(x)"],
  ["exp", "\\exp(x)"], ["lg", "\\lg(x)"], ["ln", "\\ln(x)"], ["log", "\\log(x)"],
  ["log e", "\\log_{e}(x)"], ["log 10", "\\log_{10}(x)"], ["limit", "\\lim_{x \\to 0}"],
  ["liminf", "\\liminf_{n \\to \\infty}"], ["limsup", "\\limsup_{n \\to \\infty}"],
  ["maximum", "\\max"], ["minimum", "\\min"], ["infinite", "\\infty"], ["arg", "\\arg"],
  ["det", "\\det"], ["dim", "\\dim"], ["gcd", "\\gcd"], ["hom", "\\hom"], ["ker", "\\ker"],
  ["Pr", "\\Pr"], ["sup", "\\sup"],
] as const;

const formulaCategoryRows: FormulaCategory[][] = [
  [
    {
      id: "style", title: "样式", preview: "\\mathbf{B}\\;\\mathit{I}\\;\\mathrm{U}", width: 111,
      symbols: [
        { label: "粗体", value: "\\mathbf{x}" }, { label: "斜体", value: "\\mathit{x}" },
        { label: "正体", value: "\\mathrm{x}" }, { label: "无衬线", value: "\\mathsf{x}" },
        { label: "等宽", value: "\\mathtt{x}" }, { label: "黑板体", value: "\\mathbb{R}" },
        { label: "花体", value: "\\mathcal{F}" }, { label: "哥特体", value: "\\mathfrak{g}" },
      ],
    },
    {
      id: "spaces", title: "空格", preview: "\\square\\;\\square", width: 36,
      symbols: [
        { label: "负空格", preview: "a\\!b", value: "\\!" }, { label: "细空格", preview: "a\\,b", value: "\\," },
        { label: "中空格", preview: "a\\:b", value: "\\:" }, { label: "厚空格", preview: "a\\;b", value: "\\;" },
        { label: "字宽空格", preview: "a\\quad b", value: "\\quad" }, { label: "双字宽空格", preview: "a\\qquad b", value: "\\qquad" },
      ],
    },
    {
      id: "binary", title: "二元运算符", preview: "+\\;\\oplus\\;\\cup", width: 73,
      symbols: [
        { label: "+", value: "+" }, { label: "-", value: "-" }, { label: "乘", value: "\\times" },
        { label: "除", value: "\\div" }, { label: "正负", value: "\\pm" }, { label: "负正", value: "\\mp" },
        { label: "点乘", value: "\\cdot" }, { label: "星号", value: "\\ast" }, { label: "星", value: "\\star" },
        { label: "圆", value: "\\circ" }, { label: "实心圆", value: "\\bullet" }, { label: "直和", value: "\\oplus" },
        { label: "张量积", value: "\\otimes" }, { label: "并集", value: "\\cup" }, { label: "交集", value: "\\cap" },
        { label: "差集", value: "\\setminus" }, { label: "花积", value: "\\wr" },
      ],
    },
    {
      id: "symbols", title: "常用符号", preview: "\\forall\\;\\exists\\;\\infty", width: 73,
      symbols: [
        { label: "任意", value: "\\forall" }, { label: "存在", value: "\\exists" }, { label: "不存在", value: "\\nexists" },
        { label: "空集", value: "\\emptyset" }, { label: "无穷", value: "\\infty" }, { label: "梯度", value: "\\nabla" },
        { label: "偏导", value: "\\partial" }, { label: "约化普朗克常数", value: "\\hbar" }, { label: "椭圆", value: "\\ell" },
        { label: "实部", value: "\\Re" }, { label: "虚部", value: "\\Im" }, { label: "阿列夫", value: "\\aleph" },
      ],
    },
    {
      id: "foreign", title: "数集", preview: "\\Re\\;\\Im", width: 39,
      symbols: [
        { label: "实数", value: "\\mathbb{R}" }, { label: "复数", value: "\\mathbb{C}" },
        { label: "自然数", value: "\\mathbb{N}" }, { label: "整数", value: "\\mathbb{Z}" },
        { label: "有理数", value: "\\mathbb{Q}" },
      ],
    },
    {
      id: "subsupset", title: "上下标", preview: "x_i^2", width: 39,
      symbols: [
        { label: "上标", value: "x^{2}" }, { label: "下标", value: "x_{i}" }, { label: "上下标", value: "x_{i}^{2}" },
        { label: "左上下标", value: "{}_{a}^{b}x" }, { label: "正上方", value: "\\overset{a}{x}" },
        { label: "正下方", value: "\\underset{b}{x}" },
      ],
    },
    {
      id: "accents", title: "重音符号", preview: "\\hat{x}\\;\\bar{x}", width: 39,
      symbols: [
        { label: "帽", value: "\\hat{x}" }, { label: "横线", value: "\\bar{x}" }, { label: "向量", value: "\\vec{x}" },
        { label: "单点", value: "\\dot{x}" }, { label: "双点", value: "\\ddot{x}" }, { label: "波浪", value: "\\tilde{x}" },
        { label: "锐音", value: "\\acute{x}" }, { label: "抑音", value: "\\grave{x}" },
      ],
    },
    {
      id: "accents-extended", title: "扩展重音", preview: "\\overline{abc}", width: 30,
      symbols: [
        { label: "上横线", value: "\\overline{abc}" }, { label: "下横线", value: "\\underline{abc}" },
        { label: "上大括号", value: "\\overbrace{a+b}^{n}" }, { label: "下大括号", value: "\\underbrace{a+b}_{n}" },
        { label: "宽帽", value: "\\widehat{abc}" }, { label: "宽波浪", value: "\\widetilde{abc}" },
      ],
    },
    {
      id: "arrows", title: "箭头", preview: "\\leftarrow\\;\\rightarrow", width: 60,
      symbols: [
        { label: "左箭头", value: "\\leftarrow" }, { label: "右箭头", value: "\\rightarrow" },
        { label: "双向箭头", value: "\\leftrightarrow" }, { label: "左双线箭头", value: "\\Leftarrow" },
        { label: "右双线箭头", value: "\\Rightarrow" }, { label: "双向双线箭头", value: "\\Leftrightarrow" },
        { label: "映射", value: "\\mapsto" }, { label: "上箭头", value: "\\uparrow" }, { label: "下箭头", value: "\\downarrow" },
      ],
    },
  ],
  [
    {
      id: "operators", title: "大型运算符", preview: "\\int\\;\\sum\\;\\prod\\;\\bigcup", width: 173,
      symbols: [
        { label: "分数", value: "\\frac{a}{b}" }, { label: "平方根", value: "\\sqrt{x}" }, { label: "n次根", value: "\\sqrt[n]{x}" },
        { label: "求和", value: "\\sum_{i=1}^{n}" }, { label: "乘积", value: "\\prod_{i=1}^{n}" },
        { label: "余积", value: "\\coprod_{i=1}^{n}" }, { label: "定积分", value: "\\int_{a}^{b}" },
        { label: "二重积分", value: "\\iint_{D}" }, { label: "三重积分", value: "\\iiint_{V}" },
        { label: "环路积分", value: "\\oint_{C}" }, { label: "大并集", value: "\\bigcup_{i=1}^{n}" },
        { label: "大交集", value: "\\bigcap_{i=1}^{n}" }, { label: "极限", value: "\\lim_{x \\to 0}" },
      ],
    },
    {
      id: "brackets", title: "括号", preview: "(\\;)\\;[\\;]\\;|\\;|", width: 61,
      symbols: [
        { label: "圆括号", value: "\\left(x\\right)" }, { label: "方括号", value: "\\left[x\\right]" },
        { label: "花括号", value: "\\left\\{x\\right\\}" }, { label: "尖括号", value: "\\left\\langle x\\right\\rangle" },
        { label: "绝对值", value: "\\left|x\\right|" }, { label: "范数", value: "\\left\\|x\\right\\|" },
        { label: "下取整", value: "\\left\\lfloor x\\right\\rfloor" }, { label: "上取整", value: "\\left\\lceil x\\right\\rceil" },
      ],
    },
    {
      id: "greek-lower", title: "小写希腊字母", preview: "\\alpha\\;\\beta\\;\\gamma", width: 73,
      symbols: ["alpha", "beta", "gamma", "delta", "epsilon", "varepsilon", "zeta", "eta", "theta", "vartheta", "iota", "kappa", "lambda", "mu", "nu", "xi", "pi", "varpi", "rho", "varrho", "sigma", "varsigma", "tau", "upsilon", "phi", "varphi", "chi", "psi", "omega"].map((name) => ({ label: name, value: `\\${name}` })).concat({ label: "omicron", value: "o" }),
    },
    {
      id: "greek-upper", title: "大写希腊字母", preview: "\\Gamma\\;\\Delta", width: 39,
      symbols: ["Gamma", "Delta", "Theta", "Lambda", "Xi", "Pi", "Sigma", "Upsilon", "Phi", "Psi", "Omega"].map((name) => ({ label: name, value: `\\${name}` })),
    },
    {
      id: "relations", title: "关系符号", preview: "<\\;\\le\\;=\\;\\ge", width: 56,
      symbols: [
        { label: "等于", value: "=" }, { label: "不等于", value: "\\ne" }, { label: "小于", value: "<" }, { label: "大于", value: ">" },
        { label: "小于等于", value: "\\le" }, { label: "大于等于", value: "\\ge" }, { label: "约等于", value: "\\approx" },
        { label: "恒等于", value: "\\equiv" }, { label: "相似", value: "\\sim" }, { label: "渐近", value: "\\simeq" },
        { label: "正比", value: "\\propto" }, { label: "属于", value: "\\in" }, { label: "不属于", value: "\\notin" },
        { label: "子集", value: "\\subset" }, { label: "超集", value: "\\supset" }, { label: "子集或等于", value: "\\subseteq" },
        { label: "超集或等于", value: "\\supseteq" }, { label: "垂直", value: "\\perp" }, { label: "平行", value: "\\parallel" },
      ],
    },
    {
      id: "matrix", title: "矩阵", preview: "\\begin{smallmatrix}a&b\\\\c&d\\end{smallmatrix}", width: 106,
      symbols: [
        { label: "矩阵", value: "\\begin{matrix}a&b\\\\c&d\\end{matrix}" },
        { label: "圆括号矩阵", value: "\\begin{pmatrix}a&b\\\\c&d\\end{pmatrix}" },
        { label: "方括号矩阵", value: "\\begin{bmatrix}a&b\\\\c&d\\end{bmatrix}" },
        { label: "花括号矩阵", value: "\\begin{Bmatrix}a&b\\\\c&d\\end{Bmatrix}" },
        { label: "行列式", value: "\\begin{vmatrix}a&b\\\\c&d\\end{vmatrix}" },
        { label: "范数矩阵", value: "\\begin{Vmatrix}a&b\\\\c&d\\end{Vmatrix}" },
        { label: "分段函数", value: "\\begin{cases}a,&x>0\\\\b,&x\\le 0\\end{cases}" },
        { label: "对齐公式", value: "\\begin{aligned}a&=b+c\\\\d&=e+f\\end{aligned}" },
        { label: "二项式", value: "\\binom{n}{r}" },
      ],
    },
  ],
];

function FormulaDialog({ onClose, onInsert }: { onClose: () => void; onInsert: (formula: string) => void }) {
  const [history, setHistory] = useState([""]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [activeCategory, setActiveCategory] = useState<FormulaCategory | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const formula = history[historyIndex] || "";
  const preview = useMemo(() => formula ? katex.renderToString(formula, { displayMode: true, throwOnError: false, strict: "ignore", trust: false }) : "", [formula]);

  function updateFormula(value: string) {
    const nextHistory = [...history.slice(0, historyIndex + 1), value].slice(-100);
    setHistory(nextHistory);
    setHistoryIndex(nextHistory.length - 1);
  }

  function moveHistory(direction: -1 | 1) {
    setHistoryIndex((current) => Math.max(0, Math.min(history.length - 1, current + direction)));
  }

  function insertSymbol(symbol: string) {
    const input = textareaRef.current;
    const start = input?.selectionStart ?? formula.length;
    const end = input?.selectionEnd ?? start;
    const next = `${formula.slice(0, start)}${symbol}${formula.slice(end)}`;
    updateFormula(next);
    requestAnimationFrame(() => {
      textareaRef.current?.focus();
      textareaRef.current?.setSelectionRange(start + symbol.length, start + symbol.length);
    });
    setActiveCategory(null);
  }

  return (
    <div className="modal-backdrop formula-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="formula-dialog" role="dialog" aria-modal="true" aria-labelledby="formula-dialog-title">
        <header><h2 id="formula-dialog-title">公式编辑器</h2><button className="icon-button" onClick={onClose} title="关闭"><X size={18} /></button></header>
        <div className="formula-tools">
          <div className="formula-history-actions">
            <button onClick={() => moveHistory(-1)} disabled={historyIndex === 0} title="撤销"><Undo2 size={18} /></button>
            <button onClick={() => moveHistory(1)} disabled={historyIndex === history.length - 1} title="重做"><Redo2 size={18} /></button>
            <button className="formula-clear-button" onClick={() => updateFormula("")}>清空</button>
            <select aria-label="常用函数" defaultValue="" onChange={(event) => { if (event.target.value) insertSymbol(event.target.value); event.target.value = ""; }}>
              <option value="">函数</option>
              {formulaFunctions.map(([label, value]) => <option key={label} value={value}>{label}</option>)}
            </select>
          </div>
          <div className="formula-category-rows">
            {formulaCategoryRows.map((row, rowIndex) => (
              <div className="formula-category-row" key={rowIndex}>
                {row.map((category) => (
                  <button
                    aria-expanded={activeCategory?.id === category.id}
                    className={`formula-category-button ${activeCategory?.id === category.id ? "active" : ""}`}
                    key={category.id}
                    onClick={() => setActiveCategory((current) => current?.id === category.id ? null : category)}
                    style={{ width: category.width }}
                    title={category.title}
                    type="button"
                  >
                    <span dangerouslySetInnerHTML={{ __html: katex.renderToString(category.preview, { throwOnError: false, strict: "ignore", trust: false }) }} />
                  </button>
                ))}
              </div>
            ))}
          </div>
          {activeCategory ? (
            <div aria-label={`${activeCategory.title}符号`} className="formula-symbol-popover" role="menu">
              {activeCategory.symbols.map((symbol, index) => (
                <button key={`${symbol.label}-${index}`} onClick={() => insertSymbol(symbol.value)} role="menuitem" title={`插入 ${symbol.label}`} type="button">
                  <span dangerouslySetInnerHTML={{ __html: katex.renderToString(symbol.preview ?? symbol.value, { throwOnError: false, strict: "ignore", trust: false }) }} />
                </button>
              ))}
            </div>
          ) : null}
        </div>
        <label className="formula-input-label"><span>LaTeX公式:</span><textarea ref={textareaRef} value={formula} onChange={(event) => updateFormula(event.target.value)} autoFocus /></label>
        <div className="formula-preview"><span>公式预览:</span><div dangerouslySetInnerHTML={{ __html: preview }} /></div>
        <footer><button className="dialog-primary-button" onClick={() => onInsert(formula.trim())} disabled={!formula.trim()}>确定</button><button className="secondary-button" onClick={onClose}>取消</button></footer>
      </section>
    </div>
  );
}

function LinkInsertDialog({
  initialText,
  onClose,
  onInsert,
}: {
  initialText: string;
  onClose: () => void;
  onInsert: (url: string, text: string) => void;
}) {
  const [url, setUrl] = useState("");
  const [text, setText] = useState(initialText);
  const [error, setError] = useState("");

  function insert(event: FormEvent) {
    event.preventDefault();
    const normalized = safeHttpUrl(url);
    if (!normalized) {
      setError("请输入有效的 HTTP 或 HTTPS 链接");
      return;
    }
    onInsert(normalized, text.trim());
  }

  return (
    <div className="modal-backdrop link-dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="link-insert-dialog" role="dialog" aria-modal="true" aria-labelledby="link-dialog-title">
        <header><h2 id="link-dialog-title">插入链接</h2><button className="icon-button" onClick={onClose} title="关闭"><X size={18} /></button></header>
        <form onSubmit={insert}>
          <label><span>插入URL：</span><input value={url} onChange={(event) => setUrl(event.target.value)} autoFocus /></label>
          <label><span>替换文本：</span><input value={text} onChange={(event) => setText(event.target.value)} /></label>
          {error ? <span className="insert-dialog-error"><AlertCircle size={15} /> {error}</span> : null}
          <footer><button className="dialog-primary-button">确定</button><button type="button" className="secondary-button" onClick={onClose}>取消</button></footer>
        </form>
      </section>
    </div>
  );
}

const officialTemplates: SavedTemplate[] = [
  { id: "learning", title: "学习计划模板示例", updatedAt: "2022-04-18", previewUrl: "/template-assets/learning.png", content: "## 学习目标\n\n在这里写下清晰、可验证的学习目标。\n\n## 学习内容\n\n列出需要掌握的知识与练习。\n\n## 学习时间\n\n安排阶段目标与复盘时间。" },
  { id: "series", title: "系列文章模板", updatedAt: "2022-03-07", previewUrl: "/template-assets/series.png", content: "## 系列文章目录\n\n- 本文：当前主题\n- 下一篇：后续主题\n\n## 文章目录\n\n## 前言\n\n## 正文\n\n## 总结" },
  { id: "bug", title: "记录bug模板", updatedAt: "2022-03-07", previewUrl: "/template-assets/bug.png", content: "## 项目场景\n\n## 问题描述\n\n## 原因分析\n\n## 解决方案\n\n```text\n关键日志或代码\n```\n\n## 验证结果" },
  { id: "beginner", title: "新手模版", updatedAt: "2020-08-13", previewUrl: "/template-assets/beginner.png", content: "## 文章目录\n\n## 前言\n\n## 正文\n\n## 总结" },
  { id: "anniversary", title: "创作纪念日模板", updatedAt: "2022-04-18", previewUrl: "/template-assets/anniversary.png", content: "## 创作历程\n\n## 印象深刻的文章\n\n## 收获与成长\n\n## 下一阶段计划" },
  { id: "analysis", title: "技术分析模板", updatedAt: "2023-05-16", previewUrl: "/template-assets/analysis.png", content: "## 背景\n\n## 技术原理\n\n## 方案对比\n\n## 实现过程\n\n## 性能与限制\n\n## 总结" },
];

const templateContributors = [
  { name: "谷哥的小弟", avatar: "/template-assets/contributor-1.jpg" },
  { name: "沉默王二", avatar: "/template-assets/contributor-2.jpg" },
  { name: "Michael阿明", avatar: "/template-assets/contributor-3.jpg" },
  { name: "开发游戏的老王", avatar: "/template-assets/contributor-4.jpg" },
  { name: "kongfanyu", avatar: "/template-assets/contributor-5.jpg" },
  { name: "ursula skr", avatar: "/template-assets/contributor-6.jpg" },
  { name: "李孟聊人工智能", avatar: "/template-assets/contributor-7.jpg" },
];

function readSavedTemplates(): SavedTemplate[] {
  try {
    const value = window.localStorage.getItem("astro-studio:templates");
    const parsed = value ? JSON.parse(value) : [];
    return Array.isArray(parsed) ? parsed.filter((item): item is SavedTemplate => typeof item?.id === "string" && typeof item?.title === "string" && typeof item?.content === "string") : [];
  } catch {
    return [];
  }
}

function TemplateInsertDrawer({
  currentTitle,
  currentBody,
  onClose,
  onInsert,
}: {
  currentTitle: string;
  currentBody: string;
  onClose: () => void;
  onInsert: (content: string) => void;
}) {
  const [tab, setTab] = useState<"official" | "mine">("official");
  const [saved, setSaved] = useState(readSavedTemplates);
  const [selectedId, setSelectedId] = useState("");
  const [editor, setEditor] = useState<{ id?: string; title: string; content: string } | null>(null);
  const [error, setError] = useState("");
  const onCloseRef = useRef(onClose);
  const visibleTemplates = tab === "official" ? officialTemplates : saved;
  const selected = visibleTemplates.find((template) => template.id === selectedId);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") onCloseRef.current();
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

  function persist(next: SavedTemplate[]) {
    try {
      window.localStorage.setItem("astro-studio:templates", JSON.stringify(next));
      setSaved(next);
      setError("");
    } catch {
      setError("浏览器存储空间不足，无法保存当前模板");
    }
  }

  function openTemplateEditor(template?: SavedTemplate) {
    setTab("mine");
    setSelectedId("");
    setError("");
    setEditor(template
      ? { id: template.id, title: template.title, content: template.content }
      : { title: "", content: currentBody });
  }

  function saveTemplate() {
    if (!editor) return;
    const title = editor.title.trim();
    if (!title) {
      setError("请输入模板名称");
      return;
    }
    if (!editor.content.trim()) {
      setError("模板内容不能为空");
      return;
    }
    const template: SavedTemplate = {
      id: editor.id || crypto.randomUUID(),
      title,
      content: editor.content,
      updatedAt: new Date().toISOString().slice(0, 10),
    };
    const next = editor.id
      ? saved.map((item) => item.id === editor.id ? template : item)
      : [template, ...saved];
    persist(next);
    setSelectedId(template.id);
    setEditor(null);
  }

  function deleteTemplate(template: SavedTemplate) {
    if (!window.confirm(`确定删除模板“${template.title}”吗？`)) return;
    const next = saved.filter((item) => item.id !== template.id);
    persist(next);
    if (selectedId === template.id) setSelectedId("");
  }

  function changeTab(nextTab: "official" | "mine") {
    setTab(nextTab);
    setSelectedId("");
    setEditor(null);
    setError("");
  }

  function insertSelectedTemplate() {
    if (!selected) {
      setError("请选择一个模板");
      return;
    }
    onInsert(selected.content);
  }

  return (
    <div className="insert-drawer-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="insert-drawer template-insert-drawer" role="dialog" aria-modal="true" aria-labelledby="template-drawer-title">
        <header>
          <div className="insert-drawer-tabs" role="tablist" aria-label="模板来源">
            <button id="template-drawer-title" className={tab === "official" ? "active" : ""} onClick={() => changeTab("official")} role="tab" aria-selected={tab === "official"}>插入模板</button>
            <button className={tab === "mine" ? "active" : ""} onClick={() => changeTab("mine")} role="tab" aria-selected={tab === "mine"}>我的模板</button>
          </div>
          <button className="insert-drawer-close" onClick={onClose} title="关闭"><X size={21} /></button>
        </header>
        {editor ? (
          <div className="template-editor-panel">
            <label>
              <span>模板名称 <small>{editor.title.length} / 30</small></span>
              <input aria-label="模板名称" autoFocus maxLength={30} placeholder="请输入模板名称" value={editor.title} onChange={(event) => setEditor({ ...editor, title: event.target.value })} />
            </label>
            <label>
              <span>模板内容</span>
              <textarea aria-label="模板内容" placeholder="输入模板正文" value={editor.content} onChange={(event) => setEditor({ ...editor, content: event.target.value })} />
            </label>
          </div>
        ) : (
          <div className="template-grid">
            {visibleTemplates.length ? visibleTemplates.map((template) => (
              <article key={template.id} className={`template-card ${selectedId === template.id ? "selected" : ""}`}>
                <button className="template-card-select" onClick={() => { setSelectedId(template.id); setError(""); }} aria-label={`选择${template.title}`}>
                  <h2>{template.title}</h2>
                  <div className={`template-card-preview${template.previewUrl ? " official" : " custom"}`}>
                    {template.previewUrl ? <img alt="" src={template.previewUrl} /> : <p>{plainText(template.content).slice(0, 180)}</p>}
                  </div>
                  <span>更新于 {template.updatedAt}</span>
                </button>
                {selectedId === template.id ? <span aria-hidden className="template-card-check"><Check size={94} strokeWidth={7} /></span> : null}
                {tab === "mine" ? (
                  <div className="template-card-actions">
                    <button onClick={() => openTemplateEditor(template)} title={`编辑模板 ${template.title}`}><PencilLine size={16} /></button>
                    <button onClick={() => deleteTemplate(template)} title={`删除模板 ${template.title}`}><Trash2 size={16} /></button>
                  </div>
                ) : null}
              </article>
            )) : <div className="template-empty"><span>暂无数据</span></div>}
          </div>
        )}
        {error ? <span className="insert-dialog-error template-error"><AlertCircle size={15} /> {error}</span> : null}
        <footer>
          {tab === "official" ? (
            <div className="template-contributors"><span><Medal size={22} />模板贡献者</span><div>{templateContributors.map((contributor) => <img alt="" key={contributor.name} src={contributor.avatar} title={contributor.name} />)}</div></div>
          ) : editor ? <span className="template-editor-status">{editor.id ? "编辑模板" : "创建模板"}</span> : (
            <button className="template-create-button" onClick={() => openTemplateEditor()}><Plus size={15} /> 创建新模板</button>
          )}
          <div>
            <button className="secondary-button" onClick={editor ? () => { setEditor(null); setError(""); } : onClose}>取消</button>
            {editor
              ? <button className="drawer-primary-button" onClick={saveTemplate}>保存模板</button>
              : <button className="drawer-primary-button" onClick={insertSelectedTemplate}>添加到正文</button>}
          </div>
        </footer>
      </section>
    </div>
  );
}

function ResourceBindingDialog({
  onClose,
  onUpload,
  onInsert,
}: {
  onClose: () => void;
  onUpload: (
    file: File,
    metadata: Pick<ResourceRecord, "name" | "description" | "category" | "tags">,
  ) => Promise<ResourceRecord>;
  onInsert: (resource: ResourceRecord) => void;
}) {
  const [tab, setTab] = useState<"upload" | "existing">("upload");
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [tagsText, setTagsText] = useState("");
  const [resources, setResources] = useState<ResourceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let active = true;
    void api.resources()
      .then((result) => { if (active) setResources(result.resources); })
      .catch((reason) => { if (active) setError(errorMessage(reason)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  function selectFile(nextFile: File | undefined) {
    if (!nextFile) return;
    setFile(nextFile);
    if (!name.trim()) setName(nextFile.name.replace(/\.[^.]+$/, "").slice(0, 64));
    setError("");
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    const tags = tagsText.split(/[,，]/).map((tag) => tag.trim()).filter(Boolean);
    if (!file) {
      setError("请先选择要上传的代码包资源");
      return;
    }
    if (!name.trim() || !description.trim() || !category) {
      setError("请填写资源名称、描述和资源分类");
      return;
    }
    if (tags.length > 5) {
      setError("资源标签最多添加 5 个");
      return;
    }
    setUploading(true);
    setError("");
    try {
      const result = await onUpload(file, {
        name: name.trim(),
        description: description.trim(),
        category,
        tags,
      });
      onInsert(result);
    } catch (reason) {
      setError(errorMessage(reason));
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="modal-backdrop resource-dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="resource-binding-dialog" role="dialog" aria-modal="true" aria-labelledby="resource-dialog-title">
        <header>
          <div><FileArchive size={20} /><h2 id="resource-dialog-title">上传代码包资源</h2></div>
          <button className="icon-button" onClick={onClose} title="关闭"><X size={18} /></button>
        </header>
        <div className="resource-dialog-notice"><AlertCircle size={16} /><span>资源会上传到博客静态目录，发布后可在文章中置顶展示下载入口。</span></div>
        <div className="resource-dialog-tabs" role="tablist" aria-label="资源来源">
          <button className={tab === "upload" ? "active" : ""} onClick={() => { setTab("upload"); setError(""); }} role="tab" aria-selected={tab === "upload"}>上传资源</button>
          <button className={tab === "existing" ? "active" : ""} onClick={() => { setTab("existing"); setError(""); }} role="tab" aria-selected={tab === "existing"}>已有资源</button>
        </div>
        {tab === "upload" ? (
          <form className="resource-upload-form" onSubmit={(event) => void submit(event)}>
            <input ref={inputRef} className="visually-hidden" type="file" accept=".zip,.rar,.7z,.tar,.gz,.tgz,.bz2,.xz,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx" onChange={(event) => selectFile(event.target.files?.[0])} />
            <button
              type="button"
              className={`resource-drop-zone ${file ? "selected" : ""}`}
              onClick={() => inputRef.current?.click()}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => { event.preventDefault(); selectFile(event.dataTransfer.files?.[0]); }}
            >
              {file ? <><Check size={24} /><strong>{file.name}</strong><span>{formatFileSize(file.size)} · 点击重新选择</span></> : <><Upload size={24} /><strong>点击或拖拽文件到此处上传</strong><span>支持代码压缩包和常用文档，单个文件不超过 25MB</span></>}
            </button>
            <label><span>资源名称 <b>*</b></span><input value={name} onChange={(event) => setName(event.target.value)} maxLength={64} placeholder="请输入资源名称" /><small>{name.length}/64</small></label>
            <label><span>资源描述 <b>*</b></span><textarea value={description} onChange={(event) => setDescription(event.target.value)} maxLength={500} rows={3} placeholder="请描述资源内容和使用方式" /><small>{description.length}/500</small></label>
            <label><span>资源分类 <b>*</b></span><select value={category} onChange={(event) => setCategory(event.target.value)}><option value="">请选择资源分类</option><option value="code">代码资源</option><option value="document">文档资料</option><option value="tool">开发工具</option><option value="data">数据集</option><option value="other">其他</option></select></label>
            <label><span>资源标签</span><input value={tagsText} onChange={(event) => setTagsText(event.target.value)} placeholder="使用逗号分隔，最多 5 个" /></label>
            {error ? <span className="insert-dialog-error"><AlertCircle size={15} /> {error}</span> : null}
            <footer><button type="button" className="secondary-button" onClick={onClose}>取消</button><button className="dialog-primary-button" disabled={uploading || !file}>{uploading ? <LoaderCircle className="spin" size={15} /> : null} 提交</button></footer>
          </form>
        ) : (
          <div className="resource-existing-panel">
            {loading ? <div className="resource-empty"><LoaderCircle className="spin" size={22} /> 正在读取仓库资源</div> : null}
            {!loading && resources.length === 0 ? <div className="resource-empty"><FileArchive size={28} /><strong>仓库中还没有资源</strong><span>上传后的文件会保存在 public/resource/editor</span></div> : null}
            {!loading && resources.map((resource) => (
              <article key={resource.path}><FileArchive size={22} /><div><strong>{resource.name}</strong><span>{formatFileSize(resource.size)}</span></div><button onClick={() => onInsert(resource)}>绑定</button></article>
            ))}
            {error ? <span className="insert-dialog-error"><AlertCircle size={15} /> {error}</span> : null}
            <footer><button className="secondary-button" onClick={onClose}>取消</button></footer>
          </div>
        )}
      </section>
    </div>
  );
}

function TablePropertiesDialog({ onClose, onInsert }: { onClose: () => void; onInsert: (options: TableOptions) => void }) {
  const [options, setOptions] = useState<TableOptions>({
    rows: 3,
    columns: 2,
    header: "none",
    width: 500,
    height: undefined,
    spacing: 1,
    padding: 1,
    border: 1,
    align: "",
    title: "",
    summary: "",
  });

  function numberValue(key: keyof Pick<TableOptions, "rows" | "columns" | "width" | "height" | "spacing" | "padding" | "border">, value: string) {
    setOptions((current) => ({ ...current, [key]: value === "" ? undefined : Math.max(0, Number.parseInt(value, 10) || 0) }));
  }

  const valid = options.rows >= 1 && options.rows <= 50 && options.columns >= 1 && options.columns <= 20;

  return (
    <div className="modal-backdrop table-dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="table-properties-dialog" role="dialog" aria-modal="true" aria-labelledby="table-dialog-title">
        <header><h2 id="table-dialog-title">表格属性</h2><button className="icon-button" onClick={onClose} title="关闭"><X size={18} /></button></header>
        <form onSubmit={(event) => { event.preventDefault(); if (valid) onInsert(options); }}>
          <div className="table-properties-grid">
            <label className="table-field-rows"><span>行数</span><input aria-label="行数" type="number" min="1" max="50" value={options.rows} onChange={(event) => numberValue("rows", event.target.value)} autoFocus /></label>
            <label className="table-field-width"><span>宽度</span><input aria-label="宽度" type="number" min="0" value={options.width ?? ""} onChange={(event) => numberValue("width", event.target.value)} /></label>
            <label className="table-field-columns"><span>列数</span><input aria-label="列数" type="number" min="1" max="20" value={options.columns} onChange={(event) => numberValue("columns", event.target.value)} /></label>
            <label className="table-field-height"><span>高度</span><input aria-label="高度" type="number" min="0" value={options.height ?? ""} onChange={(event) => numberValue("height", event.target.value)} /></label>
            <label><span>标题单元格</span><select aria-label="标题单元格" value={options.header} onChange={(event) => setOptions((current) => ({ ...current, header: event.target.value as TableOptions["header"] }))}><option value="none">无</option><option value="row">第一行</option><option value="column">第一列</option><option value="both">第一列和第一行</option></select></label>
            <label><span>间距</span><input aria-label="间距" type="number" min="0" value={options.spacing} onChange={(event) => numberValue("spacing", event.target.value)} /></label>
            <label><span>边框</span><input aria-label="边框" type="number" min="0" value={options.border} onChange={(event) => numberValue("border", event.target.value)} /></label>
            <label><span>边距</span><input aria-label="边距" type="number" min="0" value={options.padding} onChange={(event) => numberValue("padding", event.target.value)} /></label>
            <label><span>对齐方式</span><select aria-label="对齐方式" value={options.align} onChange={(event) => setOptions((current) => ({ ...current, align: event.target.value as TableOptions["align"] }))}><option value="">&lt;没有设置&gt;</option><option value="left">左对齐</option><option value="center">居中</option><option value="right">右对齐</option></select></label>
            <label className="table-wide-field"><span>标题</span><input aria-label="标题" value={options.title} onChange={(event) => setOptions((current) => ({ ...current, title: event.target.value }))} /></label>
            <label className="table-wide-field"><span>摘要</span><input aria-label="摘要" value={options.summary} onChange={(event) => setOptions((current) => ({ ...current, summary: event.target.value }))} /></label>
          </div>
          {!valid ? <span className="insert-dialog-error"><AlertCircle size={15} /> 行数需为 1-50，列数需为 1-20</span> : null}
          <footer><button className="dialog-primary-button" disabled={!valid}>确定</button><button type="button" className="secondary-button" onClick={onClose}>取消</button></footer>
        </form>
      </section>
    </div>
  );
}

function buildResourceMarkdown(resource: ResourceRecord): string {
  const details = [resource.description, resource.category, resource.tags?.join("、")]
    .filter(Boolean)
    .map((value) => plainText(String(value)))
    .join(" · ");
  return `\n> **资源下载：** [${escapeMarkdownInline(resource.name)}](${resource.url})${details ? `\n> ${details}` : ""}\n`;
}

function buildTableMarkup(options: TableOptions): string {
  const attributes = [
    `border="${options.border}"`,
    `cellspacing="${options.spacing}"`,
    `cellpadding="${options.padding}"`,
    options.width ? `width="${options.width}"` : "",
    options.height ? `height="${options.height}"` : "",
    options.align ? `align="${options.align}"` : "",
    options.summary ? `summary="${escapeHtmlAttribute(options.summary)}"` : "",
  ].filter(Boolean).join(" ");
  const rows = Array.from({ length: options.rows }, (_, rowIndex) => {
    const cells = Array.from({ length: options.columns }, (_, columnIndex) => {
      const isColumnHeader = (options.header === "row" || options.header === "both") && rowIndex === 0;
      const isRowHeader = (options.header === "column" || options.header === "both") && columnIndex === 0;
      if (isColumnHeader) return `<th scope="col">标题 ${columnIndex + 1}</th>`;
      if (isRowHeader) return `<th scope="row">行 ${rowIndex + 1}</th>`;
      return "<td>内容</td>";
    }).join("");
    return `  <tr>${cells}</tr>`;
  }).join("\n");
  const caption = options.title ? `\n  <caption>${escapeHtmlText(options.title)}</caption>` : "";
  return `\n<table ${attributes}>${caption}\n${rows}\n</table>\n`;
}

const runnableCodeDefaults: Record<RunnableCodeTab, string> = {
  html: '<main class="demo-card">\n  <h1>Hello, Astro!</h1>\n  <button id="action">运行交互</button>\n  <p id="result">等待操作</p>\n</main>',
  css: 'body {\n  margin: 0;\n  padding: 32px;\n  font-family: system-ui, sans-serif;\n  background: #f5f6f8;\n}\n\n.demo-card {\n  max-width: 420px;\n  padding: 24px;\n  border-radius: 6px;\n  background: white;\n}',
  javascript: 'document.querySelector("#action").addEventListener("click", () => {\n  document.querySelector("#result").textContent = "代码运行成功";\n});',
};

function RunnableCodeDialog({
  onClose,
  onInsert,
}: {
  onClose: () => void;
  onInsert: (snippet: string) => void;
}) {
  const [activeTab, setActiveTab] = useState<RunnableCodeTab>("html");
  const [code, setCode] = useState(runnableCodeDefaults);
  const [previewDocument, setPreviewDocument] = useState(() => buildRunnableDocument(runnableCodeDefaults));
  const tabs: Array<[RunnableCodeTab, string]> = [["html", "HTML"], ["css", "CSS"], ["javascript", "JavaScript"]];

  function runCode() {
    setPreviewDocument(buildRunnableDocument(code));
  }

  return (
    <div className="modal-backdrop code-runner-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="code-runner-dialog" role="dialog" aria-modal="true" aria-labelledby="code-runner-title">
        <header>
          <div><Code2 size={20} /><h2 id="code-runner-title">运行代码</h2></div>
          <button className="icon-button" onClick={onClose} title="关闭"><X size={18} /></button>
        </header>
        <div className="code-runner-body">
          <div className="code-runner-editor">
            <div className="code-runner-tabs" role="tablist" aria-label="代码类型">
              {tabs.map(([value, label]) => (
                <button key={value} className={activeTab === value ? "active" : ""} onClick={() => setActiveTab(value)} role="tab" aria-selected={activeTab === value}>{label}</button>
              ))}
            </div>
            <textarea
              aria-label={`${tabs.find(([value]) => value === activeTab)?.[1]} 代码`}
              value={code[activeTab]}
              onChange={(event) => setCode((current) => ({ ...current, [activeTab]: event.target.value }))}
              spellCheck={false}
            />
          </div>
          <div className="code-runner-preview">
            <div><strong>运行结果</strong><span>沙盒预览</span></div>
            <iframe title="代码运行预览" sandbox="allow-scripts" srcDoc={previewDocument} />
          </div>
        </div>
        <footer>
          <span>HTML、CSS 与 JavaScript 会在隔离沙盒中运行</span>
          <div>
            <button className="secondary-button" onClick={onClose}>取消</button>
            <button className="secondary-button code-run-button" onClick={runCode}><Play size={15} fill="currentColor" /> 运行</button>
            <button className="csdn-publish-button" onClick={() => onInsert(buildRunnableMarkdown(code))}>插入文章</button>
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

function formatRelativeTime(value: string): string {
  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) return value;
  const elapsedSeconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
  if (elapsedSeconds < 60) return "刚刚";
  const minutes = Math.floor(elapsedSeconds / 60);
  if (minutes < 60) return `${minutes} 分钟前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} 小时前`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} 天前`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} 个月前`;
  return `${Math.floor(months / 12)} 年前`;
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

function safeHttpUrl(value: string): string | null {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}

function escapeMarkdownInline(value: string): string {
  return value.replace(/([\\`*{}[\]()#+.!_|<>~-])/g, "\\$1");
}

function escapeHtmlAttribute(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function escapeHtmlText(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function buildRunnableDocument(code: Record<RunnableCodeTab, string>): string {
  const css = code.css.replace(/<\/style/gi, "<\\/style");
  const javascript = code.javascript.replace(/<\/script/gi, "<\\/script");
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data: https:; media-src data: blob: https:; style-src 'unsafe-inline'; script-src 'unsafe-inline'; connect-src 'none'"><style>${css}</style></head><body>${code.html}<script>try {${javascript}} catch (error) { document.body.insertAdjacentHTML('beforeend', '<pre style="color:#b42318;white-space:pre-wrap"></pre>'); document.body.lastElementChild.textContent = String(error); }<\/script></body></html>`;
}

function buildRunnableMarkdown(code: Record<RunnableCodeTab, string>): string {
  return (["html", "css", "javascript"] as RunnableCodeTab[])
    .map((language) => makeCodeFence(language, code[language]))
    .join("\n\n");
}

function makeCodeFence(language: string, value: string): string {
  const longest = Math.max(0, ...Array.from(value.matchAll(/`+/g), (match) => match[0].length));
  const fence = "`".repeat(Math.max(3, longest + 1));
  return `${fence}${language}\n${value.trimEnd()}\n${fence}`;
}

function extractOutline(value: string): OutlineItem[] {
  const items: OutlineItem[] = [];
  let line = 0;

  for (const token of marked.lexer(value)) {
    if (token.type === "heading") {
      const text = plainText(token.text);
      if (text) items.push({ depth: token.depth, text, line });
    }
    line += token.raw.match(/\n/g)?.length ?? 0;
  }

  return items;
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
