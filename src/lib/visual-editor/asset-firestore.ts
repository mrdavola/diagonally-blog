// src/lib/visual-editor/asset-firestore.ts
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage"
import {
  collection,
  addDoc,
  getDocs,
  doc,
  deleteDoc,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore"
import { db, storage } from "../firebase"
import type { Asset } from "./types"

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timestampToDate(ts: unknown): Date {
  if (ts instanceof Timestamp) return ts.toDate()
  if (ts instanceof Date) return ts
  return new Date()
}

// ─── Upload ───────────────────────────────────────────────────────────────────

export async function uploadAsset(
  file: File,
  userEmail: string,
  onProgress?: (pct: number) => void
): Promise<Asset> {
  const timestamp = Date.now()
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_")
  const storagePath = `assets/${timestamp}-${safeName}`
  const storageRef = ref(storage, storagePath)

  // Upload with progress
  await new Promise<void>((resolve, reject) => {
    const task = uploadBytesResumable(storageRef, file)
    task.on(
      "state_changed",
      (snap) => {
        const pct = Math.round((snap.bytesTransferred / snap.totalBytes) * 100)
        onProgress?.(pct)
      },
      reject,
      resolve
    )
  })

  const url = await getDownloadURL(storageRef)

  // Resolve image dimensions for image files
  let dimensions: { width: number; height: number } | undefined
  if (file.type.startsWith("image/")) {
    try {
      dimensions = await getImageDimensions(url)
    } catch {
      // ignore
    }
  }

  const type: Asset["type"] = file.type.startsWith("image/")
    ? "image"
    : file.type.startsWith("video/")
    ? "video"
    : "file"

  // Save to Firestore
  const docRef = await addDoc(collection(db, "assets"), {
    type,
    url,
    thumbnailUrl: url,
    filename: file.name,
    mimeType: file.type,
    size: file.size,
    dimensions: dimensions ?? null,
    alt: "",
    tags: [],
    uploadedBy: userEmail,
    uploadedAt: serverTimestamp(),
    storagePath,
  })

  return {
    id: docRef.id,
    type,
    url,
    thumbnailUrl: url,
    filename: file.name,
    mimeType: file.type,
    size: file.size,
    dimensions,
    alt: "",
    tags: [],
    uploadedBy: userEmail,
    uploadedAt: new Date(),
  }
}

// ─── List ─────────────────────────────────────────────────────────────────────

export async function listAssets(): Promise<Asset[]> {
  const q = query(collection(db, "assets"), orderBy("uploadedAt", "desc"))
  const snap = await getDocs(q)
  return snap.docs.map((d) => {
    const data = d.data() as Record<string, unknown>
    return {
      ...(data as unknown as Asset),
      id: d.id,
      uploadedAt: timestampToDate(data.uploadedAt),
    }
  })
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deleteAsset(id: string, storagePath?: string): Promise<void> {
  await deleteDoc(doc(db, "assets", id))
  if (storagePath) {
    try {
      await deleteObject(ref(storage, storagePath))
    } catch {
      // Storage object may already be gone — ignore
    }
  }
}

// ─── Utility ──────────────────────────────────────────────────────────────────

function getImageDimensions(url: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight })
    img.onerror = reject
    img.src = url
  })
}
