// src/lib/visual-editor/section-templates/introduce.ts
import { createSection, createBlock, createContentZone, generateId, defaultSectionLayout } from "../defaults"
import type { SectionTemplate, Section } from "../types"

function makeHeroSplit(): Section {
  const textBlock = createBlock("text", {
    content: "<h1>Your Headline Here</h1><p>Add a compelling subtitle that describes your value proposition.</p>",
  }, 12)
  const buttonBlock = createBlock("button", {
    label: "Get Started", url: "#", variant: "filled", align: "left",
  }, 4)
  const imageBlock = createBlock("image", {
    src: "", alt: "Hero image",
  }, 12)

  const s = createSection("Hero Split")
  return {
    ...s,
    templateId: "hero-split",
    layout: { ...defaultSectionLayout(), columns: 2, columnRatio: "1:1" },
    contentZones: [
      { id: generateId(), gridColumns: 12, blocks: [textBlock, buttonBlock] },
      { id: generateId(), gridColumns: 12, blocks: [imageBlock] },
    ],
  }
}

function makeHeroCentered(): Section {
  const textBlock = createBlock("text", {
    content: "<h1>Welcome to Our Platform</h1><p>A compelling subtitle that explains what you do and why it matters.</p>",
    align: "center",
  }, 12)
  const buttonBlock = createBlock("button", {
    label: "Get Started", url: "#", variant: "filled", align: "center",
  }, 4)

  const s = createSection("Hero Centered")
  return {
    ...s,
    templateId: "hero-centered",
    layout: { ...defaultSectionLayout(), columns: 1 },
    contentZones: [
      createContentZone([textBlock, buttonBlock]),
    ],
  }
}

function makeAbout(): Section {
  const imageBlock = createBlock("image", {
    src: "", alt: "About us image",
  }, 12)
  const textBlock = createBlock("text", {
    content: "<h2>About Us</h2><p>Tell your story here. Share your mission, values, and what makes your organization unique. Connect with your audience on a personal level.</p>",
  }, 12)

  const s = createSection("About")
  return {
    ...s,
    templateId: "about",
    layout: { ...defaultSectionLayout(), columns: 2, columnRatio: "1:1" },
    contentZones: [
      { id: generateId(), gridColumns: 12, blocks: [imageBlock] },
      { id: generateId(), gridColumns: 12, blocks: [textBlock] },
    ],
  }
}

function makeTeamGrid(): Section {
  const headingBlock = createBlock("text", {
    content: "<h2>Our Team</h2><p>Meet the people behind our work.</p>",
    align: "center",
  }, 12)
  const card1 = createBlock("card", {
    image: "", title: "Jane Smith", subtitle: "Co-Founder & CEO",
    body: "Passionate about building meaningful products.",
  }, 4)
  const card2 = createBlock("card", {
    image: "", title: "Alex Johnson", subtitle: "Head of Design",
    body: "Creating beautiful experiences for every user.",
  }, 4)
  const card3 = createBlock("card", {
    image: "", title: "Sam Lee", subtitle: "Lead Engineer",
    body: "Building scalable systems that just work.",
  }, 4)

  const s = createSection("Team Grid")
  return {
    ...s,
    templateId: "team-grid",
    layout: { ...defaultSectionLayout(), columns: 1 },
    contentZones: [
      createContentZone([headingBlock, card1, card2, card3]),
    ],
  }
}

function makeFAQ(): Section {
  const headingBlock = createBlock("text", {
    content: "<h2>Frequently Asked Questions</h2>",
    align: "center",
  }, 12)
  const accordionBlock = createBlock("accordion", {
    items: [
      { question: "What is your main service?", answer: "We provide top-tier solutions tailored to your specific needs. Our team works closely with you to understand your goals." },
      { question: "How do I get started?", answer: "Simply click the Get Started button and fill out a brief form. We'll reach out within one business day." },
      { question: "What is your pricing model?", answer: "We offer flexible pricing to suit businesses of all sizes. Contact us for a custom quote." },
    ],
  }, 12)

  const s = createSection("FAQ")
  return {
    ...s,
    templateId: "faq",
    layout: { ...defaultSectionLayout(), columns: 1 },
    contentZones: [
      createContentZone([headingBlock, accordionBlock]),
    ],
  }
}

export const introduceTemplates: SectionTemplate[] = [
  {
    id: "hero-split",
    category: "introduce",
    name: "Hero Split",
    description: "Two-column hero with text and image side by side",
    thumbnailUrl: "",
    section: makeHeroSplit(),
    isBuiltIn: true,
    createdAt: new Date(),
  },
  {
    id: "hero-centered",
    category: "introduce",
    name: "Hero Centered",
    description: "Single-column centered hero with headline and CTA",
    thumbnailUrl: "",
    section: makeHeroCentered(),
    isBuiltIn: true,
    createdAt: new Date(),
  },
  {
    id: "about",
    category: "introduce",
    name: "About",
    description: "Two-column about section with image and text",
    thumbnailUrl: "",
    section: makeAbout(),
    isBuiltIn: true,
    createdAt: new Date(),
  },
  {
    id: "team-grid",
    category: "introduce",
    name: "Team Grid",
    description: "Team member cards in a row",
    thumbnailUrl: "",
    section: makeTeamGrid(),
    isBuiltIn: true,
    createdAt: new Date(),
  },
  {
    id: "faq-intro",
    category: "introduce",
    name: "FAQ",
    description: "Accordion FAQ with heading",
    thumbnailUrl: "",
    section: makeFAQ(),
    isBuiltIn: true,
    createdAt: new Date(),
  },
]
