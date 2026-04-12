// src/lib/visual-editor/migration.ts
import type { Block } from "../blocks/types"
import type { Section, BlockType } from "./types"
import { createBlock, createSection } from "./defaults"

// ─── Type Name Mapping ────────────────────────────────────────────────────────

const BLOCK_TYPE_MAP: Record<string, BlockType> = {
  // Text / content
  "rich-text":       "text",
  "paragraph":       "text",
  "heading":         "text",
  // Images
  "single-image":    "image",
  // Media
  "video-embed":     "video-embed",
  // Layout
  "faq-accordion":   "accordion",
  "spacer":          "spacer",
  "divider":         "divider",
  "wave-divider":    "divider",
  // Data
  "stats-row":       "stats-row",
  "pricing-cards":   "pricing-card",
  "comparison-table":"comparison-table",
  // CTA / actions
  "cta-banner":      "cta-banner",
  // Embed
  "embed":           "embed",
  // Hero → treat as a full-width text+button combo; keep as "text" fallback
  "hero":            "text",
  // Testimonials → no direct equivalent; keep as "text"
  "testimonials":    "text",
  // Team cards → no direct equivalent; keep as "text"
  "team-cards":      "text",
}

function mapBlockType(oldType: string): BlockType {
  return BLOCK_TYPE_MAP[oldType] ?? "text"
}

// ─── Migration ────────────────────────────────────────────────────────────────

/**
 * Convert a flat Block[] (old format) into a Section[] (new format).
 * Each old block becomes its own single-block section.
 */
export function migrateBlocksToSections(blocks: Block[]): Section[] {
  return blocks.map((block) => {
    const newType = mapBlockType(block.type)
    const newBlock = createBlock(newType, block.props)
    // Preserve the original block id so any references survive migration
    newBlock.id = block.id
    const section = createSection(`Migrated – ${block.type}`, [newBlock])
    return section
  })
}
