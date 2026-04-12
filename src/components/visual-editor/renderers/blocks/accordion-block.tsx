import type { EditorBlock } from "@/lib/visual-editor/types"

interface AccordionItem {
  question: string
  answer: string
}

interface AccordionBlockProps {
  block: EditorBlock
}

export function AccordionBlock({ block }: AccordionBlockProps) {
  const rawItems = Array.isArray(block.props.items) ? block.props.items : []
  const items: AccordionItem[] = rawItems
    .filter(
      (item): item is AccordionItem =>
        typeof item === "object" &&
        item !== null &&
        typeof (item as AccordionItem).question === "string"
    )

  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center w-full h-16 bg-gray-100 border-2 border-dashed border-gray-300 rounded text-gray-400 text-sm">
        No accordion items
      </div>
    )
  }

  return (
    <div className="divide-y divide-gray-200 border border-gray-200 rounded-lg overflow-hidden">
      {items.map((item, i) => (
        <details key={i} className="group bg-white">
          <summary className="flex items-center justify-between px-5 py-4 cursor-pointer list-none font-medium text-gray-800 hover:bg-gray-50 transition-colors">
            <span>{item.question}</span>
            <span className="ml-4 text-gray-400 group-open:rotate-180 transition-transform text-lg leading-none">
              ▾
            </span>
          </summary>
          <div className="px-5 pb-4 text-gray-600 text-sm leading-relaxed">
            {item.answer}
          </div>
        </details>
      ))}
    </div>
  )
}
