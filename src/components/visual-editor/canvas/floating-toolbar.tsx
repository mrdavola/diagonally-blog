"use client"

import type { Editor } from "@tiptap/react"
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link,
  Palette,
} from "lucide-react"
import { useRef, useState } from "react"

interface FloatingToolbarProps {
  editor: Editor
  anchorRect: DOMRect | null
}

const HEADING_OPTIONS = [
  { label: "Paragraph", value: "paragraph" },
  { label: "Heading 1", value: "h1" },
  { label: "Heading 2", value: "h2" },
  { label: "Heading 3", value: "h3" },
] as const

type HeadingValue = (typeof HEADING_OPTIONS)[number]["value"]

function getActiveHeading(editor: Editor): HeadingValue {
  if (editor.isActive("heading", { level: 1 })) return "h1"
  if (editor.isActive("heading", { level: 2 })) return "h2"
  if (editor.isActive("heading", { level: 3 })) return "h3"
  return "paragraph"
}

function applyHeading(editor: Editor, value: HeadingValue) {
  if (value === "paragraph") {
    editor.chain().focus().setParagraph().run()
  } else {
    const level = parseInt(value.replace("h", "")) as 1 | 2 | 3
    editor.chain().focus().toggleHeading({ level }).run()
  }
}

function ToolbarButton({
  active,
  onClick,
  title,
  children,
}: {
  active?: boolean
  onClick: () => void
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      onMouseDown={(e) => {
        e.preventDefault()
        onClick()
      }}
      title={title}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 28,
        height: 28,
        borderRadius: 4,
        border: "none",
        cursor: "pointer",
        background: active ? "rgba(59,130,246,0.15)" : "transparent",
        color: active ? "#3b82f6" : "#374151",
        transition: "background 0.1s, color 0.1s",
        flexShrink: 0,
      }}
    >
      {children}
    </button>
  )
}

function Divider() {
  return (
    <div
      style={{
        width: 1,
        height: 18,
        background: "#e5e7eb",
        margin: "0 2px",
        flexShrink: 0,
      }}
    />
  )
}

export function FloatingToolbar({ editor, anchorRect }: FloatingToolbarProps) {
  const colorInputRef = useRef<HTMLInputElement>(null)
  const [showLinkInput, setShowLinkInput] = useState(false)
  const [linkValue, setLinkValue] = useState("")

  if (!anchorRect) return null

  const toolbarTop = anchorRect.top - 44
  const toolbarLeft = anchorRect.left

  function handleLinkSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (linkValue) {
      editor.chain().focus().setLink({ href: linkValue }).run()
    } else {
      editor.chain().focus().unsetLink().run()
    }
    setShowLinkInput(false)
    setLinkValue("")
  }

  function handleLinkOpen() {
    const existing = editor.getAttributes("link").href as string | undefined
    setLinkValue(existing ?? "")
    setShowLinkInput(true)
  }

  const activeHeading = getActiveHeading(editor)

  return (
    <div
      style={{
        position: "fixed",
        top: Math.max(8, toolbarTop),
        left: toolbarLeft,
        zIndex: 99999,
        display: "flex",
        alignItems: "center",
        gap: 2,
        padding: "4px 6px",
        background: "#fff",
        borderRadius: 8,
        boxShadow: "0 4px 20px rgba(0,0,0,0.15), 0 1px 4px rgba(0,0,0,0.08)",
        border: "1px solid #e5e7eb",
        pointerEvents: "all",
        userSelect: "none",
        whiteSpace: "nowrap",
        minWidth: "max-content",
      }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {/* Heading selector */}
      <select
        value={activeHeading}
        onChange={(e) => applyHeading(editor, e.target.value as HeadingValue)}
        onMouseDown={(e) => e.stopPropagation()}
        style={{
          fontSize: 12,
          fontWeight: 500,
          padding: "2px 4px",
          border: "1px solid #e5e7eb",
          borderRadius: 4,
          background: "#f9fafb",
          color: "#374151",
          cursor: "pointer",
          outline: "none",
          height: 28,
        }}
      >
        {HEADING_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <Divider />

      {/* Bold */}
      <ToolbarButton
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
        title="Bold"
      >
        <Bold size={14} />
      </ToolbarButton>

      {/* Italic */}
      <ToolbarButton
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        title="Italic"
      >
        <Italic size={14} />
      </ToolbarButton>

      {/* Underline */}
      <ToolbarButton
        active={editor.isActive("underline")}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        title="Underline"
      >
        <Underline size={14} />
      </ToolbarButton>

      <Divider />

      {/* Align Left */}
      <ToolbarButton
        active={editor.isActive({ textAlign: "left" })}
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
        title="Align left"
      >
        <AlignLeft size={14} />
      </ToolbarButton>

      {/* Align Center */}
      <ToolbarButton
        active={editor.isActive({ textAlign: "center" })}
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
        title="Align center"
      >
        <AlignCenter size={14} />
      </ToolbarButton>

      {/* Align Right */}
      <ToolbarButton
        active={editor.isActive({ textAlign: "right" })}
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
        title="Align right"
      >
        <AlignRight size={14} />
      </ToolbarButton>

      <Divider />

      {/* Link */}
      <ToolbarButton
        active={editor.isActive("link")}
        onClick={handleLinkOpen}
        title="Link"
      >
        <Link size={14} />
      </ToolbarButton>

      {/* Color */}
      <ToolbarButton
        active={false}
        onClick={() => colorInputRef.current?.click()}
        title="Text color"
      >
        <Palette size={14} />
      </ToolbarButton>
      <input
        ref={colorInputRef}
        type="color"
        defaultValue="#000000"
        onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
        style={{ display: "none" }}
        tabIndex={-1}
      />

      {/* Link input (shown inline when link is clicked) */}
      {showLinkInput && (
        <>
          <Divider />
          <form onSubmit={handleLinkSubmit} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <input
              type="url"
              value={linkValue}
              onChange={(e) => setLinkValue(e.target.value)}
              placeholder="https://..."
              autoFocus
              onMouseDown={(e) => e.stopPropagation()}
              style={{
                fontSize: 12,
                padding: "2px 6px",
                border: "1px solid #e5e7eb",
                borderRadius: 4,
                outline: "none",
                height: 28,
                width: 160,
                color: "#374151",
              }}
            />
            <button
              type="submit"
              style={{
                fontSize: 11,
                padding: "2px 8px",
                borderRadius: 4,
                border: "none",
                background: "#3b82f6",
                color: "#fff",
                cursor: "pointer",
                height: 28,
              }}
            >
              Set
            </button>
            <button
              type="button"
              onClick={() => setShowLinkInput(false)}
              style={{
                fontSize: 11,
                padding: "2px 8px",
                borderRadius: 4,
                border: "1px solid #e5e7eb",
                background: "#fff",
                color: "#6b7280",
                cursor: "pointer",
                height: 28,
              }}
            >
              Cancel
            </button>
          </form>
        </>
      )}
    </div>
  )
}
