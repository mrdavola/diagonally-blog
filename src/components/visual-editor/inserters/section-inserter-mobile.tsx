"use client"

import { useState } from "react"
import { Drawer } from "vaul"
import { X, Search } from "lucide-react"
import { useEditorStore } from "@/lib/visual-editor/editor-store"
import {
  templatesByCategory,
  CATEGORY_META,
  CATEGORY_ORDER,
} from "@/lib/visual-editor/section-templates"
import { generateId, createSection } from "@/lib/visual-editor/defaults"
import type { SectionTemplate, SectionCategory, Section, ContentZone, EditorBlock } from "@/lib/visual-editor/types"

// ─── Props ────────────────────────────────────────────────────────────────────

interface SectionInserterMobileProps {
  insertAtIndex: number
  open: boolean
  onClose: () => void
}

// ─── Deep-clone helpers ───────────────────────────────────────────────────────

function cloneBlock(block: EditorBlock): EditorBlock {
  return { ...block, id: generateId(), props: { ...block.props }, style: { ...block.style }, responsive: { ...block.responsive } }
}

function cloneZone(zone: ContentZone): ContentZone {
  return { id: generateId(), gridColumns: zone.gridColumns, blocks: zone.blocks.map(cloneBlock) }
}

function cloneSection(section: Section): Section {
  return {
    ...section,
    id: generateId(),
    layout: { ...section.layout },
    background: { ...section.background },
    spacing: { ...section.spacing },
    divider: { ...section.divider },
    animation: { ...section.animation },
    contentZones: section.contentZones.map(cloneZone),
    responsive: { ...section.responsive },
  }
}

// ─── Mini template card (compact for mobile) ──────────────────────────────────

function MiniTemplateCard({
  template,
  onInsert,
}: {
  template: SectionTemplate
  onInsert: (t: SectionTemplate) => void
}) {
  return (
    <button
      onClick={() => onInsert(template)}
      className="flex-shrink-0 w-32 flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white text-left transition-all hover:border-neutral-400 active:bg-neutral-50"
    >
      {/* Preview sketch */}
      <div className="h-24 w-full border-b border-neutral-100 bg-neutral-50 p-2 flex items-center justify-center">
        <div className="w-full space-y-1">
          <div className="h-1.5 w-3/4 rounded-sm bg-neutral-300 mx-auto" />
          <div className="h-1 w-full rounded-sm bg-neutral-200" />
          <div className="h-1 w-5/6 rounded-sm bg-neutral-200 mx-auto" />
        </div>
      </div>
      {/* Label */}
      <div className="px-2 py-1.5">
        <p className="text-[11px] font-semibold text-neutral-800 truncate">{template.name}</p>
      </div>
    </button>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export function SectionInserterMobile({ insertAtIndex, open, onClose }: SectionInserterMobileProps) {
  const addSection = useEditorStore((s) => s.addSection)
  const [query, setQuery] = useState("")

  const trimmed = query.trim().toLowerCase()

  // Filter all templates by search query
  const allTemplatesFlat = CATEGORY_ORDER.flatMap((cat) => templatesByCategory[cat])
  const filteredAll = trimmed
    ? allTemplatesFlat.filter(
        (t) =>
          t.name.toLowerCase().includes(trimmed) ||
          t.description?.toLowerCase().includes(trimmed) ||
          t.category.toLowerCase().includes(trimmed)
      )
    : null

  function handleInsertBlank() {
    const blank = createSection("New Section")
    addSection(blank, insertAtIndex)
    onClose()
  }

  function handleInsertTemplate(template: SectionTemplate) {
    const copy = cloneSection(template.section)
    addSection(copy, insertAtIndex)
    onClose()
  }

  return (
    <Drawer.Root
      open={open}
      onOpenChange={(isOpen) => { if (!isOpen) onClose() }}
      snapPoints={[0.85]}
      fadeFromIndex={0}
    >
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-40 bg-black/30" />
        <Drawer.Content
          className="fixed bottom-0 left-0 right-0 z-50 flex flex-col rounded-t-2xl bg-white shadow-2xl outline-none"
          style={{ maxHeight: "90vh" }}
        >
          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-1 shrink-0">
            <div className="h-1 w-10 rounded-full bg-gray-200" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 shrink-0">
            <span className="text-base font-semibold text-neutral-900">Add Section</span>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>

          {/* Search */}
          <div className="px-4 pb-3 shrink-0">
            <div className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 focus-within:border-neutral-400 focus-within:bg-white">
              <Search size={14} className="shrink-0 text-neutral-400" />
              <input
                type="text"
                placeholder="Search templates…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-transparent text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto pb-6">
            {/* Add blank button */}
            <div className="px-4 mb-4">
              <button
                onClick={handleInsertBlank}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-neutral-300 py-3 text-sm font-semibold text-neutral-500 transition-colors hover:border-neutral-400 hover:bg-neutral-50 hover:text-neutral-700"
              >
                + Add Blank Section
              </button>
            </div>

            {/* Search results */}
            {filteredAll !== null ? (
              <div className="px-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-400">
                  Results
                </p>
                {filteredAll.length === 0 ? (
                  <p className="py-8 text-center text-sm text-neutral-400">
                    No templates match &ldquo;{query}&rdquo;
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-3">
                    {filteredAll.map((t) => (
                      <MiniTemplateCard key={t.id} template={t} onInsert={handleInsertTemplate} />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* Category rows */
              CATEGORY_ORDER.map((cat) => {
                const templates = templatesByCategory[cat as SectionCategory]
                if (templates.length === 0) return null
                return (
                  <div key={cat} className="mb-5">
                    <p className="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                      {CATEGORY_META[cat as SectionCategory].label}
                    </p>
                    <div className="flex gap-3 overflow-x-auto px-4 pb-1">
                      {templates.map((t) => (
                        <MiniTemplateCard key={t.id} template={t} onInsert={handleInsertTemplate} />
                      ))}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
