import type { EditorBlock } from "@/lib/visual-editor/types"

interface StatItem {
  value: string | number
  label: string
  prefix?: string
  suffix?: string
}

interface StatsBlockProps {
  block: EditorBlock
}

export function StatsBlock({ block }: StatsBlockProps) {
  const rawStats = Array.isArray(block.props.stats) ? block.props.stats : []
  const stats: StatItem[] = rawStats.filter(
    (s): s is StatItem =>
      typeof s === "object" && s !== null && "value" in (s as object) && "label" in (s as object)
  )

  if (stats.length === 0) {
    return (
      <div className="flex items-center justify-center w-full h-16 bg-gray-100 border-2 border-dashed border-gray-300 rounded text-gray-400 text-sm">
        No stats configured
      </div>
    )
  }

  return (
    <div className="flex flex-wrap justify-around gap-6 py-4">
      {stats.map((stat, i) => (
        <div key={i} className="text-center">
          <div className="text-4xl font-bold text-gray-900">
            {stat.prefix && (
              <span className="text-2xl font-semibold">{stat.prefix}</span>
            )}
            {stat.value}
            {stat.suffix && (
              <span className="text-2xl font-semibold">{stat.suffix}</span>
            )}
          </div>
          <div className="mt-1 text-sm text-gray-500 font-medium">{stat.label}</div>
        </div>
      ))}
    </div>
  )
}
