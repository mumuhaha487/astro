/**
 * Adapted from Pageel CMS packages/plugin-mdx/src/MdxSlot.tsx (MIT).
 * See studio/THIRD_PARTY_NOTICES.md.
 */
import {
  BlockTypeSelect,
  BoldItalicUnderlineToggles,
  CodeToggle,
  CreateLink,
  InsertImage,
  InsertTable,
  ListsToggle,
  MDXEditor,
  UndoRedo,
  codeBlockPlugin,
  headingsPlugin,
  imagePlugin,
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
} from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";
import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";

export interface MdxEditorSlotProps {
  initialValue: string;
  onChange: (markdown: string) => void;
  onUploadImage: (file: File) => Promise<string>;
  readOnly?: boolean;
}

export interface MdxEditorSlotHandle {
  getMarkdown: () => string;
  setMarkdown: (markdown: string) => void;
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
  function MdxEditorSlot({ initialValue, onChange, onUploadImage, readOnly }, forwardedRef) {
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
        markdownShortcutPlugin(),
        toolbarPlugin({
          toolbarContents: () => (
            <>
              <UndoRedo />
              <BlockTypeSelect />
              <BoldItalicUnderlineToggles />
              <CodeToggle />
              <ListsToggle />
              <CreateLink />
              <InsertImage />
              <InsertTable />
            </>
          ),
        }),
      ],
      [imageUploadHandler],
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
        />
      </div>
    );
  },
);
