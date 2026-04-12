import type { EditorBlock } from "@/lib/visual-editor/types"

interface DividerBlockProps {
  block: EditorBlock
}

export function DividerBlock({ block }: DividerBlockProps) {
  const dividerStyle =
    typeof block.props.style === "string" ? block.props.style : "line"
  const color =
    typeof block.props.color === "string" ? block.props.color : "#e5e7eb"

  if (dividerStyle === "dots") {
    return (
      <div className="flex items-center justify-center py-4 gap-2">
        {[0, 1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full inline-block"
            style={{ background: color }}
          />
        ))}
      </div>
    )
  }

  if (dividerStyle === "wave") {
    return (
      <div className="py-2 overflow-hidden">
        <svg viewBox="0 0 400 20" className="w-full" style={{ height: 20 }}>
          <path
            d="M0,10 Q50,0 100,10 T200,10 T300,10 T400,10"
            fill="none"
            stroke={color}
            strokeWidth="2"
          />
        </svg>
      </div>
    )
  }

  if (dividerStyle === "gradient") {
    return (
      <div className="py-4">
        <div
          className="w-full h-px"
          style={{
            background: `linear-gradient(to right, transparent, ${color}, transparent)`,
          }}
        />
      </div>
    )
  }

  // default: line
  return (
    <div className="py-4">
      <hr style={{ borderColor: color, borderTopWidth: 1 }} />
    </div>
  )
}
