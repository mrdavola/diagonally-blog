"use client"

import React, { useRef, useEffect } from "react"
import type { Section, SectionBackground, SectionLayout, BackgroundPresetId } from "@/lib/visual-editor/types"
import { ZoneRenderer } from "./zone-renderer"
import { SectionIdContext } from "@/components/visual-editor/canvas/inline-edit-context"
import { Constellation } from "@/components/constellation"

// ─── Background helpers ──────────────────────────────────────────────────────

// ─── Preset backgrounds ─────────────────────────────────────────────────────

const PRESET_STYLES: Record<BackgroundPresetId, { bg: string; textClass: string }> = {
  "space-deep": { bg: "oklch(0.086 0.022 264)", textClass: "text-white" },
  "space-mid":  { bg: "oklch(0.148 0.022 262)", textClass: "text-white" },
  "cream":      { bg: "oklch(0.977 0.007 82)",  textClass: "" },
}

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
      return { position: "relative" }
    case "preset": {
      const preset = bg.presetId && PRESET_STYLES[bg.presetId]
      if (!preset) return {}
      return { backgroundColor: preset.bg }
    }
    case "none":
    default:
      return {}
  }
}

function isPresetDark(bg: SectionBackground): boolean {
  return bg.type === "preset" && (bg.presetId === "space-deep" || bg.presetId === "space-mid")
}

// ─── Divider SVGs ───────────────────────────────────────────────────────────

/**
 * Get the resolved background color for a section (used for divider rendering).
 */
function getSectionBgColor(bg: SectionBackground): string {
  switch (bg.type) {
    case "color": return bg.color ?? "transparent"
    case "preset": {
      if (bg.presetId && PRESET_STYLES[bg.presetId]) return PRESET_STYLES[bg.presetId].bg
      return "transparent"
    }
    default: return "transparent"
  }
}

/**
 * Two-tone section divider: topColor = this section's bg, bottomColor = next section's bg.
 * Matches the frontend WaveDivider pattern.
 */
function SectionDividerSvg({ type, topColor, bottomColor }: { type: string; topColor: string; bottomColor: string }) {
  switch (type) {
    case "wave":
      return (
        <div className="relative overflow-hidden" aria-hidden="true" style={{ marginTop: -1 }}>
          <svg viewBox="0 0 1440 100" preserveAspectRatio="none" width="100%" height="80" style={{ display: "block" }}>
            {/* Top fill */}
            <rect width="1440" height="55" fill={topColor} />
            {/* Wave path — bottom color fills from the curve down */}
            <path d="M0,55 C240,100 480,10 720,55 C960,100 1200,10 1440,55 L1440,100 L0,100 Z" fill={bottomColor} />
            {/* Smooth wave on top in top color for clean edge */}
            <path d="M0,55 C240,100 480,10 720,55 C960,100 1200,10 1440,55 L1440,0 L0,0 Z" fill={topColor} />
          </svg>
        </div>
      )
    case "angle":
      return (
        <div className="relative overflow-hidden" aria-hidden="true" style={{ marginTop: -1 }}>
          <svg viewBox="0 0 1440 60" preserveAspectRatio="none" width="100%" height="60" style={{ display: "block" }}>
            <rect width="1440" height="30" fill={topColor} />
            <polygon points="0,0 1440,60 0,60" fill={bottomColor} />
            <polygon points="0,0 1440,0 1440,60" fill={topColor} />
          </svg>
        </div>
      )
    case "curve":
      return (
        <div className="relative overflow-hidden" aria-hidden="true" style={{ marginTop: -1 }}>
          <svg viewBox="0 0 1440 60" preserveAspectRatio="none" width="100%" height="60" style={{ display: "block" }}>
            <rect width="1440" height="30" fill={topColor} />
            <path d="M0,0 Q720,120 1440,0 L1440,60 L0,60 Z" fill={bottomColor} />
            <path d="M0,0 Q720,120 1440,0 L1440,0 L0,0 Z" fill={topColor} />
          </svg>
        </div>
      )
    case "line":
      return <div className="h-px" style={{ backgroundColor: bottomColor }} aria-hidden="true" />
    default:
      return null
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
  const { layout, background, spacing, animation } = section
  const sectionRef = useRef<HTMLElement | null>(null)

  // ─── Animation ────────────────────────────────────────────────────────────
  useEffect(() => {
    const el = sectionRef.current
    if (!el || !animation || animation.type === "none") return

    const animClass = `ve-animate-${animation.type}`
    el.classList.add(animClass)

    if (animation.trigger === "on-load") {
      // delay only; CSS drives the actual animation
      return
    }

    // on-scroll: pause until visible
    el.classList.add("ve-animate-paused")

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const target = entry.target as HTMLElement
            if (animation.delay > 0) {
              setTimeout(() => target.classList.add("ve-animate-active"), animation.delay)
            } else {
              target.classList.add("ve-animate-active")
            }
            observer.unobserve(target)
          }
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(el)

    return () => {
      observer.disconnect()
      el.classList.remove(animClass, "ve-animate-paused", "ve-animate-active")
    }
  }, [animation])

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

  // Inline delay for on-load animations
  const animationStyle: React.CSSProperties =
    animation && animation.type !== "none" && animation.trigger === "on-load" && animation.delay > 0
      ? { animationDelay: `${animation.delay}ms` }
      : {}

  const darkPreset = isPresetDark(background)
  const presetTextClass = background.type === "preset" && background.presetId
    ? PRESET_STYLES[background.presetId]?.textClass ?? ""
    : ""

  return (
    <SectionIdContext.Provider value={section.id}>
    <section
      ref={sectionRef}
      data-section-id={section.id}
      data-section-label={section.label}
      className={presetTextClass || undefined}
      style={{ ...sectionStyle, ...animationStyle, overflow: "hidden" }}
    >
      {/* Constellation animation for space-deep preset */}
      {background.type === "preset" && background.presetId === "space-deep" && (
        <Constellation className="absolute inset-0" />
      )}

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

    {/* Section divider */}
    {section.divider.type !== "none" && (() => {
      const sectionBg = getSectionBgColor(background)
      const topCol = sectionBg !== "transparent" ? sectionBg : (darkPreset ? "#080c18" : "#faf7f2")
      const bottomCol = section.divider.color && section.divider.color !== "transparent"
        ? section.divider.color
        : "#faf7f2"
      return <SectionDividerSvg type={section.divider.type} topColor={topCol} bottomColor={bottomCol} />
    })()}
    </SectionIdContext.Provider>
  )
}
