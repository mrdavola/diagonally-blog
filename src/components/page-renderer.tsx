"use client"

import type { Section } from "@/lib/visual-editor/types"
import type { Block } from "@/lib/blocks/types"
import { SectionRenderer } from "@/components/visual-editor/renderers/section-renderer"
import BlockRenderer from "@/components/blocks/block-renderer"

interface PageRendererProps {
  publishedSections?: Section[] | null
  publishedBlocks?: Block[] | null
}

/**
 * Dual-format public page renderer.
 *
 * Pages published through the new visual editor have `publishedSections`.
 * Legacy pages have `publishedBlocks`. This component handles both, preferring
 * the new format when both are present.
 */
export default function PageRenderer({ publishedSections, publishedBlocks }: PageRendererProps) {
  // New format takes priority
  if (publishedSections && publishedSections.length > 0) {
    return (
      <>
        {publishedSections.map((section) => (
          <SectionRenderer key={section.id} section={section} />
        ))}
      </>
    )
  }

  // Legacy format
  if (publishedBlocks && publishedBlocks.length > 0) {
    return <BlockRenderer blocks={publishedBlocks} />
  }

  // Empty / not found
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <p className="text-text-dark/50">Page not found</p>
    </div>
  )
}
