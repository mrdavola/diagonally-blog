"use client"

import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { listPostVersions, restoreVersion } from "@/lib/posts"
import type { TiptapJSON, PostVersion } from "@/lib/blocks/types"

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatVersionDate(date: Date): string {
  const now = new Date()
  const isToday =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()

  const time = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

  if (isToday) return `Today, ${time}`

  const month = date.toLocaleString("default", { month: "short" })
  const day = date.getDate()
  return `${month} ${day}, ${time}`
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface VersionHistoryProps {
  slug: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onRestore: (content: TiptapJSON) => void
}

// ─── Component ────────────────────────────────────────────────────────────────

export function VersionHistory({ slug, open, onOpenChange, onRestore }: VersionHistoryProps) {
  const [versions, setVersions] = useState<PostVersion[]>([])
  const [loading, setLoading] = useState(false)
  const [confirmingId, setConfirmingId] = useState<string | null>(null)
  const [restoringId, setRestoringId] = useState<string | null>(null)
  const [successId, setSuccessId] = useState<string | null>(null)

  // Fetch versions when sheet opens
  useEffect(() => {
    if (!open) return
    setLoading(true)
    setConfirmingId(null)
    setSuccessId(null)
    listPostVersions(slug)
      .then(setVersions)
      .catch(() => setVersions([]))
      .finally(() => setLoading(false))
  }, [open, slug])

  async function handleRestore(version: PostVersion) {
    if (confirmingId !== version.id) {
      setConfirmingId(version.id)
      return
    }

    setRestoringId(version.id)
    try {
      await restoreVersion(slug, version.id)
      onRestore(version.content)
      setSuccessId(version.id)
      setConfirmingId(null)
      setTimeout(() => setSuccessId(null), 2000)
    } catch {
      // silently fail — parent will handle via toast if needed
    } finally {
      setRestoringId(false ? "" : null)
      setRestoringId(null)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="bg-space-deep border-l border-space-mid w-80 p-0 flex flex-col"
        showCloseButton
      >
        <SheetHeader className="px-5 pt-5 pb-4 border-b border-white/10">
          <SheetTitle className="text-text-light text-sm font-semibold">
            Version History
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-5 h-5 animate-spin text-text-light/30" />
            </div>
          ) : versions.length === 0 ? (
            <div className="flex items-center justify-center py-16">
              <p className="text-xs text-text-light/30">No versions yet</p>
            </div>
          ) : (
            <ul>
              {versions.map((version) => {
                const isConfirming = confirmingId === version.id
                const isRestoring = restoringId === version.id
                const isSuccess = successId === version.id

                return (
                  <li
                    key={version.id}
                    className="border-b border-white/5 px-5 py-4"
                  >
                    <p className="text-sm text-text-light font-medium leading-snug">
                      {formatVersionDate(version.savedAt)}
                    </p>
                    <p className="text-xs text-text-light/40 mt-0.5 mb-3">
                      {version.wordCount.toLocaleString()} words
                    </p>

                    {isConfirming ? (
                      <div className="space-y-2">
                        <p className="text-xs text-text-light/50 leading-snug">
                          Restore this version? Your current draft will be replaced.
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleRestore(version)}
                            disabled={isRestoring}
                            className="flex items-center gap-1.5 text-xs border border-white/20 text-white hover:bg-white/5 px-3 py-1 rounded-lg transition disabled:opacity-50"
                          >
                            {isRestoring && (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            )}
                            Confirm
                          </button>
                          <button
                            onClick={() => setConfirmingId(null)}
                            className="text-xs border border-white/10 text-text-light/40 hover:text-text-light/70 px-3 py-1 rounded-lg transition"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : isSuccess ? (
                      <span className="text-xs text-emerald-400">Restored</span>
                    ) : (
                      <button
                        onClick={() => handleRestore(version)}
                        className="text-xs border border-white/10 text-text-light/60 hover:text-white hover:border-white/20 px-3 py-1 rounded-lg transition"
                      >
                        Restore
                      </button>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
