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
  /** Show resize handles (8-point) — only for block selection */
  showHandles?: boolean
  /** Show "Section" label — only for section selection */
  showSectionLabel?: boolean
  label?: string
}

const HANDLE_CURSORS = [
  { pos: "nw", cursor: "nw-resize", style: { top: -4, left: -4 } },
  { pos: "n",  cursor: "n-resize",  style: { top: -4, left: "calc(50% - 4px)" } },
  { pos: "ne", cursor: "ne-resize", style: { top: -4, right: -4 } },
  { pos: "e",  cursor: "e-resize",  style: { top: "calc(50% - 4px)", right: -4 } },
  { pos: "se", cursor: "se-resize", style: { bottom: -4, right: -4 } },
  { pos: "s",  cursor: "s-resize",  style: { bottom: -4, left: "calc(50% - 4px)" } },
  { pos: "sw", cursor: "sw-resize", style: { bottom: -4, left: -4 } },
  { pos: "w",  cursor: "w-resize",  style: { bottom: "calc(50% - 4px)", left: -4 } },
] as const

function OverlayBox({ rect, color, showHandles, showSectionLabel, label }: OverlayBoxProps) {
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
      {/* Label */}
      {(showSectionLabel || label) && (
        <div
          style={{
            position: "absolute",
            top: -22,
            left: 0,
            background: color,
            color: "#fff",
            fontSize: 11,
            fontWeight: 600,
            padding: "1px 6px",
            borderRadius: "3px 3px 0 0",
            whiteSpace: "nowrap",
            pointerEvents: "none",
            userSelect: "none",
          }}
        >
          {label ?? "Section"}
        </div>
      )}

      {/* Resize handles — pointer-events enabled */}
      {showHandles &&
        HANDLE_CURSORS.map(({ pos, cursor, style: hStyle }) => (
          <div
            key={pos}
            style={{
              position: "absolute",
              width: 8,
              height: 8,
              background: "#fff",
              border: `2px solid ${color}`,
              borderRadius: 1,
              cursor,
              pointerEvents: "all",
              zIndex: 10000,
              boxSizing: "border-box",
              ...hStyle,
            }}
          />
        ))}
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

  // Escape key — stop inline editing
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape" && editingBlockId) {
      stopEditing()
    }
  }, [editingBlockId, stopEditing])

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
          showHandles={selected.kind === "block"}
          showSectionLabel={selected.kind === "section"}
          label={longPressId === selected.id ? "Drag mode" : undefined}
        />
      )}

      {/* Multi-select overlays */}
      {!isInlineEditing && multiSelectCount > 1 && multiSelectRects.map(({ id, rect }) => (
        <OverlayBox
          key={id}
          rect={rect}
          color="rgba(59,130,246,0.45)"
          showHandles={false}
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

      {/* Insert points between sections */}
      {insertPoints.map((point) => (
        <InsertPointButton key={point.sectionId} point={point} />
      ))}
    </>
  )
}
