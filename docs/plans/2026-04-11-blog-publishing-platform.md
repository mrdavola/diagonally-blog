# Blog Publishing Platform Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rebuild Diagonally's blog into a Substack-quality publishing platform with Tiptap rich editor, scheduling, revision history, templates, Loops email distribution, and per-post analytics.

**Architecture:** Tiptap editor stores content as JSON in Firestore. Publishing pipeline handles draft/scheduled/published states with revision snapshots. Loops SDK syncs subscribers and sends email campaigns on publish. View counting via API route with IP-hash deduplication.

**Tech Stack:** Tiptap (editor), Loops (email), KaTeX (math), lowlight (code highlighting), Firebase Firestore (storage), Vercel Cron (scheduled publishing)

---

## Phase 1: Editor Foundation

### Task 1: Install Tiptap and Extensions

**Files:**
- Modify: `package.json`

**Step 1: Install core Tiptap packages**

```bash
cd /Users/md/Diagonally/website
npm install @tiptap/react @tiptap/pm @tiptap/starter-kit @tiptap/extension-placeholder @tiptap/extension-link @tiptap/extension-image @tiptap/extension-code-block-lowlight @tiptap/extension-table @tiptap/extension-table-row @tiptap/extension-table-header @tiptap/extension-table-cell @tiptap/extension-task-list @tiptap/extension-task-item @tiptap/extension-underline @tiptap/extension-superscript @tiptap/extension-subscript @tiptap/extension-text-align @tiptap/extension-highlight @tiptap/extension-typography @tiptap/extension-dropcursor @tiptap/extension-color @tiptap/extension-text-style @tiptap/extension-character-count lowlight katex
```

**Step 2: Verify installation**

```bash
npm ls @tiptap/react
```

Expected: `@tiptap/react@X.X.X` listed without errors

**Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "feat: install Tiptap editor and extensions"
```

---

### Task 2: Update Post Data Model

**Files:**
- Modify: `src/lib/blocks/types.ts`

**Step 1: Add new PostDocument interface alongside old one**

Replace the existing `PostDocument` and `ContentBlock` interfaces (lines 30-59) with:

```typescript
// Tiptap JSON document structure
export interface TiptapJSON {
  type: "doc"
  content: TiptapNode[]
}

export interface TiptapNode {
  type: string
  attrs?: Record<string, unknown>
  content?: TiptapNode[]
  marks?: { type: string; attrs?: Record<string, unknown> }[]
  text?: string
}

// Legacy block type — kept for migration of existing posts
export interface ContentBlock {
  id: string
  type:
    | "paragraph"
    | "heading"
    | "subheading"
    | "image"
    | "quote"
    | "callout"
    | "list"
    | "divider"
  content: string
  imageUrl?: string
  accentColor?: string
}

export interface PostDocument {
  slug: string
  title: string
  subtitle: string
  excerpt: string
  coverImage: string
  coverImageFocalPoint?: { x: number; y: number }
  authorIds: string[]
  category: string
  tags: string[]

  // Content — Tiptap JSON format
  draftContent: TiptapJSON | ContentBlock[]  // ContentBlock[] for legacy compat
  publishedContent: TiptapJSON | ContentBlock[] | null

  // SEO
  metaTitle?: string
  metaDescription?: string
  ogImage?: string
  canonicalUrl?: string

  // Publishing
  status: "draft" | "scheduled" | "published"
  scheduledAt?: Date | null
  publishedAt: Date | null
  createdAt: Date
  updatedAt: Date

  // Computed
  wordCount: number
  readTimeMinutes: number

  // Template
  templateId?: string
}

