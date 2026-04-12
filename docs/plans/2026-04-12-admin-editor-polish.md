# Admin Editor Polish Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Polish the admin blog editor to feel Substack-quality — warm, writerly, editorial. Fix spacing, typography, interactions, and visual hierarchy so the writing experience feels crafted, not generated.

**Architecture:** Design-focused refactor of existing admin editor components. No new features — pure visual/UX polish of toolbar, editor area, sidebar, metadata panels, and overall layout. Guided by `.impeccable.md` design context: "Substack-like: editorial, warm, writerly."

**Tech Stack:** Tailwind CSS v4, Tiptap, shadcn/ui, Lucide icons, Bricolage Grotesque (display), Nunito (body)

**Design Reference:** `.impeccable.md` — content is the hero, warm dark (not cold dark), progressive disclosure, typography creates structure, Substack-quality polish.

---

## Task 1: Warm Up the Dark Theme — Editor CSS

The current editor uses cold, flat dark surfaces (`bg-space-mid`, `bg-space-deep`) with harsh `white/10` borders. Substack's dark editor feels warmer and more inviting.

**Files:**
- Modify: `src/styles/tiptap-editor.css`
- Modify: `src/app/globals.css`

**Step 1: Add warm admin surface tokens to globals.css**

At the end of the `@theme inline` block (after the existing Diagonally tokens), add admin-specific surface tokens:

```css
/* Admin surfaces — warmer than pure space-deep */
--color-admin-surface: oklch(0.155 0.008 260);    /* slightly warmer than space-deep */
--color-admin-surface-raised: oklch(0.185 0.01 260);  /* cards, panels */
--color-admin-surface-overlay: oklch(0.21 0.012 260);  /* dropdowns, popovers */
--color-admin-border: oklch(1 0 0 / 8%);          /* softer than white/10 */
--color-admin-border-subtle: oklch(1 0 0 / 5%);   /* barely-there dividers */
```

**Step 2: Restyle the Tiptap editor CSS for a writerly feel**

Rewrite `src/styles/tiptap-editor.css`:

Key changes:
- Editor body text: increase line-height to 1.85 (light-on-dark needs more breathing room)
- Headings: use `font-family: var(--font-display)` explicitly, increase spacing above headings for better rhythm (h2: `margin-top: 2.5rem`, h3: `margin-top: 2rem`)
- Paragraphs: increase bottom margin to `1rem` for more generous spacing
- Blockquote: reduce border-left to 2px (was 3px — closer to the 1px threshold), soften the color
- Code blocks: use `var(--color-admin-surface)` instead of `rgba(0,0,0,0.3)`, add a subtle top-right language label area
- Inline code: warmer background tint, slightly more padding
- Links: slightly brighter blue for better contrast
- Tables: use admin surface tokens for backgrounds and borders
- Placeholder text: make it slightly warmer, not pure gray
- Add `.tiptap:focus-within` subtle inner glow instead of no focus indicator
- Add a `::selection` style with brand-tinted selection color

**Step 3: Commit**

```bash
git add src/styles/tiptap-editor.css src/app/globals.css
git commit -m "polish: warm up editor dark theme with better spacing and typography"
```

---

## Task 2: Refine the Toolbar — From Control Panel to Writing Instrument

The toolbar currently looks like a generic icon row. It should feel like a refined instrument panel — lighter touch, better grouping, clearer hierarchy.

**Files:**
- Modify: `src/components/admin/tiptap-toolbar.tsx`

**Step 1: Restyle toolbar layout**

Key changes:
- Toolbar background: use `bg-admin-surface/60 backdrop-blur-sm` instead of `bg-space-deep/40` — semi-transparent with blur for depth
- Increase padding: `px-4 py-2.5` (was `px-3 py-2`)
- Make the toolbar sticky within the editor container (add `sticky top-0 z-10`)
- Group separators: increase height to `h-6` and use `bg-admin-border-subtle` (was `bg-white/10`)

**Step 2: Improve button states**

