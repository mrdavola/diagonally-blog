"use client"

import { useState } from "react"
import * as Icons from "lucide-react"
import { X, Search } from "lucide-react"
import {
  VISUAL_BLOCK_DEFINITIONS,
  createBlockFromDefinition,
  type BlockDefinition,
} from "@/lib/visual-editor/block-registry"
import { useEditorStore } from "@/lib/visual-editor/editor-store"
import type { BlockType } from "@/lib/visual-editor/types"

// ─── Types ───────────────────────────────────────────────────────────────────

interface BlockInserterProps {
  targetSectionId: string
  targetZoneId: string
  onClose: () => void
}

// ─── Constants ───────────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<BlockDefinition["category"], string> = {
  essentials: "Essentials",
  layout: "Layout",
  media: "Media",
  data: "Data",
  forms: "Forms & Actions",
  embed: "Embed",
}

const CATEGORY_ORDER: BlockDefinition["category"][] = [
  "essentials",
  "layout",
  "media",
  "data",
  "forms",
  "embed",
]

// ─── Icon Lookup ─────────────────────────────────────────────────────────────

type LucideIconComponent = React.ComponentType<{ size?: number; className?: string }>

function getIcon(name: string): LucideIconComponent {
  const icon = (Icons as Record<string, unknown>)[name]
  if (typeof icon === "function" || (typeof icon === "object" && icon !== null)) {
    return icon as LucideIconComponent
  }
  return Icons.Box
}

// ─── Block Button ─────────────────────────────────────────────────────────────

function BlockButton({
  def,
  onClick,
}: {
  def: BlockDefinition
  onClick: () => void
}) {
  const Icon = getIcon(def.icon)

  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 rounded-lg border border-transparent bg-neutral-50 p-3 text-center transition-colors hover:border-neutral-200 hover:bg-white active:bg-neutral-100"
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-md bg-white shadow-sm ring-1 ring-black/5">
        <Icon size={16} className="text-neutral-600" />
      </span>
      <span className="text-[11px] font-medium leading-tight text-neutral-700">
        {def.label}
      </span>
    </button>
  )
}

// ─── Block Inserter ───────────────────────────────────────────────────────────

export function BlockInserter({
  targetSectionId,
  targetZoneId,
  onClose,
}: BlockInserterProps) {
  const [query, setQuery] = useState("")
  const addBlock = useEditorStore((s) => s.addBlock)

  const trimmed = query.trim().toLowerCase()

  const filtered = trimmed
    ? VISUAL_BLOCK_DEFINITIONS.filter(
        (def) =>
          def.label.toLowerCase().includes(trimmed) ||
          def.category.toLowerCase().includes(trimmed)
      )
    : VISUAL_BLOCK_DEFINITIONS

  function handleInsert(type: BlockType) {
    const block = createBlockFromDefinition(type)
    addBlock(targetSectionId, targetZoneId, block)
    onClose()
  }

  // Group by category, preserving order
  const grouped = CATEGORY_ORDER.reduce<Map<BlockDefinition["category"], BlockDefinition[]>>(
    (acc, cat) => {
      const items = filtered.filter((d) => d.category === cat)
      if (items.length > 0) acc.set(cat, items)
      return acc
    },
    new Map()
  )

  return (
    <div className="flex w-[272px] flex-col overflow-hidden rounded-xl bg-white shadow-xl ring-1 ring-black/8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-3">
        <span className="text-sm font-semibold text-neutral-900">Add Block</span>
        <button
          onClick={onClose}
          className="flex h-6 w-6 items-center justify-center rounded-md text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
          aria-label="Close block inserter"
        >
          <X size={14} />
        </button>
      </div>

      {/* Search */}
      <div className="px-3 py-2">
        <div className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-1.5 focus-within:border-neutral-400 focus-within:bg-white">
          <Search size={13} className="shrink-0 text-neutral-400" />
          <input
            type="text"
            placeholder="Search blocks…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-[13px] text-neutral-800 placeholder:text-neutral-400 focus:outline-none"
            autoFocus
          />
        </div>
      </div>

      {/* Block list */}
      <div className="flex-1 overflow-y-auto px-3 pb-3">
        {grouped.size === 0 ? (
          <p className="py-8 text-center text-[13px] text-neutral-400">
            No blocks match &ldquo;{query}&rdquo;
          </p>
        ) : (
          Array.from(grouped.entries()).map(([category, defs]) => (
            <div key={category} className="mb-4">
              <p className="mb-1.5 px-0.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                {CATEGORY_LABELS[category]}
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {defs.map((def) => (
                  <BlockButton
                    key={def.type}
                    def={def}
                    onClick={() => handleInsert(def.type)}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
