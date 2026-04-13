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
          className="flex flex-col items-center justify-center min-h-24 gap-1.5 bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg text-gray-400"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5 text-gray-300"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M3 6a3 3 0 013-3h12a3 3 0 013 3v12a3 3 0 01-3 3H6a3 3 0 01-3-3V6zm4.5 7.5a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0v-2.25a.75.75 0 01.75-.75zm3.75-1.5a.75.75 0 00-1.5 0v4.5a.75.75 0 001.5 0V12zm2.25-3a.75.75 0 01.75.75v6.75a.75.75 0 01-1.5 0V9.75A.75.75 0 0113.5 9zm3.75 1.5a.75.75 0 00-1.5 0v5.25a.75.75 0 001.5 0V10.5z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-xs">Column {i + 1}</span>
        </div>
      ))}
    </div>
  )
  // Note: Columns block — add content blocks to each column
}
