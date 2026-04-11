"use client"

import { BLOCK_REGISTRY } from "@/lib/blocks/registry"
import type { BlockDefinition } from "@/lib/blocks/registry"
import * as Icons from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { X } from "lucide-react"

interface BlockPickerProps {
  open: boolean
  onClose: () => void
  onSelect: (type: string) => void
}

const CATEGORIES: { key: BlockDefinition["category"]; label: string }[] = [
  { key: "layout", label: "Layout" },
  { key: "content", label: "Content" },
  { key: "media", label: "Media" },
  { key: "utility", label: "Utility" },
]

export function BlockPicker({ open, onClose, onSelect }: BlockPickerProps) {
  if (!open) return null

  const allDefinitions = Array.from(BLOCK_REGISTRY.values())

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-space-mid rounded-2xl border border-white/10 shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <h2 className="text-white font-display text-lg">Add Block</h2>
          <button
            onClick={onClose}
            className="text-text-light/40 hover:text-white transition rounded-lg p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-5 space-y-6">
          {CATEGORIES.map((cat) => {
            const blocks = allDefinitions.filter((d) => d.category === cat.key)
            if (blocks.length === 0) return null
            return (
              <div key={cat.key}>
                <p className="text-xs font-semibold uppercase tracking-wider text-text-light/40 mb-3">
                  {cat.label}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {blocks.map((def) => {
                    const IconComponent =
                      (Icons[def.icon as keyof typeof Icons] as LucideIcon) ?? Icons.Box
                    return (
                      <button
                        key={def.type}
                        onClick={() => {
                          onSelect(def.type)
                          onClose()
                        }}
                        className="flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-space-deep/40 hover:bg-blue-600/20 hover:border-blue-500/40 text-left transition group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-white/5 group-hover:bg-blue-600/30 flex items-center justify-center flex-shrink-0 transition">
                          <IconComponent className="w-4 h-4 text-text-light/60 group-hover:text-blue-300 transition" />
                        </div>
                        <span className="text-sm text-white/80 group-hover:text-white transition">
                          {def.label}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
