"use client"

import type { EditorBlock } from "@/lib/visual-editor/types"

interface ButtonBlockProps {
  block: EditorBlock
}

const variantClasses: Record<string, string> = {
  filled:
    "bg-blue-deep text-white border border-blue-deep hover:opacity-80",
  outline:
    "bg-transparent text-blue-deep border-2 border-blue-deep hover:bg-blue-deep/10",
  ghost:
    "bg-transparent text-blue-deep border border-transparent hover:bg-blue-deep/10",
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

  const href =
    typeof block.props.href === "string" && block.props.href
      ? block.props.href
      : "#"

  return (
    <div className={alignClasses[align]}>
      <a
        href={href}
        onClick={(e) => e.preventDefault()}
        className={[
          "inline-block px-5 py-2.5 font-medium text-sm cursor-pointer transition-colors",
          variantClasses[variant],
        ].join(" ")}
        style={{
          fontFamily: "var(--site-body-font, inherit)",
          borderRadius: "var(--site-btn-radius, 12px)",
        }}
      >
        {label}
      </a>
    </div>
  )
}
