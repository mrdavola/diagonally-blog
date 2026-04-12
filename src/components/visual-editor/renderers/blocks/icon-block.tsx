import type { EditorBlock } from "@/lib/visual-editor/types"
import * as LucideIcons from "lucide-react"

interface IconBlockProps {
  block: EditorBlock
}

export function IconBlock({ block }: IconBlockProps) {
  const iconName =
    typeof block.props.icon === "string" ? block.props.icon : "Star"
  const size = typeof block.props.size === "number" ? block.props.size : 48
  const color =
    typeof block.props.color === "string" ? block.props.color : "currentColor"

  // Convert kebab-case or snake_case to PascalCase for lucide lookup
  const pascalName = iconName
    .split(/[-_\s]/)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join("")

  const IconComponent = (LucideIcons as unknown as Record<string, React.ComponentType<{ size?: number; color?: string }>>)[
    pascalName
  ]

  if (!IconComponent) {
    return (
      <div className="flex items-center justify-center w-full h-16 bg-gray-100 border-2 border-dashed border-gray-300 rounded text-gray-400 text-xs">
        Icon &quot;{iconName}&quot; not found
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center py-2">
      <IconComponent size={size} color={color} />
    </div>
  )
}
