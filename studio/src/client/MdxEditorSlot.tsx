/**
 * Adapted from Pageel CMS packages/plugin-mdx/src/MdxSlot.tsx (MIT).
 * See studio/THIRD_PARTY_NOTICES.md.
 */
import {
  BlockTypeSelect,
  BoldItalicUnderlineToggles,
  ButtonOrDropdownButton,
  ButtonWithTooltip,
  CreateLink,
  InsertCodeBlock,
  InsertImage,
  InsertTable,
  InsertThematicBreak,
  MDXEditor,
  UndoRedo,
  applyFormat$,
  applyListType$,
  codeBlockPlugin,
  codeMirrorPlugin,
  headingsPlugin,
  imagePlugin,
  insertMarkdown$,
  linkDialogPlugin,
  linkPlugin,
  listsPlugin,
  markdownShortcutPlugin,
  quotePlugin,
  tablePlugin,
  thematicBreakPlugin,
  toolbarPlugin,
  type ImageUploadHandler,
  type MDXEditorMethods,
  usePublisher,
} from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";
import {
  AlignCenter,
  FileCode2,
  FileStack,
  FolderSymlink,
  Highlighter,
  History,
  List,
  ListTree,
  Maximize2,
  MessageSquareQuote,
  MoreHorizontal,
  Palette,
  PlaySquare,
  Sigma,
} from "lucide-react";
import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  type ReactNode,
} from "react";

export interface MdxEditorSlotProps {
  initialValue: string;
  onChange: (markdown: string) => void;
  onUploadImage: (file: File) => Promise<string>;
  onSourceMode: () => void;
  onHistory: () => void;
  onToggleOutline: () => void;
  onToggleWide: () => void;
  outlineVisible: boolean;
  wide: boolean;
  readOnly?: boolean;
}

export interface MdxEditorSlotHandle {
  getMarkdown: () => string;
  setMarkdown: (markdown: string) => void;
}

interface InsertActionProps {
  label: string;
  title: string;
  icon: ReactNode;
  buildMarkdown: () => string | null;
}

function InsertAction({ label, title, icon, buildMarkdown }: InsertActionProps) {
  const insertMarkdown = usePublisher(insertMarkdown$);
  return (
    <ButtonWithTooltip
      className="csdn-toolbar-action"
      title={title}
      onClick={() => {
        const markdown = buildMarkdown();
        if (markdown) insertMarkdown(markdown);
      }}
    >
      {icon}
      <span>{label}</span>
    </ButtonWithTooltip>
  );
}

function ToolbarAction({
  label,
  title,
  icon,
  active,
  onClick,
}: {
  label: string;
  title: string;
  icon: ReactNode;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <ButtonWithTooltip
      className={`csdn-toolbar-action ${active ? "active" : ""}`}
      title={title}
      onClick={onClick}
    >
      {icon}
      <span>{label}</span>
    </ButtonWithTooltip>
  );
}

function MoreStyleMenu() {
  const applyFormat = usePublisher(applyFormat$);
  return (
    <ButtonOrDropdownButton
      title="其他样式"
      items={[
        { value: "italic", label: "斜体" },
        { value: "underline", label: "下划线" },
        { value: "strikethrough", label: "删除线" },
        { value: "superscript", label: "上标" },
        { value: "subscript", label: "下标" },
        { value: "highlight", label: "高亮" },
        { value: "code", label: "行内代码" },
      ]}
      onChoose={(value) => applyFormat(value)}
    >
      <MoreHorizontal size={18} />
      <span>其他</span>
    </ButtonOrDropdownButton>
  );
}

function ListMenu() {
  const applyListType = usePublisher(applyListType$);
  return (
    <ButtonOrDropdownButton
      title="列表"
      items={[
        { value: "bullet", label: "无序列表" },
        { value: "number", label: "有序列表" },
        { value: "check", label: "任务列表" },
      ]}
      onChoose={(value) => applyListType(value)}
    >
      <List size={18} />
      <span>列表</span>
    </ButtonOrDropdownButton>
  );
}

function normalizeExternalUrl(value: string | null): string | null {
  if (!value) return null;
  try {
    const parsed = new URL(value.trim());
    return parsed.protocol === "https:" || parsed.protocol === "http:" ? parsed.toString() : null;
  } catch {
    return null;
  }
}

function useDebouncedCallback<T extends (...args: never[]) => void>(
  callback: T,
  delay: number,
): T {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  return useMemo(() => {
    const debounced = (...args: never[]) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => callbackRef.current(...args), delay);
    };
    return debounced as T;
  }, [delay]);
}

