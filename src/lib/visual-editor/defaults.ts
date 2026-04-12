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
