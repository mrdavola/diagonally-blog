"use client"

import { useRef, useCallback } from "react"
import { sendToParent } from "@/lib/visual-editor/message-bridge"

// ─── Types ────────────────────────────────────────────────────────────────────

interface UseTouchGesturesOptions {
  /** Called when a section or block is tapped */
  onTap?: (target: { id: string; kind: "section" | "block"; rect: DOMRect }) => void
  /** Called when a text block is double-tapped */
  onDoubleTap?: (target: { blockId: string; sectionId: string }) => void
  /** Called when a block is long-pressed (visual feedback signal) */
  onLongPress?: (target: { id: string; kind: "section" | "block" }) => void
  /** Called on two-finger tap → undo */
  onTwoFingerTap?: () => void
  /** Called on three-finger tap → redo */
  onThreeFingerTap?: () => void
}

// ─── Helpers (duplicated from editor-runtime to keep hook self-contained) ────

function findTextBlockTarget(element: Element | null): { blockId: string; sectionId: string } | null {
  let el = element
  while (el && el !== document.documentElement) {
    const blockType = el.getAttribute("data-block-type")
    if (blockType === "text") {
      const blockId = el.getAttribute("data-block-id")
      if (!blockId) return null
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

function findEditorTarget(element: Element | null): { id: string; kind: "section" | "block"; rect: DOMRect } | null {
  let el = element
  while (el && el !== document.documentElement) {
    const blockId = el.getAttribute("data-block-id")
    if (blockId) return { id: blockId, kind: "block", rect: el.getBoundingClientRect() }
    const sectionId = el.getAttribute("data-section-id")
    if (sectionId) return { id: sectionId, kind: "section", rect: el.getBoundingClientRect() }
    el = el.parentElement
  }
  return null
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DOUBLE_TAP_MS = 300
const LONG_PRESS_MS = 500

// ─── Hook ────────────────────────────────────────────────────────────────────

/**
 * Adds touch gesture recognition to the editor canvas.
 *
 * Returns a ref that should be attached to the root canvas container.
 * Handles: tap, double-tap, long-press, two-finger tap, three-finger tap.
 *
 * This hook does NOT use @use-gesture/react because the library does not natively
 * support multi-finger tap differentiation in a way that meshes well with the
 * editor's existing pointer-event model. Instead, we use native touch events
 * which gives precise control over touch counts and timing.
 */
export function useTouchGestures(options: UseTouchGesturesOptions = {}) {
  const { onTap, onDoubleTap, onLongPress, onTwoFingerTap, onThreeFingerTap } = options

  const lastTapRef = useRef<{ time: number; target: Element | null }>({ time: 0, target: null })
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const touchStartTargetRef = useRef<Element | null>(null)

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touchCount = e.touches.length

    // Multi-finger taps: check immediately on touchstart
    if (touchCount === 2) {
      // Will confirm on touchend
      return
    }
    if (touchCount === 3) {
      // Will confirm on touchend
      return
    }

    // Single touch — track for tap/double-tap/long-press
    if (touchCount === 1) {
      const touch = e.touches[0]
      touchStartTargetRef.current = document.elementFromPoint(touch.clientX, touch.clientY)

      // Long-press timer
      if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = setTimeout(() => {
        const target = touchStartTargetRef.current
        const editorTarget = findEditorTarget(target)
        if (editorTarget && onLongPress) {
          onLongPress({ id: editorTarget.id, kind: editorTarget.kind })
        }
      }, LONG_PRESS_MS)
    }
  }, [onLongPress])

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    // Clear long-press timer on any lift
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }

    const changedTouches = e.changedTouches.length
    const remainingTouches = e.touches.length

    // Multi-finger taps — fire when all fingers lift (no remaining touches)
    if (remainingTouches === 0 && changedTouches === 2) {
      onTwoFingerTap?.()
      return
    }
    if (remainingTouches === 0 && changedTouches === 3) {
      onThreeFingerTap?.()
      return
    }

    // Single-finger tap (changedTouches === 1, no remaining)
    if (changedTouches === 1 && remainingTouches === 0) {
      const touch = e.changedTouches[0]
      const elementAtPoint = document.elementFromPoint(touch.clientX, touch.clientY)

      // Double-tap detection
      const now = Date.now()
      const sinceLastTap = now - lastTapRef.current.time
      if (
        sinceLastTap < DOUBLE_TAP_MS &&
        lastTapRef.current.target !== null
      ) {
        // Double-tap
        const textTarget = findTextBlockTarget(elementAtPoint)
        if (textTarget) {
          e.preventDefault()
          onDoubleTap?.({ blockId: textTarget.blockId, sectionId: textTarget.sectionId })
          // Reset so the next tap is fresh
          lastTapRef.current = { time: 0, target: null }
          return
        }
      }

      lastTapRef.current = { time: now, target: elementAtPoint }

      // Single tap
      const editorTarget = findEditorTarget(elementAtPoint)
      if (editorTarget && onTap) {
        onTap(editorTarget)
      }
    }
  }, [onTap, onDoubleTap, onTwoFingerTap, onThreeFingerTap])

  const handleTouchMove = useCallback(() => {
    // Cancel long-press if finger moved
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }
  }, [])

  /**
   * Bind these handlers to a DOM element via addEventListener.
   * Returns an unsubscribe function.
   */
  function bind(element: EventTarget) {
    element.addEventListener("touchstart", handleTouchStart as EventListener, { passive: true })
    element.addEventListener("touchend", handleTouchEnd as EventListener, { passive: false })
    element.addEventListener("touchmove", handleTouchMove as EventListener, { passive: true })

    return () => {
      element.removeEventListener("touchstart", handleTouchStart as EventListener)
      element.removeEventListener("touchend", handleTouchEnd as EventListener)
      element.removeEventListener("touchmove", handleTouchMove as EventListener)
    }
  }

  return { bind }
}

// ─── Re-export helpers so editor-runtime can use them ─────────────────────────

export { findEditorTarget, findTextBlockTarget }
