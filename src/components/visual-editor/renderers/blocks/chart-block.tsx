import type { EditorBlock } from "@/lib/visual-editor/types"

interface ChartBlockProps {
  block: EditorBlock
}

export function ChartBlock({ block }: ChartBlockProps) {
  const type =
    typeof block.props.type === "string" ? block.props.type : "bar"
  const data = Array.isArray(block.props.data) ? block.props.data : []

  return (
    <div className="flex flex-col items-center justify-center w-full h-48 bg-gray-50 border-2 border-dashed border-gray-300 rounded gap-2">
      <div className="text-3xl text-gray-300">
        {type === "bar" ? "▌▌▌▌" : "〜〜〜"}
      </div>
      <p className="text-sm font-medium text-gray-500">
        Chart: {type}
      </p>
      <p className="text-xs text-gray-400">{data.length} data points</p>
    </div>
  )
}
