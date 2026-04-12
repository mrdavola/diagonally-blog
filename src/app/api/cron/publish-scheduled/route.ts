import { NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"
import { Timestamp } from "firebase-admin/firestore"

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const now = Timestamp.now()
  const postsRef = adminDb.collection("posts")
  const snapshot = await postsRef
    .where("status", "==", "scheduled")
    .where("scheduledAt", "<=", now)
    .get()

  if (snapshot.empty) {
    return NextResponse.json({ published: 0 })
  }

  const batch = adminDb.batch()
  let count = 0

  for (const doc of snapshot.docs) {
    const data = doc.data()
    batch.update(doc.ref, {
      publishedContent: data.draftContent,
      status: "published",
      publishedAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    })
    count++
  }

  await batch.commit()
  return NextResponse.json({ published: count })
}
