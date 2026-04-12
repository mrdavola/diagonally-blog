import { NextResponse } from "next/server"
import { syncSubscriber } from "@/lib/loops"

export async function POST(request: Request) {
  const body = await request.json()
  const { email } = body

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 })
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
  }

  // Firestore write happens client-side via addNewsletterSubscriber()
  // This route exists for server-side validation + Loops sync

  // Sync to Loops — fire-and-forget, don't let failure break signup
  syncSubscriber(email).catch(() => {})

  return NextResponse.json({ success: true, message: "Subscribed successfully" })
}
