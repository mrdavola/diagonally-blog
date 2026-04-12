# Visual Editor Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the form-based admin page editor with a Squarespace-class visual WYSIWYG editor using an iframe canvas architecture.

**Architecture:** Parent frame (editor shell with toolbars, panels, inserters) communicates via typed postMessage bridge with an iframe that renders the actual page with an injected editor runtime. Pages use a Section -> ContentZone -> Block hierarchy with a 12-column grid. Zustand manages editor state with undo/redo.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Zustand, @dnd-kit, TipTap, Firebase/Firestore, Tailwind CSS 4, vaul (bottom sheets), use-gesture (mobile touch)

**Design doc:** `docs/plans/2026-04-12-visual-editor-design.md`

**IMPORTANT:** Before writing any Next.js code, read the relevant guide in `node_modules/next/dist/docs/` — this project uses Next.js 16 which has breaking changes from earlier versions.

---

## Phase 1: Foundation

### Task 1.1: Install New Dependencies

**Files:**
- Modify: `package.json`

**Step 1: Install zustand, vaul, and use-gesture**

```bash
cd /Users/md/Diagonally/website
npm install zustand vaul @use-gesture/react
```

**Step 2: Verify installation**

```bash
node -e "require('zustand'); require('vaul'); require('@use-gesture/react'); console.log('OK')"
```

Expected: `OK`

**Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: install zustand, vaul, use-gesture for visual editor"
```

---

### Task 1.2: Define New Type System

**Files:**
- Create: `src/lib/visual-editor/types.ts`

**Step 1: Create the types file**

This defines the entire Section -> ContentZone -> Block hierarchy. The key types are:

```typescript
// src/lib/visual-editor/types.ts

// ─── Block Position (within a content zone's 12-col grid) ───
export interface BlockPosition {
  col: number       // start column (1-12)
  row: number       // row index
  colSpan: number   // columns wide (1-12)
  rowSpan: number   // rows tall (usually 1)
}

export interface SpacingValues {
  top: number
  right: number
  bottom: number
  left: number
}

export interface AnimationConfig {
  type: "none" | "fade-in" | "slide-up" | "scale-in"
  trigger: "on-load" | "on-scroll"
  delay: number
}

export interface BlockStyle {
  margin?: Partial<SpacingValues>
  padding?: Partial<SpacingValues>
  background?: string
  borderRadius?: number
  border?: { width: number; color: string; style: string }
  shadow?: "none" | "sm" | "md" | "lg"
  opacity?: number
  animation?: AnimationConfig
}

export interface BlockResponsiveOverrides {
  position?: Partial<BlockPosition>
  style?: Partial<BlockStyle>
  hidden?: boolean
}

// ─── Block ───
export type BlockType =
  // Essentials
  | "text" | "image" | "button" | "video" | "icon"
  // Layout
  | "columns" | "card" | "accordion" | "tabs" | "divider" | "spacer"
  // Media
  | "gallery" | "image-carousel" | "video-embed" | "audio"
  // Data
  | "stats-row" | "pricing-card" | "comparison-table" | "chart"
  // Forms & Actions
  | "form" | "newsletter-signup" | "cta-banner" | "social-links"
  // Embed
  | "code" | "embed" | "map" | "calendar"

export interface EditorBlock {
  id: string
  type: BlockType
  position: BlockPosition
  props: Record<string, unknown>
  style: BlockStyle
  responsive: {
    tablet?: BlockResponsiveOverrides
    mobile?: BlockResponsiveOverrides
  }
}

// ─── Content Zone ───
export interface ContentZone {
  id: string
  gridColumns: number  // usually 12
  blocks: EditorBlock[]
}

// ─── Section ───
export interface SectionLayout {
  columns: number              // 1-4
  columnRatio: string          // "equal", "1:2", "2:1", "1:1:1", etc.
  contentWidth: "contained" | "full"
  maxWidth: number             // px
  verticalAlign: "top" | "center" | "bottom"
  gap: number                  // px
}

export interface SectionBackground {
  type: "none" | "color" | "gradient" | "image" | "video"
  color?: string
  gradient?: { from: string; to: string; angle: number }
  image?: { url: string; focalPoint: { x: number; y: number }; opacity: number }
  video?: { url: string; posterUrl: string }
  overlay?: { color: string; opacity: number }
}

export interface SectionDivider {
  type: "none" | "line" | "wave" | "angle" | "curve"
  position: "top" | "bottom" | "both"
  color: string
}

export interface SectionOverrides {
  layout?: Partial<SectionLayout>
  spacing?: Partial<{ paddingTop: number; paddingBottom: number }>
}

export interface Section {
  id: string
  templateId: string
  label: string
  layout: SectionLayout
  background: SectionBackground
  spacing: {
    paddingTop: number
    paddingBottom: number
    marginTop: number
    marginBottom: number
  }
  divider: SectionDivider
  animation: AnimationConfig
  contentZones: ContentZone[]
  responsive: {
    tablet?: SectionOverrides
    mobile?: SectionOverrides
  }
}

// ─── Page Document (updated) ───
export interface EditorPageDocument {
  slug: string
  title: string
  draftSections: Section[]
  publishedSections: Section[]
  pageStyles?: {
    backgroundColor?: string
    maxWidth?: number
    customCSS?: string
  }
  showInNav: boolean
  navOrder: number
  navLabel: string
  lastEditedBy: string | null
  lastEditedAt: Date | null
  publishedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

// ─── Global Site Styles ───
export interface SiteStyles {
  typography: {
    headingFont: string
    bodyFont: string
    scale: {
      h1: string; h2: string; h3: string; h4: string
      body: string; small: string
    }
  }
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    text: string
    muted: string
  }
  buttons: {
    borderRadius: number
    defaultStyle: "filled" | "outline" | "ghost"
    hoverEffect: "lift" | "darken" | "scale" | "none"
  }
  spacing: {
    sectionPadding: number
    contentMaxWidth: number
    gridGap: number
  }
  updatedAt?: Date
  updatedBy?: string
}

// ─── Asset Library ───
export interface Asset {
  id: string
  type: "image" | "video" | "file"
  url: string
  thumbnailUrl: string
  filename: string
  mimeType: string
  size: number
  dimensions?: { width: number; height: number }
  focalPoint?: { x: number; y: number }
  alt?: string
  tags: string[]
  uploadedBy: string
  uploadedAt: Date
}

// ─── Section Templates ───
export type SectionCategory =
  | "introduce" | "programs" | "proof" | "engage"
  | "resources" | "events" | "showcase"

export interface SectionTemplate {
  id: string
  category: SectionCategory
  name: string
  description: string
  thumbnailUrl: string
  section: Section
  isBuiltIn: boolean
  createdBy?: string
  createdAt: Date
}

// ─── postMessage Bridge Types ───
export type ParentToCanvasMessage =
  | { type: "SELECT_ELEMENT"; payload: { id: string; kind: "section" | "block" } }
  | { type: "UPDATE_BLOCK_PROPS"; payload: { sectionId: string; blockId: string; props: Record<string, unknown> } }
  | { type: "UPDATE_BLOCK_STYLE"; payload: { sectionId: string; blockId: string; style: Partial<BlockStyle> } }
  | { type: "UPDATE_SECTION"; payload: { sectionId: string; changes: Partial<Section> } }
  | { type: "INSERT_BLOCK"; payload: { sectionId: string; zoneId: string; block: EditorBlock } }
  | { type: "INSERT_SECTION"; payload: { section: Section; atIndex: number } }
  | { type: "DELETE_ELEMENT"; payload: { id: string; kind: "section" | "block" } }
  | { type: "REORDER_SECTIONS"; payload: { fromIndex: number; toIndex: number } }
  | { type: "MOVE_BLOCK"; payload: { blockId: string; fromSectionId: string; toSectionId: string; position: BlockPosition } }
  | { type: "SET_VIEWPORT"; payload: { viewport: "desktop" | "tablet" | "mobile" } }
  | { type: "SYNC_STATE"; payload: { sections: Section[] } }
  | { type: "DESELECT" }

export type CanvasToParentMessage =
  | { type: "ELEMENT_HOVERED"; payload: { id: string; kind: "section" | "block"; rect: DOMRect } }
  | { type: "ELEMENT_SELECTED"; payload: { id: string; kind: "section" | "block"; rect: DOMRect } }
  | { type: "ELEMENT_DESELECTED" }
  | { type: "CONTENT_CHANGED"; payload: { sectionId: string; blockId: string; props: Record<string, unknown> } }
  | { type: "REQUEST_INSERT"; payload: { position: "before" | "after"; sectionId: string; insertType: "section" | "block" } }
  | { type: "CANVAS_READY" }
  | { type: "ELEMENT_RESIZED"; payload: { sectionId: string; blockId: string; newPosition: BlockPosition } }
  | { type: "INLINE_EDIT_STARTED"; payload: { sectionId: string; blockId: string } }
  | { type: "INLINE_EDIT_ENDED"; payload: { sectionId: string; blockId: string } }

