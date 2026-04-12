"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Plus,
  GripVertical,
  MoreVertical,
  ChevronUp,
  ChevronDown,
  Trash2,
  Pencil,
} from "lucide-react"
import { doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { listPages, createPage, deletePage } from "@/lib/blocks/firestore"
import type { PageDocument } from "@/lib/blocks/types"

// ─── Helpers ──────────────────────────────────────────────────────────────────

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

function isPublished(page: PageDocument): boolean {
  return page.publishedBlocks.length > 0
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ page }: { page: PageDocument }) {
  const published = isPublished(page)
  return (
    <span
      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
        published
          ? "bg-emerald-500/20 text-emerald-400"
          : "bg-yellow-500/20 text-yellow-400"
      }`}
    >
      {published ? "Published" : "Draft"}
    </span>
  )
}

// ─── Nav Toggle ───────────────────────────────────────────────────────────────

function NavToggle({
  checked,
  onChange,
}: {
  checked: boolean
  onChange: (val: boolean) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 flex-shrink-0 rounded-full border-2 border-transparent transition-colors cursor-pointer focus:outline-none ${
        checked ? "bg-blue-600" : "bg-white/20"
      }`}
      title={checked ? "Hide from nav" : "Show in nav"}
      aria-checked={checked}
      role="switch"
    >
      <span
        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-4" : "translate-x-0"
        }`}
      />
    </button>
  )
}

// ─── Actions Menu ─────────────────────────────────────────────────────────────

function ActionsMenu({
  page,
  onEdit,
  onToggleNav,
  onDelete,
}: {
  page: PageDocument
  onEdit: () => void
  onToggleNav: () => void
  onDelete: () => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="p-1.5 rounded-lg text-text-light/40 hover:text-text-light/70 hover:bg-white/5 transition"
        title="Actions"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-20 bg-space-mid border border-white/10 rounded-xl shadow-xl py-1 w-44 text-sm">
            <button
              onClick={() => { setOpen(false); onEdit() }}
              className="flex items-center gap-2.5 w-full px-3 py-2 text-text-light/70 hover:text-white hover:bg-white/5 transition"
            >
              <Pencil className="w-3.5 h-3.5" />
              Edit page
            </button>
            <button
              onClick={() => { setOpen(false); onToggleNav() }}
              className="flex items-center gap-2.5 w-full px-3 py-2 text-text-light/70 hover:text-white hover:bg-white/5 transition"
            >
              {page.showInNav ? (
                <>
                  <span className="w-3.5 h-3.5 flex items-center justify-center text-xs">✕</span>
                  Hide from nav
                </>
              ) : (
                <>
                  <span className="w-3.5 h-3.5 flex items-center justify-center text-xs">✓</span>
                  Show in nav
                </>
              )}
            </button>
            <div className="my-1 border-t border-white/10" />
            <button
              onClick={() => { setOpen(false); onDelete() }}
              className="flex items-center gap-2.5 w-full px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete page
            </button>
          </div>
        </>
      )}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function PagesListPage() {
  const router = useRouter()
  const [pages, setPages] = useState<PageDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<string | null>(null)

  // Create modal
  const [showCreate, setShowCreate] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [newSlug, setNewSlug] = useState("")
  const [slugManuallySet, setSlugManuallySet] = useState(false)
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<PageDocument | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    listPages()
      .then((result) => {
        const sorted = result.sort((a, b) => a.navOrder - b.navOrder)
        setPages(sorted)
      })
      .catch(() => setPages([]))
      .finally(() => setLoading(false))
  }, [])

  // Auto-slug from title
  useEffect(() => {
    if (!slugManuallySet) {
      setNewSlug(slugify(newTitle))
    }
  }, [newTitle, slugManuallySet])

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  // ── Toggle showInNav ─────────────────────────────────────────────────────────
  async function handleToggleNav(page: PageDocument) {
    const next = !page.showInNav
    // Optimistic update
    setPages((prev) =>
      prev.map((p) => (p.slug === page.slug ? { ...p, showInNav: next } : p))
    )
    try {
      await updateDoc(doc(db, "pages", page.slug), { showInNav: next })
    } catch (err) {
      console.error(err)
      // Revert on error
      setPages((prev) =>
        prev.map((p) => (p.slug === page.slug ? { ...p, showInNav: !next } : p))
      )
      showToast("Failed to update nav visibility.")
    }
  }

  // ── Move nav order ───────────────────────────────────────────────────────────
  async function handleMoveOrder(slug: string, direction: "up" | "down") {
    const idx = pages.findIndex((p) => p.slug === slug)
    if (direction === "up" && idx <= 0) return
    if (direction === "down" && idx >= pages.length - 1) return

    const swapIdx = direction === "up" ? idx - 1 : idx + 1
    const newPages = [...pages]
    // Swap
    ;[newPages[idx], newPages[swapIdx]] = [newPages[swapIdx], newPages[idx]]
    // Reassign navOrder
    const updated = newPages.map((p, i) => ({ ...p, navOrder: i }))
    setPages(updated)

    // Persist both swapped pages
    try {
      await Promise.all([
        updateDoc(doc(db, "pages", updated[idx].slug), { navOrder: updated[idx].navOrder }),
        updateDoc(doc(db, "pages", updated[swapIdx].slug), { navOrder: updated[swapIdx].navOrder }),
      ])
    } catch (err) {
      console.error(err)
      showToast("Failed to save new order.")
      // Revert
      setPages(pages)
    }
  }

  // ── Create page ──────────────────────────────────────────────────────────────
  async function handleCreatePage() {
    if (!newTitle.trim() || !newSlug.trim()) {
      setCreateError("Title and slug are required.")
      return
    }
    if (pages.some((p) => p.slug === newSlug)) {
      setCreateError(`A page with slug "${newSlug}" already exists.`)
      return
    }
    setCreating(true)
    setCreateError(null)
    try {
      await createPage(newSlug, newTitle.trim())
      setShowCreate(false)
      setNewTitle("")
      setNewSlug("")
      setSlugManuallySet(false)
      router.push(`/admin/pages/${newSlug}`)
    } catch (err) {
      console.error(err)
      setCreateError("Failed to create page. Please try again.")
    } finally {
      setCreating(false)
    }
  }

  // ── Delete page ──────────────────────────────────────────────────────────────
  async function handleDeletePage() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deletePage(deleteTarget.slug)
      setPages((prev) => prev.filter((p) => p.slug !== deleteTarget.slug))
      showToast(`"${deleteTarget.title}" deleted.`)
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
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl text-white">Pages</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-blue-700 hover:bg-blue-600 text-white rounded-xl px-4 py-2 text-sm font-medium transition"
        >
          <Plus className="w-4 h-4" />
          New Page
        </button>
      </div>

      {/* Pages list */}
      {loading ? (
        <div className="text-text-light/50 text-sm py-12 text-center">Loading pages…</div>
      ) : pages.length === 0 ? (
        <div className="bg-space-deep/50 rounded-2xl p-12 border border-white/10 flex flex-col items-center gap-4 text-center">
          <p className="text-text-light/60 text-sm">No pages yet. Create your first page!</p>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 bg-blue-700 hover:bg-blue-600 text-white rounded-xl px-4 py-2 text-sm font-medium transition"
          >
            <Plus className="w-4 h-4" />
            New Page
          </button>
        </div>
      ) : (
        <div className="bg-space-deep/50 rounded-2xl border border-white/10 overflow-hidden">
          {pages.map((page, idx) => (
            <div
              key={page.slug}
              className={`flex items-center gap-3 px-4 py-3 hover:bg-white/[0.03] transition group ${
                idx < pages.length - 1 ? "border-b border-white/5" : ""
              }`}
            >
              {/* Drag handle (visual only) */}
              <GripVertical className="w-4 h-4 text-text-light/20 group-hover:text-text-light/40 flex-shrink-0 cursor-grab" />

              {/* Up/down order buttons */}
              <div className="flex flex-col gap-0.5 flex-shrink-0">
                <button
                  onClick={() => handleMoveOrder(page.slug, "up")}
                  disabled={idx === 0}
                  className="p-0.5 text-text-light/20 hover:text-text-light/60 disabled:opacity-20 disabled:cursor-not-allowed transition"
                  title="Move up"
                >
                  <ChevronUp className="w-3 h-3" />
                </button>
                <button
                  onClick={() => handleMoveOrder(page.slug, "down")}
                  disabled={idx === pages.length - 1}
                  className="p-0.5 text-text-light/20 hover:text-text-light/60 disabled:opacity-20 disabled:cursor-not-allowed transition"
                  title="Move down"
                >
                  <ChevronDown className="w-3 h-3" />
                </button>
              </div>

              {/* Title + slug */}
              <button
                onClick={() => router.push(`/admin/pages/${page.slug}`)}
                className="flex-1 min-w-0 text-left"
              >
                <span className="text-white font-medium text-sm group-hover:text-blue-300 transition">
                  {page.navLabel || page.title}
                </span>
                <span className="ml-2 text-text-light/40 text-xs font-mono">
                  /{page.slug}
                </span>
              </button>

              {/* Status badge */}
              <StatusBadge page={page} />

              {/* Nav toggle */}
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="text-text-light/40 text-xs hidden sm:block">Nav</span>
                <NavToggle
                  checked={page.showInNav}
                  onChange={() => handleToggleNav(page)}
                />
              </div>

              {/* Actions menu */}
              <ActionsMenu
                page={page}
                onEdit={() => router.push(`/admin/pages/${page.slug}`)}
                onToggleNav={() => handleToggleNav(page)}
                onDelete={() => setDeleteTarget(page)}
              />
            </div>
          ))}
        </div>
      )}

      {/* Create page modal */}
      {showCreate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setShowCreate(false) }}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCreate(false)} />
          <div className="relative bg-space-mid rounded-2xl border border-white/10 shadow-2xl w-full max-w-md p-6">
            <h2 className="text-white font-display text-lg mb-4">New Page</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-text-light/70 text-sm font-medium mb-1.5">
                  Page Title
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleCreatePage() }}
                  placeholder="e.g. For Teachers"
                  className="w-full bg-space-deep/50 border border-white/10 text-white text-sm rounded-lg px-3 py-2 placeholder:text-text-light/30 focus:outline-none focus:border-blue-500/50"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-text-light/70 text-sm font-medium mb-1.5">
                  Slug
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light/30 text-sm">/</span>
                  <input
                    type="text"
                    value={newSlug}
                    onChange={(e) => {
                      setSlugManuallySet(true)
                      setNewSlug(
                        e.target.value
                          .toLowerCase()
                          .replace(/\s+/g, "-")
                          .replace(/[^a-z0-9-]/g, "")
                      )
                    }}
                    placeholder="for-teachers"
                    className="w-full bg-space-deep/50 border border-white/10 text-white text-sm rounded-lg pl-6 pr-3 py-2 placeholder:text-text-light/30 focus:outline-none focus:border-blue-500/50 font-mono"
                  />
                </div>
              </div>

              {createError && (
                <p className="text-red-400 text-sm">{createError}</p>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowCreate(false)
                  setNewTitle("")
                  setNewSlug("")
                  setSlugManuallySet(false)
                  setCreateError(null)
                }}
                className="flex-1 text-sm text-text-light/50 hover:text-white py-2 rounded-lg border border-white/10 hover:border-white/20 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePage}
                disabled={creating || !newTitle.trim() || !newSlug.trim()}
                className="flex-1 text-sm bg-blue-700 hover:bg-blue-600 text-white py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {creating ? "Creating…" : "Create Page"}
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
          <div className="relative bg-space-mid rounded-2xl border border-white/10 shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h2 className="text-white font-medium">Delete page &ldquo;{deleteTarget.title}&rdquo;?</h2>
                <p className="text-text-light/50 text-sm">This cannot be undone.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="flex-1 text-sm text-text-light/50 hover:text-white py-2 rounded-lg border border-white/10 hover:border-white/20 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeletePage}
                disabled={deleting}
                className="flex-1 text-sm bg-red-600 hover:bg-red-500 text-white py-2 rounded-lg disabled:opacity-50 transition"
              >
                {deleting ? "Deleting…" : "Delete Page"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-space-mid border border-white/10 rounded-xl px-4 py-3 text-sm text-white shadow-xl z-50">
          {toast}
        </div>
      )}
    </div>
  )
}
