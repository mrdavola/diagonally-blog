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
  where,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore"
import { db } from "./firebase"
import type { PostDocument } from "./blocks/types"

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timestampToDate(ts: unknown): Date {
  if (ts instanceof Timestamp) return ts.toDate()
  if (ts instanceof Date) return ts
  return new Date()
}

function docToPost(data: Record<string, unknown>, slug: string): PostDocument {
  return {
    slug,
    title: (data.title as string) ?? "",
    excerpt: (data.excerpt as string) ?? "",
    coverImage: (data.coverImage as string) ?? "",
    authorId: (data.authorId as string) ?? "",
    category: (data.category as string) ?? "",
    draftContent: (data.draftContent as PostDocument["draftContent"]) ?? [],
    publishedContent: (data.publishedContent as PostDocument["publishedContent"]) ?? [],
    publishedAt: data.publishedAt ? timestampToDate(data.publishedAt) : null,
    createdAt: timestampToDate(data.createdAt),
    updatedAt: timestampToDate(data.updatedAt),
    status: (data.status as "draft" | "published") ?? "draft",
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
