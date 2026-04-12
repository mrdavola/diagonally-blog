"use client"

import { useEffect, useState } from "react"
import { listPosts, savePost } from "@/lib/posts"
import { isTiptapContent } from "@/lib/blocks/types"
import type { ContentBlock, TiptapJSON, TiptapNode, PostDocument } from "@/lib/blocks/types"
import { CheckCircle, XCircle, RefreshCw } from "lucide-react"

// ─── Converter ────────────────────────────────────────────────────────────────

function convertToTiptap(blocks: ContentBlock[]): TiptapJSON {
  const content: TiptapNode[] = blocks.map((block) => {
    switch (block.type) {
      case "paragraph":
        return {
          type: "paragraph",
          content: block.content ? [{ type: "text", text: block.content }] : [],
        }
      case "heading":
        return {
          type: "heading",
          attrs: { level: 2 },
          content: block.content ? [{ type: "text", text: block.content }] : [],
        }
      case "subheading":
        return {
          type: "heading",
          attrs: { level: 3 },
          content: block.content ? [{ type: "text", text: block.content }] : [],
        }
      case "image":
        return {
          type: "image",
          attrs: {
            src: block.imageUrl ?? "",
            alt: block.content ?? "",
            title: block.content ?? "",
          },
        }
      case "quote":
        return {
          type: "blockquote",
          content: [
            {
              type: "paragraph",
              content: block.content ? [{ type: "text", text: block.content }] : [],
            },
          ],
        }
      case "callout":
        return {
          type: "paragraph",
          content: block.content
            ? [
                {
                  type: "text",
                  text: block.content,
                  marks: [{ type: "highlight" }],
                },
              ]
            : [],
        }
      case "list":
        return {
          type: "bulletList",
          content: (block.content ?? "")
            .split("\n")
            .filter(Boolean)
            .map((item) => ({
              type: "listItem",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: item }],
                },
              ],
            })),
        }
      case "divider":
        return { type: "horizontalRule" }
      default:
        return {
          type: "paragraph",
          content: block.content ? [{ type: "text", text: block.content }] : [],
        }
    }
  })

  return { type: "doc", content }
}

// ─── Types ────────────────────────────────────────────────────────────────────

type PostStatus = "pending" | "migrating" | "done" | "error"

