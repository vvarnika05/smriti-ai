// components/notes/RichTextEditor.tsx
"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import axios from "axios";
import {
  MDXEditor,
  headingsPlugin,
  listsPlugin,
  linkPlugin,
  linkDialogPlugin,
  quotePlugin,
  tablePlugin,
  imagePlugin,
  codeBlockPlugin,
  codeMirrorPlugin,
  markdownShortcutPlugin,
  toolbarPlugin,
  ConditionalContents,
  ChangeCodeMirrorLanguage,
  UndoRedo,
  BoldItalicUnderlineToggles,
  ListsToggle,
  CreateLink,
  InsertImage,
  InsertTable,
  InsertCodeBlock,
  Separator,
  InsertThematicBreak,
  diffSourcePlugin,
  thematicBreakPlugin,
  MDXEditorMethods,
  BlockTypeSelect
} from "@mdxeditor/editor";

import "@mdxeditor/editor/style.css";
import "./editor.css";

import { Button } from "@/components/ui/button";
import { LoaderCircle, AlertTriangle, Edit2 } from "lucide-react";

type Status = "loading" | "error" | "idle";

export default function RichNoteEditor({
  topicId,
  mock = false, // default to mock/localStorage while testing
}: {
  topicId: string;
  mock?: boolean;
}) {
  const [note, setNote] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  const [savedAtEditStart, setSavedAtEditStart] = useState<string>("");
  const [status, setStatus] = useState<Status>("loading");
 

  // --- mock helpers (localStorage) ---
  const lsKey = `notes:${topicId}`;
  const loadMock = () => {
    try {
      const raw = localStorage.getItem(lsKey);
      if (!raw) return "";
      const obj = JSON.parse(raw) as { content: string };
      return obj?.content || "";
    } catch {
      return "";
    }
  };
  const saveMock = (content: string) => {
    localStorage.setItem(lsKey, JSON.stringify({ content }));
  };

  useEffect(() => {
    const run = async () => {
      try {
        if (mock) {
          setNote(loadMock());
          setStatus("idle");
          return;
        }
        const res = await axios.get<{ content?: string } | null>(`/api/notes/${topicId}`);
        setNote(res.data?.content || "");
        setStatus("idle");
      } catch (e) {
        console.error("Failed to fetch note:", e);
        setStatus("error");
      }
    };
    run();
  }, [topicId, mock]);
    const basePlugins = useMemo(() => [
    headingsPlugin(),
    listsPlugin(),
    linkPlugin(),
    linkDialogPlugin(),
    quotePlugin(),
    tablePlugin(),
    imagePlugin(),
    thematicBreakPlugin(),
    codeBlockPlugin({ defaultCodeBlockLanguage: "" }),
    codeMirrorPlugin({
      codeBlockLanguages: {
        css: "css",
        txt: "txt",
        sql: "sql",
        html: "html",
        sass: "sass",
        scss: "scss",
        bash: "bash",
        json: "json",
        js: "javascript",
        ts: "typescript",
        "": "unspecified",
        tsx: "TypeScript (React)",
        jsx: "JavaScript (React)"
      },
      autoLoadLanguageSupport: true
    }),
    diffSourcePlugin({ viewMode: "rich-text", diffMarkdown: "" }),
  ], []);

  const handleSave = async () => {
    try {
      if (mock) {
        saveMock(note);
        setIsEditing(false);
        return;
      }
      await axios.patch(`/api/notes/${topicId}`, { content: note });
      setIsEditing(false);
    } catch (e) {
      console.error("Failed to save note:", e);
      setStatus("error");
    }
  };

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center h-40">
        <LoaderCircle className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex flex-col justify-center items-center h-40 text-destructive bg-destructive/10 rounded-md">
        <AlertTriangle className="h-8 w-8 mb-2" />
        <p>Failed to load or save note. Please refresh.</p>
      </div>
    );
  }



  return (
    <div className="custom-mdx-editor-wrapper p-4 border rounded-md min-h-[200px] prose dark:prose-invert">
      {isEditing ? (
        <div className="flex flex-col gap-4">
          <MDXEditor
            markdown={note}        
            onChange={setNote}
            className="w-full border-0 rounded-none shadow-none custom-mdx-editor"
            contentEditableClassName="custom-editor-content"
            plugins={[
              ...basePlugins,
              toolbarPlugin({
                toolbarContents: () => (
                  <ConditionalContents
                    options={[
                      {
                        when: (editor) => editor?.editorType === "codeblock",
                        contents: () => <ChangeCodeMirrorLanguage />,
                      },
                      {
                        fallback: () => (
                          <>
                            <UndoRedo />
                            <Separator />
                            <BoldItalicUnderlineToggles />
                            <Separator />
                            <BlockTypeSelect />
                            <Separator />
                            <ListsToggle />
                            <Separator />
                            <CreateLink />
                            <InsertImage />
                            <Separator />
                            <InsertTable />
                            <Separator />
                            <InsertThematicBreak />
                            <Separator />
                            <InsertCodeBlock />
                          </>
                        ),
                      },
                    ]}
                  />
                ),
              }),
              markdownShortcutPlugin(),
            ]}
          />

          <div className="flex justify-end gap-2">
             <Button
              variant="ghost"
              type="button"
              onClick={() => {
                setNote(savedAtEditStart);
                setIsEditing(false);
             }}
            >
              Cancel
            </Button>
            <Button type="button" onClick={handleSave}>Save</Button>
          </div>
        </div>
      ) : (
        <div>
          {/* Button ABOVE the editor (no overlay, always clickable) */}
          <div className="flex justify-end mb-2">
            <Button
              variant="ghost"
              size="icon"
              type="button"
              onClick={() => {
                setSavedAtEditStart(note);
                setIsEditing(true);
              }}
              aria-label="Edit note"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
          </div>

          <MDXEditor
            markdown={note || " "}
            readOnly
            className="w-full border-0 rounded-none shadow-none custom-mdx-editor"
            contentEditableClassName="custom-editor-content"
            plugins={[...basePlugins]}
          />

          {!note && (
            <p className="text-muted-foreground text-sm italic">
              No notes yet. Click the edit icon to start writing.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
