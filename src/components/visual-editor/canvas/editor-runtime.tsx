"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import type { Section } from "@/lib/visual-editor/types"
import { sendToParent } from "@/lib/visual-editor/message-bridge"
import { useInlineEdit } from "./inline-edit-context"
import { useTouchGestures } from "../hooks/use-touch-gestures"

// ─── Types ───────────────────────────────────────────────────────────────────

interface OverlayTarget {
  id: string
  kind: "section" | "block"
  rect: DOMRect
}

interface InsertPoint {
  sectionId: string
  /** bottom-edge Y coordinate of the section (fixed positioning) */
  y: number
  x: number
  width: number
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function findTextBlockTarget(element: Element | null): { blockId: string; sectionId: string } | null {
  let el = element
  while (el && el !== document.documentElement) {
    const blockType = el.getAttribute("data-block-type")
    if (blockType === "text") {
      const blockId = el.getAttribute("data-block-id")
      if (!blockId) return null
      // Walk up to find section
      let parent = el.parentElement
      while (parent && parent !== document.documentElement) {
        const sectionId = parent.getAttribute("data-section-id")
        if (sectionId) return { blockId, sectionId }
        parent = parent.parentElement
      }
      return null
    }
    el = el.parentElement
  }
  return null
}

function findEditorTarget(element: Element | null): OverlayTarget | null {
  let el = element
  while (el && el !== document.documentElement) {
    const blockId = el.getAttribute("data-block-id")
    if (blockId) {
      return { id: blockId, kind: "block", rect: el.getBoundingClientRect() }
    }
    const sectionId = el.getAttribute("data-section-id")
    if (sectionId) {
      return { id: sectionId, kind: "section", rect: el.getBoundingClientRect() }
    }
    el = el.parentElement
  }
  return null
}

function isTouchDevice(): boolean {
  return typeof window !== "undefined" && "ontouchstart" in window
}

function collectInsertPoints(sections: Section[]): InsertPoint[] {
  const points: InsertPoint[] = []
  for (const section of sections) {
    const el = document.querySelector(`[data-section-id="${section.id}"]`)
    if (!el) continue
    const rect = el.getBoundingClientRect()
    points.push({
      sectionId: section.id,
      y: rect.bottom,
      x: rect.left,
      width: rect.width,
    })
  }
  return points
}

// ─── Overlay ─────────────────────────────────────────────────────────────────

interface OverlayBoxProps {
  rect: DOMRect
  color: string
  /** Show left/right resize handles for column span */
  showResizeHandles?: boolean
  onResizeStart?: (side: "left" | "right", e: React.MouseEvent) => void
  /** Show "Section" label — only for section selection */
  showSectionLabel?: boolean
  /** Show drag handle for reordering */
  showDragHandle?: boolean
  onDragStart?: (e: React.MouseEvent) => void
  /** Show delete button */
  showDelete?: boolean
  onDelete?: () => void
  label?: string
}

function OverlayBox({ rect, color, showResizeHandles, onResizeStart, showSectionLabel, showDragHandle, onDragStart, showDelete, onDelete, label }: OverlayBoxProps) {
  const style: React.CSSProperties = {
    position: "fixed",
    top: rect.top,
    left: rect.left,
    width: rect.width,
    height: rect.height,
    border: `2px solid ${color}`,
    pointerEvents: "none",
    zIndex: 9999,
    boxSizing: "border-box",
  }

  return (
    <div style={style}>
      {/* Label + drag handle */}
      {(showSectionLabel || label) && (
        <div
          style={{
            position: "absolute",
            top: -24,
            left: 0,
            display: "flex",
            alignItems: "center",
            gap: 0,
            pointerEvents: "none",
            userSelect: "none",
          }}
        >
          {/* Drag handle */}
          {showDragHandle && (
            <div
              onMouseDown={(e) => { e.stopPropagation(); onDragStart?.(e) }}
              style={{
                background: color,
                color: "#fff",
                padding: "3px 4px",
                borderRadius: "3px 0 0 0",
                cursor: "grab",
                pointerEvents: "all",
                display: "flex",
                alignItems: "center",
                lineHeight: 1,
              }}
              title="Drag to reorder"
            >
              <svg width="10" height="14" viewBox="0 0 10 14" fill="currentColor">
                <circle cx="3" cy="2" r="1.2" />
                <circle cx="7" cy="2" r="1.2" />
                <circle cx="3" cy="7" r="1.2" />
                <circle cx="7" cy="7" r="1.2" />
                <circle cx="3" cy="12" r="1.2" />
                <circle cx="7" cy="12" r="1.2" />
              </svg>
            </div>
          )}
          {/* Label */}
          <div
            style={{
              background: color,
              color: "#fff",
              fontSize: 11,
              fontWeight: 600,
              padding: "2px 6px",
              borderRadius: showDragHandle ? "0 3px 0 0" : "3px 3px 0 0",
              whiteSpace: "nowrap",
            }}
          >
            {label ?? "Section"}
          </div>
        </div>
      )}

      {/* Delete button — top right */}
      {showDelete && (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete?.() }}
          style={{
            position: "absolute",
            top: -24,
            right: 0,
            background: "#ef4444",
            color: "#fff",
            border: "none",
            padding: "3px 6px",
            borderRadius: "3px 3px 0 0",
            cursor: "pointer",
            pointerEvents: "all",
            display: "flex",
            alignItems: "center",
            gap: 3,
            fontSize: 11,
            fontWeight: 600,
            lineHeight: 1,
          }}
          title="Delete section"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
          Delete
        </button>
      )}