- Default state: `text-text-light/50` (was `/60` — slightly more muted for less visual noise)
- Hover: `text-text-light/80 bg-white/5` (subtle, not aggressive)
- Active: `text-white bg-white/8` (was `bg-white/15 text-blue-primary` — too heavy, Substack uses subtle weight not color)
- Button size: keep `p-1.5` but add `rounded-md` (was `rounded`)
- Add tooltip-style labels that appear on hover (using title attribute already exists)

**Step 3: Improve button icon sizing**

- Formatting buttons (bold, italic, etc.): `w-4 h-4` (keep current)
- Block type buttons (H2, H3, H4): slightly larger text labels instead of icons? Actually keep icons but ensure the heading icons are visually distinct from each other
- Insert buttons (image, video, table): `w-4 h-4` (keep)

**Step 4: Color picker popover styling**

- Popover background: `bg-admin-surface-overlay` instead of `bg-space-deep`
- Border: `border-admin-border` instead of `border-white/15`
- Add a small arrow/triangle pointing to the button (optional — skip if complex)
- Swatches: slightly larger `w-7 h-7` for easier clicking

**Step 5: Commit**

```bash
git add src/components/admin/tiptap-toolbar.tsx
git commit -m "polish: refine toolbar with warmer surfaces and subtler active states"
```

---

## Task 3: Polish the Editor Container and Footer

The editor wrapper (border, background, footer with word count) needs refinement.

**Files:**
- Modify: `src/components/admin/tiptap-editor.tsx`

**Step 1: Restyle the editor container**

Current: `rounded-xl border border-white/10 bg-space-mid overflow-hidden`

Change to:
- `rounded-2xl border border-admin-border bg-admin-surface-raised overflow-hidden shadow-lg shadow-black/10`
- The shadow adds depth without being heavy

**Step 2: Restyle the editor content area**

Current: `px-6 py-4 min-h-[400px] prose prose-invert max-w-none text-text-light`

