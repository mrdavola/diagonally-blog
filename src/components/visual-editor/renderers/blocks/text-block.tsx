"use client"

import type { EditorBlock } from "@/lib/visual-editor/types"

interface TextBlockProps {
  block: EditorBlock
}

export function TextBlock({ block }: TextBlockProps) {
  const content =
    typeof block.props.content === "string"
      ? block.props.content
      : "<p>Click to edit text...</p>"

  return (
    <div
      className="prose prose-lg max-w-none"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  )
}
