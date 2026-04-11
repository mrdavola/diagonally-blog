import {
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  orderBy,
  where,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore"
import { db } from "./firebase"
import type { Submission } from "./blocks/types"

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timestampToDate(ts: unknown): Date {
  if (ts instanceof Timestamp) return ts.toDate()
  if (ts instanceof Date) return ts
  return new Date()
}

function docToSubmission(data: Record<string, unknown>, id: string): Submission {
  return {
    id,
    type: (data.type as Submission["type"]) ?? "contact",
    name: (data.name as string) ?? "",
    email: (data.email as string) ?? "",
    data: (data.data as Record<string, unknown>) ?? {},
    status: (data.status as Submission["status"]) ?? "new",
    createdAt: timestampToDate(data.createdAt),
  }
}

// ─── CRUD ─────────────────────────────────────────────────────────────────────

export async function createSubmission(
  submission: Omit<Submission, "id" | "status" | "createdAt">
): Promise<string> {
  const docRef = await addDoc(collection(db, "submissions"), {
    ...submission,
    status: "new",
    createdAt: serverTimestamp(),
  })
  return docRef.id
}

export async function listSubmissions(type?: string): Promise<Submission[]> {
  const submissionsRef = collection(db, "submissions")
  const constraints = type
    ? [where("type", "==", type), orderBy("createdAt", "desc")]
    : [orderBy("createdAt", "desc")]

  const q = query(submissionsRef, ...constraints)
  const snap = await getDocs(q)
  return snap.docs.map((d) =>
    docToSubmission(d.data() as Record<string, unknown>, d.id)
  )
}

export async function updateSubmissionStatus(
  id: string,
  status: "new" | "read" | "replied"
): Promise<void> {
  await updateDoc(doc(db, "submissions", id), { status })
}

export async function addNewsletterSubscriber(email: string): Promise<void> {
  // Use email as doc ID so duplicates are deduplicated automatically
  const ref = doc(db, "newsletter", email)
  const snap = await getDoc(ref)

  if (!snap.exists()) {
    await setDoc(ref, {
      email,
      subscribedAt: serverTimestamp(),
    })
  }
}
