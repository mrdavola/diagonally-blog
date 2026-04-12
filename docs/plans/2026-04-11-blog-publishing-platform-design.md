# Blog Publishing Platform Design

**Date:** 2026-04-11
**Status:** Approved

## Overview

Rebuild Diagonally's blog system from a basic 8-block plain-text editor into a full publishing platform with Substack-quality editing, scheduling, email distribution, and analytics.

## Architecture

Four layers:
1. **Tiptap Rich Editor** — 18 block types, slash commands, bubble toolbar, autosave
2. **Publishing Pipeline** — scheduling, revision history, templates, SEO, draft preview
3. **Distribution** — email newsletters via Loops, RSS
4. **Analytics** — per-post view counts, read time, author dashboards

## Decisions

- **Editor engine:** Tiptap (same as Substack, ProseMirror-based)
- **Email provider:** Loops (subscriber management + campaigns)
- **Comments:** Deferred to future phase
- **Analytics:** Basic Firestore counters (views, unique visitors, read time)

## Editor Block Types (18)

| Block | Description |
|-------|-------------|
| Paragraph | Rich text with inline formatting |
| Heading (H2/H3/H4) | Hierarchical headings |
| Image | Upload + URL, caption, alt text, alignment |
| Blockquote | Styled quote with attribution |
| Callout | Colored info/warning/tip boxes with icon |
| Bullet list | Unordered list |
| Ordered list | Numbered list |
| Task list | Checkboxes |
| Code block | Syntax-highlighted with language selector |
| Table | Rows/columns with header row |
| Divider | Horizontal rule |
| Embed | YouTube, Twitter, Vimeo via URL |
| Footnote | Superscript markers, collected at bottom |
| Math/LaTeX | Block and inline math via KaTeX |
| Button/CTA | Linked button for calls to action |
| Columns | 2-3 column layouts |
| Toggle/Accordion | Collapsible sections |
| Audio | Upload audio, inline player |

## Inline Formatting

Bold, italic, strikethrough, underline, inline code, links, superscript/subscript

## Editor UX

- Slash command menu (`/` to insert blocks)
- Bubble toolbar on text selection
- Drag handle for block reordering
- Autosave every 10 seconds
- Live word count and estimated read time
- Full-width or contained layout toggle

## Data Model

```typescript
interface PostDocument {
  slug: string
  title: string
  subtitle: string
  excerpt: string
  coverImage: string
  coverImageFocalPoint?: { x: number; y: number }
  authorIds: string[]
  category: string
  tags: string[]
  draftContent: TiptapJSON
  publishedContent: TiptapJSON | null
  metaTitle?: string
  metaDescription?: string
  ogImage?: string
  canonicalUrl?: string
  status: "draft" | "scheduled" | "published"
  scheduledAt?: Date
  publishedAt: Date | null
  createdAt: Date
  updatedAt: Date
  wordCount: number
  readTimeMinutes: number
  templateId?: string
}
```

## Dependencies

- `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-*`
- `lowlight` (syntax highlighting)
- `katex` (LaTeX)
- `loops` (email)

## Implementation Phases

1. Editor Foundation (~2 sessions)
2. Fix Public View (~1 session)
3. Publishing Pipeline (~2 sessions)
4. Distribution (~1 session)
5. Analytics & Dashboard (~1 session)
