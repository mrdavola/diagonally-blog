// src/lib/visual-editor/firestore.ts
import {
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  collection,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore"
import { db } from "../firebase"
import type { Section, SiteStyles, SectionTemplate } from "./types"
import { defaultSiteStyles } from "./defaults"
import { migrateBlocksToSections } from "./migration"
import type { Block } from "../blocks/types"

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timestampToDate(ts: unknown): Date {
  if (ts instanceof Timestamp) return ts.toDate()
  if (ts instanceof Date) return ts
  return new Date()
}

// ─── Public page data (dual-format: supports old publishedBlocks + new publishedSections) ───

export interface PublishedPageData {
  publishedSections: Section[] | null
  publishedBlocks: import("../blocks/types").Block[] | null
}

export async function getPublishedPageData(slug: string): Promise<PublishedPageData> {
  const snap = await getDoc(doc(db, "pages", slug))
  if (!snap.exists()) return { publishedSections: null, publishedBlocks: null }

  const data = snap.data() as Record<string, unknown>

  const publishedSections = Array.isArray(data.publishedSections) && data.publishedSections.length > 0
    ? (data.publishedSections as Section[])
    : null

  const publishedBlocks = Array.isArray(data.publishedBlocks) && data.publishedBlocks.length > 0
    ? (data.publishedBlocks as import("../blocks/types").Block[])
    : null

  return { publishedSections, publishedBlocks }
}

// ─── Page Sections ────────────────────────────────────────────────────────────

export async function loadPageSections(
  slug: string
): Promise<{ title: string; sections: Section[] }> {
  const snap = await getDoc(doc(db, "pages", slug))

  if (!snap.exists()) {
    return { title: slug.charAt(0).toUpperCase() + slug.slice(1), sections: [] }
  }

  const data = snap.data() as Record<string, unknown>
  const title = (data.title as string) ?? slug

  // New format: draftSections exists
  if (Array.isArray(data.draftSections) && data.draftSections.length > 0) {
    return { title, sections: data.draftSections as Section[] }
  }

  // Old format: fall back to draftBlocks and auto-migrate
  if (Array.isArray(data.draftBlocks) && data.draftBlocks.length > 0) {
    const sections = migrateBlocksToSections(data.draftBlocks as Block[])
    return { title, sections }
  }

  return { title, sections: [] }
}

export async function saveDraftSections(
  slug: string,
  sections: Section[],
  editorEmail: string
): Promise<void> {
  const ref = doc(db, "pages", slug)
  await setDoc(
    ref,
    {
      draftSections: sections,
      lastEditedBy: editorEmail,
      lastEditedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  )
}

export async function publishPageSections(
  slug: string,
  sections: Section[],
  editorEmail: string
): Promise<void> {
  const ref = doc(db, "pages", slug)

  // Create version snapshot in subcollection
  const versionsRef = collection(db, "pages", slug, "versions")
  const versionsSnap = await getDocs(versionsRef)
  const nextVersion = versionsSnap.size + 1

  await addDoc(versionsRef, {
    version: nextVersion,
    sections,
    publishedBy: editorEmail,
    publishedAt: serverTimestamp(),
    note: "",
  })

  // Copy draft to published
  await setDoc(
    ref,
    {
      publishedSections: sections,
      publishedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  )
}

// ─── Site Styles ──────────────────────────────────────────────────────────────

export async function loadSiteStyles(): Promise<SiteStyles> {
  const snap = await getDoc(doc(db, "config", "styles"))
  if (!snap.exists()) return defaultSiteStyles()

  const data = snap.data() as Record<string, unknown>
  const styles = data as unknown as SiteStyles

  // Hydrate updatedAt if present
  if (data.updatedAt) {
    styles.updatedAt = timestampToDate(data.updatedAt)
  }

  return styles
}

export async function saveSiteStyles(
  styles: SiteStyles,
  editorEmail: string
): Promise<void> {
  const ref = doc(db, "config", "styles")
  await setDoc(
    ref,
    { ...styles, updatedAt: serverTimestamp(), updatedBy: editorEmail },
    { merge: true }
  )
}

// ─── Section Templates ────────────────────────────────────────────────────────

export async function loadSectionTemplates(): Promise<SectionTemplate[]> {
  const snap = await getDocs(collection(db, "sectionTemplates"))
  return snap.docs.map((d) => {
    const data = d.data() as Record<string, unknown>
    return {
      ...(data as unknown as SectionTemplate),
      id: d.id,
      createdAt: timestampToDate(data.createdAt),
    }
  })
}

export async function saveSectionTemplate(
  template: Omit<SectionTemplate, "id"> & { id?: string }
): Promise<void> {
  if (template.id) {
    const ref = doc(db, "sectionTemplates", template.id)
    await setDoc(ref, { ...template, createdAt: serverTimestamp() }, { merge: true })
  } else {
    const colRef = collection(db, "sectionTemplates")
    await addDoc(colRef, { ...template, createdAt: serverTimestamp() })
  }
}
