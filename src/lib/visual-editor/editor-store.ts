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
}))
