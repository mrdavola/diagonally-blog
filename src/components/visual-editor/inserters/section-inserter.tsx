"use client"

import { useState, useRef, useEffect } from "react"
import { X } from "lucide-react"
import { useEditorStore } from "@/lib/visual-editor/editor-store"
import {
  allTemplates,
  templatesByCategory,
  CATEGORY_META,
  CATEGORY_ORDER,
} from "@/lib/visual-editor/section-templates"
import { generateId, createContentZone, createSection } from "@/lib/visual-editor/defaults"
import type { SectionTemplate, SectionCategory, Section, ContentZone, EditorBlock } from "@/lib/visual-editor/types"

// ─── Props ────────────────────────────────────────────────────────────────────

interface SectionInserterProps {
  insertAtIndex: number
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

// ─── Preview sketches ─────────────────────────────────────────────────────────

/** Returns a tiny CSS-only schematic of the template layout */
function TemplatePreview({ template }: { template: SectionTemplate }) {
  const id = template.id

  // Hero Split: two columns, left has text lines + button, right has image box
  if (id === "hero-split") {
    return (
      <div className="flex gap-2 h-full">
        <div className="flex flex-1 flex-col gap-1.5 justify-center">
          <div className="h-2 w-3/4 rounded-sm bg-neutral-300" />
          <div className="h-1.5 w-full rounded-sm bg-neutral-200" />
          <div className="h-1.5 w-5/6 rounded-sm bg-neutral-200" />
          <div className="mt-1.5 h-4 w-1/3 rounded bg-neutral-400" />
        </div>
        <div className="flex-1 rounded bg-neutral-200" />
      </div>
    )
  }

  // Hero Centered: centered text lines + button
  if (id === "hero-centered") {
    return (
      <div className="flex flex-col items-center gap-1.5 justify-center h-full">
        <div className="h-2 w-2/3 rounded-sm bg-neutral-300" />
        <div className="h-1.5 w-3/4 rounded-sm bg-neutral-200" />
        <div className="h-1.5 w-1/2 rounded-sm bg-neutral-200" />
        <div className="mt-1.5 h-4 w-1/4 rounded bg-neutral-400" />
      </div>
    )
  }

  // About: image left + text right
  if (id === "about") {
    return (
      <div className="flex gap-2 h-full">
        <div className="flex-1 rounded bg-neutral-200" />
        <div className="flex flex-1 flex-col gap-1.5 justify-center">
          <div className="h-2 w-2/3 rounded-sm bg-neutral-300" />
          <div className="h-1.5 w-full rounded-sm bg-neutral-200" />
          <div className="h-1.5 w-5/6 rounded-sm bg-neutral-200" />
          <div className="h-1.5 w-4/6 rounded-sm bg-neutral-200" />
        </div>
      </div>
    )
  }

  // Team Grid / Event Cards / Feature Grid: heading + 3 cards
  if (id === "team-grid" || id === "event-cards" || id === "feature-grid") {
    return (
      <div className="flex flex-col gap-2 h-full">
        <div className="flex flex-col items-center gap-1">
          <div className="h-2 w-1/2 rounded-sm bg-neutral-300" />
          <div className="h-1.5 w-2/3 rounded-sm bg-neutral-200" />
        </div>
        <div className="flex gap-1.5 flex-1">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex flex-1 flex-col gap-1 rounded bg-neutral-100 p-1.5">
              <div className="aspect-square w-5 rounded-full bg-neutral-300 mx-auto" />
              <div className="h-1.5 w-3/4 rounded-sm bg-neutral-300 mx-auto" />
              <div className="h-1 w-full rounded-sm bg-neutral-200" />
              <div className="h-1 w-4/5 rounded-sm bg-neutral-200" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  // FAQ: heading + accordion rows
  if (id === "faq-intro" || id === "faq-accordion") {
    return (
      <div className="flex flex-col gap-2 h-full">
        <div className="h-2 w-1/2 rounded-sm bg-neutral-300 mx-auto" />
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex items-center justify-between rounded border border-neutral-200 px-2 py-1.5">
            <div className="h-1.5 w-3/4 rounded-sm bg-neutral-200" />
            <div className="h-3 w-3 rounded-sm bg-neutral-200 shrink-0" />
          </div>
        ))}
      </div>
    )
  }