interface LegacyPost {
  post: PostDocument
  status: PostStatus
  error?: string
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MigratePage() {
  const [legacyPosts, setLegacyPosts] = useState<LegacyPost[]>([])
  const [loading, setLoading] = useState(true)
  const [migratingAll, setMigratingAll] = useState(false)
  const [migrateAllProgress, setMigrateAllProgress] = useState<{ current: number; total: number } | null>(null)
  const [migrateAllSummary, setMigrateAllSummary] = useState<string | null>(null)

  useEffect(() => {
    listPosts()
      .then((posts) => {
        const legacy = posts.filter((p) => !isTiptapContent(p.draftContent))
        setLegacyPosts(legacy.map((p) => ({ post: p, status: "pending" })))
      })
      .catch(() => setLegacyPosts([]))
      .finally(() => setLoading(false))
  }, [])

  async function migratePost(slug: string) {
    setLegacyPosts((prev) =>
      prev.map((lp) => (lp.post.slug === slug ? { ...lp, status: "migrating", error: undefined } : lp))
    )

    const lp = legacyPosts.find((p) => p.post.slug === slug)
    if (!lp) return

    try {
      const { post } = lp
      const draftBlocks = post.draftContent as ContentBlock[]
      const convertedDraft = convertToTiptap(draftBlocks)

      let convertedPublished: TiptapJSON | null = null
      if (post.publishedContent && !isTiptapContent(post.publishedContent)) {
        convertedPublished = convertToTiptap(post.publishedContent as ContentBlock[])
      }

      await savePost({
        slug,
        draftContent: convertedDraft,
        ...(convertedPublished !== null ? { publishedContent: convertedPublished } : {}),
      })

      setLegacyPosts((prev) => prev.filter((p) => p.post.slug !== slug))
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error"
      setLegacyPosts((prev) =>
        prev.map((lp) =>
          lp.post.slug === slug ? { ...lp, status: "error", error: message } : lp
        )
      )
    }
  }

  async function migrateAll() {
    const pending = legacyPosts.filter((lp) => lp.status === "pending" || lp.status === "error")
    if (pending.length === 0) return

    setMigratingAll(true)
    setMigrateAllSummary(null)
    let successCount = 0

    for (let i = 0; i < pending.length; i++) {
      const lp = pending[i]
      setMigrateAllProgress({ current: i + 1, total: pending.length })

      setLegacyPosts((prev) =>
        prev.map((p) =>
          p.post.slug === lp.post.slug ? { ...p, status: "migrating", error: undefined } : p
        )
      )

      try {
        const draftBlocks = lp.post.draftContent as ContentBlock[]
        const convertedDraft = convertToTiptap(draftBlocks)

        let convertedPublished: TiptapJSON | null = null
        if (lp.post.publishedContent && !isTiptapContent(lp.post.publishedContent)) {
          convertedPublished = convertToTiptap(lp.post.publishedContent as ContentBlock[])
        }

        await savePost({
          slug: lp.post.slug,
          draftContent: convertedDraft,
          ...(convertedPublished !== null ? { publishedContent: convertedPublished } : {}),
        })

        setLegacyPosts((prev) => prev.filter((p) => p.post.slug !== lp.post.slug))
        successCount++
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error"
        setLegacyPosts((prev) =>
          prev.map((p) =>
            p.post.slug === lp.post.slug ? { ...p, status: "error", error: message } : p
          )
        )
      }
    }

    setMigratingAll(false)
    setMigrateAllProgress(null)
    setMigrateAllSummary(
      successCount === pending.length
        ? `${successCount} post${successCount !== 1 ? "s" : ""} migrated successfully`
        : `${successCount} of ${pending.length} posts migrated. ${pending.length - successCount} failed.`
    )
  }

  const blockCount = (post: PostDocument): number => {
    if (Array.isArray(post.draftContent)) return post.draftContent.length
    return 0
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="font-display text-2xl text-white mb-1">Content Migration</h1>
          <p className="text-text-light/50 text-sm">
            Convert legacy block-format posts to the new Tiptap editor format.
          </p>
        </div>

        {legacyPosts.length > 0 && (
          <button
            onClick={migrateAll}
            disabled={migratingAll}
            className="shrink-0 flex items-center gap-2 bg-blue-700 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl px-4 py-2 text-sm font-medium transition"
          >
            <RefreshCw className={`w-4 h-4 ${migratingAll ? "animate-spin" : ""}`} />
            {migratingAll && migrateAllProgress
              ? `Migrating ${migrateAllProgress.current} of ${migrateAllProgress.total}…`
              : "Migrate All"}
          </button>
        )}
      </div>

      {/* Summary banner */}
      {migrateAllSummary && (
        <div className="mb-6 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl px-4 py-3 text-sm flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          {migrateAllSummary}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-text-light/50 text-sm py-12 text-center">
          Loading posts…
        </div>
      )}

      {/* Empty state */}
      {!loading && legacyPosts.length === 0 && (
        <div className="bg-space-mid/50 rounded-xl p-10 border border-white/10 flex flex-col items-center gap-3 text-center">
          <CheckCircle className="w-10 h-10 text-emerald-400/60" />
          <p className="text-text-light/60 text-sm">
            All posts are using the new editor format. Nothing to migrate.
          </p>
        </div>
      )}

      {/* Post cards */}
      {!loading && legacyPosts.length > 0 && (
        <div className="space-y-3">
          {legacyPosts.map(({ post, status, error }) => (
            <div
              key={post.slug}
              className="bg-space-mid/50 rounded-xl p-4 border border-white/10 flex items-center gap-4"
            >
              {/* Status indicator */}
              <div className="shrink-0">
                {status === "done" ? (
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                ) : status === "error" ? (
                  <XCircle className="w-5 h-5 text-red-400" />
                ) : status === "migrating" ? (
                  <RefreshCw className="w-5 h-5 text-blue-400 animate-spin" />
                ) : (
                  <div className="w-5 h-5 rounded-full border border-white/20" />
                )}
              </div>

              {/* Post info */}
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm truncate">
                  {post.title || <span className="italic text-text-light/40">Untitled</span>}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-text-light/40 text-xs font-mono">/{post.slug}</span>
                  <span className="text-text-light/30 text-xs">
                    {blockCount(post)} {blockCount(post) === 1 ? "block" : "blocks"}
                  </span>
                </div>
                {error && (
                  <p className="text-red-400 text-xs mt-1">{error}</p>
                )}
              </div>

              {/* Migrate button */}
              <button
                onClick={() => migratePost(post.slug)}
                disabled={status === "migrating" || migratingAll}
                className="shrink-0 text-xs bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-text-light rounded-lg px-3 py-1.5 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                {status === "error" ? "Retry" : "Migrate"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
