"use client"

import { useEffect, useRef } from "react"
import { useEditorStore } from "@/lib/visual-editor/editor-store"
import { sendToCanvas, onCanvasMessage } from "@/lib/visual-editor/message-bridge"
import type { Viewport } from "@/lib/visual-editor/types"

interface ViewportFrameProps {
  slug: string
}

const VIEWPORT_WIDTH: Record<Viewport, number | "full"> = {
  desktop: "full",
  tablet:  768,
  mobile:  375,
}

export function ViewportFrame({ slug }: ViewportFrameProps) {
  const sections            = useEditorStore(s => s.sections)
  const viewport            = useEditorStore(s => s.viewport)
  const selectSection       = useEditorStore(s => s.selectSection)
  const selectBlock         = useEditorStore(s => s.selectBlock)
  const deselect            = useEditorStore(s => s.deselect)
  const setActivePanel      = useEditorStore(s => s.setActivePanel)
  const toggleBlockSelection = useEditorStore(s => s.toggleBlockSelection)
  const selectedBlockIds    = useEditorStore(s => s.selectedBlockIds)

  const iframeRef = useRef<HTMLIFrameElement>(null)

  // Keep a stable ref to sections so the message listener always sees current value
  const sectionsRef = useRef(sections)
  useEffect(() => { sectionsRef.current = sections }, [sections])

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

        case "REQUEST_INSERT": {
          const { insertType } = message.payload
          setActivePanel(insertType === "section" ? "section-inserter" : "block-inserter")
          break
        }
      }
    })

    return cleanup
  }, [selectSection, selectBlock, deselect, setActivePanel, toggleBlockSelection])

  const targetWidth = VIEWPORT_WIDTH[viewport]
  const isConstrained = targetWidth !== "full"

  return (
    <div className="flex-1 overflow-auto bg-gray-100 flex items-start justify-center py-4">
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
          style={{ width: "100%", height: "100%", border: "none", display: "block" }}
          title="Editor canvas"
        />
      </div>
    </div>
  )
}
