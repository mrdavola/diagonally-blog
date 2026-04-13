# Editor Theming & Background Presets

**Date:** 2026-04-13
**Status:** Approved

## Problem

The visual editor canvas doesn't match the frontend site. Blocks use hardcoded colors, fonts aren't applied, and the dark space-deep hero background (with constellation animation) isn't available as a section option.

## Design

### 1. Background Presets

Add `"preset"` as a new `SectionBackground.type`. When selected, a `presetId` field specifies which preset:

| Preset ID | Renders | Text color |
|-----------|---------|------------|
| `space-deep` | `bg-space-deep` + Constellation canvas animation | light (white) |
| `space-mid` | `bg-space-mid` | light |
| `cream` | `bg-cream` | dark |

Section panel Style tab gets a 5th radio: `None | Color | Gradient | Image | Preset`, with a dropdown for preset selection.

Section-renderer renders the Constellation component when `presetId === "space-deep"`.

### 2. Divider Rendering

Render the existing divider types (wave, angle, curve, line) as SVGs in the section-renderer. Wave uses the existing WaveDivider component pattern. Colors auto-detect based on section background.

### 3. Canvas Theme Application

The canvas iframe loads and applies `SiteStyles` from Firestore:

1. Parent sends `SYNC_STYLES` message to canvas with current SiteStyles
2. Canvas injects CSS variables onto root element
3. Canvas dynamically loads Google Fonts via `<link>` tag
4. Blocks read from CSS variables instead of hardcoded values

### 4. Default Theme

`defaultSiteStyles()` (Bricolage Grotesque, Nunito, oklch color palette) is the factory default. Every new page/section inherits these automatically. The Global Styles panel changes the defaults but shouldn't need to be touched for the site to look correct.

## Out of Scope

- Custom preset creation
- Per-section theme overrides
- Font upload (Google Fonts only)
- Dark mode toggle in editor
