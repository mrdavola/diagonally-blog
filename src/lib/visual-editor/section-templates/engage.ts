// src/lib/visual-editor/section-templates/engage.ts
import { createSection, createBlock, createContentZone, generateId, defaultSectionLayout } from "../defaults"
import type { SectionTemplate, Section } from "../types"

function makeCtaBanner(): Section {
  const ctaBlock = createBlock("cta-banner", {
    headline: "Ready to Get Started?",
    subheadline: "Join thousands of people already benefiting from our platform.",
    buttonLabel: "Start Today",
    buttonUrl: "#",
    buttonVariant: "filled",
    align: "center",
  }, 12)

  const s = createSection("CTA Banner")
  return {
    ...s,
    templateId: "cta-banner",
    layout: { ...defaultSectionLayout(), columns: 1 },
    contentZones: [
      createContentZone([ctaBlock]),
    ],
  }
}

function makeNewsletter(): Section {
  const newsletterBlock = createBlock("newsletter-signup", {
    heading: "Stay in the Loop",
    subheading: "Get the latest updates, tips, and resources delivered to your inbox.",
    placeholder: "Enter your email",
    buttonLabel: "Subscribe",
    privacyNote: "No spam, ever. Unsubscribe at any time.",
  }, 12)

  const s = createSection("Newsletter")
  return {
    ...s,
    templateId: "newsletter",
    layout: { ...defaultSectionLayout(), columns: 1 },
    contentZones: [
      createContentZone([newsletterBlock]),
    ],
  }
}

function makeContactForm(): Section {
  const textBlock = createBlock("text", {
    content: "<h2>Get In Touch</h2><p>Have a question or want to learn more? We'd love to hear from you. Fill out the form and we'll be in touch shortly.</p>",
  }, 12)
  const formBlock = createBlock("form", {
    fields: [
      { type: "text", label: "Full Name", required: true },
      { type: "email", label: "Email Address", required: true },
      { type: "textarea", label: "Your Message", required: true },
    ],
    submitLabel: "Send Message",
  }, 12)

  const s = createSection("Contact Form")
  return {
    ...s,
    templateId: "contact-form",
    layout: { ...defaultSectionLayout(), columns: 2, columnRatio: "1:1" },
    contentZones: [
      { id: generateId(), gridColumns: 12, blocks: [textBlock] },
      { id: generateId(), gridColumns: 12, blocks: [formBlock] },
    ],
  }
}

export const engageTemplates: SectionTemplate[] = [
  {
    id: "cta-banner",
    category: "engage",
    name: "CTA Banner",
    description: "Full-width call to action with headline and button",
    thumbnailUrl: "",
    section: makeCtaBanner(),
    isBuiltIn: true,
    createdAt: new Date(),
  },
  {
    id: "newsletter",
    category: "engage",
    name: "Newsletter",
    description: "Email signup with heading and privacy note",
    thumbnailUrl: "",
    section: makeNewsletter(),
    isBuiltIn: true,
    createdAt: new Date(),
  },
  {
    id: "contact-form",
    category: "engage",
    name: "Contact Form",
    description: "Two-column layout with info text and form",
    thumbnailUrl: "",
    section: makeContactForm(),
    isBuiltIn: true,
    createdAt: new Date(),
  },
]
