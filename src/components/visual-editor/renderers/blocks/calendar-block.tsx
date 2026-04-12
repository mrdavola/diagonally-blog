import type { EditorBlock } from "@/lib/visual-editor/types"

interface CalendarBlockProps {
  block: EditorBlock
}

export function CalendarBlock({ block }: CalendarBlockProps) {
  const url = typeof block.props.url === "string" ? block.props.url : null

  if (url) {
    return (
      <div className="relative w-full" style={{ paddingBottom: "75%" }}>
        <iframe
          src={url}
          className="absolute inset-0 w-full h-full rounded border border-gray-200"
          title="Calendar"
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center w-full h-48 bg-gray-100 border-2 border-dashed border-gray-300 rounded gap-2">
      <span className="text-3xl text-gray-400">📅</span>
      <p className="text-sm text-gray-400">No calendar URL provided</p>
      <p className="text-xs text-gray-400">Calendar embed (e.g. Google Calendar)</p>
    </div>
  )
}
