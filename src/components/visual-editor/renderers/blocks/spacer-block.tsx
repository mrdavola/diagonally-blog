"use client"

import type { EditorBlock } from "@/lib/visual-editor/types"

interface SpacerBlockProps {
  block: EditorBlock
}

export function SpacerBlock({ block }: SpacerBlockProps) {
  const height =
    typeof block.props.height === "number" ? block.props.height : 40

  return <div style={{ height }} aria-hidden="true" />
}
