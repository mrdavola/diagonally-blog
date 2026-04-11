"use client"

interface PublishControlsProps {
  status: "published" | "draft" | "unsaved"
  hasChanges: boolean
  onSave: () => void
  onPublish: () => void
  onDiscard: () => void
  saving: boolean
  publishing: boolean
}

export function PublishControls({
  status,
  hasChanges,
  onSave,
  onPublish,
  onDiscard,
  saving,
  publishing,
}: PublishControlsProps) {
  const statusConfig = {
    published: { label: "Published", className: "bg-emerald-500/20 text-emerald-400" },
    draft: { label: "Draft", className: "bg-yellow-500/20 text-yellow-400" },
    unsaved: { label: "Unsaved", className: "bg-orange-500/20 text-orange-400" },
  }

  const badge = statusConfig[status]

  return (
    <div className="flex items-center gap-2 p-3 bg-space-deep/50 rounded-xl border border-white/10">
      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${badge.className}`}>
        {badge.label}
      </span>
      <div className="flex-1" />
      <button
        onClick={onDiscard}
        disabled={!hasChanges}
        className="text-sm text-text-light/50 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition px-2 py-1 rounded-lg"
      >
        Discard
      </button>
      <button
        onClick={onSave}
        disabled={!hasChanges || saving}
        className="text-sm bg-white/10 hover:bg-white/20 text-white rounded-lg px-3 py-1.5 disabled:opacity-40 disabled:cursor-not-allowed transition"
      >
        {saving ? "Saving…" : "Save Draft"}
      </button>
      <button
        onClick={onPublish}
        disabled={publishing}
        className="text-sm bg-blue-700 hover:bg-blue-600 text-white rounded-lg px-3 py-1.5 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        {publishing ? "Publishing…" : "Publish"}
      </button>
    </div>
  )
}