      {/* Left/right resize handles for column span */}
      {showResizeHandles && (
        <>
          {/* Left edge */}
          <div
            onMouseDown={(e) => { e.stopPropagation(); e.preventDefault(); onResizeStart?.("left", e) }}
            style={{
              position: "absolute",
              top: 0,
              left: -4,
              width: 8,
              height: "100%",
              cursor: "ew-resize",
              pointerEvents: "all",
              zIndex: 10000,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div style={{ width: 4, height: 32, maxHeight: "50%", borderRadius: 2, background: color }} />
          </div>
          {/* Right edge */}
          <div
            onMouseDown={(e) => { e.stopPropagation(); e.preventDefault(); onResizeStart?.("right", e) }}
            style={{
              position: "absolute",
              top: 0,
              right: -4,
              width: 8,
              height: "100%",
              cursor: "ew-resize",
              pointerEvents: "all",
              zIndex: 10000,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div style={{ width: 4, height: 32, maxHeight: "50%", borderRadius: 2, background: color }} />
          </div>
        </>
      )}
    </div>
  )
}

// ─── Insert Point ─────────────────────────────────────────────────────────────

interface InsertPointButtonProps {
  point: InsertPoint
}

function InsertPointButton({ point }: InsertPointButtonProps) {
  const [hovered, setHovered] = useState(false)

  function handleClick() {
    sendToParent({
      type: "REQUEST_INSERT",
      payload: { position: "after", sectionId: point.sectionId, insertType: "section" },
    })
  }

  return (
    <div
      style={{
        position: "fixed",
        top: point.y - 12,
        left: point.x,
        width: point.width,
        height: 24,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9998,
        pointerEvents: "all",
      }}
      data-insert-point
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Horizontal line */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: 0,
          right: 0,
          height: 2,
          background: hovered ? "#3b82f6" : "transparent",
          transition: "background 0.15s",
          transform: "translateY(-50%)",
          pointerEvents: "none",
        }}
      />

      {/* "+" button */}
      <button
        onClick={handleClick}
        style={{
          width: 24,
          height: 24,
          borderRadius: "50%",
          background: "#3b82f6",
          color: "#fff",
          border: "none",
          cursor: "pointer",
          fontSize: 16,
          lineHeight: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: hovered ? 1 : 0,
          transition: "opacity 0.15s",
          position: "relative",
          zIndex: 1,
          pointerEvents: "all",
        }}
        title="Insert section"
      >
        +
      </button>
    </div>
  )
}

// ─── Editor Runtime ───────────────────────────────────────────────────────────

interface EditorRuntimeProps {
  sections: Section[]
  selectedBlockIds?: string[]
}

export function EditorRuntime({ sections, selectedBlockIds = [] }: EditorRuntimeProps) {
  const [hovered, setHovered] = useState<OverlayTarget | null>(null)
  const [selected, setSelected] = useState<OverlayTarget | null>(null)
  const [insertPoints, setInsertPoints] = useState<InsertPoint[]>([])
  const [longPressId, setLongPressId] = useState<string | null>(null)
  // Two-step touch selection: first tap selects section, second tap selects block
  const [touchSelectedSectionId, setTouchSelectedSectionId] = useState<string | null>(null)
  const rafRef = useRef<number | null>(null)
  const { editingBlockId, startEditing, stopEditing } = useInlineEdit()
  const isTouch = isTouchDevice()

  // ─── Drag-to-reorder state ──────────────────────────────────────────────
  const [dragging, setDragging] = useState<{ sectionId: string; fromIndex: number } | null>(null)
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null)
  const [dropIndicatorY, setDropIndicatorY] = useState<number | null>(null)

