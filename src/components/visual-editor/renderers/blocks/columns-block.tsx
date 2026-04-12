import type { EditorBlock } from "@/lib/visual-editor/types"

interface ColumnsBlockProps {
  block: EditorBlock
}

const gridColsMap: Record<number, string> = {
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
}

export function ColumnsBlock({ block }: ColumnsBlockProps) {
  const columns =
    typeof block.props.columns === "number" &&
    block.props.columns >= 2 &&
    block.props.columns <= 4
      ? block.props.columns
      : 2

  const gridClass = gridColsMap[columns] ?? "grid-cols-2"

  return (
    <div className={`grid ${gridClass} gap-4 w-full min-h-24`}>
      {Array.from({ length: columns }).map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-center min-h-20 bg-gray-50 border-2 border-dashed border-gray-200 rounded text-gray-400 text-xs"
        >
          Column {i + 1}
        </div>
      ))}
    </div>
  )
}
