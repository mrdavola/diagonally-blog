"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useEditorStore } from "@/lib/visual-editor/editor-store"
import { loadPageSections, saveDraftSections } from "@/lib/visual-editor/firestore"
import { useAuth } from "@/components/admin/auth-provider"
import { EditorTopBar } from "./shell/editor-top-bar"
import { ViewportFrame } from "./shell/viewport-frame"
import { PropertyPanel } from "./panels/property-panel"
import { SectionPanel } from "./panels/section-panel"
import { BlockInserter } from "./inserters/block-inserter"

interface VisualEditorProps {
  slug: string
}

const AUTOSAVE_DELAY_MS = 3000

export function VisualEditor({ slug }: VisualEditorProps) {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)

  const init = useEditorStore((s) => s.init)
  const setSaveStatus = useEditorStore((s) => s.setSaveStatus)
  const deselect = useEditorStore((s) => s.deselect)
  const undo = useEditorStore((s) => s.undo)
  const redo = useEditorStore((s) => s.redo)
  const saveStatus = useEditorStore((s) => s.saveStatus)
  const activePanel = useEditorStore((s) => s.activePanel)
  const selectedSectionId = useEditorStore((s) => s.selectedSectionId)
  const selectedBlockId = useEditorStore((s) => s.selectedBlockId)
  const sections = useEditorStore((s) => s.sections)

  // ─── Load page on mount ──────────────────────────────────────────────────

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const { title, sections } = await loadPageSections(slug)
        if (!cancelled) {
          init(slug, title, sections)
          setLoading(false)
        }
      } catch (err) {
        console.error("[VisualEditor] Failed to load page:", err)
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [slug, init])

  // ─── Auto-save (debounced 3 s) ───────────────────────────────────────────

  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (saveStatus !== "unsaved") return

    if (autosaveTimer.current) clearTimeout(autosaveTimer.current)

    autosaveTimer.current = setTimeout(async () => {
      const { sections, saveStatus: currentStatus } = useEditorStore.getState()
      if (currentStatus !== "unsaved") return

      setSaveStatus("saving")
      try {
        await saveDraftSections(slug, sections, user?.email ?? "unknown")
        setSaveStatus("saved")
      } catch (err) {
        console.error("[VisualEditor] Auto-save failed:", err)
        setSaveStatus("unsaved")
      }
    }, AUTOSAVE_DELAY_MS)

    return () => {
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current)
    }
  }, [saveStatus, slug, user?.email, setSaveStatus])

  // ─── Manual save ─────────────────────────────────────────────────────────

  async function handleManualSave() {
    const { sections } = useEditorStore.getState()
    setSaveStatus("saving")
    try {
      await saveDraftSections(slug, sections, user?.email ?? "unknown")
      setSaveStatus("saved")
    } catch (err) {
      console.error("[VisualEditor] Manual save failed:", err)
      setSaveStatus("unsaved")
    }
  }

  // ─── Keyboard shortcuts ───────────────────────────────────────────────────

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const isMac = navigator.platform.toUpperCase().includes("MAC")
      const ctrl = isMac ? e.metaKey : e.ctrlKey

      if (!ctrl) {
        if (e.key === "Escape") {
          useEditorStore.getState().deselect()
        }
        return
      }

      if (e.key === "z" && !e.shiftKey) {
        e.preventDefault()
        useEditorStore.getState().undo()
        return
      }

      if (e.key === "y" || (e.key === "z" && e.shiftKey)) {
        e.preventDefault()
        useEditorStore.getState().redo()
        return
      }

      if (e.key === "s") {
        e.preventDefault()
        handleManualSave()
        return
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, user?.email])

  // Silence unused-var warning — undo/redo/deselect are accessed via getState()
  void undo; void redo; void deselect

  // ─── Render ───────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
      </div>
    )
  }

  // Derive the first content zone of the selected section (for BlockInserter)
  const selectedSection = sections.find((s) => s.id === selectedSectionId)
  const firstZoneId = selectedSection?.contentZones[0]?.id ?? ""

  function handleClosePanel() {
    useEditorStore.getState().deselect()
  }

  return (
    <div className="flex h-full flex-col">
      <EditorTopBar
        onExit={() => router.push("/admin/pages")}
        onSave={handleManualSave}
      />
      <div className="relative flex-1 overflow-hidden">
        <ViewportFrame slug={slug} />

        {/* Property panel — block selected */}
        {activePanel === "properties" && selectedBlockId && (
          <PropertyPanel onClose={handleClosePanel} />
        )}

        {/* Section panel — section selected, no block */}
        {activePanel === "properties" && selectedSectionId && !selectedBlockId && (
          <SectionPanel onClose={handleClosePanel} />
        )}

        {/* Block inserter */}
        {activePanel === "block-inserter" && selectedSectionId && firstZoneId && (
          <div className="absolute right-0 top-0 z-40">
            <BlockInserter
              targetSectionId={selectedSectionId}
              targetZoneId={firstZoneId}
              onClose={handleClosePanel}
            />
          </div>
        )}
      </div>
    </div>
  )
}
