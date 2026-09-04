/**
 * Adapted from Pageel CMS packages/plugin-mdx/src/MdxSlot.tsx (MIT).
 * See studio/THIRD_PARTY_NOTICES.md.
 */
import {
  BoldItalicUnderlineToggles,
  ButtonOrDropdownButton,
  ButtonWithTooltip,
  InsertThematicBreak,
  MDXEditor,
  UndoRedo,
  applyFormat$,
  applyListType$,
  codeBlockPlugin,
  codeMirrorPlugin,
  convertSelectionToNode$,
  headingsPlugin,
  imagePlugin,
  insertCodeBlock$,
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
  AlignJustify,
  AlignLeft,
  AlignRight,
  Baseline,
  ChevronDown,
  Code2,
  FileCode2,
  FileStack,
  FolderSymlink,
  Highlighter,
  History,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  ListTree,
  Maximize2,
  MessageSquareQuote,
  MoreHorizontal,
  PlaySquare,
  Sigma,
  SquareTerminal,
  Strikethrough,
  Table2,
  Underline,
} from "lucide-react";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { $createHeadingNode } from "@lexical/rich-text";
import { $createParagraphNode } from "lexical";

export interface MdxEditorSlotProps {
  initialValue: string;
  onChange: (markdown: string) => void;
  onUploadImage: (file: File) => Promise<string>;
  onSourceMode: () => void;
  onHistory: () => void;
  onToggleOutline: () => void;
  onToggleWide: () => void;
  onRunnableCode: () => void;
  onInsertImage: () => void;
  onInsertVideo: () => void;
  onInsertFormula: () => void;
  onInsertLink: () => void;
  onInsertTemplate: () => void;
  onInsertResource: () => void;
  onInsertTable: () => void;
  outlineVisible: boolean;
  wide: boolean;
  readOnly?: boolean;
}

export interface MdxEditorSlotHandle {
  getMarkdown: () => string;
  setMarkdown: (markdown: string) => void;
  insertMarkdown: (markdown: string) => void;
  getSelectionMarkdown: () => string;
}

interface InsertActionProps {
  label: string;
  title: string;
  icon: ReactNode;
  buildMarkdown: () => string | null;
  className?: string;
}

function InsertAction({ label, title, icon, buildMarkdown, className = "" }: InsertActionProps) {
  const insertMarkdown = usePublisher(insertMarkdown$);
  return (
    <ButtonWithTooltip
      className={`csdn-toolbar-action ${className}`.trim()}
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
  className = "",
}: {
  label: string;
  title: string;
  icon: ReactNode;
  active?: boolean;
  onClick: () => void;
  className?: string;
}) {
  return (
    <ButtonWithTooltip
      className={`csdn-toolbar-action ${active ? "active" : ""} ${className}`.trim()}
      title={title}
      onClick={onClick}
    >
      {icon}
      <span>{label}</span>
    </ButtonWithTooltip>
  );
}

const csdnColors = [
  "#0D0016", "#FE2C24", "#FF9900", "#FFD900", "#A2E043", "#38D8F0", "#4DA8EE", "#956FE7",
  "#F3F3F4", "#CCCCCC", "#FEF2F0", "#FFF5E6", "#FEFCD8", "#EDF6E8", "#E7FAFA", "#EAF4FC", "#EFEDF6",
  "#D7D8D9", "#A5A5A5", "#FBD4D0", "#FFD7B9", "#F9EDA6", "#D4E9D5", "#C7E6EA", "#CBE0F1", "#DAD5E9",
  "#7B7F82", "#494949", "#ED7976", "#FAA572", "#E6B223", "#98C091", "#79C6CD", "#6EAAD7", "#9C8EC1",
  "#9C8EC1", "#333333", "#BE191C", "#B95514", "#AD720D", "#1C7331", "#1C7892", "#1A439C", "#511B78",
] as const;

