"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Extension } from "@tiptap/core"
import type { Editor } from "@tiptap/react"
import {
  Heading2,
  Heading3,
  List,
  ListOrdered,
  ListChecks,
  Quote,
  Braces,
  Image as ImageIcon,
  Table as TableIcon,
  Minus,
} from "lucide-react"

// ─── Slash command items ───────────────────────────────────────────────────────

interface SlashItem {
  title: string
  icon: React.ElementType
  command: (editor: Editor) => void
}

const SLASH_ITEMS: SlashItem[] = [
  {
    title: "Heading 2",
    icon: Heading2,
    command: (editor) => editor.chain().focus().toggleHeading({ level: 2 }).run(),
  },
  {
    title: "Heading 3",
    icon: Heading3,
    command: (editor) => editor.chain().focus().toggleHeading({ level: 3 }).run(),
  },
  {
    title: "Bullet List",
    icon: List,
    command: (editor) => editor.chain().focus().toggleBulletList().run(),
  },
  {
    title: "Numbered List",
    icon: ListOrdered,
    command: (editor) => editor.chain().focus().toggleOrderedList().run(),
  },
  {
    title: "Task List",
    icon: ListChecks,
    command: (editor) => editor.chain().focus().toggleTaskList().run(),
  },
  {
    title: "Quote",
    icon: Quote,
    command: (editor) => editor.chain().focus().toggleBlockquote().run(),
  },
  {
    title: "Code Block",
    icon: Braces,
    command: (editor) => editor.chain().focus().toggleCodeBlock().run(),
  },
  {
    title: "Image",
    icon: ImageIcon,
    command: (editor) => {
      const url = window.prompt("Image URL:")
      if (url) editor.chain().focus().setImage({ src: url }).run()
    },
  },
  {
    title: "Table",
    icon: TableIcon,
    command: (editor) =>
      editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
  },
  {
    title: "Divider",
    icon: Minus,
    command: (editor) => editor.chain().focus().setHorizontalRule().run(),
  },
]

// ─── Extension ────────────────────────────────────────────────────────────────
// Emits a custom event so the SlashMenu component can react without
// coupling the extension to React rendering.

declare global {
  interface WindowEventMap {
    "tiptap:slash": CustomEvent<SlashEventDetail>
  }
}

interface SlashEventDetail {
  query: string
  coords: { top: number; left: number } | null
}

export const SlashMenuExtension = Extension.create({
  name: "slashMenu",

  addKeyboardShortcuts() {
    return {
      Escape: () => {
        window.dispatchEvent(
          new CustomEvent<SlashEventDetail>("tiptap:slash", {
            detail: { query: "", coords: null },
          }),
        )
        return false
      },
    }
  },

  onUpdate() {
    const { state, view } = this.editor
    const { selection } = state
    const { $from } = selection

    // Only act on cursor selections (not ranges)
    if (selection.from !== selection.to) {
      window.dispatchEvent(
        new CustomEvent<SlashEventDetail>("tiptap:slash", {
          detail: { query: "", coords: null },
        }),
      )
      return
    }

    const lineText = $from.nodeBefore?.textContent ?? ""
    const slashIndex = lineText.lastIndexOf("/")

    if (slashIndex === -1) {
      window.dispatchEvent(
        new CustomEvent<SlashEventDetail>("tiptap:slash", {
          detail: { query: "", coords: null },
        }),
      )
      return
    }

    // Check that the slash is at the beginning of a node or after whitespace
    const charBefore = slashIndex > 0 ? lineText[slashIndex - 1] : " "
    if (charBefore !== " " && charBefore !== "\n" && slashIndex !== 0) {
      window.dispatchEvent(
        new CustomEvent<SlashEventDetail>("tiptap:slash", {
          detail: { query: "", coords: null },
        }),
      )
      return
    }

    const query = lineText.slice(slashIndex + 1)
    const coords = view.coordsAtPos(selection.from)

    window.dispatchEvent(
      new CustomEvent<SlashEventDetail>("tiptap:slash", {
        detail: {
          query,
          coords: { top: coords.bottom, left: coords.left },
        },
      }),
    )
  },
})

// ─── SlashMenu React component ─────────────────────────────────────────────────

interface SlashMenuProps {
  editor: Editor | null
}

export function SlashMenu({ editor }: SlashMenuProps) {
  const [query, setQuery] = useState("")
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const filteredItems = SLASH_ITEMS.filter((item) =>
    item.title.toLowerCase().includes(query.toLowerCase()),
  )

  const isOpen = coords !== null && filteredItems.length > 0

  // Listen for the custom event emitted by the extension
  useEffect(() => {
    function handler(e: CustomEvent<SlashEventDetail>) {
      if (e.detail.coords === null) {
        setCoords(null)
        setQuery("")
        setActiveIndex(0)
      } else {
        setCoords(e.detail.coords)
        setQuery(e.detail.query)
        setActiveIndex(0)
      }
    }

    window.addEventListener("tiptap:slash", handler)
    return () => window.removeEventListener("tiptap:slash", handler)
  }, [])

  const executeItem = useCallback(
    (item: SlashItem) => {
      if (!editor) return

      // Delete the slash + query text before inserting
      const charsToDelete = query.length + 1 // +1 for the "/"
      editor
        .chain()
        .focus()
        .deleteRange({
          from: editor.state.selection.from - charsToDelete,
          to: editor.state.selection.from,
        })
        .run()

      item.command(editor)
      setCoords(null)
      setQuery("")
      setActiveIndex(0)
    },
    [editor, query],
  )

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowDown") {
        e.preventDefault()
        setActiveIndex((i) => Math.min(i + 1, filteredItems.length - 1))
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        setActiveIndex((i) => Math.max(i - 1, 0))
      } else if (e.key === "Enter") {
        e.preventDefault()
        const item = filteredItems[activeIndex]
        if (item) executeItem(item)
      } else if (e.key === "Escape") {
        setCoords(null)
        setQuery("")
        setActiveIndex(0)
      }
    }

    window.addEventListener("keydown", onKeyDown, { capture: true })
    return () => window.removeEventListener("keydown", onKeyDown, { capture: true })
  }, [isOpen, filteredItems, activeIndex, executeItem])

  // Close when clicking outside
  useEffect(() => {
    if (!isOpen) return

    function onMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setCoords(null)
        setQuery("")
        setActiveIndex(0)
      }
    }

    document.addEventListener("mousedown", onMouseDown)
    return () => document.removeEventListener("mousedown", onMouseDown)
  }, [isOpen])

  if (!isOpen || !coords) return null

  return (
    <div
      ref={containerRef}
      className="fixed z-50 bg-space-deep border border-white/10 rounded-lg shadow-lg overflow-hidden"
      style={{ top: coords.top + 8, left: coords.left, minWidth: 200 }}
    >
      {filteredItems.map((item, index) => {
        const Icon = item.icon
        const isActive = index === activeIndex
        return (
          <button
            key={item.title}
            type="button"
            onMouseDown={(e) => {
              e.preventDefault()
              executeItem(item)
            }}
            onMouseEnter={() => setActiveIndex(index)}
            className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors text-left ${
              isActive
                ? "bg-white/10 text-white"
                : "text-text-light/70 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span>{item.title}</span>
          </button>
        )
      })}
    </div>
  )
}
