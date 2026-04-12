# Visual Editor Design Document

**Date:** 2026-04-12
**Status:** Approved
**Approach:** Hybrid Iframe Canvas (Approach C)

## Overview

A ground-up rebuild of the Diagonally admin page editor into a Squarespace-class visual editor. The current form-based block editor is replaced with a true WYSIWYG canvas where users edit pages as they appear to visitors. Designed for a team of non-technical users.

## Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Editor paradigm | True WYSIWYG with contextual panels | Non-technical users need to see what they're building |
| Canvas architecture | Iframe sandbox | CSS isolation, real page rendering, responsive preview via iframe resize |
| Layout model | Structured sections with flexible content zones | Prevents messy layouts while allowing creative freedom |
| Grid system | 12-column CSS grid within content zones | Blocks snap to grid -- no pixel-level chaos |
| Mobile editing | Purpose-built touch experience | Adapted UI, not shrunk desktop -- bottom sheets, gesture-based |
| Migration | Read-time conversion, dual format support | No big-bang migration, existing pages keep working |

## Architecture: Two-Mode System

### Management Mode

Default admin view. Left sidebar with site navigation, scaled-down live preview on the right.

**Sidebar structure:**
- Website: Pages, Styles, Assets, Navigation
- Blog: Posts, Authors, Templates, Categories
- Settings: General, SEO, Subscribers, Submissions, Team/Roles

The preview pane shows the selected page at ~60% scale in a read-only iframe. A prominent "EDIT" button floats at the top.

### Edit Mode

Clicking EDIT triggers a transition (300ms ease):
1. Sidebar slides out to the left
2. Canvas expands to fill the viewport
3. Minimal top bar fades in: `[SAVE] [EXIT]` left, `[Page name - Status]` center, `[undo/redo] [viewport toggle] [settings/styles/preview]` right
4. Editor runtime activates inside the iframe

EXIT reverses the animation.

**Key behaviors:**
- Auto-save with 3-second debounce after last edit
- Cmd+Z / Cmd+Y for undo/redo (50-step history)
- Cmd+S for manual save
- Escape to deselect
- Viewport toggles (mobile/tablet/desktop) resize iframe with device frame

## Canvas Architecture: The Iframe Sandwich

Three layers:

```
PARENT FRAME (Editor Shell)
  - Top bar, floating toolbars, panels
  - Section/block inserter dialogs
  - Property panels, style controls

  IFRAME (Page Canvas)
    - Real page components render here
    - Editor Runtime injected:
      - Hover overlays (blue outline)
      - Selection handles (corners/edges)
      - Drop zone indicators
      - Inline text editing (TipTap)
      - Section boundary markers
      - "+" insert buttons between sections

OVERLAY LAYER (positioned over iframe)
  - Floating toolbar (appears on selection)
  - Drag ghost elements
  - Resize dimension labels
```

### postMessage Bridge

**Parent -> Iframe:**
- SELECT_ELEMENT, UPDATE_BLOCK_PROPS, INSERT_BLOCK, INSERT_SECTION
- DELETE_ELEMENT, REORDER_ELEMENT, SET_EDIT_MODE, SET_VIEWPORT
- UNDO, REDO

**Iframe -> Parent:**
- ELEMENT_HOVERED, ELEMENT_SELECTED, ELEMENT_DESELECTED
- CONTENT_CHANGED, REQUEST_INSERT, DRAG_STARTED, DRAG_ENDED
- CANVAS_READY, ELEMENT_RESIZED

## Data Model

### Page -> Section -> ContentZone -> Block hierarchy

```typescript
PageDocument {
  slug: string
  title: string
  draftSections: Section[]
  publishedSections: Section[]
  pageStyles?: { backgroundColor?: string; maxWidth?: number; customCSS?: string }
  showInNav: boolean
  navOrder: number
  navLabel: string
  lastEditedBy: string | null
  lastEditedAt: Date | null
  publishedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

Section {
  id: string
  templateId: string
  label: string
  layout: {
    columns: number                    // 1-4
    columnRatio: string                // "equal", "1:2", "2:1", custom
    contentWidth: "contained" | "full"
    maxWidth: number
    verticalAlign: "top" | "center" | "bottom"
    gap: number
  }
  background: {
    type: "none" | "color" | "gradient" | "image" | "video"
    color?: string
    gradient?: { from: string; to: string; angle: number }
    image?: { url: string; focalPoint: { x: number; y: number }; opacity: number }
    video?: { url: string; posterUrl: string }
    overlay?: { color: string; opacity: number }
  }
  spacing: { paddingTop: number; paddingBottom: number; marginTop: number; marginBottom: number }
  divider: { type: "none" | "line" | "wave" | "angle" | "curve"; position: "top" | "bottom" | "both"; color: string }
  animation: { type: "none" | "fade-in" | "slide-up" | "scale-in"; trigger: "on-load" | "on-scroll"; delay: number }
  contentZones: ContentZone[]
  responsive: { tablet?: Partial<SectionOverrides>; mobile?: Partial<SectionOverrides> }
}

ContentZone {
  id: string
  gridColumns: number           // usually 12
  blocks: Block[]
}

Block {
  id: string
  type: BlockType
  position: { col: number; row: number; colSpan: number; rowSpan: number }
  props: Record<string, unknown>
  style: {
    margin?: SpacingValues
    padding?: SpacingValues
    background?: string
    borderRadius?: number
    border?: { width: number; color: string; style: string }
    shadow?: "none" | "sm" | "md" | "lg"
    opacity?: number
    animation?: AnimationConfig
  }
  responsive: {
    tablet?: { position?: Partial<BlockPosition>; style?: Partial<BlockStyle>; hidden?: boolean }
    mobile?: { position?: Partial<BlockPosition>; style?: Partial<BlockStyle>; hidden?: boolean }
  }
}
```

