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

export interface PostDocument {
  slug: string
  title: string
  excerpt: string
  coverImage: string
  authorId: string
  category: string
  draftContent: ContentBlock[]
  publishedContent: ContentBlock[]
  publishedAt: Date | null
  createdAt: Date
  updatedAt: Date
  status: "draft" | "published"
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
