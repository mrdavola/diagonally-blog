import type { ContentBlock } from "@/lib/blocks/types"

export function LegacyRenderer({ blocks }: { blocks: ContentBlock[] }) {
  return (
    <div className="prose-diagonally">
      {blocks.map((block) => {
        switch (block.type) {
          case "paragraph":
            return (
              <p key={block.id} className="mb-4 leading-relaxed">
                {block.content}
              </p>
            )
          case "heading":
            return (
              <h2
                key={block.id}
                className="font-display text-2xl font-bold text-text-dark mt-8 mb-3"
              >
                {block.content}
              </h2>
            )
          case "subheading":
            return (
              <h3
                key={block.id}
                className="font-display text-xl font-bold text-text-dark mt-6 mb-2"
              >
                {block.content}
              </h3>
            )
          case "image":
            return (
              <figure key={block.id} className="my-6">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={block.imageUrl ?? ""}
                  alt=""
                  className="rounded-xl w-full"
                />
                {block.content && (
                  <figcaption className="text-sm text-text-dark/50 mt-2 text-center">
                    {block.content}
                  </figcaption>
                )}
              </figure>
            )
          case "quote":
            return (
              <blockquote
                key={block.id}
                className="pl-4 border-l-2 border-gold/40 italic text-text-dark/70 my-6"
              >
                {block.content}
              </blockquote>
            )
          case "callout":
            return (
              <div
                key={block.id}
                className="bg-blue-primary/5 border border-blue-primary/20 rounded-xl p-5 my-6"
              >
                {block.content}
              </div>
            )
          case "list":
            return (
              <ul key={block.id} className="list-disc pl-6 mb-4 space-y-1">
                {block.content.split("\n").map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            )
          case "divider":
            return (
              <hr
                key={block.id}
                className="border-t border-text-dark/10 my-8"
              />
            )
          default:
            return null
        }
      })}
    </div>
  )
}
