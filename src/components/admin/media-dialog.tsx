"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { uploadImage } from "@/lib/image-upload"
import { parseVideoUrl } from "./tiptap-extensions"
import { ImageIcon, Video, Globe, Loader2, UploadCloud, X } from "lucide-react"

interface MediaDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onInsertImage: (src: string, alt: string, title: string) => void
  onInsertVideo: (src: string) => void
  onInsertEmbed: (url: string) => void
  initialTab?: "image" | "video" | "embed"
}

// ─── Image Tab ────────────────────────────────────────────────────────────────

function ImageTab({
  onInsert,
}: {
  onInsert: (src: string, alt: string, title: string) => void
}) {
  const [mode, setMode] = useState<"upload" | "url">("upload")
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [alt, setAlt] = useState("")
  const [caption, setCaption] = useState("")
  const [urlInput, setUrlInput] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  function resetUpload() {
    setPreview(null)
    setAlt("")
    setCaption("")
    setUploadError(null)
  }

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setUploadError("Please select an image file.")
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError("File must be under 10MB.")
      return
    }
    setUploadError(null)
    setUploading(true)
    try {
      const url = await uploadImage(file, "blog")
      setPreview(url)
    } catch {
      setUploadError("Upload failed. Please try again.")
    } finally {
      setUploading(false)
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
  }

  function handleInsertUpload() {
    if (!preview) return
    onInsert(preview, alt, caption)
  }

  function handleInsertUrl() {
    if (!urlInput.trim()) return
    onInsert(urlInput.trim(), alt, caption)
  }

  return (
    <div className="space-y-4">
      {/* Sub-tabs: Upload vs URL */}
      <div className="flex gap-1 p-1 rounded-lg bg-white/5 w-fit">
        <button
          type="button"
          onClick={() => { setMode("upload"); resetUpload() }}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            mode === "upload" ? "bg-white/10 text-white" : "text-text-light/60 hover:text-text-light"
          }`}
        >
          Upload
        </button>
        <button
          type="button"
          onClick={() => { setMode("url"); resetUpload() }}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            mode === "url" ? "bg-white/10 text-white" : "text-text-light/60 hover:text-text-light"
          }`}
        >
          URL
        </button>
      </div>

      {mode === "upload" && (
        <>
          {!preview && !uploading && (
            <div
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                dragging
                  ? "border-blue-400/60 bg-blue-400/5"
                  : "border-white/20 hover:border-blue-400/40"
              }`}
            >
              <UploadCloud className="w-10 h-10 mx-auto mb-3 text-text-light/40" />
              <p className="text-text-light/80 font-medium mb-1">Drop image here or click to upload</p>
              <p className="text-text-light/40 text-sm">Supports JPG, PNG, GIF, WebP &mdash; Max 10MB</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onFileChange}
              />
            </div>
          )}

          {uploading && (
            <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center">
              <Loader2 className="w-8 h-8 mx-auto mb-2 text-blue-400 animate-spin" />
              <p className="text-text-light/60 text-sm">Uploading...</p>
            </div>
          )}

          {uploadError && (
            <p className="text-red-400 text-sm">{uploadError}</p>
          )}

          {preview && (
            <div className="space-y-3">
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full max-h-48 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={resetUpload}
                  className="absolute top-2 right-2 p-1 bg-black/60 rounded-full hover:bg-black/80 transition-colors"
                >
                  <X className="w-3.5 h-3.5 text-white" />
                </button>
              </div>
              <div>
                <label className="block text-xs text-text-light/50 mb-1">Alt text</label>
                <input
                  type="text"
                  value={alt}
                  onChange={(e) => setAlt(e.target.value)}
                  placeholder="Describe the image for accessibility"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-text-light text-sm placeholder:text-text-light/30 outline-none focus:border-blue-400/40"
                />
              </div>
              <div>
                <label className="block text-xs text-text-light/50 mb-1">Caption</label>
                <input
                  type="text"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Optional caption shown below the image"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-text-light text-sm placeholder:text-text-light/30 outline-none focus:border-blue-400/40"
                />
              </div>
              <button
                type="button"
                onClick={handleInsertUpload}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 py-2 font-medium text-sm transition-colors"
              >
                Insert Image
              </button>
            </div>
          )}
        </>
      )}

      {mode === "url" && (
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-text-light/50 mb-1">Image URL</label>
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-text-light text-sm placeholder:text-text-light/30 outline-none focus:border-blue-400/40"
            />
          </div>
          {urlInput && (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={urlInput}
                alt="URL preview"
                className="w-full max-h-40 object-cover rounded-lg"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
              />
              <div>
                <label className="block text-xs text-text-light/50 mb-1">Alt text</label>
                <input
                  type="text"
                  value={alt}
                  onChange={(e) => setAlt(e.target.value)}
                  placeholder="Describe the image for accessibility"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-text-light text-sm placeholder:text-text-light/30 outline-none focus:border-blue-400/40"
                />
              </div>
              <div>
                <label className="block text-xs text-text-light/50 mb-1">Caption</label>
                <input
                  type="text"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Optional caption"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-text-light text-sm placeholder:text-text-light/30 outline-none focus:border-blue-400/40"
                />
              </div>
            </>
          )}
          <button
            type="button"
            onClick={handleInsertUrl}
            disabled={!urlInput.trim()}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg px-4 py-2 font-medium text-sm transition-colors"
          >
            Insert Image
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Video Tab ────────────────────────────────────────────────────────────────

function VideoTab({ onInsert }: { onInsert: (url: string) => void }) {
  const [url, setUrl] = useState("")
  const parsed = url.trim() ? parseVideoUrl(url.trim()) : null

  const ytThumb =
    parsed?.provider === "youtube" && parsed.videoId
      ? `https://img.youtube.com/vi/${parsed.videoId}/hqdefault.jpg`
      : null

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs text-text-light/50 mb-1">Video URL</label>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-text-light text-sm placeholder:text-text-light/30 outline-none focus:border-blue-400/40"
        />
        <p className="mt-1.5 text-text-light/40 text-xs">
          Supports YouTube, Vimeo, or direct video links (.mp4, .webm)
        </p>
      </div>

      {ytThumb && (
        <div className="relative rounded-xl overflow-hidden aspect-video bg-black/40">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={ytThumb} alt="YouTube thumbnail" className="w-full h-full object-cover" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-14 h-14 bg-red-600 rounded-full flex items-center justify-center shadow-lg">
              <div className="w-0 h-0 border-t-[10px] border-b-[10px] border-l-[18px] border-t-transparent border-b-transparent border-l-white ml-1" />
            </div>
          </div>
        </div>
      )}

      {parsed && parsed.provider !== "unknown" && !ytThumb && (
        <div className="rounded-xl bg-white/5 border border-white/10 p-4 text-sm text-text-light/60">
          Provider detected: <span className="text-text-light capitalize">{parsed.provider}</span>
        </div>
      )}

      <button
        type="button"
        onClick={() => url.trim() && onInsert(url.trim())}
        disabled={!url.trim()}
        className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg px-4 py-2 font-medium text-sm transition-colors"
      >
        Insert Video
      </button>
    </div>
  )
}

// ─── Embed Tab ────────────────────────────────────────────────────────────────

function EmbedTab({ onInsert }: { onInsert: (url: string) => void }) {
  const [url, setUrl] = useState("")

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs text-text-light/50 mb-1">URL to embed</label>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://twitter.com/... or https://codepen.io/..."
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-text-light text-sm placeholder:text-text-light/30 outline-none focus:border-blue-400/40"
        />
        <p className="mt-1.5 text-text-light/40 text-xs">
          Supports Twitter/X, Instagram, CodePen, and any webpage
        </p>
      </div>

      {url.trim() && (
        <div className="rounded-xl bg-white/5 border border-white/10 p-3">
          <p className="text-xs text-text-light/40 mb-1">URL preview</p>
          <p className="text-sm text-blue-400 break-all">{url.trim()}</p>
        </div>
      )}

      <button
        type="button"
        onClick={() => url.trim() && onInsert(url.trim())}
        disabled={!url.trim()}
        className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg px-4 py-2 font-medium text-sm transition-colors"
      >
        Insert Embed
      </button>
    </div>
  )
}

