"use client"

import type { EditorBlock } from "@/lib/visual-editor/types"

interface ImageBlockProps {
  block: EditorBlock
}

export function ImageBlock({ block }: ImageBlockProps) {
  const src = typeof block.props.src === "string" ? block.props.src : null
  const alt = typeof block.props.alt === "string" ? block.props.alt : ""
  const caption =
    typeof block.props.caption === "string" ? block.props.caption : null

  if (!src) {
    return (
      <div className="flex items-center justify-center w-full h-40 bg-gray-100 border-2 border-dashed border-gray-300 rounded text-gray-400 text-sm">
        No image selected
      </div>
    )
  }

  return (
    <figure className="m-0">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className="w-full h-auto block" />
      {caption && (
        <figcaption className="text-center text-sm text-gray-500 mt-2">
          {caption}
        </figcaption>
      )}
    </figure>
  )
}
