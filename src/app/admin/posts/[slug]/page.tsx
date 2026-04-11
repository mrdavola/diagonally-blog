"use client"

import { use, useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Save, Globe, ArrowLeft, Loader2 } from "lucide-react"
import { getPost, savePost, publishPost } from "@/lib/posts"
import { listAuthors } from "@/lib/authors"
import { ImageField } from "@/components/admin/image-field"
import { BlogContentEditor } from "@/components/admin/blog-content-editor"
import type { PostDocument, ContentBlock, Author } from "@/lib/blocks/types"

const CATEGORIES = [
  { value: "build-in-public", label: "Build-in-Public" },
  { value: "learner-stories", label: "Learner Stories" },
  { value: "education", label: "Education" },
  { value: "product-updates", label: "Product Updates" },
]

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .trim()
}

interface PostEditorRouteProps {
  params: Promise<{ slug: string }>
}

export default function PostEditorRoute({ params }: PostEditorRouteProps) {
  const { slug } = use(params)
  const router = useRouter()

  const [title, setTitle] = useState("")
  const [postSlug, setPostSlug] = useState(slug)
  const [category, setCategory] = useState("")
  const [authorId, setAuthorId] = useState("")
  const [excerpt, setExcerpt] = useState("")
  const [coverImage, setCoverImage] = useState("")
  const [sections, setSections] = useState<ContentBlock[]>([])
  const [authors, setAuthors] = useState<Author[]>([])
  const [status, setStatus] = useState<"draft" | "published">("draft")

  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  // Sync slug when title changes (only for new posts)
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)
  useEffect(() => {
    if (!slugManuallyEdited && title) {
      setPostSlug(slugify(title))
    }
  }, [title, slugManuallyEdited])

  // Load post and authors
  useEffect(() => {
    listAuthors()
      .then(setAuthors)
      .catch(() => {})
  }, [])

  useEffect(() => {
    getPost(slug)
      .then((post) => {
        if (post) {
          setTitle(post.title)
          setPostSlug(post.slug)
          setCategory(post.category)
          setAuthorId(post.authorId)
          setExcerpt(post.excerpt)
          setCoverImage(post.coverImage)
          setSections(post.draftContent)
          setStatus(post.status)
          setSlugManuallyEdited(true) // Don't auto-update slug for existing posts
        }
      })
      .catch(() => setLoadError("Could not load post. Check your connection."))
  }, [slug])

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const buildPost = useCallback(
    (): Partial<PostDocument> & { slug: string } => ({
      slug,
      title,
      excerpt,
      coverImage,
      authorId,
      category,
      draftContent: sections,
      status,
    }),
    [slug, title, excerpt, coverImage, authorId, category, sections, status]
  )

  async function handleSaveDraft() {
    setSaving(true)
    try {
      await savePost(buildPost())
      showToast("Draft saved.")
    } catch (err) {
      console.error(err)
      showToast("Save failed. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  async function handlePublish() {
    setPublishing(true)
    try {
      await savePost(buildPost())
      await publishPost(slug)
      setStatus("published")
      showToast("Post published!")
    } catch (err) {
      console.error(err)
      showToast("Publish failed. Please try again.")
    } finally {
      setPublishing(false)
    }
  }

  const inputClass =
    "w-full bg-space-deep/50 border border-white/10 text-white text-sm rounded-lg px-3 py-2 placeholder:text-text-light/30 focus:outline-none focus:border-blue-500/50"
  const labelClass = "block text-text-light/60 text-xs font-medium mb-1"

  return (
    <div className="max-w-4xl mx-auto pb-16">
      {/* Top bar */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => router.push("/admin/posts")}
          className="text-text-light/40 hover:text-text-light/70 transition p-1"
          title="Back to posts"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            status === "published"
              ? "bg-emerald-500/20 text-emerald-400"
              : "bg-yellow-500/20 text-yellow-400"
          }`}
        >
          {status === "published" ? "Published" : "Draft"}
        </span>
        <div className="flex-1" />
        <button
          onClick={handleSaveDraft}
          disabled={saving}
          className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-text-light rounded-xl px-4 py-2 text-sm font-medium transition disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Draft
        </button>
        <button
          onClick={handlePublish}
          disabled={publishing}
          className="flex items-center gap-2 bg-blue-700 hover:bg-blue-600 text-white rounded-xl px-4 py-2 text-sm font-medium transition disabled:opacity-50"
        >
          {publishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
          Publish
        </button>
      </div>

      {loadError && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6 text-red-400 text-sm">
          {loadError}
        </div>
      )}

      {/* Title */}
      <div className="mb-6">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Post title…"
          className="w-full bg-transparent border-b border-white/10 text-white font-display text-2xl pb-3 placeholder:text-text-light/20 focus:outline-none focus:border-blue-500/50"
        />
      </div>

      {/* Metadata grid */}
      <div className="bg-space-deep/50 rounded-2xl p-5 border border-white/10 mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Slug */}
        <div>
          <label className={labelClass}>Slug</label>
          <input
            type="text"
            value={postSlug}
            onChange={(e) => {
              setPostSlug(e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""))
              setSlugManuallyEdited(true)
            }}
            className={`${inputClass} font-mono`}
          />
        </div>

        {/* Category */}
        <div>
          <label className={labelClass}>Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={inputClass}
          >
            <option value="">Select category…</option>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        {/* Author */}
        <div>
          <label className={labelClass}>Author</label>
          <select
            value={authorId}
            onChange={(e) => setAuthorId(e.target.value)}
            className={inputClass}
          >
            <option value="">Select author…</option>
            {authors.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>

        {/* Excerpt */}
        <div className="sm:col-span-2">
          <label className={labelClass}>Excerpt</label>
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="Brief summary of the post…"
            rows={2}
            className={`${inputClass} resize-none`}
          />
        </div>

        {/* Cover Image */}
        <div className="sm:col-span-2">
          <label className={labelClass}>Cover Image</label>
          <ImageField value={coverImage} onChange={setCoverImage} />
        </div>
      </div>

      {/* Content editor */}
      <div>
        <h2 className="text-text-light/60 text-xs font-medium uppercase tracking-wider mb-3">
          Post Content
        </h2>
        <BlogContentEditor sections={sections} onChange={setSections} />
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-space-mid border border-white/10 rounded-xl px-4 py-3 text-sm text-white shadow-xl z-50">
          {toast}
        </div>
      )}
    </div>
  )
}
