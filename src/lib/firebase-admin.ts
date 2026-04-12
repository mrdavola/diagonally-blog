import { initializeApp, getApps, cert, type ServiceAccount } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"

function getAdminApp() {
  if (getApps().length > 0) return getApps()[0]

  // Try service account JSON from env
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  if (serviceAccount) {
    return initializeApp({
      credential: cert(JSON.parse(serviceAccount) as ServiceAccount),
    })
  }

  // Fallback: use project ID only (works in some environments)
  return initializeApp({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  })
}

const app = getAdminApp()
export const adminDb = getFirestore(app)
