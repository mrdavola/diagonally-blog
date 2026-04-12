// src/lib/visual-editor/editor-store.ts
"use client"

import { create } from "zustand"
import type {
  Section, EditorBlock, BlockStyle, BlockPosition,
  EditorMode, Viewport, SaveStatus, PanelType, PropertyTab,
} from "./types"
import {
  cloneSections, updateBlockInSections, updateSectionInSections,
  insertSectionAt, removeSectionById, removeBlockById,
  insertBlockInZone, reorderSections,
  cloneBlockWithNewId, deepCloneWithNewIds, insertBlockAfterInZone,
  findBlock,
} from "./helpers"

const MAX_UNDO = 50

interface EditorState {
  // Page data
  slug: string
  pageTitle: string
  sections: Section[]

  // Selection
  selectedSectionId: string | null
  selectedBlockId: string | null

  // UI state
  mode: EditorMode
  viewport: Viewport
  activePanel: PanelType
  activeTab: PropertyTab
  saveStatus: SaveStatus

  // History
  undoStack: Section[][]
  redoStack: Section[][]

  // Clipboard
  clipboard: { type: "block"; data: EditorBlock } | { type: "section"; data: Section } | null

  // Multi-select
  selectedBlockIds: string[]
  multiSelectMode: boolean
}

interface EditorActions {
  // Initialization
  init(slug: string, title: string, sections: Section[]): void

  // Mode
  setMode(mode: EditorMode): void
  setViewport(viewport: Viewport): void
  setActivePanel(panel: PanelType): void
  setActiveTab(tab: PropertyTab): void
  setSaveStatus(status: SaveStatus): void

  // Selection
  selectSection(id: string): void
  selectBlock(sectionId: string, blockId: string): void
  deselect(): void

  // Section mutations (all push to undo stack)
  addSection(section: Section, atIndex: number): void
  updateSection(sectionId: string, changes: Partial<Section>): void
  deleteSection(sectionId: string): void
  reorderSections(fromIndex: number, toIndex: number): void

  // Block mutations (all push to undo stack)
  addBlock(sectionId: string, zoneId: string, block: EditorBlock): void
  updateBlockProps(sectionId: string, blockId: string, props: Record<string, unknown>): void
  updateBlockStyle(sectionId: string, blockId: string, style: Partial<BlockStyle>): void
  updateBlockPosition(sectionId: string, blockId: string, position: Partial<BlockPosition>): void
  deleteBlock(blockId: string): void

  // History
  undo(): void
  redo(): void

  // Batch update (for syncing from canvas without pushing individual undo entries)
  setSections(sections: Section[]): void

  // Clipboard
  copySelected(): void
  pasteClipboard(): void
  duplicateSelected(): void

  // Multi-select
  toggleBlockSelection(sectionId: string, blockId: string): void
  clearMultiSelect(): void
  deleteMultiSelected(): void
}

function pushUndo(state: EditorState): Pick<EditorState, "undoStack" | "redoStack"> {
  const snapshot = cloneSections(state.sections)
  const undoStack = [...state.undoStack, snapshot].slice(-MAX_UNDO)
  return { undoStack, redoStack: [] }
}

