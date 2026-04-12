import type { EditorBlock } from "@/lib/visual-editor/types"

interface ComparisonRow {
  feature: string
  values: boolean[]
}

interface ComparisonBlockProps {
  block: EditorBlock
}

export function ComparisonBlock({ block }: ComparisonBlockProps) {
  const columns = Array.isArray(block.props.columns)
    ? (block.props.columns as unknown[]).filter((c): c is string => typeof c === "string")
    : []

  const rawRows = Array.isArray(block.props.rows) ? block.props.rows : []
  const rows: ComparisonRow[] = rawRows.filter(
    (r): r is ComparisonRow =>
      typeof r === "object" &&
      r !== null &&
      typeof (r as ComparisonRow).feature === "string" &&
      Array.isArray((r as ComparisonRow).values)
  )

  if (columns.length === 0 && rows.length === 0) {
    return (
      <div className="flex items-center justify-center w-full h-16 bg-gray-100 border-2 border-dashed border-gray-300 rounded text-gray-400 text-sm">
        No comparison data
      </div>
    )
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-gray-50">
            <th className="border border-gray-200 px-4 py-3 text-left font-semibold text-gray-700">
              Feature
            </th>
            {columns.map((col, i) => (
              <th
                key={i}
                className="border border-gray-200 px-4 py-3 text-center font-semibold text-gray-700"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
              <td className="border border-gray-200 px-4 py-3 text-gray-700">
                {row.feature}
              </td>
              {row.values.map((val, j) => (
                <td
                  key={j}
                  className="border border-gray-200 px-4 py-3 text-center"
                >
                  {val ? (
                    <span className="text-green-500 font-bold">✓</span>
                  ) : (
                    <span className="text-gray-300">—</span>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
