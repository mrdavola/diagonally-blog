import {
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
  addDoc,
} from "firebase/firestore"
import { db } from "../firebase"
import type { Block, PageDocument, PageVersion } from "./types"

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timestampToDate(ts: unknown): Date {
  if (ts instanceof Timestamp) return ts.toDate()
  if (ts instanceof Date) return ts
  return new Date()
}

function docToPage(data: Record<string, unknown>, slug: string): PageDocument {
  return {
    slug,
    title: (data.title as string) ?? "",
    draftBlocks: (data.draftBlocks as Block[]) ?? [],
    publishedBlocks: (data.publishedBlocks as Block[]) ?? [],
    showInNav: (data.showInNav as boolean) ?? false,
    navOrder: (data.navOrder as number) ?? 0,
    navLabel: (data.navLabel as string) ?? "",
    lastEditedBy: (data.lastEditedBy as string | null) ?? null,
    lastEditedAt: data.lastEditedAt ? timestampToDate(data.lastEditedAt) : null,
    publishedAt: data.publishedAt ? timestampToDate(data.publishedAt) : null,
    createdAt: timestampToDate(data.createdAt),
    updatedAt: timestampToDate(data.updatedAt),
  }
}

// ─── Page CRUD ────────────────────────────────────────────────────────────────

export async function getPage(slug: string): Promise<PageDocument | null> {
  const snap = await getDoc(doc(db, "pages", slug))
  if (!snap.exists()) return null
  return docToPage(snap.data() as Record<string, unknown>, slug)
}

export async function getDraftBlocks(slug: string): Promise<Block[]> {
  const page = await getPage(slug)
  return page?.draftBlocks ?? []
}

export async function getPublishedBlocks(slug: string): Promise<Block[]> {
  const page = await getPage(slug)
  return page?.publishedBlocks ?? []
}

export async function saveDraft(
  slug: string,
  blocks: Block[],
  editedBy: string
): Promise<void> {
  const ref = doc(db, "pages", slug)
  await setDoc(ref, {
    slug,
    title: slug.charAt(0).toUpperCase() + slug.slice(1),
    draftBlocks: blocks,
    publishedBlocks: [],
    showInNav: false,
    navOrder: 0,
    navLabel: slug,
    lastEditedBy: editedBy,
    lastEditedAt: serverTimestamp(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }, { merge: true })
}

export async function publishPage(slug: string, publishedBy: string): Promise<void> {
  const ref = doc(db, "pages", slug)
  const snap = await getDoc(ref)
  if (!snap.exists()) throw new Error(`Page "${slug}" does not exist`)

  const data = snap.data() as Record<string, unknown>
  const draftBlocks = (data.draftBlocks as Block[]) ?? []

  // Get current version count
  const versionsRef = collection(db, "pages", slug, "versions")
  const versionsSnap = await getDocs(versionsRef)
  const nextVersion = versionsSnap.size + 1

  // Save version snapshot
  await addDoc(versionsRef, {
    version: nextVersion,
    blocks: draftBlocks,
    publishedBy,
    publishedAt: serverTimestamp(),
    note: "",
  })

  // Update page
  await updateDoc(ref, {
    publishedBlocks: draftBlocks,
    publishedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export async function discardDraft(slug: string): Promise<void> {
  const ref = doc(db, "pages", slug)
  const snap = await getDoc(ref)
  if (!snap.exists()) throw new Error(`Page "${slug}" does not exist`)

  const data = snap.data() as Record<string, unknown>
  const publishedBlocks = (data.publishedBlocks as Block[]) ?? []

  await updateDoc(ref, {
    draftBlocks: publishedBlocks,
    updatedAt: serverTimestamp(),
  })
}

export async function listPages(): Promise<PageDocument[]> {
  const snap = await getDocs(collection(db, "pages"))
  return snap.docs.map((d) => docToPage(d.data() as Record<string, unknown>, d.id))
}

export async function createPage(slug: string, title: string): Promise<void> {
  const ref = doc(db, "pages", slug)
  await setDoc(ref, {
    slug,
    title,
    draftBlocks: [],
    publishedBlocks: [],
    showInNav: false,
    navOrder: 0,
    navLabel: title,
    lastEditedBy: null,
    lastEditedAt: null,
    publishedAt: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export async function deletePage(slug: string): Promise<void> {
  await deleteDoc(doc(db, "pages", slug))
}

// ─── Version History ──────────────────────────────────────────────────────────

export async function getVersionHistory(slug: string): Promise<PageVersion[]> {
  const versionsRef = collection(db, "pages", slug, "versions")
  const q = query(versionsRef, orderBy("version", "desc"))
  const snap = await getDocs(q)
  return snap.docs.map((d) => {
    const data = d.data() as Record<string, unknown>
    return {
      version: data.version as number,
      blocks: (data.blocks as Block[]) ?? [],
      publishedBy: (data.publishedBy as string) ?? "",
      publishedAt: timestampToDate(data.publishedAt),
      note: (data.note as string) ?? "",
    }
  })
}

export async function revertToVersion(
  slug: string,
  version: PageVersion,
  revertedBy: string
): Promise<void> {
  const ref = doc(db, "pages", slug)

  await updateDoc(ref, {
    draftBlocks: version.blocks,
    lastEditedBy: revertedBy,
    lastEditedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}
