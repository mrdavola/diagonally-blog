"use client"

import type { EditorBlock, BlockStyle, BlockPosition } from "@/lib/visual-editor/types"

// ─── Shared styles ────────────────────────────────────────────────────────────

const inputCls = "w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 bg-white"
const labelCls = "block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1"

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="mb-2 mt-4 text-xs font-semibold uppercase tracking-wider text-gray-400 first:mt-0">{children}</p>
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <label className={labelCls}>{label}</label>
      {children}
    </div>
  )
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface StyleTabProps {
  block: EditorBlock
  sectionId: string
  onUpdateStyle: (style: Partial<BlockStyle>) => void
  onUpdatePosition: (pos: Partial<BlockPosition>) => void
}

// ─── Component ────────────────────────────────────────────────────────────────

export function StyleTab({ block, onUpdateStyle, onUpdatePosition }: StyleTabProps) {
  const { style, position } = block

  const margin = style.margin ?? {}
  const padding = style.padding ?? {}

  function handleSpacingChange(
    group: "margin" | "padding",
    side: "top" | "right" | "bottom" | "left",
    value: number
  ) {
    if (group === "margin") {
      onUpdateStyle({ margin: { ...margin, [side]: value } })
    } else {
      onUpdateStyle({ padding: { ...padding, [side]: value } })
    }
  }

  return (
    <div>
      {/* Size */}
      <SectionLabel>Size</SectionLabel>
      <Field label="Column span (1–12)">
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={1}
            max={12}
            value={position.colSpan ?? 12}
            onChange={(e) =>
              onUpdatePosition({ colSpan: Number(e.target.value) })
            }
            className="flex-1"
          />
          <span className="w-6 text-right text-sm text-gray-600">{position.colSpan ?? 12}</span>
        </div>
      </Field>

      {/* Spacing — Margin */}
      <SectionLabel>Margin</SectionLabel>
      <div className="grid grid-cols-2 gap-2">
        {(["top", "right", "bottom", "left"] as const).map((side) => (
          <div key={side}>
            <label className={labelCls}>{side}</label>
            <input
              type="number"
              className={inputCls}
              value={margin[side] ?? 0}
              onChange={(e) => handleSpacingChange("margin", side, Number(e.target.value))}
            />
          </div>
        ))}
      </div>

      {/* Spacing — Padding */}
      <SectionLabel>Padding</SectionLabel>
      <div className="grid grid-cols-2 gap-2 mb-3">
        {(["top", "right", "bottom", "left"] as const).map((side) => (
          <div key={side}>
            <label className={labelCls}>{side}</label>
            <input
              type="number"
              className={inputCls}
              value={padding[side] ?? 0}
              onChange={(e) => handleSpacingChange("padding", side, Number(e.target.value))}
            />
          </div>
        ))}
      </div>

      {/* Background */}
      <SectionLabel>Background</SectionLabel>
      <Field label="Color">
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={style.background ?? "#ffffff"}
            onChange={(e) => onUpdateStyle({ background: e.target.value })}
            className="h-9 w-12 cursor-pointer rounded border border-gray-200 bg-white p-0.5"
          />
          <input
            type="text"
            className={inputCls}
            value={style.background ?? ""}
            placeholder="#ffffff"
            onChange={(e) => onUpdateStyle({ background: e.target.value })}
          />
        </div>
      </Field>

      {/* Border radius */}
      <SectionLabel>Border</SectionLabel>
      <Field label="Border radius (px)">
        <input
          type="number"
          className={inputCls}
          value={style.borderRadius ?? 0}
          min={0}
          onChange={(e) => onUpdateStyle({ borderRadius: Number(e.target.value) })}
        />
      </Field>

      {/* Shadow */}
      <Field label="Shadow">
        <select
          className={inputCls}
          value={style.shadow ?? "none"}
          onChange={(e) => onUpdateStyle({ shadow: e.target.value as BlockStyle["shadow"] })}
        >
          <option value="none">None</option>
          <option value="sm">Small</option>
          <option value="md">Medium</option>
          <option value="lg">Large</option>
        </select>
      </Field>

      {/* Opacity */}
      <SectionLabel>Opacity</SectionLabel>
      <Field label="Opacity (0–100)">
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={0}
            max={100}
            value={style.opacity ?? 100}
            onChange={(e) => onUpdateStyle({ opacity: Number(e.target.value) })}
            className="flex-1"
          />
          <span className="w-8 text-right text-sm text-gray-600">{style.opacity ?? 100}</span>
        </div>
      </Field>
    </div>
  )
}
