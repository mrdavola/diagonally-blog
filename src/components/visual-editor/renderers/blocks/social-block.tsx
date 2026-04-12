import type { EditorBlock } from "@/lib/visual-editor/types"

interface SocialLink {
  platform: string
  url: string
}

interface SocialBlockProps {
  block: EditorBlock
}

const PLATFORM_ICONS: Record<string, string> = {
  twitter: "𝕏",
  x: "𝕏",
  facebook: "f",
  instagram: "◎",
  linkedin: "in",
  youtube: "▶",
  tiktok: "♪",
  github: "</>",
  pinterest: "P",
  snapchat: "👻",
}

const PLATFORM_COLORS: Record<string, string> = {
  twitter: "#1da1f2",
  x: "#000000",
  facebook: "#1877f2",
  instagram: "#e1306c",
  linkedin: "#0a66c2",
  youtube: "#ff0000",
  tiktok: "#010101",
  github: "#333333",
  pinterest: "#e60023",
  snapchat: "#fffc00",
}

export function SocialBlock({ block }: SocialBlockProps) {
  const rawLinks = Array.isArray(block.props.links) ? block.props.links : []
  const links: SocialLink[] = rawLinks.filter(
    (l): l is SocialLink =>
      typeof l === "object" &&
      l !== null &&
      typeof (l as SocialLink).platform === "string" &&
      typeof (l as SocialLink).url === "string"
  )

  if (links.length === 0) {
    return (
      <div className="flex items-center justify-center w-full h-12 bg-gray-100 border-2 border-dashed border-gray-300 rounded text-gray-400 text-sm">
        No social links configured
      </div>
    )
  }

  return (
    <div className="flex flex-wrap gap-3 py-2">
      {links.map((link, i) => {
        const key = link.platform.toLowerCase()
        const icon = PLATFORM_ICONS[key] ?? link.platform.charAt(0).toUpperCase()
        const color = PLATFORM_COLORS[key] ?? "#6b7280"

        return (
          <a
            key={i}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            title={link.platform}
            className="flex items-center justify-center w-10 h-10 rounded-full text-white text-sm font-bold transition-opacity hover:opacity-80"
            style={{ background: color }}
          >
            {icon}
          </a>
        )
      })}
    </div>
  )
}
