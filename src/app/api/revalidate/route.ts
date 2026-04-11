import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"

export async function POST(request: Request) {
  const body = await request.json()
  const { slug, secret } = body

  // Validate secret
  if (secret !== process.env.NEXT_PUBLIC_REVALIDATION_SECRET) {
    return NextResponse.json({ error: "Invalid secret" }, { status: 401 })
  }

  if (!slug) {
    return NextResponse.json({ error: "Slug is required" }, { status: 400 })
  }

  try {
    // Revalidate the specific page path
    if (slug === "home") {
      revalidatePath("/")
    } else {
      revalidatePath(`/${slug}`)
    }

    // Also revalidate the blog listing if it's a post
    revalidatePath("/blog")

    return NextResponse.json({ success: true, revalidated: true })
  } catch (error) {
    void error
    return NextResponse.json({ error: "Revalidation failed" }, { status: 500 })
  }
}
