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
export type PanelType = "properties" | "section-inserter" | "block-inserter" | "global-styles" | "section-list" | "version-history" | null
export type PropertyTab = "content" | "style" | "advanced"
