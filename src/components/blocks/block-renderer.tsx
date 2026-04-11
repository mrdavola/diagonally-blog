"use client"

import type { Block } from "@/lib/blocks/types"
import HeroBlock from "./hero-block"
import RichTextBlock from "./rich-text-block"
import StatsRowBlock from "./stats-row-block"
import TeamCardsBlock from "./team-cards-block"
import CTABannerBlock from "./cta-banner-block"
import TestimonialsBlock from "./testimonials-block"
import FAQAccordionBlock from "./faq-accordion-block"
import SingleImageBlock from "./single-image-block"
import VideoEmbedBlock from "./video-embed-block"
import SpacerBlock from "./spacer-block"
import WaveDividerBlock from "./wave-divider-block"
import PricingCardsBlock from "./pricing-cards-block"
import ComparisonTableBlock from "./comparison-table-block"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const BLOCK_COMPONENTS: Record<string, React.ComponentType<{ props: Record<string, unknown> }>> = {
  "hero": HeroBlock,
  "rich-text": RichTextBlock,
  "stats-row": StatsRowBlock,
  "team-cards": TeamCardsBlock,
  "cta-banner": CTABannerBlock,
  "testimonials": TestimonialsBlock,
  "faq-accordion": FAQAccordionBlock,
  "single-image": SingleImageBlock,
  "video-embed": VideoEmbedBlock,
  "spacer": SpacerBlock,
  "wave-divider": WaveDividerBlock,
  "pricing-cards": PricingCardsBlock,
  "comparison-table": ComparisonTableBlock,
}

export default function BlockRenderer({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((block) => {
        const Component = BLOCK_COMPONENTS[block.type]
        if (!Component) {
          return (
            <div key={block.id} className="bg-cream-dark/50 px-6 py-4 text-sm text-text-dark/40 text-center">
              Unknown block type: <code>{block.type}</code>
            </div>
          )
        }
        return <Component key={block.id} props={block.props} />
      })}
    </>
  )
}
