// src/lib/visual-editor/section-templates/resources.ts
import { createSection, createBlock, createContentZone, defaultSectionLayout } from "../defaults"
import type { SectionTemplate, Section } from "../types"

function makeFAQAccordion(): Section {
  const headingBlock = createBlock("text", {
    content: "<h2>FAQ</h2><p>Answers to the questions we hear most often.</p>",
    align: "center",
  }, 12)
  const accordionBlock = createBlock("accordion", {
    items: [
      { question: "How does it work?", answer: "Our platform guides you through each step with clear instructions and support from our team." },
      { question: "Who is this for?", answer: "Anyone looking to grow, learn, or build something meaningful. We serve individuals and organisations alike." },
      { question: "Is there a free trial?", answer: "Yes — you can explore the core features free for 14 days with no credit card required." },
      { question: "How do I cancel?", answer: "You can cancel anytime from your account settings. There are no cancellation fees." },
    ],
  }, 12)

  const s = createSection("FAQ Accordion")
  return {
    ...s,
    templateId: "faq-accordion",
    layout: { ...defaultSectionLayout(), columns: 1 },
    contentZones: [
      createContentZone([headingBlock, accordionBlock]),
    ],
  }
}

function makeVideoShowcase(): Section {
  const headingBlock = createBlock("text", {
    content: "<h2>Watch</h2><p>See it in action before you commit.</p>",
    align: "center",
  }, 12)
  const videoBlock = createBlock("video", {
    src: "",
    poster: "",
    caption: "Introduction to our platform — 2 min overview",
  }, 12)

  const s = createSection("Video Showcase")
  return {
    ...s,
    templateId: "video-showcase",
    layout: { ...defaultSectionLayout(), columns: 1 },
    contentZones: [
      createContentZone([headingBlock, videoBlock]),
    ],
  }
}

export const resourcesTemplates: SectionTemplate[] = [
  {
    id: "faq-accordion",
    category: "resources",
    name: "FAQ Accordion",
    description: "Expandable FAQ list with heading",
    thumbnailUrl: "",
    section: makeFAQAccordion(),
    isBuiltIn: true,
    createdAt: new Date(),
  },
  {
    id: "video-showcase",
    category: "resources",
    name: "Video Showcase",
    description: "Featured video with heading and caption",
    thumbnailUrl: "",
    section: makeVideoShowcase(),
    isBuiltIn: true,
    createdAt: new Date(),
  },
]
