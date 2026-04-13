import type { EditorBlock } from "@/lib/visual-editor/types"

interface MapBlockProps {
  block: EditorBlock
}

export function MapBlock({ block }: MapBlockProps) {
  const embedUrl =
    typeof block.props.embedUrl === "string" ? block.props.embedUrl : null

  if (embedUrl) {
    return (
      <div className="relative w-full rounded-xl overflow-hidden" style={{ aspectRatio: "16/9" }}>
        <iframe
          src={embedUrl}
          className="absolute inset-0 w-full h-full"
          title="Map"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
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
          d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-2.013 3.51-4.797 3.51-8.217 0-4.693-3.79-8.5-8.48-8.5-4.69 0-8.48 3.807-8.48 8.5 0 3.42 1.566 6.204 3.51 8.217a19.58 19.58 0 002.683 2.282c.36.239.727.463 1.144.742zM12 13.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z"
          clipRule="evenodd"
        />
      </svg>
      <p className="text-sm font-medium text-gray-400 text-center px-6">
        Add a map embed URL in the properties panel
      </p>
    </div>
  )
}
