// src/lib/visual-editor/section-templates/index.ts
import { introduceTemplates } from "./introduce"
import { programsTemplates } from "./programs"
import { proofTemplates } from "./proof"
import { engageTemplates } from "./engage"
import { resourcesTemplates } from "./resources"
import { eventsTemplates } from "./events"
import { showcaseTemplates } from "./showcase"
import type { SectionTemplate, SectionCategory } from "../types"

export { introduceTemplates } from "./introduce"
export { programsTemplates } from "./programs"
export { proofTemplates } from "./proof"
export { engageTemplates } from "./engage"
export { resourcesTemplates } from "./resources"
export { eventsTemplates } from "./events"
export { showcaseTemplates } from "./showcase"

/** All built-in templates as a flat array */
export const allTemplates: SectionTemplate[] = [
  ...introduceTemplates,
  ...programsTemplates,
  ...proofTemplates,
  ...engageTemplates,
  ...resourcesTemplates,
  ...eventsTemplates,
  ...showcaseTemplates,
]

/** Templates grouped by category */
export const templatesByCategory: Record<SectionCategory, SectionTemplate[]> = {
  introduce: introduceTemplates,
  programs: programsTemplates,
  proof: proofTemplates,
  engage: engageTemplates,
  resources: resourcesTemplates,
  events: eventsTemplates,
  showcase: showcaseTemplates,
}

/** Category display metadata */
export const CATEGORY_META: Record<SectionCategory, { label: string; description: string }> = {
  introduce: { label: "Introduce", description: "Hero sections and introductions" },
  programs: { label: "Programs", description: "Features and how it works" },
  proof: { label: "Proof", description: "Testimonials, stats, and logos" },
  engage: { label: "Engage", description: "CTAs, newsletters, and forms" },
  resources: { label: "Resources", description: "FAQs and video content" },
  events: { label: "Events", description: "Upcoming event listings" },
  showcase: { label: "Showcase", description: "Galleries and image layouts" },
}

export const CATEGORY_ORDER: SectionCategory[] = [
  "introduce",
  "programs",
  "proof",
  "engage",
  "resources",
  "events",
  "showcase",
]