// ─── Editor UI State ───
export type EditorMode = "management" | "editing"
export type Viewport = "desktop" | "tablet" | "mobile"
export type SaveStatus = "saved" | "saving" | "unsaved"
export type PanelType = "properties" | "section-inserter" | "block-inserter" | "global-styles" | null
export type PropertyTab = "content" | "style" | "advanced"
```

**Step 2: Commit**

```bash
git add src/lib/visual-editor/types.ts
git commit -m "feat: define visual editor type system (Section/Zone/Block hierarchy)"
```

---

### Task 1.3: Create Section Defaults & Helpers

**Files:**
- Create: `src/lib/visual-editor/defaults.ts`
- Create: `src/lib/visual-editor/helpers.ts`

**Step 1: Create defaults.ts with factory functions**

```typescript
// src/lib/visual-editor/defaults.ts
import type { Section, ContentZone, EditorBlock, BlockPosition, BlockStyle, SectionLayout, SectionBackground, AnimationConfig, SectionDivider, SiteStyles } from "./types"

let counter = 0
export function generateId(): string {
  return `${Date.now()}-${++counter}-${Math.random().toString(36).slice(2, 8)}`
}

export function defaultBlockPosition(colSpan = 12): BlockPosition {
  return { col: 1, row: 1, colSpan, rowSpan: 1 }
}

export function defaultBlockStyle(): BlockStyle {
  return { shadow: "none", opacity: 100 }
}

export function defaultSectionLayout(): SectionLayout {
  return {
    columns: 1,
    columnRatio: "equal",
    contentWidth: "contained",
    maxWidth: 1200,
    verticalAlign: "top",
    gap: 24,
  }
}

export function defaultBackground(): SectionBackground {
  return { type: "none" }
}

export function defaultDivider(): SectionDivider {
  return { type: "none", position: "bottom", color: "transparent" }
}

export function defaultAnimation(): AnimationConfig {
  return { type: "none", trigger: "on-load", delay: 0 }
}

export function createContentZone(blocks: EditorBlock[] = []): ContentZone {
  return { id: generateId(), gridColumns: 12, blocks }
}

export function createBlock(type: EditorBlock["type"], props: Record<string, unknown> = {}, colSpan = 12): EditorBlock {
  return {
    id: generateId(),
    type,
    position: defaultBlockPosition(colSpan),
    props,
    style: defaultBlockStyle(),
    responsive: {},
  }
}

export function createSection(label = "New Section", blocks: EditorBlock[] = []): Section {
  return {
    id: generateId(),
    templateId: "blank",
    label,
    layout: defaultSectionLayout(),
    background: defaultBackground(),
    spacing: { paddingTop: 80, paddingBottom: 80, marginTop: 0, marginBottom: 0 },
    divider: defaultDivider(),
    animation: defaultAnimation(),
    contentZones: [createContentZone(blocks)],
    responsive: {},
  }
}

export function defaultSiteStyles(): SiteStyles {
  return {
    typography: {
      headingFont: "Bricolage Grotesque",
      bodyFont: "Nunito",
      scale: { h1: "3.5rem", h2: "2.5rem", h3: "1.75rem", h4: "1.25rem", body: "1rem", small: "0.875rem" },
    },
    colors: {
      primary: "oklch(0.702 0.143 228)",
      secondary: "oklch(0.503 0.213 258)",
      accent: "oklch(0.793 0.144 163)",
      background: "oklch(0.977 0.007 82)",
      text: "oklch(0.224 0.027 260)",
      muted: "oklch(0.935 0.012 80)",
    },
    buttons: { borderRadius: 8, defaultStyle: "filled", hoverEffect: "lift" },
    spacing: { sectionPadding: 80, contentMaxWidth: 1200, gridGap: 24 },
  }
}
```

**Step 2: Create helpers.ts with utility functions**

```typescript
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
```

**Step 3: Commit**

```bash
git add src/lib/visual-editor/defaults.ts src/lib/visual-editor/helpers.ts
git commit -m "feat: add visual editor defaults and helper utilities"
```

---

### Task 1.4: Create Zustand Editor Store

**Files:**
- Create: `src/lib/visual-editor/editor-store.ts`

**Step 1: Create the store with undo/redo**

```typescript
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
```

**Step 2: Commit**

```bash
git add src/lib/visual-editor/editor-store.ts
git commit -m "feat: create zustand editor store with undo/redo history"
```

---

### Task 1.5: Create postMessage Bridge

**Files:**
- Create: `src/lib/visual-editor/message-bridge.ts`

**Step 1: Create the typed message bridge**

```typescript
// src/lib/visual-editor/message-bridge.ts
import type { ParentToCanvasMessage, CanvasToParentMessage } from "./types"

const BRIDGE_CHANNEL = "diagonally-editor"

interface BridgeMessage {
  channel: typeof BRIDGE_CHANNEL
  payload: ParentToCanvasMessage | CanvasToParentMessage
}

function isBridgeMessage(data: unknown): data is BridgeMessage {
  return (
    typeof data === "object" &&
    data !== null &&
    "channel" in data &&
    (data as BridgeMessage).channel === BRIDGE_CHANNEL
  )
}

/** Send a message from the parent frame to the canvas iframe */
export function sendToCanvas(iframe: HTMLIFrameElement, message: ParentToCanvasMessage) {
  iframe.contentWindow?.postMessage(
    { channel: BRIDGE_CHANNEL, payload: message } satisfies BridgeMessage,
    window.location.origin
  )
}

/** Send a message from the canvas iframe to the parent frame */
export function sendToParent(message: CanvasToParentMessage) {
  window.parent.postMessage(
    { channel: BRIDGE_CHANNEL, payload: message } satisfies BridgeMessage,
    window.location.origin
  )
}

/** Listen for messages from the canvas (used in parent frame) */
export function onCanvasMessage(
  handler: (message: CanvasToParentMessage) => void
): () => void {
  function listener(event: MessageEvent) {
    if (event.origin !== window.location.origin) return
    if (!isBridgeMessage(event.data)) return
    handler(event.data.payload as CanvasToParentMessage)
  }
  window.addEventListener("message", listener)
  return () => window.removeEventListener("message", listener)
}

/** Listen for messages from the parent (used in canvas iframe) */
export function onParentMessage(
  handler: (message: ParentToCanvasMessage) => void
): () => void {
  function listener(event: MessageEvent) {
    if (event.origin !== window.location.origin) return
    if (!isBridgeMessage(event.data)) return
    handler(event.data.payload as ParentToCanvasMessage)
  }
  window.addEventListener("message", listener)
  return () => window.removeEventListener("message", listener)
}
```

**Step 2: Commit**

```bash
git add src/lib/visual-editor/message-bridge.ts
git commit -m "feat: typed postMessage bridge for parent-iframe communication"
```

---

### Task 1.6: Create Section & Zone Renderers (Shared)

These components are used both on the public site and inside the editor canvas. They render sections with their layout, background, and blocks within content zones using CSS grid.

**Files:**
- Create: `src/components/visual-editor/renderers/section-renderer.tsx`
- Create: `src/components/visual-editor/renderers/zone-renderer.tsx`

**Step 1: Create zone-renderer.tsx**

The zone renderer places blocks on a CSS grid:

```typescript
// src/components/visual-editor/renderers/zone-renderer.tsx
import type { ContentZone, EditorBlock } from "@/lib/visual-editor/types"
import { TextBlock } from "./blocks/text-block"
import { ImageBlock } from "./blocks/image-block"
import { ButtonBlock } from "./blocks/button-block"
import { SpacerBlock } from "./blocks/spacer-block"
// Import remaining blocks as they are created

const BLOCK_COMPONENTS: Record<string, React.ComponentType<{ block: EditorBlock }>> = {
  text: TextBlock,
  image: ImageBlock,
  button: ButtonBlock,
  spacer: SpacerBlock,
  // Add remaining block types as they are implemented
}

function FallbackBlock({ block }: { block: EditorBlock }) {
  return (
    <div className="border border-dashed border-gray-300 rounded-lg p-4 text-center text-sm text-gray-500">
      {block.type} block
    </div>
  )
}

interface ZoneRendererProps {
  zone: ContentZone
  editorMode?: boolean
}

export function ZoneRenderer({ zone, editorMode }: ZoneRendererProps) {
  return (
    <div
      className="grid"
      style={{
        gridTemplateColumns: `repeat(${zone.gridColumns}, 1fr)`,
      }}
    >
      {zone.blocks.map(block => {
        const Component = BLOCK_COMPONENTS[block.type] ?? FallbackBlock
        return (
          <div
            key={block.id}
            data-block-id={block.id}
            data-block-type={block.type}
            style={{
              gridColumn: `${block.position.col} / span ${block.position.colSpan}`,
              gridRow: `${block.position.row} / span ${block.position.rowSpan}`,
              margin: block.style.margin
                ? `${block.style.margin.top ?? 0}px ${block.style.margin.right ?? 0}px ${block.style.margin.bottom ?? 0}px ${block.style.margin.left ?? 0}px`
                : undefined,
              padding: block.style.padding
                ? `${block.style.padding.top ?? 0}px ${block.style.padding.right ?? 0}px ${block.style.padding.bottom ?? 0}px ${block.style.padding.left ?? 0}px`
                : undefined,
              background: block.style.background,
              borderRadius: block.style.borderRadius ? `${block.style.borderRadius}px` : undefined,
              opacity: block.style.opacity != null ? block.style.opacity / 100 : undefined,
              boxShadow:
                block.style.shadow === "sm" ? "0 1px 2px rgba(0,0,0,0.05)" :
                block.style.shadow === "md" ? "0 4px 6px rgba(0,0,0,0.07)" :
                block.style.shadow === "lg" ? "0 10px 15px rgba(0,0,0,0.1)" :
                undefined,
            }}
          >
            <Component block={block} />
          </div>
        )
      })}
    </div>
  )
}
```

**Step 2: Create section-renderer.tsx**

```typescript
// src/components/visual-editor/renderers/section-renderer.tsx
import type { Section } from "@/lib/visual-editor/types"
import { ZoneRenderer } from "./zone-renderer"

