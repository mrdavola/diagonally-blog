"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, FileText } from "lucide-react"
import { listPages, createPage } from "@/lib/blocks/firestore"
import type { PageDocument } from "@/lib/blocks/types"

const PLACEHOLDER_PAGES: PageDocument[] = [
  {
    slug: "home",
    title: "Home",
    draftBlocks: [],
    publishedBlocks: [],
    showInNav: true,
    navOrder: 0,
    navLabel: "Home",
    lastEditedBy: null,
    lastEditedAt: null,
    publishedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    slug: "about",
    title: "About",
    draftBlocks: [],
    publishedBlocks: [],
    showInNav: true,
    navOrder: 1,
    navLabel: "About",
    lastEditedBy: null,
    lastEditedAt: null,
    publishedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    slug: "schools",
    title: "Schools",
    draftBlocks: [],
    publishedBlocks: [],
    showInNav: true,
    navOrder: 2,
    navLabel: "Schools",
    lastEditedBy: null,
    lastEditedAt: null,
    publishedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    slug: "parents",
    title: "Parents",
    draftBlocks: [],
    publishedBlocks: [],
    showInNav: true,
    navOrder: 3,
    navLabel: "Parents",
    lastEditedBy: null,
    lastEditedAt: null,
    publishedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

export default function PagesListPage() {
  const router = useRouter()
  const [pages, setPages] = useState<PageDocument[]>(PLACEHOLDER_PAGES)
  const [showCreate, setShowCreate] = useState(false)
  const [newSlug, setNewSlug] = useState("")
  const [newTitle, setNewTitle] = useState("")
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  useEffect(() => {
    listPages()
      .then((result) => {
        if (result.length > 0) setPages(result)
      })
      .catch(() => {
        // Fall back to placeholder pages
      })
  }, [])

  async function handleCreatePage() {
    if (!newSlug || !newTitle) {
      setCreateError("Slug and title are required.")
      return
    }
    setCreating(true)
    setCreateError(null)
    try {
      await createPage(newSlug, newTitle)
      setPages((prev) => [
        ...prev,
        {
          slug: newSlug,
          title: newTitle,
          draftBlocks: [],
          publishedBlocks: [],
          showInNav: false,
          navOrder: prev.length,
          navLabel: newTitle,
          lastEditedBy: null,
          lastEditedAt: null,
          publishedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ])
      setShowCreate(false)
      setNewSlug("")
      setNewTitle("")
      router.push(`/admin/pages/${newSlug}`)
    } catch (err) {
      setCreateError("Failed to create page. Please try again.")
      console.error(err)
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl text-white">Pages</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-blue-700 hover:bg-blue-600 text-white rounded-xl px-4 py-2 text-sm font-medium transition"
        >
          <Plus className="w-4 h-4" />
          Create Page
        </button>
      </div>

      {/* Page grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {pages.map((page) => {
          const isPublished = !!page.publishedAt
          return (
            <button
              key={page.slug}
              onClick={() => router.push(`/admin/pages/${page.slug}`)}
              className="bg-space-deep/50 rounded-2xl p-6 border border-white/10 hover:border-white/20 text-left transition hover:bg-space-deep/70 group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-text-light/40" />
                </div>
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    isPublished
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-yellow-500/20 text-yellow-400"
                  }`}
                >
                  {isPublished ? "Published" : "Draft"}
                </span>
              </div>
              <p className="text-white font-medium mb-1 group-hover:text-blue-300 transition">
                {page.title}
              </p>
              <p className="text-text-light/50 text-sm font-mono">/{page.slug}</p>
            </button>
          )
        })}
      </div>

      {/* Create page modal */}
      {showCreate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setShowCreate(false) }}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCreate(false)} />
          <div className="relative bg-space-mid rounded-2xl border border-white/10 shadow-2xl w-full max-w-md p-6">
            <h2 className="text-white font-display text-lg mb-4">Create Page</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-text-light/70 text-sm font-medium mb-1.5">
                  Page Title
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. For Teachers"
                  className="w-full bg-space-deep/50 border border-white/10 text-white text-sm rounded-lg px-3 py-2 placeholder:text-text-light/30 focus:outline-none focus:border-blue-500/50"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-text-light/70 text-sm font-medium mb-1.5">
                  Slug
                </label>
                <input
                  type="text"
                  value={newSlug}
                  onChange={(e) =>
                    setNewSlug(e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""))
                  }
                  placeholder="e.g. for-teachers"
                  className="w-full bg-space-deep/50 border border-white/10 text-white text-sm rounded-lg px-3 py-2 placeholder:text-text-light/30 focus:outline-none focus:border-blue-500/50 font-mono"
                />
              </div>

              {createError && (
                <p className="text-red-400 text-sm">{createError}</p>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreate(false)}
                className="flex-1 text-sm text-text-light/50 hover:text-white py-2 rounded-lg border border-white/10 hover:border-white/20 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePage}
                disabled={creating || !newSlug || !newTitle}
                className="flex-1 text-sm bg-blue-700 hover:bg-blue-600 text-white py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {creating ? "Creating…" : "Create Page"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
