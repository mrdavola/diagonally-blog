"use client"

import { use } from "react"
import { VisualEditor } from "@/components/visual-editor/visual-editor"

interface PageEditorRouteProps {
  params: Promise<{ slug: string }>
}

export default function PageEditorRoute({ params }: PageEditorRouteProps) {
  const { slug } = use(params)
  return (
    <div className="fixed inset-0 z-50 bg-white">
      <VisualEditor slug={slug} />
    </div>
  )
}
