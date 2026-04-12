"use client"

import { Drawer } from "vaul"
import { X } from "lucide-react"
import { useEditorStore } from "@/lib/visual-editor/editor-store"
import type { BlockStyle, BlockPosition, PropertyTab } from "@/lib/visual-editor/types"
import { ContentTab } from "./content-tab"
import { StyleTab } from "./style-tab"
import { AdvancedTab } from "./advanced-tab"

// ─── Constants ────────────────────────────────────────────────────────────────

const BLOCK_TYPE_LABELS: Record<string, string> = {
  text: "Text",
  image: "Image",
  button: "Button",
  video: "Video",
  "video-embed": "Video Embed",
  icon: "Icon",
  columns: "Columns",
  card: "Card",
  accordion: "Accordion",
  tabs: "Tabs",
  divider: "Divider",
  spacer: "Spacer",
  gallery: "Gallery",
  "image-carousel": "Image Carousel",
  audio: "Audio",
  "stats-row": "Stats Row",
  "pricing-card": "Pricing Card",
  "comparison-table": "Comparison Table",
  chart: "Chart",
  form: "Form",
  "newsletter-signup": "Newsletter Signup",
  "cta-banner": "CTA Banner",
  "social-links": "Social Links",
  code: "Code",
  embed: "Embed",
  map: "Map",
  calendar: "Calendar",
}

const TABS: { id: PropertyTab; label: string }[] = [
  { id: "content", label: "Content" },
  { id: "style", label: "Style" },
  { id: "advanced", label: "Advanced" },
]

// Snap points: peek (30%), half (50%), full (85%)
const SNAP_POINTS = [0.3, 0.5, 0.85]

// ─── Props ────────────────────────────────────────────────────────────────────

interface PropertySheetProps {
  open: boolean
  onClose: () => void
}

// ─── Component ────────────────────────────────────────────────────────────────

export function PropertySheet({ open, onClose }: PropertySheetProps) {
  const selectedSectionId = useEditorStore((s) => s.selectedSectionId)
  const selectedBlockId = useEditorStore((s) => s.selectedBlockId)
  const sections = useEditorStore((s) => s.sections)
  const activeTab = useEditorStore((s) => s.activeTab)
  const setActiveTab = useEditorStore((s) => s.setActiveTab)
  const updateBlockProps = useEditorStore((s) => s.updateBlockProps)
  const updateBlockStyle = useEditorStore((s) => s.updateBlockStyle)
  const updateBlockPosition = useEditorStore((s) => s.updateBlockPosition)

  const section = sections.find((s) => s.id === selectedSectionId)
  const block = section?.contentZones
    .flatMap((z) => z.blocks)
    .find((b) => b.id === selectedBlockId)

  const typeLabel = block ? (BLOCK_TYPE_LABELS[block.type] ?? block.type) : ""

  function handleUpdateProps(props: Record<string, unknown>) {
    if (!selectedSectionId || !block) return
    updateBlockProps(selectedSectionId, block.id, props)
  }

  function handleUpdateStyle(style: Partial<BlockStyle>) {
    if (!selectedSectionId || !block) return
    updateBlockStyle(selectedSectionId, block.id, style)
  }

  function handleUpdatePosition(pos: Partial<BlockPosition>) {
    if (!selectedSectionId || !block) return
    updateBlockPosition(selectedSectionId, block.id, pos)
  }

  return (
    <Drawer.Root
      open={open}
      onOpenChange={(isOpen) => { if (!isOpen) onClose() }}
      snapPoints={SNAP_POINTS}
      fadeFromIndex={2}
      modal={false}
    >
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-40 bg-black/20" />
        <Drawer.Content
          className="fixed bottom-0 left-0 right-0 z-50 flex flex-col rounded-t-2xl bg-white shadow-2xl outline-none"
          style={{ maxHeight: "90vh" }}
        >
          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-1 shrink-0">
            <div className="h-1 w-10 rounded-full bg-gray-200" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 shrink-0">
            <span className="text-sm font-semibold text-gray-900">{typeLabel}</span>
            <button
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
              aria-label="Close panel"
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
          {block && selectedSectionId && (
            <div className="flex-1 overflow-y-auto p-4">
              {activeTab === "content" && (
                <ContentTab
                  block={block}
                  sectionId={selectedSectionId}
                  onUpdateProps={handleUpdateProps}
                />
              )}
              {activeTab === "style" && (
                <StyleTab
                  block={block}
                  sectionId={selectedSectionId}
                  onUpdateStyle={handleUpdateStyle}
                  onUpdatePosition={handleUpdatePosition}
                />
              )}
              {activeTab === "advanced" && (
                <AdvancedTab
                  block={block}
                  sectionId={selectedSectionId}
                  onUpdateProps={handleUpdateProps}
                />
              )}
            </div>
          )}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