// ─── Main Dialog ──────────────────────────────────────────────────────────────

export function MediaDialog({
  open,
  onOpenChange,
  onInsertImage,
  onInsertVideo,
  onInsertEmbed,
  initialTab = "image",
}: MediaDialogProps) {
  const [activeTab, setActiveTab] = useState<"image" | "video" | "embed">(initialTab)

  // Sync tab when caller changes initialTab (e.g. via toolbar or slash menu)
  useEffect(() => {
    if (open) setActiveTab(initialTab)
  }, [open, initialTab])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-space-deep border border-white/10 text-text-light max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-text-light text-base font-semibold">Insert Media</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
          <TabsList className="bg-white/5 border border-white/10 w-full">
            <TabsTrigger
              value="image"
              className="flex-1 data-[state=active]:bg-white/10 data-[state=active]:text-white text-text-light/60 gap-1.5"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              Image
            </TabsTrigger>
            <TabsTrigger
              value="video"
              className="flex-1 data-[state=active]:bg-white/10 data-[state=active]:text-white text-text-light/60 gap-1.5"
            >
              <Video className="w-3.5 h-3.5" />
              Video
            </TabsTrigger>
            <TabsTrigger
              value="embed"
              className="flex-1 data-[state=active]:bg-white/10 data-[state=active]:text-white text-text-light/60 gap-1.5"
            >
              <Globe className="w-3.5 h-3.5" />
              Embed
            </TabsTrigger>
          </TabsList>

          <TabsContent value="image" className="mt-4">
            <ImageTab onInsert={onInsertImage} />
          </TabsContent>

          <TabsContent value="video" className="mt-4">
            <VideoTab onInsert={onInsertVideo} />
          </TabsContent>

          <TabsContent value="embed" className="mt-4">
            <EmbedTab onInsert={onInsertEmbed} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
