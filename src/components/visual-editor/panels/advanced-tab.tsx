"use client"

import type { EditorBlock } from "@/lib/visual-editor/types"

// ─── Shared styles ────────────────────────────────────────────────────────────

const inputCls = "w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 bg-white"
const labelCls = "block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1"

// ─── Props ────────────────────────────────────────────────────────────────────

interface AdvancedTabProps {
  block: EditorBlock
  sectionId: string
  onUpdateProps: (props: Record<string, unknown>) => void
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AdvancedTab({ block, onUpdateProps }: AdvancedTabProps) {
  const p = block.props as Record<string, unknown>
  const hideOnMobile = Boolean(p.hideOnMobile)
  const hideOnDesktop = Boolean(p.hideOnDesktop)

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
            <button
              role="switch"
              aria-checked={hideOnMobile}
              onClick={() => {
                // Visibility is stored in responsive overrides — expose via props for simplicity
                onUpdateProps({ hideOnMobile: !hideOnMobile })
              }}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                hideOnMobile ? "bg-blue-500" : "bg-gray-200"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                  hideOnMobile ? "translate-x-4" : "translate-x-0.5"
                }`}
              />
            </button>
          </label>
          <label className="flex items-center justify-between text-sm text-gray-700">
            <span>Hide on desktop</span>
            <button
              role="switch"
              aria-checked={hideOnDesktop}
              onClick={() => {
                onUpdateProps({ hideOnDesktop: !hideOnDesktop })
              }}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                hideOnDesktop ? "bg-blue-500" : "bg-gray-200"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                  hideOnDesktop ? "translate-x-4" : "translate-x-0.5"
                }`}
              />
            </button>
          </label>
        </div>
      </div>
    </div>
  )
}
