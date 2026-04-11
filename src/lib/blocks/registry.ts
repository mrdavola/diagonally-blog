export interface FieldSchema {
  key: string
  label: string
  type:
    | "text"
    | "textarea"
    | "richtext"
    | "color"
    | "url"
    | "select"
    | "number"
    | "toggle"
    | "array"
    | "image"
  options?: { label: string; value: string }[]
  arrayFields?: FieldSchema[]
  placeholder?: string
}

export interface BlockDefinition {
  type: string
  label: string
  icon: string
  category: "layout" | "content" | "media" | "utility"
  defaultProps: Record<string, unknown>
  fields: FieldSchema[]
}

const BLOCK_DEFINITIONS: BlockDefinition[] = [
  {
    type: "hero",
    label: "Hero",
    icon: "Sparkles",
    category: "layout",
    defaultProps: {
      headline: "Think Diagonally.",
      subheadline: "A math learning platform where students build games instead of taking tests.",
      cta1Text: "Request a Demo",
      cta1Href: "#demo",
      cta2Text: "Learn More",
      cta2Href: "#about",
      showConstellation: true,
    },
    fields: [
      { key: "headline", label: "Headline", type: "text", placeholder: "Enter headline" },
      { key: "subheadline", label: "Subheadline", type: "textarea", placeholder: "Enter subheadline" },
      { key: "cta1Text", label: "Primary CTA Text", type: "text", placeholder: "e.g. Get Started" },
      { key: "cta1Href", label: "Primary CTA Link", type: "url", placeholder: "https://" },
      { key: "cta2Text", label: "Secondary CTA Text", type: "text", placeholder: "e.g. Learn More" },
      { key: "cta2Href", label: "Secondary CTA Link", type: "url", placeholder: "https://" },
      { key: "showConstellation", label: "Show Constellation", type: "toggle" },
    ],
  },
  {
    type: "rich-text",
    label: "Rich Text",
    icon: "FileText",
    category: "content",
    defaultProps: {
      content: "",
    },
    fields: [
      { key: "content", label: "Content", type: "richtext", placeholder: "Enter content..." },
    ],
  },
  {
    type: "stats-row",
    label: "Stats Row",
    icon: "BarChart2",
    category: "content",
    defaultProps: {
      stats: [
        { value: "11/11", label: "wanted to keep building after spring break" },
        { value: "0", label: "prompts needed to start collaborating" },
        { value: "4", label: "learners recorded explaining their ideas" },
        { value: "6", label: "AI iterations by one learner before time ran out" },
      ],
    },
    fields: [
      {
        key: "stats",
        label: "Stats",
        type: "array",
        arrayFields: [
          { key: "value", label: "Value", type: "text", placeholder: "e.g. 11/11" },
          { key: "label", label: "Label", type: "text", placeholder: "e.g. wanted to continue" },
        ],
      },
    ],
  },
  {
    type: "team-cards",
    label: "Team Cards",
    icon: "Users",
    category: "content",
    defaultProps: {
      useDefaultTeam: true,
      members: [],
    },
    fields: [
      { key: "useDefaultTeam", label: "Use Default Team Data", type: "toggle" },
      {
        key: "members",
        label: "Members (override)",
        type: "array",
        arrayFields: [
          { key: "name", label: "Name", type: "text" },
          { key: "role", label: "Role", type: "text" },
          { key: "bio", label: "Bio", type: "textarea" },
          { key: "image", label: "Image", type: "image" },
        ],
      },
    ],
  },
  {
    type: "cta-banner",
    label: "CTA Banner",
    icon: "Megaphone",
    category: "layout",
    defaultProps: {
      headline: "Ready to get started?",
      subheadline: "Join schools already using Diagonally.",
      cta1Text: "Request a Demo",
      cta1Href: "#demo",
      cta2Text: "Learn More",
      cta2Href: "#about",
    },
    fields: [
      { key: "headline", label: "Headline", type: "text" },
      { key: "subheadline", label: "Subheadline", type: "textarea" },
      { key: "cta1Text", label: "Primary CTA Text", type: "text" },
      { key: "cta1Href", label: "Primary CTA Link", type: "url" },
      { key: "cta2Text", label: "Secondary CTA Text", type: "text" },
      { key: "cta2Href", label: "Secondary CTA Link", type: "url" },
    ],
  },
  {
    type: "testimonials",
    label: "Testimonials",
    icon: "Quote",
    category: "content",
    defaultProps: {
      quotes: [
        { text: "This is an amazing product!", author: "Jane Doe", role: "Teacher" },
      ],
    },
    fields: [
      {
        key: "quotes",
        label: "Quotes",
        type: "array",
        arrayFields: [
          { key: "text", label: "Quote Text", type: "textarea" },
          { key: "author", label: "Author", type: "text" },
          { key: "role", label: "Role / Title", type: "text" },
        ],
      },
    ],
  },
  {
    type: "faq-accordion",
    label: "FAQ Accordion",
    icon: "HelpCircle",
    category: "content",
    defaultProps: {
      items: [
        { question: "What is Diagonally?", answer: "A math learning platform where students build games instead of taking tests." },
      ],
    },
    fields: [
      {
        key: "items",
        label: "FAQ Items",
        type: "array",
        arrayFields: [
          { key: "question", label: "Question", type: "text" },
          { key: "answer", label: "Answer", type: "textarea" },
        ],
      },
    ],
  },
  {
    type: "single-image",
    label: "Single Image",
    icon: "Image",
    category: "media",
    defaultProps: {
      src: "",
      alt: "",
      caption: "",
    },
    fields: [
      { key: "src", label: "Image", type: "image" },
      { key: "alt", label: "Alt Text", type: "text", placeholder: "Describe the image" },
      { key: "caption", label: "Caption", type: "text", placeholder: "Optional caption" },
    ],
  },
  {
    type: "video-embed",
    label: "Video Embed",
    icon: "Play",
    category: "media",
    defaultProps: {
      url: "",
      caption: "",
    },
    fields: [
      { key: "url", label: "Video URL", type: "url", placeholder: "https://youtube.com/..." },
      { key: "caption", label: "Caption", type: "text", placeholder: "Optional caption" },
    ],
  },
  {
    type: "spacer",
    label: "Spacer",
    icon: "AlignVerticalDistributeCenter",
    category: "utility",
    defaultProps: {
      height: 64,
    },
    fields: [
      { key: "height", label: "Height (px)", type: "number" },
    ],
  },
  {
    type: "wave-divider",
    label: "Wave Divider",
    icon: "Waves",
    category: "utility",
    defaultProps: {
      topColor: "#ffffff",
      bottomColor: "#f8f9fa",
    },
    fields: [
      { key: "topColor", label: "Top Color", type: "color" },
      { key: "bottomColor", label: "Bottom Color", type: "color" },
    ],
  },
  {
    type: "pricing-cards",
    label: "Pricing Cards",
    icon: "CreditCard",
    category: "content",
    defaultProps: {
      tiers: [
        {
          name: "Starter",
          price: "Free",
          description: "For individual teachers",
          features: ["Up to 30 students", "Basic analytics", "Community access"],
          ctaText: "Get Started",
          ctaHref: "#",
          highlighted: false,
        },
        {
          name: "School",
          price: "$299/mo",
          description: "For entire schools",
          features: ["Unlimited students", "Advanced analytics", "Priority support", "Custom branding"],
          ctaText: "Request Demo",
          ctaHref: "#demo",
          highlighted: true,
        },
      ],
    },
    fields: [
      {
        key: "tiers",
        label: "Pricing Tiers",
        type: "array",
        arrayFields: [
          { key: "name", label: "Tier Name", type: "text" },
          { key: "price", label: "Price", type: "text" },
          { key: "description", label: "Description", type: "text" },
          { key: "ctaText", label: "CTA Text", type: "text" },
          { key: "ctaHref", label: "CTA Link", type: "url" },
          { key: "highlighted", label: "Highlighted", type: "toggle" },
        ],
      },
    ],
  },
  {
    type: "comparison-table",
    label: "Comparison Table",
    icon: "Table",
    category: "content",
    defaultProps: {
      columns: ["Feature", "Them", "Diagonally"],
      rows: [
        { label: "Student ownership", values: [false, true] },
        { label: "Community", values: [false, true] },
        { label: "Progress tracking", values: [false, true] },
      ],
    },
    fields: [
      {
        key: "columns",
        label: "Column Headers",
        type: "array",
        arrayFields: [
          { key: "value", label: "Column Name", type: "text" },
        ],
      },
      {
        key: "rows",
        label: "Rows",
        type: "array",
        arrayFields: [
          { key: "label", label: "Row Label", type: "text" },
        ],
      },
    ],
  },
]

export const BLOCK_REGISTRY: Map<string, BlockDefinition> = new Map(
  BLOCK_DEFINITIONS.map((def) => [def.type, def])
)

export function createBlock(type: string): { id: string; type: string; props: Record<string, unknown> } {
  const definition = BLOCK_REGISTRY.get(type)
  if (!definition) {
    throw new Error(`Unknown block type: ${type}`)
  }
  return {
    id: crypto.randomUUID(),
    type,
    props: { ...definition.defaultProps },
  }
}
