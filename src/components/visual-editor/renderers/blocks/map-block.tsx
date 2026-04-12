import type { EditorBlock } from "@/lib/visual-editor/types"

interface MapBlockProps {
  block: EditorBlock
}

export function MapBlock({ block }: MapBlockProps) {
  const address =
    typeof block.props.address === "string" ? block.props.address : null

  return (
    <div className="flex flex-col items-center justify-center w-full h-48 bg-gray-100 border-2 border-dashed border-gray-300 rounded gap-2">
      <span className="text-3xl text-gray-400">📍</span>
      {address ? (
        <p className="text-sm text-gray-600 font-medium text-center px-4">
          {address}
        </p>
      ) : (
        <p className="text-sm text-gray-400">No address provided</p>
      )}
      <p className="text-xs text-gray-400">Map embed (requires API key)</p>
    </div>
  )
}
