"use client"

import { useEffect, useState } from "react"
import { X, RotateCcw, Clock } from "lucide-react"
import { useEditorStore } from "@/lib/visual-editor/editor-store"
import { getVersionHistory, type PageSectionVersion } from "@/lib/visual-editor/firestore"

// ─── Props ────────────────────────────────────────────────────────────────────

interface VersionHistoryPanelProps {
  onClose: () => void
  narrow?: boolean
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(d: Date): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d)
}

// ─── Component ────────────────────────────────────────────────────────────────

export function VersionHistoryPanel({ onClose, narrow }: VersionHistoryPanelProps) {
  const slug = useEditorStore((s) => s.slug)
  const setSections = useEditorStore((s) => s.setSections)

  const [versions, setVersions] = useState<PageSectionVersion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [confirming, setConfirming] = useState<string | null>(null) // version id pending confirm

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    getVersionHistory(slug)
      .then((v) => { if (!cancelled) { setVersions(v); setLoading(false) } })
      .catch((err) => {
        console.error("[VersionHistoryPanel] Failed to load versions:", err)
        if (!cancelled) { setError("Failed to load version history."); setLoading(false) }
      })

    return () => { cancelled = true }
  }, [slug])

  function handleRestoreClick(versionId: string) {
    setConfirming(versionId)
  }

  function handleConfirmRestore(v: PageSectionVersion) {
    setSections(v.sections)
    setConfirming(null)
    onClose()
  }

  return (
    <div
      className={`fixed right-0 top-12 z-40 flex ${narrow ? "w-72" : "w-80"} max-h-[calc(100vh-3rem)] flex-col overflow-hidden rounded-bl-xl rounded-tl-xl border border-gray-200 bg-white shadow-2xl`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 shrink-0">
        <div className="flex items-center gap-2">
          <Clock size={14} className="text-gray-500" />
          <span className="text-sm font-semibold text-gray-900">Version History</span>
        </div>
        <button
          onClick={onClose}
          className="flex h-6 w-6 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
          aria-label="Close version history"
        >
          <X size={14} />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-gray-700" />
          </div>
        )}

        {error && (
          <p className="p-4 text-sm text-red-500">{error}</p>
        )}

        {!loading && !error && versions.length === 0 && (
          <p className="p-4 text-sm text-gray-400">No published versions yet.</p>
        )}

        {!loading && !error && versions.length > 0 && (
          <ul className="divide-y divide-gray-100">
            {versions.map((v) => (
              <li key={v.id} className="px-4 py-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900">Version {v.version}</p>
                    <p className="text-xs text-gray-500 truncate">{v.publishedBy}</p>
                    <p className="text-xs text-gray-400">{formatDate(v.publishedAt)}</p>
                    {v.note && (
                      <p className="mt-1 text-xs text-gray-500 italic">{v.note}</p>
                    )}
                  </div>

                  {confirming === v.id ? (
                    <div className="flex flex-col gap-1 shrink-0">
                      <button
                        onClick={() => handleConfirmRestore(v)}
                        className="rounded-md bg-red-500 px-2.5 py-1 text-xs font-medium text-white hover:bg-red-600 transition-colors"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setConfirming(null)}
                        className="rounded-md border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleRestoreClick(v.id)}
                      title={`Restore version ${v.version}`}
                      className="flex shrink-0 items-center gap-1 rounded-md border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-colors"
                    >
                      <RotateCcw size={11} />
                      Restore
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