// Type guard: check if content is Tiptap JSON vs legacy ContentBlock[]
export function isTiptapContent(
  content: TiptapJSON | ContentBlock[] | null
): content is TiptapJSON {
  if (!content) return false
  return "type" in content && (content as TiptapJSON).type === "doc"
}
```

**Step 2: Verify build**

```bash
npm run build 2>&1 | head -20
```

Expected: TypeScript errors in files still using old PostDocument shape. That's OK — we'll fix them in subsequent tasks.

**Step 3: Commit**

```bash
git add src/lib/blocks/types.ts
git commit -m "feat: update PostDocument model for Tiptap editor"
```

---

### Task 3: Update Posts CRUD Layer

**Files:**
- Modify: `src/lib/posts.ts`

**Step 1: Update docToPost to handle new fields**

Rewrite `src/lib/posts.ts` to handle both legacy ContentBlock[] and new TiptapJSON content, plus all new fields (subtitle, tags, authorIds, SEO, scheduling, wordCount, readTimeMinutes):

Key changes to `docToPost()`:
- `authorId` → `authorIds`: if data has `authorId` (string), wrap in array for backward compat
- Default `subtitle` to `""`
- Default `tags` to `[]`
- Default `wordCount` and `readTimeMinutes` to `0`
- Default `status` to include `"scheduled"` option
- Pass through `scheduledAt`, `metaTitle`, `metaDescription`, `ogImage`, `canonicalUrl`, `templateId`

Add new functions:
- `listScheduledPosts()` — query posts with `status == "scheduled"` and `scheduledAt <= now`
- `savePostVersion(slug, content, savedBy)` — write to `posts/{slug}/versions/{versionId}` subcollection
- `listPostVersions(slug)` — fetch version history ordered by timestamp desc
- `restoreVersion(slug, versionId)` — copy version content back to draftContent

**Step 2: Verify build compiles**

```bash
npm run build 2>&1 | tail -5
```

**Step 3: Commit**

```bash
git add src/lib/posts.ts
git commit -m "feat: update posts CRUD for new data model with versioning"
```

---

### Task 4: Build Tiptap Editor Component

**Files:**
- Create: `src/components/admin/tiptap-editor.tsx`
- Create: `src/components/admin/tiptap-toolbar.tsx`
- Create: `src/components/admin/tiptap-slash-menu.tsx`

**Step 1: Create the main Tiptap editor component**

`src/components/admin/tiptap-editor.tsx` — the core editor:

```typescript
"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import Link from "@tiptap/extension-link"
import Image from "@tiptap/extension-image"
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight"
import Table from "@tiptap/extension-table"
import TableRow from "@tiptap/extension-table-row"
import TableHeader from "@tiptap/extension-table-header"
import TableCell from "@tiptap/extension-table-cell"
import TaskList from "@tiptap/extension-task-list"
import TaskItem from "@tiptap/extension-task-item"
import Underline from "@tiptap/extension-underline"
import Superscript from "@tiptap/extension-superscript"
import Subscript from "@tiptap/extension-subscript"
import TextAlign from "@tiptap/extension-text-align"
import Highlight from "@tiptap/extension-highlight"
import CharacterCount from "@tiptap/extension-character-count"
import { all, createLowlight } from "lowlight"
import type { TiptapJSON } from "@/lib/blocks/types"
import { TiptapToolbar } from "./tiptap-toolbar"

const lowlight = createLowlight(all)

