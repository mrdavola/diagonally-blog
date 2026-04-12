import { NextRequest, NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"
import { FieldValue } from "firebase-admin/firestore"

// Simple hash for IP dedup (not for security)
function hashIP(ip: string): string {
  let hash = 0
  for (let i = 0; i < ip.length; i++) {
    const char = ip.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash |= 0
  }
  return hash.toString(36)
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    ?? request.headers.get("x-real-ip")
    ?? "unknown"

  const ipHash = hashIP(ip)
  const today = new Date().toISOString().split("T")[0] // YYYY-MM-DD

  const viewDocRef = adminDb.collection("posts").doc(slug).collection("views").doc(today)
  const postRef = adminDb.collection("posts").doc(slug)

  try {
    const viewDoc = await viewDocRef.get()
    const existingHashes: string[] = viewDoc.exists ? (viewDoc.data()?.ips ?? []) : []

    if (!existingHashes.includes(ipHash)) {
      // New unique view
      await viewDocRef.set(
        { ips: FieldValue.arrayUnion(ipHash) },
        { merge: true }
      )
      await postRef.update({
        viewCount: FieldValue.increment(1),
      })
    }

    // Get current count
    const postDoc = await postRef.get()
    const viewCount = postDoc.exists ? (postDoc.data()?.viewCount ?? 0) : 0

    return NextResponse.json({ views: viewCount })
  } catch {
    return NextResponse.json({ views: 0 })
  }
}
