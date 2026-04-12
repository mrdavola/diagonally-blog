import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
  Timestamp,
} from "firebase/firestore"
import { db } from "./firebase"
import type { TiptapJSON } from "./blocks/types"

export interface PostTemplate {
  id: string
  name: string
  description: string
  content: TiptapJSON
  category: string
  createdAt: Date
  updatedAt: Date
}

function fromFirestore(id: string, data: Record<string, unknown>): PostTemplate {
  return {
    id,
    name: (data.name as string) ?? "",
    description: (data.description as string) ?? "",
    content: (data.content as TiptapJSON) ?? { type: "doc", content: [{ type: "paragraph" }] },
    category: (data.category as string) ?? "",
    createdAt:
      data.createdAt instanceof Timestamp
        ? data.createdAt.toDate()
        : new Date((data.createdAt as string) ?? Date.now()),
    updatedAt:
      data.updatedAt instanceof Timestamp
        ? data.updatedAt.toDate()
        : new Date((data.updatedAt as string) ?? Date.now()),
  }
}

export async function listTemplates(): Promise<PostTemplate[]> {
  const q = query(collection(db, "templates"), orderBy("name", "asc"))
  const snap = await getDocs(q)
  return snap.docs.map((d) => fromFirestore(d.id, d.data() as Record<string, unknown>))
}

export async function getTemplate(id: string): Promise<PostTemplate | null> {
  const snap = await getDoc(doc(db, "templates", id))
  if (!snap.exists()) return null
  return fromFirestore(snap.id, snap.data() as Record<string, unknown>)
}

export async function saveTemplate(
  template: Omit<PostTemplate, "createdAt" | "updatedAt">
): Promise<void> {
  const ref = doc(db, "templates", template.id)
  const existing = await getDoc(ref)

  if (existing.exists()) {
    await setDoc(
      ref,
      {
        name: template.name,
        description: template.description,
        content: template.content,
        category: template.category,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    )
  } else {
    await setDoc(ref, {
      name: template.name,
      description: template.description,
      content: template.content,
      category: template.category,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  }
}

export async function deleteTemplate(id: string): Promise<void> {
  await deleteDoc(doc(db, "templates", id))
}
