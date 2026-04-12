import type { EditorBlock } from "@/lib/visual-editor/types"

interface CardBlockProps {
  block: EditorBlock
}

export function CardBlock({ block }: CardBlockProps) {
  const title = typeof block.props.title === "string" ? block.props.title : null
  const body = typeof block.props.body === "string" ? block.props.body : null
  const image = typeof block.props.image === "string" ? block.props.image : null
  const imagePosition =
    block.props.imagePosition === "left" ? "left" : "top"

  const isLeft = imagePosition === "left"

  return (
    <div
      className={`border border-gray-200 rounded-lg overflow-hidden shadow-sm bg-white ${isLeft ? "flex" : "flex flex-col"}`}
    >
      {image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image}
          alt={title ?? ""}
          className={isLeft ? "w-1/3 object-cover" : "w-full h-48 object-cover"}
        />
      )}
      <div className="p-5 flex-1">
        {title && (
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        )}
        {body && <p className="text-gray-600 text-sm leading-relaxed">{body}</p>}
        {!title && !body && (
          <p className="text-gray-400 text-sm">Card content goes here</p>
        )}
      </div>
    </div>
  )
}
