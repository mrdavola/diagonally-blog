import { doc, getDoc, setDoc, serverTimestamp, Timestamp } from "firebase/firestore"
import { db } from "./firebase"

export interface PreviewToken {
  token: string
  slug: string
  createdAt: Date
  expiresAt: Date
}

export async function createPreviewToken(slug: string): Promise<string> {
  const token = crypto.randomUUID()
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

  await setDoc(doc(db, "previews", token), {
    slug,
    createdAt: serverTimestamp(),
    expiresAt: Timestamp.fromDate(expiresAt),
  })

  return token
}

export async function getPreviewToken(token: string): Promise<PreviewToken | null> {
  const snap = await getDoc(doc(db, "previews", token))
  if (!snap.exists()) return null

  const data = snap.data()
  const expiresAt = (data.expiresAt as Timestamp).toDate()

  // Check if expired
  if (expiresAt < new Date()) return null

  return {
    token,
    slug: data.slug as string,
    createdAt: (data.createdAt as Timestamp).toDate(),
    expiresAt,
  }
}
