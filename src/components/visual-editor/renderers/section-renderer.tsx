"use client"

import React from "react"
import type { Section, SectionBackground, SectionLayout } from "@/lib/visual-editor/types"
import { ZoneRenderer } from "./zone-renderer"
import { SectionIdContext } from "@/components/visual-editor/canvas/inline-edit-context"

// ─── Background helpers ──────────────────────────────────────────────────────

function getBackgroundStyles(bg: SectionBackground): React.CSSProperties {
  switch (bg.type) {
    case "color":
      return { backgroundColor: bg.color ?? "transparent" }
    case "gradient": {
      const g = bg.gradient
      if (!g) return {}
      return {
        background: `linear-gradient(${g.angle}deg, ${g.from}, ${g.to})`,
      }
    }
    case "image": {
      const img = bg.image
      if (!img) return {}
      return {
        backgroundImage: `url(${img.url})`,
        backgroundSize: "cover",
        backgroundPosition: `${img.focalPoint.x * 100}% ${img.focalPoint.y * 100}%`,
        backgroundRepeat: "no-repeat",
      }
    }
    case "video":
      // Video background is handled by the video element; container is transparent
      return { position: "relative" }
    case "none":
    default:
      return {}
  }
}

// ─── Column ratio helpers ────────────────────────────────────────────────────

/**
 * Convert a columnRatio string into a CSS grid-template-columns value.
 *
 * Examples:
 *   "equal"  + columns=3  →  "1fr 1fr 1fr"
 *   "1:2"                 →  "1fr 2fr"
 *   "2:1"                 →  "2fr 1fr"
 *   "1:1:2"               →  "1fr 1fr 2fr"
 */
function getColumnStyles(layout: SectionLayout): React.CSSProperties {
  if (layout.columns <= 1) return {}

  let templateColumns: string

  if (layout.columnRatio === "equal") {
    templateColumns = Array(layout.columns).fill("1fr").join(" ")
  } else {
    const parts = layout.columnRatio.split(":").map((p) => `${p.trim()}fr`)
    templateColumns = parts.join(" ")
  }

  const verticalAlignMap: Record<string, string> = {
    top: "start",
    center: "center",
    bottom: "end",
  }

  return {
    display: "grid",
    gridTemplateColumns: templateColumns,
    gap: layout.gap,
    alignItems: verticalAlignMap[layout.verticalAlign] ?? "start",
  }
}

// ─── Section Renderer ────────────────────────────────────────────────────────

interface SectionRendererProps {
  section: Section
}

export function SectionRenderer({ section }: SectionRendererProps) {
  const { layout, background, spacing } = section

  const bgStyles = getBackgroundStyles(background)
  const hasOverlay =
    (background.type === "image" || background.type === "video") &&
    background.overlay != null &&
    background.overlay.opacity > 0

  const sectionStyle: React.CSSProperties = {
    ...bgStyles,
    position: "relative",
    paddingTop: spacing.paddingTop,
    paddingBottom: spacing.paddingBottom,
    marginTop: spacing.marginTop,
    marginBottom: spacing.marginBottom,
  }

  const columnStyles = getColumnStyles(layout)

  const contentStyle: React.CSSProperties =
    layout.columns > 1 ? columnStyles : {}

  const innerContent = (
    <div style={contentStyle}>
      {section.contentZones.map((zone) => (
        <ZoneRenderer key={zone.id} zone={zone} />
      ))}
    </div>
  )

  return (
    <SectionIdContext.Provider value={section.id}>
    <section
      data-section-id={section.id}
      data-section-label={section.label}
      style={sectionStyle}
    >
      {/* Background video */}
      {background.type === "video" && background.video && (
        <video
          src={background.video.url}
          poster={background.video.posterUrl}
          autoPlay
          muted
          loop
          playsInline
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            zIndex: 0,
          }}
        />
      )}

      {/* Overlay */}
      {hasOverlay && background.overlay && (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: background.overlay.color,
            opacity: background.overlay.opacity,
            zIndex: 1,
          }}
        />
      )}

      {/* Content */}
      <div style={{ position: "relative", zIndex: 2 }}>
        {layout.contentWidth === "contained" ? (
          <div
            style={{
              maxWidth: layout.maxWidth,
              marginLeft: "auto",
              marginRight: "auto",
              paddingLeft: 24,
              paddingRight: 24,
            }}
          >
            {innerContent}
          </div>
        ) : (
          innerContent
        )}
      </div>
    </section>
    </SectionIdContext.Provider>
  )
}
