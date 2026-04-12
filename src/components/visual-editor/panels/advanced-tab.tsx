"use client"

import { useState } from "react"
import { useEditorStore } from "@/lib/visual-editor/editor-store"
import type { EditorBlock, BlockResponsiveOverrides } from "@/lib/visual-editor/types"

// ─── Shared styles ────────────────────────────────────────────────────────────

const inputCls = "w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 bg-white"
const labelCls = "block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1"

type ResponsiveBreakpoint = "desktop" | "tablet" | "mobile"

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
        checked ? "bg-blue-500" : "bg-gray-200"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-4" : "translate-x-0.5"
        }`}
      />
    </button>
  )
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface AdvancedTabProps {
  block: EditorBlock
  sectionId: string
  onUpdateProps: (props: Record<string, unknown>) => void
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AdvancedTab({ block, sectionId, onUpdateProps }: AdvancedTabProps) {
  const p = block.props as Record<string, unknown>
  const hideOnMobile = Boolean(p.hideOnMobile)
  const hideOnDesktop = Boolean(p.hideOnDesktop)
  const [editingBreakpoint, setEditingBreakpoint] = useState<ResponsiveBreakpoint>("desktop")

  const updateSection = useEditorStore((s) => s.updateSection)
  const sections = useEditorStore((s) => s.sections)

  // ─── Responsive override helpers ─────────────────────────────────────────

  function getOverrides(bp: "tablet" | "mobile"): BlockResponsiveOverrides {
    return block.responsive[bp] ?? {}
  }

  function saveResponsiveOverride(bp: "tablet" | "mobile", patch: Partial<BlockResponsiveOverrides>) {
    const section = sections.find((s) => s.id === sectionId)
    if (!section) return

    const updatedZones = section.contentZones.map((zone) => ({
      ...zone,
      blocks: zone.blocks.map((b) =>
        b.id === block.id
          ? { ...b, responsive: { ...b.responsive, [bp]: { ...getOverrides(bp), ...patch } } }
          : b
      ),
    }))

    updateSection(sectionId, { contentZones: updatedZones })
  }

  const showOverrides = editingBreakpoint !== "desktop"
  const activeBp = editingBreakpoint as "tablet" | "mobile"
  const overrides = showOverrides ? getOverrides(activeBp) : {}
  const overrideColSpan = overrides.position?.colSpan ?? block.position.colSpan
  const overrideHidden = overrides.hidden ?? false
  const overrideMargin = overrides.style?.margin ?? {}
  const overridePadding = overrides.style?.padding ?? {}

  return (
    <div className="space-y-4">
      {/* CSS Class */}
      <div>
        <label className={labelCls}>CSS Class</label>
        <input
          type="text"
          className={inputCls}
          value={String(p.className ?? "")}
          placeholder="my-custom-class"
          onChange={(e) => onUpdateProps({ className: e.target.value })}
        />
      </div>

      {/* Element ID */}
      <div>
        <label className={labelCls}>Element ID</label>
        <input
          type="text"
          className={inputCls}
          value={String(p.id ?? "")}
          placeholder="section-anchor"
          onChange={(e) => onUpdateProps({ id: e.target.value })}
        />
        <p className="mt-1 text-xs text-gray-400">Used as an anchor for deep-linking.</p>
      </div>

      {/* Visibility */}
      <div>
        <label className={labelCls}>Visibility</label>
        <div className="space-y-2 rounded-lg border border-gray-200 p-3">
          <label className="flex items-center justify-between text-sm text-gray-700">
            <span>Hide on mobile</span>
            <Toggle
              checked={hideOnMobile}
              onChange={(v) => onUpdateProps({ hideOnMobile: v })}
            />
          </label>
          <label className="flex items-center justify-between text-sm text-gray-700">
            <span>Hide on desktop</span>
            <Toggle
              checked={hideOnDesktop}
              onChange={(v) => onUpdateProps({ hideOnDesktop: v })}
            />
          </label>
        </div>
      </div>

      {/* ─── Responsive Overrides ─── */}
      <div>
        <label className={labelCls}>Responsive</label>
        <select
          className={inputCls}
          value={editingBreakpoint}
          onChange={(e) => setEditingBreakpoint(e.target.value as ResponsiveBreakpoint)}
        >
          <option value="desktop">Desktop</option>
          <option value="tablet">Tablet</option>
          <option value="mobile">Mobile</option>
        </select>
      </div>

      {showOverrides && (
        <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 space-y-3">
          <p className="text-xs font-medium text-blue-700 uppercase tracking-wider">
            {editingBreakpoint} overrides
          </p>

          {/* Hide on this breakpoint */}
          <label className="flex items-center justify-between text-sm text-gray-700">
            <span>Hide on {editingBreakpoint}</span>
            <Toggle
              checked={overrideHidden}
              onChange={(v) => saveResponsiveOverride(activeBp, { hidden: v })}
            />
          </label>

          {/* Column span override */}
          <div>
            <label className={labelCls}>Column span (1–12)</label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={1}
                max={12}
                value={overrideColSpan}
                onChange={(e) =>
                  saveResponsiveOverride(activeBp, {
                    position: { ...overrides.position, colSpan: Number(e.target.value) },
                  })
                }
                className="flex-1"
              />
              <span className="w-6 text-right text-sm text-gray-600">{overrideColSpan}</span>
            </div>
          </div>

          {/* Margin overrides */}
          <div>
            <label className={labelCls}>Margin (px)</label>
            <div className="grid grid-cols-2 gap-2">
              {(["top", "right", "bottom", "left"] as const).map((side) => (
                <div key={side}>
                  <label className="block text-xs text-gray-400 mb-0.5 capitalize">{side}</label>
                  <input
                    type="number"
                    className={inputCls}
                    value={overrideMargin[side] ?? 0}
                    onChange={(e) =>
                      saveResponsiveOverride(activeBp, {
                        style: {
                          ...overrides.style,
                          margin: { ...overrideMargin, [side]: Number(e.target.value) },
                        },
                      })
                    }
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Padding overrides */}
          <div>
            <label className={labelCls}>Padding (px)</label>
            <div className="grid grid-cols-2 gap-2">
              {(["top", "right", "bottom", "left"] as const).map((side) => (
                <div key={side}>
                  <label className="block text-xs text-gray-400 mb-0.5 capitalize">{side}</label>
                  <input
                    type="number"
                    className={inputCls}
                    value={overridePadding[side] ?? 0}
                    onChange={(e) =>
                      saveResponsiveOverride(activeBp, {
                        style: {
                          ...overrides.style,
                          padding: { ...overridePadding, [side]: Number(e.target.value) },
                        },
                      })
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
