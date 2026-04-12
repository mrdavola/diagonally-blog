// src/lib/visual-editor/block-registry.ts
import type { BlockType, EditorBlock } from "./types"
import { createBlock } from "./defaults"

export interface BlockDefinition {
  type: BlockType
  label: string
  icon: string
  category: "essentials" | "layout" | "media" | "data" | "forms" | "embed"
  defaultProps: Record<string, unknown>
  defaultColSpan: number
}

export const VISUAL_BLOCK_DEFINITIONS: BlockDefinition[] = [
  // ─── Essentials ───
  {
    type: "text",
    label: "Text",
    icon: "Type",
    category: "essentials",
    defaultProps: {
      html: "<p>Start typing your content here...</p>",
      align: "left",
    },
    defaultColSpan: 12,
  },
  {
    type: "image",
    label: "Image",
    icon: "Image",
    category: "essentials",
    defaultProps: {
      src: "",
      alt: "",
      objectFit: "cover",
      aspectRatio: "16/9",
    },
    defaultColSpan: 12,
  },
  {
    type: "button",
    label: "Button",
    icon: "RectangleHorizontal",
    category: "essentials",
    defaultProps: {
      label: "Click here",
      href: "#",
      variant: "filled",
      size: "md",
      align: "left",
    },
    defaultColSpan: 4,
  },
  {
    type: "video",
    label: "Video",
    icon: "Play",
    category: "essentials",
    defaultProps: {
      src: "",
      poster: "",
      autoplay: false,
      controls: true,
      loop: false,
      muted: false,
    },
    defaultColSpan: 12,
  },
  {
    type: "icon",
    label: "Icon",
    icon: "Smile",
    category: "essentials",
    defaultProps: {
      name: "Star",
      size: 48,
      color: "currentColor",
      align: "left",
    },
    defaultColSpan: 2,
  },

  // ─── Layout ───
  {
    type: "columns",
    label: "Columns",
    icon: "Columns",
    category: "layout",
    defaultProps: {
      columns: 2,
      gap: 24,
      items: [],
    },
    defaultColSpan: 12,
  },
  {
    type: "card",
    label: "Card",
    icon: "Square",
    category: "layout",
    defaultProps: {
      title: "Card Title",
      body: "Card description goes here.",
      imageSrc: "",
      imageAlt: "",
      ctaLabel: "",
      ctaHref: "",
    },
    defaultColSpan: 6,
  },
  {
    type: "accordion",
    label: "Accordion",
    icon: "ChevronDown",
    category: "layout",
    defaultProps: {
      items: [
        { question: "What is this?", answer: "This is an accordion block." },
      ],
      allowMultiple: false,
    },
    defaultColSpan: 12,
  },
  {
    type: "tabs",
    label: "Tabs",
    icon: "LayoutList",
    category: "layout",
    defaultProps: {
      tabs: [
        { label: "Tab 1", content: "Content for tab 1." },
        { label: "Tab 2", content: "Content for tab 2." },
      ],
    },
    defaultColSpan: 12,
  },
  {
    type: "divider",
    label: "Divider",
    icon: "Minus",
    category: "layout",
    defaultProps: {
      style: "solid",
      thickness: 1,
      color: "currentColor",
    },
    defaultColSpan: 12,
  },
  {
    type: "spacer",
    label: "Spacer",
    icon: "MoveVertical",
    category: "layout",
    defaultProps: {
      height: 48,
    },
    defaultColSpan: 12,
  },

  // ─── Media ───
  {
    type: "gallery",
    label: "Gallery",
    icon: "LayoutGrid",
    category: "media",
    defaultProps: {
      images: [],
      columns: 3,
      gap: 8,
    },
    defaultColSpan: 12,
  },
  {
    type: "image-carousel",
    label: "Image Carousel",
    icon: "GalleryHorizontal",
    category: "media",
    defaultProps: {
      images: [],
      autoplay: false,
      interval: 4000,
      showDots: true,
      showArrows: true,
    },
    defaultColSpan: 12,
  },
  {
    type: "video-embed",
    label: "Video Embed",
    icon: "MonitorPlay",
    category: "media",
    defaultProps: {
      url: "",
      provider: "youtube",
      aspectRatio: "16/9",
    },
    defaultColSpan: 12,
  },
  {
    type: "audio",
    label: "Audio",
    icon: "Music",
    category: "media",
    defaultProps: {
      src: "",
      title: "",
      showWaveform: false,
    },
    defaultColSpan: 12,
  },

  // ─── Data ───
  {
    type: "stats-row",
    label: "Stats Row",
    icon: "BarChart3",
    category: "data",
    defaultProps: {
      stats: [
        { value: "100+", label: "Students" },
        { value: "95%", label: "Satisfaction" },
        { value: "10", label: "Years" },
      ],
      align: "center",
    },
    defaultColSpan: 12,
  },
  {
    type: "pricing-card",
    label: "Pricing Card",
    icon: "CreditCard",
    category: "data",
    defaultProps: {
      title: "Plan Name",
      price: "$0",
      period: "/ month",
      features: ["Feature 1", "Feature 2", "Feature 3"],
      ctaLabel: "Get started",
      ctaHref: "#",
      highlighted: false,
    },
    defaultColSpan: 4,
  },
  {
    type: "comparison-table",
    label: "Comparison Table",
    icon: "Table2",
    category: "data",
    defaultProps: {
      headers: ["Feature", "Basic", "Pro"],
      rows: [
        { feature: "Feature 1", values: ["Yes", "Yes"] },
        { feature: "Feature 2", values: ["No", "Yes"] },
      ],
    },
    defaultColSpan: 12,
  },
  {
    type: "chart",
    label: "Chart",
    icon: "TrendingUp",
    category: "data",
    defaultProps: {
      chartType: "bar",
      data: [],
      title: "",
    },
    defaultColSpan: 12,
  },

  // ─── Forms ───
  {
    type: "form",
    label: "Form",
    icon: "FileText",
    category: "forms",
    defaultProps: {
      fields: [
        { type: "text", label: "Name", required: true },
        { type: "email", label: "Email", required: true },
      ],
      submitLabel: "Submit",
      successMessage: "Thank you for your submission!",
    },
    defaultColSpan: 8,
  },
  {
    type: "newsletter-signup",
    label: "Newsletter Signup",
    icon: "Mail",
    category: "forms",
    defaultProps: {
      heading: "Stay in the loop",
      subheading: "Subscribe to our newsletter for updates.",
      placeholder: "Enter your email",
      submitLabel: "Subscribe",
      successMessage: "You're subscribed!",
    },
    defaultColSpan: 8,
  },
  {
    type: "cta-banner",
    label: "CTA Banner",
    icon: "Megaphone",
    category: "forms",
    defaultProps: {
      heading: "Ready to get started?",
      subheading: "Join us today.",
      ctaLabel: "Get started",
      ctaHref: "#",
      align: "center",
    },
    defaultColSpan: 12,
  },
  {
    type: "social-links",
    label: "Social Links",
    icon: "Share2",
    category: "forms",
    defaultProps: {
      links: [
        { platform: "twitter", url: "" },
        { platform: "instagram", url: "" },
        { platform: "linkedin", url: "" },
      ],
      size: 24,
      align: "left",
    },
    defaultColSpan: 6,
  },

  // ─── Embed ───
  {
    type: "code",
    label: "Code",
    icon: "Code",
    category: "embed",
    defaultProps: {
      code: "",
      language: "javascript",
      showLineNumbers: true,
    },
    defaultColSpan: 12,
  },
  {
    type: "embed",
    label: "Embed",
    icon: "ExternalLink",
    category: "embed",
    defaultProps: {
      html: "",
      aspectRatio: "16/9",
    },
    defaultColSpan: 12,
  },
  {
    type: "map",
    label: "Map",
    icon: "MapPin",
    category: "embed",
    defaultProps: {
      address: "",
      zoom: 14,
      aspectRatio: "16/9",
    },
    defaultColSpan: 12,
  },
  {
    type: "calendar",
    label: "Calendar",
    icon: "Calendar",
    category: "embed",
    defaultProps: {
      url: "",
      provider: "google",
      aspectRatio: "4/3",
    },
    defaultColSpan: 12,
  },
]

export const VISUAL_BLOCK_REGISTRY = new Map<BlockType, BlockDefinition>(
  VISUAL_BLOCK_DEFINITIONS.map((def) => [def.type, def])
)

export function createBlockFromDefinition(type: BlockType): EditorBlock {
  const def = VISUAL_BLOCK_REGISTRY.get(type)
  if (!def) {
    throw new Error(`Unknown block type: ${type}`)
  }
  return createBlock(type, def.defaultProps, def.defaultColSpan)
}
