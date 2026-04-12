// src/lib/visual-editor/section-templates/proof.ts
import { createSection, createBlock, createContentZone, defaultSectionLayout } from "../defaults"
import type { SectionTemplate, Section } from "../types"

function makeTestimonials(): Section {
  const headingBlock = createBlock("text", {
    content: "<h2>What People Say</h2><p>Hear from the people we've had the privilege of working with.</p>",
    align: "center",
  }, 12)
  const card1 = createBlock("card", {
    quote: "This completely changed how our team operates. We're more aligned and productive than ever before.",
    author: "Sarah M.",
    role: "Operations Lead",
  }, 6)
  const card2 = createBlock("card", {
    quote: "I was skeptical at first, but the results speak for themselves. Highly recommend to anyone on the fence.",
    author: "David K.",
    role: "Founder, TechStart",
  }, 6)

  const s = createSection("Testimonials")
  return {
    ...s,
    templateId: "testimonials",
    layout: { ...defaultSectionLayout(), columns: 1 },
    contentZones: [
      createContentZone([headingBlock, card1, card2]),
    ],
  }
}

function makeStatsBar(): Section {
  const statsBlock = createBlock("stats-row", {
    items: [
      { label: "Active Users", value: "10,000+", description: "Across 40 countries" },
      { label: "Projects Completed", value: "2,500+", description: "And counting" },
      { label: "Client Satisfaction", value: "98%", description: "Average rating" },
      { label: "Years in Business", value: "12", description: "Of proven expertise" },
    ],
  }, 12)

  const s = createSection("Stats Bar")
  return {
    ...s,
    templateId: "stats-bar",
    layout: { ...defaultSectionLayout(), columns: 1 },
    contentZones: [
      createContentZone([statsBlock]),
    ],
  }
}

function makeLogoWall(): Section {
  const headingBlock = createBlock("text", {
    content: "<h2>Trusted By</h2>",
    align: "center",
  }, 12)
  const galleryBlock = createBlock("gallery", {
    images: [
      { src: "", alt: "Partner logo 1" },
      { src: "", alt: "Partner logo 2" },
      { src: "", alt: "Partner logo 3" },
      { src: "", alt: "Partner logo 4" },
    ],
    columns: 4,
    aspectRatio: "3:1",
  }, 12)

  const s = createSection("Logo Wall")
  return {
    ...s,
    templateId: "logo-wall",
    layout: { ...defaultSectionLayout(), columns: 1 },
    contentZones: [
      createContentZone([headingBlock, galleryBlock]),
    ],
  }
}

export const proofTemplates: SectionTemplate[] = [
  {
    id: "testimonials",
    category: "proof",
    name: "Testimonials",
    description: "Two-column quote cards with attribution",
    thumbnailUrl: "",
    section: makeTestimonials(),
    isBuiltIn: true,
    createdAt: new Date(),
  },
  {
    id: "stats-bar",
    category: "proof",
    name: "Stats Bar",
    description: "Four impressive numbers in a row",
    thumbnailUrl: "",
    section: makeStatsBar(),
    isBuiltIn: true,
    createdAt: new Date(),
  },
  {
    id: "logo-wall",
    category: "proof",
    name: "Logo Wall",
    description: "Partner or client logos in a grid",
    thumbnailUrl: "",
    section: makeLogoWall(),
    isBuiltIn: true,
    createdAt: new Date(),
  },
]
