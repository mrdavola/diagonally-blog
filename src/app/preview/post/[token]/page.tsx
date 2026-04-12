"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import { AlertTriangle } from "lucide-react"
import { getPreviewToken } from "@/lib/previews"
import { getPost } from "@/lib/posts"
import { isTiptapContent } from "@/lib/blocks/types"
import type { PostDocument } from "@/lib/blocks/types"
import { TiptapRenderer } from "@/components/blog/tiptap-renderer"
import { LegacyRenderer } from "@/components/blog/legacy-renderer"

function hoursUntil(date: Date): number {
  return Math.max(0, Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60)))
}

type PageState =
  | { status: "loading" }
  | { status: "invalid" }
  | { status: "ready"; post: PostDocument; expiresAt: Date }

export default function PreviewPostPage() {
  const params = useParams()
  const token = Array.isArray(params.token) ? params.token[0] : (params.token as string)

  const [state, setState] = useState<PageState>({ status: "loading" })

  useEffect(() => {
    if (!token) {
      setState({ status: "invalid" })
      return
    }

    getPreviewToken(token)
      .then(async (preview) => {
        if (!preview) {
          setState({ status: "invalid" })
          return
        }

        const post = await getPost(preview.slug)
        if (!post) {
          setState({ status: "invalid" })
          return
        }

        setState({ status: "ready", post, expiresAt: preview.expiresAt })
      })
      .catch(() => setState({ status: "invalid" }))
  }, [token])

  if (state.status === "loading") {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <p className="text-text-dark/40 text-lg">Loading preview…</p>
      </div>
    )
  }

  if (state.status === "invalid") {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-6">
        <div className="text-center">
          <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-4" />
          <h1 className="font-display text-2xl font-bold text-text-dark mb-2">
            Preview link expired or invalid
          </h1>
          <p className="text-text-dark/60 text-sm">
            Ask the author to generate a new preview link.
          </p>
        </div>
      </div>
    )
  }

  const { post, expiresAt } = state
  const draftContent = post.draftContent
  const hours = hoursUntil(expiresAt)

  return (
    <div className="min-h-screen bg-cream text-text-dark">
      {/* Preview Banner */}
      <div className="sticky top-0 z-50 bg-gold/10 border-b border-gold/20">
        <div className="max-w-4xl mx-auto px-6 py-3 flex items-center gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <div>
            <span className="text-sm font-semibold text-text-dark">
              DRAFT PREVIEW — Not yet published
            </span>
            <span className="text-xs text-text-dark/60 ml-3">
              This link expires in {hours} hour{hours !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>

      {/* Post Header */}
      <section className="bg-cream py-16">
        <div className="max-w-4xl mx-auto px-6">
          {/* Category Badge */}
          {post.category && (
            <span className="inline-block bg-blue-primary/10 text-blue-primary text-xs font-semibold px-3 py-1 rounded-full">
              {post.category}
            </span>
          )}

          {/* Title */}
          <h1 className="font-display text-3xl md:text-4xl font-bold text-text-dark mt-4 leading-tight">
            {post.title}
          </h1>

          {/* Subtitle */}
          {post.subtitle && (
            <p className="text-xl text-text-dark/60 mt-3 leading-relaxed">
              {post.subtitle}
            </p>
          )}
        </div>
      </section>

      {/* Cover Image */}
      {post.coverImage && (
        <div className="max-w-4xl mx-auto px-6 -mt-4 mb-4">
          <div className="relative aspect-video rounded-2xl overflow-hidden">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 896px) 100vw, 896px"
            />
          </div>
        </div>
      )}

      {/* Article Content */}
      <article className="max-w-prose mx-auto px-6 py-12">
        {draftContent ? (
          isTiptapContent(draftContent) ? (
            <TiptapRenderer content={draftContent} />
          ) : (
            <LegacyRenderer blocks={draftContent} />
          )
        ) : (
          <p className="text-text-dark/40 italic">No draft content yet.</p>
        )}
      </article>
    </div>
  )
}