Change to:
- `px-8 py-6 min-h-[500px] max-w-none text-text-light`
- Remove `prose prose-invert` — these Tailwind prose classes conflict with our custom `.tiptap` styles
- Increase `min-h` to `500px` for more generous writing area
- Increase `px` to `8` for more breathing room (Substack's editor has generous margins)

**Step 3: Restyle the footer bar**

Current: `px-6 py-2 border-t border-white/10 ... text-xs text-text-light/40`

Change to:
- `px-8 py-3 border-t border-admin-border-subtle flex items-center justify-between text-xs text-text-light/30 font-medium tracking-wide`
- Slightly more padding, even more muted text (information that's there when you need it, invisible when you don't)
- Add subtle letter-spacing for the stats

**Step 4: Commit**

```bash
git add src/components/admin/tiptap-editor.tsx
git commit -m "polish: refine editor container with depth and generous spacing"
```

---

## Task 4: Polish the Post Editor Page Layout

The post editor page (`posts/[slug]/page.tsx`) at 1010 lines needs layout refinement.

**Files:**
- Modify: `src/app/admin/posts/[slug]/page.tsx`

**Step 1: Refine the top bar**

Read the current top bar section. Polish:
- Add more breathing room: `px-6 py-3` → `px-8 py-4`
- Status badge: softer rounded pill with less saturated colors
  - Draft: `bg-amber-500/10 text-amber-400/80` (was likely more saturated)
  - Scheduled: `bg-blue-400/10 text-blue-400/80`
  - Published: `bg-emerald-500/10 text-emerald-400/80`
- Save/Publish buttons: reduce visual weight. Only "Publish" should be the primary CTA
  - Save Draft: `bg-white/5 text-text-light/70 hover:bg-white/10` (ghost button)
  - Schedule: same ghost style
  - Publish: `bg-blue-deep text-white` (the one primary action)
- Autosave indicator: even more muted, perhaps italic: `text-text-light/25 italic text-xs`

**Step 2: Refine title/subtitle inputs**

- Title: `text-4xl` → use `text-3xl md:text-4xl` with `font-display font-bold`
- Remove visible borders on title/subtitle inputs. Use a transparent/invisible input that only shows focus:
  - `bg-transparent border-none outline-none text-white placeholder:text-text-light/20 w-full`
  - This makes the title feel like it's part of the page, not a form field
- Subtitle: same pattern but `text-xl text-text-light/60`
- Slug: even smaller, `text-xs text-text-light/25 font-mono`

**Step 3: Refine metadata and SEO collapsible panels**

- Panel header button: `text-sm text-text-light/40 font-medium uppercase tracking-wider` (was likely larger)
- Panel content: use `bg-admin-surface-raised/50 rounded-xl p-6 border border-admin-border-subtle` (softer than current)
- Form labels inside panels: `text-xs text-text-light/40 uppercase tracking-wider mb-1.5` (not bold, Substack-style)
- Form inputs: `bg-admin-surface border border-admin-border rounded-lg px-3 py-2.5 text-text-light text-sm focus:border-blue-primary/30 focus:ring-1 focus:ring-blue-primary/10 transition-colors`

**Step 4: Add vertical rhythm between sections**

Ensure generous spacing between title → metadata → editor:
- After title/subtitle: `mb-8` (currently probably `mb-4` or similar)
- After metadata panel: `mb-6`
- The editor should feel like the main event with space around it

**Step 5: Commit**

```bash
git add "src/app/admin/posts/[slug]/page.tsx"
git commit -m "polish: refine post editor layout with invisible inputs and vertical rhythm"
```

---

## Task 5: Polish the Slash Menu

The slash menu should feel like a refined command palette, not a dropdown.

**Files:**
- Modify: `src/components/admin/tiptap-slash-menu.tsx`

**Step 1: Restyle the menu**

Read the current component. Polish:
- Container: `bg-admin-surface-overlay border border-admin-border rounded-xl shadow-2xl shadow-black/20 py-2 min-w-[220px]`
- Each item: `px-3 py-2 flex items-center gap-3 text-sm rounded-lg mx-1`
- Selected state: `bg-white/5 text-white` (not blue, keep it subtle)
- Unselected: `text-text-light/60`
- Icon color: `text-text-light/40` in unselected, `text-text-light/70` when selected
- Add a header text at top: `<div className="px-4 py-1.5 text-[10px] text-text-light/25 uppercase tracking-widest font-medium">Insert block</div>`

**Step 2: Improve the filter input**

If there's a visible filter input, style it to match. If filtering is done by typing after `/`, ensure the menu filters smoothly without flicker.

**Step 3: Commit**

```bash
git add src/components/admin/tiptap-slash-menu.tsx
git commit -m "polish: refine slash menu as command palette"
```

---

## Task 6: Polish the Media Dialog

**Files:**
- Modify: `src/components/admin/media-dialog.tsx`

**Step 1: Restyle the dialog**

Read the current component. Polish:
- Dialog overlay: `bg-black/60 backdrop-blur-sm` (add blur for depth)
- Dialog content: `bg-admin-surface-raised border border-admin-border rounded-2xl max-w-lg`
- Tab triggers: `text-xs uppercase tracking-wider text-text-light/40` when inactive, `text-white border-b-2 border-blue-primary` when active
- Upload zone: `border-2 border-dashed border-admin-border rounded-xl p-10 text-center hover:border-blue-primary/30 transition-colors cursor-pointer bg-admin-surface/50`
- Upload zone icon: larger (`w-10 h-10`), muted (`text-text-light/20`)
- Upload zone text: `text-text-light/40 text-sm`
- Image preview after upload: `rounded-xl overflow-hidden`
- Input fields: match the panel input style from Task 4
- Insert button: `bg-blue-deep text-white rounded-lg px-5 py-2.5 font-medium hover:bg-blue-deep/80 transition-colors`

**Step 2: Commit**

```bash
git add src/components/admin/media-dialog.tsx
git commit -m "polish: refine media dialog with warmer surfaces"
```

---

## Task 7: Polish the Admin Sidebar

**Files:**
- Modify: `src/components/admin/admin-sidebar.tsx`

**Step 1: Subtle refinements**

- Background: keep `bg-space-deep` but add `border-r border-admin-border-subtle` (softer border)
- Nav items active state: `bg-white/6 text-white` (was `bg-white/10` — too heavy)
- Nav items hover: `bg-white/3 text-text-light/80` (was `bg-white/5`)
- Nav item labels: add `tracking-wide` for slight letter spacing
- User avatar: use a warmer blue with less saturation
- Sign out button: even more muted `text-text-light/40`

**Step 2: Commit**

```bash
git add src/components/admin/admin-sidebar.tsx
git commit -m "polish: soften sidebar with subtler states"
```

---

## Task 8: Polish the Admin Header

**Files:**
- Modify: `src/components/admin/admin-header.tsx`

**Step 1: Refine the header bar**

- Background: `bg-admin-surface-raised` instead of `bg-space-mid`
- Border: `border-admin-border-subtle` (softer)
- Page title: `font-display text-white/90 font-semibold text-sm tracking-wide` (slightly smaller, tracked)
- Add missing route labels for new pages: Templates, Subscribers, Migrate
- User dropdown: match admin surface tokens

**Step 2: Commit**

```bash
git add src/components/admin/admin-header.tsx
git commit -m "polish: refine admin header with warmer surface"
```

---

## Task 9: Polish the Posts List Page

**Files:**
- Modify: `src/app/admin/posts/page.tsx`

**Step 1: Refine post cards**

Read the current file. Polish:
- Cards: use `bg-admin-surface-raised border border-admin-border rounded-xl` (match new tokens)
- Hover: `hover:border-admin-border hover:bg-admin-surface-overlay transition-colors` (subtle lift, not heavy shadow)
- Title: `font-display text-white font-semibold` (not bold — semibold is enough)
- Slug: `text-text-light/25 text-xs font-mono` (even more muted)
- Status badges: match the softened badges from Task 4
- Tags: softer, `bg-white/3 text-text-light/40`
- Delete button: only visible on card hover, `opacity-0 group-hover:opacity-100 transition-opacity`

**Step 2: Refine the "New Post" area**

- Button: `bg-blue-deep/80 text-white rounded-xl px-5 py-2.5` (slightly desaturated)
- "New from Template" button: ghost style matching Task 4

**Step 3: Commit**

```bash
git add src/app/admin/posts/page.tsx
git commit -m "polish: refine posts list with warmer card surfaces"
```

---

## Task 10: Polish the Dashboard

**Files:**
- Modify: `src/app/admin/page.tsx`

**Step 1: Refine stats cards**

Read the current dashboard. Polish:
- Stats cards: `bg-admin-surface-raised border border-admin-border rounded-xl p-6`
- Big numbers: `font-display text-2xl font-bold text-white` (reduce from `text-3xl` — less "hero metric" feel)
- Labels: `text-xs text-text-light/35 uppercase tracking-wider mt-1`
- Don't use icons inside stat cards (removes the "AI dashboard" feel)

**Step 2: Refine the top posts table**

- Table rows: `border-b border-admin-border-subtle`
- Rank number: `text-text-light/25 text-sm font-mono w-6`
- Post title: `text-text-light/80 text-sm hover:text-white`
- View count: `text-text-light/35 text-xs text-right`

**Step 3: Commit**

```bash
git add src/app/admin/page.tsx
git commit -m "polish: refine dashboard with editorial restraint"
```

---

## Task 11: Final Build and Deploy

**Step 1: Run full build**

```bash
cd /Users/md/Diagonally/website && npm run build
```

Expected: Clean build, 0 errors.

**Step 2: Visual check**

```bash
npm run dev
```

Visit `/admin/posts/new` and verify:
- [ ] Editor text is clearly readable (warm white on warm dark)
- [ ] Toolbar feels refined, not cluttered
- [ ] Title input looks like content, not a form field
- [ ] Generous spacing throughout
- [ ] Slash menu feels like a command palette
- [ ] Color picker popovers match the warm theme
- [ ] Sidebar navigation is subtle and warm
- [ ] Dashboard doesn't scream "AI template"

**Step 3: Deploy**

```bash
vercel --prod --yes
```

**Step 4: Commit any final tweaks**

```bash
git add -A
git commit -m "polish: admin editor Substack-quality finish"
```