function getColumnStyles(layout: Section["layout"]): React.CSSProperties {
  if (layout.columns <= 1) return {}

  let templateColumns: string
  switch (layout.columnRatio) {
    case "1:2": templateColumns = "1fr 2fr"; break
    case "2:1": templateColumns = "2fr 1fr"; break
    case "1:3": templateColumns = "1fr 3fr"; break
    case "3:1": templateColumns = "3fr 1fr"; break
    case "1:1:1": templateColumns = "repeat(3, 1fr)"; break
    case "1:1:1:1": templateColumns = "repeat(4, 1fr)"; break
    default: templateColumns = `repeat(${layout.columns}, 1fr)`
  }

  return {
    display: "grid",
    gridTemplateColumns: templateColumns,
    gap: `${layout.gap}px`,
    alignItems: layout.verticalAlign === "center" ? "center" : layout.verticalAlign === "bottom" ? "end" : "start",
  }
}

function getBackgroundStyles(bg: Section["background"]): React.CSSProperties {
  switch (bg.type) {
    case "color": return { backgroundColor: bg.color }
    case "gradient": return { background: `linear-gradient(${bg.gradient?.angle ?? 180}deg, ${bg.gradient?.from}, ${bg.gradient?.to})` }
    case "image": return {
      backgroundImage: `url(${bg.image?.url})`,
      backgroundSize: "cover",
      backgroundPosition: bg.image?.focalPoint
        ? `${bg.image.focalPoint.x * 100}% ${bg.image.focalPoint.y * 100}%`
        : "center",
    }
    default: return {}
  }
}

interface SectionRendererProps {
  section: Section
  editorMode?: boolean
}

export function SectionRenderer({ section, editorMode }: SectionRendererProps) {
  const { layout, background, spacing } = section

  return (
    <section
      data-section-id={section.id}
      data-section-label={section.label}
      className="relative"
      style={{
        ...getBackgroundStyles(background),
        paddingTop: `${spacing.paddingTop}px`,
        paddingBottom: `${spacing.paddingBottom}px`,
        marginTop: `${spacing.marginTop}px`,
        marginBottom: `${spacing.marginBottom}px`,
      }}
    >
      {/* Overlay for background images */}
      {background.type === "image" && background.overlay && (
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: background.overlay.color,
            opacity: background.overlay.opacity / 100,
          }}
        />
      )}

      {/* Content container */}
      <div
        className="relative mx-auto px-4 sm:px-6 lg:px-8"
        style={{
          maxWidth: layout.contentWidth === "contained" ? `${layout.maxWidth}px` : "none",
        }}
      >
        <div style={getColumnStyles(layout)}>
          {section.contentZones.map(zone => (
            <ZoneRenderer key={zone.id} zone={zone} editorMode={editorMode} />
          ))}
        </div>
      </div>
    </section>
  )
}
```

**Step 3: Create initial block renderers (essential 4)**

Create minimal renderers for text, image, button, and spacer blocks so the canvas has something to show. Remaining 20 blocks are built in Phase 2.

Create `src/components/visual-editor/renderers/blocks/text-block.tsx`:
```typescript
import type { EditorBlock } from "@/lib/visual-editor/types"

export function TextBlock({ block }: { block: EditorBlock }) {
  const content = (block.props.content as string) || "<p>Click to edit text...</p>"
  return (
    <div
      className="prose prose-lg max-w-none"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  )
}
```

Create `src/components/visual-editor/renderers/blocks/image-block.tsx`:
```typescript
import type { EditorBlock } from "@/lib/visual-editor/types"

export function ImageBlock({ block }: { block: EditorBlock }) {
  const src = block.props.src as string
  const alt = (block.props.alt as string) || ""
  const caption = block.props.caption as string | undefined

  if (!src) {
    return (
      <div className="flex items-center justify-center h-48 bg-gray-100 rounded-lg text-gray-400">
        Click to add image
      </div>
    )
  }

  return (
    <figure>
      <img src={src} alt={alt} className="w-full rounded-lg" />
      {caption && <figcaption className="mt-2 text-sm text-gray-500 text-center">{caption}</figcaption>}
    </figure>
  )
}
```

Create `src/components/visual-editor/renderers/blocks/button-block.tsx`:
```typescript
import type { EditorBlock } from "@/lib/visual-editor/types"

export function ButtonBlock({ block }: { block: EditorBlock }) {
  const label = (block.props.label as string) || "Button"
  const variant = (block.props.variant as string) || "filled"
  const align = (block.props.align as string) || "left"

  const baseClasses = "inline-flex items-center px-6 py-3 rounded-lg font-medium transition-colors"
  const variantClasses =
    variant === "outline" ? "border-2 border-current bg-transparent" :
    variant === "ghost" ? "bg-transparent hover:bg-gray-100" :
    "bg-blue-600 text-white hover:bg-blue-700"

  return (
    <div style={{ textAlign: align as "left" | "center" | "right" }}>
      <span className={`${baseClasses} ${variantClasses}`}>
        {label}
      </span>
    </div>
  )
}
```

Create `src/components/visual-editor/renderers/blocks/spacer-block.tsx`:
```typescript
import type { EditorBlock } from "@/lib/visual-editor/types"

export function SpacerBlock({ block }: { block: EditorBlock }) {
  const height = (block.props.height as number) || 40
  return <div style={{ height: `${height}px` }} />
}
```

**Step 4: Commit**

```bash
git add src/components/visual-editor/renderers/
git commit -m "feat: section/zone renderers and initial block components (text, image, button, spacer)"
```

---

### Task 1.7: Create Canvas Iframe Route

This is the special Next.js route that renders inside the iframe. It loads the page sections and renders them with the editor runtime.

**Files:**
- Create: `src/app/admin/canvas/[slug]/page.tsx`
- Create: `src/app/admin/canvas/[slug]/layout.tsx`
- Create: `src/components/visual-editor/canvas/editor-runtime.tsx`

**Step 1: Read Next.js 16 page conventions**

Check `node_modules/next/dist/docs/01-app/03-api-reference/` for the latest page/layout patterns. The project already uses `use()` to unwrap params promises (seen in `src/app/admin/pages/[slug]/page.tsx`).

**Step 2: Create canvas layout (bare — no admin shell)**

The canvas layout must NOT include the admin sidebar/header. It's a bare HTML page that only loads the page styles and editor runtime.

```typescript
// src/app/admin/canvas/[slug]/layout.tsx
import "@/app/globals.css"

export default function CanvasLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body className="bg-white">
        {children}
      </body>
    </html>
  )
}
```

**NOTE:** This layout intentionally creates a separate HTML document for the iframe. Check if Next.js 16 supports this pattern or if we need a different approach (like a route handler returning HTML). If Next.js 16 doesn't allow nested `<html>` tags, use a route handler at `src/app/admin/canvas/[slug]/route.tsx` that returns a rendered HTML string instead.

**Step 3: Create canvas page**

```typescript
// src/app/admin/canvas/[slug]/page.tsx
"use client"

import { use, useEffect, useState } from "react"
import { SectionRenderer } from "@/components/visual-editor/renderers/section-renderer"
import { EditorRuntime } from "@/components/visual-editor/canvas/editor-runtime"
import { onParentMessage, sendToParent } from "@/lib/visual-editor/message-bridge"
import type { Section } from "@/lib/visual-editor/types"

interface CanvasPageProps {
  params: Promise<{ slug: string }>
}

export default function CanvasPage({ params }: CanvasPageProps) {
  const { slug } = use(params)
  const [sections, setSections] = useState<Section[]>([])
  const [editMode, setEditMode] = useState(true)

  // Listen for state sync from parent
  useEffect(() => {
    const cleanup = onParentMessage(message => {
      switch (message.type) {
        case "SYNC_STATE":
          setSections(message.payload.sections)
          break
        case "SELECT_ELEMENT":
          // EditorRuntime handles visual selection
          break
        case "DESELECT":
          break
        // Handle other message types
      }
    })

    // Signal ready
    sendToParent({ type: "CANVAS_READY" })

    return cleanup
  }, [])

  return (
    <div className="min-h-screen">
      {sections.map(section => (
        <SectionRenderer key={section.id} section={section} editorMode={editMode} />
      ))}

      {sections.length === 0 && (
        <div className="flex items-center justify-center min-h-screen text-gray-400">
          <p>No sections yet. Click + to add one.</p>
        </div>
      )}

      {editMode && <EditorRuntime sections={sections} />}
    </div>
  )
}
```

**Step 4: Create editor runtime (skeleton)**

The editor runtime is the overlay system that makes the canvas interactive. Start with just hover and selection overlays — the full implementation comes in Task 1.8.

```typescript
// src/components/visual-editor/canvas/editor-runtime.tsx
"use client"

import { useEffect, useCallback, useState } from "react"
import { sendToParent } from "@/lib/visual-editor/message-bridge"
import type { Section } from "@/lib/visual-editor/types"

interface EditorRuntimeProps {
  sections: Section[]
}

