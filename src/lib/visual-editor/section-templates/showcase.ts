// src/lib/visual-editor/section-templates/showcase.ts
import { createSection, createBlock, createContentZone, generateId, defaultSectionLayout } from "../defaults"
import type { SectionTemplate, Section } from "../types"

function makeGalleryGrid(): Section {
  const headingBlock = createBlock("text", {
    content: "<h2>Gallery</h2><p>A glimpse of our work and community.</p>",
    align: "center",
  }, 12)
  const galleryBlock = createBlock("gallery", {
    images: [
      { src: "", alt: "Gallery image 1" },
      { src: "", alt: "Gallery image 2" },
      { src: "", alt: "Gallery image 3" },
      { src: "", alt: "Gallery image 4" },
      { src: "", alt: "Gallery image 5" },
      { src: "", alt: "Gallery image 6" },
    ],
    columns: 3,
    aspectRatio: "4:3",
    gap: 12,
  }, 12)

  const s = createSection("Gallery Grid")
  return {
    ...s,
    templateId: "gallery-grid",
    layout: { ...defaultSectionLayout(), columns: 1 },
    contentZones: [
      createContentZone([headingBlock, galleryBlock]),
    ],
  }
}

function makeImageAndText(): Section {
  const imageBlock = createBlock("image", {
    src: "", alt: "Feature image",
  }, 12)
  const textBlock = createBlock("text", {
    content: "<h2>A Picture Worth a Thousand Words</h2><p>Use this layout to pair a striking visual with a compelling story. Great for product features, process explanations, or announcements.</p>",
  }, 12)

  const s = createSection("Image and Text")
  return {
    ...s,
    templateId: "image-and-text",
    layout: { ...defaultSectionLayout(), columns: 2, columnRatio: "1:1" },
    contentZones: [
      { id: generateId(), gridColumns: 12, blocks: [imageBlock] },
      { id: generateId(), gridColumns: 12, blocks: [textBlock] },
    ],
  }
}

export const showcaseTemplates: SectionTemplate[] = [
  {
    id: "gallery-grid",
    category: "showcase",
    name: "Gallery Grid",
    description: "Three-column image gallery with heading",
    thumbnailUrl: "",
    section: makeGalleryGrid(),
    isBuiltIn: true,
    createdAt: new Date(),
  },
  {
    id: "image-and-text",
    category: "showcase",
    name: "Image and Text",
    description: "Two-column layout with image left and text right",
    thumbnailUrl: "",
    section: makeImageAndText(),
    isBuiltIn: true,
    createdAt: new Date(),
  },
]