function escapeInlineHtml(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function selectedTextOr(fallback: string): string {
  return window.getSelection()?.toString().trim() || fallback;
}

function ColorMenu({ background = false }: { background?: boolean }) {
  const insertMarkdown = usePublisher(insertMarkdown$);
  const title = background ? "文字背景色" : "文字颜色";
  const anchorRef = useRef<HTMLSpanElement>(null);
  const paletteRef = useRef<HTMLDivElement>(null);
  const selectionRef = useRef("文字");
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 98, left: 8 });

  useEffect(() => {
    if (!open) return undefined;
    const closeOnOutsidePress = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!anchorRef.current?.contains(target) && !paletteRef.current?.contains(target)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const closeOnViewportChange = () => setOpen(false);
    document.addEventListener("pointerdown", closeOnOutsidePress);
    document.addEventListener("keydown", closeOnEscape);
    window.addEventListener("resize", closeOnViewportChange);
    window.addEventListener("scroll", closeOnViewportChange, true);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePress);
      document.removeEventListener("keydown", closeOnEscape);
      window.removeEventListener("resize", closeOnViewportChange);
      window.removeEventListener("scroll", closeOnViewportChange, true);
    };
  }, [open]);

  const togglePalette = () => {
    if (open) {
      setOpen(false);
      return;
    }
    const rect = anchorRef.current?.getBoundingClientRect();
    if (rect) {
      const left = Math.min(Math.max(8, rect.left - 13), Math.max(8, window.innerWidth - 278));
      setPosition({ top: rect.top + 50, left });
    }
    setOpen(true);
  };

  const applyColor = (color: string | null) => {
    const selected = escapeInlineHtml(selectionRef.current || "文字");
    if (color) {
      const property = background ? "background-color" : "color";
      insertMarkdown(`<span style="${property}:${color}">${selected}</span>`);
    } else {
      insertMarkdown(selected);
    }
    setOpen(false);
  };

  return (
    <span className="csdn-color-menu" ref={anchorRef}>
      <ButtonWithTooltip
        className="csdn-toolbar-action"
        title={title}
        aria-expanded={open}
        aria-haspopup="menu"
        onMouseDown={() => { selectionRef.current = selectedTextOr("文字"); }}
        onClick={togglePalette}
      >
        {background ? <Highlighter size={18} /> : <Baseline size={18} />}
        <span>{background ? "背景" : "颜色"}</span>
        <span aria-hidden className="csdn-color-caret"><ChevronDown /></span>
      </ButtonWithTooltip>
      {open && createPortal(
        <div
          aria-label={`${title}色板`}
          className="csdn-color-palette"
          ref={paletteRef}
          role="menu"
          style={{ left: position.left, top: position.top }}
        >
          <button
            aria-label={`清除${title}`}
            className="csdn-color-palette-button csdn-color-clear"
            onClick={() => applyColor(null)}
            onMouseDown={(event) => event.preventDefault()}
            role="menuitem"
            title={`清除${title}`}
            type="button"
          />
          {csdnColors.map((color, index) => (
            <button
              aria-label={`${title} ${color}`}
              className="csdn-color-palette-button"
              key={`${color}-${index}`}
              onClick={() => applyColor(color)}
              onMouseDown={(event) => event.preventDefault()}
              role="menuitem"
              style={{ backgroundColor: color }}
              title={`${title} ${color}`}
              type="button"
            />
          ))}
        </div>,
        document.body,
      )}
    </span>
  );
}

function AlignmentMenu() {
  const insertMarkdown = usePublisher(insertMarkdown$);
  const selectionRef = useRef("段落内容");
  return (
    <span
      className="csdn-alignment-menu"
      onMouseDownCapture={() => { selectionRef.current = selectedTextOr("段落内容"); }}
    >
      <ButtonOrDropdownButton
        title="段落对齐"
        items={[
          { value: "left", label: <span className="csdn-align-option"><AlignLeft size={16} />左对齐</span> },
          { value: "center", label: <span className="csdn-align-option"><AlignCenter size={16} />居中对齐</span> },
          { value: "right", label: <span className="csdn-align-option"><AlignRight size={16} />右对齐</span> },
          { value: "justify", label: <span className="csdn-align-option"><AlignJustify size={16} />两端对齐</span> },
        ]}
        onChoose={(value) => {
          const selected = escapeInlineHtml(selectionRef.current);
          insertMarkdown(`\n<div style="text-align:${value}">${selected}</div>\n`);
        }}
      >
        <AlignCenter size={18} />
        <span>对齐</span>
      </ButtonOrDropdownButton>
    </span>
  );
}

