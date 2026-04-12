"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { LayoutTemplate, Plus, Trash2, FileText } from "lucide-react"
import { listTemplates, deleteTemplate } from "@/lib/templates"
import type { PostTemplate } from "@/lib/templates"

const CATEGORIES: Record<string, string> = {
  "build-in-public": "Build-in-Public",
  "learner-stories": "Learner Stories",
  education: "Education",
  "product-updates": "Product Updates",
}

export default function TemplatesPage() {
  const router = useRouter()
  const [templates, setTemplates] = useState<PostTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    listTemplates()
      .then(setTemplates)
      .catch(() => setTemplates([]))
      .finally(() => setLoading(false))
  }, [])

  async function handleDelete(id: string) {
    setDeleting(true)
    try {
      await deleteTemplate(id)
      setTemplates((prev) => prev.filter((t) => t.id !== id))
    } catch (err) {
      console.error(err)
    } finally {
      setDeleting(false)
      setDeleteConfirm(null)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl text-white">Post Templates</h1>
        <button
          onClick={() => router.push("/admin/posts/new")}
          className="flex items-center gap-2 bg-blue-700 hover:bg-blue-600 text-white rounded-xl px-4 py-2 text-sm font-medium transition"
        >
          <Plus className="w-4 h-4" />
          New Template
        </button>
      </div>

      {loading ? (
        <div className="text-text-light/50 text-sm py-12 text-center">Loading templates…</div>
      ) : templates.length === 0 ? (
        <div className="bg-space-deep/50 rounded-2xl p-12 border border-white/10 flex flex-col items-center gap-4 text-center">
          <LayoutTemplate className="w-10 h-10 text-text-light/20" />
          <p className="text-white font-medium">No templates yet.</p>
          <p className="text-text-light/50 text-sm">
            Save a post as a template from the editor.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {templates.map((template) => (
            <div
              key={template.id}
              className="bg-space-deep/50 rounded-2xl p-5 border border-white/10 hover:border-white/20 transition flex flex-col gap-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium line-clamp-1">{template.name}</p>
                  {template.description && (
                    <p className="text-text-light/50 text-sm mt-1 line-clamp-2">
                      {template.description}
                    </p>
                  )}
                </div>
                {template.category && (
                  <span className="text-xs text-text-light/40 bg-white/5 px-2 py-0.5 rounded-full shrink-0">
                    {CATEGORIES[template.category] ?? template.category}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 mt-auto pt-2 border-t border-white/5">
                <button
                  onClick={() =>
                    router.push(`/admin/posts/new?template=${template.id}`)
                  }
                  className="flex items-center gap-1.5 bg-blue-700 hover:bg-blue-600 text-white rounded-lg px-3 py-1.5 text-xs font-medium transition"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Use
                </button>
                <button
                  onClick={() => setDeleteConfirm(template.id)}
                  className="flex items-center gap-1.5 bg-white/5 hover:bg-red-500/10 text-text-light/50 hover:text-red-400 rounded-lg px-3 py-1.5 text-xs font-medium transition border border-white/10 hover:border-red-500/20"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
                <span className="ml-auto text-text-light/30 text-xs">
                  {template.createdAt.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirmation dialog */}
      {deleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setDeleteConfirm(null)
          }}
        >
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setDeleteConfirm(null)}
          />
          <div className="relative bg-space-mid rounded-2xl border border-white/10 shadow-2xl w-full max-w-sm p-6">
            <h2 className="text-white font-display text-lg mb-2">Delete Template?</h2>
            <p className="text-text-light/60 text-sm mb-6">
              This template will be permanently deleted. Posts created from it won&apos;t be affected.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 text-sm text-text-light/50 hover:text-white py-2 rounded-lg border border-white/10 hover:border-white/20 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                disabled={deleting}
                className="flex-1 text-sm bg-red-600 hover:bg-red-500 text-white py-2 rounded-lg disabled:opacity-50 transition"
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
