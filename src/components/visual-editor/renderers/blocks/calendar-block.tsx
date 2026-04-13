import type { EditorBlock } from "@/lib/visual-editor/types"

interface CalendarBlockProps {
  block: EditorBlock
}

export function CalendarBlock({ block }: CalendarBlockProps) {
  const embedUrl =
    typeof block.props.embedUrl === "string"
      ? block.props.embedUrl
      : typeof block.props.url === "string"
        ? block.props.url
        : null

  if (embedUrl) {
    return (
      <div className="relative w-full rounded-xl overflow-hidden" style={{ paddingBottom: "75%" }}>
        <iframe
          src={embedUrl}
          className="absolute inset-0 w-full h-full"
          title="Calendar"
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center w-full h-48 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl gap-2">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-8 h-8 text-gray-300"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M6.75 2.25A.75.75 0 017.5 3v1.5h9V3A.75.75 0 0118 3v1.5h.75a3 3 0 013 3v11.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V7.5a3 3 0 013-3H6V3a.75.75 0 01.75-.75zm13.5 9a1.5 1.5 0 00-1.5-1.5H5.25a1.5 1.5 0 00-1.5 1.5v7.5a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5v-7.5z"
          clipRule="evenodd"
        />
      </svg>
      <p className="text-sm font-medium text-gray-400 text-center px-6">
        Add a calendar embed URL in the properties panel
      </p>
    </div>
  )
}
