import type { EditorBlock } from "@/lib/visual-editor/types"

interface AudioBlockProps {
  block: EditorBlock
}

export function AudioBlock({ block }: AudioBlockProps) {
  const url = typeof block.props.url === "string" ? block.props.url : null
  const title = typeof block.props.title === "string" ? block.props.title : null

  if (!url) {
    return (
      <div className="flex items-center justify-center w-full h-16 bg-gray-100 border-2 border-dashed border-gray-300 rounded text-gray-400 text-sm">
        No audio URL provided
      </div>
    )
  }

  return (
    <div className="w-full bg-cream rounded-xl px-5 py-4 flex flex-col gap-3">
      {title && (
        <p className="text-sm font-semibold text-text-dark tracking-wide">{title}</p>
      )}
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio controls src={url} className="w-full accent-blue-deep" />
    </div>
  )
}
