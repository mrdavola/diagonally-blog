"use client"

import type { Editor } from "@tiptap/react"
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Heading2,
  Heading3,
  Heading4,
  Quote,
  Braces,
  List,
  ListOrdered,
  ListChecks,
  ImageIcon,
  Video,
  Globe,
  Table,
  Minus,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from "lucide-react"

interface TiptapToolbarProps {
  editor: Editor | null
  onOpenMedia: (tab: "image" | "video" | "embed") => void
}

interface ToolbarButtonProps {
  onClick: () => void
  isActive?: boolean
  title: string
  icon: React.ElementType
}

function ToolbarButton({ onClick, isActive, title, icon: Icon }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded hover:bg-white/10 transition-colors ${
        isActive
          ? "bg-white/15 text-blue-primary"
          : "text-text-light/60"
      }`}
    >
      <Icon className="w-4 h-4" />
    </button>
  )
}

function Separator() {
  return <div className="w-px h-5 bg-white/10 mx-1" />
}

export function TiptapToolbar({ editor, onOpenMedia }: TiptapToolbarProps) {
  if (!editor) return null

  const ed = editor

  function handleTable() {
    ed.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
  }

  return (
    <div className="flex items-center flex-wrap gap-0.5 px-3 py-2 border-b border-white/10 bg-space-deep/40">
      {/* Group 1 — Text formatting */}
      <ToolbarButton
        onClick={() => ed.chain().focus().toggleBold().run()}
        isActive={ed.isActive("bold")}
        title="Bold (Ctrl+B)"
        icon={Bold}
      />
      <ToolbarButton
        onClick={() => ed.chain().focus().toggleItalic().run()}
        isActive={ed.isActive("italic")}
        title="Italic (Ctrl+I)"
        icon={Italic}
      />
      <ToolbarButton
        onClick={() => ed.chain().focus().toggleUnderline().run()}
        isActive={ed.isActive("underline")}
        title="Underline (Ctrl+U)"
        icon={Underline}
      />
      <ToolbarButton
        onClick={() => ed.chain().focus().toggleStrike().run()}
        isActive={ed.isActive("strike")}
        title="Strikethrough"
        icon={Strikethrough}
      />
      <ToolbarButton
        onClick={() => ed.chain().focus().toggleCode().run()}
        isActive={ed.isActive("code")}
        title="Inline Code"
        icon={Code}
      />

      <Separator />

      {/* Group 2 — Block types */}
      <ToolbarButton
        onClick={() => ed.chain().focus().toggleHeading({ level: 2 }).run()}
        isActive={ed.isActive("heading", { level: 2 })}
        title="Heading 2"
        icon={Heading2}
      />
      <ToolbarButton
        onClick={() => ed.chain().focus().toggleHeading({ level: 3 }).run()}
        isActive={ed.isActive("heading", { level: 3 })}
        title="Heading 3"
        icon={Heading3}
      />
      <ToolbarButton
        onClick={() => ed.chain().focus().toggleHeading({ level: 4 }).run()}
        isActive={ed.isActive("heading", { level: 4 })}
        title="Heading 4"
        icon={Heading4}
      />
      <ToolbarButton
        onClick={() => ed.chain().focus().toggleBlockquote().run()}
        isActive={ed.isActive("blockquote")}
        title="Blockquote"
        icon={Quote}
      />
      <ToolbarButton
        onClick={() => ed.chain().focus().toggleCodeBlock().run()}
        isActive={ed.isActive("codeBlock")}
        title="Code Block"
        icon={Braces}
      />

      <Separator />

      {/* Group 3 — Lists */}
      <ToolbarButton
        onClick={() => ed.chain().focus().toggleBulletList().run()}
        isActive={ed.isActive("bulletList")}
        title="Bullet List"
        icon={List}
      />
      <ToolbarButton
        onClick={() => ed.chain().focus().toggleOrderedList().run()}
        isActive={ed.isActive("orderedList")}
        title="Ordered List"
        icon={ListOrdered}
      />
      <ToolbarButton
        onClick={() => ed.chain().focus().toggleTaskList().run()}
        isActive={ed.isActive("taskList")}
        title="Task List"
        icon={ListChecks}
      />

      <Separator />

      {/* Group 4 — Insert (media) */}
      <ToolbarButton
        onClick={() => onOpenMedia("image")}
        isActive={false}
        title="Insert Image"
        icon={ImageIcon}
      />
      <ToolbarButton
        onClick={() => onOpenMedia("video")}
        isActive={false}
        title="Insert Video"
        icon={Video}
      />
      <ToolbarButton
        onClick={() => onOpenMedia("embed")}
        isActive={false}
        title="Insert Embed"
        icon={Globe}
      />
      <ToolbarButton
        onClick={handleTable}
        isActive={ed.isActive("table")}
        title="Insert Table"
        icon={Table}
      />
      <ToolbarButton
        onClick={() => ed.chain().focus().setHorizontalRule().run()}
        isActive={false}
        title="Horizontal Rule"
        icon={Minus}
      />

      <Separator />

      {/* Group 5 — Alignment */}
      <ToolbarButton
        onClick={() => ed.chain().focus().setTextAlign("left").run()}
        isActive={ed.isActive({ textAlign: "left" })}
        title="Align Left"
        icon={AlignLeft}
      />
      <ToolbarButton
        onClick={() => ed.chain().focus().setTextAlign("center").run()}
        isActive={ed.isActive({ textAlign: "center" })}
        title="Align Center"
        icon={AlignCenter}
      />
      <ToolbarButton
        onClick={() => ed.chain().focus().setTextAlign("right").run()}
        isActive={ed.isActive({ textAlign: "right" })}
        title="Align Right"
        icon={AlignRight}
      />
    </div>
  )
}
