// src/lib/visual-editor/helpers.ts
import type { Section, EditorBlock, ContentZone } from "./types"

/** Find a block by ID across all sections and zones */
export function findBlock(sections: Section[], blockId: string): { section: Section; zone: ContentZone; block: EditorBlock } | null {
  for (const section of sections) {
    for (const zone of section.contentZones) {
      const block = zone.blocks.find(b => b.id === blockId)
      if (block) return { section, zone, block }
    }
  }
  return null
}

/** Find a section by ID */
export function findSection(sections: Section[], sectionId: string): Section | null {
  return sections.find(s => s.id === sectionId) ?? null
}

/** Deep clone sections (for undo/redo snapshots) */
export function cloneSections(sections: Section[]): Section[] {
  return JSON.parse(JSON.stringify(sections))
}

/** Update a block's props immutably */
export function updateBlockInSections(
  sections: Section[],
  sectionId: string,
  blockId: string,
  updater: (block: EditorBlock) => EditorBlock
): Section[] {
  return sections.map(section => {
    if (section.id !== sectionId) return section
    return {
      ...section,
      contentZones: section.contentZones.map(zone => ({
        ...zone,
        blocks: zone.blocks.map(block =>
          block.id === blockId ? updater(block) : block
        ),
      })),
    }
  })
}

/** Update a section immutably */
export function updateSectionInSections(
  sections: Section[],
  sectionId: string,
  changes: Partial<Section>
): Section[] {
  return sections.map(s => s.id === sectionId ? { ...s, ...changes } : s)
}

/** Insert a section at a specific index */
export function insertSectionAt(sections: Section[], section: Section, index: number): Section[] {
  const result = [...sections]
  result.splice(index, 0, section)
  return result
}

/** Remove a section by ID */
export function removeSectionById(sections: Section[], sectionId: string): Section[] {
  return sections.filter(s => s.id !== sectionId)
}

/** Remove a block by ID from any section/zone */
export function removeBlockById(sections: Section[], blockId: string): Section[] {
  return sections.map(section => ({
    ...section,
    contentZones: section.contentZones.map(zone => ({
      ...zone,
      blocks: zone.blocks.filter(b => b.id !== blockId),
    })),
  }))
}

/** Insert a block into a specific zone */
export function insertBlockInZone(
  sections: Section[],
  sectionId: string,
  zoneId: string,
  block: EditorBlock
): Section[] {
  return sections.map(section => {
    if (section.id !== sectionId) return section
    return {
      ...section,
      contentZones: section.contentZones.map(zone => {
        if (zone.id !== zoneId) return zone
        return { ...zone, blocks: [...zone.blocks, block] }
      }),
    }
  })
}

/** Reorder sections by moving from one index to another */
export function reorderSections(sections: Section[], fromIndex: number, toIndex: number): Section[] {
  const result = [...sections]
  const [moved] = result.splice(fromIndex, 1)
  result.splice(toIndex, 0, moved)
  return result
}
