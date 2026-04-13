import type { EditorBlock } from "@/lib/visual-editor/types"

interface EmbedBlockProps {
  block: EditorBlock
}

export function EmbedBlock({ block }: EmbedBlockProps) {
  const url = typeof block.props.url === "string" ? block.props.url : null
  const html = typeof block.props.html === "string" ? block.props.html : null

  if (html) {
    return (
      <div
        className="w-full"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    )
  }

  if (url) {
    return (
      <div className="relative w-full rounded-xl overflow-hidden" style={{ aspectRatio: "16/9" }}>
        <iframe
          src={url}
          className="absolute inset-0 w-full h-full"
          title="Embed"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-presentation"
        />
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center w-full h-32 bg-gray-100 border-2 border-dashed border-gray-300 rounded text-gray-400 text-sm">
      No embed URL or HTML provided
    </div>
  )
}