  const handleDragStart = useCallback((e: React.MouseEvent, sectionId: string) => {
    e.preventDefault()
    const fromIndex = sections.findIndex(s => s.id === sectionId)
    if (fromIndex === -1) return
    setDragging({ sectionId, fromIndex })
    setDropTargetIndex(null)

    const sectionsCopy = [...sections]

    function findDropIndex(y: number): { idx: number; indicatorY: number | null } {
      let bestIdx = 0
      let bestDist = Infinity
      for (let i = 0; i <= sectionsCopy.length; i++) {
        let gapY: number
        if (i === 0) {
          const el = document.querySelector(`[data-section-id="${sectionsCopy[0]?.id}"]`)
          gapY = el ? el.getBoundingClientRect().top : 0
        } else if (i === sectionsCopy.length) {
          const el = document.querySelector(`[data-section-id="${sectionsCopy[sectionsCopy.length - 1]?.id}"]`)
          gapY = el ? el.getBoundingClientRect().bottom : 0
        } else {
          const prevEl = document.querySelector(`[data-section-id="${sectionsCopy[i - 1]?.id}"]`)
          const nextEl = document.querySelector(`[data-section-id="${sectionsCopy[i]?.id}"]`)
          if (prevEl && nextEl) {
            gapY = (prevEl.getBoundingClientRect().bottom + nextEl.getBoundingClientRect().top) / 2
          } else {
            continue
          }
        }
        const dist = Math.abs(y - gapY)
        if (dist < bestDist) {
          bestDist = dist
          bestIdx = i
        }
      }

      // Compute indicator Y
      let indicatorY: number | null = null
      if (bestIdx === 0) {
        const el = document.querySelector(`[data-section-id="${sectionsCopy[0]?.id}"]`)
        indicatorY = el ? el.getBoundingClientRect().top : null
      } else if (bestIdx === sectionsCopy.length) {
        const el = document.querySelector(`[data-section-id="${sectionsCopy[sectionsCopy.length - 1]?.id}"]`)
        indicatorY = el ? el.getBoundingClientRect().bottom : null
      } else {
        const prevEl = document.querySelector(`[data-section-id="${sectionsCopy[bestIdx - 1]?.id}"]`)
        const nextEl = document.querySelector(`[data-section-id="${sectionsCopy[bestIdx]?.id}"]`)
        if (prevEl && nextEl) {
          indicatorY = (prevEl.getBoundingClientRect().bottom + nextEl.getBoundingClientRect().top) / 2
        }
      }

      return { idx: bestIdx, indicatorY }
    }

    let latestDropIdx: number | null = null

    function onMouseMove(ev: MouseEvent) {
      const { idx, indicatorY } = findDropIndex(ev.clientY)
      latestDropIdx = idx
      setDropTargetIndex(idx)
      setDropIndicatorY(indicatorY)
    }

    function onMouseUp() {
      window.removeEventListener("mousemove", onMouseMove)
      window.removeEventListener("mouseup", onMouseUp)

      setDragging(null)
      setDropTargetIndex(null)
      setDropIndicatorY(null)

      if (latestDropIdx != null && latestDropIdx !== fromIndex && latestDropIdx !== fromIndex + 1) {
        const adjustedTo = latestDropIdx > fromIndex ? latestDropIdx - 1 : latestDropIdx
        sendToParent({
          type: "REORDER_SECTIONS",
          payload: { fromIndex, toIndex: adjustedTo },
        })
      }
    }

    window.addEventListener("mousemove", onMouseMove)
    window.addEventListener("mouseup", onMouseUp)
  }, [sections])

