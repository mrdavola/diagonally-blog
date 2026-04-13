"use client"

import { useEffect, useRef } from "react"
import { useEditorStore } from "@/lib/visual-editor/editor-store"
import { sendToCanvas, onCanvasMessage } from "@/lib/visual-editor/message-bridge"
import { reorderBlockInZone } from "@/lib/visual-editor/helpers"
import type { Viewport, SiteStyles } from "@/lib/visual-editor/types"

interface ViewportFrameProps {
  slug: string
  siteStyles?: SiteStyles | null
}

const VIEWPORT_WIDTH: Record<Viewport, number | "full"> = {
  desktop: "full",
  tablet:  768,
  mobile:  375,
}

export function ViewportFrame({ slug, siteStyles }: ViewportFrameProps) {
  const sections            = useEditorStore(s => s.sections)
  const viewport            = useEditorStore(s => s.viewport)
  const selectSection       = useEditorStore(s => s.selectSection)
  const selectBlock         = useEditorStore(s => s.selectBlock)
  const deselect            = useEditorStore(s => s.deselect)
  const reorderSections     = useEditorStore(s => s.reorderSections)
  const deleteSection       = useEditorStore(s => s.deleteSection)
  const deleteBlock         = useEditorStore(s => s.deleteBlock)
  const updateBlockPosition = useEditorStore(s => s.updateBlockPosition)
  const toggleBlockSelection = useEditorStore(s => s.toggleBlockSelection)
  const selectedBlockIds    = useEditorStore(s => s.selectedBlockIds)

  const iframeRef = useRef<HTMLIFrameElement>(null)

  // Keep a stable ref to sections so the message listener always sees current value
  const sectionsRef = useRef(sections)
  useEffect(() => { sectionsRef.current = sections }, [sections])

  // Keep a stable ref to siteStyles for CANVAS_READY handler
  const siteStylesRef = useRef(siteStyles)
  useEffect(() => { siteStylesRef.current = siteStyles }, [siteStyles])

  // Sync site styles to canvas whenever they load/change
  useEffect(() => {
    if (!iframeRef.current || !siteStyles) return
    sendToCanvas(iframeRef.current, { type: "SYNC_STYLES", payload: { styles: siteStyles } })
  }, [siteStyles])

  // Sync multi-select state to canvas whenever it changes
  useEffect(() => {
    if (!iframeRef.current) return
    sendToCanvas(iframeRef.current, { type: "SYNC_MULTI_SELECT", payload: { selectedBlockIds } })
  }, [selectedBlockIds])

  // Sync state to canvas whenever sections change
  useEffect(() => {
    if (!iframeRef.current) return
    sendToCanvas(iframeRef.current, { type: "SYNC_STATE", payload: { sections } })
  }, [sections])

  // Listen for canvas → parent messages
  useEffect(() => {
    const cleanup = onCanvasMessage((message) => {
      switch (message.type) {
        case "CANVAS_READY": {
          if (iframeRef.current) {
            sendToCanvas(iframeRef.current, {
              type: "SYNC_STATE",
              payload: { sections: sectionsRef.current },
            })
            if (siteStylesRef.current) {
              sendToCanvas(iframeRef.current, {
                type: "SYNC_STYLES",
                payload: { styles: siteStylesRef.current },
              })
            }
          }
          break
        }

        case "ELEMENT_SELECTED": {
          const { id, kind } = message.payload
          if (kind === "section") {
            selectSection(id)
          } else {
            // Find which section owns this block
            const currentSections = sectionsRef.current
            let ownerSectionId: string | null = null
            for (const section of currentSections) {
              for (const zone of section.contentZones) {
                if (zone.blocks.some(b => b.id === id)) {
                  ownerSectionId = section.id
                  break
                }
              }
              if (ownerSectionId) break
            }
            if (ownerSectionId) {
              selectBlock(ownerSectionId, id)
            }
          }
          break
        }

        case "ELEMENT_DESELECTED": {
          deselect()
          break
        }

        case "BLOCK_MULTI_SELECT": {
          const { blockId, sectionId } = message.payload
          toggleBlockSelection(sectionId, blockId)
          break
        }

        case "REORDER_SECTIONS": {
          const { fromIndex, toIndex } = message.payload
          reorderSections(fromIndex, toIndex)
          break
        }

        case "DELETE_SECTION": {
          deleteSection(message.payload.sectionId)
          break
        }

        case "DELETE_BLOCK": {
          deleteBlock(message.payload.blockId)
          break
        }

        case "REORDER_BLOCK": {
          const { sectionId, zoneId, fromIndex, toIndex } = message.payload
          const state = useEditorStore.getState()
          const newSections = reorderBlockInZone(state.sections, sectionId, zoneId, fromIndex, toIndex)
          useEditorStore.getState().setSections(newSections)
          useEditorStore.getState().setSaveStatus("unsaved")
          break
        }

        case "RESIZE_BLOCK": {
          const { sectionId, blockId, colSpan } = message.payload
          updateBlockPosition(sectionId, blockId, { colSpan })
          break
        }

        // REQUEST_INSERT is handled by the VisualEditor component which
        // also calculates the correct insertion index. Skip here to avoid
        // race conditions with deselect.
      }
    })

    return cleanup
  }, [selectSection, selectBlock, deselect, reorderSections, deleteSection, deleteBlock, updateBlockPosition, toggleBlockSelection])

  const targetWidth = VIEWPORT_WIDTH[viewport]
  const isConstrained = targetWidth !== "full"

  return (
    <div className="flex-1 overflow-auto bg-gray-100 flex items-start justify-center py-4 h-full">
      <div
        style={{
          width: isConstrained ? targetWidth : "100%",
          height: "100%",
          transition: "width 300ms ease",
          borderRadius: isConstrained ? 12 : 0,
          boxShadow: isConstrained ? "0 4px 32px rgba(0,0,0,0.18)" : "none",
          overflow: "hidden",
          minHeight: "100%",
        }}
      >
        <iframe
          ref={iframeRef}
          src={`/editor-canvas/${slug}`}
          style={{ width: "100%", height: "100%", minHeight: "100%", border: "none", display: "block" }}
          title="Editor canvas"
        />
      </div>
    </div>
  )
}
