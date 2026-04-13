"use client"

import { useEffect, useRef, useState } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import Link from "@tiptap/extension-link"
import Underline from "@tiptap/extension-underline"
import TextAlign from "@tiptap/extension-text-align"
import { TextStyle } from "@tiptap/extension-text-style"
import Color from "@tiptap/extension-color"
import type { EditorBlock } from "@/lib/visual-editor/types"
import { sendToParent } from "@/lib/visual-editor/message-bridge"
import { useInlineEdit, useSectionId } from "@/components/visual-editor/canvas/inline-edit-context"
import { FloatingToolbar } from "@/components/visual-editor/canvas/floating-toolbar"

interface TextBlockProps {
  block: EditorBlock
}

// ─── Inline TipTap editor ────────────────────────────────────────────────────

interface InlineEditorProps {
  block: EditorBlock
  sectionId: string
  onStop: () => void
}

function InlineEditor({ block, sectionId, onStop }: InlineEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null)

  const content =
    typeof block.props.content === "string"
      ? block.props.content
      : "<p>Click to edit text...</p>"

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: "Type something..." }),
      Link.configure({ openOnClick: false, autolink: true }),
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TextStyle,
      Color,
    ],
    content,
    autofocus: true,
    immediatelyRender: false,
    onUpdate({ editor: ed }) {
      sendToParent({
        type: "CONTENT_CHANGED",
        payload: {
          sectionId,
          blockId: block.id,
          props: { ...block.props, content: ed.getHTML() },
        },
      })
    },
  })

  // Track the container rect for toolbar positioning
  useEffect(() => {
    if (!containerRef.current) return

    function updateRect() {
      if (containerRef.current) {
        setAnchorRect(containerRef.current.getBoundingClientRect())
      }
    }

    updateRect()
    window.addEventListener("resize", updateRect)
    window.addEventListener("scroll", updateRect, true)
    return () => {
      window.removeEventListener("resize", updateRect)
      window.removeEventListener("scroll", updateRect, true)
    }
  }, [])

  // Click-outside to stop editing
  useEffect(() => {
    function handlePointerDown(e: PointerEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        // Allow toolbar clicks (toolbar is outside the container but inside the document)
        const toolbar = document.querySelector("[data-floating-toolbar]")
        if (toolbar && toolbar.contains(e.target as Node)) return
        onStop()
      }
    }
    // Use capture so we get it before TipTap
    document.addEventListener("pointerdown", handlePointerDown, true)
    return () => document.removeEventListener("pointerdown", handlePointerDown, true)
  }, [onStop])

  return (
    <>
      {editor && (
        <div data-floating-toolbar>
          <FloatingToolbar editor={editor} anchorRect={anchorRect} />
        </div>
      )}
      <div
        ref={containerRef}
        className="prose-diagonally max-w-none"
        style={{ outline: "none", cursor: "text" }}
      >
        <EditorContent editor={editor} />
      </div>
    </>
  )
}

// ─── Text Block ──────────────────────────────────────────────────────────────

export function TextBlock({ block }: TextBlockProps) {
  const { editingBlockId, stopEditing } = useInlineEdit()
  const sectionId = useSectionId()
  const isEditing = editingBlockId === block.id

  const content =
    typeof block.props.content === "string"
      ? block.props.content
      : "<p>Click to edit text...</p>"

  if (isEditing) {
    return (
      <InlineEditor
        block={block}
        sectionId={sectionId}
        onStop={stopEditing}
      />
    )
  }

  return (
    <div
      className="prose-diagonally max-w-none"
      style={{ fontFamily: "var(--site-body-font, inherit)" }}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  )
}
