import type { Block } from "./types"
import { createBlock } from "./registry"

// Default blocks for the homepage, matching the current hardcoded sections.
// Used when seeding Firestore on first run.
export const DEFAULT_HOME_BLOCKS: Block[] = [
  {
    ...createBlock("hero"),
    props: {
      headline: "Think Diagonally.",
      subheadline:
        "A math learning platform where students build games instead of taking tests.",
      cta1Text: "Request a Demo",
      cta1Href: "#demo",
      cta2Text: "See How It Works",
      cta2Href: "#how-it-works",
      showConstellation: true,
    },
  },
  {
    ...createBlock("stats-row"),
    props: {
      stats: [
        { value: "11/11", label: "wanted to keep building after spring break" },
        { value: "0", label: "prompts needed to start collaborating" },
        { value: "4", label: "learners recorded explaining their ideas" },
        { value: "6", label: "AI iterations by one learner before time ran out" },
      ],
    },
  },
  {
    ...createBlock("team-cards"),
    props: {
      useDefaultTeam: true,
      members: [],
    },
  },
  {
    ...createBlock("comparison-table"),
    props: {
      columns: ["Platform", "Description", "Student Ownership", "Community", "Tracking", "AI", "Open Source"],
      rows: [
        { label: "Khanmigo", values: [false, false, true, true, false] },
        { label: "MagicSchool", values: [false, false, false, true, false] },
        { label: "Synthesis", values: [true, true, true, false, false] },
        { label: "ChatGPT", values: [false, false, false, true, false] },
        { label: "Diagonally", values: [true, true, true, true, true] },
      ],
    },
  },
  {
    ...createBlock("cta-banner"),
    props: {
      headline: "Ready to bring Diagonally to your school?",
      subheadline: "Request a demo and see what student-built math looks like.",
      cta1Text: "Request a Demo",
      cta1Href: "#demo",
      cta2Text: "Learn More",
      cta2Href: "/about",
    },
  },
]

export const PAGE_DEFAULTS: Record<string, Block[]> = {
  home: DEFAULT_HOME_BLOCKS,
}
