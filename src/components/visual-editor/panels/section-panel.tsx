"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { useEditorStore } from "@/lib/visual-editor/editor-store"
import type { Section, SectionLayout, SectionBackground, SectionDivider, AnimationConfig } from "@/lib/visual-editor/types"

// ─── Shared styles ────────────────────────────────────────────────────────────

const inputCls = "w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 bg-white"
const labelCls = "block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1"

function SectionHeading({ children }: { children: React.ReactNode }) {
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

interface SectionPanelProps {
  onClose: () => void
  narrow?: boolean
}

type SectionTab = "layout" | "style" | "advanced"

const TABS: { id: SectionTab; label: string }[] = [
  { id: "layout", label: "Layout" },
  { id: "style", label: "Style" },
  { id: "advanced", label: "Advanced" },
]

// ─── Sub-tab components ───────────────────────────────────────────────────────

interface LayoutTabProps {
  section: Section
  onChange: (changes: Partial<Section>) => void
}

function LayoutTab({ section, onChange }: LayoutTabProps) {
  const layout = section.layout

  function updateLayout(patch: Partial<SectionLayout>) {
    onChange({ layout: { ...layout, ...patch } })
  }

  const colRatioOptions =
    layout.columns === 2
      ? [
          { value: "equal", label: "Equal" },
          { value: "1:2", label: "1:2" },
          { value: "2:1", label: "2:1" },
        ]
      : layout.columns === 3
      ? [
          { value: "equal", label: "Equal" },
          { value: "1:1:1", label: "1:1:1" },
        ]
      : [{ value: "equal", label: "Equal" }]

  return (
    <div>
      {/* Columns */}
      <SectionHeading>Columns</SectionHeading>
      <div className="mb-3 flex gap-2">
        {[1, 2, 3, 4].map((n) => (
          <button
            key={n}
            onClick={() => updateLayout({ columns: n })}
            className={`flex-1 rounded-lg border py-2 text-sm font-medium transition-colors ${
              layout.columns === n
                ? "border-blue-500 bg-blue-50 text-blue-600"
                : "border-gray-200 text-gray-600 hover:border-gray-300"
            }`}
          >
            {n}
          </button>
        ))}
      </div>

      {/* Column ratio */}
      <Field label="Column ratio">
        <div className="flex flex-wrap gap-1.5">
          {colRatioOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => updateLayout({ columnRatio: opt.value })}
              className={`rounded-md border px-3 py-1 text-xs font-medium transition-colors ${
                layout.columnRatio === opt.value
                  ? "border-blue-500 bg-blue-50 text-blue-600"
                  : "border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </Field>

      {/* Content width */}
      <Field label="Content width">
        <div className="flex gap-2">
          {(["contained", "full"] as const).map((w) => (
            <button
              key={w}
              onClick={() => updateLayout({ contentWidth: w })}
              className={`flex-1 rounded-lg border py-2 text-sm font-medium capitalize transition-colors ${
                layout.contentWidth === w
                  ? "border-blue-500 bg-blue-50 text-blue-600"
                  : "border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              {w}
            </button>
          ))}
        </div>
      </Field>

      {/* Max width — only when contained */}
      {layout.contentWidth === "contained" && (
        <Field label="Max width (px)">
          <input
            type="number"
            className={inputCls}
            value={layout.maxWidth ?? 1280}
            min={320}
            max={3840}
            onChange={(e) => updateLayout({ maxWidth: Number(e.target.value) })}
          />
        </Field>
      )}

      {/* Vertical align */}
      <Field label="Vertical align">
        <div className="flex gap-2">
          {(["top", "center", "bottom"] as const).map((v) => (
            <button
              key={v}
              onClick={() => updateLayout({ verticalAlign: v })}
              className={`flex-1 rounded-lg border py-2 text-sm font-medium capitalize transition-colors ${
                layout.verticalAlign === v
                  ? "border-blue-500 bg-blue-50 text-blue-600"
                  : "border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </Field>

      {/* Gap */}
      <Field label="Gap (px)">
        <input
          type="number"
          className={inputCls}
          value={layout.gap ?? 24}
          min={0}
          onChange={(e) => updateLayout({ gap: Number(e.target.value) })}
        />
      </Field>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────

interface StyleTabProps {
  section: Section
  onChange: (changes: Partial<Section>) => void
}

function StyleTab({ section, onChange }: StyleTabProps) {
  const bg = section.background
  const spacing = section.spacing
  const divider = section.divider

  function updateBg(patch: Partial<SectionBackground>) {
    onChange({ background: { ...bg, ...patch } })
  }

  function updateDivider(patch: Partial<SectionDivider>) {
    onChange({ divider: { ...divider, ...patch } })
  }

  return (
    <div>
      {/* Background type */}
      <SectionHeading>Background</SectionHeading>
      <Field label="Type">
        <div className="flex flex-wrap gap-1.5 mb-3">
          {(["none", "color", "gradient", "image"] as const).map((t) => (
            <label key={t} className="flex items-center gap-1.5">
              <input
                type="radio"
                name="bg-type"
                value={t}
                checked={bg.type === t}
                onChange={() => updateBg({ type: t })}
              />
              <span className="text-sm capitalize text-gray-700">{t}</span>
            </label>
          ))}
        </div>
      </Field>

      {/* Color */}
      {bg.type === "color" && (
        <Field label="Color">
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={bg.color ?? "#ffffff"}
              onChange={(e) => updateBg({ color: e.target.value })}
              className="h-9 w-12 cursor-pointer rounded border border-gray-200 bg-white p-0.5"
            />
            <input
              type="text"
              className={inputCls}
              value={bg.color ?? ""}
              placeholder="#ffffff"
              onChange={(e) => updateBg({ color: e.target.value })}
            />
          </div>
        </Field>
      )}

      {/* Gradient */}
      {bg.type === "gradient" && (
        <>
          <Field label="From">
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={bg.gradient?.from ?? "#ffffff"}
                onChange={(e) => updateBg({ gradient: { ...bg.gradient, from: e.target.value, to: bg.gradient?.to ?? "#000000", angle: bg.gradient?.angle ?? 135 } })}
                className="h-9 w-12 cursor-pointer rounded border border-gray-200 bg-white p-0.5"
              />
              <input
                type="text"
                className={inputCls}
                value={bg.gradient?.from ?? ""}
                placeholder="#ffffff"
                onChange={(e) => updateBg({ gradient: { ...bg.gradient, from: e.target.value, to: bg.gradient?.to ?? "#000000", angle: bg.gradient?.angle ?? 135 } })}
              />
            </div>
          </Field>
          <Field label="To">
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={bg.gradient?.to ?? "#000000"}
                onChange={(e) => updateBg({ gradient: { ...bg.gradient, from: bg.gradient?.from ?? "#ffffff", to: e.target.value, angle: bg.gradient?.angle ?? 135 } })}
                className="h-9 w-12 cursor-pointer rounded border border-gray-200 bg-white p-0.5"
              />
              <input
                type="text"
                className={inputCls}
                value={bg.gradient?.to ?? ""}
                placeholder="#000000"
                onChange={(e) => updateBg({ gradient: { ...bg.gradient, from: bg.gradient?.from ?? "#ffffff", to: e.target.value, angle: bg.gradient?.angle ?? 135 } })}
              />
            </div>
          </Field>
          <Field label="Angle (deg)">
            <input
              type="number"
              className={inputCls}
              value={bg.gradient?.angle ?? 135}
              min={0}
              max={360}
              onChange={(e) => updateBg({ gradient: { ...bg.gradient, from: bg.gradient?.from ?? "#ffffff", to: bg.gradient?.to ?? "#000000", angle: Number(e.target.value) } })}
            />
          </Field>
        </>
      )}

      {/* Image */}
      {bg.type === "image" && (
        <Field label="Image URL">
          <input
            type="text"
            className={inputCls}
            value={bg.image?.url ?? ""}
            placeholder="https://..."
            onChange={(e) =>
              updateBg({
                image: {
                  ...bg.image,
                  url: e.target.value,
                  focalPoint: bg.image?.focalPoint ?? { x: 0.5, y: 0.5 },
                  opacity: bg.image?.opacity ?? 1,
                },
              })
            }
          />
        </Field>
      )}

      {/* Padding */}
      <SectionHeading>Padding</SectionHeading>
      <div className="mb-3 grid grid-cols-2 gap-2">
        <div>
          <label className={labelCls}>Top (px)</label>
          <input
            type="number"
            className={inputCls}
            value={spacing.paddingTop ?? 64}
            min={0}
            onChange={(e) => onChange({ spacing: { ...spacing, paddingTop: Number(e.target.value) } })}
          />
        </div>
        <div>
          <label className={labelCls}>Bottom (px)</label>
          <input
            type="number"
            className={inputCls}
            value={spacing.paddingBottom ?? 64}
            min={0}
            onChange={(e) => onChange({ spacing: { ...spacing, paddingBottom: Number(e.target.value) } })}
          />
        </div>
      </div>

      {/* Divider */}
      <SectionHeading>Divider</SectionHeading>
      <Field label="Type">
        <select
          className={inputCls}
          value={divider.type}
          onChange={(e) => updateDivider({ type: e.target.value as SectionDivider["type"] })}
        >
          <option value="none">None</option>
          <option value="line">Line</option>
          <option value="wave">Wave</option>
          <option value="angle">Angle</option>
          <option value="curve">Curve</option>
        </select>
      </Field>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────

interface AdvancedTabProps {
  section: Section
  onChange: (changes: Partial<Section>) => void
}

function AdvancedTab({ section, onChange }: AdvancedTabProps) {
  const anim = section.animation

  function updateAnim(patch: Partial<AnimationConfig>) {
    onChange({ animation: { ...anim, ...patch } })
  }

  return (
    <div className="space-y-4">
      {/* Animation type */}
      <div>
        <label className={labelCls}>Animation type</label>
        <select
          className={inputCls}
          value={anim.type}
          onChange={(e) => updateAnim({ type: e.target.value as AnimationConfig["type"] })}
        >
          <option value="none">None</option>
          <option value="fade-in">Fade in</option>
          <option value="slide-up">Slide up</option>
          <option value="scale-in">Scale in</option>
        </select>
      </div>

      {/* Animation trigger */}
      {anim.type !== "none" && (
        <div>
          <label className={labelCls}>Trigger</label>
          <select
            className={inputCls}
            value={anim.trigger}
            onChange={(e) => updateAnim({ trigger: e.target.value as AnimationConfig["trigger"] })}
          >
            <option value="on-load">On load</option>
            <option value="on-scroll">On scroll</option>
          </select>
        </div>
      )}

      {/* Custom CSS class */}
      <div>
        <label className={labelCls}>Custom CSS class</label>
        <input
          type="text"
          className={inputCls}
          value={section.label ?? ""}
          placeholder="my-section-class"
          onChange={(e) => onChange({ label: e.target.value })}
        />
        <p className="mt-1 text-xs text-gray-400">Applied to the section wrapper element.</p>
      </div>
    </div>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function SectionPanel({ onClose, narrow }: SectionPanelProps) {
  const selectedSectionId = useEditorStore((s) => s.selectedSectionId)
  const sections = useEditorStore((s) => s.sections)
  const updateSection = useEditorStore((s) => s.updateSection)

  // Section panel uses its own local tab state (layout/style/advanced)
  // to avoid conflicting with the store's PropertyTab type (content/style/advanced)
  const [activeTab, setActiveTab] = useState<SectionTab>("layout")

  const section = sections.find((s) => s.id === selectedSectionId)

  if (!section || !selectedSectionId) return null

  function handleChange(changes: Partial<Section>) {
    updateSection(selectedSectionId!, changes)
  }

  return (
    <div className={`fixed right-0 top-12 z-40 flex ${narrow ? "w-72" : "w-80"} max-h-[calc(100vh-3rem)] flex-col overflow-hidden rounded-bl-xl rounded-tl-xl border border-gray-200 bg-white shadow-2xl`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 shrink-0">
        <span className="text-sm font-semibold text-gray-900">Section</span>
        <button
          onClick={onClose}
          className="flex h-6 w-6 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
          aria-label="Close section panel"
        >
          <X size={14} />
        </button>
      </div>

      {/* Tab bar */}
      <div className="flex shrink-0 border-b border-gray-100">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-2 py-2.5 text-xs font-medium transition-colors ${
              activeTab === tab.id
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === "layout" && (
          <LayoutTab section={section} onChange={handleChange} />
        )}
        {activeTab === "style" && (
          <StyleTab section={section} onChange={handleChange} />
        )}
        {activeTab === "advanced" && (
          <AdvancedTab section={section} onChange={handleChange} />
        )}
      </div>
    </div>
  )
}