### Block Types (24 total)

**Essentials:** text, image, button, video, icon
**Layout:** columns, card, accordion, tabs, divider, spacer
**Media:** gallery, image-carousel, video-embed, audio
**Data:** stats-row, pricing-card, comparison-table, chart
**Forms & Actions:** form, newsletter-signup, cta-banner, social-links
**Embed:** code, embed, map, calendar

### Global Site Styles (Firestore: config/styles)

```typescript
SiteStyles {
  typography: { headingFont: string; bodyFont: string; scale: { h1-h4, body, small } }
  colors: { primary, secondary, accent, background, text, muted }
  buttons: { borderRadius: number; defaultStyle: "filled" | "outline" | "ghost"; hoverEffect: string }
  spacing: { sectionPadding: number; contentMaxWidth: number; gridGap: number }
}
```

### Asset Library (Firestore: assets/{id})

```typescript
Asset {
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
```

### Section Templates (Firestore: sectionTemplates/{id})

```typescript
SectionTemplate {
  id: string
  category: "introduce" | "programs" | "proof" | "engage" | "resources" | "events" | "showcase"
  name: string
  description: string
  thumbnailUrl: string
  section: Section              // actual section data with placeholder content
  isBuiltIn: boolean
  createdBy?: string
  createdAt: Date
}
```

## Section Template Categories

- **Introduce:** Hero, About Us, Mission/Vision, Team, Founder Story
- **Programs:** Course overview, Pilot details, How it works, Student journey
- **Proof:** Testimonials, Pilot results/stats, Case studies, School logos
- **Engage:** CTA banner, Waitlist signup, Request demo, Newsletter, Contact form
- **Resources:** Blog feed, Resource library, FAQ, Video showcase
- **Events:** Event card, Calendar, Schedule/timeline
- **Showcase:** Image gallery, Video gallery, Portfolio grid, Logo wall

## Canvas Interaction Model

### Desktop

- **Hover** any block: subtle blue outline (2px, semi-transparent)
- **Hover** section boundary: section label appears with background tint
- **Click** block: solid blue border + 8 resize handles + floating action bar (Edit, Duplicate, Link, Responsive, Delete)
- **Click** section background: section selected with dashed border + section controls
- **Double-click** text: TipTap activates inline, floating formatting toolbar appears
- **Click outside**: deselect
- **"+" between sections**: expands into "Add Section" / "Add Block" options
- **Drag** block handle: block lifts with shadow, blue drop zones appear
- **Resize handles**: change column span (snaps to grid)

### Mobile (Touch)

Section-first selection with drill-down:
1. **First tap**: selects the section, bottom sheet action bar appears
2. **Second tap** on specific block: selects that block, bottom sheet updates
3. **Double-tap** text block: inline editing, formatting toolbar above keyboard

| Gesture | Action |
|---------|--------|
| Tap section | Select section |
| Tap block (within selected section) | Select block |
| Double-tap text | Inline edit |
| Long-press block | Pick up for drag-reorder |
| Pinch on selected block | Resize |
| Two-finger tap | Undo |
| Three-finger tap | Redo |
| Pinch canvas (outside blocks) | Zoom |
| Swipe bottom sheet down | Dismiss panel |

### Mobile Management Mode

Bottom-tab navigation: Pages, Posts, Assets, Settings. Pages shown as preview cards with EDIT buttons.

### Mobile Edit Mode

- Simplified top bar: Exit, page name, Save
- Bottom sheet property panel (Content/Style/Advanced) with three snap points: Peek (30%), Half (50%), Full (85%)
- Full-screen bottom sheet for section/block inserters with horizontal-scroll template thumbnails per category

### Tablet

Desktop layout with touch-adapted interaction (tap instead of hover, but side panels instead of bottom sheets).

## Property Panel System

### Block Property Panel (floating right panel on desktop, bottom sheet on mobile)