export function EditorRuntime({ sections }: EditorRuntimeProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [hoveredKind, setHoveredKind] = useState<"section" | "block" | null>(null)
  const [hoveredRect, setHoveredRect] = useState<DOMRect | null>(null)

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [selectedKind, setSelectedKind] = useState<"section" | "block" | null>(null)
  const [selectedRect, setSelectedRect] = useState<DOMRect | null>(null)

  // Handle mouse move for hover detection
  const handleMouseMove = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement

    // Find closest block or section
    const blockEl = target.closest("[data-block-id]") as HTMLElement | null
    const sectionEl = target.closest("[data-section-id]") as HTMLElement | null

    if (blockEl) {
      const id = blockEl.dataset.blockId!
      if (id !== hoveredId) {
        setHoveredId(id)
        setHoveredKind("block")
        setHoveredRect(blockEl.getBoundingClientRect())
        sendToParent({ type: "ELEMENT_HOVERED", payload: { id, kind: "block", rect: blockEl.getBoundingClientRect() } })
      }
    } else if (sectionEl) {
      const id = sectionEl.dataset.sectionId!
      if (id !== hoveredId) {
        setHoveredId(id)
        setHoveredKind("section")
        setHoveredRect(sectionEl.getBoundingClientRect())
        sendToParent({ type: "ELEMENT_HOVERED", payload: { id, kind: "section", rect: sectionEl.getBoundingClientRect() } })
      }
    } else {
      if (hoveredId) {
        setHoveredId(null)
        setHoveredKind(null)
        setHoveredRect(null)
      }
    }
  }, [hoveredId])

  // Handle click for selection
  const handleClick = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement
    const blockEl = target.closest("[data-block-id]") as HTMLElement | null
    const sectionEl = target.closest("[data-section-id]") as HTMLElement | null

    if (blockEl) {
      const id = blockEl.dataset.blockId!
      const sectionId = sectionEl?.dataset.sectionId
      setSelectedId(id)
      setSelectedKind("block")
      setSelectedRect(blockEl.getBoundingClientRect())
      sendToParent({ type: "ELEMENT_SELECTED", payload: { id, kind: "block", rect: blockEl.getBoundingClientRect() } })
      e.stopPropagation()
    } else if (sectionEl) {
      const id = sectionEl.dataset.sectionId!
      setSelectedId(id)
      setSelectedKind("section")
      setSelectedRect(sectionEl.getBoundingClientRect())
      sendToParent({ type: "ELEMENT_SELECTED", payload: { id, kind: "section", rect: sectionEl.getBoundingClientRect() } })
    } else {
      setSelectedId(null)
      setSelectedKind(null)
      setSelectedRect(null)
      sendToParent({ type: "ELEMENT_DESELECTED" })
    }
  }, [])

  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("click", handleClick)
    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("click", handleClick)
    }
  }, [handleMouseMove, handleClick])

  return (
    <>
      {/* Hover overlay */}
      {hoveredRect && hoveredId !== selectedId && (
        <div
          className="pointer-events-none fixed border-2 border-blue-400/50 rounded-sm transition-all duration-75"
          style={{
            top: hoveredRect.top,
            left: hoveredRect.left,
            width: hoveredRect.width,
            height: hoveredRect.height,
          }}
        />
      )}

      {/* Selection overlay */}
      {selectedRect && (
        <div
          className="pointer-events-none fixed border-2 border-blue-500 rounded-sm"
          style={{
            top: selectedRect.top,
            left: selectedRect.left,
            width: selectedRect.width,
            height: selectedRect.height,
          }}
        >
          {/* Resize handles (8 points) */}
          {selectedKind === "block" && (
            <>
              {/* Corners */}
              <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-blue-500 rounded-sm pointer-events-auto cursor-nw-resize" />
              <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-blue-500 rounded-sm pointer-events-auto cursor-ne-resize" />
              <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-blue-500 rounded-sm pointer-events-auto cursor-sw-resize" />
              <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-blue-500 rounded-sm pointer-events-auto cursor-se-resize" />
              {/* Midpoints */}
              <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-2 border-blue-500 rounded-sm pointer-events-auto cursor-n-resize" />
              <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-2 border-blue-500 rounded-sm pointer-events-auto cursor-s-resize" />
              <div className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-3 h-3 bg-white border-2 border-blue-500 rounded-sm pointer-events-auto cursor-w-resize" />
              <div className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-3 bg-white border-2 border-blue-500 rounded-sm pointer-events-auto cursor-e-resize" />
            </>
          )}

          {/* Section label */}
          {selectedKind === "section" && (
            <div className="absolute -top-7 left-2 bg-blue-500 text-white text-xs px-2 py-0.5 rounded font-medium">
              Section
            </div>
          )}
        </div>
      )}

      {/* Insert points between sections */}
      {sections.map((section, index) => {
        const el = document.querySelector(`[data-section-id="${section.id}"]`)
        if (!el) return null
        const rect = el.getBoundingClientRect()
        return (
          <div
            key={`insert-${section.id}`}
            className="fixed left-0 right-0 flex items-center justify-center group"
            style={{ top: rect.bottom - 1, height: 24 }}
          >
            <div className="w-full h-px bg-transparent group-hover:bg-blue-300 transition-colors" />
            <button
              className="absolute w-7 h-7 rounded-full bg-blue-500 text-white text-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md cursor-pointer pointer-events-auto"
              onClick={() => {
                sendToParent({
                  type: "REQUEST_INSERT",
                  payload: { position: "after", sectionId: section.id, insertType: "section" },
                })
              }}
            >
              +
            </button>
          </div>
        )
      })}
    </>
  )
}
```

**Step 5: Commit**

```bash
git add src/app/admin/canvas/ src/components/visual-editor/canvas/
git commit -m "feat: canvas iframe route with editor runtime (hover, selection, insert points)"
```

---

### Task 1.8: Create Editor Shell (Top Bar + Viewport Frame)

**Files:**
- Create: `src/components/visual-editor/shell/editor-top-bar.tsx`
- Create: `src/components/visual-editor/shell/viewport-frame.tsx`

**Step 1: Create editor-top-bar.tsx**

```typescript
// src/components/visual-editor/shell/editor-top-bar.tsx
"use client"

import { useEditorStore } from "@/lib/visual-editor/editor-store"
import { Undo2, Redo2, Monitor, Tablet, Smartphone, Paintbrush, Settings, Play } from "lucide-react"
import type { Viewport } from "@/lib/visual-editor/types"

interface EditorTopBarProps {
  onExit: () => void
  onSave: () => void
}

