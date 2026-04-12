"use client"

import { List, Monitor, Paintbrush, Redo2, Smartphone, Tablet, Undo2 } from "lucide-react"
import { useEditorStore } from "@/lib/visual-editor/editor-store"
import type { Viewport } from "@/lib/visual-editor/types"

interface EditorTopBarProps {
  onExit: () => void
  onSave: () => void
}

const VIEWPORT_OPTIONS: { value: Viewport; Icon: React.ComponentType<{ size?: number }> }[] = [
  { value: "desktop", Icon: Monitor },
  { value: "tablet",  Icon: Tablet },
  { value: "mobile",  Icon: Smartphone },
]

export function EditorTopBar({ onExit, onSave }: EditorTopBarProps) {
  const pageTitle    = useEditorStore(s => s.pageTitle)
  const saveStatus   = useEditorStore(s => s.saveStatus)
  const viewport     = useEditorStore(s => s.viewport)
  const undoStack    = useEditorStore(s => s.undoStack)
  const redoStack    = useEditorStore(s => s.redoStack)
  const undo         = useEditorStore(s => s.undo)
  const redo         = useEditorStore(s => s.redo)
  const setViewport  = useEditorStore(s => s.setViewport)
  const setActivePanel = useEditorStore(s => s.setActivePanel)
  const activePanel  = useEditorStore(s => s.activePanel)

  const isSaved = saveStatus === "saved"

  function handleSectionList() {
    setActivePanel(activePanel === "section-list" ? null : "section-list")
  }

  function handleGlobalStyles() {
    setActivePanel(activePanel === "global-styles" ? null : "global-styles")
  }

  return (
    <div className="h-12 bg-white border-b border-gray-200 flex items-center px-3 gap-3 shrink-0">
      {/* Left */}
      <div className="flex items-center gap-2">
        <button
          onClick={onSave}
          disabled={isSaved}
          className="h-7 px-3 text-sm font-medium bg-black text-white rounded disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors"
        >
          Save
        </button>
        <button
          onClick={onExit}
          className="h-7 px-3 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          Exit
        </button>
      </div>

      {/* Center */}
      <div className="flex-1 flex items-center justify-center gap-1.5 min-w-0">
        <span className="font-medium text-sm text-gray-900 truncate">{pageTitle}</span>
        <span className="text-gray-400 text-sm select-none">·</span>
        <span className={`text-xs font-medium ${isSaved ? "text-gray-400" : "text-amber-500"}`}>
          {saveStatus === "saving" ? "Saving…" : isSaved ? "Saved" : "Unsaved"}
        </span>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1">
        {/* Undo / Redo */}
        <button
          onClick={undo}
          disabled={undoStack.length === 0}
          title="Undo"
          className="h-7 w-7 flex items-center justify-center rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <Undo2 size={15} />
        </button>
        <button
          onClick={redo}
          disabled={redoStack.length === 0}
          title="Redo"
          className="h-7 w-7 flex items-center justify-center rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <Redo2 size={15} />
        </button>

        {/* Divider */}
        <div className="w-px h-5 bg-gray-200 mx-1" />

        {/* Viewport toggle */}
        <div className="flex items-center bg-gray-100 rounded-full p-0.5 gap-0.5">
          {VIEWPORT_OPTIONS.map(({ value, Icon }) => (
            <button
              key={value}
              onClick={() => setViewport(value)}
              title={value.charAt(0).toUpperCase() + value.slice(1)}
              className={`h-6 w-6 flex items-center justify-center rounded-full transition-all ${
                viewport === value
                  ? "bg-white shadow text-gray-900"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Icon size={13} />
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className="w-px h-5 bg-gray-200 mx-1" />

        {/* Sections list */}
        <button
          onClick={handleSectionList}
          title="Sections"
          className={`h-7 w-7 flex items-center justify-center rounded transition-colors ${
            activePanel === "section-list"
              ? "bg-gray-900 text-white"
              : "hover:bg-gray-100 text-gray-600"
          }`}
        >
          <List size={15} />
        </button>

        {/* Global styles */}
        <button
          onClick={handleGlobalStyles}
          title="Global styles"
          className={`h-7 w-7 flex items-center justify-center rounded transition-colors ${
            activePanel === "global-styles"
              ? "bg-gray-900 text-white"
              : "hover:bg-gray-100 text-gray-600"
          }`}
        >
          <Paintbrush size={15} />
        </button>
      </div>
    </div>
  )
}
