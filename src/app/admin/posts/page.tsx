"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, PenSquare, LayoutTemplate, Trash2 } from "lucide-react"
import { listPosts, savePost, deletePost } from "@/lib/posts"
import type { PostDocument } from "@/lib/blocks/types"

const CATEGORIES: Record<string, string> = {
  "build-in-public": "Build-in-Public",
  "learner-stories": "Learner Stories",
  education: "Education",
  "product-updates": "Product Updates",
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .trim()
}

function formatDate(date: Date | null | undefined): string {
  if (!date) return ""
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

function StatusBadge({ status }: { status: PostDocument["status"] }) {
  if (status === "published") {
    return (
      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400/80">
        Published
      </span>
    )
  }
  if (status === "scheduled") {
    return (
      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-400/10 text-blue-400/80">
        Scheduled
      </span>
    )
  }
  return (
    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400/80">
      Draft
    </span>
  )
}

export default function PostsListPage() {
  const router = useRouter()
  const [posts, setPosts] = useState<PostDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState<PostDocument | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    listPosts()
      .then((result) => setPosts(result))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false))
  }, [])

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  async function handleCreatePost() {
    if (!newTitle.trim()) {
      setCreateError("Title is required.")
      return
    }
    const slug = slugify(newTitle)
    if (!slug) {
      setCreateError("Could not generate a valid slug from that title.")
      return
    }
    setCreating(true)
    setCreateError(null)
    try {
      await savePost({
        slug,
        title: newTitle.trim(),
        status: "draft",
        draftContent: [],
        publishedContent: [],
      })
      router.push(`/admin/posts/${slug}`)
    } catch (err) {
      setCreateError("Failed to create post. Please try again.")
      console.error(err)
    } finally {
      setCreating(false)
    }
  }

  async function handleDeletePost() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deletePost(deleteTarget.slug)
      setPosts((prev) => prev.filter((p) => p.slug !== deleteTarget.slug))
      showToast(`"${deleteTarget.title || deleteTarget.slug}" deleted.`)
      setDeleteTarget(null)
    } catch (err) {
      console.error(err)
      showToast("Delete failed. Please try again.")
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl text-white">Posts</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push("/admin/templates")}
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-text-light rounded-xl px-4 py-2 text-sm font-medium border border-white/10 transition"
          >
            <LayoutTemplate className="w-4 h-4" />
            New from Template
          </button>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 bg-blue-deep/80 hover:bg-blue-deep text-white rounded-xl px-5 py-2.5 text-sm font-medium transition"
          >
            <Plus className="w-4 h-4" />
            New Post
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-text-light/50 text-sm py-12 text-center">Loading posts…</div>
      ) : posts.length === 0 ? (
        <div className="bg-admin-surface-raised/50 rounded-2xl p-12 border border-admin-border flex flex-col items-center gap-4 text-center">
          <PenSquare className="w-10 h-10 text-text-light/20" />
          <p className="text-text-light/60 text-sm">No posts yet. Create your first post!</p>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 bg-blue-deep/80 hover:bg-blue-deep text-white rounded-xl px-5 py-2.5 text-sm font-medium transition"
          >
            <Plus className="w-4 h-4" />
            New Post
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {posts.map((post) => (
            <div key={post.slug} className="relative group">
              <button
                onClick={() => router.push(`/admin/posts/${post.slug}`)}
                className="w-full bg-admin-surface-raised rounded-xl p-5 border border-admin-border hover:border-admin-border hover:bg-admin-surface-overlay text-left transition-colors"
              >
                {/* Top row: status + category */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <StatusBadge status={post.status} />
                  {post.category && (
                    <span className="text-xs text-text-light/35 bg-white/3 px-2 py-0.5 rounded-full shrink-0">
                      {CATEGORIES[post.category] ?? post.category}
                    </span>
                  )}
                </div>

                {/* Title */}
                <p className="text-white font-display font-semibold mb-0.5 group-hover:text-blue-300 transition line-clamp-2">
                  {post.title || <span className="italic text-text-light/40">Untitled</span>}
                </p>

                {/* Subtitle */}
                {post.subtitle && (
                  <p className="text-text-light/50 text-sm mb-1 line-clamp-1">{post.subtitle}</p>
                )}

                {/* Slug */}
                <p className="text-text-light/25 text-xs font-mono mb-2">/{post.slug}</p>

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {post.tags.slice(0, 4).map((tag) => (
                      <span
                        key={tag}
                        className="bg-white/3 text-text-light/40 text-xs px-2 py-0.5 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                    {post.tags.length > 4 && (
                      <span className="text-text-light/30 text-xs py-0.5">+{post.tags.length - 4}</span>
                    )}
                  </div>
                )}

                {/* Bottom meta row */}
                <div className="flex items-center gap-2 flex-wrap mt-1">
                  {/* Author */}
                  {post.authorIds && post.authorIds.length > 0 && (
                    <span className="text-text-light/40 text-xs font-mono">
                      {post.authorIds[0]}
                    </span>
                  )}

                  {/* Word count + read time */}
                  {(post.wordCount > 0 || post.readTimeMinutes > 0) && (
                    <span className="text-text-light/30 text-xs">
                      {post.wordCount > 0 && post.readTimeMinutes > 0
                        ? `${post.wordCount} words · ${post.readTimeMinutes} min read`
                        : post.wordCount > 0
                        ? `${post.wordCount} words`
                        : `${post.readTimeMinutes} min read`}
                    </span>
                  )}

                  {/* Date: scheduled or published */}
                  {post.status === "scheduled" && post.scheduledAt ? (
                    <span className="text-blue-400 text-xs">
                      Scheduled for {formatDate(post.scheduledAt)}
                    </span>
                  ) : post.publishedAt ? (
                    <span className="text-text-light/30 text-xs">{formatDate(post.publishedAt)}</span>
                  ) : null}
                </div>
              </button>

              {/* Delete button — top-right corner */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setDeleteTarget(post)
                }}
                className="absolute top-3 right-3 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 text-text-light/40 hover:!text-red-400 hover:bg-red-400/10 transition-opacity"
                title="Delete post"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Create post modal */}
      {showCreate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setShowCreate(false) }}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCreate(false)} />
          <div className="relative bg-admin-surface-raised rounded-2xl border border-admin-border shadow-2xl w-full max-w-md p-6">
            <h2 className="text-white font-display text-lg mb-4">New Post</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-text-light/70 text-sm font-medium mb-1.5">
                  Post Title
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleCreatePost() }}
                  placeholder="e.g. How We Built Diagonally"
                  className="w-full bg-space-deep/50 border border-white/10 text-white text-sm rounded-lg px-3 py-2 placeholder:text-text-light/30 focus:outline-none focus:border-blue-500/50"
                  autoFocus
                />
              </div>
              {newTitle && (
                <p className="text-text-light/40 text-xs font-mono">
                  Slug: {slugify(newTitle) || "—"}
                </p>
              )}
              {createError && (
                <p className="text-red-400 text-sm">{createError}</p>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setShowCreate(false); setNewTitle(""); setCreateError(null) }}
                className="flex-1 text-sm text-text-light/50 hover:text-white py-2 rounded-lg border border-white/10 hover:border-white/20 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePost}
                disabled={creating || !newTitle.trim()}
                className="flex-1 text-sm bg-blue-700 hover:bg-blue-600 text-white py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {creating ? "Creating…" : "Create Post"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation dialog */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget && !deleting) setDeleteTarget(null) }}
        >
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => { if (!deleting) setDeleteTarget(null) }}
          />
          <div className="relative bg-admin-surface-raised rounded-2xl border border-admin-border shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h2 className="text-white font-medium">Delete this post?</h2>
                <p className="text-text-light/50 text-sm">This cannot be undone.</p>
              </div>
            </div>
            <p className="text-text-light/70 text-sm mb-6 bg-white/5 rounded-lg px-3 py-2 font-medium">
              {deleteTarget.title || deleteTarget.slug}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="flex-1 text-sm text-text-light/50 hover:text-white py-2 rounded-lg border border-white/10 hover:border-white/20 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeletePost}
                disabled={deleting}
                className="flex-1 text-sm bg-red-600 hover:bg-red-500 text-white py-2 rounded-lg disabled:opacity-50 transition"
              >
                {deleting ? "Deleting…" : "Delete Post"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-admin-surface-overlay border border-admin-border rounded-xl px-4 py-3 text-sm text-white shadow-xl z-50">
          {toast}
        </div>
      )}
    </div>
  )
}