export function EditorTopBar({ onExit, onSave }: EditorTopBarProps) {
  const {
    pageTitle, saveStatus, viewport, setViewport,
    undoStack, redoStack, undo, redo,
    setActivePanel, activePanel,
  } = useEditorStore()

  const viewports: { value: Viewport; icon: typeof Monitor; label: string }[] = [
    { value: "desktop", icon: Monitor, label: "Desktop" },
    { value: "tablet", icon: Tablet, label: "Tablet" },
    { value: "mobile", icon: Smartphone, label: "Mobile" },
  ]

  return (
    <div className="h-12 bg-white border-b border-gray-200 flex items-center justify-between px-4 shrink-0 z-50">
      {/* Left: Save + Exit */}
      <div className="flex items-center gap-2">
        <button
          onClick={onSave}
          disabled={saveStatus === "saved"}
          className="px-3 py-1.5 text-sm font-medium bg-black text-white rounded-md disabled:opacity-40 hover:bg-gray-800 transition-colors"
        >
          {saveStatus === "saving" ? "Saving..." : "SAVE"}
        </button>
        <button
          onClick={onExit}
          className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-black transition-colors"
        >
          EXIT
        </button>
      </div>

      {/* Center: Page name + status */}
      <div className="flex items-center gap-2 text-sm">
        <span className="font-medium text-gray-900">{pageTitle}</span>
        <span className="text-gray-400">·</span>
        <span className={`text-xs ${saveStatus === "unsaved" ? "text-amber-500" : "text-gray-400"}`}>
          {saveStatus === "saved" ? "Saved" : saveStatus === "saving" ? "Saving..." : "Unsaved changes"}
        </span>
      </div>

      {/* Right: Undo/Redo, Viewport, Tools */}
      <div className="flex items-center gap-1">
        {/* Undo / Redo */}
        <button
          onClick={undo}
          disabled={undoStack.length === 0}
          className="p-2 text-gray-500 hover:text-black disabled:opacity-30 transition-colors"
          title="Undo (Cmd+Z)"
        >
          <Undo2 size={16} />
        </button>
        <button
          onClick={redo}
          disabled={redoStack.length === 0}
          className="p-2 text-gray-500 hover:text-black disabled:opacity-30 transition-colors"
          title="Redo (Cmd+Y)"
        >
          <Redo2 size={16} />
        </button>

        <div className="w-px h-5 bg-gray-200 mx-1" />

        {/* Viewport toggle */}
        <div className="flex items-center bg-gray-100 rounded-md p-0.5">
          {viewports.map(({ value, icon: Icon, label }) => (
            <button
              key={value}
              onClick={() => setViewport(value)}
              className={`p-1.5 rounded transition-colors ${viewport === value ? "bg-white text-black shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
              title={label}
            >
              <Icon size={14} />
            </button>
          ))}
        </div>

        <div className="w-px h-5 bg-gray-200 mx-1" />

        {/* Styles + Settings */}
        <button
          onClick={() => setActivePanel(activePanel === "global-styles" ? null : "global-styles")}
          className={`p-2 transition-colors ${activePanel === "global-styles" ? "text-blue-500" : "text-gray-500 hover:text-black"}`}
          title="Site Styles"
        >
          <Paintbrush size={16} />
        </button>
      </div>
    </div>
  )
}
```

**Step 2: Create viewport-frame.tsx**

This wraps the iframe and resizes it based on the selected viewport.

```typescript
// src/components/visual-editor/shell/viewport-frame.tsx
"use client"

import { useRef, useEffect, useCallback } from "react"
import { useEditorStore } from "@/lib/visual-editor/editor-store"
import { sendToCanvas, onCanvasMessage } from "@/lib/visual-editor/message-bridge"
import type { Viewport } from "@/lib/visual-editor/types"

const VIEWPORT_WIDTHS: Record<Viewport, number | "full"> = {
  desktop: "full",
  tablet: 768,
  mobile: 375,
}

interface ViewportFrameProps {
  slug: string
}

export function ViewportFrame({ slug }: ViewportFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const { viewport, sections, selectSection, selectBlock, deselect, setActivePanel } = useEditorStore()

  const width = VIEWPORT_WIDTHS[viewport]

  // Sync sections to canvas when they change
  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) return
    sendToCanvas(iframe, { type: "SYNC_STATE", payload: { sections } })
  }, [sections])

  // Listen for canvas messages
  useEffect(() => {
    const cleanup = onCanvasMessage(message => {
      switch (message.type) {
        case "ELEMENT_SELECTED":
          if (message.payload.kind === "section") {
            selectSection(message.payload.id)
          } else {
            // Find which section this block belongs to
            const section = sections.find(s =>
              s.contentZones.some(z => z.blocks.some(b => b.id === message.payload.id))
            )
            if (section) selectBlock(section.id, message.payload.id)
          }
          break
        case "ELEMENT_DESELECTED":
          deselect()
          break
        case "REQUEST_INSERT":
          setActivePanel(message.payload.insertType === "section" ? "section-inserter" : "block-inserter")
          break
        case "CANVAS_READY":
          // Initial sync
          const iframe = iframeRef.current
          if (iframe) sendToCanvas(iframe, { type: "SYNC_STATE", payload: { sections } })
          break
      }
    })
    return cleanup
  }, [sections, selectSection, selectBlock, deselect, setActivePanel])

  return (
    <div className="flex-1 flex items-start justify-center overflow-auto bg-gray-100 p-4">
      <div
        className="transition-all duration-300 ease-in-out bg-white shadow-lg"
        style={{
          width: width === "full" ? "100%" : `${width}px`,
          maxWidth: "100%",
          height: "100%",
          borderRadius: width === "full" ? 0 : "12px",
          overflow: "hidden",
        }}
      >
        <iframe
          ref={iframeRef}
          src={`/admin/canvas/${slug}`}
          className="w-full h-full border-0"
          title="Page Editor Canvas"
        />
      </div>
    </div>
  )
}
```

**Step 3: Commit**

```bash
git add src/components/visual-editor/shell/
git commit -m "feat: editor top bar and viewport frame with responsive preview"
```

---

### Task 1.9: Create Visual Editor Orchestrator

This is the main component that ties everything together — the entry point for edit mode.

**Files:**
- Create: `src/components/visual-editor/visual-editor.tsx`
- Create: `src/lib/visual-editor/firestore.ts`

**Step 1: Create Firestore operations for new data model**

```typescript
// src/lib/visual-editor/firestore.ts
import { db } from "@/lib/firebase"
import { doc, getDoc, setDoc, collection, addDoc, getDocs, query, orderBy, Timestamp } from "firebase/firestore"
import type { Section, EditorPageDocument, SiteStyles, Asset, SectionTemplate } from "./types"
import { defaultSiteStyles } from "./defaults"

// ─── Page operations ───

/** Load a page, supporting both old (draftBlocks) and new (draftSections) format */
export async function loadPageSections(slug: string): Promise<{ title: string; sections: Section[] }> {
  const ref = doc(db, "pages", slug)
  const snap = await getDoc(ref)
  if (!snap.exists()) throw new Error(`Page "${slug}" not found`)

  const data = snap.data()

  // New format
  if (data.draftSections) {
    return { title: data.title ?? slug, sections: data.draftSections as Section[] }
  }

  // Old format — migrate on read
  if (data.draftBlocks) {
    const { migrateBlocksToSections } = await import("./migration")
    const sections = migrateBlocksToSections(data.draftBlocks)
    return { title: data.title ?? slug, sections }
  }

  return { title: data.title ?? slug, sections: [] }
}

/** Save draft sections to Firestore */
export async function saveDraftSections(
  slug: string,
  sections: Section[],
  editorEmail: string
): Promise<void> {
  const ref = doc(db, "pages", slug)
  await setDoc(ref, {
    draftSections: sections,
    lastEditedBy: editorEmail,
    lastEditedAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  }, { merge: true })
}

/** Publish: copy draftSections to publishedSections + create version */
export async function publishPageSections(
  slug: string,
  sections: Section[],
  editorEmail: string
): Promise<void> {
  const ref = doc(db, "pages", slug)

  // Get current version count
  const versionsRef = collection(db, "pages", slug, "versions")
  const versionsSnap = await getDocs(query(versionsRef, orderBy("version", "desc")))
  const nextVersion = versionsSnap.empty ? 1 : (versionsSnap.docs[0].data().version as number) + 1

  // Update page
  await setDoc(ref, {
    draftSections: sections,
    publishedSections: sections,
    publishedAt: Timestamp.now(),
    lastEditedBy: editorEmail,
    lastEditedAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  }, { merge: true })

  // Create version snapshot
  await addDoc(versionsRef, {
    version: nextVersion,
    sections,
    publishedBy: editorEmail,
    publishedAt: Timestamp.now(),
    note: "",
  })
}

// ─── Site Styles ───

export async function loadSiteStyles(): Promise<SiteStyles> {
  const ref = doc(db, "config", "styles")
  const snap = await getDoc(ref)
  if (!snap.exists()) return defaultSiteStyles()
  return snap.data() as SiteStyles
}

export async function saveSiteStyles(styles: SiteStyles, editorEmail: string): Promise<void> {
  const ref = doc(db, "config", "styles")
  await setDoc(ref, { ...styles, updatedAt: Timestamp.now(), updatedBy: editorEmail })
}

// ─── Section Templates ───

export async function loadSectionTemplates(): Promise<SectionTemplate[]> {
  const ref = collection(db, "sectionTemplates")
  const snap = await getDocs(ref)
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as SectionTemplate))
}

export async function saveSectionTemplate(template: Omit<SectionTemplate, "id">): Promise<string> {
  const ref = collection(db, "sectionTemplates")
  const docRef = await addDoc(ref, template)
  return docRef.id
}
```

**Step 2: Create migration helper**

```typescript
// src/lib/visual-editor/migration.ts
import type { Section, EditorBlock } from "./types"
import { generateId, createSection, createBlock } from "./defaults"

interface OldBlock {
  id: string
  type: string
  props: Record<string, unknown>
}

/** Map old block type names to new ones */
function mapBlockType(oldType: string): EditorBlock["type"] {
  const map: Record<string, EditorBlock["type"]> = {
    "hero": "text",             // hero becomes a text section with CTA
    "rich-text": "text",
    "stats-row": "stats-row",
    "team-cards": "card",
    "cta-banner": "cta-banner",
    "testimonials": "card",
    "faq-accordion": "accordion",
    "single-image": "image",
    "video-embed": "video-embed",
    "spacer": "spacer",
    "wave-divider": "divider",
    "pricing-cards": "pricing-card",
    "comparison-table": "comparison-table",
  }
  return map[oldType] ?? "text"
}

/** Convert old flat Block[] to new Section[] format */
export function migrateBlocksToSections(blocks: OldBlock[]): Section[] {
  return blocks.map(oldBlock => {
    const newBlock = createBlock(mapBlockType(oldBlock.type), oldBlock.props)
    const section = createSection(oldBlock.type.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase()), [newBlock])
    section.templateId = "migrated"
    return section
  })
}
```

**Step 3: Create visual-editor.tsx orchestrator**

```typescript
// src/components/visual-editor/visual-editor.tsx
"use client"

import { useEffect, useCallback, useState } from "react"
import { useEditorStore } from "@/lib/visual-editor/editor-store"
import { EditorTopBar } from "./shell/editor-top-bar"
import { ViewportFrame } from "./shell/viewport-frame"
import { loadPageSections, saveDraftSections, publishPageSections } from "@/lib/visual-editor/firestore"
import { useAuth } from "@/lib/auth-context"

interface VisualEditorProps {
  slug: string
}

export function VisualEditor({ slug }: VisualEditorProps) {
  const { user } = useAuth()
  const { init, sections, saveStatus, setSaveStatus, setMode, mode } = useEditorStore()
  const [loading, setLoading] = useState(true)

  // Load page data
  useEffect(() => {
    async function load() {
      try {
        const { title, sections } = await loadPageSections(slug)
        init(slug, title, sections)
      } catch (err) {
        console.error("Failed to load page:", err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [slug, init])

  // Auto-save with debounce
  useEffect(() => {
    if (saveStatus !== "unsaved" || !user?.email) return
    const timer = setTimeout(async () => {
      setSaveStatus("saving")
      try {
        await saveDraftSections(slug, sections, user.email!)
        setSaveStatus("saved")
      } catch (err) {
        console.error("Auto-save failed:", err)
        setSaveStatus("unsaved")
      }
    }, 3000)
    return () => clearTimeout(timer)
  }, [saveStatus, sections, slug, user?.email, setSaveStatus])

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const meta = e.metaKey || e.ctrlKey
      if (meta && e.key === "z" && !e.shiftKey) {
        e.preventDefault()
        useEditorStore.getState().undo()
      }
      if (meta && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
        e.preventDefault()
        useEditorStore.getState().redo()
      }
      if (meta && e.key === "s") {
        e.preventDefault()
        handleSave()
      }
      if (e.key === "Escape") {
        useEditorStore.getState().deselect()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  const handleSave = useCallback(async () => {
    if (!user?.email) return
    setSaveStatus("saving")
    try {
      await saveDraftSections(slug, useEditorStore.getState().sections, user.email)
      setSaveStatus("saved")
    } catch (err) {
      console.error("Save failed:", err)
      setSaveStatus("unsaved")
    }
  }, [slug, user?.email, setSaveStatus])

  const handleExit = useCallback(() => {
    setMode("management")
    // Navigate back to admin pages list
    window.location.href = "/admin/pages"
  }, [setMode])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <EditorTopBar onExit={handleExit} onSave={handleSave} />
      <ViewportFrame slug={slug} />
    </div>
  )
}
```

**Step 4: Commit**

```bash
git add src/components/visual-editor/visual-editor.tsx src/lib/visual-editor/firestore.ts src/lib/visual-editor/migration.ts
git commit -m "feat: visual editor orchestrator with auto-save, keyboard shortcuts, and Firestore persistence"
```

---

### Task 1.10: Wire Up the Admin Route

**Files:**
- Modify: `src/app/admin/pages/[slug]/page.tsx`

**Step 1: Update the page route to use the new VisualEditor**

Replace the existing PageEditor import with VisualEditor. Keep the old `page-editor.tsx` component intact for fallback — we can remove it once the new editor is fully working.

```typescript
// src/app/admin/pages/[slug]/page.tsx
"use client"

import { use } from "react"
import { VisualEditor } from "@/components/visual-editor/visual-editor"

interface PageEditorRouteProps {
  params: Promise<{ slug: string }>
}

export default function PageEditorRoute({ params }: PageEditorRouteProps) {
  const { slug } = use(params)
  return (
    <div className="-m-6 h-[calc(100vh)]">
      <VisualEditor slug={slug} />
    </div>
  )
}
```

**Step 2: Verify the app builds**

```bash
cd /Users/md/Diagonally/website && npm run build
```

Expected: Build succeeds (there may be warnings about unused imports in old components — that's fine)

**Step 3: Test locally**

```bash
npm run dev
```

Navigate to `/admin/pages/<any-slug>`. You should see the editor top bar and an iframe canvas. The canvas may be empty or show migrated content from old blocks.

**Step 4: Commit**

```bash
git add src/app/admin/pages/[slug]/page.tsx
git commit -m "feat: wire visual editor to admin page route"
```

---

## Phase 2: Core Editing

### Task 2.1: Build Remaining Block Renderers (20 blocks)

**Files:**
- Create: `src/components/visual-editor/renderers/blocks/video-block.tsx`
- Create: `src/components/visual-editor/renderers/blocks/icon-block.tsx`
- Create: `src/components/visual-editor/renderers/blocks/columns-block.tsx`
- Create: `src/components/visual-editor/renderers/blocks/card-block.tsx`
- Create: `src/components/visual-editor/renderers/blocks/accordion-block.tsx`
- Create: `src/components/visual-editor/renderers/blocks/tabs-block.tsx`
- Create: `src/components/visual-editor/renderers/blocks/divider-block.tsx`
- Create: `src/components/visual-editor/renderers/blocks/gallery-block.tsx`
- Create: `src/components/visual-editor/renderers/blocks/carousel-block.tsx`
- Create: `src/components/visual-editor/renderers/blocks/audio-block.tsx`
- Create: `src/components/visual-editor/renderers/blocks/stats-block.tsx`
- Create: `src/components/visual-editor/renderers/blocks/pricing-block.tsx`
- Create: `src/components/visual-editor/renderers/blocks/comparison-block.tsx`
- Create: `src/components/visual-editor/renderers/blocks/chart-block.tsx`
- Create: `src/components/visual-editor/renderers/blocks/form-block.tsx`
- Create: `src/components/visual-editor/renderers/blocks/newsletter-block.tsx`
- Create: `src/components/visual-editor/renderers/blocks/cta-block.tsx`
- Create: `src/components/visual-editor/renderers/blocks/social-block.tsx`
- Create: `src/components/visual-editor/renderers/blocks/code-block.tsx`
- Create: `src/components/visual-editor/renderers/blocks/embed-block.tsx`
- Create: `src/components/visual-editor/renderers/blocks/map-block.tsx`
- Create: `src/components/visual-editor/renderers/blocks/calendar-block.tsx`
- Modify: `src/components/visual-editor/renderers/zone-renderer.tsx` (add all imports to BLOCK_COMPONENTS map)

**Approach:** Each block renderer is a standalone React component. Props come from `block.props`. Keep them simple — they render content, not editor UI. Build them in batches of 4-5, test the build after each batch, commit after each batch.

**Batch 1:** video, icon, divider, cta, social-links
**Batch 2:** accordion, tabs, card, columns
**Batch 3:** gallery, carousel, audio, stats, pricing
**Batch 4:** comparison, chart, form, newsletter
**Batch 5:** code, embed, map, calendar

After each batch, update `BLOCK_COMPONENTS` in `zone-renderer.tsx` and run `npm run build` to verify.

**Step (final): Commit all blocks**

```bash
git add src/components/visual-editor/renderers/blocks/ src/components/visual-editor/renderers/zone-renderer.tsx
git commit -m "feat: implement all 24 block renderers"
```

---

### Task 2.2: Block Inserter Panel

**Files:**
- Create: `src/components/visual-editor/inserters/block-inserter.tsx`
- Create: `src/lib/visual-editor/block-registry.ts`

**Step 1: Create block registry with categories and defaults**

This defines all 24 block types with their icons, categories, and default props.

```typescript
// src/lib/visual-editor/block-registry.ts
import type { BlockType, EditorBlock } from "./types"
import { createBlock } from "./defaults"

export interface BlockDefinition {
  type: BlockType
  label: string
  icon: string  // lucide icon name
  category: "essentials" | "layout" | "media" | "data" | "forms" | "embed"
  defaultProps: Record<string, unknown>
  defaultColSpan: number
}

export const VISUAL_BLOCK_DEFINITIONS: BlockDefinition[] = [
  // Essentials
  { type: "text", label: "Text", icon: "Type", category: "essentials", defaultProps: { content: "<p>Click to edit text...</p>" }, defaultColSpan: 12 },
  { type: "image", label: "Image", icon: "Image", category: "essentials", defaultProps: { src: "", alt: "" }, defaultColSpan: 12 },
  { type: "button", label: "Button", icon: "RectangleHorizontal", category: "essentials", defaultProps: { label: "Button", url: "#", variant: "filled", align: "left" }, defaultColSpan: 4 },
  { type: "video", label: "Video", icon: "Play", category: "essentials", defaultProps: { url: "", caption: "" }, defaultColSpan: 12 },
  { type: "icon", label: "Icon", icon: "Smile", category: "essentials", defaultProps: { icon: "Star", size: 32, color: "currentColor" }, defaultColSpan: 2 },

  // Layout
  { type: "columns", label: "Columns", icon: "Columns", category: "layout", defaultProps: { columns: 2 }, defaultColSpan: 12 },
  { type: "card", label: "Card", icon: "Square", category: "layout", defaultProps: { title: "Card Title", body: "Card content goes here.", image: "" }, defaultColSpan: 6 },
  { type: "accordion", label: "Accordion", icon: "ChevronDown", category: "layout", defaultProps: { items: [{ question: "Question?", answer: "Answer." }] }, defaultColSpan: 12 },
  { type: "tabs", label: "Tabs", icon: "LayoutList", category: "layout", defaultProps: { tabs: [{ label: "Tab 1", content: "Content" }] }, defaultColSpan: 12 },
  { type: "divider", label: "Divider", icon: "Minus", category: "layout", defaultProps: { style: "line", color: "#e5e7eb" }, defaultColSpan: 12 },
  { type: "spacer", label: "Spacer", icon: "MoveVertical", category: "layout", defaultProps: { height: 40 }, defaultColSpan: 12 },

  // Media
  { type: "gallery", label: "Gallery", icon: "LayoutGrid", category: "media", defaultProps: { images: [], columns: 3 }, defaultColSpan: 12 },
  { type: "image-carousel", label: "Carousel", icon: "GalleryHorizontal", category: "media", defaultProps: { images: [] }, defaultColSpan: 12 },
  { type: "video-embed", label: "Video Embed", icon: "MonitorPlay", category: "media", defaultProps: { url: "", provider: "" }, defaultColSpan: 12 },
  { type: "audio", label: "Audio", icon: "Music", category: "media", defaultProps: { url: "", title: "" }, defaultColSpan: 12 },

  // Data
  { type: "stats-row", label: "Stats", icon: "BarChart3", category: "data", defaultProps: { stats: [{ value: "100", label: "Stat" }] }, defaultColSpan: 12 },
  { type: "pricing-card", label: "Pricing", icon: "CreditCard", category: "data", defaultProps: { name: "Plan", price: "$19", period: "/month", features: ["Feature 1"], cta: "Get Started" }, defaultColSpan: 4 },
  { type: "comparison-table", label: "Comparison", icon: "Table2", category: "data", defaultProps: { columns: ["Feature", "Basic", "Pro"], rows: [] }, defaultColSpan: 12 },
  { type: "chart", label: "Chart", icon: "TrendingUp", category: "data", defaultProps: { type: "bar", data: [] }, defaultColSpan: 12 },

  // Forms & Actions
  { type: "form", label: "Form", icon: "FileText", category: "forms", defaultProps: { fields: [{ label: "Email", type: "email", required: true }], submitLabel: "Submit" }, defaultColSpan: 8 },
  { type: "newsletter-signup", label: "Newsletter", icon: "Mail", category: "forms", defaultProps: { heading: "Stay Updated", placeholder: "Enter your email", buttonLabel: "Subscribe" }, defaultColSpan: 8 },
  { type: "cta-banner", label: "CTA Banner", icon: "Megaphone", category: "forms", defaultProps: { headline: "Ready to get started?", subtext: "", buttonLabel: "Get Started", buttonUrl: "#" }, defaultColSpan: 12 },
  { type: "social-links", label: "Social Links", icon: "Share2", category: "forms", defaultProps: { links: [] }, defaultColSpan: 6 },

  // Embed
  { type: "code", label: "Code", icon: "Code", category: "embed", defaultProps: { html: "" }, defaultColSpan: 12 },
  { type: "embed", label: "Embed", icon: "ExternalLink", category: "embed", defaultProps: { url: "", html: "" }, defaultColSpan: 12 },
  { type: "map", label: "Map", icon: "MapPin", category: "embed", defaultProps: { address: "", zoom: 14 }, defaultColSpan: 12 },
  { type: "calendar", label: "Calendar", icon: "Calendar", category: "embed", defaultProps: { url: "" }, defaultColSpan: 12 },
]

export const VISUAL_BLOCK_REGISTRY = new Map(VISUAL_BLOCK_DEFINITIONS.map(d => [d.type, d]))

export function createBlockFromDefinition(type: BlockType): EditorBlock {
  const def = VISUAL_BLOCK_REGISTRY.get(type)
  if (!def) throw new Error(`Unknown block type: ${type}`)
  return createBlock(type, { ...def.defaultProps }, def.defaultColSpan)
}
```

**Step 2: Create block-inserter.tsx**

The block inserter is a panel that shows all block types organized by category. It appears when the user clicks "+" inside a content zone or when `activePanel === "block-inserter"`.

```typescript
// src/components/visual-editor/inserters/block-inserter.tsx
"use client"

import { useState, useMemo } from "react"
import { useEditorStore } from "@/lib/visual-editor/editor-store"
import { VISUAL_BLOCK_DEFINITIONS, createBlockFromDefinition } from "@/lib/visual-editor/block-registry"
import { X, Search } from "lucide-react"
import * as Icons from "lucide-react"
import type { BlockType } from "@/lib/visual-editor/types"

const CATEGORY_LABELS: Record<string, string> = {
  essentials: "Essentials",
  layout: "Layout",
  media: "Media",
  data: "Data",
  forms: "Forms & Actions",
  embed: "Embed",
}

interface BlockInserterProps {
  targetSectionId: string
  targetZoneId: string
  onClose: () => void
}

export function BlockInserter({ targetSectionId, targetZoneId, onClose }: BlockInserterProps) {
  const [search, setSearch] = useState("")
  const { addBlock } = useEditorStore()

  const filtered = useMemo(() => {
    if (!search) return VISUAL_BLOCK_DEFINITIONS
    const q = search.toLowerCase()
    return VISUAL_BLOCK_DEFINITIONS.filter(d =>
      d.label.toLowerCase().includes(q) || d.category.includes(q)
    )
  }, [search])

  const grouped = useMemo(() => {
    const groups: Record<string, typeof filtered> = {}
    for (const def of filtered) {
      if (!groups[def.category]) groups[def.category] = []
      groups[def.category].push(def)
    }
    return groups
  }, [filtered])

  function handleInsert(type: BlockType) {
    const block = createBlockFromDefinition(type)
    addBlock(targetSectionId, targetZoneId, block)
    onClose()
  }

  return (
    <div className="w-72 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-900">Add Block</h3>
        <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
          <X size={16} />
        </button>
      </div>

      {/* Search */}
      <div className="px-3 py-2">
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search blocks..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400"
            autoFocus
          />
        </div>
      </div>

      {/* Block list */}
      <div className="max-h-80 overflow-y-auto px-3 pb-3">
        {Object.entries(grouped).map(([category, defs]) => (
          <div key={category} className="mb-3">
            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5 px-1">
              {CATEGORY_LABELS[category] ?? category}
            </h4>
            <div className="grid grid-cols-2 gap-1.5">
              {defs.map(def => {
                const Icon = (Icons as Record<string, React.ComponentType<{ size?: number }>>)[def.icon] ?? Icons.Box
                return (
                  <button
                    key={def.type}
                    onClick={() => handleInsert(def.type)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-left"
                  >
                    <Icon size={16} />
                    <span>{def.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

**Step 3: Commit**

```bash
git add src/lib/visual-editor/block-registry.ts src/components/visual-editor/inserters/block-inserter.tsx
git commit -m "feat: block registry with 24 types and categorized inserter panel"
```

---

### Task 2.3: Property Panel (Content / Style / Advanced Tabs)

**Files:**
- Create: `src/components/visual-editor/panels/property-panel.tsx`
- Create: `src/components/visual-editor/panels/content-tab.tsx`
- Create: `src/components/visual-editor/panels/style-tab.tsx`
- Create: `src/components/visual-editor/panels/advanced-tab.tsx`

**Approach:** The property panel is a floating right-side panel that appears when a block is selected. It has three tabs. The Content tab renders different fields per block type (text fields, image uploader, color pickers, etc.). The Style tab is universal across all blocks (spacing, background, border, shadow, opacity, animation). The Advanced tab has CSS class, ID, visibility toggles.

Build the panel shell first, then implement each tab. The Content tab should reuse your existing `FieldRenderer` component patterns from `src/components/admin/field-renderer.tsx` — but adapted for the new block props format.

The Style tab uses visual controls: a box-model editor for margin/padding, a slider for column span, color pickers for background/border, and dropdown selects for shadow/animation.

Keep each tab under ~200 lines. If a tab gets too large, extract sub-components.

**Step (after building all 3 tabs): Commit**

```bash
git add src/components/visual-editor/panels/
git commit -m "feat: property panel with content, style, and advanced tabs"
```

---

### Task 2.4: Section Property Panel

**Files:**
- Create: `src/components/visual-editor/panels/section-panel.tsx`

**Approach:** When a section (not a block) is selected, this panel appears instead of the block property panel. It has Layout, Style, and Advanced tabs.

- **Layout tab:** Column count buttons (1-4), column ratio presets, content width toggle, vertical align buttons, gap slider
- **Style tab:** Background type selector (none/color/gradient/image/video) with sub-controls, padding sliders, edge divider picker
- **Advanced tab:** Responsive overrides, animation, custom CSS class

**Step: Commit**

```bash
git add src/components/visual-editor/panels/section-panel.tsx
git commit -m "feat: section property panel with layout, style, and advanced controls"
```

---

### Task 2.5: Integrate Panels into Visual Editor

**Files:**
- Modify: `src/components/visual-editor/visual-editor.tsx`

**Step 1: Import and render property panels based on selection state**

Add conditional rendering of `PropertyPanel` (for blocks) or `SectionPanel` (for sections) when `activePanel === "properties"`. Also render `BlockInserter` when `activePanel === "block-inserter"`.

Position the panels as absolute/fixed elements on the right side of the viewport, outside the iframe.

**Step 2: Test by selecting blocks/sections in the canvas**

Verify panels appear and disappear correctly, and that editing props updates the canvas in real-time via the postMessage bridge.

**Step 3: Commit**

```bash
git add src/components/visual-editor/visual-editor.tsx
git commit -m "feat: integrate property panels and block inserter into editor shell"
```

---

### Task 2.6: Inline Text Editing (TipTap in Iframe)

**Files:**
- Modify: `src/components/visual-editor/canvas/editor-runtime.tsx`
- Modify: `src/components/visual-editor/renderers/blocks/text-block.tsx`
- Create: `src/components/visual-editor/canvas/inline-editor.tsx`
- Create: `src/components/visual-editor/canvas/floating-toolbar.tsx`

**Approach:** When the user double-clicks a text block inside the iframe canvas, TipTap activates inline on that block. The text block switches from rendering `dangerouslySetInnerHTML` to rendering a TipTap editor instance. A floating formatting toolbar appears above the text.

The editor runtime detects double-clicks on `[data-block-type="text"]` elements and sends an `INLINE_EDIT_STARTED` message. The text block component checks if it's currently being inline-edited and switches to editor mode.

The floating toolbar is a stripped-down version of your existing `tiptap-toolbar.tsx` — just the essentials: heading level, bold, italic, link, alignment, color.

**Key implementation details:**
- The TipTap editor instance runs inside the iframe (same imports as your existing editor)
- On blur or Escape, inline editing ends and changes are sent to the parent via `CONTENT_CHANGED`
- The parent store updates the block's `props.content` with the new TipTap JSON

**Step: Commit**

```bash
git add src/components/visual-editor/canvas/ src/components/visual-editor/renderers/blocks/text-block.tsx
git commit -m "feat: inline text editing with TipTap and floating toolbar in canvas"
```

---

### Task 2.7: Drag and Drop (Sections + Blocks)

**Files:**
- Modify: `src/components/visual-editor/canvas/editor-runtime.tsx`
- Modify: `src/components/visual-editor/visual-editor.tsx`

**Approach:** Use `@dnd-kit` (already installed) for drag-and-drop. Two scopes:

1. **Section reordering**: Drag a section by its handle to reorder vertically. This happens in the parent frame — the canvas just shows the current order.

2. **Block reordering within zones**: Drag a block within a content zone to a new grid position. This also happens in the parent frame with visual feedback in the canvas.

The drag interaction starts in the canvas (user clicks and holds a handle), sends `DRAG_STARTED` to the parent, and the parent manages the DnD state. Drop zones are visualized in the canvas via `DROP_ZONE` messages from parent to canvas.

For MVP, focus on **section reordering only**. Block reordering within zones can come in Phase 3 (it's more complex due to grid positioning).

**Step: Commit**

```bash
git add src/components/visual-editor/canvas/editor-runtime.tsx src/components/visual-editor/visual-editor.tsx
git commit -m "feat: drag-and-drop section reordering"
```

---

## Phase 3: Section Templates & Polish

### Task 3.1: Section Template Library

**Files:**
- Create: `src/lib/visual-editor/section-templates/`
- Create template definitions for each category (one file per category)
- Create: `src/lib/visual-editor/section-templates/index.ts`
- Create: `src/lib/visual-editor/seed-templates.ts`

**Approach:** Define built-in section templates as TypeScript objects. Each template is a complete `Section` with placeholder content that looks good immediately. Organize by category:

- `introduce.ts` — Hero (3 variants), About, Mission, Team, Founder Story
- `programs.ts` — Overview, How It Works, Pilot, Student Journey
- `proof.ts` — Testimonials, Stats, Case Study, Logo Wall
- `engage.ts` — CTA Banner, Waitlist, Demo Request, Newsletter, Contact
- `resources.ts` — Blog Feed, Resource Grid, FAQ, Video Showcase
- `events.ts` — Event Cards, Timeline, Schedule
- `showcase.ts` — Gallery Grid, Video Gallery, Portfolio, Logo Wall

Each template file exports an array of `SectionTemplate` objects. The seed script writes them to Firestore on first run.

**Step: Commit**

```bash
git add src/lib/visual-editor/section-templates/
git commit -m "feat: built-in section templates for all 7 categories"
```

---

### Task 3.2: Section Inserter Panel

**Files:**
- Create: `src/components/visual-editor/inserters/section-inserter.tsx`

**Approach:** A slide-in panel from the right (like Squarespace's "Add a Section"). Left column has category navigation, right area shows template thumbnails. Clicking a template inserts it at the target position.

The panel loads templates from the `section-templates` registry (built-in) and Firestore (user-created). Templates are displayed as preview cards with the section name and a miniature visual.

For MVP, thumbnails can be simple styled cards with the template name and a schematic layout preview (CSS-only, no actual rendering). Later, these can be upgraded to live-rendered mini-iframes or pre-captured screenshots.

**Step: Commit**

```bash
git add src/components/visual-editor/inserters/section-inserter.tsx
git commit -m "feat: section inserter panel with category navigation and template browser"
```

---

### Task 3.3: Global Styles Panel

**Files:**
- Create: `src/components/visual-editor/panels/global-styles-panel.tsx`

**Approach:** A panel accessible from the top bar paintbrush icon. Controls site-wide design tokens: typography (heading/body font picker, size scale), colors (6 semantic color pickers), button defaults, spacing defaults.

Changes save to Firestore `config/styles` and are applied to the canvas iframe in real-time by injecting CSS custom property overrides.

**Step: Commit**

```bash
git add src/components/visual-editor/panels/global-styles-panel.tsx
git commit -m "feat: global styles panel with typography, colors, and spacing controls"
```

---

### Task 3.4: Asset Library

**Files:**
- Create: `src/components/visual-editor/panels/asset-library.tsx`
- Create: `src/lib/visual-editor/asset-firestore.ts`

**Approach:** A panel/modal for managing uploaded media. Supports upload (to Firebase Storage), browse existing assets, search/filter by type and tags. When selecting an asset for an image block, the asset library opens instead of a raw file upload.

Reuse your existing Firebase Storage upload logic from `src/components/admin/media-dialog.tsx`.

**Step: Commit**

```bash
git add src/components/visual-editor/panels/asset-library.tsx src/lib/visual-editor/asset-firestore.ts
git commit -m "feat: centralized asset library with upload, browse, and search"
```

---

### Task 3.5: Migration Layer & Frontend Renderer Updates

**Files:**
- Modify: `src/lib/visual-editor/migration.ts` (refine mapping)
- Create: `src/components/page-renderer.tsx` (public-facing page renderer that supports both formats)
- Modify: `src/app/[slug]/page.tsx` (or wherever pages are rendered publicly)

**Approach:** The public page renderer needs to check if a page has `publishedSections` (new format) or `publishedBlocks` (old format) and render accordingly. For old format, use existing block renderers. For new format, use the shared `SectionRenderer` + `ZoneRenderer`.

**Step: Commit**

```bash
git add src/lib/visual-editor/migration.ts src/components/page-renderer.tsx
git commit -m "feat: dual-format page renderer supporting old blocks and new sections"
```

---

## Phase 4: Mobile

### Task 4.1: Touch Gesture System

**Files:**
- Create: `src/components/visual-editor/hooks/use-touch-gestures.ts`
- Modify: `src/components/visual-editor/canvas/editor-runtime.tsx`

**Approach:** Use `@use-gesture/react` for pinch (resize), long-press (drag), and multi-finger taps (undo/redo). Implement the section-first selection drill-down: first tap selects section, second tap within it selects block, double-tap on text activates inline editing.

---

### Task 4.2: Mobile Property Sheet (Bottom Sheet)

**Files:**
- Create: `src/components/visual-editor/panels/property-sheet.tsx`

**Approach:** Use `vaul` (Drawer component) to create a bottom sheet with the same three-tab structure. Three snap points: Peek (30%), Half (50%), Full (85%). Detect mobile viewport and render this instead of the floating right panel.

---

### Task 4.3: Mobile Inserters (Bottom Sheet)

**Files:**
- Create: `src/components/visual-editor/inserters/section-inserter-mobile.tsx`
- Create: `src/components/visual-editor/inserters/block-inserter-mobile.tsx`

**Approach:** Full-screen bottom sheets with horizontal-scroll template thumbnails per category. Search bar at top.

---

### Task 4.4: Mobile Management Mode

**Files:**
- Modify: `src/app/admin/page.tsx` or create mobile-specific layout
- Create: `src/components/visual-editor/shell/mobile-nav.tsx`

**Approach:** Bottom tab navigation (Pages, Posts, Assets, Settings) on mobile viewports. Pages displayed as preview cards with EDIT buttons. Detect viewport width and swap between sidebar (desktop) and bottom tabs (mobile).

---

### Task 4.5: Tablet Hybrid

**Approach:** Use CSS media queries to detect tablet width (768-1024px). Keep desktop layout but use touch interaction patterns from mobile. Property panel stays as right-side panel (there's room), selection uses tap instead of hover.

---

**Commit after each task in Phase 4.**

---

## Phase 5: Advanced Features

### Task 5.1: Responsive Overrides per Block/Section
### Task 5.2: Animation Controls
### Task 5.3: Version History Browser
### Task 5.4: Full Keyboard Shortcuts (beyond Cmd+Z/S)
### Task 5.5: Copy/Paste Blocks and Sections
### Task 5.6: Multi-Select (Shift+Click)

Each of these is a self-contained feature. Build them in order, commit after each.

---

## Index File

**Create:** `src/lib/visual-editor/index.ts`

```typescript
export * from "./types"
export * from "./defaults"
export * from "./helpers"
export * from "./editor-store"
export * from "./message-bridge"
export * from "./block-registry"
export * from "./firestore"
```

---

## Testing Strategy

This project is heavily UI-driven. The primary testing approach is:

1. **Type checking**: `npx tsc --noEmit` after each task
2. **Build verification**: `npm run build` after each task
3. **Manual testing**: Run `npm run dev` and test in the browser
4. **Visual verification**: Check the canvas renders correctly, interactions work, panels open/close, undo/redo functions

For critical logic (helpers, migration, store), write unit tests:
- `src/lib/visual-editor/__tests__/helpers.test.ts`
- `src/lib/visual-editor/__tests__/migration.test.ts`
- `src/lib/visual-editor/__tests__/editor-store.test.ts`

---

## File Count Summary

| Category | Files | Notes |
|----------|-------|-------|
| Types & logic | 8 | types, defaults, helpers, store, bridge, registry, firestore, migration |
| Renderers | 26 | section + zone + 24 blocks |
| Canvas (iframe) | 6 | runtime, overlays, inline editor, toolbar, action bar, drag ghost |
| Shell | 3 | top bar, viewport frame, exit transition |
| Panels | 7 | property panel, property sheet, content/style/advanced tabs, section panel, global styles |
| Inserters | 5 | section + block inserter (desktop + mobile) + thumbnail |
| Hooks | 7 | state, messages, auto-save, undo, viewport, touch, keyboard |
| Routes | 2 | canvas page + layout |
| Templates | 8 | 7 category files + index |
| **Total** | **~72** | |
