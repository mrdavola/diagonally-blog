"use client"

import { useEffect, useRef, useState } from "react"
import { Monitor, Tablet, Smartphone } from "lucide-react"
import type { Block } from "@/lib/blocks/types"

interface PreviewPanelProps {
  blocks: Block[]
  slug: string
}

type Viewport = "desktop" | "tablet" | "mobile"

const VIEWPORT_CONFIG: Record<Viewport, { width: string; label: string; icon: typeof Monitor }> = {
  desktop: { width: "100%", label: "Desktop", icon: Monitor },
  tablet: { width: "768px", label: "Tablet", icon: Tablet },
  mobile: { width: "375px", label: "Mobile", icon: Smartphone },
}

export function PreviewPanel({ blocks, slug }: PreviewPanelProps) {
  const [viewport, setViewport] = useState<Viewport>("desktop")
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // Debounce block updates to iframe
  useEffect(() => {
    const timer = setTimeout(() => {
      iframeRef.current?.contentWindow?.postMessage(
        { type: "BLOCKS_UPDATE", blocks },
        "*"
      )
    }, 300)
    return () => clearTimeout(timer)
  }, [blocks])

  const config = VIEWPORT_CONFIG[viewport]

  return (
    <div className="flex flex-col h-full">
      {/* Viewport toggles */}
      <div className="flex items-center gap-1 p-3 border-b border-white/10 bg-space-deep/30">
        <span className="text-xs text-text-light/40 mr-2">Preview</span>
        {(Object.keys(VIEWPORT_CONFIG) as Viewport[]).map((vp) => {
          const { label, icon: Icon } = VIEWPORT_CONFIG[vp]
          return (
            <button
              key={vp}
              onClick={() => setViewport(vp)}
              title={label}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition ${
                viewport === vp
                  ? "bg-white/10 text-white"
                  : "text-text-light/40 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          )
        })}
      </div>

      {/* iframe container */}
      <div className="flex-1 overflow-auto bg-space-deep/20 flex items-start justify-center py-4">
        <div
          className="h-full transition-all duration-300 overflow-hidden rounded-lg border border-white/10 shadow-xl"
          style={{ width: config.width, minWidth: viewport !== "desktop" ? config.width : undefined }}
        >
          <iframe
            ref={iframeRef}
            src={`/preview?page=${slug}`}
            className="w-full h-full bg-white"
            style={{ minHeight: "600px" }}
            title={`Preview of ${slug}`}
          />
        </div>
      </div>
    </div>
  )
}
