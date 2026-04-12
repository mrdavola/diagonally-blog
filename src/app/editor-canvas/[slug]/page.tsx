"use client"

import { use, useEffect, useState } from "react"
import type { Section } from "@/lib/visual-editor/types"
import { onParentMessage, sendToParent } from "@/lib/visual-editor/message-bridge"
import { SectionRenderer } from "@/components/visual-editor/renderers/section-renderer"
import { EditorRuntime } from "@/components/visual-editor/canvas/editor-runtime"

interface CanvasPageProps {
  params: Promise<{ slug: string }>
}

export default function CanvasPage({ params }: CanvasPageProps) {
  const { slug } = use(params)
  const [sections, setSections] = useState<Section[]>([])
  const [editMode] = useState(true)

  useEffect(() => {
    // Announce readiness to the parent frame
    sendToParent({ type: "CANVAS_READY" })

    // Listen for messages from parent
    const unsubscribe = onParentMessage((message) => {
      if (message.type === "SYNC_STATE") {
        setSections(message.payload.sections)
      }
    })

    return unsubscribe
  }, [])

  return (
    <div className="min-h-screen bg-white" data-canvas-slug={slug}>
      {sections.length === 0 ? (
        <div className="flex items-center justify-center min-h-screen text-gray-400 text-sm select-none">
          <p>No sections yet — use the panel to add one.</p>
        </div>
      ) : (
        sections.map((section) => (
          <SectionRenderer key={section.id} section={section} />
        ))
      )}

      {editMode && <EditorRuntime sections={sections} />}
    </div>
  )
}
