import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage"
import { storage } from "./firebase"

/**
 * Upload a file to Firebase Storage under `images/{path}/{timestamp}-{filename}`.
 * Returns the public download URL.
 */
export async function uploadImage(file: File, path: string): Promise<string> {
  const timestamp = Date.now()
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_")
  const storagePath = `images/${path}/${timestamp}-${safeName}`
  const storageRef = ref(storage, storagePath)

  const snapshot = await uploadBytes(storageRef, file)
  const downloadUrl = await getDownloadURL(snapshot.ref)
  return downloadUrl
}

/**
 * Delete an image from Firebase Storage by its download URL.
 */
export async function deleteImage(url: string): Promise<void> {
  const storageRef = ref(storage, url)
  await deleteObject(storageRef)
}
