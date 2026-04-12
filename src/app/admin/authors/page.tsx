"use client"

import { useEffect, useState } from "react"
import { Plus, UserCircle2, Pencil, Trash2, X, Loader2, Link } from "lucide-react"
import { listAuthors, saveAuthor, deleteAuthor } from "@/lib/authors"
import { ImageField } from "@/components/admin/image-field"
import type { Author } from "@/lib/blocks/types"

function emptyAuthor(): Author {
  return {
    id: crypto.randomUUID(),
    name: "",
    role: "",
    bio: "",
    headshot: "",
    socialLinks: [],
  }
}

interface AuthorFormProps {
  initial: Author
  onSave: (author: Author) => void
  onCancel: () => void
}

function AuthorForm({ initial, onSave, onCancel }: AuthorFormProps) {
  const [author, setAuthor] = useState<Author>(initial)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function set(patch: Partial<Author>) {
    setAuthor((a) => ({ ...a, ...patch }))
  }

  async function handleSave() {
    if (!author.name.trim()) {
      setError("Name is required.")
      return
    }
    setSaving(true)
    setError(null)
    try {
      await saveAuthor(author)
      onSave(author)
    } catch (err) {
      console.error(err)
      setError("Save failed. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const inputClass =
    "w-full bg-space-deep/50 border border-white/10 text-white text-sm rounded-lg px-3 py-2 placeholder:text-text-light/30 focus:outline-none focus:border-blue-500/50"
  const labelClass = "block text-text-light/60 text-xs font-medium mb-1"

  return (
    <div className="space-y-4">
      <div>
        <label className={labelClass}>Name</label>
        <input
          type="text"
          value={author.name}
          onChange={(e) => set({ name: e.target.value })}
          placeholder="Full name"
          className={inputClass}
          autoFocus
        />
      </div>
      <div>
        <label className={labelClass}>Role</label>
        <input
          type="text"
          value={author.role}
          onChange={(e) => set({ role: e.target.value })}
          placeholder="e.g. Co-Founder, Educator"
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Bio</label>
        <textarea
          value={author.bio}
          onChange={(e) => set({ bio: e.target.value })}
          placeholder="Short bio…"
          rows={3}
          className={`${inputClass} resize-none`}
        />
      </div>
      {/* Social Links */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className={labelClass}>Social Links</label>
          <button
            type="button"
            onClick={() =>
              set({ socialLinks: [...author.socialLinks, { platform: "", url: "" }] })
            }
            className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition"
          >
            <Plus className="w-3 h-3" />
            Add link
          </button>
        </div>
        {author.socialLinks.length === 0 ? (
          <p className="text-text-light/30 text-xs italic">No social links yet.</p>
        ) : (
          <div className="space-y-2">
            {author.socialLinks.map((link, i) => (
              <div key={i} className="flex gap-2 items-center">
                <div className="relative flex-shrink-0">
                  <Link className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-text-light/30 pointer-events-none" />
                  <input
                    type="text"
                    value={link.platform}
                    onChange={(e) => {
                      const updated = author.socialLinks.map((l, j) =>
                        j === i ? { ...l, platform: e.target.value } : l
                      )
                      set({ socialLinks: updated })
                    }}
                    placeholder="Platform"
                    className="bg-space-deep/50 border border-white/10 text-white text-xs rounded-lg pl-7 pr-2 py-2 w-28 placeholder:text-text-light/30 focus:outline-none focus:border-blue-500/50"
                  />
                </div>
                <input
                  type="url"
                  value={link.url}
                  onChange={(e) => {
                    const updated = author.socialLinks.map((l, j) =>
                      j === i ? { ...l, url: e.target.value } : l
                    )
                    set({ socialLinks: updated })
                  }}
                  placeholder="https://..."
                  className="flex-1 bg-space-deep/50 border border-white/10 text-white text-xs rounded-lg px-3 py-2 placeholder:text-text-light/30 focus:outline-none focus:border-blue-500/50"
                />
                <button
                  type="button"
                  onClick={() =>
                    set({ socialLinks: author.socialLinks.filter((_, j) => j !== i) })
                  }
                  className="text-text-light/30 hover:text-red-400 transition flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <label className={labelClass}>Headshot</label>
        <ImageField value={author.headshot} onChange={(url) => set({ headshot: url })} />
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <div className="flex gap-3 pt-2">
        <button
          onClick={onCancel}
          className="flex-1 text-sm text-text-light/50 hover:text-white py-2 rounded-lg border border-white/10 hover:border-white/20 transition"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 text-sm bg-blue-700 hover:bg-blue-600 text-white py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition"
        >
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          {saving ? "Saving…" : "Save Author"}
        </button>
      </div>
    </div>
  )
}

export default function AuthorsPage() {
  const [authors, setAuthors] = useState<Author[]>([])
  const [loading, setLoading] = useState(true)
  const [modalMode, setModalMode] = useState<"add" | "edit" | null>(null)
  const [editingAuthor, setEditingAuthor] = useState<Author | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    listAuthors()
      .then(setAuthors)
      .catch(() => setAuthors([]))
      .finally(() => setLoading(false))
  }, [])

  function openAdd() {
    setEditingAuthor(emptyAuthor())
    setModalMode("add")
  }

  function openEdit(author: Author) {
    setEditingAuthor({ ...author })
    setModalMode("edit")
  }

  function closeModal() {
    setModalMode(null)
    setEditingAuthor(null)
  }

  function handleSaved(saved: Author) {
    setAuthors((prev) => {
      const idx = prev.findIndex((a) => a.id === saved.id)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = saved
        return next
      }
      return [...prev, saved]
    })
    closeModal()
  }

  async function handleDelete(id: string) {
    setDeleting(true)
    try {
      await deleteAuthor(id)
      setAuthors((prev) => prev.filter((a) => a.id !== id))
    } catch (err) {
      console.error(err)
    } finally {
      setDeleting(false)
      setDeleteConfirmId(null)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl text-white">Authors</h1>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-blue-700 hover:bg-blue-600 text-white rounded-xl px-4 py-2 text-sm font-medium transition"
        >
          <Plus className="w-4 h-4" />
          Add Author
        </button>
      </div>

      {loading ? (
        <div className="text-text-light/50 text-sm py-12 text-center">Loading authors…</div>
      ) : authors.length === 0 ? (
        <div className="bg-space-deep/50 rounded-2xl p-12 border border-white/10 flex flex-col items-center gap-4 text-center">
          <UserCircle2 className="w-10 h-10 text-text-light/20" />
          <p className="text-text-light/60 text-sm">No authors yet.</p>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 bg-blue-700 hover:bg-blue-600 text-white rounded-xl px-4 py-2 text-sm font-medium transition"
          >
            <Plus className="w-4 h-4" />
            Add Author
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {authors.map((author) => (
            <div
              key={author.id}
              className="bg-space-deep/50 rounded-2xl p-5 border border-white/10 flex flex-col gap-3"
            >
              {/* Avatar */}
              <div className="flex items-center gap-3">
                {author.headshot ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={author.headshot}
                    alt={author.name}
                    className="w-12 h-12 rounded-full object-cover border border-white/10 flex-shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0">
                    <UserCircle2 className="w-7 h-7 text-text-light/20" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-white font-medium text-sm truncate">{author.name || "—"}</p>
                  <p className="text-text-light/50 text-xs truncate">{author.role || "No role"}</p>
                </div>
              </div>

              {author.bio && (
                <p className="text-text-light/50 text-xs line-clamp-2">{author.bio}</p>
              )}

              {/* Actions */}
              <div className="flex gap-2 mt-auto pt-1">
                <button
                  onClick={() => openEdit(author)}
                  className="flex-1 flex items-center justify-center gap-1.5 text-xs text-text-light/50 hover:text-white border border-white/10 hover:border-white/20 rounded-lg py-1.5 transition"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Edit
                </button>
                {deleteConfirmId === author.id ? (
                  <div className="flex gap-1.5 flex-1">
                    <button
                      onClick={() => setDeleteConfirmId(null)}
                      className="flex-1 text-xs text-text-light/50 hover:text-white border border-white/10 rounded-lg py-1.5 transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleDelete(author.id)}
                      disabled={deleting}
                      className="flex-1 text-xs text-red-400 hover:text-red-300 border border-red-500/30 hover:border-red-400/50 rounded-lg py-1.5 transition disabled:opacity-50"
                    >
                      {deleting ? "…" : "Confirm"}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeleteConfirmId(author.id)}
                    className="flex items-center justify-center gap-1.5 text-xs text-text-light/50 hover:text-red-400 border border-white/10 hover:border-red-500/30 rounded-lg py-1.5 px-3 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit modal */}
      {modalMode && editingAuthor && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) closeModal() }}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative bg-space-mid rounded-2xl border border-white/10 shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white font-display text-lg">
                {modalMode === "add" ? "Add Author" : "Edit Author"}
              </h2>
              <button onClick={closeModal} className="text-text-light/40 hover:text-text-light/70 transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <AuthorForm
              initial={editingAuthor}
              onSave={handleSaved}
              onCancel={closeModal}
            />
          </div>
        </div>
      )}
    </div>
  )
}
