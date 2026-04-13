# Editor UX Improvements: Empty State & Section Drag Reordering

**Date:** 2026-04-13
**Status:** Approved

## Problem

The editor canvas shows a plain text message when empty with no clear way to add content. Sections can't be reordered by dragging — users must use the section list panel.

## Design

### 1. Better Empty State

- Large centered CTA: "+ Add Your First Section" button with heading font and subtle icon
- Double-clicking empty canvas opens the section inserter
- When sections exist, double-clicking empty space below sections also inserts at that position

### 2. Section Drag Handles

- Grip icon (⋮⋮) appears at top-left of section overlay on hover
- Click-and-drag to reorder sections vertically
- Drop indicator line shows between sections during drag
- Uses existing `reorderSections(fromIndex, toIndex)` store action
- Sends reorder via message bridge to parent

### 3. Published Page Rendering

Already handled — published pages use the same `SectionRenderer` component, so all theme/grid/divider fixes apply automatically.
