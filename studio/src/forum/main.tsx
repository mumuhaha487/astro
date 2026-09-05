import { createRoot } from "react-dom/client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import { MdxEditorSlot, type MdxEditorSlotHandle } from "../client/MdxEditorSlot";
import "../client/styles.css";
import "./style.css";

const MAX_IMAGE_BYTES = 680 * 1024;

function App() {
  const editor = useRef<MdxEditorSlotHandle>(null);
  const [content, setContent] = useState("");
  const [sourceMode, setSourceMode] = useState(false);
  const [outlineVisible, setOutlineVisible] = useState(false);
  const [wide, setWide] = useState(false);
  const [epoch, setEpoch] = useState(0);
  const [notice, setNotice] = useState("");

  const publish = useCallback((next: string) => {
    setContent(next);
    parent.postMessage({ source: "mumu-forum-editor", type: "change", content: next }, location.origin);
  }, []);

  useEffect(() => {
    const receive = (event: MessageEvent) => {
      if (event.origin !== location.origin || event.data?.source !== "mumu-forum" || event.data?.type !== "set-content") return;
      const next = String(event.data.content || "");
      setContent(next);
      setSourceMode(false);
      setEpoch((value) => value + 1);
    };
    addEventListener("message", receive);
    parent.postMessage({ source: "mumu-forum-editor", type: "ready" }, location.origin);
    return () => removeEventListener("message", receive);
  }, []);

  const insert = useCallback((markdown: string) => {
    if (sourceMode) publish(`${content}${content && !content.endsWith("\n") ? "\n" : ""}${markdown}`);
    else editor.current?.insertMarkdown(markdown);
  }, [content, publish, sourceMode]);

  const promptInsert = useCallback((label: string, build: (value: string) => string) => {
    const value = prompt(label)?.trim();
    if (value) insert(build(value));
  }, [insert]);

  const uploadImage = useCallback(async (file: File) => {
    if (file.size > MAX_IMAGE_BYTES) throw new Error("论坛图片不能超过 680KB");
    const data = await fileToBase64(file);
    const response = await fetch("/api/forum/media", { method: "POST", credentials: "same-origin", headers: { "content-type": "application/json" }, body: JSON.stringify({ name: file.name, type: file.type, data }) });
    const result = await response.json().catch(() => ({})) as { error?: string; url?: string };
    if (!response.ok) throw new Error(result.error || "图片上传失败");
    if (!result.url) throw new Error("图片上传结果无效");
    return result.url;
  }, []);

  const outline = useMemo(() => content.split("\n").map((line, index) => {
    const match = /^(#{1,6})\s+(.+)/.exec(line);
    return match ? { depth: match[1].length, text: match[2], line: index + 1 } : null;
  }).filter(Boolean) as Array<{ depth: number; text: string; line: number }>, [content]);

  const toggleSource = () => {
    if (!sourceMode) setContent(editor.current?.getMarkdown() || content);
    else setEpoch((value) => value + 1);
    setSourceMode((value) => !value);
  };

  const notify = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2200);
  };

  return <main className={`forum-editor-app ${wide ? "wide" : ""}`}>
    <section className="forum-editor-surface">
      {sourceMode ? <textarea className="forum-source" value={content} onChange={(event) => publish(event.target.value)} spellCheck={false} aria-label="Markdown 源码" /> :
        <MdxEditorSlot
          key={epoch}
          ref={editor}
          initialValue={content}
          onChange={publish}
          onUploadImage={uploadImage}
          onSourceMode={toggleSource}
          onHistory={() => notify("可使用工具栏撤销与重做")}
          onToggleOutline={() => setOutlineVisible((value) => !value)}
          onToggleWide={() => setWide((value) => !value)}
          onRunnableCode={() => insert("\n```html\n<!-- 在这里输入代码 -->\n```\n")}
          onInsertImage={() => promptInsert("图片 URL", (url) => `\n![图片](${url})\n`)}
          onInsertVideo={() => promptInsert("视频 URL", (url) => `\n[视频](${url})\n`)}
          onInsertFormula={() => promptInsert("LaTeX 公式", (formula) => `\n$$\n${formula}\n$$\n`)}
          onInsertLink={() => promptInsert("链接 URL", (url) => `[链接](${url})`)}
          onInsertTemplate={() => insert("\n## 标题\n\n在这里输入内容。\n")}
          onInsertResource={() => promptInsert("资源 URL", (url) => `[资源下载](${url})`)}
          onInsertWebPage={() => promptInsert("网页 URL", (url) => `[打开网页](${url})`)}
          onInsertTable={() => insert("\n| 列 1 | 列 2 |\n| --- | --- |\n| 内容 | 内容 |\n")}
          onResolveLinkTitle={async (url) => url}
          outlineVisible={outlineVisible}
          wide={wide}
        />}
    </section>
    {outlineVisible && <aside className="forum-editor-outline"><strong>目录</strong>{outline.length ? outline.map((item) => <button key={`${item.line}-${item.text}`} style={{ paddingLeft: `${8 + (item.depth - 1) * 10}px` }} type="button">{item.text}</button>) : <span>添加标题后将在这里显示</span>}</aside>}
    {sourceMode && <button className="forum-rich-return" type="button" onClick={toggleSource}>返回富文本</button>}
    {notice && <div className="forum-editor-notice">{notice}</div>}
  </main>;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || "").split(",")[1] || "");
    reader.onerror = () => reject(new Error("读取图片失败"));
    reader.readAsDataURL(file);
  });
}

createRoot(document.getElementById("forum-editor-root")!).render(<App />);
