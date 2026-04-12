import type { EditorBlock } from "@/lib/visual-editor/types"

interface CtaBlockProps {
  block: EditorBlock
}

export function CtaBlock({ block }: CtaBlockProps) {
  const headline =
    typeof block.props.headline === "string"
      ? block.props.headline
      : "Ready to get started?"
  const subtext =
    typeof block.props.subtext === "string" ? block.props.subtext : null
  const buttonLabel =
    typeof block.props.buttonLabel === "string"
      ? block.props.buttonLabel
      : "Get started"
  const bgColor =
    typeof block.props.bgColor === "string" ? block.props.bgColor : "#1d4ed8"

  return (
    <div
      className="flex flex-col items-center justify-center text-center gap-4 px-8 py-12 rounded-xl w-full"
      style={{ background: bgColor }}
    >
      <h2 className="text-2xl font-bold text-white">{headline}</h2>
      {subtext && <p className="text-white/80 text-base max-w-md">{subtext}</p>}
      <span className="inline-block mt-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer">
        {buttonLabel}
      </span>
    </div>
  )
}