const blockTypes = [
  ["paragraph", "正文", "body"],
  ["h1", "标题一", "h1"],
  ["h2", "标题二", "h2"],
  ["h3", "标题三", "h3"],
  ["h4", "标题四", "h4"],
  ["h5", "标题五", "h5"],
  ["h6", "标题六", "h6"],
] as const;

function FormatMenu() {
  const convertSelectionToNode = usePublisher(convertSelectionToNode$);
  const anchorRef = useRef<HTMLSpanElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 98, left: 8 });

  useEffect(() => {
    if (!open) return undefined;
    const closeOnOutsidePress = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!anchorRef.current?.contains(target) && !menuRef.current?.contains(target)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const closeOnViewportChange = (event: Event) => {
      if (event.type === "scroll" && event.target instanceof Node && menuRef.current?.contains(event.target)) return;
      setOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutsidePress);
    document.addEventListener("keydown", closeOnEscape);
    window.addEventListener("resize", closeOnViewportChange);
    window.addEventListener("scroll", closeOnViewportChange, true);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePress);
      document.removeEventListener("keydown", closeOnEscape);
      window.removeEventListener("resize", closeOnViewportChange);
      window.removeEventListener("scroll", closeOnViewportChange, true);
    };
  }, [open]);

  const toggleMenu = () => {
    if (open) {
      setOpen(false);
      return;
    }
    const rect = anchorRef.current?.getBoundingClientRect();
    if (rect) {
      const left = Math.min(Math.max(8, rect.left - 2), Math.max(8, window.innerWidth - 147));
      setPosition({ top: rect.top + 50, left });
    }
    setOpen(true);
  };

  const chooseBlockType = (value: (typeof blockTypes)[number][0]) => {
    if (value === "paragraph") {
      convertSelectionToNode(() => $createParagraphNode());
    } else {
      convertSelectionToNode(() => $createHeadingNode(value));
    }
    setOpen(false);
  };

  return (
    <span className="csdn-format-menu" ref={anchorRef}>
      <ButtonWithTooltip
        aria-expanded={open}
        aria-haspopup="menu"
        className="csdn-toolbar-action"
        onClick={toggleMenu}
        onMouseDown={(event) => event.preventDefault()}
        title="格式"
      >
        <b aria-hidden className="csdn-format-trigger-icon">H</b>
        <span>格式</span>
        <span aria-hidden className="csdn-format-caret"><ChevronDown /></span>
      </ButtonWithTooltip>
      {open && createPortal(
        <div
          aria-label="格式菜单"
          className="csdn-format-menu-popup"
          ref={menuRef}
          role="menu"
          style={{ left: position.left, top: position.top }}
        >
          {blockTypes.map(([value, label, level]) => (
            <button
              className="csdn-format-menu-item"
              key={value}
              onClick={() => chooseBlockType(value)}
              onMouseDown={(event) => event.preventDefault()}
              role="menuitem"
              type="button"
            >
              <span className={`csdn-format-option csdn-format-${level}`}>{label}</span>
            </button>
          ))}
        </div>,
        document.body,
      )}
    </span>
  );
}

function MoreStyleMenu() {
  const applyFormat = usePublisher(applyFormat$);
  return (
    <ButtonOrDropdownButton
      title="其他样式"
      items={[
        { value: "italic", label: <span className="csdn-dropdown-option"><Italic size={18} />倾斜</span> },
        { value: "underline", label: <span className="csdn-dropdown-option"><Underline size={18} />下划线</span> },
        { value: "strikethrough", label: <span className="csdn-dropdown-option"><Strikethrough size={18} />删除线</span> },
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
        { value: "number", label: <span className="csdn-dropdown-option"><ListOrdered size={18} />有序列表</span> },
        { value: "bullet", label: <span className="csdn-dropdown-option"><List size={18} />无序列表</span> },
      ]}
      onChoose={(value) => applyListType(value)}
    >
      <List size={18} />
      <span>列表</span>
    </ButtonOrDropdownButton>
  );
}

