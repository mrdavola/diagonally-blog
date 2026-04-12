import {
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore"
import { db } from "./firebase"
import type { Role } from "./admin-config"
import { ADMIN_EMAILS } from "./admin-config"

export interface AdminUser {
  email: string
  role: Role
  name: string
  addedBy: string
  addedAt: Date | null
}

/**
 * Get role for an email. Checks Firestore first, falls back to hardcoded ADMIN_EMAILS.
 */
export async function getUserRole(email: string): Promise<Role | null> {
  // Check Firestore first
  try {
    const ref = doc(db, "admins", email)
    const snap = await getDoc(ref)
    if (snap.exists()) {
      return (snap.data().role as Role) ?? null
    }
  } catch {
    // Firestore unavailable, fall through to hardcoded
  }

  // Fall back to hardcoded config
  return ADMIN_EMAILS[email] ?? null
}

export async function listAdmins(): Promise<AdminUser[]> {
  const admins: AdminUser[] = []

  // Get from Firestore
  try {
    const snap = await getDocs(collection(db, "admins"))
    for (const d of snap.docs) {
      const data = d.data()
      admins.push({
        email: d.id,
        role: (data.role as Role) ?? "viewer",
        name: (data.name as string) ?? "",
        addedBy: (data.addedBy as string) ?? "",
        addedAt: data.addedAt?.toDate?.() ?? null,
      })
    }
  } catch {
    // Firestore unavailable
  }

  // Merge hardcoded admins that aren't already in Firestore
  for (const [email, role] of Object.entries(ADMIN_EMAILS)) {
    if (!admins.find((a) => a.email === email)) {
      admins.push({ email, role, name: "", addedBy: "system", addedAt: null })
    }
  }

  return admins
}

export async function addAdmin(
  email: string,
  role: Role,
  name: string,
  addedBy: string
): Promise<void> {
  const ref = doc(db, "admins", email)
  await setDoc(ref, {
    email,
    role,
    name,
    addedBy,
    addedAt: serverTimestamp(),
  })
}

export async function updateAdminRole(email: string, role: Role): Promise<void> {
  const ref = doc(db, "admins", email)
  await setDoc(ref, { role }, { merge: true })
}

export async function removeAdmin(email: string): Promise<void> {
  await deleteDoc(doc(db, "admins", email))
}