  // Recompute insert points whenever sections change (after render)
  useEffect(() => {
    // Defer until DOM has updated
    const id = requestAnimationFrame(() => {
      setInsertPoints(collectInsertPoints(sections))
    })
    return () => cancelAnimationFrame(id)
  }, [sections])

  // ─── Touch gesture handlers ───────────────────────────────────────────────

  const handleTouchTap = useCallback((target: { id: string; kind: "section" | "block"; rect: DOMRect }) => {
    if (editingBlockId) return

    if (target.kind === "section") {
      // First tap: select section
      setTouchSelectedSectionId(target.id)
      setSelected(target)
      sendToParent({
        type: "ELEMENT_SELECTED",
        payload: { id: target.id, kind: "section", rect: target.rect },
      })
    } else {
      // Block tap: only select if its parent section is already touch-selected
      // Otherwise select the section first
      const blockEl = document.querySelector(`[data-block-id="${target.id}"]`)
      let parentSectionId: string | null = null
      let el = blockEl?.parentElement
      while (el && el !== document.documentElement) {
        const sid = el.getAttribute("data-section-id")
        if (sid) { parentSectionId = sid; break }
        el = el.parentElement
      }

      if (parentSectionId && touchSelectedSectionId === parentSectionId) {
        // Second tap: select block
        setSelected(target)
        sendToParent({
          type: "ELEMENT_SELECTED",
          payload: { id: target.id, kind: "block", rect: target.rect },
        })
      } else {
        // Select the section first
        if (parentSectionId) {
          const sectionEl = document.querySelector(`[data-section-id="${parentSectionId}"]`)
          const sectionRect = sectionEl?.getBoundingClientRect() ?? target.rect
          const sectionTarget = { id: parentSectionId, kind: "section" as const, rect: sectionRect }
          setTouchSelectedSectionId(parentSectionId)
          setSelected(sectionTarget)
          sendToParent({
            type: "ELEMENT_SELECTED",
            payload: { id: parentSectionId, kind: "section", rect: sectionRect },
          })
        }
      }
    }
  }, [editingBlockId, touchSelectedSectionId])

  const handleTouchDoubleTap = useCallback((target: { blockId: string; sectionId: string }) => {
    startEditing(target.blockId)
    sendToParent({
      type: "INLINE_EDIT_STARTED",
      payload: { sectionId: target.sectionId, blockId: target.blockId },
    })
    setSelected(null)
    setHovered(null)
  }, [startEditing])

  const handleTouchLongPress = useCallback((target: { id: string; kind: "section" | "block" }) => {
    // Visual drag-mode feedback
    setLongPressId(target.id)
    setTimeout(() => setLongPressId(null), 800)
  }, [])

  // Bind touch gestures to window
  const { bind: bindTouchGestures } = useTouchGestures({
    onTap: handleTouchTap,
    onDoubleTap: handleTouchDoubleTap,
    onLongPress: handleTouchLongPress,
    onTwoFingerTap: () => {
      // Two-finger tap → undo (dispatched to parent)
      window.parent?.postMessage({ type: "EDITOR_UNDO" }, window.location.origin)
    },
    onThreeFingerTap: () => {
      // Three-finger tap → redo (dispatched to parent)
      window.parent?.postMessage({ type: "EDITOR_REDO" }, window.location.origin)
    },
  })

  // ─── Mouse handlers (desktop) ─────────────────────────────────────────────