export const MdxEditorSlot = forwardRef<MdxEditorSlotHandle, MdxEditorSlotProps>(
  function MdxEditorSlot({
    initialValue,
    onChange,
    onUploadImage,
    onSourceMode,
    onHistory,
    onToggleOutline,
    onToggleWide,
    outlineVisible,
    wide,
    readOnly,
  }, forwardedRef) {
    const editorRef = useRef<MDXEditorMethods>(null);
    const debouncedOnChange = useDebouncedCallback(onChange, 250);
    const imageUploadHandler: ImageUploadHandler = useCallback(
      async (image) => onUploadImage(image),
      [onUploadImage],
    );

    useImperativeHandle(
      forwardedRef,
      () => ({
        getMarkdown: () => editorRef.current?.getMarkdown() ?? "",
        setMarkdown: (markdown) => editorRef.current?.setMarkdown(markdown),
      }),
      [],
    );

    const plugins = useMemo(
      () => [
        headingsPlugin(),
        listsPlugin(),
        quotePlugin(),
        thematicBreakPlugin(),
        linkPlugin(),
        linkDialogPlugin(),
        tablePlugin(),
        imagePlugin({ imageUploadHandler }),
        codeBlockPlugin({ defaultCodeBlockLanguage: "" }),
        codeMirrorPlugin({
          codeBlockLanguages: {
            "": "纯文本",
            bash: "Bash",
            css: "CSS",
            html: "HTML",
            javascript: "JavaScript",
            json: "JSON",
            python: "Python",
            typescript: "TypeScript",
          },
        }),
        markdownShortcutPlugin(),
        toolbarPlugin({
          toolbarClassName: "csdn-editor-toolbar",
          toolbarContents: () => (
            <>
              <span className="csdn-tool-group csdn-history-tools"><UndoRedo /></span>
              <ToolbarAction label="历史" title="查看文章和草稿历史" icon={<History size={18} />} onClick={onHistory} />
              <span className="csdn-tool-group csdn-format-tool"><BlockTypeSelect /></span>
              <span className="csdn-tool-group csdn-basic-tools"><BoldItalicUnderlineToggles options={["Bold"]} /></span>
              <InsertAction
                label="颜色"
                title="文字颜色"
                icon={<Palette size={18} />}
                buildMarkdown={() => {
                  const color = window.prompt("输入文字颜色（例如 #fc5531）", "#fc5531")?.trim();
                  return color ? `<span style="color:${color}">文字</span>` : null;
                }}
              />
              <InsertAction
                label="背景"
                title="文字背景色"
                icon={<Highlighter size={18} />}
                buildMarkdown={() => {
                  const color = window.prompt("输入背景颜色（例如 #fff1eb）", "#fff1eb")?.trim();
                  return color ? `<span style="background-color:${color}">文字</span>` : null;
                }}
              />
              <span className="csdn-tool-group csdn-more-tools"><MoreStyleMenu /></span>
              <span className="csdn-toolbar-divider" />
              <span className="csdn-tool-group csdn-list-tools"><ListMenu /></span>
              <InsertAction
                label="对齐"
                title="插入居中段落"
                icon={<AlignCenter size={18} />}
                buildMarkdown={() => "\n<div align=\"center\">居中文字</div>\n"}
              />
              <span className="csdn-tool-group csdn-line-tool"><InsertThematicBreak /></span>
              <InsertAction
                label="块引用"
                title="插入块引用"
                icon={<MessageSquareQuote size={18} />}
                buildMarkdown={() => "\n> 引用内容\n"}
              />
              <span className="csdn-tool-group csdn-code-block-tool"><InsertCodeBlock /></span>
              <InsertAction
                label="资源绑定"
                title="插入资源链接"
                icon={<FolderSymlink size={18} />}
                buildMarkdown={() => {
                  const url = normalizeExternalUrl(window.prompt("输入资源链接", "https://"));
                  return url ? `[资源名称](${url})` : null;
                }}
              />
              <span className="csdn-tool-group csdn-table-tool"><InsertTable /></span>
              <span className="csdn-toolbar-divider" />
              <span className="csdn-tool-group csdn-image-tool"><InsertImage /></span>
              <InsertAction
                label="视频"
                title="插入视频"
                icon={<PlaySquare size={18} />}
                buildMarkdown={() => {
                  const url = normalizeExternalUrl(window.prompt("输入视频地址", "https://"));
                  return url ? `\n<video controls src="${url}"></video>\n` : null;
                }}
              />
              <InsertAction
                label="公式"
                title="插入数学公式"
                icon={<Sigma size={18} />}
                buildMarkdown={() => {
                  const formula = window.prompt("输入 LaTeX 公式", "E = mc^2")?.trim();
                  return formula ? `\n$$\n${formula}\n$$\n` : null;
                }}
              />
              <span className="csdn-tool-group csdn-link-tool"><CreateLink /></span>
              <InsertAction
                label="模板"
                title="插入文章模板"
                icon={<FileStack size={18} />}
                buildMarkdown={() => "\n## 背景\n\n## 实现过程\n\n## 关键代码\n\n```\n\n```\n\n## 总结\n"}
              />
              <ToolbarAction label="目录" title="显示或隐藏文章目录" icon={<ListTree size={18} />} active={outlineVisible} onClick={onToggleOutline} />
              <ToolbarAction label="宽屏" title="切换宽屏编辑" icon={<Maximize2 size={18} />} active={wide} onClick={onToggleWide} />
              <span className="csdn-toolbar-divider" />
              <ToolbarAction label="MD编辑器" title="使用 Markdown 源码编辑器" icon={<FileCode2 size={18} />} onClick={onSourceMode} />
            </>
          ),
        }),
      ],
      [imageUploadHandler, onHistory, onSourceMode, onToggleOutline, onToggleWide, outlineVisible, wide],
    );

    return (
      <div className="pageel-editor-slot">
        <MDXEditor
          ref={editorRef}
          markdown={initialValue}
          onChange={debouncedOnChange}
          readOnly={readOnly}
          plugins={plugins}
          contentEditableClassName="studio-rich-content"
          placeholder="#创作灵感#  记录实践、梳理思路、分享你的技术经验"
        />
      </div>
    );
  },
);
