"use client"

import type { ContentZone, EditorBlock } from "@/lib/visual-editor/types"
import { TextBlock } from "./blocks/text-block"
import { ImageBlock } from "./blocks/image-block"
import { ButtonBlock } from "./blocks/button-block"
import { SpacerBlock } from "./blocks/spacer-block"
import { VideoBlock } from "./blocks/video-block"
import { IconBlock } from "./blocks/icon-block"
import { ColumnsBlock } from "./blocks/columns-block"
import { CardBlock } from "./blocks/card-block"
import { AccordionBlock } from "./blocks/accordion-block"
import { TabsBlock } from "./blocks/tabs-block"
import { DividerBlock } from "./blocks/divider-block"
import { GalleryBlock } from "./blocks/gallery-block"
import { CarouselBlock } from "./blocks/carousel-block"
import { AudioBlock } from "./blocks/audio-block"
import { StatsBlock } from "./blocks/stats-block"
import { PricingBlock } from "./blocks/pricing-block"
import { ComparisonBlock } from "./blocks/comparison-block"
import { ChartBlock } from "./blocks/chart-block"
import { FormBlock } from "./blocks/form-block"
import { NewsletterBlock } from "./blocks/newsletter-block"
import { CtaBlock } from "./blocks/cta-block"
import { SocialBlock } from "./blocks/social-block"
import { CodeBlock } from "./blocks/code-block"
import { EmbedBlock } from "./blocks/embed-block"
import { MapBlock } from "./blocks/map-block"
import { CalendarBlock } from "./blocks/calendar-block"

interface BlockComponentProps {
  block: EditorBlock
}

function FallbackBlock({ block }: BlockComponentProps) {
  return (
    <div
      style={{
        border: "2px dashed #d1d5db",
        borderRadius: 4,
        padding: "1rem",
        fontSize: 13,
        color: "#6b7280",
        background: "#f9fafb",
      }}
    >
      {block.type} block
    </div>
  )
}

const BLOCK_COMPONENTS: Record<
  string,
  React.ComponentType<BlockComponentProps>
> = {
  // Essentials
  text: TextBlock,
  image: ImageBlock,
  button: ButtonBlock,
  video: VideoBlock,
  icon: IconBlock,
  // Layout
  columns: ColumnsBlock,
  card: CardBlock,
  accordion: AccordionBlock,
  tabs: TabsBlock,
  divider: DividerBlock,
  spacer: SpacerBlock,
  // Media
  gallery: GalleryBlock,
  "image-carousel": CarouselBlock,
  audio: AudioBlock,
  // Data
  "stats-row": StatsBlock,
  "pricing-card": PricingBlock,
  "comparison-table": ComparisonBlock,
  chart: ChartBlock,
  // Forms & Actions
  form: FormBlock,
  "newsletter-signup": NewsletterBlock,
  "cta-banner": CtaBlock,
  "social-links": SocialBlock,
  // Embed
  code: CodeBlock,
  embed: EmbedBlock,
  map: MapBlock,
  calendar: CalendarBlock,
}

function getBlockWrapperStyles(block: EditorBlock): React.CSSProperties {
  const { position, style } = block
  const css: React.CSSProperties = {
    // Use span-only for gridColumn so CSS grid auto-flow handles row placement.
    // Explicit col/row positions (all defaulting to 1) caused blocks to pile up.
    gridColumn: `span ${position.colSpan}`,
  }

  if (style.margin) {
    const m = style.margin
    css.margin = `${m.top ?? 0}px ${m.right ?? 0}px ${m.bottom ?? 0}px ${m.left ?? 0}px`
  }
  if (style.padding) {
    const p = style.padding
    css.padding = `${p.top ?? 0}px ${p.right ?? 0}px ${p.bottom ?? 0}px ${p.left ?? 0}px`
  }
  if (style.background) css.background = style.background
  if (style.borderRadius != null) css.borderRadius = style.borderRadius
  if (style.opacity != null) css.opacity = style.opacity
  if (style.shadow && style.shadow !== "none") {
    const shadows: Record<string, string> = {
      sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
      md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
      lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
    }
    css.boxShadow = shadows[style.shadow] ?? undefined
  }

  return css
}

interface ZoneRendererProps {
  zone: ContentZone
}

export function ZoneRenderer({ zone }: ZoneRendererProps) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${zone.gridColumns}, 1fr)`,
        gridAutoRows: "min-content",
        gap: 16,
      }}
    >
      {zone.blocks.map((block) => {
        const BlockComponent =
          BLOCK_COMPONENTS[block.type] ?? FallbackBlock

        return (
          <div
            key={block.id}
            data-block-id={block.id}
            data-block-type={block.type}
            style={getBlockWrapperStyles(block)}
          >
            <BlockComponent block={block} />
          </div>
        )
      })}
    </div>
  )
}