  // Mouse move — throttled via rAF (suppress when inline editing)
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (editingBlockId) return
    if (rafRef.current !== null) return
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null
      const target = findEditorTarget(document.elementFromPoint(e.clientX, e.clientY))
      setHovered(target)
      if (target) {
        sendToParent({
          type: "ELEMENT_HOVERED",
          payload: { id: target.id, kind: target.kind, rect: target.rect },
        })
      }
    })
  }, [editingBlockId])

  // Click — select or deselect (suppress when inline editing)
  const handleClick = useCallback((e: MouseEvent) => {
    if (editingBlockId) return
    // Skip clicks on insert point buttons — they handle their own messages
    if ((e.target as HTMLElement).closest?.("[data-insert-point]")) return
    const target = findEditorTarget(e.target as Element)
    if (target) {
      // Shift+click on a block → multi-select
      if (e.shiftKey && target.kind === "block") {
        const blockEl = document.querySelector(`[data-block-id="${target.id}"]`)
        let sectionId: string | null = null
        let el = blockEl?.parentElement
        while (el && el !== document.documentElement) {
          const sid = el.getAttribute("data-section-id")
          if (sid) { sectionId = sid; break }
          el = el.parentElement
        }
        if (sectionId) {
          sendToParent({
            type: "BLOCK_MULTI_SELECT",
            payload: { blockId: target.id, sectionId },
          })
        }
        return
      }
      setSelected(target)
      sendToParent({
        type: "ELEMENT_SELECTED",
        payload: { id: target.id, kind: target.kind, rect: target.rect },
      })
    } else {
      setSelected(null)
      sendToParent({ type: "ELEMENT_DESELECTED" })
    }
  }, [editingBlockId])

  // Double-click — start inline editing on text blocks
  const handleDblClick = useCallback((e: MouseEvent) => {
    const textTarget = findTextBlockTarget(e.target as Element)
    if (textTarget) {
      e.preventDefault()
      e.stopPropagation()
      startEditing(textTarget.blockId)
      sendToParent({
        type: "INLINE_EDIT_STARTED",
        payload: { sectionId: textTarget.sectionId, blockId: textTarget.blockId },
      })
      // Clear selection overlay while editing
      setSelected(null)
      setHovered(null)
    }
  }, [startEditing])

  // Keyboard shortcuts
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape" && editingBlockId) {
      stopEditing()
      return
    }
    // Delete/Backspace — delete selected section or block
    if ((e.key === "Delete" || e.key === "Backspace") && !editingBlockId && selected) {
      e.preventDefault()
      if (selected.kind === "section") {
        sendToParent({ type: "DELETE_SECTION", payload: { sectionId: selected.id } })
      } else {
        sendToParent({ type: "DELETE_BLOCK", payload: { blockId: selected.id } })
      }
      setSelected(null)
    }
  }, [editingBlockId, stopEditing, selected])

  useEffect(() => {
    if (isTouch) {
      // Touch devices: bind touch gestures, skip mouse events
      const unbind = bindTouchGestures(window)
      window.addEventListener("keydown", handleKeyDown)
      return () => {
        unbind()
        window.removeEventListener("keydown", handleKeyDown)
        if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
      }
    }

    // Desktop: use mouse events
    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("click", handleClick)
    window.addEventListener("dblclick", handleDblClick)
    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("click", handleClick)
      window.removeEventListener("dblclick", handleDblClick)
      window.removeEventListener("keydown", handleKeyDown)
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [isTouch, bindTouchGestures, handleMouseMove, handleClick, handleDblClick, handleKeyDown])

  // Suppress unused-var warning — longPressId used for visual feedback below
  void longPressId

  // ─── Block drag-to-reorder ────────────────────────────────────────────────

  const handleBlockDragStart = useCallback((e: React.MouseEvent, blockId: string) => {
    e.preventDefault()
    // Find the section and zone that own this block
    let ownerSectionId: string | null = null
    let ownerZoneId: string | null = null
    let fromIndex = -1
    for (const section of sections) {
      for (const zone of section.contentZones) {
        const idx = zone.blocks.findIndex(b => b.id === blockId)
        if (idx !== -1) {
          ownerSectionId = section.id
          ownerZoneId = zone.id
          fromIndex = idx
          break
        }
      }
      if (ownerSectionId) break
    }
    if (!ownerSectionId || !ownerZoneId || fromIndex === -1) return

    const zone = sections.find(s => s.id === ownerSectionId)?.contentZones.find(z => z.id === ownerZoneId)
    if (!zone) return
    const blockIds = zone.blocks.map(b => b.id)

    setDragging({ sectionId: ownerSectionId, fromIndex })

    let latestDropIdx: number | null = null

    function onMouseMove(ev: MouseEvent) {
      const y = ev.clientY
      let bestIdx = 0
      let bestDist = Infinity
      for (let i = 0; i <= blockIds.length; i++) {
        let gapY: number
        if (i === 0) {
          const el = document.querySelector(`[data-block-id="${blockIds[0]}"]`)
          gapY = el ? el.getBoundingClientRect().top : 0
        } else if (i === blockIds.length) {
          const el = document.querySelector(`[data-block-id="${blockIds[blockIds.length - 1]}"]`)
          gapY = el ? el.getBoundingClientRect().bottom : 0
        } else {
          const prevEl = document.querySelector(`[data-block-id="${blockIds[i - 1]}"]`)
          const nextEl = document.querySelector(`[data-block-id="${blockIds[i]}"]`)
          if (prevEl && nextEl) {
            gapY = (prevEl.getBoundingClientRect().bottom + nextEl.getBoundingClientRect().top) / 2
          } else continue
        }
        const dist = Math.abs(y - gapY)
        if (dist < bestDist) { bestDist = dist; bestIdx = i }
      }
      latestDropIdx = bestIdx
      setDropTargetIndex(bestIdx)

      // Compute indicator Y
      if (bestIdx === 0) {
        const el = document.querySelector(`[data-block-id="${blockIds[0]}"]`)
        setDropIndicatorY(el ? el.getBoundingClientRect().top : null)
      } else if (bestIdx === blockIds.length) {
        const el = document.querySelector(`[data-block-id="${blockIds[blockIds.length - 1]}"]`)
        setDropIndicatorY(el ? el.getBoundingClientRect().bottom : null)
      } else {
        const prevEl = document.querySelector(`[data-block-id="${blockIds[bestIdx - 1]}"]`)
        const nextEl = document.querySelector(`[data-block-id="${blockIds[bestIdx]}"]`)
        if (prevEl && nextEl) {
          setDropIndicatorY((prevEl.getBoundingClientRect().bottom + nextEl.getBoundingClientRect().top) / 2)
        }
      }
    }

    function onMouseUp() {
      window.removeEventListener("mousemove", onMouseMove)
      window.removeEventListener("mouseup", onMouseUp)
      setDragging(null)
      setDropTargetIndex(null)
      setDropIndicatorY(null)

      if (latestDropIdx != null && latestDropIdx !== fromIndex && latestDropIdx !== fromIndex + 1) {
        const adjustedTo = latestDropIdx > fromIndex ? latestDropIdx - 1 : latestDropIdx
        sendToParent({
          type: "REORDER_BLOCK",
          payload: { sectionId: ownerSectionId!, zoneId: ownerZoneId!, fromIndex, toIndex: adjustedTo },
        })
      }
    }

    window.addEventListener("mousemove", onMouseMove)
    window.addEventListener("mouseup", onMouseUp)
  }, [sections])

  // ─── Block resize (column span) ─────────────────────────────────────────

  const handleBlockResizeStart = useCallback((side: "left" | "right", e: React.MouseEvent, blockId: string) => {
    e.preventDefault()
    // Find block info
    let ownerSectionId: string | null = null
    let currentColSpan = 12
    for (const section of sections) {
      for (const zone of section.contentZones) {
        const block = zone.blocks.find(b => b.id === blockId)
        if (block) {
          ownerSectionId = section.id
          currentColSpan = block.position.colSpan
          break
        }
      }
      if (ownerSectionId) break
    }
    if (!ownerSectionId) return

    const blockEl = document.querySelector(`[data-block-id="${blockId}"]`)
    if (!blockEl) return
    const startX = e.clientX
    const startWidth = blockEl.getBoundingClientRect().width
    // Each grid column = total zone width / 12
    const zoneEl = blockEl.parentElement
    if (!zoneEl) return
    const colWidth = zoneEl.getBoundingClientRect().width / 12

    function onMouseMove(ev: MouseEvent) {
      const dx = side === "right" ? ev.clientX - startX : startX - ev.clientX
      const newWidth = startWidth + dx
      const newSpan = Math.max(1, Math.min(12, Math.round(newWidth / colWidth)))
      if (newSpan !== currentColSpan) {
        currentColSpan = newSpan
        // Live preview: update the block element width
        const el = document.querySelector(`[data-block-id="${blockId}"]`) as HTMLElement
        if (el) {
          el.style.gridColumn = `span ${newSpan}`
        }
      }
    }

    function onMouseUp() {
      window.removeEventListener("mousemove", onMouseMove)
      window.removeEventListener("mouseup", onMouseUp)
      sendToParent({
        type: "RESIZE_BLOCK",
        payload: { sectionId: ownerSectionId!, blockId, colSpan: currentColSpan },
      })
    }

    window.addEventListener("mousemove", onMouseMove)
    window.addEventListener("mouseup", onMouseUp)
  }, [sections])

  const isHoverSuppressed = hovered && selected && hovered.id === selected.id
  const isInlineEditing = editingBlockId !== null
  const multiSelectCount = selectedBlockIds.length

  // Compute rects for multi-selected blocks
  const multiSelectRects: { id: string; rect: DOMRect }[] = []
  if (multiSelectCount > 1) {
    for (const blockId of selectedBlockIds) {
      const el = document.querySelector(`[data-block-id="${blockId}"]`)
      if (el) multiSelectRects.push({ id: blockId, rect: el.getBoundingClientRect() })
    }
  }

  return (
    <>
      {/* Overlays are hidden while inline editing — TipTap owns the cursor */}
      {!isInlineEditing && hovered && !isHoverSuppressed && (
        <OverlayBox
          rect={hovered.rect}
          color="rgba(59,130,246,0.5)"
        />
      )}

      {!isInlineEditing && selected && multiSelectCount <= 1 && (
        <OverlayBox
          rect={selected.rect}
          color={longPressId === selected.id ? "#f97316" : "#3b82f6"}
          showSectionLabel={selected.kind === "section"}
          showDragHandle={
            selected.kind === "section"
              ? sections.length > 1
              : true
          }
          onDragStart={
            selected.kind === "section"
              ? (e) => handleDragStart(e, selected.id)
              : (e) => handleBlockDragStart(e, selected.id)
          }
          showResizeHandles={selected.kind === "block"}
          onResizeStart={selected.kind === "block"
            ? (side, e) => handleBlockResizeStart(side, e, selected.id)
            : undefined
          }
          showDelete
          onDelete={() => {
            if (selected.kind === "section") {
              sendToParent({ type: "DELETE_SECTION", payload: { sectionId: selected.id } })
            } else {
              sendToParent({ type: "DELETE_BLOCK", payload: { blockId: selected.id } })
            }
            setSelected(null)
          }}
          label={
            longPressId === selected.id ? "Drag mode"
            : selected.kind === "section" ? undefined
            : (() => {
                const el = document.querySelector(`[data-block-id="${selected.id}"]`)
                return el?.getAttribute("data-block-type") ?? "Block"
              })()
          }
        />
      )}

      {/* Multi-select overlays */}
      {!isInlineEditing && multiSelectCount > 1 && multiSelectRects.map(({ id, rect }) => (
        <OverlayBox
          key={id}
          rect={rect}
          color="rgba(59,130,246,0.45)"
          showResizeHandles={false}
        />
      ))}

      {/* Multi-select count badge */}
      {!isInlineEditing && multiSelectCount > 1 && multiSelectRects.length > 0 && (() => {
        const first = multiSelectRects[0].rect
        return (
          <div
            style={{
              position: "fixed",
              top: first.top - 32,
              left: first.left,
              background: "#3b82f6",
              color: "#fff",
              fontSize: 12,
              fontWeight: 600,
              padding: "3px 10px",
              borderRadius: 6,
              pointerEvents: "none",
              zIndex: 10001,
              userSelect: "none",
              whiteSpace: "nowrap",
            }}
          >
            {multiSelectCount} selected
          </div>
        )
      })()}

      {/* Insert points between sections (hidden while dragging) */}
      {!dragging && insertPoints.map((point) => (
        <InsertPointButton key={point.sectionId} point={point} />
      ))}

      {/* Drop indicator line while dragging */}
      {dragging && dropIndicatorY != null && dropTargetIndex != null && (
        <div
          data-drop-index={dropTargetIndex}
          style={{
            position: "fixed",
            top: dropIndicatorY - 2,
            left: 0,
            right: 0,
            height: 4,
            background: "#3b82f6",
            borderRadius: 2,
            zIndex: 10002,
            pointerEvents: "none",
            boxShadow: "0 0 8px rgba(59,130,246,0.5)",
          }}
        />
      )}
    </>
  )
}
