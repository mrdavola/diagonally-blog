"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import type { Section } from "@/lib/visual-editor/types"
import { sendToParent } from "@/lib/visual-editor/message-bridge"

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
}

export function EditorRuntime({ sections }: EditorRuntimeProps) {
  const [hovered, setHovered] = useState<OverlayTarget | null>(null)
  const [selected, setSelected] = useState<OverlayTarget | null>(null)
  const [insertPoints, setInsertPoints] = useState<InsertPoint[]>([])
  const rafRef = useRef<number | null>(null)

  // Recompute insert points whenever sections change (after render)
  useEffect(() => {
    // Defer until DOM has updated
    const id = requestAnimationFrame(() => {
      setInsertPoints(collectInsertPoints(sections))
    })
    return () => cancelAnimationFrame(id)
  }, [sections])

  // Mouse move — throttled via rAF
  const handleMouseMove = useCallback((e: MouseEvent) => {
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
  }, [])

  // Click — select or deselect
  const handleClick = useCallback((e: MouseEvent) => {
    const target = findEditorTarget(e.target as Element)
    if (target) {
      setSelected(target)
      sendToParent({
        type: "ELEMENT_SELECTED",
        payload: { id: target.id, kind: target.kind, rect: target.rect },
      })
    } else {
      setSelected(null)
      sendToParent({ type: "ELEMENT_DESELECTED" })
    }
  }, [])

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("click", handleClick)
    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("click", handleClick)
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [handleMouseMove, handleClick])

  const isHoverSuppressed = hovered && selected && hovered.id === selected.id

  return (
    <>
      {/* Hover overlay — hidden when same as selected */}
      {hovered && !isHoverSuppressed && (
        <OverlayBox
          rect={hovered.rect}
          color="rgba(59,130,246,0.5)"
        />
      )}

      {/* Selection overlay */}
      {selected && (
        <OverlayBox
          rect={selected.rect}
          color="#3b82f6"
          showHandles={selected.kind === "block"}
          showSectionLabel={selected.kind === "section"}
        />
      )}

      {/* Insert points between sections */}
      {insertPoints.map((point) => (
        <InsertPointButton key={point.sectionId} point={point} />
      ))}
    </>
  )
}
