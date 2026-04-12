// src/lib/visual-editor/section-templates/events.ts
import { createSection, createBlock, createContentZone, defaultSectionLayout } from "../defaults"
import type { SectionTemplate, Section } from "../types"

function makeEventCards(): Section {
  const headingBlock = createBlock("text", {
    content: "<h2>Upcoming Events</h2><p>Join us at our next event — we'd love to see you there.</p>",
    align: "center",
  }, 12)
  const card1 = createBlock("card", {
    image: "",
    title: "Annual Summit 2026",
    subtitle: "March 15, 2026 · San Francisco, CA",
    body: "A full-day gathering of leaders, thinkers, and doers. Network, learn, and leave inspired.",
    linkLabel: "Register Now",
    linkUrl: "#",
  }, 4)
  const card2 = createBlock("card", {
    image: "",
    title: "Spring Workshop",
    subtitle: "April 2, 2026 · Online",
    body: "A hands-on workshop covering the fundamentals. Suitable for beginners and intermediates.",
    linkLabel: "Register Now",
    linkUrl: "#",
  }, 4)
  const card3 = createBlock("card", {
    image: "",
    title: "Community Meetup",
    subtitle: "April 20, 2026 · New York, NY",
    body: "An informal evening to connect with the community and share what you've been working on.",
    linkLabel: "Register Now",
    linkUrl: "#",
  }, 4)

  const s = createSection("Event Cards")
  return {
    ...s,
    templateId: "event-cards",
    layout: { ...defaultSectionLayout(), columns: 1 },
    contentZones: [
      createContentZone([headingBlock, card1, card2, card3]),
    ],
  }
}

export const eventsTemplates: SectionTemplate[] = [
  {
    id: "event-cards",
    category: "events",
    name: "Event Cards",
    description: "Three upcoming event cards with dates and links",
    thumbnailUrl: "",
    section: makeEventCards(),
    isBuiltIn: true,
    createdAt: new Date(),
  },
]
