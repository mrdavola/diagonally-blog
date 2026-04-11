"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import type { Block } from "@/lib/blocks/types"
import { getDraftBlocks, saveDraft, publishPage, discardDraft } from "@/lib/blocks/firestore"
import { PAGE_DEFAULTS } from "@/lib/blocks/defaults"
import { createBlock } from "@/lib/blocks/registry"
import { useAuth } from "@/components/admin/auth-provider"
import { useUndo } from "@/hooks/use-undo"
import { BlockList } from "./block-list"
import { BlockEditor } from "./block-editor"
import { PreviewPanel } from "./preview-panel"
import { PublishControls } from "./publish-controls"
import { BlockPicker } from "./block-picker"

interface PageEditorProps {
  slug: string
}

type PageStatus = "published" | "draft" | "unsaved"
type ActiveTab = "edit" | "preview"

export function PageEditor({ slug }: PageEditorProps) {
  const { user } = useAuth()
  const { state: blocks, setState: setBlocks, undo, redo, reset, canUndo, canRedo } = useUndo<Block[]>([])

  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null)
  const [status, setStatus] = useState<PageStatus>("draft")
  const [hasChanges, setHasChanges] = useState(false)
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [showPicker, setShowPicker] = useState(false)
  const [activeTab, setActiveTab] = useState<ActiveTab>("edit")
  const [loading, setLoading] = useState(true)

  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Load blocks on mount
  useEffect(() => {
    async function load() {
      try {
        const fetched = await getDraftBlocks(slug)
        const initial = fetched.length > 0 ? fetched : (PAGE_DEFAULTS[slug] ?? [])
        reset(initial)
      } catch {
        const fallback = PAGE_DEFAULTS[slug] ?? []
        reset(fallback)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [slug, reset])

  // Mark changed when blocks mutate (but not on initial load)
  const isFirstRender = useRef(true)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    setHasChanges(true)
    setStatus("unsaved")

    // Debounced auto-save
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    autoSaveTimer.current = setTimeout(() => {
      handleSave(blocks)
    }, 5000)

    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blocks])

  // Keyboard undo/redo
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const mod = e.metaKey || e.ctrlKey
      if (mod && e.key === "z" && !e.shiftKey && canUndo) {
        e.preventDefault()
        undo()
      }
      if (mod && (e.key === "y" || (e.key === "z" && e.shiftKey)) && canRedo) {
        e.preventDefault()
        redo()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [undo, redo, canUndo, canRedo])

  const handleSave = useCallback(
    async (blocksToSave: Block[]) => {
      if (!user) return
      setSaving(true)
      try {
        await saveDraft(slug, blocksToSave, user.email ?? "unknown")
        setHasChanges(false)
        setStatus("draft")
      } catch (err) {
        console.error("Auto-save failed:", err)
      } finally {
        setSaving(false)
      }
    },
    [slug, user]
  )

  async function handleManualSave() {
    await handleSave(blocks)
  }

  async function handlePublish() {
    if (!user) return
    setPublishing(true)
    try {
      await saveDraft(slug, blocks, user.email ?? "unknown")
      await publishPage(slug, user.email ?? "unknown")
      setHasChanges(false)
      setStatus("published")
    } catch (err) {
      console.error("Publish failed:", err)
    } finally {
      setPublishing(false)
    }
  }

  async function handleDiscard() {
    try {
      await discardDraft(slug)
      const restored = await getDraftBlocks(slug)
      reset(restored)
      setHasChanges(false)
      setStatus("published")
    } catch (err) {
      console.error("Discard failed:", err)
    }
  }

  function handleAddBlock(type: string) {
    const newBlock = createBlock(type)
    setBlocks([...blocks, newBlock])
    setSelectedBlockId(newBlock.id)
  }

  function handleUpdateBlock(updated: Block) {
    setBlocks(blocks.map((b) => (b.id === updated.id ? updated : b)))
  }

  function handleDeleteBlock(id: string) {
    setBlocks(blocks.filter((b) => b.id !== id))
    if (selectedBlockId === id) setSelectedBlockId(null)
  }

  const selectedBlock = blocks.find((b) => b.id === selectedBlockId) ?? null

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <>
      {/* Mobile tab bar */}
      <div className="lg:hidden flex border-b border-white/10 bg-space-deep/50 mb-0">
        {(["edit", "preview"] as ActiveTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 text-sm font-medium capitalize transition ${
              activeTab === tab
                ? "text-white border-b-2 border-blue-500"
                : "text-text-light/50 hover:text-white"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex h-full overflow-hidden">
        {/* Left panel */}
        <div
          className={`w-full lg:w-[400px] flex-shrink-0 flex flex-col overflow-hidden border-r border-white/10 ${
            activeTab === "preview" ? "hidden lg:flex" : "flex"
          }`}
        >
          {/* Publish controls */}
          <div className="p-3 border-b border-white/10">
            <PublishControls
              status={status}
              hasChanges={hasChanges}
              onSave={handleManualSave}
              onPublish={handlePublish}
              onDiscard={handleDiscard}
              saving={saving}
              publishing={publishing}
            />
            {/* Undo/redo bar */}
            <div className="flex gap-1 mt-2">
              <button
                onClick={undo}
                disabled={!canUndo}
                className="text-xs text-text-light/40 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed px-2 py-1 rounded bg-white/5 transition"
              >
                ↩ Undo
              </button>
              <button
                onClick={redo}
                disabled={!canRedo}
                className="text-xs text-text-light/40 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed px-2 py-1 rounded bg-white/5 transition"
              >
                Redo ↪
              </button>
            </div>
          </div>

          {/* Block list */}
          <div className={`overflow-y-auto ${selectedBlock ? "flex-shrink-0" : "flex-1"}`}>
            <BlockList
              blocks={blocks}
              selectedBlockId={selectedBlockId}
              onSelect={setSelectedBlockId}
              onReorder={setBlocks}
              onDelete={handleDeleteBlock}
              onAdd={() => setShowPicker(true)}
            />
          </div>

          {/* Block editor */}
          {selectedBlock && (
            <div className="flex-1 overflow-y-auto border-t border-white/10">
              <BlockEditor
                block={selectedBlock}
                onUpdate={handleUpdateBlock}
              />
            </div>
          )}
        </div>

        {/* Right panel — preview */}
        <div
          className={`flex-1 overflow-hidden ${
            activeTab === "edit" ? "hidden lg:flex" : "flex"
          } flex-col`}
        >
          <PreviewPanel blocks={blocks} slug={slug} />
        </div>
      </div>

      {/* Block picker modal */}
      <BlockPicker
        open={showPicker}
        onClose={() => setShowPicker(false)}
        onSelect={handleAddBlock}
      />
    </>
  )
}
