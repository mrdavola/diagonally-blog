"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import {
  ArrowLeft,
  Save,
  Globe,
  Calendar,
  ChevronDown,
  ChevronRight,
  Loader2,
} from "lucide-react"
import { getPost, savePost, publishPost, savePostVersion } from "@/lib/posts"
import { listAuthors } from "@/lib/authors"
import { ImageField } from "@/components/admin/image-field"
import { TiptapEditor } from "@/components/admin/tiptap-editor"
import type { PostDocument, TiptapJSON, Author } from "@/lib/blocks/types"
import { isTiptapContent } from "@/lib/blocks/types"

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { value: "build-in-public", label: "Build-in-Public" },
  { value: "learner-stories", label: "Learner Stories" },
  { value: "education", label: "Education" },
  { value: "product-updates", label: "Product Updates" },
]

const EMPTY_DOC: TiptapJSON = { type: "doc", content: [{ type: "paragraph" }] }

// ─── Helpers ──────────────────────────────────────────────────────────────────

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

// ─── Collapsible Section ──────────────────────────────────────────────────────

function CollapsibleSection({
  title,
  defaultOpen = true,
  children,
}: {
  title: string
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="bg-space-mid/50 rounded-xl border border-white/10 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-6 py-4 text-sm font-medium text-text-light/70 hover:text-text-light transition"
      >
        <span>{title}</span>
        {open ? (
          <ChevronDown className="w-4 h-4" />
        ) : (
          <ChevronRight className="w-4 h-4" />
        )}
      </button>
      {open && <div className="px-6 pb-6">{children}</div>}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function PostEditorPage() {
  const params = useParams()
  const slugParam = Array.isArray(params.slug) ? params.slug[0] : (params.slug as string)
  const isNew = slugParam === "new"

  const router = useRouter()

  // ── Core state ──────────────────────────────────────────────────────────────
  const [post, setPost] = useState<Partial<PostDocument>>({
    title: "",
    subtitle: "",
    slug: "",
    category: "",
    tags: [],
    authorIds: [],
    excerpt: "",
    coverImage: "",
    draftContent: EMPTY_DOC,
    status: "draft",
    wordCount: 0,
    readTimeMinutes: 0,
  })

  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [dirty, setDirty] = useState(false)
  const [authors, setAuthors] = useState<Author[]>([])
  const [showSchedule, setShowSchedule] = useState(false)
  const [scheduleDateInput, setScheduleDateInput] = useState("")
  const [toast, setToast] = useState<string | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)
  const [wordCount, setWordCount] = useState(0)

  // ── Derived ─────────────────────────────────────────────────────────────────
  const currentSlug = (post.slug ?? slugParam) as string
  const readTimeMinutes = Math.max(1, Math.ceil(wordCount / 238))

  // ── Load data ───────────────────────────────────────────────────────────────
  useEffect(() => {
    listAuthors()
      .then(setAuthors)
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (isNew) {
      setLoading(false)
      return
    }

    setLoading(true)
    getPost(slugParam)
      .then((fetched) => {
        if (!fetched) {
          setLoadError("Post not found.")
          return
        }

        const content = isTiptapContent(fetched.draftContent)
          ? fetched.draftContent
          : EMPTY_DOC

        setPost({
          ...fetched,
          draftContent: content,
        })
        setSlugManuallyEdited(true)
      })
      .catch(() => setLoadError("Could not load post. Check your connection."))
      .finally(() => setLoading(false))
  }, [slugParam, isNew])

  // ── Auto-slug from title ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!slugManuallyEdited && post.title) {
      setPost((prev) => ({ ...prev, slug: slugify(post.title ?? "") }))
    }
  }, [post.title, slugManuallyEdited])

  // ── Autosave (10s debounce) ──────────────────────────────────────────────────
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!dirty) return

    if (autosaveTimer.current) clearTimeout(autosaveTimer.current)
    autosaveTimer.current = setTimeout(() => {
      handleSaveDraft(true)
    }, 10_000)

    return () => {
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dirty, post])

  // ── Toast helper ────────────────────────────────────────────────────────────
  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  // ── Field updater ───────────────────────────────────────────────────────────
  function update(patch: Partial<PostDocument>) {
    setPost((prev) => ({ ...prev, ...patch }))
    setDirty(true)
  }

  // ── Save draft ──────────────────────────────────────────────────────────────
  const handleSaveDraft = useCallback(
    async (silent = false) => {
      setSaving(true)
      try {
        const slug = currentSlug || slugParam
        const payload: Partial<PostDocument> & { slug: string } = {
          ...(post as PostDocument),
          slug,
          wordCount,
          readTimeMinutes,
        }

        await savePost(payload)

        // Save version snapshot if content is Tiptap JSON
        const draftContent = post.draftContent ?? null
        if (isTiptapContent(draftContent)) {
          await savePostVersion(slug, draftContent, wordCount, "admin").catch(() => {})
        }

        setLastSaved(new Date())
        setDirty(false)
        if (!silent) showToast("Draft saved.")
      } catch (err) {
        console.error(err)
        if (!silent) showToast("Save failed. Please try again.")
      } finally {
        setSaving(false)
      }
    },
    [post, currentSlug, slugParam, wordCount, readTimeMinutes]
  )

  // ── Publish ─────────────────────────────────────────────────────────────────
  async function handlePublish() {
    setSaving(true)
    try {
      const slug = currentSlug || slugParam
      await savePost({
        ...(post as PostDocument),
        slug,
        wordCount,
        readTimeMinutes,
      })
      await publishPost(slug)
      setPost((prev) => ({ ...prev, status: "published" }))
      setLastSaved(new Date())
      setDirty(false)
      showToast("Published!")
    } catch (err) {
      console.error(err)
      showToast("Publish failed. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  // ── Schedule ─────────────────────────────────────────────────────────────────
  async function handleSchedule() {
    if (!scheduleDateInput) return
    const date = new Date(scheduleDateInput)
    setSaving(true)
    try {
      const slug = currentSlug || slugParam
      await savePost({
        ...(post as PostDocument),
        slug,
        status: "scheduled",
        scheduledAt: date,
        wordCount,
        readTimeMinutes,
      })
      setPost((prev) => ({ ...prev, status: "scheduled", scheduledAt: date }))
      setShowSchedule(false)
      setLastSaved(new Date())
      setDirty(false)
      showToast(`Scheduled for ${date.toLocaleString()}`)
    } catch (err) {
      console.error(err)
      showToast("Schedule failed. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  // ── Content change ───────────────────────────────────────────────────────────
  function handleContentChange(content: TiptapJSON) {
    setPost((prev) => ({ ...prev, draftContent: content }))
    setDirty(true)
  }

  // ── Styles ───────────────────────────────────────────────────────────────────
  const inputClass =
    "w-full bg-white/5 border border-white/10 text-text-light rounded-lg px-3 py-2 focus:outline-none focus:border-blue-primary/50 placeholder:text-text-light/30 text-sm"
  const labelClass = "text-sm text-text-light/60 font-medium block mb-1"

  // ── Status badge ─────────────────────────────────────────────────────────────
  function StatusBadge() {
    const s = post.status ?? "draft"
    const cfg = {
      draft: "bg-amber-500/20 text-amber-400",
      scheduled: "bg-blue-500/20 text-blue-400",
      published: "bg-emerald-500/20 text-emerald-400",
    }[s]
    const label = { draft: "Draft", scheduled: "Scheduled", published: "Published" }[s]
    return (
      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${cfg}`}>
        {label}
      </span>
    )
  }

  // ── Autosave indicator ────────────────────────────────────────────────────────
  function AutosaveIndicator() {
    if (saving)
      return <span className="text-xs text-text-light/40">Saving…</span>
    if (dirty)
      return <span className="text-xs text-text-light/40">Unsaved changes</span>
    if (lastSaved)
      return (
        <span className="text-xs text-text-light/40">
          Saved at {formatTime(lastSaved)}
        </span>
      )
    return null
  }

  // ─────────────────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-text-light/40" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-space-deep">
      {/* ── Top Bar ─────────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-40 bg-space-deep/90 backdrop-blur border-b border-white/10">
        <div className="max-w-4xl mx-auto px-6 py-3 flex items-center gap-3">
          <button
            onClick={() => router.push("/admin/posts")}
            className="text-text-light/40 hover:text-text-light/70 transition p-1 rounded-lg hover:bg-white/5"
            title="Back to posts"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <StatusBadge />

          <div className="flex-1" />

          <AutosaveIndicator />

          <button
            onClick={() => handleSaveDraft(false)}
            disabled={saving}
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-text-light rounded-xl px-4 py-2 text-sm font-medium transition disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Draft
          </button>

          {/* Schedule button + popover */}
          <div className="relative">
            <button
              onClick={() => setShowSchedule((v) => !v)}
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-text-light rounded-xl px-4 py-2 text-sm font-medium transition"
            >
              <Calendar className="w-4 h-4" />
              Schedule
            </button>

            {showSchedule && (
              <div className="absolute right-0 top-full mt-2 bg-space-mid border border-white/10 rounded-xl p-4 shadow-xl z-50 w-72">
                <p className="text-sm text-text-light/70 font-medium mb-3">
                  Schedule publish date
                </p>
                <input
                  type="datetime-local"
                  value={scheduleDateInput}
                  onChange={(e) => setScheduleDateInput(e.target.value)}
                  className={inputClass}
                />
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={handleSchedule}
                    disabled={!scheduleDateInput || saving}
                    className="flex-1 bg-blue-700 hover:bg-blue-600 text-white rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => setShowSchedule(false)}
                    className="flex-1 bg-white/5 hover:bg-white/10 text-text-light rounded-lg px-3 py-2 text-sm font-medium transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handlePublish}
            disabled={saving}
            className="flex items-center gap-2 bg-blue-700 hover:bg-blue-600 text-white rounded-xl px-4 py-2 text-sm font-medium transition disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Globe className="w-4 h-4" />
            )}
            Publish
          </button>
        </div>
      </div>

      {/* ── Main Content ─────────────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {loadError && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">
            {loadError}
          </div>
        )}

        {/* Title & Subtitle */}
        <div className="space-y-3">
          <input
            type="text"
            value={post.title ?? ""}
            onChange={(e) => update({ title: e.target.value })}
            placeholder="Post title"
            className="w-full bg-transparent text-text-light font-display text-3xl font-bold placeholder:text-text-light/20 focus:outline-none border-b border-white/10 pb-3 focus:border-blue-primary/50"
          />
          <input
            type="text"
            value={post.subtitle ?? ""}
            onChange={(e) => update({ subtitle: e.target.value })}
            placeholder="Add a subtitle..."
            className="w-full bg-transparent text-text-light text-lg placeholder:text-text-light/20 focus:outline-none border-b border-white/10 pb-2 focus:border-blue-primary/50"
          />
          {/* Slug */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-light/40">slug:</span>
            <input
              type="text"
              value={post.slug ?? ""}
              onChange={(e) => {
                const val = e.target.value
                  .toLowerCase()
                  .replace(/\s+/g, "-")
                  .replace(/[^a-z0-9-]/g, "")
                setSlugManuallyEdited(true)
                update({ slug: val })
              }}
              className="font-mono text-xs bg-white/5 border border-white/10 text-text-light/60 rounded px-2 py-1 focus:outline-none focus:border-blue-primary/50 w-64"
            />
          </div>
        </div>

        {/* Metadata */}
        <CollapsibleSection title="Metadata" defaultOpen>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category */}
            <div>
              <label className={labelClass}>Category</label>
              <select
                value={post.category ?? ""}
                onChange={(e) => update({ category: e.target.value })}
                className={`${inputClass} bg-white/5`}
              >
                <option value="">Select category…</option>
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Tags */}
            <div>
              <label className={labelClass}>Tags (comma-separated)</label>
              <input
                type="text"
                value={(post.tags ?? []).join(", ")}
                onChange={(e) =>
                  update({
                    tags: e.target.value
                      .split(",")
                      .map((t) => t.trim())
                      .filter(Boolean),
                  })
                }
                placeholder="tag1, tag2, tag3"
                className={inputClass}
              />
            </div>

            {/* Author */}
            <div>
              <label className={labelClass}>Author</label>
              <select
                value={(post.authorIds ?? [])[0] ?? ""}
                onChange={(e) =>
                  update({ authorIds: e.target.value ? [e.target.value] : [] })
                }
                className={`${inputClass} bg-white/5`}
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
            <div>
              <label className={labelClass}>Excerpt</label>
              <textarea
                value={post.excerpt ?? ""}
                onChange={(e) => update({ excerpt: e.target.value })}
                placeholder="Brief summary..."
                rows={2}
                className={`${inputClass} resize-none`}
              />
            </div>

            {/* Cover Image */}
            <div className="sm:col-span-2">
              <label className={labelClass}>Cover Image</label>
              <ImageField
                value={post.coverImage ?? ""}
                onChange={(url) => update({ coverImage: url })}
              />
            </div>
          </div>
        </CollapsibleSection>

        {/* SEO */}
        <CollapsibleSection title="SEO" defaultOpen={false}>
          <div className="space-y-4">
            {/* Meta Title */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className={labelClass}>Meta Title</label>
                <span
                  className={`text-xs ${
                    (post.metaTitle?.length ?? 0) > 60
                      ? "text-red-400"
                      : "text-text-light/40"
                  }`}
                >
                  {post.metaTitle?.length ?? 0}/60
                </span>
              </div>
              <input
                type="text"
                value={post.metaTitle ?? ""}
                onChange={(e) => update({ metaTitle: e.target.value })}
                placeholder="Page title for search engines"
                maxLength={80}
                className={inputClass}
              />
            </div>

            {/* Meta Description */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className={labelClass}>Meta Description</label>
                <span
                  className={`text-xs ${
                    (post.metaDescription?.length ?? 0) > 160
                      ? "text-red-400"
                      : "text-text-light/40"
                  }`}
                >
                  {post.metaDescription?.length ?? 0}/160
                </span>
              </div>
              <textarea
                value={post.metaDescription ?? ""}
                onChange={(e) => update({ metaDescription: e.target.value })}
                placeholder="Brief description for search engines"
                rows={3}
                maxLength={200}
                className={`${inputClass} resize-none`}
              />
            </div>

            {/* OG Image */}
            <div>
              <label className={labelClass}>OG Image URL</label>
              <input
                type="url"
                value={post.ogImage ?? ""}
                onChange={(e) => update({ ogImage: e.target.value })}
                placeholder="https://..."
                className={inputClass}
              />
            </div>

            {/* Canonical URL */}
            <div>
              <label className={labelClass}>Canonical URL</label>
              <input
                type="url"
                value={post.canonicalUrl ?? ""}
                onChange={(e) => update({ canonicalUrl: e.target.value })}
                placeholder="https://..."
                className={inputClass}
              />
            </div>
          </div>
        </CollapsibleSection>

        {/* Editor */}
        <div>
          <h2 className="text-text-light/60 text-xs font-medium uppercase tracking-wider mb-3">
            Post Content
          </h2>
          <TiptapEditor
            content={
              isTiptapContent(post.draftContent ?? null)
                ? (post.draftContent as TiptapJSON)
                : EMPTY_DOC
            }
            onChange={handleContentChange}
            onWordCountChange={setWordCount}
          />
        </div>
      </div>

      {/* ── Toast ────────────────────────────────────────────────────────────── */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-space-mid border border-white/10 rounded-xl px-4 py-3 text-sm text-white shadow-xl z-50 animate-in fade-in slide-in-from-bottom-2">
          {toast}
        </div>
      )}
    </div>
  )
}
