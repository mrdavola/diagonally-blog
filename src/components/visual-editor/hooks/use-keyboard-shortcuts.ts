// src/components/visual-editor/hooks/use-keyboard-shortcuts.ts
"use client"

import { useEffect } from "react"
import { useEditorStore } from "@/lib/visual-editor/editor-store"

interface UseKeyboardShortcutsOptions {
  onManualSave: () => void
}

export function useKeyboardShortcuts({ onManualSave }: UseKeyboardShortcutsOptions) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Don't fire shortcuts while typing in an input or contenteditable
      const target = e.target as HTMLElement
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return
      }

      const isMac = navigator.platform.toUpperCase().includes("MAC")
      const ctrl = isMac ? e.metaKey : e.ctrlKey
      const store = useEditorStore.getState()

      // ── Escape ─────────────────────────────────────────────────────────────
      if (e.key === "Escape") {
        if (store.activePanel) {
          store.setActivePanel(null)
        } else {
          store.deselect()
        }
        return
      }

      // ── Ctrl/Cmd shortcuts ─────────────────────────────────────────────────
      if (ctrl) {
        // Undo
        if (e.key === "z" && !e.shiftKey) {
          e.preventDefault()
          store.undo()
          return
        }
        // Redo
        if (e.key === "y" || (e.key === "z" && e.shiftKey)) {
          e.preventDefault()
          store.redo()
          return
        }
        // Save
        if (e.key === "s") {
          e.preventDefault()
          onManualSave()
          return
        }
        // Copy
        if (e.key === "c") {
          e.preventDefault()
          store.copySelected()
          return
        }
        // Paste
        if (e.key === "v") {
          e.preventDefault()
          store.pasteClipboard()
          return
        }
        // Duplicate
        if (e.key === "d") {
          e.preventDefault()
          store.duplicateSelected()
          return
        }
        return
      }

      // ── Delete / Backspace ─────────────────────────────────────────────────
      if (e.key === "Delete" || e.key === "Backspace") {
        // Multi-select delete
        if (store.multiSelectMode && store.selectedBlockIds.length > 0) {
          e.preventDefault()
          store.deleteMultiSelected()
          return
        }
        if (store.selectedBlockId) {
          e.preventDefault()
          store.deleteBlock(store.selectedBlockId)
          return
        }
        if (store.selectedSectionId) {
          e.preventDefault()
          store.deleteSection(store.selectedSectionId)
          return
        }
        return
      }

      // ── Arrow Up/Down — navigate sections ─────────────────────────────────
      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        const { sections, selectedSectionId } = store
        if (sections.length === 0) return
        e.preventDefault()
        if (!selectedSectionId) {
          store.selectSection(sections[0].id)
          return
        }
        const idx = sections.findIndex(s => s.id === selectedSectionId)
        if (idx === -1) return
        if (e.key === "ArrowUp" && idx > 0) {
          store.selectSection(sections[idx - 1].id)
        } else if (e.key === "ArrowDown" && idx < sections.length - 1) {
          store.selectSection(sections[idx + 1].id)
        }
        return
      }

      // ── Tab / Shift+Tab — navigate blocks within a section ────────────────
      if (e.key === "Tab") {
        const { sections, selectedSectionId, selectedBlockId } = store
        if (!selectedSectionId) return
        const section = sections.find(s => s.id === selectedSectionId)
        if (!section) return
        const allBlocks = section.contentZones.flatMap(z => z.blocks)
        if (allBlocks.length === 0) return
        e.preventDefault()
        if (!selectedBlockId) {
          const first = e.shiftKey ? allBlocks[allBlocks.length - 1] : allBlocks[0]
          store.selectBlock(selectedSectionId, first.id)
          return
        }
        const blockIdx = allBlocks.findIndex(b => b.id === selectedBlockId)
        if (blockIdx === -1) return
        if (e.shiftKey) {
          if (blockIdx > 0) store.selectBlock(selectedSectionId, allBlocks[blockIdx - 1].id)
        } else {
          if (blockIdx < allBlocks.length - 1) store.selectBlock(selectedSectionId, allBlocks[blockIdx + 1].id)
        }
        return
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [onManualSave])
}