function CodeMenu({ onRunnableCode }: { onRunnableCode: () => void }) {
  const insertCodeBlock = usePublisher(insertCodeBlock$);
  return (
    <ButtonOrDropdownButton
      title="代码"
      items={[
        { value: "code", label: <span className="csdn-dropdown-option"><Code2 size={18} />代码</span> },
        { value: "run", label: <span className="csdn-dropdown-option"><SquareTerminal size={18} />运行代码</span> },
      ]}
      onChoose={(value) => {
        if (value === "run") onRunnableCode();
        else insertCodeBlock({ language: "typescript", code: "// 在这里编写代码" });
      }}
    >
      <FileCode2 size={18} />
      <span>代码</span>
    </ButtonOrDropdownButton>
  );
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
    onRunnableCode,
    onInsertImage,
    onInsertVideo,
    onInsertFormula,
    onInsertLink,
    onInsertTemplate,
    onInsertResource,
    onInsertTable,
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
        insertMarkdown: (markdown) => editorRef.current?.focus(
          () => editorRef.current?.insertMarkdown(markdown),
          { defaultSelection: "rootEnd", preventScroll: true },
        ),
        getSelectionMarkdown: () => editorRef.current?.getSelectionMarkdown() ?? "",
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
              <span className="csdn-tool-group csdn-history-tools">
                <UndoRedo />
                <ToolbarAction className="csdn-history-action" label="历史" title="查看文章和草稿历史" icon={<History size={18} />} onClick={onHistory} />
              </span>
              <span className="csdn-tool-group csdn-basestyle-tools">
                <span className="csdn-format-tool"><FormatMenu /></span>
                <span className="csdn-basic-tools"><BoldItalicUnderlineToggles options={["Bold"]} /></span>
                <ColorMenu />
                <ColorMenu background />
                <span className="csdn-more-tools"><MoreStyleMenu /></span>
              </span>
              <span className="csdn-tool-group csdn-insert-tools">
                <span className="csdn-list-tools"><ListMenu /></span>
                <AlignmentMenu />
                <span className="csdn-line-tool"><InsertThematicBreak /></span>
                <InsertAction
                  className="csdn-quote-action"
                  label="块引用"
                  title="插入块引用"
                  icon={<MessageSquareQuote size={18} />}
                  buildMarkdown={() => "\n> 引用内容\n"}
                />
                <span className="csdn-code-block-tool"><CodeMenu onRunnableCode={onRunnableCode} /></span>
                <ToolbarAction className="csdn-resource-action" label="资源绑定" title="上传并绑定资源" icon={<FolderSymlink size={18} />} onClick={onInsertResource} />
                <ToolbarAction className="csdn-table-action" label="表格" title="插入表格" icon={<Table2 size={18} />} onClick={onInsertTable} />
              </span>
              <span className="csdn-tool-group csdn-otherstyle-tools">
                <ToolbarAction label="图像" title="插入图片" icon={<ImagePlus size={18} />} onClick={onInsertImage} />
                <ToolbarAction
                  label="视频"
                  title="插入视频"
                  icon={<PlaySquare size={18} />}
                  onClick={onInsertVideo}
                />
                <ToolbarAction
                  label="公式"
                  title="插入数学公式"
                  icon={<Sigma size={18} />}
                  onClick={onInsertFormula}
                />
                <ToolbarAction label="链接" title="插入链接" icon={<Link2 size={18} />} onClick={onInsertLink} />
                <ToolbarAction
                  label="模版"
                  title="插入文章模板"
                  icon={<FileStack size={18} />}
                  onClick={onInsertTemplate}
                />
                <ToolbarAction label="目录" title="显示或隐藏文章目录" icon={<ListTree size={18} />} active={outlineVisible} onClick={onToggleOutline} />
                <ToolbarAction label="宽屏" title="切换宽屏编辑" icon={<Maximize2 size={18} />} active={wide} onClick={onToggleWide} />
                <span className="csdn-toolbar-divider" />
                <ToolbarAction className="csdn-source-action" label="使用 MD 编辑器" title="使用 Markdown 源码编辑器" icon={<FileCode2 size={18} />} onClick={onSourceMode} />
              </span>
            </>
          ),
        }),
      ],
      [imageUploadHandler, onHistory, onInsertFormula, onInsertImage, onInsertLink, onInsertResource, onInsertTable, onInsertTemplate, onInsertVideo, onRunnableCode, onSourceMode, onToggleOutline, onToggleWide, outlineVisible, wide],
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
