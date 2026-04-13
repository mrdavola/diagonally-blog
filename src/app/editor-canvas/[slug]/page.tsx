"use client"

import { use, useCallback, useEffect, useState } from "react"
import type { Section, SiteStyles } from "@/lib/visual-editor/types"
import { onParentMessage, sendToParent } from "@/lib/visual-editor/message-bridge"
import { SectionRenderer } from "@/components/visual-editor/renderers/section-renderer"
import { EditorRuntime } from "@/components/visual-editor/canvas/editor-runtime"
import { InlineEditProvider } from "@/components/visual-editor/canvas/inline-edit-context"
import { PreviewNavbar, PreviewFooter } from "@/components/visual-editor/canvas/preview-chrome"

interface CanvasPageProps {
  params: Promise<{ slug: string }>
}

/** Inject a Google Fonts <link> for the given font family */
function loadGoogleFont(family: string) {
  const id = `gf-${family.replace(/\s+/g, "-").toLowerCase()}`
  if (document.getElementById(id)) return
  const link = document.createElement("link")
  link.id = id
  link.rel = "stylesheet"
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@300;400;500;600;700;800&display=swap`
  document.head.appendChild(link)
}

/** Apply SiteStyles as CSS variables on the document root */
function applySiteStyles(styles: SiteStyles) {
  const root = document.documentElement.style

  // Fonts
  loadGoogleFont(styles.typography.headingFont)
  loadGoogleFont(styles.typography.bodyFont)
  root.setProperty("--site-heading-font", `"${styles.typography.headingFont}", sans-serif`)
  root.setProperty("--site-body-font", `"${styles.typography.bodyFont}", sans-serif`)

  // Type scale
  const s = styles.typography.scale
  root.setProperty("--site-h1", s.h1)
  root.setProperty("--site-h2", s.h2)
  root.setProperty("--site-h3", s.h3)
  root.setProperty("--site-h4", s.h4)
  root.setProperty("--site-body", s.body)
  root.setProperty("--site-small", s.small)

  // Colors
  root.setProperty("--site-primary", styles.colors.primary)
  root.setProperty("--site-secondary", styles.colors.secondary)
  root.setProperty("--site-accent", styles.colors.accent)
  root.setProperty("--site-bg", styles.colors.background)
  root.setProperty("--site-text", styles.colors.text)
  root.setProperty("--site-muted", styles.colors.muted)

  // Buttons
  root.setProperty("--site-btn-radius", `${styles.buttons.borderRadius}px`)

  // Spacing
  root.setProperty("--site-section-padding", `${styles.spacing.sectionPadding}px`)
  root.setProperty("--site-content-max-width", `${styles.spacing.contentMaxWidth}px`)
  root.setProperty("--site-grid-gap", `${styles.spacing.gridGap}px`)
}

export default function CanvasPage({ params }: CanvasPageProps) {
  const { slug } = use(params)
  const [sections, setSections] = useState<Section[]>([])
  const [selectedBlockIds, setSelectedBlockIds] = useState<string[]>([])
  const [editMode] = useState(true)

  const handleStyles = useCallback((styles: SiteStyles) => {
    applySiteStyles(styles)
  }, [])

  useEffect(() => {
    sendToParent({ type: "CANVAS_READY" })

    const unsubscribe = onParentMessage((message) => {
      if (message.type === "SYNC_STATE") {
        setSections(message.payload.sections)
      } else if (message.type === "SYNC_MULTI_SELECT") {
        setSelectedBlockIds(message.payload.selectedBlockIds)
      } else if (message.type === "SYNC_STYLES") {
        handleStyles(message.payload.styles)
      }
    })

    return unsubscribe
  }, [handleStyles])

  return (
    <InlineEditProvider>
      <div className="min-h-screen bg-cream font-body text-text-dark" data-canvas-slug={slug}>
        <PreviewNavbar />

        <main>
          {sections.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center min-h-[60vh] select-none"
              onDoubleClick={() => {
                sendToParent({
                  type: "REQUEST_INSERT",
                  payload: { position: "after", sectionId: "__empty__", insertType: "section" },
                })
              }}
            >
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="w-16 h-16 rounded-2xl bg-blue-deep/10 flex items-center justify-center">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-deep">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <line x1="12" y1="8" x2="12" y2="16" />
                    <line x1="8" y1="12" x2="16" y2="12" />
                  </svg>
                </div>
                <div>
                  <p className="text-lg font-display font-semibold text-text-dark/70" style={{ fontFamily: "var(--site-heading-font, inherit)" }}>
                    Start building your page
                  </p>
                  <p className="mt-1 text-sm text-text-dark/40">
                    Double-click or use the button below
                  </p>
                </div>
                <button
                  onClick={() => {
                    sendToParent({
                      type: "REQUEST_INSERT",
                      payload: { position: "after", sectionId: "__empty__", insertType: "section" },
                    })
                  }}
                  className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-deep text-white text-sm font-medium hover:opacity-80 transition-opacity"
                  style={{ fontFamily: "var(--site-body-font, inherit)" }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Add Your First Section
                </button>
              </div>
            </div>
          ) : (
            sections.map((section) => (
              <SectionRenderer key={section.id} section={section} />
            ))
          )}
        </main>

        <PreviewFooter />

        {editMode && <EditorRuntime sections={sections} selectedBlockIds={selectedBlockIds} />}
      </div>
    </InlineEditProvider>
  )
}
