"use client"

import { use } from "react"
import { VisualEditor } from "@/components/visual-editor/visual-editor"

interface PageEditorRouteProps {
  params: Promise<{ slug: string }>
}

export default function PageEditorRoute({ params }: PageEditorRouteProps) {
  const { slug } = use(params)
  return (
    <div className="-m-6 h-[calc(100vh)]">
      <VisualEditor slug={slug} />
    </div>
  )
}
