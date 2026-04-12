"use client"

import type { EditorBlock } from "@/lib/visual-editor/types"

interface ButtonBlockProps {
  block: EditorBlock
}

const variantClasses: Record<string, string> = {
  filled:
    "bg-blue-600 text-white border border-blue-600 hover:bg-blue-700 hover:border-blue-700",
  outline:
    "bg-transparent text-blue-600 border border-blue-600 hover:bg-blue-50",
  ghost:
    "bg-transparent text-blue-600 border border-transparent hover:bg-blue-50",
}

const alignClasses: Record<string, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
}

export function ButtonBlock({ block }: ButtonBlockProps) {
  const label =
    typeof block.props.label === "string" ? block.props.label : "Button"
  const variant =
    typeof block.props.variant === "string" &&
    block.props.variant in variantClasses
      ? block.props.variant
      : "filled"
  const align =
    typeof block.props.align === "string" && block.props.align in alignClasses
      ? block.props.align
      : "left"

  return (
    <div className={alignClasses[align]}>
      <span
        className={[
          "inline-block px-5 py-2.5 rounded font-medium text-sm cursor-pointer transition-colors",
          variantClasses[variant],
        ].join(" ")}
      >
        {label}
      </span>
    </div>
  )
}
