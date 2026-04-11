"use client"

import { BLOCK_REGISTRY } from "@/lib/blocks/registry"
import type { Block } from "@/lib/blocks/types"
import { FieldRenderer } from "./field-renderer"
import * as Icons from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface BlockEditorProps {
  block: Block
  onUpdate: (block: Block) => void
}

export function BlockEditor({ block, onUpdate }: BlockEditorProps) {
  const definition = BLOCK_REGISTRY.get(block.type)

  if (!definition) {
    return (
      <div className="p-4 text-text-light/50 text-sm">
        Unknown block type: <code className="text-white/80">{block.type}</code>
      </div>
    )
  }

  const IconComponent = (Icons[definition.icon as keyof typeof Icons] as LucideIcon) ?? Icons.Box

  function handleFieldChange(key: string, value: unknown) {
    onUpdate({
      ...block,
      props: { ...block.props, [key]: value },
    })
  }

  return (
    <div className="p-4">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/10">
        <div className="w-7 h-7 rounded-lg bg-blue-600/20 flex items-center justify-center">
          <IconComponent className="w-4 h-4 text-blue-400" />
        </div>
        <span className="text-white font-medium text-sm">{definition.label}</span>
        <span className="text-xs text-text-light/30 ml-auto font-mono">{block.type}</span>
      </div>

      <div>
        {definition.fields.map((field) => (
          <FieldRenderer
            key={field.key}
            field={field}
            value={block.props[field.key]}
            onChange={(value) => handleFieldChange(field.key, value)}
          />
        ))}
      </div>

      {definition.fields.length === 0 && (
        <p className="text-text-light/40 text-sm">
          This block has no editable fields.
        </p>
      )}
    </div>
  )
}