export const useEditorStore = create<EditorState & EditorActions>((set, get) => ({
  // Initial state
  slug: "",
  pageTitle: "",
  sections: [],
  selectedSectionId: null,
  selectedBlockId: null,
  mode: "management",
  viewport: "desktop",
  activePanel: null,
  activeTab: "content",
  saveStatus: "saved",
  undoStack: [],
  redoStack: [],
  clipboard: null,
  selectedBlockIds: [],
  multiSelectMode: false,

  // Initialization
  init(slug, title, sections) {
    set({ slug, pageTitle: title, sections, undoStack: [], redoStack: [], saveStatus: "saved", selectedSectionId: null, selectedBlockId: null })
  },

  // Mode
  setMode(mode) { set({ mode }) },
  setViewport(viewport) { set({ viewport }) },
  setActivePanel(panel) { set({ activePanel: panel }) },
  setActiveTab(tab) { set({ activeTab: tab }) },
  setSaveStatus(status) { set({ saveStatus: status }) },

  // Selection
  selectSection(id) { set({ selectedSectionId: id, selectedBlockId: null, activePanel: "properties", activeTab: "content" }) },
  selectBlock(sectionId, blockId) { set({ selectedSectionId: sectionId, selectedBlockId: blockId, activePanel: "properties", activeTab: "content" }) },
  deselect() { set({ selectedSectionId: null, selectedBlockId: null, activePanel: null }) },

  // Section mutations
  addSection(section, atIndex) {
    const state = get()
    set({ ...pushUndo(state), sections: insertSectionAt(state.sections, section, atIndex), saveStatus: "unsaved" })
  },
  updateSection(sectionId, changes) {
    const state = get()
    set({ ...pushUndo(state), sections: updateSectionInSections(state.sections, sectionId, changes), saveStatus: "unsaved" })
  },
  deleteSection(sectionId) {
    const state = get()
    const newSections = removeSectionById(state.sections, sectionId)
    const deselect = state.selectedSectionId === sectionId ? { selectedSectionId: null, selectedBlockId: null, activePanel: null as PanelType } : {}
    set({ ...pushUndo(state), sections: newSections, saveStatus: "unsaved", ...deselect })
  },
  reorderSections(fromIndex, toIndex) {
    const state = get()
    set({ ...pushUndo(state), sections: reorderSections(state.sections, fromIndex, toIndex), saveStatus: "unsaved" })
  },

  // Block mutations
  addBlock(sectionId, zoneId, block) {
    const state = get()
    set({
      ...pushUndo(state),
      sections: insertBlockInZone(state.sections, sectionId, zoneId, block),
      selectedSectionId: sectionId,
      selectedBlockId: block.id,
      activePanel: "properties",
      activeTab: "content",
      saveStatus: "unsaved",
    })
  },
  updateBlockProps(sectionId, blockId, props) {
    const state = get()
    set({
      ...pushUndo(state),
      sections: updateBlockInSections(state.sections, sectionId, blockId, b => ({ ...b, props: { ...b.props, ...props } })),
      saveStatus: "unsaved",
    })
  },
  updateBlockStyle(sectionId, blockId, style) {
    const state = get()
    set({
      ...pushUndo(state),
      sections: updateBlockInSections(state.sections, sectionId, blockId, b => ({ ...b, style: { ...b.style, ...style } })),
      saveStatus: "unsaved",
    })
  },
  updateBlockPosition(sectionId, blockId, position) {
    const state = get()
    set({
      ...pushUndo(state),
      sections: updateBlockInSections(state.sections, sectionId, blockId, b => ({ ...b, position: { ...b.position, ...position } })),
      saveStatus: "unsaved",
    })
  },
  deleteBlock(blockId) {
    const state = get()
    const deselect = state.selectedBlockId === blockId ? { selectedBlockId: null, activePanel: null as PanelType } : {}
    set({ ...pushUndo(state), sections: removeBlockById(state.sections, blockId), saveStatus: "unsaved", ...deselect })
  },

  // History
  undo() {
    const state = get()
    if (state.undoStack.length === 0) return
    const undoStack = [...state.undoStack]
    const previous = undoStack.pop()!
    const redoStack = [...state.redoStack, cloneSections(state.sections)]
    set({ sections: previous, undoStack, redoStack, saveStatus: "unsaved" })
  },
  redo() {
    const state = get()
    if (state.redoStack.length === 0) return
    const redoStack = [...state.redoStack]
    const next = redoStack.pop()!
    const undoStack = [...state.undoStack, cloneSections(state.sections)]
    set({ sections: next, undoStack, redoStack, saveStatus: "unsaved" })
  },

  // Batch
  setSections(sections) { set({ sections }) },

  // Clipboard
  copySelected() {
    const state = get()
    if (state.selectedBlockId) {
      const found = findBlock(state.sections, state.selectedBlockId)
      if (found) {
        set({ clipboard: { type: "block", data: cloneBlockWithNewId(found.block) } })
      }
    } else if (state.selectedSectionId) {
      const section = state.sections.find(s => s.id === state.selectedSectionId)
      if (section) {
        set({ clipboard: { type: "section", data: deepCloneWithNewIds(section) } })
      }
    }
  },

  pasteClipboard() {
    const state = get()
    const { clipboard } = state
    if (!clipboard) return

    if (clipboard.type === "block") {
      const targetSectionId = state.selectedSectionId
      if (!targetSectionId) return
      const section = state.sections.find(s => s.id === targetSectionId)
      if (!section) return
      const zoneId = section.contentZones[0]?.id
      if (!zoneId) return
      const newBlock = cloneBlockWithNewId(clipboard.data)
      set({
        ...pushUndo(state),
        sections: insertBlockInZone(state.sections, targetSectionId, zoneId, newBlock),
        selectedSectionId: targetSectionId,
        selectedBlockId: newBlock.id,
        activePanel: "properties",
        activeTab: "content",
        saveStatus: "unsaved",
      })
    } else {
      const newSection = deepCloneWithNewIds(clipboard.data)
      const targetIdx = state.selectedSectionId
        ? state.sections.findIndex(s => s.id === state.selectedSectionId)
        : -1
      const insertAt = targetIdx === -1 ? state.sections.length : targetIdx + 1
      set({
        ...pushUndo(state),
        sections: insertSectionAt(state.sections, newSection, insertAt),
        selectedSectionId: newSection.id,
        selectedBlockId: null,
        activePanel: "properties",
        activeTab: "content",
        saveStatus: "unsaved",
      })
    }
  },

  duplicateSelected() {
    const state = get()
    // Multi-select duplicate: duplicate all selected blocks after their originals
    if (state.multiSelectMode && state.selectedBlockIds.length > 1) {
      let sections = state.sections
      const newIds: string[] = []
      for (const blockId of state.selectedBlockIds) {
        const found = findBlock(sections, blockId)
        if (!found) continue
        const newBlock = cloneBlockWithNewId(found.block)
        newIds.push(newBlock.id)
        sections = insertBlockAfterInZone(sections, found.section.id, found.zone.id, found.block.id, newBlock)
      }
      set({
        ...pushUndo(state),
        sections,
        selectedBlockIds: newIds,
        saveStatus: "unsaved",
      })
      return
    }
    if (state.selectedBlockId) {
      const found = findBlock(state.sections, state.selectedBlockId)
      if (!found) return
      const newBlock = cloneBlockWithNewId(found.block)
      set({
        ...pushUndo(state),
        sections: insertBlockAfterInZone(
          state.sections,
          found.section.id,
          found.zone.id,
          found.block.id,
          newBlock
        ),
        selectedBlockId: newBlock.id,
        saveStatus: "unsaved",
      })
    } else if (state.selectedSectionId) {
      const idx = state.sections.findIndex(s => s.id === state.selectedSectionId)
      if (idx === -1) return
      const newSection = deepCloneWithNewIds(state.sections[idx])
      set({
        ...pushUndo(state),
        sections: insertSectionAt(state.sections, newSection, idx + 1),
        selectedSectionId: newSection.id,
        selectedBlockId: null,
        activePanel: "properties",
        activeTab: "content",
        saveStatus: "unsaved",
      })
    }
  },

  // Multi-select
  toggleBlockSelection(sectionId, blockId) {
    const state = get()
    // Enforce same-section restriction
    const allInSameSection = state.selectedBlockIds.length === 0 ||
      state.sections.find(s => s.id === sectionId)?.contentZones.some(
        z => z.blocks.some(b => state.selectedBlockIds.includes(b.id))
      )
    if (!allInSameSection) return

    const ids = state.selectedBlockIds.includes(blockId)
      ? state.selectedBlockIds.filter(id => id !== blockId)
      : [...state.selectedBlockIds, blockId]

    set({
      selectedBlockIds: ids,
      multiSelectMode: ids.length > 1,
      selectedSectionId: sectionId,
      selectedBlockId: ids.length === 1 ? ids[0] : (ids.length === 0 ? null : state.selectedBlockId),
    })
  },

  clearMultiSelect() {
    set({ selectedBlockIds: [], multiSelectMode: false })
  },

  deleteMultiSelected() {
    const state = get()
    if (state.selectedBlockIds.length === 0) return
    let sections = state.sections
    for (const blockId of state.selectedBlockIds) {
      sections = removeBlockById(sections, blockId)
    }
    set({
      ...pushUndo(state),
      sections,
      selectedBlockIds: [],
      selectedBlockId: null,
      multiSelectMode: false,
      activePanel: null,
      saveStatus: "unsaved",
    })
  },
}))
