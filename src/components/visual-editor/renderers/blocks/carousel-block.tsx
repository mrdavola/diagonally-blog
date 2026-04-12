import type { EditorBlock } from "@/lib/visual-editor/types"

interface CarouselImage {
  src: string
  alt?: string
}

interface CarouselBlockProps {
  block: EditorBlock
}

export function CarouselBlock({ block }: CarouselBlockProps) {
  const rawImages = Array.isArray(block.props.images) ? block.props.images : []
  const images: CarouselImage[] = rawImages.filter(
    (img): img is CarouselImage =>
      typeof img === "object" &&
      img !== null &&
      typeof (img as CarouselImage).src === "string"
  )

  if (images.length === 0) {
    return (
      <div className="flex items-center justify-center w-full h-48 bg-gray-100 border-2 border-dashed border-gray-300 rounded text-gray-400 text-sm">
        No carousel images
      </div>
    )
  }

  return (
    <div
      className="flex gap-4 overflow-x-auto pb-2"
      style={{ scrollSnapType: "x mandatory" }}
    >
      {images.map((img, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={i}
          src={img.src}
          alt={img.alt ?? ""}
          className="flex-shrink-0 w-72 h-48 object-cover rounded"
          style={{ scrollSnapAlign: "start" }}
        />
      ))}
    </div>
  )
}
