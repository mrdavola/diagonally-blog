import {
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
} from "firebase/firestore"
import { db } from "./firebase"
import type { Author } from "./blocks/types"

// ─── Helpers ──────────────────────────────────────────────────────────────────

function docToAuthor(data: Record<string, unknown>, id: string): Author {
  return {
    id,
    name: (data.name as string) ?? "",
    role: (data.role as string) ?? "",
    bio: (data.bio as string) ?? "",
    headshot: (data.headshot as string) ?? "",
    socialLinks: (data.socialLinks as Author["socialLinks"]) ?? [],
  }
}

// ─── CRUD ─────────────────────────────────────────────────────────────────────

export async function listAuthors(): Promise<Author[]> {
  const snap = await getDocs(collection(db, "authors"))
  return snap.docs.map((d) => docToAuthor(d.data() as Record<string, unknown>, d.id))
}

export async function getAuthor(id: string): Promise<Author | null> {
  const snap = await getDoc(doc(db, "authors", id))
  if (!snap.exists()) return null
  return docToAuthor(snap.data() as Record<string, unknown>, id)
}

export async function saveAuthor(
  author: Partial<Author> & { id: string }
): Promise<void> {
  const { id, ...rest } = author
  const ref = doc(db, "authors", id)
  const snap = await getDoc(ref)

  if (snap.exists()) {
    await updateDoc(ref, { ...rest })
  } else {
    await setDoc(ref, {
      id,
      name: "",
      role: "",
      bio: "",
      headshot: "",
      socialLinks: [],
      ...rest,
    })
  }
}

export async function deleteAuthor(id: string): Promise<void> {
  await deleteDoc(doc(db, "authors", id))
}
