"use client"

import { useState, useRef, useEffect } from "react"
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
  Palette,
  Highlighter,
  Check,
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

const TEXT_COLORS = [
  { label: "Default", value: null },
  { label: "White", value: "#ffffff" },
  { label: "Light Gray", value: "#94a3b8" },
  { label: "Blue", value: "#60a5fa" },
  { label: "Green", value: "#34d399" },
  { label: "Gold", value: "#f59e0b" },
  { label: "Red", value: "#ef4444" },
  { label: "Purple", value: "#a78bfa" },
  { label: "Pink", value: "#f472b6" },
]

const HIGHLIGHT_COLORS = [
  { label: "Remove", value: null },
  { label: "Yellow", value: "#fef08a" },
  { label: "Green", value: "#bbf7d0" },
  { label: "Blue", value: "#bfdbfe" },
  { label: "Pink", value: "#fbcfe8" },
  { label: "Purple", value: "#e9d5ff" },
  { label: "Orange", value: "#fed7aa" },
]

interface ColorPickerProps {
  colors: { label: string; value: string | null }[]
  activeColor: string | null
  onSelect: (color: string | null) => void
  onClose: () => void
}

function ColorPicker({ colors, activeColor, onSelect, onClose }: ColorPickerProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [onClose])

  return (
    <div
      ref={ref}
      className="absolute top-full left-0 mt-1 z-50 bg-space-deep border border-white/15 rounded-lg p-2 shadow-xl"
    >
      <div className="grid grid-cols-4 gap-1.5">
        {colors.map((c) => (
          <button
            key={c.label}
            type="button"
            title={c.label}
            onClick={() => {
              onSelect(c.value)
              onClose()
            }}
            className={`w-6 h-6 rounded-full cursor-pointer border transition-transform hover:scale-110 flex items-center justify-center ${
              c.value === null
                ? "border-white/30 bg-white/10"
                : "border-white/20"
            } ${activeColor === c.value ? "ring-2 ring-white/60 ring-offset-1 ring-offset-space-deep" : ""}`}
            style={c.value ? { backgroundColor: c.value } : undefined}
          >
            {c.value === null && (
              <span className="text-white/60 text-[10px] font-bold leading-none">✕</span>
            )}
            {activeColor === c.value && c.value !== null && (
              <Check className="w-3 h-3 text-black/70" />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

interface ColorButtonProps {
  editor: Editor
  type: "text" | "highlight"
}

function ColorButton({ editor, type }: ColorButtonProps) {
  const [open, setOpen] = useState(false)

  const activeColor: string | null =
    type === "text"
      ? editor.getAttributes("textStyle").color ?? null
      : editor.getAttributes("highlight").color ?? null

  function handleSelect(color: string | null) {
    if (type === "text") {
      if (color) {
        editor.chain().focus().setColor(color).run()
      } else {
        editor.chain().focus().unsetColor().run()
      }
    } else {
      if (color) {
        editor.chain().focus().toggleHighlight({ color }).run()
      } else {
        editor.chain().focus().unsetHighlight().run()
      }
    }
  }

  const Icon = type === "text" ? Palette : Highlighter
  const title = type === "text" ? "Text Color" : "Highlight Color"
  const colors = type === "text" ? TEXT_COLORS : HIGHLIGHT_COLORS

  return (
    <div className="relative">
      <button
        type="button"
        title={title}
        onClick={() => setOpen((v) => !v)}
        className={`p-1.5 rounded hover:bg-white/10 transition-colors flex flex-col items-center gap-0.5 ${
          open ? "bg-white/15 text-blue-primary" : "text-text-light/60"
        }`}
      >
        <Icon className="w-4 h-4" />
        {/* Active color indicator underline */}
        <div
          className="w-4 h-0.5 rounded-full"
          style={{ backgroundColor: activeColor ?? "transparent", border: activeColor ? undefined : "1px solid rgba(255,255,255,0.2)" }}
        />
      </button>
      {open && (
        <ColorPicker
          colors={colors}
          activeColor={activeColor}
          onSelect={handleSelect}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  )
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

      {/* Group 1b — Color pickers */}
      <ColorButton editor={ed} type="text" />
      <ColorButton editor={ed} type="highlight" />

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
