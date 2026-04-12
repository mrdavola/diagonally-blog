import {
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  collection,
  query,
  orderBy,
  where,
  limit,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore"
import { db } from "./firebase"
import type { PostDocument, TiptapJSON, PostVersion } from "./blocks/types"

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timestampToDate(ts: unknown): Date {
  if (ts instanceof Timestamp) return ts.toDate()
  if (ts instanceof Date) return ts
  return new Date()
}

function docToPost(data: Record<string, unknown>, slug: string): PostDocument {
  // Handle legacy authorId (string) → authorIds (string[])
  let authorIds: string[]
  if (Array.isArray(data.authorIds)) {
    authorIds = data.authorIds as string[]
  } else if (typeof data.authorId === "string" && data.authorId) {
    authorIds = [data.authorId]
  } else {
    authorIds = []
  }

  return {
    slug,
    title: (data.title as string) ?? "",
    subtitle: (data.subtitle as string) ?? "",
    excerpt: (data.excerpt as string) ?? "",
    coverImage: (data.coverImage as string) ?? "",
    coverImageFocalPoint: (data.coverImageFocalPoint as PostDocument["coverImageFocalPoint"]) ?? undefined,
    authorIds,
    category: (data.category as string) ?? "",
    tags: Array.isArray(data.tags) ? (data.tags as string[]) : [],
    draftContent: (data.draftContent as PostDocument["draftContent"]) ?? [],
    publishedContent: (data.publishedContent as PostDocument["publishedContent"]) ?? null,
    metaTitle: (data.metaTitle as string) ?? undefined,
    metaDescription: (data.metaDescription as string) ?? undefined,
    ogImage: (data.ogImage as string) ?? undefined,
    canonicalUrl: (data.canonicalUrl as string) ?? undefined,
    status: (data.status as "draft" | "scheduled" | "published") ?? "draft",
    scheduledAt: data.scheduledAt ? timestampToDate(data.scheduledAt) : null,
    publishedAt: data.publishedAt ? timestampToDate(data.publishedAt) : null,
    createdAt: timestampToDate(data.createdAt),
    updatedAt: timestampToDate(data.updatedAt),
    wordCount: (data.wordCount as number) ?? 0,
    readTimeMinutes: (data.readTimeMinutes as number) ?? 0,
    templateId: (data.templateId as string) ?? undefined,
  }
}

// ─── CRUD ─────────────────────────────────────────────────────────────────────

export async function listPosts(category?: string): Promise<PostDocument[]> {
  const postsRef = collection(db, "posts")
  const constraints = category
    ? [where("category", "==", category), orderBy("publishedAt", "desc")]
    : [orderBy("publishedAt", "desc")]

  const q = query(postsRef, ...constraints)
  const snap = await getDocs(q)
  return snap.docs.map((d) => docToPost(d.data() as Record<string, unknown>, d.id))
}

export async function getPost(slug: string): Promise<PostDocument | null> {
  const snap = await getDoc(doc(db, "posts", slug))
  if (!snap.exists()) return null
  return docToPost(snap.data() as Record<string, unknown>, slug)
}

export async function savePost(
  post: Partial<PostDocument> & { slug: string }
): Promise<void> {
  const { slug, ...rest } = post
  const ref = doc(db, "posts", slug)
  const snap = await getDoc(ref)

  if (snap.exists()) {
    await updateDoc(ref, {
      ...rest,
      updatedAt: serverTimestamp(),
    })
  } else {
    await setDoc(ref, {
      slug,
      title: "",
      excerpt: "",
      coverImage: "",
      authorId: "",
      category: "",
      draftContent: [],
      publishedContent: [],
      publishedAt: null,
      status: "draft",
      ...rest,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  }
}

export async function publishPost(slug: string): Promise<void> {
  const ref = doc(db, "posts", slug)
  const snap = await getDoc(ref)
  if (!snap.exists()) throw new Error(`Post "${slug}" does not exist`)

  const data = snap.data() as Record<string, unknown>
  const draftContent = (data.draftContent as PostDocument["draftContent"]) ?? []

  await updateDoc(ref, {
    publishedContent: draftContent,
    status: "published",
    publishedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export async function deletePost(slug: string): Promise<void> {
  await deleteDoc(doc(db, "posts", slug))
}

// ─── Scheduled Posts ──────────────────────────────────────────────────────────

export async function listScheduledPosts(): Promise<PostDocument[]> {
  const postsRef = collection(db, "posts")
  const q = query(
    postsRef,
    where("status", "==", "scheduled"),
    where("scheduledAt", "<=", Timestamp.now()),
    orderBy("scheduledAt", "asc")
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => docToPost(d.data() as Record<string, unknown>, d.id))
}

// ─── Post Versions ────────────────────────────────────────────────────────────

export async function savePostVersion(
  slug: string,
  content: TiptapJSON,
  wordCount: number,
  savedBy: string
): Promise<string> {
  const versionsRef = collection(db, "posts", slug, "versions")
  const docRef = await addDoc(versionsRef, {
    content,
    wordCount,
    savedBy,
    savedAt: serverTimestamp(),
  })
  return docRef.id
}

export async function listPostVersions(slug: string): Promise<PostVersion[]> {
  const versionsRef = collection(db, "posts", slug, "versions")
  const q = query(versionsRef, orderBy("savedAt", "desc"), limit(50))
  const snap = await getDocs(q)
  return snap.docs.map((d) => {
    const data = d.data() as Record<string, unknown>
    return {
      id: d.id,
      content: data.content as TiptapJSON,
      wordCount: (data.wordCount as number) ?? 0,
      savedBy: (data.savedBy as string) ?? "",
      savedAt: timestampToDate(data.savedAt),
    }
  })
}

export async function restoreVersion(slug: string, versionId: string): Promise<void> {
  const versionRef = doc(db, "posts", slug, "versions", versionId)
  const versionSnap = await getDoc(versionRef)
  if (!versionSnap.exists()) throw new Error(`Version "${versionId}" does not exist`)

  const data = versionSnap.data() as Record<string, unknown>
  const content = data.content as TiptapJSON

  await updateDoc(doc(db, "posts", slug), {
    draftContent: content,
    updatedAt: serverTimestamp(),
  })
}
