import type { EditorBlock } from "@/lib/visual-editor/types"

interface CodeBlockProps {
  block: EditorBlock
}

export function CodeBlock({ block }: CodeBlockProps) {
  const code = typeof block.props.code === "string" ? block.props.code : null
  const language =
    typeof block.props.language === "string" && block.props.language
      ? block.props.language
      : null

  return (
    <div className="w-full rounded-xl overflow-hidden">
      <div className="flex items-center justify-between bg-space-deep/90 px-4 py-2 border-b border-white/10">
        <span className="text-xs font-medium text-text-light/50 uppercase tracking-widest">
          {language ?? "code"}
        </span>
        <span className="flex gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-500/60" />
          <span className="w-3 h-3 rounded-full bg-yellow-500/60" />
          <span className="w-3 h-3 rounded-full bg-green-500/60" />
        </span>
      </div>
      {code ? (
        <pre className="bg-space-deep text-text-light text-sm font-mono p-5 overflow-x-auto leading-relaxed">
          <code>{code}</code>
        </pre>
      ) : (
        <div className="flex items-center justify-center h-16 bg-space-deep text-text-light/40 text-sm font-mono">
          // no code provided
        </div>
      )}
    </div>
  )
}
