// src/lib/visual-editor/section-templates/programs.ts
import { createSection, createBlock, createContentZone, defaultSectionLayout } from "../defaults"
import type { SectionTemplate, Section } from "../types"

function makeHowItWorks(): Section {
  const headingBlock = createBlock("text", {
    content: "<h2>How It Works</h2><p>Get up and running in three simple steps.</p>",
    align: "center",
  }, 12)
  const stepsBlock = createBlock("stats-row", {
    items: [
      { label: "Sign Up", value: "01", description: "Create your account and tell us about your goals." },
      { label: "Get Matched", value: "02", description: "We connect you with the right resources and people." },
      { label: "Start Growing", value: "03", description: "Take action with your personalised plan and support." },
    ],
  }, 12)

  const s = createSection("How It Works")
  return {
    ...s,
    templateId: "how-it-works",
    layout: { ...defaultSectionLayout(), columns: 1 },
    contentZones: [
      createContentZone([headingBlock, stepsBlock]),
    ],
  }
}

function makeFeatureGrid(): Section {
  const headingBlock = createBlock("text", {
    content: "<h2>Features</h2><p>Everything you need to succeed.</p>",
    align: "center",
  }, 12)
  const card1 = createBlock("card", {
    icon: "Zap",
    title: "Fast & Reliable",
    body: "Built for performance so you can focus on what matters.",
  }, 4)
  const card2 = createBlock("card", {
    icon: "Shield",
    title: "Secure by Default",
    body: "Enterprise-grade security with zero configuration required.",
  }, 4)
  const card3 = createBlock("card", {
    icon: "BarChart",
    title: "Actionable Insights",
    body: "Real-time analytics that help you make smarter decisions.",
  }, 4)

  const s = createSection("Feature Grid")
  return {
    ...s,
    templateId: "feature-grid",
    layout: { ...defaultSectionLayout(), columns: 1 },
    contentZones: [
      createContentZone([headingBlock, card1, card2, card3]),
    ],
  }
}

export const programsTemplates: SectionTemplate[] = [
  {
    id: "how-it-works",
    category: "programs",
    name: "How It Works",
    description: "Numbered steps showing your process",
    thumbnailUrl: "",
    section: makeHowItWorks(),
    isBuiltIn: true,
    createdAt: new Date(),
  },
  {
    id: "feature-grid",
    category: "programs",
    name: "Feature Grid",
    description: "Three-column feature cards with icons",
    thumbnailUrl: "",
    section: makeFeatureGrid(),
    isBuiltIn: true,
    createdAt: new Date(),
  },
]
