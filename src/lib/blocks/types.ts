export interface Block {
  id: string
  type: string
  props: Record<string, unknown>
}

export interface PageDocument {
  slug: string
  title: string
  draftBlocks: Block[]
  publishedBlocks: Block[]
  showInNav: boolean
  navOrder: number
  navLabel: string
  lastEditedBy: string | null
  lastEditedAt: Date | null
  publishedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface PageVersion {
  version: number
  blocks: Block[]
  publishedBy: string
  publishedAt: Date
  note: string
}

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

  // Content — Tiptap JSON format (ContentBlock[] for legacy)
  draftContent: TiptapJSON | ContentBlock[]
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
  viewCount: number

  // Template
  templateId?: string
}

// Type guard: check if content is Tiptap JSON vs legacy ContentBlock[]
export function isTiptapContent(
  content: TiptapJSON | ContentBlock[] | null
): content is TiptapJSON {
  if (!content) return false
  return !Array.isArray(content) && "type" in content && (content as TiptapJSON).type === "doc"
}

export interface PostVersion {
  id: string
  content: TiptapJSON
  wordCount: number
  savedBy: string
  savedAt: Date
}

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

export interface Author {
  id: string
  name: string
  role: string
  bio: string
  headshot: string
  socialLinks: { platform: string; url: string }[]
}

export interface Submission {
  id: string
  type: "demo" | "waitlist" | "contact" | "newsletter"
  name: string
  email: string
  data: Record<string, unknown>
  status: "new" | "read" | "replied"
  createdAt: Date
}