Three tabs for every block type:

**Content tab** -- block-specific content fields (image upload, button label, stat values, etc.). Text blocks have no content tab since you edit inline.

**Style tab** -- universal across all blocks:
- Size: column span slider (1-12), height (auto/fixed/min)
- Spacing: visual box model editor for margin + padding
- Background, border, border-radius, shadow, opacity
- Animation type + trigger

**Advanced tab** -- power-user controls (collapsed by default):
- Custom CSS class, element ID
- Visibility conditions (hide on mobile/desktop)
- Responsive overrides per breakpoint
- HTML attributes

### Section Property Panel

**Layout tab:** columns (1-4), column ratio presets, content width, vertical align, gap
**Style tab:** background (color/gradient/image/video + overlay), padding, edge divider
**Advanced tab:** responsive overrides, animation, custom class

### Global Styles Panel

Accessible from top bar paintbrush icon or Management Mode "Styles" nav. Controls site-wide tokens: typography (fonts + scale), colors (6 semantic tokens), button defaults, spacing defaults. Changes ripple across all pages in real-time.

## Migration Strategy

Read-time migration with gradual conversion:
- Loading a page checks for `draftSections` (new) vs `draftBlocks` (old)
- Old format auto-converts: each old block becomes its own single-block section
- Frontend renderer supports both formats during transition
- Old published pages keep rendering until re-published through new editor
- No big-bang migration required

## Technical Stack

| Purpose | Library |
|---------|---------|
| Drag & drop | @dnd-kit/core + @dnd-kit/sortable (existing) |
| Inline rich text | @tiptap/react (existing) |
| postMessage bridge | Custom typed wrapper (~100 lines) |
| Mobile gestures | use-gesture |
| Bottom sheets | vaul |
| State management | zustand with history middleware |
| Canvas zoom/pan | Custom CSS transforms |
| Color picker | Existing implementation |

## Component Architecture

```
components/visual-editor/
  visual-editor.tsx              -- orchestrator
  editor-store.ts                -- zustand store
  message-bridge.ts              -- typed postMessage protocol

  shell/
    editor-top-bar.tsx
    viewport-frame.tsx
    exit-transition.tsx

  panels/
    property-panel.tsx           -- desktop floating panel
    property-sheet.tsx           -- mobile bottom sheet
    content-tab.tsx
    style-tab.tsx
    advanced-tab.tsx
    section-panel.tsx
    global-styles-panel.tsx

  inserters/
    section-inserter.tsx
    section-inserter-mobile.tsx
    block-inserter.tsx
    block-inserter-mobile.tsx
    template-thumbnail.tsx

  canvas/ (runs inside iframe)
    editor-runtime.tsx
    hover-overlay.tsx
    selection-overlay.tsx
    drop-indicators.tsx
    insert-points.tsx
    section-label.tsx
    inline-editor.tsx
    floating-toolbar.tsx
    block-action-bar.tsx
    drag-ghost.tsx

  renderers/ (shared with public site)
    section-renderer.tsx
    zone-renderer.tsx
    blocks/ (24 block components)

  hooks/
    use-editor-state.ts
    use-canvas-messages.ts
    use-auto-save.ts
    use-undo-redo.ts
    use-viewport.ts
    use-touch-gestures.ts
    use-keyboard-shortcuts.ts
```

Canvas iframe loads: `app/admin/canvas/[slug]/page.tsx`

## Build Phases

**Phase 1 -- Foundation**
- New data model types
- Zustand editor store with undo/redo
- postMessage bridge
- Iframe canvas route with editor runtime
- Section renderer + zone renderer (shared)
- Basic hover + selection overlays
- Editor top bar (Save, Exit, viewport toggle)
- Management mode <-> Edit mode transition

**Phase 2 -- Core Editing**
- Block renderers (all 24 block types)
- Inline text editing (TipTap in iframe)
- Floating toolbar for text formatting
- Property panel (Content/Style/Advanced tabs)
- Section property panel
- Block inserter (categorized palette)
- Drag-and-drop reorder (sections + blocks within zones)

**Phase 3 -- Section Templates & Polish**
- Section template library (all categories seeded)
- Section inserter panel with visual thumbnails
- "Save as template" for custom sections
- Global styles panel
- Asset library (centralized media management)
- Migration layer (old Block[] -> new Section[])
- Frontend renderer updates (support both formats)

**Phase 4 -- Mobile**
- Touch gesture system (tap/double-tap/long-press/pinch)
- Bottom sheet property panel
- Bottom sheet section/block inserters
- Mobile management mode (bottom tab nav)
- Tablet hybrid layout
- Touch-optimized resize handles + drag

**Phase 5 -- Advanced**
- Responsive overrides per block/section
- Animation controls
- Version history browser (visual diff)
- Keyboard shortcuts
- Copy/paste blocks and sections
- Multi-select (Shift+click)
