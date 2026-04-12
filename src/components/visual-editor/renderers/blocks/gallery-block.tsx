import type { EditorBlock } from "@/lib/visual-editor/types"

interface GalleryImage {
  src: string
  alt?: string
}

interface GalleryBlockProps {
  block: EditorBlock
}

const gridColsMap: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
}

export function GalleryBlock({ block }: GalleryBlockProps) {
  const rawImages = Array.isArray(block.props.images) ? block.props.images : []
  const images: GalleryImage[] = rawImages.filter(
    (img): img is GalleryImage =>
      typeof img === "object" && img !== null && typeof (img as GalleryImage).src === "string"
  )

  const columns =
    typeof block.props.columns === "number" &&
    block.props.columns >= 1 &&
    block.props.columns <= 4
      ? block.props.columns
      : 3

  const gridClass = gridColsMap[columns] ?? "grid-cols-3"

  if (images.length === 0) {
    return (
      <div className="flex items-center justify-center w-full h-32 bg-gray-100 border-2 border-dashed border-gray-300 rounded text-gray-400 text-sm">
        No gallery images
      </div>
    )
  }

  return (
    <div className={`grid ${gridClass} gap-3`}>
      {images.map((img, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={i}
          src={img.src}
          alt={img.alt ?? ""}
          className="w-full h-40 object-cover rounded"
        />
      ))}
    </div>
  )
}