interface TiptapEditorProps {
  content: TiptapJSON | null
  onChange: (content: TiptapJSON) => void
  autosave?: boolean
}
```

The editor should:
- Initialize with all extensions listed above
- Call `onChange` on every content update (debounced 300ms for autosave)
- Display `TiptapToolbar` as a sticky bar above the editor
- Show word count and read time (words / 238) at bottom
- Use placeholder text "Start writing..." for empty editor
- Apply styling classes for the editor content area to match the site's typography

**Step 2: Create the bubble/floating toolbar**

`src/components/admin/tiptap-toolbar.tsx`:
- Sticky toolbar with formatting buttons
- Groups: Text (Bold, Italic, Underline, Strikethrough, Code) | Block (H2, H3, H4, Quote, Callout) | List (Bullet, Ordered, Task) | Insert (Image, Table, Code Block, Divider, Embed) | Align (Left, Center, Right)
- Each button shows active state when format is applied
- Uses `editor.chain().focus().toggleBold().run()` pattern

**Step 3: Create the slash command menu**

`src/components/admin/tiptap-slash-menu.tsx`:
- Listens for `/` typed at start of empty block
- Shows floating menu with block type options
- Keyboard navigable (arrow keys + enter)
- Categories: Text, Media, Advanced
- Each option inserts the corresponding block type

**Step 4: Verify the editor renders**

Temporarily import into any admin page and confirm it mounts without errors.

**Step 5: Commit**

```bash
git add src/components/admin/tiptap-editor.tsx src/components/admin/tiptap-toolbar.tsx src/components/admin/tiptap-slash-menu.tsx
git commit -m "feat: add Tiptap editor with toolbar and slash commands"
```

---

### Task 5: Build Post Editor Page (Replace Current)

**Files:**
- Modify: `src/app/admin/posts/[slug]/page.tsx` (full rewrite)

**Step 1: Rewrite the editor page**

Replace the current 277-line editor with the new Tiptap-based version:

**Layout (top to bottom):**
1. **Top bar:** Back button | Status badge | Save Draft | Schedule | Publish buttons
2. **Metadata panel (collapsible sidebar or top section):**
   - Title (large input, font-display)
   - Subtitle (medium input)
   - Slug (auto-generated, editable)
   - Category (dropdown)
   - Tags (comma-separated input or tag chips)
   - Author(s) (multi-select from authors list)
   - Cover image (ImageField)
   - Excerpt (textarea, auto-generated from first paragraph if empty)
3. **SEO panel (collapsible):**
   - Meta title (with character count, max 60)
   - Meta description (with character count, max 160)
   - OG image override
   - Canonical URL
4. **Editor area:** Full TiptapEditor component
5. **Bottom bar:** Word count | Read time | Last saved timestamp

**Autosave logic:**
- Debounce 10 seconds after last edit
- Save draft to Firestore + create version snapshot
- Show "Saving..." → "Saved at HH:MM" indicator

**Schedule flow:**
- "Schedule" button opens a date/time picker popover
- Sets `status: "scheduled"` and `scheduledAt` on save
- Shows scheduled time badge in top bar

**Step 2: Verify the page loads and editor works**

```bash
npm run dev
```

Navigate to `/admin/posts/test-post` and verify the editor renders with toolbar.

**Step 3: Commit**

```bash
git add src/app/admin/posts/[slug]/page.tsx
git commit -m "feat: rebuild post editor with Tiptap and metadata panels"
```

---

### Task 6: Update Posts List Page

**Files:**
- Modify: `src/app/admin/posts/page.tsx`

**Step 1: Update list to show new fields**

- Show subtitle below title
- Show tags as small badges
- Show scheduled time for scheduled posts
- Show word count
- Add "New from Template" button alongside "New Post"
- Status badges: draft (amber), scheduled (blue), published (green)

**Step 2: Commit**

```bash
git add src/app/admin/posts/page.tsx
git commit -m "feat: update posts list for new post model"
```

---

## Phase 2: Fix Public Blog View

### Task 7: Build Tiptap Content Renderer

**Files:**
- Create: `src/components/blog/tiptap-renderer.tsx`
- Create: `src/components/blog/blog-blocks.tsx`

**Step 1: Create the renderer**

`src/components/blog/tiptap-renderer.tsx`:
- Takes `TiptapJSON` content and renders it as React components
- Use `generateHTML()` from `@tiptap/html` OR build a custom recursive renderer
- Custom renderer preferred for full styling control:

Map each Tiptap node type to a styled component:
| Node Type | Component |
|-----------|-----------|
| paragraph | `<p>` with prose styling |
| heading (level 2/3/4) | `<h2/h3/h4>` with font-display |
| bulletList | `<ul>` with custom markers |
| orderedList | `<ol>` |
| taskList | Checkbox list |
| listItem / taskItem | `<li>` |
| blockquote | Styled `<blockquote>` with gold accent |
| codeBlock | Syntax-highlighted `<pre><code>` via lowlight |
| image | `<figure>` with `next/image` + `<figcaption>` |
| table | Styled `<table>` with header row |
| horizontalRule | `<hr>` divider |
| hardBreak | `<br>` |

Map each mark type to inline styling:
| Mark | Element |
|------|---------|
| bold | `<strong>` |
| italic | `<em>` |
| underline | `<u>` |
| strike | `<del>` |
| code | `<code>` inline |
| link | `<a>` with hover styling |
| superscript | `<sup>` |
| subscript | `<sub>` |
| highlight | `<mark>` |

`src/components/blog/blog-blocks.tsx`:
- Legacy renderer for old `ContentBlock[]` format
- Maps each ContentBlock type to equivalent styled elements
- Used as fallback when `isTiptapContent()` returns false

**Step 2: Commit**

```bash
git add src/components/blog/tiptap-renderer.tsx src/components/blog/blog-blocks.tsx
git commit -m "feat: add Tiptap content renderer and legacy block renderer"
```

---

### Task 8: Rebuild Public Blog Post Page

**Files:**
- Modify: `src/components/pages/blog-post-content.tsx` (full rewrite)
- Modify: `src/app/blog/[slug]/page.tsx`

**Step 1: Rewrite blog-post-content.tsx**

Replace hardcoded content with data-driven rendering:
- Accept `post: PostDocument` and `author: Author` as props
- Render cover image with `next/image`
- Display: category badge, title, subtitle, author info (headshot, name, role), publish date, read time
- Render `publishedContent` using TiptapRenderer (or LegacyBlockRenderer for old posts via `isTiptapContent()` check)
- Related posts section: query 3 posts in same category (excluding current)
- Breadcrumb: Blog > Category > Title

**Step 2: Update blog/[slug]/page.tsx**

- Server-side: fetch post via `getPost(slug)` using firebase-admin
- Server-side: fetch author via `getAuthor(post.authorIds[0])`
- Generate proper metadata from post fields (title, excerpt, coverImage for OG)
- Pass post + author as props to BlogPostContent
- 404 if post not found or not published
- Increment view count via client-side fetch to `/api/posts/[slug]/view`

**Step 3: Verify a published post renders correctly**

```bash
npm run dev
```

Navigate to `/blog/[any-published-slug]` and verify content renders from Firestore.

**Step 4: Commit**

```bash
git add src/components/pages/blog-post-content.tsx src/app/blog/[slug]/page.tsx
git commit -m "feat: rebuild public blog post page with dynamic content"
```

---

### Task 9: Update Blog Listing Page

**Files:**
- Modify: `src/components/pages/blog-content.tsx`

**Step 1: Replace client-side fetching with server data**

- Remove `useEffect` + `useState` for fetching posts
- Accept `posts: PostDocument[]` as prop from server component
- Remove hardcoded POSTS and FEATURED_POST arrays
- Featured post = most recent published post
- Show actual cover images instead of gradient placeholders
- Display actual author names (fetch authors list)
- Show read time from post.readTimeMinutes
- Category filter still works client-side (filter the passed-in posts array)

**Step 2: Update src/app/blog/page.tsx to fetch server-side**

```typescript
import { listPosts } from "@/lib/posts"