  // How It Works: heading + 3 numbered steps
  if (id === "how-it-works") {
    return (
      <div className="flex flex-col gap-2 h-full">
        <div className="flex flex-col items-center gap-1">
          <div className="h-2 w-1/2 rounded-sm bg-neutral-300" />
        </div>
        <div className="flex gap-2 flex-1 items-center">
          {["01", "02", "03"].map((n) => (
            <div key={n} className="flex flex-1 flex-col items-center gap-1">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-300 text-[9px] font-bold text-neutral-600">{n}</div>
              <div className="h-1.5 w-full rounded-sm bg-neutral-200" />
              <div className="h-1 w-4/5 rounded-sm bg-neutral-200" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Testimonials: heading + 2 quote cards
  if (id === "testimonials") {
    return (
      <div className="flex flex-col gap-2 h-full">
        <div className="h-2 w-1/2 rounded-sm bg-neutral-300 mx-auto" />
        <div className="flex gap-2 flex-1">
          {[0, 1].map((i) => (
            <div key={i} className="flex flex-1 flex-col gap-1 rounded bg-neutral-100 p-2">
              <div className="h-1 w-full rounded-sm bg-neutral-200" />
              <div className="h-1 w-5/6 rounded-sm bg-neutral-200" />
              <div className="h-1 w-4/6 rounded-sm bg-neutral-200" />
              <div className="mt-auto h-1.5 w-1/2 rounded-sm bg-neutral-300" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Stats Bar: 4 stat boxes
  if (id === "stats-bar") {
    return (
      <div className="flex gap-1.5 h-full items-center">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-1 rounded bg-neutral-100 py-2">
            <div className="h-3 w-3/4 rounded-sm bg-neutral-300" />
            <div className="h-1.5 w-1/2 rounded-sm bg-neutral-200" />
          </div>
        ))}
      </div>
    )
  }

  // Logo Wall: heading + logo row
  if (id === "logo-wall") {
    return (
      <div className="flex flex-col gap-2 h-full items-center justify-center">
        <div className="h-2 w-1/3 rounded-sm bg-neutral-300" />
        <div className="flex gap-2 w-full justify-center">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-6 w-10 rounded bg-neutral-200" />
          ))}
        </div>
      </div>
    )
  }

  // CTA Banner: centered headline + button
  if (id === "cta-banner") {
    return (
      <div className="flex flex-col items-center gap-2 justify-center h-full rounded bg-neutral-100 p-2">
        <div className="h-2.5 w-2/3 rounded-sm bg-neutral-300" />
        <div className="h-1.5 w-3/4 rounded-sm bg-neutral-200" />
        <div className="mt-1 h-5 w-1/4 rounded-md bg-neutral-400" />
      </div>
    )
  }

  // Newsletter: heading + email input + button
  if (id === "newsletter") {
    return (
      <div className="flex flex-col items-center gap-2 justify-center h-full">
        <div className="h-2 w-1/2 rounded-sm bg-neutral-300" />
        <div className="h-1.5 w-2/3 rounded-sm bg-neutral-200" />
        <div className="flex gap-1.5 mt-1 w-full">
          <div className="flex-1 h-5 rounded border border-neutral-200 bg-white" />
          <div className="h-5 w-1/4 rounded bg-neutral-400" />
        </div>
      </div>
    )
  }

  // Contact Form: text left + form right
  if (id === "contact-form") {
    return (
      <div className="flex gap-2 h-full">
        <div className="flex flex-1 flex-col gap-1.5 justify-center">
          <div className="h-2 w-2/3 rounded-sm bg-neutral-300" />
          <div className="h-1.5 w-full rounded-sm bg-neutral-200" />
          <div className="h-1.5 w-5/6 rounded-sm bg-neutral-200" />
        </div>
        <div className="flex flex-1 flex-col gap-1.5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded border border-neutral-200 bg-white h-5" />
          ))}
          <div className="h-5 w-1/2 rounded bg-neutral-400" />
        </div>
      </div>
    )
  }

  // Video Showcase: heading + video placeholder
  if (id === "video-showcase") {
    return (
      <div className="flex flex-col gap-2 h-full">
        <div className="flex flex-col items-center gap-1">
          <div className="h-2 w-1/3 rounded-sm bg-neutral-300" />
        </div>
        <div className="flex flex-1 items-center justify-center rounded bg-neutral-200">
          <div className="h-8 w-8 rounded-full bg-neutral-400 flex items-center justify-center">
            <div className="ml-0.5 border-t-4 border-b-4 border-l-[8px] border-t-transparent border-b-transparent border-l-white" />
          </div>
        </div>
      </div>
    )
  }

  // Gallery Grid: heading + grid of image boxes
  if (id === "gallery-grid") {
    return (
      <div className="flex flex-col gap-1.5 h-full">
        <div className="h-2 w-1/3 rounded-sm bg-neutral-300 mx-auto" />
        <div className="grid grid-cols-3 gap-1 flex-1">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="rounded bg-neutral-200 aspect-square" />
          ))}
        </div>
      </div>
    )
  }

  // Image and Text: image left + text right
  if (id === "image-and-text") {
    return (
      <div className="flex gap-2 h-full">
        <div className="flex-1 rounded bg-neutral-200" />
        <div className="flex flex-1 flex-col gap-1.5 justify-center">
          <div className="h-2 w-3/4 rounded-sm bg-neutral-300" />
          <div className="h-1.5 w-full rounded-sm bg-neutral-200" />
          <div className="h-1.5 w-5/6 rounded-sm bg-neutral-200" />
          <div className="h-1.5 w-2/3 rounded-sm bg-neutral-200" />
        </div>
      </div>
    )
  }

  // Generic fallback: lines
  return (
    <div className="flex flex-col gap-1.5 justify-center h-full">
      <div className="h-2 w-1/2 rounded-sm bg-neutral-300" />
      <div className="h-1.5 w-full rounded-sm bg-neutral-200" />
      <div className="h-1.5 w-5/6 rounded-sm bg-neutral-200" />
      <div className="h-1.5 w-4/6 rounded-sm bg-neutral-200" />
    </div>
  )
}

