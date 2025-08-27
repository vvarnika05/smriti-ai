"use client"
import React, { useRef, useState } from "react"
import RichTextEditor from "@/components/notes/RichTextEditor"
import { MDXEditorMethods } from "@mdxeditor/editor"

export default function Page() {
  const [content, setContent] = useState("")
  const editorRef = useRef<MDXEditorMethods>(null)

  return (
    <div className="p-6">
      <RichTextEditor
        value={content}
        editorRef={editorRef}
        fieldChange={setContent}
      />
       <div className="mt-4 p-3 border rounded">
        <h3 className="font-semibold mb-2">Markdown debug:</h3>
        <pre className="whitespace-pre-wrap text-sm">{content}</pre>
      </div>
    </div>
    
  )
}