export default async function BlogPage() {
  const posts = await listPosts()
  const published = posts.filter(p => p.status === "published")
  return <BlogContent posts={published} />
}
```

**Step 3: Commit**

```bash
git add src/components/pages/blog-content.tsx src/app/blog/page.tsx
git commit -m "feat: server-side blog listing with real post data"
```

---

## Phase 3: Publishing Pipeline

### Task 10: Revision History

**Files:**
- Create: `src/components/admin/version-history.tsx`
- Modify: `src/lib/posts.ts` (already updated in Task 3)

**Step 1: Build version history sidebar component**

`src/components/admin/version-history.tsx`:
- Sheet/drawer that slides in from right
- Lists all versions with: timestamp, word count delta, "Restore" button
- Clicking "Restore" copies that version's content back to draftContent
- Confirmation dialog before restore

**Step 2: Integrate into post editor page**

Add "History" button to top bar that opens the version history sheet.

**Step 3: Commit**

```bash
git add src/components/admin/version-history.tsx src/app/admin/posts/[slug]/page.tsx
git commit -m "feat: add revision history with restore capability"
```

---

### Task 11: Scheduled Publishing (Cron)

**Files:**
- Create: `src/app/api/cron/publish-scheduled/route.ts`
- Modify: `vercel.json` or `vercel.ts` (add cron config)

**Step 1: Create the cron API route**

```typescript
// src/app/api/cron/publish-scheduled/route.ts
import { NextResponse } from "next/server"
// Use firebase-admin for server-side
// Query posts where status == "scheduled" and scheduledAt <= now
// For each: copy draftContent to publishedContent, set status to "published"
// Optionally trigger Loops email send
```

Protect with `CRON_SECRET` header verification.

**Step 2: Add cron config**

Add to `next.config.ts` or create `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/cron/publish-scheduled",
    "schedule": "* * * * *"
  }]
}
```

**Step 3: Commit**

```bash
git add src/app/api/cron/publish-scheduled/route.ts vercel.json
git commit -m "feat: add scheduled publishing via Vercel Cron"
```

---

### Task 12: Post Templates

**Files:**
- Create: `src/lib/templates.ts`
- Create: `src/app/admin/posts/templates/page.tsx`
- Modify: `src/app/admin/posts/page.tsx` (add "From Template" option)

**Step 1: Create templates CRUD**

`src/lib/templates.ts`:
- `saveTemplate(name, content: TiptapJSON, metadata)` — write to `templates/{id}`
- `listTemplates()` — fetch all templates
- `getTemplate(id)` — fetch single template
- `deleteTemplate(id)` — remove template

**Step 2: Build templates list page**

Show saved templates with preview, "Use" and "Delete" buttons.

**Step 3: Add "Save as Template" to post editor**

Button in editor toolbar that saves current post structure as a reusable template.

**Step 4: Add "New from Template" to posts list**

Modal showing template picker when creating a new post.

**Step 5: Commit**

```bash
git add src/lib/templates.ts src/app/admin/posts/templates/page.tsx src/app/admin/posts/page.tsx
git commit -m "feat: add post templates system"
```

---

### Task 13: Draft Preview with Shareable Link

**Files:**
- Create: `src/app/api/preview/[token]/route.ts`
- Create: `src/app/preview/post/[token]/page.tsx`
- Modify: `src/app/admin/posts/[slug]/page.tsx` (add preview button)

**Step 1: Generate preview tokens**

When user clicks "Preview" in editor:
- Generate a random token (nanoid or crypto.randomUUID)
- Store in Firestore: `previews/{token}` → `{ slug, createdAt, expiresAt: now + 24h }`
- Return preview URL: `/preview/post/{token}`

**Step 2: Build preview page**

- Fetch the preview token, get the slug
- Load the post's draftContent
- Render using TiptapRenderer with the public blog post layout
- Show a banner: "This is a draft preview. Not yet published."

**Step 3: Add preview button to editor**

"Share Preview" button generates link, shows in a copyable popover.

**Step 4: Commit**

```bash
git add src/app/api/preview/[token]/route.ts src/app/preview/post/[token]/page.tsx src/app/admin/posts/[slug]/page.tsx
git commit -m "feat: add shareable draft preview links"
```

---

## Phase 4: Email Distribution (Loops)

### Task 14: Install and Configure Loops

**Files:**
- Modify: `package.json`
- Create: `src/lib/loops.ts`

**Step 1: Install Loops SDK**

```bash
npm install loops
```

**Step 2: Create Loops client**

`src/lib/loops.ts`:
```typescript
import { LoopsClient } from "loops"

