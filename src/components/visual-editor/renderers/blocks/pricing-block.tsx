import type { EditorBlock } from "@/lib/visual-editor/types"

interface PricingBlockProps {
  block: EditorBlock
}

export function PricingBlock({ block }: PricingBlockProps) {
  const name = typeof block.props.name === "string" ? block.props.name : "Plan"
  const price = typeof block.props.price === "string" ? block.props.price : "$0"
  const period =
    typeof block.props.period === "string" ? block.props.period : "/month"
  const features = Array.isArray(block.props.features)
    ? (block.props.features as unknown[]).filter((f): f is string => typeof f === "string")
    : []
  const cta =
    typeof block.props.cta === "string" ? block.props.cta : "Get started"
  const highlighted = block.props.highlighted === true

  return (
    <div
      className={[
        "flex flex-col rounded-xl border p-6 shadow-sm",
        highlighted
          ? "border-blue-600 bg-blue-600 text-white"
          : "border-gray-200 bg-white text-gray-900",
      ].join(" ")}
    >
      <div className="mb-4">
        <p
          className={`text-sm font-semibold uppercase tracking-wide ${highlighted ? "text-blue-100" : "text-gray-500"}`}
        >
          {name}
        </p>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-4xl font-bold">{price}</span>
          <span
            className={`text-sm ${highlighted ? "text-blue-200" : "text-gray-400"}`}
          >
            {period}
          </span>
        </div>
      </div>

      {features.length > 0 && (
        <ul className="mb-6 flex flex-col gap-2 flex-1">
          {features.map((feature, i) => (
            <li key={i} className="flex items-center gap-2 text-sm">
              <span className={highlighted ? "text-blue-200" : "text-green-500"}>
                ✓
              </span>
              {feature}
            </li>
          ))}
        </ul>
      )}

      <span
        className={[
          "mt-auto block text-center rounded-lg px-5 py-2.5 text-sm font-medium transition-colors",
          highlighted
            ? "bg-white text-blue-600 hover:bg-blue-50"
            : "bg-blue-600 text-white hover:bg-blue-700",
        ].join(" ")}
      >
        {cta}
      </span>
    </div>
  )
}
