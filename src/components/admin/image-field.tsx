"use client"

import { useRef, useState } from "react"
import { Upload, X, Loader2 } from "lucide-react"
import { uploadImage } from "@/lib/image-upload"

interface ImageFieldProps {
  value: string
  onChange: (url: string) => void
}

export function ImageField({ value, onChange }: ImageFieldProps) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    setUploading(true)
    setError(null)
    try {
      const url = await uploadImage(file, "pages")
      onChange(url)
    } catch (err) {
      setError("Upload failed. Please try again.")
      console.error(err)
    } finally {
      setUploading(false)
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith("image/")) {
      handleFile(file)
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  return (
    <div className="space-y-2">
      {value && (
        <div className="relative inline-block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Preview"
            className="rounded-lg max-h-32 object-cover border border-white/10"
          />
          <button
            onClick={() => onChange("")}
            className="absolute -top-2 -right-2 bg-red-500/80 hover:bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center transition"
            title="Remove image"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      <div
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        className={`border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition ${
          dragOver
            ? "border-blue-400 bg-blue-500/10"
            : "border-white/20 hover:border-white/40 bg-space-deep/30"
        }`}
      >
        {uploading ? (
          <>
            <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
            <span className="text-xs text-text-light/50">Uploading…</span>
          </>
        ) : (
          <>
            <Upload className="w-5 h-5 text-text-light/40" />
            <span className="text-xs text-text-light/50">
              Click or drop image here
            </span>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleChange}
        />
      </div>

      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}

      <input
        type="url"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Or paste image URL…"
        className="w-full bg-space-deep/50 border border-white/10 text-white text-sm rounded-lg px-3 py-2 placeholder:text-text-light/30 focus:outline-none focus:border-blue-500/50"
      />
    </div>
  )
}
