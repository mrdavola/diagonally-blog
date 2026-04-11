import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const body = await request.json()
  const { name, email, type, message } = body

  if (!name || !email) {
    return NextResponse.json({ error: "Name and email are required" }, { status: 400 })
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
  }

  // Firestore write happens client-side via createSubmission()
  // This route exists for server-side validation and future email notification

  // TODO: Send email notification via Resend when RESEND_API_KEY is configured
  // if (process.env.RESEND_API_KEY) { ... }

  void type
  void message

  return NextResponse.json({ success: true, message: "Submission received" })
}
