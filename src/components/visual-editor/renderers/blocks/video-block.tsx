import type { EditorBlock } from "@/lib/visual-editor/types"

interface VideoBlockProps {
  block: EditorBlock
}

function extractYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  )
  return match ? match[1] : null
}

function extractVimeoId(url: string): string | null {
  const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/)
  return match ? match[1] : null
}

export function VideoBlock({ block }: VideoBlockProps) {
  const url = typeof block.props.url === "string" ? block.props.url : null
  const caption =
    typeof block.props.caption === "string" ? block.props.caption : null

  if (!url) {
    return (
      <div className="flex items-center justify-center w-full h-48 bg-gray-100 border-2 border-dashed border-gray-300 rounded text-gray-400 text-sm">
        No video URL provided
      </div>
    )
  }

  const youtubeId = extractYouTubeId(url)
  const vimeoId = extractVimeoId(url)

  const embedSrc = youtubeId
    ? `https://www.youtube.com/embed/${youtubeId}`
    : vimeoId
      ? `https://player.vimeo.com/video/${vimeoId}`
      : null

  return (
    <figure className="m-0">
      <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
        {embedSrc ? (
          <iframe
            src={embedSrc}
            className="absolute inset-0 w-full h-full rounded"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={caption ?? "Video"}
          />
        ) : (
          // eslint-disable-next-line jsx-a11y/media-has-caption
          <video
            src={url}
            controls
            className="absolute inset-0 w-full h-full rounded object-cover"
          />
        )}
      </div>
      {caption && (
        <figcaption className="text-center text-sm text-gray-500 mt-2">
          {caption}
        </figcaption>
      )}
    </figure>
  )
}
