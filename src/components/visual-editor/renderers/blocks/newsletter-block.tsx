import type { EditorBlock } from "@/lib/visual-editor/types"

interface NewsletterBlockProps {
  block: EditorBlock
}

export function NewsletterBlock({ block }: NewsletterBlockProps) {
  const heading =
    typeof block.props.heading === "string"
      ? block.props.heading
      : "Stay in the loop"
  const placeholder =
    typeof block.props.placeholder === "string"
      ? block.props.placeholder
      : "Enter your email"
  const buttonLabel =
    typeof block.props.buttonLabel === "string"
      ? block.props.buttonLabel
      : "Subscribe"

  return (
    <div className="flex flex-col gap-4 py-2">
      {heading && (
        <p className="text-lg font-semibold text-gray-900">{heading}</p>
      )}
      <div className="flex gap-2 flex-wrap">
        <input
          type="email"
          placeholder={placeholder}
          readOnly
          className="flex-1 min-w-0 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none"
        />
        <button
          type="button"
          className="flex-shrink-0 rounded-md bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          {buttonLabel}
        </button>
      </div>
    </div>
  )
}
