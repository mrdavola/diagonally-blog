"use client"

import { useState } from "react"
import * as Icons from "lucide-react"
import { Search } from "lucide-react"
import { Drawer } from "vaul"
import {
  VISUAL_BLOCK_DEFINITIONS,
  createBlockFromDefinition,
  type BlockDefinition,
} from "@/lib/visual-editor/block-registry"
import { useEditorStore } from "@/lib/visual-editor/editor-store"
import type { BlockType } from "@/lib/visual-editor/types"

// ─── Props ────────────────────────────────────────────────────────────────────

interface BlockInserterMobileProps {
  targetSectionId: string
  targetZoneId: string
  open: boolean
  onClose: () => void
}

// ─── Constants ────────────────────────────────────────────────────────────────

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

// ─── Icon lookup ──────────────────────────────────────────────────────────────

type LucideIconComponent = React.ComponentType<{ size?: number; className?: string }>

function getIcon(name: string): LucideIconComponent {
  const icon = (Icons as Record<string, unknown>)[name]
  if (typeof icon === "function" || (typeof icon === "object" && icon !== null)) {
    return icon as LucideIconComponent
  }
  return Icons.Box
}

// ─── Compact block button (3-column grid) ─────────────────────────────────────

function CompactBlockButton({
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
      className="flex flex-col items-center gap-1 rounded-xl border border-transparent bg-neutral-50 p-2 text-center transition-colors hover:border-neutral-200 hover:bg-white active:bg-neutral-100"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-black/5">
        <Icon size={17} className="text-neutral-600" />
      </span>
      <span className="text-[10px] font-medium leading-tight text-neutral-700 line-clamp-2">
        {def.label}
      </span>
    </button>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export function BlockInserterMobile({
  targetSectionId,
  targetZoneId,
  open,
  onClose,
}: BlockInserterMobileProps) {
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

  const grouped = CATEGORY_ORDER.reduce<Map<BlockDefinition["category"], BlockDefinition[]>>(
    (acc, cat) => {
      const items = filtered.filter((d) => d.category === cat)
      if (items.length > 0) acc.set(cat, items)
      return acc
    },
    new Map()
  )

  return (
    <Drawer.Root
      open={open}
      onOpenChange={(isOpen) => { if (!isOpen) onClose() }}
      snapPoints={[0.6]}
      fadeFromIndex={0}
    >
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-40 bg-black/25" />
        <Drawer.Content
          className="fixed bottom-0 left-0 right-0 z-50 flex flex-col rounded-t-2xl bg-white shadow-2xl outline-none"
          style={{ maxHeight: "70vh" }}
        >
          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-1 shrink-0">
            <div className="h-1 w-10 rounded-full bg-gray-200" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2 shrink-0">
            <span className="text-base font-semibold text-neutral-900">Add Block</span>
          </div>

          {/* Search */}
          <div className="px-4 pb-3 shrink-0">
            <div className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 focus-within:border-neutral-400 focus-within:bg-white">
              <Search size={14} className="shrink-0 text-neutral-400" />
              <input
                type="text"
                placeholder="Search blocks…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-transparent text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Block grid */}
          <div className="flex-1 overflow-y-auto px-4 pb-6">
            {grouped.size === 0 ? (
              <p className="py-8 text-center text-sm text-neutral-400">
                No blocks match &ldquo;{query}&rdquo;
              </p>
            ) : (
              Array.from(grouped.entries()).map(([category, defs]) => (
                <div key={category} className="mb-4">
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                    {CATEGORY_LABELS[category]}
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {defs.map((def) => (
                      <CompactBlockButton
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
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
