"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { X, UploadCloud, Search, Loader2, Trash2 } from "lucide-react"
import { useAuth } from "@/components/admin/auth-provider"
import { uploadAsset, listAssets, deleteAsset } from "@/lib/visual-editor/asset-firestore"
import type { Asset } from "@/lib/visual-editor/types"

// ─── Props ────────────────────────────────────────────────────────────────────

interface AssetLibraryProps {
  open: boolean
  onClose: () => void
  onSelect: (url: string, alt?: string) => void
}

// ─── Upload Tab ───────────────────────────────────────────────────────────────

function UploadTab({
  onUploaded,
  userEmail,
}: {
  onUploaded: (asset: Asset) => void
  userEmail: string
}) {
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    setError(null)
    if (file.size > 20 * 1024 * 1024) {
      setError("File must be under 20 MB.")
      return
    }
    setUploading(true)
    setProgress(0)
    try {
      const asset = await uploadAsset(file, userEmail, setProgress)
      onUploaded(asset)
    } catch {
      setError("Upload failed. Please try again.")
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  function onDragOver(e: React.DragEvent) {
    e.preventDefault()
    setDragging(true)
  }

  function onDragLeave() {
    setDragging(false)
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    // reset so same file can be re-selected
    e.target.value = ""
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-6">
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
        className={`w-full rounded-xl border-2 border-dashed p-12 text-center transition-colors ${
          uploading
            ? "cursor-default border-blue-300 bg-blue-50"
            : dragging
            ? "cursor-copy border-blue-400 bg-blue-50"
            : "cursor-pointer border-gray-300 hover:border-blue-400 hover:bg-gray-50"
        }`}
      >
        {uploading ? (
          <>
            <Loader2 className="mx-auto mb-3 h-10 w-10 animate-spin text-blue-400" />
            <p className="mb-2 text-sm font-medium text-gray-600">Uploading…</p>
            <div className="mx-auto h-1.5 w-48 overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-blue-500 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-gray-400">{progress}%</p>
          </>
        ) : (
          <>
            <UploadCloud className="mx-auto mb-3 h-10 w-10 text-gray-300" />
            <p className="mb-1 text-sm font-medium text-gray-600">Drop files here or click to upload</p>
            <p className="text-xs text-gray-400">Images, videos, and files — max 20 MB</p>
          </>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="image/*,video/*"
        onChange={onFileChange}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
}

// ─── Browse Tab ───────────────────────────────────────────────────────────────

function BrowseTab({
  assets,
  loading,
  onSelect,
  onDelete,
}: {
  assets: Asset[]
  loading: boolean
  onSelect: (asset: Asset) => void
  onDelete: (asset: Asset) => void
}) {
  const [query, setQuery] = useState("")

  const filtered = query.trim()
    ? assets.filter((a) =>
        a.filename.toLowerCase().includes(query.toLowerCase())
      )
    : assets

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm focus:border-blue-400 focus:outline-none"
          placeholder="Search by filename…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <p className="py-10 text-center text-sm text-gray-400">
          {query ? "No assets match your search." : "No assets yet. Upload some files!"}
        </p>
      ) : (
        <div className="grid grid-cols-4 gap-3 overflow-y-auto" style={{ maxHeight: "calc(80vh - 240px)" }}>
          {filtered.map((asset) => (
            <AssetTile
              key={asset.id}
              asset={asset}
              onSelect={onSelect}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function AssetTile({
  asset,
  onSelect,
  onDelete,
}: {
  asset: Asset
  onSelect: (asset: Asset) => void
  onDelete: (asset: Asset) => void
}) {
  const [confirmDelete, setConfirmDelete] = useState(false)

  return (
    <div className="group relative cursor-pointer overflow-hidden rounded-lg border border-gray-200 bg-gray-50 hover:border-blue-400">
      {/* Thumbnail */}
      <button
        type="button"
        className="block w-full"
        onClick={() => onSelect(asset)}
        aria-label={`Select ${asset.filename}`}
      >
        {asset.type === "image" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={asset.thumbnailUrl}
            alt={asset.alt ?? asset.filename}
            className="h-20 w-full object-cover"
          />
        ) : (
          <div className="flex h-20 w-full items-center justify-center bg-gray-100">
            <span className="text-xs font-medium uppercase text-gray-400">
              {asset.mimeType.split("/")[1] ?? "file"}
            </span>
          </div>
        )}
      </button>

      {/* Info */}
      <div className="px-1.5 py-1">
        <p className="truncate text-xs text-gray-600" title={asset.filename}>
          {asset.filename}
        </p>
        {asset.dimensions && (
          <p className="text-xs text-gray-400">
            {asset.dimensions.width}×{asset.dimensions.height}
          </p>
        )}
      </div>

      {/* Delete button */}
      {!confirmDelete ? (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setConfirmDelete(true) }}
          className="absolute right-1 top-1 hidden rounded bg-black/50 p-0.5 text-white group-hover:flex items-center justify-center"
          aria-label="Delete asset"
        >
          <Trash2 size={11} />
        </button>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-white/90 p-1">
          <p className="text-xs font-medium text-gray-700">Delete?</p>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => { onDelete(asset); setConfirmDelete(false) }}
              className="rounded bg-red-500 px-2 py-0.5 text-xs text-white hover:bg-red-600"
            >
              Yes
            </button>
            <button
              type="button"
              onClick={() => setConfirmDelete(false)}
              className="rounded bg-gray-200 px-2 py-0.5 text-xs text-gray-700 hover:bg-gray-300"
            >
              No
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main Modal ───────────────────────────────────────────────────────────────

export function AssetLibrary({ open, onClose, onSelect }: AssetLibraryProps) {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<"upload" | "browse">("browse")
  const [assets, setAssets] = useState<Asset[]>([])
  const [loadingAssets, setLoadingAssets] = useState(false)

  // Load assets when modal opens or browse tab is shown
  const loadAssets = useCallback(async () => {
    setLoadingAssets(true)
    try {
      const list = await listAssets()
      setAssets(list)
    } catch (err) {
      console.error("[AssetLibrary] Failed to list assets:", err)
    } finally {
      setLoadingAssets(false)
    }
  }, [])

  useEffect(() => {
    if (open) {
      loadAssets()
    }
  }, [open, loadAssets])

  useEffect(() => {
    if (open && activeTab === "browse") {
      loadAssets()
    }
  }, [open, activeTab, loadAssets])

  function handleUploaded(asset: Asset) {
    setAssets((prev) => [asset, ...prev])
    setActiveTab("browse")
  }

  function handleSelect(asset: Asset) {
    onSelect(asset.url, asset.alt)
    onClose()
  }

  async function handleDelete(asset: Asset) {
    setAssets((prev) => prev.filter((a) => a.id !== asset.id))
    try {
      await deleteAsset(asset.id)
    } catch (err) {
      console.error("[AssetLibrary] Delete failed:", err)
      // Re-add on failure
      setAssets((prev) => [asset, ...prev])
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative z-10 flex max-h-[80vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 shrink-0">
          <h2 className="text-base font-semibold text-gray-900">Asset Library</h2>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tab bar */}
        <div className="flex shrink-0 border-b border-gray-100 px-5">
          {(["browse", "upload"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`mr-4 py-3 text-sm font-medium capitalize transition-colors ${
                activeTab === tab
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === "upload" ? (
            <UploadTab
              userEmail={user?.email ?? "unknown"}
              onUploaded={handleUploaded}
            />
          ) : (
            <BrowseTab
              assets={assets}
              loading={loadingAssets}
              onSelect={handleSelect}
              onDelete={handleDelete}
            />
          )}
        </div>
      </div>
    </div>
  )
}
