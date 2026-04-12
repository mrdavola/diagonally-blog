"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useKeyboardShortcuts } from "./hooks/use-keyboard-shortcuts"
import { useRouter } from "next/navigation"
import { useEditorStore } from "@/lib/visual-editor/editor-store"
import { loadPageSections, saveDraftSections } from "@/lib/visual-editor/firestore"
import { onCanvasMessage } from "@/lib/visual-editor/message-bridge"
import { useAuth } from "@/components/admin/auth-provider"
import { EditorTopBar } from "./shell/editor-top-bar"
import { ViewportFrame } from "./shell/viewport-frame"
import { PropertyPanel } from "./panels/property-panel"
import { PropertySheet } from "./panels/property-sheet"
import { SectionPanel } from "./panels/section-panel"
import { SectionSheet } from "./panels/section-sheet"
import { BlockInserter } from "./inserters/block-inserter"
import { BlockInserterMobile } from "./inserters/block-inserter-mobile"
import { SectionInserter } from "./inserters/section-inserter"
import { SectionInserterMobile } from "./inserters/section-inserter-mobile"
import { SectionListPanel } from "./panels/section-list-panel"
import { GlobalStylesPanel } from "./panels/global-styles-panel"
import { VersionHistoryPanel } from "./panels/version-history-panel"

interface VisualEditorProps {
  slug: string
}

const AUTOSAVE_DELAY_MS = 3000

export function VisualEditor({ slug }: VisualEditorProps) {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [insertionIndex, setInsertionIndex] = useState<number>(0)
  const [deviceType, setDeviceType] = useState<"mobile" | "tablet" | "desktop">("desktop")

  const init = useEditorStore((s) => s.init)
  const setSaveStatus = useEditorStore((s) => s.setSaveStatus)
  const saveStatus = useEditorStore((s) => s.saveStatus)
  const activePanel = useEditorStore((s) => s.activePanel)
  const selectedSectionId = useEditorStore((s) => s.selectedSectionId)
  const selectedBlockId = useEditorStore((s) => s.selectedBlockId)
  const sections = useEditorStore((s) => s.sections)

  // ─── Responsive detection ────────────────────────────────────────────────

  useEffect(() => {
    const check = () => {
      const w = window.innerWidth
      setDeviceType(w < 768 ? "mobile" : w < 1024 ? "tablet" : "desktop")
    }
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  const isMobile = deviceType === "mobile"

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

  useKeyboardShortcuts({ onManualSave: handleManualSave })

  // ─── Section inserter: track insertion index from canvas REQUEST_INSERT ───

  const sectionsRef = useRef(sections)
  useEffect(() => { sectionsRef.current = sections }, [sections])

  const handleOpenSectionInserter = useCallback((atIndex: number) => {
    setInsertionIndex(atIndex)
    useEditorStore.getState().setActivePanel("section-inserter")
  }, [])

  useEffect(() => {
    const cleanup = onCanvasMessage((message) => {
      if (message.type !== "REQUEST_INSERT") return
      if (message.payload.insertType !== "section") return

      const { sectionId, position } = message.payload
      const currentSections = sectionsRef.current
      const idx = currentSections.findIndex((s) => s.id === sectionId)

      let insertAt: number
      if (idx === -1) {
        insertAt = currentSections.length
      } else {
        insertAt = position === "after" ? idx + 1 : idx
      }

      handleOpenSectionInserter(insertAt)
    })
    return cleanup
  }, [handleOpenSectionInserter])

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

        {/* Property panel / sheet — block selected */}
        {activePanel === "properties" && selectedBlockId && (
          isMobile
            ? <PropertySheet open onClose={handleClosePanel} />
            : <PropertyPanel onClose={handleClosePanel} narrow={deviceType === "tablet"} />
        )}

        {/* Section panel / sheet — section selected, no block */}
        {activePanel === "properties" && selectedSectionId && !selectedBlockId && (
          isMobile
            ? <SectionSheet open onClose={handleClosePanel} />
            : <SectionPanel onClose={handleClosePanel} narrow={deviceType === "tablet"} />
        )}

        {/* Block inserter */}
        {activePanel === "block-inserter" && selectedSectionId && firstZoneId && (
          isMobile
            ? (
              <BlockInserterMobile
                targetSectionId={selectedSectionId}
                targetZoneId={firstZoneId}
                open
                onClose={handleClosePanel}
              />
            )
            : (
              <div className="absolute right-0 top-0 z-40">
                <BlockInserter
                  targetSectionId={selectedSectionId}
                  targetZoneId={firstZoneId}
                  onClose={handleClosePanel}
                />
              </div>
            )
        )}

        {/* Section list panel */}
        {activePanel === "section-list" && (
          <SectionListPanel
            onClose={handleClosePanel}
            onAddSection={() => handleOpenSectionInserter(sections.length)}
          />
        )}

        {/* Global styles panel */}
        {activePanel === "global-styles" && (
          <GlobalStylesPanel onClose={handleClosePanel} narrow={deviceType === "tablet"} />
        )}

        {/* Version history panel */}
        {activePanel === "version-history" && (
          <VersionHistoryPanel onClose={handleClosePanel} narrow={deviceType === "tablet"} />
        )}

        {/* Section inserter */}
        {activePanel === "section-inserter" && (
          isMobile
            ? (
              <SectionInserterMobile
                insertAtIndex={insertionIndex}
                open
                onClose={handleClosePanel}
              />
            )
            : (
              <div className="absolute right-0 top-0 z-40 h-full">
                <SectionInserter
                  insertAtIndex={insertionIndex}
                  onClose={handleClosePanel}
                />
              </div>
            )
        )}
      </div>
    </div>
  )
}
