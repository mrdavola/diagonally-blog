"use client"

import type { ContentZone, EditorBlock } from "@/lib/visual-editor/types"
import { TextBlock } from "./blocks/text-block"
import { ImageBlock } from "./blocks/image-block"
import { ButtonBlock } from "./blocks/button-block"
import { SpacerBlock } from "./blocks/spacer-block"

interface BlockComponentProps {
  block: EditorBlock
}

function FallbackBlock({ block }: BlockComponentProps) {
  return (
    <div
      style={{
        border: "2px dashed #d1d5db",
        borderRadius: 4,
        padding: "1rem",
        fontSize: 13,
        color: "#6b7280",
        background: "#f9fafb",
      }}
    >
      {block.type} block
    </div>
  )
}

const BLOCK_COMPONENTS: Record<
  string,
  React.ComponentType<BlockComponentProps>
> = {
  text: TextBlock,
  image: ImageBlock,
  button: ButtonBlock,
  spacer: SpacerBlock,
}

function getBlockWrapperStyles(block: EditorBlock): React.CSSProperties {
  const { position, style } = block
  const css: React.CSSProperties = {
    gridColumn: `${position.col} / span ${position.colSpan}`,
    gridRow: `${position.row} / span ${position.rowSpan}`,
  }

  if (style.margin) {
    const m = style.margin
    css.margin = `${m.top ?? 0}px ${m.right ?? 0}px ${m.bottom ?? 0}px ${m.left ?? 0}px`
  }
  if (style.padding) {
    const p = style.padding
    css.padding = `${p.top ?? 0}px ${p.right ?? 0}px ${p.bottom ?? 0}px ${p.left ?? 0}px`
  }
  if (style.background) css.background = style.background
  if (style.borderRadius != null) css.borderRadius = style.borderRadius
  if (style.opacity != null) css.opacity = style.opacity
  if (style.shadow && style.shadow !== "none") {
    const shadows: Record<string, string> = {
      sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
      md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
      lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
    }
    css.boxShadow = shadows[style.shadow] ?? undefined
  }

  return css
}

interface ZoneRendererProps {
  zone: ContentZone
}

export function ZoneRenderer({ zone }: ZoneRendererProps) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${zone.gridColumns}, 1fr)`,
      }}
    >
      {zone.blocks.map((block) => {
        const BlockComponent =
          BLOCK_COMPONENTS[block.type] ?? FallbackBlock

        return (
          <div
            key={block.id}
            data-block-id={block.id}
            data-block-type={block.type}
            style={getBlockWrapperStyles(block)}
          >
            <BlockComponent block={block} />
          </div>
        )
      })}
    </div>
  )
}
