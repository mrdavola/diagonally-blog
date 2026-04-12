import type { EditorBlock } from "@/lib/visual-editor/types"

interface CodeBlockProps {
  block: EditorBlock
}

export function CodeBlock({ block }: CodeBlockProps) {
  const html = typeof block.props.html === "string" ? block.props.html : null

  return (
    <div className="w-full border border-gray-200 rounded-lg overflow-hidden">
      <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 border-b border-gray-200">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          Custom Code
        </span>
      </div>
      {html ? (
        <div
          className="p-4"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <div className="flex items-center justify-center h-16 text-gray-400 text-sm">
          No HTML provided
        </div>
      )}
    </div>
  )
}