const loops = new LoopsClient(process.env.LOOPS_API_KEY!)

export async function syncSubscriber(email: string, name?: string) {
  await loops.createContact(email, { firstName: name })
}

export async function sendPostEmail(post: PostDocument) {
  // Use Loops transactional email or event trigger
  // Pass post title, excerpt, URL as data variables
}

export async function getSubscriberCount(): Promise<number> {
  // Query subscriber count from Loops
}
```

**Step 3: Add LOOPS_API_KEY to environment**

```bash
vercel env add LOOPS_API_KEY
```

**Step 4: Commit**

```bash
git add package.json package-lock.json src/lib/loops.ts
git commit -m "feat: add Loops email integration"
```

---

### Task 15: Subscriber Sync and Email-on-Publish

**Files:**
- Modify: `src/app/api/newsletter/route.ts` (sync to Loops on subscribe)
- Modify: `src/lib/posts.ts` (trigger email on publish)
- Create: `src/app/admin/subscribers/page.tsx`

**Step 1: Sync newsletter subscribers to Loops**

In `/api/newsletter` POST handler, after writing to Firestore, also call `syncSubscriber(email)`.

**Step 2: Add "Send to subscribers" toggle on publish**

In the publish flow, add a checkbox: "Email this post to subscribers"
If checked, after publish succeeds, call `sendPostEmail(post)`.

**Step 3: Build subscriber management page**

`/admin/subscribers`:
- Show subscriber count
- List recent subscribers
- Import CSV button
- Export CSV button

**Step 4: Commit**

```bash
git add src/app/api/newsletter/route.ts src/lib/posts.ts src/app/admin/subscribers/page.tsx
git commit -m "feat: subscriber sync and email-on-publish via Loops"
```

---

## Phase 5: Analytics & Dashboard

### Task 16: View Counting API

**Files:**
- Create: `src/app/api/posts/[slug]/view/route.ts`

**Step 1: Create view tracking endpoint**

```typescript
// POST /api/posts/[slug]/view
// - Hash the IP address (for deduplication, not storage)
// - Increment view count in posts/{slug} doc
// - Store hashed IP in a daily set to prevent duplicate counting
// - Return { views: number }
```

Use Firestore `increment()` for atomic view counting.

**Step 2: Call from blog post page**

In `blog-post-content.tsx`, add a `useEffect` that POSTs to `/api/posts/${slug}/view` on mount.

**Step 3: Commit**

```bash
git add src/app/api/posts/[slug]/view/route.ts src/components/pages/blog-post-content.tsx
git commit -m "feat: add per-post view counting with deduplication"
```

---

### Task 17: Author Dashboard

**Files:**
- Modify: `src/app/admin/page.tsx` (enhance dashboard)

**Step 1: Add analytics cards to admin dashboard**

Replace or enhance the current admin landing page with:
- **Total views** across all posts (sum of all post view counts)
- **Posts published** this month
- **Total subscribers** (from Loops or Firestore newsletter count)
- **Top 5 posts** by view count (table with title, views, publish date)
- **Recent drafts** needing attention

**Step 2: Show per-post stats on posts list**

Add view count column to the posts list page.

**Step 3: Commit**

```bash
git add src/app/admin/page.tsx src/app/admin/posts/page.tsx
git commit -m "feat: add author dashboard with analytics"
```

---

### Task 18: Editor Styles and Polish

**Files:**
- Create: `src/app/admin/editor.css` (Tiptap editor styles)
- Modify: `src/app/globals.css` (add prose styles for blog content)

**Step 1: Style the Tiptap editor**

Create editor-specific CSS:
- `.tiptap` base styles matching the site's typography
- Placeholder text styling
- Focus ring on editor area
- Table styling (borders, padding, header background)
- Code block styling with language label
- Task list checkbox styling
- Image styling (caption, alignment)
- Slash menu dropdown styling

**Step 2: Add prose styles for public blog rendering**

Add to globals.css:
- `.prose` wrapper with max-width 65ch, comfortable line-height
- Heading styles matching font-display
- Link styles (blue-deep, underline on hover)
- Code block with syntax theme
- Blockquote styling
- Image/figure styling

**Step 3: Final build verification**

```bash
npm run build
```

Expected: Clean build, 0 errors.

**Step 4: Commit**

```bash
git add src/app/admin/editor.css src/app/globals.css
git commit -m "feat: add editor and prose styles"
```

---

### Task 19: Migration Script for Legacy Posts

**Files:**
- Create: `src/app/admin/migrate/page.tsx`

**Step 1: Build a one-time migration page**

Admin page that:
- Lists all posts still using `ContentBlock[]` format
- "Migrate" button per post that converts ContentBlock[] to TiptapJSON:
  - `paragraph` → Tiptap paragraph node
  - `heading` → Tiptap heading node (level 2)
  - `subheading` → Tiptap heading node (level 3)
  - `image` → Tiptap image node with src
  - `quote` → Tiptap blockquote node
  - `callout` → Tiptap paragraph with highlight mark
  - `list` → Tiptap bulletList with items split by newline
  - `divider` → Tiptap horizontalRule node
- "Migrate All" button for batch conversion
- Saves converted content to draftContent

**Step 2: Commit**

```bash
git add src/app/admin/migrate/page.tsx
git commit -m "feat: add legacy content migration tool"
```

---

### Task 20: Final Integration Test and Deploy

**Step 1: Run full build**

```bash
npm run build
```

**Step 2: Start dev server and test golden path**

```bash
npm run dev
```

Test checklist:
- [ ] Create new post from admin
- [ ] Type with inline formatting (bold, italic, links)
- [ ] Insert blocks via slash menu (image, code, table, divider)
- [ ] Autosave triggers after 10 seconds
- [ ] Save draft manually
- [ ] Schedule for future date
- [ ] Publish immediately
- [ ] View published post on public blog
- [ ] Content renders correctly (all block types)
- [ ] Blog listing shows real posts
- [ ] Version history shows saves
- [ ] Restore from version works
- [ ] Preview link generates and works
- [ ] View count increments
- [ ] Dashboard shows stats

**Step 3: Deploy to production**

```bash
vercel --prod
```

**Step 4: Commit any final fixes**

```bash
git add -A
git commit -m "feat: complete blog publishing platform v1"
```