// ─── Template Card ────────────────────────────────────────────────────────────

function TemplateCard({
  template,
  onInsert,
}: {
  template: SectionTemplate
  onInsert: (t: SectionTemplate) => void
}) {
  return (
    <button
      onClick={() => onInsert(template)}
      className="group flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white text-left transition-all hover:border-neutral-400 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
    >
      {/* Preview area */}
      <div className="relative h-28 w-full border-b border-neutral-100 bg-neutral-50 p-3">
        <TemplatePreview template={template} />
      </div>
      {/* Label */}
      <div className="px-3 py-2">
        <p className="text-[12px] font-semibold text-neutral-800 group-hover:text-neutral-900">
          {template.name}
        </p>
        <p className="mt-0.5 text-[11px] leading-tight text-neutral-400">
          {template.description}
        </p>
      </div>
    </button>
  )
}

// ─── Section Inserter ─────────────────────────────────────────────────────────

export function SectionInserter({ insertAtIndex, onClose }: SectionInserterProps) {
  const addSection = useEditorStore((s) => s.addSection)
  const [activeCategory, setActiveCategory] = useState<SectionCategory>("introduce")

  const rightPaneRef = useRef<HTMLDivElement>(null)

  const templates = templatesByCategory[activeCategory]

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

  function handleCategoryClick(cat: SectionCategory) {
    setActiveCategory(cat)
    rightPaneRef.current?.scrollTo({ top: 0 })
  }

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])

  return (
    <div className="flex h-full w-[520px] flex-col overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-black/8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-3.5">
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-neutral-400 transition-colors hover:text-neutral-700"
        >
          <X size={12} />
          Close
        </button>
        <span className="text-sm font-semibold text-neutral-900">Add a Section</span>
        <div className="w-16" aria-hidden />
      </div>

      {/* Body: nav + template grid */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: category nav */}
        <nav className="flex w-40 shrink-0 flex-col border-r border-neutral-100 py-3">
          {/* Add blank */}
          <button
            onClick={handleInsertBlank}
            className="mx-3 mb-3 flex items-center justify-center gap-1.5 rounded-lg border border-neutral-200 py-2 text-[12px] font-semibold text-neutral-600 transition-colors hover:border-neutral-400 hover:bg-neutral-50 hover:text-neutral-900"
          >
            + Add Blank
          </button>

          <p className="mb-1 px-4 text-[9px] font-semibold uppercase tracking-widest text-neutral-400">
            Categories
          </p>

          {CATEGORY_ORDER.map((cat) => {
            const isActive = cat === activeCategory
            return (
              <button
                key={cat}
                onClick={() => handleCategoryClick(cat)}
                className={[
                  "px-4 py-2 text-left text-[13px] transition-colors",
                  isActive
                    ? "bg-neutral-100 font-semibold text-neutral-900"
                    : "font-medium text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800",
                ].join(" ")}
              >
                {CATEGORY_META[cat].label}
              </button>
            )
          })}
        </nav>

        {/* Right: templates grid */}
        <div ref={rightPaneRef} className="flex-1 overflow-y-auto px-4 py-4">
          {/* Category heading */}
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-neutral-900">
              {CATEGORY_META[activeCategory].label}
            </h3>
            <p className="text-[12px] text-neutral-400">
              {CATEGORY_META[activeCategory].description}
            </p>
          </div>

          {/* 2-column grid */}
          {templates.length === 0 ? (
            <p className="py-12 text-center text-[13px] text-neutral-400">
              No templates in this category yet.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {templates.map((t) => (
                <TemplateCard key={t.id} template={t} onInsert={handleInsertTemplate} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
